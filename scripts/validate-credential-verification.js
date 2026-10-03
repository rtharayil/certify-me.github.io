#!/usr/bin/env node
const assert = require("node:assert/strict");
const fs = require("node:fs");
const { execFileSync } = require("node:child_process");
const { chromium } = require("playwright");

const baseUrl = process.env.CREDENTIAL_CONTEXT_URL
  || (process.env.REPLIT_DEV_DOMAIN ? `https://${process.env.REPLIT_DEV_DOMAIN}` : "http://127.0.0.1:5000");

async function main() {
  fs.mkdirSync("/tmp/credential-verification", { recursive: true });
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
        const image = page.locator('img[src*="credential-verification-trust.webp"]');
        assert.equal(await image.count(), 1);
        const section = image.locator("xpath=ancestor::section[1]");
        await image.scrollIntoViewIfNeeded();
        await image.evaluate((element) => element.complete && element.naturalWidth
          ? Promise.resolve()
          : new Promise((resolve, reject) => {
            element.addEventListener("load", resolve, { once: true });
            element.addEventListener("error", () => reject(new Error("Verification artwork failed to load.")), { once: true });
          }));
        await image.evaluate((element) => element.decode());
        await page.evaluate(() => Promise.race([
          document.fonts.ready, new Promise((resolve) => setTimeout(resolve, 3000)),
        ]));
        const metrics = await section.evaluate((element) => {
          const image = element.querySelector("img");
          const copy = element.querySelector("#credential-verification-title").parentElement;
          const frame = element.querySelector("figure");
          return {
            text: element.textContent.replace(/\s+/g, " ").trim(),
            heading: element.querySelector("#credential-verification-title").textContent.trim(),
            followsLayerTwo: element.previousElementSibling?.classList.contains("credential-standards"),
            sharedFlow: element.parentElement.classList.contains("credential-hero-flow"),
            dimensions: [image.naturalWidth, image.naturalHeight],
            reservedDimensions: [image.getAttribute("width"), image.getAttribute("height")],
            alt: image.alt,
            icons: element.querySelectorAll('svg[aria-hidden="true"]').length,
            imageBox: image.getBoundingClientRect().toJSON(),
            copyBox: copy.getBoundingClientRect().toJSON(),
            frameBorder: getComputedStyle(frame).borderTopWidth,
            frameShadow: getComputedStyle(frame).boxShadow,
            overflow: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - innerWidth,
          };
        });
        assert(metrics.followsLayerTwo && metrics.sharedFlow, "Layer 3 must follow Layer 2 in the shared background.");
        assert.equal(metrics.heading.replace(/\.$/, ""), "Verification & Trust");
        assert.match(metrics.text, /Layer 3/i);
        assert.match(metrics.text, /Don[’']t just show it\. Prove it\./i);
        for (const term of [/QR code/i, /cryptographic/i, /issuer/i, /subject|recipient/i, /integrity/i]) {
          assert.match(metrics.text, term);
        }
        assert(!/verified identity|recipient identity verified|platform.independent|tamper.proof|guaranteed security/i.test(metrics.text),
          "Do not turn cryptographic evidence into real-world identity or absolute security claims.");
        assert(metrics.dimensions[0] > 0 && Math.abs(metrics.dimensions[0] / metrics.dimensions[1] - 1) < .01,
          "Responsive verification artwork must remain square and uncropped.");
        assert.deepEqual(metrics.reservedDimensions, ["1254", "1254"]);
        assert.match(metrics.alt, /conceptual/i);
        assert(metrics.icons >= 3, "Use distinct decorative icons for the three trust checks.");
        assert.equal(metrics.frameBorder, "0px");
        assert.equal(metrics.frameShadow, "none");
        assert(metrics.overflow <= 1, `No horizontal overflow at ${width}px.`);
        assert(metrics.imageBox.left >= 0 && metrics.imageBox.right <= width + 1, "Keep the entire artwork inside the viewport.");
        assert(Math.abs(metrics.imageBox.width / metrics.imageBox.height - 1) < .01, "Do not distort the square artwork.");
        if (width >= 1024) {
          assert(metrics.copyBox.right < metrics.imageBox.left, "Desktop should alternate with Layer 2: copy left, image right.");
          await section.screenshot({ path: `/tmp/credential-verification/section-${width}.png` });
        } else {
          assert(metrics.copyBox.bottom < metrics.imageBox.top, "Mobile/tablet should stack text before the image.");
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
          await page.screenshot({ path: `/tmp/credential-verification/section-${width}.png` });
        }
        console.log(`Verification & Trust section passed at ${width}px.`);
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