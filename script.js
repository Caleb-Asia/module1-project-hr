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
