#!/usr/bin/env python3
"""Audit rendered Jekyll headings; ignore commented-out markup and scripts."""
import argparse
import json
from collections import Counter
from html.parser import HTMLParser
from pathlib import Path


class Headings(HTMLParser):
    def __init__(self):
        super().__init__()
        self.headings = []
        self.ignored = []
        self.current = None
        self.noindex = False

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag in ("script", "style", "template"):
            self.ignored.append(tag)
        if self.ignored:
            return
        if tag == "meta" and attrs.get("name", "").lower() == "robots":
            self.noindex |= "noindex" in attrs.get("content", "").lower()
        if tag in ("h1", "h2", "h3", "h4", "h5", "h6"):
            self.current = {"level": int(tag[1]), "text": "", "line": self.getpos()[0]}

    def handle_data(self, data):
        if self.current and not self.ignored:
            self.current["text"] += data

    def handle_endtag(self, tag):
        if self.ignored:
            if tag == self.ignored[-1]:
                self.ignored.pop()
            return
        if self.current and tag == f"h{self.current['level']}":
            self.current["text"] = " ".join(self.current["text"].split())
            self.headings.append(self.current)
            self.current = None


def audit(root):
    pages = []
    excluded = {"assets", "assets2", "assets3", "assets4", "attached_assets",
                "artifacts", "node_modules", "scripts", "devopsma"}
    for file in sorted(root.rglob("*.html")):
        relative = file.relative_to(root)
        if any(part in excluded for part in relative.parts):
            continue
        parser = Headings()
        parser.feed(file.read_text(errors="replace"))
        if parser.noindex:
            continue
        headings = parser.headings
        h1_count = sum(item["level"] == 1 for item in headings)
        jumps = [{"before": before, "after": after}
                 for before, after in zip(headings, headings[1:])
                 if after["level"] > before["level"] + 1]
        pages.append({"path": str(relative), "h1_count": h1_count,
                      "headings": headings, "jumps": jumps})
    return {"pages_checked": len(pages),
            "pages_with_h1_issues": sum(page["h1_count"] != 1 for page in pages),
            "pages_with_skipped_levels": sum(bool(page["jumps"]) for page in pages),
            "heading_counts": dict(Counter(f"h{h['level']}" for p in pages for h in p["headings"])),
            "issues": [p for p in pages if p["h1_count"] != 1 or p["jumps"]]}


if __name__ == "__main__":
    cli = argparse.ArgumentParser(description=__doc__)
    cli.add_argument("--site", type=Path, default=Path("_site"))
    options = cli.parse_args()
    if not options.site.is_dir():
        cli.error("Build Jekyll before running the heading audit.")
    print(json.dumps(audit(options.site), indent=2))