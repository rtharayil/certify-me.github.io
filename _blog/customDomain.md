---
layout: V4LayoutSingleBlogPost
title: CertifyMe lets you map a custom domain to your Credential Pages .

description: CertifyMe.Online allows you to map a custom domain to your Credential Pages, enhancing your brand presence.

abstract: 
author : Aneesha Kurian
topic: news
imageLink: /img/blog/credential/12.png
featured: true
seo_keywords: "custom domain digital certificates, map subdomain CertifyMe, CNAME record guide, white label credentials, GoDaddy CNAME setup"
faqs:
  - question: "Why should I bother setting up a custom domain instead of just using the default one?"
    answer: "Honestly, it’s all about trust. When a student gets a certificate link that says 'certificate.youruniversity.com' instead of a third-party URL, it just feels more official and keeps your branding front and center."
  - question: "Is the CNAME setup really as complicated as it sounds?"
    answer: "It's actually pretty straightforward. You just need to point your chosen subdomain to app.certifyme.online in your DNS settings. If you’ve ever verified a site for Google Search Console, you’ve basically already done this kind of work."
  - question: "Will I need to buy an SSL certificate for my new subdomain?"
    answer: "No need to worry about that. Once you’ve mapped the domain and let us know, we handle the SSL certificate creation on our end so everything stays secure and encrypted."
  - question: "How long does it take for the custom domain to start working?"
    answer: "Usually, the DNS changes take anywhere from a few minutes to an hour to propagate, though GoDaddy and others sometimes say it can take longer. In my experience, it's usually ready by the time you've finished your second cup of coffee."
---

## Steps 1: Choose your SubDomain

Few suggestions

1. badge.yourdomain.com

1. certificate.yourdomain.com

1. credential.yourdomain.com

1. ?.yourdomain.com

<br>

## Step 2: Map your SubDomain to app.certifyme.online

Under your DNS and a CName record to make your subdomain point to the credential system server at app.certifyme.online. For example, if you had chosen your subdomain as “certificate.yourdomain.com”, below should be your CName records. (You might need your IT team's help )

```
certificate.yourdomain.com app.certifyme.online

```

### Step 2.1 , How to set up a CNAME with GoDaddy

Your custom domain is activated immediately, but for the mapping to be effective, you have to add the right CNAME in your domain’s DNS records. How you add a CNAME to your DNS records depends on your hosting service.

Here’s a brief guide to setting up a CNAME with GoDaddy:

1.  Sign in to your GoDaddy account and go to the My Products tab.

2.  Click the domain you want to update.

3.  Click Domain Settings.

4.  In the Additional Settings section, click Manage DNS.

5.  On the DNS Management page, in the Records section, click Add.

6.  From the Type drop-down list, choose CNAME.

7.  In the Host field, type type the respective subdomain  (e.g. "certificate.yourdomain.com" )

8.  In the Points to field, type your CertifyMe domain  ie  app.certifyme.online.

9.  Leave the TTL setting as 1 hour.

10. Click Save.

11. Update us sending an email to CertifyMe with  your sub domain deatils so that we can create your SSL certificate

<br>

### Step 2.2 , How to set up a CNAME with Google Domain

[Click here to learn how set up a CNAME with Google Domains](https://support.google.com/a/answer/47283?hl=en)

Mapping 

```
certificate.yourdomain.com --->  app.certifyme.online

```

### Step 2.3  , How to set up a CNAME with BigRock Domain

[Click here to learn how set up a CNAME with BigRock](https://support.bigrock.com/index.php?/Knowledgebase/Article/View/1217/5/adding-a-cname-record-on-dns-management)

Mapping 

```
certificate.yourdomain.com --->  app.certifyme.online

```

