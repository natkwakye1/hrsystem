"use client";

import { useEffect, useState } from "react";
import { Heart, Shield, Plus, Loader2 } from "lucide-react";
import Modal from "@/components/Modal";

/* ─────────────────────────────────────────
   Font + Palette
───────────────────────────────────────── */
const FONT_URL =
  "https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&display=swap";

const BLUE = {
  900: "#1e3a8a", 700: "#1d4ed8", 600: "#2563eb",
  500: "#3b82f6", 400: "#60a5fa", 300: "#93c5fd",
  200: "#bfdbfe", 100: "#dbeafe", 50:  "#eff6ff",
};

/* ─────────────────────────────────────────
   Shared styles
───────────────────────────────────────── */
const cardBase: React.CSSProperties = {
  background: "var(--bg-card)",
  borderRadius: 14,
  border: "0.5px solid var(--border)",
};

const inp: React.CSSProperties = {
  width: "100%", padding: "9px 12px", borderRadius: 8,
  border: "0.5px solid var(--border)", background: "var(--bg-input)",
  color: "var(--text-primary)", fontSize: 12, outline: "none",
  fontFamily: "'DM Sans', sans-serif", boxSizing: "border-box",
};

const lbl: React.CSSProperties = {
  display: "block", fontSize: 10, fontWeight: 600,
  color: "var(--text-muted)", letterSpacing: "0.07em",
  textTransform: "uppercase", marginBottom: 5,
};

/* ─────────────────────────────────────────
   Types
───────────────────────────────────────── */
interface Benefit {
  id: string; name: string; type: string;
  description: string; amount: number; isActive: boolean;
}
interface Deduction {
  id: string; name: string; type: string; description: string;
  amount: number; percentage: number; isActive: boolean;
}

/* ─────────────────────────────────────────
   Page
───────────────────────────────────────── */
export default function BenefitsPage() {
  const [benefits,   setBenefits]   = useState<Benefit[]>([]);
  const [deductions, setDeductions] = useState<Deduction[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [activeTab,  setActiveTab]  = useState<"benefits" | "deductions">("benefits");
  const [showModal,  setShowModal]  = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "", type: "", description: "",
    amount: "", percentage: "", itemType: "benefit",
  });

  const fetchData = () => {
    setLoading(true);
    fetch("/api/benefits")
      .then(r => r.json())
      .then(d => { setBenefits(d.benefits || []); setDeductions(d.deductions || []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault(); setSubmitting(true);
    try {
      const res = await fetch("/api/benefits", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setShowModal(false);
        setForm({ name: "", type: "", description: "", amount: "", percentage: "", itemType: "benefit" });
        fetchData();
      }
    } finally { setSubmitting(false); }
  };

  /* ── Loading skeleton ── */
  if (loading) return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>
      <div style={{ height: 54, borderRadius: 14, background: "var(--border)", animation: "pulse 1.4s ease-in-out infinite" }} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 16 }}>
        {[1,2,3].map(i => <div key={i} style={{ height: 180, borderRadius: 14, background: "var(--border)", animation: "pulse 1.4s ease-in-out infinite" }} />)}
      </div>
    </div>
  );

  const items = activeTab === "benefits" ? benefits : deductions;

  return (
    <>
      <style>{`
        @import url('${FONT_URL}');
        .benefits-page * { font-family: 'DM Sans', sans-serif !important; }
        .benefit-card:hover { border-color: ${BLUE[300]} !important; }
        .add-btn:hover { opacity: 0.85; }

        .benefits-page {
          --bg-card:   #ffffff;
          --bg-hover:  #f8fafc;
          --bg-input:  #f8fafc;
          --border:    rgba(0,0,0,0.08);
          --text-primary:   #0f172a;
          --text-secondary: #64748b;
          --text-muted:     #94a3b8;
        }
        @media (prefers-color-scheme: dark) {
          .benefits-page {
            --bg-card:   #0f172a;
            --bg-hover:  #1e293b;
            --bg-input:  #1e293b;
            --border:    rgba(255,255,255,0.08);
            --text-primary:   #f1f5f9;
            --text-secondary: #94a3b8;
            --text-muted:     #475569;
          }
        }
      `}</style>

      <div className="benefits-page" style={{ display: "flex", flexDirection: "column", gap: 20 }}>

        {/* ── Header ── */}
        <div>
          <p style={{ fontSize: 10, fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.07em", textTransform: "uppercase", margin: "0 0 3px" }}>
            HR Management
          </p>
          <h1 style={{ fontSize: 22, fontWeight: 600, color: "var(--text-primary)", margin: 0, letterSpacing: -0.5 }}>
            Benefits & Deductions
          </h1>
        </div>

        {/* ── Toolbar ── */}
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          {/* Tab switcher */}
          <div style={{ display: "flex", gap: 3, padding: 4, background: "var(--bg-card)", borderRadius: 11, border: "0.5px solid var(--border)" }}>
            {(["benefits", "deductions"] as const).map(tab => {
              const isAct = activeTab === tab;
              const Icon  = tab === "benefits" ? Heart : Shield;
              const count = tab === "benefits" ? benefits.length : deductions.length;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 16px", borderRadius: 8, fontSize: 12, fontWeight: isAct ? 600 : 400, border: "none", cursor: "pointer", background: isAct ? BLUE[600] : "transparent", color: isAct ? "#fff" : "var(--text-secondary)", transition: "background 0.15s, color 0.15s" }}
                >
                  <Icon size={13} />
                  {tab === "benefits" ? "Benefits" : "Deductions"}
                  <span style={{ fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 99, background: isAct ? "rgba(255,255,255,0.22)" : BLUE[100], color: isAct ? "#fff" : BLUE[700] }}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Add button */}
          <button
            className="add-btn"
            onClick={() => {
              setForm({ ...form, itemType: activeTab === "benefits" ? "benefit" : "deduction" });
              setShowModal(true);
            }}
            style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "8px 16px", borderRadius: 8, border: "none", background: BLUE[600], color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "opacity 0.15s" }}
          >
            <Plus size={14} />
            Add {activeTab === "benefits" ? "Benefit" : "Deduction"}
          </button>
        </div>

        {/* ── Cards grid ── */}
        {items.length === 0 ? (
          <div style={{ ...cardBase, padding: "52px 20px", textAlign: "center" }}>
            <div style={{ width: 44, height: 44, borderRadius: 11, background: BLUE[50], display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
              {activeTab === "benefits"
                ? <Heart  size={18} style={{ color: BLUE[500] }} />
                : <Shield size={18} style={{ color: BLUE[500] }} />}
            </div>
            <p style={{ fontSize: 13, color: "var(--text-muted)", margin: 0 }}>
              No {activeTab} configured yet
            </p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))", gap: 16 }}>

            {activeTab === "benefits"
              ? benefits.map(b => (
                  <div
                    key={b.id}
                    className="benefit-card"
                    style={{ ...cardBase, padding: 20, display: "flex", flexDirection: "column", gap: 0, transition: "border-color 0.18s" }}
                  >
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 10, background: BLUE[50], display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Heart size={16} style={{ color: BLUE[500] }} />
                      </div>
                      <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 9px", borderRadius: 5, background: b.isActive ? BLUE[100] : "var(--bg-hover)", color: b.isActive ? BLUE[700] : "var(--text-muted)", letterSpacing: 0.2 }}>
                        {b.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <p style={{ margin: "0 0 4px", fontSize: 14, fontWeight: 600, color: "var(--text-primary)", letterSpacing: -0.2 }}>{b.name}</p>
                    <p style={{ margin: "0 0 16px", fontSize: 11, color: "var(--text-muted)", lineHeight: 1.6, flex: 1 }}>
                      {b.description || "No description"}
                    </p>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 12, borderTop: "0.5px solid var(--border)", marginTop: "auto" }}>
                      <span style={{ fontSize: 11, fontWeight: 500, color: "var(--text-secondary)", background: "var(--bg-hover)", padding: "2px 8px", borderRadius: 5 }}>
                        {b.type || "—"}
                      </span>
                      <div style={{ textAlign: "right" }}>
                        <p style={{ margin: 0, fontSize: 9.5, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em" }}>Amount</p>
                        <p style={{ margin: "1px 0 0", fontSize: 16, fontWeight: 600, color: BLUE[600], letterSpacing: -0.3 }}>
                          ${b.amount?.toLocaleString()}<span style={{ fontSize: 11, fontWeight: 400, color: "var(--text-muted)" }}>/mo</span>
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              : deductions.map(d => (
                  <div
                    key={d.id}
                    className="benefit-card"
                    style={{ ...cardBase, padding: 20, display: "flex", flexDirection: "column", gap: 0, transition: "border-color 0.18s" }}
                  >
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 10, background: BLUE[50], display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Shield size={16} style={{ color: BLUE[500] }} />
                      </div>
                      <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 9px", borderRadius: 5, background: d.isActive ? BLUE[100] : "var(--bg-hover)", color: d.isActive ? BLUE[700] : "var(--text-muted)", letterSpacing: 0.2 }}>
                        {d.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <p style={{ margin: "0 0 4px", fontSize: 14, fontWeight: 600, color: "var(--text-primary)", letterSpacing: -0.2 }}>{d.name}</p>
                    <p style={{ margin: "0 0 16px", fontSize: 11, color: "var(--text-muted)", lineHeight: 1.6, flex: 1 }}>
                      {d.description || "No description"}
                    </p>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 12, borderTop: "0.5px solid var(--border)", marginTop: "auto" }}>
                      <span style={{ fontSize: 11, fontWeight: 500, color: "var(--text-secondary)", background: "var(--bg-hover)", padding: "2px 8px", borderRadius: 5 }}>
                        {d.type || "—"}
                      </span>
                      <div style={{ textAlign: "right" }}>
                        <p style={{ margin: 0, fontSize: 9.5, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em" }}>
                          {d.percentage ? "Rate" : "Amount"}
                        </p>
                        <p style={{ margin: "1px 0 0", fontSize: 16, fontWeight: 600, color: BLUE[600], letterSpacing: -0.3 }}>
                          {d.percentage ? `${d.percentage}%` : `$${d.amount?.toLocaleString()}`}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
            }
          </div>
        )}

        {/* ── Modal ── */}
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={`Add ${form.itemType === "benefit" ? "Benefit" : "Deduction"}`}
        >
          <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={lbl}>Name <span style={{ color: BLUE[500] }}>*</span></label>
              <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={inp} placeholder="Enter name" />
            </div>
            <div>
              <label style={lbl}>Type</label>
              <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} style={inp}>
                <option value="">Select type</option>
                {form.itemType === "benefit" ? (
                  <>
                    <option value="Insurance">Insurance</option>
                    <option value="Retirement">Retirement</option>
                    <option value="Allowance">Allowance</option>
                    <option value="Other">Other</option>
                  </>
                ) : (
                  <>
                    <option value="Tax">Tax</option>
                    <option value="Insurance">Insurance</option>
                    <option value="Loan">Loan</option>
                    <option value="Other">Other</option>
                  </>
                )}
              </select>
            </div>
            <div>
              <label style={lbl}>Description</label>
              <input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} style={inp} placeholder="Optional description" />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: form.itemType === "deduction" ? "1fr 1fr" : "1fr", gap: 12 }}>
              <div>
                <label style={lbl}>Amount ($)</label>
                <input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} style={inp} placeholder="0.00" />
              </div>
              {form.itemType === "deduction" && (
                <div>
                  <label style={lbl}>Percentage (%)</label>
                  <input type="number" step="0.01" value={form.percentage} onChange={e => setForm({ ...form, percentage: e.target.value })} style={inp} placeholder="0.00" />
                </div>
              )}
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, paddingTop: 14, borderTop: "0.5px solid var(--border)" }}>
              <button type="button" onClick={() => setShowModal(false)} style={{ padding: "8px 16px", borderRadius: 8, border: "0.5px solid var(--border)", background: "var(--bg-hover)", color: "var(--text-secondary)", fontSize: 12, fontWeight: 500, cursor: "pointer" }}>
                Cancel
              </button>
              <button type="submit" disabled={submitting} style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "8px 16px", borderRadius: 8, border: "none", background: BLUE[600], color: "#fff", fontSize: 12, fontWeight: 600, cursor: submitting ? "not-allowed" : "pointer", opacity: submitting ? 0.7 : 1, transition: "opacity 0.15s" }}>
                {submitting && <Loader2 size={13} className="animate-spin" />}
                Create
              </button>
            </div>
          </form>
        </Modal>

      </div>
    </>
  );
}