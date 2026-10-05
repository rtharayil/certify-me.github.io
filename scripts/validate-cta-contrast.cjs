#!/usr/bin/env node
"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const { chromium } = require("playwright");
const { visibleLabelContrast } = require("./lib/visible-label-contrast.cjs");

const root = path.resolve(__dirname, "..");
const base = `https://${process.env.REPLIT_DEV_DOMAIN}`;
const demo = "https://info.certifyme.online/request-demo";
const selectors = [
  ".homepage-section-cta__link", ".post-content .btn--theme", ".cp-btn",
  ".cm-infra .btn--theme", ".content-authority-editorial .btn--theme",
  "section[aria-labelledby='institutional-implementation-title'] .btn--theme",
  ".clr-button", ".stm-button", ".flp-btn-primary", ".flp2-sn-cta",
  ".pba-button--primary", ".release-download", ".download-btn",
  "#role-page a[style*='background: #3d4a7b']", ".fl-qual-card-link",
  ".btn--outline-white", ".credential-modal__demo",
  ".buttonDemo", ".case-study-btn", ".timeline-link", ".view-credentials-btn",
  "a[href*='linkedin.com/in/']:not([aria-label])",
];
const uniqueMarkers = /homepage-section-cta__link|See CertifyMe for Your Institution|Explore the Connected Credential Journey|Edit this (?:CNA|City &amp; Guilds|City & Guilds|Red Cross) Certificate Template|cp-btn--secondary|clr-button|stm-button|flp-btn-primary|flp2-sn-cta|pba-button--primary|release-download|class="download-btn"|Learn About SkillStory|buttonDemo/;
const routes = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(file);
    else if (file.endsWith(".html")) {
      const html = fs.readFileSync(file, "utf8");
      if (uniqueMarkers.test(html)) routes.push("/" + path.relative(path.join(root, "_site"), file).replace(/index\.html$/, ""));
    }
  }
}
walk(path.join(root, "_site"));
// Cover shared cards in each additional layout, without repeating 122 identical includes.
const translations = ["/TranSpan.html", "/tranFrench.html", "/transArabic.html",
  "/transGerman.html", "/transPortuguese.html"];
for (const route of ["/blog.html", "/sample-credential.html", "/glossary/why-use-verifiable-credentials.html",
  "/EPTemplates/riya/classic.html", "/BSIsample/showcasedir.html",
  "/authors/aneesha-kurian.html", ...translations]) {
  if (!routes.includes(route)) routes.push(route);
}

const failures = [], provisional = [], records = [];
const portalSelectors = {
  "/BSIsample/Admin.html": ".btn-popup, .nav-item, .btn-download",
  "/BSIsample/Dashboard.html": ".nav-item.active, .btn-submit:not(:disabled), #successViewCertified",
  "/Qatar/admin.html": ".nav-item.logout, #notifBtn, .modal-action-btn.reject",
  "/Qatar/student.html": ".ni.lo, .tbb",
  "/Qatar/Verifier.html": ".ni.lo",
  "/nyc/admin.html": "#navDash, #navUpload",
  "/nyc/Showcasedir-nyc.html": "button",
};
async function check(locator, route, width, state) {
  const segments = await locator.evaluate(visibleLabelContrast);
  for (const segment of segments) {
    const record = { route, width, state, ...segment };
    records.push(record);
    if (segment.provisional) provisional.push(record);
    else if (segment.ratio + .01 < segment.required) failures.push(record);
  }
  assert(segments.length, `${route}: ${state} control must have a visible label`);
}

(async () => {
  process.env.XDG_CONFIG_HOME = "/tmp/cta-regression-config";
  process.env.XDG_CACHE_HOME = "/tmp/cta-regression-cache";
  const browser = await chromium.launch({
    executablePath: execFileSync("which", ["chromium"], { encoding: "utf8" }).trim(),
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
  });
  try {
    // Unit checks prevent hidden accessibility text and image-backed surfaces being
    // misreported as confirmed failures. These fixtures are not website fallbacks.
    const fixture = await browser.newPage();
    await fixture.setContent(`<a style="color:white;background:#282b75">Readable<span class="sr-only" style="color:#282b75">Hidden</span></a>
      <a id="bad" style="color:#282b75;background:#282b75">Unreadable</a>
      <a id="image" style="background-image:url('data:image/png;base64,');color:white">Review image</a>`);
    assert.equal((await fixture.locator("a").first().evaluate(visibleLabelContrast)).length, 1);
    assert((await fixture.locator("#bad").evaluate(visibleLabelContrast))[0].ratio < 1.01);
    assert((await fixture.locator("#image").evaluate(visibleLabelContrast))[0].provisional);
    await fixture.close();
    for (const width of [1440, 390]) {
      const context = await browser.newContext({
        viewport: { width, height: 900 }, isMobile: width === 390, hasTouch: width === 390,
      });
      // Serve exact generated site bytes through the preview origin. Avoid unreliable
      // proxy asset transport and third-party requests; missing local files fail.
      await context.route("**/*", async route => {
        const url = new URL(route.request().url());
        if (url.href === demo) return route.fulfill({ contentType: "text/html", body: "<h1>Demo destination</h1>" });
        if (url.origin !== new URL(base).origin) return route.abort();
        let file = path.resolve(root, "_site", "." + decodeURIComponent(url.pathname));
        if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, "index.html");
        if (!fs.existsSync(file) && fs.existsSync(file + ".html")) file += ".html";
        if (!file.startsWith(path.join(root, "_site") + path.sep) || !fs.existsSync(file))
          return route.fulfill({ status: 404, body: "Missing generated asset" });
        return route.fulfill({ path: file });
      });
      const page = await context.newPage();
      const cdp = await context.newCDPSession(page);
      await cdp.send("DOM.enable");
      await cdp.send("CSS.enable");
      for (const route of [...new Set(routes)].sort()) {
        const response = await page.goto(base + route, { waitUntil: "load", timeout: 15000 });
        assert.equal(response.status(), 200, route);
        // Scope test-only transition overrides to the audited controls, never "*".
        await page.addStyleTag({ content: selectors.map(s => `${s},${s} *`).join(",") +
          "{transition:none!important;}" });
        const controls = page.locator(selectors.join(","));
        let checked = 0;
        for (const control of await controls.all()) {
          if (!await control.isVisible()) continue;
          await control.evaluate(el => el.scrollIntoView({ block: "center", behavior: "instant" }));
          await control.evaluate(el => el.setAttribute("data-contrast-target", "current"));
          const { root: document } = await cdp.send("DOM.getDocument");
          const { nodeId } = await cdp.send("DOM.querySelector", { nodeId: document.nodeId, selector: "[data-contrast-target=current]" });
          await cdp.send("CSS.forcePseudoState", { nodeId, forcedPseudoClasses: [] });
          await check(control, route, width, "normal");
          await cdp.send("CSS.forcePseudoState", { nodeId, forcedPseudoClasses: ["hover"] });
          await check(control, route, width, "hover");
          await cdp.send("CSS.forcePseudoState", { nodeId, forcedPseudoClasses: [] });
          await control.evaluate(el => el.removeAttribute("data-contrast-target"));
          checked++;
        }
        assert(checked > 0, `No audited controls on ${route}`);
        console.log(`${width}px ${route}: ${checked} visible controls checked`);
      }
      // Genuine interactions and settled transitions, with no transition overrides.
      await page.goto(base + "/", { waitUntil: "load" });
      assert.equal(await page.locator(".homepage-section-cta__link").count(), 11);
      for (const cta of await page.locator(".homepage-section-cta__link").all()) {
        assert.equal(await cta.getAttribute("href"), demo);
        assert.equal(await cta.getAttribute("target"), "_blank");
        assert.match(await cta.getAttribute("rel"), /noopener/);
      }
      const link = page.locator(".homepage-section-cta__link").first();
      await link.evaluate(el => el.scrollIntoView({ block: "center", behavior: "instant" }));
      if (width === 1440) {
        await page.mouse.move(0, 0);
        await page.waitForTimeout(650);
        await check(link, "/", width, "settled-normal");
        await link.hover();
        await page.waitForTimeout(650);
        await check(link, "/", width, "settled-mouse-hover");
      }
      const [popup] = await Promise.all([
        page.waitForEvent("popup"), width === 390 ? link.tap() : link.click(),
      ]);
      await popup.waitForLoadState();
      assert.equal(popup.url(), demo);
      await popup.close();
      // The current English hero has no walkthrough opener; exercise the shared
      // dialog through its real translated-page openers, never an auth/UI bypass.
      for (const route of translations) {
        await page.goto(base + route, { waitUntil: "load" });
        const opener = page.locator("[data-credential-open]").first();
        await opener.evaluate(el => el.scrollIntoView({ block: "center", behavior: "instant" }));
        await (width === 390 ? opener.tap() : opener.click());
        const modal = page.locator(".credential-modal");
        await modal.waitFor({ state: "visible" });
        const modalDemo = modal.locator(".credential-modal__demo");
        await modalDemo.scrollIntoViewIfNeeded();
        await page.mouse.move(0, 0);
        await page.waitForTimeout(650);
        await check(modalDemo, route, width, "opened-modal-normal");
        const picker = modal.locator(".credential-readable__layer-picker");
        if (width === 390 && await picker.isVisible()) await picker.locator("summary").tap();
        for (const control of await modal.locator("[data-credential-step-to], [data-credential-outcome]").all()) {
          if (!await control.isVisible()) continue;
          await check(control, route, width, "opened-modal-layer-label");
        }
        if (width === 1440) {
          await modalDemo.hover();
          await page.waitForTimeout(650);
          await check(modalDemo, route, width, "opened-modal-settled-hover");
        }
        await modal.locator(".credential-modal__close").click();
        assert(!await modal.isVisible(), "Dialog closes without changing behavior");
      }
      // The real menu opener differs on touch; verify its expanded state.
      await page.goto(base + "/", { waitUntil: "load" });
      if (width === 390) {
        await page.locator("#wsnavtoggle").tap();
        assert.equal(await page.locator("#wsnavtoggle").getAttribute("aria-expanded"), "true");
        assert(await page.locator(".wsmenu").isVisible());
        const menuDemo = page.locator(".wsmenu-list > .nl-simple > a.btn--theme").last();
        await menuDemo.scrollIntoViewIfNeeded();
        await check(menuDemo, "/", width, "opened-touch-menu");
      } else {
        await page.locator(".wsmenu-list > li > a.h-link").first().hover();
        const menuDemo = page.locator(".wsmenu-list > li").first().locator(".wsmegamenu a.btn--theme");
        await menuDemo.waitFor({ state: "visible" });
        await menuDemo.hover();
        await page.waitForTimeout(650);
        await check(menuDemo, "/", width, "opened-desktop-menu-settled-hover");
      }
      const settledTargets = {
        "/blog/Understanding-W3C-Verifiable-Credentials.html": ".post-content .btn--theme",
        "/blog/certifyme-vs-accredible-2026-comparison.html": ".cp-btn--secondary",
        "/blog/top-10-cna-certificate-templates.html": ".post-content .btn--theme",
        "/comprehensive-learner-record.html": ".clr-primary",
        "/skills-taxonomy-mapping.html": ".stm-button-primary",
        "/EPTemplates/riya/btech.html": ".download-btn",
      };
      for (const [route, selector] of Object.entries(settledTargets)) {
        await page.goto(base + route, { waitUntil: "load" });
        const target = page.locator(selector).first();
        await target.evaluate(el => el.scrollIntoView({ block: "center", behavior: "instant" }));
        await page.mouse.move(0, 0);
        await page.waitForTimeout(650);
        await check(target, route, width, "settled-normal");
        if (width === 1440) {
          await target.hover();
          await page.waitForTimeout(650);
          await check(target, route, width, "settled-mouse-hover");
        }
      }
      // Isolated style fixtures for the inventory's initially hidden sample-portal
      // controls. Preserve generated CSS, markup and background ancestry; do not
      // bypass sign-in in the application or claim these are signed-in UI checks.
      for (const [route, selector] of Object.entries(portalSelectors)) {
        await page.goto(base + route, { waitUntil: "load" });
        const fixtures = await page.evaluate(selector => {
          const head = [...document.head.querySelectorAll("style,link[rel=stylesheet]")]
            .map(el => el.outerHTML).join("");
          return [...document.querySelectorAll(selector)].filter(el => el.textContent.trim())
            .map(el => {
              let subtree = el.cloneNode(true);
              subtree.setAttribute("data-contrast-target", "fixture");
              subtree.querySelectorAll("script").forEach(script => script.remove());
              for (let parent = el.parentElement; parent; parent = parent.parentElement) {
                const shell = parent.cloneNode(false);
                shell.removeAttribute("hidden");
                shell.classList.add("cta-fixture-shell");
                shell.append(subtree);
                subtree = shell;
                if (parent.tagName === "BODY") break;
              }
              return `<html><head>${head}</head>${subtree.outerHTML}</html>`;
            });
        }, selector);
        const fixturePage = await context.newPage();
        const fixtureCdp = await context.newCDPSession(fixturePage);
        await fixtureCdp.send("DOM.enable");
        await fixtureCdp.send("CSS.enable");
        for (const html of fixtures) {
          await fixturePage.setContent(`<base href="${base}/">${html}`);
          await fixturePage.addStyleTag({ content:
            ".cta-fixture-shell{display:block!important;visibility:visible!important;opacity:1!important;}" +
            "[data-contrast-target=fixture],[data-contrast-target=fixture] *{transition:none!important;}" });
          const target = fixturePage.locator("[data-contrast-target=fixture]");
          if (!(await target.evaluate(visibleLabelContrast)).length) continue;
          await check(target, route, width, "isolated-hidden-control-normal");
          const { root: document } = await fixtureCdp.send("DOM.getDocument");
          const { nodeId } = await fixtureCdp.send("DOM.querySelector", {
            nodeId: document.nodeId, selector: "[data-contrast-target=fixture]",
          });
          await fixtureCdp.send("CSS.forcePseudoState", { nodeId, forcedPseudoClasses: ["hover"] });
          await check(target, route, width, "isolated-hidden-control-hover");
        }
        await fixturePage.close();
      }
      await context.close();
    }
  } finally {
    await browser.close();
    const report = {
      publicRoutes: [...new Set(routes)].length, isolatedPortalRoutes: Object.keys(portalSelectors).length,
      records: records.length,
      publicTextStates: records.filter(r => !r.state.startsWith("isolated-")).length,
      isolatedTextStates: records.filter(r => r.state.startsWith("isolated-")).length,
      failures, provisional, colorStates: records,
    };
    fs.mkdirSync(path.join(root, ".local/reports/cta-color-regression"), { recursive: true });
    fs.writeFileSync(path.join(root, ".local/reports/cta-color-regression/results.json"), JSON.stringify(report, null, 2));
  }
  assert.equal(failures.length, 0, JSON.stringify(failures, null, 2));
  console.log(`${records.length} visible text states pass contrast across ${routes.length} routes at desktop and touch widths.`);
})().catch(error => { console.error(error); process.exitCode = 1; });
