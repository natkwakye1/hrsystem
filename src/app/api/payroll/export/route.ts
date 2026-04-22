import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "";
    const status = searchParams.get("status") || "Processed";

    const where: Record<string, unknown> = {};
    if (period) where.period = period;
    if (status) where.status = status;

    const payrolls = await prisma.payroll.findMany({
      where,
      include: {
        employee: {
          select: { firstName: true, lastName: true, employeeId: true, bankAccounts: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Build CSV
    const header = "Employee Name,Employee ID,Bank Name,Account Number,Account Type,Net Pay,Period,Status";
    const rows = payrolls.map((p) => {
      const primary = p.employee.bankAccounts.find((b) => b.isPrimary) ?? p.employee.bankAccounts[0];
      return [
        `"${p.employee.firstName} ${p.employee.lastName}"`,
        p.employee.employeeId,
        `"${primary?.bankName ?? "N/A"}"`,
        primary?.accountNumber ?? "N/A",
        primary?.accountType ?? "N/A",
        p.netPay.toFixed(2),
        p.period,
        p.status,
      ].join(",");
    });

    const csv = [header, ...rows].join("\n");
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="payroll-export-${period || "all"}.csv"`,
      },
    });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json({ error: "Failed to export" }, { status: 500 });
  }
}
