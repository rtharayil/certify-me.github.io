import { useState } from 'react';
import './_group.css';

const labels = ['Open Badges 3.0 Verified', 'Skill Taxonomy Map', 'Live Job Market Matches'];

export function ReferenceLed() {
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(true);
  return (
    <div className="credential-preview-stage">
      {!open && <button type="button" onClick={() => setOpen(true)} style={{ margin: 32, padding: 16 }}>View Live Sample Credential</button>}
      <div className="credential-modal credential-reference" role="dialog" aria-modal="true" aria-labelledby="credential-modal-title" hidden={!open}>
        <div className="credential-modal__backdrop" onClick={() => setOpen(false)} />
        <div className="credential-modal__panel">
          <header className="credential-modal__header">
            <div className="credential-reference__brand">
              <span className="credential-reference__mark" aria-hidden="true">✓</span>
              <div><span className="credential-reference__brand-name">CertifyMe</span><span className="credential-reference__brand-caption">Credential verification preview</span></div>
            </div>
            <button type="button" className="credential-modal__close" aria-label="Close sample credential" onClick={() => setOpen(false)}>×</button>
          </header>
          <div className="credential-reference__intro">
            <span className="credential-reference__eyebrow">THE CREDENTIAL EXPERIENCE</span>
            <h2 id="credential-modal-title">Verified Credential <span>&amp; Skill Passport</span></h2>
            <p>Explore a real credential presentation, then try illustrative skill and career features below.</p>
          </div>
          <div className="credential-reference__showcase">
            <div className="credential-reference__details">
              <span className="credential-reference__verified"><span aria-hidden="true">✓</span> Verified credential</span>
              <h3>STEM.org Certified™ Master Trainer</h3>
              <p className="credential-reference__issuer">Issued by <strong>STEM.org Educational Research™</strong></p>
              <div className="credential-reference__holder">
                <span className="credential-reference__avatar" aria-hidden="true">JD</span>
                <div><small>AWARDED TO</small><strong>John Doe</strong></div>
              </div>
              <dl className="credential-reference__facts">
                <div><dt>Issued on</dt><dd>28 August 2024</dd></div>
                <div><dt>Validity</dt><dd>Does not expire</dd></div>
              </dl>
              <a className="credential-reference__source" href="https://verify.apac.certifyme.org/verify/9cf66b9d10644" target="_blank" rel="noreferrer">Explore this real credential <span aria-hidden="true">↗</span></a>
            </div>
            <figure className="credential-reference__art">
              <div className="credential-reference__art-frame"><img src="/__mockup/images/sample-reference-credential.png" alt="STEM.org Certified Master Trainer certificate awarded to John Doe" /></div>
              <figcaption>Actual certificate artwork from the linked verification page</figcaption>
            </figure>
          </div>
          <div className="credential-reference__trust">
            <div className="credential-reference__trust-title"><small>THIS CREDENTIAL IS</small><strong>Verified &amp; Trusted</strong></div>
            <div><span className="credential-reference__trust-icon">♢</span><span><strong>Protected</strong><small>Securely stored</small></span></div>
            <div><span className="credential-reference__trust-icon">✓</span><span><strong>Tamper proof</strong><small>Unaltered &amp; authentic</small></span></div>
            <div><span className="credential-reference__trust-icon">✓</span><span><strong>Status</strong><small><i /> Active</small></span></div>
          </div>
          <div className="credential-reference__explore">
            <div className="credential-reference__explore-head">
              <div><span className="credential-reference__eyebrow">ILLUSTRATIVE PRODUCT PREVIEW</span><h3>Explore the skill passport</h3></div>
              <p>The tabs below demonstrate possible features; they do not describe the STEM.org credential above.</p>
            </div>
            <div className="credential-modal__tabs" role="tablist" aria-label="Sample skill passport features">
              {labels.map((label, index) => <button key={label} type="button" role="tab" aria-selected={active === index} tabIndex={active === index ? 0 : -1} onClick={() => setActive(index)} onKeyDown={(event) => {
                if (event.key === 'ArrowRight') setActive((index + 1) % labels.length);
                if (event.key === 'ArrowLeft') setActive((index + labels.length - 1) % labels.length);
              }}>{label}</button>)}
            </div>
            <section className="credential-modal__content" role="tabpanel">
              {active === 0 && <>
                <span className="credential-modal__verified-mark">✓ Open Badges 3.0 Verified — preview</span>
                <h3>Trust you can inspect</h3>
                <p>An illustrative Open Badges 3.0 credential view could show issuer, achievement, and verification details in one place. The real certificate pictured above is a separate example and offers an OpenBadge 2.1 export.</p>
                <div className="credential-modal__detail-grid"><div><small>Example issuer</small><strong>Your institution</strong></div><div><small>Example achievement</small><strong>Applied Skills Certificate</strong></div><div><small>Example status</small><strong>Active and verifiable</strong></div></div>
              </>}
              {active === 1 && <>
                <span className="credential-reference__eyebrow">SAMPLE COMPETENCIES</span>
                <h3>Skill Taxonomy Map</h3>
                <p>Connect an illustrative credential to skills and program context that institutions choose to publish.</p>
                <div className="credential-modal__skill-tags"><span>Data Analytics</span><span>Project Management</span><span>FERPA Compliant</span></div>
                <p className="credential-modal__fine-print">“FERPA Compliant” is illustrative program context, not certification of this learner or the reference credential.</p>
              </>}
              {active === 2 && <>
                <span className="credential-reference__eyebrow">WORKFORCE INTELLIGENCE PREVIEW</span>
                <h3>Live Job Market Matches</h3>
                <p>These two sample employer-skill alignments are illustrative, not live vacancies or verified endorsements.</p>
                <div className="credential-modal__matches"><article><span>01 / Example alignment</span><h4>Data &amp; Insights Teams</h4><p>Data Analytics · Reporting · Evidence-based decisions</p></article><article><span>02 / Example alignment</span><h4>Program Operations Teams</h4><p>Project Management · Stakeholder coordination · Delivery</p></article></div>
              </>}
            </section>
          </div>
          <footer className="credential-modal__footer">
            <div><span className="credential-reference__eyebrow">FOR YOUR INSTITUTION</span><p>Want to issue credentials like this for your institution?</p></div>
            <a className="credential-modal__demo" href="https://info.certifyme.online/request-demo" target="_blank" rel="noreferrer">Book a Demo ↗</a>
          </footer>
        </div>
      </div>
    </div>
  );
}