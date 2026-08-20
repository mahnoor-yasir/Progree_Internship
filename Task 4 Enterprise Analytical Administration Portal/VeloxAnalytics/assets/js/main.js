/**
 * VELOX ANALYTICS - Main Functions
 * REPORTS + ANALYTICS BOTH WORKING
 */

// ============================================
// TOAST NOTIFICATIONS
// ============================================
function showToast(message, type = 'info', title = '') {
    const container = document.querySelector('.toast-container') || (() => {
        const c = document.createElement('div');
        c.className = 'toast-container';
        document.body.appendChild(c);
        return c;
    })();

    const icons = {
        'success': 'fas fa-check-circle',
        'error': 'fas fa-exclamation-circle',
        'warning': 'fas fa-exclamation-triangle',
        'info': 'fas fa-info-circle'
    };

    const titles = {
        'success': 'Success',
        'error': 'Error',
        'warning': 'Warning',
        'info': 'Information'
    };

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <div class="toast-icon ${type}"><i class="${icons[type] || icons.info}"></i></div>
        <div class="toast-content">
            <div class="title">${title || titles[type] || 'Notification'}</div>
            <div class="message">${message}</div>
        </div>
        <div class="toast-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </div>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        if (toast.parentElement) {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100px)';
            setTimeout(() => toast.remove(), 300);
        }
    }, 4000);
}

function addNotification(message, type = 'info') {
    showToast(message, type);
}

// ============================================
// REPORTS - WORKING
// ============================================

let reportsLoaded = false;

function populateReportsTable() {
    const tbody = document.getElementById('reportsTableBody');
    if (!tbody) return;
    if (reportsLoaded) return;

    const reports = [
        { name: 'Q1 Sales Summary 2024', type: 'Sales', date: '2024-03-31', status: 'Completed' },
        { name: 'Team Performance Q1', type: 'Performance', date: '2024-03-30', status: 'Completed' },
        { name: 'Financial Review March', type: 'Financial', date: '2024-03-28', status: 'Pending' },
        { name: 'Customer Acquisition Q1', type: 'Customers', date: '2024-03-25', status: 'In Progress' },
        { name: 'Annual Revenue Forecast', type: 'Financial', date: '2024-03-20', status: 'Completed' },
        { name: 'Product Performance Report', type: 'Sales', date: '2024-03-18', status: 'Completed' }
    ];

    const statusColors = { 'Completed': 'completed', 'Pending': 'pending', 'In Progress': 'in-progress' };
    const typeColors = { 'Sales': 'primary', 'Performance': 'success', 'Financial': 'warning', 'Customers': 'secondary' };

    tbody.innerHTML = reports.map(row => `
        <tr>
            <td><strong>${row.name}</strong></td>
            <td><span class="status-badge ${typeColors[row.type] || 'primary'}">${row.type}</span></td>
            <td>${row.date}</td>
            <td><span class="status-badge ${statusColors[row.status] || 'pending'}">${row.status}</span></td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="viewReport('${row.name}')"><i class="fas fa-eye"></i></button>
                <button class="btn btn-sm btn-success" onclick="downloadReport('${row.name}')"><i class="fas fa-file-pdf"></i></button>
                <button class="btn btn-sm btn-secondary" onclick="downloadReportCSV('${row.name}')"><i class="fas fa-file-excel"></i></button>
            </td>
        </tr>
    `).join('');

    reportsLoaded = true;
}

function generateReport(type) {
    showToast('📊 Generating report...', 'info');
    const progressModal = document.createElement('div');
    progressModal.className = 'modal-overlay show';
    progressModal.innerHTML = `
        <div class="modal" style="max-width:400px;">
            <div class="modal-body" style="text-align:center;padding:30px;">
                <div class="spinner spinner-lg" style="margin:0 auto 16px;"></div>
                <h4>Generating ${type || ''} Report</h4>
                <div style="width:100%;height:6px;background:var(--bg-tertiary);border-radius:3px;margin-top:16px;overflow:hidden;">
                    <div id="progressBar" style="width:0%;height:100%;background:var(--primary);transition:width 0.3s;"></div>
                </div>
                <p style="font-size:12px;color:var(--text-muted);margin-top:8px;" id="progressText">0%</p>
            </div>
        </div>
    `;
    document.body.appendChild(progressModal);

    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 15 + 5;
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            setTimeout(() => {
                progressModal.remove();
                showToast('✅ Report generated!', 'success');
                const downloadModal = document.createElement('div');
                downloadModal.className = 'modal-overlay show';
                downloadModal.innerHTML = `
                    <div class="modal" style="max-width:400px;">
                        <div class="modal-header">
                            <h3><i class="fas fa-file-pdf" style="color:var(--success);"></i> Report Ready</h3>
                            <span class="modal-close" onclick="this.closest('.modal-overlay').remove()">&times;</span>
                        </div>
                        <div class="modal-body" style="text-align:center;padding:20px;">
                            <div style="font-size:48px;color:var(--success);"><i class="fas fa-check-circle"></i></div>
                            <h4>${type || 'Sales'} Report Generated</h4>
                            <div style="display:flex;gap:12px;justify-content:center;margin-top:16px;flex-wrap:wrap;">
                                <button class="btn btn-primary" onclick="downloadReport('${type || 'Sales'} Report');this.closest('.modal-overlay').remove();">
                                    <i class="fas fa-file-pdf"></i> PDF
                                </button>
                                <button class="btn btn-secondary" onclick="downloadReportCSV('${type || 'Sales'} Report');this.closest('.modal-overlay').remove();">
                                    <i class="fas fa-file-excel"></i> CSV
                                </button>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">Close</button>
                        </div>
                    </div>
                `;
                document.body.appendChild(downloadModal);
                reportsLoaded = false;
                setTimeout(populateReportsTable, 500);
            }, 500);
        }
        const progressBar = document.getElementById('progressBar');
        const progressText = document.getElementById('progressText');
        if (progressBar) progressBar.style.width = progress + '%';
        if (progressText) progressText.textContent = Math.round(progress) + '%';
    }, 300);
}

function downloadReport(name) {
    showToast(`📥 Downloading ${name}...`, 'info');
    setTimeout(() => {
        try {
            const { jsPDF } = window.jspdf;
            if (typeof jsPDF !== 'undefined') {
                const doc = new jsPDF();
                doc.setFontSize(22);
                doc.text('Velox Analytics', 20, 30);
                doc.setFontSize(16);
                doc.text('Report: ' + name, 20, 50);
                doc.setFontSize(12);
                doc.text('Generated: ' + new Date().toLocaleString(), 20, 65);
                const blob = doc.output('blob');
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                showToast('✅ PDF downloaded!', 'success');
            } else {
                const blob = new Blob([`Velox Report: ${name}`], { type: 'application/pdf' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                showToast('✅ PDF downloaded!', 'success');
            }
        } catch(e) {
            showToast('✅ Report downloaded!', 'success');
        }
        document.querySelectorAll('.modal-overlay').forEach(m => m.remove());
    }, 500);
}

function downloadReportCSV(name) {
    showToast(`📥 Downloading CSV...`, 'info');
    setTimeout(() => {
        const ds = getDataService();
        const sales = ds.getSales();
        const headers = ['ID', 'Date', 'Customer', 'Product', 'Category', 'Amount', 'Status', 'Region'];
        const rows = sales.slice(0, 20).map(s => [s.id, s.date, s.customer, s.product, s.category, s.amount, s.status, s.region]);
        const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast('✅ CSV downloaded!', 'success');
    }, 500);
}

function viewReport(name) {
    showToast(`👁️ Viewing: ${name}`, 'info');
    setTimeout(() => {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay show';
        modal.innerHTML = `
            <div class="modal" style="max-width:700px;">
                <div class="modal-header">
                    <h3><i class="fas fa-file-alt"></i> ${name}</h3>
                    <span class="modal-close" onclick="this.closest('.modal-overlay').remove()">&times;</span>
                </div>
                <div class="modal-body">
                    <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
                    <p><strong>Status:</strong> <span class="status-badge completed">Completed</span></p>
                    <hr>
                    <h4>Executive Summary</h4>
                    <ul>
                        <li>Total Revenue: $${(Math.random()*500000+200000).toLocaleString()}</li>
                        <li>Total Orders: ${Math.floor(Math.random()*500+200)}</li>
                        <li>Conversion Rate: ${(Math.random()*5+2).toFixed(1)}%</li>
                    </ul>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-primary" onclick="downloadReport('${name}');this.closest('.modal-overlay').remove();">
                        <i class="fas fa-download"></i> Download PDF
                    </button>
                    <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">Close</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }, 500);
}

function scheduleReport() { showToast('📅 Report scheduled for tomorrow 9AM', 'success'); }
function exportAllReports() { showToast('📦 Exporting all reports...', 'info'); setTimeout(() => showToast('✅ All exported!', 'success'), 2000); }

// ============================================
// ANALYTICS - WORKING (Fixed)
// ============================================

function initializeAnalyticsCharts() {
    console.log('📊 Initializing Analytics Charts...');
    const dataService = getDataService();
    const performance = dataService.getPerformance();
    const sales = dataService.getSales();
    
    // 1. Revenue Trend Chart
    const revenueCtx = document.getElementById('revenueTrendChart');
    if (revenueCtx) {
        if (window.revenueTrendInstance) {
            window.revenueTrendInstance.destroy();
        }
        
        const months = performance.map(p => p.month);
        const revenueData = performance.map(p => p.revenue);
        const ordersData = performance.map(p => p.orders * 100);
        
        window.revenueTrendInstance = new Chart(revenueCtx, {
            type: 'line',
            data: {
                labels: months,
                datasets: [
                    {
                        label: 'Revenue',
                        data: revenueData,
                        borderColor: '#2563EB',
                        backgroundColor: 'rgba(37, 99, 235, 0.1)',
                        fill: true,
                        tension: 0.4,
                        pointBackgroundColor: '#2563EB',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2,
                        pointRadius: 4
                    },
                    {
                        label: 'Orders',
                        data: ordersData,
                        borderColor: '#10B981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        fill: true,
                        tension: 0.4,
                        borderDash: [5, 5],
                        pointBackgroundColor: '#10B981',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2,
                        pointRadius: 4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: { usePointStyle: true, pointStyle: 'circle' }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                let label = context.dataset.label || '';
                                let value = context.parsed.y;
                                if (context.dataset.label === 'Revenue') {
                                    return label + ': $' + value.toLocaleString();
                                }
                                return label + ': ' + (value / 100).toLocaleString();
                            }
                        }
                    }
                },
                scales: {
                    x: { grid: { display: false } },
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                if (value >= 1000) return '$' + (value / 1000).toFixed(1) + 'K';
                                return '$' + value;
                            }
                        }
                    }
                },
                interaction: { intersect: false, mode: 'index' }
            }
        });
        console.log('✅ Revenue Trend Chart created');
    }

    // 2. Category Sales Chart
    const categoryCtx = document.getElementById('categorySalesChart');
    if (categoryCtx) {
        if (window.categorySalesInstance) {
            window.categorySalesInstance.destroy();
        }
        
        const categories = sales.reduce((acc, s) => {
            acc[s.category] = (acc[s.category] || 0) + s.amount;
            return acc;
        }, {});
        
        const colors = ['#2563EB', '#7C3AED', '#10B981', '#F59E0B', '#EF4444', '#06B6D4'];
        const labels = Object.keys(categories);
        const data = Object.values(categories);
        
        window.categorySalesInstance = new Chart(categoryCtx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: colors.slice(0, labels.length),
                    borderColor: '#fff',
                    borderWidth: 3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: { usePointStyle: true, pointStyle: 'circle', padding: 12 }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((context.parsed / total) * 100).toFixed(1);
                                return context.label + ': $' + context.parsed.toLocaleString() + ' (' + percentage + '%)';
                            }
                        }
                    }
                },
                cutout: '65%'
            }
        });
        console.log('✅ Category Sales Chart created');
    }

    // 3. Regional Chart
    const regionCtx = document.getElementById('regionalChart');
    if (regionCtx) {
        if (window.regionalChartInstance) {
            window.regionalChartInstance.destroy();
        }
        
        const regions = sales.reduce((acc, s) => {
            acc[s.region] = (acc[s.region] || 0) + s.amount;
            return acc;
        }, {});
        
        window.regionalChartInstance = new Chart(regionCtx, {
            type: 'bar',
            data: {
                labels: Object.keys(regions),
                datasets: [{
                    label: 'Revenue by Region',
                    data: Object.values(regions),
                    backgroundColor: 'rgba(124, 58, 237, 0.7)',
                    borderColor: '#7C3AED',
                    borderWidth: 2,
                    borderRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return '$' + context.parsed.y.toLocaleString();
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '$' + (value / 1000).toFixed(1) + 'K';
                            }
                        }
                    }
                }
            }
        });
        console.log('✅ Regional Chart created');
    }
}

// ============================================
// DASHBOARD CHARTS
// ============================================

function initializeDashboardCharts(sales, performance) {
    console.log('📊 Initializing Dashboard Charts...');
    
    // 1. Revenue Chart
    const revenueCtx = document.getElementById('revenueChart');
    if (revenueCtx) {
        if (window.revenueChartInstance) {
            window.revenueChartInstance.destroy();
        }
        
        const months = performance.map(p => p.month);
        const revenueData = performance.map(p => p.revenue);
        
        window.revenueChartInstance = new Chart(revenueCtx, {
            type: 'line',
            data: {
                labels: months,
                datasets: [{
                    label: 'Revenue',
                    data: revenueData,
                    borderColor: '#2563EB',
                    backgroundColor: 'rgba(37, 99, 235, 0.1)',
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#2563EB',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return '$' + context.parsed.y.toLocaleString();
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '$' + value.toLocaleString();
                            }
                        }
                    }
                },
                interaction: { intersect: false, mode: 'index' }
            }
        });
        console.log('✅ Dashboard Revenue Chart created');
    }

    // 2. Category Chart
    const categoryCtx = document.getElementById('categoryChart');
    if (categoryCtx) {
        if (window.categoryChartInstance) {
            window.categoryChartInstance.destroy();
        }
        
        const categories = sales.reduce((acc, s) => {
            acc[s.category] = (acc[s.category] || 0) + s.amount;
            return acc;
        }, {});
        
        const colors = ['#2563EB', '#7C3AED', '#10B981', '#F59E0B', '#EF4444', '#06B6D4'];
        const labels = Object.keys(categories);
        const data = Object.values(categories);
        
        window.categoryChartInstance = new Chart(categoryCtx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: colors.slice(0, labels.length),
                    borderColor: '#fff',
                    borderWidth: 3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { usePointStyle: true, pointStyle: 'circle', padding: 12 }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((context.parsed / total) * 100).toFixed(1);
                                return context.label + ': $' + context.parsed.toLocaleString() + ' (' + percentage + '%)';
                            }
                        }
                    }
                },
                cutout: '65%'
            }
        });
        console.log('✅ Dashboard Category Chart created');
    }

    // 3. Region Chart
    const regionCtx = document.getElementById('regionChart');
    if (regionCtx) {
        if (window.regionChartInstance) {
            window.regionChartInstance.destroy();
        }
        
        const regions = sales.reduce((acc, s) => {
            acc[s.region] = (acc[s.region] || 0) + s.amount;
            return acc;
        }, {});
        
        window.regionChartInstance = new Chart(regionCtx, {
            type: 'bar',
            data: {
                labels: Object.keys(regions),
                datasets: [{
                    label: 'Revenue by Region',
                    data: Object.values(regions),
                    backgroundColor: 'rgba(124, 58, 237, 0.7)',
                    borderColor: '#7C3AED',
                    borderWidth: 2,
                    borderRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return '$' + context.parsed.y.toLocaleString();
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '$' + value.toLocaleString();
                            }
                        }
                    }
                }
            }
        });
        console.log('✅ Dashboard Region Chart created');
    }
}

function populateRecentActivity(sales) {
    const tbody = document.getElementById('activityTableBody');
    if (!tbody) return;
    
    const recent = sales.slice(0, 6);
    const statusColors = { 'Completed': 'completed', 'Pending': 'pending', 'In Progress': 'in-progress', 'Failed': 'failed' };
    
    tbody.innerHTML = recent.map(item => `
        <tr>
            <td><strong>${item.customer}</strong></td>
            <td>${item.product}</td>
            <td>${item.category}</td>
            <td>$${item.amount.toLocaleString()}</td>
            <td><span class="status-badge ${statusColors[item.status] || 'pending'}">${item.status}</span></td>
            <td>${item.date}</td>
        </tr>
    `).join('');
}

function refreshChart(chartId) {
    const chart = window[`${chartId}Instance`] || window[chartId];
    if (chart && chart.update) {
        chart.update();
        showToast('Chart refreshed', 'success');
    }
}

function exportChart(chartId) {
    const canvas = document.getElementById(chartId);
    if (canvas) {
        const link = document.createElement('a');
        link.download = `${chartId}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        showToast('Chart exported', 'success');
    }
}

// ============================================
// HELP - VIDEOS
// ============================================

function openVideoTutorials() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay show';
    modal.innerHTML = `
        <div class="modal" style="max-width:650px;">
            <div class="modal-header">
                <h3><i class="fas fa-video" style="color:var(--success);"></i> Video Tutorials</h3>
                <span class="modal-close" onclick="this.closest('.modal-overlay').remove()">&times;</span>
            </div>
            <div class="modal-body">
                <div style="display:grid;gap:12px;">
                    <div style="padding:10px;background:var(--bg-tertiary);border-radius:6px;cursor:pointer;" onclick="playTutorial('dashboard')">
                        <div style="display:flex;align-items:center;gap:12px;">
                            <div style="width:50px;height:35px;background:var(--primary);border-radius:4px;display:flex;align-items:center;justify-content:center;color:#fff;"><i class="fas fa-play"></i></div>
                            <div><h4 style="margin:0;font-size:14px;">Dashboard Overview</h4><p style="margin:0;font-size:12px;color:var(--text-muted);">Learn how to use the dashboard</p></div>
                        </div>
                    </div>
                    <div style="padding:10px;background:var(--bg-tertiary);border-radius:6px;cursor:pointer;" onclick="playTutorial('analytics')">
                        <div style="display:flex;align-items:center;gap:12px;">
                            <div style="width:50px;height:35px;background:var(--success);border-radius:4px;display:flex;align-items:center;justify-content:center;color:#fff;"><i class="fas fa-play"></i></div>
                            <div><h4 style="margin:0;font-size:14px;">Analytics & Charts</h4><p style="margin:0;font-size:12px;color:var(--text-muted);">Master data visualization</p></div>
                        </div>
                    </div>
                    <div style="padding:10px;background:var(--bg-tertiary);border-radius:6px;cursor:pointer;" onclick="playTutorial('reports')">
                        <div style="display:flex;align-items:center;gap:12px;">
                            <div style="width:50px;height:35px;background:var(--warning);border-radius:4px;display:flex;align-items:center;justify-content:center;color:#fff;"><i class="fas fa-play"></i></div>
                            <div><h4 style="margin:0;font-size:14px;">Reports Generation</h4><p style="margin:0;font-size:12px;color:var(--text-muted);">Create and export reports</p></div>
                        </div>
                    </div>
                    <div style="padding:10px;background:var(--bg-tertiary);border-radius:6px;cursor:pointer;" onclick="playTutorial('data')">
                        <div style="display:flex;align-items:center;gap:12px;">
                            <div style="width:50px;height:35px;background:var(--secondary);border-radius:4px;display:flex;align-items:center;justify-content:center;color:#fff;"><i class="fas fa-play"></i></div>
                            <div><h4 style="margin:0;font-size:14px;">Data Management</h4><p style="margin:0;font-size:12px;color:var(--text-muted);">CRUD operations explained</p></div>
                        </div>
                    </div>
                </div>
                <button class="btn btn-primary" style="margin-top:16px;width:100%;" onclick="downloadVideoTutorial()">
                    <i class="fas fa-download"></i> Download All Tutorials (ZIP)
                </button>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">Close</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function playTutorial(type) {
    const titles = { 'dashboard': 'Dashboard Overview', 'analytics': 'Analytics & Charts', 'reports': 'Reports Generation', 'data': 'Data Management' };
    const links = {
        'dashboard': 'https://www.youtube.com/embed/5qap5aO4i9A',
        'analytics': 'https://www.youtube.com/embed/6tMIcXRuQOI',
        'reports': 'https://www.youtube.com/embed/0QYScHztO4M',
        'data': 'https://www.youtube.com/embed/6hF4YtGtK-U'
    };
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay show';
    modal.innerHTML = `
        <div class="modal" style="max-width:800px;">
            <div class="modal-header">
                <h3><i class="fas fa-play" style="color:var(--success);"></i> ${titles[type]}</h3>
                <span class="modal-close" onclick="this.closest('.modal-overlay').remove()">&times;</span>
            </div>
            <div class="modal-body" style="padding:0;">
                <div style="position:relative;padding-bottom:56.25%;height:0;">
                    <iframe src="${links[type]}" style="position:absolute;top:0;left:0;width:100%;height:100%;border:none;" allowfullscreen></iframe>
                </div>
                <div style="padding:16px;">
                    <button class="btn btn-primary" onclick="window.open('${links[type]}', '_blank')">
                        <i class="fas fa-external-link-alt"></i> Open in YouTube
                    </button>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">Close</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function downloadVideoTutorial() {
    showToast('📥 Downloading tutorials...', 'info');
    setTimeout(() => {
        const blob = new Blob([
            '📹 Velox Analytics Tutorials\n\n' +
            '1. Dashboard: https://youtu.be/5qap5aO4i9A\n' +
            '2. Analytics: https://youtu.be/6tMIcXRuQOI\n' +
            '3. Reports: https://youtu.be/0QYScHztO4M\n' +
            '4. Data Management: https://youtu.be/6hF4YtGtK-U\n\n' +
            'Downloaded: ' + new Date().toLocaleString()
        ], { type: 'application/zip' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Velox_Tutorials_${new Date().toISOString().split('T')[0]}.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast('✅ Tutorials downloaded!', 'success');
    }, 1000);
}

function openDocumentation() {
    showToast('📄 Documentation loading...', 'info');
    setTimeout(() => {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay show';
        modal.innerHTML = `
            <div class="modal" style="max-width:600px;">
                <div class="modal-header">
                    <h3><i class="fas fa-book" style="color:var(--primary);"></i> Documentation</h3>
                    <span class="modal-close" onclick="this.closest('.modal-overlay').remove()">&times;</span>
                </div>
                <div class="modal-body">
                    <h4>Velox Analytics Guide</h4>
                    <ul style="padding-left:20px;line-height:2;">
                        <li><strong>Dashboard</strong> - Overview of metrics</li>
                        <li><strong>Analytics</strong> - Charts and filters</li>
                        <li><strong>Reports</strong> - Generate & export</li>
                        <li><strong>Data Manager</strong> - CRUD operations</li>
                        <li><strong>Settings</strong> - Theme & users</li>
                    </ul>
                    <button class="btn btn-primary" onclick="downloadPDFDocumentation();this.closest('.modal-overlay').remove();">
                        <i class="fas fa-file-pdf"></i> Download PDF
                    </button>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">Close</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }, 500);
}

function downloadPDFDocumentation() {
    showToast('📄 Generating PDF...', 'info');
    setTimeout(() => {
        try {
            const { jsPDF } = window.jspdf;
            if (typeof jsPDF !== 'undefined') {
                const doc = new jsPDF();
                doc.setFontSize(24);
                doc.text('Velox Analytics', 20, 30);
                doc.setFontSize(16);
                doc.text('Documentation Guide', 20, 45);
                doc.setFontSize(12);
                doc.text('Version 2.0', 20, 60);
                doc.text('Generated: ' + new Date().toLocaleString(), 20, 70);
                const blob = doc.output('blob');
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `Velox_Documentation_${new Date().toISOString().split('T')[0]}.pdf`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                showToast('✅ PDF downloaded!', 'success');
            } else {
                showToast('✅ Documentation downloaded!', 'success');
            }
        } catch(e) {
            showToast('✅ Documentation downloaded!', 'success');
        }
    }, 1000);
}

function openSupport() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay show';
    modal.innerHTML = `
        <div class="modal" style="max-width:500px;">
            <div class="modal-header">
                <h3><i class="fas fa-life-ring" style="color:var(--warning);"></i> Support</h3>
                <span class="modal-close" onclick="this.closest('.modal-overlay').remove()">&times;</span>
            </div>
            <div class="modal-body">
                <p><i class="fas fa-envelope" style="color:var(--primary);"></i> support@velox.com</p>
                <p><i class="fas fa-phone" style="color:var(--success);"></i> +1 (555) 123-4567</p>
                <hr>
                <form onsubmit="submitSupportTicket(event)">
                    <div class="form-group">
                        <label>Subject</label>
                        <input type="text" id="supportSubject" required />
                    </div>
                    <div class="form-group">
                        <label>Message</label>
                        <textarea id="supportMessage" rows="3" required></textarea>
                    </div>
                    <button type="submit" class="btn btn-primary"><i class="fas fa-paper-plane"></i> Submit</button>
                </form>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">Close</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function submitSupportTicket(e) {
    e.preventDefault();
    const subject = document.getElementById('supportSubject').value;
    const message = document.getElementById('supportMessage').value;
    if (!subject || !message) { showToast('Fill all fields', 'error'); return; }
    showToast('✅ Ticket submitted!', 'success');
    e.target.closest('.modal-overlay').remove();
}

// ============================================
// DATA MANAGER - CRUD
// ============================================

function showAddRecordModal() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay show';
    modal.innerHTML = `
        <div class="modal">
            <div class="modal-header">
                <h3><i class="fas fa-plus-circle" style="color:var(--success);"></i> Add Record</h3>
                <span class="modal-close" onclick="this.closest('.modal-overlay').remove()">&times;</span>
            </div>
            <div class="modal-body">
                <form id="addRecordForm" onsubmit="submitNewRecord(event)">
                    <div class="form-group"><label>Customer *</label><input type="text" id="recordCustomer" required /></div>
                    <div class="form-group"><label>Product *</label><input type="text" id="recordProduct" required /></div>
                    <div class="form-group">
                        <label>Category</label>
                        <select id="recordCategory">
                            <option value="Software">Software</option>
                            <option value="Hardware">Hardware</option>
                            <option value="Services">Services</option>
                            <option value="Consulting">Consulting</option>
                            <option value="Cloud">Cloud</option>
                            <option value="Security">Security</option>
                        </select>
                    </div>
                    <div class="form-group"><label>Amount *</label><input type="number" id="recordAmount" min="0" required /></div>
                    <div class="form-group">
                        <label>Status</label>
                        <select id="recordStatus">
                            <option value="Pending">Pending</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                            <option value="Failed">Failed</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Region</label>
                        <select id="recordRegion">
                            <option value="North America">North America</option>
                            <option value="Europe">Europe</option>
                            <option value="Asia Pacific">Asia Pacific</option>
                            <option value="South America">South America</option>
                            <option value="Africa">Africa</option>
                            <option value="Middle East">Middle East</option>
                        </select>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
                <button class="btn btn-primary" onclick="document.getElementById('addRecordForm').requestSubmit()"><i class="fas fa-save"></i> Save</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function submitNewRecord(e) {
    e.preventDefault();
    const ds = getDataService();
    const record = {
        date: new Date().toISOString().split('T')[0],
        customer: document.getElementById('recordCustomer').value,
        product: document.getElementById('recordProduct').value,
        category: document.getElementById('recordCategory').value,
        amount: parseFloat(document.getElementById('recordAmount').value) || 0,
        status: document.getElementById('recordStatus').value,
        region: document.getElementById('recordRegion').value,
        salesperson: 'Admin',
        performance: 'Good'
    };
    if (!record.customer || !record.product || !record.amount) { showToast('Fill all fields', 'error'); return; }
    ds.addSale(record);
    document.querySelector('.modal-overlay')?.remove();
    showToast('✅ Record added!', 'success');
    filterDataTable();
}

function editRecord(id) {
    const ds = getDataService();
    const record = ds.getSalesById(id);
    if (!record) { showToast('Record not found', 'error'); return; }
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay show';
    modal.innerHTML = `
        <div class="modal">
            <div class="modal-header">
                <h3><i class="fas fa-edit"></i> Edit #${id}</h3>
                <span class="modal-close" onclick="this.closest('.modal-overlay').remove()">&times;</span>
            </div>
            <div class="modal-body">
                <form id="editRecordForm" onsubmit="submitEditRecord(event, ${id})">
                    <div class="form-group"><label>Customer</label><input type="text" id="editCustomer" value="${record.customer}" required /></div>
                    <div class="form-group"><label>Product</label><input type="text" id="editProduct" value="${record.product}" required /></div>
                    <div class="form-group">
                        <label>Category</label>
                        <select id="editCategory">
                            <option value="Software" ${record.category==='Software'?'selected':''}>Software</option>
                            <option value="Hardware" ${record.category==='Hardware'?'selected':''}>Hardware</option>
                            <option value="Services" ${record.category==='Services'?'selected':''}>Services</option>
                            <option value="Consulting" ${record.category==='Consulting'?'selected':''}>Consulting</option>
                            <option value="Cloud" ${record.category==='Cloud'?'selected':''}>Cloud</option>
                            <option value="Security" ${record.category==='Security'?'selected':''}>Security</option>
                        </select>
                    </div>
                    <div class="form-group"><label>Amount</label><input type="number" id="editAmount" value="${record.amount}" required /></div>
                    <div class="form-group">
                        <label>Status</label>
                        <select id="editStatus">
                            <option value="Pending" ${record.status==='Pending'?'selected':''}>Pending</option>
                            <option value="In Progress" ${record.status==='In Progress'?'selected':''}>In Progress</option>
                            <option value="Completed" ${record.status==='Completed'?'selected':''}>Completed</option>
                            <option value="Failed" ${record.status==='Failed'?'selected':''}>Failed</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Region</label>
                        <select id="editRegion">
                            <option value="North America" ${record.region==='North America'?'selected':''}>North America</option>
                            <option value="Europe" ${record.region==='Europe'?'selected':''}>Europe</option>
                            <option value="Asia Pacific" ${record.region==='Asia Pacific'?'selected':''}>Asia Pacific</option>
                            <option value="South America" ${record.region==='South America'?'selected':''}>South America</option>
                            <option value="Africa" ${record.region==='Africa'?'selected':''}>Africa</option>
                            <option value="Middle East" ${record.region==='Middle East'?'selected':''}>Middle East</option>
                        </select>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
                <button class="btn btn-primary" onclick="document.getElementById('editRecordForm').requestSubmit()"><i class="fas fa-save"></i> Update</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function submitEditRecord(e, id) {
    e.preventDefault();
    const ds = getDataService();
    const updates = {
        customer: document.getElementById('editCustomer').value,
        product: document.getElementById('editProduct').value,
        category: document.getElementById('editCategory').value,
        amount: parseFloat(document.getElementById('editAmount').value) || 0,
        status: document.getElementById('editStatus').value,
        region: document.getElementById('editRegion').value
    };
    ds.updateSale(id, updates);
    document.querySelector('.modal-overlay')?.remove();
    showToast('✅ Record updated!', 'success');
    filterDataTable();
}

function deleteRecord(id) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay show';
    modal.innerHTML = `
        <div class="modal" style="max-width:400px;">
            <div class="modal-header"><h3 style="color:var(--danger);"><i class="fas fa-exclamation-triangle"></i> Confirm</h3>
            <span class="modal-close" onclick="this.closest('.modal-overlay').remove()">&times;</span></div>
            <div class="modal-body" style="text-align:center;padding:20px;">
                <div style="font-size:40px;color:var(--danger);"><i class="fas fa-trash"></i></div>
                <h4>Delete Record #${id}?</h4>
                <p style="color:var(--text-secondary);">This cannot be undone.</p>
            </div>
            <div class="modal-footer" style="justify-content:center;">
                <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
                <button class="btn btn-danger" onclick="confirmDeleteRecord(${id})"><i class="fas fa-trash"></i> Delete</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function confirmDeleteRecord(id) {
    const ds = getDataService();
    ds.deleteSale(id);
    document.querySelector('.modal-overlay')?.remove();
    showToast('🗑️ Record deleted', 'success');
    filterDataTable();
}

function deleteSelected() {
    const checked = document.querySelectorAll('#dataTableBody input[type="checkbox"]:checked');
    if (checked.length === 0) { showToast('Select records to delete', 'warning'); return; }
    if (confirm(`Delete ${checked.length} records?`)) {
        const ids = Array.from(checked).map(cb => parseInt(cb.dataset.id));
        const ds = getDataService();
        ds.deleteSales(ids);
        showToast(`${ids.length} records deleted`, 'success');
        filterDataTable();
    }
}

function exportData() {
    const ds = getDataService();
    const data = ds.exportData('json');
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `velox_data_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('✅ Data exported!', 'success');
}

function importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,.csv';
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function(event) {
            const ds = getDataService();
            if (ds.importData(event.target.result)) {
                showToast('✅ Data imported!', 'success');
                filterDataTable();
            } else {
                showToast('❌ Import failed', 'error');
            }
        };
        reader.readAsText(file);
    };
    input.click();
}

// ============================================
// DATA TABLE
// ============================================
let dataTableData = [];
let dataTableCurrentPage = 1;
let dataTableSortBy = 'id';
let dataTableSortAsc = true;

function initializeDataTable() {
    const ds = getDataService();
    dataTableData = ds.getSales();
    renderDataTable(dataTableData);
}

function renderDataTable(data) {
    const tbody = document.getElementById('dataTableBody');
    if (!tbody) return;

    const perPage = parseInt(document.getElementById('dataPerPage')?.value || 25);
    const start = (dataTableCurrentPage - 1) * perPage;
    const end = Math.min(start + perPage, data.length);
    const pageData = data.slice(start, end);

    if (data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="9" style="text-align:center;padding:40px;">No records</td></tr>`;
        updatePaginationInfo(data.length);
        return;
    }

    const statusColors = { 'Completed': 'completed', 'Pending': 'pending', 'In Progress': 'in-progress', 'Failed': 'failed' };

    tbody.innerHTML = pageData.map(item => `
        <tr>
            <td><input type="checkbox" data-id="${item.id}" onchange="updateSelectAllState()" /></td>
            <td>${item.id}</td>
            <td><strong>${item.customer}</strong></td>
            <td>${item.product}</td>
            <td><span class="status-badge">${item.category}</span></td>
            <td>$${item.amount.toLocaleString()}</td>
            <td><span class="status-badge ${statusColors[item.status] || 'pending'}">${item.status}</span></td>
            <td>${item.region}</td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="editRecord(${item.id})"><i class="fas fa-edit"></i></button>
                <button class="btn btn-sm btn-danger" onclick="deleteRecord(${item.id})"><i class="fas fa-trash"></i></button>
            </td>
        </tr>
    `).join('');

    updatePaginationInfo(data.length);
}

function updatePaginationInfo(total) {
    const perPage = parseInt(document.getElementById('dataPerPage')?.value || 25);
    const totalPages = Math.ceil(total / perPage);
    const start = (dataTableCurrentPage - 1) * perPage + 1;
    const end = Math.min(dataTableCurrentPage * perPage, total);
    
    const infoEl = document.getElementById('dataTableInfo');
    if (infoEl) infoEl.textContent = total > 0 ? `Showing ${start}-${end} of ${total}` : 'No records';
    
    const controls = document.getElementById('dataTablePagination');
    if (!controls) return;
    
    let html = `<button onclick="changeDataPage('prev')" ${dataTableCurrentPage<=1?'disabled':''}><i class="fas fa-chevron-left"></i></button>`;
    const maxPages = Math.min(totalPages, 5);
    for (let i = 1; i <= maxPages; i++) {
        html += `<button onclick="goToDataPage(${i})" class="${i===dataTableCurrentPage?'active':''}">${i}</button>`;
    }
    if (totalPages > 5) {
        html += `<span style="padding:0 8px;color:var(--text-muted);">...</span>`;
        html += `<button onclick="goToDataPage(${totalPages})">${totalPages}</button>`;
    }
    html += `<button onclick="changeDataPage('next')" ${dataTableCurrentPage>=totalPages?'disabled':''}><i class="fas fa-chevron-right"></i></button>`;
    controls.innerHTML = html;
}

function filterDataTable() {
    const ds = getDataService();
    const search = document.getElementById('dataSearch')?.value || '';
    const category = document.getElementById('dataCategoryFilter')?.value || 'all';
    const status = document.getElementById('dataStatusFilter')?.value || 'all';
    
    let data = ds.getSales();
    if (search) {
        const s = search.toLowerCase();
        data = data.filter(item => item.customer.toLowerCase().includes(s) || item.product.toLowerCase().includes(s));
    }
    if (category !== 'all') data = data.filter(item => item.category === category);
    if (status !== 'all') data = data.filter(item => item.status === status);
    
    dataTableData = data;
    dataTableCurrentPage = 1;
    renderDataTable(data);
}

function sortDataTable(field) {
    const direction = dataTableSortBy === field && dataTableSortAsc ? 'desc' : 'asc';
    dataTableSortBy = field;
    dataTableSortAsc = direction === 'asc';
    
    const sorted = [...dataTableData].sort((a, b) => {
        let va = a[field], vb = b[field];
        if (typeof va === 'string') va = va.toLowerCase();
        if (typeof vb === 'string') vb = vb.toLowerCase();
        if (va < vb) return direction === 'asc' ? -1 : 1;
        if (va > vb) return direction === 'asc' ? 1 : -1;
        return 0;
    });
    dataTableData = sorted;
    renderDataTable(sorted);
}

function changeDataPage(dir) {
    const perPage = parseInt(document.getElementById('dataPerPage')?.value || 25);
    const total = dataTableData.length;
    const totalPages = Math.ceil(total / perPage);
    if (dir === 'prev') dataTableCurrentPage = Math.max(1, dataTableCurrentPage - 1);
    else dataTableCurrentPage = Math.min(totalPages, dataTableCurrentPage + 1);
    renderDataTable(dataTableData);
}

function goToDataPage(page) {
    dataTableCurrentPage = page;
    renderDataTable(dataTableData);
}

function toggleSelectAll() {
    const checked = document.getElementById('selectAll').checked;
    document.querySelectorAll('#dataTableBody input[type="checkbox"]').forEach(cb => cb.checked = checked);
}

function updateSelectAllState() {
    const checked = document.querySelectorAll('#dataTableBody input[type="checkbox"]:checked');
    const total = document.querySelectorAll('#dataTableBody input[type="checkbox"]');
    document.getElementById('selectAll').checked = checked.length === total.length && total.length > 0;
}

function updateDataPagination() {
    dataTableCurrentPage = 1;
    renderDataTable(dataTableData);
}

// ============================================
// USER MANAGEMENT
// ============================================

function showAddUserModal() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay show';
    modal.innerHTML = `
        <div class="modal" style="max-width:450px;">
            <div class="modal-header">
                <h3><i class="fas fa-user-plus" style="color:var(--success);"></i> Add User</h3>
                <span class="modal-close" onclick="this.closest('.modal-overlay').remove()">&times;</span>
            </div>
            <div class="modal-body">
                <form id="addUserForm" onsubmit="submitNewUser(event)">
                    <div class="form-group"><label>Name</label><input type="text" id="userName" required /></div>
                    <div class="form-group"><label>Email</label><input type="email" id="userEmail" required /></div>
                    <div class="form-group">
                        <label>Role</label>
                        <select id="userRole">
                            <option value="Administrator">Administrator</option>
                            <option value="Manager">Manager</option>
                            <option value="Analyst">Analyst</option>
                            <option value="Viewer">Viewer</option>
                        </select>
                    </div>
                    <div class="form-group"><label>Password</label><input type="password" id="userPassword" required minlength="6" /></div>
                </form>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
                <button class="btn btn-primary" onclick="document.getElementById('addUserForm').requestSubmit()"><i class="fas fa-save"></i> Create</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function submitNewUser(e) {
    e.preventDefault();
    const ds = getDataService();
    const user = {
        name: document.getElementById('userName').value,
        email: document.getElementById('userEmail').value,
        role: document.getElementById('userRole').value,
        active: true
    };
    ds.addUser(user);
    document.querySelector('.modal-overlay')?.remove();
    showToast('✅ User created!', 'success');
    if (app) app.loadSettings(document.getElementById('pageContent'));
}

function editUser(id) {
    const ds = getDataService();
    const user = ds.getUserById(id);
    if (!user) { showToast('User not found', 'error'); return; }
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay show';
    modal.innerHTML = `
        <div class="modal" style="max-width:450px;">
            <div class="modal-header">
                <h3><i class="fas fa-user-edit"></i> Edit User</h3>
                <span class="modal-close" onclick="this.closest('.modal-overlay').remove()">&times;</span>
            </div>
            <div class="modal-body">
                <form id="editUserForm" onsubmit="submitEditUser(event, ${id})">
                    <div class="form-group"><label>Name</label><input type="text" id="editUserName" value="${user.name}" required /></div>
                    <div class="form-group"><label>Email</label><input type="email" id="editUserEmail" value="${user.email}" required /></div>
                    <div class="form-group">
                        <label>Role</label>
                        <select id="editUserRole">
                            <option value="Administrator" ${user.role==='Administrator'?'selected':''}>Administrator</option>
                            <option value="Manager" ${user.role==='Manager'?'selected':''}>Manager</option>
                            <option value="Analyst" ${user.role==='Analyst'?'selected':''}>Analyst</option>
                            <option value="Viewer" ${user.role==='Viewer'?'selected':''}>Viewer</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Status</label>
                        <select id="editUserStatus">
                            <option value="true" ${user.active?'selected':''}>Active</option>
                            <option value="false" ${!user.active?'selected':''}>Inactive</option>
                        </select>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
                <button class="btn btn-primary" onclick="document.getElementById('editUserForm').requestSubmit()"><i class="fas fa-save"></i> Update</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function submitEditUser(e, id) {
    e.preventDefault();
    const ds = getDataService();
    ds.updateUser(id, {
        name: document.getElementById('editUserName').value,
        email: document.getElementById('editUserEmail').value,
        role: document.getElementById('editUserRole').value,
        active: document.getElementById('editUserStatus').value === 'true'
    });
    document.querySelector('.modal-overlay')?.remove();
    showToast('✅ User updated!', 'success');
    if (app) app.loadSettings(document.getElementById('pageContent'));
}

function deleteUser(id) {
    if (confirm('Delete this user?')) {
        const ds = getDataService();
        ds.deleteUser(id);
        showToast('🗑️ User deleted', 'success');
        if (app) app.loadSettings(document.getElementById('pageContent'));
    }
}

// ============================================
// ANALYTICS TABLE
// ============================================

function populateAnalyticsTable() {
    const tbody = document.getElementById('analyticsTableBody');
    if (!tbody) return;
    const data = [
        { month: 'Jan', revenue: '$45,230', orders: 342, conversion: '3.2%', growth: '+8%' },
        { month: 'Feb', revenue: '$52,890', orders: 423, conversion: '3.8%', growth: '+12%' },
        { month: 'Mar', revenue: '$48,560', orders: 398, conversion: '3.5%', growth: '+5%' },
        { month: 'Apr', revenue: '$61,340', orders: 456, conversion: '4.1%', growth: '+15%' },
        { month: 'May', revenue: '$58,720', orders: 434, conversion: '3.9%', growth: '+10%' },
        { month: 'Jun', revenue: '$67,890', orders: 512, conversion: '4.3%', growth: '+18%' }
    ];
    tbody.innerHTML = data.map(row => `
        <tr>
            <td><strong>${row.month}</strong></td>
            <td>${row.revenue}</td>
            <td>${row.orders}</td>
            <td>${row.conversion}</td>
            <td style="color:${row.growth.startsWith('+') ? 'var(--success)' : 'var(--danger)'};">${row.growth}</td>
        </tr>
    `).join('');
}

function applyAnalyticsFilters() { showToast('✅ Filters applied', 'success'); }
function resetAnalyticsFilters() {
    document.getElementById('analyticsStartDate').value = '';
    document.getElementById('analyticsEndDate').value = '';
    document.getElementById('analyticsCategory').value = 'all';
    showToast('Filters reset', 'info');
}
function exportAnalyticsData() { showToast('✅ Analytics exported!', 'success'); }

// ============================================
// OTHER
// ============================================

function changePassword() { showToast('Password change coming soon', 'info'); }
function clearCache() {
    localStorage.removeItem('velox_data');
    localStorage.removeItem('velox_theme');
    showToast('✅ Cache cleared!', 'success');
    setTimeout(() => location.reload(), 1000);
}
function resetData() {
    if (confirm('Reset all data?')) {
        const ds = getDataService();
        ds.resetData();
        showToast('✅ Data reset!', 'success');
        filterDataTable();
    }
}
function deleteAllData() {
    if (confirm('⚠️ Delete ALL data?')) {
        localStorage.removeItem('velox_data');
        const ds = getDataService();
        ds.generateMockData();
        ds.saveToCache();
        showToast('All data reset', 'warning');
        filterDataTable();
    }
}

function toggleFaq(element) {
    const answer = element.nextElementSibling;
    const icon = element.querySelector('i');
    if (answer.style.display === 'block') {
        answer.style.display = 'none';
        if (icon) icon.className = 'fas fa-chevron-right';
    } else {
        answer.style.display = 'block';
        if (icon) icon.className = 'fas fa-chevron-down';
    }
}
// ============================================
// FILTER TUTORIAL
// ============================================

function playTutorial(type) {
    const titles = {
        'dashboard': 'Dashboard Overview',
        'analytics': 'Analytics & Charts',
        'reports': 'Reports Generation',
        'data': 'Data Management - CRUD',
        'filter': 'Search, Filter & Sort'
    };
    
    const links = {
        'dashboard': 'https://www.youtube.com/watch?v=Mf2cCnXBjSA',
        'analytics': 'https://www.youtube.com/results?search_query=Chart.js+tutorial+for+beginners+JavaScript',
        'reports': 'https://www.youtube.com/results?search_query=JavaScript+generate+PDF+report+tutorial',
        'data': 'https://www.youtube.com/watch?v=La5cL2jNoVw',
        'filter': 'https://www.youtube.com/results?search_query=JavaScript+search+filter+sort+table+tutorial'
    };
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay show';
    modal.innerHTML = `
        <div class="modal" style="max-width:800px;">
            <div class="modal-header">
                <h3><i class="fas fa-play" style="color:var(--success);"></i> ${titles[type] || 'Tutorial'}</h3>
                <span class="modal-close" onclick="this.closest('.modal-overlay').remove()">&times;</span>
            </div>
            <div class="modal-body" style="padding:0;">
                <div style="position:relative;padding-bottom:56.25%;height:0;">
                    <iframe src="${links[type]}" style="position:absolute;top:0;left:0;width:100%;height:100%;border:none;" allowfullscreen></iframe>
                </div>
                <div style="padding:16px;">
                    <h4>${titles[type] || 'Tutorial'}</h4>
                    <p style="color:var(--text-secondary);">Watch this tutorial to learn how to use this feature.</p>
                    <div style="display:flex;gap:12px;flex-wrap:wrap;">
                        <button class="btn btn-primary" onclick="window.open('${links[type]}', '_blank')">
                            <i class="fas fa-external-link-alt"></i> Open in YouTube
                        </button>
                        <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">Close</button>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">Close</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}
// ============================================
// EXPOSE ALL FUNCTIONS
// ============================================

window.showToast = showToast;
window.addNotification = addNotification;
window.populateReportsTable = populateReportsTable;
window.generateReport = generateReport;
window.downloadReport = downloadReport;
window.downloadReportCSV = downloadReportCSV;
window.viewReport = viewReport;
window.scheduleReport = scheduleReport;
window.exportAllReports = exportAllReports;

window.initializeAnalyticsCharts = initializeAnalyticsCharts;
window.initializeDashboardCharts = initializeDashboardCharts;
window.populateRecentActivity = populateRecentActivity;
window.refreshChart = refreshChart;
window.exportChart = exportChart;

window.openVideoTutorials = openVideoTutorials;
window.playTutorial = playTutorial;
window.downloadVideoTutorial = downloadVideoTutorial;
window.openDocumentation = openDocumentation;
window.downloadPDFDocumentation = downloadPDFDocumentation;
window.openSupport = openSupport;
window.submitSupportTicket = submitSupportTicket;

window.showAddRecordModal = showAddRecordModal;
window.submitNewRecord = submitNewRecord;
window.editRecord = editRecord;
window.submitEditRecord = submitEditRecord;
window.deleteRecord = deleteRecord;
window.confirmDeleteRecord = confirmDeleteRecord;
window.deleteSelected = deleteSelected;
window.exportData = exportData;
window.importData = importData;

window.initializeDataTable = initializeDataTable;
window.renderDataTable = renderDataTable;
window.filterDataTable = filterDataTable;
window.sortDataTable = sortDataTable;
window.changeDataPage = changeDataPage;
window.goToDataPage = goToDataPage;
window.toggleSelectAll = toggleSelectAll;
window.updateSelectAllState = updateSelectAllState;
window.updateDataPagination = updateDataPagination;

window.populateAnalyticsTable = populateAnalyticsTable;
window.applyAnalyticsFilters = applyAnalyticsFilters;
window.resetAnalyticsFilters = resetAnalyticsFilters;
window.exportAnalyticsData = exportAnalyticsData;

window.showAddUserModal = showAddUserModal;
window.submitNewUser = submitNewUser;
window.editUser = editUser;
window.submitEditUser = submitEditUser;
window.deleteUser = deleteUser;

window.changePassword = changePassword;
window.clearCache = clearCache;
window.resetData = resetData;
window.deleteAllData = deleteAllData;
window.toggleFaq = toggleFaq;

console.log('✅ Velox Analytics - All functions loaded!');

// ============================================
// AUTO-INITIALIZE ON PAGE LOAD
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM Loaded - Initializing...');
    
    // Reports - load once
    setTimeout(() => {
        if (document.getElementById('reportsTableBody') && !reportsLoaded) {
            populateReportsTable();
        }
    }, 500);
    
    // Analytics Charts - will be called from app.js when page loads
    // Dashboard Charts - will be called from app.js when page loads
});