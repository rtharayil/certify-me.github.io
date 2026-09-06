(function () {
  function toast(msg) {
    if (typeof st === 'function') st(msg);
  }

  var backBtn = document.getElementById('btnBack');
  if (backBtn) {
    backBtn.addEventListener('click', function () {
      window.location.href = 'index.html';
    });
  }

  var cancelBtn = document.getElementById('btnCancel');
  if (cancelBtn) {
    cancelBtn.addEventListener('click', function () {
      window.location.href = '../opportunities/index.html';
    });
  }

  var draftBtn = document.getElementById('btnSaveDraft');
  if (draftBtn) {
    draftBtn.addEventListener('click', function () {
      toast('Saved as draft');
    });
  }

  var nextBtn = document.getElementById('btnNext');
  if (nextBtn) {
    nextBtn.addEventListener('click', function () {
      window.location.href = 'evidence-requirements.html';
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

  document.querySelectorAll('.add').forEach(function (btn) {
    btn.addEventListener('click', function () {
      toast('This is a preview — action not yet available');
    });
  });

  document.querySelectorAll('.delete').forEach(function (btn) {
    btn.addEventListener('click', function () {
      btn.closest('.selected-row').remove();
    });
  });

  var viewFramework = document.getElementById('viewFramework');
  if (viewFramework) {
    viewFramework.addEventListener('click', function () {
      window.location.href = '../taxonomy-mapping/index.html';
    });
  }

  var clearAll = document.getElementById('clearAll');
  if (clearAll) {
    clearAll.addEventListener('click', function () {
      document.querySelectorAll('.selected-row').forEach(function (row) { row.remove(); });
    });
  }

  var editPreview = document.getElementById('editPreview');
  if (editPreview) {
    editPreview.addEventListener('click', function () {
      window.location.href = 'index.html';
    });
  }
})();
