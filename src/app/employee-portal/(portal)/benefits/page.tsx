"use client";

import { useEffect, useState } from "react";
import { Heart, Shield, Activity, Gift } from "lucide-react";

const BLUE = {
  700: "#1d4ed8", 600: "#2563eb", 500: "#3b82f6",
  200: "#bfdbfe", 100: "#dbeafe", 50: "#eff6ff",
};

const STATUS_CONFIG: Record<string, { bg: string; color: string }> = {
  Active:   { bg: BLUE[100], color: BLUE[700] },
  Inactive: { bg: BLUE[50],  color: BLUE[500] },
};

const TYPE_ICON: Record<string, React.ElementType> = {
  Health: Activity, Insurance: Shield, Allowance: Gift, Other: Heart,
};

const cardBase: React.CSSProperties = {
  background: "var(--bg-card)", borderRadius: 14, border: "0.5px solid var(--border)",
};

interface BenefitEnrollment {
  id: string; status: string; startDate: string; endDate?: string;
  benefit: { id: string; name: string; type: string; description?: string; amount?: number };
}
interface Employee { benefits: BenefitEnrollment[]; }

export default function BenefitsPage() {
  const [emp,     setEmp]     = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/portal/employee/me").then(r => r.json()).then(d => { setEmp(d.employee); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>
      {[80, 320].map((h, i) => <div key={i} style={{ height: h, borderRadius: 14, background: "var(--border)", animation: "pulse 1.4s ease-in-out infinite" }} />)}
    </div>
  );

  const benefits     = emp?.benefits ?? [];
  const active       = benefits.filter(b => b.status === "Active");
  const totalMonthly = active.reduce((s, b) => s + (b.benefit.amount ?? 0), 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <p style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.07em", textTransform: "uppercase", margin: "0 0 3px" }}>Self-Service</p>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", margin: 0, letterSpacing: -0.4 }}>My Benefits</h1>
      </div>

      {/* Summary */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14 }}>
        {[
          { label: "Active Benefits", value: active.length,                               fmt: String  },
          { label: "Monthly Value",   value: totalMonthly,                                fmt: (v: number) => `$${v.toLocaleString()}` },
          { label: "Total Enrolled",  value: benefits.length,                             fmt: String  },
        ].map(s => (
          <div key={s.label} style={{ ...cardBase, padding: "16px 18px" }}>
            <p style={{ fontSize: 10, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", margin: "0 0 6px" }}>{s.label}</p>
            <p style={{ fontSize: 26, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>{s.fmt(s.value as number)}</p>
          </div>
        ))}
      </div>

      {/* Benefits grid */}
      {benefits.length === 0 ? (
        <div style={{ ...cardBase, padding: "48px 0", textAlign: "center" }}>
          <Heart size={32} style={{ color: "var(--border)", marginBottom: 10 }} />
          <p style={{ fontSize: 13, color: "var(--text-muted)" }}>No benefits enrolled yet</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
          {benefits.map(b => {
            const Icon     = TYPE_ICON[b.benefit.type] ?? Heart;
            const isActive = b.status === "Active";
            const sc       = STATUS_CONFIG[b.status] ?? STATUS_CONFIG.Active;
            return (
              <div key={b.id} style={{ ...cardBase, padding: "20px", display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 34, height: 34, borderRadius: 9, background: "var(--accent-light)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Icon size={16} style={{ color: "var(--accent)" }} />
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)" }}>{b.benefit.type}</span>
                  </div>
                  <span style={{ display: "inline-block", padding: "2px 10px", borderRadius: 999, fontSize: 11, fontWeight: 600, background: sc.bg, color: sc.color }}>{b.status}</span>
                </div>

                <div>
                  <p style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", margin: "0 0 4px" }}>{b.benefit.name}</p>
                  <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: 0, lineHeight: 1.5 }}>{b.benefit.description || "No description provided."}</p>
                </div>

                <div style={{ borderTop: "0.5px solid var(--border)", paddingTop: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <p style={{ fontSize: 10, color: "var(--text-muted)", margin: "0 0 2px" }}>Enrolled</p>
                    <p style={{ fontSize: 12, fontWeight: 500, color: "var(--text-secondary)", margin: 0 }}>{b.startDate}</p>
                  </div>
                  {b.benefit.amount != null && b.benefit.amount > 0 && (
                    <div style={{ textAlign: "right" }}>
                      <p style={{ fontSize: 10, color: "var(--text-muted)", margin: "0 0 2px" }}>Monthly Value</p>
                      <p style={{ fontSize: 18, fontWeight: 700, color: "var(--accent)", margin: 0 }}>${b.benefit.amount.toLocaleString()}</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
