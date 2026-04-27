import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!session.companyId) {
      return NextResponse.json({ permissions: null });
    }

    const permissions = await prisma.companyPermissions.findUnique({
      where: { companyId: session.companyId },
    });

    return NextResponse.json({ permissions });
  } catch (error) {
    console.error("Get permissions error:", error);
    return NextResponse.json({ error: "Failed to load permissions" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!session.companyId) {
      return NextResponse.json({ error: "No company associated with this account." }, { status: 400 });
    }

    const { permissions } = await request.json();

    const updated = await prisma.companyPermissions.upsert({
      where: { companyId: session.companyId },
      create: { companyId: session.companyId, ...permissions },
      update: permissions,
    });

    return NextResponse.json({ permissions: updated });
  } catch (error) {
    console.error("Update permissions error:", error);
    return NextResponse.json({ error: "Failed to update permissions" }, { status: 500 });
  }
}
