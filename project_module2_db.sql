
 -- Create the new database
CREATE DATABASE moderntech_hr;
USE moderntech_hr;

-- ==========================================
-- CREATE TABLES
-- ==========================================

-- Table 1: EMPLOYEES
CREATE TABLE employees (
    employee_id INT PRIMARY KEY AUTO_INCREMENT,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    position VARCHAR(100) NOT NULL,
    department VARCHAR(50) NOT NULL,
    base_salary DECIMAL(10, 2) NOT NULL,
    employment_history TEXT,
    contact_email VARCHAR(100) UNIQUE NOT NULL
);

-- Table 2: ATTENDANCE
CREATE TABLE attendance (
    attendance_id INT PRIMARY KEY AUTO_INCREMENT,
    employee_id INT NOT NULL,
    attendance_date DATE NOT NULL,
    status ENUM('Present', 'Absent') NOT NULL,
    FOREIGN KEY (employee_id) REFERENCES employees(employee_id) ON DELETE CASCADE
);

-- Table 3: LEAVE REQUESTS
CREATE TABLE leave_requests (
    leave_id INT PRIMARY KEY AUTO_INCREMENT,
    employee_id INT NOT NULL,
    request_date DATE NOT NULL,
    reason VARCHAR(255) NOT NULL,
    status ENUM('Approved', 'Denied', 'Pending') NOT NULL DEFAULT 'Pending',
    FOREIGN KEY (employee_id) REFERENCES employees(employee_id) ON DELETE CASCADE
);

-- Table 4: PAYROLL
CREATE TABLE payroll (
    payroll_id INT PRIMARY KEY AUTO_INCREMENT,
    employee_id INT NOT NULL,
    payroll_month DATE NOT NULL,
    hours_worked DECIMAL(5, 2) NOT NULL,
    leave_deduction_hours DECIMAL(5, 2) NOT NULL,
    final_salary DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (employee_id) REFERENCES employees(employee_id) ON DELETE CASCADE
);

-- Table 5: REVIEWS
CREATE TABLE reviews (
    review_id INT PRIMARY KEY AUTO_INCREMENT,
    employee_id INT NOT NULL,
    reviewer_name VARCHAR(100) DEFAULT 'HR Department',
    review_date DATE NOT NULL,
    rating DECIMAL(2,1) NOT NULL,
    comments TEXT NOT NULL,
    quarter VARCHAR(20) NOT NULL,
    FOREIGN KEY (employee_id) REFERENCES employees(employee_id) ON DELETE CASCADE
);

-- ==========================================
-- INSERT DATA
-- ==========================================

-- 1. Insert EMPLOYEES
INSERT INTO employees (first_name, last_name, position, department, base_salary, employment_history, contact_email) VALUES
('Sibongile', 'Nkosi', 'Software Engineer', 'Development', 70000.00, 'Joined in 2015, promoted to Senior in 2018', 'sibongile.nkosi@moderntech.com'),
('Lungile', 'Moyo', 'HR Manager', 'HR', 80000.00, 'Joined in 2013, promoted to Manager in 2017', 'lungile.moyo@moderntech.com'),
('Thabo', 'Molefe', 'Quality Analyst', 'QA', 55000.00, 'Joined in 2018', 'thabo.molefe@moderntech.com'),
('Keshav', 'Naidoo', 'Sales Representative', 'Sales', 60000.00, 'Joined in 2020', 'keshav.naidoo@moderntech.com'),
('Zanele', 'Khumalo', 'Marketing Specialist', 'Marketing', 58000.00, 'Joined in 2019', 'zanele.khumalo@moderntech.com'),
('Sipho', 'Zulu', 'UI/UX Designer', 'Design', 65000.00, 'Joined in 2016', 'sipho.zulu@moderntech.com'),
('Naledi', 'Moeketsi', 'DevOps Engineer', 'IT', 72000.00, 'Joined in 2017', 'naledi.moeketsi@moderntech.com'),
('Farai', 'Gumbo', 'Content Strategist', 'Marketing', 56000.00, 'Joined in 2021', 'farai.gumbo@moderntech.com'),
('Karabo', 'Dlamini', 'Accountant', 'Finance', 62000.00, 'Joined in 2018', 'karabo.dlamini@moderntech.com'),
('Fatima', 'Patel', 'Customer Support Lead', 'Support', 58000.00, 'Joined in 2016', 'fatima.patel@moderntech.com');

-- 2. Insert ATTENDANCE
INSERT INTO attendance (employee_id, attendance_date, status) VALUES
(1, '2025-07-25', 'Present'), (1, '2025-07-26', 'Absent'), (1, '2025-07-27', 'Present'), (1, '2025-07-28', 'Present'), (1, '2025-07-29', 'Present'),
(2, '2025-07-25', 'Present'), (2, '2025-07-26', 'Present'), (2, '2025-07-27', 'Absent'), (2, '2025-07-28', 'Present'), (2, '2025-07-29', 'Present'),
(3, '2025-07-25', 'Present'), (3, '2025-07-26', 'Present'), (3, '2025-07-27', 'Present'), (3, '2025-07-28', 'Absent'), (3, '2025-07-29', 'Present'),
(4, '2025-07-25', 'Absent'), (4, '2025-07-26', 'Present'), (4, '2025-07-27', 'Present'), (4, '2025-07-28', 'Present'), (4, '2025-07-29', 'Present'),
(5, '2025-07-25', 'Present'), (5, '2025-07-26', 'Present'), (5, '2025-07-27', 'Absent'), (5, '2025-07-28', 'Present'), (5, '2025-07-29', 'Present'),
(6, '2025-07-25', 'Present'), (6, '2025-07-26', 'Present'), (6, '2025-07-27', 'Absent'), (6, '2025-07-28', 'Present'), (6, '2025-07-29', 'Present'),
(7, '2025-07-25', 'Present'), (7, '2025-07-26', 'Present'), (7, '2025-07-27', 'Present'), (7, '2025-07-28', 'Absent'), (7, '2025-07-29', 'Present'),
(8, '2025-07-25', 'Present'), (8, '2025-07-26', 'Absent'), (8, '2025-07-27', 'Present'), (8, '2025-07-28', 'Present'), (8, '2025-07-29', 'Present'),
(9, '2025-07-25', 'Present'), (9, '2025-07-26', 'Present'), (9, '2025-07-27', 'Present'), (9, '2025-07-28', 'Absent'), (9, '2025-07-29', 'Present'),
(10, '2025-07-25', 'Present'), (10, '2025-07-26', 'Present'), (10, '2025-07-27', 'Absent'), (10, '2025-07-28', 'Present'), (10, '2025-07-29', 'Present');

-- 3. Insert LEAVE REQUESTS
INSERT INTO leave_requests (employee_id, request_date, reason, status) VALUES
(1, '2025-07-22', 'Sick Leave', 'Approved'),
(1, '2024-12-01', 'Personal', 'Pending'),
(2, '2025-07-15', 'Family Responsibility', 'Denied'),
(2, '2024-12-02', 'Vacation', 'Approved'),
(3, '2025-07-10', 'Medical Appointment', 'Approved'),
(3, '2024-12-05', 'Personal', 'Pending'),
(4, '2025-07-20', 'Bereavement', 'Approved'),
(5, '2024-12-01', 'Childcare', 'Pending'),
(6, '2025-07-18', 'Sick Leave', 'Approved'),
(7, '2025-07-22', 'Vacation', 'Pending'),
(8, '2024-12-02', 'Medical Appointment', 'Approved'),
(9, '2025-07-19', 'Childcare', 'Denied'),
(10, '2024-12-03', 'Vacation', 'Pending');

-- 4. Insert PAYROLL
INSERT INTO payroll (employee_id, payroll_month, hours_worked, leave_deduction_hours, final_salary) VALUES
(1, '2026-06-01', 160, 8, 69500.00),
(2, '2026-06-01', 150, 10, 79000.00),
(3, '2026-06-01', 170, 4, 54800.00),
(4, '2026-06-01', 165, 6, 59700.00),
(5, '2026-06-01', 158, 5, 57850.00),
(6, '2026-06-01', 168, 2, 64800.00),
(7, '2026-06-01', 175, 3, 71800.00),
(8, '2026-06-01', 160, 0, 56000.00),
(9, '2026-06-01', 155, 5, 61500.00),
(10, '2026-06-01', 162, 4, 57750.00);

-- 5. Insert REVIEWS
INSERT INTO reviews (employee_id, reviewer_name, review_date, rating, comments, quarter) VALUES
(1, 'HR Department', '2026-08-12', 4.5, 'Sibongile Nkosi brings strong focus to development work and continues to contribute positively as a software engineer. Their reliability and collaboration make them a valuable part of the team.', 'Q2 2025'),
(2, 'HR Department', '2026-08-12', 4.5, 'Lungile Moyo brings strong focus to her work and continues to contribute positively as a HR manager. Their reliability and collaboration make them a valuable part of the team.', 'Q2 2025'),
(3, 'HR Department', '2026-08-12', 4.5, 'Thabo Molefe brings strong focus to a quality analysis and continues to contribute positively as a quality analyst. Their reliability and collaboration make them a valuable part of the team.', 'Q2 2025'),
(4, 'HR Department', '2026-08-12', 4.0, 'Keshav Naidoo brings strong focus to sales work and continues to contribute positively as a sales representative. Their reliability and collaboration make them a valuable part of the team.', 'Q2 2025'),
(5, 'HR Department', '2026-08-12', 4.0, 'Zanele Khumalo brings strong focus to marketing work and continues to contribute positively as a marketing specialist. Their reliability and collaboration make them a valuable part of the team.', 'Q2 2025'),
(6, 'HR Department', '2026-08-12', 4.2, 'Sipho Zulu brings strong focus to design work and continues to contribute positively as a UX designer. Their reliability and collaboration make them a valuable part of the team.', 'Q2 2025'),
(7, 'HR Department', '2026-08-12', 4.3, 'Naledi Moeketsi brings strong focus to IT work and continues to contribute positively as a devops engineer. Their reliability and collaboration make them a valuable part of the team.', 'Q2 2025'),
(8, 'HR Department', '2026-08-12', 4.5, 'Farai Gumbo brings strong focus to marketing work and continues to contribute positively as a content strategist. Their reliability and collaboration make them a valuable part of the team.', 'Q2 2025'),
(9, 'HR Department', '2026-08-12', 4.5, 'Karabo Dlamini brings strong focus to finance work and continues to contribute positively as a accountant. Their reliability and collaboration make them a valuable part of the team.', 'Q2 2025'),
(10, 'HR Department', '2026-08-12', 4.0, 'Fatima Patel brings strong focus to support work and continues to contribute positively as a customer support lead. Their reliability and collaboration make them a valuable part of the team.', 'Q2 2025');

select * from employees ;
select * from attendance;
select * from leave_requests;
select * from payroll;
select * from reviews;