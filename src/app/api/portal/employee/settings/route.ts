import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

async function getSession() {
  const jar = await cookies();
  const raw = jar.get("emp-session")?.value;
  if (!raw) return null;
  try { return JSON.parse(Buffer.from(raw, "base64").toString()); } catch { return null; }
}

export async function PATCH(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();

  if (body.newPassword) {
    // Verify current password
    const user = await prisma.user.findUnique({ where: { id: session.userId } });
    if (!user || user.password !== body.currentPassword) {
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
    }
    await prisma.user.update({ where: { id: session.userId }, data: { password: body.newPassword } });
  }
  return NextResponse.json({ success: true });
}
