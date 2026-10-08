(() => {
  const root = document.getElementById("stm-page");
  if (!root) return;

  const tabs = Array.from(root.querySelectorAll('[role="tab"]'));
  const panels = Array.from(root.querySelectorAll('[role="tabpanel"]'));
  const selects = Array.from(root.querySelectorAll("[data-framework-select]"));
  if (tabs.length !== panels.length || tabs.length === 0) return;

  const announce = document.createElement("p");
  announce.className = "stm-visually-hidden";
  announce.setAttribute("aria-live", "polite");
  announce.setAttribute("aria-atomic", "true");
  root.appendChild(announce);

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
      if (event.key === "ArrowRight" || event.key === "ArrowDown") nextIndex = (index + 1) % tabs.length;
      else if (event.key === "ArrowLeft" || event.key === "ArrowUp") nextIndex = (index - 1 + tabs.length) % tabs.length;
      else if (event.key === "Home") nextIndex = 0;
      else if (event.key === "End") nextIndex = tabs.length - 1;
      else return;
      event.preventDefault();
      activate(nextIndex, true);
    });
  });

  selects.forEach((select) => {
    select.addEventListener("change", () => {
      const panel = select.closest('[role="tabpanel"]');
      const output = panel && panel.querySelector("[data-framework-output]");
      if (!output) return;
      output.textContent = select.value;
      announce.textContent = `${select.value} selected as an illustrative framework reference. The proposed relationship still requires institutional evidence and review.`;
    });
  });

  root.classList.add("stm-enhanced");
  activate(0);
})();
