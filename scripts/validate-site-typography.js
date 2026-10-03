#!/usr/bin/env node
const assert = require("node:assert/strict");
const { execFileSync } = require("node:child_process");
const { chromium } = require("playwright");

const baseUrl = process.env.REPLIT_DEV_DOMAIN
  ? `https://${process.env.REPLIT_DEV_DOMAIN}` : "http://127.0.0.1:5000";
const routes = [
  "/",
  "/pricing",
  "/security/",
  "/allIntegrations",
  "/integrations/AcademyOcean-CertifyMe-integration",
  "/blog/A-Guide-to-Digital-Badges",
  "/workforce-intelligence",
  "/comprehensive-learner-record",
  "/skills-taxonomy-mapping",
];

async function main() {
  process.env.XDG_CONFIG_HOME ||= "/tmp/certifyme-typography-config";
  process.env.XDG_CACHE_HOME ||= "/tmp/certifyme-typography-cache";
  const browser = await chromium.launch({
    executablePath: execFileSync("which", ["chromium"], { encoding: "utf8" }).trim(),
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
  });
  try {
    const page = await browser.newPage();
    for (const route of routes) {
      const response = await page.goto(`${baseUrl}${route}`, { waitUntil: "domcontentloaded" });
      assert(response?.ok(), `${route}: unsuccessful response`);
      await page.waitForFunction(() =>
        [...document.fonts].some((font) =>
          font.family.includes("Source Sans 3") && font.status === "loaded"));
      await page.evaluate(() => document.fonts.ready);
      const paragraph = route === "/"
        ? page.locator("#hero-7 .hero-7-txt > p.p-lg")
        : page.locator("p:visible").filter({ hasText: /[A-Za-z]/ }).first();
      for (const width of [390, 1440]) {
        await page.setViewportSize({ width, height: 1000 });
        const family = await paragraph.evaluate((node) => getComputedStyle(node).fontFamily);
        assert(family.includes("Source Sans 3") && !family.includes("Inter"),
          `${route}, ${width}px: unexpected paragraph font ${family}`);
        assert((await page.locator("body").evaluate((node) => getComputedStyle(node).fontFamily))
          .includes("Source Sans 3"), `${route}: incorrect body font`);
        assert((await page.locator("h1").first().evaluate((node) => getComputedStyle(node).fontFamily))
          .includes("Manrope"), `${route}: heading font changed`);
        assert(await page.evaluate(() =>
          document.documentElement.scrollWidth <= innerWidth + 1),
        `${route}, ${width}px: horizontal page overflow`);
      }
      // Check the font actually painting the text, not only the CSS declaration.
      await paragraph.evaluate((node) => node.setAttribute("data-typography-test", ""));
      const session = await page.context().newCDPSession(page);
      await session.send("DOM.enable");
      await session.send("CSS.enable");
      const { root } = await session.send("DOM.getDocument");
      const { nodeId } = await session.send("DOM.querySelector", {
        nodeId: root.nodeId, selector: "[data-typography-test]",
      });
      const { fonts } = await session.send("CSS.getPlatformFontsForNode", { nodeId });
      assert(fonts.some((font) => font.isCustomFont && font.familyName.includes("Source Sans 3")),
        `${route}: Source Sans 3 did not render`);
      await session.detach();
      console.log(`Passed ${route}: Source Sans 3 rendered, Manrope headings retained, mobile/desktop fit.`);
    }
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});