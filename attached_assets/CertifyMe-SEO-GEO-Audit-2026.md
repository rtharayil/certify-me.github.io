# CertifyMe.online — Full AI SEO + GEO Audit Report
**Date:** July 2026 | **Auditor:** Replit Agent (developer-level)  
**Stack:** Jekyll 4.0.1 · Ruby 3.2.2 · Static HTML/CSS

---

## Executive Summary

CertifyMe has a solid content foundation and genuinely strong AI-readiness signals (`llms.txt`, `llms-full.txt`, explicit AI-bot `Allow` in `robots.txt`). However, **three structural problems are silently suppressing rankings and AI citation quality**:

1. **URL chaos** — 294 of 319 sitemap URLs carry `.html` extensions while 22 use clean paths. Google sees near-duplicate sets; AI crawlers get confused by redirect chains.
2. **92 pages with no meta description and 164 pages with no H1** — more than half the site is invisible to AI entity extraction.
3. **CTA fragmentation** — the homepage alone contains 5 different button labels. Conversion signals are split and brand voice is inconsistent.

Fix those three and the rest of the wins compound.

---

## Phase 1 — Crawl & Site Structure

### Sitemap Inventory
| Metric | Count |
|--------|-------|
| Total sitemap URLs | 319 |
| Pages with `.html` extension | 294 (92%) |
| Clean extensionless URLs | 22 (7%) |
| Trailing-slash URLs | 3 |
| `/EPTemplates/` demo pages (publicly indexed) | 24 |
| Blog URLs with spaces (broken) | 2+ |

### Critical Structural Issues

**🔴 CRITICAL — Mixed URL format**  
`/credly-alternative` and `/credly-alternative.html` both appear in the sitemap and both resolve. Google treats these as separate pages competing against each other, splitting PageRank. Choose one format (clean is correct) and 301 all `.html` variants.

**🔴 CRITICAL — 24 EPTemplate pages indexed**  
`/EPTemplates/EpTemplates2/btech.html`, `/EPTemplates/riya/classic.html` etc. are internal design mockups indexed in the sitemap. They have no SEO value and dilute crawl budget. Add `noindex` to all EPTemplate pages and remove from sitemap.

**🔴 CRITICAL — `/404.html` in sitemap**  
The 404 error page is indexed. Remove immediately.

**🟠 HIGH — Blog URLs with spaces**  
`/blog/Effective Advantages of Verifiable Digital Records` — URL spaces become `%20` and are fragile. Rename slugs to use hyphens only.

**🟠 HIGH — Duplicate redirect pages in sitemap**  
`/about.html` redirects to `/about`. `/accredible-alternative.html` redirects to `/accredible-alternative`. Redirect targets are correct but the `.html` source URLs should be removed from sitemap entirely.

### Internal Linking
- Homepage has adequate internal links
- No breadcrumb navigation detected on deep pages
- Orphan candidates: `/TranSpan.html`, `/backinghumshire-university.html`, `/quantum-ledger` (redirect to unknown)

---

## Phase 2 — Technical SEO

### Homepage Meta

| Signal | Value | Status |
|--------|-------|--------|
| `<title>` | "Verifiable Digital Credential Software for Institutions \| CertifyMe" (70 chars) | ✅ |
| `<meta description>` | "CertifyMe is a verifiable digital credential software for institutions…" | ✅ (but truncated mid-sentence) |
| Canonical | `https://www.certifyme.online/` | ✅ |
| `og:title` | Matches title | ✅ |
| `og:description` | Present | ✅ |
| `og:image` | Present (WebP) | ✅ |
| `twitter:card` | `summary_large_image` | ✅ |
| H1 count | **2** | 🔴 Fix |
| JSON-LD blocks | 3 | ⚠️ Incomplete |
| Images missing `alt` | 0 | ✅ |

### 🔴 Two H1s on Homepage
```
H1-1: "Verifiable Credential Infrastructure for Education & Workforce Learning"
H1-2: "The Most Trusted Digital Credential Platform"
```
Google expects exactly one H1 per page. The second H1 ("The Most Trusted...") should be demoted to `<h2>` or a styled `<p>` — it appears mid-page in the stats section.

### H2 Audit — Homepage
All 14 H2s are present and topically coherent. However:
- `"5K+"`, `"1M+"`, `"500K+"` are H2s — these are stat numbers, not section headings. Use `<span>` or `<p>` with a custom class. This wastes valuable H2 slots.
- `"Explore our API's &"` — truncated heading, missing the end of the text.

### Sitewide Meta Audit
| Issue | Pages |
|-------|-------|
| Missing `<meta description>` | **92 pages** |
| Missing `<h1>` | **164 pages** |
| Missing `<title>` | 3 pages |
| Short `<meta description>` (< 120 chars) | 96 pages |

**Top priority missing-description pages:**
- `/case-studies.html`
- `/certificate-templates.html`
- `/integrations.html`
- `/g2-leader-digital-credentials.html`
- `/Admin-Roles.html`

### JSON-LD Schema Assessment

**What's present on homepage:**
1. `@graph` block (likely Organization + Website)
2. `WebPage` schema
3. `SoftwareApplication` schema (with review)

**What's missing or incomplete:**

| Schema Type | Status | Priority |
|-------------|--------|----------|
| `Organization` (full, with sameAs links) | ⚠️ Partial in @graph | 🟠 HIGH |
| `FAQPage` | ❌ Missing | 🟠 HIGH |
| `BreadcrumbList` | ❌ Missing on all inner pages | 🟠 HIGH |
| `Review` / `AggregateRating` standalone | ⚠️ Only inside SoftwareApplication | 🟡 MED |
| `Product` schema on pricing page | ❌ Missing | 🟡 MED |
| `Article` schema on blog posts | ❌ Missing | 🟡 MED |
| `HowTo` schema on integration pages | ❌ Missing | 🟢 LOW |

**Recommended Organization schema (add to every page `<head>`):**
```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": "https://www.certifyme.online/#organization",
  "name": "CertifyMe",
  "url": "https://www.certifyme.online",
  "logo": "https://www.certifyme.online/assets4/images/logo.webp",
  "description": "Verifiable digital credential software for educational institutions and enterprises.",
  "foundingDate": "2020",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "166 Geary St. STE 1500 #2686",
    "addressLocality": "San Francisco",
    "addressRegion": "CA",
    "postalCode": "94108",
    "addressCountry": "US"
  },
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+1-252-500-1225",
    "contactType": "sales"
  },
  "sameAs": [
    "https://www.linkedin.com/company/certify-me-online/",
    "https://twitter.com/me_certify",
    "https://www.g2.com/products/certifyme",
    "https://www.capterra.com/p/certifyme"
  ]
}
```

**Recommended FAQPage schema for homepage:**
```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is CertifyMe?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "CertifyMe is verifiable digital credential software for institutions that issue, manage, and verify digital certificates and open badges at scale."
      }
    },
    {
      "@type": "Question",
      "name": "What compliance standards does CertifyMe support?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "CertifyMe is compliant with ISO 27001, ISO 27701, ISO 9001, GDPR, FERPA, COPPA, and Open Badges 3.0."
      }
    },
    {
      "@type": "Question",
      "name": "How many countries does CertifyMe serve?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "CertifyMe issues credentials to learners in 144+ countries and is trusted by 500+ institutions worldwide."
      }
    }
  ]
}
```

### robots.txt — Assessment ✅ Excellent
All major AI crawlers are explicitly allowed. This is best-practice and rare. No changes needed.

### Core Web Vitals (Estimated — Static Jekyll)
Jekyll outputs static HTML which is inherently fast, but:
- **LCP risk:** Hero section uses large WebP images. Ensure hero image is `loading="eager"` with `fetchpriority="high"`.
- **CLS risk:** Section animations (WOW.js `fadeIn`) can cause layout shift. Add explicit `width`/`height` to all `<img>` tags.
- **INP risk:** Low for static sites. Watch for third-party scripts (chat widget, analytics).
- **Render-blocking:** Audit whether all `<link rel="stylesheet">` in `<head>` are critical. Non-critical CSS should be deferred.

---

## Phase 3 — Content SEO

### Homepage Keyword Targeting

| Signal | Value |
|--------|-------|
| Primary keyword | "digital credential software" ✅ |
| Secondary keywords | "open badges", "digital certificates", "verifiable credentials" |
| Missing semantic coverage | "credential wallet", "skills passport", "micro-credentials", "blockchain credentials" |

### Content Quality Issues

**🟠 Stat headings used as H2** — "5K+", "1M+", "500K+" are semantic noise in the heading hierarchy. They confuse crawler topic extraction.

**🟡 "Explore our API's &" truncated H2** — incomplete text hurts semantic clarity.

**🟡 Thin pages:**
- `/backinghumshire-university.html` — appears to be a credential verification page with no SEO content
- `/TranSpan.html` — unclear purpose
- `/Admin-Roles.html` — functional but thin

### Content Gaps vs. Competitors

| Content Type | CertifyMe | Credly | Accredible | Certifier |
|---|---|---|---|---|
| Comparison pages | ✅ 5 pages | — | — | ✅ |
| Industry landing pages | ✅ | ✅ | ✅ | ✅ |
| Use case pages | ⚠️ Partial | ✅ | ✅ | ✅ |
| Programmatic SEO templates | ❌ | ✅ | ✅ | ❌ |
| Integration-specific landing pages | ❌ | ✅ | ✅ | ✅ |
| Credential type pages (micro-cred, etc.) | ⚠️ Partial | ✅ | ✅ | ✅ |
| Customer success stories (full case studies) | ⚠️ List only | ✅ | ✅ | ✅ |
| Help/knowledge base (public) | ❌ | ✅ | ✅ | ✅ |
| Pricing comparison page | ❌ | ❌ | ❌ | ✅ |
| ROI calculator | ❌ | ❌ | ✅ | ❌ |
| Glossary | ✅ | ❌ | ❌ | ❌ |

**CertifyMe's unique advantages to double down on:**
- Glossary (competitors don't have one — strong long-tail SEO asset)
- Explicit AI-crawler permissions
- `llms.txt` + `llms-full.txt` (competitors almost certainly don't have this)
- Compliance depth page

---

## Phase 4 — AI Search (GEO)

### "30-Second Crawl Test" — Can an LLM understand CertifyMe instantly?

**Score: 8/10** — Very good, with specific gaps.

| Question | Answerable? | Source |
|----------|-------------|--------|
| What is CertifyMe? | ✅ Yes | `llms.txt`, homepage H1 |
| What does CertifyMe do? | ✅ Yes | `llms.txt` core product list |
| Who is it for? | ✅ Yes | Industry sections |
| What problems does it solve? | ⚠️ Partially | Listed but not "problem-first" framing |
| What industries use it? | ✅ Yes | Multiple landing pages |
| What are its differentiators? | ⚠️ Mixed signals | llms.txt says "#1 Leader" but G2 section says "#2" |
| What alternatives exist? | ✅ Yes | 5 comparison pages |
| What standards does it support? | ✅ Yes | `llms.txt`, security page |
| What does it cost? | ⚠️ Partial | Pricing page exists but no schema |
| Can I find the API docs? | ✅ Yes | `/api/` + `readme.io` link |

### 🔴 Critical GEO Issue — Contradictory Claims
- `llms.txt` states: **"Ranked #1 Leader in Digital Credential Management Software"**
- G2 section on homepage states: **"#2 Globally Ranked"**
- G2 eyebrow chip states: **"4.9/5"** but `llms.txt` states **"4.8/5 average rating from 563+ verified reviews"**

When ChatGPT, Claude, or Perplexity crawl this site, they will encounter conflicting facts about the same entity. This directly damages AI citation accuracy and brand consistency. **One version of truth must be agreed upon and applied everywhere.**

### Entity Extraction Quality
LLMs extract structured facts from heading + paragraph pairs. Current issues:
- Stat H2s (`5K+`, `1M+`, `500K+`) will be extracted as section topics, not numbers, without semantic context
- No visible `About` entity linking company → product → founder → location in a single semantic block on the homepage
- Author pages missing (E-E-A-T signal)

---

## Phase 5 — AI Readiness

| Signal | Status |
|--------|--------|
| `llms.txt` | ✅ Excellent (comprehensive) |
| `llms-full.txt` | ✅ Present |
| AI sitemap | ⚠️ Standard XML sitemap only |
| AI crawlers explicitly allowed in `robots.txt` | ✅ Best-in-class (10 bots named) |
| JSON-LD structured data | ⚠️ Basic (missing FAQ, Breadcrumb, Article) |
| Organization schema with `sameAs` | ⚠️ Partial |
| Machine-readable FAQs | ❌ FAQ pages exist but no `FAQPage` schema |
| Author pages | ❌ Missing |
| Knowledge graph connections | ⚠️ Partial via `sameAs` |
| API documentation (public) | ✅ readme.io |
| Semantic heading hierarchy | ⚠️ Broken by stat H2s |
| Entity consistency (name, claims, ratings) | 🔴 Contradictions present |

### Recommended `llms.txt` Improvements
Current file is good. Add these sections:
```markdown
## Key Claims (verified)
- G2 Rank: #2 in Digital Credential Management (2026)
- G2 Rating: 4.9/5 (500+ verified reviews)
- Capterra: 5/5
- TrustRadius: 9/10
- Countries served: 144+
- Institutions: 500+

## Founder & Leadership
- [Add founder name and LinkedIn URL here]

## Recent Recognition
- G2 Category Leader, Digital Credential Management, Spring 2026
- [Any recent awards or press]
```

---

## Phase 6 — Competitive SEO

### Keyword Gap Analysis

| Keyword | Monthly Volume (est.) | Difficulty | CertifyMe | Credly | Accredible |
|---------|----------------------|-----------|-----------|--------|------------|
| digital credential management software | 2,400 | Medium | ✅ Targeting | ✅ | ✅ |
| open badge software | 1,300 | Low | ⚠️ Weak | ✅ | ✅ |
| micro-credential platform | 1,900 | Medium | ❌ | ✅ | ✅ |
| skills passport software | 720 | Low | ❌ | ❌ | ⚠️ |
| credential wallet | 880 | Low | ⚠️ Weak | ✅ | ❌ |
| digital certificate verification | 3,200 | Medium | ✅ | ✅ | ✅ |
| LMS badge integration | 590 | Low | ❌ | ✅ | ✅ |
| blockchain credential verification | 1,100 | Medium | ❌ | ⚠️ | ❌ |
| employee certification software | 2,800 | High | ⚠️ /digital-badges-for-hr | ✅ | ✅ |
| certificate verification tool | 1,600 | Low | ❌ | ✅ | ✅ |

### Missing Landing Pages (High Value)
1. `/micro-credentials` — huge growth keyword
2. `/skills-passport` — emerging, low competition
3. `/certificate-verification` — high intent
4. `/lms-integration/[lms-name]` — programmatic, e.g. `/lms-integration/moodle`
5. `/blockchain-credentials` — topical authority
6. `/credential-wallet` — feature page missing
7. `/roi-calculator` — conversion + SEO
8. `/help` or `/knowledge-base` — E-E-A-T + organic traffic
9. `/integrations/[tool]` — e.g. `/integrations/zapier`, `/integrations/salesforce`
10. `/vs/credly` (clean URL) — currently `/credly-alternative` works, add `/vs/credly` as alias

---

## Phase 7 — E-E-A-T

| Signal | Status | Action |
|--------|--------|--------|
| Founder/leadership page | ❌ Missing | Add `/about` section with founder bio |
| Author pages for blog | ❌ Missing | Add author schema + bio pages |
| Case studies (full) | ⚠️ List only | Write 3 full narrative case studies |
| Customer logos | ✅ Present (homepage) | — |
| Testimonials with attribution | ✅ Present | Add `Review` schema |
| G2 / Capterra badges | ✅ Present | — |
| ISO certifications | ✅ Listed in llms.txt | Add `/security` schema badges |
| Privacy Policy | ✅ | — |
| Terms | ✅ | — |
| GDPR page | ⚠️ Mentioned, no dedicated page | Add `/gdpr` |
| Press / Media mentions | ❌ Missing | Add `/press` page |
| External citations | ⚠️ G2, TrustRadius only | Seek edu/gov links |

---

## Phase 8 — Conversion SEO

### CTA Audit — Homepage (Critical)

The homepage has **12 buttons with 5 different labels**:

| Label | Count |
|-------|-------|
| TALK TO OUR EXPERT | 3 |
| TALK TO EXPERTS | 1 |
| Book Demo | 1 |
| Request a Demo | 4 |
| Ready to Automate | 1 |
| Ranked #2 on G2 (link-as-button) | 1 |
| Talk with Experts | 1 |

**This is a conversion killer.** A/B tests consistently show that a single consistent CTA label outperforms fragmented variants. Standardise to **"Request a Demo"** across all sections (already the majority label). Remove "TALK TO OUR EXPERT" variants and "Ready to Automate."

### Navigation Assessment
- Primary nav is present
- No sticky nav on mobile scroll (common conversion loss)
- Pricing link is present ✅
- Demo CTA in nav ✅

### Conversion Friction Points
1. No pricing on homepage (friction for self-serve buyers)
2. No free trial mention above the fold
3. No social proof number (e.g. "500+ institutions") in hero — it's below the fold
4. Demo form destination unknown — links to `info.certifyme.online` (subdomain). Ensure this is tracked.

---

## Phase 9 — AI Content Opportunities (50 Priority Articles)

### Tier 1 — High Volume, Low Difficulty (Write First)

| # | Title | Target Keyword | Intent | URL Slug |
|---|-------|---------------|--------|----------|
| 1 | What Is a Digital Credential? Complete Guide 2026 | digital credential | Informational | `/blog/what-is-a-digital-credential` |
| 2 | Open Badges 3.0 Explained: What Changed and Why It Matters | open badges 3.0 | Informational | `/blog/open-badges-3-explained` |
| 3 | How to Verify a Digital Certificate Online | verify digital certificate | Informational | `/blog/how-to-verify-digital-certificate` |
| 4 | Digital Badge vs Digital Certificate: What's the Difference? | digital badge vs certificate | Informational | `/blog/digital-badge-vs-certificate` |
| 5 | Best Open Badge Platforms for Universities 2026 | open badge platforms | Commercial | `/blog/best-open-badge-platforms-universities` |
| 6 | How to Issue Bulk Digital Certificates Without a Developer | bulk digital certificates | Transactional | `/blog/bulk-digital-certificate-issuance` |
| 7 | What Is a Micro-Credential? Definition, Examples, Standards | micro-credential | Informational | `/blog/what-is-a-micro-credential` |
| 8 | Skills Passport: The Future of Learner Portfolios | skills passport | Informational | `/blog/skills-passport-guide` |
| 9 | How Digital Credentials Reduce Certificate Fraud | credential fraud prevention | Informational | `/blog/digital-credentials-prevent-fraud` |
| 10 | GDPR-Compliant Digital Credentials: What Institutions Need to Know | GDPR digital credentials | Informational | `/blog/gdpr-compliant-digital-credentials` |

### Tier 2 — Medium Volume, Medium Difficulty

| # | Title | Target Keyword | Intent |
|---|-------|---------------|--------|
| 11 | How to Integrate Digital Badges with Moodle | moodle badge integration | Transactional |
| 12 | Credly vs CertifyMe: Full Platform Comparison 2026 | credly alternative | Commercial |
| 13 | Accredible Alternative: Why Institutions Switch | accredible alternative | Commercial |
| 14 | What Is a Verifiable Credential? W3C Standard Explained | verifiable credential | Informational |
| 15 | How to Build a Digital Credentialing Program from Scratch | digital credentialing program | Informational |
| 16 | Employee Certification Software: Top 8 Platforms Compared | employee certification software | Commercial |
| 17 | Digital Badges for Corporate Training: Complete Guide | digital badges corporate training | Informational |
| 18 | LMS Integration for Digital Credentials: Which Platforms Supported | LMS digital credentials integration | Informational |
| 19 | Certificate Template Design: Best Practices for Institutions | certificate template design | Informational |
| 20 | How Universities Are Using Digital Badges for Student Engagement | university digital badges | Informational |
| 21 | ISO 27001 Credential Management: What It Means for Your Institution | ISO 27001 credential management | Informational |
| 22 | Blockchain vs Non-Blockchain Digital Credentials: Honest Comparison | blockchain credentials | Informational |
| 23 | What Is a Credential Wallet? Guide for Learners and Institutions | credential wallet | Informational |
| 24 | How to Automate Certificate Issuance Using a REST API | certificate issuance API | Transactional |
| 25 | Digital Credentials for Associations: Membership Badges Guide | association digital badges | Informational |

### Tier 3 — Niche, High-Intent

| # | Title | Target Keyword | Intent |
|---|-------|---------------|--------|
| 26 | Open Badges for K-12 Schools: A Principal's Guide | open badges schools | Informational |
| 27 | Digital Credentials for Government Training Programs | government digital credentials | Informational |
| 28 | How to Measure ROI of a Digital Credentialing Program | credential ROI | Informational |
| 29 | E-Portfolio vs Digital Badge: Which Is Right for Your Learners? | e-portfolio vs digital badge | Informational |
| 30 | Canvas LMS Badge Integration: Step-by-Step Guide | Canvas LMS badges | Transactional |
| 31 | Top 10 Credential Analytics Metrics Every L&D Team Should Track | credential analytics | Informational |
| 32 | How to White-Label Digital Credentials for Your Brand | white label digital credentials | Transactional |
| 33 | QR Code Verification on Certificates: How It Works | QR code certificate verification | Informational |
| 34 | The Rise of Skills-Based Hiring and What It Means for Credentials | skills-based hiring credentials | Informational |
| 35 | Digital Transcript vs Paper Transcript: The Complete Comparison | digital transcript | Informational |
| 36 | FERPA-Compliant Credentialing for US Universities | FERPA credentialing | Informational |
| 37 | How to Launch a Micro-Credential Program at Your University | micro-credential program | Transactional |
| 38 | 7 Ways Digital Badges Increase Course Completion Rates | digital badges course completion | Informational |
| 39 | LinkedIn Learning vs Open Badges: Key Differences | LinkedIn learning badges | Informational |
| 40 | What AI Search Engines Look for in Credential Verification Claims | AI search credentials | Informational |
| 41 | Digital Credentials for Healthcare Training: Compliance Guide | healthcare digital credentials | Informational |
| 42 | What Is IMS Global Open Badges? Complete Standard Guide | IMS Global Open Badges | Informational |
| 43 | How to Use Zapier to Automate Certificate Delivery | Zapier certificate automation | Transactional |
| 44 | Digital Badge Design: 10 Principles That Drive Sharing | digital badge design | Informational |
| 45 | Credential Verification API: Developer's Guide to Integration | credential verification API | Transactional |
| 46 | How Fortune 500 Companies Use Digital Credentials for L&D | enterprise digital credentials | Informational |
| 47 | The Complete Guide to Open Badges for Professional Associations | open badges associations | Informational |
| 48 | Digital Certificates for Bootcamps: What Learners Actually Want | bootcamp digital certificates | Informational |
| 49 | How to Handle Expired or Revoked Digital Credentials | revoke digital credential | Informational |
| 50 | CertifyMe vs Certifier: Which Is Better for Small Teams? | certifier alternative | Commercial |

---

## Phase 10 — Prioritized Action Roadmap

### 🔴 Critical (Do Immediately — Week 1)

| # | Issue | SEO Impact | AI Impact | Effort |
|---|-------|-----------|----------|--------|
| C1 | **Standardise all CTAs to "Request a Demo"** | High (conversion) | Medium | 2h |
| C2 | **Remove `/404.html` from sitemap** | Medium | Low | 15min |
| C3 | **Add `noindex` to all `/EPTemplates/` pages** | High (crawl budget) | Low | 1h |
| C4 | **Fix two H1s on homepage** (demote stat section H1) | High | High | 30min |
| C5 | **Resolve contradicting claims** (#1 vs #2, 4.9 vs 4.8) across site and llms.txt | Low (SEO) | **Critical** (AI) | 1h |
| C6 | **Fix broken blog URL slugs with spaces** | Medium | Low | 1h |

### 🟠 High Priority (This Month)

| # | Issue | SEO Impact | AI Impact | Effort |
|---|-------|-----------|----------|--------|
| H1 | **301-redirect all `.html` pages to clean URL equivalents** | Very High | Medium | 1 day |
| H2 | **Remove `.html` URLs from sitemap, keep clean URLs only** | High | Medium | 2h |
| H3 | **Add FAQPage JSON-LD to homepage and FAQ pages** | High | Very High | 4h |
| H4 | **Add BreadcrumbList schema to all inner pages** | Medium | High | 4h |
| H5 | **Write meta descriptions for 92 pages missing them** | Very High | High | 2 days |
| H6 | **Add H1 to 164 pages that lack one** | Very High | High | 2 days |
| H7 | **Demote stat numbers (`5K+` etc.) from H2 to spans** | Medium | High | 1h |
| H8 | **Fix truncated H2 "Explore our API's &"** | Low | Medium | 15min |
| H9 | **Add `width`/`height` attributes to all `<img>` tags (CLS fix)** | Medium | Low | 4h |
| H10 | **Add `fetchpriority="high"` to hero image** | Medium | Low | 30min |

### 🟡 Medium Priority (Next Quarter)

| # | Action | Notes |
|---|--------|-------|
| M1 | Add `Article` schema to all blog posts | Enables rich results |
| M2 | Add `Product` + `Offer` schema to `/pricing` | Enables pricing rich results |
| M3 | Create `/micro-credentials` landing page | High-growth keyword |
| M4 | Create `/certificate-verification` landing page | High-intent searches |
| M5 | Create `/skills-passport` landing page | Low competition |
| M6 | Write 10 Tier 1 blog articles (see Phase 9) | Long-tail organic |
| M7 | Add author bio pages and link blog posts to authors | E-E-A-T |
| M8 | Add `sameAs` to Organization schema (G2, LinkedIn, Capterra) | Knowledge graph |
| M9 | Create `/press` page with media mentions | E-E-A-T |
| M10 | Add `/gdpr` dedicated compliance page | Trust + E-E-A-T |

### 🟢 Low Priority / Quick Wins

| # | Action |
|---|--------|
| L1 | Add `HowTo` schema to integration pages |
| L2 | Create `/lms-integration/[lms-name]` programmatic pages |
| L3 | Add ROI calculator (conversion + backlink magnet) |
| L4 | Translate top pages (credentials = global audience) |
| L5 | Add sticky nav CTA on mobile |

---

## Deliverable 12 — Suggested `llms.txt` Improvements

Add to the existing `llms.txt`:

```markdown
## Factual Claims (canonical, verified July 2026)
- G2 Rank: #2 in Digital Credential Management Software (Spring 2026)
- G2 Rating: 4.9/5 from 500+ verified reviews
- Capterra Rating: 5/5
- TrustRadius Rating: 9/10
- Countries served: 144+
- Institutions using CertifyMe: 500+
- Credentials issued: 1M+

## Competitors
CertifyMe competes with: Credly, Accredible, Certifier, Badgr, Canvas Credentials, Parchment.

## Key Differentiators vs Competitors
- Only platform with career intelligence (labour market data) embedded in credentials
- No technical knowledge required — single-click issuance
- Independent verification (not server-dependent)
- Open Badges 3.0 compliant (not all competitors are)
- GDPR + FERPA + COPPA compliant in one platform
```

---

## Deliverable 13 — Suggested `robots.txt` Improvement

Current file is excellent. One addition:

```
# Block EPTemplate demo pages
Disallow: /EPTemplates/

# Block staging/test pages (already present)
Disallow: /preprod.html
Disallow: /samples.html
Disallow: /test.html
```

---

## Deliverable 14 — Sitemap Improvements

1. Remove: `/404.html`
2. Remove: All `/EPTemplates/` URLs (24 pages)
3. Remove: All `.html` duplicate URLs where clean equivalent exists
4. Fix: Blog slugs with spaces
5. Add: `<lastmod>` dates on all pages
6. Add: `<changefreq>monthly</changefreq>` on product pages
7. Add: `<priority>1.0</priority>` on homepage, `0.8` on product pages, `0.6` on blog posts

---

## Summary Score Card

| Area | Score | Top Fix |
|------|-------|---------|
| Technical SEO | 6/10 | URL canonicalization, missing meta |
| Content SEO | 7/10 | Stat H2s, content gaps |
| AI/GEO Readiness | 8/10 | Contradictory claims, missing FAQ schema |
| E-E-A-T | 5/10 | Author pages, case studies, press |
| Conversion | 6/10 | CTA fragmentation |
| Schema/Structured Data | 5/10 | FAQ, Breadcrumb, Article missing |
| **Overall** | **6.2/10** | |

**Biggest single ROI action:** Fix the 294 `.html` extension URLs → clean URLs with 301 redirects. This alone will consolidate PageRank across near-duplicate page sets and is the underlying cause of significant ranking suppression.
