#!/usr/bin/env node
"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const { chromium } = require("playwright");

const base = process.env.HR_TEST_BASE_URL || `https://${process.env.REPLIT_DEV_DOMAIN}`;
const route = "/digital-badges-for-hr";
const report = { viewports: [], internalLinks: [], images: [], video: {}, otherPages: {} };
const temp = fs.mkdtempSync(path.join(os.tmpdir(), "hr-page-qa-"));

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
      const errors = [];
      page.on("pageerror", error => errors.push(error.message));
      await page.addInitScript(() => {
        window.hrPerf = { cls: 0, lcp: 0, eventDurations: [] };
        new PerformanceObserver(list => {
          for (const entry of list.getEntries()) if (!entry.hadRecentInput) window.hrPerf.cls += entry.value;
        }).observe({ type: "layout-shift", buffered: true });
        new PerformanceObserver(list => {
          for (const entry of list.getEntries()) window.hrPerf.lcp = entry.startTime;
        }).observe({ type: "largest-contentful-paint", buffered: true });
        new PerformanceObserver(list => {
          for (const entry of list.getEntries()) window.hrPerf.eventDurations.push(entry.duration);
        }).observe({ type: "event", buffered: true, durationThreshold: 16 });
      });
      const response = await page.goto(base + route, { waitUntil: "load" });
      assert.equal(response.status(), 200);
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(800);
      const root = page.locator("#hr-page");
      assert.equal(await root.count(), 1);
      assert.equal(await page.locator("main").count(), 1);
      assert.equal(await page.locator("h1").count(), 1);
      assert.equal(await root.locator("h1").innerText(), "Turn Employee Learning Into Verified Skills and Achievement");
      assert.equal(await root.locator(".hr-layer").count(), 6);
      assert.equal(await root.locator(".hr-layer--primary").count(), 5);
      assert.equal(await root.locator(".hr-usecase").count(), 10);
      assert.equal(await root.locator("#faq details").count(), 16);
      assert.equal(await root.locator("iframe").count(), 0, "Video loaded before click");
      assert.equal(await root.locator("#hr-workforce").count(), 1);
      assert.equal(await root.locator("#hr-sharing").count(), 1);
      assert(!/5,000\+|1M\+ wallets|500K\+ credentials/.test(await root.innerText()), "Old HR statistics retained");
      const headings = await root.locator("h2").allTextContents();
      for (const text of [
        "Your LMS Knows What Employees Completed. CertifyMe Shows What They Achieved.",
        "Six Layers From Learning Achievement to a Connected Employee Record",
        "Make Learning Data Useful as Skills Data", "One Record for Every Learning Achievement",
        "Keep Your LMS. Add the Credential Layer.",
        "Connect CertifyMe to the Systems You Already Use",
        "Scale Recognition Without Losing Control",
        "Let Employees Share Their Achievements When They Choose",
        "Extend Your Learning Record Into Workforce Context",
        "Turn Learning Into Trusted Achievement",
      ]) assert(headings.includes(text), `Missing section: ${text}`);
      const meta = await page.evaluate(() => ({
        title: document.title,
        description: document.querySelector('meta[name="description"]')?.content,
        canonical: document.querySelector('link[rel="canonical"]')?.href,
        ogTitle: document.querySelector('meta[property="og:title"]')?.content,
        ogImage: document.querySelector('meta[property="og:image"]')?.content,
        schemas: [...document.querySelectorAll('script[type="application/ld+json"]')].map(script => JSON.parse(script.textContent)),
      }));
      assert.equal(meta.title, "Digital Badges & Credentials for HR and L&D | CertifyMe");
      assert.equal(meta.description, "Turn employee learning into verified credentials and skills with CertifyMe. Automate credential issuance, recognize achievement, map learning to skills and build connected employee learning records.");
      assert(meta.canonical.includes("/digital-badges-for-hr"), "Missing canonical");
      assert(meta.ogTitle && meta.ogImage, "Missing social metadata");
      const types = meta.schemas.flatMap(item => {
        const nodes = item["@graph"] || [item];
        return nodes.map(node => node["@type"]);
      }).flat();
      for (const type of ["WebPage", "SoftwareApplication", "FAQPage", "Organization"])
        assert(types.includes(type), `Missing ${type} JSON-LD`);
      assert(meta.schemas.flatMap(item => item["@graph"] || [item]).some(item =>
        item["@type"] === "WebPage" && item.breadcrumb?.["@type"] === "BreadcrumbList"), "Missing WebPage breadcrumb");
      const faqSchema = meta.schemas.flatMap(item => item["@graph"] || [item]).find(item => item["@type"] === "FAQPage");
      assert.equal(faqSchema.mainEntity.length, 16);
      const qa = await root.locator("#faq details").evaluateAll(nodes =>
        nodes.map(el => ({ question: el.querySelector("summary").textContent, answer: el.querySelector(".hr-faq-answer").textContent })));
      qa.forEach((item, i) => {
        assert.equal(faqSchema.mainEntity[i].name, item.question);
        assert.equal(faqSchema.mainEntity[i].acceptedAnswer.text, item.answer);
      });
      const dimensions = await page.evaluate(() => ({
        body: document.documentElement.scrollWidth, client: document.documentElement.clientWidth,
        media: [...document.querySelectorAll("#hr-page img")].map(img => ({
          src: img.currentSrc || img.src, alt: img.alt, width: img.width, height: img.height,
          isVisible: !!(img.getClientRects().length && getComputedStyle(img).visibility !== "hidden"),
        })),
        perf: window.hrPerf,
      }));
      assert(dimensions.body <= dimensions.client + 2, `Horizontal overflow ${width}px: ${JSON.stringify(dimensions)}`);
      assert(dimensions.media.every(img => img.alt && img.width > 0 && img.height > 0), "Unlabeled image");
      assert.deepEqual(errors, [], "Uncaught browser errors");
      report.viewports.push({ width, horizontalOverflow: dimensions.body - dimensions.client, initialLab: dimensions.perf, errors });
      if ([375, 1440].includes(width)) {
        await root.locator("#faq summary").first().click();
        assert.equal(await root.locator("#faq details[open]").count(), 1);
        await root.locator("#faq summary").first().press("Enter");
        assert.equal(await root.locator("#faq details[open]").count(), 0);
        assert.equal(await root.locator('a.hr-btn[href="https://info.certifyme.online/request-demo"]').count(), 2);
        assert.equal(await root.locator('a[href^="mailto:info@certifyme.online?subject="]').count(), 1);
        const images = await root.locator("img").evaluateAll(nodes =>
          nodes.map(img => ({ src: new URL(img.getAttribute("src"), location.href).pathname, width: img.getAttribute("width"), height: img.getAttribute("height") })));
        const responsiveImages = await root.locator("source[srcset^='/assets4/images/hr-solution/']").evaluateAll(nodes =>
          nodes.map(source => ({
            src: new URL(source.getAttribute("srcset").split(" ")[0], location.href).pathname,
            width: source.getAttribute("width"), height: source.getAttribute("height"),
          })));
        for (const img of [...images, ...responsiveImages]) {
          assert(img.width && img.height, `Image missing dimensions ${img.src}`);
          const res = await page.request.get(base + img.src);
          assert.equal(res.status(), 200, `Broken image: ${img.src}`);
          if (!report.images.some(x => x.src === img.src)) report.images.push({ src: img.src, status: res.status() });
        }
      }
      await context.close();
    }
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto(base + route, { waitUntil: "load" });
    await page.locator('#hr-page .hr-hero a[href="#hr-story"]').click();
    assert.equal(new URL(page.url()).hash, "#hr-story", "Hero secondary CTA does not navigate");
    assert.equal(await page.locator("#hr-story").count(), 1);
    const links = await page.locator("#hr-page a[href^='/']").evaluateAll(nodes =>
      [...new Set(nodes.map(node => node.getAttribute("href")))].sort());
    for (const href of links) {
      const res = await page.request.get(base + href);
      assert.equal(res.status(), 200, `Broken internal link: ${href} (${res.status()})`);
      report.internalLinks.push(href);
    }
    const hashLinks = await page.locator("#hr-page a[href^='#']").evaluateAll(nodes =>
      [...new Set(nodes.map(node => node.getAttribute("href").slice(1)))]);
    for (const id of hashLinks) assert.equal(await page.locator(`[id="${id}"]`).count(), 1, `Broken anchor: #${id}`);
    for (const url of ["/digital-badges-for-associations", "/credentials-for-elearning-platforms", "/"]) {
      const res = await page.request.get(base + url);
      assert.equal(res.status(), 200, `Existing page broken: ${url}`);
      report.otherPages[url] = res.status();
    }
    for (const url of ["/.local/reports/hr-rebuild/crawl-summary.json", "/attached_assets/Pasted-You-are-rebuilding-the-existing-CertifyMe-online-page-h_1791377721967.txt"]) {
      const res = await page.request.get(base + url);
      assert.equal(res.status(), 404, `Private source exposed: ${url}`);
    }
    await page.locator("[data-hr-play]").click();
    const frame = page.locator("#hr-page iframe");
    assert.equal(await frame.count(), 1);
    assert.equal(await frame.getAttribute("src"), "https://www.youtube-nocookie.com/embed/kXYADGPoars?rel=0");
    assert.equal(await frame.getAttribute("title"), "What is a Learning Path in CertifyMe?");
    assert.equal(await frame.evaluate(el => document.activeElement === el), true);
    report.video = { metadata: "CertifyMe oEmbed title verified separately", clickLoaded: true, focused: true, playbackStreamVerified: false };
    await context.close();
    const nojs = await browser.newContext({ javaScriptEnabled: false });
    const nojsPage = await nojs.newPage();
    await nojsPage.goto(base + route);
    await nojsPage.locator("#faq summary").first().click();
    assert.equal(await nojsPage.locator("#faq details[open]").count(), 1);
    assert.equal(await nojsPage.locator("[data-hr-play]").isVisible(), false);
    assert((await nojsPage.locator('a[href="https://www.youtube.com/watch?v=kXYADGPoars"]').count()) >= 1);
    await nojs.close();
    fs.mkdirSync(".local/reports/hr-rebuild", { recursive: true });
    fs.writeFileSync(".local/reports/hr-rebuild/final-qa.json", JSON.stringify(report, null, 2));
    console.log(`PASS: ${report.viewports.length} widths, ${report.internalLinks.length} internal links, ${report.images.length} images, 16 FAQ answers/schema, video control, no-JS, existing pages and private sources`);
    console.log(report.viewports.map(row => `${row.width}px CLS ${row.initialLab.cls.toFixed(3)} LCP ${Math.round(row.initialLab.lcp)}ms overflow ${row.horizontalOverflow}px`).join("\n"));
  } finally {
    await browser.close();
    fs.rmSync(temp, { recursive: true, force: true });
  }
}

run().catch(error => { console.error(error); process.exitCode = 1; });
