---
title: "Security, Compliance & Data Residency | CertifyMe"
description: "Review CertifyMe's SOC 2 Type II scope, ISO management-system certifications, enterprise SSO/MFA, privacy processes and contractual data-residency requirements."
layout: V4LayoutInnerpages
render_content: true
permalink: /security/
seo_pillar: true
breadcrumb_label: "Security and Trust"
last_modified_at: "2026-10-03"
sitemap.priority: 0.9
HeroTitle: Security and Governance for Institutional Credentials
HeroText: "Review security evidence, privacy responsibilities and verification dependencies before an institutional rollout. CertifyMe is SOC 2 Type II Attested, with management-system certifications covering information security, privacy, quality, environmental management and business continuity."
HeroImage: /images/iso_27001-1.png
BoxContentTitle: "Institutional trust requires evidence and clear responsibilities"
BoxContentText: "CertifyMe serves 5K+ institutions and 1M+ learner wallets worldwide. Enterprise SSO and MFA are standard. Hosting is available across the globe; specific residency, transfer, retention and deletion requirements are agreed contractually. Certification and attestation scopes are distinct from guarantees about every credential, receiving system or future service."
BoxImage: /images/iso-27001-image.png
Feature1Image: /images/iso_27001-1.png
Feature1Title: Information Security Management — ISO/IEC 27001:2022
Feature1Text: "The supplied certificate covers the information security management system for SaaS digital-credential activities. Access-control, risk-management and incident-response requirements should be assessed alongside the institution's own responsibilities. The owner confirms completed 2026 surveillance and active status; printed expiry is 4 June 2027."
Feature2Image: /images/iso-27701.png
Feature2Title: Privacy, Quality and Business Continuity
Feature2Text: "ISO/IEC 27701:2019 covers privacy information management; ISO 9001:2015 covers quality management; ISO 22301:2019 covers business continuity. ISO 14001:2015 concerns environmental management, not cybersecurity. Ask for the relevant certificate scope and current maintenance evidence during procurement."
Feature3Image: /images/gdpr-image.png
Feature3Title: GDPR Policy, DPA and Contractual Data Residency
Feature3Text: "CertifyMe's enterprise GDPR policy, effective 1 July 2026, describes controller/processor responsibilities, transfer safeguards, retention, incident response and subprocessors. It is a policy, not a GDPR certification. Agree residency and transfer requirements during contracting; request the current subprocessor list and DPA. Minimise learner attributes rather than assuming credentials contain no personal data."
Feature4Title: Cryptographic Proof, Issuer Trust and Credential Status
Feature4Text: "A QR code or verification link directs a verifier to credential information; it is not itself cryptographic proof. Verify supported signatures, issuer authority, validity and applicable status or revocation information. Verification can require issuer keys, status services or other network resources. A valid signature demonstrates integrity and its signing authority, not independent identity verification or employment suitability."
FAQTitle: Institutional Security Questions
FAQText: "Scope, evidence and shared responsibilities for institutional procurement."
faqs:
  - question: "What does CertifyMe's SOC 2 Type II report cover?"
    answer: "The supplied restricted-use report covers Security, Availability and Confidentiality for the examination period 1 February–30 April 2026. SOC 2 is an attestation, not a certification. Obtain the report through the procurement process and assess complementary customer and subservice controls."
  - question: "Are SSO and MFA included for enterprise customers?"
    answer: "Yes. SSO and MFA are standard at the enterprise level. Confirm authentication protocols, enforcement policies, account roles and implementation details for your institution."
  - question: "Where is institutional data hosted?"
    answer: "Hosting is available across the globe. Specific residency, processing, support access, backups and cross-border transfers are contractual matters; global hosting does not mean every account automatically has a particular residency guarantee."
  - question: "Is the GDPR policy a certification?"
    answer: "No. The enterprise GDPR policy describes privacy processes and contractual responsibilities. Request the applicable DPA, transfer safeguards and subprocessor list; it does not establish independent GDPR certification."
  - question: "Does cryptographic verification eliminate issuer dependencies?"
    answer: "No. Verification can depend on available issuer keys, status resources and supported formats. Institutions should plan key management, revocation, correction, access and continuity rather than assuming that a signature removes all dependencies."
---

<section class="container py-5" aria-labelledby="trust-evidence-title">
  <h2 id="trust-evidence-title">Evidence for institutional procurement</h2>
  <p>{{ site.data.approved_claims.soc.label }}: examination period {{ site.data.approved_claims.soc.period }}; criteria {{ site.data.approved_claims.soc.criteria }}. The restricted-use report is available through an appropriate procurement process, not as a public website download. Review its scope, complementary customer controls and subservice responsibilities before relying on it for your implementation.</p>
  <div class="table-responsive" tabindex="0" role="region" aria-label="Certification scopes and printed expiry dates">
    <table class="table">
      <thead><tr><th scope="col">Management-system standard</th><th scope="col">Scope</th><th scope="col">Printed expiry</th></tr></thead>
      <tbody>{% for certificate in site.data.approved_claims.iso %}<tr><th scope="row">{{ certificate.standard | escape }}</th><td>{{ certificate.scope | escape }}</td><td>{{ certificate.expiry | escape }}</td></tr>{% endfor %}</tbody>
    </table>
  </div>
  <p>Document review and owner confirmations updated {{ site.data.approved_claims.reviewed_on }}. Printed expiry dates are not substitutes for continuing surveillance or certificate-status checks. The owner confirms current maintenance for the four certificates whose 2026 surveillance dates were queried; independent registry status was not checked here.</p>
  <h3>Shared responsibilities before rollout</h3>
  <p>Agree identity and access policies, evidence requirements, retention, correction, revocation, backup and continuity arrangements. Validate the actual <a href="/api/">API permissions</a>, <a href="/allIntegrations.html">integration workflows</a> and <a href="/certificate-verification">credential-verification process</a> for your institution.</p>
  <p>Standards scope: <a href="https://site.imsglobal.org/certifications/certifyme/certifyme" target="_blank" rel="noopener noreferrer">1EdTech's registry</a> lists Open Badges 3.0 Issuer and CLR 2.0 Issuer/Displayer roles. These certifications do not establish universal wallet acceptance or certify every individual record.</p>
</section>