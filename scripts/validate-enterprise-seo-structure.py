#!/usr/bin/env python3
"""Round 1: inspect freshly generated HTML, not a previous audit result."""
import csv
import importlib.util
import json
import re
from collections import defaultdict
from pathlib import Path
from urllib.parse import unquote, urljoin, urlparse
from urllib.robotparser import RobotFileParser
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
BASE = "https://www.certifyme.online"
spec = importlib.util.spec_from_file_location("html_reader", ROOT / "scripts/audit-institutional-seo.py")
reader = importlib.util.module_from_spec(spec)
spec.loader.exec_module(reader)
PRIORITY = [
    "/", "/platform-overview", "/credentials-higher-education",
    "/blog/why-institutions-should-embrace-open-badges-3-0-standards",
    "/blog/Understanding-W3C-Verifiable-Credentials.html",
    "/skills-taxonomy-mapping", "/comprehensive-learner-record", "/workforce-intelligence",
    "/certificate-verification", "/security/", "/compare/", "/case-studies.html",
] + [f"/blog/certifyme-vs-{vendor}-2026-comparison.html"
     for vendor in ("parchment", "credly", "accredible", "certifier", "sertifier")]
OUT = ROOT / ".local/reports/enterprise-seo/round-1"
SITE = ROOT / "_site"
DEFECT_ROUTES = {
    "/FAQ.html", "/ICP-FAQs.html", "/digital-credential-maturity/",
    "/eduTranscript-FAQ.html", "/gen-FAQ.html", "/lab", "/signature-download.html",
}


def resolve(href):
    path = SITE / unquote(urlparse(href).path).lstrip("/")
    return next((p for p in (path, Path(str(path) + ".html"), path / "index.html") if p.is_file()), None)


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    sitemap = [el.text for el in ET.parse(SITE / "sitemap.xml").findall(".//{*}loc")]
    robots = RobotFileParser()
    robots.parse((SITE / "robots.txt").read_text().splitlines())
    pages, issues, titles, descriptions = {}, [], defaultdict(list), defaultdict(list)
    required = ("description", "robots", "og:title", "og:description", "og:image",
                "twitter:title", "twitter:description", "twitter:image")
    for url in sitemap:
        file = resolve(url)
        if not file:
            issues.append({"severity": "critical", "url": url, "issue": "Missing sitemap destination"})
            continue
        p = reader.Page(file)
        route = urlparse(url).path
        priority = route in PRIORITY
        strict = priority or route in DEFECT_ROUTES
        row = {"url": url, "title": p.title, "description": p.meta.get("description", ""),
               "h1": [text for level, text in p.headings if level == 1],
               "canonical": p.canonicals, "robots": p.meta.get("robots", ""),
               "schema_types": sorted({str(n.get("@type")) for ld in p.ld for n in reader.nodes(ld) if n.get("@type")}),
               "google_crawlable": robots.can_fetch("Googlebot", url),
               "ai_crawlable": robots.can_fetch("OAI-SearchBot", url),
               "priority": priority, "body_words": len(" ".join(p.text).split()),
               "images_missing_alt": sum("alt" not in image for image in p.images),
               "images_missing_dimensions": sum(not image.get("width") or not image.get("height") for image in p.images),
               "broken_links": [], "internal_links": [], "faq_mismatches": [], "json_errors": p.errors,
               "cta_count": sum("request-demo" in href or "preregister" in href for href in p.links)}
        if len(p.canonicals) != 1 or p.canonicals[0] != url or not resolve(p.canonicals[0]):
            issues.append({"severity": "critical", "url": url, "issue": "Canonical is missing, duplicated or not the emitted sitemap URL"})
        if "noindex" in row["robots"] or not row["google_crawlable"] or not row["ai_crawlable"]:
            issues.append({"severity": "critical" if priority else "medium", "url": url, "issue": "Indexation/crawler discrepancy"})
        if not p.title or any(not p.meta.get(key) for key in required) or len(row["h1"]) != 1:
            issues.append({"severity": "high" if strict else "medium", "url": url, "issue": "Metadata or single-H1 requirement incomplete"})
        for href in p.links:
            absolute = urljoin(url, href)
            target = urlparse(absolute)
            if target.scheme not in ("https", "http") or target.netloc not in ("www.certifyme.online", "certifyme.online"):
                continue
            row["internal_links"].append(target.path)
            if not resolve(absolute):
                row["broken_links"].append(href)
        if row["broken_links"]:
            issues.append({"severity": "high" if priority else "medium", "url": url,
                           "issue": "Unresolved internal destinations", "links": sorted(set(row["broken_links"]))})
        body = reader.normalize(" ".join(p.text)).lower()
        for ld in p.ld:
            for node in reader.nodes(ld):
                if node.get("@type") == "Question":
                    q = reader.normalize(node.get("name") or "").lower()
                    answer = (node.get("acceptedAnswer") or {}).get("text") or ""
                    words = set(re.findall(r"[a-z0-9]+", reader.normalize(answer).lower()))
                    visible = set(re.findall(r"[a-z0-9]+", body))
                    if not q or not words or q not in body or len(words & visible) / len(words) < .95:
                        row["faq_mismatches"].append(q or "(missing question name)")
        if p.errors or row["faq_mismatches"]:
            issues.append({"severity": "high" if strict else "medium", "url": url, "issue": "Schema syntax or visible-FAQ mismatch",
                           "details": p.errors + row["faq_mismatches"]})
        if priority and not row["cta_count"]:
            issues.append({"severity": "high", "url": url, "issue": "No conversion CTA in main content"})
        if priority and row["images_missing_dimensions"]:
            issues.append({"severity": "high", "url": url, "issue": "Priority images lack intrinsic dimensions",
                           "count": row["images_missing_dimensions"]})
        titles[p.title].append(url)
        descriptions[row["description"]].append(url)
        pages[url] = row
    if len(set(sitemap)) != len(sitemap):
        issues.append({"severity": "critical", "issue": "Duplicate sitemap URLs"})
    for route in PRIORITY:
        if BASE + route not in pages:
            issues.append({"severity": "critical", "url": route, "issue": "Priority page absent from sitemap"})
    for route in DEFECT_ROUTES:
        if BASE + route not in pages:
            issues.append({"severity": "critical", "url": route, "issue": "Required defect-regression page absent from sitemap"})
    for agent in ("Googlebot", "OAI-SearchBot", "GPTBot", "ClaudeBot", "PerplexityBot"):
        if robots.can_fetch(agent, BASE + "/attached_assets/private.pdf") or robots.can_fetch(agent, BASE + "/devopsma/example.html"):
            issues.append({"severity": "critical", "issue": f"{agent} does not share private/demo exclusions"})
    incoming = defaultdict(set)
    for url, row in pages.items():
        for route in set(row["internal_links"]):
            if BASE + route != url:
                incoming[BASE + route].add(url)
    for url, row in pages.items():
        row["incoming_pages"] = sorted(incoming[url])
        row["indexability"] = "crawlable; no meta noindex" if row["google_crawlable"] and "noindex" not in row["robots"] else "excluded"
        row["actual_google_indexing"] = "unknown: Search Console not available"
    duplicates = {kind: {key: values for key, values in groups.items() if key and len(values) > 1}
                  for kind, groups in (("titles", titles), ("descriptions", descriptions))}
    for kind, groups in duplicates.items():
        for value, urls in groups.items():
            issues.append({"severity": "high", "urls": urls, "issue": f"Duplicate sitemap {kind}", "value": value})
    result = {"round": "SEO TEST ROUND 1 — STRUCTURAL VALIDATION",
              "method": "Fresh generated HTML, XML and robots parsing; no baseline result reused",
              "scope": "Every marketing sitemap document; priority gating, whole-estate medium issue inventory",
              "sitemap_count": len(sitemap), "priority_count": len(PRIORITY),
               "defect_regression_routes": sorted(DEFECT_ROUTES),
              "issues": issues, "duplicates": duplicates, "pages": list(pages.values()),
              "limitations": ["Local destination resolution is not a live HTTP check.", "Automated text checks do not prove editorial quality or rich-result eligibility."]}
    result["status"] = "PASS" if not any(i["severity"] in ("critical", "high") for i in issues) else "FAIL"
    (OUT / "structural.json").write_text(json.dumps(result, indent=2))
    headers = ["url", "title", "description", "h1", "canonical", "robots", "indexability",
               "actual_google_indexing", "schema_types", "body_words", "incoming_pages",
               "internal_links", "images_missing_alt", "images_missing_dimensions", "priority"]
    with (OUT / "page-inventory.csv").open("w", newline="") as file:
        writer = csv.DictWriter(file, fieldnames=headers)
        writer.writeheader()
        for row in pages.values():
            writer.writerow({key: row[key] for key in headers})
    print(json.dumps({"status": result["status"], "pages": len(pages), "issues": issues,
                      "duplicates": duplicates}, indent=2))
    raise SystemExit(result["status"] != "PASS")


if __name__ == "__main__":
    main()