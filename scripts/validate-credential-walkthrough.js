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

async function assertCurrentStage(stages, index) {
  const active = await activeStageIndex(stages);
  assert(active === index, `Expected walkthrough panel ${index + 1}; active panel was ${active + 1}.`);
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

async function assertPresentationVisual(dialog, label) {
  await assertVisualInModalViewport(dialog, "[data-credential-presentation-visual]", label, {
    requireModalViewportOverlap: true,
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
      layerButtonCount: layerButtons.length,
      outcomeButtonCount: outcomeButtons.length,
    };
  });
  assert(
    measurements.paragraphs.length > 0 && measurements.paragraphs.every((size) => size >= 14),
    `${label}: active narrative paragraphs must render at least 14px; got ${JSON.stringify(measurements.paragraphs)}.`,
  );
  assert(
    measurements.layerButtonCount === 6
      && measurements.outcomeButtonCount <= 1
      && measurements.navButtons.every((size) => size >= 12),
    `${label}: all layer and Outcome navigation buttons must render at least 12px; got ${JSON.stringify(measurements.navButtons)}.`,
  );
}

async function assertWorkspaceStartsNearHeader(dialog, label) {
  const gap = await dialog.evaluate((element) => {
    const header = element.querySelector(".credential-modal__header");
    const workspace = element.querySelector(".credential-university__workspace")
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

async function assertLayerCountLabel(dialog, layerIndex) {
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

async function assertPresentationNarrative(dialog) {
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
    visible: (button.innerText || "").replace(/\s+/g, " ").trim(),
    accessible: button.getAttribute("aria-label") || "",
  })));
  assert(
    labels.every((label, index) => matchesLayerLabel(label.visible, index)),
    `Six visible layer buttons must be meaningfully labelled Presentation & Sharing, Standardisation, Trust & Verification, Skills & Taxonomy, Learner Record, and Workforce & Career (not just numbers): ${JSON.stringify(labels)}.`,
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
    assert(await button.isVisible(), "Dedicated Outcome navigation button is not visible.");
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

async function assertVisibleNavigation(dialog) {
  const close = dialog.locator("button[data-credential-close]").first();
  const directSteps = dialog.locator("[data-credential-step-to]");
  assert(await close.isVisible(), "Walkthrough close button is not visible.");
  assert(await directSteps.first().isVisible(), "Walkthrough direct-step navigation is not visible.");
  const visibility = await directSteps.evaluateAll((buttons) => buttons.map(
    (button) => button.getClientRects().length > 0 && getComputedStyle(button).display !== "none",
  ));
  assert(visibility.length === 6 && visibility.every(Boolean), "All six layer navigation buttons must be visible.");
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

async function assertShareUrls(dialog) {
  const storyUrl = new URL("/", BASE_URL);
  storyUrl.searchParams.set("story", "certificate");
  const links = await dialog.locator("[data-credential-social]").evaluateAll((elements) => elements.map((link) => ({
    href: link.href,
    label: link.getAttribute("aria-label") || (link.innerText || "").trim(),
  })));
  const shareActions = await dialog.locator("[data-credential-share]").count();
  assert(
    links.length > 0 || shareActions > 0,
    "Walkthrough must provide a share action for the fictional story URL.",
  );
  for (const link of links) {
    let target;
    try {
      target = new URL(link.href);
    } catch {
      throw new Error(`Share link ${JSON.stringify(link.label)} has an invalid URL: ${JSON.stringify(link.href)}.`);
    }
    assert(
      target.searchParams.get("url") === storyUrl.href,
      `Share link ${JSON.stringify(link.label)} must carry the fictional walkthrough URL ${storyUrl.href}; got ${link.href}.`,
    );
  }
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
  if (stageIndex <= 5) {
    await assertLayerCountLabel(dialog, stageIndex);
    await assertCumulativeReveals(dialog, stageIndex);
    await assertCurrentRevealInModalViewport(dialog, stageIndex);
    if (stageIndex === 0) await assertPresentationVisual(dialog, "Layer 1");
  } else {
    await assertOutcomeCountLabel(dialog);
    await assertCumulativeReveals(dialog, 5);
    await assertActiveNarrativeInModalViewport(dialog);
    await assertOutcomeVisual(dialog);
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
    await outcomeButton.click();
  } else {
    await dialog.locator("[data-credential-forward]").click();
  }
  await waitForStage(page, stages, 6);
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

    await assertPlaying(dialog, "A fresh open should still be autoplaying before footer focus.");
    await page.keyboard.press("Shift+Tab");
    const focusedFooterCta = await dialog.evaluate((element) => {
      const cta = element.querySelector(".credential-modal__footer a[href]");
      return Boolean(cta && document.activeElement === cta);
    });
    assert(focusedFooterCta, "Shift+Tab from the initial Close button did not wrap to the footer/demo CTA.");
    await assertPaused(dialog, "Focusing the footer CTA should pause autoplay.");
    await assertTabTrap(page, dialog);

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
    const { stages } = await assertSixOrderedLayers(dialog);
    await assertVisibleNavigation(dialog);
    await assertNoFileInputsOrLiveJobs(dialog);
    await assertCertificateLoaded(page, dialog);
    await assertNoHorizontalOverflow(page, dialog, "mobile 390px");
    await assertWorkspaceStartsNearHeader(dialog, "mobile 390px");
    await assertReadableTypography(dialog, "mobile 390px");
    await captureStage(page, dialog, stages, 4, "mobile-stage-5.png");
    await navigateToOutcome(page, dialog, stages);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "mobile-outcome.png") });

    await page.setViewportSize({ width: 320, height: 844 });
    await assertNoHorizontalOverflow(page, dialog, "narrow 320px");
    await assertVisibleNavigation(dialog);
    await dialog.locator("[data-credential-step-to]").nth(4).click();
    await waitForStage(page, stages, 4);
    await settleAndAssertStage(page, dialog, 4);
    await assertNoHorizontalOverflow(page, dialog, "narrow 320px learner record");
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
    const { stages } = await assertSixOrderedLayers(dialog);
    await assertShareUrls(dialog);
    await waitForStage(page, stages, 0);
    await assertPaused(dialog, "Reduced-motion preference should open the walkthrough paused.");
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
  console.log("Credential walkthrough validation passed: six layers and an unnumbered outcome, responsive layout, progressive reveals, navigation/focus, motion preferences, autoplay loop/resume, and share URL.");
  console.log(`Screenshots saved to ${SCREENSHOT_DIR}.`);
}

main().catch((error) => {
  console.error(`Credential walkthrough validation failed: ${error.message}`);
  process.exitCode = 1;
});