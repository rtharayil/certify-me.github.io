(function () {
  "use strict";

  var dialog = document.getElementById("credential-sample-dialog");
  var opener = document.querySelector("[data-credential-open]");
  if (!dialog || !opener) return;

  var panel = dialog.querySelector(".credential-modal__panel");
  var tour = dialog.querySelector("[data-credential-tour]");
  var stages = Array.prototype.slice.call(dialog.querySelectorAll("[data-credential-stage]"));
  var steps = Array.prototype.slice.call(dialog.querySelectorAll("[data-credential-step-to]"));
  var pauseButton = dialog.querySelector("[data-credential-pause]");
  var previousButton = dialog.querySelector("[data-credential-prev]");
  var forwardButton = dialog.querySelector("[data-credential-forward]");
  var previousFocus = null;
  var previousOverflow = "";
  var current = 0;
  var paused = false;
  var timer = null;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  var filmline = dialog.querySelector("[data-credential-filmline]");
  var shareStatus = dialog.querySelector("[data-credential-share-status]");
  var storyUrl = new URL("/", window.location.origin);
  storyUrl.searchParams.set("story", "certificate");
  var storyText = "Explore a fictional university credential: structured award data, access controls, verification steps, and possible learning paths.";

  function clearTourTimer() {
    if (timer !== null) window.clearTimeout(timer);
    timer = null;
  }

  function updateControls() {
    dialog.querySelector("[data-credential-count]").textContent =
      "Step " + (current + 1) + " of " + stages.length;
    previousButton.disabled = current === 0;
    forwardButton.textContent = current === stages.length - 1 ? "Start again ↺" : "Next step →";
    pauseButton.textContent = paused ? "▶ Play" : "Ⅱ Pause";
    pauseButton.setAttribute("aria-label", paused ? "Play walkthrough" : "Pause walkthrough");
    dialog.querySelector("[data-credential-pace]").textContent =
      paused ? "Paused · choose a step or press Play" : "Auto-playing · select a step to pause";
    dialog.classList.toggle("is-paused", paused);
    filmline.style.animationPlayState = paused ? "paused" : "running";
  }

  function restartFilmline() {
    filmline.style.animation = "none";
    // Restart the visual timer whenever a new chapter begins.
    void filmline.offsetWidth;
    filmline.style.animation = "credential-scene-timer " +
      (current === stages.length - 1 ? "8500ms" : "6800ms") + " linear forwards";
    filmline.style.animationPlayState = paused ? "paused" : "running";
  }

  function scrollToTour(showFeature) {
    var target = showFeature && window.innerWidth <= 650 ? stages[current] : tour;
    var header = dialog.querySelector(".credential-modal__header");
    var stepHeading = target !== tour ? tour.querySelector(".credential-tour__heading") : null;
    var top = target.getBoundingClientRect().top - panel.getBoundingClientRect().top +
      panel.scrollTop - header.getBoundingClientRect().height -
      (stepHeading ? stepHeading.getBoundingClientRect().height : 0) - 10;
    panel.scrollTo({ top: Math.max(0, top), behavior: reduceMotion.matches ? "instant" : "smooth" });
  }

  function showStep(index, scroll) {
    current = index;
    stages.forEach(function (stage, i) { stage.hidden = i !== index; });
    steps.forEach(function (step, i) {
      if (i === index) step.setAttribute("aria-current", "step");
      else step.removeAttribute("aria-current");
    });
    var strip = dialog.querySelector(".credential-tour__steps");
    var selected = steps[index];
    strip.scrollTo({
      left: strip.scrollLeft + selected.getBoundingClientRect().left - strip.getBoundingClientRect().left -
        (strip.clientWidth - selected.clientWidth) / 2,
      behavior: reduceMotion.matches ? "instant" : "smooth"
    });
    restartFilmline();
    updateControls();
    if (scroll) window.requestAnimationFrame(function () { scrollToTour(true); });
  }

  function advanceAfter(delay) {
    clearTourTimer();
    if (paused || dialog.hidden) return;
    timer = window.setTimeout(function () {
      showStep((current + 1) % stages.length, true);
      advanceAfter(current === stages.length - 1 ? 8500 : 6800);
    }, delay);
  }

  function pauseTour() {
    paused = true;
    clearTourTimer();
    updateControls();
  }

  function open() {
    previousFocus = document.activeElement;
    previousOverflow = document.body.style.overflow;
    dialog.hidden = false;
    document.body.style.overflow = "hidden";
    paused = reduceMotion.matches;
    showStep(0, false);
    panel.scrollTop = 0;
    dialog.querySelector(".credential-modal__close").focus();
    if (!paused) {
      timer = window.setTimeout(function () {
        scrollToTour(true);
        restartFilmline();
        advanceAfter(6800);
      }, window.innerWidth <= 650 ? 1500 : 2700);
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
    if (current > 0) { pauseTour(); showStep(current - 1, true); }
  });
  forwardButton.addEventListener("click", function () {
    pauseTour();
    showStep(current === stages.length - 1 ? 0 : current + 1, true);
  });
  pauseButton.addEventListener("click", function () {
    if (paused) {
      paused = false;
      if (current === stages.length - 1) showStep(0, true);
      updateControls();
      advanceAfter(6800);
    } else pauseTour();
  });
  // A touch used to scroll the modal is not a request to stop the walkthrough.
  tour.addEventListener("focusin", function (event) {
    if (!event.target.closest("[data-credential-pause]")) pauseTour();
  });

  dialog.querySelectorAll("[data-credential-drop]").forEach(function (zone) {
    var input = zone.querySelector("[data-credential-file]");
    var status = zone.parentElement.querySelector("[data-credential-file-status]");
    function showFile(file) {
      if (!file) return;
      pauseTour();
      var name = file.name.length > 65 ? file.name.slice(0, 62) + "…" : file.name;
      status.textContent = name + " selected locally · file not read or verified";
    }
    input.addEventListener("change", function () { showFile(input.files && input.files[0]); });
    zone.addEventListener("dragover", function (event) { event.preventDefault(); zone.classList.add("is-dragging"); });
    zone.addEventListener("dragleave", function () { zone.classList.remove("is-dragging"); });
    zone.addEventListener("drop", function (event) {
      event.preventDefault();
      zone.classList.remove("is-dragging");
      showFile(event.dataTransfer && event.dataTransfer.files[0]);
    });
  });

  var jobDetails = {
    analyst: {
      title: "Insights Analyst",
      description: "Turns data into reports that support decisions across teams.",
      skills: "Data analysis · Evidence-based decisions",
      gap: "Data visualization"
    },
    coordinator: {
      title: "Program Coordinator",
      description: "Coordinates timelines, stakeholders, and programme delivery.",
      skills: "Project management · Stakeholder coordination",
      gap: "Budget planning"
    }
  };
  var jobButtons = dialog.querySelectorAll("[data-credential-job]");
  jobButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      pauseTour();
      var detail = jobDetails[button.getAttribute("data-credential-job")];
      jobButtons.forEach(function (item) { item.setAttribute("aria-pressed", item === button ? "true" : "false"); });
      dialog.querySelector("[data-credential-job-title]").textContent = detail.title;
      dialog.querySelector("[data-credential-job-description]").textContent = detail.description;
      dialog.querySelector("[data-credential-job-skills]").textContent = detail.skills;
      dialog.querySelector("[data-credential-job-gap]").textContent = detail.gap;
    });
  });

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
          title: "University credential walkthrough · CertifyMe example",
          text: storyText,
          url: storyUrl.href
        });
        shareStatus.textContent = "Example link shared.";
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
    } else if (event.key === "Tab") {
      var focusable = Array.prototype.slice.call(
        dialog.querySelectorAll('button:not([hidden]), a[href], input[type="file"]')
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
    }
  });
})();