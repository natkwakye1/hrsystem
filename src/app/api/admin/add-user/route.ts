import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { sendEmail, credentialsEmailHTML } from "@/lib/email";

const PLAN_LIMITS: Record<string, { employees: number; finance: number }> = {
  free:       { employees: 5,   finance: 1   },
  pro:        { employees: 50,  finance: 5   },
  enterprise: { employees: 999, finance: 999 },
};

function generatePassword(length = 12) {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$";
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

function toSlug(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]/g, "");
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, role, personalEmail } = await request.json();

    if (!name || !role) {
      return NextResponse.json({ error: "Name and role are required." }, { status: 400 });
    }
    if (!["finance", "employee"].includes(role)) {
      return NextResponse.json({ error: "Role must be finance or employee." }, { status: 400 });
    }

    let company = null;
    if (session.companyId) {
      company = await prisma.company.findUnique({
        where: { id: session.companyId },
        select: { id: true, name: true, slug: true, emailDomain: true, plan: true },
      });
    }

    // ── Plan limit check ──
    if (company) {
      const limits = PLAN_LIMITS[company.plan] ?? PLAN_LIMITS.free;
      const currentCount = await prisma.user.count({
        where: { companyId: company.id, role },
      });
      const limit = role === "employee" ? limits.employees : limits.finance;
      if (currentCount >= limit) {
        const planLabel = company.plan.charAt(0).toUpperCase() + company.plan.slice(1);
        return NextResponse.json({
          error: `Your ${planLabel} plan allows a maximum of ${limit} ${role}${limit === 1 ? "" : "s"}. Upgrade your plan to add more.`,
        }, { status: 403 });
      }
    }

    // Build company-scoped email from name + company domain
    const nameParts = name.trim().split(/\s+/);
    const firstName = nameParts[0] || "user";
    const lastName  = nameParts[nameParts.length - 1] || "";
    const domain    = company?.emailDomain || "neraadmin.com";

    let workEmail = lastName
      ? `${toSlug(firstName)}.${toSlug(lastName)}@${domain}`
      : `${toSlug(firstName)}@${domain}`;

    // Deduplicate if taken
    const taken = await prisma.user.findUnique({ where: { email: workEmail } });
    if (taken) {
      workEmail = `${toSlug(firstName)}.${toSlug(lastName)}${Math.floor(Math.random() * 99) + 1}@${domain}`;
    }

    const tempPassword = generatePassword();
    const hashed = await bcrypt.hash(tempPassword, 12);

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: workEmail,
        password: hashed,
        role,
        companyId: session.companyId || undefined,
      },
    });

    // If employee, also create an Employee record
    if (role === "employee") {
      const count = await prisma.employee.count({ where: { companyId: session.companyId || undefined } });
      const employeeId = `EMP-${String(count + 1).padStart(3, "0")}`;
      await prisma.employee.create({
        data: {
          employeeId,
          firstName,
          lastName,
          email: workEmail,
          companyId: session.companyId || undefined,
          hireDate: new Date().toISOString().split("T")[0],
        },
      }).catch(() => {});
    }

    const portalLabel = role === "finance" ? "Finance Portal" : "Employee Portal";
    const appUrl      = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001";
    const loginUrl    = company?.slug ? `${appUrl}/${company.slug}/login` : `${appUrl}/login`;
    const sendTo      = personalEmail?.trim() || workEmail;

    await sendEmail({
      to: sendTo,
      subject: `Welcome to ${company?.name || "NeraAdmin"} — Your ${portalLabel} credentials`,
      html: credentialsEmailHTML({
        name,
        email: workEmail,
        password: tempPassword,
        portal: portalLabel,
        loginUrl,
        companyName: company?.name,
      }),
    });

    return NextResponse.json({
      message: "Account created and credentials sent.",
      user:    { id: user.id, name: user.name, email: workEmail, role: user.role },
      workEmail,
    }, { status: 201 });
  } catch (error: unknown) {
    console.error("Add user error:", error);
    const msg = error instanceof Error ? error.message : "";
    if (msg.includes("P2002")) {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
    }
    return NextResponse.json({ error: "Failed to create account." }, { status: 500 });
  }
}
