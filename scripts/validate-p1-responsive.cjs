// Only revised P1 bodies, metadata and FAQs; no unrelated regression reruns.
const fs = require("node:fs");
const {execFileSync} = require("node:child_process");
const {chromium} = require("playwright");
const dir = ".local/reports/content-authority";
const records = JSON.parse(fs.readFileSync(`${dir}/p1-before-after-evidence.json`));
const base = process.env.P1_BASE_URL || `https://${process.env.REPLIT_DEV_DOMAIN}`;

(async () => {
  process.env.XDG_CACHE_HOME = "/tmp/p1-chromium-cache";
  process.env.XDG_CONFIG_HOME = "/tmp/p1-chromium-config";
  const browser = await chromium.launch({
    executablePath:execFileSync("which", ["chromium"], {encoding:"utf8"}).trim(),
    headless:true, args:["--no-sandbox", "--disable-dev-shm-usage"]
  });
  const context = await browser.newContext();
  await context.route(/googletagmanager|google-analytics|clarity\.ms|connect\.facebook|hotjar/, r => r.abort());
  const page = await context.newPage();
  const errors = [], checks = [], runtime = [];
  let current;
  page.on("pageerror", e => runtime.push({url:current, error:e.message}));
  for (const record of records) {
    current = record.url;
    const response = await page.goto(base + current, {waitUntil:"load", timeout:60000});
    if (response.status() !== 200) errors.push({url:current, error:`HTTP ${response.status()}`});
    await page.evaluate(() => document.fonts.ready);
    for (const width of [320,390,768,1280]) {
      await page.setViewportSize({width,height:900});
      const body = page.locator(".blogcontent").first();
      await body.scrollIntoViewIfNeeded();
      // Settle deferred styling and scroll-driven transitions, then inspect
      // actual content regions rather than transient first-frame geometry.
      await page.waitForTimeout(650);
      const geometry = await page.evaluate(() => {
        const body = document.querySelector(".blogcontent");
        const faq = document.querySelector(".blog-faq-section");
        const bounds = el => {
          const r = el.getBoundingClientRect();
          return {left:r.left,right:r.right,width:r.width,scroll:el.scrollWidth,client:el.clientWidth};
        };
        const tables = [...body.querySelectorAll("table,pre,img")].map(el => {
          let ancestor = el.parentElement, scroller = null;
          while (ancestor && ancestor !== body) {
            if (["auto","scroll"].includes(getComputedStyle(ancestor).overflowX)) {
              scroller = bounds(ancestor);
              break;
            }
            ancestor = ancestor.parentElement;
          }
          return {tag:el.tagName,...bounds(el),scroller};
        });
        const clipped = [...body.querySelectorAll("p,h2,h3,li")].filter(el => {
          const style = getComputedStyle(el);
          return el.scrollHeight > el.clientHeight + 2 && ["hidden","clip"].includes(style.overflowY);
        }).map(el => el.textContent.slice(0,100));
        return {document:document.documentElement.scrollWidth,body:bounds(body),faq:faq&&bounds(faq),tables,clipped,
                h1s:document.querySelectorAll("h1").length};
      });
      checks.push({url:current,width,...geometry});
      if (geometry.document > width + 2 || geometry.body.right > width + 2 || geometry.body.left < -2
          || (geometry.faq && geometry.faq.right > width + 2) || geometry.h1s !== 1 || geometry.clipped.length)
        errors.push({url:current,width,error:"Overflow, clipped text or heading count",geometry});
      for (const item of geometry.tables) {
        // A local table scroller is allowed; document overflow is not.
        const contained = item.scroller && item.scroller.left >= -2 && item.scroller.right <= width + 2;
        if ((item.right > width + 2 || item.left < -2) && !contained)
          errors.push({url:current,width,error:"Content element outside viewport",item});
      }
    }
    await page.setViewportSize({width:390,height:900});
    for (const detail of await page.locator(".blog-faq-item").all()) {
      await detail.locator("summary").click();
      const open = await detail.evaluate(el => el.open && el.innerText.trim().length > el.querySelector("summary").innerText.trim().length);
      if (!open) errors.push({url:current,error:"FAQ disclosure not readable"});
    }
  }
  const result = {status:errors.length || runtime.length ? "FAIL" : "PASS",
    method:"Running development preview; settled revised P1 article bodies and every FAQ. No production/indexing/SEO outcome validation.",
    routes:records.length, widths:[320,390,768,1280], viewportChecks:checks.length, checks,errors,runtimeErrors:runtime};
  fs.writeFileSync(`${dir}/p1-responsive.json`,JSON.stringify(result,null,2));
  console.log(JSON.stringify({status:result.status,routes:records.length,viewportChecks:checks.length,errors,runtimeErrors:runtime}));
  await browser.close();
  process.exitCode = result.status === "PASS" ? 0 : 1;
})().catch(e => {console.error(e);process.exitCode=1;});