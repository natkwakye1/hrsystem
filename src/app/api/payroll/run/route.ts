import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { period, taxRate = 0.15, userEmail = "finance@nera.com" } = body;
    if (!period) return NextResponse.json({ error: "Period required" }, { status: 400 });

    // Get all active employees
    const employees = await prisma.employee.findMany({
      where: { status: "Active" },
      include: {
        employeeDeductions: { where: { status: "Active" } },
        benefits: { where: { status: "Active" }, include: { benefit: true } },
      },
    });

    // Skip employees that already have payroll for this period
    const existing = await prisma.payroll.findMany({
      where: { period },
      select: { employeeId: true },
    });
    const existingIds = new Set(existing.map((p) => p.employeeId));

    const toProcess = employees.filter((e) => !existingIds.has(e.id));
    if (toProcess.length === 0) {
      return NextResponse.json({ message: "All employees already processed for this period", created: 0 });
    }

    const created: string[] = [];
    for (const emp of toProcess) {
      const basicSalary = emp.salary;
      const allowances = emp.benefits.reduce((s, b) => s + (b.benefit.amount ?? 0), 0);
      const gross = basicSalary + allowances;
      const tax = Math.round(gross * taxRate * 100) / 100;
      const deductions = emp.employeeDeductions.reduce((s, d) => s + d.amount, 0);
      const netPay = Math.round((gross - tax - deductions) * 100) / 100;

      const payroll = await prisma.payroll.create({
        data: { employeeId: emp.id, period, basicSalary, allowances, tax, deductions, netPay, status: "Pending" },
      });
      created.push(payroll.id);

      // Notify employee
      await prisma.notification.create({
        data: {
          employeeId: emp.id,
          title: "Payroll Processed",
          message: `Your payroll for ${period} has been processed. Net pay: $${netPay.toLocaleString()}. Status: Pending approval.`,
          type: "info",
        },
      });
    }

    // Audit log
    await prisma.auditLog.create({
      data: {
        userEmail,
        action: "Run Payroll",
        entity: "Payroll",
        details: `Batch payroll for period ${period}. ${created.length} records created. Tax rate: ${(taxRate * 100).toFixed(0)}%.`,
      },
    });

    return NextResponse.json({ created: created.length, period, message: `Payroll processed for ${created.length} employees.` });
  } catch (error) {
    console.error("Run payroll error:", error);
    return NextResponse.json({ error: "Failed to run payroll" }, { status: 500 });
  }
}
