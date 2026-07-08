/* ========================== */
/*          CHAD-DEV          */
/* ========================== */

// Line Graph Tooltip
document.addEventListener('DOMContentLoaded', () => {
    const trendSvg = document.querySelector('.trend-svg');
    const hoverGuide = document.querySelector('.hover-guide');
    const chartTooltip = document.querySelector('.chart-tooltip');
    const trendDots = document.querySelectorAll('.trend-dot');

    function showTooltip(dot) {
        const cx = dot.getAttribute('cx');
        const headcount = dot.getAttribute('data-value') || dot.id;
        const month = dot.getAttribute('data-month') || 'Month';

        if (hoverGuide) {
            hoverGuide.setAttribute('x1', cx);
            hoverGuide.setAttribute('x2', cx);
            hoverGuide.setAttribute('y1', '20');
            hoverGuide.setAttribute('y2', '180');
            hoverGuide.style.opacity = '1';
        }

        chartTooltip.innerHTML = `<strong>${month}</strong><br>Headcount: ${headcount}`;
        chartTooltip.classList.add('visible');

        const dotBounding = dot.getBoundingClientRect();
        chartTooltip.style.left = `${dotBounding.left + window.scrollX + 15}px`;
        chartTooltip.style.top = `${dotBounding.top + window.scrollY - 40}px`;
    }

    function hideTooltip() {
        if (hoverGuide) hoverGuide.style.opacity = '0';
        chartTooltip.classList.remove('visible');
        trendDots.forEach(dot => dot.classList.remove('is-active'));
    }

    if (trendSvg && chartTooltip) {
        trendDots.forEach(dot => {
            dot.addEventListener('mouseenter', () => {
                trendDots.forEach(item => item.classList.remove('is-active'));
                dot.classList.add('is-active');
                showTooltip(dot);
            });

            dot.addEventListener('mousemove', () => {
                showTooltip(dot);
            });

            dot.addEventListener('mouseleave', hideTooltip);
        });

        trendSvg.addEventListener('mouseleave', hideTooltip);
    }

    // Time Off Reequest Button and Modal
    const btnNewRequest = document.querySelector('.btn-new-request');
    const modalOverlay = document.querySelector('.modal-overlay');
    const btnModalCancel = document.querySelector('.btn-modal-cancel');
    const closeModalBtn = document.querySelector('.close-modal-btn');
    const timeOffForm = document.getElementById('timeOffForm');

    if (btnNewRequest && modalOverlay) {
        btnNewRequest.addEventListener('click', () => {
            modalOverlay.classList.add('active');
        });
    }

    const closeModal = () => {
        if (modalOverlay) {
            modalOverlay.classList.remove('active');
            if (timeOffForm) timeOffForm.reset();
        }
    };

    if (btnModalCancel) btnModalCancel.addEventListener('click', closeModal);
    if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
    if (modalOverlay) {
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) closeModal();
        });
    }

    const employeeSelect = document.getElementById('employeeSelect');
    const leaveRequestsList = document.getElementById('leaveRequestsList');
    const pendingCount = document.getElementById('pendingCount');
    const approvedCount = document.getElementById('approvedCount');
    const rejectedCount = document.getElementById('rejectedCount');

    let leaveRequestsData = [];

    const updateLeaveRequestCounts = () => {
        const approvedLeaves = leaveRequestsData.filter(item => item.status.toLowerCase() === 'approved').length;
        const pendingLeaves = leaveRequestsData.filter(item => item.status.toLowerCase() === 'pending').length;
        const rejectedLeaves = leaveRequestsData.filter(item => item.status.toLowerCase() === 'denied').length;

        if (pendingCount) pendingCount.textContent = pendingLeaves;
        if (approvedCount) approvedCount.textContent = approvedLeaves;
        if (rejectedCount) rejectedCount.textContent = rejectedLeaves;
    };

    const renderLeaveRequests = () => {
        if (!leaveRequestsList) return;

        leaveRequestsList.innerHTML = leaveRequestsData.map((request, index) => {
            const initials = request.employeeName.split(' ').map(name => name[0]).join('').slice(0, 2).toUpperCase();
            const statusClass = request.status.toLowerCase() === 'approved'
                ? 'badge-approved'
                : request.status.toLowerCase() === 'denied'
                    ? 'badge-rejected'
                    : 'badge-pending';
            const actionMarkup = request.status.toLowerCase() === 'pending'
                ? `<div class="action-buttons-group" data-request-index="${index}"><button class="btn-action btn-approve" data-action="approve"><i class="bi bi-check-circle-fill"></i> Approve</button><button class="btn-action btn-reject" data-action="reject"><i class="bi bi-x-circle"></i> Reject</button></div>`
                : '';
            const bgClass = ['bg-red', 'bg-orange', 'bg-purple'][index % 3];

            return `
                        <article class="request-card-item" data-request-index="${index}">
                            <div class="card-main-layout">
                                <div class="profile-section">
                                    <div class="avatar ${bgClass}">${initials}</div>
                                    <div class="request-info-details">
                                        <h3 class="employee-name">${request.employeeName}</h3>
                                        <p class="request-meta-data">${request.reason} · ${new Date(request.date).toLocaleDateString('en-ZA', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                    </div>
                                </div>
                                <span class="badge ${statusClass}">${request.status}</span>
                            </div>
                            <p class="request-reason">"${request.reason}"</p>
                            ${actionMarkup}
                        </article>`;
        }).join('');
    };

    const setRequestStatus = (index, newStatus) => {
        if (typeof leaveRequestsData[index] === 'undefined') return;
        leaveRequestsData[index].status = newStatus;
        updateLeaveRequestCounts();
        renderLeaveRequests();

        const activeFilterButton = document.querySelector('.tab-btn.active');
        if (activeFilterButton) {
            const filterValue = activeFilterButton.textContent.trim().toLowerCase();
            const requestCards = document.querySelectorAll('.request-card-item, .request-item');
            requestCards.forEach(card => {
                const badge = card.querySelector('.badge');
                const statusText = badge ? badge.textContent.trim().toLowerCase() : '';
                const normalizedFilter = filterValue === 'rejected' ? 'denied' : filterValue;
                card.style.display = normalizedFilter === 'all' || statusText === normalizedFilter ? 'flex' : 'none';
            });
        }
    };

    const handleLeaveRequestAction = (event) => {
        const button = event.target.closest('.btn-action');
        if (!button) return;

        const card = button.closest('.request-card-item');
        if (!card) return;

        const requestIndex = parseInt(card.getAttribute('data-request-index'), 10);
        const action = button.getAttribute('data-action');
        if (Number.isNaN(requestIndex) || !action) return;

        if (action === 'approve') {
            setRequestStatus(requestIndex, 'Approved');
        } else if (action === 'reject') {
            setRequestStatus(requestIndex, 'Denied');
        }
    };

    if (leaveRequestsList) {
        leaveRequestsList.addEventListener('click', handleLeaveRequestAction);
    }

    // Dashboard Data Loading
    const employeeCount = document.getElementById('employeeCount');
    const leaveCount = document.getElementById('leaveCount');
    const payrollValue = document.getElementById('payrollValue');
    const openRequestCount = document.getElementById('openRequestCount');
    const recentActivityList = document.getElementById('recentActivityList');
    const donutSegments = document.querySelectorAll('.donut-segment');
    const donutInfoCard = document.getElementById('donutInfoCard');
    const donutDeptName = document.getElementById('donutDeptName');
    const donutDeptPercent = document.getElementById('donutDeptPercent');
    const donutDeptRole = document.getElementById('donutDeptRole');
    const deptItems = document.querySelectorAll('.dept-item');

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

    const loadData = async () => {
        try {
            const [employeeResponse, attendanceResponse, payrollResponse] = await Promise.all([
                fetch('M1 Project Module - Employee Dummy JSON Data/employee_info.json'),
                fetch('M1 Project Module - Employee Dummy JSON Data/attendance.json'),
                fetch('M1 Project Module - Employee Dummy JSON Data/payroll_data.json')
            ]);

            const employees = (await employeeResponse.json()).employeeInformation || [];
            const attendanceData = (await attendanceResponse.json()).attendanceAndLeave || [];
            const payrollData = (await payrollResponse.json()).payrollData || [];

            if (employeeCount) employeeCount.textContent = employees.length;

            const leaveRequests = attendanceData.flatMap(employee =>
                (employee.leaveRequests || []).map(request => ({
                    ...request,
                    employeeName: employee.name,
                    employeeId: employee.employeeId
                }))
            );

            leaveRequestsData = leaveRequests;
            updateLeaveRequestCounts();
            if (leaveCount) leaveCount.textContent = leaveRequestsData.filter(item => item.status.toLowerCase() === 'approved').length;
            if (openRequestCount) openRequestCount.textContent = leaveRequestsData.filter(item => item.status.toLowerCase() === 'pending').length;

            const totalPayroll = payrollData.reduce((sum, item) => sum + item.finalSalary, 0);
            if (payrollValue) payrollValue.textContent = `R${totalPayroll.toLocaleString()}`;

            if (employeeSelect) {
                employees.forEach(employee => {
                    const option = document.createElement('option');
                    option.value = employee.name;
                    option.textContent = employee.name;
                    employeeSelect.appendChild(option);
                });
            }

            renderLeaveRequests();

            if (recentActivityList) {
                recentActivityList.innerHTML = leaveRequests.slice(0, 4).map((request, index) => {
                    const initials = request.employeeName.split(' ').map(name => name[0]).join('').slice(0, 2).toUpperCase();
                    const statusClass = request.status.toLowerCase() === 'approved' ? 'badge-approved' : request.status.toLowerCase() === 'denied' ? 'badge-rejected' : 'badge-pending';
                    const avatarClass = ['avatar-purple', 'avatar-orange', 'avatar-red', 'avatar-lightgreen'][index % 4];
                    return `
                        <div class="request-item">
                            <div class="request-profile">
                                <div class="avatar ${avatarClass}">${initials}</div>
                                <div class="request-details">
                                    <span class="employee-name">${request.employeeName}</span>
                                    <span class="request-meta">${request.reason} • ${new Date(request.date).toLocaleDateString('en-ZA', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                </div>
                            </div>
                            <span class="badge ${statusClass}">${request.status}</span>
                        </div>`;
                }).join('');
            }
        } catch (error) {
            console.error('Unable to load HR data:', error);
        }
    };

    loadData();

    if (timeOffForm) {
        timeOffForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const employeeName = document.getElementById('employeeSelect').value;
            const leaveType = document.getElementById('leaveType').value;
            const startDate = document.getElementById('startDate').value;
            const endDate = document.getElementById('endDate').value;
            const reason = document.getElementById('reasonInput').value;

            if (!employeeName || !leaveType || !startDate || !endDate || !reason) {
                alert('Please fill out all required fields.');
                return;
            }

            console.log('New Leave Request Submitted:', {
                employeeName,
                leaveType,
                startDate,
                endDate,
                reason
            });

            closeModal();
            alert('Leave request submitted successfully!');
        });
    }

    const tabBtns = document.querySelectorAll('.tab-btn');

    const applyRequestFilter = (filterValue) => {
        const requestCards = document.querySelectorAll('.request-card-item, .request-item');
        const normalizedFilter = filterValue === 'rejected' ? 'denied' : filterValue;

        requestCards.forEach(card => {
            const badge = card.querySelector('.badge');
            const statusText = badge ? badge.textContent.trim().toLowerCase() : '';

            if (normalizedFilter === 'all' || statusText === normalizedFilter) {
                card.style.display = 'flex';
            } else {
                card.style.display = 'none';
            }
        });
    };

    if (tabBtns.length > 0) {
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                tabBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const filterValue = btn.textContent.trim().toLowerCase();
                applyRequestFilter(filterValue);
            });
        });
    }
});

// LOGIN PAGE
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', function(event) {
        event.preventDefault();

        const user = document.getElementById('username').value.trim();
        const pass = document.getElementById('password').value.trim();

        if (user === 'admin' && pass === 'password123') {
            alert('Login successful! Redirecting...');
            window.location.href = 'dashboard.html';
        } else {
            alert('Incorrect password');
        }
    });
}

// Sign out button

document.addEventListener('DOMContentLoaded', () => {
    const signOutBtn = document.getElementById('signOutBtn');
    
    if (signOutBtn) {
        signOutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = 'login.html';
        });
    }
});