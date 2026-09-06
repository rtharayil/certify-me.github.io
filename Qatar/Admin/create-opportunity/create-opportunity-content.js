(function () {
  function toast(msg) {
    if (typeof st === 'function') st(msg);
  }

  var backBtn = document.getElementById('btnBack');
  if (backBtn) {
    backBtn.addEventListener('click', function () {
      window.location.href = '../opportunities/index.html';
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
      window.location.href = 'assign-competencies.html';
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

  document.querySelectorAll('.tag i').forEach(function (x) {
    x.addEventListener('click', function () {
      x.closest('.tag').remove();
    });
  });

  document.querySelectorAll('.add-tag, .choose, .edit').forEach(function (el) {
    el.addEventListener('click', function () {
      toast('This is a preview — action not yet available');
    });
  });
})();
