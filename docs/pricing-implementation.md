# Pricing specification implementation

## Scope and source

Implemented the owner's master pricing specification on the existing Jekyll marketing website. The uploaded specification is excluded from builds. This report is also excluded from builds.

The public comparison describes documented product capabilities and approved displayed plan rules. It is not an application entitlement configuration or proof of runtime enforcement.

## Website changes

- `_data/pricing.yml`: approved Essentials limits (1 administrator, 3 templates, 0 departments, standard branding); Professional (10 templates, 1 included department, recurring department add-ons, supported custom branding); revised plan descriptions and 18 FAQs.
- `_data/pricing_features.yml`: 143 individually labelled rows across all 14 specification categories. Internal source references identify existing product material. Unknown package assignments are explicitly subject to confirmation, not inferred from legacy tiers.
- `_layouts/V4Layoutpricing.html`: template capacity, plan anchors, comparison data source, and required section order.
- `_includes/V4NewLook/pricing/plan-guidance.html`: six institutional buyer groups without introducing new tiers.
- `_includes/V4NewLook/pricing/departments.html`: included department versus paid recurring add-ons and department-scoped access versus institution-wide governance.
- `_includes/V4NewLook/pricing/trust.html`: lookup/proof distinction and product, standards, integration, security, API, branding and role links.
- `assets4/css/pricing.css`: responsive additions in the existing brand and typography.
- `whitelabel-credentials.md`: replaced the legacy Signature plan reference and removed automatic custom-wallet/full-white-label implications.
- `_includes/V4NewLook/ourProductDetails.html`: removed the blanket promise that all named systems are native integrations included in every subscription.
- `scripts/validate-pricing.cjs`: approved displayed limits, inventory coverage, disclosures, mobile navigation, internal links, contrast, keyboard focus, geometry, canonical/schema safeguards, no-JavaScript routes, private exclusions and lab navigation measurements.
- `_config.yml`: excludes this implementation report from public builds.

The shared menu remains “Plans” linking to `/pricing`. Canonical URL, analytics, sales CTAs, 500/1,000 annual student starting thresholds, no credential limit for covered students, and Professional/Enterprise-only optional Skill Passport remain unchanged.

## Entitlements and billing: blocked, not implemented

This repository is a static marketing site. It contains no credential-management backend, customer subscription database, department authorization service, recurring billing integration or approved add-on price configuration. No application entitlement, customer data, billing state, upgrade/downgrade behavior or migration was changed.

Required owner inputs:

1. Credential application's source/workspace and test environment.
2. Approved configured Professional administrator allowance, project allowances and other applicable quotas.
3. Existing department add-on billing mechanism, approved recurring price and billing interval.
4. Existing customer/grandfathering policy and contract-defined Enterprise configuration.
5. Confirmed feature-to-plan assignments for capabilities whose current website documentation establishes a capability but not its present package.

The earlier website's “Up to 2” Essentials administrators, “Up to 10” Professional departments, “Up to 10” Professional administrators and “Up to 3/25” projects were proposal metadata explicitly marked pending. The approved conflicting Essentials and department values were corrected. The unapproved Professional administrator and project values are not substituted for real application configuration: the page asks buyers to confirm them in a proposal. This changes marketing disclosure only, not existing customer access.

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

## Other website inconsistency

`whitelabel-credentials.md` retains the separate shared signup banner text “Free 5 Credentials,” and the live administrator-roles page includes `_includes/V4NewLook/pricing/banner.html` with “Give it a try, it's free!” and a platform signup destination. Whether these remain approved trial offers cannot be established from the master specification or current application configuration. They were not deleted or converted into an invented fourth plan. Owner confirmation is needed before changing these signup offers.

Legacy pricing includes with Free/StartUp/Signature labels remain as unused source references. Current live pricing does not render them. Historical/unused source material was not globally rewritten.

The existing `cta-contrast` workflow log reports an unrelated hover-contrast failure for “Request an Institutional Demo” on `/comprehensive-learner-record.html` at desktop and mobile widths (reported ratio 1.26:1). That page and its CTA styling were not changed in this implementation. This broader workflow was not re-executed or fixed as part of the pricing work.

## Verification

- JavaScript syntax, YAML parsing, evidence-source existence and `git diff --check`: passed.
- `bundle exec jekyll build`: passed; existing Ruby/Bundler warnings remain, with no build error.
- `npm run test:pricing`: passed at 320, 390, 768, 1024, 1440 and 1920 pixels plus iPhone touch. Checked three plans, displayed approved limits, all 143 rows/14 categories, 18 FAQs, guidance, add-ons, trust, keyboard disclosures, contrast, focus, geometry, mobile navigation and metadata.
- Route checks: passed for `/pricing` and `/pricing.html`, matching canonical content, no-JavaScript disclosures, all linked internal product destinations, related white-label FAQ content, a single sitemap canonical and unchanged unrelated canonicals.
- Private checks: uploaded specification, comparison data and this report returned HTTP 404. `npm run test:private-uploads` passed its fresh/cached/incremental/startup/symlink/fail-closed cases.
- Desktop screenshot: inspected; page is rendered with the existing design system and the shared “Plans” menu.
- One desktop lab navigation observed DOMContentLoaded 574 ms, load 1,353 ms and initial non-input layout-shift sum 0.055 with 50 resources. This is a local lab observation, not field Core Web Vitals, a percentile metric or a production performance guarantee.

No regression was found in the executed pricing and private-file checks. The unrelated site-wide contrast failure above remains outstanding. Runtime entitlement, billing, role isolation and customer migration tests were **not executed**: they require the credential application's code and approved configuration.
