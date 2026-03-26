---
layout: V4Layout-Glossary-Single-Post

category: "Verifiable Credentials - Basics"

title: "What Standards Govern Verifiable Credentials (W3C, Open Badges, etc.)?"

description: "Understand the standards that govern verifiable credentials, including W3C, Open Badges 3.0, and Europass, and why they matter for secure credential issuance around the globe."

imageLink: /assets4/images/Glossary/what-standards-govern-verifiable-credentials.png


abstract: 
topic: news
author: Mrunal Upadhye
featured: true

---

Verifiable credentials are primarily governed by the World Wide Web Consortium (W3C) through its Verifiable Credentials Data Model. 

Other standards such as Open Badges 3.0, Europass, SD-JWT, and OID4VC are built on top of W3C or address specific gaps it doesn't cover, such as how credentials are exchanged in production environments.

This article covers each standard, what it does, and how they relate to one another.

<br>

## TL;DR

1. W3C defines the core data model. Everything else builds on it or extends it for specific use cases.

1. W3C has two active versions: VC Data Model 1.1 (widely deployed) and VC Data Model 2.0 (updated proof formats, growing adoption).

1. Open Badges 3.0 applies the W3C model to skills and achievement credentials. Europass applies it to education and workforce credentials within the EU.

1. SD-JWT handles selective disclosure. OID4VC defines how credentials are issued and presented over the wire.

1. Standards govern the technical side only. Who's authorised to issue credentials depends on regulations and accreditation bodies, not the spec.

<br>

## The Role of Standards in Verifiable Credentials

Standards exist to create trust between parties who don't know each other. In the [verifiable credentials](https://www.certifyme.online/blog/Understanding-W3C-Verifiable-Credentials.html) ecosystem, they define the rules that issuers, holders, and verifiers all agree to follow.

Concretely, they require credentials to be independently verifiable (without calling the issuer), tamper-evident, and privacy-respecting. They also ensure interoperability, i.e, a credential issued on one platform can be verified on another, provided both follow the same standard.

A [digital credentialing platform](https://www.certifyme.online/blog/What-is-Digital-Credential-Management-Platform.html) built on open standards is one you can audit, integrate with, and migrate away from if needed. That's a more useful signal than any marketing claim.

<br>

## Standards That Govern Verifiable Credentials Worldwide

### World Wide Web Consortium (W3C) Verifiable Credentials

The [W3C Verifiable Credentials Data Model](https://www.w3.org/TR/vc-data-model-2.0/) is the base layer. It defines the structure that all compliant credentials share: @context, type, issuer, credentialSubject, and a proof block. The proof block contains the cryptographic signature (typically Ed25519 or ECDSA), which is what makes independent verification possible.

W3C has two active versions. VC Data Model 1.1 is stable and widely implemented. VC Data Model 2.0 updates proof mechanisms and extensibility. Most production systems run on 1.1, but 2.0 adoption is picking up in government and enterprise deployments.

W3C VCs are closely tied to [Decentralised Identifiers (DIDs)](https://www.w3.org/TR/did-core/). A DID is a resolvable identifier for an issuer or holder that doesn't rely on a central registry. When a credential lists a DID as its issuer, a verifier resolves that DID to retrieve the issuer's public key and confirm the signature. That's what makes verification genuinely decentralised.

Privacy is a core requirement of the spec, not an add-on. Zero-knowledge proofs and holder-controlled disclosure are both part of the W3C model.

<br>

### Open Badges 3.0

[Open Badges 3.0](https://1edtech.org/), maintained by the 1EdTech Consortium, applies the W3C data model to skills, achievements, and learning outcomes. Credentials take the form of a badge image backed by structured metadata: issuer details, badge criteria, issue date, recipient information, and a cryptographic proof.
The key upgrade from Open Badges 2.0 is full W3C alignment. Version 2.0 used its own verification mechanism, which meant badges couldn't be stored in standard VC wallets or verified by third-party verifiers. 

Version 3.0 fixes that. An Open Badges 3.0 credential is a W3C VC, so it works with any wallet or verifier that supports the data model.

<br>

### Europass

[Europass](https://europa.eu/europass/en) is managed by the European Commission. It's W3C-aligned and designed specifically for cross-border recognition of education and workforce credentials across EU member states.

If you're building for EU markets — whether as an EU-registered organisation or one targeting EU citizens in education or employment — your platform needs to support Europass-compliant issuance.
Europass sits within the [eIDAS 2.0](https://digital-strategy.ec.europa.eu/en/policies/eidas-regulation) framework, which mandates a European Digital Identity Wallet for storing and presenting credentials across member states. For developers targeting the EU, eIDAS 2.0 compliance is a hard requirement, not optional.

<br>

### SD-JWT and OpenID for Verifiable Credentials (OID4VC)

W3C, Open Badges, and Europass define what a credential contains. They don't fully specify how credentials move between systems. That's what SD-JWT and OID4VC address.

[SD-JWT (Selective Disclosure JWT)](https://datatracker.ietf.org/doc/draft-ietf-oauth-selective-disclosure-jwt/) is an IETF specification that lets holders present only specific fields from a credential. A holder can prove they're over 18 without disclosing their date of birth, for example. SD-JWT is a core part of the eIDAS 2.0 architecture and is being adopted in identity wallets globally.

[OID4VC](https://openid.net/sg/openid4vc/) covers the protocols for credential issuance (OID4VCI) and presentation (OID4VP) using OAuth 2.0 and OpenID Connect flows. Most enterprise identity infrastructure already runs on OAuth/OIDC, so OID4VC gives developers a practical path to integrate VC issuance without rebuilding existing systems from scratch. It's becoming the default protocol in production VC deployments.

<br>

### ISO/IEC 18013-5 (mDL)

[ISO/IEC 18013-5](https://www.iso.org/standard/69084.html) defines the data model and communication protocols for mobile driver's licences (mDL). It's already in use across several US states, the EU, and Australia. 

The standard shares the same principles as W3C VCs — cryptographic verification and holder-controlled disclosure — and some implementations are beginning to bridge the two ecosystems.

<br>

## Conclusion

Standards such as W3C Verifiable Credentials, Open Badges 3.0, and Europass play a key role in making digital credentials trustworthy and interoperable. They define how credentials are issued, verified, and protected, ensuring consistency across platforms and regions.

However, these standards only govern the technical side of credentialing. They do not decide who is allowed to issue credentials. Issuer authority still depends on regional regulations, industry rules, and accreditation bodies. 

Understanding both standards and issuer eligibility is essential to issuing verifiable credentials that are secure, reliable, and widely accepted. If you want to partner with a verifiable credentialing provider who understands these standards and provides a custom solution that works for your organization’s needs, [book a demo with the CertifyMe team](https://info.certifyme.online/request-demo) today. 
