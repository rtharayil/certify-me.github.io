#!/usr/bin/env python3
"""Package transparent editorial evidence, not a claim of fact closure or SEO gains."""
import html
import json
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / ".local/reports/content-authority"
records = json.loads((OUT / "p1-before-after-evidence.json").read_text())
validation = json.loads((OUT / "p1-validation.json").read_text())
responsive = json.loads((OUT / "p1-responsive.json").read_text())
if validation["status"] != "PASS" or responsive["status"] != "PASS":
    raise SystemExit("Do not publish the evidence package before both scoped checks pass.")

summary = [
    "# CertifyMe — Revised P1 Content Evidence",
    "",
    "Editorial update: 4 October 2026. Local development verification, not a production release.",
    "",
    "## Scope and result",
    "",
    "All **31 originally deferred P1 articles** were revised: 21 article-specific replacements where factual or fabricated material was pervasive, and 10 targeted paragraph/section improvements. These are not a rewrite of all 83 articles. The five P1 KEEP articles, 27 P2 resources and adjudicated parent mapping are unchanged from the workspace baseline. This task did not revise the 20 P0 sources; the later merge preserved incoming main's concurrent institutional-answer changes in two P0 articles. Their incoming hashes and the resolution are documented separately.",
    "",
    "The later merge also retained incoming primary-evidence summaries, comparison tables and FAQs alongside the P1 article-specific paragraphs and FAQs. Incoming institutional-answer rendering is preserved; body-link counts still exclude shared modules. The evidence generator now preserves separately reviewed P1 copy.",
    "",
    "URLs, author attribution, explicit publication dates, layouts, topic values and hero-image references were preserved. Three titles were revised where the framing needed correction; edit dates are separate and visible. No article was deleted, consolidated, redirected or noindexed.",
    "",
    "The baseline A–J assessments, factual candidates and qualitative scores are retained as **baseline**, not rescored or independently verified facts. No SEO, indexing, ranking, placement, conversion or revenue gain is claimed.",
    "",
    "## Material corrections",
    "",
    "- Accredible's January 2026 announcement confirms OB3 and W3C VC export and ingestion. Credly documents external occupation/labour-market insights. Parchment publishes badges, CLR, pathways and workforce offerings. Sertifier publishes programme reporting and enterprise controls. Certifier describes verifiable credential and certification operations. Unconfirmed features are not described as absent.",
    "- CertifyMe's registry evidence is scoped to OB3 Issuer and listed CLR roles. Interoperability certification is not a privacy/security audit. Current security reports, customer responsibilities and contractual entitlements remain separate.",
    "- PKI certificates are distinct from learner achievements. CertifyMe is not presented as a TLS CA. DV/OV/EV concern validation scope, not increasing encryption strength. Current public TLS validity requirements are sourced.",
    "- Blockchain is not compulsory, hash matching is not achievement truth, and a signed subject is not independently verified identity. Wallet, key, status and evidence dependencies remain explicit.",
    "- Invented testimonials, named customer outcomes, unsupported marketing conversions and hiring/retention promises were removed or replaced with clearly illustrative workflows. Customer case references retain anonymity.",
    "- Free-plan limits are attributed to current observed pages; NetCredential's usable free entitlement remains unconfirmed. Post-trial verification and export require written confirmation.",
    "",
    "## Verification and link accounting",
    "",
    f"- Scoped emitted metadata, canonical/H1, BlogPosting edit date, FAQ schema/visible wording, internal body destinations and protected-source checks: **{validation['status']}**, 31 routes.",
    f"- Settled responsive layouts: **{responsive['status']}**, {responsive['viewportChecks']} checks at 320, 390, 768 and 1280 pixels; every revised FAQ was opened. No page errors were observed.",
    f"- Actual article-source body links: **{sum(r['after_body_link_count'] for r in records)}**, of which **{sum(r['after_internal_body_link_count'] for r in records)}** are internal contextual links. Shared parents/navigation/footers and table-module links are not counted.",
    "- Comparison tables use locally contained horizontal scrollers where needed; this is distinguished from document overflow. The future-of-credentials article's inherited global body styling was removed and its table styling scoped.",
    "- Jekyll build passed. Existing broad technical regressions were not rerun. Browser checks were against the running development preview, not production.",
    "",
    "## Remaining evidence boundaries",
    "",
    "Product-specific proof/export behavior, exact connector and plan entitlements, security audit scope, status propagation, termination continuity and intended receiver compatibility still need current documents or an authorized product pilot. Owner-confirmed job coverage and two-week refresh are not independent dataset audits or measured employment outcomes. Branding/engagement/hiring/ROI effects require actual measurement.",
    "",
    "All 27 P2 resources remain live and deferred. Traffic, backlinks and indexing were not supplied; no destructive editorial decision is authorized by this work.",
    "",
    "## Article-specific evidence",
    "",
    "Full source snapshots, exact unified before/after diffs, baseline A–J assessments, changed metadata, added/removed body links and per-article dependencies are included in the evidence JSON and ZIP.",
]

sections = []
for record in records:
    summary += ["", f"### {record['url']}", "", record["reason"],
                f"- Method: {record['implementation']}. Parent retained: `{record['parent_retained']}`.",
                f"- Source-body links: {record['before_body_link_count']} → {record['after_body_link_count']}; internal after: {record['after_internal_body_link_count']}.",
                "- Remaining evidence: " + " ".join(record["unresolved_dependencies"])]
    esc = html.escape
    sections.append(
        f"<section><h2>{esc(record['url'])}</h2><p>{esc(record['reason'])}</p>"
        f"<p><b>Method:</b> {esc(record['implementation'])}. "
        f"<b>Parent retained:</b> {esc(record['parent_retained'])}.</p>"
        f"<p><b>Body links:</b> {record['before_body_link_count']} → {record['after_body_link_count']}; "
        f"{record['after_internal_body_link_count']} internal after.</p>"
        f"<p><b>Unresolved evidence:</b> {esc(' '.join(record['unresolved_dependencies']))}</p>"
        f"<details><summary>Baseline A–J assessment (not rescored)</summary><pre>{esc(json.dumps(record['baseline_assessment_A_J'],indent=2))}</pre></details>"
        f"<details><summary>Changed metadata</summary><pre>{esc(json.dumps(record['changed_metadata'],indent=2,ensure_ascii=False))}</pre></details>"
        f"<details><summary>Exact before/after source diff</summary><pre>{esc(record['before_after_diff'])}</pre></details></section>"
    )

(OUT / "p1-report.md").write_text("\n".join(summary) + "\n")
intro = "\n".join(summary[:summary.index("## Article-specific evidence")])
document = (
    "<!doctype html><html lang='en'><meta charset='utf-8'>"
    "<meta name='viewport' content='width=device-width,initial-scale=1'>"
    "<title>CertifyMe P1 Editorial Evidence</title><style>"
    "body{font-family:system-ui,sans-serif;max-width:1100px;margin:auto;padding:24px;color:#202039;background:#fafaff}"
    "h1{font-size:2rem}h2{overflow-wrap:anywhere}section{background:white;border:1px solid #dedee8;border-radius:10px;padding:20px;margin:20px 0}"
    "pre{white-space:pre-wrap;overflow-wrap:anywhere;font-size:13px;line-height:1.5}"
    "summary{cursor:pointer;padding:10px;font-weight:600}details{margin:10px 0}p{line-height:1.6}"
    "</style><body><h1>CertifyMe P1 Editorial Evidence</h1><pre>"
    + html.escape(intro) + "</pre><h2>31 article-specific revisions</h2>" + "".join(sections) + "</body></html>"
)
(OUT / "p1-report.html").write_text(document)
names = [
    "p1-report.md", "p1-report.html", "p1-before-sources.json", "p1-before-after-evidence.json",
    "p1-editorial-body-links.json", "p1-validation.json", "p1-responsive.json",
    "p1-primary-source-checks.json", "p1-additional-sources.json", "p1-research-searches.json",
    "content-authority-audit.json", "editorial-link-registry.json", "editorial-link-registry.csv",
    "unresolved-content-issues.json", "p1-merge-preservation.json"
]
with zipfile.ZipFile(OUT / "certifyme-p1-content-evidence.zip", "w", zipfile.ZIP_DEFLATED) as archive:
    for name in names:
        archive.write(OUT / name, "reports/" + name)
    for record in records:
        archive.write(ROOT / record["source"], "revised-sources/" + record["source"])
print("Packaged 31 revisions, source checks, scoped validation and current issue/link registers.")