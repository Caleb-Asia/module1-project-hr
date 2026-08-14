// frontend-repo/src/employees.js
const API_URL = "http://localhost:5000";

function toRand(amount) {
  return "R" + amount.toLocaleString("en-ZA", { maximumFractionDigits: 0 });
}
function showToast(msg, type = "success") {
  /* your toast code */
}

// --- FETCH FUNCTIONS ---
async function fetchEmployees({ search = "", dept = "", minScore = "" } = {}) {
  const params = new URLSearchParams({ search, dept, minScore });
  const res = await fetch(`${API_URL}/api/employees?${params}`);
  return await res.json();
}
async function fetchEmployeeById(id) {
  const res = await fetch(`${API_URL}/api/employees/${id}`);
  if (!res.ok) throw new Error("Not found");
  return await res.json();
}
async function fetchDepartments() {
  const res = await fetch(`${API_URL}/api/employees/departments`);
  return await res.json();
}
async function createEmployee(data) {
  const res = await fetch(`${API_URL}/api/employees`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return await res.json();
}

// --- RENDERING - your original functions, but using fetched data ---
function renderEmployeeGrid(empList) {
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
        <div class="employee-avatar" style="background:${emp.color}">${emp.initials}</div>
        <span class="status-badge">${emp.status}</span>
      </div>
      <h4>${emp.name}</h4>
      <p class="employee-role">${emp.position}</p>
      <div class="employee-card-footer">
        <span class="dept-badge">${emp.dept}</span>
        <div class="score-badge"><i class="fa-solid fa-star"></i><span>${emp.score}%</span></div>
      </div>
    </div>
  `,
    )
    .join("");

  document.querySelectorAll(".employee-card").forEach((card) => {
    const id = parseInt(card.dataset.employeeId, 10);
    card.onclick = () => openEmployeeProfile(id);
  });
}

async function openEmployeeProfile(empId) {
  try {
    const emp = await fetchEmployeeById(empId);
    const overlay = document.getElementById("employeeProfileOverlay");
    const body = document.getElementById("empModalBody");
    const title = document.getElementById("empModalTitle");
    title.textContent = emp.name;
    body.innerHTML = `
      <div style="display:flex; gap:1.25rem">
        <div style="width:5rem;height:5rem;border-radius:9999px;display:flex;align-items:center;justify-content:center;color:white;font-weight:700;background:${emp.color}">${emp.initials}</div>
        <div><h4>${emp.name}</h4><p>${emp.position}</p><span>${emp.dept}</span></div>
      </div>
      <p>Score: ${emp.score}/100</p>
      <p>Salary: ${emp.formattedSalary || toRand(emp.salary)}</p>
      <p>${emp.contact}</p>
      <p>${emp.history}</p>
    `;
    overlay.style.display = "flex";
  } catch {
    showToast("Employee not found", "error");
  }
}

function closeEmployeeProfile() {
  document.getElementById("employeeProfileOverlay").style.display = "none";
}

// --- INIT ---
function initEmployeeSearch() {
  const search = document.getElementById("employeeSearch");
  if (!search) return;
  search.addEventListener("input", async (e) => {
    const data = await fetchEmployees({ search: e.target.value });
    renderEmployeeGrid(data);
  });
}

async function loadInitialGrid() {
  const data = await fetchEmployees();
  renderEmployeeGrid(data);
}

document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("employeeGrid")) {
    loadInitialGrid();
    initEmployeeSearch();
    // your filterBtn, addEmployeeBtn etc call fetchEmployees too
  }
});
