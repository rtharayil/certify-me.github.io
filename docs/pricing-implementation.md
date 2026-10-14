# Pricing specification implementation

## Scope and source

Implemented the owner's master pricing specification on the existing Jekyll marketing website. The uploaded specification is excluded from builds. This report is also excluded from builds.

The public comparison describes documented product capabilities and approved displayed plan rules. It is not an application entitlement configuration or proof of runtime enforcement.

The owner subsequently requests that pricing start with “Three plans. A clear path to scale.” The separate hero is removed; its original heading and message are reused in this opening plan section, with one H1, retained sales/platform actions and the plan cards directly below it.

`_data/pricing_features.yml` is now the single pricing data source. Its `plans` section contains card text, limits and actions; `comparison` contains categorized feature labels and per-plan values; `faqs`, `hero`, `solutions`, `enterprise` and `final` contain the related page data. The obsolete `_data/pricing.yml` is removed. Each “View [plan] capabilities” disclosure and the comparison use the same feature rows. `capacity.*` resolves to the central `plans[].capacity` in this same file, through one shared rendering include. Editing a central limit updates the card, detailed capabilities and comparison. Regression checks derive expected rows from the YAML rather than freezing the row count. An isolated mutation build verifies that future edits to card copy, limits, feature rows, introduction and FAQs reach the UI without modifying the actual source or preview output.

Completion checks exposed repeated concurrent-build collisions in `_site`, not pricing or contrast assertion failures. The comparison HTML validator and its mobile check now each build into a unique temporary output directory, removed after validation. This isolates their writes from the preview and contrast check without changing the site or skipping assertions.

## Website changes

- `_data/pricing_features.yml`, `plans`: approved Essentials limits (1 administrator, 2 projects, 3 templates, 0 departments, standard branding); Professional (2 administrators per department, 5 projects, 10 templates, 1 included department, recurring department add-ons, supported custom branding); Enterprise projects proposal-specific; revised plan descriptions and 18 FAQs.
- `_data/pricing_features.yml`: rebuilt from the owner-selected Master Implementation Specification, with 141 individually labelled rows across all 14 categories after separating advanced training from credential consultation in the owner's support update. References point to product documentation rather than the old pricing comparison. Unknown package assignments outside the approved support matrix remain explicitly subject to confirmation.
- `_layouts/V4Layoutpricing.html`: template capacity, plan anchors, comparison data source, and required section order.
- `_includes/V4NewLook/pricing/plan-guidance.html`: six institutional buyer groups without introducing new tiers.
- `_includes/V4NewLook/pricing/departments.html`: included department versus paid recurring add-ons and department-scoped access versus institution-wide governance.
- `_includes/V4NewLook/pricing/trust.html`: lookup/proof distinction and product, standards, integration, security, API, branding and role links.
- `assets4/css/pricing.css`: responsive additions in the existing brand and typography.
- `whitelabel-credentials.md`: replaced the legacy Signature plan reference and removed automatic custom-wallet/full-white-label implications.
- `_includes/V4NewLook/ourProductDetails.html`: removed the blanket promise that all named systems are native integrations included in every subscription.
- `scripts/validate-pricing.cjs`: approved displayed limits, inventory coverage, disclosures, mobile navigation, internal links, contrast, keyboard focus, geometry, canonical/schema safeguards, no-JavaScript routes, private exclusions and lab navigation measurements.
- `_config.yml`: excludes this implementation report from public builds.

The shared menu remains “Plans” linking to `/pricing`. The owner now approves a minimum of 250 students per year for all three plans, superseding the previous Essentials/Professional thresholds and Enterprise's “Custom” student label. Cards and the pricing FAQ use the new minimum. Canonical URL, analytics, sales CTAs and no credential limit for covered students remain unchanged. The later CLR/SkillStory correction supersedes the earlier Professional/Enterprise Skill Passport add-on: Skill Passport is now Enterprise-only, subject to agreed module scope.

## Entitlements and billing: blocked, not implemented

This repository is a static marketing site. It contains no credential-management backend, customer subscription database, department authorization service, recurring billing integration or approved add-on price configuration. No application entitlement, customer data, billing state, upgrade/downgrade behavior or migration was changed.

Required owner inputs:

1. Credential application's source/workspace and test environment.
2. Application configuration matching the owner-approved administrator and project allowances, plus other applicable quotas.
3. Existing department add-on billing mechanism, approved recurring price and billing interval.
4. Existing customer/grandfathering policy and contract-defined Enterprise configuration.
5. Confirmed feature-to-plan assignments for capabilities whose current website documentation establishes a capability but not its present package.

The earlier website's “Up to 2” Essentials administrators, “Up to 10” Professional departments, “Up to 10” Professional administrators and “Up to 3/25” projects were proposal metadata explicitly marked pending. The owner's rules supersede these: Essentials one administrator and two projects; Professional two administrators per department and five projects; Enterprise projects proposal-specific. This changes marketing disclosure only, not existing customer access.

Until the application is available, the following must remain **unverified**:

- Essentials cannot create a second administrator, fourth template or any department.
- Essentials cannot activate custom branding or department add-ons.
- Professional cannot create an eleventh template and starts with one included department.
- Additional departments require successful approved recurring billing.
- Department managers cannot read/change other departments' templates, issued records, reports, exports or configuration through UI or API.
- Upgrade/downgrade transitions preserve appropriate customer access, records and billing consistency.
- Enterprise entitlements match approved contract configuration.

## Capability evidence boundaries

Product-page and legacy feature inventories support the descriptive comparison; they do not establish live feature availability, modern tier assignments or runtime authorization. Conditional wording is deliberate.

No automatic reissue/replacement, mapping version-history controls, native integration with every named SIS/HRIS, guaranteed learner job matching/application flow, claim-activity reports, department-specific analytics, expiry/compliance report generator, workforce report export, specific CLR standard/version certification, integration monitoring, or universal forensic audit facility is advertised as a confirmed included feature. These could not be established sufficiently from this workspace. The page does not invent prices, overage rules, SLA response times, deployment guarantees or new certifications.

Foundational lookup and lifecycle access are not used as artificial upsell exclusions. QR/ID lookup, OTP/contact control, PDF integrity and structured credential proof are described distinctly. Issuer product certification does not certify every credential or deployment.

## Owner-confirmed website corrections

The subsequent “Pricing Page YAML Correction — Skills Taxonomy Mapping” approves all six existing taxonomy rows. Institution-defined skills and outcomes are available on every plan; ESCO/O*NET/institutional framework mapping starts with Professional, subject to reviewed mapping scope, with agreed Enterprise framework/mapping scope. The other four features are Enterprise-only with their specified qualifications. Updated values in place without changing labels, ordering, category or schema. Aligned only the taxonomy solution description, the shared availability note and the taxonomy portion of the existing skills/CLR FAQ. Defining institutional skills does not automatically include mapping, credential relationships, institutional approval workflows, evidence/provenance or reuse. The CLR portion of that FAQ and all other categories, commercial values and unrelated content remain unchanged. No new native integration, automatic mapping or certification claim was added.

The subsequent “Pricing Page YAML Correction — Comprehensive Learner Record and SkillStory” supersedes the earlier Skill Passport add-on rule. All seven existing category features are not included in Essentials or Professional and are available only with Enterprise, subject to their specified agreed module, sharing, learner-record or integration scopes. Updated values in place, preserving labels, category, order and schema. Corrected the related CLR exchange-format reference in Standards and Interoperability so it does not continue to imply a separate CLR module in Essentials/Professional; Enterprise format scope remains subject to agreement. Aligned the two related solution-card descriptions and the existing combined skills/CLR FAQ. The FAQ and Skill Passport card distinguish broader records from basic recipient credential wallets and access to issued credentials. Existing wallet/access/verification rows, other standards rows, other categories, limits, commercial terms and unrelated solution/FAQ content are unchanged. No backend entitlement was changed.

The subsequent “Pricing Page YAML Correction — Workforce Intelligence and Job Engine” approves the six existing workforce rows: career and opportunity insights are available on all plans; the other five features are not included in Essentials and are available from Professional with the specified scope qualifiers. Updated values in place, retaining feature labels, order, evidence references and schema. Adjusted only the related solution-card description and its shared availability note to make the all-plan insights exception explicit and retain agreed Enterprise scope/no unlimited source or provider access. Pricing limits, support/security matrices, other categories and all FAQs remain unchanged. This is website availability wording, not a new learner job-board flow or proof of application enforcement.

The subsequent “Pricing Page YAML Update — Security, Privacy & Institutional Assurance” approves all fourteen existing security/privacy rows. Updated only their plan values, three related pricing FAQs and the comparison's audit/security clarification. Preserved feature labels, category, ordering, schema, other categories and the previously approved support matrix. The clarification is in the same pricing YAML rather than another hardcoded configuration. No authentication, backup, encryption or deployment infrastructure was changed, and no new certification, recovery-time or other security guarantee was added.

### Legal and operational review of the security update

Reviewed `security.md`, the current terms and privacy-policy sources, and relevant data-security FAQs. No documented all-plan backup/recovery service commitment was found that conflicts with “no plan-specific commitment.” This label does not assert that baseline platform backups or recovery practices are absent. Existing public terms explicitly disclaim backup responsibility, place backup responsibility on customers, and allow deletion on subscription expiry or platform exit (`_includes/V4NewLook/TermsAndConditions.html`, “Data Deletion and Subscription Termination”). The owner must confirm any precedence/exception for the agreed Enterprise backup, recovery, retention and exit contract before relying on those arrangements; no legal term or signed contract was changed here. Signed DPAs and institution-specific contracts are not available in this repository, so their content cannot be verified.

The public privacy sources still refer to “Enterprise Plus” and EU onboarding in one GDPR-rights passage, while a subsequent passage states rights for every user (`PrivacyPolicy.html` and `_includes/V4NewLook/PrivacyPolicy.html`). These legacy legal-page labels need owner/legal reconciliation with the current three plans and standard privacy rights. They were not copied into pricing or changed outside the requested pricing scope. `security.md` describes global hosting as a platform capability with contractual residency, not unrestricted location entitlement for every plan; the approved pricing now displays each plan's specific region or contract scope.

The subsequent “Pricing Page YAML Update — Implementation, Training & Support” approves the support matrix. Updated the existing final-category rows in `_data/pricing_features.yml` without changing other categories, plan limits or prices. There are no explicit feature IDs in the existing schema; retained the category, existing row labels and sequence except separating the combined advanced-training/consultation row and narrowing the escalation label to avoid implying an exclusion of general email support. All thirteen services now have explicit values for each plan. The same YAML rows render the per-plan capability disclosures and desktop/mobile comparison. The existing support FAQ now explains the approved training/onboarding, account-manager, migration and escalation boundaries without promising response times or implementation durations. Its uploaded approval source remains excluded from builds.

The owner confirms Essentials has one administrator and two projects; Professional has two administrators per department and five projects; Enterprise project counts are proposal-specific. Cards, capacity summaries, comparison and FAQ draw from these values.

The owner directs that no pricing amounts appear on the page. Additional Professional departments remain paid recurring add-ons discussed through a proposal; no billing amount or interval has been invented.

The owner rejects both separate trial offers. Removed “Free 5 Credentials” from `whitelabel-credentials.md` and `Admin-Roles.md`, and converted the administrator page's shared free-signup banner into a sales-demo CTA without a signup destination or free-credential promise.

The owner selects the latest Master Implementation Specification and explicitly accepts leaving unspecified plan assignments subject to confirmation. The feature data is rebuilt around its A–N inventory, with design options, metadata, expiry versus revocation, receiving-platform compatibility, project permissions, export access and CLR creation versus display separately represented. Old pricing-table evidence and peripheral promotional labels are not carried forward as approved package assignments. No broader application capability or customer entitlement was removed.

Legacy pricing includes with Free/StartUp/Signature labels remain as unused source references. Current live pricing does not render them. Historical/unused source material was not globally rewritten.

Completion validation reproduced an existing hover-contrast failure for “Request an Institutional Demo” on `/comprehensive-learner-record.html` at desktop and mobile widths (reported ratio 1.26:1). A one-line scoped correction in `assets4/css/comprehensive-learner-record.css` preserves white text on the button's dark hover background. No CLR content or behavior is changed.

## Verification of the preceding master-spec implementation

- JavaScript syntax, YAML parsing, evidence-source existence and `git diff --check`: passed.
- `bundle exec jekyll build`: passed; existing Ruby/Bundler warnings remain, with no build error.
- `npm run test:pricing`: passed at 320, 390, 768, 1024, 1440 and 1920 pixels plus iPhone touch. Checked three plans, displayed approved limits, all 143 rows/14 categories, 18 FAQs, guidance, add-ons, trust, keyboard disclosures, contrast, focus, geometry, mobile navigation and metadata.
- Route checks: passed for `/pricing` and `/pricing.html`, matching canonical content, no-JavaScript disclosures, all linked internal product destinations, related white-label FAQ content, a single sitemap canonical and unchanged unrelated canonicals.
- Private checks: uploaded specification, comparison data and this report returned HTTP 404. `npm run test:private-uploads` passed its fresh/cached/incremental/startup/symlink/fail-closed cases.
- Desktop screenshot: inspected; page is rendered with the existing design system and the shared “Plans” menu.
- One desktop lab navigation observed DOMContentLoaded 574 ms, load 1,353 ms and initial non-input layout-shift sum 0.055 with 50 resources. This is a local lab observation, not field Core Web Vitals, a percentile metric or a production performance guarantee.

No regression was found in the preceding pricing and private-file checks. Runtime entitlement, billing, role isolation and customer migration tests were **not executed**: they require the credential application's code and approved configuration.

## Verification of the owner-confirmed corrections and rebuilt inventory

- `bundle exec jekyll build`, `node --check scripts/validate-pricing.cjs`, and `git diff --check`: passed.
- `PRICING_TEST_BASE_URL=http://127.0.0.1:5000 npm run test:pricing`: passed at 320, 390, 768, 1024, 1440 and 1920 pixels and iPhone touch. Checked all 140 rebuilt rows, all 14 master-spec categories, approved administrator/project limits, preserved student thresholds and Skill Passport boundaries, keyboard behavior, geometry, contrast, metadata, both pricing routes and related routes.
- The same test verifies the rejected trial text is absent from both related pages and that the administrator banner links to the sales demo rather than signup.
- Uploaded specifications, Jekyll pricing data and this report returned HTTP 404. Approval memory remains inside the build-excluded `.agents` directory.
- Desktop screenshot inspected: three plan cards render the approved administrator and project limits without a monetary price.
- An earlier proxied pricing test encountered two `$ is not defined` page errors. The direct-server run passed without page errors; this does not establish that the proxied loading issue is permanently resolved.
- No application authorization, customer migration or recurring billing test was run. The owner elected not to publish pricing amounts; no private recurring amount or interval was supplied, inferred or configured. Unknown feature assignments remain conditional under the explicitly selected master-spec approach.

## Verification of the implementation, training and support update

- YAML parsing, JavaScript syntax, `git diff --check` and `bundle exec jekyll build`: passed.
- Compared the YAML against the prior version: all plan data, prices/quotas, other categories and unrelated FAQs are unchanged.
- `npm run test:pricing-source`: passed its isolated mutation build; YAML edits still reach the rendered UI.
- `PRICING_TEST_BASE_URL=http://127.0.0.1:5000 npm run test:pricing`: passed six viewport widths and iPhone touch. Explicitly checks all thirteen approved support rows for all three plans, and verifies the rendered per-plan disclosures and comparison against the shared YAML (141 total features). The support FAQ checks preserve all-plan email support, the single Professional training session, scoped Enterprise migration and Enterprise-only escalation.
- Search of the current pricing configuration, layout and pricing includes found none of the superseded support placeholders or the combined advanced-training/consultation label.
- Mobile screenshot inspected for the initial layout; interactive disclosures and their changed contents were verified by the browser tests.

## Verification of the security, privacy and institutional assurance update

- YAML parsing/schema, JavaScript syntax, `git diff --check` and `bundle exec jekyll build`: passed.
- Scope comparison against the previous YAML confirms all fourteen security labels and their order are preserved, with no changes to prices, limits, the support matrix, other feature categories or unrelated FAQs.
- `npm run test:pricing-source`: passed; isolated edits to the security clarification now reach the UI alongside plans, features and FAQs.
- `PRICING_TEST_BASE_URL=http://127.0.0.1:5000 npm run test:pricing`: passed at 320, 390, 768, 1024, 1440 and 1920 pixels plus iPhone touch. Checks the fourteen approved security rows and all three plan values, 141 total features, the shared clarification, relevant FAQs and all per-plan detail/comparison output. Explicitly opens the security categories in plan disclosures to check long qualified values, keyboard behavior and geometry.
- Search of current pricing data, layout and pricing includes found no superseded authentication, backup, evidence-access or residency placeholders.
- Desktop screenshot inspected for the initial layout; changed disclosure contents were verified by browser interaction tests.
- Legal review findings above remain owner/legal follow-ups, not changes to legal terms or proof of runtime enforcement. No security scan, backend authentication test, infrastructure change or publication was performed.

## Verification of the Workforce Intelligence and Job Engine correction

- YAML syntax/schema, JavaScript syntax, `git diff --check` and `bundle exec jekyll build`: passed.
- Compared against the previous YAML: all six workforce feature labels/order are preserved; only their plan values and two directly related availability descriptions changed. Plans, quotas, commercial terms, support/security matrices, other categories, unrelated solution cards, links and all FAQs are unchanged.
- `npm run test:pricing-source`: passed its isolated mutation build.
- `PRICING_TEST_BASE_URL=http://127.0.0.1:5000 npm run test:pricing`: passed at six widths (320–1920 pixels) and iPhone touch. Exact assertions check all six approved workforce rows for all three plans; the existing UI checks compare every detailed-plan/comparison value to the YAML. Workforce disclosure groups are explicitly opened for keyboard and long-value geometry checks.
- Removed “Confirm learner module scope”/“Agreed learner module scope” from the insights row. Related pricing text now explains all-plan insights, Professional-onward scoped features, agreed Enterprise scope and no unrestricted provider/source/intelligence access.
- The public-copy safeguard initially rejected the word “unlimited” inside the explicit denial of unlimited access. It now permits only that precise denial while continuing to reject unlimited promises elsewhere; the full browser check then passed.
- Mobile screenshot inspected for initial layout; changed workforce disclosures and comparison content were verified through browser interaction checks.

## Verification of the CLR and SkillStory correction

- YAML parsing/schema, JavaScript syntax, `git diff --check` and `bundle exec jekyll build`: passed.
- Scope comparison confirms all seven category labels/order are preserved. Only their values, the directly related CLR exchange-format reference, two related solution descriptions and the existing skills/CLR FAQ changed. Other category values (including basic credential-wallet/access features), limits, commercial terms, unrelated solution content and all other FAQs are unchanged.
- `npm run test:pricing-source`: passed; YAML edits still reach the rendered UI through the single source.
- `PRICING_TEST_BASE_URL=http://127.0.0.1:5000 npm run test:pricing`: passed six viewport widths and iPhone touch. Exact checks cover seven Enterprise-only features and their module/sharing/learner-record/integration qualifiers, the scoped exchange-format reference, removal of the Professional Skill Passport add-on, and preservation of the distinction from basic wallets/issued credentials. The suite checks the corresponding per-plan disclosures and comparison values for all 141 features, explicitly opening the CLR/SkillStory groups for keyboard and geometry verification.
- Searched current pricing configuration, layout and pricing includes: no earlier Professional Skill Passport add-on or conditional Essentials/Professional CLR references remain. Other separately scoped modules are unchanged.
- Mobile screenshot inspected for initial layout; changed disclosures and comparison contents were verified by browser interaction tests.
- Updated the superseded commercial memory instruction so future pricing work does not restore the Professional Skill Passport add-on. No backend enforcement, customer entitlement migration or publication was performed.

## Verification of the Skills Taxonomy Mapping correction

- YAML syntax/schema, JavaScript syntax, `git diff --check` and `bundle exec jekyll build`: passed.
- Scope comparison confirms all six taxonomy labels/order are preserved. Only their plan values, the taxonomy solution description, one directly related shared-note sentence and the taxonomy portion of the combined skills/CLR FAQ changed. Other categories, quotas, commercial terms, unrelated solution settings and FAQs are unchanged; the CLR portion of the edited FAQ is byte-for-byte unchanged.
- `npm run test:pricing-source`: passed its isolated mutation build.
- `PRICING_TEST_BASE_URL=http://127.0.0.1:5000 npm run test:pricing`: passed six widths (320–1920 pixels) plus iPhone touch. Exact assertions check all six approved taxonomy features for each plan and the explicit distinction between defining skills and mapping/workflow capabilities. Per-plan details and comparison values match the shared YAML; taxonomy disclosure groups are explicitly opened for keyboard and long-value geometry checks.
- Searched current pricing configuration, layout and pricing includes for taxonomy references. The solution description, availability note and existing FAQ now match the approved table without changing the separately approved workforce taxonomy-enrichment feature.
- Mobile screenshot inspected for initial layout; changed taxonomy disclosures/comparison content were verified by browser interaction tests. No backend enforcement, native integration, automated mapping, certification or publication was introduced.
