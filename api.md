---
title: "CertifyMe REST API | Digital Credential API for Developers"

description: "Integrate CertifyMe's REST API to award, retrieve, edit, and delete digital certificates and badges programmatically. Full credential lifecycle automation for developers."

layout: V4LayoutInnerpages

permalink: /api/

sitemap.priority: 0.9

# hero section
HeroTitle: CertifyMe REST API for Digital Credential Automation
HeroText: Award, retrieve, edit, and delete verifiable digital credentials programmatically. CertifyMe's REST API gives developers full control over the credential lifecycle — from template creation to analytics — so you can integrate credentialing directly into your platform, LMS, or workflow.
HeroImage: /assets4/images/integrations/1.png

BoxContentTitle: Full Credential Lifecycle via REST API
BoxContentText: The CertifyMe API is a RESTful JSON API hosted at <strong>https://my.certifyme.online/api/v2/</strong>. It covers four capability tiers — Credential, Template, Project Manager, and Analytics — giving your team programmatic control over every stage of the credentialing process. Whether you are issuing thousands of certificates automatically or pulling engagement analytics for your dashboard, the API handles it. Full interactive reference documentation is available at <a href="https://cme-api-v2.readme.io" target="_blank" rel="noopener noreferrer">cme-api-v2.readme.io</a>.
BoxImage: /assets4/images/integrations/API (2).png

# Feature 1 — Credential API
Feature1Image: /assets4/images/integrations/1.png
Feature1Title: Credential API — Award, Retrieve, Edit and Delete Credentials
Feature1Text: The Credential API (Basic tier) is the core of CertifyMe's automation layer. Use <code>POST /v2/credential</code> to award a new credential to a recipient, <code>GET /v2/credential/{id}</code> to retrieve its full details, <code>PUT /v2/credential/{id}</code> to update it, and <code>DELETE /v2/credential/{id}</code> to revoke it. All endpoints accept and return JSON. This tier is included in all plans and supports bulk issuance workflows.

# Feature 2 — Template API
Feature2Image: /assets4/images/integrations/Benefits API Zapier.png
Feature2Title: Template API — Create and Manage Credential Templates at Scale
Feature2Text: The Template API (Advanced tier) lets your team manage the design and data structure of credentials without logging into the dashboard. Create a new template (<code>POST /v2/template</code>), copy an existing one, retrieve all templates for a folder, or delete a template by ID. The <code>GET /v2/template/{id}/credentials</code> endpoint returns all Credential IDs issued against a specific template — ideal for reporting and audits.

# Feature 3 — Project Manager API
Feature3Image: /assets4/images/integrations/2.png
Feature3Title: Project Manager API — Organise Credentials into Folders Programmatically
Feature3Text: The Project Manager API (Advanced tier) allows programmatic management of folder structures within your CertifyMe institution account. Create a new folder by name, retrieve a folder by ID, or list all folders by institution ID. This keeps large-scale issuance programmes organised without manual dashboard work — useful for multi-department or multi-cohort deployments.

# Feature 4 — Analytics API
Feature4Title: Analytics API — Pull Credential Engagement Data into Your Dashboard
Feature4Text: The Analytics API (Advanced tier) gives you machine-readable access to recipient engagement metrics for any template. Retrieve view counts, share counts, verification counts, and download statistics directly via <code>GET /v2/analytics/{templateId}</code>. Feed credential impact data into your BI tools, LMS reports, or customer dashboards without logging into CertifyMe manually.

# FAQ section
FAQTitle: CertifyMe API — Developer FAQ
FAQText: Common questions from developers integrating CertifyMe's credentialing API.

Q1Title: What is the CertifyMe API base URL?
Q1Text: The base URL for all CertifyMe API v2 endpoints is <strong>https://my.certifyme.online/api/v2/</strong>. Interactive API reference documentation with request/response examples and a live try-it console is available at <a href="https://cme-api-v2.readme.io/reference/post_v2-credential" target="_blank" rel="noopener noreferrer">cme-api-v2.readme.io</a>.

Q2Title: Which API tier do I need to award credentials?
Q2Text: Awarding, retrieving, editing, and deleting individual credentials is part of the <strong>Credential API (Basic tier)</strong>, included in all CertifyMe plans. The Template API, Project Manager API, and Analytics API are Advanced tier features available on higher plans.

Q3Title: Does CertifyMe support bulk credential issuance via API?
Q3Text: Yes. The Credential API supports bulk issuance workflows. You can POST multiple credentials programmatically in sequence or in parallel using your own orchestration layer. For no-code bulk issuance, CertifyMe also integrates with Zapier, Make, and major LMS platforms without writing API code.

Q4Title: Where can I find the full API reference and OpenAPI specification?
Q4Text: The complete interactive API reference — including request schemas, response examples, authentication details, and a live try-it console — is at <a href="https://cme-api-v2.readme.io" target="_blank" rel="noopener noreferrer">https://cme-api-v2.readme.io</a>. An OpenAPI-compatible index for AI agents is available at <a href="https://cme-api-v2.readme.io/llms.txt" target="_blank" rel="noopener noreferrer">https://cme-api-v2.readme.io/llms.txt</a>.



seo_keywords: "digital credential API, certificate API, badge API, REST API credentials, credential automation API, CertifyMe API, credential issuance API, OpenBadge API"

faqs:
  - question: "What can I do with the CertifyMe API?"
    answer: "The CertifyMe REST API lets you award, retrieve, edit, and delete digital credentials programmatically. You can automate the full credential lifecycle — from issuing certificates and badges to pulling analytics — without logging into the dashboard. The API base URL is https://my.certifyme.online/api/v2/ and full reference documentation is at cme-api-v2.readme.io."
  - question: "Which API tier includes bulk credential issuance?"
    answer: "The Credential API (Basic tier) supports bulk issuance and is included in all CertifyMe plans. You can POST credentials programmatically for multiple recipients in sequence or parallel. For no-code bulk issuance, CertifyMe also integrates with Zapier, Make, and major LMS platforms without requiring API code."
  - question: "Is the CertifyMe API compatible with OpenAPI specifications?"
    answer: "Yes. An OpenAPI-compatible reference and an llms.txt index for AI agents are available at cme-api-v2.readme.io. The interactive API reference includes request schemas, response examples, authentication details, and a live try-it console."
---

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "TechArticle",
  "@id": "https://www.certifyme.online/api/#techarticle",
  "headline": "CertifyMe REST API for Digital Credential Automation",
  "description": "REST API reference for awarding, retrieving, editing, and deleting verifiable digital credentials and badges programmatically via CertifyMe.",
  "url": "https://www.certifyme.online/api/",
  "author": {
    "@type": "Organization",
    "name": "CertifyMe",
    "url": "https://www.certifyme.online"
  },
  "publisher": {
    "@type": "Organization",
    "name": "CertifyMe",
    "logo": {
      "@type": "ImageObject",
      "url": "https://www.certifyme.online/assets4/images/Logo/CertifyMe-LOGO.jpg"
    }
  },
  "about": {
    "@type": "SoftwareApplication",
    "name": "CertifyMe API",
    "applicationCategory": "DeveloperApplication",
    "operatingSystem": "Any",
    "url": "https://my.certifyme.online/api/v2/",
    "documentation": "https://cme-api-v2.readme.io",
    "featureList": [
      "Award digital credentials via REST API",
      "Retrieve credential details by ID",
      "Edit and revoke credentials programmatically",
      "Create and manage credential templates via API",
      "Retrieve credential analytics data via API",
      "Organise credentials into folders via Project Manager API",
      "Bulk credential issuance support",
      "JSON request and response format",
      "OpenAPI-compatible documentation"
    ]
  },
  "mainEntity": {
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is the CertifyMe API base URL?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "The base URL for all CertifyMe API v2 endpoints is https://my.certifyme.online/api/v2/. Interactive API reference documentation is at https://cme-api-v2.readme.io."
        }
      },
      {
        "@type": "Question",
        "name": "Which API tier do I need to award credentials?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Awarding, retrieving, editing, and deleting credentials is part of the Credential API (Basic tier), included in all CertifyMe plans."
        }
      },
      {
        "@type": "Question",
        "name": "Does CertifyMe support bulk credential issuance via API?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes. The Credential API supports bulk issuance workflows. CertifyMe also integrates with Zapier, Make, and major LMS platforms for no-code bulk issuance."
        }
      },
      {
        "@type": "Question",
        "name": "Where can I find the full API reference?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "The complete interactive API reference is at https://cme-api-v2.readme.io. An OpenAPI-compatible index for AI agents is at https://cme-api-v2.readme.io/llms.txt."
        }
      }
    ]
  }
}
</script>
