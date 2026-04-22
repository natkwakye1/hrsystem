import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const req = await prisma.employeeRequest.update({
      where: { id },
      data: {
        status: body.status,
        reviewNote: body.reviewNote,
        reviewedBy: body.reviewedBy,
      },
    });
    // Notify employee
    if (body.status && (body.status === "Approved" || body.status === "Rejected")) {
      await prisma.notification.create({
        data: {
          employeeId: req.employeeId,
          title: `Request ${body.status}`,
          message: `Your ${req.type} request "${req.subject}" has been ${body.status.toLowerCase()}.${body.reviewNote ? ` Note: ${body.reviewNote}` : ""}`,
          type: body.status === "Approved" ? "success" : "warning",
        },
      });
    }
    return NextResponse.json(req);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
