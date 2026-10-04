#!/usr/bin/env node
// Tests the new editorial content, rather than rerunning old comparison/FAQ gates.
const fs = require("node:fs");
const { execFileSync } = require("node:child_process");
const { chromium } = require("playwright");
const output = ".local/reports/content-authority";
const articles = JSON.parse(fs.readFileSync(`${output}/reviewed-inventory.json`)).articles;
const targets = [...new Set([
  ...articles.filter(a => a.priority === "P0").map(a => a.url),
  ...JSON.parse(fs.readFileSync("_data/authority_editorial.json")).map(a => a.url),
  "/credentials-higher-education",
  "/blog/how-to-get-college-transcripts.html",
  "/blog/what-is-a-high-school-transcript.html",
  "/blog/what-is-an-academic-transcript.html",
])];
const base = process.env.CONTENT_AUTHORITY_BASE_URL
  || (process.env.REPLIT_DEV_DOMAIN ? `https://${process.env.REPLIT_DEV_DOMAIN}` : null);
if (!base) throw new Error("Provide the running preview's development domain.");

(async () => {
  process.env.XDG_CACHE_HOME ||= "/tmp/content-authority-chromium-cache";
  process.env.XDG_CONFIG_HOME ||= "/tmp/content-authority-chromium-config";
  const browser = await chromium.launch({
    executablePath: execFileSync("which", ["chromium"], { encoding:"utf8" }).trim(),
    headless:true, args:["--no-sandbox","--disable-dev-shm-usage"],
  });
  const context = await browser.newContext({viewport:{width:390,height:844}});
  await context.route(/googletagmanager|google-analytics|clarity\.ms|connect\.facebook|hotjar/, route => route.abort());
  const page = await context.newPage();
  const checks = [], errors = [], runtime = [];
  let current = "";
  page.on("pageerror", error => runtime.push({url:current,error:error.message}));
  for (const url of targets) {
    current = url;
    const response = await page.goto(base + url,{waitUntil:"domcontentloaded",timeout:45000});
    await page.waitForLoadState("load", {timeout:45000});
    await page.evaluate(async () => { await document.fonts.ready; });
    if (!response || response.status() !== 200) errors.push({url,error:"Preview route did not return HTTP 200."});
    for (const width of [320,360,390,430,768,1280]) {
      await page.setViewportSize({width,height:width === 768 ? 1024 : 900});
      // Wait for deferred styles/fonts and viewport-driven entry animations,
      // rather than treating an intermediate frame as a persistent overflow.
      await page.waitForTimeout(600);
      const result = await page.evaluate(() => {
        const width = innerWidth;
        const selectors = ".blogcontent, .content-authority-editorial, [data-content-review], [data-reviewed-cluster]";
        const regions = [...document.querySelectorAll(selectors)].map(el => {
          const r = el.getBoundingClientRect();
          return {selector:el.dataset.authorityReview || el.dataset.contentReview || el.dataset.reviewedCluster || "article-body",
            left:Math.round(r.left),right:Math.round(r.right),width:Math.round(r.width)};
        });
        return {viewport:width,documentWidth:document.documentElement.scrollWidth,
          bodyWidth:document.body.scrollWidth,h1s:document.querySelectorAll("h1").length,regions};
      });
      checks.push({url,...result});
      if (result.documentWidth > width + 2 || result.bodyWidth > width + 2)
        errors.push({url,width,error:"Document horizontal overflow",...result});
      if (result.h1s !== 1) errors.push({url,width,error:"Unexpected heading count"});
      for (const region of result.regions)
        if (region.left < -2 || region.right > width + 2)
          errors.push({url,width,error:"Editorial region exceeds viewport",region});
    }
    const summary = page.locator(".content-authority-editorial details summary").first();
    if (await summary.count()) {
      await page.setViewportSize({width:390,height:844});
      await summary.evaluate(el => el.scrollIntoView({block:"center"}));
      await summary.click();
      const open = await summary.evaluate(el => el.parentElement.open && el.parentElement.querySelector("p").getBoundingClientRect().height > 0);
      if (!open) errors.push({url,error:"New authority disclosure does not expose its answer."});
    }
  }
  const report = {method:"Running preview; new editorial article regions, six authority sections and university journey. Existing comparison/FAQ/private-upload suites not rerun.",
    routes:targets.length,viewportChecks:checks.length,widths:[320,360,390,430,768,1280],
    checks,errors,runtimeErrors:runtime,status:errors.length || runtime.length ? "FAIL" : "PASS"};
  fs.writeFileSync(`${output}/content-authority-mobile.json`,JSON.stringify(report,null,2));
  console.log(JSON.stringify({status:report.status,routes:report.routes,viewportChecks:report.viewportChecks,errors,runtimeErrors:runtime},null,2));
  await browser.close();
  process.exitCode = report.status === "PASS" ? 0 : 1;
})().catch(error => {console.error(error);process.exitCode=1;});