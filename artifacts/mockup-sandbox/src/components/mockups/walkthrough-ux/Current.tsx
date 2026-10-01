import { useEffect, useRef } from 'react';
import credentialModalMarkup from './credentialSampleModal.html?raw';
import './_group.css';
import { initializeCredentialSampleModal } from './credential-sample-modal';

const resolvedModalMarkup = credentialModalMarkup
  .replaceAll('/assets4/images/Logo/1.png', '/__mockup/images/walkthrough-ux/certifyme-logo.png')
  .replaceAll('/assets4/images/', '/__mockup/images/walkthrough-ux/');

export function Current() {
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stage = stageRef.current;
    const dialog = stage?.querySelector<HTMLElement>('#credential-sample-dialog');
    const opener = stage?.querySelector<HTMLButtonElement>('[data-credential-open]');
    if (!dialog) return;

    return initializeCredentialSampleModal(dialog, opener ?? undefined);
  }, []);

  return (
    <div className="credential-preview-stage min-h-screen" ref={stageRef}>
      <button type="button" data-credential-open hidden>
        Open credential walkthrough
      </button>
      <div dangerouslySetInnerHTML={{ __html: resolvedModalMarkup }} />
    </div>
  );
}