#!/usr/bin/env node
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const { chromium, devices } = require("playwright");
const { inspectImages, inspectVisibility } = require("./lib/image-proportions.cjs");
const { visibleLabelContrast } = require("./lib/visible-label-contrast.cjs");

const base = process.env.TRANSCRIPT_TEST_BASE_URL || `https://${process.env.REPLIT_DEV_DOMAIN}`;
const temporary = fs.mkdtempSync(path.join(os.tmpdir(), "transcript-qa-"));
const profiles = [320, 375, 768, 1024, 1440].map(width => ({
  name: `${width}px`, viewport: { width, height: 1000 },
}));
profiles.push({ name: "iPhone", ...devices["iPhone 13"] });
const report = { profiles: [], errors: [] };

async function main() {
  const browser = await chromium.launch({
    executablePath: execFileSync("which", ["chromium"], { encoding: "utf8" }).trim(),
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
    env: { ...process.env, XDG_CONFIG_HOME: temporary, XDG_CACHE_HOME: temporary },
  });
  try {
    for (const { name, ...options } of profiles) {
      const context = await browser.newContext({ ...options, reducedMotion: "reduce" });
      const page = await context.newPage();
      const errors = [];
      page.on("pageerror", e => errors.push(e.message));
      const response = await page.goto(`${base}/transcript-management`, { waitUntil: "load" });
      assert.equal(response.status(), 200);
      const root = page.locator("#tm-page");
      assert.equal(await page.locator("h1").count(), 1);
      assert.equal(await root.locator("h1").innerText(), "Digital Transcript Management for Modern Universities");
      assert.equal(await root.locator(".tm-steps > li").count(), 7);
      const meta = await page.evaluate(() => ({
        title: document.title,
        description: document.querySelector('meta[name="description"]').content,
        canonical: document.querySelector('link[rel="canonical"]').href,
        og: document.querySelector('meta[property="og:url"]').content,
        schema: [...document.querySelectorAll('script[type="application/ld+json"]')].map(el => JSON.parse(el.textContent)),
        ids: [...document.querySelectorAll("[id]")].map(el => el.id),
        width: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth),
        viewport: innerWidth,
        font: getComputedStyle(document.querySelector("#tm-page h1")).fontFamily,
      }));
      assert.match(meta.title, /Transcript Management.*CertifyMe/);
      assert(meta.description.length > 80);
      assert.equal(meta.canonical, "https://www.certifyme.online/transcript-management");
      assert.equal(meta.og, meta.canonical);
      assert.equal(new Set(meta.ids).size, meta.ids.length, "Duplicate IDs");
      assert(meta.width <= meta.viewport + 1, `Horizontal overflow at ${name}`);
      assert.match(meta.font, /Source Sans 3/);
      const faq = meta.schema.filter(s => s["@type"] === "FAQPage");
      assert.equal(faq.length, 1);
      assert.equal(faq[0].mainEntity.length, 10);
      const details = root.locator("details");
      assert.equal(await details.count(), 10);
      for (let i = 0; i < 10; i++) {
        const detail = details.nth(i);
        const summary = detail.locator("summary");
        assert.equal((await summary.innerText()).trim(), faq[0].mainEntity[i].name);
        await summary.focus();
        await page.keyboard.press("Enter");
        assert.equal(await detail.getAttribute("open"), "");
        assert.equal((await detail.locator("p").innerText()).trim(), faq[0].mainEntity[i].acceptedAnswer.text);
        await page.keyboard.press("Enter");
        assert.equal(await detail.getAttribute("open"), null);
      }
      const missingTargets = await root.evaluate(el => [...el.querySelectorAll('[aria-labelledby],[aria-controls]')].flatMap(n =>
        ["aria-labelledby", "aria-controls"].flatMap(a => (n.getAttribute(a) || "").split(/\s+/).filter(Boolean).filter(id => !document.getElementById(id)))));
      assert.deepEqual(missingTargets, []);
      let visible = 0;
      for (const el of await root.locator("h1,h2,h3,p,summary,img,a.tm-button").all()) {
        if (await el.evaluate(e => !!e.closest("details:not([open])") && e.tagName !== "SUMMARY")) continue;
        await el.evaluate(e => e.scrollIntoView({ block: "center", behavior: "instant" }));
        const result = await el.evaluate(inspectVisibility);
        assert.notEqual(result.status, "FAIL", `${name}: ${JSON.stringify(result)}`);
        if (await el.evaluate(e => e.tagName !== "IMG")) {
          const contrast = await el.evaluate(visibleLabelContrast);
          const failures = contrast.filter(r => !r.provisional && r.ratio < r.required);
          assert(!failures.length, `${name}: low contrast ${JSON.stringify(failures)}`);
        }
        visible++;
      }
      const images = await page.evaluate(inspectImages, "#tm-page img");
      assert(images.length >= 6);
      assert(!images.some(i => i.status === "FAIL"), JSON.stringify(images.filter(i => i.status === "FAIL")));
      assert.equal(await root.locator("img:not([width]),img:not([height])").count(), 0);
      assert.equal(await root.locator("iframe").count(), 0, "Video loaded before activation");
      const videoButton = root.locator("[data-tm-video-button]");
      await videoButton.focus();
      await page.keyboard.press("Enter");
      const frame = root.locator('iframe[title="EduTranscript - Product Explainer Video"]');
      await frame.waitFor();
      assert.match(await frame.getAttribute("src"), /youtube-nocookie\.com\/embed\/dWZx1b8BAq8/);
      assert.equal(await page.evaluate(() => document.activeElement.id), "tm-product-video");
      assert.equal(await root.locator('a[href="https://www.youtube.com/watch?v=dWZx1b8BAq8"]').count(), 1);
      await root.locator('a[href="#tm-lifecycle"]').click();
      const anchor = await root.locator("#tm-lifecycle").boundingBox();
      assert(anchor.y >= -1 && anchor.y < 220, `Lifecycle anchor obscured: ${anchor.y}`);
      assert.equal(await page.locator('.wsmenu-list a[href="/solutions/transcript-management"]').count(), 1);
      assert.deepEqual(errors, []);
      report.profiles.push({ name, images: images.length, visibleChecks: visible, faqs: 10, result: "PASS" });
      console.log(`PASS ${name}: metadata, schema, layout, ${visible} scrolled elements, images, FAQ keyboard, video and anchors`);
      await context.close();
    }
    const page = await browser.newPage();
    await page.goto(`${base}/transcript-management`);
    const links = await page.locator("#tm-page").evaluate(el => [...new Set([...el.querySelectorAll('a[href^="/"]')].map(a => a.getAttribute("href")))]);
    for (const href of [...links, "/", "/eduTranscript.html", "/credentials-higher-education.html"]) {
      const r = await page.request.get(new URL(href, base).href);
      assert.equal(r.status(), 200, `Broken internal path: ${href}`);
    }
    const noJs = await browser.newContext({ javaScriptEnabled: false });
    const plain = await noJs.newPage();
    await plain.goto(`${base}/transcript-management`);
    assert(await plain.locator("#tm-page .tm-video-noscript").isVisible());
    assert(await plain.locator("#tm-page details summary").first().isVisible());
    await noJs.close();
    console.log(`PASS ${links.length} internal links, preserved routes and no-JavaScript fallback`);
  } finally {
    await browser.close();
    fs.rmSync(temporary, { recursive: true, force: true });
    fs.writeFileSync("/tmp/certifyme-transcript-management-qa.json", JSON.stringify(report, null, 2));
  }
}
main().catch(e => { console.error(e); process.exitCode = 1; });
