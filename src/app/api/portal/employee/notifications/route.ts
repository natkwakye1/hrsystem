import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

async function getSession() {
  const jar = await cookies();
  const raw = jar.get("emp-session")?.value;
  if (!raw) return null;
  try { return JSON.parse(Buffer.from(raw, "base64").toString()); } catch { return null; }
}

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const notifications = await prisma.notification.findMany({
    where: { employeeId: session.employeeId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return NextResponse.json({ notifications });
}

export async function PATCH(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();
  // Mark all as read or specific id
  if (body.all) {
    await prisma.notification.updateMany({
      where: { employeeId: session.employeeId, isRead: false },
      data: { isRead: true },
    });
  } else if (body.id) {
    await prisma.notification.update({ where: { id: body.id }, data: { isRead: true } });
  }
  return NextResponse.json({ success: true });
}
