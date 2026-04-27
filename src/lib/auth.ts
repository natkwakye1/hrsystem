import { cookies } from "next/headers";
import { prisma } from "./prisma";

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: string;
  companyId?: string | null;
  companySlug?: string | null;
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session")?.value;
  if (!sessionToken) return null;
  return getSessionUser(sessionToken);
}

export async function getFinanceSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("fin-session")?.value;
  if (!token) return null;
  return getSessionUser(token);
}

export async function getEmployeeSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("emp-session")?.value;
  if (!token) return null;
  return getSessionUser(token);
}

export async function getSessionUser(token: string): Promise<SessionUser | null> {
  try {
    const decoded = JSON.parse(Buffer.from(token, "base64").toString("utf-8"));
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, name: true, role: true, companyId: true },
    });
    if (!user) return null;
    // Attach companySlug from decoded token (avoids extra DB join)
    return { ...user, companySlug: decoded.companySlug ?? null };
  } catch {
    return null;
  }
}

export function createSessionToken(user: {
  id: string;
  email: string;
  name: string;
  role: string;
  companySlug?: string | null;
}): string {
  return Buffer.from(
    JSON.stringify({
      id: user.id, email: user.email, name: user.name,
      role: user.role, companySlug: user.companySlug ?? null,
    })
  ).toString("base64");
}
