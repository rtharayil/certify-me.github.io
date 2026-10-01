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
  const layerNames = layers.map((layer) => layer.textContent?.replace(/^\s*\d+\s*/, '').trim() ?? '');
  const focusTitle = dialog.querySelector<HTMLElement>('[data-credential-focus-title]');
  const focusNext = dialog.querySelector<HTMLElement>('[data-credential-focus-next]');
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
  const specimenDisclosure = dialog.querySelector<HTMLDetailsElement>('.credential-readable__specimen-disclosure');
  const layerPicker = dialog.querySelector<HTMLDetailsElement>('.credential-readable__layer-picker');
  const choiceCurrent = dialog.querySelector<HTMLElement>('[data-credential-choice-current]');

  if (
    !panel || !tour || !workspace || !ecosystem || !currentVisual || !past || !presentationVisual ||
    !outcomeVisual || !outcomeButton || !pauseButton || !previousButton || !forwardButton ||
    !count || !pace || !filmline || !shareStatus || !header || !footer || !specimen ||
    !closeButton || !focusTitle || !focusNext || !specimenDisclosure || !layerPicker || !choiceCurrent ||
    stages.length !== 7 || layers.length !== 6 || reveals.length !== 5
  ) {
    throw new Error('Readable credential walkthrough is missing required markup.');
  }

  const previousOverflow = document.body.style.overflow;
  const listeners = new AbortController();
  const stickyBoundsObserver = typeof ResizeObserver === 'function'
    ? new ResizeObserver(syncHeaderHeight)
    : null;
  stickyBoundsObserver?.observe(header);
  stickyBoundsObserver?.observe(footer);
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const mobileLayout = window.matchMedia('(max-width: 620px), (max-width: 950px) and (max-height: 500px) and (pointer: coarse)');
  const dwellByPanel = [10400, 12000, 17600, 12000, 12000, 12800, 12800];
  const storyUrl = new URL('/', window.location.origin);
  storyUrl.searchParams.set('story', 'certificate');
  const storyText =
    'Explore CertifyMe’s fictional university credential walkthrough. Sharing this link opens the tour only; it does not share a learner record.';
  let previousFocus: HTMLElement | null = null;
  let current = 0;
  let paused = false;
  let timer: number | null = null;
  let readingTouch: { y: number; interactive: boolean } | null = null;

  function clearTourTimer() {
    if (timer !== null) window.clearTimeout(timer);
    timer = null;
  }

  function currentDwell() {
    return dwellByPanel[current] ?? 12000;
  }

  function syncHeaderHeight() {
    if (!dialog.hidden) {
      dialog.style.setProperty('--read-header-height', `${Math.ceil(header.getBoundingClientRect().height)}px`);
      dialog.style.setProperty('--read-footer-height', `${Math.ceil(footer.getBoundingClientRect().height)}px`);
    }
  }

  function updateControls() {
    const isOutcome = current === stages.length - 1;
    count.textContent = isOutcome
      ? 'Institutional outcome'
      : `Layer ${String(current + 1).padStart(2, '0')} of ${String(layers.length).padStart(2, '0')}`;
    const nextName = isOutcome ? layerNames[0]
      : current === layers.length - 1 ? 'Institutional outcome' : layerNames[current + 1];
    focusTitle.textContent = isOutcome
      ? (mobileLayout.matches ? 'Institutional outcome' : 'Viewing the institutional outcome')
      : (mobileLayout.matches
        ? `${count.textContent} · ${layerNames[current]}`
        : `Viewing ${count.textContent.toLowerCase()} · ${layerNames[current]}`);
    choiceCurrent.textContent = isOutcome ? 'Institutional outcome' : layerNames[current];
    focusNext.textContent = mobileLayout.matches
      ? `${paused ? 'Paused · ' : 'Auto · '}${isOutcome ? 'Loop: ' : 'Next: '}${nextName}`
      : `${paused ? 'Paused · ' : 'Auto-playing · '}${isOutcome ? 'Loops back to: ' : 'Next: '}${nextName}${paused ? ' · Press Play to continue' : ''}`;
    if (current === 0 && document.activeElement === previousButton) forwardButton.focus();
    previousButton.disabled = current === 0;
    forwardButton.textContent = isOutcome
      ? 'Restart walkthrough ↺'
      : current === layers.length - 1 ? 'Institutional outcome →' : 'Next layer →';
    pauseButton.textContent = paused ? 'Play' : 'Pause';
    pauseButton.setAttribute('aria-label', paused ? 'Play walkthrough' : 'Pause walkthrough');
    pace.textContent = paused ? 'Paused' : 'Auto-playing';
    dialog.classList.toggle('is-paused', paused);
    filmline.style.animationPlayState = paused ? 'paused' : 'running';
    layers.forEach((layer, index) => {
      if (!isOutcome && index === current) layer.setAttribute('aria-current', 'true');
      else layer.removeAttribute('aria-current');
    });
    if (isOutcome) outcomeButton.setAttribute('aria-current', 'true');
    else outcomeButton.removeAttribute('aria-current');
    syncHeaderHeight();
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
    const headerBottom = header.getBoundingClientRect().bottom;
    let safeTop = Math.max(panelBounds.top, headerBottom) + 12;
    let safeBottom = Math.min(panelBounds.bottom, footer.getBoundingClientRect().top) - 12;
    if (mobileLayout.matches) {
      const pickerSummary = layerPicker.querySelector('summary');
      if (pickerSummary) safeTop = Math.max(safeTop, headerBottom + pickerSummary.getBoundingClientRect().height + 22);
      const targetBounds = target.getBoundingClientRect();
      const stage = target.closest('.credential-readable__stage');
      const firstParagraph = stage?.querySelector('p:not(.credential-readable__note):not(.credential-readable__critical)');
      const readingBottom = firstParagraph?.getBoundingClientRect().bottom ?? targetBounds.bottom;
      const available = Math.max(0, safeBottom - safeTop);
      const readingHeight = readingBottom - targetBounds.top;
      const desiredTop = readingHeight <= available ? safeTop : Math.max(safeTop, safeBottom - readingHeight);
      // Keep the heading and opening paragraph between the sticky picker and footer.
      if (targetBounds.top < safeTop || readingBottom > safeBottom) {
        panel.scrollBy({ top: targetBounds.top - desiredTop, behavior: 'auto' });
      }
      return;
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
        const heading = stages[current].querySelector<HTMLElement>('h2');
        bringIntoReadableView(mobileLayout.matches && heading ? heading : currentVisual);
      });
    }
  }

  function syncDisclosureMode(event?: MediaQueryListEvent) {
    const isMobile = event?.matches ?? mobileLayout.matches;
    specimenDisclosure.open = !isMobile;
    layerPicker.open = !isMobile;
    if (!dialog.hidden && isMobile) {
      window.requestAnimationFrame(() => {
        const heading = stages[current].querySelector<HTMLElement>('h2');
        if (heading) bringIntoReadableView(heading);
      });
    }
  }

  function syncViewport() {
    syncHeaderHeight();
    if (dialog.hidden || !mobileLayout.matches) return;
    window.requestAnimationFrame(() => {
      const heading = stages[current].querySelector<HTMLElement>('h2');
      if (heading) bringIntoReadableView(heading);
    });
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

  function pauseForReadingGesture(event: TouchEvent | WheelEvent) {
    if (!mobileLayout.matches || dialog.hidden || paused) return;
    if (event.type === 'touchstart') {
      const touchEvent = event as TouchEvent;
      const target = event.target;
      readingTouch = {
        y: touchEvent.touches.length ? touchEvent.touches[0].clientY : 0,
        interactive: target instanceof Element && !!target.closest('[data-credential-pause]'),
      };
      return;
    }
    if (event.type === 'touchend' || event.type === 'touchcancel') {
      readingTouch = null;
      return;
    }
    if (event.type === 'touchmove') {
      const touchEvent = event as TouchEvent;
      if (!readingTouch || readingTouch.interactive || !touchEvent.touches.length) return;
      if (Math.abs(touchEvent.touches[0].clientY - readingTouch.y) > 8) pauseTour();
      return;
    }
    const wheelEvent = event as WheelEvent;
    const target = event.target;
    if (Math.abs(wheelEvent.deltaY) > 2 && !(target instanceof Element && target.closest('[data-credential-pause]'))) {
      pauseTour();
    }
  }

  function open() {
    if (!dialog.hidden) return;
    syncDisclosureMode();
    previousFocus = opener ?? (document.activeElement instanceof HTMLElement ? document.activeElement : null);
    dialog.hidden = false;
    document.body.style.overflow = 'hidden';
    if (opener) opener.hidden = true;
    paused = reduceMotion.matches;
    showPanel(0, false);
    panel.scrollTop = 0;
    closeButton.focus({ preventScroll: true });
    window.requestAnimationFrame(() => {
      if (!dialog.hidden && mobileLayout.matches) {
        const heading = stages[current].querySelector<HTMLElement>('h2');
        if (heading) bringIntoReadableView(heading);
      }
    });
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
  window.addEventListener('resize', syncViewport, { signal: listeners.signal });
  panel.addEventListener('touchstart', pauseForReadingGesture, { passive: true, signal: listeners.signal });
  panel.addEventListener('touchmove', pauseForReadingGesture, { passive: true, signal: listeners.signal });
  panel.addEventListener('touchend', pauseForReadingGesture, { passive: true, signal: listeners.signal });
  panel.addEventListener('touchcancel', pauseForReadingGesture, { passive: true, signal: listeners.signal });
  panel.addEventListener('wheel', pauseForReadingGesture, { passive: true, signal: listeners.signal });
  syncDisclosureMode();
  if (typeof mobileLayout.addEventListener === 'function') {
    mobileLayout.addEventListener('change', syncDisclosureMode, { signal: listeners.signal });
  } else if (typeof mobileLayout.addListener === 'function') {
    mobileLayout.addListener(syncDisclosureMode);
  }
  dialog.querySelectorAll<HTMLElement>('[data-credential-close]').forEach((element) => {
    element.addEventListener('click', close, { signal: listeners.signal });
  });
  layers.forEach((button, index) => {
    button.addEventListener('click', () => {
      pauseTour();
      showPanel(index, true);
      if (mobileLayout.matches) {
        layerPicker.open = false;
        layerPicker.querySelector('summary')?.focus({ preventScroll: true });
      }
    }, { signal: listeners.signal });
  });
  dialog.querySelectorAll<HTMLButtonElement>('[data-credential-revisit]').forEach((button) => {
    button.addEventListener('click', () => {
      pauseTour();
      showPanel(Number(button.getAttribute('data-credential-revisit')), false);
      const heading = stages[current].querySelector<HTMLElement>('h2');
      if (heading) {
        heading.setAttribute('tabindex', '-1');
        heading.focus({ preventScroll: true });
        window.requestAnimationFrame(() => bringIntoReadableView(heading));
      }
    }, { signal: listeners.signal });
  });
  outcomeButton.addEventListener('click', () => {
    pauseTour();
    showPanel(stages.length - 1, true);
    if (mobileLayout.matches) {
      layerPicker.open = false;
      layerPicker.querySelector('summary')?.focus({ preventScroll: true });
    }
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
  footer.addEventListener('focusin', (event) => {
    const target = event.target;
    if (!(target instanceof Element) || !target.closest('[data-credential-pause]')) pauseTour();
  }, { signal: listeners.signal });

  function handleMotionPreferenceChange(event: MediaQueryListEvent) {
    if (event.matches) pauseTour();
  }
  if (typeof reduceMotion.addEventListener === 'function') {
    reduceMotion.addEventListener('change', handleMotionPreferenceChange, { signal: listeners.signal });
  } else if (typeof reduceMotion.addListener === 'function') {
    reduceMotion.addListener(handleMotionPreferenceChange);
  }

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
        const errorName = error && typeof error === 'object' && 'name' in error ? error.name : undefined;
        if (errorName !== 'AbortError') await copyStoryLink();
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
    stickyBoundsObserver?.disconnect();
    if (typeof reduceMotion.removeListener === 'function') reduceMotion.removeListener(handleMotionPreferenceChange);
    if (typeof mobileLayout.removeListener === 'function') mobileLayout.removeListener(syncDisclosureMode);
    document.body.style.overflow = previousOverflow;
    if (opener) opener.hidden = false;
  };
}