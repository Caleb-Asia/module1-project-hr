// ============================================
// CONSTANTS & CONFIGURATION - MODERNTECH THEME
// ============================================
const SHIFT_START_HOUR = 8;
const SHIFT_DURATION_HOURS = 8;

// Color Palette - Matching ModernTech HR System
const COLORS = {
    primary: '#6366f1',
    primaryLight: '#8b5cf6',
    primaryDark: '#4f46e5',
    accent: '#14b8a6',
    accentHover: '#0d9488',
    success: '#10b981',
    successBg: 'rgba(16, 185, 129, 0.18)',
    danger: '#ef4444',
    dangerBg: 'rgba(239, 68, 68, 0.18)',
    warning: '#f59e0b',
    warningBg: 'rgba(245, 158, 11, 0.18)',
    info: '#6366f1',
    infoBg: 'rgba(99, 102, 241, 0.15)',
    surface: '#131a2c',
    surfaceAlt: '#17203a',
    surfaceStrong: '#0f172a',
    text: '#f8fafc',
    textMuted: '#94a3b8',
    textSoft: '#cbd5e1',
    border: 'rgba(255, 255, 255, 0.08)',
    avatar: ['#6366f1', '#14b8a6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f43f5e', '#10b981']
};

// Detect which page we're on
const currentPage = window.location.pathname.toLowerCase();
const isAttendancePage = currentPage.includes('attendance');
const isReviewsPage = currentPage.includes('reviews');

// DOM Elements
const attendanceSection = document.getElementById('attendance-data');
const visualsSection = document.getElementById('attendance-visuals');
const reviewsContainer = document.getElementById('reviews-data-list');

// Data Sources
const ATTENDANCE_SOURCES = [
    'data/attendance.json',
    './data/attendance.json',
    '../data/attendance.json',
    '../M1 Project Module - Employee Dummy JSON Data/attendance.json'
];

const REVIEW_SOURCES = [
    'data/employee_info.json',
    './data/employee_info.json',
    '../data/employee_info.json'
];

// ============================================
// FALLBACK DATA
// ============================================
const fallbackAttendanceData = {
    attendanceAndLeave: [
        {
            employeeId: 1,
            name: 'Sibongile Nkosi',
            attendance: [
                { date: '2025-07-25', status: 'Present' },
                { date: '2025-07-26', status: 'Absent' },
                { date: '2025-07-27', status: 'Present' },
                { date: '2025-07-28', status: 'Present' },
                { date: '2025-07-29', status: 'Present' }
            ]
        },
        {
            employeeId: 2,
            name: 'Lungile Moyo',
            attendance: [
                { date: '2025-07-25', status: 'Present' },
                { date: '2025-07-26', status: 'Present' },
                { date: '2025-07-27', status: 'Absent' },
                { date: '2025-07-28', status: 'Present' },
                { date: '2025-07-29', status: 'Present' }
            ]
        },
        {
            employeeId: 3,
            name: 'Thandiwe Zulu',
            attendance: [
                { date: '2025-07-25', status: 'Present' },
                { date: '2025-07-26', status: 'Present' },
                { date: '2025-07-27', status: 'Present' },
                { date: '2025-07-28', status: 'Absent' },
                { date: '2025-07-29', status: 'Present' }
            ]
        }
    ]
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

async function fetchWithFallback(sources, parser, fallback) {
    for (const source of sources) {
        try {
            const response = await fetch(source);
            if (response.ok) {
                const data = await response.json();
                const parsed = parser(data);
                if (parsed && (Array.isArray(parsed) ? parsed.length : true)) {
                    return parsed;
                }
            }
        } catch (error) {
            console.warn(`Failed to fetch ${source}:`, error.message);
        }
    }
    return fallback();
}

function getInitials(name = '') {
    return name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0])
        .join('')
        .toUpperCase();
}

function getStars(rating = 0) {
    const rounded = Math.min(Math.max(Math.round(rating), 0), 5);
    return '★'.repeat(rounded) + '☆'.repeat(5 - rounded);
}

function getScheduleTimes(record) {
    const baseHour = SHIFT_START_HOUR + ((record.employeeId - 1) % 3);
    const checkInTime = record.checkIn || `${String(baseHour).padStart(2, '0')}:00`;
    const checkOutTime = record.checkOut || `${String(baseHour + SHIFT_DURATION_HOURS).padStart(2, '0')}:30`;
    return { checkInTime, checkOutTime };
}

function getAttendanceMarkup(attendance = []) {
    if (!attendance?.length) {
        return '<span style="color: #94a3b8; font-style: italic;">No data</span>';
    }

    return attendance.map((item) => {
        const status = (item.status || 'unknown').toLowerCase();
        let className = 'attendance-badge';
        if (status === 'present') className += ' present';
        if (status === 'absent') className += ' absent';
        return `<span class="${className}">${item.date} • ${item.status || 'Unknown'}</span>`;
    }).join('');
}

function getFeedback(employee = {}) {
    const role = employee.position || 'team member';
    const department = employee.department || 'the company';
    return `${employee.name || 'This employee'} brings strong focus to ${department.toLowerCase()} work and continues to contribute positively as a ${role.toLowerCase()}. Their reliability and collaboration make them a valuable part of the team.`;
}

function getColorForEmployee(id) {
    return COLORS.avatar[(id - 1) % COLORS.avatar.length];
}

// ============================================
// NAVIGATION
// ============================================

function highlightActiveNav() {
    const currentPath = window.location.pathname.toLowerCase();
    document.querySelectorAll('.nav-links a').forEach((link) => {
        const href = link.getAttribute('href')?.toLowerCase() || '';
        const isActive = currentPath.includes(href.replace('.html', '')) || 
                         (href === '' && currentPath.endsWith('/'));
        link.closest('li')?.classList.toggle('active', isActive);
    });
}

// ============================================
// NOTIFICATION SYSTEM
// ============================================

function showNotification(message, type = 'success') {
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();
    
    const notification = document.createElement('div');
    notification.className = 'notification';
    
    const colors = {
        success: '#10b981',
        error: '#ef4444',
        warning: '#f59e0b',
        info: '#6366f1'
    };
    
    const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 16px 24px;
        background: ${colors[type] || colors.success};
        color: white;
        border-radius: 16px;
        box-shadow: 0 20px 60px rgba(0,0,0,0.5);
        z-index: 100000;
        font-weight: 600;
        font-size: 0.95rem;
        animation: slideInRight 0.3s ease;
        max-width: 400px;
        border: 1px solid rgba(255,255,255,0.08);
        font-family: 'Inter', system-ui, sans-serif;
    `;
    
    notification.innerHTML = `${icons[type] || '📢'} ${message}`;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ============================================
// TABLE CREATION - DARK THEME WITH PROPER CONTRAST
// ============================================

function createAttendanceTable(records) {
    const table = document.createElement('table');
    table.className = 'attendance-table';
    table.style.cssText = `
        width: 100%;
        border-collapse: collapse;
        background: #0f172a;
        color: #e2e8f0;
        border-radius: 12px;
        overflow: hidden;
    `;
    
    table.innerHTML = `
        <thead>
            <tr style="
                background: #0a0f1a;
                border-bottom: 2px solid #1e293b;
            ">
                <th style="
                    padding: 14px 16px;
                    text-align: left;
                    font-weight: 700;
                    font-size: 0.8rem;
                    text-transform: uppercase;
                    letter-spacing: 0.12em;
                    color: #94a3b8;
                ">Employee ID</th>
                <th style="
                    padding: 14px 16px;
                    text-align: left;
                    font-weight: 700;
                    font-size: 0.8rem;
                    text-transform: uppercase;
                    letter-spacing: 0.12em;
                    color: #94a3b8;
                ">Name</th>
                <th style="
                    padding: 14px 16px;
                    text-align: left;
                    font-weight: 700;
                    font-size: 0.8rem;
                    text-transform: uppercase;
                    letter-spacing: 0.12em;
                    color: #94a3b8;
                ">Attendance</th>
                <th style="
                    padding: 14px 16px;
                    text-align: left;
                    font-weight: 700;
                    font-size: 0.8rem;
                    text-transform: uppercase;
                    letter-spacing: 0.12em;
                    color: #94a3b8;
                ">Check In</th>
                <th style="
                    padding: 14px 16px;
                    text-align: left;
                    font-weight: 700;
                    font-size: 0.8rem;
                    text-transform: uppercase;
                    letter-spacing: 0.12em;
                    color: #94a3b8;
                ">Check Out</th>
            </tr>
        </thead>
        <tbody></tbody>
    `;
    
    const tbody = table.querySelector('tbody');
    
    if (!records?.length) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" style="
                    padding: 40px;
                    text-align: center;
                    color: #94a3b8;
                    background: #0f172a;
                ">
                    <div style="font-size: 1.1rem;">📋 No attendance records available</div>
                </td>
            </tr>
        `;
        return table;
    }
    
    records.forEach((record, index) => {
        const attendanceSummary = getAttendanceMarkup(record.attendance);
        const { checkInTime, checkOutTime } = getScheduleTimes(record);
        const bgColor = index % 2 === 0 ? '#0f172a' : '#1a2332';
        
        const row = document.createElement('tr');
        row.style.cssText = `
            background: ${bgColor};
            transition: all 0.2s ease;
            border-bottom: 1px solid #1e293b;
        `;
        
        // Hover effect
        row.addEventListener('mouseenter', function() {
            this.style.background = '#2d3748';
            this.style.transform = 'scale(1.002)';
            this.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';
        });
        row.addEventListener('mouseleave', function() {
            this.style.background = bgColor;
            this.style.transform = 'scale(1)';
            this.style.boxShadow = 'none';
        });
        
        row.innerHTML = `
            <td style="
                padding: 12px 16px;
                font-weight: 700;
                color: #a5b4fc;
                font-size: 0.9rem;
            ">
                #${String(record.employeeId).padStart(3, '0')}
            </td>
            <td style="
                padding: 12px 16px;
                font-weight: 600;
                color: #f1f5f9;
                font-size: 0.95rem;
            ">
                ${record.name}
            </td>
            <td style="
                padding: 12px 16px;
            ">
                ${attendanceSummary}
            </td>
            <td style="
                padding: 12px 16px;
            ">
                <span style="
                    display: inline-block;
                    padding: 5px 14px;
                    background: #1e293b;
                    color: #94a3b8;
                    border-radius: 20px;
                    font-weight: 600;
                    font-size: 0.85rem;
                    border: 1px solid #334155;
                ">
                    ⏰ ${checkInTime}
                </span>
            </td>
            <td style="
                padding: 12px 16px;
            ">
                <span style="
                    display: inline-block;
                    padding: 5px 14px;
                    background: #1e293b;
                    color: #94a3b8;
                    border-radius: 20px;
                    font-weight: 600;
                    font-size: 0.85rem;
                    border: 1px solid #334155;
                ">
                    ⏰ ${checkOutTime}
                </span>
            </td>
        `;
        tbody.appendChild(row);
    });
    
    return table;
}

// ============================================
// RENDER FUNCTIONS
// ============================================

function renderVisuals(records = []) {
    if (!visualsSection) return;
    
    const allAttendance = records.flatMap((record) => record.attendance || []);
    const presentCount = allAttendance.filter((item) => (item.status || '').toLowerCase() === 'present').length;
    const absentCount = allAttendance.filter((item) => (item.status || '').toLowerCase() === 'absent').length;
    const totalCount = allAttendance.length || 1;
    
    const presentPercent = Math.round((presentCount / totalCount) * 100);
    const absentPercent = Math.round((absentCount / totalCount) * 100);
    
    const dates = [...new Set(allAttendance.map(item => item.date))].sort();
    
    const dailySummary = dates.map((date) => {
        const dayRecords = allAttendance.filter((item) => item.date === date);
        const present = dayRecords.filter((item) => (item.status || '').toLowerCase() === 'present').length;
        const absent = dayRecords.filter((item) => (item.status || '').toLowerCase() === 'absent').length;
        return { date, present, absent };
    });
    
    const maxValue = Math.max(...dailySummary.map(d => Math.max(d.present, d.absent)), 1);
    const maxHeight = 120;
    
    visualsSection.innerHTML = `
        <div class="visuals-header" style="
            background: rgba(255, 255, 255, 0.04);
            border-radius: 1.5rem;
            padding: 1.2rem 1.3rem;
            border: 1px solid rgba(255, 255, 255, 0.08);
            margin-bottom: 1rem;
        ">
            <h2 style="color: #f8fafc; font-size: 1.25rem; margin-bottom: 0.5rem;">📊 Attendance Overview</h2>
            <p style="color: #94a3b8;">Live summary of presence and attendance trends for the current period</p>
        </div>
        <div class="visual-grid" style="
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 1rem;
        ">
            <div class="visual-card" style="
                background: #0f172a;
                border-radius: 1.5rem;
                padding: 1.35rem;
                border: 1px solid #1e293b;
                box-shadow: 0 18px 50px rgba(0, 0, 0, 0.16);
                transition: transform 0.3s ease, box-shadow 0.3s ease;
            ">
                <h3 style="color: #94a3b8; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.8rem;">✅ Present</h3>
                <div class="stat-value" style="font-size: 2rem; font-weight: 800; color: #10b981; margin-bottom: 0.25rem;">${presentPercent}%</div>
                <div class="stat-caption" style="color: #64748b; font-size: 0.9rem;">${presentCount} of ${totalCount} check-ins</div>
            </div>
            <div class="visual-card" style="
                background: #0f172a;
                border-radius: 1.5rem;
                padding: 1.35rem;
                border: 1px solid #1e293b;
                box-shadow: 0 18px 50px rgba(0, 0, 0, 0.16);
                transition: transform 0.3s ease, box-shadow 0.3s ease;
            ">
                <h3 style="color: #94a3b8; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.8rem;">❌ Absent</h3>
                <div class="stat-value" style="font-size: 2rem; font-weight: 800; color: #ef4444; margin-bottom: 0.25rem;">${absentPercent}%</div>
                <div class="stat-caption" style="color: #64748b; font-size: 0.9rem;">${absentCount} of ${totalCount} check-ins</div>
            </div>
            <div class="visual-card" style="
                background: #0f172a;
                border-radius: 1.5rem;
                padding: 1.35rem;
                border: 1px solid #1e293b;
                box-shadow: 0 18px 50px rgba(0, 0, 0, 0.16);
                transition: transform 0.3s ease, box-shadow 0.3s ease;
            ">
                <h3 style="color: #94a3b8; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.8rem;">📈 Daily Trends</h3>
                <div class="bar-chart" style="display: flex; align-items: flex-end; gap: 0.8rem; height: 170px; overflow-x: auto; padding-top: 0.5rem;">
                    ${dailySummary.map((day) => {
                        const presentHeight = Math.max((day.present / maxValue) * maxHeight, 6);
                        const absentHeight = Math.max((day.absent / maxValue) * maxHeight, 6);
                        return `
                            <div class="bar-group" style="display: flex; flex-direction: column; align-items: center; gap: 0.7rem; min-width: 56px;">
                                <div class="bar-pair" style="display: flex; align-items: flex-end; gap: 0.4rem; width: 100%;">
                                    <div class="bar-fill present" style="height: ${presentHeight}px; width: 14px; border-radius: 0.7rem 0.7rem 0 0; min-height: 12px; background: linear-gradient(180deg, #22c55e, #10b981); transition: height 0.35s ease;" title="${day.present} present"></div>
                                    <div class="bar-fill absent" style="height: ${absentHeight}px; width: 14px; border-radius: 0.7rem 0.7rem 0 0; min-height: 12px; background: linear-gradient(180deg, #f59e0b, #ea580c); transition: height 0.35s ease;" title="${day.absent} absent"></div>
                                </div>
                                <div class="bar-label" style="color: #94a3b8; font-size: 0.82rem;">${day.date.slice(5)}</div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        </div>
    `;
}

function renderReviewCards(employees) {
    if (!employees?.length) {
        return `
            <div class="empty-state" style="
                padding: 2rem;
                text-align: center;
                background: #0f172a;
                border-radius: 1.5rem;
                border: 1px solid #1e293b;
                color: #94a3b8;
            ">
                <p style="font-size: 1.2rem; color: #f8fafc; margin-bottom: 0.5rem;">📝 No employee review data available</p>
                <p>Check back later for performance updates</p>
            </div>
        `;
    }
    
    return employees.map((employee) => {
        const rating = Number((4.0 + ((employee.employeeId % 5) * 0.2)).toFixed(1));
        const initials = getInitials(employee.name);
        const avatarColor = getColorForEmployee(employee.employeeId);
        
        return `
            <article class="review-card" style="
                background: #0f172a;
                border-radius: 1.5rem;
                padding: 1.35rem;
                border: 1px solid #1e293b;
                box-shadow: 0 18px 50px rgba(0, 0, 0, 0.16);
                transition: transform 0.3s ease, box-shadow 0.3s ease;
                display: flex;
                flex-direction: column;
                gap: 0.75rem;
            ">
                <div class="review-card-header" style="display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; margin-bottom: 0.5rem;">
                    <div class="review-card-title" style="display: flex; align-items: center; gap: 0.85rem;">
                        <span class="initials" style="width: 46px; height: 46px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 700; background: ${avatarColor}; box-shadow: 0 10px 30px rgba(24, 195, 200, 0.22); flex-shrink: 0;">${initials}</span>
                        <div>
                            <h3 style="color: #f8fafc; font-size: 1rem; margin: 0;">${employee.name}</h3>
                            <p style="color: #94a3b8; font-size: 0.85rem; margin: 0.2rem 0 0;">${employee.position || 'Employee'}</p>
                        </div>
                    </div>
                    <span class="review-badge" style="padding: 0.45rem 0.85rem; border-radius: 999px; background: rgba(99, 102, 241, 0.14); color: #c7d2fe; font-size: 0.75rem; font-weight: 700; white-space: nowrap;">${employee.department || 'General'}</span>
                </div>
                <div class="review-meta" style="display: flex; flex-wrap: wrap; gap: 1rem; align-items: center; color: #94a3b8; font-size: 0.9rem;">
                    <span class="rating" style="color: #fbbf24; font-weight: 700; display: inline-flex; align-items: center; gap: 0.4rem;">${getStars(rating)} ${rating.toFixed(1)}/5</span>
                    <span>Q2 2025</span>
                </div>
                <p class="feedback" style="color: #cbd5e1; line-height: 1.7; margin: 0;">${getFeedback(employee)}</p>
                <div class="review-footer" style="border-top: 1px solid #1e293b; padding-top: 0.75rem; font-size: 0.75rem; color: #94a3b8;">
                    <span>📅 Reviewed: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
            </article>
        `;
    }).join('');
}

// ============================================
// FILTER & SORT FUNCTIONS
// ============================================

function applyFilters(status, dateFrom, dateTo) {
    const rows = document.querySelectorAll('#attendance-data tbody tr');
    rows.forEach(row => {
        let show = true;
        
        if (status && status !== 'all') {
            const statusElements = row.querySelectorAll('.attendance-badge');
            let hasStatus = false;
            statusElements.forEach(el => {
                if (el.classList.contains(status)) hasStatus = true;
            });
            if (!hasStatus) show = false;
        }
        
        if (dateFrom || dateTo) {
            const dateElements = row.querySelectorAll('.attendance-badge');
            let hasDate = false;
            dateElements.forEach(el => {
                const text = el.textContent || '';
                const dateMatch = text.match(/\d{4}-\d{2}-\d{2}/);
                if (dateMatch) {
                    const date = dateMatch[0];
                    if (dateFrom && date < dateFrom) return;
                    if (dateTo && date > dateTo) return;
                    hasDate = true;
                }
            });
            if (!hasDate) show = false;
        }
        
        row.style.display = show ? '' : 'none';
    });
    
    const filterBtn = document.getElementById('filterBtn');
    if (filterBtn) {
        filterBtn.textContent = status !== 'all' || dateFrom || dateTo ? '🔍 Filtered' : '🔍 Filter';
    }
}

function clearFilters() {
    const rows = document.querySelectorAll('#attendance-data tbody tr');
    rows.forEach(row => row.style.display = '');
    const filterBtn = document.getElementById('filterBtn');
    if (filterBtn) filterBtn.textContent = '🔍 Filter';
}

function applySort(sortType) {
    const container = document.getElementById('reviews-data-list');
    if (!container) return;
    
    const cards = Array.from(container.children);
    
    cards.sort((a, b) => {
        const nameA = a.querySelector('h3')?.textContent || '';
        const nameB = b.querySelector('h3')?.textContent || '';
        const ratingA = parseFloat(a.querySelector('.rating')?.textContent?.match(/\d\.\d/)?.[0] || 0);
        const ratingB = parseFloat(b.querySelector('.rating')?.textContent?.match(/\d\.\d/)?.[0] || 0);
        const dateA = a.querySelector('.review-footer')?.textContent?.replace('📅 Reviewed: ', '').trim() || '';
        const dateB = b.querySelector('.review-footer')?.textContent?.replace('📅 Reviewed: ', '').trim() || '';
        
        switch(sortType) {
            case 'rating-desc': return ratingB - ratingA;
            case 'rating-asc': return ratingA - ratingB;
            case 'name-asc': return nameA.localeCompare(nameB);
            case 'name-desc': return nameB.localeCompare(nameA);
            case 'date-desc': return dateB.localeCompare(dateA);
            case 'date-asc': return dateA.localeCompare(dateB);
            default: return 0;
        }
    });
    
    cards.forEach(card => container.appendChild(card));
}

// ============================================
// LOAD FUNCTIONS
// ============================================

async function loadAttendanceData() {
    if (!isAttendancePage) return;
    if (!attendanceSection) {
        console.warn('Attendance section not found');
        return;
    }
    
    try {
        attendanceSection.innerHTML = `<div style="padding: 2rem; text-align: center; color: #94a3b8;">⏳ Loading attendance data...</div>`;
        
        const records = await fetchWithFallback(
            ATTENDANCE_SOURCES,
            (data) => data?.attendanceAndLeave || null,
            () => fallbackAttendanceData.attendanceAndLeave
        );
        
        renderVisuals(records);
        const table = createAttendanceTable(records);
        attendanceSection.innerHTML = '';
        attendanceSection.appendChild(table);
        console.log(`✅ Attendance data loaded: ${records.length} records`);
    } catch (error) {
        console.error('❌ Error loading attendance data:', error);
        const records = fallbackAttendanceData.attendanceAndLeave;
        renderVisuals(records);
        const table = createAttendanceTable(records);
        attendanceSection.innerHTML = '';
        attendanceSection.appendChild(table);
    }
}

async function loadReviews() {
    if (!isReviewsPage) return;
    if (!reviewsContainer) {
        console.warn('Reviews container not found');
        return;
    }
    
    try {
        reviewsContainer.innerHTML = `<div style="padding: 2rem; text-align: center; color: #94a3b8;">⏳ Loading employee reviews...</div>`;
        
        const employees = await fetchWithFallback(
            REVIEW_SOURCES,
            (data) => data?.employeeInformation || null,
            () => []
        );
        
        if (!employees.length) {
            reviewsContainer.innerHTML = `
                <div style="padding: 2rem; text-align: center; background: #0f172a; border-radius: 1.5rem; border: 1px solid #1e293b; color: #94a3b8;">
                    <p style="font-size: 1.2rem; color: #f8fafc; margin-bottom: 0.5rem;">📝 No employee reviews available</p>
                    <p>Please add employee data to see reviews</p>
                </div>
            `;
            return;
        }
        
        reviewsContainer.innerHTML = renderReviewCards(employees);
        console.log(`✅ Reviews loaded: ${employees.length} employees`);
    } catch (error) {
        console.error('❌ Error loading reviews:', error);
        reviewsContainer.innerHTML = `
            <div style="padding: 2rem; text-align: center; background: rgba(239, 68, 68, 0.1); border-radius: 1.5rem; border: 2px solid #ef4444; color: #94a3b8;">
                <p style="font-size: 1.2rem; color: #ef4444; margin-bottom: 0.5rem;">⚠️ Failed to load employee reviews</p>
                <p>Please try refreshing the page</p>
            </div>
        `;
    }
}

// ============================================
// CREATE ATTENDANCE FORM (MATCHES REVIEW FORM STYLE)
// ============================================

function createAttendanceForm() {
    // Check if form already exists
    let form = document.getElementById('attendanceFormModal');
    if (form) {
        form.remove();
        return;
    }
    
    // Create modal overlay
    form = document.createElement('div');
    form.id = 'attendanceFormModal';
    form.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        backdrop-filter: blur(8px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        animation: fadeIn 0.3s ease;
    `;
    
    form.innerHTML = `
        <div class="modal-content" style="
            background: linear-gradient(145deg, #1a2332, #0f172a);
            border-radius: 20px;
            padding: 2rem;
            max-width: 480px;
            width: 92%;
            max-height: 90vh;
            overflow-y: auto;
            border: 1px solid #1e293b;
            box-shadow: 0 30px 80px rgba(0, 0, 0, 0.6);
            animation: slideDown 0.3s ease;
        ">
            <h2 style="
                text-align: center;
                margin-bottom: 0.5rem;
                font-size: 1.5rem;
                font-weight: 700;
                background: linear-gradient(135deg, #6366f1, #8b5cf6);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
            ">📝 New Attendance Record</h2>
            <p style="
                text-align: center;
                color: #94a3b8;
                margin-bottom: 1.5rem;
                font-size: 0.95rem;
            ">Fill in the details for the attendance record</p>
            
            <div class="form-group" style="margin-bottom: 1.25rem;">
                <label for="employeeName" style="
                    display: block;
                    margin-bottom: 0.5rem;
                    font-weight: 600;
                    color: #cbd5e1;
                    font-size: 0.85rem;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                ">Employee Name</label>
                <input type="text" id="employeeName" placeholder="Enter employee name" style="
                    width: 100%;
                    padding: 0.75rem 1rem;
                    border: 1px solid #1e293b;
                    border-radius: 12px;
                    background: #0f172a;
                    color: #f8fafc;
                    font-size: 0.95rem;
                    transition: all 0.3s ease;
                    font-family: inherit;
                ">
            </div>
            
            <div class="form-group" style="margin-bottom: 1.25rem;">
                <label for="attendanceDate" style="
                    display: block;
                    margin-bottom: 0.5rem;
                    font-weight: 600;
                    color: #cbd5e1;
                    font-size: 0.85rem;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                ">Date</label>
                <input type="date" id="attendanceDate" style="
                    width: 100%;
                    padding: 0.75rem 1rem;
                    border: 1px solid #1e293b;
                    border-radius: 12px;
                    background: #0f172a;
                    color: #f8fafc;
                    font-size: 0.95rem;
                    transition: all 0.3s ease;
                    font-family: inherit;
                ">
            </div>
            
            <div class="form-group" style="margin-bottom: 1.25rem;">
                <label for="attendanceTime" style="
                    display: block;
                    margin-bottom: 0.5rem;
                    font-weight: 600;
                    color: #cbd5e1;
                    font-size: 0.85rem;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                ">Time</label>
                <input type="time" id="attendanceTime" style="
                    width: 100%;
                    padding: 0.75rem 1rem;
                    border: 1px solid #1e293b;
                    border-radius: 12px;
                    background: #0f172a;
                    color: #f8fafc;
                    font-size: 0.95rem;
                    transition: all 0.3s ease;
                    font-family: inherit;
                ">
            </div>
            
            <div class="form-group" style="margin-bottom: 1.25rem;">
                <label for="attendanceStatus" style="
                    display: block;
                    margin-bottom: 0.5rem;
                    font-weight: 600;
                    color: #cbd5e1;
                    font-size: 0.85rem;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                ">Status</label>
                <select id="attendanceStatus" style="
                    width: 100%;
                    padding: 0.75rem 1rem;
                    border: 1px solid #1e293b;
                    border-radius: 12px;
                    background: #0f172a;
                    color: #f8fafc;
                    font-size: 0.95rem;
                    transition: all 0.3s ease;
                    font-family: inherit;
                ">
                    <option value="Present" style="background: #0f172a; color: #f8fafc;">✅ Present</option>
                    <option value="Absent" style="background: #0f172a; color: #f8fafc;">❌ Absent</option>
                    <option value="Late" style="background: #0f172a; color: #f8fafc;">⚠️ Late</option>
                </select>
            </div>
            
            <div style="display: flex; gap: 1rem; margin-top: 1.5rem;">
                <button id="submitAttendanceBtn" class="btn btn-success" style="
                    flex: 1;
                    justify-content: center;
                    padding: 0.9rem;
                    border: 0;
                    border-radius: 999px;
                    font-weight: 700;
                    cursor: pointer;
                    transition: transform 0.2s ease, background 0.2s ease, box-shadow 0.2s ease;
                    font-size: 0.9rem;
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    background: linear-gradient(135deg, #10b981, #059669);
                    color: #fff;
                    box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
                ">✅ Submit Record</button>
                <button id="cancelAttendanceBtn" class="btn btn-danger" style="
                    flex: 1;
                    justify-content: center;
                    padding: 0.9rem;
                    border: 0;
                    border-radius: 999px;
                    font-weight: 700;
                    cursor: pointer;
                    transition: transform 0.2s ease, background 0.2s ease, box-shadow 0.2s ease;
                    font-size: 0.9rem;
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    background: linear-gradient(135deg, #ef4444, #dc2626);
                    color: #fff;
                    box-shadow: 0 4px 15px rgba(239, 68, 68, 0.3);
                ">✖ Cancel</button>
            </div>
        </div>
    `;
    
    // Auto-fill date and time
    const dateInput = form.querySelector('#attendanceDate');
    const timeInput = form.querySelector('#attendanceTime');
    
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.value = today;
    }
    if (timeInput) {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        timeInput.value = `${hours}:${minutes}`;
    }
    
    // Add focus styles
    form.querySelectorAll('input, select').forEach(input => {
        input.addEventListener('focus', function() {
            this.style.borderColor = '#6366f1';
            this.style.background = '#1a2332';
            this.style.boxShadow = '0 0 0 4px rgba(99, 102, 241, 0.15)';
        });
        input.addEventListener('blur', function() {
            this.style.borderColor = '#1e293b';
            this.style.background = '#0f172a';
            this.style.boxShadow = 'none';
        });
    });
    
    // Hover effects for buttons
    form.querySelectorAll('.btn').forEach(btn => {
        btn.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
        });
        btn.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
    
    document.body.appendChild(form);
    
    // Submit button
    document.getElementById('submitAttendanceBtn').addEventListener('click', function() {
        const employeeName = document.getElementById('employeeName')?.value.trim();
        const attendanceDate = document.getElementById('attendanceDate')?.value;
        const attendanceTime = document.getElementById('attendanceTime')?.value;
        const attendanceStatus = document.getElementById('attendanceStatus')?.value;
        
        if (!employeeName) {
            showNotification('Please enter employee name', 'error');
            document.getElementById('employeeName').focus();
            return;
        }
        
        if (!attendanceDate) {
            showNotification('Please select a date', 'error');
            document.getElementById('attendanceDate').focus();
            return;
        }
        
        if (!attendanceTime) {
            showNotification('Please select a time', 'error');
            document.getElementById('attendanceTime').focus();
            return;
        }
        
        const newRecord = {
            employeeId: Date.now(),
            name: employeeName,
            attendance: [{ date: attendanceDate, status: attendanceStatus, time: attendanceTime }]
        };
        
        console.log('New attendance record:', newRecord);
        showNotification(`✅ Record added for ${employeeName} - ${attendanceStatus}`, 'success');
        
        form.remove();
        
        // Update the new record button text
        const newRecordBtn = document.getElementById('newRecordBtn');
        if (newRecordBtn) {
            newRecordBtn.textContent = '📝 New Record';
        }
        
        if (typeof loadAttendanceData === 'function') loadAttendanceData();
    });
    
    // Cancel button
    document.getElementById('cancelAttendanceBtn').addEventListener('click', function() {
        form.remove();
        const newRecordBtn = document.getElementById('newRecordBtn');
        if (newRecordBtn) {
            newRecordBtn.textContent = '📝 New Record';
        }
    });
    
    // Close on background click
    form.addEventListener('click', function(e) {
        if (e.target === form) {
            form.remove();
            const newRecordBtn = document.getElementById('newRecordBtn');
            if (newRecordBtn) {
                newRecordBtn.textContent = '📝 New Record';
            }
        }
    });
    
    return form;
}

// ============================================
// BUTTON FUNCTIONALITY - PAGE SPECIFIC
// ============================================

function initializeButtons() {
    // ============================================
    // ATTENDANCE PAGE BUTTONS
    // ============================================
    if (isAttendancePage) {
        console.log('📋 Initializing Attendance page buttons...');
        
        const newRecordBtn = document.getElementById('newRecordBtn');
        const filterBtn = document.getElementById('filterBtn');
        
        // New Record Button - Opens styled modal form
        if (newRecordBtn) {
            newRecordBtn.addEventListener('click', function(e) {
                e.preventDefault();
                createAttendanceForm();
                this.textContent = '✖ Close Form';
            });
        }
        
        // Filter Button
        if (filterBtn) {
            filterBtn.addEventListener('click', function(e) {
                e.preventDefault();
                let filterDropdown = document.getElementById('filterDropdown');
                
                if (!filterDropdown) {
                    filterDropdown = document.createElement('div');
                    filterDropdown.id = 'filterDropdown';
                    
                    const rect = filterBtn.getBoundingClientRect();
                    filterDropdown.style.cssText = `
                        position: fixed;
                        top: ${rect.bottom + 8}px;
                        right: ${window.innerWidth - rect.right}px;
                        background: #0f172a;
                        border: 1px solid #1e293b;
                        border-radius: 16px;
                        padding: 1.25rem;
                        min-width: 240px;
                        box-shadow: 0 20px 60px rgba(0,0,0,0.5);
                        z-index: 1000;
                        animation: slideDown 0.3s ease;
                    `;
                    
                    filterDropdown.innerHTML = `
                        <div style="margin-bottom: 12px;">
                            <label style="display: block; font-size: 0.8rem; font-weight: 600; color: #94a3b8; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.05em;">Filter by Status</label>
                            <select id="filterStatus" style="width: 100%; padding: 0.6rem 0.8rem; background: #0f172a; border: 1px solid #1e293b; border-radius: 10px; color: #f8fafc; font-size: 0.9rem;">
                                <option value="all">All Status</option>
                                <option value="present">✅ Present</option>
                                <option value="absent">❌ Absent</option>
                            </select>
                        </div>
                        <div style="margin-bottom: 12px;">
                            <label style="display: block; font-size: 0.8rem; font-weight: 600; color: #94a3b8; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.05em;">Date Range</label>
                            <input type="date" id="filterDateFrom" style="width: 100%; padding: 0.6rem 0.8rem; background: #0f172a; border: 1px solid #1e293b; border-radius: 10px; color: #f8fafc; font-size: 0.9rem; margin-bottom: 6px;">
                            <input type="date" id="filterDateTo" style="width: 100%; padding: 0.6rem 0.8rem; background: #0f172a; border: 1px solid #1e293b; border-radius: 10px; color: #f8fafc; font-size: 0.9rem;">
                        </div>
                        <div style="display: flex; gap: 8px;">
                            <button id="applyFilterBtn" style="flex: 1; padding: 0.6rem; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; border: none; border-radius: 999px; cursor: pointer; font-weight: 700; transition: transform 0.2s ease;">Apply</button>
                            <button id="clearFilterBtn" style="flex: 1; padding: 0.6rem; background: rgba(255,255,255,0.08); color: #cbd5e1; border: 1px solid #1e293b; border-radius: 999px; cursor: pointer; font-weight: 700; transition: transform 0.2s ease;">Clear</button>
                        </div>
                    `;
                    
                    document.body.appendChild(filterDropdown);
                    
                    document.getElementById('applyFilterBtn').addEventListener('click', function() {
                        const status = document.getElementById('filterStatus').value;
                        const dateFrom = document.getElementById('filterDateFrom').value;
                        const dateTo = document.getElementById('filterDateTo').value;
                        applyFilters(status, dateFrom, dateTo);
                        filterDropdown.remove();
                        filterBtn.textContent = '🔍 Filter';
                    });
                    
                    document.getElementById('clearFilterBtn').addEventListener('click', function() {
                        clearFilters();
                        filterDropdown.remove();
                        filterBtn.textContent = '🔍 Filter';
                    });
                    
                    filterBtn.textContent = '✖ Close';
                } else {
                    filterDropdown.remove();
                    filterBtn.textContent = '🔍 Filter';
                }
            });
        }
    }
    
    // ============================================
    // REVIEWS PAGE BUTTONS
    // ============================================
    if (isReviewsPage) {
        console.log('⭐ Initializing Reviews page buttons...');
        
        const addReviewBtn = document.querySelector('.topbar-actions .btn-primary');
        const sortBtn = document.querySelector('.topbar-actions .btn-secondary');
        
        // Add Review Button - Creates modal with form
        if (addReviewBtn) {
            addReviewBtn.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Create modal overlay
                const modal = document.createElement('div');
                modal.id = 'reviewModal';
                
                modal.innerHTML = `
                    <div class="modal-content">
                        <h2>⭐ Add New Review</h2>
                        <p class="modal-subtitle">Fill in the details for the employee review</p>
                        
                        <div class="form-group">
                            <label for="reviewEmployeeName">Employee Name</label>
                            <input type="text" id="reviewEmployeeName" placeholder="Enter employee name">
                        </div>
                        
                        <div class="form-group">
                            <label for="reviewDepartment">Department</label>
                            <input type="text" id="reviewDepartment" placeholder="Enter department">
                        </div>
                        
                        <div class="form-group">
                            <label for="reviewPosition">Position</label>
                            <input type="text" id="reviewPosition" placeholder="Enter position">
                        </div>
                        
                        <div class="form-group">
                            <label for="reviewRating">Rating (1-5)</label>
                            <select id="reviewRating">
                                <option value="5">⭐⭐⭐⭐⭐ - Excellent</option>
                                <option value="4" selected>⭐⭐⭐⭐ - Good</option>
                                <option value="3">⭐⭐⭐ - Average</option>
                                <option value="2">⭐⭐ - Below Average</option>
                                <option value="1">⭐ - Poor</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label for="reviewFeedback">Feedback</label>
                            <textarea id="reviewFeedback" rows="3" placeholder="Enter feedback..."></textarea>
                        </div>
                        
                        <div class="modal-buttons">
                            <button id="submitReviewBtn" class="btn btn-success">Submit Review</button>
                            <button id="cancelReviewBtn" class="btn btn-danger">Cancel</button>
                        </div>
                    </div>
                `;
                
                document.body.appendChild(modal);
                
                // Submit Review
                document.getElementById('submitReviewBtn').addEventListener('click', function() {
                    const name = document.getElementById('reviewEmployeeName').value.trim();
                    const department = document.getElementById('reviewDepartment').value.trim();
                    const position = document.getElementById('reviewPosition').value.trim();
                    const rating = document.getElementById('reviewRating').value;
                    const feedback = document.getElementById('reviewFeedback').value.trim();
                    
                    if (!name) {
                        showNotification('Please enter employee name', 'error');
                        document.getElementById('reviewEmployeeName').focus();
                        return;
                    }
                    
                    const newReview = {
                        employeeId: Date.now(),
                        name: name,
                        department: department || 'General',
                        position: position || 'Employee',
                        rating: parseFloat(rating),
                        feedback: feedback || 'No additional feedback provided.'
                    };
                    
                    console.log('New review added:', newReview);
                    showNotification(`✅ Review added for ${name}`, 'success');
                    modal.remove();
                    if (typeof loadReviews === 'function') loadReviews();
                });
                
                // Cancel Review
                document.getElementById('cancelReviewBtn').addEventListener('click', function() {
                    modal.remove();
                });
                
                // Close on background click
                modal.addEventListener('click', function(e) {
                    if (e.target === modal) modal.remove();
                });
            });
        }
        
        // Sort Button
        if (sortBtn) {
            sortBtn.addEventListener('click', function(e) {
                e.preventDefault();
                let sortDropdown = document.getElementById('sortDropdown');
                
                if (!sortDropdown) {
                    sortDropdown = document.createElement('div');
                    sortDropdown.id = 'sortDropdown';
                    
                    const rect = sortBtn.getBoundingClientRect();
                    sortDropdown.style.cssText = `
                        position: fixed;
                        top: ${rect.bottom + 8}px;
                        right: ${window.innerWidth - rect.right}px;
                        background: #0f172a;
                        border: 1px solid #1e293b;
                        border-radius: 16px;
                        padding: 0.75rem;
                        min-width: 200px;
                        box-shadow: 0 20px 60px rgba(0,0,0,0.5);
                        z-index: 1000;
                        animation: slideDown 0.3s ease;
                    `;
                    
                    const sortOptions = [
                        { value: 'rating-desc', label: '⭐ Rating (High to Low)' },
                        { value: 'rating-asc', label: '⭐ Rating (Low to High)' },
                        { value: 'name-asc', label: '👤 Name (A-Z)' },
                        { value: 'name-desc', label: '👤 Name (Z-A)' },
                        { value: 'date-desc', label: '📅 Newest First' },
                        { value: 'date-asc', label: '📅 Oldest First' }
                    ];
                    
                    sortDropdown.innerHTML = `
                        <div style="margin-bottom: 8px; font-weight: 600; color: #94a3b8; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em; padding: 0 0.5rem;">Sort Reviews By:</div>
                        ${sortOptions.map(opt => `
                            <button class="sort-option" data-sort="${opt.value}" style="display: block; width: 100%; padding: 0.6rem 0.8rem; background: none; border: none; text-align: left; cursor: pointer; border-radius: 10px; font-size: 0.9rem; color: #cbd5e1; transition: all 0.2s ease;">
                                ${opt.label}
                            </button>
                        `).join('')}
                    `;
                    
                    document.body.appendChild(sortDropdown);
                    
                    sortDropdown.querySelectorAll('.sort-option').forEach(btn => {
                        btn.addEventListener('mouseenter', function() {
                            this.style.background = 'rgba(99, 102, 241, 0.15)';
                            this.style.color = '#fff';
                        });
                        btn.addEventListener('mouseleave', function() {
                            this.style.background = 'none';
                            this.style.color = '#cbd5e1';
                        });
                        
                        btn.addEventListener('click', function() {
                            const sortType = this.dataset.sort;
                            applySort(sortType);
                            sortDropdown.remove();
                            const label = this.textContent.trim();
                            sortBtn.textContent = `📊 ${label.split(' ').slice(0,2).join(' ')}`;
                            showNotification(`Sorted by: ${label}`, 'success');
                        });
                    });
                    
                    sortBtn.textContent = '✖ Close';
                } else {
                    sortDropdown.remove();
                    sortBtn.textContent = '📊 Sort';
                }
            });
        }
    }
}

// ============================================
// ANIMATION STYLES (injected if missing)
// ============================================

(function injectStyles() {
    if (document.getElementById('dynamic-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'dynamic-styles';
    style.textContent = `
        /* Additional animations and styles not in main CSS */
        @keyframes slideDown {
            from { opacity: 0; transform: translateY(-20px) scale(0.95); }
            to { opacity: 1; transform: translateY(0) scale(1); }
        }
        
        @keyframes slideInRight {
            from { opacity: 0; transform: translateX(100px); }
            to { opacity: 1; transform: translateX(0); }
        }
        
        @keyframes slideOutRight {
            from { opacity: 1; transform: translateX(0); }
            to { opacity: 0; transform: translateX(100px); }
        }
        
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        
        /* Review Modal Styles */
        #reviewModal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            backdrop-filter: blur(8px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            animation: fadeIn 0.3s ease;
        }
        
        #reviewModal .modal-content {
            background: linear-gradient(145deg, #1a2332, #0f172a);
            border-radius: 20px;
            padding: 2rem;
            max-width: 520px;
            width: 92%;
            max-height: 90vh;
            overflow-y: auto;
            border: 1px solid #1e293b;
            box-shadow: 0 30px 80px rgba(0, 0, 0, 0.6);
            animation: slideDown 0.3s ease;
        }
        
        #reviewModal .modal-content::-webkit-scrollbar {
            width: 6px;
        }
        
        #reviewModal .modal-content::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.05);
            border-radius: 10px;
        }
        
        #reviewModal .modal-content::-webkit-scrollbar-thumb {
            background: #6366f1;
            border-radius: 10px;
        }
        
        #reviewModal h2 {
            text-align: center;
            margin-bottom: 0.5rem;
            font-size: 1.5rem;
            font-weight: 700;
            background: linear-gradient(135deg, #6366f1, #8b5cf6);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        
        #reviewModal .modal-subtitle {
            text-align: center;
            color: #94a3b8;
            margin-bottom: 1.5rem;
            font-size: 0.95rem;
        }
        
        #reviewModal .form-group {
            margin-bottom: 1.25rem;
        }
        
        #reviewModal .form-group label {
            display: block;
            margin-bottom: 0.5rem;
            font-weight: 600;
            color: #cbd5e1;
            font-size: 0.85rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }
        
        #reviewModal .form-group input,
        #reviewModal .form-group select,
        #reviewModal .form-group textarea {
            width: 100%;
            padding: 0.75rem 1rem;
            border: 1px solid #1e293b;
            border-radius: 12px;
            background: #0f172a;
            color: #f8fafc;
            font-size: 0.95rem;
            transition: all 0.3s ease;
            font-family: inherit;
        }
        
        #reviewModal .form-group input:focus,
        #reviewModal .form-group select:focus,
        #reviewModal .form-group textarea:focus {
            outline: none;
            border-color: #6366f1;
            background: #1a2332;
            box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.15);
        }
        
        #reviewModal .form-group input::placeholder,
        #reviewModal .form-group textarea::placeholder {
            color: #64748b;
        }
        
        #reviewModal .form-group textarea {
            resize: vertical;
            min-height: 80px;
        }
        
        #reviewModal .form-group select option {
            background: #0f172a;
            color: #f8fafc;
        }
        
        #reviewModal .modal-buttons {
            display: flex;
            gap: 1rem;
            margin-top: 1.5rem;
        }
        
        #reviewModal .modal-buttons .btn {
            flex: 1;
            justify-content: center;
            padding: 0.9rem;
        }
        
        /* Attendance Badge Styles - Dark Theme */
        .attendance-badge {
            display: inline-block;
            padding: 0.35rem 0.7rem;
            border-radius: 999px;
            margin: 0.2rem 0.2rem 0.2rem 0;
            font-size: 0.82rem;
            font-weight: 600;
        }
        
        .attendance-badge.present {
            background: rgba(16, 185, 129, 0.2);
            color: #6ee7b7;
            border: 1px solid rgba(16, 185, 129, 0.3);
        }
        
        .attendance-badge.absent {
            background: rgba(239, 68, 68, 0.2);
            color: #fca5a5;
            border: 1px solid rgba(239, 68, 68, 0.3);
        }
        
        /* Responsive for modals */
        @media (max-width: 640px) {
            #reviewModal .modal-content {
                padding: 1.5rem;
                width: 95%;
            }
            #reviewModal .modal-buttons {
                flex-direction: column;
            }
            .visual-grid {
                grid-template-columns: 1fr !important;
            }
            .attendance-table {
                font-size: 0.8rem;
            }
            .attendance-table th,
            .attendance-table td {
                padding: 8px 10px !important;
            }
        }
    `;
    document.head.appendChild(style);
})();

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Initializing ModernTech HR System...');
    console.log(`📄 Current page: ${isAttendancePage ? 'Attendance' : isReviewsPage ? 'Reviews' : 'Other'}`);
    
    try {
        highlightActiveNav();
        initializeButtons();
        loadAttendanceData();
        loadReviews();
        
        // Close dropdowns on outside click
        document.addEventListener('click', function(e) {
            ['filterDropdown', 'sortDropdown'].forEach(id => {
                const dropdown = document.getElementById(id);
                const btn = id === 'filterDropdown' ? document.getElementById('filterBtn') : document.querySelector('.topbar-actions .btn-secondary');
                if (dropdown && btn && !btn.contains(e.target) && !dropdown.contains(e.target)) {
                    dropdown.remove();
                    if (id === 'filterDropdown' && btn) btn.textContent = '🔍 Filter';
                    if (id === 'sortDropdown' && btn) btn.textContent = '📊 Sort';
                }
            });
        });
        
        console.log('✅ Dashboard initialized successfully');
    } catch (error) {
        console.error('❌ Failed to initialize dashboard:', error);
    }
});

// ============================================
// DEBUG EXPOSURE
// ============================================

window.debug = {
    loadAttendanceData,
    loadReviews,
    showNotification,
    applyFilters,
    clearFilters,
    applySort,
    COLORS
};