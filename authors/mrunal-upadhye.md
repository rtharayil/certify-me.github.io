---
title: "Mrunal Upadhye | Content Writer at CertifyMe"
description: "Mrunal Upadhye is a content writer at CertifyMe specialising in digital credentials, open badges, and the future of verifiable learning records."
layout: V4LayoutContent
permalink: /authors/mrunal-upadhye
sitemap.priority: 0.6
---

<section class="inner-page-hero py-100">
  <div class="container">
    <div class="row justify-content-center">
      <div class="col-xl-8">

        <div class="text-center mb-60">
          <h1 class="s-46 w-700">Mrunal Upadhye</h1>
          <p class="s-20 color--grey">Content Writer · CertifyMe</p>
        </div>

        <div class="txt-block">
          <p class="s-18">Mrunal Upadhye is a content writer at CertifyMe with a focus on digital credentialing, open badges, and the evolving landscape of verifiable learning records. With a deep interest in how technology is reshaping education and workforce development, Mrunal creates in-depth articles that help institutions understand the value of digital credentials — from micro-credentials and stackable badges to digital transcripts and career intelligence tools.</p>

          <p class="s-18">Her writing covers topics including Open Badges 3.0 standards, LMS integrations, credential verification, and best practices for institutions issuing at scale.</p>

          <h2 class="s-30 w-700 mt-50">Recent Articles</h2>
          <ul>
            {% assign author_posts = site.blog | where: "author", "Mrunal Upadhye" | sort: "date" | reverse %}
            {% for post in author_posts limit: 10 %}
            <li class="mb-10"><a href="{{ post.url }}">{{ post.title }}</a></li>
            {% endfor %}
          </ul>
        </div>

      </div>
    </div>
  </div>
</section>
