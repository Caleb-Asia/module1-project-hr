// frontend-repo/src/payroll.js
const API_URL = "http://localhost:5000";

async function fetchPayroll() {
  const res = await fetch(`${API_URL}/api/payroll`);
  return await res.json();
}

async function fetchPayrollById(id) {
  const res = await fetch(`${API_URL}/api/payroll/${id}`);
  return await res.json();
}

// rendering
async function loadPayrollGrid() {
  const data = await fetchPayroll();
  document.getElementById("payrollGrid").innerHTML = data
    .map(
      (p) => `
    <div onclick="openPayslip(${p.id})">
      <h4>${p.name}</h4>
      <p>Net: R${p.netPay.toLocaleString()}</p>
    </div>
  `,
    )
    .join("");
}

document.addEventListener("DOMContentLoaded", loadPayrollGrid);
