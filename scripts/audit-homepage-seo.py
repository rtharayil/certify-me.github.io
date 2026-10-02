#!/usr/bin/env python3
"""Validate the emitted homepage, not commented source or invented SEO scores."""
import json
from collections import Counter
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit


class Page(HTMLParser):
    def __init__(self):
        super().__init__()
        self.meta, self.links, self.images, self.scripts = [], [], [], []
        self.ids, self.tags = [], Counter()
        self.title, self.json_blocks, self.current_json = "", [], None
        self.in_title = False

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        self.tags[tag] += 1
        if attrs.get("id"):
            self.ids.append(attrs["id"])
        if tag == "meta":
            self.meta.append(attrs)
        elif tag == "link":
            self.links.append(attrs)
        elif tag == "a":
            self.links.append(dict(attrs, anchor=True))
        elif tag == "img":
            self.images.append(attrs)
        elif tag == "script":
            self.scripts.append(attrs)
            if attrs.get("type") == "application/ld+json":
                self.current_json = ""
        elif tag == "title":
            self.in_title = True

    def handle_data(self, data):
        if self.in_title:
            self.title += data
        if self.current_json is not None:
            self.current_json += data

    def handle_endtag(self, tag):
        if tag == "title":
            self.in_title = False
        elif tag == "script" and self.current_json is not None:
            self.json_blocks.append(json.loads(self.current_json))
            self.current_json = None


root = Path("_site")
html = (root / "index.html").read_text()
page = Page()
page.feed(html)
assert page.tags["h1"] == 1, "Exactly one H1 including hidden markup"
assert page.tags["main"] == 1, "Do not nest the sample's workspace inside a second main landmark"
assert page.tags["title"] == 1 and 30 <= len(page.title.strip()) <= 65
assert not [key for key, count in Counter(page.ids).items() if count > 1], "Duplicate HTML IDs"

def meta(key):
    values = [m.get("content", "") for m in page.meta if m.get("name") == key or m.get("property") == key]
    assert len(values) == 1, f"Expected one {key}"
    return values[0]

assert 100 <= len(meta("description")) <= 165
assert "noindex" not in meta("robots")
assert "max-image-preview:large" in meta("robots")
canonical = [link["href"] for link in page.links if link.get("rel") == "canonical"]
assert canonical == ["https://www.certifyme.online/"]
assert meta("og:url") == canonical[0]
assert meta("og:title") == meta("twitter:title") == page.title
assert meta("og:description") == meta("twitter:description") == meta("description")
assert meta("twitter:card") == "summary_large_image"
assert (meta("og:image:width"), meta("og:image:height")) == ("1200", "630")
assert meta("twitter:image") == meta("og:image")
assert (root / unquote(urlsplit(meta("og:image")).path).lstrip("/")).is_file()

assert len(page.json_blocks) == 1, "Homepage entity graph should be single-source"
graph = page.json_blocks[0]["@graph"]
types = Counter(node["@type"] for node in graph)
assert types == Counter({"Organization": 1, "WebSite": 1, "SoftwareApplication": 1, "WebPage": 1, "FAQPage": 1})
assert len({node["@id"] for node in graph}) == len(graph)
faq = next(node for node in graph if node["@type"] == "FAQPage")
assert len(faq["mainEntity"]) == 6
for question in faq["mainEntity"]:
    from html import escape
    assert escape(question["name"], quote=True).replace("&#x27;", "&#39;") in html
    # Liquid HTML escaping and JSON unicode escaping must describe the same visible answer.
    answer = question["acceptedAnswer"]["text"]
    assert escape(answer, quote=True).replace("&#x27;", "&#39;") in html, question["name"]
assert all("aggregateRating" not in node and "potentialAction" not in node for node in graph)
assert "independent verification" not in json.dumps(graph).lower()
assert "One connected ecosystem" not in html

missing = []
for link in page.links:
    if not link.get("anchor"):
        continue
    href = link.get("href", "")
    parsed = urlsplit(href)
    if href.startswith("#"):
        if href != "#" and unquote(parsed.fragment) not in page.ids:
            missing.append(href)
    elif href.startswith("/"):
        target = root / unquote(parsed.path).lstrip("/")
        if not any(path.is_file() for path in (target, Path(str(target) + ".html"), target / "index.html")):
            missing.append(href)
assert not missing, f"Broken homepage internal targets: {missing}"

sources = [s.get("src", "") for s in page.scripts if s.get("src")]
assert not any(s.startswith("/assets3/") for s in sources)
assert len([s for s in sources if "jquery-" in s]) == 1
assert len([s for s in sources if "bootstrap.min.js" in s]) == 1
assert all("defer" in s for s in page.scripts if s.get("src", "").startswith("/assets4/"))
assert any(img.get("fetchpriority") == "high" and img.get("srcset") and img.get("width") for img in page.images)
assert all("alt" in image for image in page.images)
for bot in ["Googlebot", "Bingbot", "OAI-SearchBot", "PerplexityBot"]:
    import urllib.robotparser
    robots = urllib.robotparser.RobotFileParser()
    robots.parse((root / "robots.txt").read_text().splitlines())
    assert robots.can_fetch(bot, canonical[0]), f"Homepage blocked for {bot}"
import xml.etree.ElementTree as ET
sitemap = ET.parse(root / "sitemap.xml")
ns = {"s": "http://www.sitemaps.org/schemas/sitemap/0.9"}
home = [u for u in sitemap.findall("s:url", ns) if u.findtext("s:loc", namespaces=ns) == canonical[0]]
assert len(home) == 1
assert home[0].findtext("s:lastmod", namespaces=ns) == "2026-10-02"
assert home[0].findtext("s:priority", namespaces=ns) == "1"
print(json.dumps({"status": "passed", "scope": "homepage only", "title_characters": len(page.title),
                  "description_characters": len(meta("description")), "schema_entities": dict(types),
                  "visible_and_schema_questions": 6, "broken_internal_links": missing,
                  "local_scripts": len([s for s in sources if s.startswith("/")]),
                  "indexable_for": ["Googlebot", "Bingbot", "OAI-SearchBot", "PerplexityBot"]}, indent=2))