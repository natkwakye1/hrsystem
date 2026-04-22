"use client";

import { useEffect, useState } from "react";
import { Plus, X, Loader2, MinusCircle } from "lucide-react";

const BLUE = {
  700: "#1d4ed8", 600: "#2563eb", 500: "#3b82f6",
  200: "#bfdbfe", 100: "#dbeafe", 50: "#eff6ff",
};

const cardBase: React.CSSProperties = {
  background: "var(--bg-card)", borderRadius: 14, border: "0.5px solid var(--border)",
};
const inp: React.CSSProperties = {
  width: "100%", padding: "9px 12px", borderRadius: 8,
  border: "0.5px solid var(--border)", background: "var(--bg-input)",
  color: "var(--text-primary)", fontSize: 13, outline: "none", fontFamily: "inherit", boxSizing: "border-box",
};
const lbl: React.CSSProperties = {
  display: "block", fontSize: 10, fontWeight: 600, color: "var(--text-muted)",
  letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 5,
};

const TYPE_COLOR: Record<string, { bg: string; color: string }> = {
  loan:      { bg: BLUE[100], color: BLUE[700] },
  insurance: { bg: BLUE[50],  color: BLUE[600] },
  penalty:   { bg: BLUE[200], color: BLUE[900] },
  other:     { bg: BLUE[50],  color: BLUE[500] },
};

interface EmployeeDeduction {
  id: string; name: string; type: string; amount: number; balance?: number;
  startDate: string; endDate?: string; status: string; employeeId: string;
}
interface Employee {
  id: string; firstName: string; lastName: string; employeeId: string; department?: string;
  employeeDeductions: EmployeeDeduction[];
}

export default function FinanceDeductionsPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [modal,     setModal]     = useState<string | null>(null); // employeeId
  const [saving,    setSaving]    = useState(false);
  const [form, setForm] = useState({ name: "", type: "loan", amount: "", balance: "", startDate: "", endDate: "" });

  const load = () => {
    fetch("/api/employees")
      .then(r => r.json())
      .then(async (emps: Employee[]) => {
        // Fetch deductions for each employee
        const enriched = await Promise.all(emps.map(async emp => {
          const res = await fetch(`/api/employees/${emp.id}/deductions`).catch(() => null);
          const data = res ? await res.json().catch(() => ({ deductions: [] })) : { deductions: [] };
          return { ...emp, employeeDeductions: data.deductions ?? [] };
        }));
        setEmployees(enriched);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!modal) return;
    setSaving(true);
    try {
      await fetch(`/api/employees/${modal}/deductions`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      load();
      setModal(null);
      setForm({ name: "", type: "loan", amount: "", balance: "", startDate: "", endDate: "" });
    } finally { setSaving(false); }
  };

  if (loading) return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>
      {[80, 300].map((h, i) => <div key={i} style={{ height: h, borderRadius: 14, background: "var(--border)", animation: "pulse 1.4s ease-in-out infinite" }} />)}
    </div>
  );

  const allDeductions   = employees.flatMap(e => e.employeeDeductions);
  const totalDeductions = allDeductions.reduce((s, d) => s + d.amount, 0);
  const activeCount     = allDeductions.filter(d => d.status === "Active").length;

  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <div>
          <p style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.07em", textTransform: "uppercase", margin: "0 0 3px" }}>Finance Portal</p>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", margin: 0, letterSpacing: -0.4 }}>Deductions Management</h1>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 14 }}>
          {[
            { label: "Total Deductions",  value: allDeductions.length },
            { label: "Active",            value: activeCount },
            { label: "Monthly Impact",    value: `$${totalDeductions.toLocaleString()}` },
            { label: "Employees Affected",value: employees.filter(e => e.employeeDeductions.length > 0).length },
          ].map(s => (
            <div key={s.label} style={{ ...cardBase, padding: "16px 18px" }}>
              <p style={{ fontSize: 10, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", margin: "0 0 6px" }}>{s.label}</p>
              <p style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Employee deduction list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {employees.map(emp => (
            <div key={emp.id} style={{ ...cardBase, overflow: "hidden" }}>
              <div style={{ padding: "14px 20px", borderBottom: "0.5px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", margin: "0 0 2px" }}>{emp.firstName} {emp.lastName}</p>
                  <p style={{ fontSize: 11, color: "var(--text-muted)", margin: 0 }}>{emp.employeeId} · {emp.department || "—"}</p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  {emp.employeeDeductions.length > 0 && (
                    <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                      ${emp.employeeDeductions.filter(d => d.status === "Active").reduce((s, d) => s + d.amount, 0).toLocaleString()}/mo
                    </span>
                  )}
                  <button
                    onClick={() => setModal(emp.id)}
                    style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 12px", borderRadius: 7, background: "var(--accent)", color: "#fff", border: "none", fontSize: 11, fontWeight: 600, cursor: "pointer" }}
                  >
                    <Plus size={11} /> Add
                  </button>
                </div>
              </div>
              {emp.employeeDeductions.length === 0 ? (
                <p style={{ fontSize: 12, color: "var(--text-muted)", padding: "12px 20px", margin: 0 }}>No deductions assigned</p>
              ) : (
                <div style={{ padding: "10px 20px", display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {emp.employeeDeductions.map(d => {
                    const tc = TYPE_COLOR[d.type] ?? TYPE_COLOR.other;
                    return (
                      <div key={d.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 8, background: tc.bg, border: `0.5px solid ${tc.bg}` }}>
                        <MinusCircle size={12} style={{ color: tc.color }} />
                        <div>
                          <p style={{ fontSize: 12, fontWeight: 600, color: tc.color, margin: 0 }}>{d.name}</p>
                          <p style={{ fontSize: 10, color: tc.color, opacity: 0.8, margin: 0 }}>{d.type} · ${d.amount}/mo · {d.status}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.4)", padding: 20 }}>
          <div style={{ background: "var(--bg-card)", borderRadius: 16, width: "100%", maxWidth: 480, boxShadow: "var(--shadow-xl)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 24px", borderBottom: "0.5px solid var(--border)" }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>Add Deduction</h3>
              <button onClick={() => setModal(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}><X size={18} /></button>
            </div>
            <form onSubmit={handleAdd} style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={lbl}>Name</label>
                  <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} style={inp} placeholder="e.g. Car Loan" />
                </div>
                <div>
                  <label style={lbl}>Type</label>
                  <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} style={inp}>
                    {["loan","insurance","penalty","other"].map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)}</option>)}
                  </select>
                </div>
                <div>
                  <label style={lbl}>Monthly Amount ($)</label>
                  <input required type="number" step="0.01" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} style={inp} placeholder="0.00" />
                </div>
                <div>
                  <label style={lbl}>Total Balance ($)</label>
                  <input type="number" step="0.01" value={form.balance} onChange={e => setForm(f => ({ ...f, balance: e.target.value }))} style={inp} placeholder="Optional" />
                </div>
                <div>
                  <label style={lbl}>Start Date</label>
                  <input required type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} style={inp} />
                </div>
                <div>
                  <label style={lbl}>End Date</label>
                  <input type="date" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} style={inp} />
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, paddingTop: 12, borderTop: "0.5px solid var(--border)" }}>
                <button type="button" onClick={() => setModal(null)} style={{ padding: "8px 16px", borderRadius: 8, border: "0.5px solid var(--border)", background: "var(--bg-card)", color: "var(--text-secondary)", fontSize: 12, fontWeight: 500, cursor: "pointer" }}>Cancel</button>
                <button type="submit" disabled={saving} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 18px", borderRadius: 8, background: "var(--accent)", color: "#fff", border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer", opacity: saving ? 0.7 : 1 }}>
                  {saving ? <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} /> : <Plus size={13} />} Add Deduction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </>
  );
}
