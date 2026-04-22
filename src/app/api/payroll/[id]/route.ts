import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();

    const data: Record<string, unknown> = {};
    if (body.status) data.status = body.status;
    if (body.paymentDate) data.paymentDate = body.paymentDate;

    const payroll = await prisma.payroll.update({ where: { id }, data });
    return NextResponse.json(payroll);
  } catch (error) {
    console.error("Update payroll error:", error);
    return NextResponse.json({ error: "Failed to update payroll" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.payroll.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete payroll error:", error);
    return NextResponse.json({ error: "Failed to delete payroll" }, { status: 500 });
  }
}
