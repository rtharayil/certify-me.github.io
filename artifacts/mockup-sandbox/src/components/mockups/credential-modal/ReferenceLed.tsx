import { useEffect, useMemo, useRef, useState } from 'react';
import modalHtml from '../../../../../../_includes/V4NewLook/credentialSampleModal.html?raw';
import certificate from '../../../../../../assets4/images/asterford-certificate.svg';
import qr from '../../../../../../assets4/images/asterford-demo-qr.svg';
import barcode from '../../../../../../assets4/images/asterford-demo-barcode.svg';
import certifyMeLogo from '../../../../../../assets4/images/Logo/1.png';
import './_group.css';

const jobs = {
  analyst: ['Insights Analyst', 'Transforms messy data into useful reports for cross-functional teams.', 'Data Analytics · Evidence-based decisions', 'Data visualization'],
  coordinator: ['Program Coordinator', 'Coordinates timelines, stakeholders, and programme delivery.', 'Project Management · Stakeholder coordination', 'Budget planning'],
} as const;
type Job = keyof typeof jobs;
const STAGE_COUNT = 8;

export function ReferenceLed() {
  const [open, setOpen] = useState(true);
  const [step, setStep] = useState(0);
  const [paused, setPaused] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [started, setStarted] = useState(false);
  const [job, setJob] = useState<Job>('analyst');
  const root = useRef<HTMLDivElement>(null);
  const storyUrl = useMemo(() => {
    const url = new URL('/', window.location.origin);
    url.searchParams.set('story', 'certificate');
    return url.href;
  }, []);
  const storyText = 'Explore the story behind a fictional university certificate: from an award to trust, skills, and career possibilities.';
  // Render the actual Jekyll markup so this canvas preview stays in sync with the homepage.
  const html = useMemo(() => modalHtml.replace(' hidden>', '>')
    .replaceAll('/assets4/images/asterford-certificate.svg', certificate)
    .replaceAll('/assets4/images/asterford-demo-qr.svg', qr)
    .replaceAll('/assets4/images/asterford-demo-barcode.svg', barcode)
    .replaceAll('/assets4/images/Logo/1.png', certifyMeLogo), []);
  const modalContent = useMemo(() => <div dangerouslySetInnerHTML={{ __html: html }} />, [html]);

  const scrollToTour = (showFeature = false, nextStep = step) => {
    const panel = root.current?.querySelector<HTMLElement>('.credential-modal__panel');
    const tour = root.current?.querySelector<HTMLElement>('[data-credential-tour]');
    const stage = root.current?.querySelector<HTMLElement>(`[data-credential-stage="${nextStep}"]`);
    const target = showFeature && window.innerWidth <= 650 ? stage : tour;
    if (panel && target) panel.scrollTo({ top: target.getBoundingClientRect().top - panel.getBoundingClientRect().top + panel.scrollTop - 57, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  };

  useEffect(() => {
    if (!open) return;
    const dialog = root.current;
    if (!dialog) return;
    dialog.querySelectorAll<HTMLElement>('[data-credential-stage]').forEach((stage, i) => { stage.hidden = i !== step; });
    dialog.querySelectorAll<HTMLElement>('[data-credential-step-to]').forEach((button, i) => {
      if (i === step) button.setAttribute('aria-current', 'step');
      else button.removeAttribute('aria-current');
    });
    const strip = dialog.querySelector<HTMLElement>('.credential-tour__steps');
    const selected = dialog.querySelector<HTMLElement>(`[data-credential-step-to="${step}"]`);
    if (strip && selected) strip.scrollTo({
      left: strip.scrollLeft + selected.getBoundingClientRect().left - strip.getBoundingClientRect().left - (strip.clientWidth - selected.clientWidth) / 2,
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'
    });
    const count = dialog.querySelector<HTMLElement>('[data-credential-count]');
    const prev = dialog.querySelector<HTMLButtonElement>('[data-credential-prev]');
    const next = dialog.querySelector<HTMLElement>('[data-credential-forward]');
    const pause = dialog.querySelector<HTMLElement>('[data-credential-pause]');
    const pace = dialog.querySelector<HTMLElement>('[data-credential-pace]');
    if (count) count.textContent = `${String(step + 1).padStart(2, '0')} / ${String(STAGE_COUNT).padStart(2, '0')}`;
    if (prev) prev.disabled = step === 0;
    if (next) next.textContent = step === STAGE_COUNT - 1 ? 'Replay story ↺' : 'Next scene →';
    if (pause) { pause.textContent = paused ? '▶ Play' : 'Ⅱ Pause'; pause.setAttribute('aria-label', paused ? 'Play story' : 'Pause story'); }
    if (pace) pace.textContent = paused ? 'You’re in control · choose any scene' : 'The story loops · click to take control';
    dialog.querySelector('.credential-modal')?.classList.toggle('is-paused', paused);
    const filmline = dialog.querySelector<HTMLElement>('[data-credential-filmline]');
    if (filmline) filmline.style.animationPlayState = paused ? 'paused' : 'running';
    const detail = jobs[job];
    const selectors = ['[data-credential-job-title]', '[data-credential-job-description]', '[data-credential-job-skills]', '[data-credential-job-gap]'];
    selectors.forEach((selector, i) => { const el = dialog.querySelector<HTMLElement>(selector); if (el) el.textContent = detail[i]; });
    dialog.querySelectorAll<HTMLButtonElement>('[data-credential-job]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.credentialJob === job)));
  }, [step, paused, job, open]);

  useEffect(() => {
    if (!open) return;
    const filmline = root.current?.querySelector<HTMLElement>('[data-credential-filmline]');
    if (!filmline) return;
    filmline.style.animation = 'none';
    void filmline.offsetWidth;
    filmline.style.animation = `credential-scene-timer ${step === STAGE_COUNT - 1 ? 8500 : 6800}ms linear forwards`;
    filmline.style.animationPlayState = paused ? 'paused' : 'running';
  }, [open, started, step]);

  useEffect(() => {
    if (!open) return;
    root.current?.querySelectorAll<HTMLAnchorElement>('[data-credential-social]').forEach(link => {
      link.href = link.dataset.credentialSocial === 'linkedin'
        ? `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(storyUrl)}`
        : `https://twitter.com/intent/tweet?url=${encodeURIComponent(storyUrl)}&text=${encodeURIComponent(storyText)}`;
    });
  }, [open, storyUrl]);

  useEffect(() => {
    if (!open || paused) return;
    const timeout = window.setTimeout(() => {
      if (!started) { setStarted(true); scrollToTour(); }
      else {
        const next = (step + 1) % STAGE_COUNT;
        setStep(next);
        window.setTimeout(() => scrollToTour(true, next), 0);
      }
    }, started ? (step === STAGE_COUNT - 1 ? 8500 : 6800) : 2700);
    return () => window.clearTimeout(timeout);
  }, [open, paused, started, step]);

  const navigate = (nextStep: number) => {
    setPaused(true);
    setStarted(true);
    setStep(nextStep);
    window.setTimeout(() => scrollToTour(true, nextStep), 0);
  };

  const shareStory = async (action: string) => {
    const status = root.current?.querySelector<HTMLElement>('[data-credential-share-status]');
    try {
      if (action === 'native' && navigator.share) {
        await navigator.share({ title: 'A certificate with a story · CertifyMe sample', text: storyText, url: storyUrl });
        if (status) status.textContent = 'Sample story shared.';
      } else {
        if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(storyUrl);
        else {
          const field = document.createElement('textarea');
          field.value = storyUrl;
          field.style.position = 'fixed';
          field.style.opacity = '0';
          document.body.appendChild(field);
          field.select();
          const copied = document.execCommand('copy');
          field.remove();
          if (!copied) throw new Error('Copy unavailable');
        }
        if (status) status.textContent = 'Link copied. It opens this fictional sample story.';
      }
    } catch (error) {
      if (status && (!(error instanceof DOMException) || error.name !== 'AbortError')) status.textContent = 'Sharing is unavailable here. Try Copy link.';
    }
  };

  const onClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    if (target.closest('[data-credential-close]')) { setOpen(false); return; }
    if (!target.closest('[data-credential-pause]')) setPaused(true);
    const share = target.closest<HTMLElement>('[data-credential-share]');
    if (share) { setPaused(true); void shareStory(share.dataset.credentialShare || 'copy'); return; }
    const goto = target.closest<HTMLElement>('[data-credential-step-to]');
    if (goto) { navigate(Number(goto.dataset.credentialStepTo)); return; }
    if (target.closest('[data-credential-prev]')) { navigate(Math.max(step - 1, 0)); return; }
    if (target.closest('[data-credential-forward]')) { navigate(step === STAGE_COUNT - 1 ? 0 : step + 1); return; }
    if (target.closest('[data-credential-pause]')) {
      if (paused && step === STAGE_COUNT - 1) { setStep(0); scrollToTour(); }
      setStarted(true);
      setPaused(!paused);
      return;
    }
    const role = target.closest<HTMLElement>('[data-credential-job]');
    if (role) { setJob(role.dataset.credentialJob as Job); setPaused(true); }
  };

  const onChange = (event: React.ChangeEvent<HTMLDivElement>) => {
    const input = event.target as HTMLInputElement;
    if (!input.matches('[data-credential-file]') || !input.files?.[0]) return;
    setPaused(true);
    const status = input.closest('[data-credential-drop]')?.parentElement?.querySelector('[data-credential-file-status]');
    if (status) status.textContent = `${input.files[0].name.slice(0, 65)} selected locally · no verification performed`;
  };

  const onDrop = (event: React.DragEvent<HTMLDivElement>) => {
    const zone = (event.target as HTMLElement).closest('[data-credential-drop]');
    if (!zone) return;
    event.preventDefault();
    zone.classList.remove('is-dragging');
    const file = event.dataTransfer.files[0];
    if (!file) return;
    setPaused(true);
    const status = zone.parentElement?.querySelector('[data-credential-file-status]');
    if (status) status.textContent = `${file.name.slice(0, 65)} selected locally · no verification performed`;
  };

  return <div className="credential-preview-stage" onClick={onClick} onChange={onChange} onDrop={onDrop}
    onDragOver={event => { if ((event.target as HTMLElement).closest('[data-credential-drop]')) event.preventDefault(); }}
    onKeyDown={event => { if (event.key === 'Escape') setOpen(false); else if (event.key === 'Tab') setPaused(true); }} ref={root}>
    {!open && <button type="button" onClick={() => { setOpen(true); setStep(0); setStarted(false); setPaused(window.matchMedia('(prefers-reduced-motion: reduce)').matches); }} style={{ margin: 32, padding: 16 }}>View sample certificate tour</button>}
    {open && modalContent}
  </div>;
}