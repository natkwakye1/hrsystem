import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { sendEmail, credentialsEmailHTML } from "@/lib/email";

const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? "https://hrsystem-psi.vercel.app";

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json();
    if (!name || !email || !password)
      return NextResponse.json({ error: "All fields are required." }, { status: 400 });
    if (password.length < 6)
      return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 });

    const lower = email.toLowerCase().trim();
    const existing = await prisma.user.findUnique({ where: { email: lower } });
    if (existing)
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });

    const hashed = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { name: name.trim(), email: lower, password: hashed, role: "finance" },
    });

    // Send welcome email (fire-and-forget)
    sendEmail({
      to: lower,
      subject: "Your NeraAdmin Finance Portal Account",
      html: credentialsEmailHTML({
        name: user.name,
        email: lower,
        password,
        portal: "Finance",
        loginUrl: `${BASE}/finance/login`,
      }),
    }).catch(() => {});

    const token = Buffer.from(
      JSON.stringify({ userId: user.id, name: user.name, email: user.email })
    ).toString("base64");

    const res = NextResponse.json({ message: "Account created.", user: { id: user.id, name: user.name, email: user.email } }, { status: 201 });
    res.cookies.set("fin-session", token, {
      httpOnly: true, secure: process.env.NODE_ENV === "production",
      sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 7,
    });
    return res;
  } catch (err) {
    console.error("Finance register error:", err);
    return NextResponse.json({ error: "An error occurred. Please try again." }, { status: 500 });
  }
}
