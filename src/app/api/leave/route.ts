import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "";

    const where: Record<string, unknown> = {};
    if (status) where.status = status;

    const leaves = await prisma.leaveRequest.findMany({
      where,
      include: { employee: { select: { firstName: true, lastName: true, department: true, employeeId: true } } },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(leaves);
  } catch (error) {
    console.error("Leave list error:", error);
    return NextResponse.json({ error: "Failed to load leave requests" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const leave = await prisma.leaveRequest.create({
      data: {
        employeeId: body.employeeId,
        leaveType: body.leaveType,
        startDate: body.startDate,
        endDate: body.endDate,
        days: body.days,
        reason: body.reason,
        status: "Pending",
      },
    });
    return NextResponse.json(leave, { status: 201 });
  } catch (error) {
    console.error("Create leave error:", error);
    return NextResponse.json({ error: "Failed to create leave request" }, { status: 500 });
  }
}
