#!/usr/bin/env python3
"""Compile existing curated authority copy into a scoped answer/citation corpus."""
import json
import re
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT / ".local/reports/competitor-ai-seo"
briefs=json.loads((ROOT / "_data/ai_authority_briefs.json").read_text())
editorial={a["id"]:a for a in json.loads((ROOT / "_data/authority_editorial.json").read_text())}
evidence=json.loads((ROOT / "_data/competitor_evidence.json").read_text())
sources={s["id"]:s for s in evidence["sources"]}
names={
    "infrastructure":"digital credential infrastructure", "open-badges":"Open Badges 3.0",
    "verifiable-credentials":"W3C Verifiable Credentials", "skills":"skills taxonomy mapping",
    "learner-records":"a Comprehensive Learner Record", "workforce":"institutional workforce intelligence",
    "higher-education":"university digital credentials", "security":"credential-platform security",
    "verification":"digital credential verification", "comparisons":"an institutional platform comparison",
}
authorities=[]
for b in briefs:
    count=len(re.findall(r"\b[\w*-]+\b",b["lead"]))
    if not 100 <= count <= 150:
        raise SystemExit(f"Lead outside the specified window: {b['id']} ({count})")
    existing=editorial.get(b["id"])
    values={
        "definition":existing["definition"] if existing else b["definition"],
        "why":existing["problem"] if existing else b["why"],
        "how":existing["how"] if existing else b["how"],
        "implementation":b["implementation"],
        "standards":existing["standards"] if existing else b["standards"],
        "difference":b["difference"],
        "when":existing["use_case"] if existing else b["when"],
        "limitations":existing["limitation"] if existing else b["limitations"],
    }
    # The current specifications are context, not proof of native integrations or all versions.
    if b["id"]=="verifiable-credentials":
        values["standards"]="W3C publishes the Verifiable Credentials data model, including v2.0. Open Badges 3.0 and CLR 2.0 apply achievement-specific profiles. Each product's supported profile determines its model version and proof mechanism."
    questions=[
        ("definition",f"What is {names[b['id']]}?"),
        ("why",f"Why does {names[b['id']]} matter?"),
        ("how",f"How does {names[b['id']]} work?"),
        ("implementation",f"How does CertifyMe implement {names[b['id']]}?"),
        ("standards","What standards apply?"),
        ("difference","How is this different from the related concept?"),
        ("when","When should an institution use this?"),
        ("limitations","What are the limitations?"),
    ]
    authorities.append(b | {
        "answers":[{"category":k,"question":q,"answer":values[k]} for k,q in questions],
        "references":[sources[id] for id in b["sources"]],
        "lead_word_count":count, "editorial_date":"2026-10-05",
    })
(ROOT / "_data/ai_authority.json").write_text(json.dumps(authorities,indent=2,ensure_ascii=False)+"\n")
(OUT / "authority-answer-coverage.json").write_text(json.dumps(authorities,indent=2))
print(json.dumps({"major_authorities":len(authorities),"structured_answers":sum(len(a["answers"]) for a in authorities),"lead_words":{a["id"]:a["lead_word_count"] for a in authorities}},indent=2))