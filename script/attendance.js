const attendanceSection = document.getElementById('attendance-data');
const visualsSection = document.getElementById('attendance-visuals');

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
        }
    ]
};

function highlightActiveNav() {
    document.querySelectorAll('.nav-links a').forEach((link) => {
        const href = link.getAttribute('href') || '';
        const isActive = href.toLowerCase().includes('attendance');
        link.closest('li')?.classList.toggle('active', isActive);
    });
}

function getAttendanceMarkup(attendance = []) {
    if (!attendance || !attendance.length) {
        return '<span class="muted">No data</span>';
    }

    return attendance.map((item) => {
        const statusClass = (item.status || 'unknown').toLowerCase();
        return `<div class="attendance-badge ${statusClass}">${item.date} • ${item.status || 'Unknown'}</div>`;
    }).join('');
}

function getScheduleTimes(record) {
    const baseHour = 8 + ((record.employeeId - 1) % 3);
    const checkInTime = record.checkIn || `${String(baseHour).padStart(2, '0')}:00`;
    const checkOutTime = record.checkOut || `${String(baseHour + 8).padStart(2, '0')}:30`;

    return { checkInTime, checkOutTime };
}

function renderVisuals(records = []) {
    if (!visualsSection) return;

    const allAttendance = records.flatMap((record) => record.attendance || []);
    const presentCount = allAttendance.filter((item) => (item.status || '').toLowerCase() === 'present').length;
    const absentCount = allAttendance.filter((item) => (item.status || '').toLowerCase() === 'absent').length;
    const totalCount = allAttendance.length || 1;

    const presentPercent = Math.round((presentCount / totalCount) * 100);
    const absentPercent = Math.round((absentCount / totalCount) * 100);

    const dailySummary = ['2025-07-25', '2025-07-26', '2025-07-27', '2025-07-28', '2025-07-29'].map((date) => {
        const dayRecords = allAttendance.filter((item) => item.date === date);
        const present = dayRecords.filter((item) => (item.status || '').toLowerCase() === 'present').length;
        const absent = dayRecords.filter((item) => (item.status || '').toLowerCase() === 'absent').length;
        return { date, present, absent };
    });

    visualsSection.innerHTML = `
        <div class="visuals-header">
            <h2>Attendance Overview</h2>
            <p>Live summary of presence and attendance trends.</p>
        </div>
        <div class="visual-grid">
            <div class="visual-card">
                <h3>Present Attendance</h3>
                <div class="stat-value">${presentPercent}%</div>
                <div class="stat-caption">${presentCount} of ${totalCount} check-ins</div>
            </div>
            <div class="visual-card">
                <h3>Absent Attendance</h3>
                <div class="stat-value">${absentPercent}%</div>
                <div class="stat-caption">${absentCount} of ${totalCount} check-ins</div>
            </div>
            <div class="visual-card">
                <h3>Present vs Absent</h3>
                <div class="bar-chart">
                    ${dailySummary.map((day) => `
                        <div class="bar-group">
                            <div class="bar-pair">
                                <div class="bar-fill present" style="height: ${Math.max(day.present * 18, 8)}px"></div>
                                <div class="bar-fill absent" style="height: ${Math.max(day.absent * 18, 8)}px"></div>
                            </div>
                            <div class="bar-label">${day.date.slice(5)}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
}

async function loadAttendanceData() {
    const dataSources = [
        'data/attendance.json',
        './data/attendance.json',
        '../data/attendance.json',
        '../M1 Project Module - Employee Dummy JSON Data/attendance.json'
    ];

    let data = null;

    for (const source of dataSources) {
        try {
            const response = await fetch(source);
            if (!response.ok) {
                continue;
            }

            data = await response.json();
            break;
        } catch (error) {
            continue;
        }
    }

    try {
        const records = (data && Array.isArray(data.attendanceAndLeave) ? data.attendanceAndLeave : fallbackAttendanceData.attendanceAndLeave) || [];

        renderVisuals(records);

        if (!attendanceSection) return;

        const table = document.createElement('table');
        table.className = 'attendance-table';

        table.innerHTML = `
            <thead>
                <tr>
                    <th>Employee ID</th>
                    <th>Name</th>
                    <th>Attendance</th>
                    <th>Check In</th>
                    <th>Check Out</th>
                </tr>
            </thead>
            <tbody></tbody>
        `;

        const tbody = table.querySelector('tbody');

        records.forEach((record) => {
            const attendanceSummary = getAttendanceMarkup(record.attendance);
            const { checkInTime, checkOutTime } = getScheduleTimes(record);

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${record.employeeId}</td>
                <td>${record.name}</td>
                <td>${attendanceSummary}</td>
                <td><span class="time-pill">${checkInTime}</span></td>
                <td><span class="time-pill">${checkOutTime}</span></td>
            `;
            tbody.appendChild(row);
        });

        attendanceSection.innerHTML = '';
        attendanceSection.appendChild(table);
    } catch (error) {
        const records = fallbackAttendanceData.attendanceAndLeave || [];
        renderVisuals(records);

        if (!attendanceSection) return;

        const table = document.createElement('table');
        table.className = 'attendance-table';

        table.innerHTML = `
            <thead>
                <tr>
                    <th>Employee ID</th>
                    <th>Name</th>
                    <th>Attendance</th>
                    <th>Check In</th>
                    <th>Check Out</th>
                </tr>
            </thead>
            <tbody></tbody>
        `;

        const tbody = table.querySelector('tbody');

        records.forEach((record) => {
            const attendanceSummary = getAttendanceMarkup(record.attendance);
            const { checkInTime, checkOutTime } = getScheduleTimes(record);

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${record.employeeId}</td>
                <td>${record.name}</td>
                <td>${attendanceSummary}</td>
                <td><span class="time-pill">${checkInTime}</span></td>
                <td><span class="time-pill">${checkOutTime}</span></td>
            `;
            tbody.appendChild(row);
        });

        attendanceSection.innerHTML = '';
        attendanceSection.appendChild(table);
    }
}

highlightActiveNav();
loadAttendanceData();