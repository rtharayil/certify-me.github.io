import './_group.css';

export function Current() {
  return (
    <div className="credential-preview-stage">
      <div className="credential-modal" role="dialog" aria-modal="true" aria-labelledby="credential-modal-title">
        <div className="credential-modal__backdrop" />
        <div className="credential-modal__panel">
          <header className="credential-modal__header">
            <div>
              <p className="credential-modal__eyebrow">Interactive product preview · Illustrative data</p>
              <h2 id="credential-modal-title">CertifyMe Verified Credential &amp; Skill Passport</h2>
              <p>Explore how a credential can connect verification, mapped skills, and career signals.</p>
            </div>
            <button type="button" className="credential-modal__close" aria-label="Close sample credential">×</button>
          </header>
          <div className="credential-modal__body">
            <div className="credential-modal__identity">
              <span className="credential-modal__seal" aria-hidden="true">✓</span>
              <div>
                <span className="credential-modal__label">Sample institutional credential</span>
                <h3>Applied Skills Certificate</h3>
                <p>Example learner · Issued by your institution</p>
              </div>
              <span className="credential-modal__status">✓ Verified preview</span>
            </div>
            <div className="credential-modal__tabs" role="tablist" aria-label="Credential details">
              <button type="button" role="tab" aria-selected="true">Open Badges 3.0 Verified</button>
              <button type="button" role="tab" aria-selected="false">Skill Taxonomy Map</button>
              <button type="button" role="tab" aria-selected="false">Live Job Market Matches</button>
            </div>
            <section className="credential-modal__content" role="tabpanel">
              <div className="credential-modal__verified-mark"><span aria-hidden="true">✓</span> Open Badges 3.0 Verified</div>
              <h3>Verification built into the credential</h3>
              <p>This illustrative preview shows the issuer, achievement, and verification information an institution could present in an Open Badges 3.0 credential.</p>
              <div className="credential-modal__detail-grid">
                <div><small>Issuer</small><strong>Your institution</strong></div>
                <div><small>Achievement</small><strong>Applied Skills Certificate</strong></div>
                <div><small>Example status</small><strong>Active and verifiable</strong></div>
              </div>
            </section>
          </div>
          <footer className="credential-modal__footer">
            <div>
              <p>Want to issue credentials like this for your institution?</p>
              <a href="https://verify.apac.certifyme.org/verify/9cf66b9d10644">View a real verified credential ↗</a>
            </div>
            <a className="credential-modal__demo" href="https://info.certifyme.online/request-demo">Book a Demo ↗</a>
          </footer>
        </div>
      </div>
    </div>
  );
}