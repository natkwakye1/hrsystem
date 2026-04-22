import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function getSession(request: NextRequest) {
  const cookie = request.cookies.get("emp-session")?.value;
  if (!cookie) return null;
  try {
    return JSON.parse(Buffer.from(cookie, "base64").toString("utf-8"));
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const session = getSession(request);
  if (!session?.employeeId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const employee = await prisma.employee.findUnique({
      where: { id: session.employeeId },
      include: {
        leaveRequests: { orderBy: { createdAt: "desc" }, take: 50 },
        payrolls: { orderBy: { createdAt: "desc" }, take: 24 },
        benefits: {
          include: { benefit: true },
          where: { status: "Active" },
        },
        bankAccounts: true,
        contacts: true,
      },
    });

    if (!employee)
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });

    return NextResponse.json({ session, employee });
  } catch (error) {
    console.error("Employee me error:", error);
    return NextResponse.json({ error: "Failed to load data" }, { status: 500 });
  }
}
