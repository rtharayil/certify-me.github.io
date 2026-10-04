#!/usr/bin/env python3
"""Source-HTML crawl graph and read-only production/preview HTTP checks."""
import concurrent.futures
import collections
import json
import os
import re
import subprocess
import sys
import tempfile
import xml.etree.ElementTree as ET
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urljoin, urlparse, unquote

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT / ".local/reports/performance-closure"
SITE=ROOT / "_site"
class Page(HTMLParser):
    def __init__(self):
        super().__init__();self.links=[];self.canonical=None;self.noindex=False;self.pagination=[]
    def handle_starttag(self,tag,attrs):
        a=dict(attrs)
        if tag=="a" and a.get("href"):self.links.append(a["href"])
        if tag=="link" and "canonical" in a.get("rel","").split():self.canonical=a.get("href")
        if tag=="meta" and a.get("name","").lower()=="robots" and "noindex" in a.get("content","").lower():self.noindex=True
        if tag in ["a","link"] and any(x in a.get("rel","").split() for x in ["next","prev"]):self.pagination.append(a.get("href"))

pages={};paths={}
for f in SITE.rglob("*.html"):
    p=Page();p.feed(f.read_text(errors="replace"))
    if not p.canonical or p.noindex:continue
    path=urlparse(p.canonical).path or "/"
    pages[path]=p
    relative="/"+str(f.relative_to(SITE))
    paths[relative]=path
    if relative.endswith("/index.html"):paths[relative[:-10]]=path
    if relative.endswith(".html"):paths[relative[:-5]]=path
    paths[path]=path
def file_for(path):
    f=SITE / unquote(path).lstrip("/")
    for candidate in [f,f / "index.html",Path(str(f)+".html")]:
        if candidate.is_file():return candidate
    return None
edges={};broken=[]
for path,page in pages.items():
    targets=set()
    for href in page.links:
        absolute=urljoin(page.canonical,href);u=urlparse(absolute)
        if u.scheme not in ["http","https"] or u.hostname not in ["www.certifyme.online","certifyme.online"]:continue
        target=unquote(u.path) or "/"
        if target in paths:targets.add(paths[target])
        elif file_for(target) is None:broken.append({"from":path,"to":target})
    edges[path]=targets
depth={"/":0};queue=collections.deque(["/"])
while queue:
    current=queue.popleft()
    for target in edges.get(current,[]):
        if target not in depth:depth[target]=depth[current]+1;queue.append(target)
inlinks=collections.Counter(t for source,targets in edges.items() for t in targets if t!=source)
sitemap=ET.parse(SITE / "sitemap.xml").getroot()
urls=[e.text for e in sitemap.iter() if e.tag.endswith("}loc")]
sitemap_paths=[urlparse(u).path or "/" for u in urls]
missing_sitemap=[p for p in sitemap_paths if file_for(p) is None]
orphans=[p for p in sitemap_paths if p!="/" and not inlinks[p]]
unreachable=[p for p in sitemap_paths if p not in depth]
graph={"scope":"Emitted source HTML, indexable canonical pages; includes navigation/footer. Dynamic links and off-site inbound links are not represented.",
       "indexable_pages":len(pages),"sitemap_urls":len(urls),"missing_sitemap_outputs":missing_sitemap,
       "broken_internal_links":sorted({(b["from"],b["to"]) for b in broken}),
       "orphan_sitemap_pages":orphans,"unreachable_sitemap_pages":unreachable,
       "depth":depth,"depth_distribution":dict(collections.Counter(depth.values())),
       "pagination_rel_links":{p:v.pagination for p,v in pages.items() if v.pagination}}
(OUT / "crawl-graph.json").write_text(json.dumps(graph,indent=2))
if "--graph-only" in sys.argv:
    print(json.dumps({"broken_link_pairs":len(graph["broken_internal_links"]),"orphans":len(orphans),"depth_distribution":graph["depth_distribution"]}))
    sys.exit(0)

SAFE={"content-type","content-encoding","cache-control","vary","etag","last-modified","age","server","location","x-cache","strict-transport-security"}
def probe(item):
    environment,url,method=item
    with tempfile.TemporaryDirectory(prefix="seo-http-") as temp:
        headers=Path(temp)/"headers";body=Path(temp)/"body"
        args=["curl","-sS","--max-time","20","--max-redirs","6","-L","--compressed","-D",str(headers),"-o",str(body),"-w","%{json}"]
        if method=="HEAD":args+=["-I"]
        result=subprocess.run(args+[url],capture_output=True,text=True)
        try:meta=json.loads(result.stdout)
        except json.JSONDecodeError:meta={}
        hops=[]
        for block in re.split(r"\r?\n\r?\n",headers.read_text(errors="replace") if headers.exists() else ""):
            lines=block.splitlines()
            if not lines or not lines[0].startswith("HTTP/"):continue
            values={}
            for line in lines[1:]:
                if ":" in line:
                    key,value=line.split(":",1)
                    if key.lower() in SAFE:values[key.lower()]=value.strip()
            hops.append({"status":lines[0],"headers":values})
        r={"environment":environment,"url":url,"method":method,"status":meta.get("http_code"),
           "final_url":meta.get("url_effective"),"redirect_count":meta.get("num_redirects"),
           "content_type":meta.get("content_type"),"hops":hops,"error":result.stderr.strip() or None}
        if method=="GET" and body.exists():
            data=body.read_text(errors="replace")
            if "html" in (meta.get("content_type") or ""):
                parser=Page();parser.feed(data);r["canonical"]=parser.canonical;r["noindex"]=parser.noindex
            elif url.endswith("/robots.txt"):r["robots"]=data[:8000]
            elif url.endswith("/sitemap.xml"):
                try:r["sitemap_url_count"]=sum(e.tag.endswith("}loc") for e in ET.fromstring(data).iter())
                except ET.ParseError:r["xml_parse_error"]=True
        return r

production="https://certify-megithubio.replit.app"
canonical="https://www.certifyme.online"
preview="https://"+os.environ["REPLIT_DEV_DOMAIN"]
representative=["/","/platform-overview","/credentials-higher-education","/skills-taxonomy-mapping",
    "/comprehensive-learner-record","/workforce-intelligence","/security/","/compare/",
    "/blog/certifyme-vs-accredible-2026-comparison.html","/blog/what-is-an-academic-transcript.html","/blog/association-case.html"]
probes=[]
for origin,label in [(production,"PRODUCTION LIVE BASELINE — new changes NOT VERIFIED"),(canonical,"CANONICAL PRODUCTION LIVE BASELINE — new changes NOT VERIFIED")]:
    probes += [(label,origin+p,"GET") for p in representative+["/robots.txt","/sitemap.xml","/phase5-intentional-missing-page","/platform-overview.html","/platform-overview/","/security","/security.html"]]
    probes += [(label,origin+p,"HEAD") for p in ["/assets4/css/blue-theme.css","/assets4/js/jquery-3.7.0.min.js","/assets/images/showcase-directory1.svg"]]
probes += [("PRODUCTION LIVE BASELINE — new changes NOT VERIFIED",u,"HEAD") for u in [
    "http://certify-megithubio.replit.app/","http://www.certifyme.online/","http://certifyme.online/","https://certifyme.online/"]]
probes += [("LOCAL/REPLIT VERIFIED",preview+p,"HEAD") for p in representative+["/phase5-intentional-missing-page"]]
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:results=list(pool.map(probe,probes))
(OUT / "http-closure.json").write_text(json.dumps(results,indent=2))
print(json.dumps({"indexable_pages":len(pages),"sitemap_urls":len(urls),"missing_sitemap_outputs":len(missing_sitemap),
    "broken_link_pairs":len(graph["broken_internal_links"]),"orphans":len(orphans),"unreachable":len(unreachable),
    "http_probes":len(results),"transport_errors":sum(bool(r["error"]) for r in results),
    "depth_distribution":graph["depth_distribution"]},indent=2))