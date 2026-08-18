// Option B — Dark Bento Grid
// Dark navy background, 2×2 oversized cards with large icon and accent number

const items = [
  {
    num: "01",
    accentColor: "#818cf8",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
      </svg>
    ),
    title: "Interoperable",
    body: "Open Badges 3.0, W3C Verifiable Credentials and CLR — credentials that travel anywhere.",
    badges: ["OB3", "W3C VC", "CLR"]
  },
  {
    num: "02",
    accentColor: "#34d399",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
      </svg>
    ),
    title: "Enterprise Ready",
    body: "API-first, LMS integrations, SSO, white-label and SOC 2 Type II certified security.",
    badges: ["API", "SSO", "SOC 2"]
  },
  {
    num: "03",
    accentColor: "#f472b6",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#f472b6" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 20V10M12 20V4M6 20v-6"/>
      </svg>
    ),
    title: "Measurable",
    body: "Real-time analytics on issuance, sharing and engagement — from a single institutional dashboard.",
    badges: ["Analytics", "Insights"]
  },
  {
    num: "04",
    accentColor: "#fbbf24",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
      </svg>
    ),
    title: "Outcome Focused",
    body: "Learning pathways, verified skills and labour-market data — so credentials prove their value.",
    badges: ["Skills", "Pathways"]
  }
];

export function DarkBento() {
  return (
    <div style={{ background: "#282B75", minHeight: "100vh", fontFamily: "'Inter', sans-serif", padding: "60px 0" }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

      <div style={{ maxWidth: 940, margin: "0 auto", padding: "0 40px" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 52 }}>
          <div style={{
            display: "inline-block",
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: "0.12em",
            color: "#818cf8",
            background: "rgba(129,140,248,0.12)",
            padding: "5px 14px",
            borderRadius: 20,
            marginBottom: 18,
            textTransform: "uppercase"
          }}>Why CertifyMe</div>
          <h2 style={{ fontSize: 34, fontWeight: 800, color: "#fff", margin: "0 0 14px", letterSpacing: "-0.5px" }}>
            Why Institutions Choose CertifyMe
          </h2>
          <p style={{ fontSize: 16.5, color: "rgba(255,255,255,0.55)", maxWidth: 520, margin: "0 auto", lineHeight: 1.65 }}>
            A complete credential infrastructure — built around open standards, enterprise requirements and measurable outcomes.
          </p>
        </div>

        {/* 2×2 Bento grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {items.map((item, i) => (
            <div key={i} style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.09)",
              borderRadius: 18,
              padding: "32px 30px",
              position: "relative",
              overflow: "hidden"
            }}>
              {/* Large faint number */}
              <div style={{
                position: "absolute",
                top: 20,
                right: 24,
                fontSize: 52,
                fontWeight: 900,
                color: item.accentColor,
                opacity: 0.12,
                lineHeight: 1,
                letterSpacing: "-2px",
                userSelect: "none"
              }}>{item.num}</div>

              {/* Icon */}
              <div style={{
                width: 54,
                height: 54,
                background: "rgba(255,255,255,0.07)",
                borderRadius: 14,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 20,
                border: `1px solid ${item.accentColor}22`
              }}>
                {item.icon}
              </div>

              {/* Title */}
              <h4 style={{ margin: "0 0 10px", fontSize: 19, fontWeight: 700, color: "#fff" }}>{item.title}</h4>

              {/* Body */}
              <p style={{ margin: "0 0 18px", fontSize: 14.5, color: "rgba(255,255,255,0.55)", lineHeight: 1.65 }}>{item.body}</p>

              {/* Badges */}
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {item.badges.map((b, j) => (
                  <span key={j} style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: item.accentColor,
                    background: `${item.accentColor}18`,
                    padding: "3px 11px",
                    borderRadius: 20,
                    border: `1px solid ${item.accentColor}30`
                  }}>{b}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
