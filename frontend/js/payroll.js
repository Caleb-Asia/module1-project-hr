// ============================================
// payroll.js - BUTSHA_DEV (Connected to Backend)
// ============================================
import { API_BASE, toRand, showNotification } from './main.js';

document.addEventListener('DOMContentLoaded', () => {
    console.log("[Payroll] Initializing and fetching data...");

    // --- DOM References ---
    const payrollTableBody = document.getElementById('payrollTableBody');
    const grossPayrollEl = document.getElementById('grossPayroll');
    const totalDeductionsEl = document.getElementById('totalDeductions');
    const netPayrollEl = document.getElementById('netPayroll');
    const exportBtn = document.getElementById('exportAllBtn');
    const monthSelect = document.getElementById('monthSelect');

    // Chart Contexts
    const breakdownCtx = document.getElementById('payrollBreakdownChart');
    const topEarnersCtx = document.getElementById('topEarnersChart');

    // --- Helper: Get JWT Token for API Calls ---
    function getAuthHeaders() {
        const token = localStorage.getItem('token');
        const headers = { 'Content-Type': 'application/json' };
        if (token && token !== 'undefined' && token !== 'null') {
            headers['Authorization'] = `Bearer ${token}`;
        }
        return headers;
    }

    // --- 1. MAIN FETCH: Get Payroll Records ---
    async function loadPayrollData() {
        try {
            // Fetch the list of payroll records
            const recordResponse = await fetch(`${API_BASE}/api/payroll`, {
                headers: getAuthHeaders()
            });

            if (!recordResponse.ok) {
                if (recordResponse.status === 401) {
                    showNotification("Session expired. Please log in again.", "error");
                    setTimeout(() => window.location.href = 'index.html', 1500);
                    return;
                }
                throw new Error(`Server returned ${recordResponse.status}`);
            }

            const records = await recordResponse.json();

            // 🚨 FINAL FIX: Force the exact URL and add a cache-buster
            const summaryResponse = await fetch(`http://127.0.0.1:3000/api/payroll/summary?_t=${Date.now()}`, {
                headers: getAuthHeaders()
            });

            if (!summaryResponse.ok) {
                throw new Error(`Summary fetch failed with status ${summaryResponse.status}`);
            }

            const summary = await summaryResponse.json();

            // Render everything
            renderPayrollTable(records);
            updatePayrollSummary(summary);
            renderPayrollCharts(records);

            console.log(`[Payroll] Loaded ${records.length} records`);

        } catch (error) {
            console.error("[Payroll] Error fetching data:", error);
            if (payrollTableBody) {
                payrollTableBody.innerHTML = `<tr><td colspan="6" style="padding: 2rem; text-align: center; color: #ef4444;">Failed to load payroll data. Is the backend running?</td></tr>`;
            }
            showNotification('Failed to load payroll data.', 'error');
        }
    }

    // --- 2. RENDER: Payroll Table ---
    function renderPayrollTable(records) {
        if (!payrollTableBody) return;

        if (!records || records.length === 0) {
            payrollTableBody.innerHTML = `<tr><td colspan="6" style="padding: 2rem; text-align: center; color: #94a3b8;">No payroll records found.</td></tr>`;
            return;
        }

        payrollTableBody.innerHTML = records.map(emp => `
            <tr data-employee-id="${emp.employeeId}">
                <td>
                    <div class="employee-cell">
                        <div class="employee-avatar-small" style="background: #6366f1;">
                            ${(emp.employee_name || 'UN').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                            <p class="employee-name">${emp.employee_name || 'Unknown'}</p>
                            <p class="employee-dept">${emp.department || 'General'}</p>
                        </div>
                    </div>
                </td>
                <td class="mono">${toRand(emp.gross || 0)}</td>
                <td class="text-red mono">-${toRand(emp.tax || 0)}</td>
                <td class="text-red mono">-${toRand(emp.uif || 0)}</td>
                <td class="text-teal mono font-bold">${toRand(emp.calculatedNetPay || 0)}</td>
                <td>
                    <button type="button" class="btn-table" data-payslip-id="${emp.employeeId}">
                        <i class="fa-regular fa-file-lines"></i> Payslip
                    </button>
                </td>
            </tr>
        `).join('');

        // Attach Payslip Click Events
        payrollTableBody.querySelectorAll('.btn-table[data-payslip-id]').forEach((btn) => {
            btn.addEventListener('click', () => {
                const empId = parseInt(btn.dataset.payslipId);
                openPayslip(empId, records);
            });
        });
    }

    // --- 3. RENDER: Payroll Summary Cards ---
    function updatePayrollSummary(summary) {
        if (!summary) return;

        const deductions = summary.totalDeductions || (summary.totalGross - summary.totalNet);

        if (grossPayrollEl) grossPayrollEl.textContent = toRand(summary.totalGross || 0);
        if (totalDeductionsEl) totalDeductionsEl.textContent = toRand(deductions || 0);
        if (netPayrollEl) netPayrollEl.textContent = toRand(summary.totalNet || 0);
    }

    // --- 4. RENDER: Payroll Charts ---
    function renderPayrollCharts(records) {
        // Only run if Chart library is available
        if (typeof Chart === 'undefined') return;

        // 4A. Payroll Breakdown Doughnut Chart
        if (breakdownCtx) {
            if (window.breakdownChartInstance) {
                window.breakdownChartInstance.destroy();
            }

            const totals = records.reduce((acc, e) => {
                acc.net += e.calculatedNetPay || 0;
                acc.tax += e.tax || 0;
                acc.uif += e.uif || 0;
                return acc;
            }, { net: 0, tax: 0, uif: 0 });

            window.breakdownChartInstance = new Chart(breakdownCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Net Pay', 'PAYE Tax', 'UIF'],
                    datasets: [{
                        data: [totals.net, totals.tax, totals.uif],
                        backgroundColor: ['#10B981', '#EF4444', '#F59E0B'],
                        borderColor: '#0f172a',
                        borderWidth: 2,
                        hoverOffset: 8,
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: '68%',
                    rotation: -90,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: { color: '#cbd5e1', padding: 16, boxWidth: 12, font: { size: 12, weight: '600' } }
                        },
                        title: {
                            display: true,
                            text: 'Company Payroll Breakdown',
                            color: '#f8fafc',
                            font: { size: 18, weight: '700' },
                            padding: { bottom: 16 }
                        }
                    }
                }
            });
        }

        // 4B. Top 5 Earners Bar Chart
        if (topEarnersCtx) {
            if (window.topEarnersChartInstance) {
                window.topEarnersChartInstance.destroy();
            }

            const top5 = [...records]
                .sort((a, b) => (b.calculatedNetPay || 0) - (a.calculatedNetPay || 0))
                .slice(0, 5);

            window.topEarnersChartInstance = new Chart(topEarnersCtx, {
                type: 'bar',
                data: {
                    labels: top5.map(e => (e.employee_name || 'Employee').split(' ')[0]),
                    datasets: [{
                        label: 'Net Pay',
                        data: top5.map(e => e.calculatedNetPay || 0),
                        backgroundColor: ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b'],
                        borderRadius: 10,
                        borderSkipped: false,
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        title: {
                            display: true,
                            text: 'Top 5 Earners by Net Pay',
                            color: '#f8fafc',
                            font: { size: 18, weight: '700' },
                            padding: { bottom: 16 }
                        }
                    },
                    scales: {
                        x: {
                            grid: { display: false },
                            ticks: { color: '#cbd5e1', font: { size: 12 } }
                        },
                        y: {
                            beginAtZero: true,
                            grid: { color: 'rgba(255, 255, 255, 0.08)' },
                            ticks: {
                                color: '#cbd5e1',
                                font: { size: 12 },
                                callback: (v) => toRand(v)
                            }
                        }
                    }
                }
            });
        }
    }

    // --- 5. PAYSLIP MODAL LOGIC ---
    let activePayslipData = null;

    function openPayslip(empId, allRecords) {
        const data = allRecords.find(e => e.employeeId === empId);
        if (!data) return showNotification("Employee record not found", "error");

        activePayslipData = data;

        const overlay = document.getElementById('payslipModalOverlay');
        const content = document.getElementById('payslipContent');
        const title = document.getElementById('payslipTitle');

        if (!overlay || !content) {
            console.error("[Payslip] Modal elements missing");
            return showToast("Payslip modal error", "error");
        }

        title.textContent = `${data.employee_name || 'Employee'} - Payslip`;
        
        content.innerHTML = `
            <div class="atm-slip-preview">
                <pre style="font-family: 'Courier New', monospace; font-size: 12px; line-height: 1.3; margin: 0; white-space: pre;">
                    MODERNTECH HR
                    PAYSLIP - ${new Date().toLocaleDateString('en-ZA', { month: 'long', year: 'numeric' })}
                    ----------------------------------------
                    Employee:   ${data.employee_name || 'Unknown'}
                    Dept:       ${data.department || 'General'}
                    ----------------------------------------
                    Gross Pay:  ${toRand(data.gross || 0)}
                    PAYE Tax:   ${toRand(data.tax || 0)}
                    UIF:        ${toRand(data.uif || 0)}
                    ----------------------------------------
                    NET PAY:    ${toRand(data.calculatedNetPay || 0)}
                    ----------------------------------------
                </pre>
            </div>
        `;

        overlay.classList.add('active');
        overlay.style.display = 'flex';
        document.body.style.overflow = 'hidden';

        const closeBtn = document.getElementById('closePayslipBtn');
        const downloadBtn = document.getElementById('downloadPayslipBtn');
        const emailBtn = document.getElementById('emailPayslipBtn');

        if (closeBtn) {
            closeBtn.onclick = closePayslip;
        }
        if (overlay) {
            overlay.onclick = (e) => {
                if (e.target === overlay) closePayslip();
            };
        }
        if (downloadBtn) {
            downloadBtn.onclick = () => showNotification("Payslip downloaded (simulated)", "success");
        }
        if (emailBtn) {
            emailBtn.onclick = () => showNotification("Payslip emailed to employee (simulated)", "success");
        }
    }

    function closePayslip() {
        const overlay = document.getElementById('payslipModalOverlay');
        if (overlay) {
            overlay.classList.remove('active');
            overlay.style.display = 'none';
            document.body.style.overflow = '';
        }
        activePayslipData = null;
    }

    // --- 6. EVENT LISTENERS ---
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            showNotification("Export started. (Simulated)", "success");
        });
    }

    if (monthSelect) {
        monthSelect.addEventListener('change', (e) => {
            showNotification(`Switched to ${e.target.value}`, "info");
        });
    }

    // --- 7. INITIAL LOAD ---
    loadPayrollData();
});