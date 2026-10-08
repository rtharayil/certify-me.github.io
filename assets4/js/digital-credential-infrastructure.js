(function () {
  "use strict";
  var root = document.getElementById("dci-page");
  if (!root) return;

  var progress = root.querySelector("#dci-progress-bar");
  var frame = 0;
  function revealHash(hash) {
    var target = document.getElementById(hash.slice(1));
    if (target && root.contains(target) && target.tagName === "DETAILS") target.open = true;
  }
  root.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener("click", function () { revealHash(link.getAttribute("href")); });
  });
  window.addEventListener("hashchange", function () { revealHash(window.location.hash); });
  revealHash(window.location.hash);
  function updateHeaderOffset() {
    var headers = Array.prototype.slice.call(document.querySelectorAll("#header .wsmainfull, #header .wsmobileheader"));
    var height = headers.reduce(function (maximum, element) {
      var bounds = element.getBoundingClientRect();
      if (bounds.width > 0 && bounds.right > 0 && bounds.left < window.innerWidth && bounds.bottom > 0 && bounds.top <= 1) {
        return Math.max(maximum, bounds.bottom);
      }
      return maximum;
    }, 0);
    root.style.setProperty("--dci-header-height", height + "px");
  }
  function updateProgress() {
    frame = 0;
    if (!progress) return;
    var scrollable = document.scrollingElement || document.documentElement;
    var range = Math.max(1, scrollable.scrollHeight - scrollable.clientHeight);
    progress.style.width = Math.min(100, Math.max(0, scrollable.scrollTop / range * 100)) + "%";
  }
  function scheduleProgress() {
    if (frame) return;
    frame = window.requestAnimationFrame(updateProgress);
  }

  document.addEventListener("scroll", scheduleProgress, { capture: true, passive: true });
  window.addEventListener("resize", function () {
    updateHeaderOffset();
    scheduleProgress();
  });
  updateHeaderOffset();
  if ("ResizeObserver" in window) {
    var observer = new ResizeObserver(function () {
      updateHeaderOffset();
      scheduleProgress();
    });
    document.querySelectorAll("#header .wsmainfull, #header .wsmobileheader").forEach(function (header) {
      observer.observe(header);
    });
  }
  updateProgress();
})();
