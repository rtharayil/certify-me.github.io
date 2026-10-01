(function () {
  "use strict";

  var dialog = document.getElementById("credential-sample-dialog");
  var opener = document.querySelector("[data-credential-open]");
  if (!dialog || !opener) return;

  var panel = dialog.querySelector(".credential-modal__panel");
  var tour = dialog.querySelector("[data-credential-tour]");
  var workspace = dialog.querySelector("[data-active-step]");
  var ecosystem = dialog.querySelector(".credential-ecosystem");
  var currentVisual = dialog.querySelector("[data-credential-current-visual]");
  var stages = Array.prototype.slice.call(dialog.querySelectorAll("[data-credential-stage]"));
  var reveals = Array.prototype.slice.call(dialog.querySelectorAll("[data-reveal-index]"));
  var steps = Array.prototype.slice.call(dialog.querySelectorAll("[data-credential-step-to]"));
  var pauseButton = dialog.querySelector("[data-credential-pause]");
  var previousButton = dialog.querySelector("[data-credential-prev]");
  var forwardButton = dialog.querySelector("[data-credential-forward]");
  var count = dialog.querySelector("[data-credential-count]");
  var pace = dialog.querySelector("[data-credential-pace]");
  var filmline = dialog.querySelector("[data-credential-filmline]");
  var shareStatus = dialog.querySelector("[data-credential-share-status]");
  var previousFocus = null;
  var previousOverflow = "";
  var current = 0;
  var paused = false;
  var timer = null;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  var storyUrl = new URL("/", window.location.origin);
  storyUrl.searchParams.set("story", "certificate");
  var storyText = "Explore a fictional university credential and how it could connect learning, skills, records and workforce relevance. All verification and workforce views are illustrative.";

  function clearTourTimer() {
    if (timer !== null) window.clearTimeout(timer);
    timer = null;
  }

  function updateControls() {
    count.textContent = "Step " + String(current + 1).padStart(2, "0") + " of " + String(stages.length).padStart(2, "0");
    if (current === 0 && document.activeElement === previousButton) {
      forwardButton.focus();
    }
    previousButton.disabled = current === 0;
    forwardButton.textContent = current === stages.length - 1 ? "Restart ↺" : "Next →";
    pauseButton.textContent = paused ? "Play" : "Pause";
    pauseButton.setAttribute("aria-label", paused ? "Play walkthrough" : "Pause walkthrough");
    pace.textContent = paused ? "Paused · choose a step or press Play" : "Auto-playing · choose a step to take control";
    dialog.classList.toggle("is-paused", paused);
    filmline.style.animationPlayState = paused ? "paused" : "running";
  }

  function restartFilmline() {
    filmline.style.animation = "none";
    void filmline.offsetWidth;
    if (!reduceMotion.matches) {
      filmline.style.animation = "credential-scene-timer 6800ms linear forwards";
      filmline.style.animationPlayState = paused ? "paused" : "running";
    }
  }

  function showStep(index, revealInView) {
    current = (index + stages.length) % stages.length;
    workspace.setAttribute("data-active-step", String(current));
    stages.forEach(function (stage, stageIndex) {
      stage.hidden = stageIndex !== current;
    });
    reveals.forEach(function (layer) {
      var revealIndex = Number(layer.getAttribute("data-reveal-index"));
      ecosystem.appendChild(layer);
      var active = revealIndex === current;
      var past = revealIndex < current;
      layer.hidden = revealIndex > current;
      layer.classList.toggle("is-current-reveal", active);
      layer.classList.toggle("is-past-reveal", past);
      if (active) currentVisual.appendChild(layer);
    });
    currentVisual.hidden = current === 0;
    steps.forEach(function (step, stepIndex) {
      if (stepIndex === current) step.setAttribute("aria-current", "step");
      else step.removeAttribute("aria-current");
    });

    var strip = dialog.querySelector(".credential-tour__steps");
    var selected = steps[current];
    if (selected) {
      strip.scrollTo({
        left: strip.scrollLeft + selected.getBoundingClientRect().left - strip.getBoundingClientRect().left -
          (strip.clientWidth - selected.clientWidth) / 2,
        behavior: reduceMotion.matches ? "auto" : "smooth"
      });
    }
    restartFilmline();
    updateControls();
    if (revealInView) {
      window.requestAnimationFrame(function () {
        var target = currentVisual.hidden ? stages[current] : currentVisual;
        var bounds = target.getBoundingClientRect();
        var headerBottom = dialog.querySelector(".credential-modal__header").getBoundingClientRect().bottom;
        var footerTop = dialog.querySelector(".credential-modal__footer").getBoundingClientRect().top;
        var delta = bounds.bottom > footerTop - 16 ? bounds.bottom - footerTop + 16 : 0;
        if (bounds.top < headerBottom + 16) delta = bounds.top - headerBottom - 16;
        if (delta) panel.scrollBy({ top: delta, behavior: reduceMotion.matches ? "auto" : "smooth" });
      });
    }
  }

  function advanceAfter(delay) {
    clearTourTimer();
    if (paused || dialog.hidden) return;
    timer = window.setTimeout(function () {
      showStep(current + 1, true);
      advanceAfter(6800);
    }, delay);
  }

  function pauseTour() {
    paused = true;
    clearTourTimer();
    updateControls();
  }

  function open() {
    if (!dialog.hidden) return;
    previousFocus = document.activeElement;
    previousOverflow = document.body.style.overflow;
    dialog.hidden = false;
    document.body.style.overflow = "hidden";
    paused = reduceMotion.matches;
    showStep(0);
    panel.scrollTop = 0;
    dialog.querySelector(".credential-modal__close").focus();
    if (!paused) {
      timer = window.setTimeout(function () {
        showStep(1, true);
        advanceAfter(6800);
      }, 2600);
    }
  }

  function close() {
    clearTourTimer();
    dialog.hidden = true;
    document.body.style.overflow = previousOverflow;
    if (previousFocus && typeof previousFocus.focus === "function") previousFocus.focus();
  }

  opener.addEventListener("click", open);
  dialog.querySelectorAll("[data-credential-close]").forEach(function (element) {
    element.addEventListener("click", close);
  });

  steps.forEach(function (button, index) {
    button.addEventListener("click", function () {
      pauseTour();
      showStep(index, true);
    });
  });

  previousButton.addEventListener("click", function () {
    if (current > 0) {
      pauseTour();
      showStep(current - 1, true);
    }
  });

  forwardButton.addEventListener("click", function () {
    pauseTour();
    showStep(current === stages.length - 1 ? 0 : current + 1, true);
  });

  pauseButton.addEventListener("click", function () {
    if (paused) {
      paused = false;
      if (current === stages.length - 1) showStep(0);
      updateControls();
      advanceAfter(6800);
    } else {
      pauseTour();
    }
  });

  // Keyboard focus is an intentional interaction; touch scrolling alone does not pause the tour.
  tour.addEventListener("focusin", function (event) {
    if (!event.target.closest("[data-credential-pause]")) pauseTour();
  });
  dialog.querySelector(".credential-university__showcase").addEventListener("focusin", pauseTour);
  dialog.querySelector(".credential-modal__footer").addEventListener("focusin", pauseTour);

  function handleMotionPreferenceChange(event) {
    if (event.matches) pauseTour();
  }
  if (typeof reduceMotion.addEventListener === "function") {
    reduceMotion.addEventListener("change", handleMotionPreferenceChange);
  } else if (typeof reduceMotion.addListener === "function") {
    reduceMotion.addListener(handleMotionPreferenceChange);
  }

  dialog.querySelectorAll("[data-credential-social]").forEach(function (link) {
    if (link.getAttribute("data-credential-social") === "linkedin") {
      link.href = "https://www.linkedin.com/sharing/share-offsite/?url=" + encodeURIComponent(storyUrl.href);
    } else {
      link.href = "https://twitter.com/intent/tweet?url=" +
        encodeURIComponent(storyUrl.href) + "&text=" + encodeURIComponent(storyText);
    }
  });

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
      shareStatus.textContent = "Link copied. It opens this fictional university walkthrough.";
    } catch (error) {
      shareStatus.textContent = "Could not copy the link in this browser.";
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
          title: "Fictional university credential walkthrough · CertifyMe",
          text: storyText,
          url: storyUrl.href
        });
        shareStatus.textContent = "Fictional walkthrough link shared.";
      } catch (error) {
        if (error.name !== "AbortError") shareStatus.textContent = "Sharing is unavailable here. Use Copy link instead.";
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