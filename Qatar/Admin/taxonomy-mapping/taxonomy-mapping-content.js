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

  /* Keep "Select Taxonomy" the same height as "Map to Your Competency"
     (not the taller Current Mappings / Skill Information column) so the
     taxonomy tree fills the extra room instead of leaving it blank, and
     scrolls internally once it no longer fits. */
  var leftCard = document.querySelector('.left-card');
  var midCard = document.querySelector('.mid-card');
  function syncLeftCardHeight() {
    if (!leftCard || !midCard) return;
    leftCard.style.height = '';
    if (window.innerWidth > 980) {
      leftCard.style.height = midCard.offsetHeight + 'px';
    }
  }
  window.addEventListener('load', syncLeftCardHeight);
  window.addEventListener('resize', syncLeftCardHeight);
  syncLeftCardHeight();
})();
