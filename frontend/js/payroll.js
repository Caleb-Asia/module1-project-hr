import { API_URL, toRand, showToast } from "./config.js";

let payrollData = [];
let breakdownChart, earnersChart;

async function fetchPayroll() {
  const month = document.getElementById("monthSelect")?.value || "June 2026";
  const res = await fetch(
    `${API_URL}/api/payroll?month=${encodeURIComponent(month)}`,
  );
  if (!res.ok) throw new Error("Failed");
  return res.json();
}

async function loadPayrollPage() {
  try {
    payrollData = await fetchPayroll();
    if (!payrollData.length) {
      showToast("No payroll data", "error");
      return;
    }

    const totalGross = payrollData.reduce(
      (s, p) => s + (p.grossPay || p.gross || p.salary || 0),
      0,
    );
    const totalTax = payrollData.reduce((s, p) => s + (p.tax || 0), 0);
    const totalUIF = payrollData.reduce((s, p) => s + (p.uif || p.ni || 0), 0);
    const totalPension = payrollData.reduce((s, p) => s + (p.pension || 0), 0);
    const totalLeave = payrollData.reduce(
      (s, p) => s + (p.leaveDeductions || 0),
      0,
    );
    const totalDeduct = totalTax + totalUIF + totalPension + totalLeave;
    const totalNet = payrollData.reduce(
      (s, p) => s + (p.netPay || p.finalSalary || 0),
      0,
    );

    document.getElementById("grossPayroll").textContent = toRand(totalGross);
    document.getElementById("totalDeductions").textContent =
      toRand(totalDeduct);
    document.getElementById("netPayroll").textContent = toRand(totalNet);

    const tbody = document.getElementById("payrollTableBody");
    tbody.innerHTML = payrollData
      .map((p) => {
        const gross = p.grossPay || p.gross || p.salary || 0;
        const tax = p.tax || 0;
        const uif = p.uif || p.ni || 0;
        const pension = p.pension || 0;
        const net = p.netPay || p.finalSalary || 0;
        return `<tr>
        <td><div style="display:flex;gap:0.6rem;align-items:center;"><div class="employee-avatar" style="width:32px;height:32px;font-size:0.7rem;background:#0f172a;">${p.name
          .split(" ")
          .map((n) => n[0])
          .join(
            "",
          )}</div><div><strong>${p.name}</strong><br><small style="color:#64748b;">${p.position || ""}</small></div></div></td>
        <td>${toRand(gross)}</td>
        <td style="color:#ef4444;">${toRand(tax)}</td>
        <td>${toRand(uif)}</td>
        <td>${toRand(pension)}</td>
        <td><strong style="color:#0f766e;">${toRand(net)}</strong></td>
        <td><button class="btn-secondary" style="padding:0.3rem 0.6rem;" onclick="window.openPayslip(${p.id})"><i class="fa-solid fa-eye"></i> View</button></td>
      </tr>`;
      })
      .join("");

    renderCharts(
      totalGross,
      totalTax,
      totalUIF,
      totalPension,
      totalLeave,
      totalDeduct,
    );
  } catch (err) {
    console.error(err);
    showToast("Failed to load payroll", "error");
  }
}

function renderCharts(gross, tax, uif, pension, leave, deduct) {
  const ctx1 = document.getElementById("payrollBreakdownChart");
  if (ctx1) {
    if (breakdownChart) breakdownChart.destroy();
    breakdownChart = new Chart(ctx1, {
      type: "doughnut",
      data: {
        labels: ["Net Pay", "Tax", "UIF", "Pension", "Leave"],
        datasets: [
          {
            data: [gross - deduct, tax, uif, pension, leave],
            backgroundColor: [
              "#14b8a6",
              "#ef4444",
              "#3b82f6",
              "#8b5cf6",
              "#f59e0b",
            ],
          },
        ],
      },
    });
  }
  const ctx2 = document.getElementById("topEarnersChart");
  if (ctx2) {
    const top5 = [...payrollData]
      .sort((a, b) => (b.netPay || b.finalSalary) - (a.netPay || a.finalSalary))
      .slice(0, 5);
    if (earnersChart) earnersChart.destroy();
    earnersChart = new Chart(ctx2, {
      type: "bar",
      data: {
        labels: top5.map((p) => p.name.split(" ")[0]),
        datasets: [
          {
            label: "Net Pay",
            data: top5.map((p) => p.netPay || p.finalSalary),
            backgroundColor: "#14b8a6",
          },
        ],
      },
      options: { indexAxis: "y", plugins: { legend: { display: false } } },
    });
  }
}

window.openPayslip = (id) => {
  const p = payrollData.find((x) => x.id === id);
  if (!p) return;
  const gross = p.grossPay || p.gross || p.salary || 0;
  const tax = p.tax || 0;
  const uif = p.uif || p.ni || 0;
  const pension = p.pension || 0;
  const net = p.netPay || p.finalSalary || 0;
  document.getElementById("payslipTitle").textContent = `${p.name} - Payslip`;
  document.getElementById("payslipContent").innerHTML = `
    <div style="text-align:center;margin-bottom:1rem;"><h3 style="margin:0;">ModernTech (Pty) Ltd</h3><p style="margin:0;color:#64748b;font-size:0.875rem;">Payslip for ${p.name}</p></div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1rem;">
      <div><small>Employee</small><br><strong>${p.name}</strong></div>
      <div><small>Position</small><br><strong>${p.position || ""}</strong></div>
      <div><small>Hours</small><br><strong>${p.hoursWorked || 0}h</strong></div>
      <div><small>Dept</small><br><strong>${p.dept || ""}</strong></div>
    </div><hr>
    <div style="margin-top:1rem;">
      <div style="display:flex;justify-content:space-between;padding:0.4rem 0;"><span>Gross Pay</span><span>${toRand(gross)}</span></div>
      <div style="display:flex;justify-content:space-between;padding:0.4rem 0;color:#ef4444;"><span>PAYE (26%)</span><span>-${toRand(tax)}</span></div>
      <div style="display:flex;justify-content:space-between;padding:0.4rem 0;color:#ef4444;"><span>UIF (1%)</span><span>-${toRand(uif)}</span></div>
      <div style="display:flex;justify-content:space-between;padding:0.4rem 0;color:#ef4444;"><span>Pension (7.5%)</span><span>-${toRand(pension)}</span></div>
      <div style="display:flex;justify-content:space-between;padding:0.4rem 0;color:#ef4444;"><span>Leave</span><span>-${toRand(p.leaveDeductions || 0)}</span></div>
      <hr><div style="display:flex;justify-content:space-between;font-weight:700;font-size:1.1rem;"><span>Net Pay</span><span style="color:#0f766e;">${toRand(net)}</span></div>
    </div>`;
  document.getElementById("payslipModalOverlay").style.display = "flex";
};

function closePayslip() {
  document.getElementById("payslipModalOverlay").style.display = "none";
}

document.addEventListener("DOMContentLoaded", () => {
  loadPayrollPage();
  document
    .getElementById("monthSelect")
    ?.addEventListener("change", loadPayrollPage);
  document
    .getElementById("closePayslipBtn")
    ?.addEventListener("click", closePayslip);
  document
    .getElementById("payslipModalOverlay")
    ?.addEventListener("click", (e) => {
      if (e.target.id === "payslipModalOverlay") closePayslip();
    });
});
