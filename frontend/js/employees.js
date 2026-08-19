// ============================================
// employees.js - BUTSHA_DEV (Connected to Backend)
// ============================================
import { API_BASE, toRand, showNotification } from './main.js';

document.addEventListener('DOMContentLoaded', () => {
    console.log("[Employees] Initializing and fetching data...");

    // --- DOM References ---
    const employeeGrid = document.getElementById('employeeGrid');
    const searchBar = document.getElementById('employeeSearch');
    const filterBtn = document.getElementById('filterBtn');
    const addBtn = document.getElementById('addEmployeeBtn');

    // Modals
    const overlay = document.getElementById('employeeProfileOverlay');
    const modalBody = document.getElementById('empModalBody');
    const modalTitle = document.getElementById('empModalTitle');

    // --- Helper: Get JWT Token ---
    function getAuthHeaders() {
        const token = localStorage.getItem('token');
        const headers = { 'Content-Type': 'application/json' };
        if (token && token !== 'undefined' && token !== 'null') {
            headers['Authorization'] = `Bearer ${token}`;
        }
        return headers;
    }

    // --- 1. FETCH EMPLOYEES ---
    async function loadEmployees() {
        try {
            const response = await fetch(`${API_BASE}/api/employees`, {
                headers: getAuthHeaders()
            });

            if (!response.ok) {
                if (response.status === 401) {
                    showNotification("Session expired. Please log in again.", "error");
                    setTimeout(() => window.location.href = 'index.html', 1500);
                    return;
                }
                throw new Error(`Server returned ${response.status}`);
            }

            const employees = await response.json();
            renderEmployeeGrid(employees);
            window._allEmployees = employees; // Cache for filtering

        } catch (error) {
            console.error("[Employees] Error fetching data:", error);
            if (employeeGrid) {
                employeeGrid.innerHTML = `<div style="padding: 2rem; text-align: center; color: #ef4444;">Failed to load employees.</div>`;
            }
            showNotification('Failed to load employees.', 'error');
        }
    }

    // --- 2. RENDER GRID ---
    function renderEmployeeGrid(empList) {
        if (!employeeGrid) return;
        
        if (!empList || empList.length === 0) {
            employeeGrid.innerHTML = `<div style="padding: 2rem; text-align: center; color: #94a3b8;">No employees found.</div>`;
            return;
        }

        const avatarColors = ["#3B82F6", "#EF4444", "#10B981", "#F59E0B", "#8B5CF6", "#EC4899", "#06B6D4", "#F97316", "#84CC16", "#6366F1"];

        employeeGrid.innerHTML = empList.map((emp, index) => {
            // ✅ FIX: Use emp.name directly from the database
            const fullName = emp.name || 'Unknown';
            const initials = fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
            const color = avatarColors[(emp.id - 1) % avatarColors.length];
            const employeeScore = emp.score || 85; // Use the score from DB or default to 85

            return `
                <div class="employee-card" data-employee-id="${emp.id}" role="button" tabindex="0">
                    <div class="employee-card-top">
                        <div class="employee-avatar" style="background: ${color}">${initials}</div>
                        <span class="status-badge">${emp.status || 'Active'}</span>
                    </div>
                    <h4>${fullName}</h4>
                    <p class="employee-role">${emp.position || 'Employee'}</p>
                    <div class="employee-card-footer">
                        <span class="dept-badge">${emp.department || 'General'}</span>
                        <div class="score-badge">
                            <i class="fa-solid fa-star"></i>
                            <span>${employeeScore}%</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        // Attach click events to cards
        employeeGrid.querySelectorAll('.employee-card').forEach(card => {
            card.addEventListener('click', () => {
                const id = parseInt(card.dataset.employeeId);
                openEmployeeProfile(id);
            });
        });
    }

    // --- 3. OPEN PROFILE MODAL ---
    async function openEmployeeProfile(id) {
        try {
            const response = await fetch(`${API_BASE}/api/employees/${id}`, {
                headers: getAuthHeaders()
            });
            if (!response.ok) throw new Error("Failed to fetch employee details");
            
            const emp = await response.json();
            // ✅ FIX: Use emp.name
            const fullName = emp.name || 'Unknown';

            if (!overlay || !modalBody || !modalTitle) return;
            
            modalTitle.textContent = fullName;
            modalBody.innerHTML = `
                <div style="display: flex; flex-direction: column; gap: 1rem; padding: 1rem 0;">
                    <p><strong>Position:</strong> ${emp.position || 'N/A'}</p>
                    <p><strong>Department:</strong> ${emp.department || 'N/A'}</p>
                    <p><strong>Salary:</strong> ${toRand(emp.salary || 0)}</p>
                    <p><strong>Contact:</strong> ${emp.email || 'N/A'}</p>
                    <p><strong>History:</strong> ${emp.history || 'No history available.'}</p>
                </div>
            `;
            overlay.style.display = 'flex';
            document.body.style.overflow = 'hidden';

        } catch (error) {
            console.error("Error fetching employee details:", error);
            showNotification('Failed to load employee profile.', 'error');
        }
    }

    // Close Modal Helper
    function closeEmployeeProfile() {
        if (overlay) {
            overlay.style.display = 'none';
            document.body.style.overflow = '';
        }
    }

    // --- 4. SEARCH & FILTER ---
    if (searchBar) {
        searchBar.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            if (!query || !window._allEmployees) return renderEmployeeGrid(window._allEmployees);
            
            const filtered = window._allEmployees.filter(emp => {
                const fullName = emp.name || '';
                return fullName.toLowerCase().includes(query) || 
                       (emp.position || '').toLowerCase().includes(query) ||
                       (emp.department || '').toLowerCase().includes(query);
            });
            renderEmployeeGrid(filtered);
        });
    }

    // --- 5. CLOSE MODAL EVENTS ---
    const closeBtn = document.getElementById('closeEmployeeModalBtn');
    if (closeBtn) closeBtn.addEventListener('click', closeEmployeeProfile);
    if (overlay) {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeEmployeeProfile();
        });
    }

    // --- 6. ADD EMPLOYEE (Basic Setup) ---
    if (addBtn) {
        addBtn.addEventListener('click', () => {
            showNotification("Add Employee feature coming soon!", "info");
        });
    }

    // --- 7. INITIAL LOAD ---
    loadEmployees();
});