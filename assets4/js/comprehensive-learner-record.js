(() => {
  const builder = document.querySelector("#clr-page .clr-builder");
  if (!builder) return;

  const buttons = Array.from(builder.querySelectorAll("[data-clr-select]"));
  const items = Array.from(builder.querySelectorAll("[data-clr-item]"));
  const heading = builder.querySelector("[data-clr-detail-heading]");
  const copy = builder.querySelector("[data-clr-detail-copy]");
  const meta = builder.querySelector("[data-clr-detail-meta]");
  if (!buttons.length || !items.length || !heading || !copy || !meta) return;

  const itemMap = new Map(items.map((item) => [item.dataset.clrItem, item]));
  const selectItem = (key) => {
    const item = itemMap.get(key);
    if (!item) return;

    buttons.forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.clrSelect === key));
    });
    items.forEach((entry) => {
      const selected = entry === item;
      entry.classList.toggle("is-active", selected);
      entry.hidden = !selected;
    });

    heading.textContent = item.dataset.title;
    copy.textContent = item.dataset.copy;
    meta.textContent = item.dataset.meta;
  };

  buttons.forEach((button) => {
    button.addEventListener("click", () => selectItem(button.dataset.clrSelect));
  });

  builder.classList.add("js-ready");
  selectItem(buttons[0].dataset.clrSelect);
})();
