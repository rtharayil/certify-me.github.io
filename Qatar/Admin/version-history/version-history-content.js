(function () {
  function toast(msg) {
    if (typeof st === 'function') st(msg);
  }

  var backBtn = document.getElementById('btnBack');
  if (backBtn) {
    backBtn.addEventListener('click', function () {
      window.location.href = '../taxonomy-mapping/index.html';
    });
  }

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

  document.querySelectorAll('.view, .dots, .close, .tab, .full, .restore, .smallbtn, .field, .page').forEach(function (el) {
    el.addEventListener('click', function () {
      toast('This is a preview — action not yet available');
    });
  });
})();
