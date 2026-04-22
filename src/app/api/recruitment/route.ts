import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const jobs = await prisma.recruitment.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json(jobs);
  } catch (error) {
    console.error("Recruitment list error:", error);
    return NextResponse.json({ error: "Failed to load jobs" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const job = await prisma.recruitment.create({
      data: {
        jobTitle: body.jobTitle,
        department: body.department,
        location: body.location,
        employmentType: body.employmentType,
        description: body.description,
        requirements: body.requirements,
        salaryMin: body.salaryMin ? parseFloat(body.salaryMin) : undefined,
        salaryMax: body.salaryMax ? parseFloat(body.salaryMax) : undefined,
        status: "Open",
        postedDate: new Date().toISOString().split("T")[0],
        closingDate: body.closingDate,
      },
    });
    return NextResponse.json(job, { status: 201 });
  } catch (error) {
    console.error("Create job error:", error);
    return NextResponse.json({ error: "Failed to create job" }, { status: 500 });
  }
}
