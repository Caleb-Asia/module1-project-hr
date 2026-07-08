/* ========================== */
/*          CHAD-DEV          */
/* ========================== */

// Line Graph Tooltip
document.addEventListener('DOMContentLoaded', () => {
    const trendSvg = document.querySelector('.trend-svg');
    const hoverGuide = document.querySelector('.hover-guide');
    const chartTooltip = document.querySelector('.chart-tooltip');
    const trendDots = document.querySelectorAll('.trend-dot');

    function showTooltip(dot) {
        const cx = dot.getAttribute('cx');
        const headcount = dot.getAttribute('data-value') || dot.id;
        const month = dot.getAttribute('data-month') || 'Month';

        if (hoverGuide) {
            hoverGuide.setAttribute('x1', cx);
            hoverGuide.setAttribute('x2', cx);
            hoverGuide.setAttribute('y1', '20');
            hoverGuide.setAttribute('y2', '180');
            hoverGuide.style.opacity = '1';
        }

        chartTooltip.innerHTML = `<strong>${month}</strong><br>Headcount: ${headcount}`;
        chartTooltip.classList.add('visible');

        const dotBounding = dot.getBoundingClientRect();
        chartTooltip.style.left = `${dotBounding.left + window.scrollX + 15}px`;
        chartTooltip.style.top = `${dotBounding.top + window.scrollY - 40}px`;
    }

    function hideTooltip() {
        if (hoverGuide) hoverGuide.style.opacity = '0';
        chartTooltip.classList.remove('visible');
        trendDots.forEach(dot => dot.classList.remove('is-active'));
    }

    if (trendSvg && chartTooltip) {
        trendDots.forEach(dot => {
            dot.addEventListener('mouseenter', () => {
                trendDots.forEach(item => item.classList.remove('is-active'));
                dot.classList.add('is-active');
                showTooltip(dot);
            });

            dot.addEventListener('mousemove', () => {
                showTooltip(dot);
            });

            dot.addEventListener('mouseleave', hideTooltip);
        });

        trendSvg.addEventListener('mouseleave', hideTooltip);
    }

    // Time Off Reequest Button and Modal
    const btnNewRequest = document.querySelector('.btn-new-request');
    const modalOverlay = document.querySelector('.modal-overlay');
    const btnModalCancel = document.querySelector('.btn-modal-cancel');
    const closeModalBtn = document.querySelector('.close-modal-btn');
    const timeOffForm = document.getElementById('timeOffForm');

    if (btnNewRequest && modalOverlay) {
        btnNewRequest.addEventListener('click', () => {
            modalOverlay.classList.add('active');
        });
    }

    const closeModal = () => {
        if (modalOverlay) {
            modalOverlay.classList.remove('active');
            if (timeOffForm) timeOffForm.reset();
        }
    };

    if (btnModalCancel) btnModalCancel.addEventListener('click', closeModal);
    if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
    if (modalOverlay) {
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) closeModal();
        });
    }

    const employeeSelect = document.getElementById('employeeSelect');
    const leaveRequestsList = document.getElementById('leaveRequestsList');
    const pendingCount = document.getElementById('pendingCount');
    const approvedCount = document.getElementById('approvedCount');
    const rejectedCount = document.getElementById('rejectedCount');

    let leaveRequestsData = [];

    const updateLeaveRequestCounts = () => {
        const approvedLeaves = leaveRequestsData.filter(item => item.status.toLowerCase() === 'approved').length;
        const pendingLeaves = leaveRequestsData.filter(item => item.status.toLowerCase() === 'pending').length;
        const rejectedLeaves = leaveRequestsData.filter(item => item.status.toLowerCase() === 'denied').length;

        if (pendingCount) pendingCount.textContent = pendingLeaves;
        if (approvedCount) approvedCount.textContent = approvedLeaves;
        if (rejectedCount) rejectedCount.textContent = rejectedLeaves;
    };

    const renderLeaveRequests = () => {
        if (!leaveRequestsList) return;

        leaveRequestsList.innerHTML = leaveRequestsData.map((request, index) => {
            const initials = request.employeeName.split(' ').map(name => name[0]).join('').slice(0, 2).toUpperCase();
            const statusClass = request.status.toLowerCase() === 'approved'
                ? 'badge-approved'
                : request.status.toLowerCase() === 'denied'
                    ? 'badge-rejected'
                    : 'badge-pending';
            const actionMarkup = request.status.toLowerCase() === 'pending'
                ? `<div class="action-buttons-group" data-request-index="${index}"><button class="btn-action btn-approve" data-action="approve"><i class="bi bi-check-circle-fill"></i> Approve</button><button class="btn-action btn-reject" data-action="reject"><i class="bi bi-x-circle"></i> Reject</button></div>`
                : '';
            const bgClass = ['bg-red', 'bg-orange', 'bg-purple'][index % 3];

            return `
                        <article class="request-card-item" data-request-index="${index}">
                            <div class="card-main-layout">
                                <div class="profile-section">
                                    <div class="avatar ${bgClass}">${initials}</div>
                                    <div class="request-info-details">
                                        <h3 class="employee-name">${request.employeeName}</h3>
                                        <p class="request-meta-data">${request.reason} · ${new Date(request.date).toLocaleDateString('en-ZA', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                    </div>
                                </div>
                                <span class="badge ${statusClass}">${request.status}</span>
                            </div>
                            <p class="request-reason">"${request.reason}"</p>
                            ${actionMarkup}
                        </article>`;
        }).join('');
    };

    const setRequestStatus = (index, newStatus) => {
        if (typeof leaveRequestsData[index] === 'undefined') return;
        leaveRequestsData[index].status = newStatus;
        updateLeaveRequestCounts();
        renderLeaveRequests();

        const activeFilterButton = document.querySelector('.tab-btn.active');
        if (activeFilterButton) {
            const filterValue = activeFilterButton.textContent.trim().toLowerCase();
            const requestCards = document.querySelectorAll('.request-card-item, .request-item');
            requestCards.forEach(card => {
                const badge = card.querySelector('.badge');
                const statusText = badge ? badge.textContent.trim().toLowerCase() : '';
                const normalizedFilter = filterValue === 'rejected' ? 'denied' : filterValue;
                card.style.display = normalizedFilter === 'all' || statusText === normalizedFilter ? 'flex' : 'none';
            });
        }
    };

    const handleLeaveRequestAction = (event) => {
        const button = event.target.closest('.btn-action');
        if (!button) return;

        const card = button.closest('.request-card-item');
        if (!card) return;

        const requestIndex = parseInt(card.getAttribute('data-request-index'), 10);
        const action = button.getAttribute('data-action');
        if (Number.isNaN(requestIndex) || !action) return;

        if (action === 'approve') {
            setRequestStatus(requestIndex, 'Approved');
        } else if (action === 'reject') {
            setRequestStatus(requestIndex, 'Denied');
        }
    };

    if (leaveRequestsList) {
        leaveRequestsList.addEventListener('click', handleLeaveRequestAction);
    }

    // Dashboard Data Loading
    const employeeCount = document.getElementById('employeeCount');
    const leaveCount = document.getElementById('leaveCount');
    const payrollValue = document.getElementById('payrollValue');
    const openRequestCount = document.getElementById('openRequestCount');
    const recentActivityList = document.getElementById('recentActivityList');
    const donutSegments = document.querySelectorAll('.donut-segment');
    const donutInfoCard = document.getElementById('donutInfoCard');
    const donutDeptName = document.getElementById('donutDeptName');
    const donutDeptPercent = document.getElementById('donutDeptPercent');
    const donutDeptRole = document.getElementById('donutDeptRole');
    const deptItems = document.querySelectorAll('.dept-item');

    const showDonutInfo = (target) => {
        const dept = target.getAttribute('data-dept') || 'Department';
        const percent = target.getAttribute('data-percent') || '0%';
        const role = target.getAttribute('data-role') || 'Department overview';

        if (donutDeptName) donutDeptName.textContent = dept;
        if (donutDeptPercent) donutDeptPercent.textContent = percent;
        if (donutDeptRole) donutDeptRole.textContent = role;
        if (donutInfoCard) donutInfoCard.classList.add('visible');

        donutSegments.forEach(segment => segment.classList.remove('is-active'));
        target.classList.add('is-active');
        deptItems.forEach(item => item.classList.remove('is-active'));
        const matchingItem = Array.from(deptItems).find(item => item.getAttribute('data-dept') === dept);
        if (matchingItem) matchingItem.classList.add('is-active');
    };

    const hideDonutInfo = () => {
        if (donutInfoCard) donutInfoCard.classList.remove('visible');
        donutSegments.forEach(segment => segment.classList.remove('is-active'));
        deptItems.forEach(item => item.classList.remove('is-active'));
    };

    donutSegments.forEach(segment => {
        segment.addEventListener('mouseenter', () => showDonutInfo(segment));
        segment.addEventListener('mousemove', () => showDonutInfo(segment));
        segment.addEventListener('mouseleave', hideDonutInfo);
    });

    deptItems.forEach(item => {
        item.addEventListener('mouseenter', () => showDonutInfo(item));
        item.addEventListener('mousemove', () => showDonutInfo(item));
        item.addEventListener('mouseleave', hideDonutInfo);
    });

    const loadData = async () => {
        try {
            const [employeeResponse, attendanceResponse, payrollResponse] = await Promise.all([
                fetch('M1 Project Module - Employee Dummy JSON Data/employee_info.json'),
                fetch('M1 Project Module - Employee Dummy JSON Data/attendance.json'),
                fetch('M1 Project Module - Employee Dummy JSON Data/payroll_data.json')
            ]);

            const employees = (await employeeResponse.json()).employeeInformation || [];
            const attendanceData = (await attendanceResponse.json()).attendanceAndLeave || [];
            const payrollData = (await payrollResponse.json()).payrollData || [];

            if (employeeCount) employeeCount.textContent = employees.length;

            const leaveRequests = attendanceData.flatMap(employee =>
                (employee.leaveRequests || []).map(request => ({
                    ...request,
                    employeeName: employee.name,
                    employeeId: employee.employeeId
                }))
            );

            leaveRequestsData = leaveRequests;
            updateLeaveRequestCounts();
            if (leaveCount) leaveCount.textContent = leaveRequestsData.filter(item => item.status.toLowerCase() === 'approved').length;
            if (openRequestCount) openRequestCount.textContent = leaveRequestsData.filter(item => item.status.toLowerCase() === 'pending').length;

            const totalPayroll = payrollData.reduce((sum, item) => sum + item.finalSalary, 0);
            if (payrollValue) payrollValue.textContent = `R${totalPayroll.toLocaleString()}`;

            if (employeeSelect) {
                employees.forEach(employee => {
                    const option = document.createElement('option');
                    option.value = employee.name;
                    option.textContent = employee.name;
                    employeeSelect.appendChild(option);
                });
            }

            renderLeaveRequests();

            if (recentActivityList) {
                recentActivityList.innerHTML = leaveRequests.slice(0, 4).map((request, index) => {
                    const initials = request.employeeName.split(' ').map(name => name[0]).join('').slice(0, 2).toUpperCase();
                    const statusClass = request.status.toLowerCase() === 'approved' ? 'badge-approved' : request.status.toLowerCase() === 'denied' ? 'badge-rejected' : 'badge-pending';
                    const avatarClass = ['avatar-purple', 'avatar-orange', 'avatar-red', 'avatar-lightgreen'][index % 4];
                    return `
                        <div class="request-item">
                            <div class="request-profile">
                                <div class="avatar ${avatarClass}">${initials}</div>
                                <div class="request-details">
                                    <span class="employee-name">${request.employeeName}</span>
                                    <span class="request-meta">${request.reason} • ${new Date(request.date).toLocaleDateString('en-ZA', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                </div>
                            </div>
                            <span class="badge ${statusClass}">${request.status}</span>
                        </div>`;
                }).join('');
            }
        } catch (error) {
            console.error('Unable to load HR data:', error);
        }
    };

    loadData();

    if (timeOffForm) {
        timeOffForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const employeeName = document.getElementById('employeeSelect').value;
            const leaveType = document.getElementById('leaveType').value;
            const startDate = document.getElementById('startDate').value;
            const endDate = document.getElementById('endDate').value;
            const reason = document.getElementById('reasonInput').value;

            if (!employeeName || !leaveType || !startDate || !endDate || !reason) {
                alert('Please fill out all required fields.');
                return;
            }

            console.log('New Leave Request Submitted:', {
                employeeName,
                leaveType,
                startDate,
                endDate,
                reason
            });

            closeModal();
            alert('Leave request submitted successfully!');
        });
    }

    const tabBtns = document.querySelectorAll('.tab-btn');

    const applyRequestFilter = (filterValue) => {
        const requestCards = document.querySelectorAll('.request-card-item, .request-item');
        const normalizedFilter = filterValue === 'rejected' ? 'denied' : filterValue;

        requestCards.forEach(card => {
            const badge = card.querySelector('.badge');
            const statusText = badge ? badge.textContent.trim().toLowerCase() : '';

            if (normalizedFilter === 'all' || statusText === normalizedFilter) {
                card.style.display = 'flex';
            } else {
                card.style.display = 'none';
            }
        });
    };

    if (tabBtns.length > 0) {
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                tabBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const filterValue = btn.textContent.trim().toLowerCase();
                applyRequestFilter(filterValue);
            });
        });
    }
});

// LOGIN PAGE
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', function(event) {
        event.preventDefault();

        const user = document.getElementById('username').value.trim();
        const pass = document.getElementById('password').value.trim();

        if (user === 'admin' && pass === 'password123') {
            alert('Login successful! Redirecting...');
            window.location.href = 'dashboard.html';
        } else {
            alert('Incorrect password');
        }
    });
}

// Sign out button

document.addEventListener('DOMContentLoaded', () => {
    const signOutBtn = document.getElementById('signOutBtn');
    
    if (signOutBtn) {
        signOutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = 'login.html';
        });
    }
});

// ===============================
// BUTSHA-DEV
// ===============================

// ===============================
// 0. GLOBAL DEBUG + ERROR HANDLING
// ===============================
console.log(
  "%c[script.js] Script loaded",
  "color: green; font-weight: bold; font-size: 14px;",
);
console.log("[script.js] Timestamp:", new Date().toISOString());

window.addEventListener("error", (e) => {
  console.error(
    "[Global Error]",
    e.message,
    "\nFile:",
    e.filename,
    "\nLine:",
    e.lineno,
    "\nColumn:",
    e.colno,
  );
});

window.addEventListener("unhandledrejection", (e) => {
  console.error("[Unhandled Promise Rejection]", e.reason);
});

// ===============================
// 1. DATA - South African Values
// ===============================
const employeeInformation = [
  {
    employeeId: 1,
    name: "Sibongile Nkosi",
    position: "Software Engineer",
    department: "Development",
    salary: 1260000,
    employmentHistory: "Joined in 2015, promoted to Senior in 2018",
    contact: "sibongile.nkosi@moderntech.com",
  },
  {
    employeeId: 2,
    name: "Lungile Moyo",
    position: "HR Manager",
    department: "HR",
    salary: 1440000,
    employmentHistory: "Joined in 2013, promoted to Manager in 2017",
    contact: "lungile.moyo@moderntech.com",
  },
  {
    employeeId: 3,
    name: "Thabo Molefe",
    position: "Quality Analyst",
    department: "QA",
    salary: 990000,
    employmentHistory: "Joined in 2018",
    contact: "thabo.molefe@moderntech.com",
  },
  {
    employeeId: 4,
    name: "Keshav Naidoo",
    position: "Sales Representative",
    department: "Sales",
    salary: 1080000,
    employmentHistory: "Joined in 2020",
    contact: "keshav.naidoo@moderntech.com",
  },
  {
    employeeId: 5,
    name: "Zanele Khumalo",
    position: "Marketing Specialist",
    department: "Marketing",
    salary: 1044000,
    employmentHistory: "Joined in 2019",
    contact: "zanele.khumalo@moderntech.com",
  },
  {
    employeeId: 6,
    name: "Sipho Zulu",
    position: "UI/UX Designer",
    department: "Design",
    salary: 1170000,
    employmentHistory: "Joined in 2016",
    contact: "sipho.zulu@moderntech.com",
  },
  {
    employeeId: 7,
    name: "Naledi Moeketsi",
    position: "DevOps Engineer",
    department: "IT",
    salary: 1296000,
    employmentHistory: "Joined in 2017",
    contact: "naledi.moeketsi@moderntech.com",
  },
  {
    employeeId: 8,
    name: "Farai Gumbo",
    position: "Content Strategist",
    department: "Marketing",
    salary: 1008000,
    employmentHistory: "Joined in 2021",
    contact: "farai.gumbo@moderntech.com",
  },
  {
    employeeId: 9,
    name: "Karabo Dlamini",
    position: "Accountant",
    department: "Finance",
    salary: 1116000,
    employmentHistory: "Joined in 2018",
    contact: "karabo.dlamini@moderntech.com",
  },
  {
    employeeId: 10,
    name: "Fatima Patel",
    position: "Customer Support Lead",
    department: "Support",
    salary: 1044000,
    employmentHistory: "Joined in 2016",
    contact: "fatima.patel@moderntech.com",
  },
];

const payrollTimesheet = [
  {
    employeeId: 1,
    hoursWorked: 160,
    leaveDeductions: 8,
    finalSalary: 69500,
    gross: 99400,
  },
  {
    employeeId: 2,
    hoursWorked: 150,
    leaveDeductions: 10,
    finalSalary: 79000,
    gross: 112000,
  },
  {
    employeeId: 3,
    hoursWorked: 170,
    leaveDeductions: 4,
    finalSalary: 54800,
    gross: 79750,
  },
  {
    employeeId: 4,
    hoursWorked: 165,
    leaveDeductions: 6,
    finalSalary: 59700,
    gross: 85950,
  },
  {
    employeeId: 5,
    hoursWorked: 158,
    leaveDeductions: 5,
    finalSalary: 57850,
    gross: 83425,
  },
  {
    employeeId: 6,
    hoursWorked: 168,
    leaveDeductions: 2,
    finalSalary: 64800,
    gross: 95550,
  },
  {
    employeeId: 7,
    hoursWorked: 175,
    leaveDeductions: 3,
    finalSalary: 71800,
    gross: 105300,
  },
  {
    employeeId: 8,
    hoursWorked: 160,
    leaveDeductions: 0,
    finalSalary: 56000,
    gross: 84000,
  },
  {
    employeeId: 9,
    hoursWorked: 155,
    leaveDeductions: 5,
    finalSalary: 61500,
    gross: 88350,
  },
  {
    employeeId: 10,
    hoursWorked: 162,
    leaveDeductions: 4,
    finalSalary: 57750,
    gross: 83520,
  },
];

const avatarColors = [
  "#14b8a6",
  "#8b5cf6",
  "#f59e0b",
  "#ec4899",
  "#6366f1",
  "#84cc16",
  "#3b82f6",
  "#a855f7",
  "#ef4444",
  "#06b6d4",
];

function getScoreById(id) {
  const scores = {
    1: 92,
    2: 95,
    3: 88,
    4: 90,
    5: 87,
    6: 94,
    7: 96,
    8: 89,
    9: 91,
    10: 93,
  };
  return scores[id] || 85;
}

const employees = employeeInformation.map((emp, idx) => ({
  id: emp.employeeId,
  name: emp.name,
  role: emp.position,
  dept: emp.department,
  department: emp.department,
  salary: emp.salary,
  color: avatarColors[idx % avatarColors.length],
  status: "active",
  score: getScoreById(emp.employeeId),
  contact: emp.contact,
  employmentHistory: emp.employmentHistory,
  initials: emp.name
    .split(" ")
    .map((n) => n[0])
    .join(""),
}));

const payrollData = employees.map((emp) => {
  const timesheet = payrollTimesheet.find((p) => p.employeeId === emp.id);
  if (!timesheet) {
    console.error(
      `[Data] No timesheet found for employeeId ${emp.id} - ${emp.name}`,
    );
    return {
      ...emp,
      hoursWorked: 0,
      leaveDeductions: 0,
      hourlyRate: 0,
      grossPay: 0,
      tax: 0,
      ni: 0,
      pension: 0,
      deductions: 0,
      netPay: 0,
      paid: false,
    };
  }

  const gross = timesheet.gross || 0;
  const tax = Math.round(gross * 0.22);
  const ni = Math.round(gross * 0.13);
  const pension = Math.round(gross * 0.05);

  return {
    ...emp,
    hoursWorked: timesheet.hoursWorked,
    leaveDeductions: timesheet.leaveDeductions,
    hourlyRate: Math.round(emp.salary / 12 / 160),
    grossPay: gross,
    tax: tax,
    ni: ni,
    pension: pension,
    deductions: tax + ni + pension,
    netPay: timesheet.finalSalary,
    paid: false,
  };
});

console.log("[Data] Employees loaded:", employees.length);
console.log("[Data] PayrollData loaded:", payrollData.length);

let currentPayslip = null;
let payslipChartInstance = null;
let payslipTrendChartInstance = null;
let payrollBreakdownChart = null;
let topEarnersChart = null;

// ===============================
// 2. ZAR CURRENCY
// ===============================
const currency = new Intl.NumberFormat("en-ZA", {
  style: "currency",
  currency: "ZAR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

function toRand(amount) {
  if (typeof amount !== "number" || isNaN(amount)) {
    console.warn("[toRand] Invalid amount:", amount);
    return "R0";
  }
  return currency.format(amount).replace("ZAR", "R");
}

// ===============================
// 3. TOAST
// ===============================
function showToast(message, type = "success") {
  console.log(`[Toast] ${type}: ${message}`);
  const container = document.getElementById("toastContainer");
  if (!container) {
    console.warn("[Toast] #toastContainer not found");
    return;
  }
  const icon = type === "error" ? "fa-circle-xmark" : "fa-check";
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.innerHTML = `
    <div class="toast-icon">
      <i class="fa-solid ${icon}"></i>
    </div>
    <p>${message}</p>
    <button type="button" onclick="this.parentElement.remove()" aria-label="Close notification">
      <i class="fa-solid fa-xmark"></i>
    </button>
  `;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}

// ===============================
// 4. EMPLOYEE DIRECTORY PAGE
// ===============================
function initEmployeePage() {
  console.log("[EmployeePage] Init started...");

  const grid = document.getElementById("employeeGrid");
  if (!grid) {
    console.error(
      "[EmployeePage] CRITICAL: #employeeGrid not found. Wrong page?",
    );
    return;
  }

  const cards = document.querySelectorAll(".employee-card[data-employee-id]");
  console.log(`[EmployeePage] Found ${cards.length} employee cards`);

  if (cards.length === 0) {
    console.warn(
      "[EmployeePage] No employee cards found. Check HTML structure.",
    );
    return;
  }

  cards.forEach((card, index) => {
    const empId = parseInt(card.dataset.employeeId);
    if (isNaN(empId)) {
      console.error(
        `[EmployeePage] Card #${index} has invalid data-employee-id`,
      );
      return;
    }

    const emp = employees.find((e) => e.id === empId);
    if (!emp) {
      console.error(`[EmployeePage] No employee data for ID ${empId}`);
      return;
    }

    card.addEventListener("click", () => {
      console.log(`[EmployeePage] Card clicked: ${emp.name}`);
      viewEmployeeProfile(empId);
    });

    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        viewEmployeeProfile(empId);
      }
    });
  });

  initEmployeeSearch();
  console.log("[EmployeePage] Init complete");
}

function viewEmployeeProfile(empId) {
  console.log(`[EmployeeProfile] Opening ID: ${empId}`);
  const emp = employees.find((e) => e.id === empId);
  if (!emp) {
    showToast("Employee not found", "error");
    return;
  }

  const modal = document.getElementById("employeeModal");
  const content = document.getElementById("employeeModalContent");
  if (!modal || !content) {
    showToast("Modal elements missing", "error");
    return;
  }

  content.innerHTML = `
    <div class="space-y-6">
      <div class="text-center pb-6 border-b border-slate-200">
        <div class="employee-avatar mx-auto mb-3" style="background: ${emp.color}; width: 80px; height: 80px; font-size: 24px;">
          ${emp.initials}
        </div>
        <h4 class="text-2xl font-bold">${emp.name}</h4>
        <p class="text-sm text-slate-500">${emp.role}</p>
        <span class="status-badge mt-2 inline-block">Active</span>
      </div>
      <div class="grid grid-cols-2 gap-4 text-sm">
        <div><p class="text-slate-500 mb-1">Department</p><p class="font-bold">${emp.dept}</p></div>
        <div><p class="text-slate-500 mb-1">Annual Salary</p><p class="font-bold">${toRand(emp.salary)}</p></div>
        <div class="col-span-2"><p class="text-slate-500 mb-1">Contact</p><p class="font-bold text-xs">${emp.contact}</p></div>
      </div>
      <div class="bg-purple-50 rounded-2xl p-5">
        <h5 class="font-bold mb-2 flex items-center gap-2">
          <i class="fa-solid fa-clock-rotate-left text-purple-500"></i>
          Employment History
        </h5>
        <p class="text-sm text-slate-600">${emp.employmentHistory}</p>
      </div>
    </div>
  `;

  modal.classList.remove("hidden");
  modal.classList.add("flex");
}

function closeEmployeeModal() {
  const modal = document.getElementById("employeeModal");
  if (modal) {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
  }
}

function initEmployeeSearch() {
  const searchInput = document.getElementById("employeeSearch");
  if (!searchInput) return;

  searchInput.addEventListener("input", (e) => {
    const search = e.target.value.toLowerCase();
    const cards = document.querySelectorAll(".employee-card[data-employee-id]");
    const empty = document.getElementById("employeeEmpty");
    let visibleCount = 0;

    cards.forEach((card) => {
      const empId = parseInt(card.dataset.employeeId);
      const emp = employees.find((e) => e.id === empId);
      if (!emp) return;

      const matches =
        emp.name.toLowerCase().includes(search) ||
        emp.role.toLowerCase().includes(search) ||
        emp.dept.toLowerCase().includes(search);
      card.style.display = matches ? "" : "none";
      if (matches) visibleCount++;
    });

    if (empty) empty.classList.toggle("hidden", visibleCount > 0);
  });
}

// ===============================
// 5. PAYROLL PAGE
// ===============================
function initPayrollPage() {
  console.log("[Payroll] Init started...");

  const tableBody = document.getElementById("payrollTableBody");
  if (!tableBody) {
    console.error("[Payroll] CRITICAL: #payrollTableBody not found");
    return;
  }

  const payslipBtns = document.querySelectorAll(".btn-table[data-payslip-id]");
  console.log(`[Payroll] Found ${payslipBtns.length} payslip buttons`);

  payslipBtns.forEach((btn) => {
    const empId = parseInt(btn.dataset.payslipId);
    if (isNaN(empId)) return;

    btn.addEventListener("click", (e) => {
      e.preventDefault();
      console.log(`[Payroll] Payslip clicked for ID: ${empId}`);
      viewPayslip(empId);
    });
  });

  try {
    updatePayrollSummary();
  } catch (err) {
    console.error("[Payroll] Summary failed:", err);
  }
  try {
    renderPayrollCharts();
  } catch (err) {
    console.error("[Payroll] Charts failed:", err);
  }
  try {
    initPayslipModal();
  } catch (err) {
    console.error("[Payroll] Modal init failed:", err);
  }

  const exportBtn = document.getElementById("exportAllBtn");
  if (exportBtn)
    exportBtn.addEventListener("click", () =>
      showToast("Exporting all payslips to ZIP..."),
    );

  console.log("[Payroll] Init complete");
}

function updatePayrollSummary() {
  const grossTotal = payrollData.reduce((sum, p) => sum + (p.grossPay || 0), 0);
  const deductionsTotal = payrollData.reduce(
    (sum, p) => sum + (p.deductions || 0),
    0,
  );
  const netTotal = payrollData.reduce((sum, p) => sum + (p.netPay || 0), 0);

  const grossEl = document.getElementById("grossPayroll");
  const deductEl = document.getElementById("totalDeductions");
  const netEl = document.getElementById("netPayroll");

  if (grossEl) grossEl.textContent = toRand(grossTotal);
  if (deductEl) deductEl.textContent = toRand(deductionsTotal);
  if (netEl) netEl.textContent = toRand(netTotal);
}

function renderPayrollCharts() {
  if (typeof Chart === "undefined") {
    console.warn("[Charts] Chart.js not loaded. Skipping.");
    return;
  }
  renderBreakdownChart();
  renderTopEarnersChart();
}

function renderBreakdownChart() {
  const ctx = document.getElementById("payrollBreakdownChart");
  if (!ctx) return;

  const grossTotal = payrollData.reduce((sum, p) => sum + (p.grossPay || 0), 0);
  const taxTotal = payrollData.reduce((sum, p) => sum + (p.tax || 0), 0);
  const niTotal = payrollData.reduce((sum, p) => sum + (p.ni || 0), 0);
  const pensionTotal = payrollData.reduce(
    (sum, p) => sum + (p.pension || 0),
    0,
  );
  const netTotal = payrollData.reduce((sum, p) => sum + (p.netPay || 0), 0);

  if (payrollBreakdownChart) payrollBreakdownChart.destroy();

  payrollBreakdownChart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Net Pay", "PAYE Tax", "UIF/NI", "Pension"],
      datasets: [
        {
          data: [netTotal, taxTotal, niTotal, pensionTotal],
          backgroundColor: ["#14b8a6", "#ef4444", "#f59e0b", "#8b5cf6"],
          borderWidth: 2,
          borderColor: "#fff",
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
          labels: { padding: 12, font: { size: 11 }, usePointStyle: true },
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              const percent =
                grossTotal > 0
                  ? ((context.parsed / grossTotal) * 100).toFixed(1)
                  : 0;
              return `${context.label}: ${toRand(context.parsed)} (${percent}%)`;
            },
          },
        },
      },
    },
  });
}

function renderTopEarnersChart() {
  const ctx = document.getElementById("topEarnersChart");
  if (!ctx) return;

  const topFive = [...payrollData]
    .filter((p) => p.netPay && p.name)
    .sort((a, b) => b.netPay - a.netPay)
    .slice(0, 5);
  if (topFive.length === 0) return;

  if (topEarnersChart) topEarnersChart.destroy();

  topEarnersChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: topFive.map((p) => p.name.split(" ")[0]),
      datasets: [
        {
          label: "Net Pay",
          data: topFive.map((p) => p.netPay),
          backgroundColor: topFive.map((p) => p.color || "#14b8a6"),
          borderRadius: 6,
          borderSkipped: false,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (context) => toRand(context.parsed.y),
            title: (context) => topFive[context[0].dataIndex].name,
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: (v) => "R" + Math.round(v / 1000) + "k",
            font: { size: 10 },
          },
          grid: { color: "#f1f5f9" },
        },
        x: { ticks: { font: { size: 10 } }, grid: { display: false } },
      },
    },
  });
}

function getQuirkyFact(data) {
  if (!data?.id) return "Keep up the great work!";
  const facts = [
    `With ${data.hoursWorked} hours, that's ${Math.round(data.hoursWorked / 8)} full work days!`,
    `Your net pay could buy ${Math.floor(data.netPay / 35)} cappuccinos ☕`,
    `You contributed ${toRand(data.pension || 0)} to retirement this month.`,
    `If you saved 10%, you'd have ${toRand(data.netPay * 0.1)} more`,
    `${data.leaveDeductions}h leave = ${Math.round((data.leaveDeductions / 8) * 10) / 10} days off`,
    `Your hourly rate: ${toRand(data.hourlyRate || 0)}/hr`,
    `Net is ${data.salary ? ((data.netPay / (data.salary / 12)) * 100).toFixed(0) : 0}% of monthly salary`,
  ];
  return facts[data.id % facts.length];
}

function getMonthData(data, monthOffset) {
  const variance = Math.max(0.5, 1 - monthOffset * 0.05);
  const gross = Math.round((data.grossPay || 0) * variance);
  const tax = Math.round(gross * 0.22);
  const ni = Math.round(gross * 0.13);
  const pension = Math.round(gross * 0.05);
  return { gross, tax, ni, pension, net: gross - tax - ni - pension };
}

function viewPayslip(empId) {
  console.log(`[Payslip] Opening for ID: ${empId}`);
  const data = payrollData.find((p) => p.id === empId);
  if (!data) {
    showToast("Employee payroll data not found", "error");
    return;
  }

  currentPayslip = data;
  const modal = document.getElementById("payslipModal");
  const content = document.getElementById("payslipContent");
  if (!modal || !content) {
    showToast("Payslip modal missing", "error");
    return;
  }

  const deductionPercent =
    data.grossPay > 0
      ? ((data.deductions / data.grossPay) * 100).toFixed(1)
      : 0;
  const payDate = new Date().toLocaleDateString("en-ZA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  content.innerHTML = `
    <div id="payslipToExport" class="space-y-6">
      <div class="flex justify-between items-start pb-6 border-b-2 border-slate-200">
        <div>
          <div class="flex items-center gap-3 mb-2">
            <div class="text-3xl">💼</div>
            <div><h4 class="text-xl font-bold text-slate-800">ModernTech HR</h4><p class="text-xs text-slate-500">Payroll Department</p></div>
          </div>
          <p class="text-xs text-slate-400 mt-2">Pay Period: June 2026</p>
          <p class="text-xs text-slate-400">Pay Date: ${payDate}</p>
        </div>
        <div class="text-right">
          <div class="employee-avatar mx-auto mb-2" style="background: ${data.color}; width: 64px; height: 64px;">${data.initials}</div>
          <p class="font-bold text-slate-800">${data.name}</p>
          <p class="text-sm text-slate-500">${data.role}</p>
          <p class="text-xs text-slate-400">${data.dept}</p>
        </div>
      <div class="bg-gradient-to-r from-purple-50 to-teal-50 rounded-lg p-3 border border-purple-100">
        <p class="text-sm text-slate-600 flex items-center gap-2"><i class="fa-solid fa-lightbulb text-amber-500"></i><span>${getQuirkyFact(data)}</span></p>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h5 class="font-bold text-slate-700 mb-3 flex items-center gap-2"><i class="fa-solid fa-circle-plus text-green-500"></i>Earnings</h5>
          <div class="space-y-2 bg-slate-50 rounded-lg p-4">
            <div class="flex justify-between text-sm"><span class="text-slate-600">Basic Salary</span><span class="font-semibold mono">${toRand(data.grossPay)}</span></div>
            <div class="flex justify-between text-sm"><span class="text-slate-600">Hours Worked</span><span class="font-semibold">${data.hoursWorked}h @ ${toRand(data.hourlyRate)}/hr</span></div>
            <div class="flex justify-between text-sm pt-2 border-t border-slate-200"><span class="font-bold text-slate-700">Gross Total</span><span class="font-bold text-green-600 mono">${toRand(data.grossPay)}</span></div>
          </div>
        </div>
        <div>
          <h5 class="font-bold text-slate-700 mb-3 flex items-center gap-2"><i class="fa-solid fa-circle-minus text-red-500"></i>Deductions</h5>
          <div class="space-y-2 bg-slate-50 rounded-lg p-4">
            <div class="flex justify-between text-sm"><span class="text-slate-600">PAYE Tax (22%)</span><span class="font-semibold text-red-600 mono">-${toRand(data.tax)}</span></div>
            <div class="flex justify-between text-sm"><span class="text-slate-600">UIF/NI (13%)</span><span class="font-semibold text-red-600 mono">-${toRand(data.ni)}</span></div>
            <div class="flex justify-between text-sm"><span class="text-slate-600">Pension (5%)</span><span class="font-semibold text-amber-600 mono">-${toRand(data.pension)}</span></div>
            <div class="flex justify-between text-sm pt-2 border-t border-slate-200"><span class="font-bold text-slate-700">Total Deductions</span><span class="font-bold text-red-600 mono">-${toRand(data.deductions)}</span></div>
          </div>
        </div>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="bg-white rounded-lg p-4 border border-slate-200">
          <h5 class="font-bold text-slate-700 mb-3 text-sm">This Month Split</h5>
          <div style="height: 200px; position: relative;"><canvas id="payslipChart"></canvas></div>
        </div>
        <div class="bg-white rounded-lg p-4 border border-slate-200">
          <h5 class="font-bold text-slate-700 mb-3 text-sm">3-Month Trend</h5>
          <div style="height: 200px; position: relative;"><canvas id="payslipTrendChart"></canvas></div>
        </div>
      </div>
      <div class="bg-gradient-to-r from-teal-500 to-teal-600 rounded-xl p-6 text-white">
        <div class="flex justify-between items-center">
          <div><p class="text-teal-100 text-sm mb-1">Net Pay - Take Home</p><p class="text-3xl font-bold mono">${toRand(data.netPay)}</p></div>
          <div class="text-right"><p class="text-teal-100 text-xs mb-1">Deduction Rate</p><p class="text-2xl font-bold">${deductionPercent}%</p></div>
        </div>
      </div>
      <div class="grid grid-cols-2 gap-4 text-sm pt-4 border-t border-slate-200">
        <div class="bg-blue-50 rounded-lg p-3"><p class="text-slate-500 mb-1 text-xs">Leave Taken</p><p class="font-bold text-slate-700">${data.leaveDeductions} hours</p></div>
        <div class="bg-purple-50 rounded-lg p-3"><p class="text-slate-500 mb-1 text-xs">Employee ID</p><p class="font-bold text-slate-700">#${data.id.toString().padStart(4, "0")}</p></div>
      </div>
    </div>
  `;

  modal.classList.remove("hidden");
  modal.classList.add("flex");

  requestAnimationFrame(() => setTimeout(() => renderPayslipCharts(data), 100));
}

function renderPayslipCharts(data) {
  if (typeof Chart === "undefined") {
    console.warn("[PayslipCharts] Chart.js not available");
    return;
  }

  const doughnutCtx = document.getElementById("payslipChart");
  const barCtx = document.getElementById("payslipTrendChart");
  if (!doughnutCtx || !barCtx) return;

  if (payslipChartInstance) payslipChartInstance.destroy();
  if (payslipTrendChartInstance) payslipTrendChartInstance.destroy();

  payslipChartInstance = new Chart(doughnutCtx, {
    type: "doughnut",
    data: {
      labels: ["Net Pay", "Tax", "NI/UIF", "Pension"],
      datasets: [
        {
          data: [data.netPay, data.tax, data.ni, data.pension],
          backgroundColor: ["#14b8a6", "#ef4444", "#f59e0b", "#8b5cf6"],
          borderWidth: 0,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
          labels: { padding: 10, font: { size: 10 }, usePointStyle: true },
        },
        tooltip: {
          callbacks: { label: (c) => `${c.label}: ${toRand(c.parsed)}` },
        },
      },
    },
  });

  const april = getMonthData(data, 2);
  const may = getMonthData(data, 1);
  const june = { gross: data.grossPay, net: data.netPay };

  payslipTrendChartInstance = new Chart(barCtx, {
    type: "bar",
    data: {
      labels: ["April", "May", "June"],
      datasets: [
        {
          label: "Gross Pay",
          data: [april.gross, may.gross, june.gross],
          backgroundColor: "#8b5cf6",
          borderRadius: 6,
        },
        {
          label: "Net Pay",
          data: [april.net, may.net, june.net],
          backgroundColor: "#14b8a6",
          borderRadius: 6,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
          labels: { padding: 10, font: { size: 10 }, usePointStyle: true },
        },
        tooltip: {
          callbacks: {
            label: (c) => `${c.dataset.label}: ${toRand(c.parsed.y)}`,
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: (v) => "R" + Math.round(v / 1000) + "k",
            font: { size: 10 },
          },
        },
        x: { ticks: { font: { size: 10 } } },
      },
    },
  });
}

function downloadPayslipPDF() {
  if (!currentPayslip) {
    showToast("No payslip data available", "error");
    return;
  }
  if (typeof window.jspdf === "undefined") {
    showToast("PDF library not loaded", "error");
    return;
  }

  try {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const data = currentPayslip;

    doc
      .setFontSize(20)
      .setTextColor(20, 184, 166)
      .text("💼 ModernTech HR", 20, 20);
    doc.setFontSize(10).setTextColor(100).text("Payslip - June 2026", 20, 27);
    doc.setFontSize(14).setTextColor(0).text(data.name, 20, 40);
    doc
      .setFontSize(10)
      .setTextColor(100)
      .text(`${data.role} - ${data.dept}`, 20, 46);
    doc.text(`Employee ID: #${data.id.toString().padStart(4, "0")}`, 20, 52);

    let y = 65;
    doc.setFontSize(12).setTextColor(0).text("Earnings", 20, y);
    y += 7;
    doc.setFontSize(10).text(`Gross Pay: ${toRand(data.grossPay)}`, 25, y);
    y += 6;
    doc.text(
      `Hours: ${data.hoursWorked}h @ ${toRand(data.hourlyRate)}/hr`,
      25,
      y,
    );

    y += 12;
    doc.setFontSize(12).text("Deductions", 20, y);
    y += 7;
    doc.setFontSize(10).text(`PAYE Tax (22%): -${toRand(data.tax)}`, 25, y);
    y += 6;
    doc.text(`UIF/NI (13%): -${toRand(data.ni)}`, 25, y);
    y += 6;
    doc.text(`Pension (5%): -${toRand(data.pension)}`, 25, y);
    y += 6;
    doc
      .setFont(undefined, "bold")
      .text(`Total: -${toRand(data.deductions)}`, 25, y);

    y += 15;
    doc
      .setFontSize(16)
      .setTextColor(20, 184, 166)
      .text(`Net Pay: ${toRand(data.netPay)}`, 20, y);
    doc.setFontSize(8).setTextColor(150).text(getQuirkyFact(data), 20, 280);

    doc.save(`Payslip_${data.name.replace(/\s+/g, "_")}_June2026.pdf`);
    showToast("PDF downloaded successfully");
  } catch (err) {
    console.error("[PDF] Generation failed:", err);
    showToast("Error generating PDF", "error");
  }
}

function closePayslipModal() {
  const modal = document.getElementById("payslipModal");
  if (modal) {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
  }
  if (payslipChartInstance) {
    payslipChartInstance.destroy();
    payslipChartInstance = null;
  }
  if (payslipTrendChartInstance) {
    payslipTrendChartInstance.destroy();
    payslipTrendChartInstance = null;
  }
}

function initPayslipModal() {
  const modal = document.getElementById("payslipModal");
  if (!modal) return;

  const closeBtn = modal.querySelector(".modal-close");
  if (closeBtn) closeBtn.addEventListener("click", closePayslipModal);

  modal.addEventListener("click", (e) => {
    if (e.target === modal) closePayslipModal();
  });

  const downloadBtn = document.getElementById("downloadPayslipBtn");
  if (downloadBtn) downloadBtn.addEventListener("click", downloadPayslipPDF);

  const emailBtn = document.getElementById("emailPayslipBtn");
  if (emailBtn)
    emailBtn.addEventListener("click", () => {
      const email = currentPayslip?.contact || "employee";
      showToast(`Payslip emailed to ${email}`);
    });
}

// ===============================
// 6. GLOBAL HANDLERS
// ===============================
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    console.log("[Global] Escape pressed");
    closeEmployeeModal();
    closePayslipModal();
  }
});

document.addEventListener("DOMContentLoaded", () => {
  console.log(
    "%c[DOM] DOMContentLoaded fired",
    "color: blue; font-weight: bold;",
  );
  console.log("[DOM] Current page:", window.location.pathname);

  if (document.getElementById("employeeGrid")) {
    console.log("[DOM] Detected Employee page");
    initEmployeePage();
  } else {
    console.log("[DOM] Not on Employee page - skipping initEmployeePage");
  }

  if (document.getElementById("payrollTableBody")) {
    console.log("[DOM] Detected Payroll page");
    initPayrollPage();
  } else {
    console.log("[DOM] Not on Payroll page - skipping initPayrollPage");
  }

  const empModal = document.getElementById("employeeModal");
  if (empModal) {
    empModal.addEventListener("click", (e) => {
      if (e.target === empModal) {
        console.log("[Modal] Clicked outside employee modal, closing");
        closeEmployeeModal();
      }
    });
  }

  // Attach modal close button for employee modal
  const empModalClose = document.querySelector("#employeeModal.modal-close");
  if (empModalClose) {
    empModalClose.addEventListener("click", closeEmployeeModal);
  }

  console.log("[DOM] DOMContentLoaded setup complete");
});

window.viewEmployeeProfile = viewEmployeeProfile;
window.closeEmployeeModal = closeEmployeeModal;
window.viewPayslip = viewPayslip;
window.closePayslipModal = closePayslipModal;

console.log("[script.js] All functions exposed to window");

// ============================================
// CALEB_DEV
// ============================================

// ============================================
// CONSTANTS & CONFIGURATION - MODERNTECH THEME
// ============================================
const SHIFT_START_HOUR = 8;
const SHIFT_DURATION_HOURS = 8;

// Color Palette - Matching ModernTech HR System
const COLORS = {
    primary: '#6366f1',
    primaryLight: '#8b5cf6',
    primaryDark: '#4f46e5',
    accent: '#14b8a6',
    accentHover: '#0d9488',
    success: '#10b981',
    successBg: 'rgba(16, 185, 129, 0.18)',
    danger: '#ef4444',
    dangerBg: 'rgba(239, 68, 68, 0.18)',
    warning: '#f59e0b',
    warningBg: 'rgba(245, 158, 11, 0.18)',
    info: '#6366f1',
    infoBg: 'rgba(99, 102, 241, 0.15)',
    surface: '#131a2c',
    surfaceAlt: '#17203a',
    surfaceStrong: '#0f172a',
    text: '#f8fafc',
    textMuted: '#94a3b8',
    textSoft: '#cbd5e1',
    border: 'rgba(255, 255, 255, 0.08)',
    avatar: ['#6366f1', '#14b8a6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f43f5e', '#10b981']
};

// Detect which page we're on
const currentPage = window.location.pathname.toLowerCase();
const isAttendancePage = currentPage.includes('attendance');
const isReviewsPage = currentPage.includes('reviews');

// DOM Elements
const attendanceSection = document.getElementById('attendance-data');
const visualsSection = document.getElementById('attendance-visuals');
const reviewsContainer = document.getElementById('reviews-data-list');

// Data Sources
const ATTENDANCE_SOURCES = [
    'data/attendance.json',
    './data/attendance.json',
    '../data/attendance.json',
    '../M1 Project Module - Employee Dummy JSON Data/attendance.json'
];

const REVIEW_SOURCES = [
    'data/employee_info.json',
    './data/employee_info.json',
    '../data/employee_info.json'
];

// ============================================
// FALLBACK DATA
// ============================================
const fallbackAttendanceData = {
    attendanceAndLeave: [
        {
            employeeId: 1,
            name: 'Sibongile Nkosi',
            attendance: [
                { date: '2025-07-25', status: 'Present' },
                { date: '2025-07-26', status: 'Absent' },
                { date: '2025-07-27', status: 'Present' },
                { date: '2025-07-28', status: 'Present' },
                { date: '2025-07-29', status: 'Present' }
            ]
        },
        {
            employeeId: 2,
            name: 'Lungile Moyo',
            attendance: [
                { date: '2025-07-25', status: 'Present' },
                { date: '2025-07-26', status: 'Present' },
                { date: '2025-07-27', status: 'Absent' },
                { date: '2025-07-28', status: 'Present' },
                { date: '2025-07-29', status: 'Present' }
            ]
        },
        {
            employeeId: 3,
            name: 'Thandiwe Zulu',
            attendance: [
                { date: '2025-07-25', status: 'Present' },
                { date: '2025-07-26', status: 'Present' },
                { date: '2025-07-27', status: 'Present' },
                { date: '2025-07-28', status: 'Absent' },
                { date: '2025-07-29', status: 'Present' }
            ]
        }
    ]
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

async function fetchWithFallback(sources, parser, fallback) {
    for (const source of sources) {
        try {
            const response = await fetch(source);
            if (response.ok) {
                const data = await response.json();
                const parsed = parser(data);
                if (parsed && (Array.isArray(parsed) ? parsed.length : true)) {
                    return parsed;
                }
            }
        } catch (error) {
            console.warn(`Failed to fetch ${source}:`, error.message);
        }
    }
    return fallback();
}

function getInitials(name = '') {
    return name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0])
        .join('')
        .toUpperCase();
}

function getStars(rating = 0) {
    const rounded = Math.min(Math.max(Math.round(rating), 0), 5);
    return '★'.repeat(rounded) + '☆'.repeat(5 - rounded);
}

function getScheduleTimes(record) {
    const baseHour = SHIFT_START_HOUR + ((record.employeeId - 1) % 3);
    const checkInTime = record.checkIn || `${String(baseHour).padStart(2, '0')}:00`;
    const checkOutTime = record.checkOut || `${String(baseHour + SHIFT_DURATION_HOURS).padStart(2, '0')}:30`;
    return { checkInTime, checkOutTime };
}

function getAttendanceMarkup(attendance = []) {
    if (!attendance?.length) {
        return '<span style="color: #94a3b8; font-style: italic;">No data</span>';
    }

    return attendance.map((item) => {
        const status = (item.status || 'unknown').toLowerCase();
        let className = 'attendance-badge';
        if (status === 'present') className += ' present';
        if (status === 'absent') className += ' absent';
        return `<span class="${className}">${item.date} • ${item.status || 'Unknown'}</span>`;
    }).join('');
}

function getFeedback(employee = {}) {
    const role = employee.position || 'team member';
    const department = employee.department || 'the company';
    return `${employee.name || 'This employee'} brings strong focus to ${department.toLowerCase()} work and continues to contribute positively as a ${role.toLowerCase()}. Their reliability and collaboration make them a valuable part of the team.`;
}

function getColorForEmployee(id) {
    return COLORS.avatar[(id - 1) % COLORS.avatar.length];
}

// ============================================
// NAVIGATION
// ============================================

function highlightActiveNav() {
    const currentPath = window.location.pathname.toLowerCase();
    document.querySelectorAll('.nav-links a').forEach((link) => {
        const href = link.getAttribute('href')?.toLowerCase() || '';
        const isActive = currentPath.includes(href.replace('.html', '')) || 
                         (href === '' && currentPath.endsWith('/'));
        link.closest('li')?.classList.toggle('active', isActive);
    });
}

// ============================================
// NOTIFICATION SYSTEM
// ============================================

function showNotification(message, type = 'success') {
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();
    
    const notification = document.createElement('div');
    notification.className = 'notification';
    
    const colors = {
        success: '#10b981',
        error: '#ef4444',
        warning: '#f59e0b',
        info: '#6366f1'
    };
    
    const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 16px 24px;
        background: ${colors[type] || colors.success};
        color: white;
        border-radius: 16px;
        box-shadow: 0 20px 60px rgba(0,0,0,0.5);
        z-index: 100000;
        font-weight: 600;
        font-size: 0.95rem;
        animation: slideInRight 0.3s ease;
        max-width: 400px;
        border: 1px solid rgba(255,255,255,0.08);
        font-family: 'Inter', system-ui, sans-serif;
    `;
    
    notification.innerHTML = `${icons[type] || '📢'} ${message}`;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ============================================
// TABLE CREATION - DARK THEME WITH PROPER CONTRAST
// ============================================

function createAttendanceTable(records) {
    const table = document.createElement('table');
    table.className = 'attendance-table';
    table.style.cssText = `
        width: 100%;
        border-collapse: collapse;
        background: #0f172a;
        color: #e2e8f0;
        border-radius: 12px;
        overflow: hidden;
    `;
    
    table.innerHTML = `
        <thead>
            <tr style="
                background: #0a0f1a;
                border-bottom: 2px solid #1e293b;
            ">
                <th style="
                    padding: 14px 16px;
                    text-align: left;
                    font-weight: 700;
                    font-size: 0.8rem;
                    text-transform: uppercase;
                    letter-spacing: 0.12em;
                    color: #94a3b8;
                ">Employee ID</th>
                <th style="
                    padding: 14px 16px;
                    text-align: left;
                    font-weight: 700;
                    font-size: 0.8rem;
                    text-transform: uppercase;
                    letter-spacing: 0.12em;
                    color: #94a3b8;
                ">Name</th>
                <th style="
                    padding: 14px 16px;
                    text-align: left;
                    font-weight: 700;
                    font-size: 0.8rem;
                    text-transform: uppercase;
                    letter-spacing: 0.12em;
                    color: #94a3b8;
                ">Attendance</th>
                <th style="
                    padding: 14px 16px;
                    text-align: left;
                    font-weight: 700;
                    font-size: 0.8rem;
                    text-transform: uppercase;
                    letter-spacing: 0.12em;
                    color: #94a3b8;
                ">Check In</th>
                <th style="
                    padding: 14px 16px;
                    text-align: left;
                    font-weight: 700;
                    font-size: 0.8rem;
                    text-transform: uppercase;
                    letter-spacing: 0.12em;
                    color: #94a3b8;
                ">Check Out</th>
            </tr>
        </thead>
        <tbody></tbody>
    `;
    
    const tbody = table.querySelector('tbody');
    
    if (!records?.length) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" style="
                    padding: 40px;
                    text-align: center;
                    color: #94a3b8;
                    background: #0f172a;
                ">
                    <div style="font-size: 1.1rem;">📋 No attendance records available</div>
                </td>
            </tr>
        `;
        return table;
    }
    
    records.forEach((record, index) => {
        const attendanceSummary = getAttendanceMarkup(record.attendance);
        const { checkInTime, checkOutTime } = getScheduleTimes(record);
        const bgColor = index % 2 === 0 ? '#0f172a' : '#1a2332';
        
        const row = document.createElement('tr');
        row.style.cssText = `
            background: ${bgColor};
            transition: all 0.2s ease;
            border-bottom: 1px solid #1e293b;
        `;
        
        // Hover effect
        row.addEventListener('mouseenter', function() {
            this.style.background = '#2d3748';
            this.style.transform = 'scale(1.002)';
            this.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';
        });
        row.addEventListener('mouseleave', function() {
            this.style.background = bgColor;
            this.style.transform = 'scale(1)';
            this.style.boxShadow = 'none';
        });
        
        row.innerHTML = `
            <td style="
                padding: 12px 16px;
                font-weight: 700;
                color: #a5b4fc;
                font-size: 0.9rem;
            ">
                #${String(record.employeeId).padStart(3, '0')}
            </td>
            <td style="
                padding: 12px 16px;
                font-weight: 600;
                color: #f1f5f9;
                font-size: 0.95rem;
            ">
                ${record.name}
            </td>
            <td style="
                padding: 12px 16px;
            ">
                ${attendanceSummary}
            </td>
            <td style="
                padding: 12px 16px;
            ">
                <span style="
                    display: inline-block;
                    padding: 5px 14px;
                    background: #1e293b;
                    color: #94a3b8;
                    border-radius: 20px;
                    font-weight: 600;
                    font-size: 0.85rem;
                    border: 1px solid #334155;
                ">
                    ⏰ ${checkInTime}
                </span>
            </td>
            <td style="
                padding: 12px 16px;
            ">
                <span style="
                    display: inline-block;
                    padding: 5px 14px;
                    background: #1e293b;
                    color: #94a3b8;
                    border-radius: 20px;
                    font-weight: 600;
                    font-size: 0.85rem;
                    border: 1px solid #334155;
                ">
                    ⏰ ${checkOutTime}
                </span>
            </td>
        `;
        tbody.appendChild(row);
    });
    
    return table;
}

// ============================================
// RENDER FUNCTIONS
// ============================================

function renderVisuals(records = []) {
    if (!visualsSection) return;
    
    const allAttendance = records.flatMap((record) => record.attendance || []);
    const presentCount = allAttendance.filter((item) => (item.status || '').toLowerCase() === 'present').length;
    const absentCount = allAttendance.filter((item) => (item.status || '').toLowerCase() === 'absent').length;
    const totalCount = allAttendance.length || 1;
    
    const presentPercent = Math.round((presentCount / totalCount) * 100);
    const absentPercent = Math.round((absentCount / totalCount) * 100);
    
    const dates = [...new Set(allAttendance.map(item => item.date))].sort();
    
    const dailySummary = dates.map((date) => {
        const dayRecords = allAttendance.filter((item) => item.date === date);
        const present = dayRecords.filter((item) => (item.status || '').toLowerCase() === 'present').length;
        const absent = dayRecords.filter((item) => (item.status || '').toLowerCase() === 'absent').length;
        return { date, present, absent };
    });
    
    const maxValue = Math.max(...dailySummary.map(d => Math.max(d.present, d.absent)), 1);
    const maxHeight = 120;
    
    visualsSection.innerHTML = `
        <div class="visuals-header" style="
            background: rgba(255, 255, 255, 0.04);
            border-radius: 1.5rem;
            padding: 1.2rem 1.3rem;
            border: 1px solid rgba(255, 255, 255, 0.08);
            margin-bottom: 1rem;
        ">
            <h2 style="color: #f8fafc; font-size: 1.25rem; margin-bottom: 0.5rem;">📊 Attendance Overview</h2>
            <p style="color: #94a3b8;">Live summary of presence and attendance trends for the current period</p>
        </div>
        <div class="visual-grid" style="
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 1rem;
        ">
            <div class="visual-card" style="
                background: #0f172a;
                border-radius: 1.5rem;
                padding: 1.35rem;
                border: 1px solid #1e293b;
                box-shadow: 0 18px 50px rgba(0, 0, 0, 0.16);
                transition: transform 0.3s ease, box-shadow 0.3s ease;
            ">
                <h3 style="color: #94a3b8; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.8rem;">✅ Present</h3>
                <div class="stat-value" style="font-size: 2rem; font-weight: 800; color: #10b981; margin-bottom: 0.25rem;">${presentPercent}%</div>
                <div class="stat-caption" style="color: #64748b; font-size: 0.9rem;">${presentCount} of ${totalCount} check-ins</div>
            </div>
            <div class="visual-card" style="
                background: #0f172a;
                border-radius: 1.5rem;
                padding: 1.35rem;
                border: 1px solid #1e293b;
                box-shadow: 0 18px 50px rgba(0, 0, 0, 0.16);
                transition: transform 0.3s ease, box-shadow 0.3s ease;
            ">
                <h3 style="color: #94a3b8; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.8rem;">❌ Absent</h3>
                <div class="stat-value" style="font-size: 2rem; font-weight: 800; color: #ef4444; margin-bottom: 0.25rem;">${absentPercent}%</div>
                <div class="stat-caption" style="color: #64748b; font-size: 0.9rem;">${absentCount} of ${totalCount} check-ins</div>
            </div>
            <div class="visual-card" style="
                background: #0f172a;
                border-radius: 1.5rem;
                padding: 1.35rem;
                border: 1px solid #1e293b;
                box-shadow: 0 18px 50px rgba(0, 0, 0, 0.16);
                transition: transform 0.3s ease, box-shadow 0.3s ease;
            ">
                <h3 style="color: #94a3b8; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.8rem;">📈 Daily Trends</h3>
                <div class="bar-chart" style="display: flex; align-items: flex-end; gap: 0.8rem; height: 170px; overflow-x: auto; padding-top: 0.5rem;">
                    ${dailySummary.map((day) => {
                        const presentHeight = Math.max((day.present / maxValue) * maxHeight, 6);
                        const absentHeight = Math.max((day.absent / maxValue) * maxHeight, 6);
                        return `
                            <div class="bar-group" style="display: flex; flex-direction: column; align-items: center; gap: 0.7rem; min-width: 56px;">
                                <div class="bar-pair" style="display: flex; align-items: flex-end; gap: 0.4rem; width: 100%;">
                                    <div class="bar-fill present" style="height: ${presentHeight}px; width: 14px; border-radius: 0.7rem 0.7rem 0 0; min-height: 12px; background: linear-gradient(180deg, #22c55e, #10b981); transition: height 0.35s ease;" title="${day.present} present"></div>
                                    <div class="bar-fill absent" style="height: ${absentHeight}px; width: 14px; border-radius: 0.7rem 0.7rem 0 0; min-height: 12px; background: linear-gradient(180deg, #f59e0b, #ea580c); transition: height 0.35s ease;" title="${day.absent} absent"></div>
                                </div>
                                <div class="bar-label" style="color: #94a3b8; font-size: 0.82rem;">${day.date.slice(5)}</div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        </div>
    `;
}

function renderReviewCards(employees) {
    if (!employees?.length) {
        return `
            <div class="empty-state" style="
                padding: 2rem;
                text-align: center;
                background: #0f172a;
                border-radius: 1.5rem;
                border: 1px solid #1e293b;
                color: #94a3b8;
            ">
                <p style="font-size: 1.2rem; color: #f8fafc; margin-bottom: 0.5rem;">📝 No employee review data available</p>
                <p>Check back later for performance updates</p>
            </div>
        `;
    }
    
    return employees.map((employee) => {
        const rating = Number((4.0 + ((employee.employeeId % 5) * 0.2)).toFixed(1));
        const initials = getInitials(employee.name);
        const avatarColor = getColorForEmployee(employee.employeeId);
        
        return `
            <article class="review-card" style="
                background: #0f172a;
                border-radius: 1.5rem;
                padding: 1.35rem;
                border: 1px solid #1e293b;
                box-shadow: 0 18px 50px rgba(0, 0, 0, 0.16);
                transition: transform 0.3s ease, box-shadow 0.3s ease;
                display: flex;
                flex-direction: column;
                gap: 0.75rem;
            ">
                <div class="review-card-header" style="display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; margin-bottom: 0.5rem;">
                    <div class="review-card-title" style="display: flex; align-items: center; gap: 0.85rem;">
                        <span class="initials" style="width: 46px; height: 46px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 700; background: ${avatarColor}; box-shadow: 0 10px 30px rgba(24, 195, 200, 0.22); flex-shrink: 0;">${initials}</span>
                        <div>
                            <h3 style="color: #f8fafc; font-size: 1rem; margin: 0;">${employee.name}</h3>
                            <p style="color: #94a3b8; font-size: 0.85rem; margin: 0.2rem 0 0;">${employee.position || 'Employee'}</p>
                        </div>
                    </div>
                    <span class="review-badge" style="padding: 0.45rem 0.85rem; border-radius: 999px; background: rgba(99, 102, 241, 0.14); color: #c7d2fe; font-size: 0.75rem; font-weight: 700; white-space: nowrap;">${employee.department || 'General'}</span>
                </div>
                <div class="review-meta" style="display: flex; flex-wrap: wrap; gap: 1rem; align-items: center; color: #94a3b8; font-size: 0.9rem;">
                    <span class="rating" style="color: #fbbf24; font-weight: 700; display: inline-flex; align-items: center; gap: 0.4rem;">${getStars(rating)} ${rating.toFixed(1)}/5</span>
                    <span>Q2 2025</span>
                </div>
                <p class="feedback" style="color: #cbd5e1; line-height: 1.7; margin: 0;">${getFeedback(employee)}</p>
                <div class="review-footer" style="border-top: 1px solid #1e293b; padding-top: 0.75rem; font-size: 0.75rem; color: #94a3b8;">
                    <span>📅 Reviewed: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
            </article>
        `;
    }).join('');
}

// ============================================
// FILTER & SORT FUNCTIONS
// ============================================

function applyFilters(status, dateFrom, dateTo) {
    const rows = document.querySelectorAll('#attendance-data tbody tr');
    rows.forEach(row => {
        let show = true;
        
        if (status && status !== 'all') {
            const statusElements = row.querySelectorAll('.attendance-badge');
            let hasStatus = false;
            statusElements.forEach(el => {
                if (el.classList.contains(status)) hasStatus = true;
            });
            if (!hasStatus) show = false;
        }
        
        if (dateFrom || dateTo) {
            const dateElements = row.querySelectorAll('.attendance-badge');
            let hasDate = false;
            dateElements.forEach(el => {
                const text = el.textContent || '';
                const dateMatch = text.match(/\d{4}-\d{2}-\d{2}/);
                if (dateMatch) {
                    const date = dateMatch[0];
                    if (dateFrom && date < dateFrom) return;
                    if (dateTo && date > dateTo) return;
                    hasDate = true;
                }
            });
            if (!hasDate) show = false;
        }
        
        row.style.display = show ? '' : 'none';
    });
    
    const filterBtn = document.getElementById('filterBtn');
    if (filterBtn) {
        filterBtn.textContent = status !== 'all' || dateFrom || dateTo ? '🔍 Filtered' : '🔍 Filter';
    }
}

function clearFilters() {
    const rows = document.querySelectorAll('#attendance-data tbody tr');
    rows.forEach(row => row.style.display = '');
    const filterBtn = document.getElementById('filterBtn');
    if (filterBtn) filterBtn.textContent = '🔍 Filter';
}

function applySort(sortType) {
    const container = document.getElementById('reviews-data-list');
    if (!container) return;
    
    const cards = Array.from(container.children);
    
    cards.sort((a, b) => {
        const nameA = a.querySelector('h3')?.textContent || '';
        const nameB = b.querySelector('h3')?.textContent || '';
        const ratingA = parseFloat(a.querySelector('.rating')?.textContent?.match(/\d\.\d/)?.[0] || 0);
        const ratingB = parseFloat(b.querySelector('.rating')?.textContent?.match(/\d\.\d/)?.[0] || 0);
        const dateA = a.querySelector('.review-footer')?.textContent?.replace('📅 Reviewed: ', '').trim() || '';
        const dateB = b.querySelector('.review-footer')?.textContent?.replace('📅 Reviewed: ', '').trim() || '';
        
        switch(sortType) {
            case 'rating-desc': return ratingB - ratingA;
            case 'rating-asc': return ratingA - ratingB;
            case 'name-asc': return nameA.localeCompare(nameB);
            case 'name-desc': return nameB.localeCompare(nameA);
            case 'date-desc': return dateB.localeCompare(dateA);
            case 'date-asc': return dateA.localeCompare(dateB);
            default: return 0;
        }
    });
    
    cards.forEach(card => container.appendChild(card));
}

// ============================================
// LOAD FUNCTIONS
// ============================================

async function loadAttendanceData() {
    if (!isAttendancePage) return;
    if (!attendanceSection) {
        console.warn('Attendance section not found');
        return;
    }
    
    try {
        attendanceSection.innerHTML = `<div style="padding: 2rem; text-align: center; color: #94a3b8;">⏳ Loading attendance data...</div>`;
        
        const records = await fetchWithFallback(
            ATTENDANCE_SOURCES,
            (data) => data?.attendanceAndLeave || null,
            () => fallbackAttendanceData.attendanceAndLeave
        );
        
        renderVisuals(records);
        const table = createAttendanceTable(records);
        attendanceSection.innerHTML = '';
        attendanceSection.appendChild(table);
        console.log(`✅ Attendance data loaded: ${records.length} records`);
    } catch (error) {
        console.error('❌ Error loading attendance data:', error);
        const records = fallbackAttendanceData.attendanceAndLeave;
        renderVisuals(records);
        const table = createAttendanceTable(records);
        attendanceSection.innerHTML = '';
        attendanceSection.appendChild(table);
    }
}

async function loadReviews() {
    if (!isReviewsPage) return;
    if (!reviewsContainer) {
        console.warn('Reviews container not found');
        return;
    }
    
    try {
        reviewsContainer.innerHTML = `<div style="padding: 2rem; text-align: center; color: #94a3b8;">⏳ Loading employee reviews...</div>`;
        
        const employees = await fetchWithFallback(
            REVIEW_SOURCES,
            (data) => data?.employeeInformation || null,
            () => []
        );
        
        if (!employees.length) {
            reviewsContainer.innerHTML = `
                <div style="padding: 2rem; text-align: center; background: #0f172a; border-radius: 1.5rem; border: 1px solid #1e293b; color: #94a3b8;">
                    <p style="font-size: 1.2rem; color: #f8fafc; margin-bottom: 0.5rem;">📝 No employee reviews available</p>
                    <p>Please add employee data to see reviews</p>
                </div>
            `;
            return;
        }
        
        reviewsContainer.innerHTML = renderReviewCards(employees);
        console.log(`✅ Reviews loaded: ${employees.length} employees`);
    } catch (error) {
        console.error('❌ Error loading reviews:', error);
        reviewsContainer.innerHTML = `
            <div style="padding: 2rem; text-align: center; background: rgba(239, 68, 68, 0.1); border-radius: 1.5rem; border: 2px solid #ef4444; color: #94a3b8;">
                <p style="font-size: 1.2rem; color: #ef4444; margin-bottom: 0.5rem;">⚠️ Failed to load employee reviews</p>
                <p>Please try refreshing the page</p>
            </div>
        `;
    }
}

// ============================================
// CREATE ATTENDANCE FORM (MATCHES REVIEW FORM STYLE)
// ============================================

function createAttendanceForm() {
    // Check if form already exists
    let form = document.getElementById('attendanceFormModal');
    if (form) {
        form.remove();
        return;
    }
    
    // Create modal overlay
    form = document.createElement('div');
    form.id = 'attendanceFormModal';
    form.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        backdrop-filter: blur(8px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        animation: fadeIn 0.3s ease;
    `;
    
    form.innerHTML = `
        <div class="modal-content" style="
            background: linear-gradient(145deg, #1a2332, #0f172a);
            border-radius: 20px;
            padding: 2rem;
            max-width: 480px;
            width: 92%;
            max-height: 90vh;
            overflow-y: auto;
            border: 1px solid #1e293b;
            box-shadow: 0 30px 80px rgba(0, 0, 0, 0.6);
            animation: slideDown 0.3s ease;
        ">
            <h2 style="
                text-align: center;
                margin-bottom: 0.5rem;
                font-size: 1.5rem;
                font-weight: 700;
                background: linear-gradient(135deg, #6366f1, #8b5cf6);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
            ">📝 New Attendance Record</h2>
            <p style="
                text-align: center;
                color: #94a3b8;
                margin-bottom: 1.5rem;
                font-size: 0.95rem;
            ">Fill in the details for the attendance record</p>
            
            <div class="form-group" style="margin-bottom: 1.25rem;">
                <label for="employeeName" style="
                    display: block;
                    margin-bottom: 0.5rem;
                    font-weight: 600;
                    color: #cbd5e1;
                    font-size: 0.85rem;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                ">Employee Name</label>
                <input type="text" id="employeeName" placeholder="Enter employee name" style="
                    width: 100%;
                    padding: 0.75rem 1rem;
                    border: 1px solid #1e293b;
                    border-radius: 12px;
                    background: #0f172a;
                    color: #f8fafc;
                    font-size: 0.95rem;
                    transition: all 0.3s ease;
                    font-family: inherit;
                ">
            </div>
            
            <div class="form-group" style="margin-bottom: 1.25rem;">
                <label for="attendanceDate" style="
                    display: block;
                    margin-bottom: 0.5rem;
                    font-weight: 600;
                    color: #cbd5e1;
                    font-size: 0.85rem;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                ">Date</label>
                <input type="date" id="attendanceDate" style="
                    width: 100%;
                    padding: 0.75rem 1rem;
                    border: 1px solid #1e293b;
                    border-radius: 12px;
                    background: #0f172a;
                    color: #f8fafc;
                    font-size: 0.95rem;
                    transition: all 0.3s ease;
                    font-family: inherit;
                ">
            </div>
            
            <div class="form-group" style="margin-bottom: 1.25rem;">
                <label for="attendanceTime" style="
                    display: block;
                    margin-bottom: 0.5rem;
                    font-weight: 600;
                    color: #cbd5e1;
                    font-size: 0.85rem;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                ">Time</label>
                <input type="time" id="attendanceTime" style="
                    width: 100%;
                    padding: 0.75rem 1rem;
                    border: 1px solid #1e293b;
                    border-radius: 12px;
                    background: #0f172a;
                    color: #f8fafc;
                    font-size: 0.95rem;
                    transition: all 0.3s ease;
                    font-family: inherit;
                ">
            </div>
            
            <div class="form-group" style="margin-bottom: 1.25rem;">
                <label for="attendanceStatus" style="
                    display: block;
                    margin-bottom: 0.5rem;
                    font-weight: 600;
                    color: #cbd5e1;
                    font-size: 0.85rem;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                ">Status</label>
                <select id="attendanceStatus" style="
                    width: 100%;
                    padding: 0.75rem 1rem;
                    border: 1px solid #1e293b;
                    border-radius: 12px;
                    background: #0f172a;
                    color: #f8fafc;
                    font-size: 0.95rem;
                    transition: all 0.3s ease;
                    font-family: inherit;
                ">
                    <option value="Present" style="background: #0f172a; color: #f8fafc;">✅ Present</option>
                    <option value="Absent" style="background: #0f172a; color: #f8fafc;">❌ Absent</option>
                    <option value="Late" style="background: #0f172a; color: #f8fafc;">⚠️ Late</option>
                </select>
            </div>
            
            <div style="display: flex; gap: 1rem; margin-top: 1.5rem;">
                <button id="submitAttendanceBtn" class="btn btn-success" style="
                    flex: 1;
                    justify-content: center;
                    padding: 0.9rem;
                    border: 0;
                    border-radius: 999px;
                    font-weight: 700;
                    cursor: pointer;
                    transition: transform 0.2s ease, background 0.2s ease, box-shadow 0.2s ease;
                    font-size: 0.9rem;
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    background: linear-gradient(135deg, #10b981, #059669);
                    color: #fff;
                    box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
                ">✅ Submit Record</button>
                <button id="cancelAttendanceBtn" class="btn btn-danger" style="
                    flex: 1;
                    justify-content: center;
                    padding: 0.9rem;
                    border: 0;
                    border-radius: 999px;
                    font-weight: 700;
                    cursor: pointer;
                    transition: transform 0.2s ease, background 0.2s ease, box-shadow 0.2s ease;
                    font-size: 0.9rem;
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    background: linear-gradient(135deg, #ef4444, #dc2626);
                    color: #fff;
                    box-shadow: 0 4px 15px rgba(239, 68, 68, 0.3);
                ">✖ Cancel</button>
            </div>
        </div>
    `;
    
    // Auto-fill date and time
    const dateInput = form.querySelector('#attendanceDate');
    const timeInput = form.querySelector('#attendanceTime');
    
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.value = today;
    }
    if (timeInput) {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        timeInput.value = `${hours}:${minutes}`;
    }
    
    // Add focus styles
    form.querySelectorAll('input, select').forEach(input => {
        input.addEventListener('focus', function() {
            this.style.borderColor = '#6366f1';
            this.style.background = '#1a2332';
            this.style.boxShadow = '0 0 0 4px rgba(99, 102, 241, 0.15)';
        });
        input.addEventListener('blur', function() {
            this.style.borderColor = '#1e293b';
            this.style.background = '#0f172a';
            this.style.boxShadow = 'none';
        });
    });
    
    // Hover effects for buttons
    form.querySelectorAll('.btn').forEach(btn => {
        btn.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
        });
        btn.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
    
    document.body.appendChild(form);
    
    // Submit button
    document.getElementById('submitAttendanceBtn').addEventListener('click', function() {
        const employeeName = document.getElementById('employeeName')?.value.trim();
        const attendanceDate = document.getElementById('attendanceDate')?.value;
        const attendanceTime = document.getElementById('attendanceTime')?.value;
        const attendanceStatus = document.getElementById('attendanceStatus')?.value;
        
        if (!employeeName) {
            showNotification('Please enter employee name', 'error');
            document.getElementById('employeeName').focus();
            return;
        }
        
        if (!attendanceDate) {
            showNotification('Please select a date', 'error');
            document.getElementById('attendanceDate').focus();
            return;
        }
        
        if (!attendanceTime) {
            showNotification('Please select a time', 'error');
            document.getElementById('attendanceTime').focus();
            return;
        }
        
        const newRecord = {
            employeeId: Date.now(),
            name: employeeName,
            attendance: [{ date: attendanceDate, status: attendanceStatus, time: attendanceTime }]
        };
        
        console.log('New attendance record:', newRecord);
        showNotification(`✅ Record added for ${employeeName} - ${attendanceStatus}`, 'success');
        
        form.remove();
        
        // Update the new record button text
        const newRecordBtn = document.getElementById('newRecordBtn');
        if (newRecordBtn) {
            newRecordBtn.textContent = '📝 New Record';
        }
        
        if (typeof loadAttendanceData === 'function') loadAttendanceData();
    });
    
    // Cancel button
    document.getElementById('cancelAttendanceBtn').addEventListener('click', function() {
        form.remove();
        const newRecordBtn = document.getElementById('newRecordBtn');
        if (newRecordBtn) {
            newRecordBtn.textContent = '📝 New Record';
        }
    });
    
    // Close on background click
    form.addEventListener('click', function(e) {
        if (e.target === form) {
            form.remove();
            const newRecordBtn = document.getElementById('newRecordBtn');
            if (newRecordBtn) {
                newRecordBtn.textContent = '📝 New Record';
            }
        }
    });
    
    return form;
}

// ============================================
// BUTTON FUNCTIONALITY - PAGE SPECIFIC
// ============================================

function initializeButtons() {
    // ============================================
    // ATTENDANCE PAGE BUTTONS
    // ============================================
    if (isAttendancePage) {
        console.log('📋 Initializing Attendance page buttons...');
        
        const newRecordBtn = document.getElementById('newRecordBtn');
        const filterBtn = document.getElementById('filterBtn');
        
        // New Record Button - Opens styled modal form
        if (newRecordBtn) {
            newRecordBtn.addEventListener('click', function(e) {
                e.preventDefault();
                createAttendanceForm();
                this.textContent = '✖ Close Form';
            });
        }
        
        // Filter Button
        if (filterBtn) {
            filterBtn.addEventListener('click', function(e) {
                e.preventDefault();
                let filterDropdown = document.getElementById('filterDropdown');
                
                if (!filterDropdown) {
                    filterDropdown = document.createElement('div');
                    filterDropdown.id = 'filterDropdown';
                    
                    const rect = filterBtn.getBoundingClientRect();
                    filterDropdown.style.cssText = `
                        position: fixed;
                        top: ${rect.bottom + 8}px;
                        right: ${window.innerWidth - rect.right}px;
                        background: #0f172a;
                        border: 1px solid #1e293b;
                        border-radius: 16px;
                        padding: 1.25rem;
                        min-width: 240px;
                        box-shadow: 0 20px 60px rgba(0,0,0,0.5);
                        z-index: 1000;
                        animation: slideDown 0.3s ease;
                    `;
                    
                    filterDropdown.innerHTML = `
                        <div style="margin-bottom: 12px;">
                            <label style="display: block; font-size: 0.8rem; font-weight: 600; color: #94a3b8; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.05em;">Filter by Status</label>
                            <select id="filterStatus" style="width: 100%; padding: 0.6rem 0.8rem; background: #0f172a; border: 1px solid #1e293b; border-radius: 10px; color: #f8fafc; font-size: 0.9rem;">
                                <option value="all">All Status</option>
                                <option value="present">✅ Present</option>
                                <option value="absent">❌ Absent</option>
                            </select>
                        </div>
                        <div style="margin-bottom: 12px;">
                            <label style="display: block; font-size: 0.8rem; font-weight: 600; color: #94a3b8; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.05em;">Date Range</label>
                            <input type="date" id="filterDateFrom" style="width: 100%; padding: 0.6rem 0.8rem; background: #0f172a; border: 1px solid #1e293b; border-radius: 10px; color: #f8fafc; font-size: 0.9rem; margin-bottom: 6px;">
                            <input type="date" id="filterDateTo" style="width: 100%; padding: 0.6rem 0.8rem; background: #0f172a; border: 1px solid #1e293b; border-radius: 10px; color: #f8fafc; font-size: 0.9rem;">
                        </div>
                        <div style="display: flex; gap: 8px;">
                            <button id="applyFilterBtn" style="flex: 1; padding: 0.6rem; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; border: none; border-radius: 999px; cursor: pointer; font-weight: 700; transition: transform 0.2s ease;">Apply</button>
                            <button id="clearFilterBtn" style="flex: 1; padding: 0.6rem; background: rgba(255,255,255,0.08); color: #cbd5e1; border: 1px solid #1e293b; border-radius: 999px; cursor: pointer; font-weight: 700; transition: transform 0.2s ease;">Clear</button>
                        </div>
                    `;
                    
                    document.body.appendChild(filterDropdown);
                    
                    document.getElementById('applyFilterBtn').addEventListener('click', function() {
                        const status = document.getElementById('filterStatus').value;
                        const dateFrom = document.getElementById('filterDateFrom').value;
                        const dateTo = document.getElementById('filterDateTo').value;
                        applyFilters(status, dateFrom, dateTo);
                        filterDropdown.remove();
                        filterBtn.textContent = '🔍 Filter';
                    });
                    
                    document.getElementById('clearFilterBtn').addEventListener('click', function() {
                        clearFilters();
                        filterDropdown.remove();
                        filterBtn.textContent = '🔍 Filter';
                    });
                    
                    filterBtn.textContent = '✖ Close';
                } else {
                    filterDropdown.remove();
                    filterBtn.textContent = '🔍 Filter';
                }
            });
        }
    }
    
    // ============================================
    // REVIEWS PAGE BUTTONS
    // ============================================
    if (isReviewsPage) {
        console.log('⭐ Initializing Reviews page buttons...');
        
        const addReviewBtn = document.querySelector('.topbar-actions .btn-primary');
        const sortBtn = document.querySelector('.topbar-actions .btn-secondary');
        
        // Add Review Button - Creates modal with form
        if (addReviewBtn) {
            addReviewBtn.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Create modal overlay
                const modal = document.createElement('div');
                modal.id = 'reviewModal';
                
                modal.innerHTML = `
                    <div class="modal-content">
                        <h2>⭐ Add New Review</h2>
                        <p class="modal-subtitle">Fill in the details for the employee review</p>
                        
                        <div class="form-group">
                            <label for="reviewEmployeeName">Employee Name</label>
                            <input type="text" id="reviewEmployeeName" placeholder="Enter employee name">
                        </div>
                        
                        <div class="form-group">
                            <label for="reviewDepartment">Department</label>
                            <input type="text" id="reviewDepartment" placeholder="Enter department">
                        </div>
                        
                        <div class="form-group">
                            <label for="reviewPosition">Position</label>
                            <input type="text" id="reviewPosition" placeholder="Enter position">
                        </div>
                        
                        <div class="form-group">
                            <label for="reviewRating">Rating (1-5)</label>
                            <select id="reviewRating">
                                <option value="5">⭐⭐⭐⭐⭐ - Excellent</option>
                                <option value="4" selected>⭐⭐⭐⭐ - Good</option>
                                <option value="3">⭐⭐⭐ - Average</option>
                                <option value="2">⭐⭐ - Below Average</option>
                                <option value="1">⭐ - Poor</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label for="reviewFeedback">Feedback</label>
                            <textarea id="reviewFeedback" rows="3" placeholder="Enter feedback..."></textarea>
                        </div>
                        
                        <div class="modal-buttons">
                            <button id="submitReviewBtn" class="btn btn-success">Submit Review</button>
                            <button id="cancelReviewBtn" class="btn btn-danger">Cancel</button>
                        </div>
                    </div>
                `;
                
                document.body.appendChild(modal);
                
                // Submit Review
                document.getElementById('submitReviewBtn').addEventListener('click', function() {
                    const name = document.getElementById('reviewEmployeeName').value.trim();
                    const department = document.getElementById('reviewDepartment').value.trim();
                    const position = document.getElementById('reviewPosition').value.trim();
                    const rating = document.getElementById('reviewRating').value;
                    const feedback = document.getElementById('reviewFeedback').value.trim();
                    
                    if (!name) {
                        showNotification('Please enter employee name', 'error');
                        document.getElementById('reviewEmployeeName').focus();
                        return;
                    }
                    
                    const newReview = {
                        employeeId: Date.now(),
                        name: name,
                        department: department || 'General',
                        position: position || 'Employee',
                        rating: parseFloat(rating),
                        feedback: feedback || 'No additional feedback provided.'
                    };
                    
                    console.log('New review added:', newReview);
                    showNotification(`✅ Review added for ${name}`, 'success');
                    modal.remove();
                    if (typeof loadReviews === 'function') loadReviews();
                });
                
                // Cancel Review
                document.getElementById('cancelReviewBtn').addEventListener('click', function() {
                    modal.remove();
                });
                
                // Close on background click
                modal.addEventListener('click', function(e) {
                    if (e.target === modal) modal.remove();
                });
            });
        }
        
        // Sort Button
        if (sortBtn) {
            sortBtn.addEventListener('click', function(e) {
                e.preventDefault();
                let sortDropdown = document.getElementById('sortDropdown');
                
                if (!sortDropdown) {
                    sortDropdown = document.createElement('div');
                    sortDropdown.id = 'sortDropdown';
                    
                    const rect = sortBtn.getBoundingClientRect();
                    sortDropdown.style.cssText = `
                        position: fixed;
                        top: ${rect.bottom + 8}px;
                        right: ${window.innerWidth - rect.right}px;
                        background: #0f172a;
                        border: 1px solid #1e293b;
                        border-radius: 16px;
                        padding: 0.75rem;
                        min-width: 200px;
                        box-shadow: 0 20px 60px rgba(0,0,0,0.5);
                        z-index: 1000;
                        animation: slideDown 0.3s ease;
                    `;
                    
                    const sortOptions = [
                        { value: 'rating-desc', label: '⭐ Rating (High to Low)' },
                        { value: 'rating-asc', label: '⭐ Rating (Low to High)' },
                        { value: 'name-asc', label: '👤 Name (A-Z)' },
                        { value: 'name-desc', label: '👤 Name (Z-A)' },
                        { value: 'date-desc', label: '📅 Newest First' },
                        { value: 'date-asc', label: '📅 Oldest First' }
                    ];
                    
                    sortDropdown.innerHTML = `
                        <div style="margin-bottom: 8px; font-weight: 600; color: #94a3b8; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em; padding: 0 0.5rem;">Sort Reviews By:</div>
                        ${sortOptions.map(opt => `
                            <button class="sort-option" data-sort="${opt.value}" style="display: block; width: 100%; padding: 0.6rem 0.8rem; background: none; border: none; text-align: left; cursor: pointer; border-radius: 10px; font-size: 0.9rem; color: #cbd5e1; transition: all 0.2s ease;">
                                ${opt.label}
                            </button>
                        `).join('')}
                    `;
                    
                    document.body.appendChild(sortDropdown);
                    
                    sortDropdown.querySelectorAll('.sort-option').forEach(btn => {
                        btn.addEventListener('mouseenter', function() {
                            this.style.background = 'rgba(99, 102, 241, 0.15)';
                            this.style.color = '#fff';
                        });
                        btn.addEventListener('mouseleave', function() {
                            this.style.background = 'none';
                            this.style.color = '#cbd5e1';
                        });
                        
                        btn.addEventListener('click', function() {
                            const sortType = this.dataset.sort;
                            applySort(sortType);
                            sortDropdown.remove();
                            const label = this.textContent.trim();
                            sortBtn.textContent = `📊 ${label.split(' ').slice(0,2).join(' ')}`;
                            showNotification(`Sorted by: ${label}`, 'success');
                        });
                    });
                    
                    sortBtn.textContent = '✖ Close';
                } else {
                    sortDropdown.remove();
                    sortBtn.textContent = '📊 Sort';
                }
            });
        }
    }
}

// ============================================
// ANIMATION STYLES (injected if missing)
// ============================================

(function injectStyles() {
    if (document.getElementById('dynamic-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'dynamic-styles';
    style.textContent = `
        /* Additional animations and styles not in main CSS */
        @keyframes slideDown {
            from { opacity: 0; transform: translateY(-20px) scale(0.95); }
            to { opacity: 1; transform: translateY(0) scale(1); }
        }
        
        @keyframes slideInRight {
            from { opacity: 0; transform: translateX(100px); }
            to { opacity: 1; transform: translateX(0); }
        }
        
        @keyframes slideOutRight {
            from { opacity: 1; transform: translateX(0); }
            to { opacity: 0; transform: translateX(100px); }
        }
        
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        
        /* Review Modal Styles */
        #reviewModal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            backdrop-filter: blur(8px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            animation: fadeIn 0.3s ease;
        }
        
        #reviewModal .modal-content {
            background: linear-gradient(145deg, #1a2332, #0f172a);
            border-radius: 20px;
            padding: 2rem;
            max-width: 520px;
            width: 92%;
            max-height: 90vh;
            overflow-y: auto;
            border: 1px solid #1e293b;
            box-shadow: 0 30px 80px rgba(0, 0, 0, 0.6);
            animation: slideDown 0.3s ease;
        }
        
        #reviewModal .modal-content::-webkit-scrollbar {
            width: 6px;
        }
        
        #reviewModal .modal-content::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.05);
            border-radius: 10px;
        }
        
        #reviewModal .modal-content::-webkit-scrollbar-thumb {
            background: #6366f1;
            border-radius: 10px;
        }
        
        #reviewModal h2 {
            text-align: center;
            margin-bottom: 0.5rem;
            font-size: 1.5rem;
            font-weight: 700;
            background: linear-gradient(135deg, #6366f1, #8b5cf6);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        
        #reviewModal .modal-subtitle {
            text-align: center;
            color: #94a3b8;
            margin-bottom: 1.5rem;
            font-size: 0.95rem;
        }
        
        #reviewModal .form-group {
            margin-bottom: 1.25rem;
        }
        
        #reviewModal .form-group label {
            display: block;
            margin-bottom: 0.5rem;
            font-weight: 600;
            color: #cbd5e1;
            font-size: 0.85rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }
        
        #reviewModal .form-group input,
        #reviewModal .form-group select,
        #reviewModal .form-group textarea {
            width: 100%;
            padding: 0.75rem 1rem;
            border: 1px solid #1e293b;
            border-radius: 12px;
            background: #0f172a;
            color: #f8fafc;
            font-size: 0.95rem;
            transition: all 0.3s ease;
            font-family: inherit;
        }
        
        #reviewModal .form-group input:focus,
        #reviewModal .form-group select:focus,
        #reviewModal .form-group textarea:focus {
            outline: none;
            border-color: #6366f1;
            background: #1a2332;
            box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.15);
        }
        
        #reviewModal .form-group input::placeholder,
        #reviewModal .form-group textarea::placeholder {
            color: #64748b;
        }
        
        #reviewModal .form-group textarea {
            resize: vertical;
            min-height: 80px;
        }
        
        #reviewModal .form-group select option {
            background: #0f172a;
            color: #f8fafc;
        }
        
        #reviewModal .modal-buttons {
            display: flex;
            gap: 1rem;
            margin-top: 1.5rem;
        }
        
        #reviewModal .modal-buttons .btn {
            flex: 1;
            justify-content: center;
            padding: 0.9rem;
        }
        
        /* Attendance Badge Styles - Dark Theme */
        .attendance-badge {
            display: inline-block;
            padding: 0.35rem 0.7rem;
            border-radius: 999px;
            margin: 0.2rem 0.2rem 0.2rem 0;
            font-size: 0.82rem;
            font-weight: 600;
        }
        
        .attendance-badge.present {
            background: rgba(16, 185, 129, 0.2);
            color: #6ee7b7;
            border: 1px solid rgba(16, 185, 129, 0.3);
        }
        
        .attendance-badge.absent {
            background: rgba(239, 68, 68, 0.2);
            color: #fca5a5;
            border: 1px solid rgba(239, 68, 68, 0.3);
        }
        
        /* Responsive for modals */
        @media (max-width: 640px) {
            #reviewModal .modal-content {
                padding: 1.5rem;
                width: 95%;
            }
            #reviewModal .modal-buttons {
                flex-direction: column;
            }
            .visual-grid {
                grid-template-columns: 1fr !important;
            }
            .attendance-table {
                font-size: 0.8rem;
            }
            .attendance-table th,
            .attendance-table td {
                padding: 8px 10px !important;
            }
        }
    `;
    document.head.appendChild(style);
})();

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Initializing ModernTech HR System...');
    console.log(`📄 Current page: ${isAttendancePage ? 'Attendance' : isReviewsPage ? 'Reviews' : 'Other'}`);
    
    try {
        highlightActiveNav();
        initializeButtons();
        loadAttendanceData();
        loadReviews();
        
        // Close dropdowns on outside click
        document.addEventListener('click', function(e) {
            ['filterDropdown', 'sortDropdown'].forEach(id => {
                const dropdown = document.getElementById(id);
                const btn = id === 'filterDropdown' ? document.getElementById('filterBtn') : document.querySelector('.topbar-actions .btn-secondary');
                if (dropdown && btn && !btn.contains(e.target) && !dropdown.contains(e.target)) {
                    dropdown.remove();
                    if (id === 'filterDropdown' && btn) btn.textContent = '🔍 Filter';
                    if (id === 'sortDropdown' && btn) btn.textContent = '📊 Sort';
                }
            });
        });
        
        console.log('✅ Dashboard initialized successfully');
    } catch (error) {
        console.error('❌ Failed to initialize dashboard:', error);
    }
});

// ============================================
// DEBUG EXPOSURE
// ============================================

window.debug = {
    loadAttendanceData,
    loadReviews,
    showNotification,
    applyFilters,
    clearFilters,
    applySort,
    COLORS
};