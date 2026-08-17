import { API_URL, toRand, showToast, debounce } from "./config.js";

async function fetchEmployees({ search = "", dept = "", minScore = "" } = {}) {
  const params = new URLSearchParams({ search, dept, minScore });
  const res = await fetch(`${API_URL}/api/employees?${params}`);
  if (!res.ok) throw new Error("API error");
  return res.json();
}
async function fetchEmployeeById(id) {
  const res = await fetch(`${API_URL}/api/employees/${id}`);
  if (!res.ok) throw new Error("Not found");
  return res.json();
}

function renderEmployeeGrid(empList) {
  const grid = document.getElementById("employeeGrid");
  const empty = document.getElementById("employeeEmpty");
  if (!grid) return;
  if (empList.length === 0) {
    grid.innerHTML = "";
    empty.style.display = "block";
    return;
  }
  empty.style.display = "none";
  grid.innerHTML = empList
    .map(
      (emp) => `
    <div class="employee-card" data-employee-id="${emp.id}">
      <div class="employee-card-top">
        <div class="employee-avatar" style="background:${emp.color}">${emp.initials}</div>
        <span class="status-badge">${emp.status}</span>
      </div>
      <h4 style="margin:0.75rem 0 0;">${emp.name}</h4>
      <p class="employee-role">${emp.position}</p>
      <div class="employee-card-footer">
        <span class="dept-badge">${emp.dept}</span>
        <div class="score-badge"><i class="fa-solid fa-star"></i> ${emp.score}%</div>
      </div>
    </div>`,
    )
    .join("");

  document.querySelectorAll(".employee-card").forEach((card) => {
    const id = parseInt(card.dataset.employeeId, 10);
    card.addEventListener("click", () => openEmployeeProfile(id));
  });
}

async function openEmployeeProfile(empId) {
  try {
    const emp = await fetchEmployeeById(empId);
    const overlay = document.getElementById("employeeProfileOverlay");
    const body = document.getElementById("empModalBody");
    document.getElementById("empModalTitle").textContent = emp.name;
    body.innerHTML = `
      <div style="display:flex;gap:1rem;align-items:center;margin-bottom:1rem;">
        <div style="width:4rem;height:4rem;border-radius:9999px;display:flex;align-items:center;justify-content:center;color:white;font-weight:700;background:${emp.color}">${emp.initials}</div>
        <div><h4 style="margin:0;">${emp.name}</h4><p style="margin:0;color:#64748b;">${emp.position} • ${emp.dept}</p></div>
      </div>
      <p><strong>Score:</strong> ${emp.score}/100</p>
      <p><strong>Salary:</strong> ${emp.formattedSalary || toRand(emp.salary)}</p>
      <p><strong>Contact:</strong> ${emp.contact || "N/A"}</p>
      <p style="color:#64748b;font-size:0.9rem;">${emp.history || ""}</p>
      ${emp.recentAttendance ? `<hr><p><strong>Recent Attendance:</strong> ${emp.recentAttendance.length} records</p>` : ""}
    `;
    overlay.style.display = "flex";
  } catch {
    showToast("Employee not found", "error");
  }
}

function closeEmployeeProfile() {
  document.getElementById("employeeProfileOverlay").style.display = "none";
}

function init() {
  const search = document.getElementById("employeeSearch");
  if (search) {
    search.addEventListener(
      "input",
      debounce(async (e) => {
        try {
          const data = await fetchEmployees({ search: e.target.value });
          renderEmployeeGrid(data);
        } catch {
          showToast("Search failed", "error");
        }
      }, 350),
    );
  }
  document
    .getElementById("closeEmpModalBtn")
    ?.addEventListener("click", closeEmployeeProfile);
  document
    .getElementById("employeeProfileOverlay")
    ?.addEventListener("click", (e) => {
      if (e.target.id === "employeeProfileOverlay") closeEmployeeProfile();
    });
  fetchEmployees()
    .then(renderEmployeeGrid)
    .catch(() => showToast("Failed to load employees", "error"));
}

document.addEventListener("DOMContentLoaded", init);
