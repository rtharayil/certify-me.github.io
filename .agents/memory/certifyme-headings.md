---
name: CertifyMe heading-order audit
description: Results of systematic heading order (h1-h6 jump) reduction across the Jekyll site, which files were fixed, and what remains content-level.
---

## Result
Reduced heading order jumps: 421 → 137 (67% reduction).

## Template-level fixes completed
- `_includes/V4NewLook/footer.html` — nav h6→p (main + NewIndustries footers)
- `_includes/V4NewLook/integrations/hero.html` — benefit items h4→h3 (97 integration pages)
- `_includes/V4NewLook/integrations/faq.html` — FAQ items h5→h3 (97 integration pages)
- `_includes/V4NewLook/InnerPages/features.html` — Feature2Title, Feature4Title h5→h3
- `_includes/V4NewLook/InnerPages2.0/allFeatures.html` — all sub-feature h5→h3
- `_includes/V4NewLook/InnerPages/InnerFAQ.html` — Q1–Q4 title h5→h3
- `_includes/V4NewLook/InnerPages/hero.html` + hero.html + hero2.html (InnerPages2.0) — tagline h5→p
- `_includes/V4NewLook/InnerPages/G2Enterprise.html` — subtitle h5→p
- `_includes/V4NewLook/glossary/single-post/right-section.html` — summary h6→p
- `_includes/V4NewLook/allIntegrations/` — card title h6→p
- `_includes/V4NewLook/cert-template/` (moreTemplates, templatesList, templates-left-side) — h6→p
- `_includes/V4NewLook/blogs/blogSection.html` — h6→p (×2)
- `_includes/V4NewLook/blogs/blogsLowerSection.html` — blog link h6→p
- `_includes/V4NewLook/blogs/singleBlogPostV2.html` — Summary h6→p
- `_includes/V4NewLook/blogs/Testimonials2.html` — author h6→p (×2)
- `_includes/V4NewLook/blogs/_readMore.html`, `_relatedArticlesGrid.html`, `_singleBlogPostV2ads.html` — h6→p
- `_includes/V4NewLook/InnerPages/info2.html` — h6→p (×3)

## Remaining (content-level / legacy — can't fix via shared template)
- **h2→h6: 94** — 60 devopsma legacy sample pages (low SEO value) + 31 glossary pages (markdown-level ######) + 3 root pages
- **h2→h5: 13** — individual root landing pages with page-content h5 sections
- **h1→h3: 12** — awards pages (complex individual page structure)
- **h1→h4/h5: ~12** — individual legal/about pages (FAQ.html, Policy.html, AboutUs.html)

**Why:** Glossary "Keep Reading" h6 is in the page markdown content (######), not a shared template — would need editing each .md file. Devopsma pages are legacy, low SEO priority.

**How to apply:** Next pass should focus on individual root landing pages (edit page .md/HTML source directly) and awards page template.
