#!/usr/bin/env node

const { execFileSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require("playwright");

const BASE_URL = (process.env.WALKTHROUGH_URL || "http://127.0.0.1:5000").replace(/\/$/, "");
const SCREENSHOT_DIR = "/tmp/credential-walkthrough";
const DEMO_URL = new URL("https://info.certifyme.online/request-demo");
const TIMEOUT_MS = 15_000;
const EXPECTED_DWELL_MS = [10400, 12000, 17600, 12000, 12000, 12800, 12800];
const TOUCH_SESSIONS = new WeakMap();

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
  await assertCurrentStage(dialog.locator("[data-credential-stage]"), 0);
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

async function isMobileLayout(dialog) {
  return dialog.evaluate(() => window.matchMedia(
    "(max-width: 620px), (max-width: 950px) and (max-height: 500px) and (pointer: coarse)",
  ).matches);
}

async function assertCoarsePointer(page, label) {
  const coarse = await page.evaluate(() => window.matchMedia("(pointer: coarse)").matches);
  assert(coarse, `${label}: mobile controls require an emulated coarse-pointer touch device.`);
}

async function assertCurrentStage(stages, index) {
  const active = await activeStageIndex(stages);
  assert(active === index, `Expected walkthrough panel ${index + 1}; active panel was ${active + 1}.`);
}

async function nearestDetails(control) {
  const details = control.locator("xpath=ancestor::details[1]");
  return await details.count() ? details : null;
}

async function disclosureIsOpen(details) {
  return details ? details.evaluate((element) => element.open) : true;
}

async function openDisclosureFor(control, label) {
  const details = await nearestDetails(control);
  if (!details) return null;
  if (!(await disclosureIsOpen(details))) {
    const summary = details.locator("summary").first();
    assert(await summary.count(), `${label}: native disclosure is missing its summary.`);
    await summary.click();
  }
  assert(await disclosureIsOpen(details), `${label}: native disclosure did not expand.`);
  return details;
}

async function assertDisclosureState(details, expectedOpen, label) {
  assert(details, `${label}: expected a native details disclosure around its content.`);
  const isDetails = await details.evaluate((element) => element.tagName === "DETAILS"
    && Boolean(element.querySelector(":scope > summary")));
  assert(isDetails, `${label}: content must use a native details/summary disclosure.`);
  const open = await disclosureIsOpen(details);
  assert(open === expectedOpen, `${label}: disclosure should be ${expectedOpen ? "expanded" : "collapsed"}.`);
}

async function clickThroughDisclosure(control, label) {
  await openDisclosureFor(control, label);
  await control.click();
}

async function assertClosedAfterMobileSelection(dialog, label, { expectSummaryFocus = false } = {}) {
  const isPhone = await isMobileLayout(dialog);
  if (!isPhone) return;
  const details = await nearestDetails(dialog.locator("[data-credential-step-to]").first());
  if (details) {
    await assertDisclosureState(details, false, `${label} layer choices`);
    const choice = await dialog.evaluate((element) => {
      const current = Number(element.querySelector("[data-active-step]").getAttribute("data-active-step"));
      const buttons = Array.from(element.querySelectorAll("[data-credential-step-to]"));
      const expected = current === 6
        ? "Institutional outcome"
        : buttons[current].textContent.replace(/^\s*\d+\s*/, "").trim();
      const summary = element.querySelector("[data-credential-choice-current]");
      return { expected, actual: summary ? (summary.textContent || "").trim() : "" };
    });
    assert(choice.actual === choice.expected,
      `${label}: collapsed layer summary must identify the current choice: ${JSON.stringify(choice)}.`);
    if (expectSummaryFocus) {
      const focused = await details.evaluate((element) => document.activeElement === element.querySelector(":scope > summary"));
      assert(focused, `${label}: closing the layer choices should return focus to their summary.`);
    }
  }
}

async function waitForStage(page, stages, index) {
  const deadline = Date.now() + TIMEOUT_MS;
  while (Date.now() < deadline) {
    if (await activeStageIndex(stages) === index) return;
    await page.waitForTimeout(50);
  }
  throw new Error(`Expected walkthrough stage ${index + 1} to be active.`);
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

async function assertPlaybackButtonTransitions(dialog, label) {
  const stages = dialog.locator("[data-credential-stage]");
  const startingStage = await activeStageIndex(stages);
  assert(startingStage >= 0, `${label}: there must be exactly one active stage before playback controls are tested.`);
  const pauseButton = dialog.locator("[data-credential-pause]");
  await assertPlaying(dialog, `${label}: playback should begin active.`);
  await pauseButton.click();
  await assertPaused(dialog, `${label}: clicking Pause from autoplay must pause.`);
  await assertCurrentStage(stages, startingStage);
  await pauseButton.click();
  await assertPlaying(dialog, `${label}: clicking Play from the paused state must resume.`);
  await assertCurrentStage(stages, startingStage);
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

async function currentPanelDwellMs(dialog) {
  const duration = await dialog.locator("[data-credential-filmline]").evaluate(
    (element) => getComputedStyle(element).animationDuration,
  );
  const match = duration.match(/^([\d.]+)\s*(ms|s)$/i);
  assert(match, `Could not read the active panel duration from the timer animation: ${JSON.stringify(duration)}.`);
  const milliseconds = Number(match[1]) * (match[2].toLowerCase() === "s" ? 1000 : 1);
  assert(Number.isFinite(milliseconds) && milliseconds > 0, `Invalid active panel duration: ${duration}.`);
  const panelIndex = Number(await dialog.locator("[data-active-step]").getAttribute("data-active-step"));
  assert(milliseconds === EXPECTED_DWELL_MS[panelIndex],
    `Panel ${panelIndex} must use its 20%-shorter dwell: expected ${EXPECTED_DWELL_MS[panelIndex]}ms, got ${milliseconds}ms.`);
  return milliseconds;
}

async function advanceClockToPanel(page, dialog, stages, nextIndex) {
  const dwell = await currentPanelDwellMs(dialog);
  await page.clock.runFor(dwell + 50);
  await assertCurrentStage(stages, nextIndex);
  if (nextIndex === 6) {
    await assertOutcomeCountLabel(dialog);
    await assertOutcomeVisual(dialog, true);
  } else {
    await assertLayerCountLabel(dialog, nextIndex);
    if (nextIndex === 0) await assertPresentationVisual(dialog, "Autoplay loop to Layer 1");
  }
  await assertPlaying(dialog, `Autoplay should continue after panel ${nextIndex}.`);
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
  assert(result.length === 5, `Expected five progressively revealed ecosystem layers; found ${result.length}.`);
  const visibleIndices = result.filter((layer) => layer.visible).map((layer) => layer.index).sort((a, b) => a - b);
  const expectedIndices = Array.from({ length: stageIndex }, (_, index) => index + 1);
  assert(
    JSON.stringify(visibleIndices) === JSON.stringify(expectedIndices),
    `Stage ${stageIndex + 1} should retain cumulative reveal layers ${JSON.stringify(expectedIndices)}; got ${JSON.stringify(visibleIndices)}.`,
  );
}

async function assertCurrentRevealInModalViewport(dialog, stageIndex) {
  if (stageIndex === 0 || stageIndex > 5) return;
  const result = await dialog.evaluate((element, index) => {
    const panel = element.querySelector(".credential-modal__panel");
    const layer = element.querySelector(`[data-reveal-index="${index}"]`);
    if (!panel || !layer) return null;
    const panelRect = panel.getBoundingClientRect();
    const layerRect = layer.getBoundingClientRect();
    const header = element.querySelector(".credential-modal__header");
    const footer = element.querySelector(".credential-modal__footer");
    const specimen = element.querySelector(".credential-readable__specimen");
    const headerRect = header && header.getBoundingClientRect();
    const footerRect = footer && footer.getBoundingClientRect();
    const specimenBottom = specimen && window.matchMedia("(max-width: 620px)").matches
      ? specimen.getBoundingClientRect().bottom
      : 0;
    const visibleTop = Math.max(panelRect.top, headerRect ? headerRect.bottom : 0, specimenBottom, 0);
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

async function assertPhoneReadingPosition(dialog, label) {
  const result = await dialog.evaluate((element) => {
    const panel = element.querySelector(".credential-modal__panel");
    const header = element.querySelector(".credential-modal__header");
    const footer = element.querySelector(".credential-modal__footer");
    const stage = Array.from(element.querySelectorAll("[data-credential-stage]"))
      .find((item) => !item.hidden);
    const title = stage && stage.querySelector("h3");
    const prose = stage
      && stage.querySelector(":scope > p:not(.credential-readable__note):not(.credential-readable__critical)");
    if (!panel || !header || !title || !prose) return null;
    const panelRect = panel.getBoundingClientRect();
    const headerRect = header.getBoundingClientRect();
    const footerRect = footer && footer.getBoundingClientRect();
    const specimen = element.querySelector(".credential-readable__specimen");
    const titleRect = title.getBoundingClientRect();
    const proseRect = prose.getBoundingClientRect();
    const proseStartRect = {
      left: proseRect.left, right: proseRect.right, top: proseRect.top,
      bottom: Math.min(proseRect.bottom, proseRect.top + 24),
    };
    const top = Math.max(panelRect.top, headerRect.bottom, 0);
    const bottom = Math.min(panelRect.bottom, footerRect ? footerRect.top : window.innerHeight, window.innerHeight);
    const overlaps = (a, b) => a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
    const pinned = Array.from(element.querySelectorAll(
      ".credential-readable__specimen, .credential-readable__layer-picker, .credential-modal__footer",
    )).filter((item) => ["sticky", "fixed"].includes(getComputedStyle(item).position));
    // Long paragraphs need scrolling; the heading and opening lines must be unobscured.
    const blocked = [titleRect, proseStartRect].some((readingRect) => pinned.some((item) => {
      if (item === title || item === prose) return false;
      const bounds = item.getBoundingClientRect();
      if (!overlaps(readingRect, bounds)) return false;
      // Native closed details can retain child layout boxes without painting them.
      // Confirm actual overlap at the painted intersection, not just a stale box.
      const hit = document.elementFromPoint(
        (Math.max(readingRect.left, bounds.left) + Math.min(readingRect.right, bounds.right)) / 2,
        (Math.max(readingRect.top, bounds.top) + Math.min(readingRect.bottom, bounds.bottom)) / 2,
      );
      return Boolean(hit && (hit === item || item.contains(hit)));
    }));
    return {
      title: { top: titleRect.top, bottom: titleRect.bottom },
      prose: { top: proseRect.top, bottom: proseRect.bottom },
      safeTop: top,
      safeBottom: bottom,
      specimenPosition: specimen && getComputedStyle(specimen).position,
      titleVisible: titleRect.height > 0 && titleRect.top >= top && titleRect.bottom <= bottom,
      proseStartsInView: proseRect.height > 0 && proseRect.top >= top && proseRect.top < bottom
        && Math.min(proseRect.bottom, bottom) - proseRect.top >= 24
        && proseRect.left >= panelRect.left && proseRect.right <= panelRect.right,
      blocked,
    };
  });
  assert(
    result && result.titleVisible && result.proseStartsInView && !result.blocked
      && result.specimenPosition !== "sticky",
    `${label}: heading and first prose must be visible below the sticky header without pinned context obscuring the reading area: ${JSON.stringify(result)}.`,
  );
}

async function assertDesktopStickySpecimenDuringVerification(page, dialog) {
  assert(!(await isMobileLayout(dialog)), "Desktop sticky-specimen coverage must use the desktop layout.");
  const panel = dialog.locator(".credential-modal__panel");
  const beforeScroll = await panel.evaluate((element) => element.scrollTop);
  await panel.evaluate((element) => { element.scrollTop += 300; });
  await page.waitForTimeout(100);
  const afterScroll = await panel.evaluate((element) => element.scrollTop);
  assert(afterScroll > beforeScroll + 200,
    `Desktop verification coverage must actually scroll the journey; panel scrollTop changed ${beforeScroll} → ${afterScroll}.`);
  const result = await dialog.evaluate((element) => {
    const panel = element.querySelector(".credential-modal__panel");
    const specimen = element.querySelector(".credential-readable__specimen");
    const header = element.querySelector(".credential-modal__header");
    const footer = element.querySelector(".credential-modal__footer");
    const stage = Array.from(element.querySelectorAll("[data-credential-stage]"))
      .find((item) => !item.hidden);
    if (!panel || !specimen || !header || !footer || !stage) return null;
    const panelRect = panel.getBoundingClientRect();
    const specimenRect = specimen.getBoundingClientRect();
    const headerRect = header.getBoundingClientRect();
    const footerRect = footer.getBoundingClientRect();
    const stageRect = stage.getBoundingClientRect();
    let stickyAncestor = specimen;
    while (stickyAncestor && stickyAncestor !== element
      && getComputedStyle(stickyAncestor).position !== "sticky") {
      stickyAncestor = stickyAncestor.parentElement;
    }
    const top = Math.max(panelRect.top, headerRect.bottom, 0);
    const bottom = Math.min(panelRect.bottom, footerRect.top, window.innerHeight);
    const visibleHeight = (rect) => Math.max(0, Math.min(rect.bottom, bottom) - Math.max(rect.top, top));
    const visibleWidth = (rect) => Math.max(0, Math.min(rect.right, panelRect.right, window.innerWidth)
      - Math.max(rect.left, panelRect.left, 0));
    const overlap = (a, b) => a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
    return {
      stickyAncestor: stickyAncestor && stickyAncestor !== element
        ? { tag: stickyAncestor.tagName, className: stickyAncestor.className, position: getComputedStyle(stickyAncestor).position }
        : null,
      specimen: { top: specimenRect.top, bottom: specimenRect.bottom },
      safeTop: top,
      safeBottom: bottom,
      specimenVisibleHeight: visibleHeight(specimenRect),
      specimenUnobscured: specimenRect.top >= top - 1 && specimenRect.bottom <= bottom + 1,
      stageVisibleHeight: visibleHeight(stageRect),
      stageVisibleWidth: visibleWidth(stageRect),
      stageUnobscured: !overlap(specimenRect, stageRect),
    };
  });
  assert(
    result && result.stickyAncestor && result.stickyAncestor.position === "sticky"
      && result.specimenVisibleHeight >= 200 && result.specimenUnobscured
      && result.stageVisibleHeight >= 100 && result.stageVisibleWidth >= 180 && result.stageUnobscured,
    `While scrolling the Verification journey, its desktop specimen must remain sticky, visible, unobscured, and beside meaningful active-stage content: ${JSON.stringify(result)}.`,
  );
}

async function assertActiveNarrativeInModalViewport(dialog) {
  const result = await dialog.evaluate((element) => {
    const panel = element.querySelector(".credential-modal__panel");
    const stage = Array.from(element.querySelectorAll("[data-credential-stage]"))
      .find((item) => !item.hidden);
    if (!panel || !stage) return null;
    const panelRect = panel.getBoundingClientRect();
    const stageRect = stage.getBoundingClientRect();
    const header = element.querySelector(".credential-modal__header");
    const footer = element.querySelector(".credential-modal__footer");
    const specimen = element.querySelector(".credential-readable__specimen");
    const headerRect = header && header.getBoundingClientRect();
    const footerRect = footer && footer.getBoundingClientRect();
    const specimenBottom = specimen && window.matchMedia("(max-width: 620px)").matches
      ? specimen.getBoundingClientRect().bottom
      : 0;
    const top = Math.max(panelRect.top, headerRect ? headerRect.bottom : 0, specimenBottom, 0);
    const bottom = Math.min(panelRect.bottom, footerRect ? footerRect.top : window.innerHeight, window.innerHeight);
    return {
      visible: !stage.hidden && getComputedStyle(stage).display !== "none",
      visibleHeight: Math.max(0, Math.min(stageRect.bottom, bottom) - Math.max(stageRect.top, top)),
      visibleWidth: Math.max(0, Math.min(stageRect.right, panelRect.right, window.innerWidth)
        - Math.max(stageRect.left, panelRect.left, 0)),
    };
  });
  assert(
    result && result.visible && result.visibleHeight >= 40 && result.visibleWidth >= 40,
    `Outcome narrative is not meaningfully visible in the modal viewport: ${JSON.stringify(result)}.`,
  );
}

async function assertVisualInModalViewport(
  dialog,
  selector,
  label,
  { requireModalViewportOverlap = false, requireUnnumbered = false } = {},
) {
  const result = await dialog.evaluate((element, visualSelector) => {
    const visual = element.querySelector(visualSelector);
    const panel = element.querySelector(".credential-modal__panel");
    if (!visual || !panel) return null;
    const bounds = visual.getBoundingClientRect();
    const panelBounds = panel.getBoundingClientRect();
    const header = element.querySelector(".credential-modal__header");
    const footer = element.querySelector(".credential-modal__footer");
    const specimen = element.querySelector(".credential-readable__specimen");
    const headerBounds = header && header.getBoundingClientRect();
    const footerBounds = footer && footer.getBoundingClientRect();
    const specimenBottom = specimen && window.matchMedia("(max-width: 620px)").matches
      ? specimen.getBoundingClientRect().bottom
      : 0;
    const visibleTop = Math.max(panelBounds.top, headerBounds ? headerBounds.bottom : 0, specimenBottom, 0);
    const visibleBottom = Math.min(
      panelBounds.bottom,
      footerBounds ? footerBounds.top : window.innerHeight,
      window.innerHeight,
    );
    const visibleLeft = Math.max(panelBounds.left, 0);
    const visibleRight = Math.min(panelBounds.right, window.innerWidth);
    return {
      visible: !visual.hidden
        && getComputedStyle(visual).display !== "none"
        && getComputedStyle(visual).visibility !== "hidden"
        && visual.getClientRects().length > 0,
      width: bounds.width,
      height: bounds.height,
      overlapWidth: Math.max(0, Math.min(bounds.right, visibleRight) - Math.max(bounds.left, visibleLeft)),
      overlapHeight: Math.max(0, Math.min(bounds.bottom, visibleBottom) - Math.max(bounds.top, visibleTop)),
      numbered: Boolean(visual.closest("[data-reveal-index]")),
    };
  }, selector);
  const hasRequiredOverlap = !requireModalViewportOverlap
    || (result && result.overlapWidth >= 40 && result.overlapHeight >= 40);
  assert(
    result && result.visible && result.width >= 40 && result.height >= 40
      && hasRequiredOverlap
      && (!requireUnnumbered || !result.numbered),
    `${label} visual must have rendered dimensions${requireModalViewportOverlap ? " and meaningful overlap with the visible modal area" : ""}${requireUnnumbered ? " without being a numbered layer" : ""}: ${JSON.stringify(result)}.`,
  );
}

async function assertPresentationVisual(dialog, label, requireModalViewportOverlap = true) {
  await assertVisualInModalViewport(dialog, "[data-credential-presentation-visual]", label, {
    requireModalViewportOverlap,
  });
}

async function assertOutcomeVisual(dialog, requireModalViewportOverlap = false) {
  await assertVisualInModalViewport(dialog, "[data-credential-outcome-visual]", "Institutional Outcome", {
    requireModalViewportOverlap,
    requireUnnumbered: true,
  });
}

async function assertReadableTypography(dialog, label) {
  const measurements = await dialog.evaluate((element) => {
    const activeStage = Array.from(element.querySelectorAll("[data-credential-stage]"))
      .find((stage) => !stage.hidden);
    const paragraphs = activeStage
      ? Array.from(activeStage.querySelectorAll(":scope > p:not(.credential-readable__note):not(.credential-readable__critical)"))
      : [];
    const layerButtons = Array.from(element.querySelectorAll("[data-credential-step-to]"));
    const outcomeButtons = Array.from(element.querySelectorAll("[data-credential-outcome]"));
    return {
      paragraphs: paragraphs.map((paragraph) => Number.parseFloat(getComputedStyle(paragraph).fontSize)),
      navButtons: [...layerButtons, ...outcomeButtons]
        .map((button) => Number.parseFloat(getComputedStyle(button).fontSize)),
      mobile: window.matchMedia(
        "(max-width: 620px), (max-width: 950px) and (max-height: 500px) and (pointer: coarse)",
      ).matches,
      layerButtonCount: layerButtons.length,
      outcomeButtonCount: outcomeButtons.length,
    };
  });
  assert(
    measurements.paragraphs.length > 0 && measurements.paragraphs.every((size) => size >= 14),
    `${label}: active narrative paragraphs must render at least 14px; got ${JSON.stringify(measurements.paragraphs)}.`,
  );
  const minimumNavigationFontSize = 12;
  assert(
    measurements.layerButtonCount === 6
      && measurements.outcomeButtonCount <= 1
      && measurements.navButtons.every((size) => size >= minimumNavigationFontSize),
    `${label}: all layer and Outcome navigation buttons must render at least ${minimumNavigationFontSize}px; got ${JSON.stringify(measurements.navButtons)}.`,
  );
}

async function assertWorkspaceStartsNearHeader(dialog, label) {
  if (await isMobileLayout(dialog)) {
    // Phones deliberately scroll past the intro and reference to start reading.
    await assertPhoneReadingPosition(dialog, label);
    return;
  }
  const gap = await dialog.evaluate((element) => {
    const header = element.querySelector(".credential-modal__header");
    const workspace = element.querySelector(".credential-readable__workspace, .credential-university__workspace")
      || element.querySelector("main");
    if (!header || !workspace) return null;
    return workspace.getBoundingClientRect().top - header.getBoundingClientRect().bottom;
  });
  assert(
    gap !== null && gap >= -1 && gap <= 260,
    `${label}: first workspace content should begin shortly after the compact header; gap was ${gap}px.`,
  );
}

async function assertSkillsLayerQualifier(dialog) {
  const text = await dialog.locator("[data-credential-stage]").nth(3).innerText();
  assert(
    /\billustrat(?:ive|ion)\b|\bexample\b|\bsample\b/i.test(text)
      && /\bunverified\b|\bnot\s+(?:independently\s+)?(?:verified|assessed)\b/i.test(text),
    `Skills & Taxonomy layer must clearly qualify its examples as illustrative, unverified, or not independently assessed; got: ${text.replace(/\s+/g, " ").trim()}`,
  );
}

async function assertFocusIndicator(dialog, panelIndex) {
  const state = await dialog.evaluate((element, index) => {
    const bar = element.querySelector(".credential-readable__focus-bar");
    const title = element.querySelector("[data-credential-focus-title]");
    const next = element.querySelector("[data-credential-focus-next]");
    const header = element.querySelector(".credential-modal__header");
    const buttons = Array.from(element.querySelectorAll("[data-credential-step-to]"));
    const name = (i) => buttons[i].textContent.replace(/^\s*\d+\s*/, "").trim();
    const bounds = bar.getBoundingClientRect();
    const headerBounds = header.getBoundingClientRect();
    const currentButton = buttons[index];
    return {
      title: title.textContent,
      next: next.textContent,
      name: index === 6 ? "institutional outcome" : name(index),
      nextName: index === 6 ? name(0) : index === 5 ? "Institutional outcome" : name(index + 1),
      mobile: window.matchMedia(
        "(max-width: 620px), (max-width: 950px) and (max-height: 500px) and (pointer: coarse)",
      ).matches,
      visible: bounds.height > 0 && bounds.top >= 0 && bounds.bottom <= window.innerHeight
        && bounds.top >= headerBounds.top && bounds.bottom <= headerBounds.bottom,
      titleFont: parseFloat(getComputedStyle(title).fontSize),
      paused: element.classList.contains("is-paused"),
      highlighted: index === 6
        ? element.querySelector("[data-credential-outcome]").getAttribute("aria-current") === "true"
        : currentButton.getAttribute("aria-current") === "true"
          && (getComputedStyle(currentButton).backgroundColor !== getComputedStyle(buttons[(index + 1) % 6]).backgroundColor
            || getComputedStyle(currentButton).fontWeight !== getComputedStyle(buttons[(index + 1) % 6]).fontWeight),
    };
  }, panelIndex);
  assert(state.visible, `Current-layer indicator must remain visible in the sticky header on panel ${panelIndex}.`);
  assert(state.titleFont >= 14, `Current-layer indicator should remain readable: ${state.titleFont}px.`);
  assert(state.title.toLowerCase().includes(state.name.toLowerCase())
    && (state.mobile || /\bviewing\b/i.test(state.title)),
    `Focus indicator must name the current panel: ${JSON.stringify(state)}.`);
  if (panelIndex < 6) assert(new RegExp(`layer 0?${panelIndex + 1} of 0?6`, "i").test(state.title),
    `Focus indicator must identify progress through the six layers: ${state.title}.`);
  assert(state.next.includes(state.nextName)
    && (state.mobile
      ? (state.paused ? /\bPaused\b/i.test(state.next) : /\bAuto\b/i.test(state.next))
      : (state.paused ? /Paused.*Press Play/i.test(state.next) : /Auto-playing/i.test(state.next))),
    `Focus indicator must explain the next panel and playback state: ${state.next}.`);
  assert(state.highlighted, `Current panel ${panelIndex} must have a distinct navigation highlight.`);
}

async function assertLayerCountLabel(dialog, layerIndex) {
  await assertFocusIndicator(dialog, layerIndex);
  const result = await dialog.evaluate((element) => {
    const counter = element.querySelector("[data-credential-count]");
    const steps = element.querySelector("[data-credential-step-to]");
    const nav = steps && steps.closest("nav");
    return {
      counterText: counter ? (counter.innerText || counter.textContent || "").trim() : "",
      navLabel: nav ? nav.getAttribute("aria-label") || "" : "",
      counterVisible: Boolean(counter && counter.getClientRects().length),
    };
  });
  const layerCounter = new RegExp(`\\blayers?\\b\\D*0?${layerIndex + 1}\\D+0?6\\b`, "i");
  assert(
    result.counterVisible
      && layerCounter.test(result.counterText)
      && !/\bstep\b/i.test(result.counterText),
    `Visible walkthrough counter must identify layer ${layerIndex + 1} of 6, not a step: ${JSON.stringify(result.counterText)}.`,
  );
  assert(
    /\blayers?\b/i.test(result.navLabel) && !/\bstep\b/i.test(result.navLabel),
    `Walkthrough navigation label must say layers, not steps: ${JSON.stringify(result.navLabel)}.`,
  );
}

async function assertOutcomeCountLabel(dialog) {
  await assertFocusIndicator(dialog, 6);
  const counter = dialog.locator("[data-credential-count]");
  const text = (await counter.innerText()).trim();
  assert(
    /\boutcome\b/i.test(text) && !/\blayer\s*0?7\b/i.test(text),
    `Outcome finale must use an Outcome label, not Layer 07: ${JSON.stringify(text)}.`,
  );
}

async function assertStandardisationLayer(dialog) {
  const result = await dialog.evaluate((element) => {
    const narrative = element.querySelectorAll("[data-credential-stage]")[1];
    const visual = element.querySelector('[data-reveal-index="1"]');
    return {
      narrative: narrative ? narrative.textContent || "" : "",
      visual: visual ? visual.textContent || "" : "",
    };
  });
  const text = `${result.narrative} ${result.visual}`;
  assert(
    /standard|open badges|w3c/i.test(text),
    `Standardisation layer should describe interoperability standards: ${text.replace(/\s+/g, " ").trim()}`,
  );
}

async function assertReadingComfort(dialog) {
  const metrics = await dialog.evaluate((element) => {
    const stage = Array.from(element.querySelectorAll("[data-credential-stage]")).find((item) => !item.hidden);
    const paragraph = stage.querySelector(":scope > p:not(.credential-readable__note):not(.credential-readable__critical)");
    const style = getComputedStyle(paragraph);
    const background = getComputedStyle(element.querySelector(".credential-modal__panel")).backgroundColor;
    const luminance = (color) => {
      const rgb = color.match(/[\d.]+/g).slice(0, 3).map((value) => Number(value) / 255);
      const linear = rgb.map((value) => value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4);
      return linear[0] * .2126 + linear[1] * .7152 + linear[2] * .0722;
    };
    const foregroundLight = luminance(style.color);
    const backgroundLight = luminance(background);
    const mobile = matchMedia("(max-width: 620px), (max-width: 950px) and (max-height: 500px) and (pointer: coarse)").matches;
    const shortLandscape = mobile && innerHeight <= 500;
    const fontSize = parseFloat(style.fontSize);
    return {
      mobile, shortLandscape, fontSize,
      lineHeight: parseFloat(style.lineHeight) / fontSize,
      approximateLineLength: paragraph.getBoundingClientRect().width / (fontSize * .5),
      contrast: (Math.max(foregroundLight, backgroundLight) + .05) / (Math.min(foregroundLight, backgroundLight) + .05),
      sampleFont: parseFloat(getComputedStyle(element.querySelector(".credential-readable__sample")).fontSize),
    };
  });
  assert(metrics.fontSize >= (metrics.mobile ? 14 : 15),
    `Narrative copy needs comfortably readable type: ${JSON.stringify(metrics)}.`);
  assert(metrics.lineHeight >= (metrics.shortLandscape ? 1.3 : 1.45),
    `Narrative lines need sufficient spacing: ${JSON.stringify(metrics)}.`);
  assert(metrics.approximateLineLength <= 88 && (metrics.mobile || metrics.approximateLineLength >= 35),
    `Narrative columns must avoid excessive line lengths or cramped desktop text: ${JSON.stringify(metrics)}.`);
  assert(metrics.contrast >= 4.5,
    `Narrative copy must have sufficient contrast against the reading surface: ${JSON.stringify(metrics)}.`);
  assert(metrics.sampleFont >= 8, "The fictional-example marker must not rely on tiny text.");
}

async function assertBuyerFocusedMessaging(dialog) {
  const copy = await dialog.evaluate((element) => ({
    title: element.querySelector("#credential-modal-title").textContent,
    intro: element.querySelector("#credential-modal-description").textContent,
    overview: element.querySelector(".credential-readable__past-heading").textContent,
    outcome: element.querySelector('[data-credential-stage="6"]').textContent,
    all: element.textContent.replace(/\s+/g, " "),
  }));
  assert(/value|connect|share/i.test(copy.title),
    "The opening must communicate credential value, not describe the demo interface.");
  assert(/your university/i.test(copy.intro) && /skills/i.test(copy.intro) && /learner records/i.test(copy.intro),
    "The introduction must identify the university buyer and the connected credential value.");
  assert(/VALUE BEYOND THE CERTIFICATE/.test(copy.overview),
    "The capability overview must explain buyer value rather than viewing history.");
  assert(/CertifyMe/i.test(copy.outcome) && /your institution/i.test(copy.outcome) && /governance/i.test(copy.outcome),
    "The closing must connect CertifyMe to the institution's needs and next conversation.");
  assert(!/Earlier layers stay in view|CONNECTIONS SO FAR|LAYERS EXPLORED|NOT A NUMBERED LAYER|Following the institutional story|Fields in view/i.test(copy.all),
    "Marketing copy must not expose demo scaffolding or internal progress commentary.");
}

async function assertPresentationNarrative(dialog) {
  await assertBuyerFocusedMessaging(dialog);
  await assertReadingComfort(dialog);
  const text = await dialog.locator("[data-credential-stage]").nth(0).innerText();
  assert(
    /shar(?:e|ing)/i.test(text)
      && /fictional/i.test(text)
      && /not\s+(?:issued|verified|a real|a learner record)|does not|example only|no real/i.test(text),
    `Presentation & Sharing narrative must explain the fictional tour's limits: ${text.replace(/\s+/g, " ").trim()}`,
  );
}

async function assertMergedLayerPanels(dialog) {
  const result = await dialog.evaluate((element) => {
    const stages = Array.from(element.querySelectorAll("[data-credential-stage]"));
    return {
      skillsTaxonomy: stages[3] ? stages[3].textContent || "" : "",
      workforceCareer: stages[5] ? stages[5].textContent || "" : "",
      outcome: stages[6] ? stages[6].textContent || "" : "",
    };
  });
  assert(
    /\bskills?\b/i.test(result.skillsTaxonomy) && /\btaxonom/i.test(result.skillsTaxonomy),
    "Verified Skills and Skill Taxonomy must be combined in layer index 3.",
  );
  assert(
    /\bworkforce\b/i.test(result.workforceCareer) && /\bcareer\b/i.test(result.workforceCareer),
    "Workforce Intelligence and Career Connection must be combined in layer index 5.",
  );
  assert(
    /\boutcome\b/i.test(result.outcome) || /\binstitution/i.test(result.outcome),
    "A separate Institutional Outcome finale must exist at narrative index 6.",
  );
  assert(!/\blayer\s*0?7\b/i.test(result.outcome), "Institutional Outcome must not be numbered as layer 07.");
}

async function assertVerificationDepth(dialog) {
  const result = await dialog.evaluate((element) => {
    const stages = Array.from(element.querySelectorAll("[data-credential-stage]"));
    const visual = element.querySelector('[data-reveal-index="2"]');
    const currentVisual = element.querySelector("[data-credential-current-visual]");
    return [
      stages[2] ? stages[2].textContent || "" : "",
      visual ? visual.textContent || "" : "",
      currentVisual ? currentVisual.textContent || "" : "",
    ].join(" ");
  });
  const requirements = [
    ["cryptographic signature or proof", /cryptograph/i.test(result) && /signature|proof/i.test(result)],
    ["issuer key", /issuer.{0,60}(?:public\s+)?key|(?:public\s+)?key.{0,60}issuer/i.test(result)],
    ["tamper or integrity language", /tamper|integrit/i.test(result)],
    ["a unique ID explicitly not being proof", /unique.{0,40}\b(?:id|identifier)\b/i.test(result)
      && /(?:unique.{0,100}(?:not|no|never).{0,50}proof|(?:id|identifier).{0,65}(?:not|no|never).{0,80}(?:proof|prove authenticity|establish authenticity))/i.test(result)],
    ["Open Badges checks", /open badges?/i.test(result) && /\bcheck(?:s|ed|ing|able)?\b|\bverification checks?\b/i.test(result)],
    ["status and revocation", /\bstatus\b/i.test(result) && /revoc/i.test(result)],
    ["a locally qualified sample or specimen marked unverified", /local(?:ly)?|\bhere\b|in this|this specimen/i.test(result)
      && /sample|specimen|fictional/i.test(result)
      && /unverified|not\s+(?:been\s+)?verified/i.test(result)],
  ];
  const missing = requirements.filter(([, met]) => !met).map(([description]) => description);
  assert(
    missing.length === 0,
    `Verification layer index 2 is missing deeper, locally-qualified detail (${missing.join("; ")}).`,
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

function matchesLayerLabel(text, index) {
  const patterns = [
    /\bpresentation\b/i.test(text) && /\bsharing\b/i.test(text),
    /\bstandardisation\b|\bstandardization\b|\bstandards?\b/i.test(text),
    /\bverification\b/i.test(text),
    /\bskills?\b/i.test(text) && /\btaxonom/i.test(text),
    /\blearner\b/i.test(text) && /\brecord\b/i.test(text),
    /\bworkforce\b/i.test(text) && /\bcareer\b/i.test(text),
  ];
  return Boolean(patterns[index]);
}

async function assertSixOrderedLayers(dialog) {
  const layerButtons = dialog.locator("[data-credential-step-to]");
  const stages = dialog.locator("[data-credential-stage]");
  assert(await layerButtons.count() === 6, `Expected six numbered layer buttons; found ${await layerButtons.count()}.`);
  const nonButtons = await layerButtons.evaluateAll((elements) => elements.filter(
    (element) => element.tagName !== "BUTTON",
  ).length);
  assert(nonButtons === 0, "Direct-layer navigation must use buttons.");
  assert(await stages.count() === 7, `Expected six layer narratives plus one outcome panel; found ${await stages.count()}.`);
  const stageIndices = await stages.evaluateAll((elements) => elements.map(
    (element) => Number(element.getAttribute("data-credential-stage")),
  ));
  assert(
    JSON.stringify(stageIndices) === JSON.stringify([0, 1, 2, 3, 4, 5, 6]),
    `Narrative hooks must be ordered as six layers followed by Outcome index 6; found ${JSON.stringify(stageIndices)}.`,
  );

  const labels = await layerButtons.evaluateAll((buttons) => buttons.map((button) => ({
    // Closed native menus have no rendered innerText; expansion is checked separately.
    visible: (button.closest("details") && !button.closest("details").open
      ? button.textContent : button.innerText || "").replace(/\s+/g, " ").trim(),
    accessible: button.getAttribute("aria-label") || "",
  })));
  assert(
    labels.every((label, index) => matchesLayerLabel(label.visible, index)),
    `Six layer choices must be meaningfully labelled Presentation & Sharing, Standardisation, Trust & Verification, Skills & Taxonomy, Learner Record, and Workforce & Career (not just numbers): ${JSON.stringify(labels)}.`,
  );
  assert(
    labels.every((label, index) => !/\bstep\b/i.test(label.accessible)
      && matchesLayerLabel(label.accessible || label.visible, index)),
    `Layer button accessible names must be meaningful and use layers, not steps: ${JSON.stringify(labels)}.`,
  );
  await assertLayerCountLabel(dialog, 0);
  await assertMergedLayerPanels(dialog);
  const outcomeButtons = dialog.locator("[data-credential-outcome]");
  assert(await outcomeButtons.count() <= 1, "Expected at most one dedicated Outcome navigation button.");
  if (await outcomeButtons.count()) {
    const button = outcomeButtons.first();
    const label = `${await button.innerText()} ${await button.getAttribute("aria-label") || ""}`;
    assert(await button.evaluate((element) => element.tagName === "BUTTON"), "Dedicated Outcome navigation must use a button.");
    assert(/outcome/i.test(label) && !/layer\s*0?7/i.test(label), `Outcome button must be separately labelled, not Layer 07: ${label}`);
    const details = await nearestDetails(button);
    if (await disclosureIsOpen(details)) {
      assert(await button.isVisible(), "Dedicated Outcome navigation button is not visible inside its expanded disclosure.");
    }
  }
  return { layerButtons, stages, outcomeButtons };
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
      text,
      hasFictionalDisclaimer: /\bfictional\b|\bfiction\b/i.test(text),
      liveClaims,
    };
  });

  assert(result.fileInputs.length === 0, `Walkthrough must not include PDF/JSON file inputs: ${JSON.stringify(result.fileInputs)}.`);
  assert(result.hasFictionalDisclaimer, "Walkthrough is missing a clear fictional-example disclaimer.");
  assert(result.liveClaims.length === 0, `Walkthrough makes a live-jobs claim: ${result.liveClaims.join(", ")}.`);
  assert(!/SIMULATED SAMPLE/i.test(result.text), "Redundant SIMULATED SAMPLE notice must be absent.");
  assert(
    !/THE CONNECTED STORY|Explore the ecosystem/i.test(result.text),
    "The old THE CONNECTED STORY / Explore the ecosystem framing must be absent.",
  );
}

async function assertVisibleNavigation(dialog, { allowCollapsedDisclosures = false } = {}) {
  const close = dialog.locator("button[data-credential-close]").first();
  const directSteps = dialog.locator("[data-credential-step-to]");
  assert(await close.isVisible(), "Walkthrough close button is not visible.");
  const menu = await nearestDetails(directSteps.first());
  const menuOpen = await disclosureIsOpen(menu);
  if (allowCollapsedDisclosures && !menuOpen) {
    assert(
      !(await directSteps.first().isVisible()),
      "Direct layer choices must be collapsed when their native mobile disclosure is closed.",
    );
  } else {
    assert(await directSteps.first().isVisible(), "Walkthrough direct-layer navigation is not visible.");
    const visibility = await directSteps.evaluateAll((buttons) => buttons.map(
      (button) => button.getClientRects().length > 0 && getComputedStyle(button).display !== "none",
    ));
    assert(visibility.length === 6 && visibility.every(Boolean), "All six layer navigation buttons must be visible.");
  }
  for (const selector of ["[data-credential-pause]", "[data-credential-prev]", "[data-credential-forward]"]) {
    assert(await dialog.locator(selector).first().isVisible(), `Walkthrough control ${selector} is not visible.`);
  }
}

async function assertMobileDisclosureDefaults(dialog) {
  const viewport = await dialog.evaluate(() => `${window.innerWidth}×${window.innerHeight}`);
  const specimen = dialog.locator(".credential-readable__specimen");
  const steps = dialog.locator("[data-credential-step-to]").first();
  const specimenDetails = await nearestDetails(specimen);
  const menuDetails = await nearestDetails(steps);
  await assertDisclosureState(specimenDetails, false, `Mobile credential specimen at ${viewport}`);
  await assertDisclosureState(menuDetails, false, `Mobile layer choices at ${viewport}`);
  await assertVisibleNavigation(dialog, { allowCollapsedDisclosures: true });
  assert(!(await specimen.isVisible()), "The full credential specimen should be collapsed by default on a phone.");
}

async function assertFullSpecimenExpanded(dialog) {
  const result = await dialog.locator(".credential-readable__specimen").evaluate((specimen) => {
    const certificate = specimen.querySelector("figure img");
    const identity = specimen.querySelector(".credential-readable__identity");
    return {
      certificateVisible: Boolean(certificate && certificate.getClientRects().length),
      identityVisible: Boolean(identity && identity.getClientRects().length),
      text: (specimen.innerText || "").replace(/\s+/g, " "),
    };
  });
  assert(result.certificateVisible && result.identityVisible
    && /Jordan Lee/i.test(result.text) && /fictional|unsigned|not issued/i.test(result.text),
  `Expanding the specimen should reveal the certificate and its fully qualified fictional identity: ${JSON.stringify(result)}.`);
}

async function assertMobileNavigationTargets(dialog, label) {
  const measurements = await dialog.evaluate((element) => {
    const selectors = ["[data-credential-prev]", "[data-credential-forward]", "[data-credential-pause]"];
    return selectors.map((selector) => {
      const button = element.querySelector(selector);
      if (!button) return { selector, missing: true };
      const rect = button.getBoundingClientRect();
      const style = getComputedStyle(button);
      const visible = !button.disabled && rect.width > 0 && rect.height > 0
        && rect.top >= 0 && rect.bottom <= window.innerHeight
        && rect.left >= 0 && rect.right <= window.innerWidth
        && style.visibility !== "hidden" && style.display !== "none";
      const hit = visible ? document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2) : null;
      return {
        selector,
        width: rect.width,
        height: rect.height,
        visible,
        hit: Boolean(hit && (hit === button || button.contains(hit))),
      };
    });
  });
  const failures = measurements.filter((item) => item.missing || !item.visible
    || item.width < 44 || item.height < 44 || !item.hit);
  assert(
    failures.length === 0,
    `${label}: mobile Back/Next/Pause controls must be visible, unobscured, tappable 44px targets: ${JSON.stringify(measurements)}.`,
  );
}

async function assertMobileMenuChoiceTapArea(page, dialog, choice, label) {
  await choice.scrollIntoViewIfNeeded();
  await choice.evaluate((target) => {
    const modal = target.closest(".credential-modal__panel");
    const header = modal && modal.querySelector(".credential-modal__header");
    const footer = modal && modal.querySelector(".credential-modal__footer");
    if (!modal || !header || !footer) return;
    const summary = modal.querySelector(".credential-readable__layer-picker > summary");
    const safeTop = Math.max(0, header.getBoundingClientRect().bottom,
      summary ? summary.getBoundingClientRect().bottom : 0) + 3;
    const safeBottom = Math.min(window.innerHeight, footer.getBoundingClientRect().top - 3);
    const rect = target.getBoundingClientRect();
    const delta = rect.top < safeTop ? rect.top - safeTop
      : rect.bottom > safeBottom ? rect.bottom - safeBottom : 0;
    if (!delta) return;
    let scroller = target.parentElement;
    while (scroller && scroller !== modal) {
      const style = getComputedStyle(scroller);
      if (/(auto|scroll)/.test(style.overflowY) && scroller.scrollHeight > scroller.clientHeight + 1) break;
      scroller = scroller.parentElement;
    }
    if (!scroller || scroller === modal) scroller = modal;
    scroller.scrollTop += delta;
  });
  await page.waitForTimeout(40);
  const bounds = await choice.evaluate((target) => {
    const modal = target.closest(".credential-modal__panel");
    const header = modal && modal.querySelector(".credential-modal__header");
    const footer = modal && modal.querySelector(".credential-modal__footer");
    if (!modal || !header || !footer) return null;
    const rect = target.getBoundingClientRect();
    const summary = modal.querySelector(".credential-readable__layer-picker > summary");
    const safeTop = Math.max(0, header.getBoundingClientRect().bottom,
      summary ? summary.getBoundingClientRect().bottom : 0) + 2;
    const safeBottom = Math.min(window.innerHeight, footer.getBoundingClientRect().top - 2);
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const hit = document.elementFromPoint(x, y);
    const style = getComputedStyle(target);
    return {
      top: rect.top,
      bottom: rect.bottom,
      safeTop,
      safeBottom,
      width: rect.width,
      height: rect.height,
      visible: rect.width > 0 && rect.height > 0
        && rect.top >= safeTop && rect.bottom <= safeBottom
        && rect.left >= 0 && rect.right <= window.innerWidth
        && style.display !== "none" && style.visibility !== "hidden",
      hit: Boolean(hit && (hit === target || target.contains(hit))),
    };
  });
  assert(
    bounds && bounds.visible && bounds.hit && bounds.width >= 40 && bounds.height >= 40,
    `${label}: layer-menu choice must have an unobscured tap target between the sticky header and footer: ${JSON.stringify(bounds)}.`,
  );
}

async function assertAllSevenMobileMenuChoices(page, dialog, stages, label) {
  const steps = dialog.locator("[data-credential-step-to]");
  const outcome = dialog.locator("[data-credential-outcome]");
  assert(await steps.count() === 6 && await outcome.count() === 1,
    `${label}: the expanded native layer picker must expose exactly six layers and the Outcome choice.`);
  const details = await nearestDetails(steps.first());
  assert(details, `${label}: all seven choices must belong to the collapsible native layer picker.`);
  assert(await details.locator("[data-credential-outcome]").count() === 1,
    `${label}: the Institutional Outcome choice must be inside the same native layer picker.`);
  const summary = details.locator(":scope > summary");
  for (let index = 0; index < 7; index += 1) {
    await assertDisclosureState(details, false, `${label} before choice ${index + 1}`);
    await summary.tap();
    await assertDisclosureState(details, true, `${label} choice ${index + 1} expanded menu`);
    const choice = index === 6 ? outcome : steps.nth(index);
    const choiceLabel = index === 6 ? "Institutional Outcome" : `Layer ${index + 1}`;
    await assertFooterControlsAndCta(dialog, `${label} ${choiceLabel} while menu is expanded`);
    await assertMobileMenuChoiceTapArea(page, dialog, choice, `${label} ${choiceLabel}`);
    await choice.tap();
    await waitForStage(page, stages, index);
    await assertClosedAfterMobileSelection(dialog, `${label} ${choiceLabel}`, { expectSummaryFocus: true });
    await settleAndAssertStage(page, dialog, index);
    await assertFooterControlsAndCta(dialog, `${label} ${choiceLabel} after selection`);
  }
}

async function assertFooterControlsAndCta(dialog, label) {
  const result = await dialog.evaluate((element) => {
    const footer = element.querySelector(".credential-modal__footer");
    const controls = element.querySelector(".credential-readable__controls");
    const ctas = footer ? Array.from(footer.querySelectorAll("a[href]"))
      .filter((link) => new URL(link.href).origin === "https://info.certifyme.online"
        && new URL(link.href).pathname.replace(/\/$/, "") === "/request-demo") : [];
    const buttons = ["[data-credential-pause]", "[data-credential-prev]", "[data-credential-forward]"]
      .map((selector) => element.querySelector(selector));
    const current = Number(element.querySelector("[data-active-step]").getAttribute("data-active-step"));
    const targets = [...buttons, ctas[0] || null].map((target, index) => {
      if (!target) return { index, missing: true };
      const rect = target.getBoundingClientRect();
      const style = getComputedStyle(target);
      const visible = rect.width > 0 && rect.height > 0
        && rect.top >= 0 && rect.bottom <= window.innerHeight
        && rect.left >= 0 && rect.right <= window.innerWidth
        && style.visibility !== "hidden" && style.display !== "none";
      const hit = visible ? document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2) : null;
      return {
        selector: index < 3 ? ["pause", "previous", "next"][index] : "demo CTA",
        width: rect.width,
        height: rect.height,
        visible,
        hit: Boolean(hit && (hit === target || target.contains(hit))),
        disabled: Boolean(target.disabled),
      };
    });
    return {
      footerPosition: footer && getComputedStyle(footer).position,
      footerOnScreen: Boolean(footer && footer.getBoundingClientRect().bottom > 0
        && footer.getBoundingClientRect().top < window.innerHeight),
      controlsCount: element.querySelectorAll(".credential-readable__controls").length,
      controlsInFooter: Boolean(footer && controls && footer.contains(controls)),
      ctaCount: ctas.length,
      shareCardCount: element.querySelectorAll(".credential-readable__share").length,
      socialLinkCount: element.querySelectorAll("[data-credential-social]").length,
      current,
      targets,
    };
  });
  const mobile = await isMobileLayout(dialog);
  const failures = result.targets.filter((target, index) => target.missing || !target.visible || !target.hit
    || target.width < (mobile ? (index === 3 ? 40 : 44) : 36)
    || target.height < (mobile ? (index === 3 ? 40 : 44) : 36)
    || (index === 1 ? target.disabled !== (result.current === 0) : target.disabled));
  assert(
    result.footerPosition === "sticky" && result.footerOnScreen
      && result.controlsCount === 1 && result.controlsInFooter && result.ctaCount === 1
      && result.shareCardCount === 0 && result.socialLinkCount === 0 && failures.length === 0,
    `${label}: the single playback-control block and Talk with CertifyMe CTA must share a sticky footer as visible, unobscured targets; the retired share card/social links must be absent: ${JSON.stringify({ ...result, failures })}.`,
  );
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

async function assertShareUrls(dialog) {
  const storyUrl = new URL("/", BASE_URL);
  storyUrl.searchParams.set("story", "certificate");
  const state = await dialog.evaluate((element) => ({
    introShortcutCount: element.querySelectorAll(
      '.credential-readable__intro .credential-readable__share-shortcut[data-credential-share="native"]',
    ).length,
    nativeActionCount: element.querySelectorAll('[data-credential-share="native"]').length,
    copyActionCount: element.querySelectorAll('[data-credential-share="copy"]').length,
    statusCount: element.querySelectorAll("[data-credential-share-status]").length,
    socialLinkCount: element.querySelectorAll("[data-credential-social]").length,
    retiredCardCount: element.querySelectorAll(".credential-readable__share").length,
  }));
  assert(
    state.introShortcutCount === 1 && state.nativeActionCount === 1
      && state.copyActionCount === 0 && state.statusCount === 1
      && state.socialLinkCount === 0 && state.retiredCardCount === 0,
    `The small intro native-share shortcut and one fallback status must remain, without the retired large share card, copy/social controls, or social links: ${JSON.stringify(state)}.`,
  );
  return storyUrl;
}

async function assertIntroShareClipboardFallback(page, dialog, expectedUrl) {
  await page.evaluate(() => {
    Object.defineProperty(navigator, "share", { configurable: true, value: undefined });
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: async (text) => { window.__credentialStoryClipboard = text; } },
    });
    window.__credentialStoryClipboard = null;
  });
  const shortcut = dialog.locator(
    '.credential-readable__intro .credential-readable__share-shortcut[data-credential-share="native"]',
  );
  await shortcut.click();
  await page.waitForFunction(() => window.__credentialStoryClipboard !== null, null, { timeout: TIMEOUT_MS });
  const copiedUrl = await page.evaluate(() => window.__credentialStoryClipboard);
  assert(copiedUrl === expectedUrl.href,
    `When native sharing is unavailable, the intro shortcut must copy the fictional-tour URL: expected ${expectedUrl.href}, got ${copiedUrl}.`);
  const status = dialog.locator("[data-credential-share-status]");
  await page.waitForFunction(() => /\btour link copied\b/i.test(
    document.querySelector("[data-credential-share-status]")?.textContent || "",
  ), null, { timeout: TIMEOUT_MS });
  const feedback = (await status.innerText()).trim();
  assert(/tour link copied/i.test(feedback),
    `The intro shortcut's clipboard fallback must report copy success in its status feedback: ${JSON.stringify(feedback)}.`);
}

async function captureStage(page, dialog, stages, index, filename) {
  const steps = dialog.locator("[data-credential-step-to]");
  await clickThroughDisclosure(steps.nth(index), `Layer ${index + 1} navigation`);
  await waitForStage(page, stages, index);
  await assertClosedAfterMobileSelection(dialog, `Selecting layer ${index + 1}`, { expectSummaryFocus: true });
  await settleAndAssertStage(page, dialog, index);
  await assertNoHorizontalOverflow(page, dialog, filename);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, filename) });
}

async function settleAndAssertStage(page, dialog, stageIndex) {
  await page.waitForTimeout(450);
  const isPhone = await isMobileLayout(dialog);
  if (stageIndex <= 5) {
    await assertLayerCountLabel(dialog, stageIndex);
    await assertCumulativeReveals(dialog, stageIndex);
    if (!isPhone) await assertCurrentRevealInModalViewport(dialog, stageIndex);
    if (stageIndex === 0) {
      await assertPresentationVisual(dialog, "Layer 1", !isPhone);
      if (isPhone) await assertPhoneReadingPosition(dialog, "Phone Layer 1");
    } else if (isPhone) {
      await assertPhoneReadingPosition(dialog, `Phone Layer ${stageIndex + 1}`);
    }
  } else {
    await assertOutcomeCountLabel(dialog);
    await assertCumulativeReveals(dialog, 5);
    if (!isPhone) {
      await assertActiveNarrativeInModalViewport(dialog);
      await assertOutcomeVisual(dialog);
    } else {
      await assertPhoneReadingPosition(dialog, "Phone institutional outcome");
      await assertOutcomeVisual(dialog, false);
    }
  }
  await assertReadableTypography(dialog, `viewport ${await dialog.evaluate(() => window.innerWidth)}px`);
  if (stageIndex === 0) await assertPresentationNarrative(dialog);
  if (stageIndex === 2) await assertVerificationDepth(dialog);
  if (stageIndex === 1) await assertStandardisationLayer(dialog);
  if (stageIndex === 3) await assertSkillsLayerQualifier(dialog);
}

async function navigateToOutcome(page, dialog, stages) {
  const outcomeButton = dialog.locator("[data-credential-outcome]");
  if (await outcomeButton.count()) {
    await clickThroughDisclosure(outcomeButton, "Institutional Outcome navigation");
  } else {
    await dialog.locator("[data-credential-forward]").click();
  }
  await waitForStage(page, stages, 6);
  await assertClosedAfterMobileSelection(dialog, "Selecting the institutional outcome", { expectSummaryFocus: true });
  await settleAndAssertStage(page, dialog, 6);
  const outcomeText = await stages.nth(6).innerText();
  assert(
    /outcome|institution/i.test(outcomeText),
    `Final narrative index 6 should be a separate Institutional Outcome: ${outcomeText.replace(/\s+/g, " ").trim()}`,
  );
}

async function verifyDemoCta(dialog) {
  const candidates = await dialog.locator("a[href]").evaluateAll((links) => links
    .map((link) => ({
      text: (link.innerText || link.getAttribute("aria-label") || "").replace(/\s+/g, " ").trim(),
      href: link.href,
    })));
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
    const { layerButtons, stages } = await assertSixOrderedLayers(dialog);
    await assertVisibleNavigation(dialog);
    await assertNoFileInputsOrLiveJobs(dialog);
    await assertShareUrls(dialog);
    await assertCertificateLoaded(page, dialog);
    await assertPresentationVisual(dialog, "Initial Layer 1");
    await assertNoHorizontalOverflow(page, dialog, "desktop 1280px");
    await assertWorkspaceStartsNearHeader(dialog, "desktop 1280px");
    await assertReadableTypography(dialog, "desktop 1280px");
    await assertFooterControlsAndCta(dialog, "Desktop opening viewport");

    await assertPlaying(dialog, "A fresh open should still be autoplaying before footer focus.");
    await assertPlaybackButtonTransitions(dialog, "Desktop footer playback controls");
    await dialog.locator("button[data-credential-close]").focus();
    await page.keyboard.press("Shift+Tab");
    const focusedFooterControl = await dialog.evaluate((element) => {
      const footer = element.querySelector(".credential-modal__footer");
      return Boolean(footer && footer.contains(document.activeElement));
    });
    assert(focusedFooterControl, "Shift+Tab from the initial Close button did not wrap into the relocated footer controls/CTA.");
    await assertPaused(dialog, "Focusing relocated footer content should pause autoplay.");
    await assertCurrentStage(stages, 0);
    await assertTabTrap(page, dialog);
    await assertCurrentStage(stages, 0);

    await layerButtons.nth(0).click();
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
    ]);
    for (let stageIndex = 1; stageIndex < 6; stageIndex += 1) {
      await dialog.locator("[data-credential-forward]").click();
      await waitForStage(page, stages, stageIndex);
      await settleAndAssertStage(page, dialog, stageIndex);
      if (stageIndex === 2) {
        await assertDesktopStickySpecimenDuringVerification(page, dialog);
        await assertFooterControlsAndCta(dialog, "Desktop Verification footer controls");
      }
      const filename = stageScreenshots.get(stageIndex);
      if (filename) {
        await assertNoHorizontalOverflow(page, dialog, filename);
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, filename) });
      }
    }
    await navigateToOutcome(page, dialog, stages);
    await assertOutcomeVisual(dialog, true);
    await assertNoHorizontalOverflow(page, dialog, "desktop institutional outcome");
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "desktop-outcome.png") });
    await verifyDemoCta(dialog);
    await dialog.locator("[data-credential-forward]").click();
    await waitForStage(page, stages, 0);
    await settleAndAssertStage(page, dialog, 0);
    await assertPresentationVisual(dialog, "Outcome restart to Layer 1");

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
    await assertWorkspaceStartsNearHeader(dialog, "desktop 1280x720");
    await assertFooterControlsAndCta(dialog, "Short desktop 1280x720 opening viewport");
    await assertSixOrderedLayers(dialog);
    const stages = dialog.locator("[data-credential-stage]");
    await dialog.locator("[data-credential-step-to]").nth(3).click();
    await waitForStage(page, stages, 3);
    await settleAndAssertStage(page, dialog, 3);
    await assertNoHorizontalOverflow(page, dialog, "desktop 1280x720");
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "desktop-720-skills-taxonomy.png") });
  } finally {
    await context.close();
  }
}

async function touchTap(page, locator, label) {
  const bounds = await locator.boundingBox();
  assert(bounds, `${label}: target has no on-screen touch bounds.`);
  const x = bounds.x + bounds.width / 2;
  const y = bounds.y + bounds.height / 2;
  assert(x >= 0 && x <= (await page.evaluate(() => innerWidth))
    && y >= 0 && y <= (await page.evaluate(() => innerHeight)),
  `${label}: touch target is outside the viewport (${JSON.stringify(bounds)}).`);
  await page.touchscreen.tap(x, y);
}

async function touchScroll(page, x, y, distance = 140) {
  let session = TOUCH_SESSIONS.get(page);
  if (!session) {
    session = await page.context().newCDPSession(page);
    TOUCH_SESSIONS.set(page, session);
  }
  // Detaching here resets Chromium's touch emulation. Context close owns cleanup.
  await session.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [{ x, y, id: 1 }],
  });
  for (let step = 1; step <= 4; step += 1) {
    await session.send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: [{ x, y: y - (distance * step) / 4, id: 1 }],
    });
    await page.waitForTimeout(35);
  }
  await session.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
}

async function assertTouchScrollPausesAndPlayResumes(page, dialog) {
  const pause = dialog.locator("[data-credential-pause]");
  const panel = dialog.locator(".credential-modal__panel");
  const stages = dialog.locator("[data-credential-stage]");
  const startingStage = await activeStageIndex(stages);
  const paragraph = dialog.locator("[data-credential-stage]:not([hidden])")
    .locator(":scope > p:not(.credential-readable__note):not(.credential-readable__critical)")
    .first();
  await assertMobileNavigationTargets(dialog, "Before touch reading");
  await touchTap(page, pause, "Play walkthrough");
  await assertPlaying(dialog, "A deliberate Play tap should resume mobile autoplay.");
  await assertCurrentStage(stages, startingStage);

  const bounds = await paragraph.boundingBox();
  assert(bounds && bounds.height > 0, "Could not locate narrative prose for a real touch-scroll regression.");
  const touchPoint = await page.evaluate(() => {
    const paragraph = Array.from(document.querySelectorAll("[data-credential-stage]:not([hidden]) > p"))
      .find((item) => !item.classList.contains("credential-readable__note")
        && !item.classList.contains("credential-readable__critical"));
    const header = document.querySelector(".credential-modal__header");
    const footer = document.querySelector(".credential-modal__footer");
    if (!paragraph || !header || !footer) return null;
    const rect = paragraph.getBoundingClientRect();
    const headerRect = header.getBoundingClientRect();
    const footerRect = footer.getBoundingClientRect();
    const safeTop = Math.max(1, rect.top, headerRect.bottom + 4);
    const safeBottom = Math.min(window.innerHeight - 1, rect.bottom, footerRect.top - 4);
    const x = Math.max(1, Math.min(window.innerWidth - 1, rect.left + Math.min(rect.width / 2, 120)));
    for (let y = safeTop + 2; y < safeBottom - 1; y += 6) {
      const hit = document.elementFromPoint(x, y);
      if (hit && (hit === paragraph || paragraph.contains(hit))) return { x, y };
    }
    return null;
  });
  assert(touchPoint, "Touch-scroll gesture must begin on visible narrative prose, not a pinned control or unrelated target.");
  const before = await panel.evaluate((element) => element.scrollTop);
  await touchScroll(page, touchPoint.x, touchPoint.y);
  await page.waitForTimeout(250);
  const after = await panel.evaluate((element) => element.scrollTop);
  assert(after > before + 5, `A genuine touch swipe over narrative prose should scroll the modal; scrollTop changed ${before} → ${after}.`);
  await assertPaused(dialog, "Reading by touch-scrolling should pause autoplay.");
  await assertCurrentStage(stages, startingStage);

  await assertMobileNavigationTargets(dialog, "After touch-scroll pause");
  await touchTap(page, pause, "Play walkthrough after touch-scroll pause");
  await assertPlaying(dialog, "An intentional Play tap after reading should resume autoplay.");
  await assertCurrentStage(stages, startingStage);

  await paragraph.evaluate((element) => {
    const modal = element.closest(".credential-modal__panel");
    const header = modal.querySelector(".credential-modal__header");
    const picker = modal.querySelector(".credential-readable__layer-picker > summary");
    const safeTop = Math.max(header.getBoundingClientRect().bottom,
      picker ? picker.getBoundingClientRect().bottom : 0) + 8;
    modal.scrollBy({ top: element.getBoundingClientRect().top - safeTop, behavior: "auto" });
  });
  await assertPlaying(dialog, "Programmatic positioning alone must not pause autoplay.");
  const wheelPoint = await page.evaluate(() => {
    const paragraph = Array.from(document.querySelectorAll("[data-credential-stage]:not([hidden]) > p"))
      .find((item) => !item.classList.contains("credential-readable__note")
        && !item.classList.contains("credential-readable__critical"));
    const header = document.querySelector(".credential-modal__header");
    const footer = document.querySelector(".credential-modal__footer");
    if (!paragraph || !header || !footer) return null;
    const rect = paragraph.getBoundingClientRect();
    const safeTop = Math.max(1, rect.top, header.getBoundingClientRect().bottom + 4);
    const safeBottom = Math.min(window.innerHeight - 1, rect.bottom, footer.getBoundingClientRect().top - 4);
    const x = Math.max(1, Math.min(window.innerWidth - 1, rect.left + Math.min(rect.width / 2, 120)));
    for (let y = safeTop + 2; y < safeBottom - 1; y += 6) {
      const hit = document.elementFromPoint(x, y);
      if (hit && (hit === paragraph || paragraph.contains(hit))) return { x, y };
    }
    return null;
  });
  assert(wheelPoint, "Could not position a real wheel input over unobscured mobile narrative prose.");
  const beforeWheel = await panel.evaluate((element) => element.scrollTop);
  await page.mouse.move(wheelPoint.x, wheelPoint.y);
  await page.mouse.wheel(0, 120);
  await page.waitForTimeout(250);
  const afterWheel = await panel.evaluate((element) => element.scrollTop);
  assert(afterWheel > beforeWheel + 5, `A real wheel input over narrative prose should scroll the modal; scrollTop changed ${beforeWheel} → ${afterWheel}.`);
  await assertPaused(dialog, "Reading by wheel-scrolling should pause autoplay.");
  await assertCurrentStage(stages, startingStage);

  await assertMobileNavigationTargets(dialog, "After wheel-scroll pause");
  await touchTap(page, pause, "Play walkthrough after wheel-scroll pause");
  await assertPlaying(dialog, "An intentional Play tap after wheel reading should resume autoplay.");
  await assertCurrentStage(stages, startingStage);
  await touchTap(page, pause, "Pause walkthrough after touch-scroll resume");
  await assertPaused(dialog, "A deliberate Pause tap after wheel reading should pause mobile autoplay.");
  await assertCurrentStage(stages, startingStage);
}

async function reopenMobileAtViewport(page, dialog, opener, stages, viewport, label, initialOverflow) {
  await dialog.locator("button[data-credential-close]").click();
  await dialog.waitFor({ state: "hidden", timeout: TIMEOUT_MS });
  const restored = await page.evaluate(() => ({
    focusIsOpener: document.activeElement?.matches("[data-credential-open]") || false,
    overflow: document.body.style.overflow,
  }));
  assert(restored.focusIsOpener, `${label}: close did not restore focus to the homepage opener.`);
  assert(restored.overflow === initialOverflow, `${label}: close did not restore the page's original body overflow.`);
  await page.setViewportSize(viewport);
  await opener.click();
  await dialog.waitFor({ state: "visible", timeout: TIMEOUT_MS });
  await assertCurrentStage(stages, 0);
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
    const initialOverflow = await page.evaluate(() => document.body.style.overflow);
    const { dialog, opener } = await openDialog(page);
    const { stages, layerButtons } = await assertSixOrderedLayers(dialog);
    await assertMobileDisclosureDefaults(dialog);
    await assertFooterControlsAndCta(dialog, "Phone 390x844 opening viewport");
    await assertPhoneReadingPosition(dialog, "Phone opening viewport");
    await assertVisibleNavigation(dialog, { allowCollapsedDisclosures: true });
    await assertPlaybackButtonTransitions(dialog, "Phone 390x844 footer playback controls");
    await assertNoFileInputsOrLiveJobs(dialog);
    await assertCertificateLoaded(page, dialog);
    await assertNoHorizontalOverflow(page, dialog, "mobile 390px");
    await assertWorkspaceStartsNearHeader(dialog, "mobile 390px");
    await assertReadableTypography(dialog, "mobile 390px");

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "mobile-opening-390.png") });
    const specimenDetails = await nearestDetails(dialog.locator(".credential-readable__specimen"));
    await openDisclosureFor(dialog.locator(".credential-readable__specimen"), "Mobile credential specimen");
    assert(await dialog.locator(".credential-readable__specimen").isVisible(),
      "Expanding the mobile specimen disclosure should reveal the complete credential.");
    await assertFullSpecimenExpanded(dialog);
    await assertNoHorizontalOverflow(page, dialog, "mobile 390px expanded specimen");
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "mobile-specimen-expanded-390.png") });
    await specimenDetails.locator("summary").first().click();
    await assertDisclosureState(specimenDetails, false, "Mobile specimen after collapse");

    await openDisclosureFor(layerButtons.first(), "Mobile layer choices");
    await assertVisibleNavigation(dialog);
    await assertNoHorizontalOverflow(page, dialog, "mobile 390px expanded layer menu");
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "mobile-menu-expanded-390.png") });

    await captureStage(page, dialog, stages, 2, "mobile-verification-390.png");
    await captureStage(page, dialog, stages, 4, "mobile-stage-5.png");
    await assertMobileNavigationTargets(dialog, "Layer 5 mid-article controls");
    await assertFooterControlsAndCta(dialog, "Phone 390x844 Layer 5 footer controls");
    await assertTouchScrollPausesAndPlayResumes(page, dialog);

    await touchTap(page, dialog.locator("[data-credential-prev]"), "Mobile Back");
    await waitForStage(page, stages, 3);
    await assertClosedAfterMobileSelection(dialog, "Mobile Back");
    await settleAndAssertStage(page, dialog, 3);
    await assertPaused(dialog, "Mobile Back navigation should remain manually paused.");
    await touchTap(page, dialog.locator("[data-credential-forward]"), "Mobile Next");
    await waitForStage(page, stages, 4);
    await settleAndAssertStage(page, dialog, 4);
    await assertPaused(dialog, "Mobile Next navigation should remain manually paused.");

    await navigateToOutcome(page, dialog, stages);
    await assertMobileNavigationTargets(dialog, "Institutional outcome controls");
    await assertNoHorizontalOverflow(page, dialog, "mobile 390px institutional outcome");
    await assertFooterControlsAndCta(dialog, "Phone 390x844 Outcome footer controls");
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "mobile-outcome-390.png") });
    await touchTap(page, dialog.locator("[data-credential-forward]"), "Mobile outcome restart");
    await waitForStage(page, stages, 0);
    await settleAndAssertStage(page, dialog, 0);

    await reopenMobileAtViewport(
      page, dialog, opener, stages, { width: 320, height: 844 }, "Narrow 320px opening", initialOverflow,
    );
    await assertNoHorizontalOverflow(page, dialog, "narrow 320px");
    await assertMobileDisclosureDefaults(dialog);
    await assertFooterControlsAndCta(dialog, "Phone 320x844 opening viewport");
    await assertPhoneReadingPosition(dialog, "Narrow 320px opening viewport");
    await assertPlaybackButtonTransitions(dialog, "Phone 320x844 footer playback controls");
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "mobile-opening-320.png") });
    const narrowSpecimenDetails = await nearestDetails(dialog.locator(".credential-readable__specimen"));
    await openDisclosureFor(dialog.locator(".credential-readable__specimen"), "Narrow mobile specimen");
    await assertFullSpecimenExpanded(dialog);
    await assertNoHorizontalOverflow(page, dialog, "narrow 320px expanded specimen");
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "mobile-specimen-expanded-320.png") });
    await narrowSpecimenDetails.locator("summary").first().click();
    await assertDisclosureState(narrowSpecimenDetails, false, "Narrow mobile specimen after collapse");
    await openDisclosureFor(layerButtons.first(), "Narrow mobile layer choices");
    await assertVisibleNavigation(dialog);
    await assertNoHorizontalOverflow(page, dialog, "narrow 320px expanded layer menu");
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "mobile-menu-expanded-320.png") });
    await captureStage(page, dialog, stages, 2, "mobile-verification-320.png");
    await captureStage(page, dialog, stages, 4, "mobile-stage-5-320.png");
    await assertMobileNavigationTargets(dialog, "Narrow Layer 5 mid-article controls");
    await assertFooterControlsAndCta(dialog, "Phone 320x844 Layer 5 footer controls");
    await clickThroughDisclosure(dialog.locator("[data-credential-outcome]"), "Narrow mobile Outcome navigation");
    await waitForStage(page, stages, 6);
    await assertClosedAfterMobileSelection(dialog, "Narrow mobile Outcome selection", { expectSummaryFocus: true });
    await settleAndAssertStage(page, dialog, 6);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "mobile-outcome-320.png") });
    await assertNoHorizontalOverflow(page, dialog, "narrow 320px institutional outcome");
    await assertFooterControlsAndCta(dialog, "Phone 320x844 Outcome footer controls");
    await touchTap(page, dialog.locator("[data-credential-forward]"), "Narrow mobile outcome restart");
    await waitForStage(page, stages, 0);
    await settleAndAssertStage(page, dialog, 0);

    await reopenMobileAtViewport(
      page, dialog, opener, stages, { width: 390, height: 667 }, "Compact 390x667 opening", initialOverflow,
    );
    await assertNoHorizontalOverflow(page, dialog, "compact 390x667");
    await assertMobileDisclosureDefaults(dialog);
    await assertFooterControlsAndCta(dialog, "Compact phone 390x667 opening viewport");
    await assertPhoneReadingPosition(dialog, "Compact 390x667 opening viewport");
    await assertFocusIndicator(dialog, 0);
    await assertPlaybackButtonTransitions(dialog, "Compact phone 390x667 footer playback controls");
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "mobile-compact-390x667.png") });

    await reopenMobileAtViewport(
      page, dialog, opener, stages, { width: 844, height: 390 }, "Landscape 844x390 opening", initialOverflow,
    );
    await assertCoarsePointer(page, "Landscape phone 844x390");
    await assertNoHorizontalOverflow(page, dialog, "landscape 844x390");
    await assertMobileDisclosureDefaults(dialog);
    await assertFooterControlsAndCta(dialog, "Landscape phone 844x390 opening viewport");
    await assertPhoneReadingPosition(dialog, "Landscape phone opening viewport");
    await assertFocusIndicator(dialog, 0);
    await assertPlaybackButtonTransitions(dialog, "Landscape phone 844x390 footer playback controls");
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "mobile-landscape-opening-844x390.png") });
    await captureStage(page, dialog, stages, 4, "mobile-landscape-stage-5-844x390.png");
    await assertMobileNavigationTargets(dialog, "Landscape phone Layer 5 controls");
    await assertFooterControlsAndCta(dialog, "Landscape phone 844x390 Layer 5 footer controls");
    await assertTouchScrollPausesAndPlayResumes(page, dialog);
    await assertNoHorizontalOverflow(page, dialog, "landscape 844x390 Layer 5");
    await assertAllSevenMobileMenuChoices(page, dialog, stages, "Coarse landscape 844x390");

    await reopenMobileAtViewport(
      page, dialog, opener, stages, { width: 568, height: 320 }, "Compact landscape 568x320 opening", initialOverflow,
    );
    await assertCoarsePointer(page, "Compact landscape 568x320");
    await assertNoHorizontalOverflow(page, dialog, "compact landscape 568x320");
    await assertMobileDisclosureDefaults(dialog);
    await assertFooterControlsAndCta(dialog, "Compact landscape 568x320 opening viewport");
    await assertPhoneReadingPosition(dialog, "Compact landscape 568x320 opening viewport");
    await assertFocusIndicator(dialog, 0);
    await assertPlaybackButtonTransitions(dialog, "Compact landscape 568x320 footer playback controls");
    await assertAllSevenMobileMenuChoices(page, dialog, stages, "Coarse compact 568x320");

    await dialog.locator("button[data-credential-close]").click();
    await dialog.waitFor({ state: "hidden", timeout: TIMEOUT_MS });
    const closeResult = await page.evaluate(() => ({
      focusIsOpener: document.activeElement?.matches("[data-credential-open]") || false,
      overflow: document.body.style.overflow,
    }));
    assert(closeResult.focusIsOpener, "Mobile close did not restore focus to the homepage opener.");
    assert(closeResult.overflow === initialOverflow, "Mobile close did not restore the page's original body overflow.");
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
    const { stages } = await assertSixOrderedLayers(dialog);
    const sharedStoryUrl = await assertShareUrls(dialog);
    await waitForStage(page, stages, 0);
    await assertPaused(dialog, "Reduced-motion preference should open the walkthrough paused.");
    await assertIntroShareClipboardFallback(page, dialog, sharedStoryUrl);
    await dialog.locator("[data-credential-step-to]").nth(3).click();
    await waitForStage(page, stages, 3);
    await assertPaused(dialog, "Interaction under reduced motion should remain paused.");
    await assertSkillsLayerQualifier(dialog);
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
    const layerButtons = dialog.locator("[data-credential-step-to]");
    const outcomeButton = dialog.locator("[data-credential-outcome]");
    await assertCurrentStage(stages, 0);
    await assertPresentationVisual(dialog, "Initial Layer 1");
    await assertPlaying(dialog, "Autoplay-loop test should begin on the first layer.");

    for (let nextIndex = 1; nextIndex <= 6; nextIndex += 1) {
      await advanceClockToPanel(page, dialog, stages, nextIndex);
    }
    await advanceClockToPanel(page, dialog, stages, 0);

    await layerButtons.nth(3).click();
    await assertCurrentStage(stages, 3);
    await assertPaused(dialog, "Manual layer navigation should pause autoplay.");
    const pausedLayerDwell = await currentPanelDwellMs(dialog);
    await page.clock.runFor(pausedLayerDwell * 2 + 100);
    await assertCurrentStage(stages, 3);
    await assertPaused(dialog, "Autoplay advanced after manual layer navigation paused it.");

    assert(await outcomeButton.count() === 1, "Expected the dedicated institutional Outcome navigation button.");
    await outcomeButton.click();
    await assertCurrentStage(stages, 6);
    await assertOutcomeCountLabel(dialog);
    await assertOutcomeVisual(dialog, true);
    await assertPaused(dialog, "Selecting the institutional Outcome should keep manual navigation paused.");
    const pausedOutcomeDwell = await currentPanelDwellMs(dialog);
    await page.clock.runFor(pausedOutcomeDwell * 2 + 100);
    await assertCurrentStage(stages, 6);
    await assertPaused(dialog, "The paused institutional Outcome should not advance before Play is pressed.");

    await dialog.locator("[data-credential-pause]").click();
    await assertCurrentStage(stages, 6);
    await assertPlaying(dialog, "Play should resume on the Outcome rather than immediately skipping it.");
    await advanceClockToPanel(page, dialog, stages, 0);
  } finally {
    await context.close();
  }
}

async function validateExploredLayerNavigation(browser, clientErrors) {
  for (const viewport of [
    { width: 1280, height: 900 },
    { width: 390, height: 844 },
    { width: 844, height: 390 },
  ]) {
    const phone = viewport.width !== 1280;
    const context = await browser.newContext({
      viewport, isMobile: phone, hasTouch: phone, deviceScaleFactor: 1,
    });
    const page = await context.newPage();
    trackClientErrors(page, clientErrors);
    try {
      await page.goto(BASE_URL, { waitUntil: "domcontentloaded", timeout: TIMEOUT_MS });
      const { dialog } = await openDialog(page);
      const stages = dialog.locator("[data-credential-stage]");
      const cards = dialog.locator("[data-credential-revisit]");
      assert(await cards.count() === 6, "Each of the six layer cards must support reopening its explanation.");
      assert(await cards.evaluateAll((buttons) => buttons.every((button) =>
        button.tagName === "BUTTON" && /open layer/i.test(button.getAttribute("aria-label") || ""))),
      "Layer cards must be real, meaningfully labelled keyboard-accessible buttons.");
      for (let index = 0; index < 6; index += 1) {
        await clickThroughDisclosure(dialog.locator("[data-credential-outcome]"), "Open outcome to revisit a layer");
        await waitForStage(page, stages, 6);
        await page.waitForTimeout(450);
        assert(/VALUE BEYOND THE CERTIFICATE/.test(await dialog.locator(".credential-readable__past-heading").innerText()),
          "Connected capabilities must have a buyer-focused section title.");
        const card = dialog.locator(`[data-credential-revisit="${index}"]`);
        if (phone) await card.tap();
        else if (index === 2) {
          await card.focus();
          await card.press("Enter");
        } else await card.click();
        await waitForStage(page, stages, index);
        await page.waitForTimeout(450);
        await assertPaused(dialog, "Revisiting a layer must pause autoplay for reading.");
        await assertFocusIndicator(dialog, index);
        assert(await stages.nth(index).locator("h3").evaluate((heading) => document.activeElement === heading),
          "Revisiting a layer must put keyboard/screen-reader focus on its explanation.");
        if (phone) await assertPhoneReadingPosition(dialog, `Revisited phone layer ${index + 1}`);
      }
    } finally {
      await context.close();
    }
  }
}

async function main() {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  const clientErrors = [];
  const browser = await chromium.launch({ headless: true, executablePath: browserExecutable() });

  try {
    console.log("Checking desktop layouts and readability...");
    await validateDesktop(browser, clientErrors);
    await validateShortDesktop(browser, clientErrors);
    console.log("Checking portrait and landscape phone layouts...");
    await validateMobile(browser, clientErrors);
    console.log("Checking all six capability links...");
    await validateExploredLayerNavigation(browser, clientErrors);
    console.log("Checking sharing, motion preferences and autoplay...");
    await validateShareUrlAndReducedMotion(browser, clientErrors);
    await validateMotionPreferenceChange(browser, clientErrors);
    await validateFinalAutoplayLoop(browser, clientErrors);
  } finally {
    await browser.close();
  }

  assert(clientErrors.length === 0, `Client JavaScript errors detected:\n${clientErrors.join("\n")}`);
  console.log("Credential walkthrough validation passed: six layers and an unnumbered outcome, responsive layout, progressive reveals, navigation/focus, motion preferences, autoplay loop/resume, and share URL.");
  console.log(`Screenshots saved to ${SCREENSHOT_DIR}.`);
}

main().catch((error) => {
  console.error(`Credential walkthrough validation failed: ${error.message}`);
  process.exitCode = 1;
});