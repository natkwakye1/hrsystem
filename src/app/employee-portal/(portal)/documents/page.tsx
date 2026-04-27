"use client";

import { useEffect, useState } from "react";
import { FileText, Download, Upload, FolderOpen } from "lucide-react";

const cardBase: React.CSSProperties = {
  background: "var(--bg-card)", borderRadius: 14, border: "0.5px solid var(--border)",
};

const COMPANY_DOCS = [
  { title: "Employee Handbook",        type: "Policy",   description: "Company policies, code of conduct, and guidelines",         icon: "📋" },
  { title: "Benefits Guide 2024",      type: "Benefits", description: "Full overview of health, insurance, and allowance benefits", icon: "❤️" },
  { title: "IT Security Policy",       type: "Policy",   description: "Acceptable use of company systems and data",               icon: "🔒" },
  { title: "Leave Policy",             type: "Policy",   description: "Leave entitlements, types, and application procedures",    icon: "🗓️" },
  { title: "Payroll Schedule",         type: "Finance",  description: "Monthly payroll processing and payment dates",             icon: "💳" },
  { title: "Performance Review Guide", type: "HR",       description: "How to prepare for and participate in reviews",            icon: "⭐" },
];

const TYPE_COLOR: Record<string, { bg: string; color: string }> = {
  Policy:   { bg: "#eff6ff", color: "#2563eb" },
  Benefits: { bg: "#eff6ff", color: "#2563eb" },
  Finance:  { bg: "#fefce8", color: "#ca8a04" },
  HR:       { bg: "#fdf4ff", color: "#9333ea" },
};

interface Doc { id: string; title: string; type: string; status: string; createdAt: string; }

export default function DocumentsPage() {
  const [docs,    setDocs]    = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);
  const [empId,   setEmpId]   = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/portal/employee/me")
      .then(r => r.json())
      .then(d => {
        setEmpId(d.employee?.id ?? null);
        if (d.employee?.id) {
          return fetch(`/api/employees/${d.employee.id}/documents`);
        }
      })
      .then(r => r?.json())
      .then(d => { setDocs(d?.documents ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>
      {[80, 250].map((h, i) => <div key={i} style={{ height: h, borderRadius: 14, background: "var(--border)", animation: "pulse 1.4s ease-in-out infinite" }} />)}
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <p style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.07em", textTransform: "uppercase", margin: "0 0 3px" }}>Self-Service</p>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", margin: 0, letterSpacing: -0.4 }}>Document Center</h1>
      </div>

      {/* Company Documents */}
      <div style={{ ...cardBase, overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: "0.5px solid var(--border)", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: "var(--accent-light)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <FolderOpen size={14} style={{ color: "var(--accent)" }} />
          </div>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>Company Documents</h3>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12, padding: 16 }}>
          {COMPANY_DOCS.map(doc => {
            const tc = TYPE_COLOR[doc.type] ?? TYPE_COLOR.Policy;
            return (
              <div key={doc.title} style={{ padding: "14px 16px", borderRadius: 10, border: "0.5px solid var(--border)", background: "var(--bg-body)", display: "flex", gap: 12, alignItems: "flex-start" }}>
                <div style={{ width: 38, height: 38, borderRadius: 8, background: tc.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 18 }}>
                  {doc.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>{doc.title}</p>
                    <span style={{ fontSize: 10, padding: "1px 7px", borderRadius: 4, background: tc.bg, color: tc.color, fontWeight: 600, flexShrink: 0, marginLeft: 6 }}>{doc.type}</span>
                  </div>
                  <p style={{ fontSize: 11, color: "var(--text-secondary)", margin: "0 0 8px", lineHeight: 1.4 }}>{doc.description}</p>
                  <button style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 10px", borderRadius: 6, background: "var(--accent-light)", color: "var(--accent)", border: "none", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>
                    <Download size={11} /> Download
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* My Documents */}
      <div style={{ ...cardBase, overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: "0.5px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: "var(--accent-light)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <FileText size={14} style={{ color: "var(--accent)" }} />
            </div>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>My Documents</h3>
          </div>
          <button style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 12px", borderRadius: 7, background: "var(--accent)", color: "#fff", border: "none", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>
            <Upload size={11} /> Upload
          </button>
        </div>
        {docs.length === 0 ? (
          <div style={{ padding: "40px 0", textAlign: "center" }}>
            <FileText size={32} style={{ color: "var(--border)", marginBottom: 10 }} />
            <p style={{ fontSize: 13, color: "var(--text-muted)" }}>No documents uploaded yet</p>
            <p style={{ fontSize: 11, color: "var(--text-muted)" }}>Upload your ID, certificates, or other documents here</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "var(--bg-body)" }}>
                  {["Document", "Type", "Status", "Date", ""].map(h => (
                    <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 10, fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.07em", textTransform: "uppercase" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {docs.map((d, i) => (
                  <tr key={d.id} style={{ borderTop: "0.5px solid var(--border)", background: i % 2 === 0 ? "var(--bg-card)" : "var(--bg-body)" }}>
                    <td style={{ padding: "11px 16px", fontWeight: 600, color: "var(--text-primary)" }}>{d.title}</td>
                    <td style={{ padding: "11px 16px", color: "var(--text-secondary)" }}>{d.type}</td>
                    <td style={{ padding: "11px 16px" }}>
                      <span style={{ padding: "2px 8px", borderRadius: 999, fontSize: 11, fontWeight: 600, background: d.status === "Approved" ? "#eff6ff" : "var(--bg-body)", color: d.status === "Approved" ? "#1d4ed8" : "var(--text-muted)" }}>{d.status}</span>
                    </td>
                    <td style={{ padding: "11px 16px", color: "var(--text-muted)", fontSize: 11 }}>{new Date(d.createdAt).toLocaleDateString()}</td>
                    <td style={{ padding: "11px 16px" }}>
                      <button style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 10px", borderRadius: 6, background: "var(--accent-light)", color: "var(--accent)", border: "none", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>
                        <Download size={11} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
