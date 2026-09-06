(function () {
  function toast(msg) {
    if (typeof st === 'function') st(msg);
  }

  var backBtn = document.getElementById('btnBack');
  if (backBtn) {
    backBtn.addEventListener('click', function () {
      window.location.href = 'assign-competencies.html';
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
      toast('Verification & Rules — coming soon');
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

  var evForName = document.getElementById('evForName');
  var selCompIcon = document.getElementById('selCompIcon');
  var selCompName = document.getElementById('selCompName');
  var selCompLevel = document.getElementById('selCompLevel');

  document.querySelectorAll('.comp-side-row').forEach(function (row) {
    row.addEventListener('click', function () {
      document.querySelectorAll('.comp-side-row').forEach(function (r) { r.classList.remove('selected'); });
      row.classList.add('selected');

      var i18n = window.QFCreateOppI18n;
      var lang = i18n ? i18n.currentLang() : 'en';
      var nameKey = row.getAttribute('data-i18n-name');
      var levelKey = row.getAttribute('data-i18n-level');
      var name = (i18n && nameKey && i18n.translate(nameKey, lang)) || row.getAttribute('data-name');
      var level = (i18n && levelKey && i18n.translate(levelKey, lang)) || row.getAttribute('data-level');
      var prefix = (i18n && i18n.translate('evidenceForLabel', lang)) || 'Evidence for';

      if (evForName) evForName.textContent = prefix + ': ' + name;
      if (selCompName) selCompName.textContent = name;
      if (selCompLevel) selCompLevel.textContent = level;
      if (selCompIcon) selCompIcon.innerHTML = row.querySelector('.comp-icon-lg').innerHTML;
    });
  });

  var addEvidenceBtn = document.getElementById('btnAddEvidence');
  if (addEvidenceBtn) {
    addEvidenceBtn.addEventListener('click', function () {
      toast('This is a preview — action not yet available');
    });
  }

  document.querySelectorAll('.kebab').forEach(function (k) {
    k.addEventListener('click', function () {
      toast('This is a preview — action not yet available');
    });
  });

  var mandatoryToggle = document.getElementById('mandatoryToggle');
  if (mandatoryToggle) {
    mandatoryToggle.addEventListener('click', function () {
      mandatoryToggle.classList.toggle('on');
    });
  }

  document.querySelectorAll('.tag i').forEach(function (x) {
    x.addEventListener('click', function () {
      x.closest('.tag').remove();
    });
  });

  var deleteEvidenceBtn = document.getElementById('btnDeleteEvidence');
  if (deleteEvidenceBtn) {
    deleteEvidenceBtn.addEventListener('click', function () {
      toast('This is a preview — action not yet available');
    });
  }

  var cancelEvidenceBtn = document.getElementById('btnCancelEvidence');
  if (cancelEvidenceBtn) {
    cancelEvidenceBtn.addEventListener('click', function () {
      toast('This is a preview — action not yet available');
    });
  }

  var updateEvidenceBtn = document.getElementById('btnUpdateEvidence');
  if (updateEvidenceBtn) {
    updateEvidenceBtn.addEventListener('click', function () {
      toast('Evidence updated');
    });
  }

  var editPreview = document.getElementById('editPreview');
  if (editPreview) {
    editPreview.addEventListener('click', function () {
      window.location.href = 'index.html';
    });
  }
})();
