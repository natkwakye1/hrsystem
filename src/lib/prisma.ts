import { PrismaClient } from "@/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { resolve } from "path";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const envUrl = process.env.DATABASE_URL || "file:./dev.db";
  const filePath = envUrl.replace(/^file:/, "");
  const absPath = resolve(process.cwd(), filePath);
  const adapter = new PrismaBetterSqlite3({ url: `file:${absPath}` });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
