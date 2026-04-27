import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSessionToken } from "@/lib/auth";
import { sendEmail, credentialsEmailHTML } from "@/lib/email";

function slugify(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

// Slugs that conflict with existing routes or reserved system paths
const RESERVED_SLUGS = new Set([
  "api", "login", "register", "dashboard", "employees", "payroll",
  "leave", "requests", "reports", "recruitment", "benefits", "settings",
  "finance", "employee-portal", "employee", "onboarding", "onboarding-tracker",
  "admin", "get-started", "public", "static", "_next", "c", "auth",
]);

function isReservedSlug(slug: string): boolean {
  if (RESERVED_SLUGS.has(slug)) return true;
  if (slug.startsWith("_") || slug.startsWith("api-")) return true;
  return false;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { companyName, industry, size, website, phone, address, adminName, adminEmail, adminPassword } = body;

    if (!companyName || !adminName || !adminEmail || !adminPassword) {
      return NextResponse.json({ error: "Company name, admin name, email and password are required." }, { status: 400 });
    }

    const baseSlug = slugify(companyName);
    let slug = isReservedSlug(baseSlug) ? `${baseSlug}-co` : baseSlug;
    let suffix = 1;
    while (await prisma.company.findUnique({ where: { slug } }) || isReservedSlug(slug)) {
      slug = `${baseSlug}-${suffix++}`;
    }

    const emailDomain = `${slug}.com`;

    const existingUser = await prisma.user.findUnique({ where: { email: adminEmail.toLowerCase().trim() } });
    if (existingUser) {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
    }

    const hashed = await bcrypt.hash(adminPassword, 12);
    const sizeNum = parseInt(size) || 1;

    const company = await prisma.company.create({
      data: {
        name: companyName.trim(),
        slug,
        emailDomain,
        industry: industry || undefined,
        size: sizeNum,
        plan: sizeNum <= 5 ? "free" : "pro",
        website: website || undefined,
        phone: phone || undefined,
        address: address || undefined,
        isOnboarded: false,
        permissions: {
          create: {
            employeeLeave: true, employeePayslips: true,
            employeeProfile: true, employeeRequests: true,
            employeeBenefits: true, financePayroll: true,
            financeBudgets: true, financeReports: true,
          },
        },
      },
    });

    const adminUser = await prisma.user.create({
      data: {
        name: adminName.trim(),
        email: adminEmail.toLowerCase().trim(),
        password: hashed,
        role: "admin",
        companyId: company.id,
      },
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001";

    await sendEmail({
      to: adminEmail,
      subject: `Welcome to ${companyName} — Your workspace is ready`,
      html: credentialsEmailHTML({
        name: adminName,
        email: adminEmail,
        password: adminPassword,
        portal: "Admin Portal",
        loginUrl: `${appUrl}/${slug}/login`,
        companyName,
      }),
    });

    const sessionToken = createSessionToken({
      id: adminUser.id, email: adminUser.email,
      name: adminUser.name, role: adminUser.role,
      companySlug: slug,
    });

    const response = NextResponse.json({
      message: "Company created successfully.",
      companyId: company.id,
      slug: company.slug,
      emailDomain,
    }, { status: 201 });

    response.cookies.set("session", sessionToken, {
      httpOnly: true, secure: process.env.NODE_ENV === "production",
      sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error: unknown) {
    console.error("Company setup error:", error);
    const msg = error instanceof Error ? error.message : "";
    if (msg.includes("P1001") || msg.includes("Can't reach") || msg.includes("connect")) {
      return NextResponse.json({
        error: "Cannot reach the database. Your Supabase project may be paused. Go to supabase.com, resume the project, then try again.",
      }, { status: 503 });
    }
    if (msg.includes("P2002") || msg.includes("Unique constraint")) {
      return NextResponse.json({ error: "A company or account with these details already exists." }, { status: 409 });
    }
    if (msg.includes("does not exist") || msg.includes("relation") || msg.includes("P2021")) {
      return NextResponse.json({
        error: "Database tables are missing. Run `npx prisma db push` in your terminal after resuming Supabase, then try again.",
      }, { status: 503 });
    }
    return NextResponse.json({ error: "An error occurred. Please try again." }, { status: 500 });
  }
}
