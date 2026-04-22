
-- Admin user
INSERT OR IGNORE INTO User (id, email, password, name, role, createdAt, updatedAt)
VALUES ('admin001', 'admin@hrsystem.com', '$2a$12$LJ/V0E0xYFkY.xVV1n2FqOKA8wBvdYLqCJJKqYW0Ge.W1vVQiVG.i', 'System Admin', 'admin', datetime('now'), datetime('now'));

-- Departments
INSERT OR IGNORE INTO Department (id, name, description, createdAt, updatedAt) VALUES ('dept01', 'Engineering', 'Engineering department', datetime('now'), datetime('now'));
INSERT OR IGNORE INTO Department (id, name, description, createdAt, updatedAt) VALUES ('dept02', 'Human Resources', 'HR department', datetime('now'), datetime('now'));
INSERT OR IGNORE INTO Department (id, name, description, createdAt, updatedAt) VALUES ('dept03', 'Finance', 'Finance department', datetime('now'), datetime('now'));
INSERT OR IGNORE INTO Department (id, name, description, createdAt, updatedAt) VALUES ('dept04', 'Marketing', 'Marketing department', datetime('now'), datetime('now'));
INSERT OR IGNORE INTO Department (id, name, description, createdAt, updatedAt) VALUES ('dept05', 'Sales', 'Sales department', datetime('now'), datetime('now'));
INSERT OR IGNORE INTO Department (id, name, description, createdAt, updatedAt) VALUES ('dept06', 'Operations', 'Operations department', datetime('now'), datetime('now'));
INSERT OR IGNORE INTO Department (id, name, description, createdAt, updatedAt) VALUES ('dept07', 'Legal', 'Legal department', datetime('now'), datetime('now'));
INSERT OR IGNORE INTO Department (id, name, description, createdAt, updatedAt) VALUES ('dept08', 'Product', 'Product department', datetime('now'), datetime('now'));
INSERT OR IGNORE INTO Department (id, name, description, createdAt, updatedAt) VALUES ('dept09', 'Design', 'Design department', datetime('now'), datetime('now'));
INSERT OR IGNORE INTO Department (id, name, description, createdAt, updatedAt) VALUES ('dept10', 'Support', 'Support department', datetime('now'), datetime('now'));

-- Employees
INSERT OR IGNORE INTO Employee (id, employeeId, firstName, lastName, email, phone, department, position, salary, hireDate, gender, status, employmentType, createdAt, updatedAt) VALUES ('emp01', 'EMP-001', 'James', 'Wilson', 'james.wilson@company.com', '+1-555-0101', 'Engineering', 'Senior Developer', 95000, '2023-01-15', 'Male', 'Active', 'Full-time', datetime('now'), datetime('now'));
INSERT OR IGNORE INTO Employee (id, employeeId, firstName, lastName, email, phone, department, position, salary, hireDate, gender, status, employmentType, createdAt, updatedAt) VALUES ('emp02', 'EMP-002', 'Sarah', 'Chen', 'sarah.chen@company.com', '+1-555-0102', 'Design', 'UI/UX Lead', 88000, '2023-03-20', 'Female', 'Active', 'Full-time', datetime('now'), datetime('now'));
INSERT OR IGNORE INTO Employee (id, employeeId, firstName, lastName, email, phone, department, position, salary, hireDate, gender, status, employmentType, createdAt, updatedAt) VALUES ('emp03', 'EMP-003', 'Michael', 'Brown', 'michael.brown@company.com', '+1-555-0103', 'Marketing', 'Marketing Manager', 82000, '2022-11-10', 'Male', 'Active', 'Full-time', datetime('now'), datetime('now'));
INSERT OR IGNORE INTO Employee (id, employeeId, firstName, lastName, email, phone, department, position, salary, hireDate, gender, status, employmentType, createdAt, updatedAt) VALUES ('emp04', 'EMP-004', 'Emily', 'Davis', 'emily.davis@company.com', '+1-555-0104', 'Human Resources', 'HR Specialist', 72000, '2023-06-01', 'Female', 'Active', 'Full-time', datetime('now'), datetime('now'));
INSERT OR IGNORE INTO Employee (id, employeeId, firstName, lastName, email, phone, department, position, salary, hireDate, gender, status, employmentType, createdAt, updatedAt) VALUES ('emp05', 'EMP-005', 'David', 'Martinez', 'david.martinez@company.com', '+1-555-0105', 'Finance', 'Financial Analyst', 78000, '2023-02-28', 'Male', 'Active', 'Full-time', datetime('now'), datetime('now'));
INSERT OR IGNORE INTO Employee (id, employeeId, firstName, lastName, email, phone, department, position, salary, hireDate, gender, status, employmentType, createdAt, updatedAt) VALUES ('emp06', 'EMP-006', 'Lisa', 'Johnson', 'lisa.johnson@company.com', '+1-555-0106', 'Sales', 'Sales Executive', 68000, '2023-08-15', 'Female', 'Active', 'Full-time', datetime('now'), datetime('now'));
INSERT OR IGNORE INTO Employee (id, employeeId, firstName, lastName, email, phone, department, position, salary, hireDate, gender, status, employmentType, createdAt, updatedAt) VALUES ('emp07', 'EMP-007', 'Robert', 'Taylor', 'robert.taylor@company.com', '+1-555-0107', 'Engineering', 'Backend Developer', 90000, '2022-09-05', 'Male', 'Active', 'Full-time', datetime('now'), datetime('now'));
INSERT OR IGNORE INTO Employee (id, employeeId, firstName, lastName, email, phone, department, position, salary, hireDate, gender, status, employmentType, createdAt, updatedAt) VALUES ('emp08', 'EMP-008', 'Anna', 'White', 'anna.white@company.com', '+1-555-0108', 'Product', 'Product Manager', 92000, '2023-04-12', 'Female', 'Active', 'Full-time', datetime('now'), datetime('now'));
INSERT OR IGNORE INTO Employee (id, employeeId, firstName, lastName, email, phone, department, position, salary, hireDate, gender, status, employmentType, createdAt, updatedAt) VALUES ('emp09', 'EMP-009', 'Chris', 'Lee', 'chris.lee@company.com', '+1-555-0109', 'Operations', 'Operations Lead', 76000, '2022-07-22', 'Male', 'On Leave', 'Full-time', datetime('now'), datetime('now'));
INSERT OR IGNORE INTO Employee (id, employeeId, firstName, lastName, email, phone, department, position, salary, hireDate, gender, status, employmentType, createdAt, updatedAt) VALUES ('emp10', 'EMP-010', 'Maria', 'Garcia', 'maria.garcia@company.com', '+1-555-0110', 'Support', 'Support Manager', 70000, '2023-05-18', 'Female', 'Active', 'Full-time', datetime('now'), datetime('now'));
INSERT OR IGNORE INTO Employee (id, employeeId, firstName, lastName, email, phone, department, position, salary, hireDate, gender, status, employmentType, createdAt, updatedAt) VALUES ('emp11', 'EMP-011', 'Thomas', 'Anderson', 'thomas.anderson@company.com', '+1-555-0111', 'Engineering', 'Frontend Developer', 85000, '2023-07-01', 'Male', 'Active', 'Full-time', datetime('now'), datetime('now'));
INSERT OR IGNORE INTO Employee (id, employeeId, firstName, lastName, email, phone, department, position, salary, hireDate, gender, status, employmentType, createdAt, updatedAt) VALUES ('emp12', 'EMP-012', 'Jessica', 'Moore', 'jessica.moore@company.com', '+1-555-0112', 'Legal', 'Legal Advisor', 98000, '2022-12-15', 'Female', 'Active', 'Full-time', datetime('now'), datetime('now'));

-- Bank Accounts
INSERT OR IGNORE INTO BankAccount (id, employeeId, bankName, accountNumber, accountType, isPrimary, createdAt, updatedAt) VALUES ('ba01', 'emp01', 'National Bank', '****4521', 'Savings', 1, datetime('now'), datetime('now'));
INSERT OR IGNORE INTO BankAccount (id, employeeId, bankName, accountNumber, accountType, isPrimary, createdAt, updatedAt) VALUES ('ba02', 'emp02', 'National Bank', '****7832', 'Savings', 1, datetime('now'), datetime('now'));

-- Emergency Contacts
INSERT OR IGNORE INTO Contact (id, employeeId, name, relationship, phone, category, isPrimary, createdAt, updatedAt) VALUES ('ct01', 'emp01', 'Mary Wilson', 'Spouse', '+1-555-9101', 'Emergency', 1, datetime('now'), datetime('now'));
INSERT OR IGNORE INTO Contact (id, employeeId, name, relationship, phone, category, isPrimary, createdAt, updatedAt) VALUES ('ct02', 'emp02', 'Wei Chen', 'Spouse', '+1-555-9102', 'Emergency', 1, datetime('now'), datetime('now'));

-- Leave Requests
INSERT OR IGNORE INTO LeaveRequest (id, employeeId, leaveType, startDate, endDate, days, reason, status, createdAt, updatedAt) VALUES ('lr01', 'emp01', 'Annual', '2026-03-20', '2026-03-25', 5, 'Family vacation', 'Pending', datetime('now'), datetime('now'));
INSERT OR IGNORE INTO LeaveRequest (id, employeeId, leaveType, startDate, endDate, days, reason, status, createdAt, updatedAt) VALUES ('lr02', 'emp02', 'Sick', '2026-03-18', '2026-03-19', 2, 'Medical appointment', 'Approved', datetime('now'), datetime('now'));
INSERT OR IGNORE INTO LeaveRequest (id, employeeId, leaveType, startDate, endDate, days, reason, status, createdAt, updatedAt) VALUES ('lr03', 'emp03', 'Personal', '2026-03-22', '2026-03-23', 1, 'Personal matters', 'Pending', datetime('now'), datetime('now'));
INSERT OR IGNORE INTO LeaveRequest (id, employeeId, leaveType, startDate, endDate, days, reason, status, createdAt, updatedAt) VALUES ('lr04', 'emp04', 'Annual', '2026-04-01', '2026-04-07', 5, 'Planned vacation', 'Approved', datetime('now'), datetime('now'));
INSERT OR IGNORE INTO LeaveRequest (id, employeeId, leaveType, startDate, endDate, days, reason, status, createdAt, updatedAt) VALUES ('lr05', 'emp09', 'Sick', '2026-03-15', '2026-03-25', 8, 'Medical leave', 'Approved', datetime('now'), datetime('now'));

-- Payroll
INSERT OR IGNORE INTO Payroll (id, employeeId, period, basicSalary, allowances, deductions, tax, netPay, status, paymentDate, paymentMethod, createdAt, updatedAt) VALUES ('pr01', 'emp01', 'March 2026', 7916.67, 791.67, 0, 1583.33, 7125.01, 'Processed', '2026-03-28', 'Bank Transfer', datetime('now'), datetime('now'));
INSERT OR IGNORE INTO Payroll (id, employeeId, period, basicSalary, allowances, deductions, tax, netPay, status, paymentDate, paymentMethod, createdAt, updatedAt) VALUES ('pr02', 'emp02', 'March 2026', 7333.33, 733.33, 0, 1466.67, 6599.99, 'Processed', '2026-03-28', 'Bank Transfer', datetime('now'), datetime('now'));
INSERT OR IGNORE INTO Payroll (id, employeeId, period, basicSalary, allowances, deductions, tax, netPay, status, paymentDate, paymentMethod, createdAt, updatedAt) VALUES ('pr03', 'emp03', 'March 2026', 6833.33, 683.33, 0, 1366.67, 6149.99, 'Processed', '2026-03-28', 'Bank Transfer', datetime('now'), datetime('now'));
INSERT OR IGNORE INTO Payroll (id, employeeId, period, basicSalary, allowances, deductions, tax, netPay, status, paymentDate, paymentMethod, createdAt, updatedAt) VALUES ('pr04', 'emp04', 'March 2026', 6000.00, 600.00, 0, 1200.00, 5400.00, 'Pending', '2026-03-28', 'Bank Transfer', datetime('now'), datetime('now'));
INSERT OR IGNORE INTO Payroll (id, employeeId, period, basicSalary, allowances, deductions, tax, netPay, status, paymentDate, paymentMethod, createdAt, updatedAt) VALUES ('pr05', 'emp05', 'March 2026', 6500.00, 650.00, 0, 1300.00, 5850.00, 'Pending', '2026-03-28', 'Bank Transfer', datetime('now'), datetime('now'));

-- Benefits
INSERT OR IGNORE INTO Benefit (id, name, type, description, amount, isActive, createdAt, updatedAt) VALUES ('ben01', 'Health Insurance', 'Insurance', 'Comprehensive health coverage', 500, 1, datetime('now'), datetime('now'));
INSERT OR IGNORE INTO Benefit (id, name, type, description, amount, isActive, createdAt, updatedAt) VALUES ('ben02', 'Dental Plan', 'Insurance', 'Dental coverage plan', 100, 1, datetime('now'), datetime('now'));
INSERT OR IGNORE INTO Benefit (id, name, type, description, amount, isActive, createdAt, updatedAt) VALUES ('ben03', '401(k) Match', 'Retirement', 'Company matches up to 6%', 300, 1, datetime('now'), datetime('now'));
INSERT OR IGNORE INTO Benefit (id, name, type, description, amount, isActive, createdAt, updatedAt) VALUES ('ben04', 'Life Insurance', 'Insurance', 'Basic life insurance', 50, 1, datetime('now'), datetime('now'));
INSERT OR IGNORE INTO Benefit (id, name, type, description, amount, isActive, createdAt, updatedAt) VALUES ('ben05', 'Transport Allowance', 'Allowance', 'Monthly transport', 200, 1, datetime('now'), datetime('now'));

-- Deductions
INSERT OR IGNORE INTO Deduction (id, name, type, description, percentage, isActive, createdAt, updatedAt) VALUES ('ded01', 'Federal Tax', 'Tax', 'Federal income tax', 22, 1, datetime('now'), datetime('now'));
INSERT OR IGNORE INTO Deduction (id, name, type, description, percentage, isActive, createdAt, updatedAt) VALUES ('ded02', 'State Tax', 'Tax', 'State income tax', 5, 1, datetime('now'), datetime('now'));
INSERT OR IGNORE INTO Deduction (id, name, type, description, percentage, isActive, createdAt, updatedAt) VALUES ('ded03', 'Social Security', 'Tax', 'Social security', 6.2, 1, datetime('now'), datetime('now'));
INSERT OR IGNORE INTO Deduction (id, name, type, description, percentage, isActive, createdAt, updatedAt) VALUES ('ded04', 'Medicare', 'Tax', 'Medicare', 1.45, 1, datetime('now'), datetime('now'));

-- Recruitment
INSERT OR IGNORE INTO Recruitment (id, jobTitle, department, location, employmentType, status, applicants, postedDate, closingDate, salaryMin, salaryMax, description, createdAt, updatedAt) VALUES ('rec01', 'Senior React Developer', 'Engineering', 'Remote', 'Full-time', 'Open', 24, '2026-03-01', '2026-04-15', 90000, 130000, 'Looking for an experienced React developer', datetime('now'), datetime('now'));
INSERT OR IGNORE INTO Recruitment (id, jobTitle, department, location, employmentType, status, applicants, postedDate, closingDate, salaryMin, salaryMax, description, createdAt, updatedAt) VALUES ('rec02', 'Product Designer', 'Design', 'New York', 'Full-time', 'Open', 18, '2026-03-05', '2026-04-10', 80000, 110000, 'Seeking a creative product designer', datetime('now'), datetime('now'));
INSERT OR IGNORE INTO Recruitment (id, jobTitle, department, location, employmentType, status, applicants, postedDate, closingDate, salaryMin, salaryMax, description, createdAt, updatedAt) VALUES ('rec03', 'Marketing Coordinator', 'Marketing', 'Chicago', 'Full-time', 'Closed', 32, '2026-02-15', '2026-03-15', 55000, 70000, 'Coordinate marketing campaigns', datetime('now'), datetime('now'));
INSERT OR IGNORE INTO Recruitment (id, jobTitle, department, location, employmentType, status, applicants, postedDate, closingDate, salaryMin, salaryMax, description, createdAt, updatedAt) VALUES ('rec04', 'DevOps Engineer', 'Engineering', 'Remote', 'Contract', 'Open', 15, '2026-03-10', '2026-04-20', 100000, 140000, 'Manage CI/CD and cloud infra', datetime('now'), datetime('now'));

-- Onboarding
INSERT OR IGNORE INTO Onboarding (id, employeeId, status, startDate, progress, tasks, createdAt, updatedAt) VALUES ('onb01', 'emp11', 'In Progress', '2026-03-01', 60, '[{"name":"Documentation","completed":true},{"name":"IT Setup","completed":true},{"name":"Team Introduction","completed":false},{"name":"Training","completed":false}]', datetime('now'), datetime('now'));
INSERT OR IGNORE INTO Onboarding (id, employeeId, status, startDate, completedAt, progress, tasks, createdAt, updatedAt) VALUES ('onb02', 'emp12', 'Completed', '2026-02-15', '2026-03-10', 100, '[{"name":"Documentation","completed":true},{"name":"IT Setup","completed":true},{"name":"Team Introduction","completed":true},{"name":"Training","completed":true}]', datetime('now'), datetime('now'));

-- Settings
INSERT OR IGNORE INTO Setting (id, key, value, "group", createdAt, updatedAt) VALUES ('set01', 'company_name', 'NeraAdmin', 'general', datetime('now'), datetime('now'));
INSERT OR IGNORE INTO Setting (id, key, value, "group", createdAt, updatedAt) VALUES ('set02', 'company_email', 'info@neraadmin.com', 'general', datetime('now'), datetime('now'));
INSERT OR IGNORE INTO Setting (id, key, value, "group", createdAt, updatedAt) VALUES ('set03', 'company_phone', '+1-555-0000', 'general', datetime('now'), datetime('now'));
INSERT OR IGNORE INTO Setting (id, key, value, "group", createdAt, updatedAt) VALUES ('set04', 'company_address', '123 Business Ave, New York, NY 10001', 'general', datetime('now'), datetime('now'));
INSERT OR IGNORE INTO Setting (id, key, value, "group", createdAt, updatedAt) VALUES ('set05', 'currency', 'USD', 'payroll', datetime('now'), datetime('now'));
INSERT OR IGNORE INTO Setting (id, key, value, "group", createdAt, updatedAt) VALUES ('set06', 'pay_cycle', 'Monthly', 'payroll', datetime('now'), datetime('now'));
INSERT OR IGNORE INTO Setting (id, key, value, "group", createdAt, updatedAt) VALUES ('set07', 'annual_leave_days', '21', 'leave', datetime('now'), datetime('now'));
INSERT OR IGNORE INTO Setting (id, key, value, "group", createdAt, updatedAt) VALUES ('set08', 'sick_leave_days', '10', 'leave', datetime('now'), datetime('now'));
