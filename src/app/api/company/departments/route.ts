import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session || !session.companyId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const departments = await prisma.department.findMany({
    where: { companyId: session.companyId },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json({ departments });
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin" || !session.companyId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { name, description } = await request.json();
  if (!name?.trim()) {
    return NextResponse.json({ error: "Department name is required" }, { status: 400 });
  }
  const existing = await prisma.department.findFirst({
    where: { name: { equals: name.trim() }, companyId: session.companyId },
  });
  if (existing) {
    return NextResponse.json({ error: "Department already exists" }, { status: 409 });
  }
  const department = await prisma.department.create({
    data: { name: name.trim(), description: description ?? undefined, companyId: session.companyId },
  });
  return NextResponse.json({ department }, { status: 201 });
}
