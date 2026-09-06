(function () {
  function toast(msg) {
    if (typeof st === 'function') st(msg);
  }

  document.getElementById('btnBack').addEventListener('click', function () {
    window.location.href = '../competencies/index.html';
  });

  document.getElementById('btnDraft').addEventListener('click', function () {
    toast('Saved as draft');
  });

  document.getElementById('btnNext').addEventListener('click', function () {
    window.location.href = '../version-history/index.html';
  });

  document.querySelectorAll('.step[data-goto]').forEach(function (el) {
    el.addEventListener('click', function () {
      var target = el.getAttribute('data-goto');
      if (target === 'comingsoon') {
        toast((el.getAttribute('data-label') || 'This step') + ' — coming soon');
      } else {
        window.location.href = target;
      }
    });
  });

  var searchMode = document.getElementById('searchMode');
  if (searchMode) {
    searchMode.addEventListener('click', function (e) {
      var btn = e.target.closest('.mode-btn');
      if (!btn) return;
      searchMode.querySelectorAll('.mode-btn').forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
    });
  }

  document.querySelectorAll('.view, .dots, .add-btn').forEach(function (el) {
    el.addEventListener('click', function () {
      toast('This is a preview — action not yet available');
    });
  });
})();
