#!/usr/bin/env node
const assert = require("node:assert/strict");
const fs = require("node:fs");
const { execFileSync } = require("node:child_process");
const { chromium } = require("playwright");

const baseUrl = process.env.CREDENTIAL_CONTEXT_URL
  || (process.env.REPLIT_DEV_DOMAIN ? `https://${process.env.REPLIT_DEV_DOMAIN}` : "http://127.0.0.1:5000");

async function main() {
  fs.mkdirSync("/tmp/credential-standards", { recursive: true });
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
        await page.goto(baseUrl, { waitUntil: "domcontentloaded" });
        const image = page.locator('img[src*="credential-standards-ecosystem.webp"]');
        assert.equal(await image.count(), 1, "Use the supplied network image exactly once.");
        const section = image.locator("xpath=ancestor::section[1]");
        await section.scrollIntoViewIfNeeded();
        await image.scrollIntoViewIfNeeded();
        await image.evaluate((element) => element.complete && element.naturalWidth
          ? Promise.resolve()
          : new Promise((resolve, reject) => {
            element.addEventListener("load", resolve, { once: true });
            element.addEventListener("error", () => reject(new Error("Standards artwork failed to load.")), { once: true });
          }));
        await image.evaluate((element) => element.decode());
        await page.evaluate(() => Promise.race([
          document.fonts.ready, new Promise((resolve) => setTimeout(resolve, 3000)),
        ]));
        const metrics = await section.evaluate((element) => {
          const image = element.querySelector("img");
          const frame = element.querySelector("figure");
          return {
            text: element.textContent.replace(/\s+/g, " ").trim(),
            heading: element.querySelector("#credential-standards-title").textContent.trim(),
            followsLayerOne: element.previousElementSibling?.classList.contains("credential-presentation"),
            layerGap: element.querySelector(".credential-standards__inner").getBoundingClientRect().top
              - element.previousElementSibling.querySelector(".credential-presentation__inner").getBoundingClientRect().bottom,
            rootFontSize: parseFloat(getComputedStyle(document.documentElement).fontSize),
            sharedFlow: element.parentElement.classList.contains("credential-hero-flow"),
            dimensions: [image.naturalWidth, image.naturalHeight],
            reservedDimensions: [image.getAttribute("width"), image.getAttribute("height")],
            aspectRatio: image.getBoundingClientRect().width / image.getBoundingClientRect().height,
            alt: image.alt,
            icons: element.querySelectorAll('svg[aria-hidden="true"]').length,
            imageBox: image.getBoundingClientRect().toJSON(),
            copyBox: element.querySelector(".credential-standards__copy").getBoundingClientRect().toJSON(),
            frameBorder: getComputedStyle(frame).borderTopWidth,
            frameShadow: getComputedStyle(frame).boxShadow,
            overflow: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - innerWidth,
          };
        });
        assert(metrics.followsLayerOne && metrics.sharedFlow, "Layer 2 must follow Layer 1 within the shared background.");
        assert(metrics.layerGap >= 2.5 * metrics.rootFontSize - 1
          && metrics.layerGap <= 4 * metrics.rootFontSize + 1,
          "Keep clear, compact separation between Layers 1 and 2 at every breakpoint.");
        assert.equal(metrics.heading, "Standards & Interoperability");
        assert.match(metrics.text, /Layer 2/i);
        assert.match(metrics.text, /Build for the ecosystem, not just the platform\./);
        for (const term of ["Open Badges 3.0", "W3C Verifiable Credentials", "Portability", "Interoperability", "Ecosystem Ready"]) {
          assert(metrics.text.includes(term), `Include the reference messaging: ${term}.`);
        }
        assert.match(metrics.text, /compatible/i, "Qualify interoperability through compatible systems.");
        assert(!/\b(Canvas|Moodle|D2L|Blackboard|universally|vendor.independent)\b/i.test(metrics.text),
          "Do not turn the concept diagram into unsupported integration or independence claims.");
        assert(metrics.dimensions[0] > 0 && Math.abs(metrics.dimensions[0] / metrics.dimensions[1] - 1) < .01,
          "Responsive standards artwork must remain square and uncropped.");
        assert.deepEqual(metrics.reservedDimensions, ["1254", "1254"]);
        assert(Math.abs(metrics.aspectRatio - 1) < .01, "Preserve the square artwork without distortion.");
        assert.match(metrics.alt, /conceptual/i);
        assert(metrics.icons >= 3, "The three capabilities should have decorative icons.");
        assert.equal(metrics.frameBorder, "0px");
        assert.equal(metrics.frameShadow, "none");
        assert(metrics.overflow <= 1, `No horizontal overflow at ${width}px.`);
        assert(metrics.imageBox.left >= 0 && metrics.imageBox.right <= width + 1, "Keep every artwork node inside the screen.");
        if (width >= 1024) {
          assert(metrics.imageBox.right < metrics.copyBox.left, "Desktop must place the image left and copy right.");
          await section.screenshot({ path: `/tmp/credential-standards/section-${width}.png` });
        } else {
          assert(metrics.copyBox.bottom < metrics.imageBox.top, "Keep the mobile/tablet reading order stacked with text first.");
          await section.evaluate((element) => {
            element.scrollIntoView({ block: "start", behavior: "instant" });
            for (let parent = element.parentElement; parent; parent = parent.parentElement) {
              if (parent.scrollHeight > parent.clientHeight + 1
                && /auto|scroll/.test(getComputedStyle(parent).overflowY)) {
                parent.scrollTop -= 90;
                return;
              }
            }
            window.scrollBy(0, -90);
          });
          await page.screenshot({ path: `/tmp/credential-standards/section-${width}.png` });
        }
        console.log(`Standards & Interoperability section passed at ${width}px.`);
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