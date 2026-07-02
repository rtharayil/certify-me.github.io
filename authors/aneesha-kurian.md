---
title: "Aneesha Kurian | Software Engineer at CertifyMe"
description: "Aneesha Kurian is a software engineer at CertifyMe, writing about digital credential technology, API integrations, and open standards for verifiable credentials."
layout: V4LayoutContent
permalink: /authors/aneesha-kurian
sitemap.priority: 0.6
---

<section class="inner-page-hero py-100">
  <div class="container">
    <div class="row justify-content-center">
      <div class="col-xl-8">

        <div class="text-center mb-60">
          <h1 class="s-46 w-700">Aneesha Kurian</h1>
          <p class="s-20 color--grey">Software Engineer · CertifyMe</p>
        </div>

        <div class="txt-block">
          <p class="s-18">Aneesha Kurian is a software engineer at CertifyMe with expertise in credential verification systems, API integrations, and W3C Verifiable Credentials standards. She writes about the technical foundations of digital credentialing — covering topics from Open Badges 3.0 implementation to LMS integration patterns and privacy-preserving credential verification.</p>

          <p class="s-18">Her articles bridge the gap between technical depth and practical guidance, helping both developers and institutional administrators understand how to implement robust, standards-compliant credentialing systems.</p>

          <h2 class="s-30 w-700 mt-50">Recent Articles</h2>
          <ul>
            {% assign author_posts = site.blog | where: "author", "Aneesha Kurian" | sort: "date" | reverse %}
            {% for post in author_posts limit: 10 %}
            <li class="mb-10"><a href="{{ post.url }}">{{ post.title }}</a></li>
            {% endfor %}
          </ul>
        </div>

      </div>
    </div>
  </div>
</section>
