import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [benefits, deductions] = await Promise.all([
      prisma.benefit.findMany({ orderBy: { createdAt: "desc" } }),
      prisma.deduction.findMany({ orderBy: { createdAt: "desc" } }),
    ]);
    return NextResponse.json({ benefits, deductions });
  } catch (error) {
    console.error("Benefits list error:", error);
    return NextResponse.json({ error: "Failed to load benefits" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (body.itemType === "deduction") {
      const deduction = await prisma.deduction.create({
        data: {
          name: body.name,
          type: body.type,
          description: body.description,
          amount: body.amount ? parseFloat(body.amount) : undefined,
          percentage: body.percentage ? parseFloat(body.percentage) : undefined,
        },
      });
      return NextResponse.json(deduction, { status: 201 });
    }

    const benefit = await prisma.benefit.create({
      data: {
        name: body.name,
        type: body.type,
        description: body.description,
        amount: body.amount ? parseFloat(body.amount) : undefined,
      },
    });
    return NextResponse.json(benefit, { status: 201 });
  } catch (error) {
    console.error("Create benefit error:", error);
    return NextResponse.json({ error: "Failed to create benefit" }, { status: 500 });
  }
}
