(() => {
  "use strict";

  const workflows = document.querySelectorAll("#ts-page [data-tm-workflow]");

  workflows.forEach((workflow) => {
    const tabs = Array.from(workflow.querySelectorAll("[data-tm-tab]"));
    const panels = Array.from(workflow.querySelectorAll("[data-tm-panel]"));
    const instructions = workflow.querySelector("[data-tm-instructions]");

    if (tabs.length !== 7 || panels.length !== tabs.length) return;
    panels.forEach((panel) => { panel.tabIndex = 0; });

    const activate = (index, moveFocus = false) => {
      tabs.forEach((tab, tabIndex) => {
        const selected = tabIndex === index;
        tab.setAttribute("aria-selected", String(selected));
        tab.tabIndex = selected ? 0 : -1;
        panels[tabIndex].hidden = !selected;
      });

      if (moveFocus) tabs[index].focus();
    };

    tabs.forEach((tab, index) => {
      tab.addEventListener("click", () => activate(index));
      tab.addEventListener("keydown", (event) => {
        let nextIndex = index;
        switch (event.key) {
          case "ArrowRight":
          case "ArrowDown":
            nextIndex = (index + 1) % tabs.length;
            break;
          case "ArrowLeft":
          case "ArrowUp":
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
        activate(nextIndex, true);
      });
    });

    activate(0);
    workflow.classList.add("tm-hero-js");
    if (instructions) instructions.hidden = false;
  });
})();
