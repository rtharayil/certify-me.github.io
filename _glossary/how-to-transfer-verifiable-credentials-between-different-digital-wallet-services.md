---
layout: V4Layout-Glossary-Single-Post

category: "Verification, Security & Trust"

title: "How to transfer verifiable credentials between different digital wallet services?"

description: "Learn how to migrate verifiable credentials between digital wallet services, including moving from Accredible or closed systems to CertifyMe step by step."

imageLink: /assets4/images/Glossary/how-to-transfer-verifiable-credentials-between-different-digital-wallet-services.png


abstract: 
topic: news
author: Mrunal Upadhye
featured: true

---

SMigrating verifiable credentials from one platform to another is straightforward if both systems follow W3C and Open Badges standards, and more involved if you're moving from a closed or traditional system. 

This article covers both scenarios as step-by-step guides. The key difference between the two comes down to one thing: whether your current system can export structured data.

<br>

## TL;DR

1. If your current platform is W3C and Open Badges compliant (like Accredible), migration involves exporting credential data, recreating templates in CertifyMe, and using bulk upload to reissue — the open standards make this portable by design.

1. The essential dataset to export includes issuer details, recipient details, credential title, issue and expiry dates, credential ID, and verification URLs — missing any of these creates problems during reissuance.

1. Migrating from a closed or traditional system is harder only at the data collection stage — once you have a properly structured CSV, the reissuance process is identical.

1. Open standards compliance is what prevents vendor lock-in — credentials issued under W3C and Open Badges remain portable across any compatible platform, now and in the future.

<br>

## Path 1: Migrating from a Standards-Compliant Platform 

If your current platform follows [W3C Verifiable Credentials](https://www.certifyme.online/blog/Understanding-W3C-Verifiable-Credentials.html) and Open Badges standards, the migration is structured and predictable. Interoperability is built into both ends by design.

<br>

### Step 1: Export Your Credential Data

Log into your existing platform dashboard and locate the section where issued credentials are stored. Most compliant platforms allow data export in CSV or JSON format. CSV is generally easier to work with for bulk migration.

Some platforms let you export directly from the dashboard. Others require you to contact support for a full data export. Either way, make sure your exported dataset includes all of the following before moving on:

1. Issuer details
1. Recipient name and email
1. Credential title and description
1. Issue date and expiry date
1. Credential ID
1. Verification URLs

Missing metadata at this stage means missing information in the reissued credentials.

<br>

### Step 2: Recreate Your Templates

Before importing any data, recreate your credential templates on the new platform. If you had five certificate designs and three badge designs on the previous platform, you'll need all eight before bulk upload. White-label customization options mean you can typically match the original design closely.

<br>

### Step 3: Bulk Upload and Reissue

Connect with the new platform's team to explain your migration. They'll guide you through field mapping — matching your CSV columns to the required fields — and then bulk issuance takes care of the rest. The platform generates new standards-compliant verifiable credentials for each recipient in the dataset.

<br>

### Step 4: Test Before You Communicate

After reissuance, test a sample of credentials before notifying anyone. Confirm that all five verification methods work correctly:

1. QR code scan
1. Unique credential ID
1. ID tagging
1. OTP-based verification
1. Cryptographic signature validation

Catching issues here is far easier than handling them after recipients have been notified.

<br>

### Step 5: Notify Credential Holders

Email all recipients to let them know their credentials have been reissued on a new platform. Most platforms also send an automated email at issuance, so you can pair that with a separate announcement on your website or social channels if needed.

<br>

## Path 2: Migrating from a Traditional System

Most organizations haven't yet adopted a verifiable credentialing platform. They're working from spreadsheets, static PDFs, or internal databases with no structured export function. This path is harder only at the first step.

<br>

### Step 1: Build Your CSV Manually

Closed systems won't give you a clean export. You'll need to pull data from wherever it lives and build a CSV file yourself. This is the one step that takes more effort than the standards-compliant migration.
Your CSV needs to include:

1. Recipient name
1. Recipient email or unique identifier
1. Credential title
1. Issue date and expiry date
1. Description or skills covered
1. Any relevant evidence links

Take the time to get this right. Errors here carry through into the issued credentials. The broader question of [choosing a credential provider](https://www.certifyme.online/blog/how-to-choose-VC-provider-for-secure-student-record-management.html) for your new system is worth thinking through in parallel — specifically whether it supports the verification methods, revocation controls, and open standards that prevent this situation from repeating.

<br>

### Step 2: Build Templates

Same process as Path 1. Create your certificate and badge templates on the new platform, filling in the program details, eligibility criteria, and skills acquired.

<br>

### Step 3: Bulk Upload and Reissue

Once your CSV is ready and templates are set, upload the file through the bulk upload feature. Check the preview to confirm field mapping is correct, then initiate issuance. The platform generates verifiable credentials for every recipient, each with QR codes, verification methods, and standards-compliant metadata.

<br>

### Step 4: Notify Recipients

Because recipients in a closed system migration won't have received credentials through the new platform before, communication here needs a little more context. Let them know:

1. Their credentials have been reissued on a new platform
1. How to access their updated credentials
1. How to store them in a digital wallet
1. How to share them with verifiers

<br>

## Think About This Before You Commit to Any Platform

If you're migrating now, you already know what vendor lock-in feels like. The reason migration is straightforward between standards-compliant platforms is because W3C and Open Badges compliance builds portability into the credential itself — not into a specific vendor's system.

Whatever platform you choose next, make sure it follows these open standards. That's the only guarantee that you won't find yourself in the same position again two or three years from now.

If you're evaluating [CertifyMe](https://www.certifyme.online/) as part of this decision, it's worth having a direct conversation rather than trying to figure out compatibility and migration scope on your own. The team can walk you through exactly what your migration would involve based on your current setup, whether you're coming from Accredible, a proprietary system, or a folder of PDFs.

You can [book a demo with us](https://info.certifyme.online/request-demo?_gl=1*17cf2r9*_gcl_au*MTg4MDEwMTQyOS4xNzcwMDMwMTU1*_ga*MTA3NzY4NzM1My4xNzU0Mzg5MzQ1*_ga_8CWQ2KJW5K*czE3NzQ5MzgyMzYkbzI5MiRnMSR0MTc3NDkzODg3NiRqNTgkbDAkaDA.) to start that conversation.
