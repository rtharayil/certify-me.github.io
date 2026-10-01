#!/usr/bin/env node

const { execFileSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require("playwright");

const BASE_URL = (process.env.WALKTHROUGH_URL || "http://127.0.0.1:5000").replace(/\/$/, "");
const SCREENSHOT_DIR = "/tmp/credential-walkthrough";
const DEMO_URL = new URL("https://info.certifyme.online/request-demo");
const TIMEOUT_MS = 15_000;

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function browserExecutable() {
  if (process.env.CHROMIUM_PATH) return process.env.CHROMIUM_PATH;
  try {
    return execFileSync("which", ["chromium"], { encoding: "utf8" }).trim();
  } catch {
    throw new Error("Chromium was not found; set CHROMIUM_PATH or install system Chromium.");
  }
}

function trackClientErrors(page, clientErrors) {
  page.on("pageerror", (error) => {
    clientErrors.push(`${page.url()}: ${error.message}`);
  });
}

async function openDialog(page) {
  const dialog = page.locator("#credential-sample-dialog, [role='dialog']").first();
  const opener = page.locator("[data-credential-open]").first();
  assert(await dialog.count(), "Credential walkthrough dialog was not found.");
  assert(await opener.count(), "Homepage credential walkthrough opener [data-credential-open] was not found.");
  await opener.click();
  await dialog.waitFor({ state: "visible", timeout: TIMEOUT_MS });
  return { dialog, opener };
}

async function activeStageIndex(stages) {
  return stages.evaluateAll((elements) => {
    const active = elements
      .map((element, index) => ({ element, index }))
      .filter(({ element }) => !element.hidden && getComputedStyle(element).display !== "none");
    return active.length === 1 ? active[0].index : -1;
  });
}

async function waitForStage(page, stages, index) {
  const deadline = Date.now() + TIMEOUT_MS;
  while (Date.now() < deadline) {
    if (await activeStageIndex(stages) === index) return;
    await page.waitForTimeout(50);
  }
  throw new Error(`Expected walkthrough stage ${index + 1} to be active.`);
}

async function assertCurrentStage(stages, index) {
  const active = await activeStageIndex(stages);
  assert(active === index, `Expected walkthrough stage ${index + 1}; active stage was ${active + 1}.`);
}

async function assertPaused(dialog, message) {
  const state = await pauseState(dialog);
  const paused = isPaused(state);
  assert(paused, `${message} Walkthrough pause state was ${JSON.stringify(state)}.`);
}

async function pauseState(dialog) {
  return dialog.evaluate((element) => {
    const pause = element.querySelector("[data-credential-pause]");
    const pace = element.querySelector("[data-credential-pace]");
    const filmline = element.querySelector("[data-credential-filmline]");
    return {
      ariaLabel: pause && pause.getAttribute("aria-label"),
      pauseText: pause && pause.textContent,
      paceText: pace && pace.textContent,
      pausedClass: element.classList.contains("is-paused"),
      animationState: filmline && getComputedStyle(filmline).animationPlayState,
    };
  });
}

function isPaused(state) {
  return state.ariaLabel === "Play walkthrough"
    || /\bplay\b/i.test(state.pauseText || "")
    || /\bpaused\b/i.test(state.paceText || "")
    || state.pausedClass
    || state.animationState === "paused";
}

async function assertPlaying(dialog, message) {
  const state = await pauseState(dialog);
  assert(!isPaused(state), `${message} Walkthrough was already paused: ${JSON.stringify(state)}.`);
}

async function waitForPaused(page, dialog, message) {
  const deadline = Date.now() + TIMEOUT_MS;
  let state;
  while (Date.now() < deadline) {
    state = await pauseState(dialog);
    if (isPaused(state)) return;
    await page.waitForTimeout(50);
  }
  throw new Error(`${message} Walkthrough did not pause: ${JSON.stringify(state)}.`);
}

async function assertNoHorizontalOverflow(page, dialog, label) {
  const dimensions = await page.evaluate((dialogElement) => {
    const panel = dialogElement.querySelector(".credential-modal__panel");
    const stages = Array.from(dialogElement.querySelectorAll("[data-credential-stage]"));
    const activeStage = stages.find((stage) => !stage.hidden);
    const measure = (element) => element && ({
      clientWidth: element.clientWidth,
      scrollWidth: element.scrollWidth,
    });
    return {
      viewport: window.innerWidth,
      document: document.documentElement.scrollWidth,
      dialog: measure(dialogElement),
      panel: measure(panel),
      stage: measure(activeStage),
    };
  }, await dialog.elementHandle());

  const overflowing = Object.entries(dimensions)
    .filter(([key, value]) => key !== "viewport" && key !== "document" && value)
    .find(([, value]) => value.scrollWidth > value.clientWidth + 1);
  assert(
    dimensions.document <= dimensions.viewport + 1 && !overflowing,
    `${label}: horizontal overflow detected: ${JSON.stringify(dimensions)}.`,
  );
}

async function assertCumulativeReveals(dialog, stageIndex) {
  const result = await dialog.locator("[data-reveal-index]").evaluateAll((layers) => layers.map((layer) => ({
    index: Number(layer.getAttribute("data-reveal-index")),
    visible: !layer.hidden && getComputedStyle(layer).display !== "none",
  })));
  assert(result.length === 7, `Expected seven progressively revealed ecosystem layers; found ${result.length}.`);
  const visibleIndices = result.filter((layer) => layer.visible).map((layer) => layer.index);
  const expectedIndices = Array.from({ length: stageIndex }, (_, index) => index + 1);
  assert(
    JSON.stringify(visibleIndices) === JSON.stringify(expectedIndices),
    `Stage ${stageIndex + 1} should retain cumulative reveal layers ${JSON.stringify(expectedIndices)}; got ${JSON.stringify(visibleIndices)}.`,
  );
}

async function assertCurrentRevealInModalViewport(dialog, stageIndex) {
  if (stageIndex === 0) return;
  const result = await dialog.evaluate((element, index) => {
    const panel = element.querySelector(".credential-modal__panel");
    const layer = element.querySelector(`[data-reveal-index="${index}"]`);
    if (!panel || !layer) return null;
    const panelRect = panel.getBoundingClientRect();
    const layerRect = layer.getBoundingClientRect();
    const header = element.querySelector(".credential-modal__header");
    const footer = element.querySelector(".credential-modal__footer");
    const headerRect = header && header.getBoundingClientRect();
    const footerRect = footer && footer.getBoundingClientRect();
    const visibleTop = Math.max(panelRect.top, headerRect ? headerRect.bottom : 0, 0);
    const visibleBottom = Math.min(
      panelRect.bottom,
      footerRect ? footerRect.top : window.innerHeight,
      window.innerHeight,
    );
    const visibleLeft = Math.max(panelRect.left, 0);
    const visibleRight = Math.min(panelRect.right, window.innerWidth);
    return {
      hidden: layer.hidden || getComputedStyle(layer).display === "none",
      layer: { top: layerRect.top, bottom: layerRect.bottom, left: layerRect.left, right: layerRect.right },
      visibleHeight: Math.max(0, Math.min(layerRect.bottom, visibleBottom) - Math.max(layerRect.top, visibleTop)),
      visibleWidth: Math.max(0, Math.min(layerRect.right, visibleRight) - Math.max(layerRect.left, visibleLeft)),
    };
  }, stageIndex);
  assert(
    result && !result.hidden && result.visibleHeight >= 40 && result.visibleWidth >= 40,
    `Current revealed layer ${stageIndex} is not meaningfully visible in the modal viewport: ${JSON.stringify(result)}.`,
  );
}

async function assertStageThreeQualifier(dialog) {
  const text = await dialog.locator("[data-credential-stage]").nth(2).innerText();
  assert(
    /\billustrat(?:ive|ion)\b|\bexample\b/i.test(text)
      && /\bunverified\b|\bnot\s+(?:been\s+)?(?:independently\s+)?verified\b/i.test(text),
    `Active stage 3 must locally qualify its skills as illustrative and unverified; got: ${text.replace(/\s+/g, " ").trim()}`,
  );
}

async function assertTabTrap(page, dialog) {
  const focusEdge = async (edge) => dialog.evaluate((element, which) => {
    const focusables = Array.from(element.querySelectorAll(
      'button:not([disabled]), a[href], summary, input, [tabindex="0"]',
    )).filter((item) => !item.closest("[hidden]") && item.getClientRects().length > 0);
    const target = which === "last" ? focusables[focusables.length - 1] : focusables[0];
    if (!target) return false;
    target.focus();
    return document.activeElement === target;
  }, edge);
  const isFocusedAtEdge = async (edge) => dialog.evaluate((element, which) => {
    const focusables = Array.from(element.querySelectorAll(
      'button:not([disabled]), a[href], summary, input, [tabindex="0"]',
    )).filter((item) => !item.closest("[hidden]") && item.getClientRects().length > 0);
    return document.activeElement === (which === "last" ? focusables[focusables.length - 1] : focusables[0]);
  }, edge);

  assert(await focusEdge("first"), "Could not focus the first modal control for the Tab-trap check.");
  await page.keyboard.press("Shift+Tab");
  assert(await isFocusedAtEdge("last"), "Shift+Tab from the first modal control escaped the dialog.");
  await page.keyboard.press("Tab");
  assert(await isFocusedAtEdge("first"), "Tab from the last modal control escaped the dialog.");
  assert(await focusEdge("last"), "Could not focus the last modal control for the Tab-trap check.");
  await page.keyboard.press("Tab");
  assert(await isFocusedAtEdge("first"), "Tab from the last modal control did not wrap to the first.");
  await page.keyboard.press("Shift+Tab");
  assert(await isFocusedAtEdge("last"), "Shift+Tab from the first modal control did not wrap to the last.");
}

async function assertFocusWithinDialog(dialog, message) {
  const focusedInside = await dialog.evaluate((element) => element.contains(document.activeElement));
  assert(focusedInside, message);
}

function labelCategory(text) {
  const categories = [
    { index: 3, pattern: /\btaxonom(?:y|ies)\b|\bclassification\b|\bframeworks?\b|\bvocabular(?:y|ies)\b|\bmappings?\b|\bstandards?\b/i },
    { index: 7, pattern: /\binstitution(?:al)?\b|\buniversity\b|\bissuer\b|\bcampus\b/i },
    { index: 5, pattern: /\bworkforce\b|\bemploy(?:er|ment)\b|\bjobs?\b|\bvacanc(?:y|ies)\b|\blabou?r market\b|\bhiring\b|\bworkplace\b/i },
    { index: 6, pattern: /\bcareer\b|\bpathways?\b|\bprogression\b|\bfuture learning\b|\bnext steps?\b/i },
    { index: 4, pattern: /\blearner\b|\bstudent\b|\btranscript\b|\bidentity\b|\bpersonal record\b|\blearning record\b/i },
    { index: 2, pattern: /\bskills?\b|\bcompetenc(?:y|ies)\b|\bcapabilit(?:y|ies)\b|\bproficienc(?:y|ies)\b/i },
    { index: 1, pattern: /\bverif(?:y|ies|ication)\b|\bauthentic(?:ity)?\b|\bproof\b|\btrust\b|\bassurance\b|\bsecurity\b/i },
    { index: 0, pattern: /\bcredential\b|\baward\b|\bcertificate\b|\bqualification\b|\bissuance\b/i },
  ];
  const match = categories.find((category) => category.pattern.test(text));
  return match ? match.index : -1;
}

async function assertEightOrderedStages(dialog) {
  const steps = dialog.locator("[data-credential-step-to]");
  const stages = dialog.locator("[data-credential-stage]");
  assert(await steps.count() === 8, `Expected eight direct-step buttons; found ${await steps.count()}.`);
  const nonButtons = await steps.evaluateAll((elements) => elements.filter(
    (element) => element.tagName !== "BUTTON",
  ).length);
  assert(nonButtons === 0, "Direct-step navigation must use buttons.");
  assert(await stages.count() === 8, `Expected eight staged panels; found ${await stages.count()}.`);

  const labels = await steps.evaluateAll((buttons, stageSelector) => {
    const panels = Array.from(document.querySelectorAll(stageSelector));
    return buttons.map((button, index) => {
      const panel = panels[index];
      const label = `${button.innerText || ""} ${button.getAttribute("aria-label") || ""}`;
      const headings = panel
        ? Array.from(panel.querySelectorAll("h1, h2, h3, h4, h5, [aria-label]"))
          .map((heading) => `${heading.textContent || ""} ${heading.getAttribute("aria-label") || ""}`)
          .join(" ")
        : "";
      return { label, headings, text: panel ? panel.textContent || "" : "" };
    });
  }, "[data-credential-stage]");
  const categories = labels.map(({ label, headings, text }) => (
    labelCategory(label) >= 0
      ? labelCategory(label)
      : labelCategory(headings) >= 0
        ? labelCategory(headings)
        : labelCategory(text)
  ));
  const expected = [0, 1, 2, 3, 4, 5, 6, 7];
  assert(
    categories.every((category, index) => category === expected[index]),
    `Walkthrough stages must follow Credential, Verification, Skills, Taxonomy, Learner Record, Workforce, Career, Institutional; got ${JSON.stringify(categories.map((category, index) => category < 0 ? labels[index].label.trim().replace(/\s+/g, " ").slice(0, 75) : category + 1))}.`,
  );
  return { steps, stages };
}

async function assertNoFileInputsOrLiveJobs(dialog) {
  const result = await dialog.evaluate((element) => {
    const fileInputs = Array.from(element.querySelectorAll('input[type="file"]')).map((input) => ({
      accept: input.getAttribute("accept"),
      ariaLabel: input.getAttribute("aria-label"),
    }));
    const text = (element.innerText || "").replace(/\s+/g, " ");
    const liveClaims = [];
    const liveClaimPattern = /\b(live|current|real[- ]time)\s+(jobs?|vacanc(?:y|ies)|openings?|positions?|roles?|listings?)\b/ig;
    let match;
    while ((match = liveClaimPattern.exec(text))) {
      const context = text.slice(Math.max(0, match.index - 32), match.index).toLowerCase();
      if (!/(?:not|no|never|isn't|aren't|without)\s+(?:a(?:ny)?\s+)?$/.test(context)) {
        liveClaims.push(match[0]);
      }
    }
    if (/\b(?:actively hiring|currently hiring|open positions now)\b/i.test(text)) {
      liveClaims.push("active hiring claim");
    }
    return {
      fileInputs,
      hasFictionalDisclaimer: /\bfictional\b|\bfiction\b/i.test(text),
      liveClaims,
    };
  });

  assert(result.fileInputs.length === 0, `Walkthrough must not include PDF/JSON file inputs: ${JSON.stringify(result.fileInputs)}.`);
  assert(result.hasFictionalDisclaimer, "Walkthrough is missing a clear fictional-example disclaimer.");
  assert(result.liveClaims.length === 0, `Walkthrough makes a live-jobs claim: ${result.liveClaims.join(", ")}.`);
}

async function assertVisibleNavigation(dialog) {
  const close = dialog.locator("button[data-credential-close]").first();
  const directSteps = dialog.locator("[data-credential-step-to]");
  assert(await close.isVisible(), "Walkthrough close button is not visible.");
  assert(await directSteps.first().isVisible(), "Walkthrough direct-step navigation is not visible.");
  for (const selector of ["[data-credential-pause]", "[data-credential-prev]", "[data-credential-forward]"]) {
    assert(await dialog.locator(selector).first().isVisible(), `Walkthrough control ${selector} is not visible.`);
  }
}

async function assertCertificateLoaded(page, dialog) {
  const deadline = Date.now() + TIMEOUT_MS;
  while (Date.now() < deadline) {
    const loaded = await dialog.locator("img").evaluateAll((images) => images.some((img) => {
      const description = `${img.getAttribute("alt") || ""} ${img.getAttribute("src") || ""}`;
      const certificateLike = /certificate|credential|diploma|award/i.test(description)
        || (img.naturalWidth >= 300 && img.naturalHeight >= 180);
      return certificateLike && img.complete && img.naturalWidth > 0 && img.naturalHeight > 0;
    }));
    if (loaded) return;
    await page.waitForTimeout(100);
  }
  throw new Error("No loaded certificate/credential image was found in the walkthrough.");
}

async function captureStage(page, dialog, stages, index, filename) {
  const steps = dialog.locator("[data-credential-step-to]");
  await steps.nth(index).click();
  await waitForStage(page, stages, index);
  await settleAndAssertStage(page, dialog, index);
  await assertNoHorizontalOverflow(page, dialog, filename);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, filename) });
}

async function settleAndAssertStage(page, dialog, stageIndex) {
  await page.waitForTimeout(450);
  await assertCumulativeReveals(dialog, stageIndex);
  await assertCurrentRevealInModalViewport(dialog, stageIndex);
  if (stageIndex === 2) await assertStageThreeQualifier(dialog);
}

async function verifyDemoCta(dialog) {
  const candidates = await dialog.locator("a[href]").evaluateAll((links) => links
    .map((link) => ({
      text: (link.innerText || link.getAttribute("aria-label") || "").replace(/\s+/g, " ").trim(),
      href: link.href,
    }))
    .filter((link) => /demo|institution|book|request/i.test(link.text)));
  const matching = candidates.find((link) => {
    try {
      const url = new URL(link.href);
      return url.origin === "https://info.certifyme.online"
        && url.pathname.replace(/\/$/, "") === "/request-demo";
    } catch {
      return false;
    }
  });
  assert(matching, `Could not resolve the existing demo CTA URL (${DEMO_URL.href}); found ${JSON.stringify(candidates)}.`);
}

async function validateDesktop(browser, clientErrors) {
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();
  trackClientErrors(page, clientErrors);

  try {
    await page.goto(BASE_URL, { waitUntil: "domcontentloaded", timeout: TIMEOUT_MS });
    const initialOverflow = await page.evaluate(() => document.body.style.overflow);
    const { dialog, opener } = await openDialog(page);
    const { steps, stages } = await assertEightOrderedStages(dialog);
    await assertVisibleNavigation(dialog);
    await assertNoFileInputsOrLiveJobs(dialog);
    await assertCertificateLoaded(page, dialog);
    await assertNoHorizontalOverflow(page, dialog, "desktop 1280px");

    await assertPlaying(dialog, "A fresh open should still be autoplaying before footer focus.");
    await page.keyboard.press("Shift+Tab");
    const focusedFooterCta = await dialog.evaluate((element) => {
      const cta = element.querySelector(".credential-modal__footer a[href]");
      return Boolean(cta && document.activeElement === cta);
    });
    assert(focusedFooterCta, "Shift+Tab from the initial Close button did not wrap to the footer/demo CTA.");
    await assertPaused(dialog, "Focusing the footer CTA should pause autoplay.");
    await assertTabTrap(page, dialog);

    await steps.nth(0).click();
    await waitForStage(page, stages, 0);
    await assertPaused(dialog, "Direct-step interaction should pause autoplay.");
    await settleAndAssertStage(page, dialog, 0);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "desktop-stage-1.png") });

    await dialog.locator("[data-credential-forward]").click();
    await waitForStage(page, stages, 1);
    await settleAndAssertStage(page, dialog, 1);
    await dialog.locator("[data-credential-prev]").focus();
    await page.keyboard.press("Enter");
    await waitForStage(page, stages, 0);
    await assertFocusWithinDialog(dialog, "Enter on Back from stage 2 to stage 1 moved focus outside the dialog.");
    await page.keyboard.press("Tab");
    await assertFocusWithinDialog(dialog, "Tab after Enter on Back escaped the dialog.");
    await assertCumulativeReveals(dialog, 0);

    const stageScreenshots = new Map([
      [2, "desktop-stage-3.png"],
      [4, "desktop-stage-5.png"],
      [5, "desktop-stage-6.png"],
      [7, "desktop-stage-8.png"],
    ]);
    for (let stageIndex = 1; stageIndex < 8; stageIndex += 1) {
      await dialog.locator("[data-credential-forward]").click();
      await waitForStage(page, stages, stageIndex);
      await settleAndAssertStage(page, dialog, stageIndex);
      const filename = stageScreenshots.get(stageIndex);
      if (filename) {
        await assertNoHorizontalOverflow(page, dialog, filename);
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, filename) });
      }
    }
    await verifyDemoCta(dialog);

    await page.keyboard.press("Escape");
    await dialog.waitFor({ state: "hidden", timeout: TIMEOUT_MS });
    const escapeResult = await page.evaluate(() => ({
      focusIsOpener: document.activeElement?.matches("[data-credential-open]") || false,
      overflow: document.body.style.overflow,
    }));
    assert(escapeResult.focusIsOpener, "Escape did not restore focus to the homepage opener.");
    assert(escapeResult.overflow === initialOverflow, "Escape did not restore the page's original body overflow.");

    await opener.click();
    await dialog.waitFor({ state: "visible", timeout: TIMEOUT_MS });
    await dialog.locator("button[data-credential-close]").click();
    await dialog.waitFor({ state: "hidden", timeout: TIMEOUT_MS });
    const closeResult = await page.evaluate(() => ({
      focusIsOpener: document.activeElement?.matches("[data-credential-open]") || false,
      overflow: document.body.style.overflow,
    }));
    assert(closeResult.focusIsOpener, "Close button did not restore focus to the homepage opener.");
    assert(closeResult.overflow === initialOverflow, "Close button did not restore the page's original body overflow.");
  } finally {
    await context.close();
  }
}

async function validateShortDesktop(browser, clientErrors) {
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();
  trackClientErrors(page, clientErrors);

  try {
    await page.goto(BASE_URL, { waitUntil: "domcontentloaded", timeout: TIMEOUT_MS });
    const { dialog } = await openDialog(page);
    const stages = dialog.locator("[data-credential-stage]");
    await dialog.locator("[data-credential-step-to]").nth(2).click();
    await waitForStage(page, stages, 2);
    await settleAndAssertStage(page, dialog, 2);
    await assertNoHorizontalOverflow(page, dialog, "desktop 1280x720");
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "desktop-720-stage-3.png") });
  } finally {
    await context.close();
  }
}

async function validateMobile(browser, clientErrors) {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();
  trackClientErrors(page, clientErrors);

  try {
    await page.goto(BASE_URL, { waitUntil: "domcontentloaded", timeout: TIMEOUT_MS });
    const { dialog } = await openDialog(page);
    const { stages } = await assertEightOrderedStages(dialog);
    await assertVisibleNavigation(dialog);
    await assertNoFileInputsOrLiveJobs(dialog);
    await assertCertificateLoaded(page, dialog);
    await assertNoHorizontalOverflow(page, dialog, "mobile 390px");
    await captureStage(page, dialog, stages, 4, "mobile-stage-5.png");
    await captureStage(page, dialog, stages, 7, "mobile-stage-8.png");

    await page.setViewportSize({ width: 320, height: 844 });
    await assertNoHorizontalOverflow(page, dialog, "narrow 320px");
    await assertVisibleNavigation(dialog);
    await dialog.locator("[data-credential-step-to]").nth(4).click();
    await waitForStage(page, stages, 4);
    await assertNoHorizontalOverflow(page, dialog, "narrow 320px stage 5");
    await dialog.locator("button[data-credential-close]").click();
    await dialog.waitFor({ state: "hidden", timeout: TIMEOUT_MS });
  } finally {
    await context.close();
  }
}

async function validateShareUrlAndReducedMotion(browser, clientErrors) {
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    reducedMotion: "reduce",
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();
  trackClientErrors(page, clientErrors);
  const storyUrl = new URL(BASE_URL);
  storyUrl.searchParams.set("story", "certificate");

  try {
    await page.goto(storyUrl.href, { waitUntil: "domcontentloaded", timeout: TIMEOUT_MS });
    const dialog = page.locator("#credential-sample-dialog, [role='dialog']").first();
    await dialog.waitFor({ state: "visible", timeout: TIMEOUT_MS });
    const { stages } = await assertEightOrderedStages(dialog);
    await waitForStage(page, stages, 0);
    await assertPaused(dialog, "Reduced-motion preference should open the walkthrough paused.");
    await dialog.locator("[data-credential-step-to]").nth(2).click();
    await waitForStage(page, stages, 2);
    await assertPaused(dialog, "Interaction under reduced motion should remain paused.");
  } finally {
    await context.close();
  }
}

async function validateMotionPreferenceChange(browser, clientErrors) {
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();
  trackClientErrors(page, clientErrors);

  try {
    await page.goto(BASE_URL, { waitUntil: "domcontentloaded", timeout: TIMEOUT_MS });
    const initialPreference = await page.evaluate(
      () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    );
    assert(!initialPreference, "Motion-change test expected the browser's initial preference to be no-preference.");
    const { dialog } = await openDialog(page);
    await assertPlaying(dialog, "Walkthrough should autoplay before the preference changes.");

    await page.emulateMedia({ reducedMotion: "reduce" });
    const reducedPreference = await page.evaluate(
      () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    );
    assert(reducedPreference, "Playwright did not apply the reduced-motion preference change.");
    await waitForPaused(page, dialog, "Changing to reduced motion mid-play should pause autoplay.");
  } finally {
    await context.close();
  }
}

async function validateFinalAutoplayLoop(browser, clientErrors) {
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();
  trackClientErrors(page, clientErrors);

  try {
    await page.clock.install({ time: new Date("2026-01-01T00:00:00Z") });
    await page.goto(BASE_URL, { waitUntil: "domcontentloaded", timeout: TIMEOUT_MS });
    const { dialog } = await openDialog(page);
    const stages = dialog.locator("[data-credential-stage]");
    await assertPlaying(dialog, "Autoplay-loop test should begin in the playing state.");

    await page.clock.runFor(2_600);
    await assertCurrentStage(stages, 1);
    for (let stageIndex = 2; stageIndex < 8; stageIndex += 1) {
      await page.clock.runFor(6_800);
      await assertCurrentStage(stages, stageIndex);
    }
    await page.clock.runFor(6_800);
    await assertCurrentStage(stages, 0);
    await assertPlaying(dialog, "Autoplay should loop from the final stage to the first.");

    await dialog.locator("[data-credential-step-to]").nth(2).click();
    await assertCurrentStage(stages, 2);
    await assertPaused(dialog, "A user interaction should stop the autoplay loop.");
    await page.clock.runFor(68_000);
    await assertCurrentStage(stages, 2);
    await assertPaused(dialog, "Autoplay advanced after the user took control.");
  } finally {
    await context.close();
  }
}

async function main() {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  const clientErrors = [];
  const browser = await chromium.launch({ headless: true, executablePath: browserExecutable() });

  try {
    await validateDesktop(browser, clientErrors);
    await validateShortDesktop(browser, clientErrors);
    await validateMobile(browser, clientErrors);
    await validateShareUrlAndReducedMotion(browser, clientErrors);
    await validateMotionPreferenceChange(browser, clientErrors);
    await validateFinalAutoplayLoop(browser, clientErrors);
  } finally {
    await browser.close();
  }

  assert(clientErrors.length === 0, `Client JavaScript errors detected:\n${clientErrors.join("\n")}`);
  console.log("Credential walkthrough validation passed: responsive layout, progressive reveals, navigation/focus, motion preferences, autoplay loop, and share URL.");
  console.log(`Screenshots saved to ${SCREENSHOT_DIR}.`);
}

main().catch((error) => {
  console.error(`Credential walkthrough validation failed: ${error.message}`);
  process.exitCode = 1;
});