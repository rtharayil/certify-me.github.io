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
  "tm-access", "tm-sis", "tm-security", "tm-recipient", "tm-exchange",
  "tm-governance", "tm-final-title",
];
const steps = ["Request", "Authenticate", "Review", "Generate", "Sign", "Deliver", "Verify"];
const headings = [
  "The Transcript Management Problem", "One Workflow From Request to Verification",
  "Registrar Operations", "Student & Alumni Portal", "Secure Long-Term Access", "SIS Integration",
  "Transcript Security & Integrity", "Recipient Verification", "Institution-to-Institution Sharing",
  "Governance / Retention", "Modernize Transcript Management",
];
const profiles = [320, 390, 768, 1024, 1440, 1920].map(width => ({
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
      assert.equal(await root.locator("h1").innerText(), "Transcript Management Software for Universities");
      assert.deepEqual(await root.locator(":scope > section").evaluateAll(ns => ns.map(n => n.getAttribute("aria-labelledby"))), expected);
      assert.deepEqual(await root.locator(":scope > section:not(.tm-hero) h2").allTextContents(), headings);
      assert.equal(await root.locator(".tm-hero h2").textContent(), "From Transcript Request to Secure Verification");
      assert.equal(await root.locator(".tm-hero-copy").textContent(), "Automate transcript requests, processing, delivery and verification while keeping the university SIS as the authoritative source of academic data.");
      assert.equal(await root.locator(".tm-sis-promise").textContent(), "Keep the university's SIS as the source of truth. Modernize the workflow around it.");
      assert.equal(await root.locator(".tm-hero .tm-eyebrow").textContent(), "EduTranscript by CertifyMe");
      for (const buyer of ["Registrar", "Student Services", "IT", "Records Management"]) assert((await root.locator(".tm-buyer-line").textContent()).includes(buyer));
      assert.deepEqual(await root.locator(".tm-workflow-map li strong").allTextContents(), steps);
      assert.equal(await root.locator(".tm-hero .tm-button-primary").evaluate(node => getComputedStyle(node).backgroundColor), "rgb(57, 53, 139)");
      assert.equal(await root.locator(".tm-hero").evaluate(node => getComputedStyle(node).backgroundColor), "rgb(245, 245, 255)");
      assert((await root.locator(".tm-final .tm-button-primary").textContent()).startsWith("Modernize Transcript Management"));
      assert.equal(await root.locator(".tm-final .tm-button-secondary").textContent(), "Request a Platform Demo");
      for (const link of await root.locator(".tm-final a,.tm-hero .tm-button-secondary").all()) assert.equal(await link.getAttribute("href"), "https://info.certifyme.online/request-demo");
      const tabs = root.locator("[data-tm-tab]");
      const panels = root.locator("[data-tm-panel]");
      assert.equal(await tabs.count(), 7);
      const screenshotSources = new Set(), explanations = new Set();
      for (let i = 0; i < steps.length; i++) {
        const tab = tabs.nth(i), panel = panels.nth(i);
        await tab.click();
        assert.equal(await tab.getAttribute("aria-selected"), "true");
        assert.equal(await tab.getAttribute("tabindex"), "0");
        assert.equal(await root.locator("[data-tm-tab][aria-selected='true']").count(), 1);
        assert.equal(await root.locator("[data-tm-panel]:visible").count(), 1);
        assert(await panel.isVisible());
        assert.equal(await tab.getAttribute("aria-controls"), await panel.getAttribute("id"));
        assert.equal(await panel.getAttribute("aria-labelledby"), await tab.getAttribute("id"));
        assert.equal(await panel.locator("h3").textContent(), steps[i]);
        screenshotSources.add(await panel.locator("img").getAttribute("src"));
        explanations.add(await panel.locator(".tm-stage-copy p").textContent());
        await panel.locator("img").scrollIntoViewIfNeeded();
        assert(await panel.locator("img").evaluate(async image => {
          await image.decode();
          return image.naturalWidth > 400 && image.naturalHeight > 300;
        }), `${name}: ${steps[i]} screenshot failed`);
        assert.equal(await panel.locator("a").getAttribute("href"), await panel.locator("img").getAttribute("src"));
        const contrast = (await root.evaluate(visibleLabelContrast)).filter(r => !r.provisional && r.ratio < r.required - .05);
        assert.deepEqual(contrast, [], `${name}: ${steps[i]} text contrast`);
        const collisions = await root.locator(".tm-step-label").evaluateAll(nodes => nodes.flatMap(node => {
          const range = document.createRange(); range.selectNodeContents(node);
          const text = range.getBoundingClientRect(), button = node.closest("button").getBoundingClientRect();
          return text.left < button.left - 1 || text.right > button.right + 1 ? [node.textContent] : [];
        }));
        assert.deepEqual(collisions, [], `${name}: step labels exceed buttons`);
      }
      assert.equal(screenshotSources.size, 7);
      assert.equal(explanations.size, 7);
      await tabs.nth(6).press("ArrowRight");
      assert.equal(await tabs.nth(0).getAttribute("aria-selected"), "true");
      assert(await tabs.nth(0).evaluate(node => document.activeElement === node));
      await tabs.nth(0).press("End");
      assert.equal(await tabs.nth(6).getAttribute("aria-selected"), "true");
      await tabs.nth(6).press("Home");
      await tabs.nth(0).press("Tab");
      assert(await panels.nth(0).evaluate(node => document.activeElement === node));
      assert((await root.locator(".tm-section-source").textContent()).includes("integration"));
      assert((await root.locator(".tm-section-governance").textContent()).includes("retention"));
      const faqs = [];
      for (const detail of await root.locator(".tm-faq details").all()) {
        await detail.locator("summary").click();
        assert(await detail.evaluate(node => node.open));
        faqs.push({ name: await detail.locator("summary").textContent(), answer: (await detail.locator("p").textContent()).trim() });
        await detail.locator("summary").click();
        assert(!(await detail.evaluate(node => node.open)));
      }
      assert.equal(faqs.length, 7);
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
      assert.equal(meta.title, "Transcript Management Software for Universities | EduTranscript");
      assert.equal(meta.description, "Automate university transcript requests, processing, delivery and verification with EduTranscript by CertifyMe.");
      assert.equal(meta.canonical, "https://www.certifyme.online" + route);
      assert.equal(meta.ogUrl, meta.canonical);
      assert.match(meta.ogImage, /edutranscript-portal-for-student-to-request-their-transcript\.webp$/);
      assert(meta.width <= options.viewport.width + 1, `${name}: body overflow`);
      assert.equal(new Set(meta.ids).size, meta.ids.length, "Duplicate IDs");
      assert.match(meta.font, /Source Sans 3/);
      const faqSchema = meta.schemas.flatMap(item => item["@graph"] || [item]).find(item => item["@type"] === "FAQPage");
      assert(faqSchema);
      assert.deepEqual(faqSchema.mainEntity.map(item => ({ name: item.name, answer: item.acceptedAnswer.text })), faqs);
      assert.deepEqual(await root.evaluate(el => [...el.querySelectorAll("[aria-labelledby]")].flatMap(n => n.getAttribute("aria-labelledby").split(/\s+/).filter(id => !document.getElementById(id)))), []);
      const levels = await root.locator("h1,h2,h3").evaluateAll(ns => ns.map(n => +n.tagName[1]));
      for (let i = 1; i < levels.length; i++) assert(levels[i] <= levels[i - 1] + 1, "Heading hierarchy jump");
      assert.equal(await root.locator('img:not([loading="lazy"])').count(), 1);
      let visible = 0;
      for (const node of await root.locator("h1,h2,h3,p,li,img,figcaption,a,span:not([aria-hidden]),strong,th,td").all()) {
        if (!(await node.isVisible())) continue;
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
      const images = await page.evaluate(inspectImages, "#ts-page img:not([hidden])");
      assert(!images.some(i => i.status === "FAIL"), JSON.stringify(images.filter(i => i.status === "FAIL")));
      assert.equal(await root.locator("img:not([width]),img:not([height]),img:not([alt])").count(), 0);
      await root.locator('.tm-hero a[href="#workflow"]').click();
      const anchor = await root.locator("#workflow").boundingBox();
      assert(anchor.y >= 60 && anchor.y < 350, `${name}: workflow anchor y=${anchor.y}`);
      await page.keyboard.press("Tab");
      for (const link of await root.locator("a.tm-button,a.tm-image-link").all()) {
        if (!(await link.isVisible())) continue;
        await link.focus();
        assert(await link.evaluate(e => document.activeElement === e && getComputedStyle(e).outlineStyle !== "none"), "Missing visible keyboard focus");
        await link.hover();
        const contrast = (await link.evaluate(visibleLabelContrast)).filter(r => !r.provisional && r.ratio < r.required);
        if (contrast.length) report.errors.push({ name, hoverContrast: contrast });
      }
      assert.equal(await page.locator(`.wsmenu-list a[href="${route}"]`).count(), 1);
      assert.deepEqual(errors, []);
      report.profiles.push({ name, visibleChecks: visible, images: images.length, result: "PASS" });
      console.log(`PASS ${name}: 11 ordered sections, 7 distinct product visuals/copy, keyboard, ${visible} visibility/contrast checks, FAQs/schema, metadata, brand colours and links`);
      await context.close();
    }
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto(base + route);
    const links = await page.locator("#ts-page").evaluate(el => [...new Set([...el.querySelectorAll('a[href^="/"]')].map(a => a.getAttribute("href")))]);
    for (const href of [...links, "/", "/transcript-management", "/eduTranscript.html", "/solutions/skill-passport"]) {
      assert.equal((await page.request.get(new URL(href, base).href)).status(), 200, `Broken destination: ${href}`);
    }
    for (const href of ["/docs/edutranscript-assets.md", "/.local/reports/transcript-solution/source-pages.json", "/attached_assets/Pasted--REPLIT-TASK-IMPROVE-TRANSCRIPT-MANAGEMENT-PAGE-URL-htt_1791476162952.txt"]) {
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
    assert.equal(await plain.locator("#ts-page > section").count(), 12);
    assert(await plain.locator("#ts-page h1").isVisible());
    assert.equal(await plain.locator('#ts-page a[href="https://info.certifyme.online/request-demo"]').count(), 3);
    assert.equal(await plain.locator("[data-tm-panel]:visible").count(), 7);
    assert.equal(await plain.locator("[data-tm-tab]:visible").count(), 0);
    assert.deepEqual(await plain.locator("[data-tm-panel] h3").allTextContents(), steps);
    await plain.locator(".tm-faq summary").first().click();
    assert(await plain.locator(".tm-faq details").first().evaluate(node => node.open));
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
