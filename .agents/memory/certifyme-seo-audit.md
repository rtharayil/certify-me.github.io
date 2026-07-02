---
name: CertifyMe SEO/GEO Audit Roadmap
description: Status of the SEO/GEO audit from attached_assets/CertifyMe-SEO-GEO-Audit-2026.md — what is done, what is left, and key architectural notes.
---

## Audit reference
`attached_assets/CertifyMe-SEO-GEO-Audit-2026.md`

## Status (as of July 2026)
All Critical and High items are done. All Medium items except M6 are done.

### Critical (C1-C6) — ALL DONE
C1 CTAs, C2 404/sitemap, C3 EPTemplate noindex+sitemap:false, C4 Two H1s, C5 Contradicting claims (#1→#2, 4.8→4.9 throughout), C6 Blog slug spaces (permalink: added to spaced filenames).

### High (H1-H10) — ALL DONE
H1 .htaccess 301 redirects, H2 sitemap clean URLs, H3 FAQPage JSON-LD (homepage + FAQ variants), H4 BreadcrumbList dynamic 2-item breadcrumb on inner pages (head.html), H5 404.md description, H6 H1s on all pages (25 includes fixed — all hero/content includes changed from h2/h3 to h1), H7 stat numbers h2→span, H8 API banner merged H2, H10 hero fetchpriority already done.

### Medium (M1-M10)
- M1 BlogPosting schema ✅ (already in _includes/V4NewLook/blogs/head.html)
- M2 SoftwareApplication+Offer schema added to _layouts/V4Layoutpricing.html ✅
- M3 /micro-credentials landing page ✅
- M4 /certificate-verification landing page ✅
- M5 /skills-passport landing page ✅
- M6 10 Tier 1 blog articles — **NOT done** (pure content writing, no code)
- M7 Author bio pages + dynamic author in blog template ✅ (authors/mrunal-upadhye.md, authors/aneesha-kurian.md)
- M8 sameAs Organization schema ✅ (was already present)
- M9 /press page ✅
- M10 /gdpr compliance page ✅

## Key architectural notes
- **Source-only rule**: Never edit _site/ directly — rebuilt from source on every Jekyll build.
- **Layout pattern**: Layouts call includes, H1s live in the includes (not layouts). Key includes: InnerPages/hero.html, InnerPages2.0/hero.html, heroSection.html, alternatives/heroSection.html, case_studies/hero.html, about/aboutCertifyMe.html, PrivacyPolicy.html, QandA/FAQ.html, QandA/FAQ-3.html, pricing/PricingPlan.html, etc.
- **Blog head**: _includes/V4NewLook/blogs/head.html (separate from main head.html) — has BlogPosting schema.
- **New layout**: _layouts/V4LayoutContent.html created — renders {{ content }}, used for GDPR/press/author pages.
- **Blog author**: singleBlogPostV2.html now uses dynamic `page.author` (was hardcoded to Aneesha Kurian). Author slug maps to /authors/<slug>.
- **Palette/brand**: lavender/indigo #282B75, Manrope headings, Inter body, single CTA "Request a Demo".
- **Factual claims (canonical)**: G2 rank #2, rating 4.9/5, Capterra 5/5, TrustRadius 9/10, 500+ institutions, 1M+ credentials, 144+ countries.
