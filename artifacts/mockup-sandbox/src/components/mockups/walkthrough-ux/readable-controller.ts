export function initializeReadableWalkthrough(dialog: HTMLElement, opener?: HTMLButtonElement) {
  const panel = dialog.querySelector<HTMLElement>('.credential-modal__panel');
  const tour = dialog.querySelector<HTMLElement>('[data-credential-tour]');
  const workspace = dialog.querySelector<HTMLElement>('[data-active-step]');
  const ecosystem = dialog.querySelector<HTMLElement>('.credential-ecosystem');
  const currentVisual = dialog.querySelector<HTMLElement>('[data-credential-current-visual]');
  const past = dialog.querySelector<HTMLElement>('.credential-readable__past');
  const presentationVisual = dialog.querySelector<HTMLElement>('[data-credential-presentation-visual]');
  const outcomeVisual = dialog.querySelector<HTMLElement>('[data-credential-outcome-visual]');
  const stages = Array.from(dialog.querySelectorAll<HTMLElement>('[data-credential-stage]'));
  const reveals = Array.from(dialog.querySelectorAll<HTMLElement>('[data-reveal-index]'));
  const layers = Array.from(dialog.querySelectorAll<HTMLButtonElement>('[data-credential-step-to]'));
  const outcomeButton = dialog.querySelector<HTMLButtonElement>('[data-credential-outcome]');
  const pauseButton = dialog.querySelector<HTMLButtonElement>('[data-credential-pause]');
  const previousButton = dialog.querySelector<HTMLButtonElement>('[data-credential-prev]');
  const forwardButton = dialog.querySelector<HTMLButtonElement>('[data-credential-forward]');
  const count = dialog.querySelector<HTMLElement>('[data-credential-count]');
  const pace = dialog.querySelector<HTMLElement>('[data-credential-pace]');
  const filmline = dialog.querySelector<HTMLElement>('[data-credential-filmline]');
  const shareStatus = dialog.querySelector<HTMLElement>('[data-credential-share-status]');
  const header = dialog.querySelector<HTMLElement>('.credential-modal__header');
  const footer = dialog.querySelector<HTMLElement>('.credential-modal__footer');
  const specimen = dialog.querySelector<HTMLElement>('.credential-readable__specimen');
  const closeButton = dialog.querySelector<HTMLButtonElement>('.credential-modal__close');

  if (
    !panel || !tour || !workspace || !ecosystem || !currentVisual || !past || !presentationVisual ||
    !outcomeVisual || !outcomeButton || !pauseButton || !previousButton || !forwardButton ||
    !count || !pace || !filmline || !shareStatus || !header || !footer || !specimen ||
    !closeButton || stages.length !== 7 || layers.length !== 6 || reveals.length !== 5
  ) {
    throw new Error('Readable credential walkthrough is missing required markup.');
  }

  const previousOverflow = document.body.style.overflow;
  const listeners = new AbortController();
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const dwellByPanel = [13000, 15000, 22000, 15000, 15000, 16000, 16000];
  const storyUrl = new URL('/', window.location.origin);
  storyUrl.searchParams.set('story', 'certificate');
  const storyText =
    'Explore CertifyMe’s fictional university credential walkthrough. Sharing this link opens the tour only; it does not share a learner record.';
  let previousFocus: HTMLElement | null = null;
  let current = 0;
  let paused = false;
  let timer: number | null = null;

  function clearTourTimer() {
    if (timer !== null) window.clearTimeout(timer);
    timer = null;
  }

  function currentDwell() {
    return dwellByPanel[current] ?? 15000;
  }

  function updateControls() {
    const isOutcome = current === stages.length - 1;
    count.textContent = isOutcome
      ? 'Institutional outcome'
      : `Layer ${String(current + 1).padStart(2, '0')} of ${String(layers.length).padStart(2, '0')}`;
    if (current === 0 && document.activeElement === previousButton) forwardButton.focus();
    previousButton.disabled = current === 0;
    forwardButton.textContent = isOutcome
      ? 'Restart walkthrough ↺'
      : current === layers.length - 1 ? 'Institutional outcome →' : 'Next layer →';
    pauseButton.textContent = paused ? 'Play' : 'Pause';
    pauseButton.setAttribute('aria-label', paused ? 'Play walkthrough' : 'Pause walkthrough');
    pace.textContent = paused
      ? 'Paused · choose a layer or resume'
      : isOutcome ? 'Institutional outcome · returning to the start' : 'Following the institutional story';
    dialog.classList.toggle('is-paused', paused);
    filmline.style.animationPlayState = paused ? 'paused' : 'running';
    layers.forEach((layer, index) => {
      if (!isOutcome && index === current) layer.setAttribute('aria-current', 'true');
      else layer.removeAttribute('aria-current');
    });
    if (isOutcome) outcomeButton.setAttribute('aria-current', 'true');
    else outcomeButton.removeAttribute('aria-current');
  }

  function restartFilmline() {
    filmline.style.animation = 'none';
    void filmline.offsetWidth;
    if (!reduceMotion.matches) {
      filmline.style.animation = `readable-timer ${currentDwell()}ms linear forwards`;
      filmline.style.animationPlayState = paused ? 'paused' : 'running';
    }
  }

  function bringIntoReadableView(target: HTMLElement) {
    const bounds = target.getBoundingClientRect();
    const panelBounds = panel.getBoundingClientRect();
    let safeTop = Math.max(panelBounds.top, header.getBoundingClientRect().bottom) + 12;
    const safeBottom = Math.min(panelBounds.bottom, footer.getBoundingClientRect().top) - 12;
    if (window.matchMedia('(max-width: 620px)').matches) {
      safeTop = Math.max(safeTop, specimen.getBoundingClientRect().bottom + 12);
    }
    const available = Math.max(0, safeBottom - safeTop);
    let delta = 0;
    if (bounds.height > available || bounds.top < safeTop) delta = bounds.top - safeTop;
    else if (bounds.bottom > safeBottom) delta = bounds.bottom - safeBottom;
    if (delta) panel.scrollBy({ top: delta, behavior: reduceMotion.matches ? 'auto' : 'smooth' });
  }

  function showPanel(index: number, revealInView = false) {
    current = (index + stages.length) % stages.length;
    const isOutcome = current === stages.length - 1;
    const isPresentation = current === 0;
    workspace.setAttribute('data-active-step', String(current));
    stages.forEach((stage, stageIndex) => {
      stage.hidden = stageIndex !== current;
    });

    ecosystem.appendChild(presentationVisual);
    presentationVisual.hidden = false;
    presentationVisual.classList.toggle('is-current-reveal', isPresentation);
    presentationVisual.classList.toggle('is-past-reveal', !isPresentation);
    if (isPresentation) currentVisual.appendChild(presentationVisual);

    reveals.forEach((layer) => {
      const revealIndex = Number(layer.getAttribute('data-reveal-index'));
      ecosystem.appendChild(layer);
      const active = !isOutcome && revealIndex === current;
      const past = isOutcome || revealIndex < current;
      layer.hidden = !active && !past;
      layer.classList.toggle('is-current-reveal', active);
      layer.classList.toggle('is-past-reveal', past);
      if (active) currentVisual.appendChild(layer);
    });

    ecosystem.appendChild(outcomeVisual);
    outcomeVisual.hidden = !isOutcome;
    if (isOutcome) currentVisual.appendChild(outcomeVisual);
    currentVisual.hidden = false;
    past.hidden = isPresentation;
    restartFilmline();
    updateControls();
    if (revealInView) {
      window.requestAnimationFrame(() => {
        bringIntoReadableView(currentVisual);
      });
    }
  }

  function advanceAfter(delay: number) {
    clearTourTimer();
    if (paused || dialog.hidden) return;
    timer = window.setTimeout(() => {
      showPanel(current === stages.length - 1 ? 0 : current + 1, true);
      advanceAfter(currentDwell());
    }, delay);
  }

  function pauseTour() {
    paused = true;
    clearTourTimer();
    updateControls();
  }

  function open() {
    if (!dialog.hidden) return;
    previousFocus = opener ?? (document.activeElement instanceof HTMLElement ? document.activeElement : null);
    dialog.hidden = false;
    document.body.style.overflow = 'hidden';
    if (opener) opener.hidden = true;
    paused = reduceMotion.matches;
    showPanel(0);
    panel.scrollTop = 0;
    closeButton.focus();
    if (!paused) timer = window.setTimeout(() => {
      showPanel(1, true);
      advanceAfter(currentDwell());
    }, currentDwell());
  }

  function close() {
    clearTourTimer();
    dialog.hidden = true;
    document.body.style.overflow = previousOverflow;
    if (opener) opener.hidden = false;
    previousFocus?.focus();
  }

  opener?.addEventListener('click', open, { signal: listeners.signal });
  dialog.querySelectorAll<HTMLElement>('[data-credential-close]').forEach((element) => {
    element.addEventListener('click', close, { signal: listeners.signal });
  });
  layers.forEach((button, index) => {
    button.addEventListener('click', () => {
      pauseTour();
      showPanel(index, true);
    }, { signal: listeners.signal });
  });
  outcomeButton.addEventListener('click', () => {
    pauseTour();
    showPanel(stages.length - 1, true);
  }, { signal: listeners.signal });
  previousButton.addEventListener('click', () => {
    if (current > 0) {
      pauseTour();
      showPanel(current - 1, true);
    }
  }, { signal: listeners.signal });
  forwardButton.addEventListener('click', () => {
    pauseTour();
    showPanel(current === stages.length - 1 ? 0 : current + 1, true);
  }, { signal: listeners.signal });
  pauseButton.addEventListener('click', () => {
    if (!paused) {
      pauseTour();
      return;
    }
    paused = false;
    updateControls();
    restartFilmline();
    advanceAfter(currentDwell());
  }, { signal: listeners.signal });

  tour.addEventListener('focusin', (event) => {
    const target = event.target;
    if (target instanceof Element && !target.closest('[data-credential-pause]')) pauseTour();
  }, { signal: listeners.signal });
  specimen.addEventListener('focusin', pauseTour, { signal: listeners.signal });
  footer.addEventListener('focusin', pauseTour, { signal: listeners.signal });

  function handleMotionPreferenceChange(event: MediaQueryListEvent) {
    if (event.matches) pauseTour();
  }
  if (typeof reduceMotion.addEventListener === 'function') {
    reduceMotion.addEventListener('change', handleMotionPreferenceChange, { signal: listeners.signal });
  } else if (typeof reduceMotion.addListener === 'function') {
    reduceMotion.addListener(handleMotionPreferenceChange);
  }

  dialog.querySelectorAll<HTMLAnchorElement>('[data-credential-social]').forEach((link) => {
    link.href = link.getAttribute('data-credential-social') === 'linkedin'
      ? `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(storyUrl.href)}`
      : `https://twitter.com/intent/tweet?url=${encodeURIComponent(storyUrl.href)}&text=${encodeURIComponent(storyText)}`;
  });

  async function copyStoryLink() {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(storyUrl.href);
      } else {
        const field = document.createElement('textarea');
        field.value = storyUrl.href;
        field.style.position = 'fixed';
        field.style.opacity = '0';
        document.body.appendChild(field);
        field.select();
        const copied = document.execCommand('copy');
        field.remove();
        if (!copied) throw new Error('Copy unavailable');
      }
      shareStatus.textContent = 'Tour link copied. It opens this fictional walkthrough only.';
    } catch {
      shareStatus.textContent = 'Could not copy the tour link in this browser.';
    }
  }

  dialog.querySelectorAll<HTMLButtonElement>('[data-credential-share]').forEach((button) => {
    button.addEventListener('click', async () => {
      pauseTour();
      if (button.getAttribute('data-credential-share') === 'copy' || !navigator.share) {
        await copyStoryLink();
        return;
      }
      try {
        await navigator.share({ title: 'Fictional university credential walkthrough · CertifyMe', text: storyText, url: storyUrl.href });
        shareStatus.textContent = 'Fictional walkthrough link shared.';
      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
          shareStatus.textContent = 'Sharing is unavailable here. Use Copy tour link instead.';
        }
      }
    }, { signal: listeners.signal });
  });

  dialog.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      close();
      return;
    }
    if (event.key !== 'Tab') return;
    const focusable = Array.from(dialog.querySelectorAll<HTMLElement>(
      'button:not([disabled]), a[href], summary, input, [tabindex="0"]',
    )).filter((element) => !element.closest('[hidden]') && element.getClientRects().length > 0);
    if (!focusable.length) {
      event.preventDefault();
      panel.focus();
      return;
    }
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }, { signal: listeners.signal });

  open();
  return () => {
    clearTourTimer();
    listeners.abort();
    if (typeof reduceMotion.removeListener === 'function') reduceMotion.removeListener(handleMotionPreferenceChange);
    document.body.style.overflow = previousOverflow;
    if (opener) opener.hidden = false;
  };
}