const assert = require("node:assert/strict");
const { execFileSync } = require("node:child_process");
const { chromium } = require("playwright");
const { visibleLabelContrast } = require("./lib/visible-label-contrast.cjs");

const base = process.env.WI_BASE_URL || `https://${process.env.REPLIT_DEV_DOMAIN}`;
const route = "/workforce-intelligence";
const questions = [
  "What skills do our programmes develop?",
  "Which occupations use those skills?",
  "How is employer demand changing?",
];
const headings = [
  "What Is Workforce Intelligence?", "From Programme Evidence to Workforce Questions",
  "Skills → Occupations", "Employer Demand", "Curriculum & Programme Planning",
  "Career / Employability Teams", "Employer Engagement", "Job Engine / Data Architecture",
  "Institutional Governance",
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
      await context.addInitScript(`window.wiContrast = ${visibleLabelContrast.toString()}`);
      const page = await context.newPage();
      const errors = [];
      page.on("pageerror", error => errors.push(error.message));
      assert.equal((await page.goto(base + route, { waitUntil: "load" })).status(), 200);
      await page.evaluate(() => document.fonts.ready);
      const root = page.locator("#wi-page");
      assert.equal(await root.locator(".wi-hero-head .wi-button").first().evaluate(node => getComputedStyle(node).backgroundColor), "rgb(57, 53, 139)");
      assert.equal(await root.locator(".wi-hero").evaluate(node => getComputedStyle(node).backgroundColor), "rgb(245, 245, 255)");
      assert.equal(await page.title(), "Workforce Intelligence for Universities | CertifyMe");
      assert.equal(await page.locator('meta[name="description"]').getAttribute("content"),
        "Connect programme skills and learning evidence to occupations, employer demand and workforce trends for institutional planning.");
      assert((await page.locator('link[rel="canonical"]').getAttribute("href")).endsWith(route));
      assert.equal(await page.locator("main").count(), 1);
      assert.equal(await page.locator("h1").count(), 1);
      assert.equal(await root.locator("h1").textContent(), "Workforce Intelligence for Universities");
      assert.equal(await root.locator(".wi-hero-head h2").textContent(), "Connect Programme Skills to Workforce Demand");
      assert.equal(await root.locator(".wi-lead").textContent(),
        "Understand how institution-defined programme skills relate to occupations, employers, locations and changing workforce demand.");
      assert.deepEqual(await root.locator(".wi-journey li strong").allTextContents(), [
        "Programme", "Learning outcomes", "Skills", "Occupations", "Employer demand", "Institutional decision",
      ]);
      assert.deepEqual(await root.locator(".wi-question h3").allTextContents(), questions);
      assert.deepEqual(await root.locator(":scope > .wi-section h2").allTextContents(), headings);
      assert.deepEqual(await root.locator(".wi-engine-steps strong").allTextContents(), [
        "Company and job-provider sourcing", "Ongoing ingestion", "Enrichment", "Normalisation",
        "Skill and taxonomy mapping", "Occupation and job structuring", "Workforce and opportunity insight",
      ]);
      assert((await root.locator(".wi-refresh").textContent()).includes("every two weeks"));
      assert((await root.locator(".wi-engine").textContent()).includes("job-farming engine"));
      assert.equal(await root.getByRole("link", { name: /find jobs|apply for jobs|search vacancies/i }).count(), 0);
      assert.equal(await root.locator(".wi-hero-head .wi-button-secondary").textContent(), "Discuss Your Institutional Use Case");
      assert((await root.locator(".wi-final-actions .wi-button:not(.wi-button-secondary)").textContent()).startsWith("Explore Workforce Intelligence"));
      assert.equal(await root.locator(".wi-final-actions .wi-button-secondary").textContent(), "Discuss Your Institutional Use Case");
      for (const a of await root.locator(".wi-final-actions a").all()) {
        assert.equal(await a.getAttribute("href"), "https://info.certifyme.online/request-demo");
      }
      await root.locator('.wi-hero-head a[href="#wi-dashboard"]').click();
      assert.equal(new URL(page.url()).hash, "#wi-dashboard");
      const dashboard = root.locator("[data-wi-dashboard]");
      assert.equal(await dashboard.locator("#wi-dashboard-title").textContent(), "MSc Business Analytics");
      assert.deepEqual(await dashboard.locator(".wi-data-label").allTextContents(), [
        "INSTITUTIONAL EVIDENCE", "EXTERNAL MARKET DATA",
      ]);
      assert.deepEqual(await dashboard.locator(".wi-data-side").nth(0).locator(".wi-chip-list li").allTextContents(), [
        "SQL", "Data Analysis", "Statistics", "Data Visualisation",
      ]);
      assert.deepEqual(await dashboard.locator(".wi-data-side").nth(1).locator(".wi-chip-list li").allTextContents(), [
        "Data Analyst", "Business Analyst",
      ]);
      assert.deepEqual(await dashboard.locator(".wi-dimension strong").allTextContents(), [
        "Employer demand", "Location", "Skill demand",
      ]);
      assert((await dashboard.locator(".wi-data-side").nth(1).textContent()).includes("sourced independently"));
      const tabs = dashboard.locator("[data-wi-tab]");
      const panels = dashboard.locator("[data-wi-panel]");
      assert.equal(await tabs.count(), 3);
      for (let i = 0; i < 3; i++) {
        const tab = tabs.nth(i);
        await tab.click();
        assert.equal(await tab.getAttribute("aria-selected"), "true");
        assert.equal(await tab.getAttribute("tabindex"), "0");
        assert.equal(await dashboard.locator("[data-wi-tab][aria-selected='true']").count(), 1);
        assert.equal(await dashboard.locator("[data-wi-panel]:visible").count(), 1);
        const panel = panels.nth(i);
        assert(await panel.isVisible());
        assert.equal(await tab.getAttribute("aria-controls"), await panel.getAttribute("id"));
        assert.equal(await panel.getAttribute("role"), "tabpanel");
        assert.equal(await panel.getAttribute("aria-labelledby"), await tab.getAttribute("id"));
        assert.equal(await panel.locator("h4").textContent(), questions[i]);
        assert((await panel.locator("p").textContent()).length > 100);
        const lowContrast = (await root.evaluate(node => window.wiContrast(node)))
          .filter(item => item.ratio < item.required - 0.05)
          .map(({ text, ratio, required }) => ({ text, ratio, required }));
        assert.deepEqual(lowContrast, [], `${width}px perspective ${i}: contrast`);
      }
      await tabs.nth(2).press("ArrowRight");
      assert.equal(await tabs.nth(0).getAttribute("aria-selected"), "true");
      assert(await tabs.nth(0).evaluate(node => document.activeElement === node));
      await tabs.nth(0).press("End");
      assert.equal(await tabs.nth(2).getAttribute("aria-selected"), "true");
      await tabs.nth(2).press("Home");
      assert.equal(await tabs.nth(0).getAttribute("aria-selected"), "true");
      await tabs.nth(0).press("Tab");
      assert(await panels.nth(0).evaluate(node => document.activeElement === node));
      const faqs = [];
      for (const detail of await root.locator(".wi-faq details").all()) {
        await detail.locator("summary").click();
        assert(await detail.evaluate(node => node.open));
        faqs.push({ name: await detail.locator("summary").textContent(), answer: await detail.locator("p").textContent() });
        await detail.locator("summary").click();
        assert(!(await detail.evaluate(node => node.open)));
      }
      assert.equal(faqs.length, 5);
      const schema = await page.locator('script[type="application/ld+json"]').evaluateAll(nodes =>
        nodes.map(node => JSON.parse(node.textContent)).flatMap(item =>
          Array.isArray(item) ? item : item["@graph"] || [item]).find(item => item["@type"] === "FAQPage"));
      assert(schema);
      assert.deepEqual(schema.mainEntity.map(item => ({ name: item.name, answer: item.acceptedAnswer.text })), faqs);
      const layout = await page.evaluate(() => {
        const root = document.getElementById("wi-page");
        const ids = [...document.querySelectorAll("[id]")].map(node => node.id);
        const clipped = [...root.querySelectorAll("h1,h2,h3,h4,p,li,button,summary,a")].filter(node => {
          if (!node.getClientRects().length) return false;
          const box = node.getBoundingClientRect();
          return box.left < -1 || box.right > innerWidth + 1;
        }).map(node => node.textContent.trim().slice(0, 50));
        return {
          overflow: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - innerWidth,
          duplicates: ids.filter((id, i) => ids.indexOf(id) !== i),
          clipped,
        };
      });
      assert(layout.overflow <= 1, `${width}px overflow: ${layout.overflow}`);
      assert.deepEqual(layout.clipped, [], `${width}px clipped content`);
      assert.deepEqual(layout.duplicates, []);
      assert.deepEqual(errors, []);
      console.log(`PASS ${width}px: 3 dashboard perspectives, keyboard, source separation, pipeline, 5 FAQs/schema, SEO, contrast, no clipping`);
      await context.close();
    }
    const page = await browser.newPage();
    await page.goto(base + route);
    const hrefs = await page.locator("#wi-page a").evaluateAll(nodes =>
      [...new Set(nodes.map(a => a.getAttribute("href")))]);
    for (const href of hrefs) {
      assert(href && href !== "#");
      if (href.startsWith("/")) assert.equal((await page.request.get(base + href)).status(), 200, href);
      if (href.startsWith("#")) assert.equal(await page.locator(`[id="${href.slice(1)}"]`).count(), 1, href);
    }
    for (const href of ["/solutions/digital-credential-infrastructure", "/skills-taxonomy-mapping",
      "/comprehensive-learner-record", "/solutions/skill-passport"]) assert(hrefs.includes(href));
    assert.equal((await page.request.get(base + "/attached_assets/Pasted--REPLIT-TASK-IMPROVE-WORKFORCE-INTELLIGENCE-PAGE-URL-ht_1791472239312.txt")).status(), 404);
    const nojs = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 1000 } });
    const nojsPage = await nojs.newPage();
    await nojsPage.goto(base + route);
    assert.equal(await nojsPage.locator("[data-wi-panel]:visible").count(), 3);
    assert.equal(await nojsPage.locator("[data-wi-tabs]:visible").count(), 0);
    assert.deepEqual(await nojsPage.locator("[data-wi-panel] h4").allTextContents(), questions);
    await nojsPage.locator(".wi-faq summary").first().click();
    assert(await nojsPage.locator(".wi-faq details").first().evaluate(node => node.open));
    await nojs.close();
    console.log("PASS internal destinations, fragment anchors, private brief protection and no-JavaScript dashboard/FAQs");
  } finally {
    await browser.close();
  }
}
run().catch(error => { console.error(error); process.exitCode = 1; });
