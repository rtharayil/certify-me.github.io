---
permalink: /blog/certifyme-open-badge-3-0-certified

layout: V4LayoutSingleBlogPost

title: "CertifyMe Is 1EdTech Certified for Open Badge 3.0 — And Here's Why That Actually Matters"

description: "CertifyMe holds official 1EdTech certification for Open Badge 3.0. Here's what that means for enterprise teams, how it compares to other platforms, and why the standard itself is worth understanding."

abstract:

topic: news
author : Aneesha Kurian
imageLink: /img/blog/CertifyMe-Open-Badge-3-0-Certified.png
featured: true

seo_keywords: "CertifyMe Open Badge 3.0 certified, 1EdTech certified badge platform, IMS Global Open Badges 3.0, which platforms support Open Badge 3.0, Open Badge 3.0 enterprise credentialing, open badge 3.0 vs 2.0, 1EdTech certification registry digital badges"

faqs:
  - question: "Is CertifyMe officially certified for Open Badge 3.0?"
    answer: "Yes — and I don't mean self-declared. CertifyMe has passed the 1EdTech (formerly IMS Global) conformance certification process for Open Badge 3.0, and the certification is publicly listed on the 1EdTech registry at site.imsglobal.org/certifications/certifyme/certifyme. That's the difference between a platform that says it's compliant and one that's been independently tested."
  - question: "What does Open Badge 3.0 certification mean for enterprise teams?"
    answer: "In plain terms — every badge you issue through a certified platform follows a verified, open standard. Your credentials are independently verifiable, portable to any W3C-compatible wallet, and not locked to a single vendor. For enterprise procurement and compliance teams, 1EdTech certification is the clearest third-party proof that the platform actually implements the standard correctly."
  - question: "How is Open Badge 3.0 different from Open Badge 2.0?"
    answer: "OB 3.0 is built on the W3C Verifiable Credentials Data Model. That's a big deal. It adds cryptographic signing, decentralized identifiers (DIDs), and genuine wallet portability that OB 2.0 simply didn't have. In practice, it means credentials are harder to forge, easier to verify anywhere, and don't depend on the issuing platform staying online."
  - question: "Which platforms are 1EdTech certified for Open Badge 3.0?"
    answer: "CertifyMe is listed in the 1EdTech certification registry for Open Badge 3.0. Several other platforms — including Credly and Accredible — also support OB3, but independently verified 1EdTech conformance certification is what separates platforms that have been tested against the full standard from those that self-declare compliance. Always check the 1EdTech registry at site.imsglobal.org/certifications rather than relying on a vendor's own compliance claims."
  - question: "Do Open Badge 3.0 credentials work without the issuing platform?"
    answer: "Yes — and that's one of the most important things about OB3. Because credentials carry a cryptographic signature tied to the issuer's decentralized identifier, any compliant verifier can check authenticity without contacting CertifyMe. The credential's proof is built into the credential itself."
  - question: "Is Open Badge 3.0 right for large enterprise credentialing programs?"
    answer: "It was built for exactly that. OB3's interoperability, cryptographic security, and alignment to W3C standards address the things enterprise programs care about most — compliance, auditability, global portability, and no vendor lock-in. CertifyMe's enterprise implementation adds bulk issuance, API access, revocation, role-based admin, and white-labeling on top of that foundation."
  - question: "How do I verify CertifyMe's 1EdTech certification myself?"
    answer: "Go to site.imsglobal.org/certifications and search for CertifyMe. You'll see the certification listing, the standard version, and the conformance details. I always recommend enterprise buyers do this check for any platform they're evaluating — don't take a vendor's word for it."
---

A few months ago, I was in a conversation with an enterprise L&D manager who'd been through three credentialing platform demos that week. Every single one of them had said "we support Open Badges." She asked me what that actually meant. And honestly? It's a fair question, because "we support Open Badges" can mean a lot of different things depending on which version, whether that support is certified, and what the platform actually does with it.

So let me explain what it means when CertifyMe says it — and why the "3.0" part and the "1EdTech certified" part are not just marketing words.

<br>

## What Is Open Badge 3.0, and Why Should You Care?

If you're already in the digital credentialing space, you've probably heard "Open Badges" thrown around a lot. It's been around since Mozilla started the standard, IMS Global (now 1EdTech) took it over, and now we're on version 3.0.

Here's the thing — each version isn't just an incremental update. Open Badge 3.0 is a fundamental rearchitecting of what a badge *is* and how it works.

The earlier versions (1.x and 2.x) were solid for their time. A badge was essentially an image with metadata baked into it — who issued it, what for, when. You could click it and verify. Fine. But the data lived in JSON, there was no standardized cryptographic signing, and verification depended on the issuing platform staying online and accessible.

Open Badge 3.0 changes the foundation. It's now built directly on the **W3C Verifiable Credentials Data Model** — the same standard being adopted by governments, healthcare systems, and financial institutions for digital identity. That means:

- Every badge is **cryptographically signed** by the issuer
- The issuer gets a **Decentralized Identifier (DID)** — a verifiable digital identity that doesn't depend on a central database
- Badges are **stored in digital wallets**, not just on a platform page
- Verification happens **anywhere**, by anyone with a compliant system — no need to ping CertifyMe's servers
- Recipients can use **selective disclosure** to share only the parts of a credential they choose to

For an enterprise team issuing thousands of credentials, that's not an incremental improvement. That's a completely different category of trust.

<br>

## CertifyMe's 1EdTech Certification — What It Actually Means

Here's what I want to make clear, because I've seen this muddled in a lot of vendor pitches: there's a difference between *claiming* to support Open Badge 3.0 and being *independently certified* for it.

**CertifyMe is listed in the official 1EdTech certification registry for Open Badge 3.0.**

**[View CertifyMe's Official 1EdTech Certification →](https://site.imsglobal.org/certifications/certifyme/certifyme#cert_pane_nid_625336)**

<br>

<a href="https://site.imsglobal.org/certifications/certifyme/certifyme#cert_pane_nid_625336" target="_blank" rel="noopener">
  <img class="img-fluid r-16" src="/img/blog/CertifyMe-Open-Badge-3-0-Certified.png" alt="CertifyMe Open Badge 3.0 certified by 1EdTech IMS Global" style="display: block; margin: 0 auto; max-width: 720px;">
</a>

<p class="text-center" style="margin-top:10px; font-size:0.9rem; color:#666;">CertifyMe's official 1EdTech Open Badge 3.0 certification — publicly verifiable on the IMS Global registry</p>

<br>

1EdTech certification isn't something you apply for with a checkbox form. The platform goes through a structured conformance test suite administered by 1EdTech, covering: the OB3 data model, cryptographic signing with recognized proof types, achievement and evidence structures, and interoperability with other certified systems. If it fails any part of that, it doesn't get listed.

I always tell buyers: go check the [1EdTech registry](https://site.imsglobal.org/certifications) yourself before you sign anything. The listing is public. Any platform that's passed certification will be there. Any platform that isn't there — regardless of what their sales team says — has not been independently validated.

<br>

## Open Badge 3.0 vs. 2.0 — What Actually Changed?

If your organization has previously issued OB 2.x badges, understanding the real differences matters for planning any migration or new program.

<html lang="en">
<head>
    <style>
        table { width: 100%; border-collapse: collapse; margin: 20px 0; font-family: Arial, sans-serif; }
        th, td { border: 1px solid #cccccc; padding: 12px; text-align: left; }
        th { background-color: #f4f4f4; }
        tr:nth-child(even) { background-color: #fafafa; }
    </style>
</head>
<body>
<table>
  <thead>
    <tr>
      <th>Feature</th>
      <th>Open Badge 2.0</th>
      <th>Open Badge 3.0</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Underlying standard</td>
      <td>Proprietary JSON-LD schema</td>
      <td>W3C Verifiable Credentials Data Model</td>
    </tr>
    <tr>
      <td>Cryptographic signing</td>
      <td>Optional, limited</td>
      <td>Required — issuer DID + cryptographic proof</td>
    </tr>
    <tr>
      <td>Decentralized Identifiers (DID)</td>
      <td>Not supported</td>
      <td>Full support</td>
    </tr>
    <tr>
      <td>Wallet portability</td>
      <td>Platform-dependent</td>
      <td>Any W3C-compatible digital wallet</td>
    </tr>
    <tr>
      <td>Independent verification</td>
      <td>Requires issuer's platform to be online</td>
      <td>Fully platform-independent</td>
    </tr>
    <tr>
      <td>Selective disclosure</td>
      <td>Not supported</td>
      <td>Supported</td>
    </tr>
    <tr>
      <td>Endorsement model</td>
      <td>Limited</td>
      <td>Full endorsement credential structure</td>
    </tr>
    <tr>
      <td>Governance</td>
      <td>IMS Global</td>
      <td>1EdTech — actively maintained and extended</td>
    </tr>
  </tbody>
</table>
</body>
</html>

<p class="text-center fw-bold">Open Badge 2.0 vs. Open Badge 3.0 — what changed</p>

<br>

The shift to W3C Verifiable Credentials is the biggest thing here. It's not just a technical upgrade — it means OB3 badges are now part of the same global trust fabric as digital passports, government IDs, and financial credentials. That's the kind of interoperability that makes enterprise procurement teams comfortable.

<br>

## Which Platforms Support Open Badge 3.0? (An Honest Look)

This is the part I find most useful to write, because it's also the part that's hardest to get a straight answer on in a vendor demo.

Several major platforms now support Open Badge 3.0 — including Credly and Accredible. So if you're evaluating platforms purely on "does it support OB3," that bar is increasingly met across the board. The more useful question — especially for enterprise procurement — is **how** that support is implemented, and whether it's been independently validated.

Here's where the key platforms stand:

<html lang="en">
<head>
    <style>
        table { width: 100%; border-collapse: collapse; margin: 20px 0; font-family: Arial, sans-serif; }
        th, td { border: 1px solid #cccccc; padding: 12px; text-align: left; }
        th { background-color: #f4f4f4; }
        tr:nth-child(even) { background-color: #fafafa; }
    </style>
</head>
<body>
<table>
  <thead>
    <tr>
      <th>Platform</th>
      <th>OB3 Support?</th>
      <th>1EdTech Certified?</th>
      <th>W3C VC + Immutable Credentials?</th>
      <th>Notes</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>CertifyMe</strong></td>
      <td>✅ Yes</td>
      <td>✅ Yes — publicly listed</td>
      <td>✅ Yes — both</td>
      <td>OB3 + W3C VC + Immutable Credentials. The only platform in this comparison with independently verified 1EdTech conformance certification.</td>
    </tr>
    <tr>
      <td><strong>Credly (by Pearson)</strong></td>
      <td>✅ Yes</td>
      <td>⚠️ Not confirmed in public registry</td>
      <td>⚠️ Partial — limited public detail on W3C VC depth</td>
      <td>Strong enterprise skills recognition platform. OB3 is supported, but the primary focus is Pearson's skills taxonomy and workforce analytics rather than open credential infrastructure.</td>
    </tr>
    <tr>
      <td><strong>Accredible</strong></td>
      <td>✅ Yes</td>
      <td>⚠️ Not confirmed in public registry</td>
      <td>⚠️ Partial — doesn't foreground W3C VC or immutable credentials</td>
      <td>Well-established platform with a wide LMS integration ecosystem. Supports OB3, but immutable credential infrastructure and W3C VC depth aren't prominently featured in its positioning.</td>
    </tr>
    <tr>
      <td><strong>Certifier</strong></td>
      <td>✅ Claims OB3 support</td>
      <td>⚠️ Not confirmed in public registry</td>
      <td>Not specified publicly</td>
      <td>AI-powered certificate design and high-volume issuance tool. States OB3 and ISO 27001 alignment. Lighter on structured credentialing infrastructure and independent verification depth.</td>
    </tr>
    <tr>
      <td><strong>Sertifier</strong></td>
      <td>⚠️ Open Badges compliant — version unclear</td>
      <td>Not confirmed</td>
      <td>Not specified publicly</td>
      <td>Focused on learner engagement and credential sharing pages. Doesn't specifically position OB3 or W3C VC in its public documentation.</td>
    </tr>
    <tr>
      <td><strong>Parchment</strong></td>
      <td>❌ Not OB-focused</td>
      <td>N/A</td>
      <td>Not applicable</td>
      <td>The industry standard for secure academic transcript exchange between institutions. Excellent at what it does — but not built for open badge credentialing programs.</td>
    </tr>
  </tbody>
</table>
</body>
</html>

<p class="text-center fw-bold">Open Badge 3.0 support across major credentialing platforms (July 2026)</p>

<br>

Here's the nuance I'd flag for anyone using this table in an actual evaluation.

**OB3 support isn't the finish line anymore — it's the entry requirement.** Credly and Accredible both support OB3. So does Certifier. The differentiation now sits in *how deeply* the standard is implemented (does the platform use W3C VC + cryptographic signing across the board, or just for specific credential types?) and whether that implementation has been **independently certified** by 1EdTech.

**1EdTech certification is not the same as claiming compliance.** A certification listing on the [1EdTech registry](https://site.imsglobal.org/certifications) means the platform passed a structured conformance test suite administered by the governing body. A "compliant" or "supported" badge on a vendor's own website means the vendor says so. For enterprise procurement teams, especially in regulated industries, that distinction is worth asking about explicitly.

**Every platform here has genuine strengths.** Credly is the dominant force in enterprise skills recognition and Pearson's learning ecosystem. Accredible has one of the most mature LMS and CRM integration libraries in the space. Parchment is the standard for academic transcript exchange. This comparison is about where OB3 *certification depth* sits in each platform's priorities — not a verdict on their overall quality.

<br>

## Why Enterprise Teams Should Ask About 1EdTech Certification Specifically

Here's something I've noticed in a lot of enterprise procurement conversations: teams often evaluate platforms on feature lists, pricing tiers, and integration support — and leave credential standards as an afterthought. I get it. You're focused on "does this connect to our LMS" and "can we white-label it."

But here's why standards matter for enterprise specifically.

**Audit and compliance risk.** Regulated industries — healthcare, financial services, government — need demonstrable credential integrity. A cryptographically signed, independently certified credential is a fundamentally different artifact from a PDF or a proprietary badge format when an auditor asks "how do you know this credential hasn't been altered?"

**Vendor lock-in.** If your credentials are issued in a proprietary format that only verifies through one platform's system, you've created dependency. If that platform changes pricing, gets acquired, or changes its verification API, your entire credential archive is affected. OB3-certified credentials verify independently of any specific platform.

**Long-term usability.** Your learners and employees will use their credentials for years — sometimes decades. A badge issued in 2024 should still be verifiable in 2034. Open, cryptographically signed standards give you that. Proprietary formats, historically, don't.

**Global recognition.** Enterprise organizations with international teams or global certification programs need credentials that work everywhere. OB3's alignment with W3C standards means a credential issued anywhere can be verified anywhere by any compliant system.

<br>

## What Enterprise Credentialing Looks Like in Practice with CertifyMe

So practically — what does it look like to run an enterprise credentialing program on CertifyMe's OB3-certified platform?

<br>

### Bulk Issuance Without Manual Work

Enterprise programs often need to issue hundreds or thousands of credentials at once — after a training cycle, certification exam, or annual compliance completion. CertifyMe handles this via CSV upload, direct API triggers from your LMS or HRMS, or webhook-based automation. Each credential is individually signed. No batch processing shortcuts, no corner-cutting on the standard.

<br>

### API Integration With Your Existing Systems

If your credentialing needs to fit inside an existing LMS, HRMS, or certification platform rather than replace it, CertifyMe's [REST API](https://www.certifyme.online/api.html) covers issuance, recipient management, revocation, and analytics programmatically. Enterprise IT teams don't have to build workarounds — the integration is the primary workflow, not an afterthought.

<br>

### Revocation That Actually Works

Under OB3, revocation is part of the standard — not a manual process. When a certification lapses, an employee leaves, or a compliance requirement changes, revoked credentials show as invalid instantly to any verifier anywhere. No delay, no manual communication to a verification system.

<br>

### White-Label All the Way Through

The credential design is yours. The verification page domain is yours. The recipient-facing sharing experience shows your brand, not CertifyMe's. For enterprise programs where brand trust is part of the credential's value, this matters more than it might seem.

<br>

### Role-Based Admin for Large Teams

Multi-department credential programs need controlled access. Program managers, department leads, and IT administrators each get appropriate permissions — nobody sees what they shouldn't, nobody can issue credentials they're not authorized for.

<br>

## Enterprise Use Cases Where OB3 Certification Changes Things

<html lang="en">
<head>
    <style>
        table { width: 100%; border-collapse: collapse; margin: 20px 0; font-family: Arial, sans-serif; }
        th, td { border: 1px solid #cccccc; padding: 12px; text-align: left; }
        th { background-color: #f4f4f4; }
        tr:nth-child(even) { background-color: #fafafa; }
    </style>
</head>
<body>
<table>
  <thead>
    <tr>
      <th>Program Type</th>
      <th>Why OB3 Certification Matters Here</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Corporate compliance training</td>
      <td>Cryptographic signing gives audit-ready proof of completion without manual record reconciliation</td>
    </tr>
    <tr>
      <td>Professional association certifications</td>
      <td>Globally portable credentials members can use anywhere, not locked to the association's portal</td>
    </tr>
    <tr>
      <td>University micro-credentials</td>
      <td>Stackable, wallet-ready badges that work across employer systems and graduate admissions</td>
    </tr>
    <tr>
      <td>Healthcare licensing and CME</td>
      <td>Independent verifiability for regulatory purposes without platform dependency</td>
    </tr>
    <tr>
      <td>Government training programs</td>
      <td>Tamper-evident records meeting public sector credential integrity requirements</td>
    </tr>
    <tr>
      <td>Technology certification bodies</td>
      <td>Industry-wide recognition, verifiable by employers and partner ecosystems without custom integration</td>
    </tr>
  </tbody>
</table>
</body>
</html>

<p class="text-center fw-bold">Where OB3 certification creates the most enterprise value</p>

<br>

## What to Ask Any Platform Before You Sign

Since I've been in enough of these evaluation cycles to know what the gotchas are, here's the short list of questions I'd ask any credentialing platform vendor specifically on standards:

1. **Are you listed in the 1EdTech certification registry?** If yes, what's the certification number? (Verify it yourself at [site.imsglobal.org/certifications](https://site.imsglobal.org/certifications).)
2. **Which version of the Open Badges specification are you certified for?** OB2 and OB3 are meaningfully different — make sure they're not conflating them.
3. **Does your verification work independently of your platform?** Ask them to demonstrate verification from a third-party tool, not just their own verification page.
4. **How does revocation work?** Can it be triggered programmatically? How fast does it propagate to verifiers?
5. **Does the credential carry a cryptographic signature?** And can they show you the proof section of an issued credential?
6. **Do you support wallet-based credential storage?** Which wallets?
7. **What happens to issued credentials if we switch platforms?** Get this in writing.

CertifyMe's answers to all seven are straightforward — the certification verifies the underlying implementation, and the platform documentation covers the rest. But I'd encourage you to ask every vendor the same questions.

<br>

## Wrapping Up

Here's the bottom line: Open Badge 3.0 matters because digital credentials are becoming infrastructure — not just recognition tools. The platforms that get this right now are the ones building on open, cryptographically sound, independently verified standards rather than proprietary formats dressed up with a badge graphic.

CertifyMe's 1EdTech certification for OB3 is public, independently verified, and directly auditable. If you're building a credentialing program that needs to hold up — to your learners, your compliance team, your auditors, and the employers and institutions that will verify those credentials years from now — that's the kind of foundation worth building on.

If you want to look at our certification directly, it's at [site.imsglobal.org/certifications/certifyme/certifyme](https://site.imsglobal.org/certifications/certifyme/certifyme#cert_pane_nid_625336). And if you want to see how it fits into an actual enterprise credentialing program, [a demo with our team](https://info.certifyme.online/request-demo) is the fastest way to get specific answers to your specific situation.

<br>

## Frequently Asked Questions

### Is CertifyMe officially certified for Open Badge 3.0?

Yes — and "officially" is the operative word. CertifyMe has passed the 1EdTech conformance certification process for Open Badge 3.0. That means it's been independently tested, not self-declared. The certification is publicly listed at [site.imsglobal.org/certifications/certifyme/certifyme](https://site.imsglobal.org/certifications/certifyme/certifyme#cert_pane_nid_625336).

### What is 1EdTech and why does their certification matter?

1EdTech (formerly IMS Global Learning Consortium) is the standards body that governs Open Badges, LTI, QTI, and other interoperability specifications used in education and enterprise learning globally. Their certification program requires platforms to pass a structured test suite — it's the authoritative third-party signal that a platform has implemented the standard correctly, not just claimed it.

### Which credentialing platforms actually support Open Badge 3.0?

From what's publicly documented and registry-verified as of mid-2026: CertifyMe is the platform in this space with confirmed 1EdTech certification for OB3. Some others — Certifier, for example — claim OB3 support in their documentation. Platforms like Credly and Accredible support older Open Badge versions but don't prominently foreground OB3 or W3C VC compliance. Parchment is built for transcript exchange and isn't positioned around Open Badge standards at all. I'd recommend checking the [1EdTech registry](https://site.imsglobal.org/certifications) yourself for any platform you're evaluating.

### How is Open Badge 3.0 different from version 2.0?

The biggest change is that OB3 is now built on the W3C Verifiable Credentials Data Model. That adds mandatory cryptographic signing, decentralized identifiers (DIDs), and real wallet portability. Practically: OB3 credentials are harder to forge, verifiable by any compliant system without contacting the issuer's platform, and part of the same global trust infrastructure used by governments and financial institutions. OB2 credentials don't have those properties.

### Can Open Badge 3.0 credentials be verified without contacting CertifyMe?

Yes — that's the point of the cryptographic design. The credential's proof is tied to the issuer's DID, which is a public identifier. Any compliant verifier can check the signature independently. CertifyMe's platform being online or offline doesn't affect the result of that check.

### Do I need a blockchain to issue or verify OB3 credentials?

No. This is a common misconception. OB3 credentials are based on cryptographic signing and DIDs — neither of which requires a blockchain. Some implementations optionally anchor parts of their DID infrastructure to a blockchain, but the core OB3 standard and verification process works without it.

### How does CertifyMe handle credential revocation under OB3?

Revocation is part of the OB3 specification, and CertifyMe implements it correctly — which is what the 1EdTech certification validates. When a credential is revoked, its status updates immediately, and any verifier checking it against the credential status endpoint will see it as invalid. This can be triggered manually or programmatically via API.

### Is Open Badge 3.0 suitable for regulated industries like healthcare or financial services?

It was designed for exactly this. The cryptographic signing, independent verifiability, and audit-ready structure of OB3 credentials address the specific integrity requirements that regulated industries face. CertifyMe's enterprise implementation adds the administrative controls and revocation capabilities that compliance programs typically need on top.

### What's the difference between 1EdTech certification and a platform saying it's "OB3 compliant"?

Certification means the platform passed an independent, structured test suite administered by 1EdTech and is listed in their public registry. "Compliant" is what a platform says about itself. They're not the same thing — and for enterprise procurement, the distinction matters.

### How do I see CertifyMe's actual 1EdTech certification?

Go to [site.imsglobal.org/certifications/certifyme/certifyme](https://site.imsglobal.org/certifications/certifyme/certifyme#cert_pane_nid_625336). You'll see the certification listing, the standard covered, and the conformance details. I always recommend doing this check yourself — don't just take a vendor's word for it, including ours.
