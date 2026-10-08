const assert = require("node:assert/strict");
const { execFileSync } = require("node:child_process");
const { chromium } = require("playwright");
const { visibleLabelContrast } = require("./lib/visible-label-contrast.cjs");

const base = process.env.CLR_BASE_URL || `https://${process.env.REPLIT_DEV_DOMAIN}`;
const route = "/comprehensive-learner-record";
const names = ["Degree", "Certificate", "Badge", "Skills", "Project", "Experience"];
const headings = [
  "What Is a Comprehensive Learner Record?", "Transcript vs CLR", "What Goes Into a CLR?",
  "How Credentials Become Record Components", "Skills & Competencies", "Projects & Experiences",
  "Provenance & Verification", "Standards", "Institutional Governance",
  "How CLR Connects to Skill Passport", "How CLR Connects to Workforce Intelligence",
];
const distinction = "A CLR complements the authoritative academic transcript. It does not replace it.";

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
      await context.addInitScript(`window.clrContrast = ${visibleLabelContrast.toString()}`);
      const page = await context.newPage();
      const errors = [];
      page.on("pageerror", error => errors.push(error.message));
      assert.equal((await page.goto(base + route, { waitUntil: "load" })).status(), 200);
      await page.evaluate(() => document.fonts.ready);
      const root = page.locator("#clr-page");
      assert.equal(await root.locator(".clr-hero .clr-primary").evaluate(node => getComputedStyle(node).backgroundColor), "rgb(57, 53, 139)");
      assert.equal(await root.locator(".clr-hero").evaluate(node => getComputedStyle(node).backgroundColor), "rgb(245, 245, 255)");
      assert.equal(await page.title(), "Comprehensive Learner Record (CLR) Platform | CertifyMe");
      assert.equal(await page.locator('meta[name="description"]').getAttribute("content"),
        "Connect credentials, skills, competencies, projects and experiences in a Comprehensive Learner Record alongside the authoritative academic transcript.");
      assert((await page.locator('link[rel="canonical"]').getAttribute("href")).endsWith(route));
      assert.equal(await page.locator("main").count(), 1);
      assert.equal(await page.locator("h1").count(), 1);
      assert.equal(await root.locator("h1").textContent(), "Comprehensive Learner Record");
      assert.equal(await root.locator(".clr-hero-subheadline").textContent(),
        "Bring the Complete Learning Journey Into One Connected Record");
      assert.equal(await root.locator(".clr-lead").textContent(),
        "Connect degrees, certificates, badges, skills, competencies, projects and experiences into a structured learner record while preserving the institution as the source of each achievement.");
      assert.equal(await root.locator(".clr-transcript-note").textContent(), distinction);
      assert.equal(await root.locator(".clr-note").textContent(), distinction);
      assert.deepEqual(await root.locator(".clr-record-type strong").allTextContents(), [
        "Academic record", "Broader learning and achievement record",
      ]);
      assert.deepEqual(await root.locator(":scope > .clr-section:not(.clr-faq-section) h2").allTextContents(), headings);
      assert.deepEqual(await root.locator(".clr-product-chain li > strong").allTextContents(), [
        "Creates and verifies achievements", "Connects those achievements", "Presents the connected record to the learner",
      ]);
      assert.equal(await root.locator("#clr-final-title").textContent(), "Build a Comprehensive Learner Record");
      assert.equal(await root.locator(".clr-final .clr-light").getAttribute("href"), "https://info.certifyme.online/request-demo");
      assert.equal(await root.locator(".clr-hero .clr-outline").textContent(), "Request an Institutional Demo");
      await root.locator(".clr-hero .clr-primary").click();
      assert.equal(new URL(page.url()).hash, "#clr-builder");
      assert.equal(await root.locator("[data-clr-select]:visible").count(), 6);
      assert(await root.locator(".clr-builder-arrow").isVisible());
      assert.equal(await root.locator(".clr-record-panel h3").textContent(), "Comprehensive Learner Record");
      const contributions = new Set();
      for (const name of names) {
        const button = root.getByRole("button", { name, exact: true });
        await button.click();
        assert.equal(await button.getAttribute("aria-pressed"), "true");
        assert.equal(await button.getAttribute("aria-controls"), "clr-detail");
        assert.equal(await root.locator("[data-clr-select][aria-pressed='true']").count(), 1);
        assert.equal(await root.locator("[data-clr-detail-heading]").textContent(), name);
        const copy = await root.locator("[data-clr-detail-copy]").textContent();
        assert(copy.length > 90, `${name}: missing contribution explanation`);
        contributions.add(copy);
        const meta = await root.locator("[data-clr-detail-meta]").textContent();
        assert(meta.includes("Source:") && meta.includes("Evidence context:"));
        assert.equal(await root.locator("[data-clr-select]:visible").count(), 6);
        const geometry = await root.locator("#clr-detail").evaluate(node => {
          const box = node.getBoundingClientRect();
          return { width: box.width, left: box.left, right: box.right, viewport: innerWidth };
        });
        assert(geometry.width >= 230 && geometry.left >= 0 && geometry.right <= geometry.viewport + 1, JSON.stringify(geometry));
        const contrast = (await root.evaluate(node => window.clrContrast(node)))
          .filter(item => item.ratio < item.required - 0.05)
          .map(({ text, ratio, required }) => ({ text, ratio, required }));
        assert.deepEqual(contrast, [], `${width}px ${name}: low contrast`);
      }
      assert.equal(contributions.size, 6);
      await root.getByRole("button", { name: "Degree", exact: true }).focus();
      await page.keyboard.press("Space");
      assert.equal(await root.locator("[data-clr-detail-heading]").textContent(), "Degree");
      await page.keyboard.press("Tab");
      assert(await root.getByRole("button", { name: "Certificate", exact: true }).evaluate(node => document.activeElement === node));
      await page.keyboard.press("Enter");
      assert.equal(await root.locator("[data-clr-detail-heading]").textContent(), "Certificate");
      const questions = [];
      for (const detail of await root.locator(".clr-faqs details").all()) {
        await detail.locator("summary").click();
        assert(await detail.evaluate(node => node.open));
        questions.push({ name: await detail.locator("summary").textContent(), answer: await detail.locator("p").textContent() });
        await detail.locator("summary").click();
        assert(!(await detail.evaluate(node => node.open)));
      }
      assert.equal(questions.length, 14);
      const schema = await page.locator('script[type="application/ld+json"]').evaluateAll(nodes =>
        nodes.map(node => JSON.parse(node.textContent)).flatMap(item =>
          Array.isArray(item) ? item : item["@graph"] || [item]).find(item => item["@type"] === "FAQPage"));
      assert(schema);
      assert.deepEqual(schema.mainEntity.map(item => ({ name: item.name, answer: item.acceptedAnswer.text })), questions);
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
      console.log(`PASS ${width}px: six contributions, keyboard, product roles, 14 FAQs/schema, SEO, contrast, no overflow`);
      await context.close();
    }
    const page = await browser.newPage();
    await page.goto(base + route);
    const hrefs = await page.locator("#clr-page a").evaluateAll(nodes =>
      [...new Set(nodes.map(a => a.getAttribute("href")))]);
    for (const href of hrefs) {
      assert(href && href !== "#");
      if (href.startsWith("/")) assert.equal((await page.request.get(base + href)).status(), 200, href);
      if (href.startsWith("#")) assert.equal(await page.locator(`[id="${href.slice(1)}"]`).count(), 1, href);
    }
    for (const href of ["/solutions/digital-credential-infrastructure", "/skills-taxonomy-mapping",
      "/workforce-intelligence", "/solutions/skill-passport"]) assert(hrefs.includes(href));
    assert.equal((await page.request.get(base + "/attached_assets/Pasted--REPLIT-TASK-IMPROVE-COMPREHENSIVE-LEARNER-RECORD-PAGE-_1791460428108.txt")).status(), 404);
    const nojs = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 1000 } });
    const nojsPage = await nojs.newPage();
    await nojsPage.goto(base + route);
    assert.equal(await nojsPage.locator(".clr-builder-item:visible").count(), 6);
    assert.equal(await nojsPage.locator("[data-clr-select]:visible").count(), 0);
    assert.deepEqual(await nojsPage.locator(".clr-builder-item strong").allTextContents(), names);
    for (const item of await nojsPage.locator(".clr-builder-item").all()) {
      const text = await item.textContent();
      assert(text.includes("Source:") && text.includes("Evidence context:"));
    }
    await nojsPage.locator(".clr-faqs summary").first().click();
    assert(await nojsPage.locator(".clr-faqs details").first().evaluate(node => node.open));
    await nojs.close();
    console.log("PASS internal destinations, fragment anchors, private brief protection and no-JavaScript contributions/FAQs");
  } finally {
    await browser.close();
  }
}
run().catch(error => { console.error(error); process.exitCode = 1; });
