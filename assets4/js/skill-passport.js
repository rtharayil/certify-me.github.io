(() => {
  "use strict";

  const initializeTabs = (root) => {
    const tabs = Array.from(root.querySelectorAll("[data-sp-tab]"));
    const panels = Array.from(root.querySelectorAll("[data-sp-panel]"));
    if (!tabs.length || !panels.length) return;

    const activate = (tab, moveFocus = false) => {
      const key = tab.dataset.spTab;
      tabs.forEach((item) => {
        const selected = item === tab;
        item.setAttribute("aria-selected", String(selected));
        item.tabIndex = selected ? 0 : -1;
      });
      panels.forEach((panel) => {
        panel.hidden = panel.dataset.spPanel !== key;
      });
      if (moveFocus) tab.focus();
    };

    root.classList.add("sp-js-ready");
    activate(tabs.find((tab) => tab.getAttribute("aria-selected") === "true") || tabs[0]);

    tabs.forEach((tab, index) => {
      tab.addEventListener("click", () => activate(tab));
      tab.addEventListener("keydown", (event) => {
        let nextIndex = index;
        switch (event.key) {
          case "ArrowRight":
            nextIndex = (index + 1) % tabs.length;
            break;
          case "ArrowLeft":
            nextIndex = (index - 1 + tabs.length) % tabs.length;
            break;
          case "Home":
            nextIndex = 0;
            break;
          case "End":
            nextIndex = tabs.length - 1;
            break;
          default:
            return;
        }
        event.preventDefault();
        activate(tabs[nextIndex], true);
      });
    });
  };

  document.querySelectorAll("[data-sp-tabs]").forEach(initializeTabs);
})();
