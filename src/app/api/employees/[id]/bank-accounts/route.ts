import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const accounts = await prisma.bankAccount.findMany({ where: { employeeId: id } });
  return NextResponse.json(accounts);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const account = await prisma.bankAccount.create({
      data: {
        employeeId: id,
        bankName: body.bankName,
        accountNumber: body.accountNumber,
        accountType: body.accountType,
        branchName: body.branchName,
        routingNumber: body.routingNumber,
        isPrimary: body.isPrimary || false,
      },
    });
    return NextResponse.json(account, { status: 201 });
  } catch (error) {
    console.error("Create bank account error:", error);
    return NextResponse.json({ error: "Failed to create bank account" }, { status: 500 });
  }
}
