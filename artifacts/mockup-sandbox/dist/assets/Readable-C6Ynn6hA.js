import{r as Z,j as F}from"./index-D3IQDhdi.js";const ne=`<div id="credential-sample-dialog" class="credential-modal credential-university credential-readable" role="dialog" aria-modal="true"
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
              <div class="credential-readable__share-model">
                <span>Credential record</span><b aria-hidden="true">→</b><span>Portable link</span><b aria-hidden="true">→</b><span>Profile · social · wallet*</span>
              </div>
              <p>*Where the receiving service supports it. The share action here opens this fictional tour only.</p>
            </article>
            <article class="credential-ecosystem__layer credential-ecosystem__standardisation" data-reveal-index="1" hidden>
              <div class="credential-ecosystem__layer-heading"><span class="credential-ecosystem__node">02</span><div><small>STANDARDISATION</small><strong>Open Badges 3.0 · W3C Verifiable Credentials</strong></div></div>
              <div class="credential-readable__standards">
                <div><strong>Open Badges 3.0</strong><span>Achievement + evidence</span></div>
                <div><strong>W3C Verifiable Credentials</strong><span>Claims for compatible exchange and checking</span></div>
              </div>
            </article>
            <article class="credential-ecosystem__layer credential-ecosystem__verification" data-reveal-index="2" hidden>
              <div class="credential-ecosystem__layer-heading"><span class="credential-ecosystem__node">03</span><div><small>VERIFICATION</small><strong>Proof · issuer key · record standing</strong></div></div>
              <div class="credential-readable__proof-line">
                <span>Issuer key</span><b aria-hidden="true">→</b><span>Signature proof</span><b aria-hidden="true">→</b><span>Compatible verifier</span>
              </div>
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
          <div class="credential-readable__outcome-mark" aria-hidden="true">
            <span>Programs</span><i></i><span>Learning outcomes</span><i></i><span>Credential records</span><i></i><span>Skills &amp; contexts</span>
          </div>
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
</div>`;function re(a,d){const h=a.querySelector(".credential-modal__panel"),w=a.querySelector("[data-credential-tour]"),U=a.querySelector("[data-active-step]"),R=a.querySelector(".credential-ecosystem"),v=a.querySelector("[data-credential-current-visual]"),B=a.querySelector(".credential-readable__past"),b=a.querySelector("[data-credential-presentation-visual]"),A=a.querySelector("[data-credential-outcome-visual]"),c=Array.from(a.querySelectorAll("[data-credential-stage]")),V=Array.from(a.querySelectorAll("[data-reveal-index]")),k=Array.from(a.querySelectorAll("[data-credential-step-to]")),x=a.querySelector("[data-credential-outcome]"),T=a.querySelector("[data-credential-pause]"),I=a.querySelector("[data-credential-prev]"),L=a.querySelector("[data-credential-forward]"),j=a.querySelector("[data-credential-count]"),W=a.querySelector("[data-credential-pace]"),f=a.querySelector("[data-credential-filmline]"),E=a.querySelector("[data-credential-share-status]"),H=a.querySelector(".credential-modal__header"),N=a.querySelector(".credential-modal__footer"),P=a.querySelector(".credential-readable__specimen"),Y=a.querySelector(".credential-modal__close");if(!h||!w||!U||!R||!v||!B||!b||!A||!x||!T||!I||!L||!j||!W||!f||!E||!H||!N||!P||!Y||c.length!==7||k.length!==6||V.length!==5)throw new Error("Readable credential walkthrough is missing required markup.");const G=document.body.style.overflow,i=new AbortController,u=window.matchMedia("(prefers-reduced-motion: reduce)"),ee=[13e3,15e3,22e3,15e3,15e3,16e3,16e3],y=new URL("/",window.location.origin);y.searchParams.set("story","certificate");const K="Explore CertifyMe’s fictional university credential walkthrough. Sharing this link opens the tour only; it does not share a learner record.";let X=null,n=0,l=!1,C=null;function O(){C!==null&&window.clearTimeout(C),C=null}function S(){return ee[n]??15e3}function q(){const e=n===c.length-1;j.textContent=e?"Institutional outcome":`Layer ${String(n+1).padStart(2,"0")} of ${String(k.length).padStart(2,"0")}`,n===0&&document.activeElement===I&&L.focus(),I.disabled=n===0,L.textContent=e?"Restart walkthrough ↺":n===k.length-1?"Institutional outcome →":"Next layer →",T.textContent=l?"Play":"Pause",T.setAttribute("aria-label",l?"Play walkthrough":"Pause walkthrough"),W.textContent=l?"Paused · choose a layer or resume":e?"Institutional outcome · returning to the start":"Following the institutional story",a.classList.toggle("is-paused",l),f.style.animationPlayState=l?"paused":"running",k.forEach((t,o)=>{!e&&o===n?t.setAttribute("aria-current","true"):t.removeAttribute("aria-current")}),e?x.setAttribute("aria-current","true"):x.removeAttribute("aria-current")}function $(){f.style.animation="none",f.offsetWidth,u.matches||(f.style.animation=`readable-timer ${S()}ms linear forwards`,f.style.animationPlayState=l?"paused":"running")}function ae(e){const t=e.getBoundingClientRect(),o=h.getBoundingClientRect();let s=Math.max(o.top,H.getBoundingClientRect().bottom)+12;const r=Math.min(o.bottom,N.getBoundingClientRect().top)-12;window.matchMedia("(max-width: 620px)").matches&&(s=Math.max(s,P.getBoundingClientRect().bottom+12));const _=Math.max(0,r-s);let m=0;t.height>_||t.top<s?m=t.top-s:t.bottom>r&&(m=t.bottom-r),m&&h.scrollBy({top:m,behavior:u.matches?"auto":"smooth"})}function g(e,t=!1){n=(e+c.length)%c.length;const o=n===c.length-1,s=n===0;U.setAttribute("data-active-step",String(n)),c.forEach((r,_)=>{r.hidden=_!==n}),R.appendChild(b),b.hidden=!1,b.classList.toggle("is-current-reveal",s),b.classList.toggle("is-past-reveal",!s),s&&v.appendChild(b),V.forEach(r=>{const _=Number(r.getAttribute("data-reveal-index"));R.appendChild(r);const m=!o&&_===n,z=o||_<n;r.hidden=!m&&!z,r.classList.toggle("is-current-reveal",m),r.classList.toggle("is-past-reveal",z),m&&v.appendChild(r)}),R.appendChild(A),A.hidden=!o,o&&v.appendChild(A),v.hidden=!1,B.hidden=s,$(),q(),t&&window.requestAnimationFrame(()=>{const r=window.matchMedia("(max-width: 620px)").matches;ae(r?c[n]:v)})}function M(e){O(),!(l||a.hidden)&&(C=window.setTimeout(()=>{g(n===c.length-1?0:n+1,!0),M(S())},e))}function p(){l=!0,O(),q()}function J(){a.hidden&&(X=d??(document.activeElement instanceof HTMLElement?document.activeElement:null),a.hidden=!1,document.body.style.overflow="hidden",d&&(d.hidden=!0),l=u.matches,g(0),h.scrollTop=0,Y.focus(),l||(C=window.setTimeout(()=>{g(1,!0),M(S())},S())))}function Q(){O(),a.hidden=!0,document.body.style.overflow=G,d&&(d.hidden=!1),X?.focus()}d?.addEventListener("click",J,{signal:i.signal}),a.querySelectorAll("[data-credential-close]").forEach(e=>{e.addEventListener("click",Q,{signal:i.signal})}),k.forEach((e,t)=>{e.addEventListener("click",()=>{p(),g(t,!0)},{signal:i.signal})}),x.addEventListener("click",()=>{p(),g(c.length-1,!0)},{signal:i.signal}),I.addEventListener("click",()=>{n>0&&(p(),g(n-1,!0))},{signal:i.signal}),L.addEventListener("click",()=>{p(),g(n===c.length-1?0:n+1,!0)},{signal:i.signal}),T.addEventListener("click",()=>{if(!l){p();return}l=!1,q(),$(),M(S())},{signal:i.signal}),w.addEventListener("focusin",e=>{const t=e.target;t instanceof Element&&!t.closest("[data-credential-pause]")&&p()},{signal:i.signal}),P.addEventListener("focusin",p,{signal:i.signal}),N.addEventListener("focusin",p,{signal:i.signal});function D(e){e.matches&&p()}typeof u.addEventListener=="function"?u.addEventListener("change",D,{signal:i.signal}):typeof u.addListener=="function"&&u.addListener(D),a.querySelectorAll("[data-credential-social]").forEach(e=>{e.href=e.getAttribute("data-credential-social")==="linkedin"?`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(y.href)}`:`https://twitter.com/intent/tweet?url=${encodeURIComponent(y.href)}&text=${encodeURIComponent(K)}`});async function te(){try{if(navigator.clipboard?.writeText)await navigator.clipboard.writeText(y.href);else{const e=document.createElement("textarea");e.value=y.href,e.style.position="fixed",e.style.opacity="0",document.body.appendChild(e),e.select();const t=document.execCommand("copy");if(e.remove(),!t)throw new Error("Copy unavailable")}E.textContent="Tour link copied. It opens this fictional walkthrough only."}catch{E.textContent="Could not copy the tour link in this browser."}}return a.querySelectorAll("[data-credential-share]").forEach(e=>{e.addEventListener("click",async()=>{if(p(),e.getAttribute("data-credential-share")==="copy"||!navigator.share){await te();return}try{await navigator.share({title:"Fictional university credential walkthrough · CertifyMe",text:K,url:y.href}),E.textContent="Fictional walkthrough link shared."}catch(t){t instanceof Error&&t.name!=="AbortError"&&(E.textContent="Sharing is unavailable here. Use Copy tour link instead.")}},{signal:i.signal})}),a.addEventListener("keydown",e=>{if(e.key==="Escape"){e.preventDefault(),Q();return}if(e.key!=="Tab")return;const t=Array.from(a.querySelectorAll('button:not([disabled]), a[href], summary, input, [tabindex="0"]')).filter(r=>!r.closest("[hidden]")&&r.getClientRects().length>0);if(!t.length){e.preventDefault(),h.focus();return}const o=t[0],s=t[t.length-1];e.shiftKey&&document.activeElement===o?(e.preventDefault(),s.focus()):!e.shiftKey&&document.activeElement===s&&(e.preventDefault(),o.focus())},{signal:i.signal}),J(),()=>{O(),i.abort(),typeof u.removeListener=="function"&&u.removeListener(D),document.body.style.overflow=G,d&&(d.hidden=!1)}}const ie=ne.replaceAll("/assets4/images/Logo/1.png","/__mockup/images/walkthrough-ux/certifyme-logo.png").replaceAll("/assets4/images/","/__mockup/images/walkthrough-ux/");function le(){const a=Z.useRef(null);return Z.useEffect(()=>{const d=a.current,h=d?.querySelector("#credential-sample-dialog"),w=d?.querySelector("[data-credential-open]");if(!(!h||!w))return re(h,w)},[]),F.jsxs("div",{className:"credential-preview-stage credential-readable-stage",ref:a,children:[F.jsx("button",{type:"button",className:"credential-readable__reopen","data-credential-open":!0,hidden:!0,children:"Reopen walkthrough"}),F.jsx("div",{dangerouslySetInnerHTML:{__html:ie}})]})}export{le as Readable};
