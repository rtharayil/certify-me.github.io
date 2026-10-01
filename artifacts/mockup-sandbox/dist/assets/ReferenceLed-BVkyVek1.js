import{r,j as C}from"./index-D3IQDhdi.js";/* empty css               */const U=`<div id="credential-sample-dialog" class="credential-modal credential-university credential-readable" role="dialog" aria-modal="true"
     aria-labelledby="credential-modal-title" aria-describedby="credential-modal-description" hidden>
  <div class="credential-modal__backdrop" data-credential-close></div>
  <div class="credential-modal__panel" tabindex="-1">
    <header class="credential-modal__header">
      <div class="credential-readable__brand">
        <img src="/assets4/images/Logo/1.png" alt="CertifyMe" width="115" height="32">
        <span>University credential walkthrough</span>
      </div>
      <span class="credential-readable__sample">FICTIONAL · UNSIGNED · UNVERIFIED</span>
      <button type="button" class="credential-modal__close" data-credential-close aria-label="Close walkthrough">×</button>
    </header>

    <div class="credential-readable__intro">
      <div>
        <span class="credential-readable__eyebrow">CREDENTIAL INFRASTRUCTURE FOR UNIVERSITIES</span>
        <h1 id="credential-modal-title">A credential is the start of a system.</h1>
      </div>
      <p id="credential-modal-description">Follow one fictional Asterford University achievement—from sharing and trust to a governed learner record and career context.</p>
      <button type="button" class="credential-readable__share-shortcut" data-credential-share="native">Share this fictional tour <span aria-hidden="true">↗</span></button>
    </div>

    <main class="credential-readable__workspace" data-active-step="0">
      <aside class="credential-readable__specimen" aria-label="Persistent fictional credential specimen">
        <div class="credential-readable__specimen-top">
          <span>THE REFERENCE</span>
          <span class="credential-readable__reference-id">AU-DEMO-2026-0148</span>
        </div>
        <figure class="credential-readable__certificate">
          <img src="/assets4/images/asterford-certificate.svg" alt="Illustrative Asterford University certificate for fictional learner Jordan Lee; not issued">
          <figcaption>Illustrative certificate artwork · no award was issued</figcaption>
        </figure>
        <div class="credential-readable__identity">
          <p class="credential-readable__institution">ASTERFORD UNIVERSITY <span>· Fictional institution</span></p>
          <h2>Applied Data &amp;<br>Project Leadership</h2>
          <p class="credential-readable__program">Graduate Certificate · School of Continuing &amp; Professional Studies</p>
          <div class="credential-readable__recipient">
            <span class="credential-readable__avatar" aria-hidden="true">JL</span>
            <span><small>FICTIONAL LEARNER</small><strong>Jordan Lee</strong></span>
            <span class="credential-readable__date"><small>EXAMPLE DATE</small><strong>22 May 2026</strong></span>
          </div>
          <div class="credential-readable__codes">
            <img src="/assets4/images/asterford-demo-qr.svg" alt="Sample QR code for the fictional reference record; it does not establish authenticity" width="48" height="48">
            <div><small>REFERENCE ID · NOT PROOF</small><strong>AU-DEMO-2026-0148</strong><img src="/assets4/images/asterford-demo-barcode.svg" alt="" aria-hidden="true"></div>
          </div>
        </div>
        <p class="credential-readable__persistent-note">Fictional sample · unsigned · not issued or verified.</p>
      </aside>

      <section class="credential-readable__journey" data-credential-tour aria-label="Guided credential layers">
        <div class="credential-readable__journey-head">
          <div>
            <span class="credential-readable__eyebrow">FOLLOW THE RECORD</span>
            <span class="credential-readable__count" data-credential-count aria-live="polite">Layer 01 of 06</span>
          </div>
          <span class="credential-readable__timer" aria-hidden="true"><span data-credential-filmline></span></span>
        </div>

        <nav class="credential-readable__layers" aria-label="Credential walkthrough layers">
          <button type="button" data-credential-step-to="0" aria-label="Layer 1: Presentation and Sharing" aria-current="true"><span>01</span> Presentation &amp; Sharing</button>
          <button type="button" data-credential-step-to="1" aria-label="Layer 2: Standardisation"><span>02</span> Standardisation</button>
          <button type="button" data-credential-step-to="2" aria-label="Layer 3: Verification"><span>03</span> Verification</button>
          <button type="button" data-credential-step-to="3" aria-label="Layer 4: Skills and Taxonomy"><span>04</span> Skills &amp; Taxonomy</button>
          <button type="button" data-credential-step-to="4" aria-label="Layer 5: Comprehensive Learner Record"><span>05</span> Comprehensive Learner Record</button>
          <button type="button" data-credential-step-to="5" aria-label="Layer 6: Workforce and Career Context"><span>06</span> Workforce &amp; Career Context</button>
        </nav>
        <div class="credential-readable__outcome-link">
          <span>THE INSTITUTIONAL OUTCOME</span>
          <button type="button" data-credential-outcome aria-label="Go to the institutional outcome">See where it leads <span aria-hidden="true">→</span></button>
        </div>

        <div class="credential-readable__active-grid">
          <div class="credential-readable__story" aria-live="polite">
            <article class="credential-readable__stage" data-credential-stage="0">
              <span class="credential-readable__kicker">LAYER 01 <i></i> PRESENTATION &amp; SHARING</span>
              <h2>One achievement. Ready to travel.</h2>
              <p>An issued credential can be shared as a portable link or added to a learner profile. Depending on the receiving service, it may also be shared through social channels or a digital wallet.</p>
              <p>Each destination should lead back to the same credential record—not a loose image of a badge.</p>
              <p class="credential-readable__note"><strong>In this demonstration</strong> The share controls distribute this fictional walkthrough only. Jordan Lee’s sample credential is not issued.</p>
            </article>
            <article class="credential-readable__stage" data-credential-stage="1" hidden>
              <span class="credential-readable__kicker">LAYER 02 <i></i> STANDARDISATION</span>
              <h2>Shared standards make exchange possible.</h2>
              <p>Open Badges 3.0 provides a structured way to represent an achievement and its evidence as a portable digital badge. The W3C Verifiable Credentials data model describes claims that compatible systems can exchange and check.</p>
              <p>These widely adopted standards are designed for interoperable issuance, exchange and verification. They do not guarantee universal recognition: receiving-system support and institutional policy still matter.</p>
              <p class="credential-readable__note"><strong>Fields in view</strong> Issuer · achievement · recipient · criteria · evidence · status · proof concepts</p>
            </article>
            <article class="credential-readable__stage" data-credential-stage="2" hidden>
              <span class="credential-readable__kicker">LAYER 03 <i></i> VERIFICATION</span>
              <h2>Trust comes from checking the record, not its picture.</h2>
              <p>A verifier checks a cryptographic proof against an issuer-controlled public key and establishes why that key belongs to the named issuer. If signed credential data changes, the proof should no longer validate.</p>
              <p>A unique ID, tag or QR code can resolve the right record; the identifier itself does not prove authenticity. Checking an Open Badge means examining its structured issuer, recipient, achievement, criteria and evidence—then applying compatible Verifiable Credential proof, schema and relevant expiry, status or revocation checks.</p>
              <p class="credential-readable__note"><strong>Important limits</strong> A valid signature does not prove learner competence or imply automatic issuer endorsement. DID or HTTPS issuer references may support key discovery where available; a DID is not required for every credential.</p>
              <details class="credential-readable__deep-detail">
                <summary>What a careful verifier checks</summary>
                <ol>
                  <li><strong>Proof integrity</strong><span>Verify the signature with the issuer-controlled key. Altered signed data must fail validation.</span></li>
                  <li><strong>Key provenance</strong><span>Confirm how the key is associated with the issuer, using supported DID or HTTPS references and a trusted issuer context.</span></li>
                  <li><strong>Credential meaning</strong><span>Inspect the AchievementCredential fields and the evidence and criteria—not merely a certificate image.</span></li>
                  <li><strong>Current standing</strong><span>Where the format and issuer provide them, check schema, expiry and status or revocation information.</span></li>
                </ol>
              </details>
              <p class="credential-readable__critical"><strong>This specimen is unsigned and unverified.</strong> No verifier, signature, issuer key, status endpoint or record has been checked here.</p>
            </article>
            <article class="credential-readable__stage" data-credential-stage="3" hidden>
              <span class="credential-readable__kicker">LAYER 04 <i></i> SKILLS &amp; TAXONOMY</span>
              <h2>Make learning outcomes legible as capabilities.</h2>
              <p>Programs can describe the skills an achievement is intended to represent, then relate those terms to a shared vocabulary. Learners, institutions and receiving systems gain a more consistent way to discuss what was taught.</p>
              <p class="credential-readable__note"><strong>Illustrative only</strong> These sample skills and vocabulary relationships are not independently assessed, verified mappings or evidence of competence.</p>
            </article>
            <article class="credential-readable__stage" data-credential-stage="4" hidden>
              <span class="credential-readable__kicker">LAYER 05 <i></i> COMPREHENSIVE LEARNER RECORD</span>
              <h2>Put one award in the context of a learner’s journey.</h2>
              <p>A comprehensive learner record can bring credentials together with skills, achievements, coursework, projects and experiences—while keeping their origins visible.</p>
              <p>For an institution, this is governed infrastructure: clear stewardship, consent and access rules help learners carry a coherent record without flattening distinct evidence into one claim.</p>
              <p class="credential-readable__note"><strong>Institutional role</strong> Organise and govern learning evidence; preserve who issued it and what each record actually says.</p>
            </article>
            <article class="credential-readable__stage" data-credential-stage="5" hidden>
              <span class="credential-readable__kicker">LAYER 06 <i></i> WORKFORCE &amp; CAREER CONTEXT</span>
              <h2>Connect program capabilities to the world beyond campus.</h2>
              <p>Institutions can compare program outcomes with employer-relevant skills and occupational contexts, then help learners explore a next course, project or career direction.</p>
              <p class="credential-readable__note"><strong>Illustrative context</strong> Roles and sectors shown are examples only. No live vacancies, employer endorsements, demand counts, job matches or personalised recommendations are presented.</p>
            </article>
            <article class="credential-readable__stage credential-readable__outcome-stage" data-credential-stage="6" hidden>
              <span class="credential-readable__kicker">INSTITUTIONAL OUTCOME <i></i> NOT A NUMBERED LAYER</span>
              <h2>One governed thread from learning to opportunity.</h2>
              <p>CertifyMe connects the records institutions issue with the learning they represent and the contexts learners may explore next.</p>
              <p>That infrastructure can support clearer credential access, more coherent learner records, program reflection and a more legible account of workforce relevance—without turning illustrative connections into promises or verified outcomes.</p>
              <p class="credential-readable__note"><strong>The institutional value</strong> Govern the record. Preserve its meaning. Make the next connection easier to understand.</p>
            </article>
          </div>

          <div class="credential-readable__current-visual" data-credential-current-visual aria-label="Current layer illustration"></div>
        </div>

        <div class="credential-readable__past" aria-label="Previously introduced layers" hidden>
          <div class="credential-readable__past-heading"><span>CONNECTIONS SO FAR</span><span>Earlier layers stay in view</span></div>
          <div class="credential-ecosystem" aria-label="Connections accumulated through the walkthrough">
            <div class="credential-ecosystem__connector" aria-hidden="true"></div>
            <article class="credential-ecosystem__layer credential-ecosystem__presentation" data-credential-presentation-visual hidden>
              <div class="credential-ecosystem__layer-heading"><span class="credential-ecosystem__node">01</span><div><small>PRESENTATION &amp; SHARING</small><strong>One achievement · supported destinations</strong></div></div>
              <div class="credential-readable__share-model"><span>Credential record</span><b aria-hidden="true">→</b><span>Portable link</span><b aria-hidden="true">→</b><span>Profile · social · wallet*</span></div>
              <p>*Where the receiving service supports it. The share action here opens this fictional tour only.</p>
            </article>
            <article class="credential-ecosystem__layer credential-ecosystem__standardisation" data-reveal-index="1" hidden>
              <div class="credential-ecosystem__layer-heading"><span class="credential-ecosystem__node">02</span><div><small>STANDARDISATION</small><strong>Open Badges 3.0 · W3C Verifiable Credentials</strong></div></div>
              <div class="credential-readable__standards"><div><strong>Open Badges 3.0</strong><span>Achievement + evidence</span></div><div><strong>W3C Verifiable Credentials</strong><span>Claims for compatible exchange and checking</span></div></div>
            </article>
            <article class="credential-ecosystem__layer credential-ecosystem__verification" data-reveal-index="2" hidden>
              <div class="credential-ecosystem__layer-heading"><span class="credential-ecosystem__node">03</span><div><small>VERIFICATION</small><strong>Proof · issuer key · record standing</strong></div></div>
              <div class="credential-readable__proof-line"><span>Issuer key</span><b aria-hidden="true">→</b><span>Signature proof</span><b aria-hidden="true">→</b><span>Compatible verifier</span></div>
              <p>Unsigned in this demonstration. No proof or issuer identity has been checked.</p>
            </article>
            <article class="credential-ecosystem__layer credential-ecosystem__skills" data-reveal-index="3" hidden>
              <div class="credential-ecosystem__layer-heading"><span class="credential-ecosystem__node">04</span><div><small>SKILLS &amp; TAXONOMY</small><strong>Outcome → capability → vocabulary</strong></div></div>
              <div class="credential-readable__skill-map"><span>Applied learning</span><b aria-hidden="true">→</b><span>Data analysis</span><b aria-hidden="true">→</b><span>Shared concept</span></div>
              <p>Sample skills and mappings are illustrative, not verified or independently assessed.</p>
            </article>
            <article class="credential-ecosystem__layer credential-ecosystem__record" data-reveal-index="4" hidden>
              <div class="credential-ecosystem__layer-heading"><span class="credential-ecosystem__node">05</span><div><small>COMPREHENSIVE LEARNER RECORD</small><strong>Learning evidence, with its origin intact</strong></div></div>
              <div class="credential-readable__record-chips"><span>Credentials</span><span>Skills</span><span>Projects</span><span>Experiences</span></div>
            </article>
            <article class="credential-ecosystem__layer credential-ecosystem__workforce" data-reveal-index="5" hidden>
              <div class="credential-ecosystem__layer-heading"><span class="credential-ecosystem__node">06</span><div><small>WORKFORCE &amp; CAREER CONTEXT</small><strong>Institutional relevance · learner exploration</strong></div></div>
              <div class="credential-readable__career-line"><span>Program outcomes</span><b aria-hidden="true">→</b><span>Employer context</span><b aria-hidden="true">→</b><span>Next learning / career possibility</span></div>
              <p>Illustrative pathways only; no live demand or job matching.</p>
            </article>
          </div>
        </div>

        <article class="credential-readable__outcome-visual" data-credential-outcome-visual hidden>
          <div class="credential-readable__outcome-mark" aria-hidden="true"><span>Programs</span><i></i><span>Learning outcomes</span><i></i><span>Credential records</span><i></i><span>Skills &amp; contexts</span></div>
          <p>Institutional infrastructure makes the relationships visible while leaving each claim, issuer and decision in context.</p>
        </article>

        <div class="credential-readable__controls">
          <span class="credential-readable__pace" data-credential-pace aria-live="polite">Auto-playing · select a layer to take control</span>
          <div>
            <button type="button" data-credential-pause aria-label="Pause walkthrough">Pause</button>
            <button type="button" data-credential-prev disabled>← Previous</button>
            <button type="button" class="credential-readable__next" data-credential-forward>Next layer →</button>
          </div>
        </div>
        <div class="credential-readable__share">
          <div><strong>Share the fictional tour</strong><span>This shares the walkthrough URL, never Jordan Lee’s sample credential.</span></div>
          <div class="credential-readable__share-actions">
            <button type="button" data-credential-share="native">Share tour</button>
            <button type="button" data-credential-share="copy">Copy tour link</button>
            <a data-credential-social="linkedin" target="_blank" rel="noopener noreferrer" aria-label="Share the fictional tour on LinkedIn">LinkedIn</a>
            <a data-credential-social="x" target="_blank" rel="noopener noreferrer" aria-label="Share the fictional tour on X">X</a>
          </div>
          <span class="credential-readable__share-status" data-credential-share-status role="status" aria-live="polite"></span>
        </div>
      </section>
    </main>

    <footer class="credential-modal__footer">
      <div><span class="credential-readable__eyebrow">FOR YOUR INSTITUTION</span><p>Bring credential infrastructure into focus.</p></div>
      <a class="credential-modal__demo" href="https://info.certifyme.online/request-demo" target="_blank" rel="noopener noreferrer">Talk with CertifyMe <span aria-hidden="true">↗</span></a>
    </footer>
  </div>
</div>`,F="/__mockup/assets/asterford-certificate-CTJkKP8T.svg",j="data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%2031%2031'%20shape-rendering='crispEdges'%20role='img'%20aria-labelledby='title%20desc'%3e%3ctitle%20id='title'%3eSample%20credential%20QR%20code%3c/title%3e%3cdesc%20id='desc'%3eScannable%20code%20containing%20CERTIFYME%20DEMO,%20AU-DEMO-2026-0148,%20NOT%20ISSUED.%20This%20does%20not%20verify%20a%20credential.%3c/desc%3e%3cpath%20fill='%23fff'%20d='M0%200h31v31H0z'/%3e%3cpath%20stroke='%231e3260'%20d='M1%201.5h7m2%200h1m1%200h2m1%200h3m1%200h1m1%200h1m1%200h7M1%202.5h1m5%200h1m3%200h3m3%200h3m3%200h1m5%200h1M1%203.5h1m1%200h3m1%200h1m2%200h2m1%200h1m1%200h2m1%200h2m3%200h1m1%200h3m1%200h1M1%204.5h1m1%200h3m1%200h1m2%200h2m1%200h2m1%200h1m1%200h4m1%200h1m1%200h3m1%200h1M1%205.5h1m1%200h3m1%200h1m2%200h1m1%200h1m1%200h1m1%200h4m3%200h1m1%200h3m1%200h1M1%206.5h1m5%200h1m1%200h1m1%200h1m1%200h2m1%200h1m2%200h2m2%200h1m5%200h1M1%207.5h7m1%200h1m1%200h1m1%200h1m1%200h1m1%200h1m1%200h1m1%200h1m1%200h7M10%208.5h1m4%200h1m3%200h2M1%209.5h1m2%200h1m1%200h2m1%200h2m2%200h1m1%200h4m2%200h2m1%200h1M1%2010.5h4m6%200h1m2%200h2m2%200h1m2%200h1m1%200h1m3%200h2M3%2011.5h3m1%200h2m5%200h3m2%200h2m1%200h5m1%200h2M2%2012.5h1m1%200h2m4%200h2m1%200h1m1%200h1m5%200h2m4%200h2M2%2013.5h7m1%200h1m1%200h2m3%200h1m1%200h2m2%200h1m1%200h2M2%2014.5h2m1%200h1m4%200h1m4%200h1m4%200h3m1%200h1M1%2015.5h2m2%200h1m1%200h1m1%200h3m1%200h1m2%200h6m1%200h3M1%2016.5h1m1%200h1m4%200h2m1%200h4m5%200h3m3%200h2M2%2017.5h1m2%200h1m1%200h1m1%200h1m1%200h1m2%200h6m3%200h1m1%200h3m1%200h1M3%2018.5h1m1%200h2m5%200h1m2%200h2m1%200h3m3%200h1m1%200h4M1%2019.5h1m2%200h4m1%200h2m3%200h1m1%200h1m5%200h1M3%2020.5h1m4%200h1m2%200h4m7%200h1m1%200h2m1%200h2M1%2021.5h1m3%200h1m1%200h1m1%200h1m1%200h2m2%200h1m2%200h9m2%200h1M9%2022.5h1m4%200h1m1%200h1m1%200h4m3%200h5M1%2023.5h7m6%200h2m3%200h1m1%200h1m1%200h1m1%200h2m2%200h1M1%2024.5h1m5%200h1m1%200h1m2%200h3m1%200h1m2%200h1m1%200h1m3%200h1m1%200h1m1%200h1M1%2025.5h1m1%200h3m1%200h1m2%200h1m1%200h1m2%200h3m1%200h7m1%200h3M1%2026.5h1m1%200h3m1%200h1m1%200h1m2%200h1m2%200h4m1%200h1m2%200h1m3%200h3M1%2027.5h1m1%200h3m1%200h1m2%200h1m1%200h4m2%200h6m3%200h1m1%200h1M1%2028.5h1m5%200h1m2%200h1m1%200h1m1%200h2m1%200h2m1%200h2m1%200h1m1%200h1m1%200h3M1%2029.5h7m1%200h1m2%200h2m2%200h2m2%200h1m2%200h2m1%200h1'/%3e%3c/svg%3e",B="data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%20211%2032'%20role='img'%20aria-labelledby='title%20desc'%3e%3ctitle%20id='title'%3eSample%20credential%20barcode%3c/title%3e%3cdesc%20id='desc'%3eCode%20128%20barcode%20for%20the%20fictional%20credential%20ID%20AU-DEMO-2026-0148.%20This%20does%20not%20verify%20a%20credential.%3c/desc%3e%3crect%20width='211'%20height='32'%20fill='%23fff'/%3e%3cpath%20stroke='%231e3260'%20stroke-width='2'%20d='M1%2032L1%200M18%2032L18%200M23%2032L23%200M37%2032L37%200M47%2032L47%200M60%2032L60%200M73%2032L73%200M86%2032L86%200M92%2032L92%200M111%2032L111%200M130%2032L130%200M147%2032L147%200M166%2032L166%200M170%2032L170%200M173%2032L173%200M185%2032L185%200M188%2032L188%200M199%2032L199%200M210%2032L210%200'/%3e%3cpath%20stroke='%231e3260'%20stroke-width='1'%20d='M3.50%2032L3.50%200M6.50%2032L6.50%200M11.50%2032L11.50%200M13.50%2032L13.50%200M33.50%2032L33.50%200M44.50%2032L44.50%200M51.50%2032L51.50%200M55.50%2032L55.50%200M62.50%2032L62.50%200M66.50%2032L66.50%200M77.50%2032L77.50%200M88.50%2032L88.50%200M99.50%2032L99.50%200M114.50%2032L114.50%200M126.50%2032L126.50%200M132.50%2032L132.50%200M143.50%2032L143.50%200M154.50%2032L154.50%200M190.50%2032L190.50%200M207.50%2032L207.50%200'/%3e%3cpath%20stroke='%231e3260'%20stroke-width='3'%20d='M26.50%2032L26.50%200M30.50%2032L30.50%200M40.50%2032L40.50%200M69.50%2032L69.50%200M82.50%2032L82.50%200M95.50%2032L95.50%200M102.50%2032L102.50%200M118.50%2032L118.50%200M122.50%2032L122.50%200M140.50%2032L140.50%200M150.50%2032L150.50%200M157.50%2032L157.50%200M177.50%2032L177.50%200M181.50%2032L181.50%200M195.50%2032L195.50%200M204.50%2032L204.50%200'/%3e%3cpath%20stroke='%231e3260'%20stroke-width='4'%20d='M107%2032L107%200M136%2032L136%200M162%2032L162%200'/%3e%3c/svg%3e",W="/__mockup/assets/1-BEkd_1G5.png",V={analyst:["Insights Analyst","Turns data into reports that support decisions across teams.","Data analysis · Evidence-based decisions","Data visualization"],coordinator:["Program Coordinator","Coordinates timelines, stakeholders, and programme delivery.","Project management · Stakeholder coordination","Budget planning"]},p=8;function G(){const[l,L]=r.useState(!0),[n,f]=r.useState(0),[s,o]=r.useState(()=>window.matchMedia("(prefers-reduced-motion: reduce)").matches),[y,_]=r.useState(!1),[k,A]=r.useState("analyst"),d=r.useRef(null),v=r.useRef(!1),m=r.useMemo(()=>{const e=new URL("/",window.location.origin);return e.searchParams.set("story","certificate"),e.href},[]),T="Explore a fictional university credential: structured award data, access controls, verification steps, and possible learning paths.",R=r.useMemo(()=>U.replace(" hidden>",">").replaceAll("/assets4/images/asterford-certificate.svg",F).replaceAll("/assets4/images/asterford-demo-qr.svg",j).replaceAll("/assets4/images/asterford-demo-barcode.svg",B).replaceAll("/assets4/images/Logo/1.png",W),[]),I=r.useMemo(()=>C.jsx("div",{dangerouslySetInnerHTML:{__html:R}}),[R]),E=(e=!1,a=n)=>{const t=d.current?.querySelector(".credential-modal__panel"),i=d.current?.querySelector("[data-credential-tour]"),h=d.current?.querySelector(`[data-credential-stage="${a}"]`),u=e&&window.innerWidth<=650?h:i,g=d.current?.querySelector(".credential-modal__header"),M=u===h?i?.querySelector(".credential-tour__heading"):null;if(t&&u&&g){const w=u.getBoundingClientRect().top-t.getBoundingClientRect().top+t.scrollTop-g.getBoundingClientRect().height-(M?.getBoundingClientRect().height??0)-10;t.scrollTo({top:Math.max(0,w),behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches?"instant":"smooth"})}};r.useEffect(()=>{if(!l)return;const e=d.current;if(!e)return;e.querySelectorAll("[data-credential-stage]").forEach((c,b)=>{c.hidden=b!==n}),e.querySelectorAll("[data-credential-step-to]").forEach((c,b)=>{b===n?c.setAttribute("aria-current","step"):c.removeAttribute("aria-current")});const a=e.querySelector(".credential-tour__steps"),t=e.querySelector(`[data-credential-step-to="${n}"]`);a&&t&&a.scrollTo({left:a.scrollLeft+t.getBoundingClientRect().left-a.getBoundingClientRect().left-(a.clientWidth-t.clientWidth)/2,behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches?"instant":"smooth"});const i=e.querySelector("[data-credential-count]"),h=e.querySelector("[data-credential-prev]"),u=e.querySelector("[data-credential-forward]"),g=e.querySelector("[data-credential-pause]"),M=e.querySelector("[data-credential-pace]");i&&(i.textContent=`Step ${n+1} of ${p}`),h&&(h.disabled=n===0),u&&(u.textContent=n===p-1?"Start again ↺":"Next step →"),g&&(g.textContent=s?"▶ Play":"Ⅱ Pause",g.setAttribute("aria-label",s?"Play walkthrough":"Pause walkthrough")),M&&(M.textContent=s?"Paused · choose a step or press Play":"Auto-playing · select a step to pause"),e.querySelector(".credential-modal")?.classList.toggle("is-paused",s);const w=e.querySelector("[data-credential-filmline]");w&&(w.style.animationPlayState=s?"paused":"running");const q=V[k];["[data-credential-job-title]","[data-credential-job-description]","[data-credential-job-skills]","[data-credential-job-gap]"].forEach((c,b)=>{const x=e.querySelector(c);x&&(x.textContent=q[b])}),e.querySelectorAll("[data-credential-job]").forEach(c=>c.setAttribute("aria-pressed",String(c.dataset.credentialJob===k))),v.current&&(v.current=!1,window.requestAnimationFrame(()=>E(!0,n)))},[n,s,k,l]),r.useEffect(()=>{if(!l)return;const e=d.current?.querySelector("[data-credential-filmline]");e&&(e.style.animation="none",e.offsetWidth,e.style.animation=`credential-scene-timer ${n===p-1?8500:6800}ms linear forwards`,e.style.animationPlayState=s?"paused":"running")},[l,y,n]),r.useEffect(()=>{l&&d.current?.querySelectorAll("[data-credential-social]").forEach(e=>{e.href=e.dataset.credentialSocial==="linkedin"?`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(m)}`:`https://twitter.com/intent/tweet?url=${encodeURIComponent(m)}&text=${encodeURIComponent(T)}`})},[l,m]),r.useEffect(()=>{if(!l||s)return;const e=window.setTimeout(()=>{if(!y)_(!0),E(!0);else{const a=(n+1)%p;v.current=!0,f(a)}},y?n===p-1?8500:6800:window.innerWidth<=650?1500:2700);return()=>window.clearTimeout(e)},[l,s,y,n]);const S=e=>{o(!0),_(!0),e===n?window.requestAnimationFrame(()=>E(!0,e)):v.current=!0,f(e)},O=async e=>{const a=d.current?.querySelector("[data-credential-share-status]");try{if(e==="native"&&navigator.share)await navigator.share({title:"University credential walkthrough · CertifyMe example",text:T,url:m}),a&&(a.textContent="Example link shared.");else{if(navigator.clipboard?.writeText)await navigator.clipboard.writeText(m);else{const t=document.createElement("textarea");t.value=m,t.style.position="fixed",t.style.opacity="0",document.body.appendChild(t),t.select();const i=document.execCommand("copy");if(t.remove(),!i)throw new Error("Copy unavailable")}a&&(a.textContent="Link copied. It opens this fictional university walkthrough.")}}catch(t){a&&(!(t instanceof DOMException)||t.name!=="AbortError")&&(a.textContent="Sharing is unavailable here. Use Copy link instead.")}},N=e=>{const a=e.target;if(a.closest("[data-credential-close]")){L(!1);return}a.closest("[data-credential-pause]")||o(!0);const t=a.closest("[data-credential-share]");if(t){o(!0),O(t.dataset.credentialShare||"copy");return}const i=a.closest("[data-credential-step-to]");if(i){S(Number(i.dataset.credentialStepTo));return}if(a.closest("[data-credential-prev]")){S(Math.max(n-1,0));return}if(a.closest("[data-credential-forward]")){S(n===p-1?0:n+1);return}if(a.closest("[data-credential-pause]")){s&&n===p-1&&(v.current=!0,f(0)),_(!0),o(!s);return}const h=a.closest("[data-credential-job]");h&&(A(h.dataset.credentialJob),o(!0))},P=e=>{const a=e.target;if(!a.matches("[data-credential-file]")||!a.files?.[0])return;o(!0);const t=a.closest("[data-credential-drop]")?.parentElement?.querySelector("[data-credential-file-status]");t&&(t.textContent=`${a.files[0].name.slice(0,65)} selected locally · file not read or verified`)},D=e=>{const a=e.target.closest("[data-credential-drop]");if(!a)return;e.preventDefault(),a.classList.remove("is-dragging");const t=e.dataTransfer.files[0];if(!t)return;o(!0);const i=a.parentElement?.querySelector("[data-credential-file-status]");i&&(i.textContent=`${t.name.slice(0,65)} selected locally · file not read or verified`)};return C.jsxs("div",{className:"credential-preview-stage",onClick:N,onChange:P,onDrop:D,onDragOver:e=>{e.target.closest("[data-credential-drop]")&&e.preventDefault()},onKeyDown:e=>{e.key==="Escape"?L(!1):e.key==="Tab"&&o(!0)},ref:d,children:[!l&&C.jsx("button",{type:"button",onClick:()=>{L(!0),f(0),_(!1),o(window.matchMedia("(prefers-reduced-motion: reduce)").matches)},style:{margin:32,padding:16},children:"View credential walkthrough"}),l&&I]})}export{G as ReferenceLed};
