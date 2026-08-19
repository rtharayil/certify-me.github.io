// Current Design — faithful reproduction of WhyInstitutionsChoose.html
// 4-column card grid, white cards on lavender background

const items = [
  {
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
      </svg>
    ),
    title: "Interoperable",
    body: "Built around open standards including Open Badges 3.0 and W3C Verifiable Credentials — credentials that work everywhere."
  },
  {
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
      </svg>
    ),
    title: "Enterprise Ready",
    body: "APIs, LMS integrations, white-label branding, SSO, SOC 2 Type II security and scalable credential management."
  },
  {
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 20V10M12 20V4M6 20v-6"/>
      </svg>
    ),
    title: "Measurable",
    body: "Analytics and insights into credential issuance, engagement, sharing and program performance — from one dashboard."
  },
  {
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
      </svg>
    ),
    title: "Outcome Focused",
    body: "Extend the value of credentials through learning pathways, verified skills and labour-market intelligence."
  }
];

export function Current() {
  return (
    <div style={{ background: "#f4f3ff", minHeight: "100vh", fontFamily: "'Inter', sans-serif", padding: "60px 0" }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 40px" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 50 }}>
          <h2 style={{ fontSize: 34, fontWeight: 800, color: "#20203c", margin: "0 0 14px", letterSpacing: "-0.5px" }}>
            Why Institutions Choose CertifyMe
          </h2>
          <p style={{ fontSize: 17, color: "#6b7280", maxWidth: 580, margin: "0 auto", lineHeight: 1.6 }}>
            A complete credential infrastructure — built around open standards, enterprise requirements and measurable outcomes.
          </p>
        </div>

        {/* 4-col card grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20 }}>
          {items.map((item, i) => (
            <div key={i} style={{
              background: "rgba(255,255,255,0.72)",
              border: "1px solid rgba(40,43,117,.09)",
              borderRadius: 14,
              padding: "28px 24px 24px",
              display: "flex",
              flexDirection: "column",
              gap: 14,
              boxShadow: "0 2px 8px rgba(40,43,117,.05)"
            }}>
              {/* Icon */}
              <div style={{
                width: 52,
                height: 52,
                background: "#eef0ff",
                borderRadius: 12,
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                {item.icon}
              </div>
              <h4 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#20203c" }}>{item.title}</h4>
              <p style={{ margin: 0, fontSize: 14.5, color: "#6b7280", lineHeight: 1.6 }}>{item.body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
