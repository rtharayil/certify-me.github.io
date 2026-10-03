---
name: CertifyMe SEO verification
description: Audit rendered schema rather than historical counts, and preserve plugin dependencies when deferring scripts.
---

Audit the freshly built, rendered homepage before accepting historical schema counts or source-only reports. Multiple JSON-LD blocks are not automatically duplicate or conflicting entities.

**Why:** Historical notes and an explorer report described obsolete homepage ratings and FAQ claims that were absent from the emitted homepage. Shared templates can also retain non-homepage schema inside a conditional branch.

**How to apply:** Build once after the coherent edit batch, parse the emitted JSON-LD, inspect resolved entity IDs and visible-content correspondence, and distinguish valid Schema.org description from eligibility for a Google rich result. Do not infer live rankings or citation visibility from local validation.

Load jQuery plugins before scripts that register ready callbacks using those plugins when converting synchronous footer scripts to deferred scripts.

**Why:** With deferred scripts, jQuery can observe an interactive document and run a ready callback before a later plugin has finished loading. The previously synchronous ordering then produced a real validation-plugin runtime error.

**How to apply:** Review dependencies, not only script counts; test delayed loading and runtime errors after deferral. Preserve unrelated pages' loading behavior when the requested scope is homepage-only.

Keep FAQ schema aligned with the actual renderer: Markdown answers need Markdown-to-text conversion, while plain-text answers must retain literal taxonomy names such as O*NET.

**Why:** Applying Markdown conversion to plain-text FAQ data interpreted paired asterisks in O*NET as emphasis and changed the taxonomy name in structured data.

**How to apply:** Use the visible section's formatting mode when serialising answers; compare emitted JSON-LD with rendered questions and answers rather than assuming one formatter fits every layout.

Do not present FAQPage markup as a current Google rich-result benefit.

**Why:** The official FAQ documentation redirected to Google's Search updates announcing FAQ rich-result retirement and documentation removal in May–June 2026.

**How to apply:** Keep useful visible FAQs and truthful Schema.org markup, but check current Google feature support before promising eligibility.

Use a stable configured public origin for SEO URLs, not Jekyll's runtime site.url.

**Why:** Jekyll serve overrides site.url with its local listening address; absolute_url then emits local sitemap and social-image URLs even when a production build passes.

**How to apply:** Keep canonical-origin configuration independent of preview serving, and check both the production build and served sitemap after metadata changes.
