#!/usr/bin/env node
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const { chromium, devices } = require("playwright");
const { inspectImages, inspectVisibility } = require("./lib/image-proportions.cjs");
const { visibleLabelContrast } = require("./lib/visible-label-contrast.cjs");

const base = process.env.ELEARNING_TEST_BASE_URL || `https://${process.env.REPLIT_DEV_DOMAIN}`;
const route = "/credentials-for-elearning-platforms";
const expectedH1 = "Turn Learning Programs Into Verifiable, Measurable Achievement";
const expectedH2 = [
  "Your LMS Knows What Learners Completed. CertifyMe Makes That Achievement Valuable.",
  "One Learning Achievement. Six Layers of Value.",
  "For Program Managers: Turn Credentialing Into a Program Strategy",
  "For Credential Managers: Govern Every Credential at Scale",
  "For Learning Directors: Prove the Value of Your Programs",
  "Keep Your LMS. Add a Credential Intelligence Layer.",
];
const expectedLayers = [
  "ACCESS & SHARING", "STANDARDS & INTEROPERABILITY", "VERIFICATION & TRUST",
  "SKILL TAXONOMY ALIGNMENT", "COMPREHENSIVE LEARNER RECORD",
  "WORKFORCE INTELLIGENCE & OPPORTUNITY",
];
const sourceEnvironments = [
  "Canvas", "Moodle", "Blackboard", "Other LMS", "Internal LMS",
  "Training Platform", "Assessment Platform",
];
const profiles = [320, 375, 768, 1024, 1440].map(width => ({
  name: `${width}px`, viewport: { width, height: 1000 },
}));
profiles.push({ name: "iPhone", ...devices["iPhone 13"] });
const temp = fs.mkdtempSync(path.join(os.tmpdir(), "elearning-solution-qa-"));
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
      assert.equal((await page.goto(base + route, { waitUntil: "load" })).status(), 200);
      await page.evaluate(() => document.fonts.ready);
      const root = page.locator("#el-page");
      assert.equal(await page.locator("h1").count(), 1);
      assert.equal(await root.locator("h1").innerText(), expectedH1);
      assert.equal(await root.locator(":scope > section").count(), 10);
      const headings = await root.locator("h2").allTextContents();
      for (const heading of expectedH2) assert(headings.includes(heading), `Missing required H2: ${heading}`);
      assert.equal(await root.locator(".el-flow-step").count(), 4);
      assert.equal(await root.locator(".el-meaning").count(), 7);
      assert.equal(await root.locator(".el-layer").count(), 6);
      assert.deepEqual(await root.locator(".el-layer-title").allTextContents(), expectedLayers);
      assert.deepEqual(await root.locator(".el-sources li").allTextContents(), sourceEnvironments);
      assert.equal(await root.locator(".el-role-column").count(), 3);
      assert.equal(await root.locator(".el-outcome-rail > div").count(), 6);
      assert.equal(await root.locator("#faq").count(), 1);
      assert.equal(await root.locator(".el-faq").count(), 8);
      const metadata = await page.evaluate(() => ({
        title: document.title,
        canonical: document.querySelector('link[rel="canonical"]')?.href,
        description: document.querySelector('meta[name="description"]')?.content,
        ogImage: document.querySelector('meta[property="og:image"]')?.content,
        width: Math.max(document.body.scrollWidth, document.documentElement.scrollWidth),
        ids: [...document.querySelectorAll("[id]")].map(element => element.id),
        schemas: [...document.querySelectorAll('script[type="application/ld+json"]')].map(element => JSON.parse(element.textContent)),
        font: getComputedStyle(document.querySelector("#el-page")).fontFamily,
      }));
      assert.equal(metadata.title, "Digital Credentials for Large Learning Programs | CertifyMe");
      assert.equal(metadata.canonical, "https://www.certifyme.online" + route);
      assert(metadata.description.includes("large learning programs"));
      assert(metadata.ogImage.endsWith("/assets4/images/elearning-solution/learning-path.webp"));
      assert(metadata.width <= options.viewport.width + 1, `${name}: horizontal overflow ${metadata.width}`);
      assert.equal(new Set(metadata.ids).size, metadata.ids.length, "Duplicate IDs");
      assert.match(metadata.font, /Source Sans 3/);
      const faqSchemas = metadata.schemas.flatMap(schema => schema["@graph"] || [schema]).filter(schema => schema["@type"] === "FAQPage");
      assert.equal(faqSchemas.length, 1, "Expected one FAQ schema");
      const visibleFaq = await root.locator(".el-faq").evaluateAll(nodes => nodes.map(node => ({
        question: node.querySelector("h3").textContent.trim(),
        answer: node.querySelector("p").textContent.trim(),
      })));
      assert.deepEqual(faqSchemas[0].mainEntity.map(item => ({
        question: item.name, answer: item.acceptedAnswer.text,
      })), visibleFaq, "FAQ schema differs from visible answers");
      const levels = await root.locator("h1,h2,h3").evaluateAll(nodes => nodes.map(node => Number(node.tagName[1])));
      for (let i = 1; i < levels.length; i++) assert(levels[i] <= levels[i - 1] + 1, "Skipped heading level");
      assert.equal(await page.locator('link[href="/assets4/css/elearning-solution.css"]').count(), 1);
      assert.equal(await root.locator('img:not([loading="lazy"])').count(), 1);
      assert.equal(await root.locator("img:not([width]),img:not([height]),img:not([alt])").count(), 0);
      assert.deepEqual(await root.evaluate(element => [...element.querySelectorAll("[aria-labelledby]")].flatMap(node =>
        node.getAttribute("aria-labelledby").split(/\s+/).filter(id => !document.getElementById(id)))), []);
      let visibleChecks = 0;
      for (const node of await root.locator("h1,h2,h3,p,li,img,figcaption,a,strong,b,small,.el-layer-title,.el-layer-num,.el-tag,.el-role-column span,.el-outcome-rail div").all()) {
        await node.evaluate(element => element.scrollIntoView({ block: "center", behavior: "instant" }));
        if (await node.evaluate(element => element.tagName === "IMG")) {
          await node.evaluate(async element => {
            if (!element.complete) await new Promise(resolve => {
              element.addEventListener("load", resolve, { once: true });
              element.addEventListener("error", resolve, { once: true });
            });
          });
        }
        const visibility = await node.evaluate(inspectVisibility);
        if (visibility.status === "FAIL") report.errors.push({ name, visibility });
        const contrast = (await node.evaluate(visibleLabelContrast)).filter(item => !item.provisional && item.ratio < item.required);
        if (contrast.length) report.errors.push({ name, contrast });
        visibleChecks++;
      }
      const images = await page.evaluate(inspectImages, "#el-page img");
      assert.equal(images.length, 2);
      assert(!images.some(image => image.status === "FAIL"), JSON.stringify(images));
      for (const link of await root.locator("a").all()) {
        await link.focus();
        assert(await link.evaluate(element => document.activeElement === element && getComputedStyle(element).outlineStyle !== "none"), "Missing keyboard focus");
        await link.hover();
        const contrast = (await link.evaluate(visibleLabelContrast)).filter(item => !item.provisional && item.ratio < item.required);
        if (contrast.length) report.errors.push({ name, hover: contrast });
        const href = await link.getAttribute("href");
        if (href.startsWith("#")) {
          assert.equal(await page.locator(href).count(), 1, `Invalid anchor: ${href}`);
          await link.click();
          const box = await page.locator(href).boundingBox();
          assert(box.y >= 65 && box.y < 350, `${name}: anchor did not reach the visible content area: ${href}`);
        }
        if (await link.getAttribute("target") === "_blank") {
          assert.match(await link.getAttribute("rel"), /noopener/);
          assert.match(await link.getAttribute("rel"), /noreferrer/);
        }
      }
      assert.equal(await page.locator(`.wsmenu-list a[href="${route}"]`).count(), 1);
      assert.equal(await page.locator('.wsmenu-list a[href="/workforce-intelligence#cm-job-engine"]').count(), 0);
      assert.deepEqual(errors, []);
      assert.deepEqual(report.errors.filter(error => error.name === name), [], `${name}: visibility or contrast failures`);
      report.profiles.push({ name, visibleChecks, images: images.length, result: "PASS" });
      console.log(`PASS ${name}: 10 sections, 6 layers, 3 buyer roles, ${visibleChecks} visibility/contrast checks, images, anchors, focus and FAQ/schema parity`);
      await context.close();
    }
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto(base + route);
    const links = await page.locator("#el-page").evaluate(element => [...new Set([...element.querySelectorAll('a[href^="/"]')].map(link => link.getAttribute("href")))]);
    for (const href of links) assert.equal((await page.request.get(base + href)).status(), 200, `Broken destination: ${href}`);
    for (const href of ["/attached_assets/Pasted-You-are-rebuilding-an-existing-page-on-the-CertifyMe-on_1791370082219.txt", "/.local/reports/elearning-rebuild/public-crawl.json"]) {
      assert.equal((await page.request.get(base + href)).status(), 404, `Private source exposed: ${href}`);
    }
    await context.close();
    const plainContext = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 375, height: 1000 } });
    const plain = await plainContext.newPage();
    await plain.goto(base + route);
    assert.equal(await plain.locator("#el-page > section").count(), 10);
    assert.equal(await plain.locator("#el-page .el-layer").count(), 6);
    assert.equal(await plain.locator("#el-page .el-faq").count(), 8);
    assert.equal(await plain.locator('#el-page a[href="https://info.certifyme.online/request-demo"]').count(), 2);
    assert(await plain.locator("#el-title").isVisible());
    await plainContext.close();
    console.log(`PASS ${links.length} internal destinations, private-source exclusion and no-JavaScript content`);
    assert.equal(report.errors.length, 0, JSON.stringify(report.errors.slice(0, 15), null, 2));
  } finally {
    await browser.close();
    fs.rmSync(temp, { recursive: true, force: true });
    fs.writeFileSync("/tmp/certifyme-elearning-qa.json", JSON.stringify(report, null, 2));
  }
}
run().catch(error => { console.error(error); process.exitCode = 1; });
