import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function scoreApplicant(skills: string, experience: number, education: string, requirements: string): number {
  let score = 0;
  // Skills match (60 pts)
  const reqSkills = requirements.toLowerCase().split(/[\n,;]+/).map((s) => s.trim()).filter(Boolean);
  const appSkills = skills.toLowerCase().split(/[\n,;]+/).map((s) => s.trim()).filter(Boolean);
  if (reqSkills.length > 0) {
    const matched = reqSkills.filter((r) => appSkills.some((a) => a.includes(r) || r.includes(a))).length;
    score += Math.round((matched / reqSkills.length) * 60);
  } else {
    score += 30;
  }
  // Experience (25 pts)
  if (experience >= 7) score += 25;
  else if (experience >= 5) score += 20;
  else if (experience >= 3) score += 15;
  else if (experience >= 1) score += 10;
  else score += 5;
  // Education (15 pts)
  const edu = education.toLowerCase();
  if (edu.includes("phd") || edu.includes("doctorate")) score += 15;
  else if (edu.includes("master")) score += 12;
  else if (edu.includes("bachelor") || edu.includes("degree")) score += 9;
  else score += 5;
  return Math.min(score, 100);
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const applicants = await prisma.applicant.findMany({
    where: { recruitmentId: id },
    orderBy: [{ score: "desc" }, { createdAt: "desc" }],
  });
  return NextResponse.json({ applicants });
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const job = await prisma.recruitment.findUnique({ where: { id } });
  const score = scoreApplicant(
    body.skills ?? "",
    parseInt(body.experience ?? "0"),
    body.education ?? "",
    job?.requirements ?? ""
  );
  const applicant = await prisma.applicant.create({
    data: {
      recruitmentId: id,
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      phone: body.phone,
      coverLetter: body.coverLetter,
      skills: body.skills,
      experience: body.experience ? parseInt(body.experience) : undefined,
      education: body.education,
      status: "Applied",
      score,
      notes: body.notes,
    },
  });
  // Update applicant count on recruitment
  await prisma.recruitment.update({
    where: { id },
    data: { applicants: { increment: 1 } },
  });
  return NextResponse.json(applicant, { status: 201 });
}
