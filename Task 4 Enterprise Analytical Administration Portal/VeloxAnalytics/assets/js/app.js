/**
 * VELOX ANALYTICS - Main Application
 * COMPLETE WORKING VERSION
 */

class VeloxApp {
    constructor() {
        this.currentPage = 'dashboard';
        this.isAuthenticated = false;
        this.currentUser = null;
        this.init();
    }

    init() {
        this.checkAuth();
        this.setupRouter();
        
        setTimeout(() => {
            const hash = window.location.hash || '#/dashboard';
            this.handleRoute(hash);
        }, 100);

        window.addEventListener('hashchange', () => {
            const hash = window.location.hash || '#/dashboard';
            this.handleRoute(hash);
        });

        this.setupEventListeners();
        console.log('✅ Velox Analytics Started');
    }

    checkAuth() {
        try {
            const session = localStorage.getItem('velox_session');
            if (session) {
                const data = JSON.parse(session);
                if (data.expires && data.expires > Date.now()) {
                    this.isAuthenticated = true;
                    this.currentUser = data.user;
                    return;
                }
            }
        } catch (e) {}
        this.isAuthenticated = false;
        this.showLogin();
    }

    setupRouter() {
        window.addEventListener('hashchange', () => {
            const hash = window.location.hash || '#/dashboard';
            this.handleRoute(hash);
        });
    }

    handleRoute(hash) {
        if (!this.isAuthenticated) {
            this.showLogin();
            return;
        }

        const path = hash.replace('#', '') || '/dashboard';
        const routes = {
            '/': 'dashboard',
            '/dashboard': 'dashboard',
            '/analytics': 'analytics',
            '/reports': 'reports',
            '/data': 'data',
            '/settings': 'settings',
            '/help': 'help',
            '/profile': 'profile'
        };
        
        let page = routes[path];
        if (!page) {
            this.show404();
            return;
        }

        this.currentPage = page;
        this.loadPage(page);
        this.updateActiveNav(page);
        this.updatePageTitle(page);
    }

    loadPage(page) {
        const content = document.getElementById('pageContent');
        if (!content) return;

        content.innerHTML = `
            <div style="display:flex;align-items:center;justify-content:center;min-height:300px;flex-direction:column;gap:16px;">
                <div class="spinner spinner-lg"></div>
                <span style="color:var(--text-muted);">Loading ${page}...</span>
            </div>
        `;

        setTimeout(() => {
            try {
                switch(page) {
                    case 'dashboard': this.loadDashboard(content); break;
                    case 'analytics': this.loadAnalytics(content); break;
                    case 'reports': this.loadReports(content); break;
                    case 'data': this.loadDataManager(content); break;
                    case 'settings': this.loadSettings(content); break;
                    case 'help': this.loadHelp(content); break;
                    case 'profile': this.loadProfile(content); break;
                    default: this.loadDashboard(content);
                }
            } catch(e) {
                content.innerHTML = `<div style="text-align:center;padding:40px;color:var(--danger);">
                    <h3>Error loading page</h3>
                    <p>${e.message}</p>
                    <button class="btn btn-primary" onclick="window.location.hash='#/dashboard'">Go to Dashboard</button>
                </div>`;
            }
        }, 200);
    }

    loadDashboard(container) {
        container.innerHTML = `
            <div class="page-header">
                <h2>Dashboard</h2>
                <p class="page-description">Welcome to Velox Analytics</p>
            </div>
            <div class="kpi-grid" id="kpiGrid"></div>
            <div class="chart-grid">
                <div class="chart-card chart-full">
                    <div class="chart-header">
                        <h3 class="chart-title">Revenue Overview</h3>
                        <div class="chart-actions">
                            <button onclick="refreshChart('revenueChart')"><i class="fas fa-sync"></i></button>
                            <button onclick="exportChart('revenueChart')"><i class="fas fa-download"></i></button>
                        </div>
                    </div>
                    <div class="chart-wrapper"><canvas id="revenueChart"></canvas></div>
                </div>
                <div class="chart-card">
                    <div class="chart-header"><h3 class="chart-title">Sales Distribution</h3></div>
                    <div class="chart-wrapper"><canvas id="categoryChart"></canvas></div>
                </div>
                <div class="chart-card">
                    <div class="chart-header"><h3 class="chart-title">Regional Performance</h3></div>
                    <div class="chart-wrapper"><canvas id="regionChart"></canvas></div>
                </div>
            </div>
            <div class="activity-section">
                <div class="section-header">
                    <h3 class="section-title">Recent Activity</h3>
                    <button class="btn btn-sm btn-primary" onclick="window.location.hash='#/data'">View All</button>
                </div>
                <div class="table-container">
                    <table class="activity-table">
                        <thead><tr><th>Customer</th><th>Product</th><th>Category</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead>
                        <tbody id="activityTableBody"></tbody>
                    </table>
                </div>
            </div>
        `;
        
        setTimeout(() => {
            try {
                const ds = getDataService();
                if (typeof initializeDashboardCharts === 'function') {
                    initializeDashboardCharts(ds.getSales(), ds.getPerformance());
                }
                if (typeof populateRecentActivity === 'function') {
                    populateRecentActivity(ds.getSales());
                }
            } catch(e) {}
        }, 300);
    }
loadAnalytics(container) {
    container.innerHTML = `
        <div class="page-header">
            <h2>Analytics</h2>
            <p class="page-description">Deep dive into your business metrics</p>
        </div>
        <div class="filter-bar">
            <div class="filter-group">
                <label>Date Range</label>
                <input type="date" id="analyticsStartDate" />
                <span>to</span>
                <input type="date" id="analyticsEndDate" />
            </div>
            <div class="filter-group">
                <label>Category</label>
                <select id="analyticsCategory">
                    <option value="all">All Categories</option>
                    <option value="Software">Software</option>
                    <option value="Hardware">Hardware</option>
                    <option value="Services">Services</option>
                    <option value="Consulting">Consulting</option>
                    <option value="Cloud">Cloud</option>
                    <option value="Security">Security</option>
                </select>
            </div>
            <button class="btn btn-primary" onclick="applyAnalyticsFilters()"><i class="fas fa-filter"></i> Apply</button>
            <button class="btn btn-secondary" onclick="resetAnalyticsFilters()"><i class="fas fa-undo"></i> Reset</button>
        </div>
        <div class="chart-grid">
            <div class="chart-card chart-full">
                <div class="chart-header">
                    <h3 class="chart-title">Revenue Trends</h3>
                    <div class="chart-actions">
                        <button onclick="exportChart('revenueTrendChart')"><i class="fas fa-download"></i></button>
                    </div>
                </div>
                <div class="chart-wrapper">
                    <canvas id="revenueTrendChart"></canvas>
                </div>
            </div>
            <div class="chart-card">
                <div class="chart-header">
                    <h3 class="chart-title">Sales by Category</h3>
                </div>
                <div class="chart-wrapper">
                    <canvas id="categorySalesChart"></canvas>
                </div>
            </div>
            <div class="chart-card">
                <div class="chart-header">
                    <h3 class="chart-title">Regional Performance</h3>
                </div>
                <div class="chart-wrapper">
                    <canvas id="regionalChart"></canvas>
                </div>
            </div>
        </div>
        <div class="activity-section">
            <div class="section-header">
                <h3 class="section-title">Analytics Data</h3>
                <button class="btn btn-sm btn-primary" onclick="exportAnalyticsData()"><i class="fas fa-file-export"></i> Export</button>
            </div>
            <div class="table-container">
                <table class="table">
                    <thead><tr><th>Month</th><th>Revenue</th><th>Orders</th><th>Conversion</th><th>Growth</th></tr></thead>
                    <tbody id="analyticsTableBody"></tbody>
                </table>
            </div>
        </div>
    `;
    
    // ✅ Initialize Analytics Charts after DOM is ready
    setTimeout(() => {
        console.log('📊 Initializing Analytics Charts...');
        if (typeof initializeAnalyticsCharts === 'function') {
            initializeAnalyticsCharts();
        }
        if (typeof populateAnalyticsTable === 'function') {
            populateAnalyticsTable();
        }
    }, 300);
}
    loadAnalytics(container) {
        container.innerHTML = `
            <div class="page-header">
                <h2>Analytics</h2>
                <p class="page-description">Deep dive into your business metrics</p>
            </div>
            <div class="filter-bar">
                <div class="filter-group">
                    <label>Date Range</label>
                    <input type="date" id="analyticsStartDate" />
                    <span>to</span>
                    <input type="date" id="analyticsEndDate" />
                </div>
                <div class="filter-group">
                    <label>Category</label>
                    <select id="analyticsCategory">
                        <option value="all">All Categories</option>
                        <option value="Software">Software</option>
                        <option value="Hardware">Hardware</option>
                        <option value="Services">Services</option>
                        <option value="Consulting">Consulting</option>
                        <option value="Cloud">Cloud</option>
                        <option value="Security">Security</option>
                    </select>
                </div>
                <button class="btn btn-primary" onclick="applyAnalyticsFilters()"><i class="fas fa-filter"></i> Apply</button>
                <button class="btn btn-secondary" onclick="resetAnalyticsFilters()"><i class="fas fa-undo"></i> Reset</button>
            </div>
            <div class="chart-grid">
                <div class="chart-card chart-full">
                    <div class="chart-header">
                        <h3 class="chart-title">Revenue Trends</h3>
                        <div class="chart-actions">
                            <button onclick="exportChart('revenueTrendChart')"><i class="fas fa-download"></i></button>
                        </div>
                    </div>
                    <div class="chart-wrapper"><canvas id="revenueTrendChart"></canvas></div>
                </div>
                <div class="chart-card">
                    <div class="chart-header"><h3 class="chart-title">Sales by Category</h3></div>
                    <div class="chart-wrapper"><canvas id="categorySalesChart"></canvas></div>
                </div>
                <div class="chart-card">
                    <div class="chart-header"><h3 class="chart-title">Regional Performance</h3></div>
                    <div class="chart-wrapper"><canvas id="regionalChart"></canvas></div>
                </div>
            </div>
            <div class="activity-section">
                <div class="section-header">
                    <h3 class="section-title">Analytics Data</h3>
                    <button class="btn btn-sm btn-primary" onclick="exportAnalyticsData()"><i class="fas fa-file-export"></i> Export</button>
                </div>
                <div class="table-container">
                    <table class="table">
                        <thead><tr><th>Month</th><th>Revenue</th><th>Orders</th><th>Conversion</th><th>Growth</th></tr></thead>
                        <tbody id="analyticsTableBody"></tbody>
                    </table>
                </div>
            </div>
        `;
        
        setTimeout(() => {
            try {
                if (typeof initializeAnalyticsCharts === 'function') initializeAnalyticsCharts();
                if (typeof populateAnalyticsTable === 'function') populateAnalyticsTable();
            } catch(e) {}
        }, 300);
    }

    loadReports(container) {
        container.innerHTML = `
            <div class="page-header">
                <h2>Reports</h2>
                <p class="page-description">Generate and manage reports</p>
            </div>
            <div style="display:flex;gap:12px;margin-bottom:24px;flex-wrap:wrap;">
                <button class="btn btn-primary" onclick="generateReport()"><i class="fas fa-plus"></i> Generate New Report</button>
                <button class="btn btn-secondary" onclick="scheduleReport()"><i class="fas fa-clock"></i> Schedule Report</button>
                <button class="btn btn-secondary" onclick="exportAllReports()"><i class="fas fa-file-archive"></i> Export All</button>
            </div>
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:16px;margin-bottom:24px;">
                <div class="card" style="cursor:pointer;text-align:center;padding:16px;" onclick="generateReport('Sales')">
                    <div style="font-size:28px;color:var(--primary);"><i class="fas fa-chart-line"></i></div>
                    <h4 style="font-size:14px;margin:8px 0;">Sales Report</h4>
                </div>
                <div class="card" style="cursor:pointer;text-align:center;padding:16px;" onclick="generateReport('Performance')">
                    <div style="font-size:28px;color:var(--success);"><i class="fas fa-trophy"></i></div>
                    <h4 style="font-size:14px;margin:8px 0;">Performance</h4>
                </div>
                <div class="card" style="cursor:pointer;text-align:center;padding:16px;" onclick="generateReport('Financial')">
                    <div style="font-size:28px;color:var(--warning);"><i class="fas fa-coins"></i></div>
                    <h4 style="font-size:14px;margin:8px 0;">Financial</h4>
                </div>
                <div class="card" style="cursor:pointer;text-align:center;padding:16px;" onclick="generateReport('Customers')">
                    <div style="font-size:28px;color:var(--secondary);"><i class="fas fa-users"></i></div>
                    <h4 style="font-size:14px;margin:8px 0;">Customers</h4>
                </div>
            </div>
            <div class="activity-section">
                <div class="section-header">
                    <h3 class="section-title">Recent Reports</h3>
                    <span style="font-size:13px;color:var(--text-muted);">Last 7 days</span>
                </div>
                <div class="table-container">
                    <table class="table">
                        <thead><tr><th>Report Name</th><th>Type</th><th>Generated</th><th>Status</th><th>Actions</th></tr></thead>
                        <tbody id="reportsTableBody"></tbody>
                    </table>
                </div>
            </div>
        `;
        
        setTimeout(() => {
            try {
                if (typeof populateReportsTable === 'function') populateReportsTable();
            } catch(e) {}
        }, 300);
    }

    loadDataManager(container) {
        container.innerHTML = `
            <div class="page-header">
                <h2>Data Manager</h2>
                <p class="page-description">Manage your business data with CRUD operations</p>
            </div>
            <div style="display:flex;gap:12px;margin-bottom:20px;flex-wrap:wrap;">
                <button class="btn btn-primary" onclick="showAddRecordModal()"><i class="fas fa-plus"></i> Add Record</button>
                <button class="btn btn-secondary" onclick="importData()"><i class="fas fa-file-import"></i> Import</button>
                <button class="btn btn-secondary" onclick="exportData()"><i class="fas fa-file-export"></i> Export</button>
                <button class="btn btn-danger" onclick="deleteSelected()"><i class="fas fa-trash"></i> Delete Selected</button>
            </div>
            <div class="filter-bar">
                <div class="filter-group">
                    <label>Search</label>
                    <input type="text" id="dataSearch" placeholder="Search..." oninput="filterDataTable()" />
                </div>
                <div class="filter-group">
                    <label>Category</label>
                    <select id="dataCategoryFilter" onchange="filterDataTable()">
                        <option value="all">All Categories</option>
                        <option value="Software">Software</option>
                        <option value="Hardware">Hardware</option>
                        <option value="Services">Services</option>
                        <option value="Consulting">Consulting</option>
                        <option value="Cloud">Cloud</option>
                        <option value="Security">Security</option>
                    </select>
                </div>
                <div class="filter-group">
                    <label>Status</label>
                    <select id="dataStatusFilter" onchange="filterDataTable()">
                        <option value="all">All Status</option>
                        <option value="Completed">Completed</option>
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Failed">Failed</option>
                    </select>
                </div>
                <div class="filter-group">
                    <label>Per Page</label>
                    <select id="dataPerPage" onchange="updateDataPagination()">
                        <option value="10">10</option>
                        <option value="25" selected>25</option>
                        <option value="50">50</option>
                        <option value="100">100</option>
                    </select>
                </div>
            </div>
            <div class="activity-section">
                <div class="table-container">
                    <table class="table" id="dataTable">
                        <thead>
                            <tr>
                                <th style="width:30px;"><input type="checkbox" id="selectAll" onchange="toggleSelectAll()" /></th>
                                <th onclick="sortDataTable('id')" style="cursor:pointer;">ID <span class="sort-icon"><i class="fas fa-sort"></i></span></th>
                                <th onclick="sortDataTable('customer')" style="cursor:pointer;">Customer <span class="sort-icon"><i class="fas fa-sort"></i></span></th>
                                <th onclick="sortDataTable('product')" style="cursor:pointer;">Product <span class="sort-icon"><i class="fas fa-sort"></i></span></th>
                                <th onclick="sortDataTable('category')" style="cursor:pointer;">Category <span class="sort-icon"><i class="fas fa-sort"></i></span></th>
                                <th onclick="sortDataTable('amount')" style="cursor:pointer;">Amount <span class="sort-icon"><i class="fas fa-sort"></i></span></th>
                                <th onclick="sortDataTable('status')" style="cursor:pointer;">Status <span class="sort-icon"><i class="fas fa-sort"></i></span></th>
                                <th onclick="sortDataTable('region')" style="cursor:pointer;">Region <span class="sort-icon"><i class="fas fa-sort"></i></span></th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="dataTableBody"></tbody>
                    </table>
                </div>
                <div class="pagination">
                    <div class="info" id="dataTableInfo">Showing 0-0 of 0 records</div>
                    <div class="pagination-controls" id="dataTablePagination"></div>
                </div>
            </div>
        `;
        
        setTimeout(() => {
            try {
                if (typeof initializeDataTable === 'function') initializeDataTable();
            } catch(e) {}
        }, 300);
    }

    loadSettings(container) {
        const ds = getDataService();
        const users = ds.getUsers() || [];
        
        container.innerHTML = `
            <div class="page-header">
                <h2>Settings</h2>
                <p class="page-description">Configure your application preferences</p>
            </div>
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:20px;">
                <div class="card">
                    <div class="card-header"><h3 class="card-title"><i class="fas fa-palette"></i> Theme</h3></div>
                    <div style="display:flex;flex-direction:column;gap:12px;">
                        <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;">
                            <span>Dark Mode</span>
                            <label class="switch">
                                <input type="checkbox" id="themeToggle" onchange="toggleTheme()" />
                                <span class="slider round"></span>
                            </label>
                        </div>
                        <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-top:1px solid var(--border-color);">
                            <span>High Contrast</span>
                            <label class="switch">
                                <input type="checkbox" id="contrastToggle" onchange="toggleContrast()" />
                                <span class="slider round"></span>
                            </label>
                        </div>
                    </div>
                </div>
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title"><i class="fas fa-users"></i> Users</h3>
                        <button class="btn btn-sm btn-primary" onclick="showAddUserModal()"><i class="fas fa-plus"></i></button>
                    </div>
                    <div style="max-height:250px;overflow-y:auto;">
                        ${users.map(user => `
                            <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--border-color);">
                                <div>
                                    <div style="font-weight:500;">${user.name}</div>
                                    <div style="font-size:12px;color:var(--text-muted);">${user.email}</div>
                                    <span class="status-badge ${user.active ? 'completed' : 'failed'}" style="font-size:10px;padding:2px 8px;">${user.role}</span>
                                </div>
                                <div>
                                    <button class="btn btn-sm btn-primary" onclick="editUser(${user.id})"><i class="fas fa-edit"></i></button>
                                    <button class="btn btn-sm btn-danger" onclick="deleteUser(${user.id})"><i class="fas fa-trash"></i></button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div class="card">
                    <div class="card-header"><h3 class="card-title"><i class="fas fa-database"></i> Data</h3></div>
                    <div style="display:flex;flex-direction:column;gap:12px;">
                        <button class="btn btn-secondary" onclick="clearCache()"><i class="fas fa-broom"></i> Clear Cache</button>
                        <button class="btn btn-secondary" onclick="resetData()"><i class="fas fa-undo"></i> Reset Data</button>
                        <button class="btn btn-danger" onclick="deleteAllData()"><i class="fas fa-trash"></i> Delete All Data</button>
                    </div>
                </div>
            </div>
        `;
        
        setTimeout(() => {
            const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
            const themeToggle = document.getElementById('themeToggle');
            if (themeToggle) themeToggle.checked = isDark;
        }, 100);
    }

    loadHelp(container) {
        container.innerHTML = `
            <div class="page-header">
                <h2>Help Center</h2>
                <p class="page-description">Resources and support for Velox Analytics</p>
            </div>
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:20px;margin-bottom:32px;">
                <div class="card" style="text-align:center;padding:24px;">
                    <div style="font-size:40px;color:var(--primary);"><i class="fas fa-book"></i></div>
                    <h3 style="font-size:16px;">Documentation</h3>
                    <button class="btn btn-primary btn-sm" onclick="openDocumentation()">View Docs</button>
                </div>
                <div class="card" style="text-align:center;padding:24px;">
                    <div style="font-size:40px;color:var(--success);"><i class="fas fa-video"></i></div>
                    <h3 style="font-size:16px;">Video Tutorials</h3>
                    <button class="btn btn-success btn-sm" onclick="openVideoTutorials()">Watch Videos</button>
                </div>
                <div class="card" style="text-align:center;padding:24px;">
                    <div style="font-size:40px;color:var(--warning);"><i class="fas fa-life-ring"></i></div>
                    <h3 style="font-size:16px;">Support</h3>
                    <button class="btn btn-warning btn-sm" onclick="openSupport()">Contact</button>
                </div>
            </div>
            <div class="card">
                <div class="card-header"><h3 class="card-title">FAQ</h3></div>
                <div style="display:flex;flex-direction:column;gap:12px;">
                    <div style="padding:10px 0;border-bottom:1px solid var(--border-color);">
                        <div style="font-weight:600;cursor:pointer;" onclick="this.nextElementSibling.style.display=this.nextElementSibling.style.display==='block'?'none':'block'">
                            <i class="fas fa-chevron-right"></i> How to generate a report?
                        </div>
                        <div style="display:none;padding-top:6px;color:var(--text-secondary);font-size:14px;">
                            Go to Reports section, select a template, click Generate.
                        </div>
                    </div>
                    <div style="padding:10px 0;border-bottom:1px solid var(--border-color);">
                        <div style="font-weight:600;cursor:pointer;" onclick="this.nextElementSibling.style.display=this.nextElementSibling.style.display==='block'?'none':'block'">
                            <i class="fas fa-chevron-right"></i> How to switch dark/light mode?
                        </div>
                        <div style="display:none;padding-top:6px;color:var(--text-secondary);font-size:14px;">
                            Click theme toggle in sidebar or go to Settings.
                        </div>
                    </div>
                    <div style="padding:10px 0;">
                        <div style="font-weight:600;cursor:pointer;" onclick="this.nextElementSibling.style.display=this.nextElementSibling.style.display==='block'?'none':'block'">
                            <i class="fas fa-chevron-right"></i> How to add new records?
                        </div>
                        <div style="display:none;padding-top:6px;color:var(--text-secondary);font-size:14px;">
                            Go to Data Manager, click "Add Record", fill details, save.
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    loadProfile(container) {
        container.innerHTML = `
            <div class="page-header">
                <h2>My Profile</h2>
                <p class="page-description">Manage your account details</p>
            </div>
            <div class="card" style="max-width:500px;">
                <div style="display:flex;align-items:center;gap:20px;margin-bottom:20px;">
                    <img src="https://ui-avatars.com/api/?name=${this.currentUser?.name || 'Admin+User'}&background=2563EB&color=fff&size=80" 
                         style="border-radius:50%;width:70px;height:70px;" />
                    <div>
                        <h3>${this.currentUser?.name || 'Admin User'}</h3>
                        <p style="color:var(--text-secondary);">${this.currentUser?.email || 'admin@velox.com'}</p>
                        <span class="status-badge completed">${this.currentUser?.role || 'Administrator'}</span>
                    </div>
                </div>
                <div style="border-top:1px solid var(--border-color);padding-top:16px;">
                    <p><strong>Member since:</strong> January 2024</p>
                    <p><strong>Last login:</strong> ${new Date().toLocaleString()}</p>
                </div>
                <button class="btn btn-primary" style="margin-top:16px;" onclick="changePassword()">
                    <i class="fas fa-key"></i> Change Password
                </button>
            </div>
        `;
    }

    show404() {
        const content = document.getElementById('pageContent');
        content.innerHTML = `
            <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:50vh;text-align:center;">
                <div style="font-size:80px;color:var(--text-muted);">404</div>
                <h2>Page Not Found</h2>
                <p style="color:var(--text-secondary);">The page you're looking for doesn't exist.</p>
                <button class="btn btn-primary" onclick="window.location.hash='#/dashboard'">
                    <i class="fas fa-home"></i> Go to Dashboard
                </button>
            </div>
        `;
    }

    showLogin() {
        document.getElementById('loginScreen').style.display = 'flex';
        document.getElementById('appContainer').style.display = 'none';
    }

    hideLogin() {
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('appContainer').style.display = 'block';
    }

    updateActiveNav(page) {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.dataset.page === page) link.classList.add('active');
        });
    }

    updatePageTitle(page) {
        const map = { dashboard:'Dashboard', analytics:'Analytics', reports:'Reports', data:'Data Manager', settings:'Settings', help:'Help', profile:'Profile' };
        document.getElementById('pageTitle').textContent = map[page] || page;
        document.getElementById('breadcrumb').textContent = `Home / ${map[page] || page}`;
    }

    setupEventListeners() {
        document.getElementById('loginForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.login();
        });

        document.addEventListener('click', (e) => {
            const panel = document.getElementById('notificationPanel');
            const btn = document.querySelector('.notification-btn');
            if (panel && btn && !panel.contains(e.target) && !btn.contains(e.target)) {
                panel.classList.remove('show');
            }
            const menu = document.getElementById('userMenuDropdown');
            const profile = document.querySelector('.user-profile');
            if (menu && profile && !menu.contains(e.target) && !profile.contains(e.target)) {
                menu.classList.remove('show');
            }
        });

        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                document.getElementById('globalSearch')?.focus();
            }
            if (e.key === 'Escape') {
                document.querySelectorAll('.modal-overlay.show').forEach(m => m.classList.remove('show'));
                document.getElementById('notificationPanel')?.classList.remove('show');
                document.getElementById('userMenuDropdown')?.classList.remove('show');
            }
        });
    }

    login() {
        const email = document.getElementById('loginEmail')?.value || '';
        const password = document.getElementById('loginPassword')?.value || '';

        const validUsers = [
            { email: 'admin@velox.com', password: 'admin123', name: 'Admin User', role: 'Administrator' },
            { email: 'sarah@velox.com', password: 'admin123', name: 'Sarah Johnson', role: 'Manager' }
        ];

        const user = validUsers.find(u => u.email === email && u.password === password);
        if (!user) {
            showToast('Invalid email or password', 'error');
            return;
        }

        const session = { user: { id: 1, name: user.name, email: user.email, role: user.role }, expires: Date.now() + (24 * 60 * 60 * 1000) };
        localStorage.setItem('velox_session', JSON.stringify(session));
        this.isAuthenticated = true;
        this.currentUser = session.user;

        this.hideLogin();
        window.location.hash = '#/dashboard';
        showToast('Welcome back, ' + user.name + '!', 'success');
    }

    logout() {
        if (confirm('Logout?')) {
            localStorage.removeItem('velox_session');
            this.isAuthenticated = false;
            this.currentUser = null;
            this.showLogin();
            showToast('Logged out', 'info');
        }
    }
}

// INIT
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new VeloxApp();
});

// GLOBAL FUNCTIONS
function toggleSidebar() { document.getElementById('sidebar')?.classList.toggle('open'); }
function toggleNotifications() { document.getElementById('notificationPanel')?.classList.toggle('show'); }
function toggleUserMenu() { document.getElementById('userMenuDropdown')?.classList.toggle('show'); }
function togglePassword() {
    const input = document.getElementById('loginPassword');
    const icon = document.getElementById('toggleIcon');
    if (!input || !icon) return;
    if (input.type === 'password') { input.type = 'text'; icon.className = 'fas fa-eye-slash'; }
    else { input.type = 'password'; icon.className = 'fas fa-eye'; }
}
function logout() { if (app) app.logout(); }
window.app = app;
