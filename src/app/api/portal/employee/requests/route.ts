import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

async function getSession() {
  const jar = await cookies();
  const raw = jar.get("emp-session")?.value;
  if (!raw) return null;
  try { return JSON.parse(Buffer.from(raw, "base64").toString()); } catch { return null; }
}

export async function GET() {
  const session = await getSession();
  if (!session || !session.employeeId) return NextResponse.json({ requests: [] });
  const requests = await prisma.employeeRequest.findMany({
    where: { employeeId: session.employeeId },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ requests });
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || !session.employeeId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();
  const req = await prisma.employeeRequest.create({
    data: {
      employeeId: session.employeeId,
      type: body.type,
      subject: body.subject,
      description: body.description,
      amount: body.amount ? parseFloat(body.amount) : undefined,
    },
  });
  return NextResponse.json(req, { status: 201 });
}
