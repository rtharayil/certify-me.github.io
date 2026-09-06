/* Competencies Management page behavior.
   Minimal — this is a static prototype, so actions surface a toast
   instead of performing real mutations. */
(function () {
  document.querySelectorAll('.adm-comp-scope .btn').forEach(function (b) {
    b.addEventListener('click', function () {
      if (b.classList.contains('green')) st('Add Competency — coming soon');
      else st('Export Competencies — coming soon');
    });
  });

  var clearBtn = document.querySelector('.adm-comp-scope .clear');
  if (clearBtn) {
    clearBtn.addEventListener('click', function () { st('Filters cleared'); });
  }

  document.querySelectorAll('.adm-comp-scope .dots').forEach(function (d) {
    d.addEventListener('click', function () { st('Row actions — coming soon'); });
  });

  document.querySelectorAll('.adm-comp-scope .view-link, .adm-comp-scope .panel-link, .adm-comp-scope .activity-head a').forEach(function (el) {
    el.addEventListener('click', function () { st('Coming soon'); });
  });

  document.querySelectorAll('.adm-comp-scope .step[data-goto]').forEach(function (el) {
    el.addEventListener('click', function () {
      var target = el.getAttribute('data-goto');
      if (target === 'comingsoon') {
        st((el.getAttribute('data-label') || 'This step') + ' — coming soon');
      } else {
        window.location.href = target;
      }
    });
  });

  var stepsNext = document.getElementById('btnStepsNext');
  if (stepsNext) {
    stepsNext.addEventListener('click', function () {
      window.location.href = '../taxonomy-mapping/index.html';
    });
  }
})();
