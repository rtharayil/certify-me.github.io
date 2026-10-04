#!/usr/bin/env python3
"""Build the Phase 4 evidence publication and exports from curated primary-source facts."""
import csv
import hashlib
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / ".local/reports/competitor-ai-seo"
research = json.loads((ROOT / "_data/competitor_research.json").read_text())
catalog = json.loads((OUT / "source-catalog.json").read_text())
sources = {}
publication_dates = {"S03": "2026-01-13", "S21": "2026-01-13",
                     "S31": "2025-05-15", "S38": "2026-09-15"}
for raw in catalog:
    if raw.get("error"):
        continue
    fetched = json.loads((OUT / "sources" / (raw["id"] + ".json")).read_text())
    text = fetched.get("markdown", "")
    heading = re.search(r"^# (.+)$", text, re.M)
    sources[raw["id"]] = {
        "id": raw["id"], "vendor": raw["vendor"], "url": raw["url"],
        "title": heading.group(1) if heading else raw["vendor"] + " official documentation",
        "observed_on": research["observed_on"],
        "publication_date": publication_dates.get(raw["id"], "NOT PUBLICLY SPECIFIED"),
        "source_date_basis": "Observed 2026-10-04; publication/update date retained only when displayed.",
        "extraction": "PARTIAL_EXTRACT" if raw.get("truncated") else "FETCHED",
        "source_type": "official standards/registry" if raw["vendor"] in {"Standards", "Taxonomy", "CertifyMe"} else "official vendor",
    }

rows, vendors = [], []
for vendor in research["vendors"]:
    if set(vendor["facts"]) != set(research["dimensions"]):
        raise SystemExit("Incomplete dimension coverage: " + vendor["name"])
    facts = []
    for dimension in research["dimensions"]:
        entry = vendor["facts"][dimension]
        claim, ids = entry[:2]
        refs = [sources[id] for id in ids]
        if any(not (OUT / "sources" / (id + ".json")).is_file() for id in ids):
            raise SystemExit("Missing primary evidence.")
        unknown = claim == "NOT PUBLICLY SPECIFIED"
        partial = "NOT PUBLICLY SPECIFIED" in claim and not unknown
        notes = entry[2] if len(entry) > 2 else "Published vendor claim; plan, deployment and actual operation not independently tested."
        if unknown:
            notes += " This is the result of reviewed-source coverage, not evidence of absence."
        row = {
            "vendor": vendor["name"], "dimension": dimension, "current_claim": claim,
            "source_url": "; ".join(r["url"] for r in refs),
            "source_date": research["observed_on"], "source_date_basis": "retrieval/observation",
            "publication_dates": "; ".join(r["publication_date"] for r in refs),
            "confidence": "LOW" if unknown else "MEDIUM" if partial else "HIGH",
            "notes": notes, "sources": refs,
            "status": "NOT PUBLICLY SPECIFIED" if unknown else "PARTIAL_PUBLIC_DETAIL" if partial else "PUBLISHED",
        }
        rows.append(row)
        facts.append(row)
    vendors.append({k: vendor[k] for k in ["name", "slug", "summary", "buyer_checks"]} | {"facts": facts})

own = [
    ("ICP", "Institutional issuers: universities, professional bodies, enterprises and training organizations.", "/platform-overview"),
    ("Positioning", "Institution-governed credential infrastructure, not a universal claim of broader functionality than competitors.", "/platform-overview"),
    ("Credentialing", "Digital credential issuance and verification with open-standard achievement and record context.", "/platform-overview"),
    ("Digital Badges", "Digital badges represent institution-authorized achievements; confirm the implemented format.", "/digital-badges.html"),
    ("Open Badges", "Public registry lists active Open Badges 3.0 Issuer certification for the specified CertifyMe product.", sources["S34"]["url"]),
    ("W3C VC", "OB3/CLR achievement profiles use the VC model. No general W3C certification or universal v2.0/proof-suite support is inferred.", "/blog/Understanding-W3C-Verifiable-Credentials.html"),
    ("CLR", "Public registry lists active CLR 2.0 Issuer and Displayer roles for the specified product.", sources["S34"]["url"]),
    ("Skills", "Institution-led taxonomy mapping keeps reviewed outcomes and evidence authoritative; no native reference-framework connector is inferred.", "/skills-taxonomy-mapping"),
    ("Learner Records", "Connected achievements with issuer/evidence provenance; a learner-facing Skill Passport is not a new standards certification.", "/comprehensive-learner-record"),
    ("Workforce Intelligence", "Credential-associated skills are related to occupational/hiring context. Source permissions, coverage and contractual availability require review.", "/workforce-intelligence"),
    ("Verification", "Check record proof, issuer and relevant lifecycle resources; this is not independent identity verification.", "/certificate-verification"),
    ("Analytics", "Credential/programme analytics are documented; agree metrics and export requirements rather than treating engagement as a career outcome.", "/credential-analytics.html"),
    ("API", "API documentation and integration workflows are published; confirm the current field contract, authentication, entitlements and retry behavior.", "/api/"),
    ("Integrations", "An integrations directory is published; validate each required connector and scope before procurement.", "/allIntegrations.html"),
    ("Security", "Public security page states scoped assurance information. Review examination period, management-system scope, customer controls and current documents.", "/security/"),
    ("Data Residency", "Global hosting availability is owner-confirmed; actual storage, backups, access and transfers require a contract-specific residency assessment.", "/security/"),
    ("Pricing", "Assess the current public plan/enterprise quote, volume, inclusions and deployment requirements; no universal competitor price advantage is claimed.", "/pricing.html"),
    ("Contract", "Confirm actual minimum term, renewal, SLA, retention and verification continuity in the agreement.", "/TermsAndCondition"),
    ("Higher Education", "University buyer journey connects Registrar, academic, IT/security and careers responsibilities.", "/credentials-higher-education"),
    ("Enterprise", "Enterprise SSO/MFA is owner-confirmed. Exact protocols, interfaces, deployment and contractual controls need confirmation.", "/security/"),
    ("Certification Bodies", "Programme owners retain assessment, certification criteria, renewal and record authority.", "/platform-overview"),
    ("Workforce Use Cases", "Institutional curriculum relevance and career context; no employment or salary guarantee.", "/workforce-intelligence"),
]
published = {"observed_on": research["observed_on"], "method": research["method"],
             "vendors": vendors, "sources": list(sources.values()),
             "certifyme": [{"dimension":d,"claim":c,"url":u} for d,c,u in own]}
(ROOT / "_data/competitor_evidence.json").write_text(json.dumps(published, indent=2, ensure_ascii=False) + "\n")
(OUT / "competitor-evidence-longform.json").write_text(json.dumps(rows, indent=2))
with (OUT / "competitor-evidence-longform.csv").open("w", newline="") as f:
    fields = [k for k in rows[0] if k != "sources"]
    w = csv.DictWriter(f, fieldnames=fields); w.writeheader()
    w.writerows({k:r[k] for k in fields} for r in rows)
columns = ["Vendor","ICP","Credentialing","Open Badges","W3C VC","CLR","Skills","Learner Records",
           "Workforce Intelligence","Verification","Analytics","API","Integrations","Security",
           "Data Residency","Pricing","Contract","Higher Education","Enterprise","Evidence URL","Evidence Date","Confidence"]
with (OUT / "competitor-evidence-matrix.csv").open("w", newline="") as f:
    w=csv.DictWriter(f,fieldnames=columns);w.writeheader()
    for v in vendors:
        dimensions={r["dimension"]:r for r in v["facts"]}
        w.writerow({"Vendor":v["name"],**{k:dimensions[k]["current_claim"] for k in columns[1:-3]},
                    "Evidence URL":"; ".join(dict.fromkeys(r["url"] for row in v["facts"] for r in row["sources"])),
                    "Evidence Date":"Observed 2026-10-04; see longform for displayed publication dates",
                    "Confidence":"Dimension-specific HIGH/MEDIUM/LOW; see longform. Published evidence, not independent feature assurance."})

for v in vendors:
    path=ROOT / "_blog" / f"certifyme-vs-{v['slug']}-2026-comparison.md"
    source=path.read_text(); front=source.split("---",2)[1]
    front=re.sub(r"\nfaqs:\n.*", "", front, flags=re.S)
    front=re.sub(r"\nlast_modified(?:_at)?:[^\n]*", "", front)
    front=re.sub(r"\ncomparison_evidence_phase4:[^\n]*", "", front)
    front=re.sub(r'\ndescription:.*', '\ndescription: '+json.dumps(f"Evidence-led comparison of CertifyMe and {v['name']}: credential standards, records, skills, APIs, security, pricing and procurement checks."),front)
    front+="\nlast_modified: \"2026-10-04\"\ncomparison_evidence_phase4: true\nfaqs:\n"
    questions=[
        (f"How do CertifyMe and {v['name']} differ?",v["summary"]+" CertifyMe describes institution-governed credential infrastructure. Compare actual workflows and contracts; these are not exclusive capabilities."),
        (f"Does {v['name']} support Open Badges and W3C Verifiable Credentials?",
         " ".join(r["current_claim"] for r in v["facts"] if r["dimension"] in {"Open Badges","W3C VC"})+" Confirm the exact product profile and receiver; unknown information is not feature absence."),
        (f"How should an institution compare pricing and security?",
         "Compare the same volume, billing term, API/integration entitlement and support scope. Review current assurance documents, data processing and residency terms. Public statements are not a substitute for the contracted scope."),
        (f"What must we test before choosing {v['name']} or CertifyMe?",v["buyer_checks"]),
    ]
    for q,a in questions:
        front+="  - question: "+json.dumps(q)+"\n    answer: "+json.dumps(a)+"\n"
    body=f"""
<p data-comparison-summary="{v['slug']}">{v['summary']} CertifyMe describes institution-governed infrastructure connecting credentials, verification, reviewed skills, learner records and workforce context. These capabilities overlap: choose against your programme's records, receiving systems, evidence and contract rather than assuming a universal winner.</p>

<p><strong>Evidence checked 4 October 2026.</strong> Competitor statements below link to current official product, pricing or legal sources. CertifyMe references identify its own product information or the public standards registry. These are documented claims, not authenticated feature tests. <strong>NOT PUBLICLY SPECIFIED</strong> means unverified in the reviewed sources, never that a vendor lacks the feature.</p>

## Evidence-led comparison

{{% include V4NewLook/comparison-evidence-table.html vendor="{v['name']}" %}}

## What to test with {v['name']}

{v['buyer_checks']}

Use the same authorized test achievement on each shortlisted platform. Inspect issuer, recipient reference, criteria/evidence, exported format and proof. Test the receiving system, status changes, corrections and unavailable verification resources. Measure issuance and engagement separately from skills attainment or employment outcomes.

## Commercial and security due diligence

Compare volume units, billing/renewal terms, entitlement, implementation and support, not isolated list prices. Review current security reports/certificates and their period, product scope and customer controls. Specify storage, backups, subprocessors, support access and international transfers in the contract.

## Institutional context and source boundaries

Use the [university buyer journey](/credentials-higher-education) to assign responsibilities, the [credential infrastructure overview](/platform-overview) to define the lifecycle, and the [comparison hub](/compare/) to evaluate other vendors. Review [scoped anonymous implementation cases](/case-studies.html) separately: first-party results are not guaranteed outcomes for another institution.

No new human reviewer or independent security verification is claimed. Existing publication attribution is retained. Verification of credential proof is not independent recipient-identity verification.
"""
    path.write_text("---"+front+"\n---\n"+body.strip()+"\n")
print(json.dumps({"vendors":len(vendors),"dimensions":len(research["dimensions"]),"evidence_records":len(rows),"fetched_sources":len(sources)},indent=2))