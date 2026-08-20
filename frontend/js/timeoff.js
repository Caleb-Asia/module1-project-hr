// ============================================
// timeoff.js - CHAD_DEV (Fixed Employee Dropdown)
// ============================================
import { API_BASE, showNotification } from './main.js';

document.addEventListener('DOMContentLoaded', () => {
    console.log("[Time Off] Initializing...");

    // --- DOM Elements ---
    const btnNewRequest = document.querySelector('.btn-new-request');
    const modalOverlay = document.querySelector('.modal-overlay');
    const btnModalCancel = document.querySelector('.btn-modal-cancel');
    const closeModalBtn = document.querySelector('.close-modal-btn');
    const timeOffForm = document.getElementById('timeOffForm');

    const leaveRequestsList = document.getElementById('leaveRequestsList');
    const pendingCount = document.getElementById('pendingCount');
    const approvedCount = document.getElementById('approvedCount');
    const rejectedCount = document.getElementById('rejectedCount');
    const tabBtns = document.querySelectorAll('.tab-btn');
    const employeeSelect = document.getElementById('employeeSelect');

    // --- Helper: Get JWT Token for API Calls ---
    function getAuthHeaders() {
        const token = localStorage.getItem('token');
        const headers = { 'Content-Type': 'application/json' };
        if (token && token !== 'undefined' && token !== 'null') {
            headers['Authorization'] = `Bearer ${token}`;
        }
        return headers;
    }

    // --- 1. MODAL LOGIC & DROPDOWN FIX ---
    if (btnNewRequest && modalOverlay) {
        btnNewRequest.addEventListener('click', async () => {
            // ✅ FIX: Populate the dropdown BEFORE opening the modal
            await loadEmployeeDropdown();
            modalOverlay.classList.add('active');
        });
    }

    // ✅ FIX: Fetch employees and populate the dropdown
    async function loadEmployeeDropdown() {
        if (!employeeSelect) return;
        
        try {
            const response = await fetch(`${API_BASE}/api/employees`, {
                headers: getAuthHeaders()
            });

            if (!response.ok) throw new Error("Failed to fetch employees");

            const employees = await response.json();

            // Clear existing options (keep the first "Select employee..." placeholder)
            employeeSelect.innerHTML = `<option value="">Select employee...</option>`;

            // Add each employee to the dropdown
            employees.forEach(emp => {
                const option = document.createElement('option');
                option.value = emp.id; // Use the database ID
                option.textContent = emp.name; // Use the full name
                employeeSelect.appendChild(option);
            });

        } catch (error) {
            console.error("Error loading employee dropdown:", error);
            showNotification("Failed to load employee list.", "error");
        }
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

    // --- 2. FETCH AND RENDER TIME OFF DATA ---
    async function loadTimeOffData() {
        try {
            const response = await fetch(`${API_BASE}/api/timeoff`, {
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

            const requests = await response.json();
            
            window.timeOffRequests = requests;

            renderLeaveRequests(requests);
            updateLeaveRequestCounts(requests);

        } catch (error) {
            console.error("[Time Off] Error fetching data:", error);
            if (leaveRequestsList) {
                leaveRequestsList.innerHTML = `<div style="padding: 2rem; text-align: center; color: #94a3b8;">Failed to load requests.</div>`;
            }
            showNotification('Failed to load time off requests.', 'error');
        }
    }

    function renderLeaveRequests(requests) {
        if (!leaveRequestsList) return;

        if (!requests || requests.length === 0) {
            leaveRequestsList.innerHTML = `<div style="padding: 2rem; text-align: center; color: #94a3b8;">No leave requests found.</div>`;
            return;
        }

        const sorted = [...requests].sort((a, b) => new Date(b.start_date) - new Date(a.start_date));

        leaveRequestsList.innerHTML = sorted.map((request, index) => {
            const fullName = request.employee_name || "Unknown Employee";
            const initials = fullName.split(' ').map(name => name[0]).join('').slice(0, 2).toUpperCase();
            
            const statusClass = request.status.toLowerCase() === 'approved' ? 'badge-approved' 
                : request.status.toLowerCase() === 'rejected' ? 'badge-rejected' 
                : 'badge-pending';
            
            const isPending = request.status.toLowerCase() === 'pending';
            const bgClass = ['bg-red', 'bg-orange', 'bg-purple'][index % 3];

            return `
                <article class="request-card-item" data-request-id="${request.id}">
                    <div class="card-main-layout">
                        <div class="profile-section">
                            <div class="avatar ${bgClass}">${initials}</div>
                            <div class="request-info-details">
                                <h3 class="employee-name">${fullName}</h3>
                                <p class="request-meta-data">${request.leave_type || 'Leave'} · ${new Date(request.start_date).toLocaleDateString('en-ZA')}</p>
                            </div>
                        </div>
                        <span class="badge ${statusClass}">${request.status}</span>
                    </div>
                    <p class="request-reason">"${request.reason || 'No reason provided'}"</p>
                    ${isPending ? `
                        <div class="action-buttons-group">
                            <button class="btn-action btn-approve" data-action="approve"><i class="bi bi-check-circle-fill"></i> Approve</button>
                            <button class="btn-action btn-reject" data-action="reject"><i class="bi bi-x-circle"></i> Reject</button>
                        </div>` 
                    : ''}
                </article>`;
        }).join('');
    }

    function updateLeaveRequestCounts(requests) {
        const approved = requests.filter(item => item.status.toLowerCase() === 'approved').length;
        const pending = requests.filter(item => item.status.toLowerCase() === 'pending').length;
        const rejected = requests.filter(item => item.status.toLowerCase() === 'rejected').length;

        if (pendingCount) pendingCount.textContent = pending;
        if (approvedCount) approvedCount.textContent = approved;
        if (rejectedCount) rejectedCount.textContent = rejected;
    }

    // --- 3. TABS FILTERING ---
    const applyRequestFilter = (filterValue) => {
        const requestCards = document.querySelectorAll('.request-card-item');
        const normalizedFilter = filterValue === 'rejected' ? 'rejected' : filterValue;

        requestCards.forEach(card => {
            const badge = card.querySelector('.badge');
            const statusText = badge ? badge.textContent.trim().toLowerCase() : '';
            card.style.display = normalizedFilter === 'all' || statusText === normalizedFilter ? 'flex' : 'none';
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

    // --- 4. APPROVE / REJECT LOGIC ---
    if (leaveRequestsList) {
        leaveRequestsList.addEventListener('click', async (event) => {
            const button = event.target.closest('.btn-action');
            if (!button) return;

            const card = button.closest('.request-card-item');
            if (!card) return;

            const requestId = card.getAttribute('data-request-id');
            const action = button.getAttribute('data-action');
            const empName = card.querySelector('.employee-name').textContent;

            const newStatus = action === 'approve' ? 'Approved' : 'Rejected';

            try {
                const response = await fetch(`${API_BASE}/api/timeoff/${requestId}`, {
                    method: 'PUT',
                    headers: getAuthHeaders(),
                    body: JSON.stringify({ status: newStatus })
                });

                if (!response.ok) {
                    const errData = await response.json();
                    throw new Error(errData.error || "Failed to update status");
                }

                showNotification(`${empName}'s request ${newStatus.toLowerCase()}!`, 'success');
                loadTimeOffData();

            } catch (error) {
                console.error("Error updating status:", error);
                showNotification(`Error: ${error.message}`, 'error');
            }
        });
    }

    // --- 5. SUBMIT NEW REQUEST FORM ---
    if (timeOffForm) {
        timeOffForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const employeeId = document.getElementById('employeeSelect').value;
            const leaveType = document.getElementById('leaveType').value;
            const startDate = document.getElementById('startDate').value;
            const endDate = document.getElementById('endDate').value;
            const reason = document.getElementById('reasonInput').value;

            if (!employeeId || !leaveType || !startDate || !endDate || !reason) {
                showNotification('Please fill out all required fields.', 'error');
                return;
            }

            try {
                const response = await fetch(`${API_BASE}/api/timeoff`, {
                    method: 'POST',
                    headers: getAuthHeaders(),
                    body: JSON.stringify({
                        employee_id: parseInt(employeeId),
                        leave_type: leaveType,
                        start_date: startDate,
                        end_date: endDate,
                        reason: reason
                    })
                });

                const data = await response.json();
                if (!response.ok) {
                    throw new Error(data.error || "Failed to submit request");
                }

                showNotification('Leave request submitted successfully!', 'success');
                closeModal();
                loadTimeOffData();

            } catch (error) {
                console.error("Error submitting request:", error);
                showNotification(`Error: ${error.message}`, 'error');
            }
        });
    }

    // --- 6. INITIAL LOAD ---
    loadTimeOffData();
});