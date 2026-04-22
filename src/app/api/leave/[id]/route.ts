import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const leave = await prisma.leaveRequest.update({
      where: { id },
      data: { status: body.status, approvedBy: body.approvedBy },
    });
    return NextResponse.json(leave);
  } catch (error) {
    console.error("Update leave error:", error);
    return NextResponse.json({ error: "Failed to update leave" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.leaveRequest.delete({ where: { id } });
    return NextResponse.json({ message: "Leave request deleted" });
  } catch (error) {
    console.error("Delete leave error:", error);
    return NextResponse.json({ error: "Failed to delete leave" }, { status: 500 });
  }
}
