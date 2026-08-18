// ============================================
// dashboard.js - CHAD_DEV (Full Backend Sync)
// ============================================
import { API_BASE, showNotification, toRand } from './main.js';

document.addEventListener('DOMContentLoaded', () => {
    console.log("[Dashboard] Initializing and fetching data...");

    // --- 1. DOM References ---
    const trendSvg = document.querySelector('.trend-svg');
    const chartTooltip = document.querySelector('.chart-tooltip');
    const trendDots = document.querySelectorAll('.trend-dot'); // We will replace these dynamically

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

    // --- 2. UI HELPER: Update the Graph dynamically ---
    function renderGrowthTrend(data) {
        if (!trendSvg || !data || data.length === 0) return;

        const svgWidth = 600; // Approximate SVG width
        const startX = 50;
        const endX = 550;
        const spacing = (endX - startX) / (data.length - 1);

        // Clear existing dots inside the SVG or prepare to update
        const existingDots = trendSvg.querySelectorAll('.trend-dot');
        existingDots.forEach(d => d.remove());

        // Find max value for height scaling
        const maxValue = Math.max(...data.map(d => d.new_employees), 1);

        // Create dots and lines
        data.forEach((item, index) => {
            const x = startX + (index * spacing);
            // Scale y: We assume SVG height is ~180, dots sit between y=20 and y=150
            const y = 150 - ((item.new_employees / maxValue) * 120); 

            // 1. Create the Dot
            const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            dot.setAttribute('cx', x);
            dot.setAttribute('cy', y);
            dot.setAttribute('r', '6');
            dot.setAttribute('fill', '#6366f1');
            dot.setAttribute('stroke', '#0b0f19');
            dot.setAttribute('stroke-width', '3');
            dot.classList.add('trend-dot');
            dot.setAttribute('data-value', item.new_employees);
            
            // Format month from "2025-01" to "Jan"
            const date = new Date(item.month + '-01');
            const monthName = date.toLocaleString('default', { month: 'short' });
            dot.setAttribute('data-month', monthName);

            // 2. Attach Events to the new dot
            dot.addEventListener('mouseenter', (e) => {
                // Remove active class from all dots
                trendSvg.querySelectorAll('.trend-dot').forEach(d => d.classList.remove('is-active'));
                dot.classList.add('is-active');
                
                // Update Tooltip
                const cx = dot.getAttribute('cx');
                const headcount = dot.getAttribute('data-value');
                const month = dot.getAttribute('data-month');

                const hoverGuide = trendSvg.querySelector('.hover-guide');
                if (hoverGuide) {
                    hoverGuide.setAttribute('x1', cx);
                    hoverGuide.setAttribute('x2', cx);
                    hoverGuide.setAttribute('y1', '20');
                    hoverGuide.setAttribute('y2', '180');
                    hoverGuide.style.opacity = '1';
                }

                chartTooltip.innerHTML = `<strong>${month}</strong><br>Headcount: ${headcount}`;
                chartTooltip.classList.add('visible');

                // Position tooltip
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

    // --- 3. UI HELPER: Donut Chart Hover (Static HTML based) ---
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
            // Retrieve the JWT token from login
            const token = localStorage.getItem('token'); 
            const headers = {};
            
            // Only add the Authorization header if token exists and is valid
            if (token && token !== 'undefined' && token !== 'null') {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(`${API_BASE}/api/dashboard/stats`, { headers });
            
            if (!response.ok) {
                // If unauthorized (401), redirect to login
                if (response.status === 401) {
                    showNotification("Session expired. Please log in again.", "error");
                    setTimeout(() => window.location.href = 'index.html', 1500);
                    return;
                }
                throw new Error(`Server returned ${response.status}`);
            }
            
            const data = await response.json();

            // Update Summary Cards
            if (employeeCount) employeeCount.textContent = data.totalEmployees || 0;
            if (leaveCount) leaveCount.textContent = data.approvedLeave || 0;
            if (payrollValue) payrollValue.textContent = toRand(data.payrollCycle || 0);
            if (openRequestCount) openRequestCount.textContent = data.openRequests || 0;

            // Update the Trend Graph
            renderGrowthTrend(data.growthTrend);

            console.log("[Dashboard] Stats loaded successfully:", data);

        } catch (error) {
            console.error("[Dashboard] Error fetching stats:", error);
            
            // Set fallback display
            if (employeeCount) employeeCount.textContent = '--';
            if (leaveCount) leaveCount.textContent = '--';
            if (payrollValue) payrollValue.textContent = 'R--';
            if (openRequestCount) openRequestCount.textContent = '--';

            showNotification('Failed to load dashboard statistics.', 'error');
        }
    }

    // --- 5. RUN ---
    loadDashboardData();
});