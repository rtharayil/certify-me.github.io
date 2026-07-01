---
name: CertifyMe SEO/GEO Audit
description: Technical SEO, AI Search, accessibility, and performance fixes applied to CertifyMe.online Jekyll site.
---

## Key decisions & patterns

**Layout structure:**
- Modern pages use `_includes/V4NewLook/head.html` (all V4 layouts except blogs/integrations)
- Blog posts: `_includes/V4NewLook/blogs/head.html`
- Integration pages: `_includes/V4NewLook/integrations/head.html`
- `heroSection.html` opens `<main id="main-content">` — `V4Layout.html` closes it before footer
- All other V4 layouts open/close `<main>` directly around content

**Why:** Jekyll has no template inheritance blocks, so `<main>` must be in each layout or include individually.

**Canonical/URL convention:**
- `_config.yml url: "https://www.certifyme.online"` (set — was empty before)
- All canonical tags use `https://www.certifyme.online{{ page.url }}`
- Sitemap and robots.txt reference www.certifyme.online

**Structured data applied:**
- head.html: Organization + WebSite + SoftwareApplication + WebPage @graph
- blogs/head.html: + BlogPosting schema
- integrations/head.html: + HowTo schema
- V4Layout.html body: SoftwareApplication with Review array
- V4LayoutFAQ.html body: FAQPage schema with 7 Q&As

**AI crawl files:**
- `llms.txt` + `llms-full.txt` created per llmstxt.org spec
- `robots.txt` explicitly allows GPTBot, ChatGPT-User, Google-Extended, PerplexityBot, anthropic-ai, ClaudeBot, etc.
- `.well-known/security.txt` created

**Image performance:**
- Hero image: `loading="eager" fetchpriority="high"`
- All other images: `loading="lazy"` added via Ruby scripts
- Client logos in hero: lazy; nav logos: eager

**Accessibility:**
- Skip-to-main link in V4Layout.html body (CSS-only, keyboard visible)
- `<nav>` gets `role="banner"` on header, `aria-label` on nav element
- Footer uses `<address>` instead of `<p href="">` (was invalid HTML)
- Social links get descriptive `aria-label`
- All `target="_blank"` links get `rel="noopener noreferrer"`

**Google Fonts:**
- 4 separate requests consolidated into 1 combined URL with `display=swap`
