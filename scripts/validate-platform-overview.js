#!/usr/bin/env node
const assert = require("node:assert/strict");
const { execFileSync } = require("node:child_process");
const { chromium } = require("playwright");

const baseUrl = process.env.REPLIT_DEV_DOMAIN
  ? `https://${process.env.REPLIT_DEV_DOMAIN}` : "http://127.0.0.1:5000";
const movedSections = [
  ".opd-section",
  "#built-for-institutions",
  "#showcase-directory-section",
  "#job-intelligence-section",
  "#learner-wallet-section",
  "#platform-reviews",
  "#rating-1",
];

async function main() {
  const browser = await chromium.launch({
    executablePath: execFileSync("which", ["chromium"], { encoding: "utf8" }).trim(),
    headless: true,
  });
  try {
    for (const width of [1440, 390, 320]) {
      const page = await browser.newPage({ viewport: { width, height: 1000 } });
      try {
        await page.goto(baseUrl, { waitUntil: "load" });
        for (const selector of movedSections) {
          assert.equal(await page.locator(`main ${selector}`).count(), 0,
            `${selector} must no longer appear on the homepage.`);
        }
        assert.equal(await page.locator(".credential-hero-flow > :is(#hero-7, .credential-context, .credential-presentation, .credential-standards, .credential-verification, .credential-skill-taxonomy, .credential-learner-record, .credential-workforce-intelligence)").count(), 8,
          "Preserve the hero, overview and all six credential layers.");
        assert.equal(await page.locator('nav a[href="/platform-overview"]').count(), 1);
        if (width >= 992) {
          await page.getByRole("link", { name: "Features", exact: true }).hover();
        } else {
          await page.locator("#wsnavtoggle").click();
          await page.locator(".wsmenu-list > li").filter({ hasText: "Features" })
            .locator(".wsmenu-click").first().click();
        }
        await page.locator('nav a[href="/platform-overview"]').click();
        await page.waitForURL("**/platform-overview");

        const response = await page.goto(`${baseUrl}/platform-overview`, { waitUntil: "load" });
        assert.equal(response.status(), 200);
        assert.match(response.headers()["content-type"], /text\/html/);
        for (const selector of movedSections) {
          assert.equal(await page.locator(`main ${selector}`).count(), 1,
            `${selector} must appear once on the separate page.`);
        }
        assert.equal(await page.locator("main h1").count(), 1);
        assert.equal(await page.getByText("Independent reviews", { exact: true }).count(), 1);
        assert.equal(await page.locator('link[href="/assets4/css/mobile-ux.css"]').count(), 1,
          "Keep the moved components' existing responsive styles.");
        assert.match(await page.title(), /Platform Overview/);
        assert(await page.locator('meta[name="description"]').getAttribute("content"));

        for (const index of [2, 4, 0]) {
          await page.locator(`[onclick*="opd_switch(${index + 1})"]`).first().click();
          assert.equal(await page.locator(".opd-panel.active").getAttribute("id"), `opd${index + 1}`);
          assert(await page.locator(`#content${index + 1}`).isVisible(),
            "Platform panels and their supporting copy must still switch.");
          const panelImage = page.locator(`#opd${index + 1} img`);
          await panelImage.scrollIntoViewIfNeeded();
          await panelImage.evaluate((image) => image.decode());
        }

        for (const image of await page.locator("main img").all()) {
          if (!(await image.isVisible())) continue;
          await image.scrollIntoViewIfNeeded();
          await image.evaluate((element) => element.decode());
        }
        const reviews = page.getByText("Independent reviews", { exact: true });
        await reviews.scrollIntoViewIfNeeded();
        await reviews.waitFor({ state: "visible", timeout: 5000 });
        assert(await reviews.isVisible(), "Independent reviews must remain readable on the new page.");

        const overflow = await page.evaluate(() =>
          Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - innerWidth);
        assert(overflow <= 1, `No horizontal overflow at ${width}px.`);
        const schemas = await page.locator('script[type="application/ld+json"]')
          .evaluateAll((scripts) => scripts.map((script) => JSON.parse(script.textContent)));
        assert(schemas.some((schema) => schema["@graph"]?.some((item) => item.review?.length === 3)),
          "Keep the existing review metadata with the moved review section.");
        await page.locator("main h1").evaluate((element) =>
          element.scrollIntoView({ block: "center", behavior: "instant" }));
        await page.screenshot({ path: `/tmp/platform-overview-${width}.png`, animations: "disabled" });
        console.log(`Homepage removal and Platform Overview content/interactions passed at ${width}px.`);
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