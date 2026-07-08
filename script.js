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
    loginForm.addEventListener('submit', function (event) {
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

// 1. Global Setup + Debug
console.log("[script.js] Script loaded", new Date().toISOString());


window.addEventListener("error", (event) => {
    console.error("[Global Error]", {
        message: event.message,
        file: event.filename,
        line: event.lineno,
        column: event.colno,
        error: event.error,
    });
});


window.addEventListener("unhandledrejection", (event) => {
    console.error("[Unhandled Promise Rejection]", event.reason);
});


// 2. Shared Data Layer
const employeeInformation = [
    {
        id: 1,
        name: "Sibongile Nkosi",
        position: "Software Engineer",
        dept: "Engineering",
        salary: 99400,
        contact: "sibongile@company.co.za",
        history: "Joined 2021, Led migration to microservices",
        status: "Active",
    },
    {
        id: 2,
        name: "Thabo Molefe",
        position: "Product Manager",
        dept: "Product",
        salary: 105000,
        contact: "thabo@company.co.za",
        history: "Joined 2019, Launched 3 major features",
        status: "Active",
    },
    {
        id: 3,
        name: "Naledi Dube",
        position: "UX Designer",
        dept: "Design",
        salary: 78200,
        contact: "naledi@company.co.za",
        history: "Joined 2022, Redesigned mobile app",
        status: "Active",
    },
    {
        id: 4,
        name: "Kagiso Mthembu",
        position: "Data Analyst",
        dept: "Data",
        salary: 85300,
        contact: "kagiso@company.co.za",
        history: "Joined 2020, Built KPI dashboards",
        status: "Active",
    },
    {
        id: 5,
        name: "Zanele Khumalo",
        position: "HR Manager",
        dept: "Human Resources",
        salary: 92000,
        contact: "zanele@company.co.za",
        history: "Joined 2018, Reduced turnover 18%",
        status: "Active",
    },
    {
        id: 6,
        name: "Bongani Sithole",
        position: "DevOps Engineer",
        dept: "Engineering",
        salary: 101500,
        contact: "bongani@company.co.za",
        history: "Joined 2021, Cut deploy time 70%",
        status: "Active",
    },
    {
        id: 7,
        name: "Lerato Phiri",
        position: "Marketing Lead",
        dept: "Marketing",
        salary: 88400,
        contact: "lerato@company.co.za",
        history: "Joined 2020, Grew MQLs 240%",
        status: "Active",
    },
    {
        id: 8,
        name: "Sipho Ndlovu",
        position: "Sales Executive",
        dept: "Sales",
        salary: 75600,
        contact: "sipho@company.co.za",
        history: "Joined 2023, Top closer Q1 2026",
        status: "Active",
    },
    {
        id: 9,
        name: "Ayanda Cele",
        position: "Finance Officer",
        dept: "Finance",
        salary: 81900,
        contact: "ayanda@company.co.za",
        history: "Joined 2019, Automated invoicing",
        status: "Active",
    },
    {
        id: 10,
        name: "Mandla Zulu",
        position: "IT Support",
        dept: "IT",
        salary: 65800,
        contact: "mandla@company.co.za",
        history: "Joined 2022, 99.2% ticket CSAT",
        status: "Active",
    },
];


const payrollTimesheet = [
    {
        employeeId: 1,
        hoursWorked: 176,
        leaveDeductions: 0,
        finalSalary: 99400,
        gross: 99400,
    },
    {
        employeeId: 2,
        hoursWorked: 168,
        leaveDeductions: 2000,
        finalSalary: 103000,
        gross: 105000,
    },
    {
        employeeId: 3,
        hoursWorked: 176,
        leaveDeductions: 0,
        finalSalary: 78200,
        gross: 78200,
    },
    {
        employeeId: 4,
        hoursWorked: 160,
        leaveDeductions: 3200,
        finalSalary: 82100,
        gross: 85300,
    },
    {
        employeeId: 5,
        hoursWorked: 176,
        leaveDeductions: 0,
        finalSalary: 92000,
        gross: 92000,
    },
    {
        employeeId: 6,
        hoursWorked: 184,
        leaveDeductions: 0,
        finalSalary: 101500,
        gross: 101500,
    },
    {
        employeeId: 7,
        hoursWorked: 172,
        leaveDeductions: 800,
        finalSalary: 87600,
        gross: 88400,
    },
    {
        employeeId: 8,
        hoursWorked: 180,
        leaveDeductions: 0,
        finalSalary: 75600,
        gross: 75600,
    },
    {
        employeeId: 9,
        hoursWorked: 176,
        leaveDeductions: 0,
        finalSalary: 81900,
        gross: 81900,
    },
    {
        employeeId: 10,
        hoursWorked: 168,
        leaveDeductions: 1200,
        finalSalary: 64600,
        gross: 65800,
    },
];


const avatarColors = [
    "#3B82F6",
    "#EF4444",
    "#10B981",
    "#F59E0B",
    "#8B5CF6",
    "#EC4899",
    "#06B6D4",
    "#F97316",
    "#84CC16",
    "#6366F1",
];


function getScoreById(id) {
    const scores = {
        1: 92,
        2: 88,
        3: 95,
        4: 85,
        5: 90,
        6: 94,
        7: 87,
        8: 89,
        9: 91,
        10: 86,
    };
    return scores[id] || 85;
}


let employees = employeeInformation.map((emp, idx) => ({
    ...emp,
    color: avatarColors[idx],
    initials: emp.name
        .split(" ")
        .map((n) => n[0])
        .join(""),
    score: getScoreById(emp.id),
}));


const payrollData = employees.map((emp) => {
    const timesheet = payrollTimesheet.find((t) => t.employeeId === emp.id) || {};
    const gross = timesheet.gross || emp.salary;
    const leaveDeductions = timesheet.leaveDeductions || 0;
    const hoursWorked = timesheet.hoursWorked || 176;
    const tax = gross * 0.26;
    const ni = gross * 0.01;
    const pension = gross * 0.075;
    const totalDeductions = tax + ni + pension + leaveDeductions;
    const netPay = gross - totalDeductions;
    const hourlyRate = gross / hoursWorked;
    return {
        ...emp,
        ...timesheet,
        grossPay: gross,
        tax,
        ni,
        pension,
        deductions: totalDeductions,
        netPay,
        hourlyRate,
    };
});


// 3. Shared Utilities
function toRand(amount) {
    if (typeof amount !== "number" || isNaN(amount)) return "R0";
    return "R" + amount.toLocaleString("en-ZA", { maximumFractionDigits: 0 });
}


function showToast(message, type = "success") {
    const container = document.getElementById("toastContainer");
    if (!container) return;
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    const icon =
        type === "error"
            ? '<i class="fa-solid fa-circle-xmark"></i>'
            : '<i class="fa-solid fa-circle-check"></i>';
    toast.innerHTML = `${icon}<span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => toast.classList.add("show"), 10);
    setTimeout(() => {
        toast.classList.remove("show");
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function getQuirkyFact(data) {
    const firstName = data.name.split(" ")[0];
    const facts = [
        `Did you know? ${firstName} could buy ${Math.floor(data.netPay / 25)} cappuccinos this month.`,
        `Fun fact: ${firstName}'s hourly rate is enough for ${Math.floor(data.hourlyRate / 60)} minutes of helicopter time.`,
        `${firstName} worked ${data.hoursWorked} hours. That's ${data.hoursWorked * 60} minutes of brilliance.`,
        `If ${firstName} saved 10% of net pay, they'd have ${toRand(data.netPay * 0.1 * 12)} after a year.`,
        `${firstName}'s tax could fund ${Math.floor(data.tax / 15000)} school textbooks.`,
        `At this rate, ${firstName} earns ${toRand(data.hourlyRate / 60)} per minute.`,
        `${firstName} is in the top ${100 - data.score}% of performers. Iconic.`,
    ];
    return facts[data.id % facts.length];
}

function getMonthData(data, monthOffset) {
    const multiplier = Math.pow(0.95, monthOffset);
    return {
        gross: data.grossPay * multiplier,
        net: data.netPay * multiplier,
        tax: data.tax * multiplier,
    };
}

// 4. EMPLOYEES PAGE FUNCTIONS
function renderEmployeeGrid(empList = employees) {
    const grid = document.getElementById("employeeGrid");
    const empty = document.getElementById("employeeEmpty");
    if (!grid) return;


    if (empList.length === 0) {
        grid.innerHTML = "";
        if (empty) empty.style.display = "block";
        return;
    }


    if (empty) empty.style.display = "none";


    grid.innerHTML = empList
        .map(
            (emp) => `
    <div class="employee-card" data-employee-id="${emp.id}" role="button" tabindex="0">
      <div class="employee-card-top">
        <div class="employee-avatar" style="background: ${emp.color}">
          ${emp.initials}
        </div>
        <span class="status-badge">${emp.status}</span>
      </div>
      <h4>${emp.name}</h4>
      <p class="employee-role">${emp.position}</p>
      <div class="employee-card-footer">
        <span class="dept-badge">${emp.dept}</span>
        <div class="score-badge">
          <i class="fa-solid fa-star"></i>
          <span>${emp.score}%</span>
        </div>
      </div>
    </div>
  `,
        )
        .join("");

    document.querySelectorAll(".employee-card").forEach((card) => {
        const id = parseInt(card.dataset.employeeId);
        card.onclick = () => openEmployeeProfile(id);
        card.onkeydown = (e) => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                openEmployeeProfile(id);
            }
        };
    });
}

function openEmployeeProfile(empId) {
    const emp = employees.find((e) => e.id === empId);
    if (!emp) return showToast("Employee not found", "error");

    const overlay = document.getElementById("employeeProfileOverlay");
    const body = document.getElementById("empModalBody");
    const title = document.getElementById("empModalTitle");
    if (!overlay || !body) return;

    title.textContent = emp.name;
    body.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 1.5rem;">
      <div style="display: flex; align-items: center; gap: 1.25rem; padding-bottom: 1.25rem; border-bottom: 1px solid #e2e8f0;">
        <div style="width: 5rem; height: 5rem; border-radius: 9999px; display: flex; align-items: center; justify-content: center; color: white; font-size: 1.5rem; font-weight: 700; background-color: ${emp.color}">
          ${emp.initials}
        </div>
        <div style="flex: 1;">
          <h4 style="font-size: 1.5rem; font-weight: 700; color: #0f172a; margin: 0;">${emp.name}</h4>
          <p style="color: #4b5563; font-size: 1.125rem; margin: 0.25rem 0;">${emp.position}</p>
          <div style="display: flex; align-items: center; gap: 0.5rem; margin-top: 0.5rem;">
            <span style="padding: 0.25rem 0.75rem; background: #dcfce7; color: #166534; border-radius: 9999px; font-size: 0.875rem; font-weight: 500;">${emp.status}</span>
            <span style="padding: 0.25rem 0.75rem; background: #dbeafe; color: #1e40af; border-radius: 9999px; font-size: 0.875rem; font-weight: 500;">${emp.dept}</span>
          </div>
        </div>
      </div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
        <div style="background: #f9fafb; padding: 1rem; border-radius: 0.5rem;">
          <p style="font-size: 0.875rem; color: #6b7280; margin: 0 0 0.25rem 0;">Performance Score</p>
          <p style="font-size: 1.5rem; font-weight: 700; color: #111827; margin: 0;">${emp.score}/100</p>
        </div>
        <div style="background: #f9fafb; padding: 1rem; border-radius: 0.5rem;">
          <p style="font-size: 0.875rem; color: #6b7280; margin: 0 0 0.25rem 0;">Base Salary</p>
          <p style="font-size: 1.5rem; font-weight: 700; color: #111827; margin: 0;">${toRand(emp.salary)}</p>
        </div>
      </div>
      <div style="background: #f9fafb; padding: 1rem; border-radius: 0.5rem;">
        <p style="font-size: 0.875rem; font-weight: 600; color: #374151; margin: 0 0 0.5rem 0;">Contact Information</p>
        <div style="display: flex; align-items: center; gap: 0.5rem; color: #4b5563;">
          <i class="fa-solid fa-envelope"></i>
          <a href="mailto:${emp.contact}" style="color: #2563eb; text-decoration: none;">${emp.contact}</a>
        </div>
      </div>
      <div style="background: #eff6ff; border: 1px solid #bfdbfe; padding: 1rem; border-radius: 0.5rem;">
        <p style="font-size: 0.875rem; font-weight: 600; color: #1e3a8a; margin: 0 0 0.5rem 0;">Career History</p>
        <p style="font-size: 0.875rem; color: #1e40af; margin: 0;">${emp.history}</p>
      </div>
    </div>
  `;

    overlay.style.display = "flex";
    document.body.style.overflow = "hidden";
}

function closeEmployeeProfile() {
    const overlay = document.getElementById("employeeProfileOverlay");
    if (overlay) {
        overlay.style.display = "none";
        document.body.style.overflow = "";
    }
}

function initEmployeeSearch() {
    const search = document.getElementById("employeeSearch");
    if (!search) return;
    search.addEventListener("input", (e) => {
        const query = e.target.value.toLowerCase().trim();
        if (!query) return renderEmployeeGrid(employees);
        const filtered = employees.filter(
            (emp) =>
                emp.name.toLowerCase().includes(query) ||
                emp.position.toLowerCase().includes(query) ||
                emp.dept.toLowerCase().includes(query) ||
                emp.contact.toLowerCase().includes(query),
        );
        renderEmployeeGrid(filtered);
    });
}

function initFilterButton() {
    const filterBtn = document.getElementById("filterBtn");
    if (!filterBtn) return;
    filterBtn.addEventListener("click", showFilterModal);
}

function showFilterModal() {
    const depts = [...new Set(employees.map((e) => e.dept))].sort();
    const overlay = document.getElementById("employeeProfileOverlay");
    const body = document.getElementById("empModalBody");
    const title = document.getElementById("empModalTitle");
    if (!overlay || !body) return;

    title.textContent = "Filter Employees";
    body.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 1rem;">
      <div>
        <label style="display: block; font-size: 0.875rem; font-weight: 600; margin-bottom: 0.5rem; color: #374151;">Department</label>
        <select id="filterDept" style="width: 100%; padding: 0.625rem; border: 1px solid #d1d5db; border-radius: 0.5rem; font-size: 0.875rem; color: #111827;">
          <option value="">All Departments</option>
          ${depts.map((d) => `<option value="${d}">${d}</option>`).join("")}
        </select>
      </div>
      <div>
        <label style="display: block; font-size: 0.875rem; font-weight: 600; margin-bottom: 0.5rem; color: #374151;">Min Performance Score</label>
        <input id="filterScore" type="number" min="0" max="100" placeholder="0-100" style="width: 100%; padding: 0.625rem; border: 1px solid #d1d5db; border-radius: 0.5rem; font-size: 0.875rem; color: #111827;">
      </div>
      <div style="display: flex; gap: 0.75rem; padding-top: 0.5rem;">
        <button id="applyFilterBtn" class="btn-primary" style="flex: 1; padding: 0.75rem; font-size: 0.875rem; font-weight: 600;">Apply Filter</button>
        <button id="clearFilterBtn" class="btn-secondary" style="flex: 1; padding: 0.75rem; font-size: 0.875rem; font-weight: 600;">Clear</button>
      </div>
    </div>
  `;
    overlay.style.display = "flex";
    document.body.style.overflow = "hidden";

    document.getElementById("applyFilterBtn").onclick = applyEmployeeFilter;
    document.getElementById("clearFilterBtn").onclick = () => {
        clearEmployeeFilter();
        closeEmployeeProfile();
    };
}

function applyEmployeeFilter() {
    const dept = document.getElementById("filterDept").value;
    const minScore = parseInt(document.getElementById("filterScore").value) || 0;
    const filtered = employees.filter((emp) => {
        const deptMatch = !dept || emp.dept === dept;
        const scoreMatch = emp.score >= minScore;
        return deptMatch && scoreMatch;
    });
    renderEmployeeGrid(filtered);
    closeEmployeeProfile();
    showToast(`Showing ${filtered.length} employees`);
}

function clearEmployeeFilter() {
    renderEmployeeGrid(employees);
    const search = document.getElementById("employeeSearch");
    if (search) search.value = "";
}

function initAddEmployeeButton() {
    const addBtn = document.getElementById("addEmployeeBtn");
    if (!addBtn) return;
    addBtn.addEventListener("click", showAddEmployeeModal);
}

function showAddEmployeeModal() {
    const overlay = document.getElementById("employeeProfileOverlay");
    const body = document.getElementById("empModalBody");
    const title = document.getElementById("empModalTitle");
    if (!overlay || !body) return;

    title.textContent = "Add New Employee";
    body.innerHTML = `
    <form id="addEmployeeForm" style="display: flex; flex-direction: column; gap: 1rem; font-family: system-ui, -apple-system, sans-serif;">
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
        <div>
          <label style="display: block; font-size: 0.875rem; font-weight: 600; margin-bottom: 0.375rem; color: #374151;">Full Name *</label>
          <input name="name" type="text" required placeholder="e.g. John Doe" style="width: 100%; padding: 0.625rem; border: 1px solid #d1d5db; border-radius: 0.5rem; font-size: 0.875rem; color: #111827; box-sizing: border-box;">
        </div>
        <div>
          <label style="display: block; font-size: 0.875rem; font-weight: 600; margin-bottom: 0.375rem; color: #374151;">Position *</label>
          <input name="position" type="text" required placeholder="e.g. Software Engineer" style="width: 100%; padding: 0.625rem; border: 1px solid #d1d5db; border-radius: 0.5rem; font-size: 0.875rem; color: #111827; box-sizing: border-box;">
        </div>
      </div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
        <div>
          <label style="display: block; font-size: 0.875rem; font-weight: 600; margin-bottom: 0.375rem; color: #374151;">Department *</label>
          <input name="dept" type="text" required placeholder="e.g. Engineering" style="width: 100%; padding: 0.625rem; border: 1px solid #d1d5db; border-radius: 0.5rem; font-size: 0.875rem; color: #111827; box-sizing: border-box;">
        </div>
        <div>
          <label style="display: block; font-size: 0.875rem; font-weight: 600; margin-bottom: 0.375rem; color: #374151;">Base Salary *</label>
          <input name="salary" type="number" required min="0" placeholder="e.g. 85000" style="width: 100%; padding: 0.625rem; border: 1px solid #d1d5db; border-radius: 0.5rem; font-size: 0.875rem; color: #111827; box-sizing: border-box;">
        </div>
      </div>
      <div>
        <label style="display: block; font-size: 0.875rem; font-weight: 600; margin-bottom: 0.375rem; color: #374151;">Email *</label>
        <input name="contact" type="email" required placeholder="name@company.co.za" style="width: 100%; padding: 0.625rem; border: 1px solid #d1d5db; border-radius: 0.5rem; font-size: 0.875rem; color: #111827; box-sizing: border-box;">
      </div>
      <div>
        <label style="display: block; font-size: 0.875rem; font-weight: 600; margin-bottom: 0.375rem; color: #374151;">History/Notes</label>
        <textarea name="history" rows="3" placeholder="Brief background" style="width: 100%; padding: 0.625rem; border: 1px solid #d1d5db; border-radius: 0.5rem; font-size: 0.875rem; color: #111827; box-sizing: border-box; resize: vertical; font-family: inherit;"></textarea>
      </div>
      <div style="display: flex; gap: 0.75rem; padding-top: 0.5rem;">
        <button type="submit" class="btn-primary" style="flex: 1; padding: 0.75rem; font-size: 0.875rem; font-weight: 600; border: none; border-radius: 0.5rem; cursor: pointer;">Add Employee</button>
        <button type="button" onclick="closeEmployeeProfile()" class="btn-secondary" style="flex: 1; padding: 0.75rem; font-size: 0.875rem; font-weight: 600; border: none; border-radius: 0.5rem; cursor: pointer;">Cancel</button>
      </div>
    </form>
  `;

    overlay.style.display = "flex";
    document.body.style.overflow = "hidden";
    document.getElementById("addEmployeeForm").onsubmit = handleAddEmployee;
}

function handleAddEmployee(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newId = Math.max(...employees.map((emp) => emp.id), 0) + 1;
    const colorIdx = employees.length % avatarColors.length;

    const newEmp = {
        id: newId,
        name: formData.get("name"),
        position: formData.get("position"),
        dept: formData.get("dept"),
        salary: parseInt(formData.get("salary")),
        contact: formData.get("contact"),
        history: formData.get("history") || "New employee",
        status: "Active",
        color: avatarColors[colorIdx],
        initials: formData
            .get("name")
            .split(" ")
            .map((n) => n[0])
            .join(""),
        score: 85,
    };

    employees.push(newEmp);
    renderEmployeeGrid(employees);
    closeEmployeeProfile();
    showToast(`${newEmp.name} added successfully`);
}

// 5. PAYROLL PAGE FUNCTIONS
let activePayslipData = null;
let activePayslipCharts = [];
let payrollBreakdownChart = null;
let topEarnersChart = null;

function initPayrollPage() {
    renderPayrollTable();
    updatePayrollSummary();
    renderPayrollCharts();
    initPayslipSystem();

    const exportBtn = document.getElementById("exportAllBtn");
    if (exportBtn) {
        exportBtn.addEventListener("click", () =>
            showToast("Export started. You'll receive an email when ready."),
        );
    }

    const monthSelect = document.getElementById("monthSelect");
    if (monthSelect) {
        monthSelect.addEventListener("change", (e) => {
            const selectedMonth = e.target.value;
            showToast(`Switched to ${selectedMonth}`);
            const tableHeader = document.querySelector(
                "#payroll-data.table-header h4",
            );
            if (tableHeader)
                tableHeader.textContent = `Employee Payroll — ${selectedMonth}`;
        });
    }
}

function renderPayrollTable() {
    const tbody = document.getElementById("payrollTableBody");
    if (!tbody) return;
    tbody.innerHTML = payrollData
        .map(
            (emp) => `
    <tr data-employee-id="${emp.id}">
      <td>
        <div class="employee-cell">
          <div class="employee-avatar-small" style="background: ${emp.color}">${emp.initials}</div>
          <div>
            <p class="employee-name">${emp.name}</p>
            <p class="employee-dept">${emp.dept}</p>
          </div>
        </div>
      </td>
      <td class="mono">${toRand(emp.grossPay)}</td>
      <td class="text-red mono">-${toRand(emp.tax)}</td>
      <td class="text-red mono">-${toRand(emp.ni)}</td>
      <td class="text-amber mono">-${toRand(emp.pension)}</td>
      <td class="text-teal mono font-bold">${toRand(emp.netPay)}</td>
      <td>
        <button type="button" class="btn-table" data-payslip-id="${emp.id}">
          <i class="fa-regular fa-file-lines"></i>
          <span>Payslip</span>
        </button>
      </td>
    </tr>
  `,
        )
        .join("");

    tbody.querySelectorAll(".btn-table[data-payslip-id]").forEach((btn) => {
        btn.addEventListener("click", () =>
            openPayslip(parseInt(btn.dataset.payslipId)),
        );
    });
}

function updatePayrollSummary() {
    const grossTotal = payrollData.reduce((sum, e) => sum + e.grossPay, 0);
    const deductTotal = payrollData.reduce((sum, e) => sum + e.deductions, 0);
    const netTotal = payrollData.reduce((sum, e) => sum + e.netPay, 0);
    document.getElementById("grossPayroll").textContent = toRand(grossTotal);
    document.getElementById("totalDeductions").textContent = toRand(deductTotal);
    document.getElementById("netPayroll").textContent = toRand(netTotal);
}

function renderPayrollCharts() {
    if (typeof Chart === "undefined") return;

    const ctx1 = document.getElementById("payrollBreakdownChart");
    if (ctx1) {
        if (payrollBreakdownChart) payrollBreakdownChart.destroy();
        const totals = payrollData.reduce(
            (acc, e) => {
                acc.net += e.netPay;
                acc.tax += e.tax;
                acc.ni += e.ni;
                acc.pension += e.pension;
                return acc;
            },
            { net: 0, tax: 0, ni: 0, pension: 0 },
        );
        payrollBreakdownChart = new Chart(ctx1, {
            type: "doughnut",
            data: {
                labels: ["Net Pay", "PAYE Tax", "UIF", "Pension"],
                datasets: [
                    {
                        data: [totals.net, totals.tax, totals.ni, totals.pension],
                        backgroundColor: ["#10B981", "#EF4444", "#F59E0B", "#3B82F6"],
                    },
                ],
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { position: "bottom" },
                    title: { display: true, text: "Company Payroll Breakdown" },
                },
            },
        });
    }

    const ctx2 = document.getElementById("topEarnersChart");
    if (ctx2) {
        if (topEarnersChart) topEarnersChart.destroy();
        const top5 = [...payrollData]
            .sort((a, b) => b.netPay - a.netPay)
            .slice(0, 5);
        topEarnersChart = new Chart(ctx2, {
            type: "bar",
            data: {
                labels: top5.map((e) => e.name.split(" ")[0]),
                datasets: [
                    {
                        label: "Net Pay",
                        data: top5.map((e) => e.netPay),
                        backgroundColor: "#3B82F6",
                    },
                ],
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: false },
                    title: { display: true, text: "Top 5 Earners by Net Pay" },
                },
                scales: { y: { ticks: { callback: (v) => toRand(v) } } },
            },
        });
    }
}

// 6. Payslip System V2 - Works for Payroll Page
function initPayslipSystem() {
    const overlay = document.getElementById("payslipModalOverlay");
    const closeBtn = document.getElementById("closePayslipBtn");
    const downloadBtn = document.getElementById("downloadPayslipBtn");
    const emailBtn = document.getElementById("emailPayslipBtn");

    if (closeBtn) closeBtn.addEventListener("click", closePayslip);
    if (overlay)
        overlay.addEventListener("click", (e) => {
            if (e.target === overlay) closePayslip();
        });
    if (downloadBtn) downloadBtn.addEventListener("click", downloadPayslipPDF);
    if (emailBtn)
        emailBtn.addEventListener("click", () =>
            showToast("Payslip emailed to employee"),
        );

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") closePayslip();
    });
}

function openPayslip(empId) {
    console.log("[Payslip] Opening ID:", empId);
    const data = payrollData.find((e) => e.id === empId);
    if (!data) return showToast("Employee not found", "error");

    activePayslipData = data;
    const overlay = document.getElementById("payslipModalOverlay");
    const content = document.getElementById("payslipContent");
    const title = document.getElementById("payslipTitle");

    if (!overlay || !content) {
        console.error("[Payslip] Modal elements missing");
        showToast("Payslip modal error", "error");
        return;
    }

    title.textContent = `${data.name} - June 2026 Payslip`;
    content.innerHTML = `
  <div class="space-y-6">
    <div class="flex items-center justify-between pb-4 border-b">
      <div>
        <h4 class="text-xl font-bold">${data.name}</h4>
        <p class="text-gray-600">${data.position} | ${data.dept}</p>
        <p class="text-sm text-gray-500">Employee ID: ${data.id}</p>
      </div>
      <div class="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold" style="background-color: ${data.color}">
        ${data.initials}
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="bg-gray-50 p-4 rounded-lg">
        <h5 class="font-semibold mb-3 text-gray-700">Earnings</h5>
        <div class="space-y-2 text-sm">
          <div class="flex justify-between">
            <span>Basic Salary</span>
            <span class="font-medium">${toRand(data.grossPay)}</span>
          </div>
          <div class="flex justify-between">
            <span>Hours Worked</span>
            <span class="font-medium">${data.hoursWorked} hrs</span>
          </div>
          <div class="flex justify-between">
            <span>Hourly Rate</span>
            <span class="font-medium">${toRand(data.hourlyRate)}</span>
          </div>
          <div class="flex justify-between font-semibold border-t pt-2 mt-2">
            <span>Gross Pay</span>
            <span>${toRand(data.grossPay)}</span>
          </div>
        </div>
      </div>

      <div class="bg-gray-50 p-4 rounded-lg">
        <h5 class="font-semibold mb-3 text-gray-700">Deductions</h5>
        <div class="space-y-2 text-sm">
          <div class="flex justify-between">
            <span>PAYE Tax</span>
            <span class="font-medium">${toRand(data.tax)}</span>
          </div>
          <div class="flex justify-between">
            <span>UIF</span>
            <span class="font-medium">${toRand(data.ni)}</span>
          </div>
          <div class="flex justify-between">
            <span>Pension</span>
            <span class="font-medium">${toRand(data.pension)}</span>
          </div>
          <div class="flex justify-between">
            <span>Leave Deductions</span>
            <span class="font-medium">${toRand(data.leaveDeductions)}</span>
          </div>
          <div class="flex justify-between font-semibold border-t pt-2 mt-2">
            <span>Total Deductions</span>
            <span>${toRand(data.deductions)}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-green-50 border-2 border-green-200 p-5 rounded-lg">
      <div class="flex justify-between items-center">
        <span class="text-lg font-semibold text-green-900">Net Pay</span>
        <span class="text-3xl font-bold text-green-600">${toRand(data.netPay)}</span>
      </div>
    </div>

    <div class="bg-blue-50 border border-blue-200 p-4 rounded-lg">
      <p class="text-sm text-blue-900 italic">${getQuirkyFact(data)}</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <h6 class="font-semibold mb-2 text-sm text-gray-700">Pay Breakdown</h6>
        <canvas id="payslipPieChart"></canvas>
      </div>
      <div>
        <h6 class="font-semibold mb-2 text-sm text-gray-700">3 Month Trend</h6>
        <canvas id="payslipTrendChart"></canvas>
      </div>
    </div>
  </div>
`;

    overlay.style.display = "flex";
    document.body.style.overflow = "hidden";
    setTimeout(() => renderNewPayslipCharts(data), 50);
}

function renderNewPayslipCharts(data) {
    activePayslipCharts.forEach((chart) => chart.destroy());
    activePayslipCharts = [];

    const pieCtx = document.getElementById("payslipPieChart");
    const trendCtx = document.getElementById("payslipTrendChart");

    if (pieCtx && typeof Chart !== "undefined") {
        const pieChart = new Chart(pieCtx, {
            type: "doughnut",
            data: {
                labels: ["Net Pay", "PAYE", "UIF", "Pension", "Leave"],
                datasets: [
                    {
                        data: [
                            data.netPay,
                            data.tax,
                            data.ni,
                            data.pension,
                            data.leaveDeductions,
                        ],
                        backgroundColor: [
                            "#10B981",
                            "#EF4444",
                            "#F59E0B",
                            "#3B82F6",
                            "#8B5CF6",
                        ],
                    },
                ],
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: "bottom",
                        labels: { boxWidth: 12, font: { size: 11 } },
                    },
                },
            },
        });
        activePayslipCharts.push(pieChart);
    }

    if (trendCtx && typeof Chart !== "undefined") {
        const may = getMonthData(data, 1);
        const apr = getMonthData(data, 2);
        const trendChart = new Chart(trendCtx, {
            type: "line",
            data: {
                labels: ["Apr", "May", "Jun"],
                datasets: [
                    {
                        label: "Net Pay",
                        data: [apr.net, may.net, data.netPay],
                        borderColor: "#10B981",
                        backgroundColor: "rgba(16, 185, 129, 0.1)",
                        tension: 0.4,
                        fill: true,
                    },
                ],
            },
            options: {
                responsive: true,
                plugins: { legend: { display: false } },
                scales: {
                    y: { ticks: { callback: (v) => toRand(v), font: { size: 10 } } },
                },
            },
        });
        activePayslipCharts.push(trendChart);
    }
}

function closePayslipModal() {
    const overlay = document.getElementById("payslipModalOverlay");
    if (overlay) {
        overlay.style.display = "none";
        document.body.style.overflow = "";
    }
    activePayslipCharts.forEach((chart) => chart.destroy());
    activePayslipCharts = [];
    activePayslipData = null;
}

function downloadPayslipPDF() {
    if (!activePayslipData) {
        showToast("No payslip data loaded", "error");
        return;
    }

    if (typeof window.jspdf === "undefined") {
        showToast("PDF library not loaded. Refresh the page.", "error");
        return;
    }

    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        const d = activePayslipData;

        doc.setFontSize(20);
        doc.setFont("helvetica", "bold");
        doc.text("ModernTech HR", 105, 20, { align: "center" });
        doc.setFontSize(16);
        doc.text("Payslip - June 2026", 105, 30, { align: "center" });

        doc.setFontSize(11);
        doc.setFont("helvetica", "normal");
        doc.text(`Employee: ${d.name}`, 20, 45);
        doc.text(`Position: ${d.position}`, 20, 52);
        doc.text(`Department: ${d.dept}`, 20, 59);
        doc.text(`Employee ID: ${d.id}`, 20, 66);

        doc.setLineWidth(0.5);
        doc.line(20, 72, 190, 72);

        doc.setFont("helvetica", "bold");
        doc.text("Earnings", 20, 82);
        doc.setFont("helvetica", "normal");
        doc.text(`Basic Salary:`, 30, 90);
        doc.text(toRand(d.grossPay), 190, 90, { align: "right" });
        doc.text(`Hours Worked:`, 30, 97);
        doc.text(`${d.hoursWorked} hrs @ ${toRand(d.hourlyRate)}/hr`, 190, 97, {
            align: "right",
        });
        doc.setFont("helvetica", "bold");
        doc.text(`Gross Pay:`, 30, 104);
        doc.text(toRand(d.grossPay), 190, 104, { align: "right" });

        doc.setFont("helvetica", "bold");
        doc.text("Deductions", 20, 116);
        doc.setFont("helvetica", "normal");
        doc.text(`PAYE Tax:`, 30, 124);
        doc.text(toRand(d.tax), 190, 124, { align: "right" });
        doc.text(`UIF:`, 30, 131);
        doc.text(toRand(d.ni), 190, 131, { align: "right" });
        doc.text(`Pension:`, 30, 138);
        doc.text(toRand(d.pension), 190, 138, { align: "right" });
        doc.text(`Leave Deductions:`, 30, 145);
        doc.text(toRand(d.leaveDeductions), 190, 145, { align: "right" });
        doc.setFont("helvetica", "bold");
        doc.text(`Total Deductions:`, 30, 152);
        doc.text(toRand(d.deductions), 190, 152, { align: "right" });

        doc.setLineWidth(1);
        doc.line(20, 158, 190, 158);
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text(`Net Pay:`, 30, 168);
        doc.text(toRand(d.netPay), 190, 168, { align: "right" });

        doc.setFontSize(9);
        doc.setFont("helvetica", "italic");
        doc.text(getQuirkyFact(d), 20, 185, { maxWidth: 170 });
        doc.text(`Generated: ${new Date().toLocaleDateString("en-ZA")}`, 20, 280);

        const filename = `Payslip_${d.name.replace(/\s+/g, "_")}_June2026.pdf`;
        doc.save(filename);
        showToast("Payslip downloaded successfully");
    } catch (err) {
        console.error("[PDF] Generation error:", err);
        showToast("Failed to generate PDF", "error");
    }
}

function initPayslipSystem() {
    const closeBtn = document.getElementById("closePayslipBtn");
    const overlay = document.getElementById("payslipModalOverlay");
    const downloadBtn = document.getElementById("downloadPayslipBtn");
    const emailBtn = document.getElementById("emailPayslipBtn");

    if (closeBtn) closeBtn.addEventListener("click", closePayslipModal);
    if (overlay) {
        overlay.addEventListener("click", (e) => {
            if (e.target === overlay) closePayslipModal();
        });
    }
    if (downloadBtn) downloadBtn.addEventListener("click", downloadPayslipPDF);
    if (emailBtn) {
        emailBtn.addEventListener("click", () => {
            showToast("Payslip emailed to employee");
        });
    }
}

// 7. Global Init - Router
document.addEventListener("DOMContentLoaded", () => {
    console.log("[Init] Starting page");

    // Initialize employees page if present
    if (document.getElementById("employeeGrid")) {
        renderEmployeeGrid();
        initEmployeeSearch();
        initFilterButton();
        initAddEmployeeButton();
    }

    // Initialize payroll page if present
    if (document.getElementById("payrollTableBody")) {
        initPayrollPage();
    }

    // Global modal close handlers
    const closeBtn = document.getElementById("closeEmployeeModalBtn");
    const overlay = document.getElementById("employeeProfileOverlay");

    if (closeBtn) closeBtn.onclick = closeEmployeeProfile;
    if (overlay) {
        overlay.onclick = (e) => {
            if (e.target === overlay) closeEmployeeProfile();
        };
    }

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            closeEmployeeProfile();
            closePayslipModal();
        }
    });
});

// Expose for debugging
window.openEmployeeProfile = openEmployeeProfile;
window.closeEmployeeProfile = closeEmployeeProfile;
window.openPayslip = openPayslip;
window.closePayslipModal = closePayslipModal;


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
        row.addEventListener('mouseenter', function () {
            this.style.background = '#2d3748';
            this.style.transform = 'scale(1.002)';
            this.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';
        });
        row.addEventListener('mouseleave', function () {
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

        switch (sortType) {
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
        input.addEventListener('focus', function () {
            this.style.borderColor = '#6366f1';
            this.style.background = '#1a2332';
            this.style.boxShadow = '0 0 0 4px rgba(99, 102, 241, 0.15)';
        });
        input.addEventListener('blur', function () {
            this.style.borderColor = '#1e293b';
            this.style.background = '#0f172a';
            this.style.boxShadow = 'none';
        });
    });

    // Hover effects for buttons
    form.querySelectorAll('.btn').forEach(btn => {
        btn.addEventListener('mouseenter', function () {
            this.style.transform = 'translateY(-2px)';
        });
        btn.addEventListener('mouseleave', function () {
            this.style.transform = 'translateY(0)';
        });
    });

    document.body.appendChild(form);

    // Submit button
    document.getElementById('submitAttendanceBtn').addEventListener('click', function () {
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
    document.getElementById('cancelAttendanceBtn').addEventListener('click', function () {
        form.remove();
        const newRecordBtn = document.getElementById('newRecordBtn');
        if (newRecordBtn) {
            newRecordBtn.textContent = '📝 New Record';
        }
    });

    // Close on background click
    form.addEventListener('click', function (e) {
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
            newRecordBtn.addEventListener('click', function (e) {
                e.preventDefault();
                createAttendanceForm();
                this.textContent = '✖ Close Form';
            });
        }

        // Filter Button
        if (filterBtn) {
            filterBtn.addEventListener('click', function (e) {
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

                    document.getElementById('applyFilterBtn').addEventListener('click', function () {
                        const status = document.getElementById('filterStatus').value;
                        const dateFrom = document.getElementById('filterDateFrom').value;
                        const dateTo = document.getElementById('filterDateTo').value;
                        applyFilters(status, dateFrom, dateTo);
                        filterDropdown.remove();
                        filterBtn.textContent = '🔍 Filter';
                    });

                    document.getElementById('clearFilterBtn').addEventListener('click', function () {
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
            addReviewBtn.addEventListener('click', function (e) {
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
                document.getElementById('submitReviewBtn').addEventListener('click', function () {
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
                document.getElementById('cancelReviewBtn').addEventListener('click', function () {
                    modal.remove();
                });

                // Close on background click
                modal.addEventListener('click', function (e) {
                    if (e.target === modal) modal.remove();
                });
            });
        }

        // Sort Button
        if (sortBtn) {
            sortBtn.addEventListener('click', function (e) {
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
                        btn.addEventListener('mouseenter', function () {
                            this.style.background = 'rgba(99, 102, 241, 0.15)';
                            this.style.color = '#fff';
                        });
                        btn.addEventListener('mouseleave', function () {
                            this.style.background = 'none';
                            this.style.color = '#cbd5e1';
                        });

                        btn.addEventListener('click', function () {
                            const sortType = this.dataset.sort;
                            applySort(sortType);
                            sortDropdown.remove();
                            const label = this.textContent.trim();
                            sortBtn.textContent = `📊 ${label.split(' ').slice(0, 2).join(' ')}`;
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

document.addEventListener('DOMContentLoaded', function () {
    console.log('🚀 Initializing ModernTech HR System...');
    console.log(`📄 Current page: ${isAttendancePage ? 'Attendance' : isReviewsPage ? 'Reviews' : 'Other'}`);

    try {
        highlightActiveNav();
        initializeButtons();
        loadAttendanceData();
        loadReviews();

        // Close dropdowns on outside click
        document.addEventListener('click', function (e) {
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