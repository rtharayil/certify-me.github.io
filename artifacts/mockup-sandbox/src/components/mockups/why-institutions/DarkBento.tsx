// Option B — Dark Bento Grid (compact — 75% less vertical real estate)
// 4-col single row, tight padding, icon + title + tags only

const items = [
  {
    num: "01",
    accentColor: "#818cf8",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
      </svg>
    ),
    title: "Interoperable",
    body: "OB3, W3C VC and CLR — credentials that travel anywhere.",
    badges: ["OB3", "W3C VC", "CLR"]
  },
  {
    num: "02",
    accentColor: "#34d399",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
      </svg>
    ),
    title: "Enterprise Ready",
    body: "API-first, LMS integrations, SSO and SOC 2 Type II.",
    badges: ["API", "SSO", "SOC 2"]
  },
  {
    num: "03",
    accentColor: "#f472b6",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f472b6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 20V10M12 20V4M6 20v-6"/>
      </svg>
    ),
    title: "Measurable",
    body: "Real-time analytics on issuance, sharing and engagement.",
    badges: ["Analytics", "Insights"]
  },
  {
    num: "04",
    accentColor: "#fbbf24",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
      </svg>
    ),
    title: "Outcome Focused",
    body: "Learning pathways and verified skills that prove program value.",
    badges: ["Skills", "Pathways"]
  }
];

export function DarkBento() {
  return (
    <div style={{ background: "#282B75", fontFamily: "'Inter', sans-serif", padding: "36px 0" }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 32px" }}>

        {/* Header — compact single line */}
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: "#fff", margin: "0 0 6px", letterSpacing: "-0.3px" }}>
            Why Institutions Choose CertifyMe
          </h2>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", margin: 0, lineHeight: 1.5 }}>
            Open standards · Enterprise ready · Measurable outcomes
          </p>
        </div>

        {/* 4-col single-row grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
          {items.map((item, i) => (
            <div key={i} style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.09)",
              borderRadius: 12,
              padding: "16px 16px 14px",
              position: "relative",
              overflow: "hidden"
            }}>
              {/* Faint number */}
              <div style={{
                position: "absolute",
                top: 10,
                right: 14,
                fontSize: 32,
                fontWeight: 900,
                color: item.accentColor,
                opacity: 0.1,
                lineHeight: 1,
                letterSpacing: "-1px",
                userSelect: "none"
              }}>{item.num}</div>

              {/* Icon + title row */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <div style={{
                  width: 34,
                  height: 34,
                  background: "rgba(255,255,255,0.07)",
                  borderRadius: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  border: `1px solid ${item.accentColor}28`
                }}>
                  {item.icon}
                </div>
                <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#fff" }}>{item.title}</h4>
              </div>

              {/* Body */}
              <p style={{ margin: "0 0 10px", fontSize: 12.5, color: "rgba(255,255,255,0.5)", lineHeight: 1.55 }}>{item.body}</p>

              {/* Badges */}
              <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                {item.badges.map((b, j) => (
                  <span key={j} style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: item.accentColor,
                    background: `${item.accentColor}16`,
                    padding: "2px 8px",
                    borderRadius: 20,
                    border: `1px solid ${item.accentColor}28`
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
