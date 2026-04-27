import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { sendEmail } from "@/lib/email";

function generatePassword(length = 12) {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$";
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { action } = body;

    const target = await prisma.user.findUnique({ where: { id } });
    if (!target) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Admin can only manage users in their own company
    if (session.companyId && target.companyId !== session.companyId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    if (action === "reset-password") {
      const newPassword = generatePassword();
      const hashed = await bcrypt.hash(newPassword, 12);

      await prisma.user.update({ where: { id }, data: { password: hashed } });

      // Get company name for email
      const company = session.companyId
        ? await prisma.company.findUnique({ where: { id: session.companyId } })
        : null;

      const portalLabel =
        target.role === "finance"  ? "Finance Portal"  :
        target.role === "employee" ? "Employee Portal"  : "Admin Portal";

      await sendEmail({
        to: target.email,
        subject: `Your ${company?.name || "NeraAdmin"} password has been reset`,
        html: `
          <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px">
            <div style="background:#1d4ed8;border-radius:10px;padding:20px 24px;margin-bottom:24px">
              <h2 style="color:#fff;margin:0;font-size:20px">Password Reset</h2>
              <p style="color:rgba(255,255,255,0.8);margin:6px 0 0;font-size:13px">${company?.name || "NeraAdmin"}</p>
            </div>
            <p style="color:#374151;font-size:14px">Hi <strong>${target.name}</strong>,</p>
            <p style="color:#374151;font-size:14px">Your password has been reset by the company administrator. Use the credentials below to log in.</p>
            <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:20px 24px;margin:20px 0">
              <p style="margin:0 0 10px;font-size:12px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.05em">Your new credentials</p>
              <p style="margin:0 0 6px;font-size:13px;color:#0f172a"><strong>Email:</strong> ${target.email}</p>
              <p style="margin:0 0 6px;font-size:13px;color:#0f172a"><strong>Password:</strong> <code style="background:#e2e8f0;padding:2px 8px;border-radius:4px">${newPassword}</code></p>
              <p style="margin:6px 0 0;font-size:13px;color:#0f172a"><strong>Portal:</strong> ${portalLabel}</p>
            </div>
            <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/login" style="display:inline-block;background:#1d4ed8;color:#fff;padding:11px 24px;border-radius:8px;font-size:14px;font-weight:600;text-decoration:none">Sign In Now</a>
            <p style="color:#94a3b8;font-size:12px;margin-top:24px">If you did not request this change, contact your HR administrator immediately.</p>
          </div>
        `,
      });

      return NextResponse.json({ message: "Password reset and email sent.", newPassword });
    }

    return NextResponse.json({ error: "Invalid action." }, { status: 400 });
  } catch (error) {
    console.error("Admin user action error:", error);
    return NextResponse.json({ error: "Failed to perform action." }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params;
    if (id === session.id) {
      return NextResponse.json({ error: "You cannot delete your own account." }, { status: 400 });
    }
    const target = await prisma.user.findUnique({ where: { id } });
    if (!target) return NextResponse.json({ error: "User not found" }, { status: 404 });
    if (session.companyId && target.companyId !== session.companyId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Delete user error:", error);
    return NextResponse.json({ error: "Failed to delete user." }, { status: 500 });
  }
}
