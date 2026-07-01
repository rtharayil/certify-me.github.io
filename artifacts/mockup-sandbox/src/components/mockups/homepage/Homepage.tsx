import './_group.css';
import { useState } from 'react';
import {
  BarChart3, Zap, Plug, Palette, Share2,
  CheckCircle, Star, ArrowRight, ChevronRight, ChevronDown,
} from 'lucide-react';

const INDIGO = '#282B75';
const INDIGO_MID = '#3D4299';
const PURPLE = '#6a5acd';
const LAVENDER_BG = '#ECEEFF';
const LAVENDER_LIGHT = '#F3F4FF';

const features = [
  {
    icon: <BarChart3 size={20} />, title: 'Credential Analytics & Engagement Insights',
    desc: 'Measure the impact of your credential programs with real-time analytics on social sharing, profile visibility, and verification activity. Understand who is engaging with your credentials and how.',
  },
  {
    icon: <Zap size={20} />, title: 'Automated Credential Operations',
    desc: 'Automate credential issuance with bulk CSV uploads and API triggers — reducing manual work by 90%, minimizing errors, and streamlining large-scale certificate distribution.',
  },
  {
    icon: <Plug size={20} />, title: 'API & Enterprise Integrations',
    desc: 'Connect CertifyMe with your LMS, CRM, HRMS, and internal systems via REST API to streamline credential workflows and automate issuance at scale.',
  },
  {
    icon: <Palette size={20} />, title: 'Fully Branded Credential Experiences',
    desc: 'Customize the entire credential journey — issuance, verification, learner wallets, and showcase directories — to reflect your brand identity with white-label precision.',
  },
  {
    icon: <Share2 size={20} />, title: 'Social & Professional Credential Sharing',
    desc: 'Transform every credential into a branded referral channel. Frictionless one-click sharing to LinkedIn, Twitter, and email turns recipients into advocates.',
  },
];

const testimonials = [
  {
    quote: 'CertifyMe has the best customer service. They have been partners beside us as long as we have used their product. Our members that have received digital certificates love having something they can keep online and share with their peers.',
    name: 'Danielle Lee', role: 'Board Director', company: 'PMI Phoenix', img: '/__mockup/images/t1.jpg',
  },
  {
    quote: 'CertifyMe has been very easy to implement and use. Our organization used CertifyMe to create over 7000 certificates this past year. We were able to integrate CertifyMe with our CRM, thus requiring minimal time in labor.',
    name: 'Erika Barney', role: 'Human Resources Director', company: 'Au Pair Weekend', img: '/__mockup/images/t2.jpg',
  },
  {
    quote: 'The platform is user-friendly and does not need technical knowledge to issue digital credentials. On top of that, I commend their staff, who constantly check on us and respond to our suggestions and comments.',
    name: 'Chresente Gong', role: 'Founder', company: 'EIS Education International', img: '/__mockup/images/t3.jpg',
  },
  {
    quote: 'The user interface of the platform is remarkably intuitive. I really want to acknowledge the exceptional support that CertifyMe has been providing, which counts a lot towards our satisfaction.',
    name: 'Anson Antony', role: 'Project Manager', company: 'University of Europe', img: '/__mockup/images/t4.jpg',
  },
  {
    quote: 'Impressive range of features sets it apart as the ultimate solution for certificate verification. Their enterprise plan, along with customizable options, caters to diverse company needs.',
    name: 'Joshua J.', role: 'Chief Learning Officer', company: 'System Support Inc.', img: '/__mockup/images/t5.webp',
  },
  {
    quote: 'As a training provider, we appreciate the user-friendly interface and customizable digital badging options, which our students enthusiastically showcase on their social media profiles.',
    name: 'Kasie V.', role: 'CEO', company: 'Sigma Forces', img: '/__mockup/images/t6.webp',
  },
];

const stats = [
  { value: '4,864+', label: 'Institutions trust CertifyMe' },
  { value: '1M+', label: 'Users across 144 Countries' },
  { value: '87K+', label: 'Digital credentials issued every month' },
];

const logos = [
  { src: '/__mockup/images/logo-ue.webp', alt: 'University of Europe' },
  { src: '/__mockup/images/logo-ieee.webp', alt: 'IEEE' },
  { src: '/__mockup/images/logo-harvard.webp', alt: 'Harvard' },
  { src: '/__mockup/images/logo-pmi.webp', alt: 'PMI' },
  { src: '/__mockup/images/logo-leb.webp', alt: 'LEB' },
  { src: '/__mockup/images/logo-dcu.webp', alt: 'DCU' },
];

const ratings = [
  { src: '/__mockup/images/capterra.webp', alt: 'Capterra', stars: 5, score: '5/5' },
  { src: '/__mockup/images/trustradius.webp', alt: 'TrustRadius', stars: 4.5, score: '9/10' },
  { src: '/__mockup/images/g2-rating.webp', alt: 'G2', stars: 5, score: '4.9/5' },
];

function Stars({ count }: { count: number }) {
  return (
    <div style={{ display: 'flex', gap: 2, alignItems: 'center', justifyContent: 'center' }}>
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} size={13}
          fill={i <= Math.floor(count) ? '#F59E0B' : 'none'}
          color={i <= Math.floor(count) ? '#F59E0B' : '#D1D5DB'}
        />
      ))}
      <span style={{ fontSize: 12, color: '#6B7280', marginLeft: 6, fontWeight: 600 }}>{ratings.find(r => r.stars === count)?.score ?? `${count}/5`}</span>
    </div>
  );
}

const navMenus = {
  Products: {
    cols: [
      [
        { label: 'Digital Certificates & Badges', href: '/digital-certificate' },
        { label: 'E-Portfolio and Skill Development Platform', href: '/e-portfolio-skill-development-platform' },
      ],
      [
        { label: 'EduTranscript', href: 'https://www.edutranscript.com' },
      ],
    ],
  },
  'Industry Use Case': {
    cols: [
      [
        { label: 'E-Learning', href: '/credentials-for-elearning-platforms' },
        { label: 'Associations', href: '/digital-badges-for-associations' },
        { label: 'Colleges & Universities', href: '/credentials-higher-education' },
      ],
      [
        { label: 'L&D Departments', href: '/digital-badges-for-hr' },
        { label: 'Use Case FAQs', href: '/ICP-FAQs' },
      ],
    ],
  },
  Features: {
    cols: [
      [
        { label: 'Integrations', href: '/allIntegrations' },
        { label: 'API', href: '/api/' },
        { label: 'Security & Compliance', href: '/security/' },
        { label: 'White-labeling', href: '/whitelabel-credentials' },
        { label: 'Analytics', href: '/credential-analytics' },
        { label: 'Custom Wallet', href: '/custom-badge-wallet' },
      ],
      [
        { label: 'Job Portal Integration', href: '/Job-Portal-Integration' },
        { label: 'Cryptographic Signature', href: '/verifiable-signature' },
        { label: 'Verification Page', href: '#' },
        { label: 'Learning Path Sample', href: '#' },
      ],
    ],
  },
  Resources: {
    cols: [
      [
        { label: 'Credential Samples', href: '/sample-credential' },
        { label: 'Videos', href: 'https://www.youtube.com/channel/UCkbhyRP0L34oPaUOXBkI61w' },
        { label: 'Blogs', href: '/blog' },
        { label: 'Certificate Templates', href: '/certificate-templates' },
        { label: 'Case Studies', href: '/case-studies' },
        { label: 'Glossary', href: '/glossary' },
      ],
      [
        { label: "FAQ's — Digital Credential", href: '/gen-FAQ' },
        { label: "FAQ's — EduTranscript", href: '#' },
        { label: 'About Us', href: '/AboutUs' },
        { label: 'Admin Roles', href: '/Admin-Roles' },
        { label: 'Cryptographic Signature Download', href: '/signature-download' },
      ],
    ],
  },
};

const loginLinks = [
  { label: 'Wallet Login', href: 'https://wallet.certifyme.org/auth/login?next=%2F' },
  { label: 'Institutional Login', href: 'https://apac.platform.certifyme.dev' },
];

const dropdownBase = {
  position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)',
  background: '#fff', borderRadius: 12, padding: '20px 24px',
  boxShadow: '0 12px 40px rgba(40,43,117,0.14)',
  border: '1px solid rgba(40,43,117,0.08)',
  minWidth: 340, zIndex: 200,
};

function MegaMenu({ menu }: { menu: { cols: { label: string; href: string }[][] } }) {
  return (
    <div style={{ ...dropdownBase, minWidth: 480 }}>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${menu.cols.length}, 1fr)`, gap: 8 }}>
        {menu.cols.map((col, ci) => (
          <div key={ci}>
            {col.map(item => (
              <a key={item.label} href={item.href} style={{
                display: 'block', padding: '7px 10px', fontSize: 13.5, color: '#333',
                textDecoration: 'none', borderRadius: 6, transition: 'all 0.15s',
              }}
                onMouseEnter={e => { e.currentTarget.style.background = LAVENDER_BG; e.currentTarget.style.color = INDIGO; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#333'; }}
              >{item.label}</a>
            ))}
            {ci === menu.cols.length - 1 && (
              <a href="https://info.certifyme.online/talk-with-expert" style={{
                display: 'block', marginTop: 12, padding: '9px 16px', fontSize: 12.5,
                fontWeight: 700, color: '#fff', textAlign: 'center',
                background: `linear-gradient(135deg, ${INDIGO}, ${PURPLE})`,
                borderRadius: 8, textDecoration: 'none', letterSpacing: 0.3,
              }}>TALK TO OUR EXPERT</a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function Homepage() {
  const [activeFeature, setActiveFeature] = useState(0);
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif", backgroundColor: '#fff', color: '#1a1a2e', lineHeight: 1.6 }}>

      {/* ── NAVBAR ─────────────────────────────────── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 200,
        backgroundColor: 'rgba(255,255,255,0.97)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #E8E8F0',
        padding: '0 40px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: 68,
      }}>
        {/* Logo */}
        <a href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', flexShrink: 0 }}>
          <img src="/__mockup/images/logo.png" alt="CertifyMe" style={{ height: 38, objectFit: 'contain' }} />
        </a>

        {/* Main links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {(Object.keys(navMenus) as (keyof typeof navMenus)[]).map(key => (
            <div key={key} style={{ position: 'relative' }}
              onMouseEnter={() => setOpenMenu(key)}
              onMouseLeave={() => setOpenMenu(null)}>
              <button style={{
                display: 'flex', alignItems: 'center', gap: 4,
                padding: '8px 12px', background: 'none', border: 'none', cursor: 'pointer',
                fontSize: 13.5, fontWeight: 600,
                color: openMenu === key ? INDIGO : '#444',
                borderRadius: 6, transition: 'color 0.15s',
              }}>
                {key} <ChevronDown size={13} style={{ marginTop: 1, opacity: 0.7 }} />
              </button>
              {openMenu === key && <MegaMenu menu={navMenus[key]} />}
            </div>
          ))}

          {/* Pricing — plain link */}
          <a href="/pricing" style={{
            padding: '8px 12px', fontSize: 13.5, fontWeight: 600,
            color: '#444', textDecoration: 'none', borderRadius: 6,
          }}>Pricing</a>

          {/* Login dropdown */}
          <div style={{ position: 'relative' }}
            onMouseEnter={() => setOpenMenu('login')}
            onMouseLeave={() => setOpenMenu(null)}>
            <button style={{
              display: 'flex', alignItems: 'center', gap: 4,
              padding: '8px 12px', background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 13.5, fontWeight: 600,
              color: openMenu === 'login' ? INDIGO : '#444',
              borderRadius: 6,
            }}>
              Login <ChevronDown size={13} style={{ marginTop: 1, opacity: 0.7 }} />
            </button>
            {openMenu === 'login' && (
              <div style={{ ...dropdownBase, minWidth: 200, left: 'auto', right: 0, transform: 'none' }}>
                {loginLinks.map(l => (
                  <a key={l.label} href={l.href} style={{
                    display: 'block', padding: '8px 10px', fontSize: 13.5, color: '#333',
                    textDecoration: 'none', borderRadius: 6, transition: 'all 0.15s',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.background = LAVENDER_BG; e.currentTarget.style.color = INDIGO; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#333'; }}
                  >{l.label}</a>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* CTA */}
        <a href="https://info.certifyme.online/request-demo" style={{
          background: `linear-gradient(135deg, ${INDIGO} 0%, ${INDIGO_MID} 100%)`,
          color: '#fff', padding: '11px 24px', borderRadius: 8,
          fontWeight: 700, fontSize: 14, textDecoration: 'none',
          boxShadow: `0 4px 16px rgba(40,43,117,0.32)`,
          whiteSpace: 'nowrap', flexShrink: 0,
          transition: 'box-shadow 0.2s',
        }}
          onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 6px 24px rgba(40,43,117,0.45)'; }}
          onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(40,43,117,0.32)'; }}
        >Book Demo</a>
      </nav>

      {/* ── HERO ───────────────────────────────────── */}
      <section style={{
        background: `linear-gradient(150deg, ${LAVENDER_BG} 0%, #F0F1FF 50%, #EAF0FF 100%)`,
        padding: '80px 48px 60px',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Decorative blob */}
        <div style={{
          position: 'absolute', top: -120, right: -120,
          width: 500, height: 500,
          background: `radial-gradient(circle, rgba(106,90,205,0.12) 0%, transparent 70%)`,
          borderRadius: '50%', pointerEvents: 'none',
        }} />

        <div style={{ maxWidth: 1184, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'center' }}>
          {/* Left: copy */}
          <div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'rgba(40,43,117,0.08)', border: '1px solid rgba(40,43,117,0.18)',
              borderRadius: 50, padding: '6px 16px', marginBottom: 24,
            }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: PURPLE }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: INDIGO }}>Ranked #2 in Digital Credential Software — G2</span>
            </div>

            <h1 style={{
              fontSize: 50, fontWeight: 800, lineHeight: 1.12,
              color: INDIGO, margin: '0 0 22px',
              letterSpacing: '-1.5px',
            }}>
              Verifiable Credential<br />Infrastructure for<br />
              <span style={{ color: PURPLE }}>Education &amp; Workforce Learning</span>
            </h1>

            <p style={{ fontSize: 17, color: '#4A4A6A', margin: '0 0 32px', maxWidth: 500, lineHeight: 1.75 }}>
              Issue <strong>Open Badges 3.0</strong> compliant credentials, learner portfolios, and verified skill records that enhance credibility, showcase achievements, and improve employability.
            </p>

            <div style={{ display: 'flex', gap: 14, marginBottom: 32, flexWrap: 'wrap' }}>
              <a href="#" style={{
                background: `linear-gradient(135deg, ${INDIGO} 0%, ${INDIGO_MID} 100%)`,
                color: '#fff', padding: '14px 30px', borderRadius: 10,
                fontWeight: 700, fontSize: 15, textDecoration: 'none',
                boxShadow: `0 6px 20px rgba(40,43,117,0.35)`,
                display: 'flex', alignItems: 'center', gap: 8,
              }}>Request a Demo</a>
              <a href="#" style={{
                background: '#fff', color: INDIGO,
                border: `2px solid ${INDIGO}`, padding: '14px 30px', borderRadius: 10,
                fontWeight: 700, fontSize: 15, textDecoration: 'none',
                display: 'flex', alignItems: 'center', gap: 8,
              }}>Start Free Trial <ArrowRight size={16} /></a>
            </div>

            {/* Trust tags */}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {['Ranked #2 on G2', 'Fraud-Proof Verification', 'W3C Verifiable Credentials'].map(tag => (
                <span key={tag} style={{
                  fontSize: 12.5, fontWeight: 600, color: INDIGO,
                  background: 'rgba(40,43,117,0.07)',
                  border: '1px solid rgba(40,43,117,0.15)',
                  borderRadius: 50, padding: '6px 14px',
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                }}>
                  <CheckCircle size={12} color={PURPLE} /> {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Right: real hero image from the live site */}
          <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <img
              src="/__mockup/images/hero-person.png"
              alt="Digital Credential Management Software"
              style={{ width: '100%', maxWidth: 560, objectFit: 'contain', filter: 'drop-shadow(0 20px 60px rgba(40,43,117,0.15))' }}
            />
          </div>
        </div>

        {/* Logo trust strip */}
        <div style={{ maxWidth: 1184, margin: '48px auto 0', paddingTop: 32, borderTop: '1px solid rgba(40,43,117,0.1)' }}>
          <p style={{ textAlign: 'center', fontSize: 12, fontWeight: 700, color: '#999', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 20 }}>Trusted by world-class institutions</p>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 48, flexWrap: 'wrap' }}>
            {logos.map(l => (
              <img key={l.alt} src={l.src} alt={l.alt}
                style={{ height: 34, objectFit: 'contain', filter: 'grayscale(70%) opacity(0.65)', transition: 'all 0.25s' }}
                onMouseEnter={e => { e.currentTarget.style.filter = 'grayscale(0%) opacity(1)'; }}
                onMouseLeave={e => { e.currentTarget.style.filter = 'grayscale(70%) opacity(0.65)'; }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS BAR ──────────────────────────────── */}
      <section style={{
        background: `linear-gradient(135deg, ${INDIGO} 0%, #1e2060 50%, #2d1b69 100%)`,
        padding: '52px 48px',
      }}>
        <div style={{ maxWidth: 1184, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0 }}>
          {stats.map((s, i) => (
            <div key={i} style={{
              textAlign: 'center', padding: '0 32px',
              borderRight: i < 2 ? '1px solid rgba(255,255,255,0.15)' : 'none',
            }}>
              <div style={{ fontSize: 54, fontWeight: 800, color: '#fff', letterSpacing: '-2px', lineHeight: 1 }}>{s.value}</div>
              <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.7)', marginTop: 10, fontWeight: 500, lineHeight: 1.5 }}>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── PLATFORM FEATURES ──────────────────────── */}
      <section style={{ padding: '100px 48px', background: '#fff' }}>
        <div style={{ maxWidth: 1184, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: PURPLE, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>Platform</p>
            <h2 style={{ fontSize: 42, fontWeight: 800, color: INDIGO, letterSpacing: '-1px', margin: 0 }}>
              Enterprise-Grade Certificate &amp; Badge Management Platform
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 60, alignItems: 'start' }}>
            {/* Feature list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {features.map((f, i) => (
                <button key={i} onClick={() => setActiveFeature(i)}
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: 16,
                    padding: '18px 20px', borderRadius: 12,
                    background: activeFeature === i ? LAVENDER_BG : 'transparent',
                    border: activeFeature === i ? `1.5px solid rgba(40,43,117,0.15)` : '1.5px solid transparent',
                    cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s',
                    width: '100%',
                  }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                    background: activeFeature === i ? `linear-gradient(135deg, ${INDIGO}, ${PURPLE})` : '#F3F4FF',
                    color: activeFeature === i ? '#fff' : INDIGO,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.2s',
                  }}>
                    {f.icon}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14.5, color: activeFeature === i ? INDIGO : '#444', marginBottom: activeFeature === i ? 4 : 0 }}>
                      {f.title}
                    </div>
                    {activeFeature === i && (
                      <p style={{ fontSize: 13.5, color: '#666', margin: 0, lineHeight: 1.65 }}>{f.desc}</p>
                    )}
                  </div>
                </button>
              ))}
            </div>

            {/* Feature visual panel */}
            <div style={{
              background: LAVENDER_BG, borderRadius: 20,
              padding: 40, minHeight: 400,
              border: '1px solid rgba(40,43,117,0.08)',
              position: 'sticky', top: 88,
              display: 'flex', flexDirection: 'column', justifyContent: 'center',
            }}>
              <div style={{
                width: 56, height: 56, borderRadius: 14,
                background: `linear-gradient(135deg, ${INDIGO}, ${PURPLE})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', marginBottom: 24,
              }}>
                {features[activeFeature].icon}
              </div>
              <h3 style={{ fontSize: 24, fontWeight: 800, color: INDIGO, margin: '0 0 16px', lineHeight: 1.3 }}>
                {features[activeFeature].title}
              </h3>
              <p style={{ fontSize: 15.5, color: '#555', margin: 0, lineHeight: 1.8 }}>
                {features[activeFeature].desc}
              </p>
              <a href="#" style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                marginTop: 28, color: PURPLE, fontWeight: 700, fontSize: 14,
                textDecoration: 'none',
              }}>
                Learn more <ChevronRight size={16} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── G2 SOCIAL PROOF ────────────────────────── */}
      <section style={{ padding: '80px 48px', background: LAVENDER_LIGHT }}>
        <div style={{ maxWidth: 1184, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>
          {/* Left: text + ratings */}
          <div>
            <p style={{ fontSize: 13, fontWeight: 700, color: PURPLE, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>Recognition</p>
            <h2 style={{ fontSize: 36, fontWeight: 800, color: INDIGO, margin: '0 0 18px', lineHeight: 1.25 }}>
              Ranked as the Second-Leading Digital Credential Management Software
            </h2>
            <p style={{ fontSize: 16, color: '#555', margin: '0 0 36px', lineHeight: 1.75 }}>
              Academic institutions have rated us <strong>4.9/5</strong> with the highest user satisfaction score in the G2 Digital Credential Management category.
            </p>

            {/* Rating cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 36 }}>
              {ratings.map(r => (
                <div key={r.alt} style={{
                  background: '#fff', borderRadius: 14, padding: '20px 12px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                  border: '1px solid rgba(40,43,117,0.07)',
                  textAlign: 'center',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
                }}>
                  <img src={r.src} alt={r.alt} style={{ height: 32, objectFit: 'contain' }} />
                  <Stars count={r.stars} />
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
              <a href="#" style={{
                background: `linear-gradient(135deg, ${INDIGO}, ${INDIGO_MID})`,
                color: '#fff', padding: '13px 28px', borderRadius: 10,
                fontWeight: 700, fontSize: 14, textDecoration: 'none',
                boxShadow: `0 4px 14px rgba(40,43,117,0.3)`,
              }}>Talk with Experts</a>
              <a href="#" style={{ fontSize: 14, fontWeight: 600, color: PURPLE, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
                View G2 Report <ChevronRight size={15} />
              </a>
            </div>
            <p style={{ fontSize: 12.5, color: '#888', marginTop: 12 }}>Free 5 Credentials &nbsp;·&nbsp; Exclusive Support</p>
          </div>

          {/* Right: G2 grid image */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <img src="/__mockup/images/g2-leader-grid.png" alt="G2 Leader Digital Credential Management"
              style={{ width: '100%', maxWidth: 460, borderRadius: 16, boxShadow: '0 20px 60px rgba(40,43,117,0.12)' }}
              onError={e => { e.currentTarget.style.background = LAVENDER_BG; e.currentTarget.style.minHeight = '280px'; e.currentTarget.style.borderRadius = '16px'; e.currentTarget.src = ''; }}
            />
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ───────────────────────────── */}
      <section style={{ padding: '100px 48px', background: '#fff' }}>
        <div style={{ maxWidth: 1184, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: PURPLE, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>Reviews</p>
            <h2 style={{ fontSize: 42, fontWeight: 800, color: INDIGO, letterSpacing: '-1px', margin: 0 }}>Our Happy Customers</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            {testimonials.map((t, i) => (
              <div key={i} style={{
                background: '#fff', borderRadius: 16, padding: 28,
                boxShadow: '0 4px 24px rgba(40,43,117,0.08)',
                border: '1px solid rgba(40,43,117,0.07)',
                display: 'flex', flexDirection: 'column',
              }}>
                <div style={{ display: 'flex', gap: 2, marginBottom: 16 }}>
                  {[1, 2, 3, 4, 5].map(s => <Star key={s} size={14} fill="#F59E0B" color="#F59E0B" />)}
                </div>
                <p style={{ fontSize: 14, color: '#444', lineHeight: 1.75, flex: 1, margin: '0 0 20px', fontStyle: 'italic' }}>
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <img src={t.img} alt={t.name}
                    style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', border: `2px solid ${LAVENDER_BG}` }}
                    onError={e => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: INDIGO }}>{t.name}</div>
                    <div style={{ fontSize: 12.5, color: '#888' }}>{t.role} · {t.company}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── INDUSTRY USE CASES ─────────────────────── */}
      <section style={{ padding: '80px 48px', background: LAVENDER_LIGHT }}>
        <div style={{ maxWidth: 1184, margin: '0 auto', textAlign: 'center' }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: PURPLE, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>Industries</p>
          <h2 style={{ fontSize: 38, fontWeight: 800, color: INDIGO, letterSpacing: '-1px', margin: '0 0 48px' }}>
            Built for Every Credentialing Use Case
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
            {[
              { title: 'Higher Education', desc: 'Transcripts, degree certificates, and report cards that drive student engagement', emoji: '🎓' },
              { title: 'E-Learning', desc: 'Fully branded credentialing for online platforms to boost course completion rates', emoji: '💻' },
              { title: 'Learning & Development', desc: 'Skill badges and course completion certifications for corporate training programs', emoji: '📈' },
              { title: 'Associations', desc: 'Membership badges and certifications to drive revenue growth and attract members organically', emoji: '🏛️' },
            ].map((item, i) => (
              <div key={i} style={{
                background: '#fff', borderRadius: 16, padding: '28px 22px',
                boxShadow: '0 4px 16px rgba(40,43,117,0.06)',
                border: '1px solid rgba(40,43,117,0.06)',
                textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s',
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(40,43,117,0.14)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(40,43,117,0.06)'; }}
              >
                <div style={{ fontSize: 32, marginBottom: 14 }}>{item.emoji}</div>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: INDIGO, margin: '0 0 10px' }}>{item.title}</h3>
                <p style={{ fontSize: 13.5, color: '#666', margin: 0, lineHeight: 1.65 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── RESOURCE BANNER ────────────────────────── */}
      <section style={{ padding: '80px 48px', background: '#fff' }}>
        <div style={{ maxWidth: 1184, margin: '0 auto' }}>
          <div style={{
            background: `linear-gradient(135deg, ${INDIGO} 0%, #1e2060 60%, #2d1b69 100%)`,
            borderRadius: 24, padding: '56px 64px',
            display: 'grid', gridTemplateColumns: '1fr auto', gap: 48, alignItems: 'center',
          }}>
            <div>
              <span style={{
                fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.6)', background: 'rgba(255,255,255,0.1)',
                padding: '4px 12px', borderRadius: 50, marginBottom: 20, display: 'inline-block',
              }}>2026 Edition</span>
              <h2 style={{ fontSize: 34, fontWeight: 800, color: '#fff', margin: '12px 0 16px', lineHeight: 1.2 }}>
                Zero to One:<br />Build A Credentialing Program From Scratch
              </h2>
              <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.7)', margin: '0 0 28px', lineHeight: 1.7, maxWidth: 520 }}>
                This extensive workbook + ebook combo contains everything you need to build a credentialing program from scratch.
              </p>
              <a href="#" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: '#fff', color: INDIGO,
                padding: '13px 28px', borderRadius: 10, fontWeight: 700, fontSize: 14, textDecoration: 'none',
              }}>Download Now <ArrowRight size={15} /></a>
            </div>
            <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: 80, lineHeight: 1 }}>📘</div>
          </div>
        </div>
      </section>

      {/* ── BLOG CTA ───────────────────────────────── */}
      <section style={{ padding: '0 48px 100px', background: '#fff', textAlign: 'center' }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <h2 style={{ fontSize: 38, fontWeight: 800, color: INDIGO, letterSpacing: '-1px', margin: '0 0 12px' }}>
            Explore Our Resources!
          </h2>
          <p style={{ fontSize: 16, color: '#666', margin: '0 0 32px', lineHeight: 1.7 }}>
            Access our Extensive Resource Library and Elevate Your Digital Credential Journey.
          </p>
          <a href="#" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            border: `2px solid ${INDIGO}`, color: INDIGO,
            padding: '13px 28px', borderRadius: 10, fontWeight: 700, fontSize: 14, textDecoration: 'none',
          }}>Browse Resources <ArrowRight size={15} /></a>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────── */}
      <footer style={{ background: INDIGO, padding: '64px 48px 32px', color: 'rgba(255,255,255,0.7)' }}>
        <div style={{ maxWidth: 1184, margin: '0 auto' }}>
          <div style={{
            display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', gap: 48,
            marginBottom: 48, paddingBottom: 40, borderBottom: '1px solid rgba(255,255,255,0.12)',
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <div style={{ width: 28, height: 28, background: 'rgba(255,255,255,0.15)', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CheckCircle size={16} color="#fff" />
                </div>
                <span style={{ fontWeight: 800, fontSize: 18, color: '#fff' }}>CertifyMe</span>
              </div>
              <p style={{ fontSize: 14, lineHeight: 1.7, maxWidth: 240, margin: 0 }}>
                Global SaaS Certificate &amp; Badge Management Platform trusted by 4,800+ institutions worldwide.
              </p>
            </div>
            {[
              { title: 'Quick Links', links: ['About Us', 'Pricing', 'Samples', 'Blogs', 'Resources', 'Refund Policy'] },
              { title: 'Industry Use Case', links: ['Higher Education', 'L & D', 'E-Learning', 'Associations', 'School Certs', 'Smart Certs'] },
              { title: 'Compare Now', links: ['vs Credly', 'vs Accredible', 'vs Sertifier', 'vs Certifier'] },
              { title: 'Connect With Us', links: ['LinkedIn', 'Twitter / X', 'YouTube', 'Contact Us'] },
            ].map(col => (
              <div key={col.title}>
                <h4 style={{ color: '#fff', fontWeight: 700, fontSize: 14, marginBottom: 16, marginTop: 0 }}>{col.title}</h4>
                {col.links.map(l => (
                  <a key={l} href="#" style={{ display: 'block', fontSize: 13.5, color: 'rgba(255,255,255,0.6)', textDecoration: 'none', marginBottom: 10 }}>
                    {l}
                  </a>
                ))}
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
            <span>© 2026 CertifyMe. All rights reserved.</span>
            <div style={{ display: 'flex', gap: 24 }}>
              {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map(l => (
                <a key={l} href="#" style={{ color: 'rgba(255,255,255,0.45)', textDecoration: 'none' }}>{l}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
