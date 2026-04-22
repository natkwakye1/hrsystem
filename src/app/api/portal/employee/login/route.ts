import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    if (!email || !password)
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });

    const lower = email.toLowerCase().trim();

    // First: check User table for role=employee
    const user = await prisma.user.findUnique({ where: { email: lower } });
    if (user) {
      if (user.role !== "employee")
        return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
      const valid = await bcrypt.compare(password, user.password);
      if (!valid)
        return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });

      const employee = await prisma.employee.findUnique({ where: { email: lower } });
      const token = Buffer.from(
        JSON.stringify({ userId: user.id, employeeId: employee?.id ?? null, name: user.name, email: user.email })
      ).toString("base64");

      const res = NextResponse.json({ message: "Login successful.", employee });
      res.cookies.set("emp-session", token, {
        httpOnly: true, secure: process.env.NODE_ENV === "production",
        sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 7,
      });
      return res;
    }

    // Fallback: employee exists, use employeeId as password (auto-provision)
    const employee = await prisma.employee.findUnique({ where: { email: lower } });
    if (!employee)
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });

    if (password !== employee.employeeId)
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });

    // Auto-create user account
    const hashed = await bcrypt.hash(employee.employeeId, 10);
    const newUser = await prisma.user.create({
      data: {
        email: lower,
        password: hashed,
        name: `${employee.firstName} ${employee.lastName}`,
        role: "employee",
      },
    });

    const token = Buffer.from(
      JSON.stringify({ userId: newUser.id, employeeId: employee.id, name: newUser.name, email: newUser.email })
    ).toString("base64");

    const res = NextResponse.json({ message: "Login successful.", employee });
    res.cookies.set("emp-session", token, {
      httpOnly: true, secure: process.env.NODE_ENV === "production",
      sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 7,
    });
    return res;
  } catch (error) {
    console.error("Employee portal login error:", error);
    return NextResponse.json({ error: "An error occurred. Please try again." }, { status: 500 });
  }
}
