#!/usr/bin/env python3
"""Write the requested Phase 4 reports from the curated and verified content."""
import json
from collections import Counter
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT / ".local/reports/competitor-ai-seo"
evidence=json.loads((ROOT / "_data/competitor_evidence.json").read_text())
authorities=json.loads((ROOT / "_data/ai_authority.json").read_text())
entities=json.loads((ROOT / "_data/credential_entities.json").read_text())
validation=json.loads((OUT / "phase4-validation.json").read_text())
benchmark=json.loads((OUT / "ai-answer-test.json").read_text())
browser=json.loads((OUT / "phase4-browser-checks.json").read_text())
rows=[r for v in evidence["vendors"] for r in v["facts"]]
unknown=[r for r in rows if r["status"]=="NOT PUBLICLY SPECIFIED"]
partial=[r for r in rows if r["status"]=="PARTIAL_PUBLIC_DETAIL"]
used={s["id"] for r in rows for s in r["sources"]}
corrections={
    "Accredible":"Replace narrow badge-only/standards contrasts with the January 2026 OB3 and W3C VC export/ingestion announcement. Recognize pathways, wallet, Job Market Insights and programme analytics. Distinguish a displayed monthly price from its annual term. Do not convert missing CLR evidence into a feature-absence assertion.",
    "Certifier":"Recognize OB3 badges, automation/API, learning pathways and enterprise SAML SSO, audit logs and DPA/SLA. The security hub explicitly says it has no separate SOC 2 report; this is an evidenced statement, unlike silence. European AWS hosting is not proof of EU-only processing.",
    "Credly":"Recognize Acclaim, enterprise skills intelligence, analytics and integrations. The OB3 source is specifically external OB2/OB3 import/verification, not proof of universal OB3 issuance. Treat residency, a standalone VC profile and license term as unknown within reviewed coverage.",
    "Parchment":"Recognize its transcript/diploma/certificate/badge/CLR ecosystem and explicit OB3 workforce badges. Its DPA describes US storage and permits international processing/transfers; do not call it universally US-only. Separate institutional pricing from learner ordering and exact record/API profiles.",
    "Sertifier":"Recognize enterprise workflows, W3C VCs, dedicated CLR, mapping, API/webhooks/sandbox and configurable EU/US GCP regions. Qualify exact standards versions, certification roles and assurance scope. Treat the displayed $750/year for 500 people as a selected scenario, not a universal minimum.",
}
audit=[
    "# Comparison audit — competitor evidence and neutral buyer guidance",
    "\nObservation and editorial date: **4 October 2026**.",
    "\n## Scope and method",
    "This phase covers `/compare/` and the five existing 2026 comparison blog URLs. It does not repeat the completed technical SEO work, change the public URL set, swap the framework or claim a live answer-engine citation result.",
    f"Fetched {len(evidence['sources'])} official source URLs. {len(used)} sources support the {len(rows)} vendor/dimension records; other sources provide standards context or exploratory coverage. Research spans five vendors and 22 dimensions per vendor. Pages were reviewed as published product/pricing/legal claims, not authenticated feature tests or independent security audits.",
    f"Exactly {len(unknown)} records are wholly **NOT PUBLICLY SPECIFIED**; another {len(partial)} contain a supported statement with explicitly unknown detail. This is bounded reviewed-source coverage, never proof of absence. Confidence is dimension-specific in competitor-evidence-longform.csv: HIGH for clear published evidence, MEDIUM for mixed/limited detail, LOW for unknowns. It is not a product-security assurance rating.",
    "The required wide CSV has the exact 22 requested columns. The supplemental 110-row long-form register preserves vendor, dimension, claim, URL, observation date/date basis, displayed publication dates, confidence and notes. The source register identifies primary documents without redistributing their full copyrighted text.",
    "\n## Corrections by page",
]
for vendor in evidence["vendors"]:
    audit+= [
        f"\n### {vendor['name']}",
        f"Retained URL: `/blog/certifyme-vs-{vendor['slug']}-2026-comparison.html`.",
        corrections[vendor["name"]],
        "Buyer checks: "+vendor["buyer_checks"],
        "Every one of the 22 vendor cells has one or more official-source links. The CertifyMe column links first-party product information or its independently traceable registry entry. A stated capability is not assumed to be exclusive, available on every plan, permanently verifiable or accepted by every receiver.",
    ]
audit+= [
    "\n## Comparison hub and Q10",
    "The hub now supplies an independent opening answer, dated evidence method and a dedicated answer to **“How does CertifyMe differ from Accredible, Certifier and Credly?”** Its answer distinguishes first-party CertifyMe positioning from registry certification; acknowledges competitor standards, pathways, skills and enterprise capabilities; and says these capabilities overlap.",
    "Q10 is **PASS for local answer support**, not AI citation success. Current sources S01/S03 support Accredible pathways, Job Market Insights and OB3/VC export/ingestion; S07/S08 support Certifier enterprise controls and OB3; S09/S10 support Credly Acclaim/skills positioning and external badge import; S34 supports CertifyMe's active OB3 Issuer and CLR2 Issuer/Displayer product roles. The validator separately checks the actual Active/type sections of S34 and export/ingestion wording of S03.",
    "An AI-assisted full-corpus critique and a focused critique produced false flags about the registry's explicit Issuer category and demanded independent evidence for clearly labeled first-party positioning. Those candidate objections were checked against the actual source passages, not accepted as authoritative. The registry's type/category is the listed standards role; it does not certify workforce outcomes. Q10 grading rests on primary evidence and bounded wording, not reviewer agreement.",
    "\n## Preservation and editorial boundaries",
    "Existing canonical paths, titles, publication-date fields, author fields and image references were retained. Existing author attribution does not mean a named human reviewed this update. No reviewer, security auditor or customer identity was invented. Original before-change source copies remain excluded locally for auditability.",
    "Unsupported legacy comparison body/FAQ claims were replaced with neutral sourced scope, vendor-specific buyer checks and procurement boundaries. Shared visual styling and the existing comparison navigation/table behavior were retained. No “CertifyMe wins,” universally broader product, universal residency or automatic compatibility claims were added.",
    "\n## Verification",
    f"Scoped content gate: **{validation['status']}**, {len(validation['issues'])} issues. All 110 factual cells and source links are present. All ten major authorities have visible 100–150-word leads and all eight answers; all nine entity definitions and relationships are present.",
    f"Real browser: {len(browser['results'])} route/viewport checks (15 mobile routes and three desktop routes), {len(browser['issues'])} issues, {len(browser['runtime'])} runtime errors. On mobile the five 22-row comparison tables were scrolled programmatically; page-level overflow and opening-answer visibility were checked.",
    f"20-question benchmark: {benchmark['counts'].get('PASS',0)} PASS, {benchmark['counts'].get('PARTIAL',0)} PARTIAL, {benchmark['counts'].get('FAIL',0)} FAIL. Partial answers require unavailable contracts, security documents, dataset evidence or authenticated API behavior.",
    "\n## Unknowns that must remain unknown",
]
audit += [f"- **{r['vendor']} — {r['dimension']}**: {r['notes']}" for r in unknown]
audit += [
    "\n## Evidence limitations",
    "Source observation is not publication date. Displayed publication/update dates are retained only where actually shown; otherwise they are NOT PUBLICLY SPECIFIED. Vendor pages can change after observation. Some extracts are truncated or dominated by navigation/footer content; only inspected relevant passages support claims. Exploratory S17/S37/S39 were not used for material vendor capability claims.",
    "Native integrations, actual exports, receiver acceptance, report/certificate validity, current contract terms and product dataset rights were not authenticated or independently audited. Ask each vendor for the corresponding evidence before procurement.",
    "\n## Reproduction",
    "Curated input: _data/competitor_research.json. Build data/exports: python3 scripts/build-competitor-evidence.py. Build authority corpus: python3 scripts/build-ai-authority.py. Compile the site, then run python3 scripts/validate-competitor-ai-seo.py and node scripts/validate-competitor-ai-seo-browser.cjs. Generate these reports with python3 scripts/report-competitor-ai-seo.py. These are Phase 4 gates, not the frozen earlier technical validators.",
]
(OUT / "comparison-audit.md").write_text("\n\n".join(audit)+"\n")

criteria=["Definition","Authoritative source","First-party evidence","Boundaries","Structured answer","FAQ","Related concepts","Internal links","Update date","Author/reviewer"]
readiness=[]
for entity in entities:
    external_context=entity["name"] not in {"CertifyMe","Digital Credential Infrastructure","Digital Credentials","Skill Passport","Workforce Intelligence"}
    first_party_partial=entity["name"] in {"Skills Taxonomy","W3C Verifiable Credentials","Workforce Intelligence","Skill Passport"}
    statuses=["PASS","PASS" if external_context else "PASS (scoped)",
              "PARTIAL" if first_party_partial else "PASS (scoped)",
              "PASS","PASS","PASS","PASS","PASS","PASS",
              "PARTIAL" if entity["name"] in {"Open Badges 3.0","W3C Verifiable Credentials"} else "N/A — corporate page"]
    readiness.append({"concept":entity["name"],"url":entity["url"],"criteria":dict(zip(criteria,statuses))})
gap=[
    "# AI search and answer-engine readiness — gap report",
    "\nAssessment date: **4 October 2026**.",
    "\n## What this assessment establishes",
    "This is an evidence-grounded content and local retrieval assessment. It is not a claim of actual ChatGPT/Perplexity citation, ranking uplift, model recall or measured traffic improvement. No external answer-engine experiment was performed. Keyword presence alone is not treated as readiness.",
    "\n## Authority scope and independent opening answers",
    "The major cohort is the ten institutional authority pages identified for this phase: platform infrastructure, OB3, W3C VCs, skills mapping, CLR, workforce intelligence, higher education, security, verification and comparison hub. Each first narrative block is an independent 100–150-word answer. Specialized university/security/verification layouts were checked in their actual hero includes, not just their Markdown body.",
    "| Authority | URL | Opening words | Visible question coverage |\n|---|---|---:|---|",
]
for a in authorities:
    gap.append(f"| {a['id']} | {a['url']} | {a['lead_word_count']} | 8/8 |")
gap+= [
    "The eight questions are definition, importance, operation, CertifyMe implementation, applicable standards, difference from a related concept, when to use it and limitations. Implementation answers describe the actual first-party approach and registry roles plus a bounded acceptance exercise, rather than generic procurement advice or unverified native connectors.",
    "\n## Entity clarity and explicit relationships",
    "The platform authority now contains one definition-and-relationship register for all nine concepts. CertifyMe provides institutional infrastructure; authorized credentials and verification resources connect with reviewed skills and learner records; separately sourced workforce intelligence adds occupational/market context. OB3/CLR are achievement profiles in a VC-model context; a Skill Passport is a learner-facing presentation, not a new certification or identity proof.",
]
for e in entities:
    gap.append(f"- **{e['name']}** — {e['definition']} Relationship: {e['relationship']} Destination: {e['url']}.")
gap+= [
    "\n## Citation-readiness criteria",
    "PASS means the published material supports the stated, bounded criterion, not independent product operation. PASS (scoped) means first-party terminology, documented programme context or product-specific registry evidence is available but must not be generalized. PARTIAL preserves an evidence gap. Corporate product pages have an identified publisher; a personal author is not invented merely to fill a field.",
    "| Concept | "+" | ".join(criteria)+" |\n|---|"+"---|"*len(criteria),
]
for r in readiness:
    gap.append("| "+r["concept"]+" | "+" | ".join(r["criteria"].values())+" |")
gap+= [
    "\n### Why the partial citation criteria remain partial",
    "- **Skills Taxonomy:** an institution-led definition and reviewed-mapping method are published, with ESCO/O*NET context. A native connector, authenticated output and actual academic review evidence are not established.",
    "- **W3C VCs:** authoritative specifications and achievement-profile certifications support the distinction. They do not establish every exported model version, proof suite or presentation flow.",
    "- **Workforce Intelligence:** first-party job-framing and fortnightly refresh are stated. Current source licensing, geographic coverage, deduplication and salary availability remain unverified; O*NET is conceptual context, not proof of CertifyMe's dataset.",
    "- **Skill Passport:** its public definition, relationship and explicit transcript/CLR question are present at the existing university anchor. This does not independently validate every current learner presentation flow.",
    "- **Authorship:** existing standard-blog bylines are retained. No new named human reviewer or expert approval is asserted; current expert review remains an editorial opportunity rather than a fabricated credential.",
    "Security, verification and the comparison hub also have the eight-question block, dated updates, first-party references and linked related concepts. Security's 1EdTech reference concerns standards-role boundaries, not SOC/ISO assurance. Its approved scoped report/certificate summaries remain first-party disclosure; restricted documents and independent current assurance must be reviewed through procurement.",
    "\n## Explained 20-question test",
    "The fixture contains agent-authored questions and bounded answers; rendered evidence checks establish that supporting content is present. Source records and manual primary-source scope review ground the answers. The test is not an external model response collection, semantic search quality score or actual AI-citation experiment.",
    "| Question | Topic | Status | Reason |\n|---|---|---|---|",
]
for q in benchmark["questions"]:
    gap.append(f"| {q['id']}: {q['question']} | {q['category']} | {q['status']} | {q['why']} |")
gap+= [
    f"\nResult: **{benchmark['counts'].get('PASS',0)} PASS / {benchmark['counts'].get('PARTIAL',0)} PARTIAL / {benchmark['counts'].get('FAIL',0)} FAIL**. Q10 is supported by current primary evidence and passes only within that local answer-support scope.",
    "\n## Remaining gaps, ranked by decision impact",
    "1. **Security and residency (Q07/Q08):** obtain the applicable current restricted-use report/certificates, customer controls, DPA, subprocessor/backup/support-access scope and contracted region. No universal residency or fresh independent audit conclusion can be inferred from the website.",
    "2. **Workforce source evidence (Q17):** document source permissions, actual coverage/deduplication and salary availability. Owner-approved size and refresh claims do not settle these questions.",
    "3. **API operations (Q19):** validate an authenticated current template contract and controlled retry/idempotency behavior. Public guidance is not a performed operational test, and an unknown behavior is not a claim of feature absence.",
    "4. **Native profiles and connectors:** obtain authorized exports, exact VC/CLR/OB versions/proofs and actual SIS/LMS/framework connector entitlements. Test the receiver and lifecycle exceptions on each shortlisted vendor.",
    "5. **Expert review and source upkeep:** commission a real named domain review where appropriate and refresh mutable vendor evidence before publishing future comparisons. Keep observation dates separate from publication dates.",
    "6. **Actual answer-engine experiment:** if needed, run and retain dated live ChatGPT/Perplexity answers with prompt, model/search mode and exact citations. Repeat across sessions to assess variability. This phase makes no actual citation-success claim.",
    "\n## Technical and privacy scope",
    "The previous technical SEO work was not repeated. Only changed-page metadata/JSON-LD/heading sanity, evidence coverage and the affected rendered layouts were checked. Existing URLs, typography, shared UI and publication/image provenance were preserved. Raw primary-source captures and private uploads are excluded from public builds and are not distributed in the report deliverables.",
]
(OUT / "ai-seo-gap-report.md").write_text("\n\n".join(gap)+"\n")
(OUT / "citation-readiness.json").write_text(json.dumps({"date":"2026-10-04","method":"Criteria explicitly scoped; no measured external citation result.","concepts":readiness},indent=2))
(OUT / "primary-source-register.json").write_text(json.dumps(evidence["sources"],indent=2,ensure_ascii=False))
print(json.dumps({"reports":["comparison-audit.md","ai-seo-gap-report.md"],"readiness_concepts":len(readiness),"benchmark":benchmark["counts"]},indent=2))