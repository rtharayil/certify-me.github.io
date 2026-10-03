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
    for (const width of [320, 390, 768, 1024, 1440]) {
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
      await banner.scrollIntoViewIfNeeded();
      const data = await banner.evaluate(section => {
        const image = section.querySelector(".homepage-trust-banner__world");
        const rect = image.getBoundingClientRect();
        const targets = ["institution-outcomes", "homepage-trust-banner", "badges", "why-certifyme", "credential-layers-intro"];
        const elements = targets.map(id => document.getElementById(id));
        return {
          values: [...section.querySelectorAll(".homepage-trust-banner__stat-value")].map(e => e.textContent.trim()),
          copies: [...section.querySelectorAll(".homepage-trust-banner__stat-copy")].map(e => e.textContent.trim()),
          sectors: [...section.querySelectorAll(".homepage-trust-banner__sector-list li")].map(e => e.textContent.trim()),
          dimensions: [image.viewBox.baseVal.width, image.viewBox.baseVal.height],
          nativeMap: image.tagName.toLowerCase() === "svg" && !image.querySelector("image") && !section.querySelector("img"),
          markers: image.querySelectorAll(".trust-map-marker").length,
          regions: [...image.querySelectorAll(".trust-map-region")].map(e => [e.dataset.region, e.dataset.sourceCenter.split(",").map(Number)]),
          g2: section.querySelector(".homepage-trust-banner__recognition").textContent.replace(/\s+/g, " ").trim(),
          ratio: rect.width / rect.height,
          order: elements.every((e, i) => !i || elements[i - 1].nextElementSibling === e),
          overflow: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - innerWidth,
          statsFit: [...section.querySelectorAll(".homepage-trust-banner__stat")].every(e => e.scrollWidth <= e.clientWidth + 1),
          heading: section.querySelector("h2").textContent.replace(/\s+/g, " ").trim(),
        };
      });
      assert.deepEqual(data.values, ["5K+", "1M+", "Global reach"]);
      assert.deepEqual(data.copies, ["Institutions trust CertifyMe", "Learners worldwide", "Across diverse regions and sectors"]);
      assert.deepEqual(data.sectors, ["Higher Education", "Government", "Enterprise", "Non-Profits", "Industry Partners"]);
      assert.deepEqual(data.dimensions, [960, 480]);
      assert(data.nativeMap, "Recreate with native vector paths, circles and text, not a raster image");
      assert.equal(data.markers, 86, "Preserve the source marker cores");
      assert.deepEqual(data.regions, [
        ["Europe", [475,99.5]], ["North America", [163.5,133.5]],
        ["Middle East", [621.5,204]], ["Asia Pacific", [834.5,267]],
        ["Latin America", [210.5,330.5]], ["Africa", [506,332]],
      ]);
      assert.match(data.g2, /4\.8\s*\/5/);
      assert.match(data.g2, /#2 Easiest To Use/);
      assert.match(data.g2, /Digital Credential Management category/);
      assert(Math.abs(data.ratio - 2) < .01, "Do not distort or crop the extracted map");
      assert(data.order, "Trust banner, client logos and Why Institutions must precede the six layers");
      assert(data.overflow <= 1 && data.statsFit, "No page or statistic-card overflow");
      assert.equal(data.heading, "Trusted by Institutions. Used by Learners. Valued Worldwide.");
      assert.equal(await page.locator("#badges").count(), 1);
      assert.equal(await page.locator("#why-certifyme").count(), 1);
      console.log(`Passed ${width}px: native SVG, exact stats/region positions, G2 scope, section order, no overflow.`);
      await page.close();
    }
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });