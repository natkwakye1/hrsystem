import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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

    if (!firstName || !lastName || !email) {
      return NextResponse.json({ error: "First name, last name, and email are required." }, { status: 400 });
    }

    const count = await prisma.employee.count();
    const employeeId = `EMP-${String(count + 1).padStart(3, "0")}`;

    const employee = await prisma.employee.create({
      data: {
        employeeId,
        firstName,
        lastName,
        email:          email.toLowerCase().trim(),
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
      },
    });

    return NextResponse.json(employee, { status: 201 });
  } catch (error: unknown) {
    console.error("Create employee error:", error);
    if (error && typeof error === "object" && "code" in error && error.code === "P2002") {
      return NextResponse.json({ error: "An employee with this email already exists." }, { status: 409 });
    }
    return NextResponse.json({ error: "Failed to create employee" }, { status: 500 });
  }
}
