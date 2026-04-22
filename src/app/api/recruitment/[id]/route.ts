import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const job = await prisma.recruitment.findUnique({ where: { id } });
    if (!job) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(job);
  } catch (error) {
    console.error("Get job error:", error);
    return NextResponse.json({ error: "Failed to get job" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const job = await prisma.recruitment.update({
      where: { id },
      data: {
        jobTitle: body.jobTitle,
        department: body.department,
        location: body.location,
        employmentType: body.employmentType,
        description: body.description,
        requirements: body.requirements,
        salaryMin: body.salaryMin ? parseFloat(body.salaryMin) : undefined,
        salaryMax: body.salaryMax ? parseFloat(body.salaryMax) : undefined,
        status: body.status,
        closingDate: body.closingDate,
      },
    });
    return NextResponse.json(job);
  } catch (error) {
    console.error("Update job error:", error);
    return NextResponse.json({ error: "Failed to update job" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.recruitment.delete({ where: { id } });
    return NextResponse.json({ message: "Job deleted" });
  } catch (error) {
    console.error("Delete job error:", error);
    return NextResponse.json({ error: "Failed to delete job" }, { status: 500 });
  }
}
