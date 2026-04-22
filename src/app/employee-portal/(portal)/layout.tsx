"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard, CalendarDays, Wallet, Heart, UserCircle,
  LogOut, Menu, X, ChevronRight, Inbox, Settings,
  Bell, Sun, Moon, CheckCheck,
} from "lucide-react";

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
  const key = `${firstName}${lastName}`;
  let hash = 0;
  for (let i = 0; i < key.length; i++) hash = key.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_POOL[Math.abs(hash) % AVATAR_POOL.length];
}

interface EmpSession { name: string; email: string; firstName?: string; lastName?: string; }
interface Notif { id: string; title: string; message: string; type: string; isRead: boolean; createdAt: string; }

const NAV = [
  { href: "/employee-portal",          label: "Dashboard",      icon: LayoutDashboard },
  { href: "/employee-portal/leave",    label: "Leave Requests", icon: CalendarDays    },
  { href: "/employee-portal/payslips", label: "Pay Slips",      icon: Wallet          },
  { href: "/employee-portal/benefits", label: "Benefits",       icon: Heart           },
  { href: "/employee-portal/requests", label: "My Requests",    icon: Inbox           },
  { href: "/employee-portal/profile",  label: "My Profile",     icon: UserCircle      },
  { href: "/employee-portal/settings", label: "Settings",       icon: Settings        },
];

export default function EmployeePortalLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter();
  const pathname = usePathname();
  const [session,    setSession]    = useState<EmpSession | null>(null);
  const [open,       setOpen]       = useState(false);
  const [loading,    setLoading]    = useState(true);
  const [theme,      setTheme]      = useState<"light" | "dark">("light");
  const [notifs,     setNotifs]     = useState<Notif[]>([]);
  const [notifOpen,  setNotifOpen]  = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/portal/employee/me")
      .then(r => {
        if (r.status === 401) { router.replace("/employee-portal/login"); return null; }
        return r.json();
      })
      .then(d => {
        if (d) setSession({
          name: d.session?.name, email: d.session?.email,
          firstName: d.employee?.firstName, lastName: d.employee?.lastName,
        });
        setLoading(false);
      })
      .catch(() => router.replace("/employee-portal/login"));
  }, [router]);

  // fetch notifications
  useEffect(() => {
    const load = () => {
      fetch("/api/portal/employee/notifications")
        .then(r => r.json())
        .then(d => setNotifs(d.notifications ?? []))
        .catch(() => {});
    };
    load();
    const t = setInterval(load, 30000);
    return () => clearInterval(t);
  }, []);

  // close notif dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // dark mode
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const handleLogout = async () => {
    await fetch("/api/portal/employee/logout", { method: "POST" });
    router.replace("/employee-portal/login");
  };

  const markAllRead = async () => {
    await fetch("/api/portal/employee/notifications", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ all: true }),
    });
    setNotifs(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-body)" }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ width: 28, height: 28, border: "3px solid var(--border)", borderTopColor: "var(--accent)", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
    </div>
  );

  const avatarSrc = session?.firstName && session?.lastName
    ? getAvatar(session.firstName, session.lastName)
    : AVATAR_POOL[0];

  const unread = notifs.filter(n => !n.isRead).length;

  const typeColor = (type: string) => {
    if (type === "success") return "#15803d";
    if (type === "warning") return "#d97706";
    if (type === "error")   return "var(--danger)";
    return "var(--accent)";
  };

  const SidebarInner = () => (
    <div style={{ width: 240, height: "100%", background: "var(--bg-sidebar)", borderRight: "1px solid var(--border)", display: "flex", flexDirection: "column" }}>
      {/* Brand */}
      <div style={{ height: 62, padding: "0 16px", display: "flex", alignItems: "center", borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <span style={{ color: "#fff", fontWeight: 800, fontSize: 13 }}>N</span>
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "var(--text-primary)", letterSpacing: -0.3, lineHeight: 1.2 }}>NeraAdmin</p>
            <p style={{ margin: 0, fontSize: 9.5, fontWeight: 500, color: "var(--text-muted)" }}>Employee Portal</p>
          </div>
        </div>
      </div>

      {/* Employee profile strip */}
      {session && (
        <div style={{ padding: "12px 12px 6px" }}>
          <div style={{ padding: "9px 10px", borderRadius: 10, background: "var(--bg-hover)", display: "flex", alignItems: "center", gap: 9, border: "1px solid transparent" }}>
            <img src={avatarSrc} alt="" style={{ width: 30, height: 30, borderRadius: "50%", objectFit: "cover", border: "2px solid var(--border)", flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 10, color: "var(--text-muted)", margin: 0 }}>Logged in as</p>
              <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)", margin: "1px 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{session.name}</p>
            </div>
          </div>
        </div>
      )}

      <div style={{ height: 1, background: "var(--border)", margin: "4px 12px 4px" }} />

      {/* Nav */}
      <nav style={{ flex: 1, padding: "4px 0 8px", overflowY: "auto" }}>
        <p style={{ fontSize: 9.5, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.09em", textTransform: "uppercase", padding: "10px 16px 4px", margin: 0 }}>Menu</p>
        {NAV.map(item => {
          const Icon    = item.icon;
          const isExact = item.href === "/employee-portal";
          const active  = isExact ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href} href={item.href}
              onClick={() => setOpen(false)}
              className={`ep-nav-link${active ? " ep-nav-active" : ""}`}
              style={{
                display: "flex", alignItems: "center", gap: 9,
                padding: "7px 10px 7px 12px",
                margin: "1px 8px",
                fontSize: 12,
                fontWeight: active ? 600 : 400,
                color: active ? "#fff" : "var(--text-secondary)",
                background: active ? "var(--accent)" : "transparent",
                textDecoration: "none",
                borderRadius: 9,
                position: "relative",
              }}
            >
              {active && (
                <span style={{ position: "absolute", left: -8, top: "50%", transform: "translateY(-50%)", width: 3, height: 18, borderRadius: "0 3px 3px 0", background: "var(--accent)" }} />
              )}
              <span style={{ width: 26, height: 26, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", background: active ? "rgba(255,255,255,0.18)" : "var(--bg-hover)", flexShrink: 0 }}>
                <Icon size={13} strokeWidth={active ? 2.3 : 1.8} />
              </span>
              <span style={{ flex: 1 }}>{item.label}</span>
              {active && <ChevronRight size={12} style={{ opacity: 0.7 }} />}
            </Link>
          );
        })}
      </nav>

      <div style={{ height: 1, background: "var(--border)", margin: "0 12px" }} />

      {/* Logout */}
      <div style={{ padding: "8px 8px 16px" }}>
        <button
          onClick={handleLogout}
          className="ep-nav-link"
          style={{ display: "flex", alignItems: "center", gap: 9, width: "100%", padding: "8px 10px 8px 12px", fontSize: 12, fontWeight: 500, color: "var(--text-secondary)", background: "none", border: "none", cursor: "pointer", textAlign: "left", borderRadius: 9 }}
        >
          <span style={{ width: 26, height: 26, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-hover)", flexShrink: 0 }}>
            <LogOut size={13} strokeWidth={1.8} />
          </span>
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap');
        .ep-nav-link { transition: background 0.15s, color 0.15s; font-family: 'DM Sans', sans-serif !important; }
        .ep-main, .ep-main * { font-family: 'DM Sans', sans-serif !important; }
        .ep-nav-link:hover:not(.ep-nav-active) { background: var(--bg-hover) !important; color: var(--text-primary) !important; }
        .ep-nav-link.ep-nav-active { background: var(--accent) !important; color: #fff !important; }
        @keyframes slideIn { from { transform: translateX(-100%); } to { transform: translateX(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes notifDrop { from { opacity:0; transform:translateY(-6px); } to { opacity:1; transform:translateY(0); } }
      `}</style>

      <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg-body)" }}>
        {/* Desktop sidebar spacer */}
        <div style={{ width: 240, flexShrink: 0, display: "none" }} className="ep-sidebar-spacer">
          <div style={{ position: "fixed", left: 0, top: 0, width: 240, height: "100vh", zIndex: 40 }}>
            <SidebarInner />
          </div>
        </div>

        {/* Mobile overlay */}
        {open && (
          <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex" }} onClick={() => setOpen(false)}>
            <div style={{ width: 240, height: "100%", animation: "slideIn 0.22s ease", flexShrink: 0 }} onClick={e => e.stopPropagation()}>
              <SidebarInner />
            </div>
            <div style={{ flex: 1, background: "rgba(0,0,0,0.35)" }} />
          </div>
        )}

        {/* Page content */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
          <header style={{
            height: 56, background: "var(--bg-card)", borderBottom: "1px solid var(--border)",
            display: "flex", alignItems: "center", padding: "0 20px", gap: 10,
            position: "sticky", top: 0, zIndex: 30, boxShadow: "var(--shadow-sm)",
          }}>
            <button
              onClick={() => setOpen(p => !p)}
              className="ep-menu-btn"
              style={{ display: "none", background: "none", border: "none", cursor: "pointer", padding: 4, color: "var(--text-secondary)" }}
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }} className="ep-brand-header">
              <div style={{ width: 24, height: 24, borderRadius: 6, background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ color: "#fff", fontWeight: 700, fontSize: 12 }}>N</span>
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>Employee Portal</span>
            </div>
            <div style={{ flex: 1 }} />

            {/* Dark mode toggle */}
            <button
              onClick={() => setTheme(t => t === "light" ? "dark" : "light")}
              style={{ width: 34, height: 34, borderRadius: 8, border: "0.5px solid var(--border)", background: "var(--bg-body)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--text-secondary)", flexShrink: 0 }}
            >
              {theme === "light" ? <Moon size={15} /> : <Sun size={15} />}
            </button>

            {/* Notification bell */}
            <div ref={notifRef} style={{ position: "relative", flexShrink: 0 }}>
              <button
                onClick={() => setNotifOpen(p => !p)}
                style={{ width: 34, height: 34, borderRadius: 8, border: "0.5px solid var(--border)", background: "var(--bg-body)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--text-secondary)", position: "relative" }}
              >
                <Bell size={15} />
                {unread > 0 && (
                  <span style={{ position: "absolute", top: 5, right: 5, width: 8, height: 8, borderRadius: "50%", background: "var(--danger)", border: "1.5px solid var(--bg-card)" }} />
                )}
              </button>

              {/* Dropdown */}
              {notifOpen && (
                <div style={{
                  position: "absolute", top: "calc(100% + 8px)", right: 0, width: 320,
                  background: "var(--bg-card)", borderRadius: 12, border: "0.5px solid var(--border)",
                  boxShadow: "var(--shadow-xl)", zIndex: 100, overflow: "hidden",
                  animation: "notifDrop 0.15s ease",
                }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", borderBottom: "0.5px solid var(--border)" }}>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>Notifications</p>
                      {unread > 0 && <p style={{ fontSize: 10, color: "var(--text-muted)", margin: "1px 0 0" }}>{unread} unread</p>}
                    </div>
                    {unread > 0 && (
                      <button
                        onClick={markAllRead}
                        style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "var(--accent)", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}
                      >
                        <CheckCheck size={12} /> Mark all read
                      </button>
                    )}
                  </div>
                  <div style={{ maxHeight: 340, overflowY: "auto" }}>
                    {notifs.length === 0 ? (
                      <div style={{ padding: "32px 16px", textAlign: "center" }}>
                        <Bell size={24} style={{ color: "var(--border)", display: "block", margin: "0 auto 8px" }} />
                        <p style={{ fontSize: 12, color: "var(--text-muted)", margin: 0 }}>No notifications yet</p>
                      </div>
                    ) : notifs.map(n => (
                      <div
                        key={n.id}
                        onClick={async () => {
                          if (!n.isRead) {
                            await fetch("/api/portal/employee/notifications", {
                              method: "PATCH", headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ id: n.id }),
                            });
                            setNotifs(prev => prev.map(x => x.id === n.id ? { ...x, isRead: true } : x));
                          }
                        }}
                        style={{
                          padding: "12px 16px", borderBottom: "0.5px solid var(--border)",
                          background: n.isRead ? "transparent" : "var(--accent-light)",
                          cursor: "pointer",
                          display: "flex", gap: 10, alignItems: "flex-start",
                        }}
                      >
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: typeColor(n.type), marginTop: 5, flexShrink: 0 }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: 12, fontWeight: n.isRead ? 400 : 600, color: "var(--text-primary)", margin: "0 0 2px", lineHeight: 1.4 }}>{n.title}</p>
                          <p style={{ fontSize: 11, color: "var(--text-secondary)", margin: "0 0 4px", lineHeight: 1.4 }}>{n.message}</p>
                          <p style={{ fontSize: 10, color: "var(--text-muted)", margin: 0 }}>{new Date(n.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {session && (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <img src={avatarSrc} alt="" style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover", border: "2px solid var(--border)" }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }} className="ep-header-name">{session.name}</span>
              </div>
            )}
          </header>

          <main className="ep-main" style={{ flex: 1, padding: "28px 28px 40px", width: "100%" }}>
            {children}
          </main>
        </div>
      </div>

      <style>{`
        @media(min-width: 1024px) {
          .ep-sidebar-spacer { display: block !important; }
          .ep-menu-btn { display: none !important; }
          .ep-brand-header { display: none !important; }
        }
        @media(max-width: 1023px) { .ep-menu-btn { display: block !important; } }
        @media(max-width: 640px)  { .ep-header-name { display: none !important; } }
      `}</style>
    </>
  );
}
