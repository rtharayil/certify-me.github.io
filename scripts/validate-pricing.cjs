#!/usr/bin/env node
"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const { chromium, devices } = require("playwright");
const { visibleLabelContrast } = require("./lib/visible-label-contrast.cjs");

const base = process.env.PRICING_TEST_BASE_URL || `https://${process.env.REPLIT_DEV_DOMAIN}`;
const data = JSON.parse(execFileSync("ruby", ["-rjson", "-ryaml", "-e",
  'puts JSON.generate(YAML.load_file("_data/pricing_features.yml"))'], { encoding: "utf8" }));
assert(!fs.existsSync("_data/pricing.yml"), "Do not maintain a second pricing data source");
const normalize = text => text.trim().replace(/\s+/g, " ");
const temp = fs.mkdtempSync(path.join(os.tmpdir(), "pricing-browser-"));
const profiles = [320, 390, 768, 1024, 1440, 1920].map(width => ({
  name: `${width}px`, viewport: { width, height: 1000 },
}));
profiles.push({ name: "iPhone touch", ...devices["iPhone 13"] });

assert.deepEqual(data.plans.map(p => p.name), ["Essentials", "Professional", "Enterprise"]);
assert.deepEqual(data.comparison.map(c => c.category), [
  "Credential Creation and Design", "Issuance and Delivery", "Credential Lifecycle Management",
  "Verification and Trust", "Standards and Interoperability", "Branding and Learner Experience",
  "Administrators, Projects and Departments", "Analytics and Reporting",
  "APIs, Automation and Integrations", "Skills Taxonomy Mapping",
  "Comprehensive Learner Record and SkillStory", "Workforce Intelligence and Job Engine",
  "Security, Privacy and Institutional Assurance", "Implementation, Support and Services",
], "Preserve the master specification's complete A–N category structure");
assert(data.comparison.every(category => category.rows.length > 0), "Each category needs feature rows");
assert.equal(data.faqs.length, 18);
const featureCount = data.comparison.reduce((total, category) => total + category.rows.length, 0);
assert(featureCount > 0);
const features = data.comparison.flatMap(category => category.rows);
assert.equal(new Set(features.map(row => row.feature)).size, featureCount, "No duplicate comparison labels");
const creation = data.comparison.find(category => category.category === "Credential Creation and Design");
const approvedCreation = [
  ["Digital certificates", "Included", "Included", "Included"],
  ["Digital badges", "Included", "Included", "Included"],
  ["Stackable micro-credentials", "Not included", "Included", "Included"],
  ["Learning paths", "Not included", "Included", "Included"],
  ["Showcase directory", "Not included", "Included", "Included"],
  ["Credential templates", "3", "10", "Contract-defined"],
  ["Template creation and editing", "Included", "Included", "Included"],
  ["Credential preview", "Included", "Included", "Included"],
  ["Custom attributes and credential data fields", "Included", "Included", "Included"],
  ["Upload existing credential designs", "Included", "Included", "Included"],
  ["Credential design options", "Included", "Included", "Included"],
  ["Badge template library", "Included", "Included", "Included"],
  ["Certificate template library", "Included", "Included", "Included"],
  ["Achievement metadata", "Not included", "Included", "Included"],
  ["Issuer details", "Included", "Included", "Included"],
  ["Credential evidence", "Not included", "Not included", "Included"],
  ["Credential design integrations", "Not included", "Not included",
    "Available, subject to agreed integration scope"],
];
assert.deepEqual(creation.rows.map(row => [row.feature, ...data.plans.map(plan => {
  const value = row[plan.key];
  return value.startsWith("capacity.") ? plan.capacity[value.slice(9)] : value;
})]), approvedCreation, "Preserve all seventeen approved creation/design rows and unchanged central template limits");
assert(!features.some(row => row.feature === "Micro-credentials"), "Rename micro-credentials without a duplicate row");
const templateRow = creation.rows.find(row => row.feature === "Credential templates");
for (const plan of data.plans)
  assert.equal(templateRow[plan.key], "capacity.templates", "Keep template counts connected to the single capacity source");
const creationFaq = data.faqs.find(faq => faq.question === "How many templates and administrators are included?");
assert.match(creationFaq.answer, /library access does not increase the plan's template limit/);
assert.match(creationFaq.answer, /Stackable micro-credentials, learning paths, showcase directory and achievement metadata start with Professional/);
assert.match(creationFaq.answer, /Credential evidence is Enterprise-only/);
assert.match(creationFaq.answer, /credential design integrations are available only with Enterprise, subject to agreed integration scope/);
const lifecycle = data.comparison.find(category => category.category === "Credential Lifecycle Management");
const approvedLifecycle = [
  ["View and retrieve issued records", "Included", "Included", "Included"],
  ["Correct / edit credentials", "Included", "Included", "Included"],
  ["Revoke credentials", "Not included", "Included", "Included"],
  ["Delete credentials", "Included", "Included", "Included"],
  ["Bulk deletion of credentials", "Not included", "Included", "Included"],
  ["Bulk modification or reissuance of credentials", "Not included", "Included", "Included"],
  ["Regenerate individual credential images", "Included", "Included", "Included"],
  ["Bulk regeneration of credential images", "Not included", "Included", "Included"],
  ["Set and manage expiry", "Included", "Included", "Included"],
  ["Current credential status checks", "Included", "Included", "Included"],
  ["Export credential information", "Basic export", "Advanced export", "Advanced export"],
  ["Lifecycle history and audit records", "Not included", "Optional paid add-on",
    "Included, subject to agreed audit and retention scope"],
];
assert.deepEqual(lifecycle.rows.map(row => [row.feature, ...data.plans.map(plan => row[plan.key])]),
  approvedLifecycle, "Preserve the twelve explicitly approved lifecycle rows; do not invent rows to meet the brief's inconsistent count");
const auditFaq = data.faqs.find(faq => faq.question === "Does CertifyMe provide forensic audit logs?");
assert.match(auditFaq.answer, /Administrative audit trails and credential lifecycle history are distinct from forensic audit logging/);
assert.match(auditFaq.answer, /Professional includes basic administrative audit trails/);
assert.match(auditFaq.answer, /optional paid add-on for Professional/);
assert.match(auditFaq.answer, /included with Enterprise subject to agreed audit and retention scope/);
assert.match(auditFaq.answer, /does not grant other Enterprise entitlements/);
const verification = data.comparison.find(category => category.category === "Verification and Trust");
const approvedVerification = [
  ["QR-code entry and lookup", "Included — record lookup", "Included — record lookup", "Included — record lookup"],
  ["Unique credential ID lookup", "Included — record lookup", "Included — record lookup", "Included — record lookup"],
  ["Smart ID tagging", "Not included", "Available", "Available"],
  ["OTP-based verification", "Not included", "Available", "Available"],
  ["Signed PDF integrity verification", "Not included", "Supported signed configuration",
    "Available, subject to agreed signed configuration"],
  ["Structured credential proof verification", "Not included",
    "Available for supported proof formats and verifiers", "Available for supported proof formats and verifiers"],
  ["Open Badges 3.0 verification", "Not included", "Available", "Available"],
  ["Issuer and recipient information", "Available", "Available", "Available"],
  ["Expiry verification", "Available", "Available", "Available"],
  ["Revocation verification", "Available", "Available", "Available"],
  ["Public verification pages", "Standard CertifyMe experience", "Standard CertifyMe experience",
    "Available, subject to agreed branding governance"],
  ["Verification widget", "Not included", "Available", "Available, subject to applicable configuration"],
];
assert.deepEqual(verification.rows.map(row => [row.feature, ...data.plans.map(plan => row[plan.key])]),
  approvedVerification, "Preserve all twelve approved verification rows, lookup/proof distinctions and configuration scopes");
assert.equal(features.filter(row => row.feature === "Open Badges 3.0 verification").length, 1);
const standards = data.comparison.find(category => category.category === "Standards and Interoperability");
const approvedStandards = [
  ["Open Badges", "Open Badges 2.1", "Open Badges 3.0", "Open Badges 3.0"],
  ["W3C Verifiable Credentials", "Not included", "Not included",
    "Supported, subject to the supported credential configuration"],
  ["CLR 2.0 exchange formats", "Not included", "Not included",
    "Available, subject to agreed CLR module and exchange-format scope"],
  ["Credential portability and exchange", "Available for supported compatible formats and receivers",
    "Available for supported compatible formats and receivers", "Available, subject to agreed exchange scope"],
  ["Receiving-platform compatibility", "Not included", "Not included",
    "Available, subject to agreed receiving-platform scope"],
];
assert.deepEqual(standards.rows.map(row => [row.feature, ...data.plans.map(plan => row[plan.key])]),
  approvedStandards, "Preserve all five approved standards, versions, plan boundaries and exchange scopes");
assert(!features.some(row => ["Open Badges 3.0", "CLR exchange formats"].includes(row.feature)),
  "Rename the standards rows without retaining duplicate or superseded labels");
const verificationFaq = data.faqs.find(faq => faq.question === "What does credential verification establish?");
assert.match(verificationFaq.answer, /Essentials uses Open Badges 2\.1; Professional and Enterprise use Open Badges 3\.0/);
assert.match(verificationFaq.answer, /W3C Verifiable Credentials and CLR 2\.0 exchange formats are Enterprise-only/);
assert.match(verificationFaq.answer, /agreed CLR module and exchange-format scope/);
assert.match(verificationFaq.answer, /portability remains available across all plans for supported compatible formats and receivers/);
assert.match(verificationFaq.answer, /not universal external acceptance/);
assert.match(verificationFaq.answer, /checking revocation status is not permission to revoke a credential/);
assert.match(verificationFaq.answer, /Essentials does not include revocation, while Professional and Enterprise do/);
assert.match(verificationFaq.answer, /they are not cryptographic proof/);
assert.match(verificationFaq.answer, /are not included in Essentials; they start with Professional/);
assert.match(verificationFaq.answer, /Enterprise signed PDF verification is subject to agreed signed configuration/);
assert.match(verificationFaq.answer, /verification widget is subject to applicable configuration/);
assert.match(verificationFaq.answer, /standard CertifyMe experience in Essentials and Professional/);
assert.match(verificationFaq.answer, /Verification page customization is a separate entitlement, subject to agreed contract scope/);
const branding = data.comparison.find(category => category.category === "Branding and Learner Experience");
const approvedBranding = [
  ["Credential page branding", "Not included", "Available", "Available"],
  ["Organization / institution pages", "Not included", "Not included", "Available"],
  ["Custom domains", "Not included", "Available", "Available"],
  ["White-label email", "Not included", "Available", "Available"],
  ["SMTP configuration", "Not included", "Available", "Available"],
  ["OAuth for email access", "Not included", "Not included", "Available"],
  ["Email customization", "Not included", "Available", "Available"],
  ["Navigation customization", "Not included", "Available", "Available"],
  ["Footer customization", "Not included", "Available", "Available"],
  ["Verification page customization", "Not included",
    "Available, subject to agreed contract scope", "Available, subject to agreed contract scope"],
  ["Custom URLs", "Not included", "Available", "Available"],
  ["Custom wallet", "Not included", "Not included", "Available"],
  ["Learner-facing wallet or profile", "Basic wallet/profile", "Basic wallet/profile",
    "Full SkillStory experience, subject to agreed Enterprise module scope"],
];
assert.deepEqual(branding.rows.map(row => [row.feature, ...data.plans.map(plan => row[plan.key])]),
  approvedBranding, "Preserve all thirteen approved branding, email and learner experience distinctions");
assert(!features.some(row => /Verification[- ]page branding/i.test(row.feature)),
  "Rename the verification customization feature without retaining the old row");
assert.equal(features.filter(row => row.feature === "OAuth for email access").length, 1);
assert(data.plans[0].bullets.includes("Basic learner wallet/profile, credential access and sharing."));
const brandingFaq = data.faqs.find(faq => faq.question === "Which plans include custom branding?");
assert.match(brandingFaq.answer, /subject to agreed contract scope/);
assert.match(brandingFaq.answer, /OAuth for email access, and custom learner wallets are Enterprise-only/);
assert.match(brandingFaq.answer, /Essentials and Professional include a basic learner-facing wallet\/profile/);
assert.match(brandingFaq.answer, /full SkillStory experience, subject to agreed Enterprise module scope/);
assert.match(brandingFaq.answer, /A custom domain does not automatically include every form of white labeling/);
const publicVerification = features.find(row => row.feature === "Public verification pages");
assert.deepEqual(data.plans.map(plan => publicVerification[plan.key]),
  ["Standard CertifyMe experience", "Standard CertifyMe experience", "Available, subject to agreed branding governance"],
  "Standard public verification availability must not be confused with contract-scoped page customization");
const administration = data.comparison.find(category => category.category === "Administrators, Projects and Departments");
const approvedAdministration = [
  ["Administrative accounts", "1", "2 per department", "Contract-defined"],
  ["Administrator invitations and management", "One administrator only", "Two administrators per department", "Contract-defined roles"],
  ["Role-based access", "Not included", "Department-scoped permissions", "Agreed institution-wide governance"],
  ["Projects", "2", "5", "Proposal-specific"],
  ["Project-level user assignment", "Not included", "Not included", "Available, subject to agreed project access scope"],
  ["Project-scoped permissions", "Not included", "Not included", "Available, subject to agreed project permission scope"],
  ["Folders", "Available", "Available", "Available"],
  ["Departments", "0", "1 included", "Contract-defined"],
  ["Additional departments", "Not available", "Paid recurring add-on", "Contract-defined"],
  ["Department management", "Not included", "Included department and purchased add-ons", "Agreed governance scope"],
  ["Department resource ownership", "No departments", "Authorized department resources", "Agreed governance scope"],
  ["Fine-grained department permissions", "No departments", "Department-scoped access", "Agreed governance scope"],
  ["Templates, records, reports and configuration access", "Single administrator",
    "Authorized department and project scope", "Agreed role and resource scope"],
  ["Department-scoped export access", "No departments", "Available for authorized resources", "Agreed role and export scope"],
  ["Cross-department / institution-wide administration", "Not available",
    "Not included; department add-ons do not grant it", "Available, subject to agreed institution-wide governance"],
];
assert.deepEqual(administration.rows.map(row => [row.feature, ...data.plans.map(plan => {
  const value = row[plan.key];
  return value.startsWith("capacity.") ? plan.capacity[value.slice(9)] : value;
})]), approvedAdministration, "Preserve all fifteen approved administration rows, scopes and existing counts");
assert(data.plans[1].bullets.includes("Fine-grained department permissions for authorized resources."));
assert(!/supported project permissions/i.test(JSON.stringify(data.plans)));
const departmentFaq = data.faqs.find(faq => faq.question === "Can departments manage their own projects?");
assert.match(departmentFaq.answer, /Project-level user assignment and project-scoped permissions are not included in Essentials or Professional/);
assert.match(departmentFaq.answer, /they do not grant cross-department or institution-wide administrative access/);
assert.match(departmentFaq.answer, /Folders are available across all three plans/);
const analytics = data.comparison.find(category => category.category === "Analytics and Reporting");
const approvedAnalytics = [
  ["Credential issuance reporting", "Available", "Available", "Available"],
  ["Credential views", "Available", "Available", "Available"],
  ["Download reporting", "Basic download reporting", "Advanced download reporting", "Advanced download reporting"],
  ["Social sharing and engagement", "Available", "Available", "Available"],
  ["Verification activity reporting", "Not included", "Available", "Available"],
  ["Template-level reporting", "Not included", "Available", "Available"],
  ["Project-level reporting", "Not included", "Available", "Available"],
  ["Reporting data export", "Not included", "Available", "Available"],
  ["Reporting API access", "Not included", "Not included", "Available"],
  ["Advanced analytics", "Not included", "Available", "Available"],
];
assert.deepEqual(analytics.rows.map(row => [row.feature, ...data.plans.map(plan => row[plan.key])]),
  approvedAnalytics, "Preserve all ten approved analytics/reporting boundaries and basic/advanced download distinction");
assert(data.plans[0].bullets.includes("Credential issuance, views, sharing, and basic download reporting."));
const apiAutomation = data.comparison.find(category => category.category === "APIs, Automation and Integrations");
const approvedApiAutomation = [
  ["Basic APIs", "Available", "Available", "Available"],
  ["Advanced APIs", "Not included", "Available", "Available"],
  ["Webhooks", "Not included", "Not included", "Available"],
  ["CSV data import", "Available", "Available", "Available"],
  ["Documented LMS connectors / plugins", "Not included", "Not included",
    "Available, subject to agreed connector and implementation scope"],
  ["Google Forms automation", "Not included", "Available", "Available, subject to applicable configuration"],
  ["Workflow automation / Zapier", "Not included", "Available", "Available, subject to applicable workflow scope"],
  ["SIS, HRIS and institutional integrations", "Not included", "Not included",
    "Available, subject to agreed integration scope"],
  ["Custom integrations or plugins", "Not included", "Not included", "Available, subject to agreed scope"],
];
assert.deepEqual(apiAutomation.rows.map(row => [row.feature, ...data.plans.map(plan => row[plan.key])]),
  approvedApiAutomation, "Preserve all nine approved API, automation and integration boundaries and qualifications");
const apiFaq = data.faqs.find(faq => faq.question === "Can CertifyMe integrate with our existing systems?");
assert.match(apiFaq.answer, /Basic APIs and CSV data import are available across all three plans/);
assert.match(apiFaq.answer, /CSV import supporting issuance-import workflows/);
assert.match(apiFaq.answer, /Advanced APIs are available from Professional onward/);
assert.match(apiFaq.answer, /Reporting API access is a separate feature available only with Enterprise/);
assert.match(apiFaq.answer, /available only with Enterprise/);
const automationFaq = data.faqs.find(faq => faq.question === "Are all integrations ready-to-enable native connectors?");
assert.match(automationFaq.answer, /Google Forms automation and workflow automation through Zapier are available from Professional onward/);
assert.match(automationFaq.answer, /subject to applicable configuration/);
assert.match(automationFaq.answer, /subject to applicable workflow scope/);
assert.match(automationFaq.answer, /does not mean every platform or workflow is automatically configured/);
const taxonomy = data.comparison.find(category => category.category === "Skills Taxonomy Mapping");
const approvedTaxonomy = [
  ["Institution-defined skills and outcomes", "Available", "Available", "Available"],
  ["Credential-to-skill relationships", "Not included", "Not included", "Available, subject to agreed module scope"],
  ["ESCO, O*NET and institutional framework mapping", "Not included", "Available, subject to reviewed mapping scope",
    "Available, subject to agreed framework and mapping scope"],
  ["Institutional review and approval of mappings", "Not included", "Not included",
    "Available, subject to agreed review responsibilities"],
  ["Evidence and provenance for skill relationships", "Not included", "Not included",
    "Available, subject to agreed evidence scope"],
  ["Reuse of reviewed skill mappings", "Not included", "Not included", "Available, subject to agreed mapping scope"],
];
assert.deepEqual(taxonomy.rows.map(row => [row.feature, ...data.plans.map(plan => row[plan.key])]),
  approvedTaxonomy, "Preserve the six approved taxonomy feature values and scope qualifications");
assert.match(data.solutions.note, /Institution-defined skills and outcomes are available across all plans/);
const taxonomySolution = data.solutions.cards.find(card => card.title === "Skills Taxonomy Mapping");
assert.match(taxonomySolution.description, /mapping starts with Professional, subject to reviewed mapping scope/);
assert.match(taxonomySolution.description, /Defining skills and outcomes does not automatically include these mapping capabilities/);
const taxonomyFaq = data.faqs.find(faq => faq.question === "Are Skills Taxonomy Mapping and Comprehensive Learner Records included?");
assert.match(taxonomyFaq.answer, /Institution-defined skills and outcomes are available across all three plans/);
assert.match(taxonomyFaq.answer, /mapping is available from Professional, subject to reviewed mapping scope/);
assert.match(taxonomyFaq.answer, /Institution-defined skills and outcomes do not automatically include these capabilities/);
const learnerRecord = data.comparison.find(category => category.category === "Comprehensive Learner Record and SkillStory");
const approvedLearnerRecord = [
  ["Connected record of achievements and learning", "Available, subject to agreed module scope"],
  ["CLR creation", "Available, subject to agreed module scope"],
  ["CLR display", "Available, subject to agreed module scope"],
  ["Learner-record sharing", "Available, subject to agreed sharing scope"],
  ["Achievement evidence and provenance", "Available, subject to agreed learner-record scope"],
  ["Skill Passport", "Available, subject to agreed module scope"],
  ["Transcript-management connections", "Available, subject to agreed integration scope"],
].map(([feature, enterprise]) => [feature, "Not included", "Not included", enterprise]);
assert.deepEqual(learnerRecord.rows.map(row => [row.feature, ...data.plans.map(plan => row[plan.key])]),
  approvedLearnerRecord, "Preserve all seven Enterprise-only CLR/SkillStory features and their agreed scopes");
const exchangeFormats = features.find(row => row.feature === "CLR 2.0 exchange formats");
assert.deepEqual(data.plans.map(plan => exchangeFormats[plan.key]),
  ["Not included", "Not included", "Available, subject to agreed CLR module and exchange-format scope"],
  "The related exchange-format reference must not imply CLR access in Essentials or Professional");
const learnerRecordFaq = data.faqs.find(faq => faq.question === "Are Skills Taxonomy Mapping and Comprehensive Learner Records included?");
assert.match(learnerRecordFaq.answer, /are not included in Essentials or Professional/);
assert.match(learnerRecordFaq.answer, /Basic recipient credential wallets and access to issued credentials are separate capabilities; their existing plan scope is unchanged/);
const passportSolution = data.solutions.cards.find(card => card.title === "Skill Passport and Transcript Management");
assert.match(passportSolution.description, /Skill Passport is available only with Enterprise, subject to agreed module scope/);
assert.match(passportSolution.description, /Transcript-management connections are available only with Enterprise, subject to agreed integration scope/);
assert.match(passportSolution.description, /separate from a basic recipient credential wallet or access to an issued credential/);
assert(!/Skill Passport[^.]*optional add-on/.test(JSON.stringify(data)),
  "Do not restore the superseded Professional/Enterprise Skill Passport add-on");
const workforce = data.comparison.find(category => category.category === "Workforce Intelligence and Job Engine");
const approvedWorkforce = [
  ["Job and occupation context", "Not included", "Available, subject to module scope",
    "Available, subject to agreed module and source scope"],
  ["Employer and location context", "Not included", "Available, subject to module scope",
    "Available, subject to agreed source scope"],
  ["Reviewed skill and taxonomy enrichment", "Not included", "Available, subject to module scope",
    "Available, subject to agreed enrichment scope"],
  ["Workforce demand and programme relevance", "Not included", "Available, subject to module scope",
    "Available, subject to agreed intelligence scope"],
  ["Career and opportunity insights", "Available", "Available", "Available"],
  ["Job-provider connections", "Not included", "Available, subject to provider and implementation scope",
    "Available, subject to agreed provider and implementation scope"],
];
assert.deepEqual(workforce.rows.map(row => [row.feature, ...data.plans.map(plan => row[plan.key])]),
  approvedWorkforce, "Preserve the six approved Workforce Intelligence and Job Engine feature values");
assert.match(data.solutions.note, /Career and opportunity insights are available across all plans/);
const workforceSolution = data.solutions.cards.find(card => card.title === "Workforce Intelligence");
assert.match(workforceSolution.description, /Career and opportunity insights are available across all plans/);
assert.match(workforceSolution.description, /features start with Professional, subject to the applicable module, source, provider and implementation scope/);
assert.match(workforceSolution.description, /Enterprise scope is agreed/);
assert.match(workforceSolution.description, /does not mean unlimited access/);
const support = data.comparison.find(category => category.category === "Implementation, Support and Services");
const approvedSupport = [
  ["Self-service documentation", "Available", "Available", "Available"],
  ["Email support", "Available", "Available", "Available"],
  ["Onboarding", "Self-onboarding through online videos", "Standard onboarding", "White-glove onboarding"],
  ["Administrator training", "Online administrator training videos",
    "One 45-minute, one-to-one online administrator training session included", "Advanced administrator training"],
  ["Advanced training", "Not included", "Not included", "Available"],
  ["Credential consultation", "Not included", "Not included", "Available"],
  ["Discovery and requirements definition", "Not included", "Not included", "Available"],
  ["Migration", "Not included", "Not included", "Available, subject to agreed migration scope"],
  ["Integration implementation", "Not included", "Not included", "Available"],
  ["Testing and user acceptance", "Not included", "Not included", "Available"],
  ["Go-live assistance", "Not included", "Not included", "Available"],
  ["Dedicated account management", "Not included", "Available", "Available"],
  ["Service-level escalation", "Not included", "Not included", "Available"],
];
assert.deepEqual(support.rows.map(row => [row.feature, ...data.plans.map(plan => row[plan.key])]),
  approvedSupport, "Preserve the explicitly approved implementation, training and support matrix");
const supportFaq = data.faqs.find(faq => faq.question === "What implementation and support can be arranged?");
assert.match(supportFaq.answer, /documentation and email support are available across all plans/);
assert.match(supportFaq.answer, /one 45-minute, one-to-one online administrator training session/);
assert.match(supportFaq.answer, /Enterprise migration support is subject to the agreed migration scope/);
assert.match(supportFaq.answer, /Service-level escalation is available only with Enterprise/);
assert(!features.some(row => row.feature === "Advanced training / credential consultation"),
  "Advanced training and credential consultation must be separate, non-duplicated features");
const security = data.comparison.find(category => category.category === "Security, Privacy and Institutional Assurance");
const approvedSecurity = [
  ["Data encryption in transit and at rest", "Included", "Included", "Included"],
  ["Credential data security controls", "Standard credential data security controls",
    "Standard credential data security controls", "Custom credential data governance controls, as agreed"],
  ["Single sign-on", "Not included", "Not included", "Available"],
  ["Multi-factor authentication", "Not included", "Included", "Included"],
  ["Backup arrangements", "No plan-specific backup commitment", "No plan-specific backup commitment",
    "Defined by the agreed plan and contract"],
  ["Recovery arrangements", "No plan-specific recovery commitment", "No plan-specific recovery commitment",
    "Defined by the agreed plan and contract"],
  ["Administrative audit trails", "Not included as a plan-specific audit-trail feature",
    "Basic administrative audit trails", "Advanced administrative audit trails"],
  ["Vulnerability-management evidence", "Not included", "Not included", "Available"],
  ["Penetration-test documentation", "Not included", "Not included", "Available"],
  ["Security questionnaire and procurement support", "Not included", "Not included", "Available"],
  ["DPA and contractual privacy terms", "Standard DPA and contractual privacy terms",
    "Standard DPA and contractual privacy terms", "Customizable DPA and contractual privacy terms, subject to agreement"],
  ["Data residency", "APAC region only", "APAC, EU, or US",
    "Location agreed contractually, subject to technical feasibility, applicable law and commercial approval"],
  ["Dedicated deployment", "Not included", "Not included", "Available, subject to agreed scope and configuration"],
  ["Retention and exit arrangements", "No customized plan-specific retention or exit arrangement",
    "No customized plan-specific retention or exit arrangement",
    "Data retention, export and exit arrangements defined contractually"],
];
assert.deepEqual(security.rows.map(row => [row.feature, ...data.plans.map(plan => row[plan.key])]),
  approvedSecurity, "Preserve all fourteen approved security/privacy rows, qualifications and plan boundaries");
const securityFaq = data.faqs.find(faq => faq.question === "What security information can we review?");
assert.match(securityFaq.answer, /Encryption in transit and at rest is included with all plans/);
assert.match(securityFaq.answer, /SSO is available only with Enterprise; MFA is included with Professional and Enterprise, not Essentials/);
assert.match(securityFaq.answer, /does not remove standard data rights/);
const hostingFaq = data.faqs.find(faq => faq.question === "Can we arrange dedicated hosting or data residency?");
assert.match(hostingFaq.answer, /Essentials hosts data in the APAC region only/);
assert.match(hostingFaq.answer, /Professional offers hosting options in APAC, EU, or US/);
assert.match(hostingFaq.answer, /subject to technical feasibility, applicable law and commercial approval/);
assert.match(data.security_clarifier, /not the presence or absence of underlying platform practices/);
assert.match(data.security_clarifier, /customers' standard data rights/);
for (const category of data.comparison)
  for (const source of category.evidence) assert(fs.existsSync(source), `Missing capability evidence: ${source}`);
assert.deepEqual(data.plans[0].capacity, {
  credentials: "No limit", recipients: "From 250 onwards", templates: "3",
  administrators: "1", departments: "0", projects: "2",
});
assert.equal(data.plans[1].capacity.templates, "10");
assert.equal(data.plans[1].capacity.departments, "1 included");
assert.equal(data.plans[1].capacity.administrators, "2 per department");
assert.equal(data.plans[1].capacity.projects, "5");
assert.equal(data.plans[2].capacity.projects, "Proposal-specific");
for (const category of data.comparison) {
  for (const row of category.rows) {
    for (const plan of data.plans) assert.equal(typeof row[plan.key], "string");
  }
}
for (const file of ["_data/pricing_features.yml",
  "_includes/V4NewLook/pricing/departments.html"]) {
  assert(!/[$€£₹]\s*\d|\b(?:USD|INR|EUR|GBP)\s*\d/i.test(fs.readFileSync(file, "utf8")),
    `${file}: owner does not approve publishing monetary prices`);
}
for (const source of ["whitelabel-credentials.md", "Admin-Roles.md",
  "_includes/V4NewLook/pricing/banner.html"]) {
  assert(!/free\s*5|5\s*free|it's free|pre-register/i.test(fs.readFileSync(source, "utf8")),
    `${source}: rejected trial offer or signup destination remains`);
}
for (const [feature, expected] of [
  ["Additional departments", ["Not available", "Paid recurring add-on", "Contract-defined"]],
  ["Department management", ["Not included", "Included department and purchased add-ons", "Agreed governance scope"]],
  ["Credential page branding", ["Not included", "Available", "Available"]],
]) {
  const row = features.find(row => row.feature === feature);
  assert.deepEqual(data.plans.map(plan => row[plan.key]), expected, `${feature}: approved plan boundary`);
}
assert.equal(data.solutions.cards.length, 4);
for (const plan of data.plans) assert.equal(plan.capacity.recipients, "From 250 onwards");
assert.match(data.faqs[0].answer, /All CertifyMe plans start from a minimum of 250 students per year/);
assert(!/From 500|From 1,000|500 students|1,000 students/.test(JSON.stringify(data)),
  "Superseded student minimums must not remain in pricing data or FAQs");
for (const plan of data.plans.slice(0, 2)) assert.equal(plan.capacity.credentials, "No limit");
const skillPassport = data.comparison.flatMap(category => category.rows).find(row => row.feature === "Skill Passport");
assert.deepEqual([skillPassport.essentials, skillPassport.professional, skillPassport.enterprise],
  ["Not included", "Not included", "Available, subject to agreed module scope"]);
for (const feature of ["Custom domains", "White-label email"]) {
  const row = data.comparison.flatMap(category => category.rows).find(row => row.feature === feature);
  assert.deepEqual([row.essentials, row.professional, row.enterprise], ["Not included", "Available", "Available"]);
}
for (const plan of data.plans) {
  assert.equal(plan.bullets.length, 6);
  assert(!Object.hasOwn(plan, "entitlements"), "Detailed capabilities must have one source: pricing_features.yml");
  assert(plan.commercial_approval_status);
}
for (const file of ["pricing.md", "_layouts/V4Layoutpricing.html", "assets4/css/pricing.css"]) {
  assert(!/5,000|25,000|50,000/.test(fs.readFileSync(file, "utf8")),
    `${file}: proposed limits must be maintained only in central data`);
}

async function checkGeometry(root, profile) {
  const failures = await root.evaluate(element => {
    const width = window.innerWidth;
    const failures = [];
    for (const node of element.querySelectorAll("h1,h2,h3,p,li,summary,a,.pricing-capacity__row,td")) {
      if (node.closest("thead")) continue;
      const rect = node.getBoundingClientRect();
      if (!rect.width || !rect.height || getComputedStyle(node).visibility === "hidden") continue;
      if (rect.left < -1 || rect.right > width + 1) failures.push(node.textContent.trim());
      const range = document.createRange();
      range.selectNodeContents(node);
      for (const line of range.getClientRects()) {
        if (line.width > 1 && (line.left < -1 || line.right > width + 1))
          failures.push(`text: ${node.textContent.trim()}`);
      }
    }
    return failures;
  });
  assert.deepEqual(failures, [], `${profile}: clipped material information`);
}

async function run() {
  const browser = await chromium.launch({
    executablePath: execFileSync("which", ["chromium"], { encoding: "utf8" }).trim(),
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
    env: { ...process.env, XDG_CONFIG_HOME: temp, XDG_CACHE_HOME: temp },
  });
  try {
    for (const { name, ...options } of profiles) {
      const context = await browser.newContext({ ...options, reducedMotion: "reduce" });
      const page = await context.newPage();
      await page.addInitScript(() => {
        window.__pricingLayoutShift = 0;
        if (PerformanceObserver.supportedEntryTypes.includes("layout-shift")) {
          new PerformanceObserver(list => {
            for (const entry of list.getEntries())
              if (!entry.hadRecentInput) window.__pricingLayoutShift += entry.value;
          }).observe({ type: "layout-shift", buffered: true });
        }
      });
      const errors = [];
      page.on("pageerror", error => errors.push(error.message));
      const response = await page.goto(`${base}/pricing`, { waitUntil: "load" });
      assert.equal(response.status(), 200);
      assert.match(response.headers()["content-type"], /text\/html/);
      await page.evaluate(() => document.fonts.ready);
      if (name === "1440px") {
        const lab = await page.evaluate(() => {
          const navigation = performance.getEntriesByType("navigation")[0];
          return {
            domContentLoadedMs: Math.round(navigation.domContentLoadedEventEnd),
            loadMs: Math.round(navigation.loadEventEnd),
            observedInitialLayoutShift: window.__pricingLayoutShift,
            resources: performance.getEntriesByType("resource").length,
          };
        });
        console.log(`LAB desktop initial navigation (not field CWV): ${JSON.stringify(lab)}`);
      }
      const root = page.locator("main#main-content");
      assert(await page.evaluate(() => {
        const intro = document.querySelector(".pricing-plan-intro .pricing-eyebrow").getBoundingClientRect();
        const headers = [...document.querySelectorAll("#header .wsmobileheader,#header .wsmainfull")]
          .map(e => e.getBoundingClientRect()).filter(r => r.width > 1 && r.height > 1 && r.top < 2);
        return headers.every(r => intro.top >= r.bottom);
      }), `${name}: fixed navigation obscures plan introduction`);
      assert.equal(await page.locator("h1").count(), 1);
      assert.equal(await root.locator("h1").innerText(),
        data.hero.heading);
      assert.equal(await root.locator(".pricing-hero").count(), 0, "No separate hero above the plans");
      assert.equal(await root.locator("section").first().getAttribute("class"), "pricing-plan-intro");
      assert.equal(await root.locator(".pricing-plan-intro .pricing-eyebrow").innerText(),
        data.hero.eyebrow.toUpperCase());
      assert.equal(await root.locator(".pricing-plan-intro .pricing-lead").innerText(),
        data.hero.copy);
      assert.equal(await root.locator(".pricing-plan-intro .pricing-btn--quiet").innerText(), "Explore Platform Capabilities");
      for (const selector of [".pricing-plan-intro", ".pricing-final"])
        assert.equal(await root.locator(`${selector} .pricing-btn--quiet`).getAttribute("href"), "/platform-overview");
      assert.deepEqual(await root.locator(".pricing-model__item h3").allTextContents(),
        ["Annual credential volume", "Recipient population", "Administrative users and organizational scope"]);
      assert(await root.evaluate(element => {
        const selectors = [".pricing-plan-intro", ".pricing-plans", ".pricing-guidance", ".pricing-model",
          ".pricing-category", ".pricing-departments", ".pricing-solutions", ".pricing-enterprise",
          ".pricing-trust", ".pricing-faq", ".pricing-final"];
        const nodes = selectors.map(selector => element.querySelector(selector));
        return nodes.every((node, i) => node && (!i ||
          (nodes[i - 1].compareDocumentPosition(node) & Node.DOCUMENT_POSITION_FOLLOWING)));
      }), `${name}: required page section order`);
      assert.equal(await page.title(), "CertifyMe Pricing | Digital Credential Platform for Institutions");
      assert.equal(await page.locator('meta[name="description"]').getAttribute("content"),
        "Explore CertifyMe plans for digital credential issuance, institutional administration, verification, integrations, and enterprise credential management.");
      assert.equal(await page.locator('link[rel="canonical"]').getAttribute("href"),
        "https://www.certifyme.online/pricing");
      assert.equal(await page.locator('meta[property="og:url"]').getAttribute("content"),
        "https://www.certifyme.online/pricing");
      assert.match(await root.evaluate(e => getComputedStyle(e).fontFamily), /Source Sans 3/);
      assert.equal(await root.locator(".pricing-btn").first().evaluate(e =>
        getComputedStyle(e).backgroundColor), "rgb(79, 70, 229)");

      const cards = root.locator(".pricing-card");
      assert.equal(await cards.count(), 3);
      assert.deepEqual(await cards.locator("h3").allTextContents(), data.plans.map(p => p.name));
      assert.equal(await root.locator(".pricing-card--recommended h3").innerText(), "Professional");
      for (let i = 0; i < data.plans.length; i++) {
        const plan = data.plans[i], card = cards.nth(i);
        assert.equal(normalize(await card.locator(".pricing-card__headline").innerText()), plan.headline);
        assert.equal(normalize(await card.locator(".pricing-card__description").innerText()), plan.description);
        assert.deepEqual(await card.locator(".pricing-capacity__row strong").allTextContents(),
          Object.values(plan.capacity));
        assert.deepEqual(await card.locator(".pricing-card__list li").allTextContents(), plan.bullets);
        assert.equal(await card.locator(".pricing-btn").innerText(), plan.cta);
        assert.equal(await card.locator(".pricing-btn").getAttribute("href"), plan.href);
        assert.equal(await card.locator(".pricing-card__note").innerText(), plan.note);
        const disclosure = card.locator(".pricing-plan-details");
        const summary = disclosure.locator(":scope > summary");
        await summary.focus();
        await summary.press("Enter");
        assert(await disclosure.evaluate(e => e.open));
        assert.deepEqual(await disclosure.locator(".pricing-plan-category > summary").allTextContents(),
          data.comparison.map(category => category.category));
        assert.deepEqual((await disclosure.locator("li").allTextContents()).map(normalize),
          features.map(row => {
            const value = row[plan.key];
            const resolved = value.startsWith("capacity.") ? plan.capacity[value.slice(9)] : value;
            assert(resolved, `${plan.name}: unresolved feature value for ${row.feature}`);
            return `${row.feature}: ${resolved}`;
          }), `${name}: ${plan.name} details must match pricing_features.yml`);
         for (const group of [disclosure.locator(".pricing-plan-category").first(),
           disclosure.locator(".pricing-plan-category").nth(data.comparison.indexOf(taxonomy)),
           disclosure.locator(".pricing-plan-category").nth(data.comparison.indexOf(learnerRecord)),
           disclosure.locator(".pricing-plan-category").nth(data.comparison.indexOf(workforce)),
           disclosure.locator(".pricing-plan-category").nth(data.comparison.indexOf(security)),
          disclosure.locator(".pricing-plan-category").last()]) {
          const groupSummary = group.locator(":scope > summary");
          await groupSummary.focus(); await groupSummary.press("Enter");
          assert(await group.evaluate(e => e.open));
          assert(await group.locator("li").first().isVisible());
          await checkGeometry(group, `${name}: ${plan.name} detailed category`);
          await groupSummary.press("Space");
          assert(!(await group.evaluate(e => e.open)));
        }
        await summary.press("Space");
        assert(!(await disclosure.evaluate(e => e.open)));
      }
      const note = await cards.first().locator(".pricing-card__note").innerText();
      assert.equal(note, data.plans[0].note);
       assert.equal(normalize(await root.locator(".pricing-model__clarifier").last().innerText()),
         data.security_clarifier, "The security clarification must also come from pricing_features.yml");
      for (const card of await cards.all())
        assert.equal(await card.locator(".pricing-capacity__row span").nth(1).innerText(), "Students per year");
      const boxes = await cards.evaluateAll(nodes => nodes.map(e => {
        const r = e.getBoundingClientRect(); return { x: r.x, y: r.y, bottom: r.bottom };
      }));
      if (options.viewport.width >= 981) {
        assert(Math.max(...boxes.map(b => b.y)) - Math.min(...boxes.map(b => b.y)) < 2);
        for (const selector of [".pricing-capacity", ".pricing-card__list", ".pricing-card__bottom"]) {
          const tops = await cards.locator(selector).evaluateAll(nodes => nodes.map(e => e.getBoundingClientRect().top));
          assert(Math.max(...tops) - Math.min(...tops) < 3, `${name}: ${selector} alignment`);
        }
      } else {
        assert(boxes[1].y >= boxes[0].bottom && boxes[2].y >= boxes[1].bottom);
      }

      const categories = root.locator(".pricing-category");
      assert.equal(await categories.count(), 14);
      for (let i = 0; i < data.comparison.length; i++) {
        const category = categories.nth(i), summary = category.locator("summary");
        assert.equal(await summary.innerText(), data.comparison[i].category);
        if (!(await category.evaluate(e => e.open))) {
          await summary.focus(); await summary.press("Enter");
        }
        assert(await category.evaluate(e => e.open));
        const rows = category.locator("tbody tr");
        assert.equal(await rows.count(), data.comparison[i].rows.length);
        for (let j = 0; j < data.comparison[i].rows.length; j++) {
          const expected = data.comparison[i].rows[j], cells = rows.nth(j).locator("td");
          const values = data.plans.map(plan => {
            const value = expected[plan.key];
            return value.startsWith("capacity.") ? plan.capacity[value.slice(9)] : value;
          });
          assert.deepEqual((await cells.allTextContents()).map(normalize), [expected.feature, ...values]);
          assert.deepEqual(await cells.all().then(nodes => Promise.all(nodes.slice(1).map(n => n.getAttribute("data-plan")))),
            data.plans.map(p => p.name));
          for (const cell of await cells.all()) assert(await cell.isVisible(), `${name}: hidden comparison cell`);
        }
        await summary.press("Space");
        assert(!(await category.evaluate(e => e.open)));
        await summary.press("Enter");
      }
      assert.equal(await root.locator(".pricing-matrix tbody tr").count(), featureCount);
      assert.equal(await root.locator(".editorial-table-scroll,.editorial-table-hint").count(), 0,
        "Stacked comparisons must not receive the legacy horizontal-scroll treatment");
      const faqs = root.locator(".pricing-faq");
      assert.equal(await faqs.count(), data.faqs.length);
      for (let i = 0; i < data.faqs.length; i++) {
        const faq = faqs.nth(i), summary = faq.locator("summary");
        assert.equal(await summary.innerText(), data.faqs[i].question);
        await summary.focus(); await summary.press("Enter");
        assert(await faq.evaluate(e => e.open));
        assert.equal(await faq.locator(".pricing-faq__answer").innerText(), data.faqs[i].answer);
      }
      assert.equal(await root.locator(".pricing-solution").count(), 4);
      for (let i = 0; i < data.solutions.cards.length; i++) {
        const solution = data.solutions.cards[i], card = root.locator(".pricing-solution").nth(i);
        assert.equal(await card.locator(".pricing-eyebrow").textContent(), solution.title);
        assert.equal(await card.locator("p:not(.pricing-eyebrow)").innerText(), solution.description);
        assert.equal(await card.locator("a").first().getAttribute("href"), solution.href);
        if (solution.transcript_href)
          assert.equal(await card.locator("a").nth(1).getAttribute("href"), "/solutions/transcript-management");
      }
      assert.equal(await root.locator(".pricing-enterprise__list li").count(), 6);
      assert.equal(await root.locator(".pricing-guidance__item").count(), 6);
      assert.match(await root.locator(".pricing-departments").innerText(), /paid recurring add-ons/);
      assert.match(await root.locator(".pricing-departments").innerText(), /zero departments/);
      assert.match(await root.locator(".pricing-departments").innerText(), /does not grant institution-wide administration/);
      assert.match(await root.locator(".pricing-trust").innerText(), /Lookup is not cryptographic proof/);
      for (const href of await root.locator('a[href^="#"]').evaluateAll(nodes => nodes.map(node => node.getAttribute("href"))))
        assert.equal(await root.locator(`[id="${href.slice(1)}"]`).count(), 1, `${name}: missing in-page target ${href}`);
      for (const selector of [".pricing-model", ".pricing-guidance", ".pricing-departments",
        ".pricing-solutions", ".pricing-enterprise", ".pricing-trust", ".pricing-final"])
        assert(await root.locator(selector).isVisible());
      const publicText = await root.innerText();
      // Allow only this explicit denial; still reject any unlimited-access promise elsewhere.
      const entitlementClaims = normalize(publicText).replace(
        "availability does not mean unlimited access to every data source, job provider or advanced intelligence capability.",
        "availability remains scope-qualified.");
      assert(!/unlimited|StartUp|Signature plans?|pending|commercial_approval|approved_at|backend enforcement|Up to 2\b|Up to 10\b|Up to 25\b|\$\s*\d|save \d+%|free trial/i.test(entitlementClaims));
      assert.match(publicText, /not automatically included in core plans/);
      assert.match(publicText, /Skill Passport is available only with Enterprise, subject to agreed module scope/);
      assert.match(publicText, /These broader learner-record capabilities are separate from a basic recipient credential wallet or access to an issued credential/);
      assert.match(publicText, /Recipients and administrative users are different/);
      const schema = (await page.locator('script[type="application/ld+json"]').allTextContents())
        .map(text => JSON.parse(text));
      const schemaText = JSON.stringify(schema);
      assert(!/"offers"|"price"|"aggregateRating"|"Review"/.test(schemaText));
      assert(schemaText.includes("https://www.certifyme.online/pricing#webpage"));
      assert.equal(await page.locator('header').count(), 1);
      assert.equal(await page.locator('footer').count(), 1);
      const plansLink = page.locator('#wsmenu-main a[href="/pricing"]');
      assert.equal((await plansLink.textContent()).trim(), "Plans");
      assert(await page.locator('script[src*="googletagmanager"],iframe[src*="googletagmanager"]').count() > 0);
      const contrast = (await root.evaluate(visibleLabelContrast))
        .filter(row => !row.provisional && row.ratio < row.required);
      assert.deepEqual(contrast, [], `${name}: contrast`);
      await checkGeometry(root, name);
      assert(await page.evaluate(() =>
        Math.max(document.body.scrollWidth, document.documentElement.scrollWidth) <= innerWidth + 1));
      for (const link of await root.locator(".pricing-btn").all()) {
        await link.focus(); await page.keyboard.press("Tab"); await page.keyboard.press("Shift+Tab");
        assert(await link.evaluate(e => document.activeElement === e));
        assert(await link.evaluate(e => getComputedStyle(e).outlineStyle !== "none"));
        await link.hover();
        assert.deepEqual((await link.evaluate(visibleLabelContrast)).filter(r => !r.provisional && r.ratio < r.required), []);
      }
      assert.deepEqual(errors, []);
      const menuToggle = page.locator("#wsnavtoggle");
      if (await menuToggle.isVisible()) {
        await menuToggle.click();
        assert.equal(await menuToggle.getAttribute("aria-expanded"), "true");
        await plansLink.waitFor({ state: "visible" });
        await menuToggle.click();
        assert.equal(await menuToggle.getAttribute("aria-expanded"), "false");
      }
      console.log(`PASS ${name}: approved displayed limits, three plans, all ${featureCount} feature rows in 14 categories and ${data.faqs.length} FAQs, department add-ons, trust, keyboard disclosures, contrast, geometry, metadata and safeguards`);
      await context.close();
    }

    const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
    const page = await context.newPage();
    let pricingContent;
    for (const route of ["/pricing", "/pricing.html"]) {
      assert.equal((await page.goto(`${base}${route}`)).status(), 200);
      assert.equal(await page.locator('link[rel="canonical"]').getAttribute("href"), "https://www.certifyme.online/pricing");
      const content = await page.locator("main").innerHTML();
      if (pricingContent === undefined) pricingContent = content;
      else assert.equal(content, pricingContent, "Both pricing routes must render identical content");
      await page.locator(".pricing-category").nth(3).locator("summary").click();
      assert(await page.locator(".pricing-category").nth(3).locator("table").isVisible());
    }
    const routes = new Set();
    for (const href of await page.locator("main a").evaluateAll(nodes => nodes.map(a => a.getAttribute("href"))))
      if (href.startsWith("/")) routes.add(href);
    for (const route of routes) assert.equal((await context.request.get(`${base}${route}`)).status(), 200, route);
    for (const route of ["/_data/pricing.yml",
      "/_data/pricing_features.yml", "/docs/pricing-implementation.md",
      "/attached_assets/Pasted--MASTER-IMPLEMENTATION-SPECIFICATION-CERTIFYME-PRICING-_1791951522551.txt",
      "/attached_assets/Pasted--CERTIFYME-PRICING-PAGE-COMPLETE-REDESIGN-YOUR-ROLE-You_1791603707613.txt",
      "/attached_assets/Pasted--CERTIFYME-PRICING-PAGE-FINAL-CORRECTIVE-IMPLEMENTATION_1791618233581.txt"])
      assert.equal((await context.request.get(`${base}${route}`)).status(), 404, `${route}: private input exposed`);
    const sitemap = await (await context.request.get(`${base}/sitemap.xml`)).text();
    assert.equal((sitemap.match(/<loc>[^<]*\/pricing(?:\.html)?<\/loc>/g) || []).length, 1);
    for (const route of ["/solutions/skill-passport", "/transcript-management", "/skills-taxonomy-mapping", "/"]) {
      assert.equal((await page.goto(`${base}${route}`)).status(), 200);
      assert.equal(await page.locator('link[rel="canonical"]').getAttribute("href"), `https://www.certifyme.online${route}`);
    }
    assert.equal((await page.goto(`${base}/whitelabel-credentials.html`)).status(), 200);
    const brandingText = await page.locator("body").textContent();
    assert(!/Signature plans?/.test(brandingText));
    assert.match(brandingText, /Supported custom branding, custom domain and email start with Professional/);
    assert(!/free\s*5\s*credentials|5\s*free\s*credentials/i.test(brandingText));
    assert.equal((await page.goto(`${base}/Admin-Roles.html`)).status(), 200);
    const adminText = await page.locator("body").textContent();
    assert(!/free\s*5\s*credentials|5\s*free\s*credentials|it's free/i.test(adminText));
    const adminDemo = page.locator("#banner-1 a.btn");
    assert.equal(await adminDemo.getAttribute("href"), "https://info.certifyme.online/request-demo");
    console.log("PASS both pricing routes, one indexable canonical, no-JS disclosures, linked solutions, private exclusions and unchanged unrelated canonicals");
    await context.close();
  } finally {
    await browser.close();
    fs.rmSync(temp, { recursive: true, force: true });
  }
}
run().catch(error => { console.error(error); process.exitCode = 1; });
