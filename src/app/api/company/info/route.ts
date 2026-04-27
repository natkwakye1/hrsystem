import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get("slug");
  if (!slug) return NextResponse.json({ error: "slug required" }, { status: 400 });

  try {
    const company = await prisma.company.findUnique({
      where: { slug },
      select: { name: true, slug: true, emailDomain: true, industry: true },
    });
    if (!company) return NextResponse.json({ error: "Company not found" }, { status: 404 });
    return NextResponse.json({ company });
  } catch {
    return NextResponse.json({ error: "Database error" }, { status: 503 });
  }
}
