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
  "What Is a Skill Passport?", "Transcript vs Skill Passport", "Credential → CLR → Skill Passport",
  "Credentials", "Skills", "Projects & Evidence", "Attestations", "Portfolio / CV", "Verification",
  "Lifelong learner journey", "Workforce context", "Institutional value", "Explore Skill Passport",
];
const views = ["Credentials", "Skills", "Projects", "Experiences", "Achievements", "Evidence"];
const heroHeading = "A Lifelong, Verified Record of What a Learner Has Achieved";
const normalize = text => text.trim().replace(/\s+/g, " ").toLowerCase();
const profiles = [320, 390, 768, 1024, 1440, 1920].map(width => ({ name: `${width}px`, viewport: { width, height: 1000 } }));
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
      assert.equal(await root.locator("h1").innerText(), "Skill Passport");
      assert.deepEqual((await root.locator("h2").allTextContents()).map(normalize), [heroHeading, ...sections].map(normalize));
      assert.equal(await root.locator(".sp-hero-copy").textContent(), "Bring credentials, verified skills, projects, experiences and achievements together into a learner-controlled record that can be carried and shared beyond the institution.");
      assert.equal(await root.locator(".sp-hero img").first().getAttribute("src"), "/assets4/images/skill-passport/skill-passport-mobile.webp");
      assert.equal(await root.locator(".sp-hero .sp-button-primary").evaluate(node => getComputedStyle(node).backgroundColor), "rgb(57, 53, 139)");
      assert.equal(await root.locator(".sp-hero").evaluate(node => getComputedStyle(node).backgroundColor), "rgb(245, 245, 255)");
      assert.deepEqual(await root.locator(".sp-meaning-item h3").allTextContents(), ["Certificate", "CLR", "Skill Passport"]);
      const meanings = await root.locator(".sp-meaning-item p").allTextContents();
      assert.match(meanings[0], /one achievement/i);
      assert.match(meanings[1], /connected, structured record/i);
      assert.match(meanings[2], /learner-facing, portable expression/i);
      assert.deepEqual(await root.locator(".sp-storyline strong").allTextContents(), ["Institution", "Credential", "CLR", "Skill Passport", "Portfolio / CV / Application", "Recipient"]);
      assert.deepEqual(await root.locator(".sp-explorer > .sp-shell > .sp-source-key b").allTextContents(), ["Institution-issued", "Learner-added", "Attested"]);
      assert((await root.locator(".sp-final .sp-button-primary").textContent()).startsWith("Explore Skill Passport"));
      assert.equal(await root.locator(".sp-final .sp-button-secondary").textContent(), "Request a Platform Demo");
      for (const link of await root.locator(".sp-final a,.sp-hero .sp-button-secondary").all()) assert.equal(await link.getAttribute("href"), "https://info.certifyme.online/request-demo");
      const overlapsHero = await root.locator(".sp-hero-art").evaluate(figure => {
        const image = figure.querySelector("img").getBoundingClientRect(), caption = figure.querySelector("figcaption").getBoundingClientRect();
        return Math.max(image.left, caption.left) < Math.min(image.right, caption.right) && Math.max(image.top, caption.top) < Math.min(image.bottom, caption.bottom);
      });
      assert(!overlapsHero, `${name}: caption obscures product interface`);
      const tabs = root.locator("[data-sp-tab]"), panels = root.locator("[data-sp-panel]");
      assert.equal(await tabs.count(), 6);
      assert.deepEqual((await tabs.allTextContents()).map(text => text.trim()), views);
      const sources = new Set(), content = new Set();
      for (let i = 0; i < views.length; i++) {
        const tab = tabs.nth(i), panel = panels.nth(i);
        await tab.click();
        assert(await panel.isVisible());
        assert.equal(await root.locator("[data-sp-panel]:visible").count(), 1);
        assert.equal(await root.locator("[data-sp-tab][aria-selected='true']").count(), 1);
        assert.equal(await tab.getAttribute("aria-selected"), "true");
        assert.equal(await tab.getAttribute("tabindex"), "0");
        assert.equal(await tab.getAttribute("aria-controls"), await panel.getAttribute("id"));
        assert.equal(await panel.getAttribute("aria-labelledby"), await tab.getAttribute("id"));
        assert.match(await panel.textContent(), /institution-issued|learner-added|attested/i, `${name}: ${views[i]} lacks evidence provenance`);
        content.add((await panel.textContent()).trim());
        const image = panel.locator("img").first();
        sources.add(await image.getAttribute("src"));
        await image.scrollIntoViewIfNeeded();
        assert(await image.evaluate(async node => { await node.decode(); return node.naturalWidth > 400 && node.naturalHeight > 400; }), `${name}: ${views[i]} visual`);
        assert.equal(await panel.locator('a:has(img)').getAttribute("href"), await image.getAttribute("src"));
        const contrast = (await root.evaluate(visibleLabelContrast)).filter(row => !row.provisional && row.ratio < row.required);
        assert.deepEqual(contrast, [], `${name}: ${views[i]} contrast`);
        const collisions = await tabs.evaluateAll(nodes => nodes.flatMap(node => {
          const range = document.createRange(); range.selectNodeContents(node);
          const text = range.getBoundingClientRect(), box = node.getBoundingClientRect();
          return text.left < box.left - 1 || text.right > box.right + 1 ? [node.textContent] : [];
        }));
        assert.deepEqual(collisions, [], `${name}: overflowing tab labels`);
      }
      assert.equal(sources.size, 6);
      assert.equal(content.size, 6);
      await tabs.nth(5).press("ArrowRight");
      assert(await tabs.nth(0).evaluate(node => document.activeElement === node && node.getAttribute("aria-selected") === "true"));
      await tabs.nth(0).press("ArrowLeft");
      assert.equal(await tabs.nth(5).getAttribute("aria-selected"), "true");
      await tabs.nth(5).press("Home");
      await tabs.nth(0).press("End");
      assert.equal(await tabs.nth(5).getAttribute("aria-selected"), "true");
      await tabs.nth(5).press("Home");
      await tabs.nth(0).press("Tab");
      assert(await panels.nth(0).evaluate(node => document.activeElement === node));
      const faqs = [];
      for (const detail of await root.locator("details").all()) {
        const summary = detail.locator("summary");
        await summary.focus();
        assert(await summary.evaluate(node => getComputedStyle(node).outlineStyle !== "none"), "FAQ keyboard focus");
        await summary.press("Space");
        assert(await detail.evaluate(node => node.open));
        faqs.push({ name: await summary.textContent(), answer: (await detail.locator("p").textContent()).trim() });
        await summary.press("Space");
        assert(!(await detail.evaluate(node => node.open)));
      }
      assert.equal(faqs.length, 8);
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
      assert.equal(meta.title, "Skill Passport | Verified Learner Record | CertifyMe");
      assert.equal(meta.description, "Give learners a portable Skill Passport connecting verified credentials, skills, projects, experiences and achievements in one learner record.");
      assert.equal(meta.canonical, "https://www.certifyme.online/solutions/skill-passport");
      assert.equal(meta.ogUrl, meta.canonical);
      assert.match(meta.ogImage, /skill-passport-mobile\.webp$/);
      assert.equal(meta.ogWidth, "416");
      assert.equal(meta.ogHeight, "755");
      assert.equal(new Set(meta.ids).size, meta.ids.length, "Duplicate IDs");
      assert(meta.width <= meta.viewport + 1, `${name}: horizontal overflow`);
      assert.match(meta.font, /Source Sans 3/);
      const faqSchema = meta.schemas.flatMap(item => item["@graph"] || [item]).find(item => item["@type"] === "FAQPage");
      assert(faqSchema);
      assert.deepEqual(faqSchema.mainEntity.map(item => ({ name: item.name, answer: item.acceptedAnswer.text })), faqs);
      const missingLabels = await root.evaluate(el => [...el.querySelectorAll("[aria-labelledby]")].flatMap(n =>
        n.getAttribute("aria-labelledby").split(/\s+/).filter(id => !document.getElementById(id))));
      assert.deepEqual(missingLabels, []);
      const hierarchy = await root.locator("h1,h2,h3").evaluateAll(nodes => nodes.map(n => Number(n.tagName.slice(1))));
      for (let i = 1; i < hierarchy.length; i++) assert(hierarchy[i] <= hierarchy[i - 1] + 1, `Heading hierarchy jump at ${i}`);
      let visible = 0;
      for (const element of await root.locator("h1,h2,h3,p,li,img,figcaption,a,span:not([aria-hidden]),strong").all()) {
        if (!(await element.isVisible())) continue;
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
      assert(images.length >= 7);
      assert(!images.some(i => i.status === "FAIL"), JSON.stringify(images.filter(i => i.status === "FAIL")));
      assert.equal(await root.locator("img:not([width]),img:not([height]),img:not([alt])").count(), 0);
      await root.locator(".sp-hero .sp-button-primary").click();
      const anchor = await root.locator("#passport-explorer").boundingBox();
      assert(anchor.y >= 60 && anchor.y < 350, `${name}: explorer anchor y=${anchor.y}`);
      await page.keyboard.press("Tab");
      for (const link of await root.locator("a").all()) {
        if (!(await link.isVisible())) continue;
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
      console.log(`PASS ${name}: 13 ordered sections, 6 changing visuals with source labels, keyboard controls, ${visible} visibility/contrast checks, FAQs/schema, links, colour theme and SEO`);
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
    for (const privatePath of ["/docs/skillstory-assets.md", "/.local/reports/skill-passport/source-pages.json", "/attached_assets/Pasted--REPLIT-TASK-IMPROVE-SKILL-PASSPORT-PAGE-URL-https-www-_1791477264343.txt"]) {
      assert.equal((await page.request.get(base + privatePath)).status(), 404, `Private inventory served: ${privatePath}`);
    }
    const sourceLink = page.locator('#sp-page .sp-hero a:has(img)').first();
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
    assert.deepEqual((await plain.locator("#sp-page h2").allTextContents()).map(normalize), [heroHeading, ...sections].map(normalize));
    assert(await plain.locator("#sp-page h1").isVisible());
    assert.equal(await plain.locator('#sp-page a[href="https://info.certifyme.online/request-demo"]').count(), 3);
    assert.equal(await plain.locator("[data-sp-panel]:visible").count(), 6);
    assert.equal(await plain.locator("[data-sp-tab]:visible").count(), 0);
    await plain.locator("details summary").first().click();
    assert(await plain.locator("details").first().evaluate(node => node.open));
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
