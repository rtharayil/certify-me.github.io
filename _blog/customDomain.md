---
layout: V4LayoutSingleBlogPost
title: CertifyMe lets you map a custom domain to your Credential Pages .

description: CertifyMe.Online allows you to map a custom domain to your Credential Pages, enhancing your brand presence.

abstract: 
author : Ranjith Tharayil
topic: news
imageLink: /img/blog/credential/12.png
featured: true
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

<br>

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

<br>

### Step 2.3  , How to set up a CNAME with BigRock Domain

[Click here to learn how set up a CNAME with BigRock](https://support.bigrock.com/index.php?/Knowledgebase/Article/View/1217/5/adding-a-cname-record-on-dns-management)

Mapping 

```
certificate.yourdomain.com --->  app.certifyme.online

```

