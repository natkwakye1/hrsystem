import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const documents = await prisma.document.findMany({ where: { employeeId: id }, orderBy: { createdAt: "desc" } });
  return NextResponse.json(documents);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const doc = await prisma.document.create({
      data: {
        employeeId: id,
        title: body.title,
        type: body.type,
        fileUrl: body.fileUrl,
        fileSize: body.fileSize,
        status: body.status || "Pending",
        expiryDate: body.expiryDate,
      },
    });
    return NextResponse.json(doc, { status: 201 });
  } catch (error) {
    console.error("Create document error:", error);
    return NextResponse.json({ error: "Failed to create document" }, { status: 500 });
  }
}
