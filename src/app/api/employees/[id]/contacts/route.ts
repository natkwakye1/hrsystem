import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const contacts = await prisma.contact.findMany({ where: { employeeId: id } });
  return NextResponse.json(contacts);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const contact = await prisma.contact.create({
      data: {
        employeeId: id,
        name: body.name,
        relationship: body.relationship,
        phone: body.phone,
        email: body.email,
        address: body.address,
        isPrimary: body.isPrimary || false,
        category: body.category || "Emergency",
      },
    });
    return NextResponse.json(contact, { status: 201 });
  } catch (error) {
    console.error("Create contact error:", error);
    return NextResponse.json({ error: "Failed to create contact" }, { status: 500 });
  }
}
