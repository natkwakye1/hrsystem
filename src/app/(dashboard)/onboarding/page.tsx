"use client";

import { useEffect, useState, useMemo } from "react";
import { UserPlus, CheckCircle2, Clock, Circle, ChevronLeft, ChevronRight } from "lucide-react";

const PAGE_SIZE = 15;

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
   Avatar pool
───────────────────────────────────────── */
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

/* ─────────────────────────────────────────
   Types
───────────────────────────────────────── */
interface OnboardingTask { name: string; completed: boolean; }

interface OnboardingRecord {
  id: string; employeeId: string; status: string;
  startDate: string; completedAt: string;
  tasks: string; progress: number;
  employee: {
    firstName: string; lastName: string;
    department: string; position: string; employeeId: string;
  };
}

const STATUS_CONFIG: Record<string, { bg: string; color: string }> = {
  Completed:    { bg: BLUE[100], color: BLUE[700] },
  "In Progress": { bg: BLUE[50],  color: BLUE[500] },
};

/* ─────────────────────────────────────────
   KPI mini-card
───────────────────────────────────────── */
function KpiCard({
  icon: Icon, label, value, accentBg, accentColor,
}: {
  icon: React.ElementType; label: string; value: number;
  accentBg: string; accentColor: string;
}) {
  return (
    <div style={{ background: "var(--bg-card)", borderRadius: 14, border: "0.5px solid var(--border)", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ width: 34, height: 34, borderRadius: 8, background: accentBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon size={15} color={accentColor} strokeWidth={2} />
      </div>
      <div>
        <p style={{ fontSize: 10, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", margin: "0 0 3px" }}>{label}</p>
        <p style={{ fontSize: 26, fontWeight: 600, letterSpacing: -1, margin: 0, lineHeight: 1, color: "var(--text-primary)" }}>{value}</p>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   Page
───────────────────────────────────────── */
export default function OnboardingPage() {
  const [records, setRecords] = useState<OnboardingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [page,    setPage]    = useState(1);

  const fetchData = () => {
    setLoading(true);
    fetch("/api/onboarding")
      .then(r => r.json())
      .then(d => { setRecords(d || []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const handleTaskToggle = async (record: OnboardingRecord, taskIndex: number) => {
    const tasks: OnboardingTask[] = JSON.parse(record.tasks || "[]");
    tasks[taskIndex].completed = !tasks[taskIndex].completed;
    await fetch("/api/onboarding", {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: record.id, tasks }),
    });
    fetchData();
  };

  const inProgress = records.filter(r => r.status === "In Progress").length;
  const completed  = records.filter(r => r.status === "Completed").length;

  const totalPages = Math.max(1, Math.ceil(records.length / PAGE_SIZE));
  const paginated  = useMemo(() => records.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [records, page]);
  const startEntry = records.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const endEntry   = Math.min(page * PAGE_SIZE, records.length);

  /* ── Loading skeleton ── */
  if (loading) return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
        {[1,2,3].map(i => <div key={i} style={{ height: 100, borderRadius: 14, background: "var(--border)", animation: "pulse 1.4s ease-in-out infinite" }} />)}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {[1,2,3,4].map(i => <div key={i} style={{ height: 280, borderRadius: 14, background: "var(--border)", animation: "pulse 1.4s ease-in-out infinite" }} />)}
      </div>
    </div>
  );

  return (
    <>
      <style>{`
        @import url('${FONT_URL}');
        .onboard-page * { font-family: 'DM Sans', sans-serif !important; }
        .task-row:hover { background: var(--bg-hover) !important; }
        .onboard-card:hover { border-color: ${BLUE[300]} !important; }

        .onboard-page {
          --bg-card:   #ffffff;
          --bg-hover:  #f8fafc;
          --border:    rgba(0,0,0,0.08);
          --text-primary:   #0f172a;
          --text-secondary: #64748b;
          --text-muted:     #94a3b8;
        }
        @media (prefers-color-scheme: dark) {
          .onboard-page {
            --bg-card:   #0f172a;
            --bg-hover:  #1e293b;
            --border:    rgba(255,255,255,0.08);
            --text-primary:   #f1f5f9;
            --text-secondary: #94a3b8;
            --text-muted:     #475569;
          }
        }
      `}</style>

      <div className="onboard-page" style={{ display: "flex", flexDirection: "column", gap: 20 }}>

        {/* ── Header ── */}
        <div>
          <p style={{ fontSize: 10, fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.07em", textTransform: "uppercase", margin: "0 0 3px" }}>
            HR Management
          </p>
          <h1 style={{ fontSize: 22, fontWeight: 600, color: "var(--text-primary)", margin: 0, letterSpacing: -0.5 }}>
            Onboarding
          </h1>
        </div>

        {/* ── KPI row ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16 }}>
          <KpiCard icon={UserPlus}     label="Total Onboarding" value={records.length} accentBg={BLUE[50]}  accentColor={BLUE[600]} />
          <KpiCard icon={Clock}        label="In Progress"      value={inProgress}     accentBg={BLUE[50]}  accentColor={BLUE[400]} />
          <KpiCard icon={CheckCircle2} label="Completed"        value={completed}      accentBg={BLUE[100]} accentColor={BLUE[700]} />
        </div>

        {/* ── Status strip ── */}
        <div style={{ display: "flex", gap: 8 }}>
          {[
            { label: "Total",       count: records.length, bg: BLUE[50],  color: BLUE[600] },
            { label: "In Progress", count: inProgress,     bg: BLUE[50],  color: BLUE[500] },
            { label: "Completed",   count: completed,      bg: BLUE[100], color: BLUE[700] },
          ].map(s => (
            <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 10px", borderRadius: 7, background: s.bg }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.color, flexShrink: 0, display: "inline-block" }} />
              <span style={{ fontSize: 11, fontWeight: 600, color: s.color }}>{s.count} {s.label}</span>
            </div>
          ))}
        </div>

        {/* ── Records grid ── */}
        {records.length === 0 ? (
          <div style={{ padding: "56px 20px", textAlign: "center", borderRadius: 14, background: "var(--bg-card)", border: "0.5px solid var(--border)" }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: BLUE[50], display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
              <UserPlus size={20} style={{ color: BLUE[500] }} />
            </div>
            <p style={{ fontSize: 13, color: "var(--text-muted)", margin: 0 }}>No onboarding records found</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(330px, 1fr))", gap: 16 }}>
            {paginated.map(record => {
              const tasks: OnboardingTask[] = JSON.parse(record.tasks || "[]");
              const badge     = STATUS_CONFIG[record.status] || { bg: BLUE[50], color: BLUE[600] };
              const doneCount = tasks.filter(t => t.completed).length;

              return (
                <div
                  key={record.id}
                  className="onboard-card"
                  style={{ padding: 20, borderRadius: 14, background: "var(--bg-card)", border: "0.5px solid var(--border)", display: "flex", flexDirection: "column", gap: 0, transition: "border-color 0.18s" }}
                >
                  {/* Header */}
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <img
                        src={getAvatar(record.employee.firstName, record.employee.lastName)}
                        alt={`${record.employee.firstName} ${record.employee.lastName}`}
                        style={{ width: 42, height: 42, borderRadius: "50%", objectFit: "cover", border: "2px solid var(--border)", flexShrink: 0 }}
                      />
                      <div>
                        <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "var(--text-primary)", letterSpacing: -0.2 }}>
                          {record.employee.firstName} {record.employee.lastName}
                        </p>
                        <p style={{ margin: "2px 0 0", fontSize: 10, color: "var(--text-muted)" }}>
                          {record.employee.position} · {record.employee.department}
                        </p>
                      </div>
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 9px", borderRadius: 5, background: badge.bg, color: badge.color, letterSpacing: 0.2, whiteSpace: "nowrap" }}>
                      {record.status}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 7 }}>
                      <span style={{ fontSize: 10, fontWeight: 500, color: "var(--text-muted)" }}>Progress</span>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontSize: 10, color: "var(--text-muted)" }}>{doneCount}/{tasks.length}</span>
                        <span style={{ fontSize: 12, fontWeight: 600, color: BLUE[600] }}>{record.progress}%</span>
                      </div>
                    </div>
                    <div style={{ height: 6, borderRadius: 99, background: BLUE[50], overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${record.progress}%`, borderRadius: 99, background: record.progress === 100 ? BLUE[700] : BLUE[500], transition: "width 0.5s ease" }} />
                    </div>
                  </div>

                  {/* Task list */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 3, marginBottom: 14 }}>
                    {tasks.map((task, idx) => (
                      <div
                        key={idx}
                        className="task-row"
                        onClick={() => handleTaskToggle(record, idx)}
                        style={{ display: "flex", alignItems: "center", gap: 9, padding: "7px 9px", borderRadius: 8, cursor: "pointer", background: "transparent", transition: "background 0.15s" }}
                      >
                        {task.completed
                          ? <CheckCircle2 size={15} style={{ color: BLUE[600], flexShrink: 0 }} />
                          : <Circle       size={15} style={{ color: BLUE[300], flexShrink: 0 }} />
                        }
                        <span style={{ fontSize: 12, fontWeight: task.completed ? 400 : 500, color: task.completed ? "var(--text-muted)" : "var(--text-primary)", textDecoration: task.completed ? "line-through" : "none", flex: 1 }}>
                          {task.name}
                        </span>
                        {task.completed && (
                          <span style={{ fontSize: 9, fontWeight: 600, color: BLUE[600], background: BLUE[50], padding: "1px 6px", borderRadius: 4 }}>Done</span>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Footer */}
                  <div style={{ paddingTop: 12, borderTop: "0.5px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto" }}>
                    <div>
                      <p style={{ margin: 0, fontSize: 9.5, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em" }}>Started</p>
                      <p style={{ margin: "2px 0 0", fontSize: 11, fontWeight: 500, color: "var(--text-secondary)" }}>{record.startDate}</p>
                    </div>
                    {record.completedAt && (
                      <div style={{ textAlign: "right" }}>
                        <p style={{ margin: 0, fontSize: 9.5, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em" }}>Completed</p>
                        <p style={{ margin: "2px 0 0", fontSize: 11, fontWeight: 500, color: BLUE[600] }}>{record.completedAt}</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {!loading && records.length > PAGE_SIZE && (
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: 0 }}>
              Showing <strong>{startEntry}–{endEntry}</strong> of <strong>{records.length}</strong> records
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
    </>
  );
}