import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { sendEmail, credentialsEmailHTML } from "@/lib/email";

function generatePassword(length = 12) {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$";
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

function toEmailSlug(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, "").slice(0, 20);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const department = searchParams.get("department") || "";
    const status = searchParams.get("status") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { firstName: { contains: search } },
        { lastName: { contains: search } },
        { email: { contains: search } },
        { employeeId: { contains: search } },
      ];
    }
    if (department) where.department = department;
    if (status) where.status = status;

    const [employees, total] = await Promise.all([
      prisma.employee.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.employee.count({ where }),
    ]);

    return NextResponse.json({
      employees,
      total,
      pages: Math.ceil(total / limit),
      page,
    });
  } catch (error) {
    console.error("Employees list error:", error);
    return NextResponse.json({ error: "Failed to load employees" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      firstName, lastName, email, phone, department, position,
      salary, hireDate, gender, employmentType, status,
      dateOfBirth, address, city, state, country, postalCode,
      nationality, maritalStatus,
    } = body;

    if (!firstName || !lastName) {
      return NextResponse.json({ error: "First name and last name are required." }, { status: 400 });
    }

    const count = await prisma.employee.count();
    const employeeId = `EMP-${String(count + 1).padStart(3, "0")}`;

    // Determine company-scoped email
    let assignedEmail = email ? email.toLowerCase().trim() : "";
    let tempPassword: string | undefined;
    let companyId: string | undefined;

    // If admin is logged in via session cookie, fetch their companyId
    const sessionCookie = request.cookies.get("session")?.value;
    if (sessionCookie) {
      try {
        const adminUser = await getSessionUser(sessionCookie);
        if (adminUser?.companyId) {
          companyId = adminUser.companyId;
          const company = await prisma.company.findUnique({ where: { id: companyId } });
          if (company?.emailDomain && firstName && lastName) {
            const base = `${toEmailSlug(firstName)}.${toEmailSlug(lastName)}`;
            const candidate = `${base}@${company.emailDomain}`;
            const taken = await prisma.employee.findUnique({ where: { email: candidate } });
            if (!taken) assignedEmail = candidate;
            else {
              const candidate2 = `${toEmailSlug(firstName)}${toEmailSlug(lastName).charAt(0)}@${company.emailDomain}`;
              const taken2 = await prisma.employee.findUnique({ where: { email: candidate2 } });
              assignedEmail = taken2 ? `${base}${count}@${company.emailDomain}` : candidate2;
            }
          }
        }
      } catch { /* session parsing failed, use provided email */ }
    }

    if (!assignedEmail) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    tempPassword = generatePassword();
    const hashedPassword = await bcrypt.hash(tempPassword, 12);

    const employee = await prisma.employee.create({
      data: {
        employeeId,
        firstName,
        lastName,
        email:          assignedEmail,
        phone:          phone          || undefined,
        department:     department     || undefined,
        position:       position       || undefined,
        salary:         salary ? parseFloat(salary) : 0,
        hireDate:       hireDate       || new Date().toISOString().split("T")[0],
        gender:         gender         || undefined,
        employmentType: employmentType || "Full-time",
        status:         status         || "Active",
        dateOfBirth:    dateOfBirth    || undefined,
        address:        address        || undefined,
        city:           city           || undefined,
        state:          state          || undefined,
        country:        country        || undefined,
        postalCode:     postalCode     || undefined,
        nationality:    nationality    || undefined,
        maritalStatus:  maritalStatus  || undefined,
        companyId:      companyId      || undefined,
        tempPassword:   hashedPassword,
      },
    });

    // Create portal User account for the employee
    try {
      const existing = await prisma.user.findUnique({ where: { email: assignedEmail } });
      if (!existing) {
        await prisma.user.create({
          data: {
            name: `${firstName} ${lastName}`,
            email: assignedEmail,
            password: hashedPassword,
            role: "employee",
            companyId: companyId || undefined,
          },
        });
      }
    } catch { /* user creation failed, employee record still saved */ }

    // Send credentials email (fire-and-forget)
    const contactEmail = email && email !== assignedEmail ? email : assignedEmail;
    sendEmail({
      to: contactEmail,
      subject: `Your ${assignedEmail.split("@")[1]?.split(".")[0] || "NeraAdmin"} employee portal credentials`,
      html: credentialsEmailHTML({
        name: `${firstName} ${lastName}`,
        email: assignedEmail,
        password: tempPassword,
        portal: "Employee Portal",
        loginUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/login`,
      }),
    }).catch(() => {});

    return NextResponse.json({ ...employee, assignedEmail, credentialsSent: true }, { status: 201 });
  } catch (error: unknown) {
    console.error("Create employee error:", error);
    if (error && typeof error === "object" && "code" in error && error.code === "P2002") {
      return NextResponse.json({ error: "An employee with this email already exists." }, { status: 409 });
    }
    return NextResponse.json({ error: "Failed to create employee" }, { status: 500 });
  }
}
