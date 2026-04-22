import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    if (!email || !password)
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });

    const lower = email.toLowerCase().trim();

    let user = await prisma.user.findUnique({ where: { email: lower } });

    // Auto-provision demo finance account
    if (!user && lower === "finance@nera.com") {
      const hashed = await bcrypt.hash("finance123", 10);
      user = await prisma.user.create({
        data: { email: lower, password: hashed, name: "Finance Manager", role: "finance" },
      });
    }

    if (!user || user.role !== "finance")
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid)
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });

    const token = Buffer.from(
      JSON.stringify({ userId: user.id, name: user.name, email: user.email })
    ).toString("base64");

    const res = NextResponse.json({ message: "Login successful.", user: { id: user.id, name: user.name, email: user.email } });
    res.cookies.set("fin-session", token, {
      httpOnly: true, secure: process.env.NODE_ENV === "production",
      sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 7,
    });
    return res;
  } catch (error) {
    console.error("Finance portal login error:", error);
    return NextResponse.json({ error: "An error occurred. Please try again." }, { status: 500 });
  }
}
