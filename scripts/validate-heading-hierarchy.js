#!/usr/bin/env node
const assert = require("node:assert/strict");
const { execFileSync } = require("node:child_process");
const { chromium } = require("playwright");
const baseUrl = process.env.REPLIT_DEV_DOMAIN
  ? `https://${process.env.REPLIT_DEV_DOMAIN}` : "http://127.0.0.1:5000";

async function main() {
  const browser = await chromium.launch({
    executablePath: execFileSync("which", ["chromium"], { encoding: "utf8" }).trim(),
    // The preview proxy can trigger certificate-verifier changes in system Chromium.
    args: ["--ignore-certificate-errors"],
  });
  try {
    for (const width of process.argv.includes("--dialog-only") ? [] : [2560, 1920, 1440, 1024, 768, 390, 320]) {
      const page = await browser.newPage({ viewport: { width, height: 1000 } });
      try {
        await page.goto(baseUrl, { waitUntil: "domcontentloaded" });
        await page.evaluate(() => document.fonts.ready);
        assert.equal(await page.locator("h1").count(), 1, "Exactly one homepage H1, including hidden markup.");
        const outline = await page.locator("h1,h2,h3,h4,h5,h6").evaluateAll((headings) =>
          headings.map((heading) => ({
            level: Number(heading.tagName[1]),
            text: heading.textContent.trim(),
          })));
        for (let index = 1; index < outline.length; index++) {
          assert(outline[index].level <= outline[index - 1].level + 1,
            `Skipped heading level before ${outline[index].text}.`);
        }
        const sectionHeadings = page.locator(
          '#main-content h2:not(:where([role="dialog"] *, .modal *, .homepage-trust-banner__accessible-title))');
        const sizes = await sectionHeadings.evaluateAll((headings) => headings.map((heading) =>
          parseFloat(getComputedStyle(heading).fontSize)));
        assert(sizes.length >= 10, "Check every native homepage section heading.");
        assert(Math.max(...sizes) - Math.min(...sizes) < 1, "Keep primary section H2 sizes consistent.");
        const heroSize = await page.locator("h1").evaluate((heading) =>
          parseFloat(getComputedStyle(heading).fontSize));
        assert(heroSize > Math.max(...sizes), "Every section H2 must be strictly smaller than the hero H1.");
        const heroStyle = await page.locator("h1").evaluate(heading => {
          const style = getComputedStyle(heading);
          return { family: style.fontFamily, weight: style.fontWeight, spacing: style.letterSpacing };
        });
        assert(await sectionHeadings.evaluateAll((headings, hero) => headings.every(heading => {
          const style = getComputedStyle(heading);
          return style.fontFamily === hero.family && style.fontWeight === hero.weight
            && style.letterSpacing === hero.spacing
            && [...heading.querySelectorAll("span,strong,em")].every(child =>
              getComputedStyle(child).fontFamily === hero.family);
        }), heroStyle), "Match the hero's font, weight and spacing, including highlighted words.");
        // Use stable heading IDs rather than relying on incidental wrapper depth.
        const layerTitles = page.locator(
          "#credential-presentation-title, #credential-standards-title, #credential-verification-title,"
          + " #credential-skill-taxonomy-title, #credential-learner-record-title, #credential-workforce-intelligence-title");
        assert.equal(await layerTitles.count(), 6);
        assert(await layerTitles.evaluateAll((headings) => headings.every((heading) => heading.tagName === "H2")));
        for (const heading of await sectionHeadings.all()) {
          await heading.evaluate((element) => element.scrollIntoView({ block: "center", behavior: "instant" }));
          assert(await heading.evaluate((element) => {
            const box = element.getBoundingClientRect();
            return box.left >= -1 && box.right <= innerWidth + 1 && box.height > 0
              && element.scrollWidth <= element.clientWidth + 1;
          }), `Heading must fit its container at ${width}px.`);
        }
        assert(await page.evaluate(() =>
          Math.max(document.body.scrollWidth, document.documentElement.scrollWidth) <= innerWidth + 1));
        console.log(`Passed ${width}px: one H1, all ${sizes.length} section H2s at ${sizes[0]}px below ${heroSize}px hero, matching font/weight/spacing, no overflow.`);
      } finally {
        await page.close();
      }
    }
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    try {
      // Isolate dialog behavior from intermittent Chromium/proxy TLS failures.
      // Serve the unchanged local asset for this browser check, not a mocked implementation.
      await page.route("**/assets4/js/credential-sample-modal.js*", (route) =>
        route.fulfill({
          path: require("node:path").resolve("assets4/js/credential-sample-modal.js"),
          contentType: "application/javascript",
        }));
      await page.goto(baseUrl, { waitUntil: "load" });
      await page.locator("[data-credential-open]").first().click();
      const dialog = page.locator("#credential-sample-dialog");
      await dialog.waitFor({ state: "visible" });
      assert.equal(await dialog.locator("#credential-modal-title").evaluate((heading) => heading.tagName), "H2");
      assert.equal(await dialog.locator(".credential-readable__stage h3").count(), 7);
      await dialog.locator('[data-credential-step-to="1"]').click();
      await page.waitForTimeout(300);
      assert(await dialog.locator('[data-credential-stage="1"]').isVisible(),
        "Dialog navigation must still reveal the selected stage.");
      assert(await dialog.evaluate((element) => element.contains(document.activeElement)),
        "Dialog navigation must keep keyboard focus inside the dialog.");
      console.log("Credential dialog H2/H3 hierarchy, stage navigation and focus containment passed.");
    } finally {
      await page.close();
    }
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});