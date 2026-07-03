---
layout: V4LayoutSingleBlogPost
title: CertifyMe API Guide For Users

description: A simple step-by-step guide on how to add custom info like names or dates when sending digital certificates through CertifyMe

abstract: 

topic: news
author : Mrunal Upadhye
imageLink: /img/blog/CertifyMe-API-Guide-For-Users.png
featured: true
seo_keywords: "CertifyMe API guide, custom attributes API, digital certificate API, dynamic data fields, CertifyMe developer documentation"
faqs:
  - question: "What exactly counts as a custom attribute in the CertifyMe API?"
    answer: "In my experience, anything that isn't the standard name or email can be a custom attribute. Think of things like 'EventDate', 'CourseName', or even a specific 'Credits' count—if you've defined it in your template, you can send it via the API using that Custom. prefix."
  - question: "Does the capitalization of my field names actually matter?"
    answer: "Yes, it really does. I've spent enough time debugging to tell you that if your template says 'eventdate' and your API call says 'EventDate', it won't map correctly. Keep them exactly the same, case and all."
  - question: "Is there a limit to how many custom fields I can include in one request?"
    answer: "Honestly, you can include as many as you've set up in your template. I usually recommend only sending what you actually need on the certificate to keep your JSON payloads clean, but the API won't stop you if you have a dozen attributes."
  - question: "Why do I need to add 'Custom.' before my field names in the code?"
    answer: "That's just how our system differentiates between standard fields and your own custom ones. It's mandatory for every single dynamic field you create, so don't skip it or the data won't show up on the final credential."
---

## Handling Custom Attributes in Templates

CertifyMe allows you to dynamically insert custom data fields into your digital credentials using **custom attributes**. This guide outlines how to use the CertifyMe API to assign these attributes during the credential issuance process.

> **Audience:** Developers integrating CertifyMe’s credential issuance API into their systems, particularly those using custom fields in templates.

<br>

## Overview

Custom attributes are dynamic data fields defined within a **template** on the CertifyMe platform. These can include information such as `"eventdate"`, `"Credits"`, `"CourseName"`, and more. When issuing a credential via API, you must provide these custom values prefixed with `Custom.` followed by the **exact field name** used in the template.

<br>

## Endpoint Information

**URL:**  
`https://eu2.certifyme.org/api/v2/credential`

**Method:**  
`POST`

**Headers:**
```
Authorization: <API Token>
accept: application/json
content-type: application/json
```

<br>

## Request Body Parameters
<style>
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            font-size: 18px;
            text-align: left;
        }
        th, td {
            border: 1px solid #000;
            padding: 8px 12px;
        }
        th {
            background-color: #f4f4f4;
        }
</style>

<table border="1" cellspacing="0" cellpadding="5">
  <thead>
    <tr>
      <th>Field</th>
      <th>Type</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>name</code></td>
      <td>string</td>
      <td>Recipient's full name.</td>
    </tr>
    <tr>
      <td><code>email</code></td>
      <td>string</td>
      <td>Recipient's email address.</td>
    </tr>
    <tr>
      <td><code>template_ID</code></td>
      <td>string</td>
      <td>ID of the template to be used (retrieved from the CertifyMe dashboard).</td>
    </tr>
    <tr>
      <td><code>text</code></td>
      <td>string</td>
      <td>Additional text shown on certificate (e.g., designation).</td>
    </tr>
    <tr>
      <td><code>verify_mode</code></td>
      <td>string</td>
      <td>Verification type (e.g., <code>SSN</code>, <code>Code</code>, <code>None</code>).</td>
    </tr>
    <tr>
      <td><code>verify_code</code></td>
      <td>string</td>
      <td>Verification code if applicable.</td>
    </tr>
    <tr>
      <td><code>Custom.&lt;Field&gt;</code></td>
      <td>string</td>
      <td>Custom attributes defined in the template (see examples below).</td>
    </tr>
  </tbody>
</table>

> Custom field names **must exactly match** those defined in your CertifyMe template (case-sensitive).  
> Prefix `Custom.` is **mandatory** for all custom fields.

<br>

## Custom Attribute Syntax

```json
"Custom.<FieldName>": "<Value>"
```

Where:
- `<FieldName>` is the exact name of the custom field as defined in the template.
- `<Value>` is the value you'd like to assign to that field.

<br>

## Example Requests

### 1. Single Custom Attribute: `eventdate`

```bash
curl --request POST \
  --url https://eu2.certifyme.org/api/v2/credential \
  --header 'Authorization: <API Token>' \
  --header 'accept: application/json' \
  --header 'content-type: application/json' \
  --data '
{
  "name": "Anju",
  "template_ID": "12",
  "email": "anju@certifyme.cc",
  "text": "Manager, CertifyMe",
  "verify_mode": "SSN",
  "verify_code": "123456",
  "Custom.eventdate": "29th April"
}'
```

### 2. Multiple Custom Attributes: `eventdate`, `Credits`

```bash
curl --request POST \
  --url https://eu2.certifyme.org/api/v2/credential \
  --header 'Authorization: <API Token>' \
  --header 'accept: application/json' \
  --header 'content-type: application/json' \
  --data '
{
  "name": "Anju",
  "template_ID": "12",
  "email": "anju@certifyme.cc",
  "text": "Manager, CertifyMe",
  "verify_mode": "SSN",
  "verify_code": "123456",
  "Custom.eventdate": "29th April",
  "Custom.Credits": "100"
}'
```

### 3. Extended Example with More Custom Fields

```bash
curl --request POST \
  --url https://eu2.certifyme.org/api/v2/credential \
  --header 'Authorization: <API Token>' \
  --header 'accept: application/json' \
  --header 'content-type: application/json' \
  --data '
{
  "name": "Anju",
  "template_ID": "12",
  "email": "anju@certifyme.cc",
  "text": "Manager, CertifyMe",
  "verify_mode": "SSN",
  "verify_code": "123456",
  "Custom.eventdate": "29th April",
  "Custom.Credits": "100",
  "Custom.CourseName": "Advanced Leadership"
}'
```

<br>

## Tips for Success

- Custom field names must be an **exact match** (case-sensitive).
- Prefix `Custom.` is **mandatory**.
- You may include **as many custom fields** as are defined in the template.
- Use the **API playground** to generate and validate request payloads.

<br>

## Support

For support or questions, please contact **support@certifyme.cc**.

