import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const employee = await prisma.employee.findUnique({
      where: { id },
      include: {
        bankAccounts: true,
        contacts: true,
        documents: true,
        leaveRequests: { orderBy: { createdAt: "desc" }, take: 5 },
        payrolls: { orderBy: { createdAt: "desc" }, take: 5 },
        benefits: { include: { benefit: true } },
        onboarding: true,
      },
    });

    if (!employee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }

    return NextResponse.json(employee);
  } catch (error) {
    console.error("Get employee error:", error);
    return NextResponse.json({ error: "Failed to load employee" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const employee = await prisma.employee.update({
      where: { id },
      data: {
        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email,
        phone: body.phone,
        dateOfBirth: body.dateOfBirth,
        gender: body.gender,
        maritalStatus: body.maritalStatus,
        nationality: body.nationality,
        address: body.address,
        city: body.city,
        state: body.state,
        country: body.country,
        postalCode: body.postalCode,
        department: body.department,
        position: body.position,
        employmentType: body.employmentType,
        status: body.status,
        salary: body.salary ? parseFloat(body.salary) : undefined,
      },
    });

    return NextResponse.json(employee);
  } catch (error) {
    console.error("Update employee error:", error);
    return NextResponse.json({ error: "Failed to update employee" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.employee.delete({ where: { id } });
    return NextResponse.json({ message: "Employee deleted" });
  } catch (error) {
    console.error("Delete employee error:", error);
    return NextResponse.json({ error: "Failed to delete employee" }, { status: 500 });
  }
}
