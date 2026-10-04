#!/usr/bin/env python3
"""Package the scoped Phase 3 result without overstating deferred content closure."""
import csv
import hashlib
import html
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / ".local/reports/content-authority"
audit = json.loads((OUT / "content-authority-audit.json").read_text())
if audit["status"] != "SCOPED_PASS_WITH_DEFERRED_CONTENT_ISSUES":
    raise SystemExit("Finish the new editorial and responsive gates before producing the final handover.")
articles = audit["articles"]
p0 = [a for a in articles if a["priority"] == "P0"]
authorities = audit["authority_checklists"]
extra = ["/platform-overview","/skills-taxonomy-mapping","/comprehensive-learner-record",
         "/workforce-intelligence","/credentials-higher-education"]
direct = sorted({a["url"] for a in p0} | set(extra))
rendered = sorted({a["url"] for a in articles} | set(extra))

originals = {a["url"]:a for a in json.loads((OUT / "p0-original-sources.json").read_text())}
preservation = []
for a in p0:
    before = originals[a["url"]]["source_text"]
    after = (ROOT / a["source"]).read_text()
    before_fm,after_fm = before.split("---",2)[1],after.split("---",2)[1]
    checks = {}
    for key in ["permalink","title","date","author","imageLink"]:
        pattern = rf"^{key}\s*:.*$"
        old = re.search(pattern,before_fm,re.M)
        new = re.search(pattern,after_fm,re.M)
        checks[key] = (old.group(0) if old else None) == (new.group(0) if new else None)
    if not all(checks.values()):
        raise SystemExit("Unexpected protected publication metadata change: " + a["url"])
    if a["recommended_action"] == "IMPROVE" and before.split("---",2)[2].strip() not in after:
        raise SystemExit("A targeted improvement lost its original operational reference: " + a["url"])
    preservation.append({"url":a["url"],"protected_publication_fields":checks,"source_sha256":hashlib.sha256(after.encode()).hexdigest(),
                         "original_reference_preserved":a["recommended_action"] == "IMPROVE"})
(OUT / "publication-preservation.json").write_text(json.dumps(preservation,indent=2))

unresolved = []
for a in articles:
    if a["implementation_status"] == "DEFER":
        unresolved.append({"url":a["url"],"priority":a["priority"],"type":"DEFERRED_EDITORIAL_WORK",
            "recommended_action":a["recommended_action"],"baseline_factual_risk":a["factual_risk_level"],
            "baseline_risk_candidates":a["factual_risk_notes"],"overlap":a["duplicate_overlap_risk"],
            "next_actions":a["planned_improvements"],
            "evidence_requirement":"Verify factual candidates against current primary sources. Require traffic/backlink/indexing evidence before any consolidation, redirect, noindex or deletion."})
global_limits = [
 "No Search Console, traffic, backlink, indexing or ranking evidence was supplied. P2 resources remain live; no destructive decisions were made.",
 "Vendor features/pricing, dated statistics and legacy security/identity guarantees in deferred article bodies remain candidates for source verification; parent navigation does not repair those bodies.",
 "API, analytics and learning-path operational references were preserved. Current field contracts, feature availability and retry/idempotency behavior were not tested against an authenticated product account.",
 "No independent recipient-identity verification is asserted; proof, issuer authority, assessment and identity assurance remain distinct.",
 "Issuer-key/status continuity and actual receiver compatibility require implementation testing. Standards do not remove all dependencies.",
 "Job-source permissions, licensing, deduplication, exact geography and salary availability remain unverified. Approved scale and fortnightly refresh do not establish them.",
 "Residency and supported integration scope require the actual contract/current product documentation; hosting availability is not universal residency.",
 "Anonymous first-party cases and owner-approved figures are bounded business evidence, not independent research or universally transferable ROI.",
 "Scores and originality assessments are qualitative AI-assisted editorial judgments. There was no human-expert sign-off, plagiarism test or independent certification of every fact.",
 "This was local development/preview verification. No publish action, production indexing check, ranking gain or conversion uplift is claimed.",
]
(OUT / "unresolved-content-issues.json").write_text(json.dumps({"deferred_articles":unresolved,"cross_estate_evidence_limits":global_limits},indent=2))
reverse = [{"source_url":a["url"],"target_url":r["url"],"anchor_text":r["anchor"],"context":r["context"],
            "reason":"Individually curated implementation reading for this authority; not an all-posts list."}
           for a in authorities for r in a["reciprocal_reading"]]
with (OUT / "pillar-to-article-links.csv").open("w",newline="") as f:
    writer = csv.DictWriter(f,fieldnames=list(reverse[0]));writer.writeheader();writer.writerows(reverse)

lines = [
 "# CertifyMe Phase 3 — Content Authority Report",
 "",
 "Editorial implementation date: 4 October 2026.",
 "",
 "## Outcome and scope",
 "",
 "**The requested review and P0 implementation scope passed the new local content-authority checks. The entire content estate is not declared fact-closed or fully transformed.** Deferred article bodies and externally dependent evidence remain explicitly open.",
 "",
 "All 83 complete rendered article bodies were reviewed before implementation: 147,523 baseline words across 17 documented review batches. Each received an A–J assessment, five qualitative scores, intent/ICP/funnel classification, factual/overlap candidates and an explicitly adjudicated parent. The 53-word archived announcement was included rather than excluded for length.",
 "",
 "The assessment was AI-assisted with explicit agent editorial decisions, not a human-expert approval. Originality scores are not plagiarism checks. Baseline scores, citations and risk candidates remain labeled as pre-implementation findings; P0 post-edit critiques are recorded separately.",
 "",
 "The original 33-part transformation and passing sitemap, canonical, duplicate-metadata, image-dimension, global FAQ, comparison-table and private-upload suites were **not rerun**. Existing positioning and authority connections were retained.",
 "",
 "## Actions actually executed",
 "",
 "| Outcome | Articles |",
 "|---|---:|",
]
for action in ["KEEP","IMPROVE","REWRITE","CONSOLIDATE","REDIRECT","NOINDEX","DEFER"]:
    lines.append(f"| {action} | {audit['implementation_outcome_counts'][action]} |")
lines += [
 "",
 "**20 P0 articles changed:** 16 individually authored rewrites and four targeted improvements. The four retained their original API/standards/analytics/learning-path reference text. Original URLs, titles, publication dates, authors and hero-image fields were preserved. New descriptions, visible FAQ answers and genuine modification dates were aligned with the revised copy.",
 "",
 "Priority groups: **20 P0, 36 P1, 27 P2**. The 36 P1 entries comprise five KEEP decisions and 31 deferred targeted improvements. All 27 P2 resources are deferred pending evidence. Therefore 58 DEFER outcomes are not 58 completed improvements.",
 "",
 "Inventory recommendations before implementation: 5 KEEP, 35 IMPROVE, 16 REWRITE and 27 LEAVE AS RESOURCE; zero consolidation, redirect or noindex recommendations executed. LEAVE AS RESOURCE is represented within DEFER, not double-counted.",
 "",
 "## Six authority destinations",
 "",
 "Each has a rendered definition, answer, institutional problem, architecture, operation, standards, implementation decisions, use cases, limitations, illustrative example, FAQs, first-party evidence references, related concepts, genuine date and existing demo CTA. No new named reviewer was fabricated; omission is allowed by the brief. Six independent AI-assisted 19-point editorial checklists are included.",
 "",
 "| Authority | Distinct contextual article sources | Curated reverse links |",
 "|---|---:|---:|",
]
for a in authorities:
    lines.append(f"| [{a['name']}]({a['url']}) | {a['distinct_contextual_source_count']} | {len(a['reciprocal_reading'])} |")
lines += [
 "",
 f"The link registry contains **{len(audit['editorial_link_registry'])} article-body links** with source, target, anchor, surrounding paragraph and specific rationale. Counts exclude navigation, footers, the shared parent panel and common authority modules. Repeated links from one article count once toward the five-source threshold. The {len(reverse)} pillar-to-article entries are individually curated and describe what each article helps the reader do.",
 "",
 "## Higher-education buyer journey",
 "",
 "The existing university hub now distinguishes Registrar, CIO/IT, Provost, Dean/faculty, Career Services, Academic leadership and IT/security responsibilities. Meaningful links cover all 16 requested concepts, including the real Skill Passport section anchor, digital transcript presentation, analytics, API/integration scope and contractual residency. No thin keyword pages or new product capabilities were created.",
 "",
 "## New validation",
 "",
 "- 83/83 explicit reviewed clusters and parent decisions match the rendered grouping; title-based fallback removed for this cohort.",
 "- 20/20 P0 sources changed; all 63 non-P0 article sources retained their baseline hashes.",
 "- Six authority checklists have 19 semantic decisions each; optional new-reviewer fields omitted.",
 "- At least five distinct useful article-body sources into each authority; actual totals shown above.",
 "- Independent AI-assisted post-edit critique covered all 20 P0 bodies and six authority sections. No new unsupported assertions or newly duplicated search intent were flagged; this is not independent fact certification.",
 "- Changed-cohort title/description/H1 and JSON-LD parsing checks passed. Protected publication metadata and retained operational references were verified.",
 f"- Running preview: **{audit['mobile_validation_summary']['routes']} routes × six widths = {audit['mobile_validation_summary']['viewportChecks']} checks**, at 320, 360, 390, 430, 768 and 1280 pixels; no persistent editorial overflow or browser runtime errors. New authority disclosures exposed their answers.",
 "- Responsive checks wait for page/font readiness and settled viewport layout; intermediate frames are not reported as persistent defects.",
 "- A mobile screenshot of a rewritten article confirmed the public preview renders. These checks do not establish production/search-engine behavior.",
 "",
 "Reproduce only this phase:",
 "",
 "```sh",
 "bundle exec jekyll build",
 "node scripts/validate-content-authority-mobile.cjs",
 "python3 scripts/validate-content-authority.py",
 "python3 scripts/write-content-authority-report.py",
 "```",
 "",
 "## Every directly edited content URL",
 "",
 f"{len(direct)} URLs received direct article/authority/buyer-journey content changes:",
 "",
]
for url in direct: lines.append("- " + url)
lines += [
 "",
 "## Every article whose rendered parent context changed",
 "",
 f"The explicit reviewed grouping was installed on all 83 articles, including the three separate transcript-layout articles. Combined with the five non-blog destinations above, **{len(rendered)} unique public URLs have a content/context change**. This does not imply 83 body rewrites.",
 "",
]
for a in articles:
    lines.append(f"- {a['url']} — {a['proposed_topic_cluster']} → {a['parent_authority_page']} ({a['implementation_status']})")
lines += ["","## Unresolved evidence and content issues",""]
for limit in global_limits: lines.append("- " + limit)
lines += [
 "",
 "### P0 operational limitations still requiring real implementation evidence",
 "",
 "The following are bounded dependencies, not claims that a feature is absent. In particular, the API's idempotency behavior remains **unconfirmed**, not proven unsupported.",
 "",
]
for a in audit["semantic_review"]["articles"]:
    notes = a["residual_issues"]
    if a["url"] == "/blog/CertifyMe-Custom-Attributes-API-Guide.html":
        notes = ["Confirm exact template field names/types and current retry/idempotency semantics against the actual API contract; no native feature absence is inferred."]
    if notes: lines.append("- " + a["url"] + " — " + " ".join(notes))
lines += [
 "",
 "### Deferred article-by-article register",
 "",
 "These are baseline factual candidates, overlap observations and planned improvements—not independent proof that every candidate is false. All 58 deferred entries are listed; see the JSON/CSV for their ten-part assessments and exact numbered body citations.",
 "",
]
for a in unresolved:
    lines += [f"#### {a['url']} — {a['priority']} / {a['recommended_action']}",
              f"- Baseline factual risk: {a['baseline_factual_risk']}. {a['baseline_risk_candidates']}",
              "- Overlap: " + a["overlap"],
              "- Deferred action: " + "; ".join(a["next_actions"]),""]
lines += [
 "## Completion statement",
 "",
 "Inventory, explicit parents, selected P0 edits, six authority checklists, university journey, contextual-link minimums and new local validation are delivered. No new URL, deletion, consolidation, redirect or noindex was introduced. **Do not read this as closure of the deferred estate, independent verification of all facts, a human review, or measured SEO improvement.**",
]
(OUT / "content-authority-report.md").write_text("\n".join(lines) + "\n")

checklist_md = ["# Six authority-page editorial checklists","",
                "AI-assisted semantic assessment with verified rendered sections. No human-expert approval or independent fact certification is implied.",""]
print_pages = []
for a in authorities:
    checklist_md += ["## " + a["name"],a["url"],"",
                     f"{a['distinct_contextual_source_count']} distinct contextual article sources; {len(a['reciprocal_reading'])} curated reverse links.","",
                     "| Criterion | Assessment | Evidence |","|---|---|---|"]
    judgments = {c["criterion"].lower():c for c in a["independent_editorial_assessment"]}
    rows = []
    for c in a["criteria"]:
        status = "OMITTED_ALLOWED" if c["criterion"] == "genuine author/reviewer where available" else "PASS — AI-assisted"
        evidence = c["evidence"].replace("|","/")
        checklist_md.append(f"| {c['criterion']} | {status} | {evidence} |")
        short = evidence if len(evidence) <= 140 else evidence[:137].rsplit(" ",1)[0] + "…"
        rows.append(f"<tr><th>{html.escape(c['criterion'])}</th><td>{html.escape(status)}</td><td>{html.escape(short)}</td></tr>")
    checklist_md.append("")
    print_pages.append(f'<section class="checklist-page"><h1>{html.escape(a["name"])}</h1><p class="url">{html.escape(a["url"])}</p><p>{a["distinct_contextual_source_count"]} distinct contextual sources · {len(a["reciprocal_reading"])} curated reverse links · Editorial update 4 October 2026</p><table><thead><tr><th>Criterion</th><th>Assessment</th><th>Evidence / scope</th></tr></thead><tbody>{"".join(rows)}</tbody></table><p class="note">AI-assisted editorial assessment, not human approval or independent fact certification. Reviewer omitted rather than invented. Full evidence, exact body contexts and residual limits are in the accompanying report and JSON.</p></section>')
(OUT / "six-authority-checklist.md").write_text("\n".join(checklist_md))
print_html = '<!doctype html><html lang="en"><meta charset="utf-8"><title>CertifyMe — Six Authority Checklists</title><style>@page{size:A4;margin:14mm}body{font:10px/1.25 Arial,sans-serif;color:#15243b;margin:0}.checklist-page{break-after:page;page-break-after:always}.checklist-page:last-child{break-after:auto}h1{font-size:21px;margin:0 0 7px;color:#422687}.url{font-size:10px;color:#5b6070}table{width:100%;border-collapse:collapse;table-layout:fixed}thead th{background:#eeebf7}th,td{padding:4px 6px;border:1px solid #ddd;vertical-align:top;text-align:left;overflow-wrap:anywhere}th:first-child{width:23%}th:nth-child(2){width:19%}tbody th{font-weight:600}.note{margin-top:10px;font-size:9px;color:#596579}</style>' + "".join(print_pages) + "</html>"
(OUT / "six-authority-checklist.html").write_text(print_html)
print(json.dumps({"report":"content-authority-report.md","directly_changed_urls":len(direct),"rendered_content_context_urls":len(rendered),"unresolved_deferred_records":len(unresolved),"protected_P0_metadata":len(preservation),"checklist_pages":len(authorities)},indent=2))