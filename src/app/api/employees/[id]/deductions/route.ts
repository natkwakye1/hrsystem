import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const deductions = await prisma.employeeDeduction.findMany({
    where: { employeeId: id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ deductions });
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const deduction = await prisma.employeeDeduction.create({
    data: {
      employeeId: id,
      name: body.name,
      type: body.type ?? "other",
      amount: parseFloat(body.amount),
      balance: body.balance ? parseFloat(body.balance) : parseFloat(body.amount),
      startDate: body.startDate,
      endDate: body.endDate,
      status: body.status ?? "Active",
    },
  });
  return NextResponse.json(deduction, { status: 201 });
}
