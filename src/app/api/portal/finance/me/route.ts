import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function getSession(request: NextRequest) {
  const cookie = request.cookies.get("fin-session")?.value;
  if (!cookie) return null;
  try {
    return JSON.parse(Buffer.from(cookie, "base64").toString("utf-8"));
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const session = getSession(request);
  if (!session?.userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { id: true, email: true, name: true, role: true },
    });
    if (!user || user.role !== "finance")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Finance me error:", error);
    return NextResponse.json({ error: "Failed to load data" }, { status: 500 });
  }
}
