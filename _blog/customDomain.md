---
layout: V4LayoutSingleBlogPost
title: CertifyMe lets you map a custom domain to your Credential Pages .

description: "Set up an institution-owned credential subdomain with correct CNAME syntax, platform activation and tested TLS and verification."

abstract: 
author : Aneesha Kurian
topic: news
imageLink: /img/blog/credential/12.png
featured: true
seo_keywords: "custom domain digital certificates, map subdomain CertifyMe, CNAME record guide, white label credentials, GoDaddy CNAME setup"
last_modified: 2026-10-04
content_authority_p1: true
faqs:
  - question: "What should the CNAME Name field contain?"
    answer: "Follow the DNS provider's format. GoDaddy expects the host prefix, such as certificate, rather than the domain repeated. The target is the confirmed hostname, not an HTTPS URL."
  - question: "Does creating DNS activate the credential page immediately?"
    answer: "No. DNS propagation, approved platform mapping and TLS provisioning must all complete. Test the real hostname before sharing it."
  - question: "Should recipients bypass a TLS warning?"
    answer: "No. Stop distributing the link and ask the responsible IT/platform team to fix the hostname or certificate problem."
---

A custom credential domain is a presentation and routing choice. It does not change who awards the achievement or make a record authentic by itself. Have the institution's DNS administrator approve a dedicated subdomain and confirm the current platform target with CertifyMe before changing production DNS.

## 1. Choose a dedicated subdomain

Examples include `badge.example.edu`, `certificate.example.edu` or `credential.example.edu`. These are fictional domains. Avoid replacing the institution's main website, mail host or an existing service. Record who owns the DNS zone and who maintains the platform mapping.

## 2. Add the confirmed CNAME

The documented CertifyMe target in this guide is `app.certifyme.online`; confirm it with the onboarding team for the current setup. A typical record looks like:

```text
Type:   CNAME
Name:   certificate
Target: app.certifyme.online
TTL:    according to your DNS policy
```

Some providers want only the host label (`certificate`), while others accept a fully qualified name. Do not accidentally create `certificate.example.edu.example.edu`. A CNAME target is a hostname, not an HTTPS URL or a path. Check for conflicting records before adding it.

## 3. Understand the routing and activation flow

```text
Recipient opens certificate.example.edu
    -> DNS resolves the CNAME target
    -> CertifyMe recognizes the approved custom hostname
    -> TLS certificate covers certificate.example.edu
    -> the requested credential page is served
```

DNS alone does not complete platform activation or TLS provisioning. Provide only the approved hostname through the normal onboarding channel; never send private keys, DNS account passwords or email credentials in a support message.

## 4. Follow your current DNS provider's instructions

[GoDaddy's maintained CNAME instructions](https://www.godaddy.com/help/add-a-cname-record-19236) specify a host prefix in the Name field and explain that global updates can take up to 48 hours. Exact UI labels and propagation vary. For other registrars, use their current official documentation rather than an old Google Domains or BigRock menu sequence. The authoritative DNS provider may differ from the domain registrar.

## 5. Test before distributing links

Have IT confirm DNS resolution, the approved platform mapping and a valid TLS hostname without browser warnings. Open an authorized test credential on desktop and mobile, then check its sharing and verification links. Retain the official issuer identity and evidence/status behavior after branding.

If DNS resolves but the page fails, check platform activation and TLS separately. If a browser warns about the certificate, stop distributing the link and resolve the hostname/certificate mismatch; do not instruct recipients to bypass the warning. Record an escalation owner and monitor renewals.

## 6. Plan maintenance and exit

The institution owns its domain; the platform serves the record under the agreed mapping. Decide what happens to custom URLs, TLS, keys and status resources if the contract ends. Remove unused mappings under a controlled offboarding process to avoid leaving orphaned DNS.

Use the [branding implementation guide](/blog/white-labeling-and-branding-with-certifyme.html) for email and presentation, and [credential infrastructure governance](/platform-overview) for record ownership. [Discuss the current domain setup](https://info.certifyme.online/request-demo) before changing a live service.
