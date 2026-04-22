import { cookies } from "next/headers";
import { prisma } from "./prisma";

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session")?.value;
  if (!sessionToken) return null;

  try {
    const decoded = JSON.parse(
      Buffer.from(sessionToken, "base64").toString("utf-8")
    );
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, name: true, role: true },
    });
    return user;
  } catch {
    return null;
  }
}

export function createSessionToken(user: {
  id: string;
  email: string;
  name: string;
  role: string;
}): string {
  return Buffer.from(
    JSON.stringify({ id: user.id, email: user.email, name: user.name, role: user.role })
  ).toString("base64");
}
