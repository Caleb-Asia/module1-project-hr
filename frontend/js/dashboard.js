// ============================================
// dashboard.js - CHAD_DEV (Full Backend Sync + Recent Activity)
// ============================================
import { API_BASE, showNotification, toRand } from './main.js';

document.addEventListener('DOMContentLoaded', () => {
    console.log("[Dashboard] Initializing and fetching data...");

    // --- 1. DOM References ---
    const trendSvg = document.querySelector('.trend-svg');
    const chartTooltip = document.querySelector('.chart-tooltip');
    const trendDots = document.querySelectorAll('.trend-dot');

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

    // --- 2. UI HELPER: Fully dynamic chart renderer ---
    // Rebuilds gridlines, axis labels, the trend line, point labels and
    // dots from the actual data range every time. The old version kept
    // the axis hardcoded to the mockup values (80-160) while plotting a
    // different field, so any real data outside that fixed range (or on
    // a different scale, e.g. "new hires" vs "total headcount") got
    // clamped and rendered off the line. This version never assumes the
    // data matches a fixed range.
    function renderGrowthTrend(data) {
        if (!trendSvg || !data || data.length === 0) return;

        const startX = 60;
        const endX = 460;
        const yTop = 20;
        const yBottom = 180;
        const spacing = data.length > 1 ? (endX - startX) / (data.length - 1) : 0;

        const values = data.map(d => Number(d.new_employees) || 0);
        let axisMin = Math.min(...values);
        let axisMax = Math.max(...values);

        // Add headroom so the line/dots never sit exactly on the edge,
        // and guard against a flat line (min === max).
        const padding = axisMax === axisMin ? Math.max(axisMax * 0.1, 5) : (axisMax - axisMin) * 0.15;
        axisMin = Math.floor(axisMin - padding);
        axisMax = Math.ceil(axisMax + padding);
        if (axisMin < 0 && Math.min(...values) >= 0) axisMin = 0;

        const scaleY = (value) => {
            const ratio = (value - axisMin) / (axisMax - axisMin);
            return yBottom - (ratio * (yBottom - yTop));
        };

        // --- Redraw gridlines + axis labels for the real range ---
        trendSvg.querySelectorAll('.grid-line, .axis-text:not(.text-center)').forEach(el => el.remove());
        const steps = 4;
        for (let i = 0; i <= steps; i++) {
            const value = axisMin + ((axisMax - axisMin) * (i / steps));
            const y = scaleY(value);

            const gridLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            gridLine.setAttribute('class', 'grid-line');
            gridLine.setAttribute('x1', startX - 20);
            gridLine.setAttribute('y1', y);
            gridLine.setAttribute('x2', endX + 20);
            gridLine.setAttribute('y2', y);
            trendSvg.insertBefore(gridLine, trendSvg.firstChild);

            const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            label.setAttribute('class', 'axis-text');
            label.setAttribute('x', startX - 45);
            label.setAttribute('y', y + 4);
            label.textContent = Math.round(value);
            trendSvg.insertBefore(label, trendSvg.firstChild.nextSibling);
        }

        // --- Redraw the line path + point labels + dots ---
        trendSvg.querySelectorAll('.trend-line, .point-value, .trend-dot').forEach(el => el.remove());

        const points = data.map((item, index) => ({
            x: startX + (index * spacing),
            y: scaleY(Number(item.new_employees) || 0),
            value: item.new_employees,
            month: item.month
        }));

        const linePath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        linePath.setAttribute('class', 'trend-line');
        linePath.setAttribute('d', points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' '));
        trendSvg.appendChild(linePath);

        points.forEach((p) => {
            const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            label.setAttribute('class', 'point-value');
            label.setAttribute('x', p.x);
            label.setAttribute('y', p.y - 12);
            label.textContent = p.value;
            trendSvg.appendChild(label);

            const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            dot.setAttribute('cx', p.x);
            dot.setAttribute('cy', p.y);
            dot.setAttribute('r', '5');
            dot.setAttribute('fill', '#131a2c');
            dot.setAttribute('stroke', '#6366f1');
            dot.setAttribute('stroke-width', '3');
            dot.classList.add('trend-dot');
            dot.setAttribute('data-value', p.value);

            const date = new Date(p.month + '-01');
            const monthName = date.toLocaleString('default', { month: 'short' });
            dot.setAttribute('data-month', monthName);

            dot.addEventListener('mouseenter', () => {
                trendSvg.querySelectorAll('.trend-dot').forEach(d => d.classList.remove('is-active'));
                dot.classList.add('is-active');

                const cx = dot.getAttribute('cx');
                const headcount = dot.getAttribute('data-value');
                const month = dot.getAttribute('data-month');

                const hoverGuide = trendSvg.querySelector('.hover-guide');
                if (hoverGuide) {
                    hoverGuide.setAttribute('x1', cx);
                    hoverGuide.setAttribute('x2', cx);
                    hoverGuide.setAttribute('y1', String(yTop));
                    hoverGuide.setAttribute('y2', String(yBottom));
                    hoverGuide.style.opacity = '1';
                }

                chartTooltip.innerHTML = `<strong>${month}</strong><br>Headcount: ${headcount}`;
                chartTooltip.classList.add('visible');

                const rect = trendSvg.getBoundingClientRect();
                const dotRect = dot.getBoundingClientRect();
                chartTooltip.style.left = `${dotRect.left - rect.left + 15}px`;
                chartTooltip.style.top = `${dotRect.top - rect.top - 45}px`;
            });

            dot.addEventListener('mouseleave', () => {
                const hoverGuide = trendSvg.querySelector('.hover-guide');
                if (hoverGuide) hoverGuide.style.opacity = '0';
                chartTooltip.classList.remove('visible');
                dot.classList.remove('is-active');
            });

            trendSvg.appendChild(dot);
        });
    }

    // --- 3. UI HELPER: Donut Chart Hover ---
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

    // --- 4. MAIN FETCH: Get Data from Backend ---
    async function loadDashboardData() {
        try {
            const token = localStorage.getItem('token');
            const headers = {};
            if (token && token !== 'undefined' && token !== 'null') {
                headers['Authorization'] = `Bearer ${token}`;
            }

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

            renderGrowthTrend(data.growthTrend);
            console.log("[Dashboard] Stats loaded successfully:", data);

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

        } catch (error) {
            console.error("[Dashboard] Error fetching stats:", error);
            if (employeeCount) employeeCount.textContent = '--';
            if (leaveCount) leaveCount.textContent = '--';
            if (payrollValue) payrollValue.textContent = 'R--';
            if (openRequestCount) openRequestCount.textContent = '--';
            showNotification('Failed to load dashboard statistics.', 'error');
        }
    }

    // --- Render Recent Activity List ---
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

    // --- 5. RUN ---
    loadDashboardData();
});