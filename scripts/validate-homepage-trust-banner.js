#!/usr/bin/env node
"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const { chromium } = require("playwright");
const root = path.resolve(__dirname, "..");
const base = `https://${process.env.REPLIT_DEV_DOMAIN}`;

(async () => {
  const response = await fetch(`${base}/assets4/images/certifyme-global-impact-map.webp`);
  assert.equal(response.status, 200);
  assert(Buffer.from(await response.arrayBuffer()).equals(
    fs.readFileSync(path.join(root, "assets4/images/certifyme-global-impact-map.webp"))));
  const browser = await chromium.launch({
    executablePath: execFileSync("which", ["chromium"], { encoding: "utf8" }).trim(),
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
  });
  try {
    for (const width of [320, 390, 768, 991, 1024, 1440, 1920]) {
      const page = await browser.newPage({ viewport: { width, height: 1100 }, ignoreHTTPSErrors: true });
      await page.route("**/*", async route => {
        const url = new URL(route.request().url());
        if (url.origin !== new URL(base).origin) return route.abort();
        if (url.pathname.startsWith("/assets4/")) {
          const file = path.resolve(root, "." + decodeURIComponent(url.pathname));
          if (file.startsWith(path.join(root, "assets4") + path.sep) && fs.existsSync(file))
            return route.fulfill({ path: file });
        }
        return route.continue();
      });
      await page.goto(base, { waitUntil: "domcontentloaded" });
      const banner = page.locator("#homepage-trust-banner");
      assert.equal(await banner.count(), 1);
      await banner.locator(".trust-responsive__institutions").scrollIntoViewIfNeeded();
      await page.waitForFunction(() => {
        return [...document.querySelectorAll("#homepage-trust-banner img")]
          .every(image => image.complete && image.naturalWidth > 0);
      });
      await banner.locator("img").evaluateAll(images => Promise.all(images.map(image => image.decode())));
      const data = await banner.evaluate(section => {
        const image = section.querySelector(".trust-responsive__map img");
        const rect = image.getBoundingClientRect();
        const targets = ["institution-outcomes", "homepage-trust-banner", "credential-layers-intro"];
        const elements = targets.map(id => document.getElementById(id));
        return {
          dimensions: [image.naturalWidth, image.naturalHeight],
          fit: getComputedStyle(image).objectFit,
          mask: getComputedStyle(image).maskImage,
          filter: getComputedStyle(image).filter,
          background: getComputedStyle(section).backgroundColor,
          oldContent: Boolean(section.querySelector(".homepage-trust-banner__artwork, .homepage-trust-banner__accessible-title")),
          alt: image.alt,
          g2Removed: !section.querySelector(".homepage-trust-banner__recognition"),
          ratio: rect.width / rect.height,
          order: elements.every((e, i) => !i || elements[i - 1].nextElementSibling === e),
          outcomesGap: section.getBoundingClientRect().top
            - document.querySelector("#institution-outcomes .credential-institution-outcomes__story").getBoundingClientRect().bottom,
          overflow: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - innerWidth,
          heading: section.querySelector("h2").textContent.replace(/\s+/g, " ").trim(),
          stats: [...section.querySelectorAll(".trust-responsive__stats strong")].map(node => node.textContent.trim()),
          regions: [...section.querySelectorAll(".trust-responsive__regions > span")].map(node => node.childNodes[0].textContent.trim()),
          sectors: [...section.querySelectorAll(".trust-responsive__sectors li")].map(node => node.textContent.trim()),
          logos: [...section.querySelectorAll(".trust-responsive__logo img")].map(node => node.alt),
          logoSizes: [...section.querySelectorAll(".trust-responsive__logo img")].map(node => ({
            height: parseFloat(getComputedStyle(node).height),
            fit: getComputedStyle(node).objectFit,
            src: node.getAttribute("src"),
            centerY: node.getBoundingClientRect().top + node.getBoundingClientRect().height / 2,
          })),
          withinViewport: [...section.querySelectorAll("h2, p, li, img, a")].every(node => {
            const bounds = node.getBoundingClientRect();
            return bounds.left >= -1 && bounds.right <= innerWidth + 1;
          }),
          font: getComputedStyle(section.querySelector("h2")).fontFamily,
          size: parseFloat(getComputedStyle(section.querySelector("h2")).fontSize),
          heroFont: getComputedStyle(document.querySelector("h1")).fontFamily,
          heroSize: parseFloat(getComputedStyle(document.querySelector("h1")).fontSize),
          blendBackdrop: getComputedStyle(section).zIndex,
          ctaAlignment: getComputedStyle(section.querySelector(".trust-responsive__action")).textAlign,
          alignment: (() => {
            const trust = section.querySelector(".trust-responsive__inner").getBoundingClientRect();
            const reference = document.querySelector(".credential-institution-outcomes__inner").getBoundingClientRect();
            const copy = section.querySelector(".trust-responsive__copy").getBoundingClientRect();
            const map = section.querySelector(".trust-responsive__map").getBoundingClientRect();
            return {
              widthDifference: trust.width - reference.width,
              leftDifference: trust.left - reference.left,
              columnRatio: map.width / copy.width,
              copyRight: copy.right,
              mapLeft: map.left,
              copyBottom: copy.bottom,
              mapTop: map.top,
            };
          })(),
        };
      });
      assert.deepEqual(data.dimensions, [960, 480]);
      assert(!data.oldContent, "Replace the flattened artwork and hidden heading with native content");
      assert.equal(data.fit, "contain");
      assert.match(data.mask, /linear-gradient/, "Blend the banner perimeter into its background");
      assert.equal(data.filter, "none", "Keep the map sharp");
      assert.equal(data.background, "rgba(0, 0, 0, 0)", "Use the continuous homepage background");
      assert.deepEqual(data.stats, ["5K+", "1M+", "Global reach"]);
      assert.deepEqual(data.regions, ["North America", "Europe", "Latin America", "Africa", "Middle East", "Asia Pacific"]);
      assert.deepEqual(data.sectors, ["Higher Education", "Government", "Enterprise", "Non-Profits", "Industry Partners"]);
      assert.deepEqual(data.logos, ["University of Europe", "IEEE", "Harvard Business Publishing", "Project Management Institute", "Indian Institute of Science", "DCU"]);
      assert(data.logoSizes.every(logo => logo.height > 0 && logo.fit === "contain"
        && /trust-logo-.+-web\.png$/.test(logo.src)),
        "Use web-sourced logos without distortion");
      assert(data.logoSizes.slice(0, 4).every(logo => logo.height <= 48)
        && data.logoSizes.slice(4).every(logo => logo.height > data.logoSizes[0].height),
        "Reduce wide wordmarks and enlarge IISc/DCU for similar visual weight");
      assert(data.logoSizes.every(logo => Math.abs(logo.centerY - data.logoSizes[0].centerY) <= 1),
        "Keep all six logos on one line at every viewport width");
      assert.equal(data.font, data.heroFont);
      assert(data.size < data.heroSize, "Banner H2 must be smaller than the hero H1");
      assert(data.withinViewport, "Keep text, artwork and the demo button inside the viewport");
      assert.equal(data.blendBackdrop, "auto", "Allow map and logo artwork to blend with the shared background");
      assert.equal(data.ctaAlignment, "left", "Preserve the approved left-aligned demo button");
      assert(Math.abs(data.alignment.widthDifference) <= 1
        && Math.abs(data.alignment.leftDifference) <= 1,
        "Match the institutional outcome's container width and horizontal alignment");
      if (width > 991) {
        assert(Math.abs(data.alignment.columnRatio - 7 / 3) < .02,
          "Match the institutional outcome's text and artwork proportions");
        assert(data.alignment.copyRight < data.alignment.mapLeft,
          "Keep desktop text on the left and artwork on the right");
      } else {
        assert(data.alignment.copyBottom <= data.alignment.mapTop,
          "Stack the trust section cleanly on mobile and tablet");
      }
      assert(data.g2Removed, "Remove the standalone G2 recognition block");
      assert(Math.abs(data.ratio - 2) < .01, "Do not distort the map");
      assert(data.order, "Trust banner must lead directly into the six layers");
      assert(Math.abs(data.outcomesGap) <= 1, "Remove the gap between institutional outcomes and the trust banner");
      assert(data.overflow <= 1, "No page overflow");
      assert.equal(data.heading, "Trusted by Institutions. Used by Learners. Valued Worldwide.");
      assert.equal(await banner.locator(".homepage-section-cta__link").count(), 1);
      assert.equal(await banner.locator(".homepage-section-cta__link").getAttribute("href"), "https://info.certifyme.online/request-demo");
      assert.match(await banner.locator(".homepage-section-cta__link").getAttribute("rel"), /noopener/);
      assert.equal(await page.locator("#badges").count(), 0);
      assert.equal(await page.locator("#why-certifyme").count(), 0);
      console.log(`Passed ${width}px: native banner, preserved content/logos, matching H2 font, blended background, zero preceding gap, no overflow.`);
      await page.close();
    }
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });