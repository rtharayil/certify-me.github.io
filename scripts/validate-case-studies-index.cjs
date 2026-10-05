// Run against the rebuilt, running Jekyll site. No external lead forms are submitted.
const assert = require("node:assert/strict");
const { execFileSync } = require("node:child_process");
const { chromium } = require("playwright");
const { visibleLabelContrast } = require("./lib/visible-label-contrast.cjs");

const baseURL = process.env.CASE_STUDIES_BASE_URL ||
  (process.env.REPLIT_DEV_DOMAIN && `https://${process.env.REPLIT_DEV_DOMAIN}`);
assert(baseURL, "Set CASE_STUDIES_BASE_URL or run in the Replit workspace.");

const studies = JSON.parse(execFileSync("bundle", [
  "exec", "ruby", "-rjson", "-ryaml", "-e",
  "puts JSON.generate(YAML.load_file('_data/approved_claims.yml')['anonymous_cases'])",
], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }));

async function check() {
  const executablePath = execFileSync("which", ["chromium"], { encoding: "utf8" }).trim();
  const browser = await chromium.launch({
    executablePath,
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
  });
  try {
    const context = await browser.newContext();
    for (const route of ["/case-studies", "/case-studies.html"]) {
      const response = await context.request.get(`${baseURL}${route}`);
      assert.equal(response.status(), 200, `${route} must remain reachable`);
    }
    for (const width of [1440, 1024, 768, 390, 320]) {
      const page = await context.newPage();
      await page.setViewportSize({ width, height: 1000 });
      await page.route(/googletagmanager|google-analytics|clarity\.ms|connect\.facebook|hotjar/, route => route.abort());
      const response = await page.goto(`${baseURL}/case-studies`, {
        waitUntil: "domcontentloaded",
        timeout: 30000,
      });
      assert.equal(response.status(), 200);
      const result = await page.evaluate(() => {
        const main = document.querySelector("main");
        return {
          headings: main.querySelectorAll("h1").length,
          copy: main.innerText,
          overflow: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) > innerWidth + 1,
          canonical: document.querySelector('link[rel="canonical"]').href,
          schema: [...document.querySelectorAll('script[type="application/ld+json"]')]
            .map(node => JSON.parse(node.textContent)),
          font: getComputedStyle(main.querySelector("h1")).fontFamily,
        };
      });
      assert.equal(result.headings, 1, "The hub needs one primary heading");
      assert.equal(result.overflow, false, `Horizontal overflow at ${width}px`);
      assert.match(result.canonical, /\/case-studies\.html$/);
      assert.match(result.font, /Source Sans 3/);
      assert(!/remarkable returns|brand recognition|7.day free trial|cancel it anytime|no credit card|Hobart|Carlisle|1,230|71%|which parts.*evidence|does not report a CLR/i.test(result.copy),
        "Legacy promotional or internal audit copy returned");
      for (const study of studies) {
        const section = page.locator(`[id="${study.id}"]`);
        assert.equal(await section.count(), 1, `Missing ${study.id} anchor`);
        if (study.url) {
          assert.equal(await section.locator(`a[href="${study.url}"]`).count() > 0, true,
            `Missing full story link for ${study.id}`);
          const text = await section.innerText();
          for (const metric of study.metrics) {
            assert(text.includes(metric.value), `${study.id}: missing qualified metric ${metric.value}`);
            assert(text.toLowerCase().includes(metric.label.toLowerCase()),
              `${study.id}: missing metric definition ${metric.label}`);
          }
        }
      }
      assert.match(result.copy, /66/);
      assert.match(result.copy, /five regulatory/i);
      assert.match(result.copy, /7,800/);
      assert.match(result.copy, /45%/);
      assert.match(result.copy, /38%/);
      const contact = page.locator('main a[href="https://info.certifyme.online/request-demo"]');
      assert(await contact.count() >= 1, "Missing institutional next step");
      for (const study of studies.filter(study => study.url)) {
        const link = page.locator(`[id="${study.id}"] a[href="${study.url}"]`).first();
        await link.scrollIntoViewIfNeeded();
        assert(await link.isVisible(), `${study.id} story action is invisible`);
        await link.focus();
        assert(await link.evaluate(node => node === document.activeElement), "Story link is not keyboard-focusable");
      }
      for (const link of await page.locator("main a").all()) {
        await link.scrollIntoViewIfNeeded();
        await page.mouse.move(0, 0);
        for (const state of ["default", "hover", "focus"]) {
          if (state === "hover") await link.hover();
          if (state === "focus") {
            await page.mouse.move(0, 0);
            await link.focus();
          }
          await page.waitForTimeout(200);
          const segments = await link.evaluate(visibleLabelContrast);
          assert(segments.length, `Link has no visible label in ${state} state`);
          assert(segments.every(segment => !segment.provisional &&
            segment.ratio + .01 >= segment.required),
          `Unreadable ${state} link at ${width}px: ${await link.innerText()}`);
        }
      }
      if (width === 1440) {
        // Follow the real links, not just their HTTP endpoints.
        for (const study of studies.filter(study => study.url)) {
          await page.locator(`[id="${study.id}"] a[href="${study.url}"]`).first().click();
          await page.waitForURL(`**${study.url}`);
          assert.equal(await page.locator("main h1").count(), 1);
          assert(await page.locator("main article.association-case-study").count() === 1);
          await page.goBack({ waitUntil: "domcontentloaded" });
        }
      }
      await page.close();
      console.log(`PASS ${width}px: current cases, metric definitions, legacy anchors, readable layout and usable story actions.`);
    }
    await context.close();
  } finally {
    await browser.close();
  }
}

check().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
