#!/usr/bin/env node
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const { chromium, devices } = require("playwright");
const { inspectImages, inspectVisibility } = require("./lib/image-proportions.cjs");
const { visibleLabelContrast } = require("./lib/visible-label-contrast.cjs");

const base = process.env.TRANSCRIPT_SOLUTION_TEST_BASE_URL || `https://${process.env.REPLIT_DEV_DOMAIN}`;
const route = "/solutions/transcript-management";
const expected = [
  "tm-title", "tm-problem", "tm-workflow", "tm-registrar", "tm-self-service",
  "tm-access", "tm-security-fraud", "tm-id-tagging", "tm-otp", "tm-signatures",
  "tm-portal", "tm-matrix", "tm-sis", "tm-api", "tm-exchange", "tm-alumni",
  "tm-privacy", "tm-standards", "tm-learner-record", "tm-skills", "tm-workforce",
  "tm-six-layer", "tm-before-after", "tm-value", "tm-final-title",
];
const profiles = [320, 375, 768, 1024, 1440].map(width => ({
  name: `${width}px`, viewport: { width, height: 1000 },
}));
profiles.push({ name: "iPhone", ...devices["iPhone 13"] });
const temp = fs.mkdtempSync(path.join(os.tmpdir(), "transcript-solution-browser-"));
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
      page.on("pageerror", e => errors.push(e.message));
      assert.equal((await page.goto(base + route, { waitUntil: "load" })).status(), 200);
      await page.evaluate(() => document.fonts.ready);
      const root = page.locator("#ts-page");
      assert.equal(await page.locator("h1").count(), 1);
      assert.equal(await root.locator("h1").innerText(), "Turn the university transcript into a secure, verifiable digital academic record.");
      assert.deepEqual(await root.locator(":scope > section").evaluateAll(ns => ns.map(n => n.getAttribute("aria-labelledby"))), expected);
      assert.equal(await root.locator("#workflow > .tm-shell > .tm-flow > li").count(), 7);
      assert.equal(await root.locator(".tm-layers > .tm-layer").count(), 6);
      assert.equal(await root.locator(".tm-layer.core").count(), 3);
      assert.equal(await root.locator(".tm-audience").count(), 5);
      assert.equal(await root.locator(".tm-matrix tbody tr").count(), 7);
      assert.equal(await root.locator(".tm-trust-chain li").count(), 5);
      assert.equal(await root.locator(".tm-platform-path li").count(), 8);
      const meta = await page.evaluate(() => ({
        title: document.title,
        description: document.querySelector('meta[name="description"]')?.content,
        canonical: document.querySelector('link[rel="canonical"]')?.href,
        ogUrl: document.querySelector('meta[property="og:url"]')?.content,
        ogImage: document.querySelector('meta[property="og:image"]')?.content,
        width: Math.max(document.body.scrollWidth, document.documentElement.scrollWidth),
        ids: [...document.querySelectorAll("[id]")].map(n => n.id),
        schemas: [...document.querySelectorAll('script[type="application/ld+json"]')].map(n => JSON.parse(n.textContent)),
        font: getComputedStyle(document.querySelector("#ts-page h1")).fontFamily,
      }));
      assert.equal(meta.title, "Transcript Management for Universities | EduTranscript by CertifyMe");
      assert(meta.description.includes("integrate with your SIS"));
      assert.equal(meta.canonical, "https://www.certifyme.online" + route);
      assert.equal(meta.ogUrl, meta.canonical);
      assert.match(meta.ogImage, /edutranscript-portal-for-student-to-request-their-transcript\.webp$/);
      assert(meta.width <= options.viewport.width + 1, `${name}: body overflow`);
      assert.equal(new Set(meta.ids).size, meta.ids.length, "Duplicate IDs");
      assert.match(meta.font, /Source Sans 3/);
      assert.deepEqual(await root.evaluate(el => [...el.querySelectorAll("[aria-labelledby]")].flatMap(n => n.getAttribute("aria-labelledby").split(/\s+/).filter(id => !document.getElementById(id)))), []);
      const levels = await root.locator("h1,h2,h3").evaluateAll(ns => ns.map(n => +n.tagName[1]));
      for (let i = 1; i < levels.length; i++) assert(levels[i] <= levels[i - 1] + 1, "Heading hierarchy jump");
      assert.equal(await root.locator('img:not([loading="lazy"])').count(), 1);
      const captionOverlap = await root.evaluate(el => {
        const caption = el.querySelector(".tm-hero-visual figcaption").getBoundingClientRect();
        const stamp = el.querySelector(".tm-hero-stamp").getBoundingClientRect();
        return Math.max(caption.left, stamp.left) < Math.min(caption.right, stamp.right) &&
          Math.max(caption.top, stamp.top) < Math.min(caption.bottom, stamp.bottom);
      });
      assert(!captionOverlap, "Hero trust note covers the screenshot caption");
      let visible = 0;
      for (const node of await root.locator("h1,h2,h3,p,li,img,figcaption,a,span:not([aria-hidden]),strong,th,td").all()) {
        await node.evaluate(e => e.scrollIntoView({ block: "center", behavior: "instant" }));
        if (await node.evaluate(e => e.tagName === "IMG")) {
          await node.evaluate(async e => { if (!e.complete) await new Promise(r => { e.addEventListener("load", r, { once: true }); e.addEventListener("error", r, { once: true }); }); });
        }
        const visibility = await node.evaluate(inspectVisibility);
        if (visibility.status === "FAIL") report.errors.push({ name, visibility });
        const contrast = (await node.evaluate(visibleLabelContrast)).filter(r => !r.provisional && r.ratio < r.required);
        if (contrast.length) report.errors.push({ name, contrast });
        visible++;
      }
      const images = await page.evaluate(inspectImages, "#ts-page img");
      assert.equal(images.length, 10);
      assert(!images.some(i => i.status === "FAIL"), JSON.stringify(images.filter(i => i.status === "FAIL")));
      assert.equal(await root.locator("img:not([width]),img:not([height]),img:not([alt])").count(), 0);
      await root.getByRole("link", { name: "See How It Works", exact: true }).click();
      const anchor = await root.locator("#tm-workflow").boundingBox();
      assert(anchor.y >= 60 && anchor.y < 350, `${name}: workflow anchor y=${anchor.y}`);
      await page.keyboard.press("Tab");
      for (const link of await root.locator("a.tm-button,a.tm-image-link").all()) {
        await link.focus();
        assert(await link.evaluate(e => document.activeElement === e && getComputedStyle(e).outlineStyle !== "none"), "Missing visible keyboard focus");
        await link.hover();
        const contrast = (await link.evaluate(visibleLabelContrast)).filter(r => !r.provisional && r.ratio < r.required);
        if (contrast.length) report.errors.push({ name, hoverContrast: contrast });
      }
      assert.equal(await page.locator(`.wsmenu-list a[href="${route}"]`).count(), 1);
      assert.deepEqual(errors, []);
      report.profiles.push({ name, visibleChecks: visible, images: images.length, result: "PASS" });
      console.log(`PASS ${name}: 25 ordered sections, ${visible} scrolled visibility/contrast checks, screenshot proportions, hierarchy, metadata, anchors and focus`);
      await context.close();
    }
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto(base + route);
    const links = await page.locator("#ts-page").evaluate(el => [...new Set([...el.querySelectorAll('a[href^="/"]')].map(a => a.getAttribute("href")))]);
    for (const href of [...links, "/", "/transcript-management", "/eduTranscript.html", "/solutions/skill-passport"]) {
      assert.equal((await page.request.get(new URL(href, base).href)).status(), 200, `Broken destination: ${href}`);
    }
    for (const href of ["/docs/edutranscript-assets.md", "/.local/reports/transcript-solution/source-pages.json", "/attached_assets/Pasted-You-are-working-on-the-CertifyMe-website-CREATE-A-NEW-P_1791347082149.txt"]) {
      assert.equal((await page.request.get(base + href)).status(), 404, `Private source served: ${href}`);
    }
    const image = page.locator("#ts-page .tm-image-link").first();
    const pending = context.waitForEvent("page");
    await image.click();
    const popup = await pending;
    await popup.waitForLoadState("load");
    assert(await popup.locator("img").evaluate(e => e.complete && e.naturalWidth === 1120 && e.naturalHeight === 630));
    await popup.close();
    for (const [alias, target] of [["/solutions/comprehensive-learner-record", "/comprehensive-learner-record"], ["/solutions/skills-taxonomy-mapping", "/skills-taxonomy-mapping"]]) {
      await page.goto(base + alias);
      await page.waitForURL(base + target);
      assert((await page.locator("h1").innerText()).length > 5);
    }
    await context.close();
    const plainContext = await browser.newContext({ javaScriptEnabled: false });
    const plain = await plainContext.newPage();
    await plain.goto(base + route);
    assert.equal(await plain.locator("#ts-page > section").count(), 25);
    assert(await plain.locator("#ts-page h1").isVisible());
    assert.equal(await plain.locator('#ts-page a[href="https://info.certifyme.online/request-demo"]').count(), 2);
    assert.equal(await plain.locator('#ts-page a[href="https://www.youtube.com/watch?v=dWZx1b8BAq8"]').count(), 1);
    await plainContext.close();
    console.log(`PASS ${links.length} internal destinations, legacy routes, full-size screenshot, solution aliases, private exclusions and no-JavaScript content`);
    assert.equal(report.errors.length, 0, JSON.stringify(report.errors.slice(0, 12)));
  } finally {
    await browser.close();
    fs.rmSync(temp, { recursive: true, force: true });
    fs.writeFileSync("/tmp/certifyme-transcript-solution-qa.json", JSON.stringify(report, null, 2));
  }
}
run().catch(e => { console.error(e); process.exitCode = 1; });
