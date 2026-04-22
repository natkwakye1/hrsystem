import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "";
    const type = searchParams.get("type") || "";
    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (type) where.type = type;

    const requests = await prisma.employeeRequest.findMany({
      where,
      include: { employee: { select: { firstName: true, lastName: true, employeeId: true, department: true } } },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ requests });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
