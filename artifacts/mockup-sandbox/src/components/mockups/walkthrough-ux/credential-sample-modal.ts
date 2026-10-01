export function initializeCredentialSampleModal(dialog: HTMLElement, opener?: HTMLButtonElement) {
  const panel = dialog.querySelector<HTMLElement>('.credential-modal__panel');
  const tour = dialog.querySelector<HTMLElement>('[data-credential-tour]');
  const workspace = dialog.querySelector<HTMLElement>('[data-active-step]');
  const ecosystem = dialog.querySelector<HTMLElement>('.credential-ecosystem');
  const currentVisual = dialog.querySelector<HTMLElement>('[data-credential-current-visual]');
  const stages = Array.from(dialog.querySelectorAll<HTMLElement>('[data-credential-stage]'));
  const reveals = Array.from(dialog.querySelectorAll<HTMLElement>('[data-reveal-index]'));
  const steps = Array.from(dialog.querySelectorAll<HTMLButtonElement>('[data-credential-step-to]'));
  const pauseButton = dialog.querySelector<HTMLButtonElement>('[data-credential-pause]');
  const previousButton = dialog.querySelector<HTMLButtonElement>('[data-credential-prev]');
  const forwardButton = dialog.querySelector<HTMLButtonElement>('[data-credential-forward]');
  const count = dialog.querySelector<HTMLElement>('[data-credential-count]');
  const pace = dialog.querySelector<HTMLElement>('[data-credential-pace]');
  const filmline = dialog.querySelector<HTMLElement>('[data-credential-filmline]');
  const shareStatus = dialog.querySelector<HTMLElement>('[data-credential-share-status]');
  const closeButton = dialog.querySelector<HTMLButtonElement>('.credential-modal__close');
  const showcase = dialog.querySelector<HTMLElement>('.credential-university__showcase');
  const footer = dialog.querySelector<HTMLElement>('.credential-modal__footer');

  if (
    !panel || !tour || !workspace || !ecosystem || !currentVisual || !pauseButton ||
    !previousButton || !forwardButton || !count || !pace || !filmline || !shareStatus ||
    !closeButton || !showcase || !footer || stages.length === 0
  ) {
    throw new Error('The extracted credential walkthrough is missing required source markup.');
  }

  const previousOverflow = document.body.style.overflow;
  let previousFocus: HTMLElement | null = null;
  let current = 0;
  let paused = false;
  let timer: number | null = null;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const listeners = new AbortController();
  const storyUrl = new URL('/', window.location.origin);
  storyUrl.searchParams.set('story', 'certificate');
  const storyText =
    'Explore a fictional university credential and how it could connect learning, skills, records and workforce relevance. All verification and workforce views are illustrative.';

  function clearTourTimer() {
    if (timer !== null) window.clearTimeout(timer);
    timer = null;
  }

  function updateControls() {
    count.textContent =
      `Layer ${String(current + 1).padStart(2, '0')} of ${String(stages.length).padStart(2, '0')}`;
    if (current === 0 && document.activeElement === previousButton) forwardButton.focus();
    previousButton.disabled = current === 0;
    forwardButton.textContent = current === stages.length - 1 ? 'Restart ↺' : 'Next layer →';
    pauseButton.textContent = paused ? 'Play' : 'Pause';
    pauseButton.setAttribute('aria-label', paused ? 'Play walkthrough' : 'Pause walkthrough');
    pace.textContent = paused
      ? 'Paused · choose a layer or press Play'
      : 'Auto-playing · choose a layer to take control';
    dialog.classList.toggle('is-paused', paused);
    filmline.style.animationPlayState = paused ? 'paused' : 'running';
  }

  function restartFilmline() {
    filmline.style.animation = 'none';
    void filmline.offsetWidth;
    if (!reduceMotion.matches) {
      filmline.style.animation = 'credential-scene-timer 6800ms linear forwards';
      filmline.style.animationPlayState = paused ? 'paused' : 'running';
    }
  }

  function showStep(index: number, revealInView = false) {
    current = (index + stages.length) % stages.length;
    workspace.setAttribute('data-active-step', String(current));
    stages.forEach((stage, stageIndex) => {
      stage.hidden = stageIndex !== current;
    });
    reveals.forEach((layer) => {
      const revealIndex = Number(layer.getAttribute('data-reveal-index'));
      ecosystem.appendChild(layer);
      const active = revealIndex === current;
      const past = revealIndex < current;
      layer.hidden = revealIndex > current;
      layer.classList.toggle('is-current-reveal', active);
      layer.classList.toggle('is-past-reveal', past);
      if (active) currentVisual.appendChild(layer);
    });
    currentVisual.hidden = current === 0;
    steps.forEach((step, stepIndex) => {
      if (stepIndex === current) step.setAttribute('aria-current', 'true');
      else step.removeAttribute('aria-current');
    });

    restartFilmline();
    updateControls();
    if (revealInView) {
      window.requestAnimationFrame(() => {
        const target = currentVisual.hidden ? stages[current] : currentVisual;
        const bounds = target.getBoundingClientRect();
        const panelBounds = panel.getBoundingClientRect();
        const headerBottom = dialog.querySelector('.credential-modal__header')!.getBoundingClientRect().bottom;
        const footerTop = footer.getBoundingClientRect().top;
        const safeTop = Math.max(panelBounds.top, headerBottom) + 12;
        const safeBottom = Math.min(panelBounds.bottom, footerTop) - 12;
        const available = Math.max(0, safeBottom - safeTop);
        let delta = 0;
        if (bounds.height > available || bounds.top < safeTop) delta = bounds.top - safeTop;
        else if (bounds.bottom > safeBottom) delta = bounds.bottom - safeBottom;
        if (delta) panel.scrollBy({ top: delta, behavior: reduceMotion.matches ? 'auto' : 'smooth' });
      });
    }
  }

  function advanceAfter(delay: number) {
    clearTourTimer();
    if (paused || dialog.hidden) return;
    timer = window.setTimeout(() => {
      showStep(current + 1, true);
      advanceAfter(6800);
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
    showStep(0);
    panel.scrollTop = 0;
    closeButton.focus();
    if (!paused) {
      timer = window.setTimeout(() => {
        showStep(1, true);
        advanceAfter(6800);
      }, 2600);
    }
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

  steps.forEach((button, index) => {
    button.addEventListener('click', () => {
      pauseTour();
      showStep(index, true);
    }, { signal: listeners.signal });
  });

  previousButton.addEventListener('click', () => {
    if (current > 0) {
      pauseTour();
      showStep(current - 1, true);
    }
  }, { signal: listeners.signal });

  forwardButton.addEventListener('click', () => {
    pauseTour();
    showStep(current === stages.length - 1 ? 0 : current + 1, true);
  }, { signal: listeners.signal });

  pauseButton.addEventListener('click', () => {
    if (paused) {
      paused = false;
      if (current === stages.length - 1) showStep(0);
      updateControls();
      advanceAfter(6800);
    } else {
      pauseTour();
    }
  }, { signal: listeners.signal });

  tour.addEventListener('focusin', (event) => {
    const target = event.target;
    if (target instanceof Element && !target.closest('[data-credential-pause]')) pauseTour();
  }, { signal: listeners.signal });
  showcase.addEventListener('focusin', pauseTour, { signal: listeners.signal });
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
    if (link.getAttribute('data-credential-social') === 'linkedin') {
      link.href =
        'https://www.linkedin.com/sharing/share-offsite/?url=' + encodeURIComponent(storyUrl.href);
    } else {
      link.href =
        'https://twitter.com/intent/tweet?url=' +
        encodeURIComponent(storyUrl.href) +
        '&text=' +
        encodeURIComponent(storyText);
    }
  });

  async function copyStoryLink() {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
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
      shareStatus.textContent = 'Link copied. It opens this fictional university walkthrough.';
    } catch {
      shareStatus.textContent = 'Could not copy the link in this browser.';
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
        await navigator.share({
          title: 'Fictional university credential walkthrough · CertifyMe',
          text: storyText,
          url: storyUrl.href,
        });
        shareStatus.textContent = 'Fictional walkthrough link shared.';
      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
          shareStatus.textContent = 'Sharing is unavailable here. Use Copy link instead.';
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

    const focusable = Array.from(
      dialog.querySelectorAll<HTMLElement>(
        'button:not([disabled]), a[href], summary, input, [tabindex="0"]',
      ),
    ).filter((element) => !element.closest('[hidden]') && element.getClientRects().length > 0);
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
    if (typeof reduceMotion.removeListener === 'function') {
      reduceMotion.removeListener(handleMotionPreferenceChange);
    }
    document.body.style.overflow = previousOverflow;
    if (opener) opener.hidden = false;
  };
}