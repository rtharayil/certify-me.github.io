#!/usr/bin/env node
// Build deliverables from the completed validation reports, without editing site content.
const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const { chromium } = require("playwright");
const OUT = path.resolve(".local/reports/enterprise-seo");
const read = name => JSON.parse(fs.readFileSync(path.join(OUT, name), "utf8"));
const escape = value => String(value ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const scores = [
  ["Information Architecture", 8, "Ten topic clusters and six existing authority destinations are connected; URLs were preserved. Some legacy blog-parent assignments remain title-based editorial triage."],
  ["Technical SEO", 8, "369 sitemap documents have matching emitted canonicals and live-preview HTTP checks. Strategic crawling exclusions are correct. Published-host redirect behaviour and Google indexing remain unverified."],
  ["On-page SEO", 7.5, "All 17 priority pages satisfy the metadata and single-H1 gate. Two utility-page defects and two historical duplicate-metadata groups remain."],
  ["Internal Linking", 8, "Six authority destinations, higher education, comparison and trust hubs have incoming main-content links. Counts include repeated contextual modules, not independently assessed editorial endorsements."],
  ["Content Quality", 7, "W3C authority content, institutional implementation guidance and approved case evidence were improved. The 83-blog estate has not received a complete article-by-article rewrite."],
  ["Institutional SEO", 9, "Institutional infrastructure leads the main positioning; higher education is strongest without excluding certification bodies, enterprise, government and training providers. Governance and buyer roles are explicit."],
  ["Higher Education SEO", 8.5, "Registrars, academic teams, CIOs and career services have coherent routes into credentials, standards, skills, CLR and workforce evidence. Engagement is not represented as job-placement success."],
  ["Entity SEO", 8, "Company positioning, standards vocabulary and governed claim sources are aligned across priority pages. No Google Knowledge Panel or search-engine entity recognition was demonstrated."],
  ["AI SEO / AEO", 7.5, "28 intent destinations and 12 answer questions were tested against fresh DOM content. Manual competitor-answer confidence remains partial; term presence is not proof of AI citations or ranking."],
  ["Schema", 7, "Priority JSON-LD and visible FAQ checks pass; unsupported integration FAQ markup and individual five-star review values were removed. Five legacy FAQ/answer mismatches remain."],
  ["Trust / Evidence", 8, "Owner-approved figures, anonymous case outcomes, dated G2 observations and scoped security evidence are used. Independent ISO status checks and a revised signed SOC opinion were not obtained."],
  ["Conversion SEO", 7.5, "Priority pages retain visible actions and institutional rollout links. External lead forms were not submitted, analytics delivery was not tested and conversion uplift was not measured."],
  ["Mobile SEO", 8.5, "Independent browser checks cover six widths; comparison tables pass their separate 390px scroll/focus test. Mobile menu and native FAQ interactions were checked, but not every legacy dialog."],
  ["Page Speed", 5, "Production Core Web Vitals and Lighthouse evidence are unavailable. Local navigation timings are not field performance; multiple reused image components still lack reserved dimensions. This is a provisional readiness score, not a measured speed score."],
  ["Overall", 7.5, "Critical/high priority gates pass and the institutional story is coherent. Medium legacy work, production indexing, performance and end-to-end conversion checks remain explicitly open."],
];
const answers = [
  ["PASS", "Institutional digital credential infrastructure connecting governed issuance, verification, skills, learner records and workforce information."],
  ["PASS", "Institutions first; universities are the strongest vertical, alongside certification bodies, enterprise, government and training providers."],
  ["PASS", "An issuer's digital record of an achievement, with subject, criteria/evidence and applicable proof and status information."],
  ["PASS", "Issuer-role Open Badges 3.0 certification is distinguished from broader implementation and receiver interoperability; the 1EdTech registry is linked."],
  ["PASS", "Check proof, issuer authority, dates and applicable status resources. QR codes are access paths, not proof; verification can still depend on issuer resources."],
  ["PASS", "Institutions review relationships between learning outcomes, achievement evidence and skills; ESCO, O*NET and local frameworks are reference vocabularies, not automatic proof of competence."],
  ["PASS", "An institution-governed connected achievement record preserving provenance; it complements rather than automatically replaces transcripts and SIS records."],
  ["PASS", "Reviewed skills are related to occupations and separately sourced labour-market information. Owner-approved coverage is 20 million live jobs, 50,000 companies worldwide, refreshed every two weeks."],
  ["PASS", "The documented scope includes governance, standards-based proof, lifecycle/status, skills and connected records, rather than only the creation of a certificate image."],
  ["PARTIAL", "The hub connects explicit provider-specific guides and the CertifyMe institutional scope is stated. A fully reliable vendor-by-vendor answer still requires current primary-source checks of the comparative feature claims; naming competitors alone is not a pass."],
  ["PASS", "Support governed achievements, verifiable credentials, reviewed capabilities and connected records for registrars, academic leaders and career services; workforce relevance is not an employment guarantee."],
  ["PASS", "Enterprise SSO/MFA, scoped SOC 2 Type II attestation, distinct ISO management-system scopes and contractual residency discussions are described. Protocols, default regional isolation and universal legal compliance are not inferred."],
];
function table(headers, rows) {
  return `<table><thead><tr>${headers.map(h => `<th>${escape(h)}</th>`).join("")}</tr></thead><tbody>${rows.map(row => `<tr>${row.map(v => `<td>${escape(v)}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
}
function describeFile(file) {
  if (file.includes("Understanding-W3C")) return ["Refresh the existing W3C authority article with factual model/proof boundaries and institutional decisions.", "Correct technical positioning without changing its URL.", "Authority and answer clarity", "Moderate: substantial content revision"];
  if (file === "security.md") return ["Publish reviewed security/privacy scopes and procurement guidance at the existing trust URL.", "Replace generic assurance with approved evidence boundaries.", "Trust and CIO intent", "Moderate: assurance wording"];
  if (file.includes("integrations/head")) return ["Remove hidden/unmatched FAQ claims from integration JSON-LD.", "Schema must not assert unsupported setup promises absent from the displayed answer.", "Schema truthfulness", "Low: markup-only"];
  if (file === "robots.txt") return ["Align named AI crawlers with private/demo exclusions; keep strategic pages allowed.", "Avoid inconsistent crawler access and private upload discovery.", "Crawl control", "Moderate: site-wide policy"];
  if (file.includes("job-intelligence") || file.includes("What-is-a-Digital-Credential.md") || file.includes("vs-")) return ["Correct approved CertifyMe job-data coverage/refresh wording or stale comparison references.", "20 million jobs, 50,000 companies worldwide, refresh every two weeks; do not invent geography.", "Factual topical/comparison clarity", "Low–moderate: factual copy"];
  if (file.includes("Stats") || file.includes("trustbar") || file.includes("trust-banner") || file.includes("G2Enterprise") || file.includes("apiIntegrationsBanner") || file.includes("HigherEd/security")) return ["Align shared scale, recognition or security wording with approved claim sources.", "Keep metric definitions and certification scopes distinct.", "Entity and trust consistency", "Moderate: shared component"];
  if (file.includes("head.html") || file === "index.md" || file === "platform-overview.html") return ["Align institutional metadata/schema and remove unsupported markup details where applicable.", "Match the visible institutional story and evidence; preserve brand/routes.", "Entity, on-page and schema clarity", "Moderate: metadata/shared output"];
  if (file.startsWith("_layouts/")) return ["Connect reviewed institutional context or case content to the existing layout; opt in to body rendering where required.", "Expose intended content without activating unused legacy body/schema blocks.", "Architecture and contextual links", "Moderate: shared rendering"];
  if (file === "case-studies.md") return ["Add three anonymous owner-approved case summaries.", "Publish useful evidence without exposing customer identities or raw pictures.", "Trust and institutional evaluation", "Moderate: evidence/privacy"];
  if (["skills-taxonomy-mapping.html", "comprehensive-learner-record.html", "workforce-intelligence.html", "compare.md"].includes(file)) return ["Connect the existing authority/hub to institutional implementation and related concepts.", "Clarify governed relationships, buyer decisions and useful next actions.", "Topic architecture and conversion", "Low–moderate: additive content"];
  return ["Correct a stale internal destination, duplicate metadata or authority flag as reflected in the diff.", "Preserve the existing URL while connecting accurate institutional content.", "Link/on-page quality", "Low: targeted edit"];
}
async function main() {
  const r1 = read("round-1/structural.json"), r2 = read("round-2/adversarial.json");
  if (r1.status !== "PASS" || r2.status !== "PASS") throw new Error("Do not produce a successful final deliverable before both priority gates pass.");
  const changed = execFileSync("git", ["diff", "--name-only"], { encoding: "utf8" }).trim().split("\n").filter(f => f && !f.startsWith(".agents/"));
  const created = execFileSync("git", ["ls-files", "--others", "--exclude-standard"], { encoding: "utf8" }).trim().split("\n").filter(f => f && !f.startsWith("attached_assets/") && !f.startsWith(".agents/"));
  const duplicateIssues = Object.entries(r1.duplicates).flatMap(([kind, groups]) => Object.entries(groups).map(([value, urls]) => ({
    severity: "medium", urls, problem: `Duplicate ${kind}: ${value}`, why: "Historical pages are less distinguishable in search results.",
    recommendedFix: "Review the historical intent and traffic before changing copy or consolidating; preserve URLs and use page-specific metadata.",
    implemented: false, validation: "Detected in generated HTML; intentionally not consolidated.",
  })));
  const openIssues = r1.issues.map(i => ({
    severity: i.severity, urls: [i.url], problem: i.issue, details: i.details || [],
    why: i.issue.includes("FAQ") ? "Structured answers do not fully correspond to the displayed questions/answers." : "Search and accessibility semantics are incomplete on utility/demo pages.",
    recommendedFix: i.issue.includes("FAQ") ? "Align the script with reviewed visible FAQ data, or remove the unsupported FAQ markup; do not manufacture answers." : "Review utility intent, then add the correct description/H1 or explicitly decide indexation; do not blindly noindex.",
    implemented: false, validation: "Detected by the whole-sitemap structural inventory; outside the cleared priority gate.",
  })).concat(duplicateIssues);
  const imageCount = r1.pages.filter(p => p.priority).reduce((sum, p) => sum + p.images_missing_dimensions, 0);
  openIssues.push(
    { severity: "medium", urls: ["_includes/V4NewLook/", "_layouts/"], problem: `${imageCount} priority-page image elements lack width/height attributes; reused components are counted repeatedly.`, why: "Unreserved image layout can contribute to layout shifts.", recommendedFix: "Audit original aspect ratios and reserve image space without changing uploaded art or cropping.", implemented: false, validation: "Static attribute inventory only; actual production CLS unknown." },
    { severity: "medium", urls: ["_blog/", "_integrations/", ".local/reports/enterprise-seo/claim-review-register.csv"], problem: "Legacy claims and title-based topic classification still need editorial review.", why: "Repository presence does not independently establish historical promises, native connectors or current competitor capabilities.", recommendedFix: "Review high-traffic pages against owner approvals and current primary sources before rewriting/consolidating.", implemented: false, validation: "Baseline candidate register is triage, not an approved-claims list." },
    { severity: "medium", urls: ["/compare/", "_blog/certifyme-vs-*-2026-comparison.md"], problem: "Manual AI competitor-answer test remains PARTIAL.", why: "A trustworthy detailed comparison needs current provider-by-provider evidence, not only competitor names.", recommendedFix: "Verify comparison dimensions against dated primary vendor documentation; mark unknowns rather than infer absence.", implemented: false, validation: "Automated term test passes; stricter manual judgment is PARTIAL." },
    { severity: "medium", urls: ["Published website / Search Console"], problem: "Production indexing, redirects and Core Web Vitals are unknown.", why: "A working preview does not prove Google indexation, search performance or field speed.", recommendedFix: "After publishing, check the actual public host, URL Inspection, sitemap discovery and field performance.", implemented: false, validation: "Not independently verified in this environment." },
    { severity: "low", urls: ["https://info.certifyme.online/request-demo", "Analytics configuration"], problem: "Lead submission and analytics event delivery were not tested end to end.", why: "A visible action and retained destination do not prove a received lead or recorded conversion.", recommendedFix: "Use an agreed test lead and verify delivery and consent-aware analytics without polluting production reporting.", implemented: false, validation: "Destinations/scripts retained; no external form submitted; layout tests suppressed analytics traffic." }
  );
  const issueRegister = { critical: [], high: [], medium: openIssues.filter(i => i.severity === "medium"), low: openIssues.filter(i => i.severity === "low"), scope: "No unresolved critical/high issue detected by the delivered priority validation methods; this is not a certification of every historical claim or external service." };
  const manualAnswers = r2.answers.map((a, i) => ({ question: a.question, source: a.route, automatedStatus: a.status, manualStatus: answers[i][0], answer: answers[i][1], independentEvidence: a.evidence }));
  const manualReview = {
    answers: manualAnswers,
    personas: [
      ["Googlebot", "PASS", "Sitemap, matching canonicals, crawler exclusions and all preview HTTP destinations checked; real Googlebot crawl/indexing unknown."],
      ["Google Search", "PARTIAL", "Primary purpose is clear and 28 destinations mapped; historical overlaps and actual search selection need traffic/index evidence."],
      ["ChatGPT", "PASS WITH LIMITS", "Core entity and conceptual relationships are explicit; no live ChatGPT retrieval/citation experiment was performed."],
      ["University CIO", "PASS", "Security, enterprise authentication, residency negotiation, API, integration and standards paths are connected; contractual specifics remain procurement questions."],
      ["University Dean", "PASS", "Learning outcomes → assessed evidence → credentials → reviewed skills → learner records → market information are explained."],
      ["Registrar", "PASS", "Issuance lifecycle, issuer authority/status and CLR-versus-transcript boundaries are described."],
      ["Career Services", "PASS", "Skills and opportunities support career work; graduate employment needs separate outcome measurement."],
      ["Search competitor", "PARTIAL", "Comparison guides are connected, but current third-party feature evidence is not exhaustively reverified."],
    ],
    disclaimer: "Manual conclusions are an engineering/content review, not an actual search-engine ranking or an independent third-party certification.",
  };
  fs.writeFileSync(path.join(OUT, "scorecard.json"), JSON.stringify({ reviewedOn: "2026-10-04", scale: "0–10 engineering readiness judgments; not measured ranking", categories: scores.map(([category, score, reasons]) => ({ category, score, reasons })) }, null, 2));
  fs.writeFileSync(path.join(OUT, "final-issue-register.json"), JSON.stringify(issueRegister, null, 2));
  fs.writeFileSync(path.join(OUT, "round-2/manual-review.json"), JSON.stringify(manualReview, null, 2));
  fs.writeFileSync(path.join(OUT, "change-log.json"), JSON.stringify({ modified: changed.map(file => { const [change, reason, seoImpact, risk] = describeFile(file); return { file, change, reason, seoImpact, risk }; }), created: created.map(file => ({ file, purpose: file.startsWith("_data/") ? "Governed claims/topic configuration" : file.startsWith("_includes/") ? "Contextual institutional/topic content" : "Validation/report generation", publicURL: "None — support file, not a new public route" })), urlChanges: [], urlsDeleted: [], redirectsAdded: [] }, null, 2));
  const priorityLinks = r1.pages.filter(p => p.priority).map(p => [new URL(p.url).pathname, p.incoming_pages.length, p.images_missing_alt, p.images_missing_dimensions]);
  const safetyRows = [
    ["Existing pages/URLs", "PASS", "No page file deletion or route renaming introduced; no new public content routes or mass redirects."],
    ["Strategic indexation/canonicals", "PASS", "Priority noindex/crawler and canonical gates pass; actual Google indexing is UNKNOWN."],
    ["Sitemap and crawler policy", "PASS", "369 emitted URLs; private/demo exclusions shared by named bots; private-upload regression suite passes."],
    ["Priority navigation and links", "PASS WITH SCOPE", "Main-content destination checks pass; mobile menu works. Not every historical demo/navigation link was manually clicked."],
    ["Company/customer/statistical claims", "PASS FOR IMPLEMENTED CLAIMS", "Use the owner-approved registry and anonymous evidence; the baseline legacy candidate register is not blanket approval."],
    ["Certification/reviews", "PASS FOR IMPLEMENTED CLAIMS", "Scoped Type II terminology and ISO purposes retained; unsupported individual five-star schema values removed. No new fake reviews/certifications."],
    ["Competitor information", "PARTIAL", "Targeted false/stale own-company metrics corrected; full current vendor-feature verification remains open."],
    ["Keyword stuffing/doorway pages", "PASS", "Existing routes reused and concepts linked; no automatic keyword-only pages created."],
    ["Mobile/desktop", "PASS FOR TESTED ROUTES", `${r2.layouts.length} browser checks; six widths on priority pages; separate focusable scrollable comparison-table test passes.`],
    ["Core interactions", "PASS WITH SCOPE", "Native FAQ open/close and mobile-menu opening pass; no application/backend changes. Not every historical modal was exercised."],
    ["Forms and CTAs", "PARTIAL", "Visible priority CTAs retained; external form submission and lead delivery unverified."],
    ["Analytics", "UNVERIFIED", "Scripts retained; analytics/ad traffic blocked only in layout tests. Event collection not tested."],
    ["Design language", "PASS WITH SCOPE", "Existing typography, layouts, brand, art and actions retained; homepage mobile screenshot inspected. No redesign undertaken."],
  ];
  const issueRows = openIssues.map(i => [i.severity.toUpperCase(), i.urls.join(" · "), i.problem, i.why, i.recommendedFix, "No", i.validation]);
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>CertifyMe SEO Implementation Scorecard</title><style>
    @page{size:A4;margin:17mm 14mm}*{box-sizing:border-box}body{font:10px/1.5 Arial,sans-serif;color:#17233b;margin:0}h1{font-size:28px;line-height:1.2;color:#181a55}h2{font-size:18px;color:#232461;margin-top:27px}h3{font-size:13px;margin-top:20px}p,li{orphans:3;widows:3}table{border-collapse:collapse;width:100%;margin:12px 0;font-size:9px;table-layout:fixed}th,td{border:1px solid #d8dce8;padding:6px;text-align:left;vertical-align:top;overflow-wrap:anywhere}th{background:#eef0f8}thead{display:table-header-group}tr{break-inside:avoid}.note{padding:13px;background:#eef0f8;border-left:3px solid #6562b7}.page{break-before:page}.eyebrow{letter-spacing:2px;color:#625e97;font-size:10px;text-transform:uppercase}a{color:#383598}.small{font-size:9px;color:#56617b}
    </style></head><body>
    <p class="eyebrow">CertifyMe · Enterprise SEO + AI SEO</p><h1>CERTIFYME SEO<br>IMPLEMENTATION SCORECARD</h1>
    <p>Final implementation review: 4 October 2026 · Approval/evidence observations: 3 October 2026</p>
    <p class="note"><strong>Digital Credential Infrastructure for Institutions.</strong><br>Institutions first; higher education strongest. Credentials → standards and proof → reviewed skills → connected learner records → workforce information.</p>
    <h2>1. Executive outcome</h2>
    <p><strong>P0/P1 implementation and both priority acceptance gates pass.</strong> This is not a claim that the entire historical estate is clean. ${r1.issues.length} medium structural issues, two historical duplicate-metadata groups and additional evidence/performance work remain. Changes are validated in preview and have not been published by the agent.</p>
    <ul><li>Existing URLs and brand/design preserved; no keyword-only routes or automatic consolidation.</li><li>Governed approved claims, ten topic clusters, institutional implementation context and blog parent links introduced.</li><li>W3C authority article refreshed at its original URL; existing OB3, skills, CLR and workforce destinations connected.</li><li>Trust content uses distinct SOC/ISO/GDPR scopes, enterprise SSO/MFA and contractual residency boundaries.</li><li>Three anonymous case summaries added; current job/G2/scale figures corrected with qualifiers and dates.</li><li>Critical/high defects found by the tests were fixed; unsupported integration FAQ JSON-LD removed.</li></ul>
    <h2>2. Required 15-category scorecard</h2>
    <p>Scores are conservative engineering/content-readiness judgments, not measured rankings, revenue or search traffic. No before/after numerical score is invented.</p>
    ${table(["Category", "Score / 10", "Factual reasons and limits"], scores.map(([name, score, reasons]) => [name, score.toFixed(1), reasons]))}
    <h2 class="page">3. Audit → plan → implement → Round 1 → fix → Round 2 → fix</h2>
    <p>Baseline: 369 marketing sitemap pages, 83 blog articles and 77 additional credential/demo documents inventoried; 27 sampled published URLs returned 200. Audit candidates, approved evidence and implementation are separate records. Prioritize the highest-impact institutional pages; do not consolidate old content without traffic/backlink information.</p>
    <h3>Round 1 — Structural Validation: ${escape(r1.status)}</h3>
    <p>Fresh generated HTML/XML/robots, not a reused baseline result. All ${r1.sitemap_count} sitemap documents inventoried; ${r1.priority_count} priority pages gated for metadata, H1, canonical, crawlability, main-content destinations, visible FAQ agreement and conversion actions. Current result: no critical/high issue; ${r1.issues.length} medium issues. Duplicate groups are reported separately. Alt/dimension counts are an inventory, not a claim that all images are optimized.</p>
    <p>Fixes included: null-safe schema inspection; consistent private/demo crawler policy; scoped shared content rendering; removal of mismatched integration FAQ markup; stale link repairs; approved metric/refresh wording; removal of unsupported per-review five-star values. Existing utility/demo intent and historical duplicates were not automatically changed.</p>
    <h3>Round 2 — Adversarial Validation: ${escape(r2.status)}</h3>
    <p>Independent serving-app HTTP requests and Chromium DOM checks; the script does not read Round 1's report. ${r2.sitemapResponses.length} sitemap destinations checked, all HTTP 200. ${r2.layouts.length} rendered checks; widths 320, 375, 390, 430, 768 and 1440. No detected page overflow greater than 2px, bad tested heading counts, malformed JSON-LD or completed broken main-content images. Lazy images not yet loaded are not proven by this check. Native FAQ open/close and mobile menu checks pass. The automated question test checks terms; the stricter manual result below is authoritative.</p>
    <p>Post-review fixes: reviewed-page-only body rendering avoids activating unused legacy scripts; graduate-employability wording clarifies outcome measurement; useful digital-badge/microcredential/analytics links added; micro-credentials/microcredentials orthography normalized in intent triage. Final reports reflect the recheck.</p>
    <h3>Additional regression verification</h3>
    <ul><li>Jekyll production build passes; running workflow restarted and healthy, with existing non-fatal Ruby/Bundler warnings.</li><li>Comparison structure validator passes. Seven comparison/alternative articles pass the separate 390px keyboard-focusable horizontal-table check.</li><li>Private-upload suite passes fresh/cached/incremental builds and cached/normal/symlinked startup cases; excluded upload routes return 404 and original uploads are preserved.</li><li>Mobile homepage screenshot inspected. No live external demo form submitted.</li></ul>
    ${table(["Persona", "Manual result", "What can/cannot be established"], manualReview.personas)}
    <h2 class="page">4. Search intent review — all 28 requested queries</h2>
    <p>Every requested query has an existing destination. The keyword-coverage status below is only mechanical triage. Canonical alternates and competing candidates require manual/traffic review; actual Google indexing is UNKNOWN for every query. No pages were created just to match keywords.</p>
    ${table(["Query", "Existing best route", "Term triage", "Incoming sampled pages", "Google indexing"], r2.intents.map(i => [i.query, i.bestPage, i.intentStatus, i.supportingIncomingPages.length, "UNKNOWN"]))}
    <p>Competing title/H1 candidates and excerpts are in <strong>round-2/adversarial.json</strong>. The sample incoming-link count is not the whole site's backlink count. Full generated main-content counts for priority pages:</p>
    ${table(["Priority route", "Incoming pages*", "Missing alt", "Missing dimensions"], priorityLinks)}
    <p class="small">*Includes repeated contextual modules. A link is not automatically a high-quality editorial endorsement. Missing dimensions count repeated elements, not unique image files.</p>
    <h2 class="page">5. AI answer test — manual interpretation</h2>
    <p>11 clear, site-supported answers; one PARTIAL comparison answer. All 12 pass the lighter automated term test, which does not override the manual finding. No actual ChatGPT citation/ranking experiment was claimed.</p>
    ${table(["Question", "Source route", "Manual status", "Extractable answer / limitation"], manualAnswers.map(a => [a.question, a.source, a.manualStatus, a.answer]))}
    <h2 class="page">6. Evidence and publication boundaries</h2>
    <ul><li>Company scale: 5K+ institutions, 1M+ learner wallets, global reach. Wallets are not automatically active users or issued credentials.</li><li>Job intelligence: owner-confirmed 20 million live jobs, 50,000 companies worldwide, every-two-week refresh and own job-framing engine; exact country totals and raw-source licensing are not independently established.</li><li>Case outcomes are owner-approved; customer names/raw case images not published. Estimated reach/adoption qualifiers retained; engagement is not employment.</li><li>G2 observations dated 3 October 2026: #2 by category G2 Score separately from #2 Easiest To Use; 4.8/5, 570 reviews. No new permanent Leader or LinkedIn global-ranking claim.</li><li>SOC 2 Type II examination period 1 February–30 April 2026, Security/Availability/Confidentiality. Owner answered the opinion-wording clarification; a revised signed opinion was not independently reviewed.</li><li>Five ISO certificates have distinct management-system purposes and printed expiries. Owner-confirmed surveillance/active status is not an independent registry check. GDPR policy is not certification.</li><li>Enterprise SSO/MFA and global hosting are owner-confirmed; protocols, on-premise/SIS availability, universal regional isolation and all residency commitments are not inferred.</li><li>Historical blog/integration claims remain review candidates, not automatically approved facts.</li></ul>
    <h2 class="page">7. Final issue register</h2>
    <p><strong>CRITICAL:</strong> none unresolved in the delivered validation scope.<br><strong>HIGH:</strong> none unresolved in the delivered validation scope.<br>These statements do not certify external services or every historical business claim.</p>
    ${table(["Severity", "URL / file", "Problem", "Why it matters", "Recommended fix", "Implemented?", "Validation"], issueRows)}
    <h2 class="page">8. Change log — files modified</h2>
    <p>Agent-memory housekeeping is excluded from the public website change log. Exact source diffs remain in the workspace/checkpoint.</p>
    ${table(["File", "Change", "Reason", "SEO impact", "Risk"], changed.map(file => [file, ...describeFile(file)]))}
    <h3>Files created</h3>
    ${table(["File", "Purpose", "Public URL"], created.map(file => [file, file.startsWith("_data/") ? "Approved claims / topic-cluster configuration" : file.startsWith("_includes/") ? "Institutional or blog-topic context" : "Validation/report generation", "None — support file"]))}
    <p>Generated deliverables: final-report.pdf/html, scorecard.json, final-issue-register.json, change-log.json, both round reports, final page inventory, manual adversarial review and downloadable validation bundle.</p>
    <h3>URL changes</h3>${table(["Old URL", "New URL", "Redirect", "Reason"], [["None", "None", "None added", "Existing authority/content routes retained."]])}
    <h2 class="page">9. Final safety checklist</h2>
    ${table(["Requirement", "Result", "Evidence / limitation"], safetyRows)}
    <h2>10. Recommended sequence after this delivery</h2>
    <ol><li>Review the approved preview and publish through the normal owner-controlled process.</li><li>Verify the published host, Search Console discovery/indexing, field performance, agreed test-lead delivery and consent-aware analytics.</li><li>Resolve the five legacy FAQ mismatches, two utility semantics and historical duplicate metadata without deleting valuable URLs.</li><li>Use traffic/backlink and current primary-source evidence to prioritize legacy editorial/competitor work and image layout-space fixes.</li></ol>
    <p class="small">Evidence records: audit-and-plan.md, evidence-analysis.md, approved_claims.yml, round-1/structural.json, round-1/page-inventory.csv, round-2/adversarial.json and round-2/manual-review.json. Private uploads are not included in the downloadable validation bundle.</p>
    </body></html>`;
  const htmlFile = path.join(OUT, "final-report.html");
  fs.writeFileSync(htmlFile, html);
  const browser = await chromium.launch({ executablePath: execFileSync("which", ["chromium"], { encoding: "utf8" }).trim(), headless: true, args: ["--no-sandbox"] });
  const page = await browser.newPage();
  await page.goto(`file://${htmlFile}`, { waitUntil: "load" });
  await page.pdf({ path: path.join(OUT, "final-report.pdf"), printBackground: true, preferCSSPageSize: true });
  await browser.close();
  console.log(JSON.stringify({ round1: r1.status, round2: r2.status, structuralMedium: r1.issues.length, manualAI: "11 PASS, 1 PARTIAL", overall: 7.5, filesModified: changed.length, filesCreated: created.length, pdf: path.join(OUT, "final-report.pdf") }, null, 2));
}
main().catch(e => { console.error(e); process.exitCode = 1; });