/* ============================================================
   Universal Skills Passport — interactive learning tree
   ------------------------------------------------------------
   TREE_NODES is the single source of truth for the hotspot
   content. Each entry maps one competency to one foliage
   cluster on the tree image.

   x / y      – position of the hotspot on the tree stage, in %
   cluster    – which animated foliage layer lights up (1-8)

   To feed this from the Passport backend later, drop the literal
   below and call:

       fetch('/api/passport/journey')
         .then(r => r.json())
         .then(PassportTree.setNodes);

   The payload just needs the same field names.
   ============================================================ */

var TREE_NODES = [
  {
    key: 'entrepreneurship', title: 'Entrepreneurship', titleAr: 'ريادة الأعمال', cluster: 1, x: 50, y: 9,
    level: 'Level 3 · Expert', levelAr: 'المستوى 3 · خبيرة', done: 6, total: 6, status: 'verified',
    summary: 'Turning ideas into ventures — validated through the QF Startup Innovation Bootcamp.',
    summaryAr: 'تحويل الأفكار إلى مشاريع — تم التحقق منها عبر معسكر الابتكار الريادي بمؤسسة قطر.'
  },
  {
    key: 'innovation', title: 'Innovation & Problem Solving', titleAr: 'الابتكار وحل المشكلات', cluster: 2, x: 32, y: 16,
    level: 'Level 3 · Expert', levelAr: 'المستوى 3 · خبيرة', done: 5, total: 6, status: 'progress',
    summary: 'Framing complex problems and prototyping practical solutions with measurable impact.',
    summaryAr: 'صياغة المشكلات المعقّدة وتطوير حلول عملية ذات أثر قابل للقياس.'
  },
  {
    key: 'interdisciplinary', title: 'Interdisciplinary Approaches', titleAr: 'المناهج متعددة التخصصات', cluster: 3, x: 68, y: 17,
    level: 'Level 2 · Proficient', levelAr: 'المستوى 2 · متمكنة', done: 4, total: 6, status: 'progress',
    summary: 'Connecting engineering, data and social science to tackle real-world challenges.',
    summaryAr: 'ربط الهندسة والبيانات والعلوم الاجتماعية لمواجهة تحديات واقعية.'
  },
  {
    key: 'global', title: 'Global Learning', titleAr: 'التعلّم العالمي', cluster: 4, x: 86, y: 32,
    level: 'Level 3 · Expert', levelAr: 'المستوى 3 · خبيرة', done: 5, total: 6, status: 'progress',
    summary: 'Working across cultures and contexts, aligned to the UN Sustainable Development Goals.',
    summaryAr: 'العمل عبر ثقافات وسياقات متعددة، بما يتماشى مع أهداف التنمية المستدامة للأمم المتحدة.'
  },
  {
    key: 'ethical', title: 'Ethical Reasoning', titleAr: 'التفكير الأخلاقي', cluster: 5, x: 14, y: 32,
    level: 'Level 2 · Proficient', levelAr: 'المستوى 2 · متمكنة', done: 4, total: 5, status: 'progress',
    summary: 'Weighing responsibility, fairness and consequence when designing AI-driven systems.',
    summaryAr: 'موازنة المسؤولية والعدالة والنتائج عند تصميم أنظمة قائمة على الذكاء الاصطناعي.'
  },
  {
    key: 'civic', title: 'Civic Values', titleAr: 'القيم المدنية', cluster: 6, x: 24, y: 47,
    level: 'Level 2 · Proficient', levelAr: 'المستوى 2 · متمكنة', done: 3, total: 4, status: 'progress',
    summary: 'Contributing to Qatar’s national vision through service, stewardship and dialogue.',
    summaryAr: 'المساهمة في رؤية قطر الوطنية من خلال الخدمة والمسؤولية والحوار.'
  },
  {
    key: 'growth', title: 'Personal Growth', titleAr: 'النمو الشخصي', cluster: 7, x: 78, y: 46,
    level: 'Level 3 · Expert', levelAr: 'المستوى 3 · خبيرة', done: 5, total: 6, status: 'progress',
    summary: 'Reflection, resilience and self-directed learning tracked across your whole journey.',
    summaryAr: 'التأمل والمرونة والتعلّم الذاتي، متابَعة عبر رحلتك التعليمية بأكملها.'
  },
  {
    key: 'community', title: 'Community Impact', titleAr: 'الأثر المجتمعي', cluster: 8, x: 60, y: 26,
    level: 'Level 3 · Expert', levelAr: 'المستوى 3 · خبيرة', done: 4, total: 4, status: 'verified',
    summary: 'Outreach that reached 350+ learners — including STEM for Girls and Beach Cleanup.',
    summaryAr: 'أنشطة توعية شملت أكثر من 350 متعلمًا — بما في ذلك برنامج STEM للفتيات ومبادرة تنظيف الشاطئ.'
  }
];

var PASSPORT_I18N = {
  en: { modulesOf: function (done, total) { return done + ' of ' + total + ' modules'; } },
  ar: { modulesOf: function (done, total) { return 'اكتملت ' + done + ' من ' + total + ' وحدات'; } }
};

var PassportTree = (function () {
  'use strict';

  var stage, hotLayer, tip, card, nodes = [], byKey = {}, activeKey = null;

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  /* build the invisible hotspots over the leaf clusters */
  function render() {
    if (!hotLayer) return;
    byKey = {};
    hotLayer.innerHTML = '';
    nodes.forEach(function (n) {
      byKey[n.key] = n;
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'psp-hotspot';
      b.dataset.key = n.key;
      b.style.left = n.x + '%';
      b.style.top = n.y + '%';
      b.setAttribute('aria-label', n.title + ' — ' + n.level);
      hotLayer.appendChild(b);
    });
  }

  var currentLang = 'en';

  function fill(n) {
    var pct = n.total ? Math.round((n.done / n.total) * 100) : 0;
    var ar = currentLang === 'ar';
    tip.querySelector('.psp-tip-title').textContent = ar && n.titleAr ? n.titleAr : n.title;
    tip.querySelector('.psp-tip-level').textContent = ar && n.levelAr ? n.levelAr : n.level;
    tip.querySelector('.psp-tip-text').textContent = ar && n.summaryAr ? n.summaryAr : n.summary;
    tip.querySelector('.psp-tip-count').textContent = PASSPORT_I18N[currentLang].modulesOf(n.done, n.total);
    tip.querySelector('.psp-tip-bar i').style.width = pct + '%';
    tip.dataset.status = n.status || 'progress';
  }

  /* place the tooltip beside the leaf, flipping and clamping to the card */
  function place(el) {
    var cb = card.getBoundingClientRect();
    var eb = el.getBoundingClientRect();
    tip.style.visibility = 'hidden';
    tip.classList.add('is-open');

    var tw = tip.offsetWidth, th = tip.offsetHeight;
    var cx = eb.left + eb.width / 2 - cb.left;
    var top = eb.top - cb.top - th - 12;
    var side = 'top';

    if (top < 4) { top = eb.bottom - cb.top + 12; side = 'bottom'; }

    var left = Math.max(6, Math.min(cx - tw / 2, cb.width - tw - 6));
    tip.dataset.side = side;
    tip.style.left = left + 'px';
    tip.style.top = top + 'px';
    tip.style.setProperty('--caret', Math.max(14, Math.min(cx - left, tw - 14)) + 'px');
    tip.style.visibility = '';
  }

  function show(key, el) {
    var n = byKey[key];
    if (!n || !el) return;
    activeKey = key;
    fill(n);
    place(el);
    tip.setAttribute('aria-hidden', 'false');

    /* light up just this leaf cluster */
    stage.querySelectorAll('.psp-foliage').forEach(function (f) {
      f.classList.toggle('is-lit', String(f.dataset.c) === String(n.cluster));
    });
    card.querySelectorAll('.psp-hotspot,.psp-node[data-key]').forEach(function (b) {
      b.classList.toggle('is-active', b.dataset.key === key);
    });
  }

  function hide() {
    activeKey = null;
    tip.classList.remove('is-open');
    tip.setAttribute('aria-hidden', 'true');
    stage.querySelectorAll('.psp-foliage.is-lit')
      .forEach(function (f) { f.classList.remove('is-lit'); });
    card.querySelectorAll('.psp-hotspot.is-active,.psp-node.is-active')
      .forEach(function (b) { b.classList.remove('is-active'); });
  }

  function triggerFor(e) {
    return e.target.closest ? e.target.closest('.psp-hotspot,.psp-node[data-key]') : null;
  }

  function bind() {
    /* hover — mouse/pen only, so a tap never fires both hover and click */
    function isMouse(e) { return !e.pointerType || e.pointerType === 'mouse' || e.pointerType === 'pen'; }

    card.addEventListener('pointerover', function (e) {
      if (!isMouse(e)) return;
      var t = triggerFor(e);
      if (t && t.dataset.key !== activeKey) show(t.dataset.key, t);
    });
    card.addEventListener('pointerout', function (e) {
      if (!isMouse(e)) return;
      if (!triggerFor(e)) return;
      var to = e.relatedTarget;
      if (to && to.closest && to.closest('.psp-tip,.psp-hotspot,.psp-node[data-key]')) return;
      hide();
    });

    /* tap / click — on touch this toggles; with a mouse it just keeps it open */
    var lastPointer = 'mouse';
    card.addEventListener('pointerdown', function (e) { lastPointer = e.pointerType || 'mouse'; });

    card.addEventListener('click', function (e) {
      var t = triggerFor(e);
      if (!t) return;
      e.preventDefault();
      if (lastPointer === 'touch' && t.dataset.key === activeKey) hide();
      else show(t.dataset.key, t);
    });

    document.addEventListener('click', function (e) {
      if (!activeKey) return;
      if (e.target.closest && e.target.closest('.psp-hotspot,.psp-node[data-key],.psp-tip')) return;
      hide();
    });

    /* keyboard */
    card.addEventListener('focusin', function (e) {
      var t = triggerFor(e);
      if (t) show(t.dataset.key, t);
    });
    card.addEventListener('focusout', function (e) {
      var to = e.relatedTarget;
      if (to && to.closest && to.closest('.psp-hotspot,.psp-node[data-key],.psp-tip')) return;
      hide();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && activeKey) hide();
    });

    /* keep the tooltip glued to its leaf */
    window.addEventListener('resize', function () {
      if (!activeKey) return;
      var el = card.querySelector('[data-key="' + activeKey + '"].is-active');
      if (el) place(el); else hide();
    });
    window.addEventListener('scroll', function () { if (activeKey) hide(); }, { passive: true });
  }

  function setNodes(list) {
    nodes = Array.isArray(list) ? list : [];
    render();
  }

  function setLang(lang) {
    currentLang = lang === 'ar' ? 'ar' : 'en';
    nodes.forEach(function (n) {
      var el = hotLayer && hotLayer.querySelector('[data-key="' + n.key + '"]');
      if (el) el.setAttribute('aria-label', (currentLang === 'ar' && n.titleAr ? n.titleAr : n.title) + ' — ' + (currentLang === 'ar' && n.levelAr ? n.levelAr : n.level));
    });
    if (activeKey && byKey[activeKey]) fill(byKey[activeKey]);
  }

  function init() {
    stage = document.getElementById('pspTree');
    tip = document.getElementById('pspTip');
    if (!stage || !tip) return;
    hotLayer = stage.querySelector('.psp-hotspots');
    card = stage.closest('.psp-journey') || stage.parentElement;
    setNodes(TREE_NODES);
    bind();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return { setNodes: setNodes, hide: hide, setLang: setLang };
})();
