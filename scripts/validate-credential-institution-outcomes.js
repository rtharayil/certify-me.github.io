#!/usr/bin/env node
const assert = require("node:assert/strict");
const { execFileSync } = require("node:child_process");
const { chromium } = require("playwright");
const baseUrl = process.env.REPLIT_DEV_DOMAIN
  ? `https://${process.env.REPLIT_DEV_DOMAIN}` : "http://127.0.0.1:5000";

async function main() {
  const browser = await chromium.launch({
    executablePath: execFileSync("which", ["chromium"], { encoding: "utf8" }).trim(),
    headless: true,
  });
  try {
    for (const width of [1440, 1024, 768, 390, 320]) {
      const page = await browser.newPage({ viewport: { width, height: 1100 } });
      try {
        await page.goto(baseUrl, { waitUntil: "load" });
        const section = page.locator("#institution-outcomes");
        assert.equal(await section.count(), 1);
        assert(await section.evaluate((element) =>
          element.previousElementSibling.classList.contains("credential-context")
          && element.nextElementSibling.id === "credential-layers-intro"
          && element.parentElement.classList.contains("credential-hero-flow")),
          "Place the complete outcome section after the overview and before Explore the Six Layers.");
        assert.equal(await section.locator(".credential-institution-outcomes__outcomes > li").count(), 5);
        assert.equal(await section.locator(".credential-institution-outcomes__audiences").count(), 0,
          "The removed One connected ecosystem section must not be rendered.");
        assert.match(await section.textContent(), /A more connected, recognised and future-ready university/);
        assert.equal(await section.locator("button").count(), 0, "Do not invent job-application actions.");
        const image = section.locator("img");
        await image.scrollIntoViewIfNeeded();
        await image.evaluate((element) => element.decode());
        const metrics = await image.evaluate((element) => {
          const style = getComputedStyle(element);
          const box = element.getBoundingClientRect();
          return {
            src: element.getAttribute("src"),
            dimensions: [element.naturalWidth, element.naturalHeight],
            ratio: box.width / box.height,
            mask: style.maskImage,
            filter: style.filter,
            alt: element.alt,
          };
        });
        assert.equal(metrics.src, "/assets4/images/credential-institution-outcomes.webp");
        assert.deepEqual(metrics.dimensions, [1254, 1254]);
        assert(Math.abs(metrics.ratio - 1) < .01, "Preserve the complete supplied illustration.");
        assert.match(metrics.mask, /linear-gradient/);
        assert.equal(metrics.filter, "none", "Keep the artwork's text sharp.");
        assert.match(metrics.alt, /[Cc]onceptual/);
        for (const target of [
          ".credential-institution-outcomes__header",
          ".credential-institution-outcomes__leadership",
        ]) {
          const element = section.locator(target);
          await element.scrollIntoViewIfNeeded();
          assert(await element.isVisible());
          assert(await element.evaluate((node) => {
            const box = node.getBoundingClientRect();
            return box.left >= -1 && box.right <= innerWidth + 1
              && getComputedStyle(node).visibility === "visible";
          }), `${target} must stay visible and within the viewport at ${width}px.`);
        }
        const overflow = await page.evaluate(() =>
          Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - innerWidth);
        assert(overflow <= 1, `No horizontal overflow at ${width}px.`);
        await section.evaluate((element) =>
          element.scrollIntoView({ block: "start", behavior: "instant" }));
        await page.screenshot({ path: `/tmp/institution-outcomes-${width}.png`, animations: "disabled" });
        if (width === 1440) {
          await section.screenshot({ path: "/tmp/institution-outcomes-desktop-section.png", animations: "disabled" });
        }
        console.log(`Institutional artwork, placement, five outcomes and ecosystem section removal passed at ${width}px.`);
      } finally {
        await page.close();
      }
    }
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});