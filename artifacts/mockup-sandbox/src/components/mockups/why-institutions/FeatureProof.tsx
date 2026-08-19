// Option C — Feature List + Proof Panel
// Two-column: left = 4 feature rows, right = dark proof panel with stats

const features = [
  {
    color: "#4f46e5",
    bg: "#eef0ff",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
      </svg>
    ),
    title: "Interoperable",
    body: "Open Badges 3.0, W3C Verifiable Credentials and CLR — accepted by every major employer platform and wallet."
  },
  {
    color: "#0891b2",
    bg: "#e0f7fa",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0891b2" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
      </svg>
    ),
    title: "Enterprise Ready",
    body: "APIs, LMS integrations, white-label branding, SSO and SOC 2 Type II — ready for your IT and legal teams."
  },
  {
    color: "#7c3aed",
    bg: "#f3e8ff",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 20V10M12 20V4M6 20v-6"/>
      </svg>
    ),
    title: "Measurable",
    body: "Real-time analytics on issuance, engagement and sharing across every credential type from one dashboard."
  },
  {
    color: "#059669",
    bg: "#d1fae5",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
      </svg>
    ),
    title: "Outcome Focused",
    body: "Learning pathways, verified skills and labour-market intelligence extend credential value beyond graduation."
  }
];

const stats = [
  { value: "5K+", label: "Institutions" },
  { value: "1M+", label: "Wallets issued" },
  { value: "144", label: "Countries" },
  { value: "500K+", label: "Issued per year" }
];

export function FeatureProof() {
  return (
    <div style={{ background: "#f4f3ff", minHeight: "100vh", fontFamily: "'Inter', sans-serif", padding: "60px 0" }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

      <div style={{ maxWidth: 980, margin: "0 auto", padding: "0 40px" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 52 }}>
          <h2 style={{ fontSize: 34, fontWeight: 800, color: "#20203c", margin: "0 0 14px", letterSpacing: "-0.5px" }}>
            Why Institutions Choose CertifyMe
          </h2>
          <p style={{ fontSize: 17, color: "#6b7280", maxWidth: 520, margin: "0 auto", lineHeight: 1.6 }}>
            A complete credential infrastructure — built around open standards, enterprise requirements and measurable outcomes.
          </p>
        </div>

        {/* Two-column layout */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 24, alignItems: "start" }}>

          {/* Left — Feature list */}
          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {features.map((f, i) => (
              <div key={i} style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 18,
                background: "white",
                borderRadius: 12,
                padding: "22px 24px",
                boxShadow: "0 1px 4px rgba(40,43,117,.06)",
                marginBottom: 10
              }}>
                <div style={{
                  width: 42,
                  height: 42,
                  background: f.bg,
                  borderRadius: 10,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0
                }}>
                  {f.icon}
                </div>
                <div>
                  <h4 style={{ margin: "0 0 5px", fontSize: 16, fontWeight: 700, color: "#20203c" }}>{f.title}</h4>
                  <p style={{ margin: 0, fontSize: 14, color: "#6b7280", lineHeight: 1.6 }}>{f.body}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Right — Proof panel */}
          <div style={{
            background: "#282B75",
            borderRadius: 18,
            padding: "32px 28px",
            position: "sticky",
            top: 0
          }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.45)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 24 }}>
              Trusted by institutions worldwide
            </div>

            {/* Stats grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 32 }}>
              {stats.map((s, i) => (
                <div key={i} style={{
                  background: "rgba(255,255,255,0.07)",
                  borderRadius: 12,
                  padding: "18px 16px",
                  textAlign: "center",
                  border: "1px solid rgba(255,255,255,0.08)"
                }}>
                  <div style={{ fontSize: 26, fontWeight: 800, color: "#818cf8", lineHeight: 1 }}>{s.value}</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 5, fontWeight: 500 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Compliance badges */}
            <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 22, marginBottom: 28 }}>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 12, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>Certified & Compliant</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {["Open Badges 3.0 Certified", "W3C Verifiable Credentials", "SOC 2 Type II", "FERPA Compliant"].map((b, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    <span style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", fontWeight: 500 }}>{b}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <a href="#" style={{
              display: "block",
              textAlign: "center",
              background: "#4f46e5",
              color: "white",
              padding: "13px 24px",
              borderRadius: 10,
              fontWeight: 700,
              fontSize: 14.5,
              textDecoration: "none",
              letterSpacing: "0.01em"
            }}>Request a Demo →</a>
          </div>

        </div>
      </div>
    </div>
  );
}
