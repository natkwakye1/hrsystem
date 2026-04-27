-- Create Company table
CREATE TABLE IF NOT EXISTS "Company" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "emailDomain" TEXT,
  "industry" TEXT,
  "size" INTEGER NOT NULL DEFAULT 1,
  "plan" TEXT NOT NULL DEFAULT 'free',
  "logoUrl" TEXT,
  "website" TEXT,
  "phone" TEXT,
  "address" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Company_slug_key" ON "Company"("slug");

-- Create CompanyPermissions table
CREATE TABLE IF NOT EXISTS "CompanyPermissions" (
  "id" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  "employeeLeave" BOOLEAN NOT NULL DEFAULT true,
  "employeePayslips" BOOLEAN NOT NULL DEFAULT true,
  "employeeProfile" BOOLEAN NOT NULL DEFAULT true,
  "employeeRequests" BOOLEAN NOT NULL DEFAULT true,
  "employeeBenefits" BOOLEAN NOT NULL DEFAULT true,
  "financePayroll" BOOLEAN NOT NULL DEFAULT true,
  "financeBudgets" BOOLEAN NOT NULL DEFAULT true,
  "financeReports" BOOLEAN NOT NULL DEFAULT true,
  CONSTRAINT "CompanyPermissions_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "CompanyPermissions_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "CompanyPermissions_companyId_key" ON "CompanyPermissions"("companyId");

-- Add companyId to User
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "companyId" TEXT;

-- Add companyId and tempPassword to Employee
ALTER TABLE "Employee" ADD COLUMN IF NOT EXISTS "companyId" TEXT;
ALTER TABLE "Employee" ADD COLUMN IF NOT EXISTS "tempPassword" TEXT;

-- Foreign keys (safe to run even if they fail due to already existing)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'User_companyId_fkey'
  ) THEN
    ALTER TABLE "User" ADD CONSTRAINT "User_companyId_fkey"
      FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'Employee_companyId_fkey'
  ) THEN
    ALTER TABLE "Employee" ADD CONSTRAINT "Employee_companyId_fkey"
      FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

-- Grant permissions to the app user (run as postgres superuser via Supabase SQL Editor)
GRANT ALL PRIVILEGES ON TABLE "Company" TO hrsystem_app;
GRANT ALL PRIVILEGES ON TABLE "CompanyPermissions" TO hrsystem_app;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO hrsystem_app;
GRANT USAGE ON SCHEMA public TO hrsystem_app;
