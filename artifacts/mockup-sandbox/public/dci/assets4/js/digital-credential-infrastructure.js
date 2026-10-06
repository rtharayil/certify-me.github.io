(function () {
  "use strict";
  var root = document.getElementById("dci-page");
  if (!root) return;
  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var layerIds = ["layer-01", "layer-02", "layer-03", "layer-04", "layer-05", "layer-06"];
  var navLinks = Array.prototype.slice.call(root.querySelectorAll(".dci-layer-nav [data-layer-link]"));
  var stackLinks = Array.prototype.slice.call(root.querySelectorAll(".dci-stack [data-layer-link]"));
  var progressBar = document.getElementById("dci-progress-bar");
  var progressText = document.getElementById("dci-nav-progress");
  var sections = layerIds.map(function (id) { return document.getElementById(id); }).filter(Boolean);
  var headerHeight = 80;
  var scrollFrame = 0;

  function updateHeaderOffset() {
    var headers = Array.prototype.slice.call(document.querySelectorAll("#header .wsmainfull, #header .wsmobileheader"));
    headerHeight = headers.reduce(function (height, element) {
      var bounds = element.getBoundingClientRect();
      if (bounds.width > 0 && bounds.right > 0 && bounds.left < innerWidth && bounds.bottom > 0 && bounds.top <= 1) {
        return Math.max(height, bounds.bottom);
      }
      return height;
    }, 0);
    root.style.setProperty("--dci-header-height", headerHeight + "px");
  }

  function getPageScroller() {
    var element = root.parentElement;
    while (element && element !== document.documentElement) {
      if (element.scrollHeight > element.clientHeight + 1 &&
          /auto|scroll/.test(getComputedStyle(element).overflowY)) return element;
      element = element.parentElement;
    }
    return document.scrollingElement || document.documentElement;
  }

  function updateProgress() {
    var scroller = getPageScroller();
    var range = Math.max(1, scroller.scrollHeight - scroller.clientHeight);
    var percent = Math.min(100, Math.max(0, (scroller.scrollTop / range) * 100));
    if (progressBar) progressBar.style.width = percent + "%";
    var nav = root.querySelector(".dci-layer-nav");
    var threshold = headerHeight + (nav ? nav.offsetHeight : 62) + 45;
    var active = layerIds[0];
    sections.forEach(function (section) {
      if (section.getBoundingClientRect().top <= threshold) active = section.id;
    });
    setActiveLayer(active);
  }
  function scheduleProgress(event) {
    if (event && event.target instanceof Element && event.target.closest(".dci-layer-nav__links")) return;
    if (scrollFrame) return;
    scrollFrame = requestAnimationFrame(function () {
      scrollFrame = 0;
      updateProgress();
    });
  }
  function setActiveLayer(id) {
    navLinks.concat(stackLinks).forEach(function (link) {
      var active = link.getAttribute("data-layer-link") === id;
      link.classList.toggle("is-active", active);
      if (link.closest(".dci-layer-nav")) {
        if (active) {
          link.setAttribute("aria-current", "location");
          var track = link.parentElement;
          if (track.scrollWidth > track.clientWidth + 1) {
            var linkBounds = link.getBoundingClientRect();
            var trackBounds = track.getBoundingClientRect();
            var delta = linkBounds.left < trackBounds.left ? linkBounds.left - trackBounds.left :
              linkBounds.right > trackBounds.right ? linkBounds.right - trackBounds.right : 0;
            if (delta) track.scrollTo({ left: track.scrollLeft + delta, behavior: "auto" });
          }
        }
        else link.removeAttribute("aria-current");
      }
    });
    var index = Math.max(0, layerIds.indexOf(id)) + 1;
    if (progressText) progressText.textContent = String(index).padStart(2, "0") + " / 06";
  }
  document.addEventListener("scroll", scheduleProgress, { capture: true, passive: true });
  window.addEventListener("resize", function () { updateHeaderOffset(); scheduleProgress(); });
  updateHeaderOffset();
  if ("ResizeObserver" in window) {
    var headerObserver = new ResizeObserver(function () { updateHeaderOffset(); scheduleProgress(); });
    document.querySelectorAll("#header .wsmainfull, #header .wsmobileheader").forEach(function (header) { headerObserver.observe(header); });
  }
  updateProgress();
  if (document.fonts) document.fonts.ready.then(function () { updateHeaderOffset(); scheduleProgress(); });
  root.querySelectorAll('a[href^="#layer-"]').forEach(function (link) {
    link.addEventListener("click", function (event) {
      var target = document.querySelector(link.getAttribute("href"));
      if (!target) return;
      event.preventDefault();
      history.pushState(null, "", link.getAttribute("href"));
      target.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
    });
  });

  var templateButtons = Array.prototype.slice.call(root.querySelectorAll("[data-template]"));
  var recipientInput = document.getElementById("dci-recipient-input");
  var achievementInput = document.getElementById("dci-achievement-input");
  var dateInput = document.getElementById("dci-date-input");
  var previewName = document.getElementById("dci-template-preview-name");
  function updateCredentialPreview() {
    var recipient = recipientInput ? recipientInput.value.trim() : "";
    var achievement = achievementInput ? achievementInput.value.trim() : "";
    var date = dateInput ? dateInput.value.trim() : "";
    [["dci-preview-recipient", recipient || "Recipient name"], ["dci-record-recipient", recipient || "Recipient name"],
      ["dci-preview-achievement", achievement || "Achievement name"], ["dci-record-achievement", achievement || "Achievement name"],
      ["dci-preview-date", date || "Issue date"], ["dci-record-date", date || "Issue date"]].forEach(function (item) {
      var node = document.getElementById(item[0]);
      if (node) node.textContent = item[1];
    });
  }
  templateButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      templateButtons.forEach(function (item) {
        item.classList.toggle("is-selected", item === button);
        item.setAttribute("aria-pressed", item === button ? "true" : "false");
      });
      if (previewName) previewName.textContent = button.getAttribute("data-template") || "Credential template";
      if (achievementInput) achievementInput.value = button.getAttribute("data-program") || "";
      updateCredentialPreview();
    });
    button.setAttribute("aria-pressed", button.classList.contains("is-selected") ? "true" : "false");
  });
  [recipientInput, achievementInput, dateInput].forEach(function (field) {
    if (field) field.addEventListener("input", updateCredentialPreview);
  });
  var editorForm = document.getElementById("dci-credential-form");
  if (editorForm) editorForm.addEventListener("submit", function (event) { event.preventDefault(); });

  var issuance = {
    individual: ["Award administrator", "Reviews recipient and achievement", "Manual award"],
    bulk: ["Cohort award file", "CSV recipient list and award details", "Bulk cohort issuance"],
    automated: ["LMS / SIS / institutional system", "Eligible achievement event", "API / integrated issuance"]
  };
  root.querySelectorAll("[data-issuance]").forEach(function (button) {
    button.addEventListener("click", function () {
      root.querySelectorAll("[data-issuance]").forEach(function (item) {
        item.classList.toggle("is-selected", item === button);
        item.setAttribute("aria-pressed", item === button ? "true" : "false");
      });
      var state = issuance[button.getAttribute("data-issuance")];
      if (!state) return;
      ["dci-issuance-source", "dci-issuance-sub", "dci-issuance-action"].forEach(function (id, i) {
        var node = document.getElementById(id);
        if (node) node.textContent = state[i];
      });
    });
    button.setAttribute("aria-pressed", button.classList.contains("is-selected") ? "true" : "false");
  });

  var tabs = Array.prototype.slice.call(root.querySelectorAll("[data-verify-tab]"));
  var panels = Array.prototype.slice.call(root.querySelectorAll("[data-verify-panel]"));
  function activateTab(tab, focus) {
    tabs.forEach(function (item) {
      var selected = item === tab;
      item.setAttribute("aria-selected", selected ? "true" : "false");
      item.tabIndex = selected ? 0 : -1;
    });
    panels.forEach(function (panel) {
      panel.hidden = panel.getAttribute("data-verify-panel") !== tab.getAttribute("data-verify-tab");
    });
    if (focus) tab.focus();
  }
  tabs.forEach(function (tab, index) {
    tab.addEventListener("click", function () { activateTab(tab, false); });
    tab.addEventListener("keydown", function (event) {
      var next = index;
      if (event.key === "ArrowRight" || event.key === "ArrowDown") next = (index + 1) % tabs.length;
      else if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = (index - 1 + tabs.length) % tabs.length;
      else if (event.key === "Home") next = 0;
      else if (event.key === "End") next = tabs.length - 1;
      else return;
      event.preventDefault();
      activateTab(tabs[next], true);
    });
  });

  var shareStatus = document.getElementById("dci-share-status");
  function announceShare(message) {
    if (shareStatus) shareStatus.textContent = message;
  }
  function copyCredentialLink() {
    var link = new URL("/sample-credential", window.location.origin).href;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(link).then(function () { announceShare("Credential link copied."); })
        .catch(function () { announceShare("Copy was unavailable. Open the credential page to share its address."); });
    } else {
      var field = document.createElement("textarea");
      field.value = link;
      field.setAttribute("readonly", "");
      field.style.position = "fixed";
      field.style.opacity = "0";
      document.body.appendChild(field);
      field.select();
      var copied = false;
      try { copied = document.execCommand("copy"); } catch (error) { copied = false; }
      field.remove();
      announceShare(copied ? "Credential link copied." : "Copy was unavailable. Open the credential page to share its address.");
    }
  }
  root.querySelectorAll("[data-action]").forEach(function (button) {
    button.addEventListener("click", function () {
      var action = button.getAttribute("data-action");
      if (action === "copy") copyCredentialLink();
      if (action === "share") {
        var shareData = { title: "University Example credential", text: "Explore this institutional credential.", url: new URL("/sample-credential", window.location.origin).href };
        if (navigator.share) navigator.share(shareData).then(function () { announceShare("Credential shared."); })
          .catch(function (error) { if (error.name !== "AbortError") copyCredentialLink(); });
        else copyCredentialLink();
      }
    });
  });
})();
