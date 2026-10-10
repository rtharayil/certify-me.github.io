/* Preserve existing responsive tables; contain ordinary editorial tables. */
(function () {
  function prepareTables() {
    document.querySelectorAll('main table, .single-post-txt table').forEach(function (table, index) {
      // These comparisons already provide labeled, stacked cells on phones.
      if (table.getAttribute('data-responsive-table') === 'stacked') return;
      var ancestor = table.parentElement;
      while (ancestor && ancestor !== document.body) {
        var overflow = getComputedStyle(ancestor).overflowX;
        if (overflow === 'auto' || overflow === 'scroll') return;
        ancestor = ancestor.parentElement;
      }
      if (['auto', 'scroll'].includes(getComputedStyle(table).overflowX)) return;
      var wrapper = document.createElement('div');
      wrapper.className = 'editorial-table-scroll';
      wrapper.tabIndex = 0;
      wrapper.setAttribute('role', 'region');
      var caption = table.querySelector('caption');
      wrapper.setAttribute('aria-label', (caption ? caption.textContent.trim() : 'Content table ' + (index + 1)) + '; scroll horizontally if needed');
      table.parentNode.insertBefore(wrapper, table);
      wrapper.appendChild(table);
      if (wrapper.scrollWidth > wrapper.clientWidth + 1) {
        var hint = document.createElement('p');
        hint.className = 'editorial-table-hint';
        hint.textContent = 'Swipe horizontally to see all columns →';
        wrapper.insertAdjacentElement('afterend', hint);
      }
    });
  }
  if (document.readyState === 'complete') prepareTables();
  else document.addEventListener('DOMContentLoaded', prepareTables, { once: true });
})();