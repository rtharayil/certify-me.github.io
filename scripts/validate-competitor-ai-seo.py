#!/usr/bin/env python3
"""Phase 4 content/evidence gate, not the earlier technical SEO regressions."""
import csv
import html
import importlib.util
import json
import re
from collections import Counter
from pathlib import Path
from urllib.parse import unquote, urlparse

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT / ".local/reports/competitor-ai-seo"
spec=importlib.util.spec_from_file_location("reader",ROOT / "scripts/audit-institutional-seo.py")
reader=importlib.util.module_from_spec(spec);spec.loader.exec_module(reader)
data=json.loads((ROOT / "_data/competitor_evidence.json").read_text())
authorities=json.loads((ROOT / "_data/ai_authority.json").read_text())
entities=json.loads((ROOT / "_data/credential_entities.json").read_text())
questions=json.loads((ROOT / "_data/ai_answer_questions.json").read_text())
before=json.loads((OUT / "comparison-before.json").read_text())
issues=[]

def emitted(url):
    rel=unquote(urlparse(url).path).lstrip("/")
    return next((p for p in [ROOT / "_site" / rel,ROOT / "_site" / (rel+".html"),ROOT / "_site" / rel / "index.html"] if p.is_file()),None)

def norm(text):
    return re.sub(r"\s+"," ",html.unescape(text)).strip().lower()

def page(url):
    file=emitted(url)
    if not file:
        issues.append("Missing emitted route: "+url);return None
    return reader.Page(file)

if len(data["vendors"])!=5 or sum(len(v["facts"]) for v in data["vendors"])!=110:
    issues.append("Expected five vendors and 22 evidence dimensions each.")
comparison_checks=[]
for v in data["vendors"]:
    url=f"/blog/certifyme-vs-{v['slug']}-2026-comparison.html"
    parsed=page(url);raw=emitted(url).read_text() if parsed else ""
    checks=[]
    for fact in v["facts"]:
        verified=bool(fact["sources"]) and all(s["url"] in raw and s["observed_on"]=="2026-10-04" for s in fact["sources"])
        visible=norm(fact["current_claim"]) in norm(" ".join(parsed.text)) if parsed else False
        checks.append({"dimension":fact["dimension"],"published_claim_visible":visible,"primary_links_present":verified,"status":fact["status"]})
        if not visible or not verified: issues.append(url+": missing factual cell/source for "+fact["dimension"])
    if any(s in raw for s in ["the more clearly documented choice","CertifyMe wins","attaches live Job Intelligence Reports to every credential"]):
        issues.append(url+": removed superiority/universal-product assertion remains.")
    comparison_checks.append({"url":url,"vendor":v["name"],"cells":checks})
    if parsed and (parsed.errors or len([h for h in parsed.headings if h[0]==1])!=1 or not parsed.meta.get("description")):
        issues.append(url+": changed-page heading/metadata/JSON-LD problem.")
    source=(ROOT / "_blog" / f"certifyme-vs-{v['slug']}-2026-comparison.md").read_text()
    original=next(b["content"] for b in before if b["path"].endswith(f"certifyme-vs-{v['slug']}-2026-comparison.md"))
    for field in ["title","date","author","imageLink"]:
        p=rf"^{field}\s*:.*$"
        old=re.search(p,original.split("---",2)[1],re.M);new=re.search(p,source.split("---",2)[1],re.M)
        if (old.group() if old else None)!=(new.group() if new else None):
            issues.append(url+": protected publication field changed: "+field)

coverage=[]
for a in authorities:
    p=page(a["url"]);raw=emitted(a["url"]).read_text() if p else ""
    visible=norm(" ".join(p.text)) if p else ""
    lead=re.search(r'<span data-ai-answer="'+a["id"]+r'">(.*?)</span>',raw,re.S)
    rendered_lead=html.unescape(lead.group(1)) if lead else ""
    checks={"lead":norm(a["lead"])==norm(rendered_lead),
            "lead_word_window":100 <= a["lead_word_count"] <= 150,
            "eight_answers":len(a["answers"])==8 and all(norm(q["answer"]) in visible for q in a["answers"]),
            "dated": "4 October 2026" in raw,
            "valid_changed_page":bool(p) and not p.errors and len([h for h in p.headings if h[0]==1])==1}
    if not all(checks.values()):issues.append(a["url"]+": authority answer coverage problem: "+str(checks))
    coverage.append({"url":a["url"],"id":a["id"],"lead_word_count":a["lead_word_count"],**checks})

glossary=norm(" ".join(page("/platform-overview").text))
for entity in entities:
    if norm(entity["definition"]) not in glossary or norm(entity["relationship"]) not in glossary:
        issues.append("Entity definition/relationship not visible: "+entity["name"])
    target=emitted(entity["url"])
    if not target: issues.append("Unresolved concept destination: "+entity["url"])
    fragment=urlparse(entity["url"]).fragment
    if fragment and f'id="{fragment}"' not in target.read_text():
        issues.append("Missing concept anchor: "+entity["url"])

if len(questions)!=20 or [q["id"] for q in questions].count("Q10")!=1:
    issues.append("Exactly 20 questions, including the required Q10, are required.")
answers=[]
source_ids={s["id"] for s in data["sources"]}
for q in questions:
    parsed=page(q["url"]);visible=norm(" ".join(parsed.text)) if parsed else ""
    missing=[text for text in q["required"] if norm(text) not in visible]
    if any(id not in source_ids for id in q["sources"]):missing.append("unknown primary source")
    status=q["status"] if not missing else "FAIL"
    why=q["why"] if not missing else "Expected supporting page evidence missing: "+", ".join(missing)
    answers.append({k:v for k,v in q.items() if k!="required"} | {
        "status":status,"why":why,"rendered_evidence_checks":[{"text":t,"present":norm(t) in visible} for t in q["required"]],
        "source_urls":[s["url"] for s in data["sources"] if s["id"] in q["sources"]],
        "evidence_type":"first-party rendered page plus current primary sources where listed; not external answer-engine output"})
    if missing: issues.append(q["id"]+": missing answer support")
q10=next(q for q in answers if q["id"]=="Q10")
if q10["question"]!="How does CertifyMe differ from Accredible, Certifier and Credly?" or q10["status"]!="PASS":
    issues.append("Required Q10 retest not supported.")
registry=json.loads((OUT / "sources/S34.json").read_text())["markdown"]
ob3=registry.split("**Open Badges v3.0**",1)[1].split("**Comprehensive Learner Record",1)[0]
clr=registry.split("**Comprehensive Learner Record (CLR) v2.0**",1)[1]
release=json.loads((OUT / "sources/S03.json").read_text())["markdown"].lower()
q10_primary_checks={
    "ob3_active_issuer":all(t in ob3 for t in ["**Active**","- Issuer"]),
    "clr2_active_issuer_displayer":all(t in clr for t in ["**Active**","- Issuer","- Displayer"]),
    "accredible_export_ingestion":all(t in release for t in ["export","ingest"]),
    "current_observation_date":all(s["observed_on"]=="2026-10-04" for s in data["sources"] if s["id"] in q10["sources"]),
}
if not all(q10_primary_checks.values()):
    issues.append("Q10 primary source scope check failed: "+str(q10_primary_checks))
# Check only the new first-party references; do not rerun global link/technical gates.
for fact in data["certifyme"]:
    if fact["url"].startswith("/") and not emitted(fact["url"]):
        issues.append("New comparison reference is unresolved: "+fact["url"])

report={"observed_on":"2026-10-04",
        "method":"Agent-authored local retrieval/answer-support benchmark against built pages and dated primary-source records. PASS assesses supported bounded answers, not ChatGPT/Perplexity citation, ranking, actual product operation or independent assurance.",
        "live_answer_engine_experiment_performed":False,"external_model_answers_collected":False,
        "question10_primary_checks":q10_primary_checks,
        "counts":dict(Counter(q["status"] for q in answers)),"questions":answers}
(OUT / "ai-answer-test.json").write_text(json.dumps(report,indent=2))
result={"phase":"competitor evidence and answer readiness only","comparisons":comparison_checks,
        "authorities":coverage,"entity_definitions":len(entities),"answer_counts":report["counts"],
        "issues":issues,"status":"PASS_LOCAL_WITH_EVIDENCE_LIMITS" if not issues else "FAIL"}
(OUT / "phase4-validation.json").write_text(json.dumps(result,indent=2))
print(json.dumps({k:v for k,v in result.items() if k not in ["comparisons","authorities"]},indent=2))
raise SystemExit(1 if issues else 0)