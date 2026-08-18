// Option A — Accent Rail
// Numbered horizontal rows, left accent bar, clean editorial feel

const items = [
  {
    num: "01",
    color: "#4f46e5",
    bg: "#eef0ff",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
      </svg>
    ),
    title: "Interoperable by Design",
    body: "Built on Open Badges 3.0 and W3C Verifiable Credentials — credentials that work across every LMS, wallet, and employer platform.",
    tag: "OB3 · W3C VC · CLR"
  },
  {
    num: "02",
    color: "#0891b2",
    bg: "#e0f7fa",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0891b2" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
      </svg>
    ),
    title: "Enterprise Ready",
    body: "APIs, LMS integrations, white-label branding, SSO and SOC 2 Type II security — ready for your IT and compliance requirements.",
    tag: "API · SSO · SOC 2"
  },
  {
    num: "03",
    color: "#7c3aed",
    bg: "#f3e8ff",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 20V10M12 20V4M6 20v-6"/>
      </svg>
    ),
    title: "Measurable Outcomes",
    body: "Analytics on credential issuance, engagement, sharing and program performance — all from one dashboard, in real time.",
    tag: "Dashboard · Insights"
  },
  {
    num: "04",
    color: "#059669",
    bg: "#d1fae5",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
      </svg>
    ),
    title: "Outcome Focused",
    body: "Extend credential value through learning pathways, verified skills and labour-market intelligence that students can act on.",
    tag: "Skills · Pathways"
  }
];

export function AccentRail() {
  return (
    <div style={{ background: "#f4f3ff", minHeight: "100vh", fontFamily: "'Inter', sans-serif", padding: "60px 0" }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 40px" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 52 }}>
          <h2 style={{ fontSize: 34, fontWeight: 800, color: "#20203c", margin: "0 0 14px", letterSpacing: "-0.5px" }}>
            Why Institutions Choose CertifyMe
          </h2>
          <p style={{ fontSize: 17, color: "#6b7280", maxWidth: 520, margin: "0 auto", lineHeight: 1.6 }}>
            A complete credential infrastructure — built around open standards, enterprise requirements and measurable outcomes.
          </p>
        </div>

        {/* Rail items */}
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {items.map((item, i) => (
            <div key={i} style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 28,
              background: "white",
              borderRadius: 14,
              padding: "28px 32px",
              borderLeft: `4px solid ${item.color}`,
              boxShadow: "0 1px 6px rgba(40,43,117,.07)",
              marginBottom: 12,
              transition: "transform 0.15s, box-shadow 0.15s"
            }}>
              {/* Number */}
              <div style={{
                fontSize: 13,
                fontWeight: 800,
                color: item.color,
                opacity: 0.5,
                minWidth: 28,
                paddingTop: 3,
                letterSpacing: "0.04em"
              }}>{item.num}</div>

              {/* Icon */}
              <div style={{
                width: 46,
                height: 46,
                background: item.bg,
                borderRadius: 12,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0
              }}>
                {item.icon}
              </div>

              {/* Content */}
              <div style={{ flex: 1 }}>
                <h4 style={{ margin: "0 0 6px", fontSize: 17, fontWeight: 700, color: "#20203c" }}>{item.title}</h4>
                <p style={{ margin: "0 0 12px", fontSize: 14.5, color: "#6b7280", lineHeight: 1.6 }}>{item.body}</p>
                <span style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: item.color,
                  background: item.bg,
                  padding: "3px 10px",
                  borderRadius: 20
                }}>{item.tag}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
