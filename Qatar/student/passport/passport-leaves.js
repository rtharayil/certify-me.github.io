/* ============================================================
   Universal Skills Passport — rare falling-leaf system
   ------------------------------------------------------------
   Overlays the existing learning tree. The tree image, its
   breeze animation and the hotspot/tooltip logic are untouched;
   this file only adds leaves that occasionally detach and are
   carried off by the air.

   Everything is simulated per-frame (no CSS animation paths),
   so no two leaves ever travel the same way.

   Tuning lives in CONFIG below.
   ============================================================ */

var PassportLeaves = (function () {
  'use strict';

  var CONFIG = {
    /* how often a leaf lets go — randomised inside this window (ms) */
    spawnMin: 8000,
    spawnMax: 20000,

    /* the scene must stay quiet: never a leaf storm */
    maxActive: 2,        // hard ceiling
    soloBias: 0.6,       // if one is already airborne, usually skip this turn
    poolSize: 4,

    /* what happens to a leaf once it detaches.
       weights are relative — edit freely, they get normalised */
    behaviour: {
      driftAway: 0.40,   // caught by the breeze, sails out past the card
      landPlatform: 0.30,// spirals down, rests on the plinth, blows off later
      spiralFade: 0.20,  // tight spiral, settles away into the lower foliage
      updraft: 0.10      // lifted/carried sideways first, then falls
    },

    /* a leaf on any other trajectory may still catch the plinth */
    strayLandChance: 0.15,

    /* air */
    gravity: 0.260,      // stage-fractions / s²
    drag: 1.750,         // → terminal velocity ≈ gravity / drag ≈ 0.15/s
    windBase: 0.020,     // slow meander
    windSwirl: 0.013,
    gustEveryMin: 6000,
    gustEveryMax: 14000,
    gustPeak: 0.075,

    /* The dark circular plinth's top rim, as an ellipse in stage
       fractions — measured off tree.png, so a leaf settles on the flat
       stone band just above "A Stronger You / A Brighter Tomorrow".
       y = plinthY + plinthRy * sqrt(1 - ((x - .5) / plinthRx)²)     */
    plinthRx: 0.348,
    plinthY: 0.734,
    plinthRy: 0.072,

    restMin: 1.0,        // seconds a landed leaf stays put
    restMax: 4.0
  };

  /* foliage clusters on the tree, in stage %. Sampled from the same
     coordinates the breeze layers use, so leaves always let go from
     somewhere that actually has leaves on it. */
  var FOLIAGE = [
    { x: 0.50, y: 0.09, r: 0.105 },
    { x: 0.32, y: 0.16, r: 0.095 },
    { x: 0.68, y: 0.17, r: 0.095 },
    { x: 0.86, y: 0.32, r: 0.085 },
    { x: 0.14, y: 0.32, r: 0.085 },
    { x: 0.24, y: 0.47, r: 0.080 },
    { x: 0.78, y: 0.46, r: 0.080 },
    { x: 0.60, y: 0.26, r: 0.085 }
  ];

  var LEAF_SVG =
    '<svg viewBox="0 0 24 32" aria-hidden="true" focusable="false">' +
    '<path class="lf-body" d="M12 1.4c5.2 4.6 9.6 9.4 9.6 15.1 0 5.6-4.3 9.6-9.6 11.1C6.7 26.1 2.4 22.1 2.4 16.5 2.4 10.8 6.8 6 12 1.4Z"/>' +
    '<path class="lf-shade" d="M12 1.4c5.2 4.6 9.6 9.4 9.6 15.1 0 5.6-4.3 9.6-9.6 11.1Z"/>' +
    '<path class="lf-vein" d="M12 4.2v22.4M12 11 7.4 8.7M12 11l4.6-2.3M12 16.4l-5-2.4M12 16.4l5-2.4M12 21.6l-4.2-2M12 21.6l4.2-2"/>' +
    '<path class="lf-stem" d="M12 27.6c.2 1.6.9 2.7 2 3.4"/>' +
    '</svg>';

  var stage, layer, card, pool = [], live = [];
  var stageX = 0, stageY = 0, stageSize = 0, cardBox = null, obstacles = [];
  var rafId = null, spawnTimer = null, lastTs = 0, clock = 0;
  var onScreen = true, reduced = false, started = false;

  /* ---------- helpers ---------------------------------------------- */

  function rand(a, b) { return a + Math.random() * (b - a); }
  function pick(a) { return a[(Math.random() * a.length) | 0]; }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }

  function pickBehaviour() {
    var w = CONFIG.behaviour, total = 0, k;
    for (k in w) if (w.hasOwnProperty(k)) total += w[k];
    var r = Math.random() * total;
    for (k in w) {
      if (!w.hasOwnProperty(k)) continue;
      r -= w[k];
      if (r <= 0) return k;
    }
    return 'driftAway';
  }

  /* top surface of the plinth at a given x — null when x is off the rim */
  function surfaceY(x) {
    var t = (x - 0.5) / CONFIG.plinthRx;
    if (t < -1 || t > 1) return null;
    return CONFIG.plinthY + CONFIG.plinthRy * Math.sqrt(1 - t * t);
  }

  /* ---------- wind -------------------------------------------------- */

  var windP1 = Math.random() * 6.283, windP2 = Math.random() * 6.283;
  var gustAt = rand(CONFIG.gustEveryMin, CONFIG.gustEveryMax) / 1000;
  var gustEnd = -1, gustAmp = 0, gustLen = 0;

  function wind(t) {
    var w = CONFIG.windBase * Math.sin(t * 0.23 + windP1) +
            CONFIG.windSwirl * Math.sin(t * 0.61 + windP2);
    if (t >= gustAt && gustEnd < 0) {          // a gust picks up
      gustLen = rand(1.2, 3.0);
      gustEnd = t + gustLen;
      gustAmp = rand(0.02, CONFIG.gustPeak) * (Math.random() < 0.5 ? -1 : 1);
    }
    if (gustEnd > 0) {
      if (t < gustEnd) {
        var u = 1 - (gustEnd - t) / gustLen;   // 0 → 1 across the gust
        var env = Math.sin(Math.PI * u);
        w += gustAmp * env * env;
      } else {                                  // gust dies, queue the next
        gustEnd = -1;
        gustAt = t + rand(CONFIG.gustEveryMin, CONFIG.gustEveryMax) / 1000;
      }
    }
    return w;
  }

  /* ---------- geometry --------------------------------------------- */

  function measure() {
    if (!stage || !layer) return;
    var s = stage.getBoundingClientRect();
    var l = layer.getBoundingClientRect();
    stageX = s.left - l.left;
    stageY = s.top - l.top;
    stageSize = s.width;
    if (card) {
      var c = card.getBoundingClientRect();
      cardBox = { l: c.left - l.left, t: c.top - l.top, r: c.right - l.left, b: c.bottom - l.top };
    }

    /* real obstacles a falling leaf can land a glancing touch on: the 7
       competency icons around the ring, and the button under the tree.
       Rects are cached here (refreshed on resize) so the per-frame physics
       never has to touch the DOM. */
    obstacles = [];
    if (card) {
      card.querySelectorAll('.psp-node-ic').forEach(function (el) {
        var r = el.getBoundingClientRect();
        obstacles.push({
          l: r.left - l.left, r: r.right - l.left, t: r.top - l.top,
          cx: (r.left + r.right) / 2 - l.left
        });
      });
      var btn = card.querySelector('.psp-explore-btn');
      if (btn) {
        var rb = btn.getBoundingClientRect();
        obstacles.push({
          l: rb.left - l.left, r: rb.right - l.left, t: rb.top - l.top,
          cx: (rb.left + rb.right) / 2 - l.left
        });
      }
    }
  }

  /* ---------- leaf pool -------------------------------------------- */

  function makeLeaf() {
    var el = document.createElement('span');
    el.className = 'psp-leaf';
    el.setAttribute('aria-hidden', 'true');
    el.innerHTML = LEAF_SVG;
    el.style.opacity = '0';
    layer.appendChild(el);
    return { el: el, busy: false };
  }

  function freeLeaf() {
    for (var i = 0; i < pool.length; i++) if (!pool[i].busy) return pool[i];
    return null;
  }

  function recycle(L) {
    L.busy = false;
    L.el.style.opacity = '0';
    L.el.style.willChange = 'auto';
    var i = live.indexOf(L);
    if (i > -1) live.splice(i, 1);
  }

  /* ---------- spawning --------------------------------------------- */

  function dress(L) {
    /* every leaf gets its own colour out of the tree's own palette:
       yellow-green through to a deep shaded green */
    var hue = rand(64, 94);
    var sat = rand(62, 86);
    var lum = rand(31, 46);
    L.el.style.setProperty('--l1', 'hsl(' + hue + ',' + sat + '%,' + lum + '%)');
    L.el.style.setProperty('--l2', 'hsl(' + (hue + rand(-4, 4)) + ',' + (sat + 4) + '%,' + (lum - 11) + '%)');
    L.el.style.setProperty('--l3', 'hsl(' + (hue + rand(-6, 2)) + ',' + (sat - 12) + '%,' + (lum + 17) + '%)');
    L.el.style.setProperty('--lw', L.size.toFixed(1) + 'px');
  }

  function spawn(forceBehaviour) {
    var L = freeLeaf();
    if (!L) return null;
    measure();
    if (!stageSize) return null;

    var f = pick(FOLIAGE);
    var a = Math.random() * 6.283, rr = Math.sqrt(Math.random()) * f.r;

    L.busy = true;
    L.behaviour = forceBehaviour || pickBehaviour();
    L.phase = 'attach';
    L.t = 0;
    L.ax = clamp(f.x + Math.cos(a) * rr, 0.06, 0.94);   // where it hangs
    L.ay = clamp(f.y + Math.sin(a) * rr * 0.8, 0.04, 0.62);
    L.x = L.ax;
    L.y = L.ay;
    L.vx = 0;
    L.vy = 0;
    L.detachAfter = rand(0.8, 2.4);                     // rides the breeze first
    L.swayP = Math.random() * 6.283;

    L.size = rand(11, 17);
    L.depth = rand(0.84, 1.14);
    L.spin = rand(0, 360);
    L.spinV = rand(18, 62) * (Math.random() < 0.5 ? -1 : 1);
    L.flipBase = rand(-25, 25);
    L.flipAmp = rand(45, 165);
    L.tilt = rand(-16, 16);
    L.flutA = rand(0.028, 0.088);                       // wobble strength
    L.flutW = rand(1.5, 3.3);                           // wobble speed
    L.flutP = Math.random() * 6.283;
    L.windBias = rand(-0.018, 0.018);
    L.opacity = 0;
    L.fading = false;
    L.rest = 0;
    L.slideDir = 0;
    L.hitObstacle = -1;
    L.hitCooldown = 0;

    /* behaviour flavouring */
    L.landAllowed = L.behaviour === 'landPlatform' || Math.random() < CONFIG.strayLandChance;
    if (L.behaviour === 'driftAway') {
      L.windBias += rand(0.030, 0.062) * (Math.random() < 0.5 ? -1 : 1);
    } else if (L.behaviour === 'landPlatform') {
      L.windBias *= 0.35;                               // stays over the plinth
      L.flutA *= 0.85;
      /* air funnels inward in the lee of the canopy. The pull is nil up
         in the branches and only firms up near the plinth, and it stays
         weaker than the leaf's own wobble — so the path still wanders,
         it just tends to end up over the stone. */
      L.homeX = 0.5 + rand(-0.17, 0.17);
      L.homePull = 0.085;
    } else if (L.behaviour === 'spiralFade') {
      L.flutW = rand(2.6, 4.0);                         // tight spiral
      L.flutA = rand(0.020, 0.045);
      L.fadeAtY = rand(0.55, 0.80);
    } else if (L.behaviour === 'updraft') {
      L.lift = rand(0.030, 0.062);                      // caught on the way up
      L.liftFor = rand(0.7, 1.6);
    }

    dress(L);
    L.el.style.willChange = 'transform, opacity';
    live.push(L);
    start();
    return L;
  }

  /* ---------- per-frame physics ------------------------------------ */

  function step(dt) {
    clock += dt;
    var w = wind(clock);

    for (var i = live.length - 1; i >= 0; i--) {
      var L = live[i];
      L.t += dt;

      if (L.phase === 'attach') {
        /* still joined to the twig — drifts with the same breeze the
           foliage layers use, then lets go */
        var sx = 0.0045 * Math.sin(L.t * 1.9 + L.swayP);
        var sy = 0.0022 * Math.sin(L.t * 1.4 + L.swayP * 1.7);
        L.x = L.ax + sx;
        L.y = L.ay + sy;
        L.spin += L.spinV * 0.12 * dt;
        L.opacity = Math.min(1, L.t / 0.5);
        if (L.t >= L.detachAfter) {
          L.phase = 'fall';
          L.vx = w * 0.5 + rand(-0.012, 0.012);
          L.vy = 0.004;
          if (L.behaviour === 'updraft') {
            L.vy = -L.lift;
            L.vx += rand(0.020, 0.050) * (Math.random() < 0.5 ? -1 : 1);
          }
        }

      } else if (L.phase === 'fall') {
        var flutter = L.flutA * Math.sin(L.flutP);
        var target = w + L.windBias + flutter;
        if (L.homePull) {
          var near = clamp((L.y - 0.28) / 0.35, 0, 1);   // nil up in the branches
          target += (L.homeX - L.x) * L.homePull * near;
        }
        L.vx += (target - L.vx) * Math.min(1, 2.6 * dt);

        /* the leaf spills air at the extremes of its wobble, so it
           glides and pauses instead of dropping evenly */
        var lift = 1 - 0.42 * Math.abs(Math.cos(L.flutP));
        if (L.behaviour === 'updraft' && L.t < L.detachAfter + L.liftFor) lift *= 0.25;
        L.vy += CONFIG.gravity * lift * dt;
        L.vy -= L.vy * CONFIG.drag * dt;

        L.flutP += L.flutW * dt;
        var prevY = L.y;
        L.x += L.vx * dt;
        L.y += L.vy * dt;
        L.spin += (L.spinV + L.vx * 150) * dt;

        /* plinth collision — only on the way down, only if it crosses it */
        if (L.landAllowed && L.vy > 0) {
          var sYy = surfaceY(L.x);
          if (sYy !== null && prevY < sYy && L.y >= sYy) {
            L.y = sYy;
            L.phase = 'settle';
            L.rest = rand(CONFIG.restMin, CONFIG.restMax);
          }
        }

        /* every competency icon and the button under the tree is a real
           surface. A falling leaf that grazes one doesn't rest there — it
           just doesn't have the weight — it deflects off to whichever side
           it struck, tumbles, and keeps falling, exactly like a real leaf
           glancing off a branch or a sign on its way down. */
        if (L.hitCooldown > 0) L.hitCooldown -= dt;
        if (L.phase === 'fall' && L.vy > 0 && obstacles.length && L.hitCooldown <= 0) {
          var lpx = stageX + L.x * stageSize, lpy = stageY + L.y * stageSize;
          var lPrevPy = stageY + prevY * stageSize;
          var half = L.size * 0.5;
          for (var oi = 0; oi < obstacles.length; oi++) {
            if (oi === L.hitObstacle) continue;
            var ob = obstacles[oi];
            if (lpx < ob.l - half || lpx > ob.r + half) continue;
            if (lPrevPy >= ob.t || lpy < ob.t) continue;
            var away = (Math.abs(lpx - ob.cx) < half * 0.35)
              ? (Math.random() < 0.5 ? -1 : 1)
              : (lpx < ob.cx ? -1 : 1);
            L.vx = away * rand(0.030, 0.062) + L.vx * 0.2;
            L.vy = -rand(0.012, 0.032);
            L.spinV = away * rand(30, 78);
            L.flipBase = rand(-30, 30);
            L.flutP += rand(1.1, 2.6);
            L.y = (ob.t - half * 0.6 - stageY) / stageSize;
            L.hitObstacle = oi;
            L.hitCooldown = 0.45;
            break;
          }
        }

        if (L.behaviour === 'spiralFade' && L.y > L.fadeAtY) L.fading = true;

      } else if (L.phase === 'settle') {
        /* bleeds off its speed and lies flat — no snapping */
        L.vy -= L.vy * Math.min(1, 6 * dt);
        L.vx -= L.vx * Math.min(1, 5 * dt);
        L.x += L.vx * dt;
        var sy2 = surfaceY(L.x);
        if (sy2 !== null) L.y = sy2;
        L.tilt += (50 - L.tilt) * Math.min(1, 4 * dt);      // lying on the surface
        L.flipBase += (0 - L.flipBase) * Math.min(1, 4 * dt);
        L.flipAmp += (0 - L.flipAmp) * Math.min(1, 4 * dt);
        L.spinV += (0 - L.spinV) * Math.min(1, 4 * dt);
        L.spin += L.spinV * dt;
        if (Math.abs(L.vx) < 0.002 && Math.abs(L.vy) < 0.002) L.phase = 'rest';

      } else if (L.phase === 'rest') {
        /* alive, not frozen: the breeze still tugs at it */
        L.rest -= dt;
        L.spin += Math.sin(L.t * 2.1) * 3 * dt;
        var sy3 = surfaceY(L.x);
        if (sy3 !== null) L.y = sy3 + 0.0016 * Math.sin(L.t * 1.7);
        if (L.rest <= 0) {
          L.phase = 'slide';
          L.slideDir = (w !== 0 ? (w > 0 ? 1 : -1) : (L.x < 0.5 ? -1 : 1));
          if (Math.random() < 0.25) L.slideDir *= -1;      // not always downwind
          L.vx = L.slideDir * rand(0.018, 0.042);          // the nudge that frees it
        }

      } else if (L.phase === 'slide') {
        /* skids across the top of the plinth and over the lip */
        L.vx += (L.slideDir * 0.055 + w * 0.4) * dt;
        L.x += L.vx * dt;
        var sy4 = surfaceY(L.x);
        if (sy4 !== null) L.y = sy4;
        L.spin += L.vx * 110 * dt;
        L.tilt += (rand(20, 30) - L.tilt) * Math.min(1, 1.6 * dt);
        if (sy4 === null || Math.abs(L.x - 0.5) > CONFIG.plinthRx * 0.985) {
          L.phase = 'fall';                                 // off the edge it goes
          L.vy = 0.014;
          L.flipAmp = rand(40, 120);
          L.spinV = rand(20, 55) * (L.vx < 0 ? -1 : 1);
          L.landAllowed = false;                            // don't re-land on it
        }
      }

      /* ---- fade / recycle ---- */
      var px = stageX + L.x * stageSize;
      var py = stageY + L.y * stageSize;

      /* everything happens inside the Learning Journey card — a leaf never
         crosses its edge. It fades in the last few pixels before the wall
         (so "drifts off the left side" reads as vanishing into the edge of
         the card, not as a hard stop), and is hard-clamped every frame so
         it can never be caught mid-frame poking past the border. The clamp
         accounts for the sprite's own half-size and its drop-shadow, so
         it's the visible leaf — shadow included — that stays inside, not
         just its centre point. */
      if (cardBox) {
        var half0 = L.size * 0.5, halfH0 = half0 * 1.34, pad = half0 + 6;
        var edgeIn = cardBox.l + pad, edgeOut = cardBox.r - pad;
        var edgeTop = cardBox.t + halfH0 + 6, edgeBot = cardBox.b - halfH0 - 6;
        if (!L.fading) {
          var stale = L.t > 34 && L.phase === 'fall';
          if (px < edgeIn + 7 || px > edgeOut - 7 ||
              py < edgeTop + 7 || py > edgeBot - 7 || stale) {
            L.fading = true;
          }
        }
        px = clamp(px, edgeIn, edgeOut);
        py = clamp(py, edgeTop, edgeBot);
      }
      if (L.fading) {
        L.opacity -= dt / 0.45;
        if (L.opacity <= 0) { recycle(L); continue; }
      } else if (L.phase !== 'attach') {
        L.opacity = Math.min(1, L.opacity + dt / 0.35);
      }

      /* ---- render ---- */
      var half = L.size / 2;
      L.el.style.opacity = L.opacity.toFixed(3);
      L.el.style.transform =
        'translate3d(' + (px - half).toFixed(2) + 'px,' + (py - half * 1.34).toFixed(2) + 'px,0)' +
        ' rotateX(' + L.tilt.toFixed(1) + 'deg)' +
        ' rotateY(' + (L.flipBase + L.flipAmp * Math.sin(L.flutP * 0.85)).toFixed(1) + 'deg)' +
        ' rotateZ(' + L.spin.toFixed(1) + 'deg)' +
        ' scale(' + L.depth.toFixed(3) + ')';
    }
  }

  /* ---------- loop -------------------------------------------------- */

  function frame(ts) {
    if (!live.length) { rafId = null; return; }
    var dt = lastTs ? Math.min(0.05, (ts - lastTs) / 1000) : 0.016;
    lastTs = ts;
    step(dt);
    rafId = requestAnimationFrame(frame);
  }

  function start() {
    if (rafId === null) { lastTs = 0; rafId = requestAnimationFrame(frame); }
  }

  /* ---------- scheduling -------------------------------------------- */

  function schedule() {
    clearTimeout(spawnTimer);
    spawnTimer = setTimeout(tick, rand(CONFIG.spawnMin, CONFIG.spawnMax));
  }

  function tick() {
    /* a second leaf in the air at the same time should be the exception —
       the quiet gaps are what make one leaf feel like a real event */
    var crowded = live.length >= CONFIG.maxActive ||
                  (live.length > 0 && Math.random() < CONFIG.soloBias);
    if (!reduced && onScreen && !document.hidden && !crowded) spawn();
    schedule();
  }

  function pause() { clearTimeout(spawnTimer); spawnTimer = null; }

  /* ---------- boot --------------------------------------------------- */

  function init() {
    stage = document.getElementById('pspTree');
    if (!stage) return;
    var wrap = stage.closest('.psp-tree-wrap');
    if (!wrap) return;
    card = stage.closest('.psp-journey') || wrap;

    var mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    reduced = mq.matches;

    layer = wrap.querySelector('.psp-leaf-layer');
    if (!layer) {
      layer = document.createElement('div');
      layer.className = 'psp-leaf-layer';
      layer.setAttribute('aria-hidden', 'true');
      wrap.appendChild(layer);
    }
    for (var i = 0; i < CONFIG.poolSize; i++) pool.push(makeLeaf());
    measure();
    started = true;

    if (window.ResizeObserver) {
      new ResizeObserver(measure).observe(wrap);
    } else {
      window.addEventListener('resize', measure);
    }

    if (window.IntersectionObserver) {
      new IntersectionObserver(function (es) {
        onScreen = es[0].isIntersecting;
        if (onScreen && !reduced) { if (!spawnTimer) schedule(); }
        else pause();
      }, { threshold: 0.12 }).observe(stage);
    }

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) pause();
      else if (onScreen && !reduced && !spawnTimer) schedule();
    });

    /* honour a live change of the motion preference */
    var onMQ = function () {
      reduced = mq.matches;
      if (reduced) {
        pause();
        while (live.length) recycle(live[0]);
      } else if (onScreen && !spawnTimer) schedule();
    };
    if (mq.addEventListener) mq.addEventListener('change', onMQ);
    else if (mq.addListener) mq.addListener(onMQ);

    if (!reduced) schedule();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  /* small surface for tuning/tests — the page itself never needs this */
  return {
    config: CONFIG,
    spawn: function (b) { return spawn(b); },
    active: function () { return live.length; },
    _step: step,
    _live: function () { return live; },
    _surfaceY: surfaceY,
    _ready: function () { return started; }
  };
})();
