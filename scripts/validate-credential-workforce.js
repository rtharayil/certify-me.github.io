#!/usr/bin/env node
const assert = require("node:assert/strict");
const fs = require("node:fs");
const { execFileSync } = require("node:child_process");
const { chromium } = require("playwright");

const baseUrl = process.env.CREDENTIAL_CONTEXT_URL
  || (process.env.REPLIT_DEV_DOMAIN ? `https://${process.env.REPLIT_DEV_DOMAIN}` : "http://127.0.0.1:5000");

async function main() {
  fs.mkdirSync("/tmp/credential-workforce", { recursive: true });
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
        await page.waitForLoadState("load");
        const image = page.locator('img[src*="credential-workforce-intelligence.webp"]');
        assert.equal(await image.count(), 1);
        const section = image.locator("xpath=ancestor::section[1]");
        await image.scrollIntoViewIfNeeded();
        await image.evaluate((element) => element.complete && element.naturalWidth
          ? Promise.resolve()
          : new Promise((resolve, reject) => {
            element.addEventListener("load", resolve, { once: true });
            element.addEventListener("error", () => reject(new Error("Workforce artwork failed to load.")), { once: true });
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
            heading: element.querySelector("h2").textContent.trim(),
            followsLayerFive: element.previousElementSibling?.classList.contains("credential-learner-record"),
            sharedFlow: element.parentElement.classList.contains("credential-hero-flow"),
            dimensions: [image.naturalWidth, image.naturalHeight],
            reservedDimensions: [image.getAttribute("width"), image.getAttribute("height")],
            alt: image.alt,
            caption: frame.querySelector("figcaption")?.textContent.trim(),
            icons: element.querySelectorAll('svg[aria-hidden="true"]').length,
            controls: element.querySelectorAll("button, input, select, a").length,
            imageBox: image.getBoundingClientRect().toJSON(),
            copyBox: element.querySelector("h2").parentElement.getBoundingClientRect().toJSON(),
            frameBorder: getComputedStyle(frame).borderTopWidth,
            frameShadow: getComputedStyle(frame).boxShadow,
            overflow: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - innerWidth,
          };
        });
        assert(metrics.followsLayerFive && metrics.sharedFlow, "Layer 6 must follow Layer 5 in the credential flow.");
        assert.equal(metrics.heading.replace(/\.$/, ""), "Workforce Intelligence");
        for (const term of [/Layer 6/i, /Turn learning into opportunity\./i, /Job Insights/i,
          /employer|hiring/i, /Personalised/i, /Application Pathways/i, /universit|institution/i,
          /careers guidance/i, /skills/i, /learner.record/i]) {
          assert.match(metrics.text, term);
        }
        assert(!/\d+\s*%|guaranteed|Google|Microsoft|Amazon|Flipkart|\bTCS\b|live job feed|apply directly from/i.test(metrics.text),
          "Do not convert conceptual jobs, scores or employer marks into claims about live results.");
        assert.equal(metrics.caption, undefined, "Keep the Layer 6 illustration free of a visible caption.");
        assert.equal(metrics.controls, 0, "Do not add faux job filters or applications.");
        assert.deepEqual(metrics.dimensions, [1254, 1254]);
        assert.deepEqual(metrics.reservedDimensions, ["1254", "1254"]);
        assert.match(metrics.alt, /conceptual/i);
        assert(metrics.icons >= 4);
        assert.equal(metrics.frameBorder, "0px");
        assert.equal(metrics.frameShadow, "none");
        assert(metrics.overflow <= 1, `No horizontal overflow at ${width}px.`);
        assert(metrics.imageBox.left >= 0 && metrics.imageBox.right <= width + 1);
        assert(Math.abs(metrics.imageBox.width / metrics.imageBox.height - 1) < .01);
        if (width >= 1024) {
          assert(metrics.imageBox.right < metrics.copyBox.left, "Alternate with Layer 5: artwork left, copy right.");
          await section.screenshot({ path: `/tmp/credential-workforce/section-${width}.png`, animations: "disabled" });
        } else {
          assert(metrics.copyBox.bottom < metrics.imageBox.top, "Keep text-first tablet/mobile stacking.");
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
          await page.screenshot({ path: `/tmp/credential-workforce/section-${width}.png`, animations: "disabled" });
        }
        console.log(`Workforce Intelligence section passed at ${width}px.`);
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