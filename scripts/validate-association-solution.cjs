#!/usr/bin/env node
"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const { chromium } = require("playwright");
const { inspectVisibility, inspectImages } = require("./lib/image-proportions.cjs");
const { visibleLabelContrast } = require("./lib/visible-label-contrast.cjs");

const base = process.env.ASSOCIATION_TEST_BASE_URL || `https://${process.env.REPLIT_DEV_DOMAIN}`;
const route = "/digital-badges-for-associations";
const heading = "Turn Professional Achievement Into a Trusted Digital Identity";
const requiredHeadings = [
  "Association Achievements Are Fragmented",
  "A Digital Badge Is More Than a Badge",
  "Six Layers That Turn Association Achievements Into Professional Value",
  "Make Membership More Valuable Beyond the Membership Card",
  "Turn Member Achievements Into Ongoing Engagement",
  "Manage Certification From Issuance to Renewal",
  "Turn Continuing Education Into Verifiable Achievement",
  "Create Credential Pathways for Professional Growth",
  "Give Credential Managers Control at Scale",
  "Give Members a Professional Record They Can Take With Them",
  "Make Professional Credentials Easy to Verify",
  'Move From "What They Completed" to "What They Can Do"',
  "Build a Verified Professional Identity",
  "Connect the Complete Professional Learning Journey",
  "Connect Professional Learning to Workforce Relevance",
  "Your Association. Your Standards. Your Credentials.",
  "Connect Credentialing to the Systems You Already Use",
  "Automate Recognition Across Your Programs",
  "Understand How Members Engage With Their Achievements",
  "Scale Credentialing Without Losing Control",
  "Built on Recognised Digital Credential Standards",
  "Enterprise-Grade Trust for Professional Credentials",
  "Turn Credentials Into Membership Value",
  "The Value of a Credential Doesn't End When It Is Issued.",
  "See CertifyMe in Action",
  "Frequently Asked Questions",
  "Make Every Member Achievement Count",
];
const temp = fs.mkdtempSync(path.join(os.tmpdir(), "association-qa-"));
const report = { profiles: [], links: [], errors: [] };

async function run() {
  const browser = await chromium.launch({
    executablePath: execFileSync("which", ["chromium"], { encoding: "utf8" }).trim(),
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
    env: { ...process.env, XDG_CONFIG_HOME: temp, XDG_CACHE_HOME: temp },
  });
  try {
    for (const width of [375, 390, 768, 1024, 1440, 1920]) {
      const context = await browser.newContext({
        viewport: { width, height: 1000 }, reducedMotion: "reduce",
        ...(width === 390 ? { hasTouch: true, isMobile: true } : {}),
      });
      const page = await context.newPage();
      const runtimeErrors = [];
      page.on("pageerror", error => runtimeErrors.push(error.message));
      await page.addInitScript(() => {
        window.associationPerf = { cls: 0, lcp: 0, events: [] };
        new PerformanceObserver(list => {
          for (const entry of list.getEntries()) if (!entry.hadRecentInput) window.associationPerf.cls += entry.value;
        }).observe({ type: "layout-shift", buffered: true });
        new PerformanceObserver(list => {
          for (const entry of list.getEntries()) window.associationPerf.lcp = entry.startTime;
        }).observe({ type: "largest-contentful-paint", buffered: true });
        new PerformanceObserver(list => {
          for (const entry of list.getEntries()) window.associationPerf.events.push(entry.duration);
        }).observe({ type: "event", buffered: true, durationThreshold: 16 });
      });
      assert.equal((await page.goto(base + route, { waitUntil: "load" })).status(), 200);
      await page.evaluate(() => document.fonts.ready);
      const root = page.locator("#as-page");
      assert.equal(await page.locator("main").count(), 1, "Nested main landmarks");
      assert.equal(await page.locator("h1").count(), 1);
      assert.equal(await root.locator("h1").innerText(), heading);
      assert((await root.locator(":scope > section").count()) >= 27);
      const headings = await root.locator("h2").allTextContents();
      for (const text of requiredHeadings) assert(headings.includes(text), `Missing section: ${text}`);
      assert.equal(await root.locator(".as-layer").count(), 6);
      assert.equal(await root.locator("#as-use-cases .as-card").count(), 8);
      assert.deepEqual(await root.locator("#as-certification .as-flow-node").evaluateAll(nodes =>
        nodes.map(node => node.firstChild.textContent.trim())),
      ["Eligibility", "Assessment", "Certification", "Credential Issued", "Verification", "Renewal", "Recertification"]);
      assert.equal(await root.locator("#faq").count(), 1);
      assert.equal(await root.locator("#faq details").count(), 15);
      assert.equal(await root.locator("iframe").count(), 0, "Video loaded before user interaction");
      assert.equal(await page.locator('link[href="/assets4/css/association-solution.css"]').count(), 1);

      const meta = await page.evaluate(() => ({
        title: document.title,
        description: document.querySelector('meta[name="description"]')?.content,
        canonical: document.querySelector('link[rel="canonical"]')?.href,
        font: getComputedStyle(document.querySelector("#as-page p")).fontFamily,
        width: document.documentElement.scrollWidth,
        viewport: innerWidth,
        schemas: [...document.querySelectorAll('script[type="application/ld+json"]')].map(node => JSON.parse(node.textContent)),
      }));
      assert(meta.title.includes("Digital Badges for Professional Associations"));
      assert(meta.description.includes("Issue, manage and verify digital badges"));
      assert.equal(meta.canonical, "https://www.certifyme.online" + route);
      assert(meta.font.includes("Source Sans 3"), `Incorrect body font: ${meta.font}`);
      assert(meta.width <= meta.viewport + 1, `${width}px horizontal page overflow`);
      function schemaEntities(value) {
        if (!value || typeof value !== "object") return [];
        return [value, ...Object.values(value).flatMap(schemaEntities)];
      }
      const entities = meta.schemas.flatMap(schemaEntities);
      for (const type of ["Organization", "SoftwareApplication", "WebPage", "FAQPage", "BreadcrumbList"]) {
        assert(entities.some(entity => entity["@type"] === type), `Missing schema: ${type}`);
      }
      const faq = entities.filter(entity => entity["@type"] === "FAQPage");
      assert.equal(faq.length, 1);
      const visibleFaq = await root.locator("#faq details").evaluateAll(nodes => nodes.map(node => ({
        question: node.querySelector("summary").textContent.trim(),
        answer: node.querySelector(".as-faq-answer").textContent.trim(),
      })));
      assert.deepEqual(faq[0].mainEntity.map(item => ({
        question: item.name, answer: item.acceptedAnswer.text,
      })), visibleFaq);
      await root.locator("#faq summary").first().focus();
      await page.keyboard.press("Enter");
      assert.equal(await root.locator("#faq details[open]").count(), 1);
      await page.keyboard.press("Enter");
      assert.equal(await root.locator("#faq details[open]").count(), 0);
      await root.locator("#faq details").evaluateAll(nodes => nodes.forEach(node => { node.open = true; }));

      for (const image of await root.locator("img").all()) {
        await image.scrollIntoViewIfNeeded();
        await image.evaluate(node => node.decode());
        assert(await image.getAttribute("alt"), "Missing descriptive image alt");
        assert(await image.getAttribute("width"), "Missing intrinsic image width");
        assert(await image.getAttribute("height"), "Missing intrinsic image height");
      }
      const imageResults = await page.evaluate(inspectImages, "#as-page img");
      assert.deepEqual(imageResults.filter(image => image.status === "FAIL"), [], "Distorted product imagery");
      let textChecks = 0;
      for (const label of await root.locator("h1,h2,h3,p,a,summary,.as-eyebrow,.as-layer-num,.as-card-index,.as-flow-node,.as-vertical-step,.as-pill").all()) {
        await label.scrollIntoViewIfNeeded();
        const visibility = await label.evaluate(inspectVisibility);
        if (visibility.status === "FAIL") report.errors.push({ width, kind: "visibility", ...visibility });
        const checked = await label.evaluate(visibleLabelContrast);
        textChecks += checked.length;
        for (const segment of checked) {
          if (segment.ratio < segment.required) report.errors.push({ width, kind: "contrast", ...segment });
        }
      }
      for (const link of await root.locator('a[href^="#"]').all()) {
        const target = await link.getAttribute("href");
        assert.equal(await page.locator(target).count(), 1, `Broken anchor: ${target}`);
      }
      for (const button of await root.locator(".as-btn,summary,.as-anchorbar a").all()) {
        const box = await button.boundingBox();
        assert(box.height >= 44, `Small tap target: ${await button.innerText()}`);
      }
      await root.locator(".as-btn").first().focus();
      assert.equal(await root.locator(".as-btn").first().evaluate(node => document.activeElement === node), true);
      const outline = await root.locator(".as-btn").first().evaluate(node => getComputedStyle(node).outlineWidth);
      assert(parseFloat(outline) >= 2, "No visible keyboard focus");
      assert.deepEqual(runtimeErrors, [], "Page runtime errors");
      assert.deepEqual(report.errors.filter(error => error.width === width), [], `${width}px visual failures`);
      report.profiles.push({ width, textChecks, images: imageResults.length, performance: await page.evaluate(() => window.associationPerf), result: "PASS" });
      console.log(`PASS ${width}px: sections, six layers, eight use cases, 15 FAQs/schema, ${textChecks} text checks, images, keyboard and anchors`);
      await context.close();
    }

    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto(base + route);
    report.links = await page.locator("#as-page").evaluate(root =>
      [...new Set([...root.querySelectorAll('a[href^="/"]')].map(node => node.getAttribute("href")))]);
    for (const href of report.links) assert.equal((await page.request.get(base + href)).status(), 200, `Broken link: ${href}`);
    for (const href of [
      "/attached_assets/Pasted-You-are-rebuilding-the-existing-CertifyMe-online-page-d_1791372230064.txt",
      "/.local/reports/association-rebuild/site-crawl.json",
    ]) assert.equal((await page.request.get(base + href)).status(), 404, `Private source exposed: ${href}`);
    const play = page.locator("[data-as-play]");
    await play.click();
    assert.equal(await page.locator("#as-page iframe").count(), 1);
    const frame = page.locator("#as-page iframe");
    assert.equal(await frame.getAttribute("src"), "https://www.youtube-nocookie.com/embed/TJMwk6qIxSc?rel=0");
    assert(await frame.getAttribute("title"), "Video has no accessible title");
    assert.equal(await frame.evaluate(node => document.activeElement === node), true, "Video focus not transferred");
    report.video = { delayedEmbed: "PASS", accessibleTitle: "PASS", keyboardFocus: "PASS" };
    await context.close();

    const plain = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 375, height: 1000 } });
    const plainPage = await plain.newPage();
    await plainPage.goto(base + route);
    assert.equal(await plainPage.locator("#as-page .as-layer").count(), 6);
    assert.equal(await plainPage.locator("#faq details").count(), 15);
    await plainPage.locator("#faq summary").first().click();
    assert.equal(await plainPage.locator("#faq details[open]").count(), 1);
    assert.equal(await plainPage.locator("[data-as-play]").isVisible(), false);
    assert((await plainPage.locator('a[href="https://www.youtube.com/watch?v=TJMwk6qIxSc"]').count()) > 0);
    await plain.close();
    console.log(`PASS ${report.links.length} internal destinations, private-source exclusion, lazy video and no-JavaScript functionality`);
  } finally {
    await browser.close();
    fs.rmSync(temp, { recursive: true, force: true });
    fs.writeFileSync("/tmp/certifyme-association-qa.json", JSON.stringify(report, null, 2));
  }
}
run().catch(error => { console.error(error); process.exitCode = 1; });
