import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "";
    const status = searchParams.get("status") || "";

    const where: Record<string, unknown> = {};
    if (period) where.period = period;
    if (status) where.status = status;

    const payrolls = await prisma.payroll.findMany({
      where,
      include: { employee: { select: { firstName: true, lastName: true, employeeId: true, department: true, position: true, bankAccounts: true } } },
      orderBy: { createdAt: "desc" },
    });

    const summary = {
      totalBasic: payrolls.reduce((s, p) => s + p.basicSalary, 0),
      totalAllowances: payrolls.reduce((s, p) => s + p.allowances, 0),
      totalDeductions: payrolls.reduce((s, p) => s + p.deductions, 0),
      totalTax: payrolls.reduce((s, p) => s + p.tax, 0),
      totalNet: payrolls.reduce((s, p) => s + p.netPay, 0),
    };

    return NextResponse.json({ payrolls, summary });
  } catch (error) {
    console.error("Payroll list error:", error);
    return NextResponse.json({ error: "Failed to load payroll" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const payroll = await prisma.payroll.create({
      data: {
        employeeId: body.employeeId,
        period: body.period,
        basicSalary: parseFloat(body.basicSalary),
        allowances: parseFloat(body.allowances || "0"),
        deductions: parseFloat(body.deductions || "0"),
        tax: parseFloat(body.tax || "0"),
        netPay: parseFloat(body.netPay),
        status: body.status || "Pending",
        paymentDate: body.paymentDate,
        paymentMethod: body.paymentMethod,
      },
    });
    return NextResponse.json(payroll, { status: 201 });
  } catch (error) {
    console.error("Create payroll error:", error);
    return NextResponse.json({ error: "Failed to create payroll" }, { status: 500 });
  }
}
