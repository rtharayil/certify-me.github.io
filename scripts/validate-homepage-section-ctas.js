#!/usr/bin/env node
"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const { chromium } = require("playwright");
const root = path.resolve(__dirname, "..");
const base = `https://${process.env.REPLIT_DEV_DOMAIN}`;
const demoUrl = "https://info.certifyme.online/request-demo";

(async () => {
  const browser = await chromium.launch({
    executablePath: execFileSync("which", ["chromium"], { encoding: "utf8" }).trim(),
  });
  try {
    for (const width of [320, 390, 768, 1024, 1440]) {
      const context = await browser.newContext({ viewport: { width, height: 1000 } });
      try {
        await context.route("**/*", route => {
          const url = new URL(route.request().url());
          if (url.href === demoUrl)
            return route.fulfill({ contentType: "text/html", body: "<h1>Demo destination verified</h1>" });
          if (url.origin !== new URL(base).origin) return route.abort();
          if (url.pathname.startsWith("/assets4/")) {
            const file = path.resolve(root, "." + decodeURIComponent(url.pathname));
            if (file.startsWith(path.join(root, "assets4") + path.sep) && fs.existsSync(file))
              return route.fulfill({ path: file });
          }
          return route.continue();
        });
        const page = await context.newPage();
        await page.goto(base, { waitUntil: "domcontentloaded" });
        const sections = page.locator("#main-content > section, #main-content > .credential-hero-flow > section");
        assert.equal(await sections.count(), 13, "Check every homepage content section");
        for (const section of await sections.all()) {
          const cta = section.locator(`a[href="${demoUrl}"], a.fl-cta-link`).first();
          assert.equal(await cta.count(), 1, "Each section must have a demo or assessment CTA");
          await cta.scrollIntoViewIfNeeded();
          assert(await cta.isVisible());
          const metrics = await cta.evaluate(link => {
            const box = link.getBoundingClientRect();
            return {
              left: box.left, right: box.right, height: box.height,
              label: link.textContent.trim(), target: link.target, rel: link.rel,
              added: link.classList.contains("homepage-section-cta__link"),
            };
          });
          assert(metrics.left >= -1 && metrics.right <= width + 1, "CTA must fit the viewport");
          if (metrics.added) assert(metrics.height >= 44, "Provide an accessible tap target");
          assert(metrics.label.length > 0);
        }
        const added = page.locator(".homepage-section-cta__link");
        assert.equal(await added.count(), 11, "Do not duplicate existing hero and assessment CTAs");
        for (const link of await added.all()) {
          assert.equal(await link.getAttribute("target"), "_blank");
          assert.match(await link.getAttribute("rel"), /noopener/);
          assert.match(await link.getAttribute("aria-label"), /^Request a demo — .+/);
          if (width === 1440) {
            const [popup] = await Promise.all([page.waitForEvent("popup"), link.click()]);
            await popup.waitForLoadState("domcontentloaded");
            assert.equal(popup.url(), demoUrl, "CTA must open the existing demo destination");
            await popup.close();
          }
        }
        assert(await page.evaluate(() =>
          Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) <= innerWidth + 1));
        console.log(`All 13 sections have visible, working CTA links at ${width}px.`);
      } finally {
        await context.close();
      }
    }
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });