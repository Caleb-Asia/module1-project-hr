// ============================================
// attendance.js - CALEB_DEV (Bootstrap Icons & Polish)
// ============================================
import { API_BASE, showNotification } from './main.js';

if (window.location.pathname.toLowerCase().includes('attendance')) {

    const attendanceSection = document.getElementById("attendance-data");
    const visualsSection = document.getElementById("attendance-visuals");

    // --- 1. LOAD DATA FUNCTIONS ---
    async function loadAttendanceData() {
        if (!attendanceSection) return;

        try {
            attendanceSection.innerHTML = `<div style="padding: 2rem; text-align: center; color: #94a3b8;">⏳ Loading attendance data...</div>`;

            // No-Cache fetch
            const response = await fetch(`${API_BASE}/api/attendance?_t=${Date.now()}`);
            
            if (!response.ok) {
                throw new Error(`Backend returned status: ${response.status}`);
            }
            
            const records = await response.json();

            // 🎨 NEW: Empty state with a nice icon and card
            if (!records || records.length === 0) {
                attendanceSection.innerHTML = `
                    <div style="padding: 4rem 2rem; text-align: center; background: #1a2332; border-radius: 1.5rem; border: 1px solid #1e293b; margin-top: 2rem;">
                        <div style="font-size: 4rem; margin-bottom: 1rem;">📭</div>
                        <h3 style="color: #f8fafc; margin: 0;">No records found</h3>
                        <p style="color: #94a3b8; margin-top: 0.5rem;">Click "New Record" to add the first attendance entry.</p>
                    </div>
                `;
                return;
            }

            await loadAttendanceStats();
            const table = createGroupedAttendanceTable(records);
            attendanceSection.innerHTML = "";
            attendanceSection.appendChild(table);
            console.log(`✅ Attendance data loaded from DB: ${records.length} records`);
            
        } catch (error) {
            console.error("❌ Backend connection failed:", error);
            attendanceSection.innerHTML = `<div style="padding: 2rem; text-align: center; color: #ef4444;">⚠️ Cannot connect to backend. Please ensure node server is running.</div>`;
        }
    }

    async function loadAttendanceStats() {
        if (!visualsSection) return;
        
        try {
            const response = await fetch(`${API_BASE}/api/attendance/stats`);
            const data = await response.json();

            // 🎨 UPDATED: Bootstrap Icons instead of emojis
            visualsSection.innerHTML = `
                <div class="visuals-header" style="background: rgba(255, 255, 255, 0.04); border-radius: 1.5rem; padding: 1.2rem 1.3rem; border: 1px solid rgba(255, 255, 255, 0.08); margin-bottom: 1rem;">
                    <h2 style="color: #f8fafc; font-size: 1.25rem; margin-bottom: 0.5rem;">📊 Attendance Overview</h2>
                    <p style="color: #94a3b8;">Live summary of presence and attendance trends</p>
                </div>
                <div class="visual-grid" style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 1rem;">
                    <div class="visual-card" style="background: #0f172a; border-radius: 1.5rem; padding: 1.35rem; border: 1px solid #1e293b;">
                        <h3 style="color: #94a3b8; font-size: 0.9rem; display: flex; align-items: center; gap: 0.4rem;">
                            <i class="bi bi-check-circle-fill" style="color: #10b981;"></i> Present
                        </h3>
                        <div class="stat-value" style="font-size: 2rem; font-weight: 800; color: #10b981;">${data.present_percent}%</div>
                        <div class="stat-caption" style="color: #64748b;">${data.present_percent}% of total</div>
                    </div>
                    <div class="visual-card" style="background: #0f172a; border-radius: 1.5rem; padding: 1.35rem; border: 1px solid #1e293b;">
                        <h3 style="color: #94a3b8; font-size: 0.9rem; display: flex; align-items: center; gap: 0.4rem;">
                            <i class="bi bi-x-circle-fill" style="color: #ef4444;"></i> Absent
                        </h3>
                        <div class="stat-value" style="font-size: 2rem; font-weight: 800; color: #ef4444;">${data.absent_percent}%</div>
                        <div class="stat-caption" style="color: #64748b;">${data.absent_percent}% of total</div>
                    </div>
                    <div class="visual-card" style="background: #0f172a; border-radius: 1.5rem; padding: 1.35rem; border: 1px solid #1e293b;">
                        <h3 style="color: #94a3b8; font-size: 0.9rem; display: flex; align-items: center; gap: 0.4rem;">
                            <i class="bi bi-database-fill" style="color: #6366f1;"></i> Total Records
                        </h3>
                        <div class="stat-value" style="font-size: 2rem; font-weight: 800; color: #6366f1;">${data.total_checks}</div>
                        <div class="stat-caption" style="color: #64748b;">Database check-ins</div>
                    </div>
                </div>
            `;
        } catch (error) {
            console.error("Failed to load stats:", error);
        }
    }

    // --- 2. TABLE GENERATION ---
    function createGroupedAttendanceTable(records) {
        const table = document.createElement("table");
        table.className = "attendance-table";
        table.style.cssText = `width: 100%; border-collapse: collapse; background: #0f172a; color: #e2e8f0; border-radius: 12px; overflow: hidden;`;

        table.innerHTML = `
            <thead>
                <tr style="background: #0a0f1a; border-bottom: 2px solid #1e293b;">
                    <th style="padding: 14px 16px; text-align: left; color: #94a3b8; text-transform: uppercase; font-size: 0.8rem;">Employee</th>
                    <th style="padding: 14px 16px; text-align: left; color: #94a3b8; text-transform: uppercase; font-size: 0.8rem;">Attendance History</th>
                    <th style="padding: 14px 16px; text-align: left; color: #94a3b8; text-transform: uppercase; font-size: 0.8rem;">Department</th>
                </tr>
            </thead>
            <tbody></tbody>
        `;

        const tbody = table.querySelector("tbody");

        if (!records?.length) {
            tbody.innerHTML = `<tr><td colspan="3" style="padding: 40px; text-align: center; color: #94a3b8;">No attendance records found.</td></tr>`;
            return table;
        }

        const groupedData = {};
        records.forEach(record => {
            const id = record.employee_id || record.employeeId; 
            if (!groupedData[id]) {
                groupedData[id] = {
                    employee_id: id,
                    first_name: record.first_name,
                    last_name: record.last_name,
                    department: record.department || 'General',
                    attendance_dates: []
                };
            }
            groupedData[id].attendance_dates.push({
                date: record.attendance_date,
                status: record.status
            });
        });

        const groupedArray = Object.values(groupedData);

        groupedArray.forEach((employee, index) => {
            const bgColor = index % 2 === 0 ? "#0f172a" : "#1a2332";
            const fullName = `${employee.first_name} ${employee.last_name}`;

            let historyHtml = '';
            employee.attendance_dates.sort((a, b) => new Date(b.date) - new Date(a.date));
            const limitedDates = employee.attendance_dates.slice(0, 10);

            limitedDates.forEach(item => {
                const isPresent = item.status.toLowerCase() === 'present';
                const color = isPresent ? '#10b981' : '#ef4444';
                const bg = isPresent ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)';
                const border = isPresent ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)';
                
                const cleanDate = item.date.split('T')[0];
                
                historyHtml += `
                    <button class="attendance-badge-btn" 
                            data-emp-id="${employee.employee_id}" 
                            data-date="${cleanDate}" 
                            style="display: inline-flex; align-items: center; gap: 4px; padding: 4px 10px; margin: 3px; border-radius: 999px; font-size: 0.75rem; font-weight: 600; background: ${bg}; color: ${color}; border: 1px solid ${border}; cursor: pointer; transition: all 0.2s;">
                        ${cleanDate} • ${item.status}
                        <i class="bi bi-trash" style="font-size: 0.8rem; opacity: 0.8; transition: all 0.2s;"></i>
                    </button>
                `;
            });

            if (employee.attendance_dates.length > 10) {
                historyHtml += `<span style="color: #94a3b8; font-size: 0.75rem; margin-left: 4px;">+${employee.attendance_dates.length - 10} more</span>`;
            }

            const row = document.createElement("tr");
            row.style.cssText = `background: ${bgColor}; border-bottom: 1px solid #1e293b;`;

            row.innerHTML = `
                <td style="padding: 14px 16px; font-weight: 600; color: #f1f5f9; vertical-align: middle;">
                    ${fullName}
                </td>
                <td style="padding: 14px 16px; vertical-align: middle;">
                    ${historyHtml}
                </td>
                <td style="padding: 14px 16px; color: #94a3b8; vertical-align: middle; font-size: 0.9rem;">
                    ${employee.department}
                </td>
            `;
            tbody.appendChild(row);
        });

        // --- DELETE BUTTON LOGIC ---
        tbody.querySelectorAll('.attendance-badge-btn').forEach(btn => {
            btn.addEventListener('click', async function(e) {
                e.stopPropagation(); 
                const empId = this.dataset.empId;
                const dateToDelete = this.dataset.date.split('T')[0]; 
                const empName = this.closest('tr').querySelector('td:first-child').innerText.trim();

                if (!confirm(`Are you sure you want to delete the attendance record for ${empName} on ${dateToDelete}?`)) {
                    return;
                }

                try {
                    const encodedDate = encodeURIComponent(dateToDelete);
                    const response = await fetch(`${API_BASE}/api/attendance/${empId}/${encodedDate}`, {
                        method: 'DELETE'
                    });

                    if (!response.ok) {
                        const errData = await response.json();
                        throw new Error(errData.error || "Failed to delete record");
                    }

                    showNotification(`Deleted record for ${empName} on ${dateToDelete}`, 'success');
                    loadAttendanceData();

                } catch (error) {
                    console.error("Delete error:", error);
                    showNotification(`Error: ${error.message}`, 'error');
                }
            });

            btn.addEventListener('mouseenter', function() {
                this.style.transform = 'scale(1.05)';
                this.style.boxShadow = '0 0 10px rgba(255,255,255,0.2)';
                const icon = this.querySelector('.bi-trash');
                if (icon) {
                    icon.style.opacity = '1';
                    icon.style.color = '#ef4444';
                }
            });
            btn.addEventListener('mouseleave', function() {
                this.style.transform = 'scale(1)';
                this.style.boxShadow = 'none';
                const icon = this.querySelector('.bi-trash');
                if (icon) {
                    icon.style.opacity = '0.8';
                    icon.style.color = 'inherit';
                }
            });
        });

        return table;
    }

    // --- 3. MODAL FORM ---
    function openAttendanceModal() {
        const existing = document.getElementById('customModal');
        if (existing) existing.remove();

        const modal = document.createElement('div');
        modal.id = 'customModal';
        modal.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0, 0, 0, 0.7); backdrop-filter: blur(4px);
            display: flex; align-items: center; justify-content: center;
            z-index: 9999; animation: fadeIn 0.3s ease;
        `;

        modal.innerHTML = `
            <div style="background: #0f172a; border: 1px solid #1e293b; border-radius: 1.5rem; padding: 2rem; max-width: 450px; width: 90%; box-shadow: 0 30px 80px rgba(0,0,0,0.6); animation: slideDown 0.3s ease;">
                <h2 style="color: #f8fafc; margin-top: 0; margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.5rem;">
                    <i class="bi bi-clock-history" style="color: #6366f1;"></i> New Attendance Record
                </h2>
                
                <div style="margin-bottom: 1rem;">
                    <label style="display: block; color: #94a3b8; font-size: 0.85rem; margin-bottom: 0.3rem;">Employee ID (1-10)</label>
                    <input type="number" id="modalEmpId" min="1" max="10" style="width: 100%; padding: 0.75rem; border: 1px solid #1e293b; border-radius: 0.75rem; background: #1a2332; color: #f8fafc; font-size: 1rem; box-sizing: border-box;">
                </div>

                <div style="margin-bottom: 1rem;">
                    <label style="display: block; color: #94a3b8; font-size: 0.85rem; margin-bottom: 0.3rem;">Date</label>
                    <input type="date" id="modalDate" style="width: 100%; padding: 0.75rem; border: 1px solid #1e293b; border-radius: 0.75rem; background: #1a2332; color: #f8fafc; font-size: 1rem; box-sizing: border-box;">
                </div>

                <div style="margin-bottom: 1.5rem;">
                    <label style="display: block; color: #94a3b8; font-size: 0.85rem; margin-bottom: 0.3rem;">Status</label>
                    <select id="modalStatus" style="width: 100%; padding: 0.75rem; border: 1px solid #1e293b; border-radius: 0.75rem; background: #1a2332; color: #f8fafc; font-size: 1rem; box-sizing: border-box;">
                        <option value="Present">Present</option>
                        <option value="Absent">Absent</option>
                    </select>
                </div>

                <div style="display: flex; gap: 1rem;">
                    <button id="modalSubmitBtn" style="flex: 1; padding: 0.75rem; border: none; border-radius: 0.75rem; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; font-weight: 600; cursor: pointer; font-size: 1rem; transition: all 0.2s ease; box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);" onmouseover="this.style.transform='scale(1.02)'; this.style.boxShadow='0 6px 25px rgba(99,102,241,0.5)';" onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 4px 15px rgba(99,102,241,0.3)';">Add Record</button>
                    <button id="modalCancelBtn" style="flex: 1; padding: 0.75rem; border: 1px solid #1e293b; border-radius: 0.75rem; background: transparent; color: #94a3b8; font-weight: 600; cursor: pointer; font-size: 1rem; transition: all 0.2s;" onmouseover="this.style.backgroundColor='#1e293b';" onmouseout="this.style.backgroundColor='transparent';">Cancel</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        modal.querySelector('#modalSubmitBtn').addEventListener('click', async () => {
            const empId = modal.querySelector('#modalEmpId').value;
            const date = modal.querySelector('#modalDate').value;
            const status = modal.querySelector('#modalStatus').value;

            if (!empId || isNaN(empId)) {
                showNotification("Please enter a valid Employee ID (1-10).", "error");
                return;
            }
            if (!date) {
                showNotification("Please select a date.", "error");
                return;
            }

            try {
                const response = await fetch(`${API_BASE}/api/attendance`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ employee_id: parseInt(empId), date, status })
                });

                const data = await response.json();
                if (data.error) {
                    showNotification(`Error: ${data.error}`, 'error');
                } else {
                    modal.remove();
                    showNotification(`Attendance added for Employee ${empId}!`, 'success');
                    loadAttendanceData();
                }
            } catch (error) {
                showNotification(`Failed to connect to backend`, 'error');
                console.error(error);
            }
        });

        modal.querySelector('#modalCancelBtn').addEventListener('click', () => modal.remove());
        modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
    }

    // --- 4. BUTTON INIT ---
    function initAttendanceButtons() {
        const newRecordBtn = document.getElementById('newRecordBtn');
        if (newRecordBtn) {
            newRecordBtn.addEventListener('click', (e) => {
                e.preventDefault();
                openAttendanceModal();
            });
        }
    }

    document.addEventListener("DOMContentLoaded", () => {
        loadAttendanceData();
        initAttendanceButtons();
    });
}