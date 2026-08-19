/* carousel-dots.js — active-dot updates for mobile scroll-snap carousels
   The wrapper and dots are static HTML so the swipe affordance is visible
   before this script loads. Only activates at < 768 px. */
(function () {
  'use strict';

  function init() {
    if (window.innerWidth >= 768) return;

    document.querySelectorAll('.carousel-hint-track').forEach(function (track) {
      var wrap = track.parentElement;
      var cards = Array.from(track.children);
      var dots = Array.from(wrap.querySelectorAll('.carousel-dot'));
      if (cards.length < 2 || dots.length !== cards.length) return;

      /* Update the active, pre-rendered dot on scroll */
      function updateDots() {
        var center = track.scrollLeft + track.clientWidth / 2;
        var best = 0, bestDist = Infinity;
        cards.forEach(function (card, i) {
          var dist = Math.abs((card.offsetLeft + card.offsetWidth / 2) - center);
          if (dist < bestDist) { bestDist = dist; best = i; }
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle('is-active', i === best);
        });
      }

      track.addEventListener('scroll', updateDots, { passive: true });
      updateDots();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
