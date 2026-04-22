import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string; appId: string }> }) {
  const { appId } = await params;
  const body = await request.json();
  const applicant = await prisma.applicant.update({
    where: { id: appId },
    data: {
      status: body.status,
      notes: body.notes,
      score: body.score !== undefined ? parseFloat(body.score) : undefined,
    },
  });
  // If hired, reduce open count
  if (body.status === "Hired") {
    await prisma.recruitment.update({
      where: { id: applicant.recruitmentId },
      data: { status: "Closed" },
    }).catch(() => {});
  }
  return NextResponse.json(applicant);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string; appId: string }> }) {
  const { appId } = await params;
  const applicant = await prisma.applicant.delete({ where: { id: appId } });
  await prisma.recruitment.update({
    where: { id: applicant.recruitmentId },
    data: { applicants: { decrement: 1 } },
  }).catch(() => {});
  return NextResponse.json({ success: true });
}
