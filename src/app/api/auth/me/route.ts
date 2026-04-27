import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let isOnboarded = true;
  if (session.companyId) {
    const company = await prisma.company.findUnique({
      where: { id: session.companyId },
      select: { isOnboarded: true },
    });
    isOnboarded = company?.isOnboarded ?? true;
  }

  return NextResponse.json({ user: session, isOnboarded });
}
