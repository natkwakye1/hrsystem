import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [
      totalEmployees,
      activeEmployees,
      openPositions,
      departments,
      employmentTypes,
      leaveByTypeAndStatus,
      payrolls,
      genderBreakdown,
    ] = await Promise.all([
      prisma.employee.count(),
      prisma.employee.count({ where: { status: "Active" } }),
      prisma.recruitment.count({ where: { status: "Open" } }),
      prisma.employee.groupBy({
        by: ["department"],
        _count: { id: true },
        _avg:   { salary: true },
        _sum:   { salary: true },
      }),
      prisma.employee.groupBy({
        by: ["employmentType"],
        _count: { id: true },
      }),
      prisma.leaveRequest.groupBy({
        by: ["leaveType", "status"],
        _count: { id: true },
      }),
      prisma.payroll.findMany({
        where: { status: { in: ["Processed", "Paid"] } },
        select: { netPay: true },
      }),
      prisma.employee.groupBy({
        by: ["gender"],
        _count: { id: true },
      }),
    ]);

    const totalPayroll = payrolls.reduce((s, p) => s + p.netPay, 0);
    const avgSalary =
      departments.length > 0
        ? departments.reduce((s, d) => s + (d._avg.salary ?? 0), 0) / departments.length
        : 0;

    // Build leaveStats grouped by leaveType with per-status counts
    const leaveMap: Record<string, { total: number; approved: number; pending: number; rejected: number }> = {};
    for (const row of leaveByTypeAndStatus) {
      const key = row.leaveType ?? "Other";
      if (!leaveMap[key]) leaveMap[key] = { total: 0, approved: 0, pending: 0, rejected: 0 };
      const n = row._count.id;
      leaveMap[key].total += n;
      const s = (row.status ?? "").toLowerCase();
      if (s === "approved") leaveMap[key].approved += n;
      else if (s === "pending") leaveMap[key].pending += n;
      else if (s === "rejected") leaveMap[key].rejected += n;
    }

    return NextResponse.json({
      // top-level fields both pages read directly
      totalEmployees,
      activeEmployees,
      totalPayroll,
      avgSalary: Math.round(avgSalary),
      openPositions,

      departmentStats: departments.map((d) => ({
        department: d.department ?? "Unknown",
        count:      d._count.id,
        avgSalary:  Math.round(d._avg.salary ?? 0),
        totalSalary: Math.round(d._sum.salary ?? 0),
      })),

      employmentTypeStats: employmentTypes.map((e) => ({
        type:  e.employmentType ?? "Unknown",
        count: e._count.id,
      })),

      leaveStats: Object.entries(leaveMap).map(([leaveType, counts]) => ({
        leaveType,
        ...counts,
      })),

      genderBreakdown: genderBreakdown.map((g) => ({
        gender: g.gender ?? "Not Specified",
        count:  g._count.id,
      })),
    });
  } catch (error) {
    console.error("Reports error:", error);
    return NextResponse.json({ error: "Failed to load reports" }, { status: 500 });
  }
}
