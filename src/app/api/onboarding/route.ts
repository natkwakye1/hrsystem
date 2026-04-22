import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const onboardings = await prisma.onboarding.findMany({
      include: { employee: { select: { firstName: true, lastName: true, department: true, position: true, employeeId: true } } },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(onboardings);
  } catch (error) {
    console.error("Onboarding list error:", error);
    return NextResponse.json({ error: "Failed to load onboarding" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const onboarding = await prisma.onboarding.create({
      data: {
        employeeId: body.employeeId,
        status: "In Progress",
        startDate: body.startDate || new Date().toISOString().split("T")[0],
        progress: 0,
        tasks: JSON.stringify([
          { name: "Documentation", completed: false },
          { name: "IT Setup", completed: false },
          { name: "Team Introduction", completed: false },
          { name: "Training", completed: false },
        ]),
      },
    });
    return NextResponse.json(onboarding, { status: 201 });
  } catch (error) {
    console.error("Create onboarding error:", error);
    return NextResponse.json({ error: "Failed to create onboarding" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const tasks = body.tasks || [];
    const completedCount = tasks.filter((t: { completed: boolean }) => t.completed).length;
    const progress = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

    const onboarding = await prisma.onboarding.update({
      where: { id: body.id },
      data: {
        tasks: JSON.stringify(tasks),
        progress,
        status: progress === 100 ? "Completed" : "In Progress",
        completedAt: progress === 100 ? new Date().toISOString().split("T")[0] : null,
      },
    });
    return NextResponse.json(onboarding);
  } catch (error) {
    console.error("Update onboarding error:", error);
    return NextResponse.json({ error: "Failed to update onboarding" }, { status: 500 });
  }
}
