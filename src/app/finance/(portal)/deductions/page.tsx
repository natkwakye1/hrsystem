"use client";

import { useEffect, useState, useMemo } from "react";
import { Plus, X, Loader2, MinusCircle, Trash2, Search, Filter, ToggleLeft, ToggleRight, ChevronLeft, ChevronRight } from "lucide-react";

const BLUE = {
  900: "#1e3a8a", 700: "#1d4ed8", 600: "#2563eb", 500: "#3b82f6",
  200: "#bfdbfe", 100: "#dbeafe", 50: "#eff6ff",
};

const cardBase: React.CSSProperties = {
  background: "var(--bg-card)", borderRadius: 14, border: "0.5px solid var(--border)",
};
const inp: React.CSSProperties = {
  width: "100%", padding: "9px 12px", borderRadius: 8,
  border: "0.5px solid var(--border)", background: "var(--bg-input)",
  color: "var(--text-primary)", fontSize: 13, outline: "none", fontFamily: "inherit", boxSizing: "border-box" as const,
};
const lbl: React.CSSProperties = {
  display: "block", fontSize: 10, fontWeight: 600, color: "var(--text-muted)",
  letterSpacing: "0.07em", textTransform: "uppercase" as const, marginBottom: 5,
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

type ViewMode = "table" | "cards";

const PAGE_SIZE = 10;

export default function FinanceDeductionsPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [modal,     setModal]     = useState<string | null>(null);
  const [saving,    setSaving]    = useState(false);
  const [deleting,  setDeleting]  = useState<string | null>(null);
  const [search,    setSearch]    = useState("");
  const [typeFilter,setTypeFilter]= useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [view,      setView]      = useState<ViewMode>("table");
  const [page,      setPage]      = useState(1);
  const [form, setForm] = useState({ name: "", type: "loan", amount: "", balance: "", startDate: "", endDate: "" });

  const load = () => {
    fetch("/api/employees")
      .then(r => r.json())
      .then(async (emps: Employee[]) => {
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
  useEffect(() => { setPage(1); }, [search, typeFilter, statusFilter]);

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

  const handleDelete = async (empId: string, deductionId: string) => {
    setDeleting(deductionId);
    try {
      await fetch(`/api/employees/${empId}/deductions/${deductionId}`, { method: "DELETE" });
      setEmployees(prev => prev.map(e => e.id === empId
        ? { ...e, employeeDeductions: e.employeeDeductions.filter(d => d.id !== deductionId) }
        : e
      ));
    } finally { setDeleting(null); }
  };

  const handleToggle = async (empId: string, d: EmployeeDeduction) => {
    const newStatus = d.status === "Active" ? "Inactive" : "Active";
    await fetch(`/api/employees/${empId}/deductions/${d.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    setEmployees(prev => prev.map(e => e.id === empId
      ? { ...e, employeeDeductions: e.employeeDeductions.map(x => x.id === d.id ? { ...x, status: newStatus } : x) }
      : e
    ));
  };

  const allDeductions = useMemo(() =>
    employees.flatMap(e => e.employeeDeductions.map(d => ({ ...d, employee: e }))),
    [employees]);

  const filtered = useMemo(() =>
    allDeductions.filter(d => {
      const name = `${d.employee.firstName} ${d.employee.lastName}`.toLowerCase();
      const matchSearch = !search || name.includes(search.toLowerCase()) || d.name.toLowerCase().includes(search.toLowerCase());
      const matchType   = !typeFilter   || d.type === typeFilter;
      const matchStatus = !statusFilter || d.status === statusFilter;
      return matchSearch && matchType && matchStatus;
    }),
    [allDeductions, search, typeFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const startEntry = filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const endEntry   = Math.min(page * PAGE_SIZE, filtered.length);

  const totalDeductions = allDeductions.reduce((s, d) => s + d.amount, 0);
  const activeCount     = allDeductions.filter(d => d.status === "Active").length;

  if (loading) return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}} @keyframes shimmer{0%{background-position:-300% 0}100%{background-position:300% 0}}`}</style>
      {[80, 64, 380].map((h, i) => (
        <div key={i} style={{ height: h, borderRadius: 14, background: "linear-gradient(90deg, var(--border) 25%, var(--bg-hover) 50%, var(--border) 75%)", backgroundSize: "300% 100%", animation: "shimmer 1.5s infinite" }} />
      ))}
    </div>
  );

  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.07em", textTransform: "uppercase", margin: "0 0 3px" }}>Finance Portal</p>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", margin: 0, letterSpacing: -0.4 }}>Deductions Management</h1>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {/* View toggle */}
            <div style={{ display: "flex", border: "0.5px solid var(--border)", borderRadius: 8, overflow: "hidden" }}>
              {(["table", "cards"] as ViewMode[]).map(v => (
                <button key={v} onClick={() => setView(v)} style={{ padding: "6px 14px", fontSize: 11, fontWeight: 600, border: "none", cursor: "pointer", background: view === v ? "var(--accent)" : "var(--bg-card)", color: view === v ? "#fff" : "var(--text-secondary)", textTransform: "capitalize" }}>
                  {v}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 14 }}>
          {[
            { label: "Total Deductions",   value: allDeductions.length },
            { label: "Active",             value: activeCount },
            { label: "Monthly Impact",     value: `$${allDeductions.filter(d => d.status === "Active").reduce((s, d) => s + d.amount, 0).toLocaleString()}` },
            { label: "Employees Affected", value: employees.filter(e => e.employeeDeductions.length > 0).length },
            { label: "Avg per Employee",   value: employees.filter(e => e.employeeDeductions.length > 0).length > 0 ? `$${Math.round(totalDeductions / employees.filter(e => e.employeeDeductions.length > 0).length).toLocaleString()}` : "$0" },
          ].map(s => (
            <div key={s.label} style={{ ...cardBase, padding: "16px 18px" }}>
              <p style={{ fontSize: 10, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", margin: "0 0 6px" }}>{s.label}</p>
              <p style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Table / Cards view */}
        <div style={{ ...cardBase, overflow: "hidden" }}>
          {/* Filter bar */}
          <div style={{ padding: "14px 20px", borderBottom: "0.5px solid var(--border)", display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <Filter size={14} style={{ color: "var(--text-muted)" }} />
            <div style={{ position: "relative" }}>
              <Search size={12} style={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none" }} />
              <input placeholder="Search employee or deduction..." value={search} onChange={e => setSearch(e.target.value)}
                style={{ padding: "7px 10px 7px 26px", borderRadius: 7, border: "0.5px solid var(--border)", background: "var(--bg-input)", color: "var(--text-primary)", fontSize: 12, outline: "none", width: 220 }} />
            </div>
            <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
              style={{ padding: "7px 10px", borderRadius: 7, border: "0.5px solid var(--border)", background: "var(--bg-input)", color: "var(--text-primary)", fontSize: 12, outline: "none" }}>
              <option value="">All Types</option>
              {["loan","insurance","penalty","other"].map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)}</option>)}
            </select>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
              style={{ padding: "7px 10px", borderRadius: 7, border: "0.5px solid var(--border)", background: "var(--bg-input)", color: "var(--text-primary)", fontSize: 12, outline: "none" }}>
              <option value="">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
            <span style={{ fontSize: 11, color: "var(--text-muted)", marginLeft: "auto" }}>{filtered.length} deduction{filtered.length !== 1 ? "s" : ""}</span>
            <button onClick={() => setModal(employees[0]?.id ?? null)}
              style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 14px", borderRadius: 7, background: "var(--accent)", color: "#fff", border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
              <Plus size={12} /> Add Deduction
            </button>
          </div>

          {view === "table" ? (
            <>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: "var(--bg-body)" }}>
                      {["Employee", "Deduction", "Type", "Monthly", "Balance", "Start Date", "Status", "Actions"].map(h => (
                        <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: 10, fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.07em", textTransform: "uppercase", whiteSpace: "nowrap" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 ? (
                      <tr><td colSpan={8} style={{ padding: 40, textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>
                        <MinusCircle size={28} style={{ display: "block", margin: "0 auto 8px", opacity: 0.4 }} />
                        No deductions found
                      </td></tr>
                    ) : paginated.map((d, i) => {
                      const tc = TYPE_COLOR[d.type] ?? TYPE_COLOR.other;
                      return (
                        <tr key={d.id} style={{ borderTop: "0.5px solid var(--border)", background: i % 2 === 0 ? "var(--bg-card)" : "var(--bg-body)" }}>
                          <td style={{ padding: "11px 14px" }}>
                            <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)", margin: "0 0 1px" }}>{d.employee.firstName} {d.employee.lastName}</p>
                            <p style={{ fontSize: 10, color: "var(--text-muted)", margin: 0 }}>{d.employee.employeeId}</p>
                          </td>
                          <td style={{ padding: "11px 14px" }}>
                            <p style={{ fontSize: 12, fontWeight: 500, color: "var(--text-primary)", margin: 0 }}>{d.name}</p>
                          </td>
                          <td style={{ padding: "11px 14px" }}>
                            <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 9px", borderRadius: 5, background: tc.bg, color: tc.color }}>{d.type}</span>
                          </td>
                          <td style={{ padding: "11px 14px", fontSize: 12, fontWeight: 600, color: "var(--accent)" }}>${d.amount.toLocaleString()}</td>
                          <td style={{ padding: "11px 14px", fontSize: 12, color: "var(--text-secondary)" }}>{d.balance ? `$${d.balance.toLocaleString()}` : "—"}</td>
                          <td style={{ padding: "11px 14px", fontSize: 11, color: "var(--text-secondary)", whiteSpace: "nowrap" }}>{d.startDate}</td>
                          <td style={{ padding: "11px 14px" }}>
                            <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 9px", borderRadius: 5, background: d.status === "Active" ? BLUE[100] : "var(--bg-hover)", color: d.status === "Active" ? BLUE[700] : "var(--text-muted)" }}>{d.status}</span>
                          </td>
                          <td style={{ padding: "11px 14px" }}>
                            <div style={{ display: "flex", gap: 6 }}>
                              <button onClick={() => handleToggle(d.employee.id, d)} title={d.status === "Active" ? "Deactivate" : "Activate"}
                                style={{ padding: "5px 8px", borderRadius: 6, border: "0.5px solid var(--border)", background: "var(--bg-body)", cursor: "pointer", color: "var(--text-secondary)", display: "flex", alignItems: "center" }}>
                                {d.status === "Active" ? <ToggleRight size={14} style={{ color: "var(--accent)" }} /> : <ToggleLeft size={14} />}
                              </button>
                              <button onClick={() => handleDelete(d.employee.id, d.id)} disabled={deleting === d.id}
                                style={{ padding: "5px 8px", borderRadius: 6, border: "0.5px solid var(--border)", background: "var(--bg-body)", cursor: "pointer", color: "var(--danger)", display: "flex", alignItems: "center", opacity: deleting === d.id ? 0.5 : 1 }}>
                                {deleting === d.id ? <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} /> : <Trash2 size={13} />}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {/* Pagination */}
              {filtered.length > 0 && (
                <div style={{ padding: "12px 20px", borderTop: "0.5px solid var(--border)", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                  <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: 0 }}>
                    Showing <strong>{startEntry}–{endEntry}</strong> of <strong>{filtered.length}</strong> deductions
                  </p>
                  {totalPages > 1 && (
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                        style={{ width: 30, height: 30, borderRadius: 7, border: "0.5px solid var(--border)", background: "var(--bg-card)", cursor: page === 1 ? "not-allowed" : "pointer", opacity: page === 1 ? 0.45 : 1, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-primary)" }}>
                        <ChevronLeft size={13} />
                      </button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                        <button key={n} onClick={() => setPage(n)}
                          style={{ width: 30, height: 30, borderRadius: 7, border: page === n ? `0.5px solid ${BLUE[500]}` : "0.5px solid transparent", background: page === n ? BLUE[50] : "transparent", color: page === n ? BLUE[600] : "var(--text-secondary)", fontSize: 12, fontWeight: page === n ? 600 : 400, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          {n}
                        </button>
                      ))}
                      <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                        style={{ width: 30, height: 30, borderRadius: 7, border: "0.5px solid var(--border)", background: "var(--bg-card)", cursor: page === totalPages ? "not-allowed" : "pointer", opacity: page === totalPages ? 0.45 : 1, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-primary)" }}>
                        <ChevronRight size={13} />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            /* Cards view: by employee */
            <div style={{ padding: "14px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
              {employees.filter(emp => {
                if (!search) return emp.employeeDeductions.length > 0;
                const name = `${emp.firstName} ${emp.lastName}`.toLowerCase();
                return name.includes(search.toLowerCase()) || emp.employeeDeductions.some(d => d.name.toLowerCase().includes(search.toLowerCase()));
              }).map(emp => (
                <div key={emp.id} style={{ ...cardBase, overflow: "hidden" }}>
                  <div style={{ padding: "12px 16px", borderBottom: "0.5px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
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
                      <button onClick={() => setModal(emp.id)}
                        style={{ display: "flex", alignItems: "center", gap: 4, padding: "5px 10px", borderRadius: 7, background: "var(--accent)", color: "#fff", border: "none", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>
                        <Plus size={11} /> Add
                      </button>
                    </div>
                  </div>
                  {emp.employeeDeductions.length === 0 ? (
                    <p style={{ fontSize: 12, color: "var(--text-muted)", padding: "10px 16px", margin: 0 }}>No deductions assigned</p>
                  ) : (
                    <div style={{ padding: "10px 16px", display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {emp.employeeDeductions.map(d => {
                        const tc = TYPE_COLOR[d.type] ?? TYPE_COLOR.other;
                        return (
                          <div key={d.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 10px", borderRadius: 8, background: tc.bg, border: `0.5px solid ${tc.bg}`, opacity: d.status === "Inactive" ? 0.55 : 1 }}>
                            <MinusCircle size={11} style={{ color: tc.color }} />
                            <div>
                              <p style={{ fontSize: 11, fontWeight: 600, color: tc.color, margin: 0 }}>{d.name}</p>
                              <p style={{ fontSize: 9.5, color: tc.color, opacity: 0.8, margin: 0 }}>{d.type} · ${d.amount}/mo · {d.status}</p>
                            </div>
                            <div style={{ display: "flex", gap: 4, marginLeft: 4 }}>
                              <button onClick={() => handleToggle(emp.id, d)} title="Toggle status"
                                style={{ background: "none", border: "none", cursor: "pointer", color: tc.color, opacity: 0.7, padding: 2, display: "flex" }}>
                                {d.status === "Active" ? <ToggleRight size={13} /> : <ToggleLeft size={13} />}
                              </button>
                              <button onClick={() => handleDelete(emp.id, d.id)} disabled={deleting === d.id}
                                style={{ background: "none", border: "none", cursor: "pointer", color: tc.color, opacity: 0.7, padding: 2, display: "flex" }}>
                                {deleting === d.id ? <Loader2 size={11} style={{ animation: "spin 1s linear infinite" }} /> : <X size={11} />}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add deduction modal */}
      {modal && (
        <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.45)", padding: 20 }}>
          <div style={{ background: "var(--bg-card)", borderRadius: 16, width: "100%", maxWidth: 480, boxShadow: "var(--shadow-xl)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 24px", borderBottom: "0.5px solid var(--border)" }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>Add Deduction</h3>
                <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "2px 0 0" }}>
                  {employees.find(e => e.id === modal)?.firstName} {employees.find(e => e.id === modal)?.lastName}
                </p>
              </div>
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
              {/* Employee selector in modal */}
              <div>
                <label style={lbl}>Apply To</label>
                <select value={modal} onChange={e => setModal(e.target.value)} style={inp}>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName} ({emp.employeeId})</option>
                  ))}
                </select>
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
