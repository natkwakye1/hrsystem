export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Left Panel */}
      <div
        className="hidden lg:flex"
        style={{
          width: 520, flexDirection: "column", justifyContent: "space-between",
          position: "relative", overflow: "hidden",
          background: "linear-gradient(135deg, #60a5fa 0%, #2563eb 50%, #1d4ed8 100%)",
        }}
      >
        <div style={{ position: "absolute", top: -80, left: -80, width: 300, height: 300, borderRadius: "50%", background: "rgba(255,255,255,0.1)" }} />
        <div style={{ position: "absolute", bottom: -120, right: -60, width: 400, height: 400, borderRadius: "50%", background: "rgba(255,255,255,0.06)" }} />
        <div style={{ position: "absolute", top: "40%", right: -40, width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />

        <div style={{ position: "relative", zIndex: 10, padding: "48px 40px 24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: "#fff", fontWeight: 700, fontSize: 18 }}>N</span>
            </div>
            <span style={{ color: "#fff", fontWeight: 700, fontSize: 20, letterSpacing: -0.5 }}>NeraAdmin</span>
          </div>
        </div>

        <div style={{ position: "relative", zIndex: 10, padding: "0 40px 24px", flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <h1 style={{ color: "#fff", fontSize: 34, fontWeight: 700, lineHeight: 1.2, marginBottom: 18 }}>
            Human Capital<br />Management &<br />Payroll System
          </h1>
          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 15, lineHeight: 1.7, maxWidth: 380 }}>
            Streamline your workforce management with a complete HR solution.
            Manage employees, payroll, leave requests, recruitment, and
            onboarding - all in one unified platform.
          </p>
        </div>

        <div style={{ position: "relative", zIndex: 10, padding: "0 40px 40px" }}>
          <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
            {[
              { val: "500+", label: "Employees" },
              { val: "12", label: "Departments" },
              { val: "98%", label: "Satisfaction" },
            ].map((s, i) => (
              <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 24 }}>
                {i > 0 && <div style={{ width: 1, height: 40, backgroundColor: "rgba(255,255,255,0.2)" }} />}
                <div style={{ textAlign: "center" }}>
                  <p style={{ color: "#fff", fontWeight: 700, fontSize: 24, margin: 0 }}>{s.val}</p>
                  <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, margin: "4px 0 0" }}>{s.label}</p>
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
