const assert = require("node:assert/strict");
const { execFileSync } = require("node:child_process");
const { chromium } = require("playwright");
const { visibleLabelContrast } = require("./lib/visible-label-contrast.cjs");

const base = process.env.STM_BASE_URL || `https://${process.env.REPLIT_DEV_DOMAIN}`;
const route = "/skills-taxonomy-mapping";
const headings = [
  "What Is Skills Taxonomy Mapping?", "Why Credentials Need a Skills Layer",
  "How CertifyMe Maps Outcomes to Skills", "Institutional Skills vs External Taxonomies",
  "ESCO / O*NET / Custom Frameworks", "Review & Governance",
  "Skills in Credentials", "Skills in Learner Records", "Skills in Workforce Intelligence",
];

async function run() {
  const browser = await chromium.launch({
    executablePath: execFileSync("which", ["chromium"], { encoding: "utf8" }).trim(),
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
  });
  try {
    for (const width of [320, 390, 768, 1024, 1440, 1920]) {
      const context = await browser.newContext({
        viewport: { width, height: 1000 }, reducedMotion: "reduce",
      });
      await context.addInitScript(`window.stmContrast = ${visibleLabelContrast.toString()}`);
      const page = await context.newPage();
      const errors = [];
      page.on("pageerror", error => errors.push(error.message));
      assert.equal((await page.goto(base + route, { waitUntil: "load" })).status(), 200);
      await page.evaluate(() => document.fonts.ready);
      const root = page.locator("#stm-page");
      assert.equal(await page.title(), "Skills Taxonomy Mapping | CertifyMe");
      assert.equal(await page.locator('meta[name="description"]').getAttribute("content"),
        "Map learning outcomes and institutional achievements to reviewed skills using ESCO, O*NET and custom skills frameworks.");
      assert((await page.locator('link[rel="canonical"]').getAttribute("href")).endsWith(route));
      assert.equal(await page.locator("main").count(), 1);
      assert.equal(await page.locator("h1").count(), 1);
      assert.equal(await root.locator("h1").textContent(), "Skills Taxonomy Mapping");
      assert.equal(await root.locator(".stm-hero-headline").textContent(), "Turn Learning Outcomes Into Structured Skills");
      assert.equal(await root.locator(".stm-hero-lead").textContent(),
        "Connect institution-defined learning outcomes, achievements and evidence to reviewed skills using recognised and institution-specific taxonomies.");
      assert.equal(await root.locator("blockquote p").textContent(),
        "The institution determines what an achievement represents. Taxonomies provide a common language for representing and comparing those capabilities.");
      assert.deepEqual(await root.locator(".stm-storyline li b").allTextContents(), [
        "Learning outcome", "Evidence", "Institutional review", "Skill", "Taxonomy",
        "Credential", "Learner record", "Workforce context",
      ]);
      assert.deepEqual(await root.locator(".stm-content > section.stm-section h2").allTextContents(), headings);
      assert((await root.locator(".stm-hero .stm-button-primary").textContent()).includes("Map Your Skills Framework"));
      assert.equal(await root.locator(".stm-hero .stm-button-secondary").textContent(), "Request an Institutional Demo");
      assert.equal(await root.locator(".stm-hero .stm-button-secondary").getAttribute("href"), "https://info.certifyme.online/request-demo");
      await root.locator('.stm-hero a[href="#mapping-example"]').click();
      assert.equal(new URL(page.url()).hash, "#mapping-example");
      assert.equal(await root.locator('[role="tabpanel"]:visible').count(), 1);
      const first = root.locator("#stm-panel-1");
      assert.equal(await first.locator(".stm-map-step > strong").nth(0).textContent(), "Evaluate strategic choices");
      assert.equal(await first.locator(".stm-map-step > strong").nth(1).textContent(), "Strategic decision-making");
      assert.equal(await first.locator(".stm-map-step > strong").nth(3).textContent(), "Programme achievement");
      for (let i = 1; i <= 3; i++) {
        const tab = root.locator(`#stm-tab-${i}`);
        await tab.click();
        assert.equal(await tab.getAttribute("aria-selected"), "true");
        assert.equal(await tab.getAttribute("tabindex"), "0");
        const panel = root.locator(`#stm-panel-${i}`);
        assert(await panel.isVisible());
        assert.equal(await root.locator('[role="tabpanel"]:visible').count(), 1);
        assert((await panel.textContent()).includes("Review required"));
        for (const value of ["ESCO", "O*NET", "Custom framework", "Institutional framework"]) {
          await panel.locator("select").selectOption(value);
          assert.equal(await panel.locator("[data-framework-output]").textContent(), value);
          assert((await root.locator('[aria-live="polite"]').textContent()).includes("requires institutional evidence and review"));
        }
        const lowContrast = (await root.evaluate(node => window.stmContrast(node)))
          .filter(item => item.ratio < item.required - 0.05)
          .map(({ text, ratio, required }) => ({ text, ratio, required }));
        assert.deepEqual(lowContrast, [], `${width}px panel ${i} contrast`);
      }
      await root.locator("#stm-tab-3").press("ArrowRight");
      assert.equal(await root.locator("#stm-tab-1").getAttribute("aria-selected"), "true");
      assert(await root.locator("#stm-tab-1").evaluate(node => document.activeElement === node));
      await root.locator("#stm-tab-1").press("End");
      assert.equal(await root.locator("#stm-tab-3").getAttribute("aria-selected"), "true");
      await root.locator("#stm-tab-3").press("Home");
      assert.equal(await root.locator("#stm-tab-1").getAttribute("aria-selected"), "true");
      const questions = [];
      for (const detail of await root.locator(".stm-faq-list details").all()) {
        await detail.locator("summary").click();
        assert(await detail.evaluate(node => node.open));
        questions.push({
          name: await detail.locator("summary").textContent(),
          answer: await detail.locator("p").textContent(),
        });
        await detail.locator("summary").click();
        assert(!(await detail.evaluate(node => node.open)));
      }
      assert.equal(questions.length, 11);
      const schema = await page.locator('script[type="application/ld+json"]').evaluateAll(nodes =>
        nodes.map(node => JSON.parse(node.textContent)).flatMap(item =>
          Array.isArray(item) ? item : item["@graph"] || [item]).find(item => item["@type"] === "FAQPage"));
      assert(schema);
      assert.deepEqual(schema.mainEntity.map(item => ({
        name: item.name, answer: item.acceptedAnswer.text,
      })), questions);
      const layout = await page.evaluate(() => {
        const ids = [...document.querySelectorAll("[id]")].map(node => node.id);
        return {
          overflow: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - innerWidth,
          duplicates: ids.filter((id, i) => ids.indexOf(id) !== i),
        };
      });
      assert(layout.overflow <= 1, `${width}px overflow: ${layout.overflow}`);
      assert.deepEqual(layout.duplicates, []);
      assert.deepEqual(errors, []);
      console.log(`PASS ${width}px: 3 examples, 4 frameworks, keyboard, 11 FAQs/schema, SEO, contrast, no overflow`);
      await context.close();
    }
    const page = await browser.newPage();
    await page.goto(base + route);
    const hrefs = await page.locator("#stm-page a").evaluateAll(nodes =>
      [...new Set(nodes.map(a => a.getAttribute("href")))]);
    for (const href of hrefs) {
      assert(href && href !== "#");
      if (href.startsWith("/")) assert.equal((await page.request.get(base + href)).status(), 200, href);
      if (href.startsWith("#")) assert.equal(await page.locator(`[id="${href.slice(1)}"]`).count(), 1, href);
    }
    for (const href of ["/solutions/digital-credential-infrastructure", "/comprehensive-learner-record",
      "/workforce-intelligence", "/solutions/skill-passport"]) assert(hrefs.includes(href));
    assert.equal((await page.request.get(base + "/attached_assets/Pasted--REPLIT-TASK-IMPROVE-SKILLS-TAXONOMY-MAPPING-URL-https-_1791457818906.txt")).status(), 404);
    const nojs = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 1000 } });
    const nojsPage = await nojs.newPage();
    await nojsPage.goto(base + route);
    assert.equal(await nojsPage.locator("#stm-page [role='tabpanel']:visible").count(), 3);
    assert.equal(await nojsPage.locator(".stm-example-switcher:visible").count(), 0);
    assert.equal(await nojsPage.locator(".stm-framework-control:visible").count(), 0);
    await nojsPage.locator(".stm-faq-list summary").first().click();
    assert(await nojsPage.locator(".stm-faq-list details").first().evaluate(node => node.open));
    await nojs.close();
    console.log("PASS required internal links, private brief protection and no-JavaScript examples/FAQs");
  } finally {
    await browser.close();
  }
}
run().catch(error => { console.error(error); process.exitCode = 1; });
