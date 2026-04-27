import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    // Admin user
    await prisma.user.upsert({
      where: { email: "admin@hrsystem.com" },
      update: {},
      create: {
        email: "admin@hrsystem.com",
        password: await bcrypt.hash("admin123", 10),
        name: "System Admin",
        role: "admin",
      },
    });

    // Departments (no unique constraint on name — use createMany with skipDuplicates not available for non-unique, so check first)
    for (const name of ["Engineering","Human Resources","Finance","Marketing","Sales","Operations","Legal","Product","Design","Support"]) {
      const exists = await prisma.department.findFirst({ where: { name, companyId: null } });
      if (!exists) await prisma.department.create({ data: { name, description: `${name} department` } });
    }

    // Employees
    const employees = [
      { employeeId: "EMP-001", firstName: "James",   lastName: "Wilson",   email: "james.wilson@company.com",   phone: "+1-555-0101", department: "Engineering",     position: "Senior Developer",    salary: 95000, hireDate: "2023-01-15", gender: "Male",   status: "Active"   },
      { employeeId: "EMP-002", firstName: "Sarah",   lastName: "Chen",     email: "sarah.chen@company.com",     phone: "+1-555-0102", department: "Design",           position: "UI/UX Lead",          salary: 88000, hireDate: "2023-03-20", gender: "Female", status: "Active"   },
      { employeeId: "EMP-003", firstName: "Michael", lastName: "Brown",    email: "michael.brown@company.com",  phone: "+1-555-0103", department: "Marketing",        position: "Marketing Manager",   salary: 82000, hireDate: "2022-11-10", gender: "Male",   status: "Active"   },
      { employeeId: "EMP-004", firstName: "Emily",   lastName: "Davis",    email: "emily.davis@company.com",    phone: "+1-555-0104", department: "Human Resources",  position: "HR Specialist",       salary: 72000, hireDate: "2023-06-01", gender: "Female", status: "Active"   },
      { employeeId: "EMP-005", firstName: "David",   lastName: "Martinez", email: "david.martinez@company.com", phone: "+1-555-0105", department: "Finance",          position: "Financial Analyst",   salary: 78000, hireDate: "2023-02-28", gender: "Male",   status: "Active"   },
      { employeeId: "EMP-006", firstName: "Lisa",    lastName: "Johnson",  email: "lisa.johnson@company.com",   phone: "+1-555-0106", department: "Sales",            position: "Sales Executive",     salary: 68000, hireDate: "2023-08-15", gender: "Female", status: "Active"   },
      { employeeId: "EMP-007", firstName: "Robert",  lastName: "Taylor",   email: "robert.taylor@company.com",  phone: "+1-555-0107", department: "Engineering",     position: "Backend Developer",   salary: 90000, hireDate: "2022-09-05", gender: "Male",   status: "Active"   },
      { employeeId: "EMP-008", firstName: "Anna",    lastName: "White",    email: "anna.white@company.com",     phone: "+1-555-0108", department: "Product",          position: "Product Manager",     salary: 92000, hireDate: "2023-04-12", gender: "Female", status: "Active"   },
      { employeeId: "EMP-009", firstName: "Chris",   lastName: "Lee",      email: "chris.lee@company.com",      phone: "+1-555-0109", department: "Operations",       position: "Operations Lead",     salary: 76000, hireDate: "2022-07-22", gender: "Male",   status: "On Leave" },
      { employeeId: "EMP-010", firstName: "Maria",   lastName: "Garcia",   email: "maria.garcia@company.com",   phone: "+1-555-0110", department: "Support",          position: "Support Manager",     salary: 70000, hireDate: "2023-05-18", gender: "Female", status: "Active"   },
      { employeeId: "EMP-011", firstName: "Thomas",  lastName: "Anderson", email: "thomas.anderson@company.com",phone: "+1-555-0111", department: "Engineering",     position: "Frontend Developer",  salary: 85000, hireDate: "2023-07-01", gender: "Male",   status: "Active"   },
      { employeeId: "EMP-012", firstName: "Jessica", lastName: "Moore",    email: "jessica.moore@company.com",  phone: "+1-555-0112", department: "Legal",            position: "Legal Advisor",       salary: 98000, hireDate: "2022-12-15", gender: "Female", status: "Active"   },
    ];

    for (const emp of employees) {
      const created = await prisma.employee.upsert({
        where: { employeeId: emp.employeeId },
        update: {},
        create: emp,
      });
      await prisma.bankAccount.create({ data: { employeeId: created.id, bankName: "National Bank", accountNumber: `****${Math.floor(1000 + Math.random() * 9000)}`, accountType: "Savings", isPrimary: true } }).catch(() => {});
      await prisma.contact.create({ data: { employeeId: created.id, name: `${emp.firstName}'s Contact`, relationship: "Spouse", phone: `+1-555-${Math.floor(1000 + Math.random() * 9000)}`, category: "Emergency", isPrimary: true } }).catch(() => {});
    }

    // Leave requests
    const empRecords = await prisma.employee.findMany({ take: 6 });
    const leaveTypes   = ["Annual Leave", "Sick Leave", "Personal", "Maternity Leave", "Paternity Leave"];
    const leaveStatuses = ["Pending", "Approved", "Rejected", "Approved", "Pending", "Approved"];
    for (let i = 0; i < empRecords.length; i++) {
      await prisma.leaveRequest.create({ data: { employeeId: empRecords[i].id, leaveType: leaveTypes[i % leaveTypes.length], startDate: "2026-03-20", endDate: "2026-03-25", days: 5, reason: "Personal reasons", status: leaveStatuses[i] } }).catch(() => {});
    }

    // Payroll records
    for (const emp of empRecords) {
      const basic = emp.salary / 12;
      const tax = basic * 0.2;
      const allowances = basic * 0.1;
      await prisma.payroll.create({ data: { employeeId: emp.id, period: "March 2026", basicSalary: Math.round(basic), allowances: Math.round(allowances), deductions: 0, tax: Math.round(tax), netPay: Math.round(basic + allowances - tax), status: "Pending", paymentDate: "2026-03-28", paymentMethod: "Bank Transfer" } }).catch(() => {});
    }

    // Benefits
    const benefitList = [
      { name: "Health Insurance",    type: "Health",    description: "Comprehensive health coverage",    amount: 500 },
      { name: "Dental Plan",         type: "Health",    description: "Dental coverage plan",             amount: 100 },
      { name: "Life Insurance",      type: "Insurance", description: "Basic life insurance coverage",    amount: 50  },
      { name: "Transport Allowance", type: "Allowance", description: "Monthly transport allowance",      amount: 200 },
    ];
    for (const b of benefitList) {
      const benefit = await prisma.benefit.create({ data: b }).catch(() => null);
      if (benefit) {
        for (const emp of empRecords.slice(0, 3)) {
          await prisma.employeeBenefit.create({ data: { employeeId: emp.id, benefitId: benefit.id, startDate: "2026-01-01", status: "Active" } }).catch(() => {});
        }
      }
    }

    // Settings
    const settingsList = [
      { key: "company_name",      value: "NeraAdmin",                              group: "general" },
      { key: "company_email",     value: "info@neraadmin.com",                     group: "general" },
      { key: "company_phone",     value: "+1-555-0000",                            group: "general" },
      { key: "company_address",   value: "123 Business Ave, New York, NY 10001",   group: "general" },
      { key: "currency",          value: "USD",                                    group: "payroll" },
      { key: "pay_cycle",         value: "Monthly",                                group: "payroll" },
      { key: "tax_year",          value: "2026",                                   group: "payroll" },
      { key: "leave_year_start",  value: "January",                                group: "leave"   },
      { key: "annual_leave_days", value: "21",                                     group: "leave"   },
      { key: "sick_leave_days",   value: "10",                                     group: "leave"   },
    ];
    for (const s of settingsList) {
      await prisma.setting.upsert({ where: { key: s.key }, update: { value: s.value }, create: s });
    }

    return NextResponse.json({ message: "Database seeded successfully." });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
