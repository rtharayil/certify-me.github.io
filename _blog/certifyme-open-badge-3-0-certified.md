---
permalink: /blog/certifyme-open-badge-3-0-certified

layout: V4LayoutSingleBlogPost

title: "CertifyMe Is 1EdTech Certified for Open Badge 3.0 — And Here's Why That Actually Matters"

description: "Verify CertifyMe's Open Badges 3.0 issuer certification and understand what conformance does—and does not—establish for institutional procurement."

abstract:

topic: news
author : Aneesha Kurian
imageLink: /img/blog/CertifyMe-Open-Badge-3-0-Certified.png
featured: true

seo_keywords: "CertifyMe Open Badge 3.0 certified, 1EdTech certified badge platform, IMS Global Open Badges 3.0, which platforms support Open Badge 3.0, Open Badge 3.0 enterprise credentialing, open badge 3.0 vs 2.0, 1EdTech certification registry digital badges"

last_modified: 2026-10-04
content_authority_p1: true
faqs:
  - question: "What is CertifyMe certified for in Open Badges 3.0?"
    answer: "The public 1EdTech listing checked on 4 October 2026 shows an active Open Badges 3.0 Issuer certification, dated 11 May 2026, registration IMSO4ce2026W1, with API Service Consumer (Write)."
  - question: "Does 1EdTech certification constitute a security audit?"
    answer: "No. It concerns specified interoperability roles. The CertifyMe registry entry states that privacy and security vetting has not yet been completed."
  - question: "Are DIDs, blockchain and selective disclosure compulsory for every OB3 credential?"
    answer: "No. Inspect the applicable specification and implementation. Identifier choices, securing mechanisms and disclosure capabilities must be evaluated separately."
  - question: "Can every wallet verify an exported badge after an issuer goes offline?"
    answer: "No universal guarantee applies. Receiver support, issuer keys, status resources and evidence availability may remain dependencies."
---

CertifyMe has an active **Open Badges 3.0 Issuer** listing in the [public 1EdTech certification registry](https://site.imsglobal.org/certifications/certifyme/certifyme). The listing checked on 4 October 2026 records certification on **11 May 2026**, registration **IMSO4ce2026W1**, including **API Service Consumer (Write)**. This is useful evidence of a specified interoperability role—not a blanket guarantee about security, identity or every receiving system.

## A short answer for procurement teams

Record the product, version, certified role and certification identifier in your evaluation. Then test the institution's actual award, export and receiver. The registry also lists CertifyMe's active **CLR 2.0 Issuer and Displayer** roles, certified **24 August 2026**, registration **IMSR2ce2026W1**. Inspect those entries separately if learner records are in scope.

The registry states that CertifyMe has **not yet been vetted for privacy and security**. OB3 certification must not be represented as a SOC 2 report, ISO certification or independent security audit. Request those documents separately and check dates, legal entity, system scope and customer responsibilities.

## What Open Badges 3.0 changes

The [1EdTech specification](https://www.imsglobal.org/spec/ob/v3p0/) describes achievement credentials in a W3C Verifiable Credentials context. The achievement, issuer, recipient, criteria, evidence and securing mechanism matter more than the badge image. The [W3C VC Data Model 2.0](https://www.w3.org/TR/vc-data-model-2.0/) is a Recommendation dated 15 May 2025.

OB2 already described structured achievement data and verification options; it was not merely a proprietary image format. OB3 aligns achievement credentials with the VC model and related proof and exchange requirements. Do not interpret this change as compulsory blockchain, a DID for every issuer or automatic selective disclosure. These depend on the supported implementation and securing mechanism.

| Procurement question | What certification helps establish | What still needs testing |
|---|---|---|
| Is the issuing role listed? | A public, role-specific conformance record | Product/version and contracted functionality |
| Can recipients export a credential? | A standards context for achievement data | Actual export format and receiving wallet support |
| Can proof be checked elsewhere? | Structured credential and supported proof requirements | Verifier support, issuer keys and resource availability |
| Can status changes be checked? | A specification context for status handling | Current endpoint, propagation, caches and unavailable-resource policy |
| Does the award prove competence? | No independent assessment conclusion | Issuer authority, criteria and assessment evidence |

## Portability retains operational dependencies

A downloadable credential can reduce dependence on a single display page, but verification may still require issuer-key resolution, status information or accessible evidence. A missing service should be reported as an unresolved check, not silently treated as valid. Wallets must support the particular format and proof type; “W3C compatible” is not enough to promise universal compatibility.

Before rollout, inspect an authorized test award in the intended receiver, test an altered record and a status exception, and request a written continuity plan for contract termination. Do not promise instantaneous revocation across every cache or independent real-world recipient identity merely because a subject identifier is signed.

## Compare vendors using current evidence

CertifyMe's listing does not make it the only standards-based platform. For example, [Accredible's January 2026 announcement](https://www.accredible.com/newsroom/accredible-launches-support-for-open-badge-3-0-and-w3c-verifiable-credentials) documents OB3 and W3C VC export and ingestion. Look up each vendor's precise certified role in the [registry](https://site.imsglobal.org/certifications), and ask for a current sample. An unconfirmed feature is not an absent feature.

For definitions, use the [institutional OB3 guide](/blog/why-institutions-should-embrace-open-badges-3-0-standards); this article focuses on CertifyMe's public certification evidence. For connected records, use the [CLR governance guide](/comprehensive-learner-record). [Request a standards-focused demonstration](https://info.certifyme.online/request-demo) covering your institution's issuance and receiver requirements.
