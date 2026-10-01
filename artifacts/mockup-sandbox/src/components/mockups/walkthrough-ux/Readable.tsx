import { useEffect, useRef } from 'react';
import credentialModalMarkup from './readableModal.html?raw';
import './_readable.css';
import { initializeReadableWalkthrough } from './readable-controller';

const resolvedModalMarkup = credentialModalMarkup
  .replaceAll('/assets4/images/Logo/1.png', '/__mockup/images/walkthrough-ux/certifyme-logo.png')
  .replaceAll('/assets4/images/', '/__mockup/images/walkthrough-ux/');

export function Readable() {
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stage = stageRef.current;
    const dialog = stage?.querySelector<HTMLElement>('#credential-sample-dialog');
    const opener = stage?.querySelector<HTMLButtonElement>('[data-credential-open]');
    if (!dialog || !opener) return;
    return initializeReadableWalkthrough(dialog, opener);
  }, []);

  return (
    <div className="credential-preview-stage credential-readable-stage" ref={stageRef}>
      <button type="button" className="credential-readable__reopen" data-credential-open hidden>
        Reopen walkthrough
      </button>
      <div dangerouslySetInnerHTML={{ __html: resolvedModalMarkup }} />
    </div>
  );
}