#!/usr/bin/env node
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const http = require("node:http");
const { execFileSync } = require("node:child_process");
const { chromium, devices } = require("playwright");
const { inspectImages, inspectVisibility } = require("./lib/image-proportions.cjs");

const ROOT = path.resolve(__dirname, "..");
const WIDTHS = [1440, 390];
const PAGES = [
  { route: "/", required: [".credential-presentation__artwork img", ".trust-responsive__logo img"] },
  { route: "/credentials-higher-education.html",
    required: [".he-problem-img img", ".he-edu-hero-img img", ".he-brand-img img", ".he-analytics-img img", ".he-proof img"] },
  // Stable representative thumbnails: the capped read-more card and the first
  // six local listing cards. The full editorial catalogue is outside this suite.
  { route: "/blog.html",
    images: "#bp-1-3 img, .posts-wrapper > .row > div:nth-child(-n+6) .blog-post-img img",
    required: ["#bp-1-3 img", ".posts-wrapper > .row > div:first-child .blog-post-img img"] },
];
const MOBILE_CONTENT = [
  ".he-problem-img img", ".he-edu-hero-img img", ".he-brand-img img", ".he-analytics-img img",
  "#he-skillstory img",
];
const args = process.argv.slice(2);
if (args.some(arg => !["--self-test", "--fixture-squeezed"].includes(arg))) {
  throw new Error("Supported options: --self-test, --fixture-squeezed");
}

async function fixtures(browser, negativeOnly) {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  try {
    await page.goto(`file://${path.join(__dirname, "fixtures/image-proportions.html")}`);
    const rows = await page.evaluate(inspectImages, "img");
    if (negativeOnly) return rows.filter(row => row.selector === "#squeezed");
    const expected = {
      "#squeezed": "FAIL", "#corrected": "PASS", "#contain": "exempt", "#cover": "exempt",
      "#scale-down": "exempt", "#lazy": "PASS", "#rounded": "PASS", "#bordered": "PASS",
    };
    for (const [selector, status] of Object.entries(expected)) {
      const row = rows.find(row => row.selector === selector);
      if (row?.status !== status) throw new Error(`Fixture ${selector}: expected ${status}; ${JSON.stringify(row)}`);
    }
    const rounded = rows.find(row => row.selector === "#rounded");
    if (rounded.natural[0] === rounded.source[0] || rounded.natural[1] === rounded.source[1]) {
      throw new Error(`Density fixture did not exercise corrected natural dimensions: ${JSON.stringify(rounded)}`);
    }
    for (const [selector, expectedStatus] of [["#visible-text", "PASS"], ["#clipped-text", "FAIL"]]) {
      const element = page.locator(selector);
      await element.evaluate(el => el.scrollIntoView({ block: "center" }));
      const row = await element.evaluate(inspectVisibility);
      if (row.status !== expectedStatus) throw new Error(`Visibility fixture ${selector}: ${JSON.stringify(row)}`);
    }
    console.log("PASS fixtures: squeezed image rejected; responsive correction, lazy decode, srcset rounding, border/padding and intentional crops accepted; clipped copy rejected.");
    return [];
  } finally {
    await page.close();
  }
}

async function startSite() {
  const destination = fs.mkdtempSync(path.join(os.tmpdir(), "certifyme-image-site-"));
  let server;
  try {
    execFileSync("bundle", ["exec", "jekyll", "build", "--destination", destination], {
      cwd: ROOT, stdio: "inherit",
    });
    // Serve only the fresh generated site, never the workspace/private uploads.
    server = http.createServer((request, response) => {
      try {
        let filename = path.resolve(destination, `.${decodeURIComponent(new URL(request.url, "http://test").pathname)}`);
        if (!filename.startsWith(destination + path.sep) && filename !== destination) {
          response.writeHead(403).end(); return;
        }
        if (fs.existsSync(filename) && fs.statSync(filename).isDirectory()) filename = path.join(filename, "index.html");
        if (!fs.existsSync(filename) || !fs.statSync(filename).isFile()) { response.writeHead(404).end(); return; }
        const types = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".svg": "image/svg+xml",
          ".png": "image/png", ".webp": "image/webp", ".jpg": "image/jpeg", ".woff2": "font/woff2" };
        response.setHeader("Content-Type", types[path.extname(filename)] || "application/octet-stream");
        fs.createReadStream(filename).pipe(response);
      } catch { response.writeHead(400).end(); }
    });
    await new Promise((resolve, reject) => {
      server.once("error", reject);
      server.listen(0, "127.0.0.1", resolve);
    });
    return {
      base: `http://127.0.0.1:${server.address().port}`,
      close: async () => {
        await new Promise(resolve => server.close(resolve));
        fs.rmSync(destination, { recursive: true, force: true });
      },
    };
  } catch (error) {
    server?.close();
    fs.rmSync(destination, { recursive: true, force: true });
    throw error;
  }
}

async function checkPage(browser, base, definition, width, contextOverrides = {}) {
  const context = await browser.newContext({
    viewport: { width, height: 1000 }, isMobile: width < 600, hasTouch: width < 600,
    ignoreHTTPSErrors: true,
    ...contextOverrides,
  });
  const page = await context.newPage();
  const url = base + definition.route;
  const checks = [], failures = [];
  try {
    const response = await page.goto(url, { waitUntil: "load", timeout: 60000 });
    if (response.status() !== 200) throw new Error(`HTTP ${response.status()}`);
    await page.evaluate(() => document.fonts.ready);
    const rows = await page.evaluate(inspectImages, definition.images || "main img, header img, footer img");
    checks.push(...rows.map(row => ({ url, width, ...row })));
    failures.push(...checks.filter(row => row.status === "FAIL"));
    for (const selector of definition.required) {
      const images = page.locator(selector);
      if (!await images.count()) {
        failures.push({ url, width, selector, reason: "Required representative image missing" });
        continue;
      }
      await images.first().evaluate(el => el.scrollIntoView({ block: "center", behavior: "instant" }));
      await page.waitForTimeout(650);
      // Verify scrolled blog cards as well as their proportions: readable
      // content cannot depend on a window-only entrance-animation listener.
      const hasBox = await images.first().evaluate(el => {
        const rect = el.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0;
      });
      if (!hasBox) {
        failures.push({ url, width, selector, reason: "Required representative image has no rendered box" });
      }
      if (definition.route === "/blog.html") {
        const card = images.first().locator("xpath=ancestor::div[contains(concat(' ',normalize-space(@class),' '),' blog-post ')][1]");
        const labels = card.locator(".blog-post-txt h2, .blog-post-txt h3, .blog-post-txt h4, .blog-post-txt h5, .blog-post-txt h6, .blog-post-txt p");
        if (!await labels.count()) failures.push({ url, width, selector, reason: "Blog card has no accompanying text" });
        for (const element of [images.first(), ...await labels.all()]) {
          await element.evaluate(el => el.scrollIntoView({ block: "center", behavior: "instant" }));
          await page.waitForTimeout(650);
          const row = await element.evaluate(inspectVisibility);
          const record = { url, width, group: selector, ...row };
          checks.push(record);
          if (row.status === "FAIL") failures.push(record);
        }
      }
    }
    if (width < 600 && definition.route === "/credentials-higher-education.html") {
      for (const selector of MOBILE_CONTENT) {
        const image = page.locator(selector).first();
        if (!await image.count()) {
          failures.push({ url, width, selector, reason: "Required mobile illustration missing" }); continue;
        }
        // Also check the corresponding text, not just the first viewport/hero.
        const section = image.locator("xpath=ancestor::section[1]");
        const text = section.locator("h2, h3, p");
        const elements = [image, ...await text.all()];
        if (!await text.count()) failures.push({ url, width, selector, reason: "Illustration section has no visible accompanying text" });
        for (const element of elements) {
          await element.evaluate(el => el.scrollIntoView({ block: "center", behavior: "instant" }));
          await page.waitForTimeout(650); // Let the site's scroll-triggered reveal finish.
          const row = await element.evaluate(inspectVisibility);
          const record = { url, width, group: selector, ...row };
          checks.push(record);
          if (row.status === "FAIL") failures.push(record);
        }
      }
    }
    console.log(`${failures.length ? "FAIL" : "PASS"} ${url} at ${width}px: ${rows.length} images, ${checks.length - rows.length} scrolled visibility checks`);
  } catch (error) {
    failures.push({ url, width, selector: "page", reason: error.message });
  } finally {
    await context.close();
  }
  return { checks, failures };
}

async function main() {
  // Chromium writes generated cache/config outside the Jekyll workspace.
  const browserHome = fs.mkdtempSync(path.join(os.tmpdir(), "certifyme-image-browser-"));
  let browser, site;
  const report = { status: "PASS", widths: WIDTHS, checks: [], failures: [] };
  try {
    browser = await chromium.launch({
      executablePath: process.env.CHROMIUM_PATH || execFileSync("which", ["chromium"], { encoding: "utf8" }).trim(),
      headless: true, args: ["--no-sandbox", "--disable-dev-shm-usage"],
      env: { ...process.env, XDG_CACHE_HOME: path.join(browserHome, "cache"), XDG_CONFIG_HOME: path.join(browserHome, "config") },
    });
    const fixtureFailures = await fixtures(browser, args.includes("--fixture-squeezed"));
    report.failures.push(...fixtureFailures.map(row => ({ url: "fixture://image-proportions.html", width: 390, ...row })));
    if (!args.length) {
      site = process.env.IMAGE_TEST_BASE_URL ? null : await startSite();
      const base = (process.env.IMAGE_TEST_BASE_URL || site.base).replace(/\/$/, "");
      for (const width of WIDTHS) {
        for (const definition of PAGES) {
          const result = await checkPage(browser, base, definition, width);
          report.checks.push(...result.checks);
          report.failures.push(...result.failures);
        }
      }
      const blog = PAGES.find(definition => definition.route === "/blog.html");
      for (const [profile, overrides] of [
        ["narrow-desktop", { isMobile: false, hasTouch: false }],
        ["iphone-user-agent", { ...devices["iPhone 13"], viewport: { width: 390, height: 1000 } }],
      ]) {
        const result = await checkPage(browser, base, blog, 390, overrides);
        report.checks.push(...result.checks.map(row => ({ ...row, profile })));
        report.failures.push(...result.failures.map(row => ({ ...row, profile })));
      }
    }
  } catch (error) {
    report.failures.push({ reason: error.stack || error.message });
  } finally {
    await browser?.close();
    await site?.close();
    fs.rmSync(browserHome, { recursive: true, force: true });
  }
  report.status = report.failures.length ? "FAIL" : "PASS";
  const reportPath = path.resolve(process.env.IMAGE_TEST_REPORT || path.join(os.tmpdir(), "certifyme-image-proportions.json"));
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2) + "\n");
  for (const failure of report.failures) {
    console.error(`FAIL ${failure.url || "setup"} ${failure.width || ""}px\n  selector: ${failure.selector || "n/a"}\n  image: ${failure.image || "n/a"}\n  ${failure.reason}\n  rendered: ${JSON.stringify(failure.box)}; natural: ${JSON.stringify(failure.natural)}; selected source: ${JSON.stringify(failure.source)}`);
  }
  console.log(`${report.status}: ${report.checks.length} page checks, ${report.failures.length} failures. Report: ${reportPath}`);
  process.exitCode = report.failures.length ? 1 : 0;
}
main().catch(error => { console.error(error); process.exitCode = 1; });