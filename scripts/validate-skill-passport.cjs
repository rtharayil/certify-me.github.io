#!/usr/bin/env node
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const { chromium, devices } = require("playwright");
const { inspectImages, inspectVisibility } = require("./lib/image-proportions.cjs");
const { visibleLabelContrast } = require("./lib/visible-label-contrast.cjs");

const base = process.env.SKILL_PASSPORT_TEST_BASE_URL || `https://${process.env.REPLIT_DEV_DOMAIN}`;
const temp = fs.mkdtempSync(path.join(os.tmpdir(), "skill-passport-browser-"));
const sections = [
  "skill-passport-hero", "fragmented-learner-records", "what-is-skill-passport",
  "inside-the-skill-passport", "verified-achievements", "learner-ownership",
  "credentials-to-skills", "projects-and-evidence", "verified-portfolio", "verified-cv",
  "comprehensive-learner-record", "open-standards", "public-verification", "learning-to-opportunity",
  "institutional-value", "institutional-architecture", "certifyme-six-layers",
  "fragmented-to-connected", "skill-passport-demo",
];
const profiles = [320, 375, 768, 1024, 1440].map(width => ({ name: `${width}px`, viewport: { width, height: 1000 } }));
profiles.push({ name: "iPhone", ...devices["iPhone 13"] });
const report = { profiles: [], errors: [] };

async function run() {
  const browser = await chromium.launch({
    executablePath: execFileSync("which", ["chromium"], { encoding: "utf8" }).trim(),
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
    env: { ...process.env, XDG_CONFIG_HOME: temp, XDG_CACHE_HOME: temp },
  });
  try {
    for (const { name, ...options } of profiles) {
      const context = await browser.newContext({ ...options, reducedMotion: "reduce" });
      const page = await context.newPage();
      const errors = [];
      page.on("pageerror", error => errors.push(error.message));
      assert.equal((await page.goto(`${base}/solutions/skill-passport`, { waitUntil: "load" })).status(), 200);
      await page.evaluate(() => document.fonts.ready);
      const root = page.locator("#sp-page");
      assert.equal(await page.locator("h1").count(), 1);
      assert.equal(await root.locator("h1").innerText(), "From individual credentials to a lifelong verified learner record.");
      assert.deepEqual(await root.locator(":scope > section").evaluateAll(nodes => nodes.map(node => node.id)), sections);
      assert.equal(await root.locator(".sp-content-item").count(), 7);
      assert.equal(await root.locator(".sp-workflow li").count(), 7);
      assert.equal(await root.locator(".sp-layer").count(), 6);
      assert.equal(await root.locator(".sp-layer.is-featured").innerText(), "COMPREHENSIVE LEARNER RECORD\nLayer 5 · Skill Passport · the connected learner record");
      assert.equal(await root.locator(".sp-outcome").count(), 5);
      assert.equal(await root.locator(".sp-opportunity-flow li").count(), 6);
      const meta = await page.evaluate(() => ({
        title: document.title,
        description: document.querySelector('meta[name="description"]')?.content,
        canonical: document.querySelector('link[rel="canonical"]')?.href,
        ogUrl: document.querySelector('meta[property="og:url"]')?.content,
        ogImage: document.querySelector('meta[property="og:image"]')?.content,
        ogWidth: document.querySelector('meta[property="og:image:width"]')?.content,
        ogHeight: document.querySelector('meta[property="og:image:height"]')?.content,
        schemas: [...document.querySelectorAll('script[type="application/ld+json"]')].map(s => JSON.parse(s.textContent)),
        ids: [...document.querySelectorAll("[id]")].map(e => e.id),
        width: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth),
        viewport: innerWidth,
        font: getComputedStyle(document.querySelector("#sp-page h1")).fontFamily,
      }));
      assert.equal(meta.title, "Skill Passport for Universities | Verified Learner Record | CertifyMe");
      assert(meta.description.length > 80);
      assert.equal(meta.canonical, "https://www.certifyme.online/solutions/skill-passport");
      assert.equal(meta.ogUrl, meta.canonical);
      assert.match(meta.ogImage, /skill-passport-mobile\.webp$/);
      assert.equal(meta.ogWidth, "416");
      assert.equal(meta.ogHeight, "755");
      assert.equal(new Set(meta.ids).size, meta.ids.length, "Duplicate IDs");
      assert(meta.width <= meta.viewport + 1, `${name}: horizontal overflow`);
      assert.match(meta.font, /Source Sans 3/);
      const missingLabels = await root.evaluate(el => [...el.querySelectorAll("[aria-labelledby]")].flatMap(n =>
        n.getAttribute("aria-labelledby").split(/\s+/).filter(id => !document.getElementById(id))));
      assert.deepEqual(missingLabels, []);
      const hierarchy = await root.locator("h1,h2,h3").evaluateAll(nodes => nodes.map(n => Number(n.tagName.slice(1))));
      for (let i = 1; i < hierarchy.length; i++) assert(hierarchy[i] <= hierarchy[i - 1] + 1, `Heading hierarchy jump at ${i}`);
      let visible = 0;
      for (const element of await root.locator("h1,h2,h3,p,li,img,figcaption,a,span:not([aria-hidden]),strong").all()) {
        await element.evaluate(e => e.scrollIntoView({ block: "center", behavior: "instant" }));
        if (await element.evaluate(e => e.tagName === "IMG")) {
          await element.evaluate(async e => { if (!e.complete) await new Promise(r => { e.addEventListener("load", r, { once: true }); e.addEventListener("error", r, { once: true }); }); });
        }
        const visibility = await element.evaluate(inspectVisibility);
        if (visibility.status === "FAIL") report.errors.push({ profile: name, visibility });
        if (await element.evaluate(e => e.tagName !== "IMG")) {
          const failures = (await element.evaluate(visibleLabelContrast)).filter(r => !r.provisional && r.ratio < r.required);
          if (failures.length) report.errors.push({ profile: name, contrast: failures });
        }
        visible++;
      }
      assert.equal(await root.locator('img:not([loading="lazy"])').count(), 1);
      const images = await page.evaluate(inspectImages, "#sp-page img");
      assert(images.length >= 11);
      assert(!images.some(i => i.status === "FAIL"), JSON.stringify(images.filter(i => i.status === "FAIL")));
      assert.equal(await root.locator("img:not([width]),img:not([height]),img:not([alt])").count(), 0);
      await root.getByRole("link", { name: /^Explore Skill Passport/ }).click();
      const anchor = await root.locator("#what-is-skill-passport").boundingBox();
      if (anchor.y < -1 || anchor.y >= 220) report.errors.push({ profile: name, anchorY: anchor.y });
      await page.keyboard.press("Tab");
      for (const link of await root.locator("a.sp-button,a.sp-product-view").all()) {
        await link.focus();
        assert(await link.evaluate(e => document.activeElement === e), "Link did not receive keyboard focus");
        if (!(await link.evaluate(e => getComputedStyle(e).outlineStyle !== "none"))) report.errors.push({ profile: name, focus: await link.innerText() });
        await link.hover();
        const failures = (await link.evaluate(visibleLabelContrast)).filter(r => !r.provisional && r.ratio < r.required);
        if (failures.length) report.errors.push({ profile: name, hoverContrast: failures });
      }
      assert.equal(await page.locator('.wsmenu-list a[href="/solutions/skill-passport"]').count(), 1);
      assert.deepEqual(errors, []);
      report.profiles.push({ name, images: images.length, visibleChecks: visible, result: "PASS" });
      console.log(`PASS ${name}: 19 ordered sections, ${visible} scrolled elements, image proportions, text contrast, anchors, keyboard focus, hover and metadata`);
      await context.close();
    }
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto(`${base}/solutions/skill-passport`);
    assert.equal(await page.locator('.wsmenu-list a[href="/solutions/skill-passport"]').count(), 1);
    const links = await page.locator("#sp-page").evaluate(el => [...new Set([...el.querySelectorAll('a[href^="/"]')].map(a => a.getAttribute("href")))]);
    for (const href of [...links, "/", "/transcript-management", "/skills-passport", "/solutions/digital-credential-infrastructure"]) {
      const response = await page.request.get(new URL(href, base).href);
      assert.equal(response.status(), 200, `Broken internal link/legacy route: ${href}`);
    }
    for (const privatePath of ["/docs/skillstory-assets.md", "/.local/reports/skill-passport/source-pages.json"]) {
      assert.equal((await page.request.get(base + privatePath)).status(), 404, `Private inventory served: ${privatePath}`);
    }
    const sourceLink = page.getByRole("link", { name: /View the mobile product visual/ });
    const popupPromise = context.waitForEvent("page");
    await sourceLink.click();
    const popup = await popupPromise;
    await popup.waitForLoadState("load");
    assert.match(popup.url(), /skill-passport-mobile\.webp$/);
    assert(await popup.locator("img").evaluate(e => e.complete && e.naturalWidth === 416 && e.naturalHeight === 755));
    await popup.close();
    const noJS = await browser.newContext({ javaScriptEnabled: false });
    const plain = await noJS.newPage();
    await plain.goto(`${base}/solutions/skill-passport`);
    assert.equal(await plain.locator("#sp-page > section").count(), 19);
    assert(await plain.locator("#sp-page h1").isVisible());
    assert.equal(await plain.locator('#sp-page a[href="https://info.certifyme.online/request-demo"]').count(), 2);
    await noJS.close();
    console.log(`PASS ${links.length} internal destinations, legacy routes, full-size product visual, no-JavaScript page and private inventory exclusion`);
    assert.equal(report.errors.length, 0, `Browser issues: ${JSON.stringify(report.errors.slice(0, 14))}`);
  } finally {
    await browser.close();
    fs.rmSync(temp, { recursive: true, force: true });
    fs.writeFileSync("/tmp/certifyme-skill-passport-qa.json", JSON.stringify(report, null, 2));
  }
}
run().catch(error => { console.error(error); process.exitCode = 1; });
