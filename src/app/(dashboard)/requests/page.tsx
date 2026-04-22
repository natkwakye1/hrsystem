"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Inbox, CheckCircle2, XCircle, Clock, Loader2, X, DollarSign,
  ChevronLeft, ChevronRight,
} from "lucide-react";

const PAGE_SIZE = 15;
import Table from "@/components/Table";
import Modal from "@/components/Modal";

const FONT_URL =
  "https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&display=swap";

const BLUE = {
  900: "#1e3a8a", 700: "#1d4ed8", 600: "#2563eb",
  500: "#3b82f6", 400: "#60a5fa", 300: "#93c5fd",
  200: "#bfdbfe", 100: "#dbeafe", 50:  "#eff6ff",
};

const AVATAR_POOL = [
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=80&q=80&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=80&q=80&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=80&q=80&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&q=80&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&q=80&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&q=80&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&q=80&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&q=80&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&q=80&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?w=80&q=80&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=80&q=80&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=80&q=80&fit=crop&crop=face",
];

function getAvatar(firstName: string, lastName: string): string {
  const key = (firstName[0] + lastName[0]).toUpperCase();
  let hash = 0;
  for (let i = 0; i < key.length; i++) hash = key.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_POOL[Math.abs(hash) % AVATAR_POOL.length];
}

interface Employee { firstName: string; lastName: string; employeeId: string; department?: string; }
interface EmployeeRequest {
  id: string; type: string; subject: string; description?: string;
  amount?: number; status: string; reviewNote?: string;
  createdAt: string; employee: Employee;
}

const STATUS_CONFIG: Record<string, { bg: string; color: string }> = {
  Pending:  { bg: BLUE[50],  color: BLUE[500]  },
  Approved: { bg: BLUE[100], color: BLUE[700]  },
  Rejected: { bg: BLUE[200], color: BLUE[900]  },
};

const cardBase: React.CSSProperties = {
  background: "var(--bg-card)", borderRadius: 14, border: "0.5px solid var(--border)",
};

const inp: React.CSSProperties = {
  width: "100%", padding: "9px 12px", borderRadius: 8,
  border: "0.5px solid var(--border)", background: "var(--bg-input)",
  color: "var(--text-primary)", fontSize: 12, outline: "none",
  fontFamily: "'DM Sans', sans-serif", boxSizing: "border-box" as const,
};

const lbl: React.CSSProperties = {
  display: "block", fontSize: 10, fontWeight: 600,
  color: "var(--text-muted)", letterSpacing: "0.07em",
  textTransform: "uppercase", marginBottom: 5,
};

function KpiCard({
  icon: Icon, label, value, accentBg, accentColor,
}: {
  icon: React.ElementType; label: string; value: number | string;
  accentBg: string; accentColor: string;
}) {
  return (
    <div style={{ ...cardBase, padding: "16px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ width: 34, height: 34, borderRadius: 8, background: accentBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon size={15} color={accentColor} strokeWidth={2} />
      </div>
      <div>
        <p style={{ fontSize: 10, fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.07em", textTransform: "uppercase", margin: "0 0 3px" }}>
          {label}
        </p>
        <p style={{ fontSize: 26, fontWeight: 600, letterSpacing: -1, margin: 0, lineHeight: 1, color: "var(--text-primary)" }}>
          {value}
        </p>
      </div>
    </div>
  );
}

export default function AdminRequestsPage() {
  const [requests,  setRequests]  = useState<EmployeeRequest[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [statusF,   setStatusF]   = useState("");
  const [typeF,     setTypeF]     = useState("");
  const [updating,  setUpdating]  = useState<string | null>(null);
  const [modal,     setModal]     = useState<EmployeeRequest | null>(null);
  const [note,      setNote]      = useState("");
  const [action,    setAction]    = useState<"Approved" | "Rejected">("Approved");
  const [page,      setPage]      = useState(1);

  const load = (s = statusF, t = typeF) => {
    setLoading(true);
    const q = new URLSearchParams();
    if (s) q.set("status", s);
    if (t) q.set("type", t);
    fetch(`/api/requests?${q}`)
      .then(r => r.json())
      .then(d => { setRequests(d.requests ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);
  useEffect(() => { setPage(1); }, [statusF, typeF]);

  const totalPages = Math.max(1, Math.ceil(requests.length / PAGE_SIZE));
  const paginated  = useMemo(() => requests.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [requests, page]);
  const startEntry = requests.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const endEntry   = Math.min(page * PAGE_SIZE, requests.length);

  const openReview = (req: EmployeeRequest, act: "Approved" | "Rejected") => {
    setModal(req); setAction(act); setNote("");
  };

  const submitReview = async () => {
    if (!modal) return;
    setUpdating(modal.id);
    await fetch(`/api/requests/${modal.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: action, reviewNote: note, reviewedBy: "admin@nera.com" }),
    });
    setRequests(prev =>
      prev.map(r => r.id === modal.id ? { ...r, status: action, reviewNote: note } : r)
    );
    setUpdating(null); setModal(null);
  };

  const pending  = requests.filter(r => r.status === "Pending").length;
  const approved = requests.filter(r => r.status === "Approved").length;
  const rejected = requests.filter(r => r.status === "Rejected").length;

  const types = ["Salary Advance", "Loan", "Payroll Correction", "Document Request", "Other"];

  const columns = [
    {
      key: "employee",
      label: "Employee",
      render: (r: EmployeeRequest) => (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <img
            src={getAvatar(r.employee.firstName, r.employee.lastName)}
            alt=""
            style={{ width: 34, height: 34, borderRadius: "50%", objectFit: "cover", border: "2px solid var(--border)", flexShrink: 0 }}
          />
          <div>
            <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: "var(--text-primary)" }}>
              {r.employee.firstName} {r.employee.lastName}
            </p>
            <p style={{ margin: "1px 0 0", fontSize: 10, color: "var(--text-muted)" }}>
              {r.employee.department || r.employee.employeeId}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "type",
      label: "Type",
      render: (r: EmployeeRequest) => (
        <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 9px", borderRadius: 5, background: BLUE[50], color: BLUE[600] }}>
          {r.type}
        </span>
      ),
    },
    {
      key: "subject",
      label: "Subject",
      render: (r: EmployeeRequest) => (
        <div>
          <p style={{ margin: 0, fontSize: 12, fontWeight: 500, color: "var(--text-primary)", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.subject}</p>
          {r.reviewNote && (
            <p style={{ margin: "2px 0 0", fontSize: 10, color: "var(--text-muted)", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              Note: {r.reviewNote}
            </p>
          )}
        </div>
      ),
    },
    {
      key: "amount",
      label: "Amount",
      render: (r: EmployeeRequest) => (
        <span style={{ fontSize: 12, fontWeight: 600, color: r.amount ? BLUE[600] : "var(--text-muted)" }}>
          {r.amount ? `$${r.amount.toLocaleString()}` : "—"}
        </span>
      ),
    },
    {
      key: "createdAt",
      label: "Date",
      render: (r: EmployeeRequest) => (
        <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>
          {new Date(r.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (r: EmployeeRequest) => {
        const s = STATUS_CONFIG[r.status] ?? STATUS_CONFIG.Pending;
        return (
          <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 5, background: s.bg, color: s.color, letterSpacing: 0.2 }}>
            {r.status}
          </span>
        );
      },
    },
    {
      key: "actions",
      label: "Actions",
      render: (r: EmployeeRequest) =>
        r.status === "Pending" ? (
          <div style={{ display: "flex", gap: 6 }}>
            <button
              onClick={e => { e.stopPropagation(); openReview(r, "Approved"); }}
              disabled={updating === r.id}
              title="Approve"
              style={{ width: 28, height: 28, borderRadius: 7, border: `0.5px solid ${BLUE[200]}`, cursor: "pointer", background: BLUE[50], display: "flex", alignItems: "center", justifyContent: "center", color: BLUE[600] }}
              onMouseEnter={e => (e.currentTarget.style.background = BLUE[100])}
              onMouseLeave={e => (e.currentTarget.style.background = BLUE[50])}
            >
              <CheckCircle2 size={13} />
            </button>
            <button
              onClick={e => { e.stopPropagation(); openReview(r, "Rejected"); }}
              disabled={updating === r.id}
              title="Reject"
              style={{ width: 28, height: 28, borderRadius: 7, border: `0.5px solid ${BLUE[200]}`, cursor: "pointer", background: BLUE[50], display: "flex", alignItems: "center", justifyContent: "center", color: BLUE[400] }}
              onMouseEnter={e => (e.currentTarget.style.background = BLUE[100])}
              onMouseLeave={e => (e.currentTarget.style.background = BLUE[50])}
            >
              <XCircle size={13} />
            </button>
          </div>
        ) : null,
    },
  ];

  return (
    <>
      <style>{`
        @import url('${FONT_URL}');
        .req-page * { font-family: 'DM Sans', sans-serif !important; }
        .req-page {
          --bg-card: #ffffff; --bg-hover: #f8fafc; --bg-input: #f8fafc;
          --border: rgba(0,0,0,0.08);
          --text-primary: #0f172a; --text-secondary: #64748b; --text-muted: #94a3b8;
        }
        @media (prefers-color-scheme: dark) {
          .req-page {
            --bg-card: #0f172a; --bg-hover: #1e293b; --bg-input: #1e293b;
            --border: rgba(255,255,255,0.08);
            --text-primary: #f1f5f9; --text-secondary: #94a3b8; --text-muted: #475569;
          }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div className="req-page" style={{ display: "flex", flexDirection: "column", gap: 20 }}>

        {/* Header */}
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 14 }}>
          <div>
            <p style={{ fontSize: 10, fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.07em", textTransform: "uppercase", margin: "0 0 3px" }}>HR Management</p>
            <h1 style={{ fontSize: 22, fontWeight: 600, color: "var(--text-primary)", margin: 0, letterSpacing: -0.5 }}>Employee Requests</h1>
          </div>
        </div>

        {/* KPI row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16 }}>
          <KpiCard icon={Inbox}        label="Total Requests" value={requests.length} accentBg={BLUE[50]}  accentColor={BLUE[600]} />
          <KpiCard icon={Clock}        label="Pending"        value={pending}          accentBg={BLUE[50]}  accentColor={BLUE[500]} />
          <KpiCard icon={CheckCircle2} label="Approved"       value={approved}         accentBg={BLUE[100]} accentColor={BLUE[700]} />
          <KpiCard icon={XCircle}      label="Rejected"       value={rejected}         accentBg={BLUE[200]} accentColor={BLUE[900]} />
        </div>

        {/* Table card */}
        <div style={{ ...cardBase, overflow: "hidden" }}>
          <div style={{ padding: "14px 20px", borderBottom: "0.5px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
            <div>
              <p style={{ fontSize: 10, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", margin: "0 0 2px" }}>Records</p>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", margin: 0, letterSpacing: -0.2 }}>All Requests</h3>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <select
                value={statusF} onChange={e => { setStatusF(e.target.value); load(e.target.value, typeF); }}
                style={{ ...inp, width: "auto", padding: "6px 28px 6px 10px", fontSize: 11, cursor: "pointer", appearance: "none", backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 8px center" }}
              >
                <option value="">All Status</option>
                <option>Pending</option><option>Approved</option><option>Rejected</option>
              </select>
              <select
                value={typeF} onChange={e => { setTypeF(e.target.value); load(statusF, e.target.value); }}
                style={{ ...inp, width: "auto", padding: "6px 28px 6px 10px", fontSize: 11, cursor: "pointer", appearance: "none", backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 8px center" }}
              >
                <option value="">All Types</option>
                {types.map(t => <option key={t}>{t}</option>)}
              </select>
              <span style={{ fontSize: 10, fontWeight: 600, padding: "3px 9px", borderRadius: 5, background: BLUE[50], color: BLUE[600] }}>
                {requests.length} records
              </span>
            </div>
          </div>
          <Table columns={columns} data={paginated} loading={loading} emptyMessage="No employee requests found" />

          {!loading && requests.length > 0 && (
            <div style={{ padding: "12px 20px", borderTop: "0.5px solid var(--border)", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
              <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: 0 }}>
                Showing <strong>{startEntry}–{endEntry}</strong> of <strong>{requests.length}</strong> records
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  style={{ width: 32, height: 32, borderRadius: 8, border: "0.5px solid var(--border)", background: "var(--bg-card)", color: page === 1 ? "var(--text-muted)" : "var(--text-primary)", cursor: page === 1 ? "not-allowed" : "pointer", opacity: page === 1 ? 0.45 : 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <ChevronLeft size={14} />
                </button>
                {(() => {
                  const items: (number | "...")[] = [];
                  if (totalPages <= 5) { for (let i = 1; i <= totalPages; i++) items.push(i); }
                  else {
                    items.push(1);
                    if (page > 3) items.push("...");
                    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) items.push(i);
                    if (page < totalPages - 2) items.push("...");
                    items.push(totalPages);
                  }
                  return items.map((item, i) => item === "..." ? (
                    <span key={`d${i}`} style={{ width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "var(--text-muted)" }}>…</span>
                  ) : (
                    <button key={item} onClick={() => setPage(item as number)}
                      style={{ width: 32, height: 32, borderRadius: 8, border: page === item ? `0.5px solid ${BLUE[400]}` : "0.5px solid transparent", background: page === item ? BLUE[50] : "transparent", color: page === item ? BLUE[600] : "var(--text-secondary)", fontSize: 12, fontWeight: page === item ? 600 : 400, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {item}
                    </button>
                  ));
                })()}
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  style={{ width: 32, height: 32, borderRadius: 8, border: "0.5px solid var(--border)", background: "var(--bg-card)", color: page === totalPages ? "var(--text-muted)" : "var(--text-primary)", cursor: page === totalPages ? "not-allowed" : "pointer", opacity: page === totalPages ? 0.45 : 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Review modal */}
      <Modal isOpen={!!modal} onClose={() => setModal(null)} title={`${action === "Approved" ? "Approve" : "Reject"} Request`} size="md">
        {modal && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ padding: "12px 14px", borderRadius: 10, background: "var(--bg-hover)", border: "0.5px solid var(--border)" }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", margin: "0 0 4px" }}>{modal.subject}</p>
              <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "0 0 2px" }}>
                {modal.type} · {modal.employee.firstName} {modal.employee.lastName}
              </p>
              {modal.amount != null && (
                <p style={{ fontSize: 14, fontWeight: 700, color: BLUE[600], margin: "4px 0 0" }}>
                  <DollarSign size={12} style={{ display: "inline", marginRight: 2 }} />
                  {modal.amount.toLocaleString()}
                </p>
              )}
              {modal.description && (
                <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: "8px 0 0", lineHeight: 1.5 }}>{modal.description}</p>
              )}
            </div>
            <div>
              <label style={lbl}>Review Note (optional)</label>
              <textarea
                value={note} onChange={e => setNote(e.target.value)}
                rows={3} placeholder="Add a note for the employee..."
                style={{ ...inp, resize: "none" }}
              />
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, paddingTop: 12, borderTop: "0.5px solid var(--border)" }}>
              <button type="button" onClick={() => setModal(null)} style={{ padding: "8px 16px", borderRadius: 8, border: "0.5px solid var(--border)", background: "var(--bg-hover)", color: "var(--text-secondary)", fontSize: 12, fontWeight: 500, cursor: "pointer" }}>
                Cancel
              </button>
              <button
                onClick={submitReview} disabled={updating === modal.id}
                style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 8, border: "none", fontSize: 12, fontWeight: 600, cursor: updating === modal.id ? "not-allowed" : "pointer", opacity: updating === modal.id ? 0.7 : 1, color: "#fff", background: action === "Approved" ? BLUE[600] : "#ef4444" }}
              >
                {updating === modal.id
                  ? <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} />
                  : action === "Approved" ? <CheckCircle2 size={13} /> : <XCircle size={13} />
                }
                Confirm {action}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
