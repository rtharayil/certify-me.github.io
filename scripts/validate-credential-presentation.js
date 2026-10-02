#!/usr/bin/env node
const assert = require("node:assert/strict");
const fs = require("node:fs");
const { execFileSync } = require("node:child_process");
const { chromium } = require("playwright");

const baseUrl = process.env.CREDENTIAL_CONTEXT_URL
  || (process.env.REPLIT_DEV_DOMAIN ? `https://${process.env.REPLIT_DEV_DOMAIN}` : "http://127.0.0.1:5000");

async function main() {
  const browser = await chromium.launch({
    executablePath: execFileSync("which", ["chromium"], { encoding: "utf8" }).trim(),
    headless: true,
  });
  fs.mkdirSync("/tmp/credential-presentation", { recursive: true });
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
        const section = page.locator(".credential-presentation");
        assert.equal(await section.count(), 1);
        await section.scrollIntoViewIfNeeded();
        const artwork = section.locator("img");
        await artwork.scrollIntoViewIfNeeded();
        await page.waitForFunction(() => {
          const image = document.querySelector(".credential-presentation img");
          return image?.complete && image.naturalWidth > 0;
        });
        await artwork.evaluate((image) => image.decode());
        await page.evaluate(() => Promise.race([
          document.fonts.ready, new Promise((resolve) => setTimeout(resolve, 3000)),
        ]));
        const metrics = await section.evaluate((element) => {
          const image = element.querySelector("img");
          const heading = element.querySelector("h2");
          const introduction = element.previousElementSibling;
          return {
            heading: heading.textContent,
            text: element.textContent.replace(/\s+/g, " ").trim(),
            features: Array.from(element.querySelectorAll("li"), (item) => item.textContent.trim()),
            followsOverview: introduction?.id === "credential-layers-intro"
              && introduction.previousElementSibling?.id === "institution-outcomes"
              && introduction.previousElementSibling.previousElementSibling?.classList.contains("credential-context"),
            introTitle: introduction?.querySelector("h2")?.textContent,
            introDescription: introduction?.querySelector("p")?.textContent,
            introCentered: introduction && getComputedStyle(introduction).textAlign === "center",
            introAboveLayer: introduction && introduction.getBoundingClientRect().bottom
              <= element.getBoundingClientRect().top + 1,
            sharedBackground: element.parentElement.classList.contains("credential-hero-flow"),
            imageDimensions: [image.naturalWidth, image.naturalHeight],
            reservedDimensions: [image.getAttribute("width"), image.getAttribute("height")],
            alt: image.alt,
            iconCount: element.querySelectorAll("li svg").length,
            decorativeIcons: Array.from(element.querySelectorAll("li svg"),
              (icon) => icon.getAttribute("aria-hidden") === "true"),
            iconWidths: Array.from(element.querySelectorAll("li svg"),
              (icon) => icon.getBoundingClientRect().width),
            frameBorder: getComputedStyle(element.querySelector("figure")).borderTopWidth,
            frameShadow: getComputedStyle(element.querySelector("figure")).boxShadow,
            frameBackground: getComputedStyle(element.querySelector("figure")).backgroundColor,
            copy: element.querySelector(".credential-presentation__copy").getBoundingClientRect().toJSON(),
            image: image.getBoundingClientRect().toJSON(),
            featureOverflow: Math.max(...Array.from(element.querySelectorAll("li"),
              (item) => item.scrollWidth - item.clientWidth)),
            overflow: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - innerWidth,
          };
        });
        assert.equal(metrics.heading, "Presentation & Access");
        assert(metrics.followsOverview && metrics.sharedBackground, "Keep the overview, institutional outcomes, introduction and Layer 1 in that order.");
        assert.equal(metrics.introTitle, "Explore the Six Layers Behind the Infrastructure");
        assert.equal(metrics.introDescription, "From how achievements are presented and verified to how they become structured skills, comprehensive learner records and workforce intelligence, each layer adds depth and value to the institutional record.");
        assert(metrics.introCentered && metrics.introAboveLayer, "Keep the introduction centered and above Layer 1.");
        assert.match(metrics.text, /Make achievement visible\. Make it easy to access and share\./);
        assert.match(metrics.text, /CertifyMe gives institutions a professional digital credential experience/);
        assert(!metrics.text.includes("From a document someone stores"),
          "Remove the closing sentence rather than relocating it.");
        assert.deepEqual(metrics.features, [
          "Branded credential design", "Unique credential URLs", "QR-based access",
          "Rich credential pages", "Digital sharing", "Institutional branding",
        ]);
        assert.deepEqual(metrics.imageDimensions, [1150, 941]);
        assert.deepEqual(metrics.reservedDimensions, ["1150", "941"]);
        assert.match(metrics.alt, /conceptual/i);
        assert.equal(metrics.iconCount, 6, "Each capability needs its own relevant icon.");
        assert(metrics.decorativeIcons.every(Boolean), "Decorative icons should not repeat capability labels to screen readers.");
        assert(metrics.iconWidths.every((size) => size >= 20), "Capability icons should remain clearly visible.");
        assert.equal(metrics.frameBorder, "0px", "The artwork must have no border.");
        assert.equal(metrics.frameShadow, "none", "The artwork must not have a card shadow.");
        assert.equal(metrics.frameBackground, "rgba(0, 0, 0, 0)", "The artwork frame must blend into the page background.");
        assert(metrics.overflow <= 1 && metrics.featureOverflow <= 1, `No page or feature-card overflow at ${width}px.`);
        if (width >= 1024) {
          assert(metrics.copy.right < metrics.image.left, "Desktop uses copy left and artwork right.");
        } else if (width <= 390) {
          assert(metrics.copy.bottom < metrics.image.top, "Phones stack the complete copy before the artwork.");
        }
        if (width >= 1024) {
          await section.screenshot({ path: `/tmp/credential-presentation/section-${width}.png` });
        } else {
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
          await page.screenshot({ path: `/tmp/credential-presentation/section-${width}.png` });
        }
        console.log(`Presentation & Access section passed at ${width}px.`);
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