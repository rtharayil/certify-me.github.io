/* carousel-dots.js — swipe affordance for mobile scroll-snap carousels
   Only activates at < 768 px. No dependencies. */
(function () {
  'use strict';

  function init() {
    if (window.innerWidth >= 768) return;

    /* Each entry: { scrollEl selector, card selector, dark-bg? } */
    var defs = [
      { track: '.wic2-section .row.row-cols-1', card: '.col',           dark: true  },
      { track: '.bfi2-section .row.row-cols-1', card: '.col',           dark: true  },
      { track: '.flp2-qual-grid',               card: '.flp2-qual-card',dark: false }
    ];

    defs.forEach(function (def) {
      document.querySelectorAll(def.track).forEach(function (track) {
        var cards = Array.from(track.querySelectorAll(def.card));
        if (cards.length < 2) return;

        /* Wrap track so ::after fade is anchored to it */
        var wrap = document.createElement('div');
        wrap.className = 'carousel-hint-wrap' + (def.dark ? ' carousel-hint-wrap--dark' : '');
        track.parentNode.insertBefore(wrap, track);
        wrap.appendChild(track);

        /* Build dots */
        var dotsEl = document.createElement('div');
        dotsEl.className = 'carousel-dots';
        dotsEl.setAttribute('aria-hidden', 'true');
        if (def.dark) dotsEl.classList.add('carousel-dots--dark');

        var dots = cards.map(function (_, i) {
          var d = document.createElement('span');
          d.className = 'carousel-dot' + (i === 0 ? ' is-active' : '');
          dotsEl.appendChild(d);
          return d;
        });
        wrap.appendChild(dotsEl);

        /* Update active dot on scroll */
        function updateDots() {
          var center = track.scrollLeft + track.clientWidth / 2;
          var best = 0, bestDist = Infinity;
          cards.forEach(function (card, i) {
            var dist = Math.abs((card.offsetLeft + card.offsetWidth / 2) - center);
            if (dist < bestDist) { bestDist = dist; best = i; }
          });
          dots.forEach(function (d, i) {
            d.classList.toggle('is-active', i === best);
          });
        }

        track.addEventListener('scroll', updateDots, { passive: true });
        updateDots();
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
