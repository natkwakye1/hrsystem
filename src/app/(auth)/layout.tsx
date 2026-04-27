export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Left Panel */}
      <div
        className="hidden lg:flex"
        style={{
          width: 520, flexDirection: "column", justifyContent: "space-between",
          position: "relative", overflow: "hidden",
        }}
      >
        {/* Background image */}
        <img
          src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80&fit=crop"
          alt=""
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }}
        />
        {/* Overlay */}
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.38)" }} />

        <div style={{ position: "relative", zIndex: 10, padding: "48px 40px 24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.18)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: "#fff", fontWeight: 800, fontSize: 18 }}>N</span>
            </div>
            <span style={{ color: "#fff", fontWeight: 700, fontSize: 20, letterSpacing: -0.5 }}>NeraAdmin</span>
          </div>
        </div>

        <div style={{ position: "relative", zIndex: 10, padding: "0 40px 24px", flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <h1 style={{ color: "#fff", fontSize: 36, fontWeight: 800, lineHeight: 1.2, marginBottom: 18, letterSpacing: -1 }}>
            All your HR<br />operations,<br />one platform.
          </h1>
          <p style={{ color: "rgba(255,255,255,0.72)", fontSize: 15, lineHeight: 1.8, maxWidth: 360 }}>
            Manage employees, process payroll, track leave, run recruitment, and get real-time analytics — in one unified system.
          </p>
        </div>

        <div style={{ position: "relative", zIndex: 10, padding: "0 40px 40px" }}>
          <div style={{ display: "flex", gap: 24, alignItems: "center", background: "rgba(255,255,255,0.1)", backdropFilter: "blur(12px)", borderRadius: 14, padding: "18px 20px", border: "1px solid rgba(255,255,255,0.15)" }}>
            {[
              { val: "500+", label: "Employees" },
              { val: "12", label: "Departments" },
              { val: "98%", label: "Satisfaction" },
            ].map((s, i) => (
              <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 24, flex: 1 }}>
                {i > 0 && <div style={{ width: 1, height: 36, backgroundColor: "rgba(255,255,255,0.2)" }} />}
                <div style={{ textAlign: "center", flex: 1 }}>
                  <p style={{ color: "#fff", fontWeight: 800, fontSize: 22, margin: 0, letterSpacing: -0.5 }}>{s.val}</p>
                  <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 11, margin: "3px 0 0", fontWeight: 500 }}>{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div style={{
        flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
        backgroundColor: "var(--bg-body)", padding: "40px 24px",
      }}>
        <div style={{ width: "100%", maxWidth: 460 }}>{children}</div>
      </div>
    </div>
  );
}
