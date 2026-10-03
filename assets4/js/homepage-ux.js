/* Preserve public anchor visibility when the mobile page scrolls in the body. */
(function () {
  "use strict";
  function revealAnchor() {
    var id;
    try { id = decodeURIComponent(location.hash.slice(1)); } catch (_) { return; }
    var target = id && document.getElementById(id);
    if (!target || !target.matches("section[id], h2[id], h3[id]")
      || !target.closest("#main-content") || target.closest(".credential-modal")) return;
    var header = document.querySelector(innerWidth <= 991
      ? "#header .wsmobileheader" : "#header .wsmainfull");
    if (!header) return;
    var safeTop = header.getBoundingClientRect().bottom + 16;
    var bounds = target.getBoundingClientRect();
    if (bounds.top >= safeTop || bounds.bottom < 0) return;
    var ancestor = target.parentElement;
    while (ancestor && ancestor !== document.documentElement) {
      var overflow = getComputedStyle(ancestor).overflowY;
      if (/(auto|scroll)/.test(overflow) && ancestor.scrollHeight > ancestor.clientHeight + 1) {
        ancestor.scrollTop += bounds.top - safeTop;
        return;
      }
      ancestor = ancestor.parentElement;
    }
    window.scrollBy(0, bounds.top - safeTop);
  }
  function schedule() {
    requestAnimationFrame(function () { requestAnimationFrame(revealAnchor); });
  }
  window.addEventListener("hashchange", schedule);
  window.addEventListener("load", schedule);
  if (document.fonts) document.fonts.ready.then(schedule);
  schedule();
})();