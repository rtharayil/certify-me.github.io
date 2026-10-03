#!/usr/bin/env node
"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const { chromium } = require("playwright");
const root = path.resolve(__dirname, "..");
const base = `https://${process.env.REPLIT_DEV_DOMAIN}`;
const manifest = JSON.parse(fs.readFileSync(path.join(root, "_data/homepage_images.json"), "utf8"));

async function main() {
  const browser = await chromium.launch({
    executablePath: execFileSync("which", ["chromium"], { encoding: "utf8" }).trim(),
    args: ["--no-sandbox", "--disable-dev-shm-usage", "--ignore-certificate-errors"],
  });
  try {
    // Include a high-density phone so responsive selection is tested, not just markup.
    for (const [width, density] of [[320, 1], [390, 1], [390, 2], [768, 1], [1024, 1], [1440, 1], [1920, 1]]) {
      const context = await browser.newContext({
        viewport: { width, height: 1000 }, deviceScaleFactor: density,
        ignoreHTTPSErrors: true, reducedMotion: "reduce",
      });
      const page = await context.newPage();
      const errors = [];
      page.on("pageerror", error => errors.push(error.message));
      await page.route("**/*", route => {
        const url = new URL(route.request().url());
        // Isolate visual/interaction checks from the preview proxy's intermittent
        // certificate-verifier errors; the static audit checks emitted assets.
        if (url.origin === new URL(base).origin && url.pathname.startsWith("/assets4/")) {
          const file = path.resolve(root, "." + decodeURIComponent(url.pathname));
          if (file.startsWith(path.join(root, "assets4") + path.sep) && fs.existsSync(file))
            return route.fulfill({ path: file });
        }
        return url.origin === new URL(base).origin || /(^|\.)fonts\.(googleapis|gstatic)\.com$/.test(url.hostname)
          ? route.continue() : route.abort();
      });
      await page.goto(base, { waitUntil: "domcontentloaded" });
      await page.locator("#hero-7 .credential-hero-actions .btn--theme").waitFor();
      await page.evaluate(() => document.fonts.ready);
      await page.locator(".skip-to-main").focus();
      await page.keyboard.press("Enter");
      assert.equal(await page.evaluate(() => document.activeElement.id), "main-content", "Skip link must move keyboard focus");

      const images = page.locator("img");
      for (const image of await images.all()) {
        if (!await image.isVisible()) continue;
        await image.scrollIntoViewIfNeeded();
        await page.waitForFunction(node => node.complete && node.naturalWidth > 0,
          await image.elementHandle(), { timeout: 15000 });
        await image.evaluate(node => node.decode());
        assert(await image.evaluate(node => node.naturalWidth > 0), "Every visible image must load");
      }
      const selected = await page.locator("img[srcset]").evaluateAll(nodes => nodes.map(node => ({
        path: new URL(node.currentSrc).pathname,
        fallback: new URL(node.src).pathname,
        visible: node.getClientRects().length > 0,
        aspect: node.naturalWidth / node.naturalHeight,
        naturalWidth: node.naturalWidth,
        naturalHeight: node.naturalHeight,
        reservedAspect: Number(node.getAttribute("width")) / Number(node.getAttribute("height")),
      })));
      const candidates = new Set();
      for (const image of selected.filter(image => image.visible)) {
        assert(image.path.startsWith("/assets4/images/optimized/"), `Unoptimized image selected: ${image.path}`);
        // w-descriptor images report density-corrected, integer natural dimensions.
        // A one-pixel rounding error is proportionally large for small logo seals.
        assert(Math.abs(image.naturalHeight - image.naturalWidth / image.reservedAspect) <= 1.5,
          `Do not crop or distort responsive artwork: ${image.path}`);
        candidates.add(image.path);
      }
      const imageBytes = [...candidates].reduce((sum, asset) => sum + fs.statSync(path.join(root, asset)).size, 0);
      const baselineBytes = Object.values(manifest).reduce((sum, image) =>
        sum + fs.statSync(path.join(root, image.source)).size, 0);
      assert(imageBytes < baselineBytes, "Responsive delivery must reduce original image weight");
      if (width <= 390 && density === 1) {
        for (const key of ["overview", "outcomes", "map", "presentation", "standards", "verification", "taxonomy", "record", "workforce"])
          assert([...candidates].includes(`/assets4/images/optimized/${key}-480.webp`), `Phone should select a 480px ${key} image`);
      }

      const outline = await page.locator("#main-content").evaluate(main => {
        const hero = main.querySelector("h1");
        const style = getComputedStyle(hero);
        return [...main.querySelectorAll("h2")].filter(node => node.getClientRects().length > 0).map(node => ({
          text: node.textContent.trim(),
          font: getComputedStyle(node).fontFamily,
          heroFont: style.fontFamily,
          size: parseFloat(getComputedStyle(node).fontSize),
          heroSize: parseFloat(style.fontSize),
        }));
      });
      assert(outline.every(heading => heading.font === heading.heroFont && heading.size < heading.heroSize),
        "Main section headings must keep the approved hierarchy");
      for (const faq of await page.locator("#homepage-answers details").all()) {
        const summary = faq.locator("summary");
        await summary.scrollIntoViewIfNeeded();
        await summary.focus();
        await page.keyboard.press("Enter");
        assert(await faq.evaluate(node => node.open), "FAQ must open with keyboard");
        assert(await faq.locator(".homepage-answers__answer").isVisible());
        await page.keyboard.press("Space");
        assert(!await faq.evaluate(node => node.open), "FAQ must close with keyboard");
        const box = await summary.boundingBox();
        assert(box.height >= 44, "FAQ touch target must be at least 44px");
      }
      if (width <= 991) {
        for (const link of await page.locator("#footer-3 .footer-links a, #hero-7 .cred-tags > a").all()) {
          if (!await link.isVisible()) continue;
          assert((await link.boundingBox()).height >= 44, "Footer and certification links need usable mobile touch targets");
        }
      }
      const opener = page.locator("#hero-7 [data-credential-open]");
      if (await opener.count()) {
      await opener.scrollIntoViewIfNeeded();
      await opener.click();
      await page.locator("#credential-sample-dialog").waitFor({ state: "visible" });
      await page.keyboard.press("Escape");
      await page.locator("#credential-sample-dialog").waitFor({ state: "hidden" });
      assert(await opener.evaluate(node => node === document.activeElement), "Closing the walkthrough must restore focus");
      }
      await page.evaluate(() => {
        document.documentElement.style.scrollBehavior = "auto";
        document.body.style.scrollBehavior = "auto";
        location.hash = "credential-context-title";
      });
      await page.waitForFunction(() => {
        const header = document.querySelector(innerWidth <= 991
          ? "#header .wsmobileheader" : "#header .wsmainfull");
        const headerBottom = header.getBoundingClientRect().bottom;
        return document.getElementById("credential-context-title").getBoundingClientRect().top >= headerBottom - 1;
      });
      assert(await page.evaluate(() => Math.max(document.body.scrollWidth, document.documentElement.scrollWidth) <= innerWidth + 1),
        "Homepage must not overflow horizontally");
      assert.deepEqual(errors, [], "No homepage JavaScript errors");
      console.log(JSON.stringify({
        width, density, selectedImageKB: Math.round(imageBytes / 1024),
        originalImageKB: Math.round(baselineBytes / 1024),
        imageReductionPercent: Math.round((1 - imageBytes / baselineBytes) * 100),
        checks: "images, keyboard skip/FAQ, modal when enabled, touch targets, headings, overflow, runtime",
      }));
      await context.close();
    }
  } finally {
    await browser.close();
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });