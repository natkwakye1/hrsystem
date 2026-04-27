import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSessionToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { email, password, companySlug } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    const lower = email.toLowerCase().trim();

    let user = await prisma.user.findUnique({
      where: { email: lower },
      include: { company: { select: { slug: true, name: true } } },
    });

    // ── Employee fallback: no User record yet ──────────────────────────────
    // Employees added by admin only exist in the Employee table until first login.
    // First-time login: use their Employee ID as password → auto-provision User record.
    if (!user) {
      const employee = await prisma.employee.findUnique({
        where: { email: lower },
        include: { company: { select: { slug: true, name: true } } },
      });

      if (!employee) {
        return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
      }

      // Validate: password must match the employee ID (first-time) or a previously set password
      const validEmpId = password === employee.employeeId;
      const validTempPw = employee.tempPassword
        ? await bcrypt.compare(password, employee.tempPassword)
        : false;

      if (!validEmpId && !validTempPw) {
        return NextResponse.json({
          error: "Invalid credentials. First time? Use your Employee ID (e.g. EMP-001) as your password.",
        }, { status: 401 });
      }

      // Validate company scope
      if (companySlug && employee.company?.slug && employee.company.slug !== companySlug) {
        return NextResponse.json({ error: "This account does not belong to this workspace." }, { status: 403 });
      }

      // Auto-provision User record
      const hashed = await bcrypt.hash(password, 10);
      user = await prisma.user.create({
        data: {
          email: lower,
          password: hashed,
          name: `${employee.firstName} ${employee.lastName}`,
          role: "employee",
          companyId: employee.companyId ?? undefined,
        },
        include: { company: { select: { slug: true, name: true } } },
      });
    }

    // ── Standard password check ────────────────────────────────────────────
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    // Validate company scope
    if (companySlug && user.company?.slug && user.company.slug !== companySlug) {
      return NextResponse.json({ error: "This account does not belong to this workspace." }, { status: 403 });
    }

    const userCompanySlug = user.company?.slug ?? null;

    const token = createSessionToken({
      id: user.id, email: user.email,
      name: user.name, role: user.role,
      companySlug: userCompanySlug,
    });

    const cookieName =
      user.role === "admin"    ? "session"     :
      user.role === "finance"  ? "fin-session" :
      "emp-session";

    const response = NextResponse.json({
      message:     "Login successful.",
      role:        user.role,
      companySlug: userCompanySlug,
      user:        { id: user.id, email: user.email, name: user.name, role: user.role },
    });

    response.cookies.set(cookieName, token, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === "production",
      sameSite: "lax",
      path:     "/",
      maxAge:   60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error("Unified login error:", error);
    return NextResponse.json({ error: "An internal error occurred." }, { status: 500 });
  }
}
