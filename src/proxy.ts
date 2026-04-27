import { NextRequest, NextResponse } from "next/server";

const PORTALS = ["admin", "finance", "employee"] as const;
type Portal = typeof PORTALS[number];

const COOKIE: Record<Portal, string> = {
  admin:    "session",
  finance:  "fin-session",
  employee: "emp-session",
};
const ROLE: Record<Portal, string> = {
  admin:    "admin",
  finance:  "finance",
  employee: "employee",
};

// Old direct-access paths that should redirect to company-scoped URLs
const DIRECT_ADMIN_PATHS = [
  "/dashboard", "/employees", "/payroll", "/leave",
  "/requests", "/reports", "/recruitment", "/benefits",
  "/settings", "/onboarding-tracker",
];

function decodeToken(token: string): { id?: string; role?: string; companySlug?: string } | null {
  try {
    return JSON.parse(Buffer.from(token, "base64").toString("utf-8"));
  } catch {
    return null;
  }
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Pass through: static assets, API routes, onboarding, landing, get-started, public login
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/favicon") ||
    pathname === "/" ||
    pathname === "/login" ||
    pathname === "/register" ||
    pathname.startsWith("/onboarding") ||
    pathname.startsWith("/get-started") ||
    pathname.startsWith("/finance/login") ||
    pathname.startsWith("/finance/register") ||
    pathname.startsWith("/employee-portal/login") ||
    pathname.startsWith("/employee-portal/register")
  ) {
    return NextResponse.next();
  }

  // ── Redirect legacy direct-portal access to company-scoped URLs ──
  const adminToken = request.cookies.get("session")?.value;
  if (adminToken) {
    const adminSession = decodeToken(adminToken);
    const slug = adminSession?.companySlug;

    if (slug) {
      // Direct admin paths → /{slug}/admin/...
      const matchedAdmin = DIRECT_ADMIN_PATHS.find(
        p => pathname === p || pathname.startsWith(p + "/")
      );
      if (matchedAdmin) {
        const subpath = pathname === "/dashboard" ? "" : pathname.slice(1);
        const target  = subpath ? `/${slug}/admin/${subpath}` : `/${slug}/admin`;
        return NextResponse.redirect(new URL(target, request.url));
      }

      // Direct finance paths → /{slug}/finance/...
      if (pathname === "/finance" || pathname.startsWith("/finance/")) {
        const subpath = pathname.replace(/^\/finance\/?/, "");
        const target  = subpath ? `/${slug}/finance/${subpath}` : `/${slug}/finance`;
        return NextResponse.redirect(new URL(target, request.url));
      }

      // Direct employee-portal paths → /{slug}/employee/...
      if (pathname === "/employee-portal" || pathname.startsWith("/employee-portal/")) {
        const subpath = pathname.replace(/^\/employee-portal\/?/, "");
        const target  = subpath ? `/${slug}/employee/${subpath}` : `/${slug}/employee`;
        return NextResponse.redirect(new URL(target, request.url));
      }
    }
  }

  // ── Handle /{slug}/{portal}/... routes ──
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length < 2) return NextResponse.next();

  const [slug, portal, ...rest] = parts;

  // /{slug}/login — pass through to [companySlug]/login/page.tsx
  if (portal === "login") return NextResponse.next();

  // Only process known portal types
  if (!(PORTALS as readonly string[]).includes(portal)) return NextResponse.next();
  const portalType = portal as Portal;

  // Validate session cookie exists
  const cookieName = COOKIE[portalType];
  const token = request.cookies.get(cookieName)?.value;

  if (!token) {
    return NextResponse.redirect(new URL(`/${slug}/login`, request.url));
  }

  const session = decodeToken(token);
  if (!session || session.role !== ROLE[portalType]) {
    return NextResponse.redirect(new URL(`/${slug}/login`, request.url));
  }

  // If user's company doesn't match the URL slug, send them to their own company
  if (session.companySlug && session.companySlug !== slug) {
    return NextResponse.redirect(new URL(`/${session.companySlug}/${portal}`, request.url));
  }

  // ── Rewrite to the internal portal path ──
  const url = request.nextUrl.clone();

  if (portalType === "admin") {
    if (rest.length === 0 || (rest.length === 1 && rest[0] === "dashboard")) {
      url.pathname = "/dashboard";
    } else {
      url.pathname = "/" + rest.join("/");
    }
  } else if (portalType === "finance") {
    url.pathname = rest.length === 0 ? "/finance" : "/finance/" + rest.join("/");
  } else if (portalType === "employee") {
    url.pathname = rest.length === 0 ? "/employee-portal" : "/employee-portal/" + rest.join("/");
  }

  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public).*)"],
};

export default proxy;
