(function () {
  "use strict";

  var dialog = document.getElementById("credential-sample-dialog");
  var opener = document.querySelector("[data-credential-open]");
  if (!dialog || !opener) return;

  var panel = dialog.querySelector(".credential-modal__panel");
  var tabs = Array.prototype.slice.call(dialog.querySelectorAll("[data-credential-tab]"));
  var previousFocus = null;
  var previousOverflow = "";

  function selectTab(index, focus) {
    tabs.forEach(function (tab, i) {
      var selected = i === index;
      var content = document.getElementById(tab.getAttribute("aria-controls"));
      tab.setAttribute("aria-selected", selected ? "true" : "false");
      tab.tabIndex = selected ? 0 : -1;
      content.hidden = !selected;
    });
    if (focus) tabs[index].focus();
  }

  function open() {
    previousFocus = document.activeElement;
    previousOverflow = document.body.style.overflow;
    dialog.hidden = false;
    document.body.style.overflow = "hidden";
    selectTab(0, false);
    dialog.querySelector(".credential-modal__close").focus();
  }

  function close() {
    dialog.hidden = true;
    document.body.style.overflow = previousOverflow;
    if (previousFocus && typeof previousFocus.focus === "function") previousFocus.focus();
  }

  opener.addEventListener("click", open);
  dialog.querySelectorAll("[data-credential-close]").forEach(function (element) {
    element.addEventListener("click", close);
  });

  tabs.forEach(function (tab, index) {
    tab.addEventListener("click", function () { selectTab(index, false); });
    tab.addEventListener("keydown", function (event) {
      var next = index;
      if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
      else if (event.key === "ArrowLeft") next = (index - 1 + tabs.length) % tabs.length;
      else if (event.key === "Home") next = 0;
      else if (event.key === "End") next = tabs.length - 1;
      else return;
      event.preventDefault();
      selectTab(next, true);
    });
  });

  dialog.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      event.preventDefault();
      close();
    } else if (event.key === "Tab") {
      var focusable = Array.prototype.slice.call(
        dialog.querySelectorAll('button:not([hidden]), a[href], [tabindex="0"]')
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