#!/usr/bin/env python3
"""Check rendered pages against the approved pre-fix content-format findings."""
import csv
import json
import re
import sys
import unicodedata
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlparse

ROOT = Path(__file__).resolve().parents[1]
FINDINGS = ROOT / ".local/reports/instructional-content-audit/deliverables/instructional-content-findings.csv"
REPORT = ROOT / ".local/reports/reader-copy-fixes/verification.json"


def normalise(text):
    return re.sub(r"\s+", " ", unicodedata.normalize("NFKC", text)).strip()


def emitted(url):
    rel = unquote(urlparse(url).path).lstrip("/")
    return next((p for p in (
        ROOT / "_site" / rel,
        ROOT / "_site" / (rel + ".html"),
        ROOT / "_site" / rel / "index.html",
    ) if p.is_file()), None)


class Page(HTMLParser):
    def __init__(self, raw):
        super().__init__()
        self.skip = 0
        self.parts = []
        self.title = []
        self.in_title = False
        self.h1_count = 0
        self.description = ""
        self.links = []
        self.schema_errors = []
        self.in_schema = False
        self.schema = []
        self.feed(raw)

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag in ("script", "style", "svg"):
            self.skip += 1
        if tag == "script" and attrs.get("type") == "application/ld+json":
            self.in_schema = True
            self.schema = []
        if tag == "title":
            self.in_title = True
        if tag == "h1":
            self.h1_count += 1
        if tag == "meta" and attrs.get("name") == "description":
            self.description = attrs.get("content", "")
        if tag == "a" and attrs.get("href", "").startswith("/"):
            self.links.append(attrs["href"])

    def handle_endtag(self, tag):
        if tag == "script" and self.in_schema:
            try:
                json.loads("".join(self.schema))
            except (ValueError, TypeError) as exc:
                self.schema_errors.append(str(exc))
            self.in_schema = False
        if tag in ("script", "style", "svg"):
            self.skip = max(0, self.skip - 1)
        if tag == "title":
            self.in_title = False

    def handle_data(self, text):
        if self.in_schema:
            self.schema.append(text)
        if self.in_title:
            self.title.append(text)
        if not self.skip:
            self.parts.append(text)


def main():
    if not FINDINGS.is_file():
        sys.exit("Pre-fix findings are required: " + str(FINDINGS))
    with FINDINGS.open(encoding="utf-8-sig") as file:
        rows = [row for row in csv.DictReader(file)
                if row["Disposition"].startswith("Confirmed")]
    pages = {}
    errors = []
    remaining = []
    broken_links = []
    checked_passages = 0
    for row in rows:
        url = row["URL"]
        if url not in pages:
            file = emitted(url)
            if file is None:
                errors.append("Missing rendered route: " + url)
                pages[url] = None
            else:
                pages[url] = Page(file.read_text())
        page = pages[url]
        if page is None:
            continue
        passage = re.sub(r"^\d+\.\s*", "", normalise(row["Exact_Published_Text"]))
        if passage:
            checked_passages += 1
            if passage in normalise(" ".join(page.parts)):
                remaining.append({
                    "url": url, "source": row["Source"],
                    "passage": row["Exact_Published_Text"],
                })
    for url, page in pages.items():
        if page is None:
            continue
        if not normalise(" ".join(page.title)):
            errors.append("Missing title: " + url)
        if not page.description:
            errors.append("Missing description: " + url)
        if page.schema_errors:
            errors.append("Invalid JSON-LD: " + url)
        for link in set(page.links):
            if emitted(link) is None:
                broken_links.append({"page": url, "link": link})
    result = {
        "confirmed_urls": len(pages),
        "confirmed_finding_rows": len(rows),
        "specific_passages_checked": checked_passages,
        "remaining_passages": remaining,
        "route_metadata_schema_errors": sorted(set(errors)),
        "broken_local_links": broken_links,
    }
    REPORT.parent.mkdir(parents=True, exist_ok=True)
    REPORT.write_text(json.dumps(result, indent=2, ensure_ascii=False) + "\n")
    print(json.dumps(result, indent=2, ensure_ascii=False))
    return bool(errors or remaining or broken_links)


if __name__ == "__main__":
    sys.exit(main())