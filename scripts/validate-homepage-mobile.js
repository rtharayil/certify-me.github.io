#!/usr/bin/env node

"use strict";

const fs = require("node:fs");
const http = require("node:http");
const https = require("node:https");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const { chromium } = require("playwright");

const ROOT = path.resolve(__dirname, "..");
const BASE_URL = (process.env.HOMEPAGE_BASE_URL || "http://127.0.0.1:5000").replace(/\/$/, "");
const WIDTHS = [320, 390, 768, 1024];
const HEIGHT = 844;
const LANDSCAPE_HEIGHT = 768;
const PAGE_OVERFLOW_TOLERANCE = 1;
const browserRequestFailures = [];
const browserConsoleErrors = [];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function serverAssetBytes(assetPath) {
  const url = new URL(assetPath, `${BASE_URL}/`);
  const transport = url.protocol === "https:" ? https : http;

  return new Promise((resolve, reject) => {
    const request = transport.get(url, {
      headers: { "accept-encoding": "identity" },
      // A proxied preview can use a development certificate. This check only
      // compares static server bytes; browser TLS behavior is recorded below.
      ...(url.protocol === "https:" ? { rejectUnauthorized: false } : {}),
    }, (response) => {
      const chunks = [];
      response.on("data", (chunk) => chunks.push(chunk));
      response.on("end", () => {
        const body = Buffer.concat(chunks);
        if (response.statusCode !== 200) {
          reject(new Error(`${assetPath} returned HTTP ${response.statusCode}`));
          return;
        }
        resolve(body);
      });
    });

    request.setTimeout(15_000, () => request.destroy(new Error(`Timed out fetching ${assetPath}`)));
    request.on("error", reject);
  });
}

async function verifyServedAssets() {
  const assets = [
    "/assets4/js/credential-sample-modal.js",
    "/assets4/js/jquery-3.7.0.min.js",
    "/assets4/js/bootstrap.min.js",
    "/assets4/js/menu.js",
    "/assets4/js/custom.js",
    "/assets4/js/jquery.validate.min.js",
    "/assets4/js/jquery.ajaxchimp.min.js",
    "/assets4/js/request-form.js",
    "/assets4/css/mobile-ux.css",
    "/assets4/css/homepage-seo.css",
  ];

  for (const asset of assets) {
    const sourcePath = path.join(ROOT, asset);
    const sourceBytes = fs.readFileSync(sourcePath);
    const servedBytes = await serverAssetBytes(asset);
    assert(
      sourceBytes.equals(servedBytes),
      `${asset}: server response differs from the current source bytes`,
    );
  }

  console.log("Verified current modal, interaction, form, and homepage/mobile asset bytes from the preview server.");
}

function summarizeRequestFailures() {
  const counts = new Map();
  browserRequestFailures.forEach((failure) => {
    const key = `${failure.width}px ${failure.url} ${failure.error}`;
    counts.set(key, (counts.get(key) || 0) + 1);
  });
  return Array.from(counts, ([request, count]) => `${request} (${count}x)`);
}

function localAssetPath(requestUrl) {
  const pathname = new URL(requestUrl).pathname;
  if (!pathname.startsWith("/assets4/")) return null;

  const resolved = path.resolve(ROOT, `.${pathname}`);
  const assetsRoot = path.join(ROOT, "assets4") + path.sep;
  if (!resolved.startsWith(assetsRoot) || !fs.existsSync(resolved) || !fs.statSync(resolved).isFile()) {
    return null;
  }
  return resolved;
}

async function assertStageReadingVisible(page, stageIndex, width, label) {
  await page.waitForFunction((index) => {
    const dialog = document.querySelector("#credential-sample-dialog");
    const panel = dialog?.querySelector(".credential-modal__panel");
    const header = dialog?.querySelector(".credential-modal__header");
    const footer = dialog?.querySelector(".credential-modal__footer");
    const heading = dialog?.querySelector(`[data-credential-stage="${index}"] h3`);
    if (!panel || !header || !footer || !heading) return false;

    const panelBounds = panel.getBoundingClientRect();
    const headerBounds = header.getBoundingClientRect();
    const footerBounds = footer.getBoundingClientRect();
    const headingBounds = heading.getBoundingClientRect();
    const summary = dialog.querySelector(".credential-readable__layer-picker > summary");
    const summaryIsVisible = summary && summary.getBoundingClientRect().height > 0;
    const safeTop = Math.max(
      panelBounds.top,
      headerBounds.bottom,
      summaryIsVisible ? summary.getBoundingClientRect().bottom : panelBounds.top,
    );

    return headingBounds.top >= safeTop - 2
      && headingBounds.bottom <= footerBounds.top + 2
      && headingBounds.bottom <= window.innerHeight + 2;
  }, stageIndex);

  const bounds = await page.locator(
    `#credential-sample-dialog [data-credential-stage="${stageIndex}"] h3`,
  ).evaluate((heading) => {
    const rect = heading.getBoundingClientRect();
    const panel = heading.closest(".credential-modal__panel");
    const header = panel.querySelector(".credential-modal__header").getBoundingClientRect();
    const footer = panel.querySelector(".credential-modal__footer").getBoundingClientRect();
    const pickerSummary = panel.querySelector(".credential-readable__layer-picker > summary");
    const pickerBottom = pickerSummary && pickerSummary.getBoundingClientRect().height
      ? pickerSummary.getBoundingClientRect().bottom
      : panel.getBoundingClientRect().top;
    return {
      top: rect.top,
      bottom: rect.bottom,
      safeTop: Math.max(header.bottom, pickerBottom),
      safeBottom: footer.top,
    };
  });
  assert(
    bounds.top >= bounds.safeTop - 2 && bounds.bottom <= bounds.safeBottom + 2,
    `${width}px ${label} heading is obscured by sticky modal controls: ${JSON.stringify(bounds)}`,
  );
}

async function checkHomepageFaq(page, width) {
  const faq = page.locator("#homepage-answers");
  await faq.scrollIntoViewIfNeeded();
  const items = faq.locator("details.homepage-answers__item");
  const count = await items.count();
  assert(count === 6, `${width}px expected six homepage FAQ disclosures, found ${count}`);

  for (let index = 0; index < count; index += 1) {
    const item = items.nth(index);
    const summary = item.locator(":scope > summary");
    await summary.scrollIntoViewIfNeeded();
    assert(!(await item.evaluate((element) => element.open)), `${width}px FAQ ${index + 1} did not start closed`);

    const summarySize = await summary.evaluate((element) => {
      const rect = element.getBoundingClientRect();
      return { width: rect.width, height: rect.height };
    });
    assert(
      summarySize.width >= 44 && summarySize.height >= 44,
      `${width}px FAQ ${index + 1} summary is below the 44px tap-target minimum: ${JSON.stringify(summarySize)}`,
    );

    await summary.tap();
    await page.waitForFunction((element) => element.open, await item.elementHandle());
    const answerLink = item.locator(".homepage-answers__answer a");
    const linkSize = await answerLink.evaluate((element) => {
      const rect = element.getBoundingClientRect();
      return { width: rect.width, height: rect.height };
    });
    assert(
      linkSize.width >= 44 && linkSize.height >= 44,
      `${width}px FAQ ${index + 1} answer link is below the 44px tap-target minimum: ${JSON.stringify(linkSize)}`,
    );

    const faqOverflow = await faq.evaluate((section) => ({
      pageWidth: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth),
      sectionWidth: section.clientWidth,
      sectionScrollWidth: section.scrollWidth,
    }));
    assert(
      faqOverflow.pageWidth <= width + PAGE_OVERFLOW_TOLERANCE
      && faqOverflow.sectionScrollWidth <= faqOverflow.sectionWidth + PAGE_OVERFLOW_TOLERANCE,
      `${width}px FAQ ${index + 1} overflows horizontally: ${JSON.stringify(faqOverflow)}`,
    );

    await summary.tap();
    await page.waitForFunction((element) => !element.open, await item.elementHandle());
    await summary.focus();
    await summary.press("Enter");
    await page.waitForFunction((element) => element.open, await item.elementHandle());
    await summary.press("Space");
    await page.waitForFunction((element) => !element.open, await item.elementHandle());
  }
}

async function checkModalInteractiveTargets(page, width) {
  const dialog = page.locator("#credential-sample-dialog");
  const picker = dialog.locator(".credential-readable__layer-picker");
  const pickerSummary = picker.locator(":scope > summary");
  if (width <= 620 && !(await picker.evaluate((element) => element.open))) {
    await pickerSummary.tap();
  }

  const sizes = await dialog.evaluate((element) => {
    const isVisible = (target) => {
      let ancestor = target;
      while (ancestor && ancestor !== element) {
        const style = window.getComputedStyle(ancestor);
        if (ancestor.hidden || style.display === "none" || style.visibility === "hidden") return false;
        ancestor = ancestor.parentElement;
      }
      return ancestor === element && target.getBoundingClientRect().height > 0;
    };
    const collect = (selector) => Array.from(element.querySelectorAll(selector))
      .filter(isVisible)
      .map((target) => ({
        label: target.getAttribute("aria-label")
          || target.textContent.trim().replace(/\s+/g, " ").slice(0, 55),
        height: Number(target.getBoundingClientRect().height.toFixed(2)),
      }));
    return {
      share: collect(".credential-readable__share-shortcut"),
      demo: collect(".credential-modal__demo"),
      specimenSummary: collect(".credential-readable__specimen-summary"),
      pickerSummary: collect(".credential-readable__layer-picker > summary"),
      layerButtons: collect("[data-credential-step-to]"),
      outcomeButtons: collect("[data-credential-outcome]"),
      revisitButtons: collect("[data-credential-revisit]"),
    };
  });
  assert(sizes.share.length === 1, `${width}px expected the modal share shortcut to be visible`);
  assert(sizes.demo.length === 1, `${width}px expected the modal demo link to be visible`);
  assert(sizes.layerButtons.length === 6, `${width}px expected six visible sidebar layer buttons`);
  assert(sizes.outcomeButtons.length === 1, `${width}px expected the institutional outcome button to be visible`);
  assert(
    sizes.revisitButtons.length >= 2,
    `${width}px expected visible revisit buttons after opening layer 3: ${JSON.stringify(sizes.revisitButtons)}`,
  );
  const mobileSummariesExpected = width <= 620 ? 1 : 0;
  assert(
    sizes.specimenSummary.length === mobileSummariesExpected
      && sizes.pickerSummary.length === mobileSummariesExpected,
    `${width}px modal summary visibility does not match the responsive layout: ${JSON.stringify(sizes)}`,
  );
  const shortTarget = Object.entries(sizes).flatMap(([category, targets]) => (
    targets.filter((target) => target.height < 44).map((target) => ({ category, ...target }))
  ))[0];
  assert(
    !shortTarget,
    `${width}px visible modal target is below 44px: ${JSON.stringify(shortTarget)}; all sizes: ${JSON.stringify(sizes)}`,
  );

  const logoSizes = await page.locator(
    "#header .desktoplogo a.logo-black:visible, #header .desktoplogo a.logo-white:visible",
  ).evaluateAll((elements) => elements.map((element) => ({
    label: element.getAttribute("aria-label") || element.href,
    height: Number(element.getBoundingClientRect().height.toFixed(2)),
  })));
  assert(
    logoSizes.every((target) => target.height >= 44),
    `${width}px visible homepage logo link is below 44px: ${JSON.stringify(logoSizes)}`,
  );
  console.log(
    `Measured visible modal/header tap targets at ${width}px: ${JSON.stringify({ ...sizes, logo: logoSizes })}`,
  );
}

async function checkTouchDesktopNestedNavigation(page, width) {
  const featureLink = page.getByRole("link", { name: "Features" });
  const featureItem = page.locator(".wsmenu > .wsmenu-list > li").filter({
    has: featureLink,
  }).first();
  const submenu = featureItem.locator(":scope > .wsmegamenu");
  await featureLink.evaluate((element) => {
    element.addEventListener("click", (event) => event.preventDefault(), { once: true });
  });
  await featureLink.tap();

  await page.waitForFunction((element) => {
    const style = window.getComputedStyle(element);
    return style.display !== "none" && style.visibility !== "hidden" && element.getBoundingClientRect().height > 0;
  }, await submenu.elementHandle(), { timeout: 5_000 });
  const nestedLink = page.getByRole("link", { name: "Platform Overview", exact: true });
  await nestedLink.waitFor({ state: "visible", timeout: 5_000 });
  await page.waitForFunction((element) => element.getBoundingClientRect().height >= 44,
    await nestedLink.elementHandle(), { timeout: 5_000 });
  assert(await nestedLink.isVisible(), `${width}px touch tablet could not reveal a nested desktop navigation link`);
  const targetSize = await nestedLink.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return { width: rect.width, height: rect.height };
  });
  assert(
    targetSize.width >= 44 && targetSize.height >= 44,
    `${width}px touch-tablet nested link is below the 44px tap-target minimum: ${JSON.stringify(targetSize)}`,
  );
  await nestedLink.evaluate((element) => {
    element.addEventListener("click", (event) => {
      event.preventDefault();
      window.__homepageNestedNavTap = true;
    }, { once: true });
  });
  await nestedLink.tap();
  assert(
    await page.evaluate(() => window.__homepageNestedNavTap === true),
    `${width}px touching the revealed nested navigation link did not activate it`,
  );

  const pageWidth = await page.evaluate(() => Math.max(
    document.documentElement.scrollWidth,
    document.body.scrollWidth,
  ));
  assert(
    pageWidth <= width + PAGE_OVERFLOW_TOLERANCE,
    `${width}px desktop touch navigation caused horizontal overflow (${pageWidth}px)`,
  );
}

async function checkViewport(browser, width) {
  const isTabletOrMobile = width <= 991;
  const isTouch = true;
  const height = width === 1024 ? LANDSCAPE_HEIGHT : HEIGHT;
  const context = await browser.newContext({
    viewport: { width, height },
    isMobile: isTabletOrMobile,
    hasTouch: true,
    deviceScaleFactor: 1,
    ignoreHTTPSErrors: true,
  });
  const page = await context.newPage();
  const pageErrors = [];

  page.on("requestfailed", (request) => {
    const parsedUrl = new URL(request.url());
    const failure = {
      width,
      url: `${parsedUrl.origin}${parsedUrl.pathname}`,
      error: request.failure()?.errorText || "unknown",
    };
    browserRequestFailures.push(failure);
  });
  page.on("pageerror", (error) => pageErrors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") {
      browserConsoleErrors.push({ width, text: message.text() });
    }
  });
  await page.route("**/assets4/**", async (route) => {
    const filePath = localAssetPath(route.request().url());
    if (!filePath) {
      await route.continue();
      return;
    }
    await route.fulfill({ path: filePath });
  });

  try {
    await page.goto(`${BASE_URL}/`, { waitUntil: "domcontentloaded", timeout: 30_000 });
    await page.locator("#hero-7 [data-credential-open]").waitFor({ state: "visible" });
    await page.waitForFunction(() => (
      window.jQuery
      && document.querySelector("#wsnavtoggle")
      && document.querySelector("#wsnavtoggle").getAttribute("aria-expanded") === "false"
    ));

    const inputProfile = await page.evaluate(() => ({
      maxTouchPoints: navigator.maxTouchPoints,
      coarsePointer: window.matchMedia("(pointer: coarse)").matches,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
    }));
    assert(
      inputProfile.maxTouchPoints > 0 && inputProfile.coarsePointer,
      `${width}px browser context is not emulating a coarse touch device: ${JSON.stringify(inputProfile)}`,
    );
    if (width === 1024) {
      assert(
        inputProfile.viewportWidth > inputProfile.viewportHeight,
        `1024px touch tablet was not in landscape: ${JSON.stringify(inputProfile)}`,
      );
    }

    const homepageState = await page.evaluate(() => {
      const scriptSources = Array.from(document.scripts)
        .filter((script) => script.src)
        .map((script) => ({
          path: new URL(script.src).pathname,
          defer: script.defer,
        }));
      const matchingScript = (filePath) => scriptSources.filter((script) => script.path === filePath);
      const scriptIndex = (filePath) => scriptSources.findIndex((script) => script.path === filePath);
      const layerSelectors = [
        ".credential-presentation",
        ".credential-standards",
        ".credential-verification",
        ".credential-skill-taxonomy",
        ".credential-learner-record",
        ".credential-workforce-intelligence",
      ];
      return {
        viewportWidth: window.innerWidth,
        documentWidth: Math.max(
          document.documentElement.scrollWidth,
          document.body.scrollWidth,
        ),
        homepageScoped: document.body.classList.contains("homepage-audited"),
        layerCount: layerSelectors.filter((selector) => document.querySelector(selector)).length,
        layerHeadings: layerSelectors.map((selector) => (
          document.querySelector(`${selector} h3`)?.textContent.trim() || ""
        )),
        removedAudienceSectionPresent: !!document.querySelector(".credential-institution-outcomes__audiences"),
        jqueryScripts: matchingScript("/assets4/js/jquery-3.7.0.min.js"),
        bootstrapScripts: matchingScript("/assets4/js/bootstrap.min.js"),
        customScripts: matchingScript("/assets4/js/custom.js"),
        menuScripts: matchingScript("/assets4/js/menu.js"),
        validateScripts: matchingScript("/assets4/js/jquery.validate.min.js"),
        ajaxchimpScripts: matchingScript("/assets4/js/jquery.ajaxchimp.min.js"),
        requestFormScripts: matchingScript("/assets4/js/request-form.js"),
        scriptOrder: {
          jquery: scriptIndex("/assets4/js/jquery-3.7.0.min.js"),
          bootstrap: scriptIndex("/assets4/js/bootstrap.min.js"),
          validate: scriptIndex("/assets4/js/jquery.validate.min.js"),
          ajaxchimp: scriptIndex("/assets4/js/jquery.ajaxchimp.min.js"),
          requestForm: scriptIndex("/assets4/js/request-form.js"),
          custom: scriptIndex("/assets4/js/custom.js"),
        },
        legacyAssets3Scripts: scriptSources.filter((script) => script.path.startsWith("/assets3/js/")),
        jqueryVersion: window.jQuery?.fn?.jquery || "",
      };
    });
    assert(
      homepageState.documentWidth <= width + PAGE_OVERFLOW_TOLERANCE,
      `${width}px homepage horizontal overflow: ${JSON.stringify(homepageState)}`,
    );
    assert(homepageState.homepageScoped, "Homepage-only UX rules lack the homepage-audited body scope");
    assert(homepageState.layerCount === 6, `${width}px homepage did not render all six credential layers`);
    assert(
      homepageState.jqueryScripts.length === 1 && homepageState.jqueryScripts[0].defer,
      `${width}px homepage must load exactly one deferred jQuery: ${JSON.stringify(homepageState.jqueryScripts)}`,
    );
    assert(
      homepageState.bootstrapScripts.length === 1 && homepageState.bootstrapScripts[0].defer,
      `${width}px homepage must load exactly one deferred Bootstrap: ${JSON.stringify(homepageState.bootstrapScripts)}`,
    );
    assert(
      homepageState.menuScripts.length === 1 && homepageState.menuScripts[0].defer,
      `${width}px menu initialization is not a single deferred script: ${JSON.stringify(homepageState.menuScripts)}`,
    );
    assert(
      homepageState.customScripts.length === 1 && homepageState.customScripts[0].defer,
      `${width}px custom.js is not a single deferred script: ${JSON.stringify(homepageState.customScripts)}`,
    );
    assert(
      homepageState.validateScripts.length === 1
      && homepageState.ajaxchimpScripts.length === 1
      && homepageState.requestFormScripts.length === 1
      && homepageState.validateScripts[0].defer
      && homepageState.ajaxchimpScripts[0].defer
      && homepageState.requestFormScripts[0].defer,
      `${width}px form dependencies are not loaded exactly once with defer: ${JSON.stringify(homepageState)}`,
    );
    assert(
      homepageState.scriptOrder.jquery < homepageState.scriptOrder.bootstrap
      && homepageState.scriptOrder.validate < homepageState.scriptOrder.requestForm
      && homepageState.scriptOrder.ajaxchimp < homepageState.scriptOrder.requestForm,
      `${width}px homepage deferred-script dependency order is incorrect: ${JSON.stringify(homepageState.scriptOrder)}`,
    );
    assert(
      homepageState.legacyAssets3Scripts.length === 0,
      `${width}px homepage still includes legacy assets3 scripts: ${JSON.stringify(homepageState.legacyAssets3Scripts)}`,
    );
    assert(
      homepageState.jqueryVersion === "3.7.0",
      `${width}px expected the homepage jQuery 3.7.0 runtime, found "${homepageState.jqueryVersion}"`,
    );
    assert(
      homepageState.layerHeadings.every(Boolean),
      `${width}px a credential layer heading is missing: ${JSON.stringify(homepageState.layerHeadings)}`,
    );
    assert(
      !homepageState.removedAudienceSectionPresent,
      "The removed One connected ecosystem audience section reappeared",
    );

    const opener = page.locator("#hero-7 [data-credential-open]");
    const openerSize = await opener.evaluate((element) => {
      const rect = element.getBoundingClientRect();
      return { width: rect.width, height: rect.height };
    });
    assert(
      openerSize.width >= 44 && openerSize.height >= 44,
      `${width}px sample-credential CTA is below the 44px tap-target minimum: ${JSON.stringify(openerSize)}`,
    );

    if (isTabletOrMobile) {
      const menuToggle = page.locator("#wsnavtoggle");
      const menuSize = await menuToggle.evaluate((element) => {
        const rect = element.getBoundingClientRect();
        return { width: rect.width, height: rect.height };
      });
      assert(
        menuSize.width >= 44 && menuSize.height >= 44,
        `${width}px mobile menu toggle is below the 44px tap-target minimum: ${JSON.stringify(menuSize)}`,
      );
      await menuToggle.tap();
      await page.waitForFunction(() => (
        document.body.classList.contains("wsactive")
        && document.querySelector("#wsnavtoggle").getAttribute("aria-expanded") === "true"
      ));
      const firstNavLink = page.locator(".wsmenu > .wsmenu-list > li > a").first();
      await firstNavLink.waitFor({ state: "visible" });
      assert(await firstNavLink.isVisible(), `${width}px mobile navigation opened without a visible primary link`);
      const solutionsItem = page.locator(".wsmenu > .wsmenu-list > li").filter({
        has: page.getByRole("link", { name: "Solutions" }),
      }).first();
      const submenuToggle = solutionsItem.locator(":scope > .wsmenu-click");
      await submenuToggle.tap();
      const nestedLink = page.getByRole("link", {
        name: "Digital Credential Infrastructure",
        exact: true,
      });
      await nestedLink.waitFor({ state: "visible" });
      const nestedLinkSize = await nestedLink.evaluate((element) => {
        const rect = element.getBoundingClientRect();
        return { width: rect.width, height: rect.height };
      });
      assert(
        nestedLinkSize.width >= 44 && nestedLinkSize.height >= 44,
        `${width}px nested navigation link is below the 44px tap-target minimum: ${JSON.stringify(nestedLinkSize)}`,
      );
      const openMenuWidth = await page.evaluate(() => Math.max(
        document.documentElement.scrollWidth,
        document.body.scrollWidth,
      ));
      assert(
        openMenuWidth <= width + PAGE_OVERFLOW_TOLERANCE,
        `${width}px opening the nested mobile navigation caused horizontal overflow (${openMenuWidth}px)`,
      );
      await Promise.all([
        page.waitForNavigation({ waitUntil: "domcontentloaded" }),
        nestedLink.tap(),
      ]);
      await page.waitForFunction(() => (
        window.jQuery
        && document.querySelector("#wsnavtoggle")?.getAttribute("aria-expanded") === "false"
      ));
      await menuToggle.tap();
      await page.waitForFunction(() => (
        document.body.classList.contains("wsactive")
        && document.querySelector("#wsnavtoggle").getAttribute("aria-expanded") === "true"
      ));
      await menuToggle.tap();
      await page.waitForFunction(() => (
        !document.body.classList.contains("wsactive")
        && document.querySelector("#wsnavtoggle").getAttribute("aria-expanded") === "false"
      ));
    } else {
      await checkTouchDesktopNestedNavigation(page, width);
    }

    await opener.tap();
    const dialog = page.locator("#credential-sample-dialog");
    await dialog.waitFor({ state: "visible" });
    await page.locator("#credential-sample-dialog [data-credential-stage='0'] h3").waitFor({ state: "visible" });
    assert(
      await page.locator("#credential-sample-dialog [data-credential-stage]:not([hidden])").count() === 1,
      `${width}px opening the sample did not reveal exactly one walkthrough stage`,
    );
    await assertStageReadingVisible(page, 0, width, "opening stage");

    if (isTouch) {
      const controlSizes = await page.locator(
        "#credential-sample-dialog .credential-modal__close, " +
        "#credential-sample-dialog [data-credential-pause], " +
        "#credential-sample-dialog [data-credential-prev], " +
        "#credential-sample-dialog [data-credential-forward]",
      ).evaluateAll((elements) => elements.map((element) => {
        const rect = element.getBoundingClientRect();
        return {
          label: element.getAttribute("aria-label") || element.textContent.trim(),
          width: rect.width,
          height: rect.height,
        };
      }));
      const smallControl = controlSizes.find((target) => target.width < 44 || target.height < 44);
      assert(
        !smallControl,
        `${width}px walkthrough control is below the 44px tap-target minimum: ${JSON.stringify(smallControl)}`,
      );
    }

    const dialogOverflow = await page.evaluate(() => {
      const panel = document.querySelector("#credential-sample-dialog .credential-modal__panel");
      const pageWidth = Math.max(document.documentElement.scrollWidth, document.body.scrollWidth);
      return {
        pageWidth,
        viewportWidth: window.innerWidth,
        panelWidth: panel.clientWidth,
        panelScrollWidth: panel.scrollWidth,
      };
    });
    assert(
      dialogOverflow.pageWidth <= width + PAGE_OVERFLOW_TOLERANCE
      && dialogOverflow.panelScrollWidth <= dialogOverflow.panelWidth + PAGE_OVERFLOW_TOLERANCE,
      `${width}px sample dialog content overflows horizontally: ${JSON.stringify(dialogOverflow)}`,
    );

    await page.locator("#credential-sample-dialog [data-credential-forward]").tap();
    await page.waitForFunction(() => (
      document.querySelector("#credential-sample-dialog [data-active-step]")?.getAttribute("data-active-step") === "1"
    ));
    assert(
      await page.locator("#credential-sample-dialog [data-credential-stage='1'] h3").isVisible(),
      `${width}px Next did not show the second stage heading`,
    );
    await assertStageReadingVisible(page, 1, width, "next stage");

    if (width <= 620) {
      const layerPicker = page.locator("#credential-sample-dialog .credential-readable__layer-picker");
      const pickerSummary = layerPicker.locator(":scope > summary");
      await pickerSummary.tap();
      const layerButton = page.locator("#credential-sample-dialog [data-credential-step-to='2']");
      await layerButton.tap();
      await page.waitForFunction(() => (
        document.querySelector("#credential-sample-dialog [data-active-step]")?.getAttribute("data-active-step") === "2"
      ));
      assert(
        await pickerSummary.evaluate((element) => document.activeElement === element),
        `${width}px layer selection should return focus to the layer-picker summary`,
      );
    } else {
      const layerButton = page.locator("#credential-sample-dialog [data-credential-step-to='2']");
      await layerButton.tap();
      await page.waitForFunction(() => (
        document.querySelector("#credential-sample-dialog [data-active-step]")?.getAttribute("data-active-step") === "2"
      ));
      assert(
        await layerButton.evaluate((element) => document.activeElement === element),
        `${width}px layer selection should preserve focus on the selected layer button`,
      );
    }
    await assertStageReadingVisible(page, 2, width, "selected layer");
    await checkModalInteractiveTargets(page, width);

    const revisit = page.locator("#credential-sample-dialog [data-credential-revisit='0']").first();
    await revisit.tap();
    await page.waitForFunction(() => (
      document.querySelector("#credential-sample-dialog [data-active-step]")?.getAttribute("data-active-step") === "0"
    ));
    assert(
      await page.locator("#credential-sample-dialog [data-credential-stage='0'] h3")
        .evaluate((heading) => document.activeElement === heading),
      `${width}px revisiting a layer should move focus to that stage heading`,
    );
    await assertStageReadingVisible(page, 0, width, "revisited stage");

    await page.locator("#credential-sample-dialog [data-credential-forward]").tap();
    await page.waitForFunction(() => (
      document.querySelector("#credential-sample-dialog [data-active-step]")?.getAttribute("data-active-step") === "1"
    ));
    await page.locator("#credential-sample-dialog .credential-modal__close").tap();
    await page.waitForFunction(() => document.querySelector("#credential-sample-dialog").hidden);
    assert(
      await opener.evaluate((element) => document.activeElement === element),
      `${width}px closing the walkthrough should return focus to its opener`,
    );

    await checkHomepageFaq(page, width);
    assert(pageErrors.length === 0, `${width}px browser JavaScript errors: ${pageErrors.join("; ")}`);
    const appRuntimeErrors = browserConsoleErrors.filter(({ width: errorWidth, text }) => (
      errorWidth === width && /custom\.js|\/assets4\/js\/|Uncaught|TypeError|ReferenceError|SyntaxError/i.test(text)
    ));
    assert(
      appRuntimeErrors.length === 0,
      `${width}px homepage runtime/asset console errors: ${JSON.stringify(appRuntimeErrors)}`,
    );
    console.log(
      `Passed homepage at ${width}x${height}px: touch navigation, CTA, six layers, modal focus/scroll, FAQ touch/keyboard and overflow.`,
    );
  } finally {
    await context.close();
  }
}

async function main() {
  await verifyServedAssets();
  process.env.XDG_CACHE_HOME = process.env.XDG_CACHE_HOME || "/tmp/certifyme-homepage-chromium-cache";
  process.env.XDG_CONFIG_HOME = process.env.XDG_CONFIG_HOME || "/tmp/certifyme-homepage-chromium-config";

  const executablePath = process.env.CHROMIUM_PATH
    || execFileSync("which", ["chromium"], { encoding: "utf8" }).trim();
  const browser = await chromium.launch({
    headless: true,
    executablePath,
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
  });
  try {
    for (const width of WIDTHS) {
      await checkViewport(browser, width);
    }
  } finally {
    await browser.close();
  }

  if (browserRequestFailures.length) {
    console.log(
      `Captured ${browserRequestFailures.length} failed browser request(s), grouped by origin/path:`
      + ` ${JSON.stringify(summarizeRequestFailures())}`,
    );
  } else {
    console.log("No browser requests failed.");
  }
  const runtimeConsoleErrors = browserConsoleErrors.filter(({ text }) => (
    /custom\.js|\/assets4\/js\/|Uncaught|TypeError|ReferenceError|SyntaxError/i.test(text)
  ));
  assert(
    runtimeConsoleErrors.length === 0,
    `Homepage emitted runtime/asset console errors: ${JSON.stringify(runtimeConsoleErrors)}`,
  );
  console.log("No homepage runtime errors; local homepage assets were fulfilled from source after server-byte equality checks.");
  console.log(`Homepage mobile/tablet regression checks passed at ${WIDTHS.join(", ")}px.`);
}

main().catch((error) => {
  console.error(`\nHomepage mobile/tablet validation failed: ${error.stack || error.message}`);
  if (browserRequestFailures.length) {
    console.error(`Captured failed browser requests: ${JSON.stringify(summarizeRequestFailures())}`);
  }
  process.exitCode = 1;
});