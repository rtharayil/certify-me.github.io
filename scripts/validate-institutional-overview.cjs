const assert = require("node:assert/strict");
const fs = require("node:fs");
const { execFileSync } = require("node:child_process");
const { chromium } = require("playwright");
const { visibleLabelContrast } = require("./lib/visible-label-contrast.cjs");

const records = JSON.parse(fs.readFileSync("_data/authority_editorial.json", "utf8"));
const base = process.env.INSTITUTIONAL_OVERVIEW_BASE_URL || `https://${process.env.REPLIT_DEV_DOMAIN}`;
const normalise = value => value.replace(/\s+/g, " ").trim();
const fields = ["definition", "problem", "architecture", "how", "standards",
  "implementation", "use_case", "example", "limitation"];

async function check() {
  const browser = await chromium.launch({
    executablePath: execFileSync("which", ["chromium"], { encoding: "utf8" }).trim(),
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
  });
  const destinations = new Set();
  try {
    const context = await browser.newContext({ reducedMotion: "reduce" });
    await context.route(/googletagmanager|google-analytics|clarity\.ms|connect\.facebook|hotjar/, route => route.abort());
    for (const width of [1440, 1024, 768, 390, 320]) {
      const page = await context.newPage();
      await page.setViewportSize({ width, height: 1000 });
      for (const record of records) {
        const response = await page.goto(base + record.url, { waitUntil: "domcontentloaded", timeout: 30000 });
        assert.equal(response.status(), 200);
        const component = page.locator(`[data-authority-review="${record.id}"]`);
        assert.equal(await component.count(), 1);
        await component.scrollIntoViewIfNeeded();
        const copy = normalise(await component.textContent());
        for (const field of fields) {
          assert(copy.includes(normalise(record[field])), `${record.id}: ${field} was changed or lost`);
        }
        for (const reading of record.reading) {
          const link = component.locator(`a[href="${reading.url}"]`).first();
          assert.equal(normalise(await link.textContent()), normalise(reading.anchor));
          destinations.add(reading.url);
          if (reading.context) assert(!copy.includes(normalise(reading.context)), "Editorial reading instructions became public");
        }
        const state = await component.evaluate(section => {
          const topics = section.querySelector(".authority-editorial__topics");
          const shell = section.querySelector(".authority-editorial__inner");
          return {
            font: getComputedStyle(section).fontFamily,
            border: getComputedStyle(shell).borderTopStyle,
            columns: getComputedStyle(topics).gridTemplateColumns.split(" ").length,
            width: section.clientWidth - parseFloat(getComputedStyle(section).paddingLeft) - parseFloat(getComputedStyle(section).paddingRight),
            readingCount: section.querySelectorAll(".authority-editorial__reading li").length,
            h2: section.querySelectorAll("h2").length,
            headings: [...section.querySelectorAll("h3")].map(node => node.textContent.trim()),
            overflow: [shell, ...section.querySelectorAll("h2,h3,p,a,li")].some(node => {
              const rect = node.getBoundingClientRect();
              return rect.width > 0 && (rect.left < -1 || rect.right > innerWidth + 1);
            }),
          };
        });
        assert.match(state.font, /Source Sans 3/);
        assert.equal(state.border, "solid", "Overview styling did not apply");
        assert.equal(state.h2, 1);
        assert.equal(state.headings.length, 7);
        assert.equal(state.readingCount, record.reading.length);
        assert.equal(state.overflow, false, `${record.id}: overview overflow at ${width}px`);
        assert.equal(state.columns, state.width >= 700 ? 2 : 1, `${record.id}: layout ignores component width`);
        assert.equal(await page.locator("main h1").count(), 1);
        assert.equal(await page.locator(".institutional-faqs").count(), 1, "FAQ consolidation regressed");
        assert.equal(await page.locator("h2").filter({ hasText: /^Common questions$/ }).count(), 1);
        const cta = component.locator(".authority-editorial__cta");
        assert.equal(await cta.getAttribute("href"), "https://info.certifyme.online/request-demo");
        assert.equal(await cta.getAttribute("target"), "_blank");
        assert((await cta.getAttribute("rel")).includes("noopener"));
        await cta.focus();
        assert(await cta.evaluate(node => node === document.activeElement));
        const controls = [cta, component.locator(".authority-editorial__reading a").first()];
        for (const link of controls) {
          await link.scrollIntoViewIfNeeded();
          for (const state of ["default", "hover", "focus"]) {
            await page.mouse.move(0, 0);
            if (state === "default") await link.evaluate(node => node.blur());
            if (state === "hover") await link.hover();
            if (state === "focus") await link.focus();
            await page.waitForTimeout(180);
            const segments = await link.evaluate(visibleLabelContrast);
            assert(segments.length && segments.every(s => !s.provisional && s.ratio + .01 >= s.required),
              `${record.id}: insufficient ${state} contrast at ${width}px`);
          }
        }
      }
      console.log(`PASS ${width}px: all ${records.length} overviews, original content, reading links, responsive layout, contrast, keyboard actions and one FAQ.`);
      await page.close();
    }
    for (const url of destinations) {
      const response = await context.request.get(base + url);
      assert.equal(response.status(), 200, `Reading destination is broken: ${url}`);
    }
    console.log(`PASS: all ${destinations.size} distinct reading destinations remain reachable. No external form was submitted.`);
  } finally {
    await browser.close();
  }
}

check().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
