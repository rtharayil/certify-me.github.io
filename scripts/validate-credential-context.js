#!/usr/bin/env node
const assert = require("node:assert/strict");
const fs = require("node:fs");
const { execFileSync } = require("node:child_process");
const { chromium } = require("playwright");

const baseUrl = process.env.CREDENTIAL_CONTEXT_URL
  || (process.env.REPLIT_DEV_DOMAIN ? `https://${process.env.REPLIT_DEV_DOMAIN}` : "http://127.0.0.1:5000");
const screenshots = "/tmp/credential-context";

async function main() {
  fs.mkdirSync(screenshots, { recursive: true });
  const browser = await chromium.launch({
    executablePath: execFileSync("which", ["chromium"], { encoding: "utf8" }).trim(),
    headless: true,
  });
  try {
    for (const width of [1440, 1024, 768, 390, 320]) {
      const page = await browser.newPage({ viewport: { width, height: width >= 1024 ? 1200 : 900 } });
      try {
        // Keep the layout check independent of third-party analytics availability.
        await page.route("**/*", (route) => {
          const url = new URL(route.request().url());
          const allowed = url.origin === new URL(baseUrl).origin
            || /(^|\.)fonts\.(googleapis|gstatic)\.com$/.test(url.hostname);
          return allowed ? route.continue() : route.abort();
        });
        await page.goto(baseUrl, { waitUntil: "domcontentloaded", timeout: 30_000 });
        const illustration = page.locator('img[src*="credential-six-layer-infographic.webp"]');
        assert.equal(await illustration.count(), 1, "The new section must use the cropped image exactly once.");
        const section = illustration.locator("xpath=ancestor::section[1]");
        await section.scrollIntoViewIfNeeded();
        await illustration.evaluate((image) => image.decode());
        await page.evaluate(() => Promise.race([
          document.fonts.ready, new Promise((resolve) => setTimeout(resolve, 3000)),
        ]));
        const metrics = await section.evaluate((element) => {
          const image = element.querySelector('img[src*="credential-six-layer-infographic.webp"]');
          const heading = element.querySelector("h2");
          const hero = document.querySelector("#hero-7");
          const imageBox = image.getBoundingClientRect();
          const headingBox = heading.getBoundingClientRect();
          const precedingSections = Array.from(document.querySelectorAll("#main-content > section"))
            .filter((item) => item.compareDocumentPosition(element) & Node.DOCUMENT_POSITION_FOLLOWING);
          return {
            title: heading.textContent.replace(/\s+/g, " ").trim(),
            copy: element.textContent.replace(/\s+/g, " ").trim(),
            alt: image.alt,
            dimensions: [image.naturalWidth, image.naturalHeight],
            explicitDimensions: [image.getAttribute("width"), image.getAttribute("height")],
            image: { left: imageBox.left, top: imageBox.top, right: imageBox.right },
            heading: { left: headingBox.left, top: headingBox.top, bottom: headingBox.bottom },
            copyWidth: element.querySelector(".credential-context__copy").getBoundingClientRect().width,
            imageWidth: imageBox.width,
            directlyAfterHero: precedingSections.at(-1) === hero,
            overflow: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - innerWidth,
            headingVisible: getComputedStyle(heading).display !== "none",
          };
        });
        assert.match(metrics.title, /A digital credential is more than what you see/i);
        assert(metrics.directlyAfterHero, "The section must be directly after the hero, before other homepage sections.");
        assert.match(metrics.copy, /fictional|illustrative/i, "The sample needs an illustrative disclosure.");
        assert.match(metrics.copy, /not issued/i);
        assert.match(metrics.copy, /not (?:issued or )?verified/i);
        assert(metrics.alt.length > 20, "The illustration needs useful alternative text.");
        assert.deepEqual(metrics.dimensions, [1672, 941], "Use the full new infographic without cropping.");
        assert.deepEqual(metrics.explicitDimensions, ["1672", "941"], "Reserve intrinsic image space to avoid layout shifts.");
        assert(metrics.headingVisible && metrics.overflow <= 1, `No hidden headline or horizontal overflow at ${width}px.`);
        if (width >= 1024) {
          assert(Math.abs(metrics.imageWidth / metrics.copyWidth - 1.5) < .03,
            `Desktop must use 40% text and 60% image at ${width}px.`);
          assert(metrics.heading.left < metrics.image.left && metrics.heading.top < metrics.image.top + 400,
            `Desktop must place text on the left and image on the right at ${width}px.`);
        } else {
          assert(metrics.image.top > metrics.heading.bottom, `Phone text must precede the illustration at ${width}px.`);
          assert(metrics.image.left >= 0 && metrics.image.right <= width + 1, "The phone illustration must fit the screen.");
        }
        if (width <= 390) {
          // Capture an actual reading viewport; tall element shots can place
          // the site's fixed navigation over off-screen content.
          await section.evaluate((element) => {
            element.scrollIntoView({ block: "start", behavior: "instant" });
            let parent = element.parentElement;
            while (parent) {
              if (parent.scrollHeight > parent.clientHeight + 1
                && /auto|scroll/.test(getComputedStyle(parent).overflowY)) {
                parent.scrollTop -= 90;
                return;
              }
              parent = parent.parentElement;
            }
            window.scrollBy(0, -90);
          });
          await page.screenshot({ path: `${screenshots}/section-${width}.png` });
        } else {
          await section.screenshot({ path: `${screenshots}/section-${width}.png` });
        }
        console.log(`Credential context section passed at ${width}px.`);
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