#!/usr/bin/env node
"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const { chromium, devices } = require("playwright");
const { visibleLabelContrast } = require("./lib/visible-label-contrast.cjs");

const base = process.env.PRICING_TEST_BASE_URL || `https://${process.env.REPLIT_DEV_DOMAIN}`;
const data = JSON.parse(execFileSync("ruby", ["-rjson", "-ryaml", "-e",
  'puts JSON.generate(YAML.load_file("_data/pricing.yml"))'], { encoding: "utf8" }));
const normalize = text => text.trim().replace(/\s+/g, " ");
const temp = fs.mkdtempSync(path.join(os.tmpdir(), "pricing-browser-"));
const profiles = [320, 390, 768, 1024, 1440, 1920].map(width => ({
  name: `${width}px`, viewport: { width, height: 1000 },
}));
profiles.push({ name: "iPhone touch", ...devices["iPhone 13"] });

assert.deepEqual(data.plans.map(p => p.name), ["Essentials", "Professional", "Enterprise"]);
assert.deepEqual(data.comparison.map(c => c.rows.length), [7, 5, 8, 6, 5, 6, 5, 9]);
assert.equal(data.faqs.length, 10);
assert.equal(data.solutions.cards.length, 4);
for (const plan of data.plans) {
  assert.equal(plan.bullets.length, 6);
  assert(plan.entitlements.length >= 12);
  assert(plan.commercial_approval_status);
}
for (const file of ["pricing.md", "_layouts/V4Layoutpricing.html", "assets4/css/pricing.css"]) {
  assert(!/5,000|25,000|50,000/.test(fs.readFileSync(file, "utf8")),
    `${file}: proposed limits must be maintained only in central data`);
}

async function checkGeometry(root, profile) {
  const failures = await root.evaluate(element => {
    const width = window.innerWidth;
    const failures = [];
    for (const node of element.querySelectorAll("h1,h2,h3,p,li,summary,a,.pricing-capacity__row,td")) {
      if (node.closest("thead")) continue;
      const rect = node.getBoundingClientRect();
      if (!rect.width || !rect.height || getComputedStyle(node).visibility === "hidden") continue;
      if (rect.left < -1 || rect.right > width + 1) failures.push(node.textContent.trim());
      const range = document.createRange();
      range.selectNodeContents(node);
      for (const line of range.getClientRects()) {
        if (line.width > 1 && (line.left < -1 || line.right > width + 1))
          failures.push(`text: ${node.textContent.trim()}`);
      }
    }
    return failures;
  });
  assert.deepEqual(failures, [], `${profile}: clipped material information`);
}

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
      const response = await page.goto(`${base}/pricing`, { waitUntil: "load" });
      assert.equal(response.status(), 200);
      assert.match(response.headers()["content-type"], /text\/html/);
      await page.evaluate(() => document.fonts.ready);
      const root = page.locator("main#main-content");
      assert(await page.evaluate(() => {
        const hero = document.querySelector(".pricing-hero .pricing-eyebrow").getBoundingClientRect();
        const headers = [...document.querySelectorAll("#header .wsmobileheader,#header .wsmainfull")]
          .map(e => e.getBoundingClientRect()).filter(r => r.width > 1 && r.height > 1 && r.top < 2);
        return headers.every(r => hero.top >= r.bottom);
      }), `${name}: fixed navigation obscures hero introduction`);
      assert.equal(await page.locator("h1").count(), 1);
      assert.equal(await root.locator("h1").innerText(),
        "Choose the Right Foundation for Your Credential Programs");
      assert.equal(await page.title(), "CertifyMe Pricing | Digital Credential Platform for Institutions");
      assert.equal(await page.locator('meta[name="description"]').getAttribute("content"),
        "Explore CertifyMe plans for digital credential issuance, institutional administration, verification, integrations, and enterprise credential management.");
      assert.equal(await page.locator('link[rel="canonical"]').getAttribute("href"),
        "https://www.certifyme.online/pricing");
      assert.equal(await page.locator('meta[property="og:url"]').getAttribute("content"),
        "https://www.certifyme.online/pricing");
      assert.match(await root.evaluate(e => getComputedStyle(e).fontFamily), /Source Sans 3/);
      assert.equal(await root.locator(".pricing-btn").first().evaluate(e =>
        getComputedStyle(e).backgroundColor), "rgb(79, 70, 229)");

      const cards = root.locator(".pricing-card");
      assert.equal(await cards.count(), 3);
      assert.deepEqual(await cards.locator("h3").allTextContents(), data.plans.map(p => p.name));
      assert.equal(await root.locator(".pricing-card--recommended h3").innerText(), "Professional");
      for (let i = 0; i < data.plans.length; i++) {
        const plan = data.plans[i], card = cards.nth(i);
        assert.equal(normalize(await card.locator(".pricing-card__headline").innerText()), plan.headline);
        assert.equal(normalize(await card.locator(".pricing-card__description").innerText()), plan.description);
        assert.deepEqual(await card.locator(".pricing-capacity__row strong").allTextContents(),
          Object.values(plan.capacity));
        assert.deepEqual(await card.locator(".pricing-card__list li").allTextContents(), plan.bullets);
        assert.equal(await card.locator(".pricing-btn").innerText(), plan.cta);
        assert.equal(await card.locator(".pricing-btn").getAttribute("href"), plan.href);
        const disclosure = card.locator("details");
        const summary = disclosure.locator("summary");
        await summary.focus();
        await summary.press("Enter");
        assert(await disclosure.evaluate(e => e.open));
        assert.deepEqual(await disclosure.locator("li").allTextContents(), plan.entitlements);
        await summary.press("Space");
        assert(!(await disclosure.evaluate(e => e.open)));
      }
      const note = await cards.first().locator(".pricing-card__note").innerText();
      assert.equal(note, `${data.plans[0].note_prefix}${data.plans[0].capacity.credentials.toLowerCase()}${data.plans[0].note_suffix}`);
      const boxes = await cards.evaluateAll(nodes => nodes.map(e => {
        const r = e.getBoundingClientRect(); return { x: r.x, y: r.y, bottom: r.bottom };
      }));
      if (options.viewport.width >= 981) {
        assert(Math.max(...boxes.map(b => b.y)) - Math.min(...boxes.map(b => b.y)) < 2);
        for (const selector of [".pricing-capacity", ".pricing-card__list", ".pricing-card__bottom"]) {
          const tops = await cards.locator(selector).evaluateAll(nodes => nodes.map(e => e.getBoundingClientRect().top));
          assert(Math.max(...tops) - Math.min(...tops) < 3, `${name}: ${selector} alignment`);
        }
      } else {
        assert(boxes[1].y >= boxes[0].bottom && boxes[2].y >= boxes[1].bottom);
      }

      const categories = root.locator(".pricing-category");
      assert.equal(await categories.count(), 8);
      for (let i = 0; i < data.comparison.length; i++) {
        const category = categories.nth(i), summary = category.locator("summary");
        assert.equal(await summary.innerText(), data.comparison[i].category);
        if (!(await category.evaluate(e => e.open))) {
          await summary.focus(); await summary.press("Enter");
        }
        assert(await category.evaluate(e => e.open));
        const rows = category.locator("tbody tr");
        assert.equal(await rows.count(), data.comparison[i].rows.length);
        for (let j = 0; j < data.comparison[i].rows.length; j++) {
          const expected = data.comparison[i].rows[j], cells = rows.nth(j).locator("td");
          const values = data.plans.map(plan => {
            const value = expected[plan.key];
            return value.startsWith("capacity.") ? plan.capacity[value.slice(9)] : value;
          });
          assert.deepEqual((await cells.allTextContents()).map(normalize), [expected.feature, ...values]);
          assert.deepEqual(await cells.all().then(nodes => Promise.all(nodes.slice(1).map(n => n.getAttribute("data-plan")))),
            data.plans.map(p => p.name));
          for (const cell of await cells.all()) assert(await cell.isVisible(), `${name}: hidden comparison cell`);
        }
        await summary.press("Space");
        assert(!(await category.evaluate(e => e.open)));
        await summary.press("Enter");
      }
      assert.equal(await root.locator(".pricing-matrix tbody tr").count(), 51);
      assert.equal(await root.locator(".editorial-table-scroll,.editorial-table-hint").count(), 0,
        "Stacked comparisons must not receive the legacy horizontal-scroll treatment");
      const faqs = root.locator(".pricing-faq");
      assert.equal(await faqs.count(), 10);
      for (let i = 0; i < data.faqs.length; i++) {
        const faq = faqs.nth(i), summary = faq.locator("summary");
        assert.equal(await summary.innerText(), data.faqs[i].question);
        await summary.focus(); await summary.press("Enter");
        assert(await faq.evaluate(e => e.open));
        assert.equal(await faq.locator(".pricing-faq__answer").innerText(), data.faqs[i].answer);
      }
      assert.equal(await root.locator(".pricing-solution").count(), 4);
      assert.equal(await root.locator(".pricing-enterprise__list li").count(), 6);
      for (const selector of [".pricing-model", ".pricing-solutions", ".pricing-enterprise", ".pricing-final"])
        assert(await root.locator(selector).isVisible());
      const publicText = await root.innerText();
      assert(!/unlimited|StartUp|Signature|pending|commercial_approval|approved_at|\$\s*\d|save \d+%|free trial/i.test(publicText));
      assert.match(publicText, /not automatically included in core plans/);
      assert.match(publicText, /Recipients and administrative users are different/);
      const schema = (await page.locator('script[type="application/ld+json"]').allTextContents())
        .map(text => JSON.parse(text));
      const schemaText = JSON.stringify(schema);
      assert(!/"offers"|"price"|"aggregateRating"|"Review"/.test(schemaText));
      assert(schemaText.includes("https://www.certifyme.online/pricing#webpage"));
      assert.equal(await page.locator('header').count(), 1);
      assert.equal(await page.locator('footer').count(), 1);
      assert(await page.locator('script[src*="googletagmanager"],iframe[src*="googletagmanager"]').count() > 0);
      const contrast = (await root.evaluate(visibleLabelContrast))
        .filter(row => !row.provisional && row.ratio < row.required);
      assert.deepEqual(contrast, [], `${name}: contrast`);
      await checkGeometry(root, name);
      assert(await page.evaluate(() =>
        Math.max(document.body.scrollWidth, document.documentElement.scrollWidth) <= innerWidth + 1));
      for (const link of await root.locator(".pricing-btn").all()) {
        await link.focus(); await page.keyboard.press("Tab"); await page.keyboard.press("Shift+Tab");
        assert(await link.evaluate(e => document.activeElement === e));
        assert(await link.evaluate(e => getComputedStyle(e).outlineStyle !== "none"));
        await link.hover();
        assert.deepEqual((await link.evaluate(visibleLabelContrast)).filter(r => !r.provisional && r.ratio < r.required), []);
      }
      assert.deepEqual(errors, []);
      const menuToggle = page.locator("#wsnavtoggle");
      if (await menuToggle.isVisible()) {
        await menuToggle.click();
        assert.equal(await menuToggle.getAttribute("aria-expanded"), "true");
        const pricingLink = page.locator("#wsmenu-main").getByRole("link", { name: "Pricing", exact: true });
        await pricingLink.waitFor({ state: "visible" });
        await menuToggle.click();
        assert.equal(await menuToggle.getAttribute("aria-expanded"), "false");
      }
      console.log(`PASS ${name}: three plans, aligned/stacked cards, all 51 feature rows and 10 FAQs, keyboard disclosures, contrast, geometry, metadata and safeguards`);
      await context.close();
    }

    const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
    const page = await context.newPage();
    for (const route of ["/pricing", "/pricing.html"]) {
      assert.equal((await page.goto(`${base}${route}`)).status(), 200);
      assert.equal(await page.locator('link[rel="canonical"]').getAttribute("href"), "https://www.certifyme.online/pricing");
      await page.locator(".pricing-category").nth(3).locator("summary").click();
      assert(await page.locator(".pricing-category").nth(3).locator("table").isVisible());
    }
    const routes = new Set();
    for (const href of await page.locator("main a").evaluateAll(nodes => nodes.map(a => a.getAttribute("href"))))
      if (href.startsWith("/")) routes.add(href);
    for (const route of routes) assert.equal((await context.request.get(`${base}${route}`)).status(), 200, route);
    for (const route of ["/_data/pricing.yml", "/attached_assets/Pasted--CERTIFYME-PRICING-PAGE-COMPLETE-REDESIGN-YOUR-ROLE-You_1791603707613.txt"])
      assert.equal((await context.request.get(`${base}${route}`)).status(), 404, `${route}: private input exposed`);
    const sitemap = await (await context.request.get(`${base}/sitemap.xml`)).text();
    assert.equal((sitemap.match(/<loc>[^<]*\/pricing(?:\.html)?<\/loc>/g) || []).length, 1);
    for (const route of ["/solutions/skill-passport", "/transcript-management", "/skills-taxonomy-mapping", "/"]) {
      assert.equal((await page.goto(`${base}${route}`)).status(), 200);
      assert.equal(await page.locator('link[rel="canonical"]').getAttribute("href"), `https://www.certifyme.online${route}`);
    }
    console.log("PASS both pricing routes, one indexable canonical, no-JS disclosures, linked solutions, private exclusions and unchanged unrelated canonicals");
    await context.close();
  } finally {
    await browser.close();
    fs.rmSync(temp, { recursive: true, force: true });
  }
}
run().catch(error => { console.error(error); process.exitCode = 1; });
