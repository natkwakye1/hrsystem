"use client";

import { useEffect, useState, useMemo } from "react";
import {
  CalendarDays, Clock, CheckCircle2, XCircle, Plus, Loader2,
  ChevronLeft, ChevronRight,
} from "lucide-react";
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

interface LeaveRequest {
  id: string;
  employeeId: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: string;
  employee: {
    firstName: string; lastName: string;
    department: string; employeeId: string;
  };
}

const STATUS_CONFIG: Record<string, { bg: string; color: string }> = {
  Pending:  { bg: BLUE[50],  color: BLUE[500] },
  Approved: { bg: BLUE[100], color: BLUE[700] },
  Rejected: { bg: BLUE[200], color: BLUE[900] },
};

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

const PAGE_SIZE = 15;

export default function LeavePage() {
  const [leaves,       setLeaves]       = useState<LeaveRequest[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [page,         setPage]         = useState(1);
  const [showModal,    setShowModal]    = useState(false);
  const [submitting,   setSubmitting]   = useState(false);
  const [employees,    setEmployees]    = useState<Array<{ id: string; firstName: string; lastName: string }>>([]);
  const [form, setForm] = useState({
    employeeId: "", leaveType: "Annual",
    startDate: "", endDate: "", days: 1, reason: "",
  });

  const fetchLeaves = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter) params.set("status", statusFilter);
    fetch(`/api/leave?${params}`)
      .then(r => r.json())
      .then(d => { setLeaves(d || []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchLeaves(); }, [statusFilter]);
  useEffect(() => { setPage(1); }, [statusFilter]);

  const totalPages = Math.max(1, Math.ceil(leaves.length / PAGE_SIZE));
  const paginated  = useMemo(() => leaves.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [leaves, page]);
  const startEntry = leaves.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const endEntry   = Math.min(page * PAGE_SIZE, leaves.length);

  useEffect(() => {
    fetch("/api/employees?limit=100")
      .then(r => r.json())
      .then(d => setEmployees(d.employees || []));
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/leave", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setShowModal(false);
        setForm({ employeeId: "", leaveType: "Annual", startDate: "", endDate: "", days: 1, reason: "" });
        fetchLeaves();
      }
    } finally { setSubmitting(false); }
  };

  const handleStatusUpdate = async (id: string, status: string) => {
    await fetch(`/api/leave/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    fetchLeaves();
  };

  const pending  = leaves.filter(l => l.status === "Pending").length;
  const approved = leaves.filter(l => l.status === "Approved").length;
  const rejected = leaves.filter(l => l.status === "Rejected").length;

  const columns = [
    {
      key: "employee",
      label: "Employee",
      render: (l: LeaveRequest) => (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <img
            src={getAvatar(l.employee.firstName, l.employee.lastName)}
            alt={`${l.employee.firstName} ${l.employee.lastName}`}
            style={{ width: 34, height: 34, borderRadius: "50%", flexShrink: 0, objectFit: "cover", border: "2px solid var(--border)" }}
          />
          <div>
            <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: "var(--text-primary)" }}>
              {l.employee.firstName} {l.employee.lastName}
            </p>
            <p style={{ margin: "1px 0 0", fontSize: 10, color: "var(--text-muted)" }}>{l.employee.department}</p>
          </div>
        </div>
      ),
    },
    {
      key: "leaveType",
      label: "Type",
      render: (l: LeaveRequest) => (
        <span style={{ fontSize: 12, fontWeight: 500, color: "var(--text-secondary)" }}>{l.leaveType}</span>
      ),
    },
    {
      key: "startDate",
      label: "Start",
      render: (l: LeaveRequest) => (
        <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{l.startDate}</span>
      ),
      className: "hidden md:table-cell",
    },
    {
      key: "endDate",
      label: "End",
      render: (l: LeaveRequest) => (
        <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{l.endDate}</span>
      ),
      className: "hidden md:table-cell",
    },
    {
      key: "days",
      label: "Days",
      render: (l: LeaveRequest) => (
        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{l.days}</span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (l: LeaveRequest) => {
        const s = STATUS_CONFIG[l.status] ?? { bg: "var(--bg-hover)", color: "var(--text-muted)" };
        return (
          <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 5, background: s.bg, color: s.color, letterSpacing: 0.2 }}>
            {l.status}
          </span>
        );
      },
    },
    {
      key: "actions",
      label: "Actions",
      render: (l: LeaveRequest) =>
        l.status === "Pending" ? (
          <div style={{ display: "flex", gap: 6 }}>
            <button
              onClick={e => { e.stopPropagation(); handleStatusUpdate(l.id, "Approved"); }}
              title="Approve"
              style={{ width: 28, height: 28, borderRadius: 7, border: `0.5px solid ${BLUE[200]}`, cursor: "pointer", background: BLUE[50], display: "flex", alignItems: "center", justifyContent: "center", color: BLUE[600], transition: "background 0.15s" }}
              onMouseEnter={e => (e.currentTarget.style.background = BLUE[100])}
              onMouseLeave={e => (e.currentTarget.style.background = BLUE[50])}
            >
              <CheckCircle2 size={13} />
            </button>
            <button
              onClick={e => { e.stopPropagation(); handleStatusUpdate(l.id, "Rejected"); }}
              title="Reject"
              style={{ width: 28, height: 28, borderRadius: 7, border: `0.5px solid ${BLUE[200]}`, cursor: "pointer", background: BLUE[50], display: "flex", alignItems: "center", justifyContent: "center", color: BLUE[400], transition: "background 0.15s" }}
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
        .leave-page * { font-family: 'DM Sans', sans-serif !important; }
        .add-btn:hover { opacity: 0.85; }
        .leave-page {
          --bg-card: #ffffff; --bg-hover: #f8fafc; --bg-input: #f8fafc;
          --border: rgba(0,0,0,0.08);
          --text-primary: #0f172a; --text-secondary: #64748b; --text-muted: #94a3b8;
        }
        @media (prefers-color-scheme: dark) {
          .leave-page {
            --bg-card: #0f172a; --bg-hover: #1e293b; --bg-input: #1e293b;
            --border: rgba(255,255,255,0.08);
            --text-primary: #f1f5f9; --text-secondary: #94a3b8; --text-muted: #475569;
          }
        }
      `}</style>

      <div className="leave-page" style={{ display: "flex", flexDirection: "column", gap: 20 }}>

        {/* Header */}
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 14 }}>
          <div>
            <p style={{ fontSize: 10, fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.07em", textTransform: "uppercase", margin: "0 0 3px" }}>HR Management</p>
            <h1 style={{ fontSize: 22, fontWeight: 600, color: "var(--text-primary)", margin: 0, letterSpacing: -0.5 }}>Leave Management</h1>
          </div>
          <button className="add-btn" onClick={() => setShowModal(true)} style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "9px 16px", borderRadius: 8, border: "none", background: BLUE[600], color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap", transition: "opacity 0.15s" }}>
            <Plus size={14} /> New Request
          </button>
        </div>

        {/* KPI row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16 }}>
          <KpiCard icon={CalendarDays} label="Total Requests" value={leaves.length} accentBg={BLUE[50]}  accentColor={BLUE[600]} />
          <KpiCard icon={Clock}        label="Pending"        value={pending}        accentBg={BLUE[50]}  accentColor={BLUE[500]} />
          <KpiCard icon={CheckCircle2} label="Approved"       value={approved}       accentBg={BLUE[100]} accentColor={BLUE[700]} />
          <KpiCard icon={XCircle}      label="Rejected"       value={rejected}       accentBg={BLUE[200]} accentColor={BLUE[900]} />
        </div>

        {/* Table */}
        <div style={{ ...cardBase, overflow: "hidden" }}>
          <div style={{ padding: "14px 20px", borderBottom: "0.5px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <p style={{ fontSize: 10, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", margin: "0 0 2px" }}>Records</p>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", margin: 0, letterSpacing: -0.2 }}>Leave Requests</h3>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <select
                value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                style={{ ...inp, width: "auto", padding: "6px 28px 6px 10px", fontSize: 11, cursor: "pointer", appearance: "none", backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 8px center" }}
              >
                <option value="">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
              <span style={{ fontSize: 10, fontWeight: 600, padding: "3px 9px", borderRadius: 5, background: BLUE[50], color: BLUE[600] }}>
                {leaves.length} record{leaves.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
          <Table columns={columns} data={paginated} loading={loading} emptyMessage="No leave requests found" />

          {/* Pagination footer */}
          {!loading && leaves.length > 0 && (
            <div style={{ padding: "12px 20px", borderTop: "0.5px solid var(--border)", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
              <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: 0 }}>
                Showing <strong>{startEntry}–{endEntry}</strong> of <strong>{leaves.length}</strong> records
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  style={{ width: 32, height: 32, borderRadius: 8, border: "0.5px solid var(--border)", background: "var(--bg-card)", color: page === 1 ? "var(--text-muted)" : "var(--text-primary)", cursor: page === 1 ? "not-allowed" : "pointer", opacity: page === 1 ? 0.45 : 1, display: "flex", alignItems: "center", justifyContent: "center" }}
                >
                  <ChevronLeft size={14} />
                </button>

                {(() => {
                  const items: (number | "...")[] = [];
                  if (totalPages <= 5) {
                    for (let i = 1; i <= totalPages; i++) items.push(i);
                  } else {
                    items.push(1);
                    if (page > 3) items.push("...");
                    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) items.push(i);
                    if (page < totalPages - 2) items.push("...");
                    items.push(totalPages);
                  }
                  return items.map((item, i) =>
                    item === "..." ? (
                      <span key={`d${i}`} style={{ width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "var(--text-muted)" }}>…</span>
                    ) : (
                      <button
                        key={item}
                        onClick={() => setPage(item as number)}
                        style={{ width: 32, height: 32, borderRadius: 8, border: page === item ? `0.5px solid ${BLUE[400]}` : "0.5px solid transparent", background: page === item ? BLUE[50] : "transparent", color: page === item ? BLUE[600] : "var(--text-secondary)", fontSize: 12, fontWeight: page === item ? 600 : 400, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s" }}
                      >
                        {item}
                      </button>
                    )
                  );
                })()}

                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  style={{ width: 32, height: 32, borderRadius: 8, border: "0.5px solid var(--border)", background: "var(--bg-card)", color: page === totalPages ? "var(--text-muted)" : "var(--text-primary)", cursor: page === totalPages ? "not-allowed" : "pointer", opacity: page === totalPages ? 0.45 : 1, display: "flex", alignItems: "center", justifyContent: "center" }}
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal */}
        <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="New leave request" size="md">
          <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={lbl}>Employee <span style={{ color: BLUE[500] }}>*</span></label>
              <select required value={form.employeeId} onChange={e => setForm({ ...form, employeeId: e.target.value })} style={inp}>
                <option value="">Select employee</option>
                {employees.map(e => <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl}>Leave Type</label>
              <select value={form.leaveType} onChange={e => setForm({ ...form, leaveType: e.target.value })} style={inp}>
                {["Annual", "Sick", "Personal", "Maternity", "Paternity"].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={lbl}>Start Date <span style={{ color: BLUE[500] }}>*</span></label>
                <input required type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} style={inp} />
              </div>
              <div>
                <label style={lbl}>End Date <span style={{ color: BLUE[500] }}>*</span></label>
                <input required type="date" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} style={inp} />
              </div>
            </div>
            <div>
              <label style={lbl}>Days <span style={{ color: BLUE[500] }}>*</span></label>
              <input required type="number" min="1" value={form.days} onChange={e => setForm({ ...form, days: parseInt(e.target.value) })} style={inp} />
            </div>
            <div>
              <label style={lbl}>Reason</label>
              <textarea value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} rows={3} style={{ ...inp, resize: "none" }} />
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, paddingTop: 12, borderTop: "0.5px solid var(--border)" }}>
              <button type="button" onClick={() => setShowModal(false)} style={{ padding: "8px 16px", borderRadius: 8, border: "0.5px solid var(--border)", background: "var(--bg-hover)", color: "var(--text-secondary)", fontSize: 12, fontWeight: 500, cursor: "pointer" }}>
                Cancel
              </button>
              <button type="submit" disabled={submitting} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 8, border: "none", background: BLUE[600], color: "#fff", fontSize: 12, fontWeight: 600, cursor: submitting ? "not-allowed" : "pointer", opacity: submitting ? 0.7 : 1, transition: "opacity 0.15s" }}>
                {submitting && <Loader2 size={13} className="animate-spin" />}
                Submit Request
              </button>
            </div>
          </form>
        </Modal>

      </div>
    </>
  );
}