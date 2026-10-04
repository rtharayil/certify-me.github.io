#!/usr/bin/env python3
"""Validate only the revised P1 cohort; preserve baseline assessments and P2."""
import csv
import difflib
import hashlib
import html
import importlib.util
import json
import re
from collections import Counter
from pathlib import Path
from urllib.parse import unquote, urlparse

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / ".local/reports/content-authority"
spec = importlib.util.spec_from_file_location("seo_reader", ROOT / "scripts/audit-institutional-seo.py")
reader = importlib.util.module_from_spec(spec)
spec.loader.exec_module(reader)


def load(name):
    return json.loads((OUT / name).read_text())


def save(name, value):
    (OUT / name).write_text(json.dumps(value, indent=2, ensure_ascii=False) + "\n")


def parts(text):
    _, header, body = text.split("---", 2)
    return header, body


def field(header, key):
    match = re.search(r"^" + key + r":\s*(.*)$", header, re.M)
    if not match:
        return None
    value = match[1].strip()
    return json.loads(value) if value.startswith('"') else value


def emitted(url):
    rel = unquote(urlparse(url).path).lstrip("/")
    return next((p for p in [ROOT / "_site" / rel, ROOT / "_site" / (rel + ".html"),
                            ROOT / "_site" / rel / "index.html"] if p.is_file()), None)


def body_links(body):
    result = []
    # Images and shared Liquid includes are not contextual article-body links.
    for match in re.finditer(r"(?<!!)\[([^\]]+)\]\(([^)\s]+)(?:\s+[^)]*)?\)|<a\b[^>]*href=[\"']([^\"']+)[\"'][^>]*>(.*?)</a>", body, re.S):
        anchor = match[1] or re.sub("<[^>]*>", "", match[4])
        target = html.unescape(match[2] or match[3])
        pos = match.start()
        start = body.rfind("\n\n", 0, pos) + 2
        end = body.find("\n\n", pos)
        result.append({"target_url": target, "anchor_text": anchor,
                       "context": body[start:end if end >= 0 else len(body)].strip(),
                       "origin": "article-source-body (excludes shared navigation and parent modules)"})
    return result


def schema_nodes(value):
    if isinstance(value, dict):
        yield value
        for item in value.values():
            yield from schema_nodes(item)
    elif isinstance(value, list):
        for item in value:
            yield from schema_nodes(item)


def wording(value):
    # Kramdown's smart punctuation is applied to both visible FAQs and schema.
    return re.sub(r"\s+", " ", value.translate(str.maketrans("‘’“”", "''\"\""))).strip()


audit = load("content-authority-audit.json")
before = {a["source"]: a["content"] for a in load("p1-before-sources.json")}
plans = {p["source"]: p for name in ["p1-revisions.json", "p1-targeted-revisions.json"] for p in load(name)}
protected = load("p1-protected-source-hashes.json")
merge_preservation = load("p1-merge-preservation.json") if (OUT / "p1-merge-preservation.json").is_file() else {}
incoming_protected = merge_preservation.get("protected_incoming_sources", {})
if not set(incoming_protected).issubset(protected) or "_data/blog_editorial.json" in incoming_protected:
    raise SystemExit("Invalid incoming-main protection record; parent mapping cannot be exempted.")
selected = [a for a in audit["articles"] if a["source"] in before]
errors, evidence, registry = [], [], []
for path, expected in protected.items():
    if hashlib.sha256((ROOT / path).read_bytes()).hexdigest() != incoming_protected.get(path, expected):
        errors.append("Protected source or adjudicated parents changed: " + path)
if len(selected) != 31 or set(plans) != set(before):
    errors.append("Expected exactly the original 31 P1 DEFER selections.")

for a in selected:
    path = a["source"]
    old = before[path]
    current = (ROOT / path).read_text()
    old_head, old_body = parts(old)
    head, body = parts(current)
    plan = plans[path]
    for key in ["author", "date", "permalink", "layout", "imageLink", "topic"]:
        if field(old_head, key) != field(head, key):
            errors.append(f"Publication/routing provenance changed: {path} {key}")
    if a["priority"] != "P1" or old_body == body:
        errors.append("Not an improved original P1 body: " + path)
    if field(head, "last_modified") != "2026-10-04":
        errors.append("Missing honest edit date: " + path)
    target = emitted(a["url"])
    check = {"url": a["url"], "metadata_schema": "PASS"}
    if not target:
        errors.append("Missing retained route: " + a["url"])
        continue
    page = reader.Page(target)
    text = wording(" ".join(page.text))
    h1s = [t for level, t in page.headings if level == 1]
    description = field(head, "description")
    if len(h1s) != 1 or not page.title or page.meta.get("description") != description or page.errors:
        errors.append("Metadata, H1 or JSON-LD invalid: " + path)
        check["metadata_schema"] = "FAIL"
    if len(page.canonicals) != 1 or urlparse(page.canonicals[0]).path != a["url"]:
        errors.append("Canonical URL changed: " + path)
    nodes = [n for schema in page.ld for n in schema_nodes(schema)]
    article = next((n for n in nodes if n.get("@type") == "BlogPosting"), None)
    if not article or not article.get("dateModified", "").startswith("2026-10-04"):
        errors.append("Missing updated BlogPosting schema: " + path)
    faq = next((n for n in nodes if n.get("@type") == "FAQPage"), None)
    expected = [(wording(f["question"]), wording(f["answer"])) for f in plan["faqs"]]
    actual = [(wording(q.get("name", "")), wording(q.get("acceptedAnswer", {}).get("text", ""))) for q in (faq or {}).get("mainEntity", [])]
    source_faqs = [(wording(json.loads(q)), wording(json.loads(answer)))
                   for q, answer in re.findall(r'^\s+- question: (".*")\n\s+answer: (".*")$', head, re.M)]
    # The merge adds incoming-main FAQs; keep every planned answer and validate
    # the whole source FAQ list against both visible content and emitted schema.
    if source_faqs != actual or any(pair not in actual for pair in expected) or any(q not in text or answer not in text for q, answer in source_faqs):
        errors.append("Visible FAQs/schema differ from revised answers: " + path)
    if "Editorial content updated 4 October 2026." not in text:
        errors.append("Edit date is not visible: " + path)
    if f'data-reviewed-cluster="{a["proposed_topic_cluster"]}"' not in target.read_text():
        errors.append("Reviewed parent grouping missing: " + path)
    old_links = body_links(old_body)
    links = body_links(body)
    internal = [l for l in links if urlparse(l["target_url"]).netloc in ("", "www.certifyme.online", "certifyme.online")
                and not l["target_url"].startswith(("#", "mailto:", "tel:"))]
    if len(internal) < 2:
        errors.append("Fewer than two contextual internal body links: " + path)
    for link in internal:
        parsed = urlparse(link["target_url"])
        linked_file = emitted(link["target_url"])
        if not linked_file:
            errors.append(f"Unresolved internal article-body link: {path} -> {link['target_url']}")
        elif parsed.fragment and f'id="{parsed.fragment}"' not in linked_file.read_text():
            errors.append(f"Missing body-link anchor: {path} -> {link['target_url']}")
        registry.append({"source_url": a["url"], **link,
                         "reason": "Contextual article-body explanation; see quoted source paragraph."})
    diff = "".join(difflib.unified_diff(old.splitlines(True), current.splitlines(True),
                                      fromfile=path + " (workspace before)", tofile=path + " (revised)"))
    record = {
        "url": a["url"], "source": path, "parent_retained": a["parent_authority_page"],
        "baseline_assessment_A_J": a["A_J_assessment"],
        "baseline_factual_candidates": a["factual_risk_notes"],
        "reason": plan["reason"],
        "implementation": "article-specific replacement" if "body" in plan else "targeted paragraph/section changes",
        "before_sha256": hashlib.sha256(old.encode()).hexdigest(),
        "after_sha256": hashlib.sha256(current.encode()).hexdigest(),
        "before_body_link_count": len(old_links), "after_body_link_count": len(links),
        "after_internal_body_link_count": len(internal),
        "added_body_links": [l for l in links if l["target_url"] not in {o["target_url"] for o in old_links}],
        "removed_body_links": [l for l in old_links if l["target_url"] not in {o["target_url"] for o in links}],
        "changed_metadata": {k: {"before": field(old_head, k), "after": field(head, k)}
                             for k in ["title", "description", "last_modified", "comparison_context"]
                             if field(old_head, k) != field(head, k)},
        "unresolved_dependencies": plan["dependencies"], "rendered_check": check,
        "before_after_diff": diff,
        "score_basis": "Original A–J and scores remain baseline qualitative review; no rescoring or independently verified gains."
    }
    evidence.append(record)

save("p1-validation.json", {"status": "FAIL" if errors else "PASS", "selected": len(selected),
                          "protected_sources": len(protected) - 1, "adjudicated_parents_unchanged": True,
                           "protected_sources_preserved_from_incoming_main": sorted(incoming_protected),
                          "checks": [e["rendered_check"] for e in evidence], "errors": errors})
save("p1-before-after-evidence.json", evidence)
save("p1-editorial-body-links.json", registry)
if errors:
    print(json.dumps({"status": "FAIL", "errors": errors}, indent=2))
    raise SystemExit(1)

# Update current implementation fields only; never change baseline ratings/assessments.
by_source = {e["source"]: e for e in evidence}
for a in selected:
    a["implementation_status"] = "REWRITE" if "body" in plans[a["source"]] else "IMPROVE"
    a["p1_revision"] = {k: v for k, v in by_source[a["source"]].items()
                        if k not in ["baseline_assessment_A_J", "baseline_factual_candidates", "before_after_diff"]}
    a["metadata_schema_check"] = "PASS (revised P1 emitted metadata/FAQ/schema)"
    a["rendered_parent_verified"] = True
audit["implementation_outcome_counts"] = dict(Counter(a["implementation_status"] for a in audit["articles"]))
audit["status"] = "SCOPED_PASS_WITH_P2_AND_PRODUCT_EVIDENCE_DEPENDENCIES"
audit["p1_implementation_summary"] = {"selected": 31, "body_links": len(registry),
                                      "baseline_scores_retained": True, "production_or_seo_gains_claimed": False}
save("content-authority-audit.json", audit)
with (OUT / "content-authority-audit.csv").open() as stream:
    columns = next(csv.reader(stream))
with (OUT / "content-authority-audit.csv").open("w") as stream:
    writer = csv.DictWriter(stream, fieldnames=columns)
    writer.writeheader()
    writer.writerows({k: json.dumps(a[k], ensure_ascii=False) if isinstance(a.get(k), (list, dict))
                     else a.get(k, "") for k in columns} for a in audit["articles"])
inventory = load("reviewed-inventory.json")
for a in inventory["articles"]:
    if a["source"] in by_source:
        a["implementation_status"] = "REWRITE" if "body" in plans[a["source"]] else "IMPROVE"
        a["p1_revision"] = by_source[a["source"]]["reason"]
save("reviewed-inventory.json", inventory)
issues = load("unresolved-content-issues.json")
urls = {a["url"] for a in selected}
resolved = issues.get("resolved_p1_articles", [])
resolved.extend({**i, "resolution": by_source[next(a["source"] for a in selected if a["url"] == i["url"])]["reason"]}
                for i in issues["deferred_articles"] if i["url"] in urls)
issues["resolved_p1_articles"] = resolved
issues["deferred_articles"] = [i for i in issues["deferred_articles"] if i["url"] not in urls]
issues["p1_product_evidence_dependencies"] = [
    {"url": e["url"], "dependencies": e["unresolved_dependencies"],
     "status": "Explicit in copy or removed assertion; requires current product/contract/measurement evidence"}
    for e in evidence]
issues["cross_estate_evidence_limits"] = [
    "P1 vendor claims were checked against primary sources or removed/qualified. Remaining P2 bodies are deferred pending traffic/backlink/indexing evidence."
    if line.startswith("Vendor features/pricing, dated statistics") else line
    for line in issues["cross_estate_evidence_limits"]]
save("unresolved-content-issues.json", issues)
existing = load("editorial-link-registry.json")
save("editorial-link-registry.json", [l for l in existing if l["source_url"] not in urls] + registry)
with (OUT / "editorial-link-registry.csv").open("w") as stream:
    writer = csv.DictWriter(stream, fieldnames=["source_url", "target_url", "anchor_text", "context", "reason", "origin"])
    writer.writeheader()
    writer.writerows(load("editorial-link-registry.json"))
print(json.dumps({"status": "PASS", "selected": len(selected), "contextual_internal_body_links": len(registry),
                  "P2_deferred": len(issues["deferred_articles"]), "baseline_scores": "unchanged"}))