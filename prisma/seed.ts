const { PrismaClient } = require("../src/generated/prisma") as { PrismaClient: new () => import("../src/generated/prisma").PrismaClient };
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const hashedPassword = await bcrypt.hash("admin123", 12);
  await prisma.user.upsert({
    where: { email: "admin@hrsystem.com" },
    update: {},
    create: {
      email: "admin@hrsystem.com",
      password: hashedPassword,
      name: "System Admin",
      role: "admin",
    },
  });

  // Create departments
  const departments = [
    "Engineering", "Human Resources", "Finance", "Marketing",
    "Sales", "Operations", "Legal", "Product", "Design", "Support"
  ];
  for (const name of departments) {
    await prisma.department.upsert({
      where: { name },
      update: {},
      create: { name, description: `${name} department` },
    });
  }

  // Create employees
  const employees = [
    { employeeId: "EMP-001", firstName: "James", lastName: "Wilson", email: "james.wilson@company.com", phone: "+1-555-0101", department: "Engineering", position: "Senior Developer", salary: 95000, hireDate: "2023-01-15", gender: "Male", status: "Active" },
    { employeeId: "EMP-002", firstName: "Sarah", lastName: "Chen", email: "sarah.chen@company.com", phone: "+1-555-0102", department: "Design", position: "UI/UX Lead", salary: 88000, hireDate: "2023-03-20", gender: "Female", status: "Active" },
    { employeeId: "EMP-003", firstName: "Michael", lastName: "Brown", email: "michael.brown@company.com", phone: "+1-555-0103", department: "Marketing", position: "Marketing Manager", salary: 82000, hireDate: "2022-11-10", gender: "Male", status: "Active" },
    { employeeId: "EMP-004", firstName: "Emily", lastName: "Davis", email: "emily.davis@company.com", phone: "+1-555-0104", department: "Human Resources", position: "HR Specialist", salary: 72000, hireDate: "2023-06-01", gender: "Female", status: "Active" },
    { employeeId: "EMP-005", firstName: "David", lastName: "Martinez", email: "david.martinez@company.com", phone: "+1-555-0105", department: "Finance", position: "Financial Analyst", salary: 78000, hireDate: "2023-02-28", gender: "Male", status: "Active" },
    { employeeId: "EMP-006", firstName: "Lisa", lastName: "Johnson", email: "lisa.johnson@company.com", phone: "+1-555-0106", department: "Sales", position: "Sales Executive", salary: 68000, hireDate: "2023-08-15", gender: "Female", status: "Active" },
    { employeeId: "EMP-007", firstName: "Robert", lastName: "Taylor", email: "robert.taylor@company.com", phone: "+1-555-0107", department: "Engineering", position: "Backend Developer", salary: 90000, hireDate: "2022-09-05", gender: "Male", status: "Active" },
    { employeeId: "EMP-008", firstName: "Anna", lastName: "White", email: "anna.white@company.com", phone: "+1-555-0108", department: "Product", position: "Product Manager", salary: 92000, hireDate: "2023-04-12", gender: "Female", status: "Active" },
    { employeeId: "EMP-009", firstName: "Chris", lastName: "Lee", email: "chris.lee@company.com", phone: "+1-555-0109", department: "Operations", position: "Operations Lead", salary: 76000, hireDate: "2022-07-22", gender: "Male", status: "On Leave" },
    { employeeId: "EMP-010", firstName: "Maria", lastName: "Garcia", email: "maria.garcia@company.com", phone: "+1-555-0110", department: "Support", position: "Support Manager", salary: 70000, hireDate: "2023-05-18", gender: "Female", status: "Active" },
    { employeeId: "EMP-011", firstName: "Thomas", lastName: "Anderson", email: "thomas.anderson@company.com", phone: "+1-555-0111", department: "Engineering", position: "Frontend Developer", salary: 85000, hireDate: "2023-07-01", gender: "Male", status: "Active" },
    { employeeId: "EMP-012", firstName: "Jessica", lastName: "Moore", email: "jessica.moore@company.com", phone: "+1-555-0112", department: "Legal", position: "Legal Advisor", salary: 98000, hireDate: "2022-12-15", gender: "Female", status: "Active" },
  ];

  for (const emp of employees) {
    const created = await prisma.employee.upsert({
      where: { employeeId: emp.employeeId },
      update: {},
      create: emp,
    });

    // Add bank account
    await prisma.bankAccount.create({
      data: {
        employeeId: created.id,
        bankName: "National Bank",
        accountNumber: `****${Math.floor(1000 + Math.random() * 9000)}`,
        accountType: "Savings",
        isPrimary: true,
      },
    }).catch(() => {});

    // Add emergency contact
    await prisma.contact.create({
      data: {
        employeeId: created.id,
        name: `${emp.firstName}'s Emergency Contact`,
        relationship: "Spouse",
        phone: `+1-555-${String(Math.floor(1000 + Math.random() * 9000))}`,
        category: "Emergency",
        isPrimary: true,
      },
    }).catch(() => {});
  }

  // Create leave requests
  const empRecords = await prisma.employee.findMany({ take: 6 });
  const leaveTypes = ["Annual", "Sick", "Personal", "Maternity", "Paternity"];
  const leaveStatuses = ["Pending", "Approved", "Rejected"];

  for (let i = 0; i < empRecords.length; i++) {
    await prisma.leaveRequest.create({
      data: {
        employeeId: empRecords[i].id,
        leaveType: leaveTypes[i % leaveTypes.length],
        startDate: "2026-03-20",
        endDate: "2026-03-25",
        days: 5,
        reason: "Personal reasons",
        status: leaveStatuses[i % leaveStatuses.length],
      },
    });
  }

  // Create payroll records
  for (const emp of empRecords) {
    const tax = emp.salary * 0.2 / 12;
    const allowances = emp.salary * 0.1 / 12;
    const basicMonthly = emp.salary / 12;
    await prisma.payroll.create({
      data: {
        employeeId: emp.id,
        period: "March 2026",
        basicSalary: Math.round(basicMonthly * 100) / 100,
        allowances: Math.round(allowances * 100) / 100,
        deductions: 0,
        tax: Math.round(tax * 100) / 100,
        netPay: Math.round((basicMonthly + allowances - tax) * 100) / 100,
        status: "Processed",
        paymentDate: "2026-03-28",
        paymentMethod: "Bank Transfer",
      },
    });
  }

  // Create benefits
  const benefits = [
    { name: "Health Insurance", type: "Insurance", description: "Comprehensive health coverage", amount: 500 },
    { name: "Dental Plan", type: "Insurance", description: "Dental coverage plan", amount: 100 },
    { name: "401(k) Match", type: "Retirement", description: "Company matches up to 6%", amount: 300 },
    { name: "Life Insurance", type: "Insurance", description: "Basic life insurance coverage", amount: 50 },
    { name: "Transport Allowance", type: "Allowance", description: "Monthly transport allowance", amount: 200 },
  ];

  for (const b of benefits) {
    await prisma.benefit.upsert({
      where: { id: b.name },
      update: {},
      create: b,
    }).catch(() => {
      prisma.benefit.create({ data: b }).catch(() => {});
    });
  }

  // Create deductions
  const deductions = [
    { name: "Federal Tax", type: "Tax", description: "Federal income tax", percentage: 22 },
    { name: "State Tax", type: "Tax", description: "State income tax", percentage: 5 },
    { name: "Social Security", type: "Tax", description: "Social security contribution", percentage: 6.2 },
    { name: "Medicare", type: "Tax", description: "Medicare contribution", percentage: 1.45 },
    { name: "Health Insurance Premium", type: "Insurance", description: "Employee share of health insurance", amount: 150 },
  ];

  for (const d of deductions) {
    await prisma.deduction.create({ data: d }).catch(() => {});
  }

  // Create recruitment postings
  const jobs = [
    { jobTitle: "Senior React Developer", department: "Engineering", location: "Remote", employmentType: "Full-time", status: "Open", applicants: 24, postedDate: "2026-03-01", closingDate: "2026-04-15", salaryMin: 90000, salaryMax: 130000, description: "Looking for an experienced React developer to join our frontend team." },
    { jobTitle: "Product Designer", department: "Design", location: "New York", employmentType: "Full-time", status: "Open", applicants: 18, postedDate: "2026-03-05", closingDate: "2026-04-10", salaryMin: 80000, salaryMax: 110000, description: "Seeking a creative product designer." },
    { jobTitle: "Marketing Coordinator", department: "Marketing", location: "Chicago", employmentType: "Full-time", status: "Closed", applicants: 32, postedDate: "2026-02-15", closingDate: "2026-03-15", salaryMin: 55000, salaryMax: 70000, description: "Coordinate marketing campaigns and events." },
    { jobTitle: "DevOps Engineer", department: "Engineering", location: "Remote", employmentType: "Contract", status: "Open", applicants: 15, postedDate: "2026-03-10", closingDate: "2026-04-20", salaryMin: 100000, salaryMax: 140000, description: "Manage CI/CD pipelines and cloud infrastructure." },
  ];

  for (const job of jobs) {
    await prisma.recruitment.create({ data: job }).catch(() => {});
  }

  // Create onboarding records
  const newHires = await prisma.employee.findMany({ take: 3, orderBy: { createdAt: "desc" } });
  for (let i = 0; i < newHires.length; i++) {
    await prisma.onboarding.upsert({
      where: { employeeId: newHires[i].id },
      update: {},
      create: {
        employeeId: newHires[i].id,
        status: i === 0 ? "Completed" : "In Progress",
        startDate: "2026-03-01",
        completedAt: i === 0 ? "2026-03-15" : undefined,
        progress: i === 0 ? 100 : 40 + i * 20,
        tasks: JSON.stringify([
          { name: "Documentation", completed: true },
          { name: "IT Setup", completed: i === 0 },
          { name: "Team Introduction", completed: i === 0 },
          { name: "Training", completed: false },
        ]),
      },
    });
  }

  // Create settings
  const settings = [
    { key: "company_name", value: "NeraAdmin", group: "general" },
    { key: "company_email", value: "info@neraadmin.com", group: "general" },
    { key: "company_phone", value: "+1-555-0000", group: "general" },
    { key: "company_address", value: "123 Business Ave, New York, NY 10001", group: "general" },
    { key: "currency", value: "USD", group: "payroll" },
    { key: "pay_cycle", value: "Monthly", group: "payroll" },
    { key: "tax_year", value: "2026", group: "payroll" },
    { key: "leave_year_start", value: "January", group: "leave" },
    { key: "annual_leave_days", value: "21", group: "leave" },
    { key: "sick_leave_days", value: "10", group: "leave" },
  ];

  for (const s of settings) {
    await prisma.setting.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: s,
    });
  }

  console.log("Database seeded successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
