// ============================================
// dashboard.js - CHAD_DEV (Full Backend Sync + Recent Activity)
// ============================================
import { API_BASE, showNotification, toRand } from './main.js';

document.addEventListener('DOMContentLoaded', () => {
    console.log("[Dashboard] Initializing and fetching data...");

    // --- 1. DOM References ---

    // Attendance / Rating stat card
    const attendancePercentValue = document.getElementById('attendancePercentValue');
    const attendanceBarFill = document.getElementById('attendanceBarFill');
    const presentPercentText = document.getElementById('presentPercentText');
    const absentPercentText = document.getElementById('absentPercentText');
    const avgRatingValue = document.getElementById('avgRatingValue');
    const avgRatingStars = document.getElementById('avgRatingStars');

    // Donut Chart Elements
    const donutSegments = document.querySelectorAll('.donut-segment');
    const donutInfoCard = document.getElementById('donutInfoCard');
    const donutDeptName = document.getElementById('donutDeptName');
    const donutDeptPercent = document.getElementById('donutDeptPercent');
    const donutDeptRole = document.getElementById('donutDeptRole');
    const deptItems = document.querySelectorAll('.dept-item');

    // Summary Card Elements
    const employeeCount = document.getElementById('employeeCount');
    const leaveCount = document.getElementById('leaveCount');
    const payrollValue = document.getElementById('payrollValue');
    const openRequestCount = document.getElementById('openRequestCount');
    const recentActivityList = document.getElementById('recentActivityList');

    // --- 2. UI HELPER: Build star icons for a rating out of 5 ---
    function buildStarIcons(rating) {
        const r = parseFloat(rating) || 0;
        let html = '';
        for (let i = 1; i <= 5; i++) {
            if (r >= i) {
                html += '<i class="bi bi-star-fill"></i>';
            } else if (r >= i - 0.5) {
                html += '<i class="bi bi-star-half"></i>';
            } else {
                html += '<i class="bi bi-star empty"></i>';
            }
        }
        return html;
    }

    // --- 3. UI HELPER: Render attendance rate ---
    function renderAttendanceStats(stats) {
        const present = Number(stats?.present_percent) || 0;
        const absent = Number(stats?.absent_percent) || 0;

        if (attendancePercentValue) attendancePercentValue.textContent = `${present}%`;
        if (attendanceBarFill) attendanceBarFill.style.width = `${present}%`;
        if (presentPercentText) presentPercentText.textContent = `${present}%`;
        if (absentPercentText) absentPercentText.textContent = `${absent}%`;
    }

    // --- 4. UI HELPER: Render average review rating ---
    function renderAverageRating(data) {
        const avg = data?.average ?? '0.0';
        if (avgRatingValue) avgRatingValue.textContent = avg;
        if (avgRatingStars) avgRatingStars.innerHTML = buildStarIcons(avg);
    }

    // --- 5. UI HELPER: Donut Chart Hover ---
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

    // --- 6. MAIN FETCH: Get Data from Backend ---
    async function loadDashboardData() {
        const token = localStorage.getItem('token');
        const headers = {};
        if (token && token !== 'undefined' && token !== 'null') {
            headers['Authorization'] = `Bearer ${token}`;
        }

        try {
            // Fetch Stats
            const response = await fetch(`${API_BASE}/api/dashboard/stats`, { headers });
            if (!response.ok) {
                if (response.status === 401) {
                    showNotification("Session expired. Please log in again.", "error");
                    setTimeout(() => window.location.href = 'index.html', 1500);
                    return;
                }
                throw new Error(`Server returned ${response.status}`);
            }
            const data = await response.json();

            if (employeeCount) employeeCount.textContent = data.totalEmployees || 0;
            if (leaveCount) leaveCount.textContent = data.approvedLeave || 0;
            if (payrollValue) payrollValue.textContent = toRand(data.payrollCycle || 0);
            if (openRequestCount) openRequestCount.textContent = data.openRequests || 0;

            console.log("[Dashboard] Stats loaded successfully:", data);
        } catch (error) {
            console.error("[Dashboard] Error fetching stats:", error);
            if (employeeCount) employeeCount.textContent = '--';
            if (leaveCount) leaveCount.textContent = '--';
            if (payrollValue) payrollValue.textContent = 'R--';
            if (openRequestCount) openRequestCount.textContent = '--';
            showNotification('Failed to load dashboard statistics.', 'error');
        }

        // --- Fetch Attendance Rate ---
        try {
            const attendanceResponse = await fetch(`${API_BASE}/api/attendance/stats`, { headers });
            if (attendanceResponse.ok) {
                const attendanceStats = await attendanceResponse.json();
                renderAttendanceStats(attendanceStats);
            } else {
                throw new Error("Failed to load attendance stats");
            }
        } catch (err) {
            console.warn("Could not load attendance stats", err);
            if (attendancePercentValue) attendancePercentValue.textContent = '--%';
            if (presentPercentText) presentPercentText.textContent = '--%';
            if (absentPercentText) absentPercentText.textContent = '--%';
        }

        // --- Fetch Average Review Rating ---
        try {
            const ratingResponse = await fetch(`${API_BASE}/api/reviews/average`, { headers });
            if (ratingResponse.ok) {
                const ratingData = await ratingResponse.json();
                renderAverageRating(ratingData);
            } else {
                throw new Error("Failed to load average rating");
            }
        } catch (err) {
            console.warn("Could not load average rating", err);
            if (avgRatingValue) avgRatingValue.textContent = '--';
            if (avgRatingStars) avgRatingStars.innerHTML = buildStarIcons(0);
        }

        // --- Fetch Recent Activity (Time Off Requests) ---
        try {
            const activityResponse = await fetch(`${API_BASE}/api/dashboard/recent-activity`, { headers });
            if (activityResponse.ok) {
                const activities = await activityResponse.json();
                renderRecentActivity(activities);
            } else {
                throw new Error("Failed to load activity");
            }
        } catch (err) {
            console.warn("Could not load recent activity", err);
            if (recentActivityList) {
                recentActivityList.innerHTML = `<div style="padding: 1rem; text-align: center; color: #94a3b8;">No recent requests</div>`;
            }
        }
    }

    // --- 7. Render Recent Activity List ---
    function renderRecentActivity(activities) {
        if (!recentActivityList) return;

        if (!activities || activities.length === 0) {
            recentActivityList.innerHTML = `<div style="padding: 1rem; text-align: center; color: #94a3b8;">No recent requests</div>`;
            return;
        }

        recentActivityList.innerHTML = activities.map((item, index) => {
            const initials = item.employee_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
            const statusClass = item.status.toLowerCase() === 'approved' ? 'badge-approved'
                : item.status.toLowerCase() === 'rejected' ? 'badge-rejected'
                : 'badge-pending';
            const avatarClass = ['avatar-purple', 'avatar-orange', 'avatar-red', 'avatar-lightgreen'][index % 4];

            return `
                <div class="request-item">
                    <div class="request-profile">
                        <div class="avatar ${avatarClass}">${initials}</div>
                        <div class="request-details">
                            <span class="employee-name">${item.employee_name}</span>
                            <span class="request-meta">${item.leave_type} • ${new Date(item.start_date).toLocaleDateString('en-ZA')}</span>
                        </div>
                    </div>
                    <span class="badge ${statusClass}">${item.status}</span>
                </div>
            `;
        }).join('');
    }

    // --- 8. RUN ---
    loadDashboardData();
});