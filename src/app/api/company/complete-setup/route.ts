import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin" || !session.companyId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json().catch(() => ({}));
  const updateData: Record<string, unknown> = { isOnboarded: true };

  // Optionally save permissions if passed
  if (body.permissions) {
    await prisma.companyPermissions.upsert({
      where: { companyId: session.companyId },
      update: body.permissions,
      create: { companyId: session.companyId, ...body.permissions },
    });
  }

  await prisma.company.update({
    where: { id: session.companyId },
    data: updateData,
  });

  return NextResponse.json({ ok: true });
}
