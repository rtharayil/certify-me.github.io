#!/usr/bin/env node

const { execFileSync, spawn } = require("node:child_process");
const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");
const { chromium } = require("playwright");

const ROOT = path.resolve(__dirname, "..");
const PORT = Number(process.env.COMPARISON_TEST_PORT || 5001);
const BASE_URL = (process.env.COMPARISON_BASE_URL || `http://127.0.0.1:${PORT}`).replace(/\/$/, "");
const VIEWPORT = { width: 390, height: 844 };
const WAIT_TIMEOUT_MS = 30_000;

function comparisonPaths() {
  return fs.readdirSync(path.join(ROOT, "_blog"))
    .filter((name) => name.endsWith(".md"))
    .filter((name) => /^---\s*[\s\S]*?^comparison_page:\s*true\s*$/m.test(
      fs.readFileSync(path.join(ROOT, "_blog", name), "utf8"),
    ))
    .map((name) => `/blog/${name.slice(0, -3)}.html`);
}

function waitForServer(url) {
  const deadline = Date.now() + WAIT_TIMEOUT_MS;

  return new Promise((resolve, reject) => {
    function poll() {
      const request = http.get(url, (response) => {
        response.resume();
        if (response.statusCode >= 200 && response.statusCode < 500) {
          resolve();
          return;
        }
        retry();
      });

      request.on("error", retry);
      request.setTimeout(1_000, () => {
        request.destroy();
        retry();
      });
    }

    function retry() {
      if (Date.now() >= deadline) {
        reject(new Error(`Timed out waiting for ${url}`));
        return;
      }
      setTimeout(poll, 250);
    }

    poll();
  });
}

function startSite() {
  execFileSync("bundle", ["exec", "jekyll", "build", "--destination", "_site"], {
    cwd: ROOT,
    stdio: "inherit",
  });

  const server = spawn(
    "bundle",
    [
      "exec",
      "jekyll",
      "serve",
      "--host",
      "127.0.0.1",
      "--port",
      String(PORT),
      "--skip-initial-build",
      "--no-watch",
    ],
    { cwd: ROOT, detached: true, stdio: ["ignore", "pipe", "pipe"] },
  );

  let serverOutput = "";
  server.stdout.on("data", (chunk) => { serverOutput += chunk; });
  server.stderr.on("data", (chunk) => { serverOutput += chunk; });
  server.on("error", (error) => { serverOutput += `\n${error.message}`; });

  return { server, getOutput: () => serverOutput };
}

function stopSite(site) {
  if (!site.server.pid || site.server.exitCode !== null) return Promise.resolve();

  return new Promise((resolve) => {
    const finish = () => {
      clearTimeout(forceStop);
      resolve();
    };
    const forceStop = setTimeout(() => {
      try {
        process.kill(-site.server.pid, "SIGKILL");
      } catch {
        // The process group has already stopped.
      }
      finish();
    }, 5_000);

    site.server.once("close", finish);
    try {
      process.kill(-site.server.pid, "SIGTERM");
    } catch {
      finish();
    }
  });
}

async function inspectPage(page, pagePath) {
  await page.goto(`${BASE_URL}${pagePath}`, { waitUntil: "domcontentloaded", timeout: WAIT_TIMEOUT_MS });
  await page.waitForFunction(
    () => [...document.querySelectorAll(".single-post-txt table")].every(
      (table) => table.parentElement?.classList.contains("cp-article-table-wrap"),
    ),
    { timeout: WAIT_TIMEOUT_MS },
  );

  const wrapperCount = await page.locator(".cp-table-wrap, .cp-article-table-wrap").count();
  if (wrapperCount === 0) {
    throw new Error(`${pagePath}: no comparison table wrappers were rendered`);
  }

  const articleTableCount = await page.locator(".single-post-txt table").count();
  const wrappedArticleTableCount = await page.locator(
    ".single-post-txt table",
  ).evaluateAll((tables) => tables.filter(
    (table) => table.parentElement?.classList.contains("cp-article-table-wrap"),
  ).length);

  if (articleTableCount !== wrappedArticleTableCount) {
    throw new Error(
      `${pagePath}: ${articleTableCount - wrappedArticleTableCount} article table(s) were not wrapped after page load`,
    );
  }

  const wrapperResults = [];
  for (let index = 0; index < wrapperCount; index += 1) {
    const wrapper = page.locator(".cp-table-wrap, .cp-article-table-wrap").nth(index);
    await wrapper.focus();
    wrapperResults.push(await wrapper.evaluate((element) => {
      const before = element.scrollLeft;
      const maxScrollLeft = element.scrollWidth - element.clientWidth;
      element.scrollLeft = element.scrollWidth;
      const pageWidth = Math.max(
        document.documentElement.scrollWidth,
        document.body?.scrollWidth || 0,
      );

      return {
        activeElement: document.activeElement === element,
        role: element.getAttribute("role"),
        tabIndex: element.tabIndex,
        clientWidth: element.clientWidth,
        scrollWidth: element.scrollWidth,
        scrolledHorizontally: element.scrollLeft > before && element.scrollLeft >= maxScrollLeft - 1,
        pageWidth,
        viewportWidth: window.innerWidth,
      };
    }));
  }

  const invalidWrapper = wrapperResults.find((result) => (
    !result.activeElement
    || result.role !== "region"
    || result.tabIndex !== 0
    || result.scrollWidth <= result.clientWidth + 1
    || !result.scrolledHorizontally
    || result.pageWidth > result.viewportWidth + 1
  ));

  if (invalidWrapper) {
    throw new Error(`${pagePath}: mobile table wrapper check failed: ${JSON.stringify(invalidWrapper)}`);
  }

  return { wrapperCount, articleTableCount };
}

async function main() {
  const paths = comparisonPaths();
  if (paths.length === 0) {
    throw new Error("No comparison pages with comparison_page: true were found");
  }

  const managedServer = !process.env.COMPARISON_BASE_URL;
  const site = managedServer ? startSite() : null;

  try {
    await waitForServer(`${BASE_URL}${paths[0]}`);
    const browserPath = process.env.CHROMIUM_PATH || execFileSync("which", ["chromium"], { encoding: "utf8" }).trim();
    const browser = await chromium.launch({ headless: true, executablePath: browserPath });
    const context = await browser.newContext({
      viewport: VIEWPORT,
      isMobile: true,
      hasTouch: true,
      deviceScaleFactor: 1,
    });
    const page = await context.newPage();

    try {
      for (const pagePath of paths) {
        const result = await inspectPage(page, pagePath);
        console.log(
          `Passed ${pagePath}: ${result.wrapperCount} focusable, horizontally scrollable table wrappers (${result.articleTableCount} article tables).`,
        );
      }
    } finally {
      await context.close();
      await browser.close();
    }

    console.log(`Mobile comparison table validation passed at ${VIEWPORT.width}px.`);
  } finally {
    if (site) {
      await stopSite(site);
    }
  }
}

main().catch((error) => {
  console.error(`\nMobile comparison table validation failed: ${error.message}`);
  process.exitCode = 1;
});