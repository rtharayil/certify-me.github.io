#!/usr/bin/env python3
"""Audit emitted Jekyll HTML and generate the requested SEO deliverables."""
import argparse
import csv
import html
import json
import re
from collections import Counter, defaultdict
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urljoin, urlparse
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
BASE = "https://www.certifyme.online"
GUIDE = "/blog/why-institutions-should-embrace-open-badges-3-0-standards"
CORE = ["/", "/credentials-higher-education", "/platform-overview",
        "/certificate-verification", "/skills-taxonomy-mapping",
        "/comprehensive-learner-record", "/workforce-intelligence", GUIDE,
        "/compare/"] + [f"/blog/certifyme-vs-{v}-2026-comparison.html"
                       for v in ("parchment", "credly", "accredible", "sertifier")]
KEYWORDS = [
    ("digital credentials for universities", "/credentials-higher-education", "Institutional solution", "Higher education pillar"),
    ("digital credential platform", "/", "Commercial platform evaluation", "Homepage"),
    ("digital credentials higher education", "/credentials-higher-education", "Institutional solution", "Higher education pillar"),
    ("digital credential management", "/platform-overview", "Commercial platform evaluation", "Infrastructure pillar"),
    ("digital diploma", "/credentials-higher-education", "Institutional qualification issuance", "Higher education pillar"),
    ("digital certificate", "/digital-certificate.html", "Commercial certificate issuance", "Existing product page"),
    ("digital badges", "/digital-badges.html", "Commercial badge issuance", "Existing product page"),
    ("Open Badges 3.0", GUIDE, "Standards and implementation", "Existing standards guide"),
    ("Open Badges 3.0 for universities", GUIDE, "Institutional standards evaluation", "Existing standards guide"),
    ("Open Badges 3.0 certification", GUIDE, "Certification scope and evidence", "Existing standards guide"),
    ("W3C Verifiable Credentials", "/certificate-verification", "Verification and implementation", "Verification pillar"),
    ("digital credential verification", "/certificate-verification", "Institutional trust evaluation", "Verification pillar"),
    ("university credential verification", "/certificate-verification", "Institutional trust evaluation", "Verification pillar"),
    ("skills taxonomy mapping", "/skills-taxonomy-mapping", "Institutional solution", "Skills pillar"),
    ("skills mapping for universities", "/skills-taxonomy-mapping", "Institutional solution", "Skills pillar"),
    ("curriculum skills mapping", "/skills-taxonomy-mapping", "Curriculum assessment", "Skills pillar"),
    ("comprehensive learner record", "/comprehensive-learner-record", "Institutional record infrastructure", "CLR pillar"),
    ("CLR 2.0", "/comprehensive-learner-record", "Standards and implementation", "CLR pillar"),
    ("digital learner record", "/comprehensive-learner-record", "Institutional record infrastructure", "CLR pillar"),
    ("workforce intelligence for universities", "/workforce-intelligence", "Institutional solution", "Workforce pillar"),
    ("university labor market intelligence", "/workforce-intelligence", "Curriculum and workforce alignment", "Workforce pillar"),
    ("skills intelligence higher education", "/workforce-intelligence", "Institutional solution", "Workforce pillar"),
    ("digital credentials comparison", "/compare/", "Commercial comparison", "Comparison hub"),
] + [(f"CertifyMe vs {name}", f"/blog/certifyme-vs-{name.lower()}-2026-comparison.html",
      "Vendor evaluation", "Existing comparison article")
     for name in ("Parchment", "Credly", "Accredible", "Sertifier")]


def normalize(text):
    text = html.unescape(text).translate(str.maketrans({"’": "'", "‘": "'", "“": '"', "”": '"'}))
    return " ".join(text.split())


class Page(HTMLParser):
    def __init__(self, file):
        super().__init__(convert_charrefs=True)
        self.file = file
        self.meta, self.links, self.images, self.ids = {}, [], [], set()
        self.canonicals, self.headings, self.ld, self.errors = [], [], [], []
        self.text, self.title, self.capture, self.buffer = [], "", None, []
        self.main, self.mains, self.skip, self.script_type, self.script = 0, 0, 0, "", []
        self.feed(file.read_text(errors="replace"))

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if a.get("id"):
            self.ids.add(a["id"])
        if tag == "main":
            self.main += 1
            self.mains += 1
        if tag == "meta":
            self.meta[a.get("name", a.get("property", ""))] = a.get("content", "")
        if tag == "link" and a.get("rel") == "canonical":
            self.canonicals.append(a.get("href", ""))
        if tag == "a" and self.main:
            self.links.append(a.get("href", ""))
        if tag == "img" and self.main:
            self.images.append(a)
        if tag == "title" or re.fullmatch("h[1-6]", tag):
            self.capture, self.buffer = tag, []
        if tag in ("script", "style", "template"):
            self.skip += 1
        if tag == "script":
            self.script_type, self.script = a.get("type", ""), []

    def handle_endtag(self, tag):
        if tag == self.capture:
            value = normalize("".join(self.buffer))
            if tag == "title":
                self.title = value
            else:
                self.headings.append((int(tag[1]), value))
            self.capture, self.buffer = None, []
        if tag == "script" and self.script_type == "application/ld+json":
            try:
                self.ld.append(json.loads("".join(self.script)))
            except json.JSONDecodeError as exc:
                self.errors.append(str(exc))
        if tag in ("script", "style", "template"):
            self.skip = max(0, self.skip - 1)
        if tag == "main":
            self.main = max(0, self.main - 1)

    def handle_data(self, data):
        if self.script_type == "application/ld+json" and self.skip:
            self.script.append(data)
        if not self.skip:
            self.text.append(data)
            if self.capture:
                self.buffer.append(data)


def nodes(value):
    if isinstance(value, dict):
        yield value
        for item in value.values():
            yield from nodes(item)
    elif isinstance(value, list):
        for item in value:
            yield from nodes(item)


def write_csv(path, headers, rows):
    with path.open("w", newline="") as file:
        writer = csv.writer(file)
        writer.writerow(headers)
        writer.writerows(rows)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--site", default="_site")
    parser.add_argument("--out", default=".local/reports/institutional-seo")
    args = parser.parse_args()
    site, out = Path(args.site), Path(args.out)
    out.mkdir(parents=True, exist_ok=True)
    def resolve(url):
        path = site / unquote(urlparse(url).path).lstrip("/")
        return next((f for f in (path, Path(str(path) + ".html"), path / "index.html")
                     if f.is_file()), None)

    sitemap = [item.text for item in ET.parse(site / "sitemap.xml").findall(
        ".//{http://www.sitemaps.org/schemas/sitemap/0.9}loc")]
    files = {file for file in site.rglob("*.html")
             if "assets" not in file.parts and "EPTemplates" not in file.parts}
    files.update(file for url in sitemap if (file := resolve(url)))
    pages = [Page(file) for file in sorted(files)]
    by_url = {}
    for p in pages:
        if len(p.canonicals) == 1:
            key = p.canonicals[0]
            if key not in by_url or "noindex" not in p.meta.get("robots", ""):
                by_url[key] = p
    failures = []
    for url in sitemap:
        p = by_url.get(url)
        if not resolve(url) or not p or "noindex" in p.meta.get("robots", ""):
            failures.append(f"Sitemap entry is not an emitted canonical indexable page: {url}")
    if len(set(sitemap)) != len(sitemap):
        failures.append("Duplicate sitemap URLs")
    for _, route, _, _ in KEYWORDS:
        if not resolve(BASE + route):
            failures.append(f"Keyword authority URL has no emitted page: {route}")
    rows, broken = [], []
    for route in CORE:
        p = by_url.get(BASE + route)
        if not p:
            failures.append(f"Missing strategic canonical: {route}")
            continue
        required = ("description", "robots", "og:title", "og:description", "og:image",
                    "twitter:card", "twitter:title", "twitter:description", "twitter:image")
        absent = [key for key in required if not p.meta.get(key)]
        h1s = [text for level, text in p.headings if level == 1]
        if len(h1s) != 1 or absent or p.errors or p.mains != 1:
            failures.append(f"{route}: H1={len(h1s)}, main={p.mains}, missing={absent}, JSON={p.errors}")
        body = normalize(" ".join(p.text))
        for node in nodes(p.ld):
            if node.get("@type") == "Question":
                answer = normalize(node.get("acceptedAnswer", {}).get("text", ""))
                if normalize(node.get("name", "")) not in body or answer not in body:
                    failures.append(f"FAQ markup differs from page content: {route}")
        for href in p.links:
            url = urljoin(BASE + route, href)
            if urlparse(url).netloc == urlparse(BASE).netloc and not resolve(url):
                broken.append((route, href))
        missing_dimensions = sum(not im.get("width") or not im.get("height") for im in p.images)
        rows.append({"url": route, "title": p.title, "description": p.meta.get("description"),
                     "h1": h1s, "h2": [t for n, t in p.headings if n == 2],
                     "schema_types": sorted({str(n["@type"]) for n in nodes(p.ld) if "@type" in n}),
                     "images_without_dimensions": missing_dimensions})
    graph = {
        "/credentials-higher-education": ["/platform-overview", GUIDE, "/certificate-verification",
                                        "/skills-taxonomy-mapping", "/comprehensive-learner-record", "/workforce-intelligence"],
        "/skills-taxonomy-mapping": ["/credentials-higher-education", "/comprehensive-learner-record", "/workforce-intelligence"],
        "/comprehensive-learner-record": ["/credentials-higher-education", "/skills-taxonomy-mapping", "/platform-overview", "/skills-passport"],
        "/workforce-intelligence": ["/credentials-higher-education", "/skills-taxonomy-mapping", "/comprehensive-learner-record"],
    }
    for route, targets in graph.items():
        p = by_url.get(BASE + route)
        for target in targets:
            if not p or target not in p.links or not resolve(BASE + target):
                failures.append(f"Missing required internal edge: {route} -> {target}")
    indexable = [p for p in pages if p.canonicals and "noindex" not in p.meta.get("robots", "")]
    title_groups, description_groups = defaultdict(list), defaultdict(list)
    for p in indexable:
        title_groups[p.title].append(p.canonicals[0])
        description_groups[p.meta.get("description", "")].append(p.canonicals[0])
    duplicates = {"titles": {k: v for k, v in title_groups.items() if k and len(v) > 1},
                  "descriptions": {k: v for k, v in description_groups.items() if k and len(v) > 1}}
    blog_rows = []
    for p in indexable:
        if "/blog/" not in p.canonicals[0]:
            continue
        title = p.title.lower()
        if re.search(r"free printable|download.*template|certificate.*birthday|"
                     r"certificate.*(wedding|funny)|personal.*resume", title):
            bucket = "C — Deprioritization candidate; evidence required"
            reason = "Consumer/template-led intent; review institutional relevance, traffic and backlinks."
        elif re.search(r"what (?:is|are) (?:a )?digital (?:credential|badge|certificate)|"
                     r"benefits of digital (?:badge|certificate)|digital (?:badge|certificate).*benefits", title):
            bucket = "B — Consolidation candidate; evidence required"
            reason = "Broad overlapping intent; compare with assigned commercial authority before any merge."
        elif re.search(r"universit|higher education|credential|badge|certificate|verifi|skill|"
                       r"microcredential|transcript|diploma|workforce|learner record|open badges", title):
            bucket = "A — Strategic / retain and strengthen"
            reason = "Relevant institutional topic; retain URL and distinguish intent."
        else:
            bucket = "C — Deprioritization candidate; evidence required"
            reason = "Weak title-level alignment with institutional positioning; inspect traffic and backlinks."
        blog_rows.append((p.canonicals[0], p.title, bucket, reason))
    write_csv(out / "keyword-to-url-map.csv", ["Keyword cluster", "Target URL", "Search intent", "Page type"],
              [(k, BASE + u, intent, kind) for k, u, intent, kind in KEYWORDS])
    write_csv(out / "blog-content-inventory.csv", ["Canonical URL", "Title", "Classification", "Rationale"], blog_rows)
    write_csv(out / "strategic-broken-links.csv", ["Source page", "Unresolved link"], sorted(set(broken)))
    write_csv(out / "customer-evidence-register.csv",
              ["Institution", "Existing case-study URL", "Relationship evidence",
               "Customer approval", "Approved quote", "Credential-volume evidence",
               "Outcome evidence", "Integration evidence", "Publication status"], [])
    results = {"strategic_pages": rows, "sitemap_urls": len(sitemap), "failures": failures,
               "remaining_duplicate_metadata": duplicates, "remaining_strategic_broken_links": sorted(set(broken)),
               "blog_classification": dict(Counter(r[2] for r in blog_rows))}
    (out / "audit-results.json").write_text(json.dumps(results, indent=2))
    sections = [
        ("1. Pages modified", "Homepage, higher education, platform overview, skills mapping, CLR, workforce intelligence, verification, existing Open Badges guide, and four existing vendor comparisons. Shared metadata and comparison templates also affect their existing consumers."),
        ("2. URLs created", "/compare/ is the only new public content URL. Responsive image assets are new supporting files."),
        ("3. URLs consolidated", "None. Authority destinations are assigned in the keyword map. Article mergers require organic traffic, ranking, indexing and backlink evidence."),
        ("4. Redirects created", "None. Existing canonical paths, including comparison articles ending in .html, are retained. The higher-education canonical remains /credentials-higher-education."),
        ("5. Metadata changes", "University-focused homepage and higher-education titles/descriptions; neutral, shorter comparison titles; standards and verification metadata. Shared headers escape attributes and resolve absolute social-image URLs, including external images."),
        ("6. H1/H2 changes", "One intent-focused H1 on each audited page. Higher education now names university needs, credential types, standards, skills/records, institutional roles and integration planning. Source Sans 3, Manrope, brand colours, animations and the six-layer model remain unchanged."),
        ("7. Internal-link changes", "All requested higher-education / skills / CLR / workforce edges are checked in the emitted HTML. Related infrastructure navigation, Skill Passport links, a comparison hub and comparison-to-higher-education context use descriptive anchors."),
        ("8. Schema implemented", "Existing Organization, WebSite, SoftwareApplication, WebPage, Article/BreadcrumbList architecture reused. Higher-education FAQ content and JSON-LD share front matter. All strategic JSON-LD is parsed and FAQ text is compared with emitted page text. Removed unverified SearchAction endpoints from main and blog headers. Google retired FAQ rich results; valid visible FAQ markup is not a promise of a search feature."),
        ("9. Technical SEO fixes", "Standardised higher education's main landmark placement; escaped shared metadata; repaired social-image URL construction and removed guessed blog image dimensions. Legacy awards now emit canonicals and corrected social metadata. A stable public origin prevents preview servers from emitting local sitemap or social-image addresses. Sitemap preserves exact canonical paths, includes public output collections, deduplicates URLs, excludes noindex/redirect/demo documents and avoids fabricated build-time lastmod dates."),
        ("10. Images optimized", "Six higher-education PNG sources now have descriptive lossless WebP copies: two responsive illustrations plus four correctly sized workflow icons. Added dimensions, lazy loading and asynchronous decoding. Original artwork is retained; previous homepage responsive-image work is preserved."),
        ("11. Broken links fixed", "The new comparison hub links directly to retained .html canonicals. All newly required pillar graph destinations exist locally. The linked unresolved-link inventory records remaining legacy links rather than silently redirecting them to unrelated pages."),
        ("12. Sitemap / robots status", f"Parsed XML: {len(sitemap)} canonical indexable emitted URLs. Robots keeps rendering assets accessible and adds extensionless staging/demo exclusions. Local file/HTML checks do not prove live HTTP status, Google indexing or host-level redirect configuration."),
        ("13. Duplicate-content issues resolved", "No duplicate higher-education or vendor articles were created. Removed the Open Badges guide's redundant manually written FAQ block; the template renders its front-matter FAQ. Full-site duplicate metadata groups are recorded in audit-results.json; pages were not removed or noindexed without evidence."),
        ("14. Remaining SEO issues", "Validate published HTTP/HTTPS and www redirects, canonical aliases, live 200 responses, true 404 status, Google indexing and field Core Web Vitals after release. Resolve legacy broken links and duplicate metadata from the inventory. Review competitor assertions, security documentation and customer relationships/outcomes against current approved evidence. Keep existing case-study routes; do not create /customers/ copies or invented studies. Approve a claim/evidence register before expanding the customer architecture. Blog classifications are title-level triage, not merge/delete decisions.")
    ]
    esc = html.escape
    table = "<table><thead><tr><th>URL</th><th>Title</th><th>H1</th><th>Images missing dimensions</th></tr></thead><tbody>"
    for row in rows:
        table += "<tr>" + "".join(f"<td>{esc(str(v))}</td>" for v in
                                  (row["url"], row["title"], "; ".join(row["h1"]), row["images_without_dimensions"])) + "</tr>"
    table += "</tbody></table>"
    keyword_table = "<table><tr><th>Keyword cluster</th><th>Target URL</th><th>Search intent</th><th>Page type</th></tr>"
    for keyword, route, intent, kind in KEYWORDS:
        keyword_table += "<tr>" + "".join(f"<td>{esc(v)}</td>" for v in (keyword, route, intent, kind)) + "</tr>"
    keyword_table += "</table>"
    report = """<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>CertifyMe Institutional SEO Implementation Audit</title><style>
body{font:16px/1.65 system-ui,sans-serif;color:#172033;background:#f5f7fa;margin:0}main{max-width:1120px;margin:auto;padding:40px;background:white}
h1{line-height:1.2}h2{margin-top:38px}table{width:100%;border-collapse:collapse;font-size:13px}td,th{border:1px solid #d7dde7;padding:10px;text-align:left;vertical-align:top;overflow-wrap:anywhere}
.notice{padding:18px;background:#eef3fc;border-left:4px solid #4259ad}.scroll{overflow-x:auto}a{color:#28478b}@media(max-width:600px){main{padding:20px}}
</style><main><h1>CertifyMe Institutional SEO Audit</h1><p>Highest-impact first pass · Existing Jekyll/Liquid architecture · No visual redesign</p>"""
    report += f'<div class="notice">{len(rows)} strategic pages audited; {len(failures)} validation failures. Results describe the generated preview build, not production indexing or rankings.</div>'
    for heading, paragraph in sections:
        report += f"<section><h2>{esc(heading)}</h2><p>{esc(paragraph)}</p></section>"
    report += '<h2>Strategic page audit</h2><div class="scroll">' + table + '</div>'
    report += '<h2>Keyword-to-URL map</h2><div class="scroll">' + keyword_table + '</div>'
    report += "<h2>Evidence and verification limits</h2><p>Certification roles checked against the public 1EdTech registry: Open Badges 3.0 Issuer; CLR 2.0 Issuer and Displayer. Certification does not establish universal wallet compatibility, identity verification, security audits or customer outcomes.</p>"
    report += '<p>Sources: <a href="https://site.imsglobal.org/certifications/certifyme/certifyme">1EdTech registry</a>; <a href="https://developers.google.com/search/updates#removing-faq-rich-result">Google Search documentation updates</a>.</p>'
    report += "<p>Blog triage totals: " + esc(str(results["blog_classification"])) + ".</p>"
    report += f"<p>Remaining duplicate title groups: {len(duplicates['titles'])}; duplicate description groups: {len(duplicates['descriptions'])}; unresolved strategic-page link pairs: {len(set(broken))}.</p>"
    if failures:
        report += "<h2>Validation failures</h2><pre>" + esc("\n".join(failures)) + "</pre>"
    report += "</main></html>"
    (out / "seo-audit-report.html").write_text(report)
    print(json.dumps({"strategic_pages": len(rows), "sitemap_urls": len(sitemap),
                      "failures": failures, "remaining_broken_links": len(set(broken)),
                      "blog_articles": len(blog_rows)}, indent=2))
    raise SystemExit(bool(failures))


if __name__ == "__main__":
    main()