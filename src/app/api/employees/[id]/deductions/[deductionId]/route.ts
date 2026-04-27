import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string; deductionId: string }> };

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { deductionId } = await params;
  await prisma.employeeDeduction.delete({ where: { id: deductionId } });
  return NextResponse.json({ ok: true });
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const { deductionId } = await params;
  const body = await request.json();
  const deduction = await prisma.employeeDeduction.update({
    where: { id: deductionId },
    data: { status: body.status },
  });
  return NextResponse.json(deduction);
}
