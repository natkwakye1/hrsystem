"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { BarChart3, Wallet, PieChart, FileText, TrendingUp, LogOut, Menu, X, ChevronRight, Receipt, CreditCard, MinusCircle, Shield, Sun, Moon } from "lucide-react";

interface FinSession { name: string; email: string; }

const NAV_ITEMS = [
  { sub: "",            label: "Overview",    icon: BarChart3    },
  { sub: "/payroll",    label: "Payroll",     icon: Wallet       },
  { sub: "/payslips",   label: "Payslips",    icon: Receipt      },
  { sub: "/payments",   label: "Payments",    icon: CreditCard   },
  { sub: "/deductions", label: "Deductions",  icon: MinusCircle  },
  { sub: "/budgets",    label: "Budgets",     icon: PieChart     },
  { sub: "/reports",    label: "Reports",     icon: FileText     },
  { sub: "/audit",      label: "Audit Log",   icon: Shield       },
];

function extractFinanceSlug(pathname: string): string {
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length >= 2 && parts[1] === "finance") return parts[0];
  return "";
}

export default function FinancePortalLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter();
  const pathname = usePathname();
  const [session,     setSession]     = useState<FinSession | null>(null);
  const [open,        setOpen]        = useState(false);
  const [loading,     setLoading]     = useState(true);
  const [theme,       setTheme]       = useState<"light" | "dark">("light");
  const [companyName, setCompanyName] = useState("");

  const companySlug = extractFinanceSlug(pathname);
  const finBase     = companySlug ? `/${companySlug}/finance` : "/finance";
  const loginPath   = companySlug ? `/${companySlug}/login`   : "/finance/login";

  const NAV = NAV_ITEMS.map(item => ({ ...item, href: `${finBase}${item.sub}` }));

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  useEffect(() => {
    if (!companySlug) return;
    fetch(`/api/company/info?slug=${encodeURIComponent(companySlug)}`)
      .then(r => r.json())
      .then(d => { if (d.company?.name) setCompanyName(d.company.name); })
      .catch(() => {});
  }, [companySlug]);

  useEffect(() => {
    fetch("/api/portal/finance/me")
      .then(r => {
        if (r.status === 401) { router.replace(loginPath); return null; }
        return r.json();
      })
      .then(d => {
        if (d) setSession({ name: d.user.name, email: d.user.email });
        setLoading(false);
      })
      .catch(() => router.replace(loginPath));
  }, [router, loginPath]);

  const handleLogout = async () => {
    await fetch("/api/portal/finance/logout", { method: "POST" });
    router.replace(loginPath);
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-body)" }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ width: 28, height: 28, border: "3px solid var(--border)", borderTopColor: "var(--accent)", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
    </div>
  );

  const initial = session?.name?.charAt(0)?.toUpperCase() ?? "F";

  const SidebarInner = () => (
    <div style={{ width: 240, height: "100%", background: "var(--bg-sidebar)", borderRight: "1px solid var(--border)", display: "flex", flexDirection: "column" }}>
      {/* Brand */}
      <div style={{ height: 62, padding: "0 16px", display: "flex", alignItems: "center", borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <TrendingUp size={15} color="#fff" />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "var(--text-primary)", letterSpacing: -0.3, lineHeight: 1.2 }}>{companyName || companySlug || "Company"}</p>
            <p style={{ margin: 0, fontSize: 9.5, fontWeight: 500, color: "var(--text-muted)" }}>Finance Portal</p>
          </div>
        </div>
      </div>

      {/* User strip */}
      {session && (
        <div style={{ padding: "12px 12px 6px" }}>
          <div style={{ padding: "9px 10px", borderRadius: 10, background: "var(--bg-hover)", display: "flex", alignItems: "center", gap: 9, border: "1px solid transparent" }}>
            <div style={{ width: 30, height: 30, borderRadius: "50%", background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#fff" }}>{initial}</span>
            </div>
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
        <p style={{ fontSize: 9.5, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.09em", textTransform: "uppercase", padding: "10px 16px 4px", margin: 0 }}>Navigation</p>
        {NAV.map(item => {
          const Icon    = item.icon;
          const isExact = item.sub === "";
          const active  = isExact ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href} href={item.href}
              onClick={() => setOpen(false)}
              className={`fin-nav-link${active ? " fin-nav-active" : ""}`}
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
          className="fin-nav-link"
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
        .fin-nav-link { transition: background 0.15s, color 0.15s; font-family: 'DM Sans', sans-serif !important; }
        .fin-main, .fin-main * { font-family: 'DM Sans', sans-serif !important; }
        .fin-nav-link:hover:not(.fin-nav-active) { background: var(--bg-hover) !important; color: var(--text-primary) !important; }
        .fin-nav-link.fin-nav-active { background: var(--accent) !important; color: #fff !important; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .fin-mobile-sidebar { display: none; }
        @media(max-width: 1023px) { .fin-mobile-sidebar { display: block !important; } }
      `}</style>

      <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg-body)" }}>
        {/* Desktop sidebar spacer */}
        <div style={{ width: 240, flexShrink: 0, display: "none" }} className="fin-sidebar-spacer">
          <div style={{ position: "fixed", left: 0, top: 0, width: 240, height: "100vh", zIndex: 40 }}>
            <SidebarInner />
          </div>
        </div>

        {/* Mobile overlay */}
        <div
          onClick={() => setOpen(false)}
          style={{
            position: "fixed", inset: 0, zIndex: 50,
            background: "rgba(0,0,0,0.4)", backdropFilter: "blur(1px)",
            opacity: open ? 1 : 0,
            pointerEvents: open ? "auto" : "none",
            transition: "opacity 0.28s cubic-bezier(.4,0,.2,1)",
          }}
        />
        <div
          onClick={e => e.stopPropagation()}
          style={{
            position: "fixed", left: 0, top: 0, height: "100%", zIndex: 51,
            transform: open ? "translateX(0)" : "translateX(-100%)",
            transition: "transform 0.28s cubic-bezier(.4,0,.2,1)",
          }}
          className="fin-mobile-sidebar"
        >
          <SidebarInner />
        </div>

        {/* Page content */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
          <header style={{
            height: 56, background: "var(--bg-card)", borderBottom: "1px solid var(--border)",
            display: "flex", alignItems: "center", padding: "0 24px", gap: 12,
            position: "sticky", top: 0, zIndex: 30, boxShadow: "var(--shadow-sm)",
          }}>
            <button
              onClick={() => setOpen(p => !p)}
              className="fin-menu-btn"
              style={{ display: "none", background: "none", border: "none", cursor: "pointer", padding: 4, color: "var(--text-secondary)" }}
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }} className="fin-brand-header">
              <div style={{ width: 24, height: 24, borderRadius: 6, background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <TrendingUp size={13} color="#fff" />
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{companyName || "Finance Portal"}</span>
            </div>
            <div style={{ flex: 1 }} />
            <button
              onClick={() => setTheme(t => t === "light" ? "dark" : "light")}
              style={{ width: 34, height: 34, borderRadius: 8, border: "0.5px solid var(--border)", background: "var(--bg-body)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--text-secondary)", flexShrink: 0 }}
            >
              {theme === "light" ? <Moon size={15} /> : <Sun size={15} />}
            </button>
            {session && (
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{initial}</span>
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }} className="fin-header-name">{session.name}</span>
              </div>
            )}
          </header>

          <main className="fin-main" style={{ flex: 1, padding: "28px 28px 40px", width: "100%" }}>
            {children}
          </main>
        </div>
      </div>

      <style>{`
        @media(min-width: 1024px) {
          .fin-sidebar-spacer { display: block !important; }
          .fin-menu-btn { display: none !important; }
          .fin-brand-header { display: none !important; }
        }
        @media(max-width: 1023px) { .fin-menu-btn { display: block !important; } }
        @media(max-width: 640px)  { .fin-header-name { display: none !important; } }
      `}</style>
    </>
  );
}
