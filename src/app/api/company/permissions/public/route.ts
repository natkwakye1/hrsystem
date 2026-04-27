import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getEmployeeSession, getFinanceSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    // Try employee session first, then finance
    const empSession = await getEmployeeSession();
    const finSession = await getFinanceSession();
    const session = empSession || finSession;

    if (!session?.companyId) {
      // Return default all-allowed permissions when no company is configured
      return NextResponse.json({
        permissions: {
          employeeLeave: true, employeePayslips: true,
          employeeProfile: true, employeeRequests: true,
          employeeBenefits: true, financePayroll: true,
          financeBudgets: true, financeReports: true,
        },
      });
    }

    const permissions = await prisma.companyPermissions.findUnique({
      where: { companyId: session.companyId },
    });

    return NextResponse.json({ permissions });
  } catch (error) {
    console.error("Public permissions error:", error);
    return NextResponse.json({ error: "Failed to load permissions" }, { status: 500 });
  }
}
