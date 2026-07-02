---
name: CertifyMe H1 audit findings
description: What to know about the H1 structure across the CertifyMe Jekyll site after the 2026 SEO audit.
---

# H1 Audit — Findings & Resolutions

## Key lesson: HTML comments cause false positives in H1 audits
`_includes/V4NewLook/about/aboutStats.html` has an `<h1>` in a block that is entirely commented out (`<!-- ... -->`). A naive regex audit flags this as a real H1, but stripping HTML comments first (`re.sub(r'<!--.*?-->', '', content, re.DOTALL)`) gives accurate results. Always strip comments before auditing H1s.

## Include → H1 mapping (after 2026 fixes)
| Include | H1 element | Notes |
|---|---|---|
| `InnerPages/hero.html` | `{{page.HeroTitle}}` | All V4LayoutInnerpages/2.0 pages |
| `about/aboutCertifyMe.html` | hardcoded about text | About Us page |
| `case_studies/hero.html` | hardcoded "CASE STUDIES" | Case studies listing |
| `blogs/singleBlogPostV2.html` | `{{page.title}}` | Single blog posts |
| `certificate-templates/single-template/template.html` | `{{page.title}}` | Individual cert-template pages |
| `ePlatform/hero.html` | `{{page.HeroTitle}}` | E-portfolio page |
| `QandA/eduTranscript-FAQ.html` | hardcoded "Frequently Asked Questions" | EduTranscript FAQ |
| `404.html` | hardcoded "Page Not Found" | 404 error page |
| `TermsAndConditions.html` | hardcoded "Terms and Conditions" | T&C layout |
| `pricing/Admin-roles.html` | hardcoded "Admin Roles" | Admin-Roles page |
| `glossary/single-post/top-section.html` | `{{page.title}}` | Glossary single posts |
| `glossary/FAQ.html` | `{{page.title}}` | Glossary FAQ pages |

## Remaining known issues (intentionally not fixed)
- `sample-credential.html`, `signature-download.html`, `test.html` — utility pages with no H1 (low priority)
- `BSIsample/`, `Qatar/`, `nyc/` admin portal pages — multiple H1s from multi-form UI (not content pages, noindex or demo)

## pricing/banner.html — was H1, now H2
The CTA banner "Give it a try, it's free!" in `pricing/banner.html` was incorrectly an H1 (causing dual H1 on Admin-Roles and Pricing pages). Fixed to `<h2>`.

## TAC.html is a standalone root HTML file
`TAC.html` in the project root is raw HTML, NOT a Jekyll .md page. It does not use any layout. The `V4LayoutTAC.html` layout is used by a different page. To change the T&C heading, edit `TAC.html` directly.
