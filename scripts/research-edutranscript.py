#!/usr/bin/env python3
"""Inventory the owner's public EduTranscript pages and first-party media."""
import concurrent.futures
import json
import re
import urllib.error
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from pathlib import Path
from html.parser import HTMLParser

BASE = "https://www.edutranscript.com/"
OUT = Path(".local/reports/transcript-solution")
OUT.mkdir(parents=True, exist_ok=True)

def fetch(url):
    request = urllib.request.Request(url, headers={"User-Agent": "CertifyMe asset research"})
    try:
        with urllib.request.urlopen(request, timeout=25) as response:
            return response.status, response.geturl(), response.read().decode("utf-8", errors="replace")
    except urllib.error.HTTPError as error:
        return error.code, url, error.read().decode("utf-8", errors="replace")
    except Exception as error:
        return 0, url, str(error)

class PageParser(HTMLParser):
    def __init__(self, base):
        super().__init__()
        self.base = base
        self.media, self.videos, self.styles, self.links, self.text, self.headings = [], [], [], [], [], []
        self.title, self.heading, self.hidden = [], None, 0
        self.in_title = False

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        absolute = lambda value: urllib.parse.urljoin(self.base, value)
        if tag == "img":
            src = attrs.get("src") or attrs.get("data-src", "")
            if src and not src.startswith("data:"):
                self.media.append({"url": absolute(src), "alt": attrs.get("alt", ""),
                                   "width": attrs.get("width"), "height": attrs.get("height"),
                                   "srcset": attrs.get("srcset", "")})
        if tag in ("iframe", "video", "source") and attrs.get("src"):
            self.videos.append(absolute(attrs["src"]))
        if tag == "link" and "stylesheet" in attrs.get("rel", ""):
            self.styles.append(absolute(attrs.get("href", "")))
        if tag == "a" and attrs.get("href"):
            href = absolute(attrs["href"]).split("#")[0]
            if urllib.parse.urlparse(href).netloc in ("skillstory.org", "www.skillstory.org"):
                self.links.append(href)
            if re.search(r"youtu|vimeo|\.mp4", href):
                self.videos.append(href)
        if tag in ("script", "style", "nav", "header", "footer"):
            self.hidden += 1
        if tag == "title":
            self.in_title = True
        if tag in ("h1", "h2", "h3"):
            self.heading = []

    def handle_endtag(self, tag):
        if tag in ("script", "style", "nav", "header", "footer"):
            self.hidden = max(0, self.hidden - 1)
        if tag == "title":
            self.in_title = False
        if tag in ("h1", "h2", "h3") and self.heading is not None:
            self.headings.append(" ".join(self.heading))
            self.heading = None

    def handle_data(self, data):
        data = data.strip()
        if self.in_title:
            self.title.append(data)
        if not self.hidden and data:
            self.text.append(data)
            if self.heading is not None:
                self.heading.append(data)

def inspect(url):
    status, final_url, html = fetch(url)
    page = PageParser(final_url)
    page.feed(html)
    return {"requestedUrl": url, "url": final_url, "status": status,
            "title": " ".join(page.title), "headings": page.headings,
            "text": " ".join(page.text), "images": page.media, "videos": page.videos,
            "stylesheets": page.styles, "links": sorted(set(page.links))}

status, _, xml = fetch(BASE + "sitemap.xml")
urls = {BASE, *[BASE + path for path in ["universities.html", "alumni.html", "fraud-prevention.html", "security-and-compliance.html", "about-us", "w3c-credentialing-partner-for-higher-education.html", "open-badge-credentialing-partner-for-higher-education.html", "edutranscript-FAQ.html"]]}
if status == 200:
    urls.update(urllib.parse.urljoin(BASE, urllib.parse.urlparse(node.text).path).split("#")[0] for node in ET.fromstring(xml).iter()
                if node.tag.endswith("}loc") and not re.search(r"\.(?:pdf|png|webp)$", node.text))
pages = []
with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
    pages.extend(pool.map(inspect, sorted(urls)))
    additional = {link for p in pages for link in p["links"]
                  if link.startswith(BASE) and link not in urls and
                  not re.search(r"\.(?:png|jpe?g|webp|pdf|svg|mp4|css|js)$", link)}
    # Navigation-only routes can contain assets missing from the sitemap.
    pages.extend(pool.map(inspect, sorted(additional)[:100]))
    stylesheets = sorted({style for p in pages for style in p["stylesheets"] if style.startswith(BASE)})
    css = {url: fetch(url)[2] for url in stylesheets}
assets = {}
for page in pages:
    for image in page["images"]:
        entry = assets.setdefault(image["url"], {**image, "sourcePages": []})
        entry["sourcePages"].append(page["requestedUrl"])
for url, text in css.items():
    for resource in re.findall(r"url\(['\"]?([^)'\"\s]+)", text):
        if not resource.startswith("data:"):
            absolute = urllib.parse.urljoin(url, resource)
            if re.search(r"\.(?:png|jpe?g|webp|svg|gif)(?:\?|$)", absolute):
                assets.setdefault(absolute, {"url": absolute, "alt": "CSS background", "sourcePages": [url]})
(OUT / "source-pages.json").write_text(json.dumps(pages, ensure_ascii=False, indent=2))
(OUT / "asset-inventory.json").write_text(json.dumps(list(assets.values()), ensure_ascii=False, indent=2))
(OUT / "stylesheet-resources.json").write_text(json.dumps(css, ensure_ascii=False, indent=2))
print(f"Inspected {len(pages)} pages; {len(assets)} distinct image assets; {len(stylesheets)} stylesheets.")
for page in pages:
    print(f'{page["status"]} {page["requestedUrl"]}: {page["title"]}')
print("VIDEO SOURCES", sorted({video for page in pages for video in page["videos"]}))
