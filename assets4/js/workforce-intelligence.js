(() => {
  const root = document.querySelector("#wi-page");
  if (!root) return;

  const controls = root.querySelector("[data-wi-tabs]");
  const tabs = Array.from(root.querySelectorAll("[data-wi-tab]"));
  const panels = Array.from(root.querySelectorAll("[data-wi-panel]"));
  if (!controls || tabs.length === 0 || panels.length === 0) return;

  panels.forEach((panel) => {
    panel.setAttribute("role", "tabpanel");
    panel.setAttribute("aria-labelledby", `wi-tab-${panel.dataset.wiPanel}`);
    panel.tabIndex = 0;
  });

  const selectTab = (tab, moveFocus = false) => {
    const selectedKey = tab.dataset.wiTab;

    tabs.forEach((item) => {
      const selected = item === tab;
      item.setAttribute("aria-selected", String(selected));
      item.tabIndex = selected ? 0 : -1;
    });
    panels.forEach((panel) => {
      panel.hidden = panel.dataset.wiPanel !== selectedKey;
    });
    if (moveFocus) tab.focus();
  };

  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => selectTab(tab));
    tab.addEventListener("keydown", (event) => {
      let nextIndex;
      if (event.key === "ArrowRight" || event.key === "ArrowDown") {
        nextIndex = (index + 1) % tabs.length;
      } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
        nextIndex = (index - 1 + tabs.length) % tabs.length;
      } else if (event.key === "Home") {
        nextIndex = 0;
      } else if (event.key === "End") {
        nextIndex = tabs.length - 1;
      } else {
        return;
      }
      event.preventDefault();
      selectTab(tabs[nextIndex], true);
    });
  });

  selectTab(tabs[0]);
  controls.hidden = false;
})();
