---
name: CertifyMe SEO critical fixes
description: Critical SEO/technical issues fixed in this project. Sitemap, schema, HSTS, tracking.
---

## Completed critical fixes
1. **Sitemap** (`sitemap.xml`) — Added `site['certificate-templates']` loop; 301 → 380 URLs. Custom Liquid template (NOT jekyll-sitemap plugin).
2. **sample-credential** — Excluded from sitemap via `sitemap: false` in frontmatter.
3. **Duplicate SoftwareApplication schema** (`_layouts/V4Layout.html`) — Review block wrapped in `@graph` for proper @id merging.
4. **HSTS** (`_headers`) — `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
5. **404 h6→p** — Description tag corrected in 404 page.
6. **test.html tracking pixel** — `alt=""` added.

## Architecture notes
- Custom `sitemap.xml` is a Liquid template (source file). Iterates: site.pages, site.blog, site.integrations, site.awards, site['certificate-templates'].
- Homepage schema: 4 JSON-LD blocks — Block 1: @graph [Organization, WebSite, SoftwareApplication], Block 2: FAQPage, Block 3: WebPage, Block 4: @graph [SoftwareApplication with reviews via @id merge]. This is correct.
- Jekyll workflow: `bundle exec jekyll serve --host 0.0.0.0 --port 5000 --skip-initial-build`. ALWAYS rebuild with `bundle exec jekyll build` before auditing `_site/`.
