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
  const response = await fetch(`${base}/assets4/images/trusted-worldwide-global-learning-network.webp`);
  assert.equal(response.status, 200);
  assert(Buffer.from(await response.arrayBuffer()).equals(
    fs.readFileSync(path.join(root, "assets4/images/trusted-worldwide-global-learning-network.webp"))));
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
      await page.waitForFunction(() => {
        const image = document.querySelector("#homepage-trust-banner img");
        return image?.complete && image.naturalWidth > 0;
      });
      await banner.locator("img").evaluate(image => image.decode());
      const data = await banner.evaluate(section => {
        const image = section.querySelector(".homepage-trust-banner__artwork img");
        const rect = image.getBoundingClientRect();
        const targets = ["institution-outcomes", "homepage-trust-banner", "credential-layers-intro"];
        const elements = targets.map(id => document.getElementById(id));
        return {
          dimensions: [image.naturalWidth, image.naturalHeight],
          reservedDimensions: [Number(image.width), Number(image.height)],
          fit: getComputedStyle(image).objectFit,
          mask: getComputedStyle(image).maskImage,
          filter: getComputedStyle(image).filter,
          background: getComputedStyle(section).backgroundColor,
          oldContent: Boolean(section.querySelector(".homepage-trust-banner__world, .homepage-trust-banner__header, .homepage-trust-banner__stats")),
          fullSizeLink: image.parentElement.getAttribute("href") === image.getAttribute("src"),
          alt: image.alt,
          g2Removed: !section.querySelector(".homepage-trust-banner__recognition"),
          ratio: rect.width / rect.height,
          order: elements.every((e, i) => !i || elements[i - 1].nextElementSibling === e),
          outcomesGap: image.getBoundingClientRect().top
            - document.querySelector("#institution-outcomes .credential-institution-outcomes__story").getBoundingClientRect().bottom,
          overflow: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - innerWidth,
          heading: section.querySelector("h2").textContent.replace(/\s+/g, " ").trim(),
        };
      });
      assert.deepEqual(data.dimensions, [2055, 765]);
      assert(!data.oldContent, "Replace the old standalone heading, stats and map with the approved banner");
      assert(data.fullSizeLink, "Allow the full banner to be viewed at readable size");
      assert.equal(data.fit, "contain");
      assert.match(data.mask, /linear-gradient/, "Blend the banner perimeter into its background");
      assert.equal(data.filter, "none", "Keep the banner text and logos sharp");
      assert.equal(data.background, "rgba(0, 0, 0, 0)", "Use the continuous homepage background");
      assert.match(data.alt, /5K\+/);
      assert.match(data.alt, /1M\+/);
      assert(data.g2Removed, "Remove the standalone G2 recognition block");
      assert(Math.abs(data.ratio - 2055 / 765) < .01, "Do not distort or crop the supplied banner");
      assert(data.order, "Trust banner must lead directly into the six layers");
      assert(Math.abs(data.outcomesGap) <= 1, "Remove the gap between institutional outcomes and the trust banner");
      assert(data.overflow <= 1, "No page overflow");
      assert.equal(data.heading, "Trusted by Institutions. Used by Learners. Valued Worldwide.");
      assert.equal(await page.locator("#badges").count(), 0);
      assert.equal(await page.locator("#why-certifyme").count(), 0);
      console.log(`Passed ${width}px: banner preserved, G2/client strip/Why Institutions removed, no overflow.`);
      await page.close();
    }
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });