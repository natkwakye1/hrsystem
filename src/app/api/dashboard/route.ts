import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [
      totalEmployees,
      activeEmployees,
      onLeave,
      payrolls,
      pendingLeaves,
      openPositions,
      recentEmployees,
      departments,
      recentLeaves,
    ] = await Promise.all([
      prisma.employee.count(),
      prisma.employee.count({ where: { status: "Active" } }),
      prisma.employee.count({ where: { status: "On Leave" } }),
      prisma.payroll.findMany({ where: { period: "March 2026" } }),
      prisma.leaveRequest.count({ where: { status: "Pending" } }),
      prisma.recruitment.count({ where: { status: "Open" } }),
      prisma.employee.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          position: true,
          department: true,
          status: true,
          hireDate: true,
        },
      }),
      prisma.employee.groupBy({
        by: ["department"],
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
      }),
      prisma.leaveRequest.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          employee: { select: { firstName: true, lastName: true } },
        },
      }),
    ]);

    const totalPayroll = payrolls.reduce((sum, p) => sum + p.netPay, 0);
    const departmentCounts = departments.map((d) => ({
      name: d.department || "Unknown",
      count: d._count.id,
    }));

    const formattedLeaves = recentLeaves.map((l) => ({
      id: l.id,
      employeeName: `${l.employee.firstName} ${l.employee.lastName}`,
      leaveType: l.leaveType,
      days: l.days,
      status: l.status,
    }));

    return NextResponse.json({
      totalEmployees,
      activeEmployees,
      onLeave,
      totalPayroll,
      pendingLeaves,
      openPositions,
      recentEmployees,
      departmentCounts,
      recentLeaves: formattedLeaves,
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    return NextResponse.json({ error: "Failed to load dashboard" }, { status: 500 });
  }
}
