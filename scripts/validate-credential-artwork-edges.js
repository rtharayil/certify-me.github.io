#!/usr/bin/env node
const assert = require("node:assert/strict");
const fs = require("node:fs");
const { execFileSync } = require("node:child_process");
const { chromium } = require("playwright");

const baseUrl = process.env.CREDENTIAL_CONTEXT_URL
  || (process.env.REPLIT_DEV_DOMAIN ? `https://${process.env.REPLIT_DEV_DOMAIN}` : "http://127.0.0.1:5000");
const artworkSelector = [
  ".credential-presentation__artwork",
  ".credential-standards__artwork",
  ".credential-verification__artwork",
  ".credential-skill-taxonomy__artwork",
  ".credential-learner-record__artwork",
  ".credential-workforce-intelligence__artwork",
].map((selector) => `.credential-hero-flow ${selector} > img`).join(", ");

async function main() {
  fs.mkdirSync("/tmp/credential-artwork-edges", { recursive: true });
  const browser = await chromium.launch({
    executablePath: execFileSync("which", ["chromium"], { encoding: "utf8" }).trim(),
    headless: true,
  });
  try {
    for (const width of [1440, 1024, 768, 390, 320]) {
      const page = await browser.newPage({ viewport: { width, height: 1100 } });
      try {
        await page.route("**/*", (route) => {
          const url = new URL(route.request().url());
          return url.origin === new URL(baseUrl).origin
            || /(^|\.)fonts\.(googleapis|gstatic)\.com$/.test(url.hostname)
            ? route.continue() : route.abort();
        });
        await page.goto(baseUrl, { waitUntil: "load" });
        const images = page.locator(artworkSelector);
        assert.equal(await images.count(), 6, "Apply the treatment to all six layer images, not the hero or overview.");
        for (let i = 0; i < 6; i++) {
          const image = images.nth(i);
          await image.scrollIntoViewIfNeeded();
          await image.evaluate((element) => element.complete && element.naturalWidth
            ? Promise.resolve()
            : new Promise((resolve, reject) => {
              element.addEventListener("load", resolve, { once: true });
              element.addEventListener("error", reject, { once: true });
            }));
          await image.evaluate((element) => element.decode());
          const metrics = await image.evaluate((element) => {
            const style = getComputedStyle(element);
            const frame = getComputedStyle(element.parentElement);
            const box = element.getBoundingClientRect();
            return {
              mask: style.maskImage,
              composite: style.maskComposite,
              fade: style.getPropertyValue("--artwork-edge-fade").trim(),
              filter: style.filter,
              border: frame.borderTopWidth,
              shadow: frame.boxShadow,
              naturalRatio: element.naturalWidth / element.naturalHeight,
              renderedRatio: box.width / box.height,
              left: box.left,
              right: box.right,
              overflow: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - innerWidth,
            };
          });
          assert.equal((metrics.mask.match(/linear-gradient/g) || []).length, 2, "Feather horizontal and vertical edges.");
          assert.match(metrics.composite, /intersect/);
          assert.equal(metrics.fade, "4.5%");
          assert.equal(metrics.filter, "none", "Do not blur the artwork's text or diagrams.");
          assert.equal(metrics.border, "0px");
          assert.equal(metrics.shadow, "none");
          assert(Math.abs(metrics.naturalRatio - metrics.renderedRatio) < .01, "Do not crop or distort the supplied artwork.");
          assert(metrics.left >= 0 && metrics.right <= width + 1);
          assert(metrics.overflow <= 1, `No horizontal overflow at ${width}px.`);
          if (width === 1440) {
            await image.locator("xpath=ancestor::section[1]").screenshot({
              path: `/tmp/credential-artwork-edges/layer-${i + 1}-${width}.png`,
              animations: "disabled",
            });
          } else if (width === 390 && i === 5) {
            await image.screenshot({
              path: `/tmp/credential-artwork-edges/layer-6-${width}.png`,
              animations: "disabled",
            });
          }
        }
        console.log(`All six layer images have soft edges and sharp contents at ${width}px.`);
      } finally {
        await page.close();
      }
    }
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});