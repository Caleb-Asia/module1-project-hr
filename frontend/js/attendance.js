// ============================================
// attendance.js - CALEB_DEV (Trash Icon)
// ============================================
import { API_BASE, showNotification } from './main.js';

if (window.location.pathname.toLowerCase().includes('attendance')) {

    const attendanceSection = document.getElementById("attendance-data");
    const visualsSection = document.getElementById("attendance-visuals");

    async function loadAttendanceData() {
        if (!attendanceSection) return;

        try {
            attendanceSection.innerHTML = `<div style="padding: 2rem; text-align: center; color: #94a3b8;">⏳ Loading attendance data...</div>`;

            const response = await fetch(`${API_BASE}/api/attendance`);
            if (!response.ok) throw new Error("Failed to fetch attendance");
            
            const records = await response.json();

            await loadAttendanceStats();
            const table = createGroupedAttendanceTable(records);
            attendanceSection.innerHTML = "";
            attendanceSection.appendChild(table);
            console.log(`✅ Attendance data loaded: ${records.length} records`);
            
        } catch (error) {
            console.error("❌ Error loading attendance data:", error);
            attendanceSection.innerHTML = `<div style="padding: 2rem; text-align: center; color: #ef4444;">❌ Failed to load data.</div>`;
        }
    }

    async function loadAttendanceStats() {
        if (!visualsSection) return;
        
        try {
            const response = await fetch(`${API_BASE}/api/attendance/stats`);
            const data = await response.json();

            visualsSection.innerHTML = `
                <div class="visuals-header" style="background: rgba(255, 255, 255, 0.04); border-radius: 1.5rem; padding: 1.2rem 1.3rem; border: 1px solid rgba(255, 255, 255, 0.08); margin-bottom: 1rem;">
                    <h2 style="color: #f8fafc; font-size: 1.25rem; margin-bottom: 0.5rem;">📊 Attendance Overview</h2>
                    <p style="color: #94a3b8;">Live summary of presence and attendance trends</p>
                </div>
                <div class="visual-grid" style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 1rem;">
                    <div class="visual-card" style="background: #0f172a; border-radius: 1.5rem; padding: 1.35rem; border: 1px solid #1e293b;">
                        <h3 style="color: #94a3b8; font-size: 0.9rem;">✅ Present</h3>
                        <div class="stat-value" style="font-size: 2rem; font-weight: 800; color: #10b981;">${data.present_percent}%</div>
                        <div class="stat-caption" style="color: #64748b;">${data.present_percent}% of total</div>
                    </div>
                    <div class="visual-card" style="background: #0f172a; border-radius: 1.5rem; padding: 1.35rem; border: 1px solid #1e293b;">
                        <h3 style="color: #94a3b8; font-size: 0.9rem;">❌ Absent</h3>
                        <div class="stat-value" style="font-size: 2rem; font-weight: 800; color: #ef4444;">${data.absent_percent}%</div>
                        <div class="stat-caption" style="color: #64748b;">${data.absent_percent}% of total</div>
                    </div>
                    <div class="visual-card" style="background: #0f172a; border-radius: 1.5rem; padding: 1.35rem; border: 1px solid #1e293b;">
                        <h3 style="color: #94a3b8; font-size: 0.9rem;">📈 Total Records</h3>
                        <div class="stat-value" style="font-size: 2rem; font-weight: 800; color: #6366f1;">${data.total_checks}</div>
                        <div class="stat-caption" style="color: #64748b;">Database check-ins</div>
                    </div>
                </div>
            `;
        } catch (error) {
            console.error("Failed to load stats:", error);
        }
    }

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

        // Group the records
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

        // Render rows
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
                
                // We make the badge a clickable button with a TRASH ICON
                historyHtml += `
                    <button class="attendance-badge-btn" 
                            data-emp-id="${employee.employee_id}" 
                            data-date="${item.date}"
                            style="display: inline-flex; align-items: center; gap: 4px; padding: 4px 10px; margin: 3px; border-radius: 999px; font-size: 0.75rem; font-weight: 600; background: ${bg}; color: ${color}; border: 1px solid ${border}; cursor: pointer; transition: all 0.2s;">
                        ${new Date(item.date).toLocaleDateString('en-ZA')} • ${item.status}
                        <i class="bi bi-trash" style="font-size: 0.7rem; opacity: 0.6; transition: opacity 0.2s;"></i>
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

        // EVENT LISTENER: Handle clicking a specific date badge
        tbody.querySelectorAll('.attendance-badge-btn').forEach(btn => {
            btn.addEventListener('click', async function(e) {
                e.stopPropagation(); 
                const empId = this.dataset.empId;
                const dateToDelete = this.dataset.date;
                const empName = this.closest('tr').querySelector('td:first-child').innerText.trim();

                // 1. Confirmation
                if (!confirm(`Are you sure you want to delete the attendance record for ${empName} on ${new Date(dateToDelete).toLocaleDateString('en-ZA')}?`)) {
                    return;
                }

                // 2. Send DELETE request
                try {
                    const encodedDate = encodeURIComponent(dateToDelete);
                    const response = await fetch(`${API_BASE}/api/attendance/${empId}/${encodedDate}`, {
                        method: 'DELETE'
                    });

                    if (!response.ok) {
                        const errData = await response.json();
                        throw new Error(errData.error || "Failed to delete record");
                    }

                    // 3. Success
                    showNotification(`🗑️ Deleted record for ${empName} on ${new Date(dateToDelete).toLocaleDateString('en-ZA')}`, 'success');
                    loadAttendanceData();

                } catch (error) {
                    console.error("Delete error:", error);
                    showNotification(`❌ Error: ${error.message}`, 'error');
                }
            });

            // Hover effects
            btn.addEventListener('mouseenter', function() {
                this.style.transform = 'scale(1.05)';
                this.style.boxShadow = '0 0 10px rgba(255,255,255,0.2)';
                // Make the trash icon solid red on hover
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
                    icon.style.opacity = '0.6';
                    icon.style.color = 'inherit';
                }
            });
        });

        return table;
    }

    document.addEventListener("DOMContentLoaded", loadAttendanceData);
}