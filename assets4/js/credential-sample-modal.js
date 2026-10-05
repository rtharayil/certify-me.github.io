(function () {
  "use strict";

  var dialog = document.getElementById("credential-sample-dialog");
  var opener = document.querySelector("[data-credential-open]");
  if (!dialog) return;

  var panel = dialog.querySelector(".credential-modal__panel");
  var tour = dialog.querySelector("[data-credential-tour]");
  var workspace = dialog.querySelector("[data-active-step]");
  var ecosystem = dialog.querySelector(".credential-ecosystem");
  var currentVisual = dialog.querySelector("[data-credential-current-visual]");
  var past = dialog.querySelector(".credential-readable__past");
  var presentationVisual = dialog.querySelector("[data-credential-presentation-visual]");
  var outcomeVisual = dialog.querySelector("[data-credential-outcome-visual]");
  var stages = Array.prototype.slice.call(dialog.querySelectorAll("[data-credential-stage]"));
  var reveals = Array.prototype.slice.call(dialog.querySelectorAll("[data-reveal-index]"));
  var layers = Array.prototype.slice.call(dialog.querySelectorAll("[data-credential-step-to]"));
  var layerNames = layers.map(function (layer) {
    return layer.textContent.replace(/^\s*\d+\s*/, "").trim();
  });
  var focusTitle = dialog.querySelector("[data-credential-focus-title]");
  var focusNext = dialog.querySelector("[data-credential-focus-next]");
  var outcomeButton = dialog.querySelector("[data-credential-outcome]");
  var pauseButton = dialog.querySelector("[data-credential-pause]");
  var previousButton = dialog.querySelector("[data-credential-prev]");
  var forwardButton = dialog.querySelector("[data-credential-forward]");
  var count = dialog.querySelector("[data-credential-count]");
  var pace = dialog.querySelector("[data-credential-pace]");
  var filmline = dialog.querySelector("[data-credential-filmline]");
  var shareStatus = dialog.querySelector("[data-credential-share-status]");
  var header = dialog.querySelector(".credential-modal__header");
  var footer = dialog.querySelector(".credential-modal__footer");
  var specimen = dialog.querySelector(".credential-readable__specimen");
  var specimenDisclosure = dialog.querySelector(".credential-readable__specimen-disclosure");
  var layerPicker = dialog.querySelector(".credential-readable__layer-picker");
  var choiceCurrent = dialog.querySelector("[data-credential-choice-current]");
  var previousFocus = null;
  var previousOverflow = "";
  var current = 0;
  var paused = false;
  var timer = null;
  var readingTouch = null;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  var mobileLayout = window.matchMedia("(max-width: 620px), (max-width: 950px) and (max-height: 500px) and (pointer: coarse)");
  var homepageSingleColumnLayout = window.matchMedia("(max-width: 900px)");
  var homepageReadingLayout = document.body.classList.contains("homepage-audited");
  var storyUrl = new URL("/", window.location.origin);
  storyUrl.searchParams.set("story", "certificate");
  var storyText = "Explore how CertifyMe connects university credentials, skills, learner records and career opportunities.";

  var dwellByPanel = [10400, 12000, 17600, 12000, 12000, 12800, 12800];

  function clearTourTimer() {
    if (timer !== null) window.clearTimeout(timer);
    timer = null;
  }

  function currentDwell() {
    return dwellByPanel[current] || 12000;
  }

  function syncHeaderHeight() {
    if (!dialog.hidden) {
      dialog.style.setProperty("--read-header-height", Math.ceil(header.getBoundingClientRect().height) + "px");
      dialog.style.setProperty("--read-footer-height", Math.ceil(footer.getBoundingClientRect().height) + "px");
    }
  }

  function updateControls() {
    var isOutcome = current === stages.length - 1;
    count.textContent = isOutcome
      ? "Institutional outcome"
      : "Layer " + String(current + 1).padStart(2, "0") + " of " + String(layers.length).padStart(2, "0");
    var nextName = isOutcome ? layerNames[0]
      : current === layers.length - 1 ? "Institutional outcome" : layerNames[current + 1];
    focusTitle.textContent = isOutcome
      ? (mobileLayout.matches ? "Institutional outcome" : "Viewing the institutional outcome")
      : (mobileLayout.matches
        ? count.textContent + " · " + layerNames[current]
        : "Viewing " + count.textContent.toLowerCase() + " · " + layerNames[current]);
    if (choiceCurrent) choiceCurrent.textContent = isOutcome ? "Institutional outcome" : layerNames[current];
    focusNext.textContent = mobileLayout.matches
      ? (paused ? "Paused · " : "Auto · ") + (isOutcome ? "Loop: " : "Next: ") + nextName
      : (paused ? "Paused · " : "Auto-playing · ") +
        (isOutcome ? "Loops back to: " : "Next: ") + nextName +
        (paused ? " · Press Play to continue" : "");
    if (current === 0 && document.activeElement === previousButton) forwardButton.focus();
    previousButton.disabled = current === 0;
    forwardButton.textContent = isOutcome
      ? "Restart walkthrough ↺"
      : current === layers.length - 1 ? "Institutional outcome →" : "Next layer →";
    pauseButton.textContent = paused ? "Play" : "Pause";
    pauseButton.setAttribute("aria-label", paused ? "Play walkthrough" : "Pause walkthrough");
    pace.textContent = paused ? "Paused" : "Auto-playing";
    dialog.classList.toggle("is-paused", paused);
    filmline.style.animationPlayState = paused ? "paused" : "running";
    layers.forEach(function (layer, index) {
      if (!isOutcome && index === current) layer.setAttribute("aria-current", "true");
      else layer.removeAttribute("aria-current");
    });
    if (outcomeButton) {
      if (isOutcome) outcomeButton.setAttribute("aria-current", "true");
      else outcomeButton.removeAttribute("aria-current");
    }
    syncHeaderHeight();
  }

  function restartFilmline() {
    filmline.style.animation = "none";
    void filmline.offsetWidth;
    if (!reduceMotion.matches) {
      filmline.style.animation = "readable-timer " + currentDwell() + "ms linear forwards";
      filmline.style.animationPlayState = paused ? "paused" : "running";
    }
  }

  function bringIntoReadableView(target) {
    var bounds = target.getBoundingClientRect();
    var panelBounds = panel.getBoundingClientRect();
    var headerBottom = header.getBoundingClientRect().bottom;
    var safeTop = Math.max(panelBounds.top, headerBottom) + 12;
    var safeBottom = Math.min(panelBounds.bottom, footer.getBoundingClientRect().top) - 12;
    if (mobileLayout.matches) {
      var pickerSummary = layerPicker && layerPicker.querySelector("summary");
      if (pickerSummary) safeTop = Math.max(safeTop, headerBottom + pickerSummary.getBoundingClientRect().height + 22);
      var targetBounds = target.getBoundingClientRect();
      var stage = target.closest(".credential-readable__stage");
      var firstParagraph = stage && stage.querySelector("p:not(.credential-readable__note):not(.credential-readable__critical)");
      var readingBottom = firstParagraph ? firstParagraph.getBoundingClientRect().bottom : targetBounds.bottom;
      var available = Math.max(0, safeBottom - safeTop);
      var readingHeight = readingBottom - targetBounds.top;
      var desiredTop = readingHeight <= available ? safeTop : Math.max(safeTop, safeBottom - readingHeight);
      // Keep the heading and opening paragraph between the sticky picker and footer.
      if (targetBounds.top < safeTop || readingBottom > safeBottom) {
        panel.scrollBy({ top: targetBounds.top - desiredTop, behavior: "auto" });
      }
      return;
    }
    var available = Math.max(0, safeBottom - safeTop);
    var delta = 0;
    if (bounds.height > available || bounds.top < safeTop) delta = bounds.top - safeTop;
    else if (bounds.bottom > safeBottom) delta = bounds.bottom - safeBottom;
    if (delta) panel.scrollBy({ top: delta, behavior: reduceMotion.matches ? "auto" : "smooth" });
  }

  function shouldRevealStageHeading() {
    return mobileLayout.matches || (homepageReadingLayout && homepageSingleColumnLayout.matches);
  }

  function showPanel(index, revealInView) {
    current = (index + stages.length) % stages.length;
    var isOutcome = current === stages.length - 1;
    var isPresentation = current === 0;
    workspace.setAttribute("data-active-step", String(current));

    stages.forEach(function (stage, stageIndex) {
      stage.hidden = stageIndex !== current;
    });

    ecosystem.appendChild(presentationVisual);
    presentationVisual.hidden = false;
    presentationVisual.classList.toggle("is-current-reveal", isPresentation);
    presentationVisual.classList.toggle("is-past-reveal", !isPresentation);
    if (isPresentation) currentVisual.appendChild(presentationVisual);

    reveals.forEach(function (layer) {
      var revealIndex = Number(layer.getAttribute("data-reveal-index"));
      ecosystem.appendChild(layer);
      var active = !isOutcome && revealIndex === current;
      var past = isOutcome || revealIndex < current;
      layer.hidden = !active && !past;
      layer.classList.toggle("is-current-reveal", active);
      layer.classList.toggle("is-past-reveal", past);
      if (active) currentVisual.appendChild(layer);
    });

    ecosystem.appendChild(outcomeVisual);
    outcomeVisual.hidden = !isOutcome;
    if (isOutcome) currentVisual.appendChild(outcomeVisual);
    currentVisual.hidden = false;
    past.hidden = isPresentation;

    restartFilmline();
    updateControls();
    if (revealInView) {
      window.requestAnimationFrame(function () {
        var activeStage = stages[current];
        var stageHeading = activeStage.querySelector("h3, h2");
        bringIntoReadableView(shouldRevealStageHeading() ? (stageHeading || currentVisual) : currentVisual);
      });
    }
  }

  function syncDisclosureMode(event) {
    var isMobile = event ? event.matches : mobileLayout.matches;
    if (specimenDisclosure) specimenDisclosure.open = !isMobile;
    if (layerPicker) layerPicker.open = !isMobile;
    if (!dialog.hidden && isMobile) {
      window.requestAnimationFrame(function () {
        bringIntoReadableView(stages[current].querySelector("h3"));
      });
    }
  }

  function syncViewport() {
    syncHeaderHeight();
    if (dialog.hidden || !shouldRevealStageHeading()) return;
    window.requestAnimationFrame(function () {
      var heading = stages[current].querySelector("h3");
      if (heading) bringIntoReadableView(heading);
    });
  }

  function advanceAfter(delay) {
    clearTourTimer();
    if (paused || dialog.hidden) return;
    timer = window.setTimeout(function () {
      showPanel(current === stages.length - 1 ? 0 : current + 1, true);
      advanceAfter(currentDwell());
    }, delay);
  }

  function pauseTour() {
    paused = true;
    clearTourTimer();
    updateControls();
  }

  function pauseForReadingGesture(event) {
    if (!mobileLayout.matches || dialog.hidden || paused) return;
    if (event.type === "touchstart") {
      var target = event.target;
      readingTouch = {
        y: event.touches.length ? event.touches[0].clientY : 0,
        interactive: target && target.closest && !!target.closest("[data-credential-pause]")
      };
      return;
    }
    if (event.type === "touchend" || event.type === "touchcancel") {
      readingTouch = null;
      return;
    }
    if (event.type === "touchmove") {
      if (!readingTouch || readingTouch.interactive || !event.touches.length) return;
      if (Math.abs(event.touches[0].clientY - readingTouch.y) > 8) pauseTour();
      return;
    }
    if (event.type === "wheel" && Math.abs(event.deltaY) > 2) {
      var wheelTarget = event.target;
      if (!(wheelTarget && wheelTarget.closest && wheelTarget.closest("[data-credential-pause]"))) pauseTour();
    }
  }

  function open() {
    if (!dialog.hidden) return;
    syncDisclosureMode();
    previousFocus = document.activeElement;
    previousOverflow = document.body.style.overflow;
    dialog.hidden = false;
    document.body.style.overflow = "hidden";
    paused = reduceMotion.matches;
    showPanel(0, false);
    panel.scrollTop = 0;
    dialog.querySelector(".credential-modal__close").focus({ preventScroll: true });
    window.requestAnimationFrame(function () {
      if (!dialog.hidden && shouldRevealStageHeading()) {
        bringIntoReadableView(stages[current].querySelector("h3"));
      }
    });
    if (!paused) timer = window.setTimeout(function () {
      showPanel(1, true);
      advanceAfter(currentDwell());
    }, currentDwell());
  }

  function close() {
    clearTourTimer();
    dialog.hidden = true;
    document.body.style.overflow = previousOverflow;
    if (previousFocus && typeof previousFocus.focus === "function") previousFocus.focus();
  }

  if (opener) opener.addEventListener("click", open);
  window.addEventListener("resize", syncViewport);
  if (typeof ResizeObserver === "function") {
    var stickyBoundsObserver = new ResizeObserver(syncHeaderHeight);
    stickyBoundsObserver.observe(header);
    stickyBoundsObserver.observe(footer);
  }
  panel.addEventListener("touchstart", pauseForReadingGesture, { passive: true });
  panel.addEventListener("touchmove", pauseForReadingGesture, { passive: true });
  panel.addEventListener("touchend", pauseForReadingGesture, { passive: true });
  panel.addEventListener("touchcancel", pauseForReadingGesture, { passive: true });
  panel.addEventListener("wheel", pauseForReadingGesture, { passive: true });
  syncDisclosureMode();
  if (typeof mobileLayout.addEventListener === "function") {
    mobileLayout.addEventListener("change", syncDisclosureMode);
  } else if (typeof mobileLayout.addListener === "function") {
    mobileLayout.addListener(syncDisclosureMode);
  }
  dialog.querySelectorAll("[data-credential-close]").forEach(function (element) {
    element.addEventListener("click", close);
  });

  layers.forEach(function (button, index) {
    button.addEventListener("click", function () {
      pauseTour();
      showPanel(index, true);
      if (layerPicker && mobileLayout.matches) {
        layerPicker.open = false;
        layerPicker.querySelector("summary").focus({ preventScroll: true });
      }
    });
  });

  dialog.querySelectorAll("[data-credential-revisit]").forEach(function (button) {
    button.addEventListener("click", function () {
      pauseTour();
      showPanel(Number(button.getAttribute("data-credential-revisit")), false);
      var heading = stages[current].querySelector("h3");
      heading.setAttribute("tabindex", "-1");
      heading.focus({ preventScroll: true });
      window.requestAnimationFrame(function () {
        bringIntoReadableView(heading);
      });
    });
  });

  if (outcomeButton) {
    outcomeButton.addEventListener("click", function () {
      pauseTour();
      showPanel(stages.length - 1, true);
      if (layerPicker && mobileLayout.matches) {
        layerPicker.open = false;
        layerPicker.querySelector("summary").focus({ preventScroll: true });
      }
    });
  }

  previousButton.addEventListener("click", function () {
    if (current > 0) {
      pauseTour();
      showPanel(current - 1, true);
    }
  });

  forwardButton.addEventListener("click", function () {
    pauseTour();
    showPanel(current === stages.length - 1 ? 0 : current + 1, true);
  });

  pauseButton.addEventListener("click", function () {
    if (paused) {
      paused = false;
      updateControls();
      restartFilmline();
      advanceAfter(currentDwell());
    } else {
      pauseTour();
    }
  });

  tour.addEventListener("focusin", function (event) {
    if (!event.target.closest("[data-credential-pause]")) pauseTour();
  });
  specimen.addEventListener("focusin", pauseTour);
  footer.addEventListener("focusin", function (event) {
    if (!event.target.closest("[data-credential-pause]")) pauseTour();
  });

  function handleMotionPreferenceChange(event) {
    if (event.matches) pauseTour();
  }
  if (typeof reduceMotion.addEventListener === "function") {
    reduceMotion.addEventListener("change", handleMotionPreferenceChange);
  } else if (typeof reduceMotion.addListener === "function") {
    reduceMotion.addListener(handleMotionPreferenceChange);
  }

  async function copyStoryLink() {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(storyUrl.href);
      } else {
        var field = document.createElement("textarea");
        field.value = storyUrl.href;
        field.style.position = "fixed";
        field.style.opacity = "0";
        document.body.appendChild(field);
        field.select();
        var copied = document.execCommand("copy");
        field.remove();
        if (!copied) throw new Error("Copy unavailable");
      }
      shareStatus.textContent = "Tour link copied.";
    } catch (error) {
      shareStatus.textContent = "Could not copy the tour link in this browser.";
    }
  }

  dialog.querySelectorAll("[data-credential-share]").forEach(function (button) {
    button.addEventListener("click", async function () {
      pauseTour();
      if (button.getAttribute("data-credential-share") === "copy" || !navigator.share) {
        await copyStoryLink();
        return;
      }
      try {
        await navigator.share({
          title: "University credential walkthrough · CertifyMe",
          text: storyText,
          url: storyUrl.href
        });
        shareStatus.textContent = "Tour link shared.";
      } catch (error) {
        var errorName = error && typeof error === "object" ? error.name : undefined;
        if (errorName !== "AbortError") await copyStoryLink();
      }
    });
  });

  if (new URLSearchParams(window.location.search).get("story") === "certificate") open();

  dialog.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      event.preventDefault();
      close();
      return;
    }
    if (event.key !== "Tab") return;

    var focusable = Array.prototype.slice.call(
      dialog.querySelectorAll('button:not([disabled]), a[href], summary, input, [tabindex="0"]')
    ).filter(function (element) {
      return !element.closest("[hidden]") && element.getClientRects().length > 0;
    });
    if (!focusable.length) {
      event.preventDefault();
      panel.focus();
      return;
    }
    var first = focusable[0];
    var last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });
})();