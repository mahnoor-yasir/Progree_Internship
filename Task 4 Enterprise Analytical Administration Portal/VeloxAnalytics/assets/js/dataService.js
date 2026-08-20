/**
 * VELOX ANALYTICS - Data Service
 * FIXED: More data, proper pagination
 */

class DataService {
    constructor() {
        this.data = {
            sales: [],
            users: [],
            categories: [],
            regions: [],
            performance: []
        };
        this.nextId = 1000;
        this.loadData();
    }

    loadData() {
        const cached = localStorage.getItem('velox_data');
        if (cached) {
            try {
                this.data = JSON.parse(cached);
                const ids = this.data.sales.map(s => s.id);
                this.nextId = ids.length > 0 ? Math.max(...ids) + 1 : 1000;
                return;
            } catch (e) {
                console.warn('Cache corrupted, generating fresh data');
            }
        }
        this.generateMockData();
        this.saveToCache();
    }

    generateMockData() {
        const categories = ['Software', 'Hardware', 'Services', 'Consulting', 'Cloud', 'Security'];
        const products = {
            'Software': ['Enterprise Suite', 'CRM Pro', 'Analytics Platform', 'DevOps Tools', 'AI Assistant', 'ERP System', 'BI Tools'],
            'Hardware': ['Servers', 'Network Switches', 'Workstations', 'Storage Arrays', 'Firewalls', 'Routers', 'Data Centers'],
            'Services': ['Implementation', 'Training', 'Support', 'Migration', 'Consulting', 'Maintenance', 'Optimization'],
            'Consulting': ['Strategy', 'Digital Transformation', 'IT Audit', 'Risk Assessment', 'Compliance', 'Security Review'],
            'Cloud': ['Cloud Migration', 'SaaS Integration', 'Cloud Security', 'Serverless', 'Cloud Storage', 'Backup Solutions'],
            'Security': ['Penetration Testing', 'Compliance', 'Security Audit', 'Threat Detection', 'Firewall Setup', 'Encryption']
        };
        const regions = ['North America', 'Europe', 'Asia Pacific', 'South America', 'Africa', 'Middle East'];
        const statuses = ['Completed', 'Pending', 'In Progress', 'Failed'];
        const customers = [
            'Acme Corp', 'TechGlobal', 'Innovate Inc', 'CloudWorks', 'DataStream',
            'SecureNet', 'Quantum Solutions', 'Nexus Systems', 'Pioneer Group', 'Vanguard Tech',
            'Horizon Enterprises', 'Summit Partners', 'Apex Innovations', 'Core Dynamics', 'Fusion Labs',
            'Digital Frontier', 'Ironclad Systems', 'NextGen Solutions', 'Prime Consulting', 'Velocity Tech',
            'Zenith Corporation', 'Apex Solutions', 'Bridge Technologies', 'ClearPath Systems', 'Diamond Partners'
        ];
        const salespeople = ['Sarah Johnson', 'Michael Chen', 'Emily Rodriguez', 'David Kim', 'Jessica Patel', 
                            'Robert Wilson', 'Amanda Lee', 'James Brown', 'Maria Garcia', 'Thomas Anderson'];

        // Generate 200+ sales records (instead of 150)
        this.data.sales = [];
        for (let i = 0; i < 250; i++) {
            const category = categories[Math.floor(Math.random() * categories.length)];
            const product = products[category][Math.floor(Math.random() * products[category].length)];
            const date = new Date(2024, Math.floor(Math.random() * 6), Math.floor(Math.random() * 28) + 1);
            
            this.data.sales.push({
                id: this.nextId++,
                date: date.toISOString().split('T')[0],
                customer: customers[Math.floor(Math.random() * customers.length)],
                product: product,
                category: category,
                amount: Math.round((Math.random() * 15000 + 1000) / 100) * 100,
                status: statuses[Math.floor(Math.random() * statuses.length)],
                region: regions[Math.floor(Math.random() * regions.length)],
                salesperson: salespeople[Math.floor(Math.random() * salespeople.length)],
                performance: ['Excellent', 'Good', 'Average', 'Below Average'][Math.floor(Math.random() * 4)],
                created: new Date().toISOString()
            });
        }

        // Generate users with roles
        this.data.users = [
            { id: 1, name: 'Admin User', email: 'admin@velox.com', role: 'Administrator', active: true, created: '2024-01-01' },
            { id: 2, name: 'Sarah Johnson', email: 'sarah@velox.com', role: 'Manager', active: true, created: '2024-01-15' },
            { id: 3, name: 'Michael Chen', email: 'michael@velox.com', role: 'Analyst', active: true, created: '2024-02-01' },
            { id: 4, name: 'Emily Rodriguez', email: 'emily@velox.com', role: 'Viewer', active: true, created: '2024-02-15' },
            { id: 5, name: 'David Kim', email: 'david@velox.com', role: 'Manager', active: true, created: '2024-03-01' },
            { id: 6, name: 'Robert Wilson', email: 'robert@velox.com', role: 'Analyst', active: true, created: '2024-03-15' },
            { id: 7, name: 'Amanda Lee', email: 'amanda@velox.com', role: 'Viewer', active: false, created: '2024-04-01' }
        ];

        // Generate categories with more data
        this.data.categories = categories.map(c => ({
            id: this.nextId++,
            name: c,
            count: Math.floor(Math.random() * 60 + 10),
            revenue: Math.round((Math.random() * 150000 + 10000) / 100) * 100,
            growth: Math.round((Math.random() * 40 - 5) * 10) / 10
        }));

        // Generate regions
        this.data.regions = regions.map(r => ({
            id: this.nextId++,
            name: r,
            sales: Math.round((Math.random() * 800 + 100) / 10) * 10,
            revenue: Math.round((Math.random() * 300000 + 50000) / 100) * 100,
            marketShare: Math.round((Math.random() * 30 + 5) * 10) / 10
        }));

        // Generate performance data
        this.data.performance = [];
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        months.forEach((month, index) => {
            this.data.performance.push({
                month: month,
                revenue: Math.round((Math.random() * 25000 + 30000) / 100) * 100,
                orders: Math.floor(Math.random() * 250 + 200),
                conversion: Math.round((Math.random() * 5 + 1) * 10) / 10,
                growth: Math.round((Math.random() * 25 - 5) * 10) / 10
            });
        });
    }

    saveToCache() {
        try {
            localStorage.setItem('velox_data', JSON.stringify(this.data));
        } catch (e) {
            console.warn('Failed to save data to cache');
        }
    }

    // CRUD Operations
    getSales(filters = {}) {
        let result = [...this.data.sales];
        
        if (filters.search) {
            const search = filters.search.toLowerCase();
            result = result.filter(item => 
                item.customer.toLowerCase().includes(search) ||
                item.product.toLowerCase().includes(search) ||
                item.category.toLowerCase().includes(search) ||
                item.region.toLowerCase().includes(search) ||
                item.salesperson.toLowerCase().includes(search)
            );
        }
        
        if (filters.category && filters.category !== 'all') {
            result = result.filter(item => item.category === filters.category);
        }
        
        if (filters.status && filters.status !== 'all') {
            result = result.filter(item => item.status === filters.status);
        }
        
        if (filters.region && filters.region !== 'all') {
            result = result.filter(item => item.region === filters.region);
        }
        
        if (filters.startDate) {
            result = result.filter(item => item.date >= filters.startDate);
        }
        
        if (filters.endDate) {
            result = result.filter(item => item.date <= filters.endDate);
        }

        // Sort
        if (filters.sortBy) {
            const direction = filters.sortDir || 'asc';
            result.sort((a, b) => {
                let valA = a[filters.sortBy];
                let valB = b[filters.sortBy];
                if (typeof valA === 'string') valA = valA.toLowerCase();
                if (typeof valB === 'string') valB = valB.toLowerCase();
                if (valA < valB) return direction === 'asc' ? -1 : 1;
                if (valA > valB) return direction === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return result;
    }

    getSalesById(id) {
        return this.data.sales.find(item => item.id === id);
    }

    addSale(sale) {
        const newSale = {
            ...sale,
            id: this.nextId++,
            created: new Date().toISOString()
        };
        this.data.sales.push(newSale);
        this.saveToCache();
        return newSale;
    }

    updateSale(id, updates) {
        const index = this.data.sales.findIndex(item => item.id === id);
        if (index === -1) return null;
        this.data.sales[index] = { ...this.data.sales[index], ...updates };
        this.saveToCache();
        return this.data.sales[index];
    }

    deleteSale(id) {
        const index = this.data.sales.findIndex(item => item.id === id);
        if (index === -1) return false;
        this.data.sales.splice(index, 1);
        this.saveToCache();
        return true;
    }

    deleteSales(ids) {
        this.data.sales = this.data.sales.filter(item => !ids.includes(item.id));
        this.saveToCache();
        return true;
    }

    getCategories() {
        return this.data.categories;
    }

    getRegions() {
        return this.data.regions;
    }

    getPerformance() {
        return this.data.performance;
    }

    getUsers() {
        return this.data.users;
    }

    getUserById(id) {
        return this.data.users.find(user => user.id === id);
    }

    addUser(user) {
        const newUser = {
            ...user,
            id: this.data.users.length > 0 ? Math.max(...this.data.users.map(u => u.id)) + 1 : 10,
            created: new Date().toISOString().split('T')[0],
            active: true
        };
        this.data.users.push(newUser);
        this.saveToCache();
        return newUser;
    }

    updateUser(id, updates) {
        const index = this.data.users.findIndex(user => user.id === id);
        if (index === -1) return null;
        this.data.users[index] = { ...this.data.users[index], ...updates };
        this.saveToCache();
        return this.data.users[index];
    }

    deleteUser(id) {
        const index = this.data.users.findIndex(user => user.id === id);
        if (index === -1) return false;
        this.data.users.splice(index, 1);
        this.saveToCache();
        return true;
    }

    getStats() {
        const sales = this.data.sales;
        const totalRevenue = sales.reduce((sum, s) => sum + s.amount, 0);
        const completed = sales.filter(s => s.status === 'Completed').length;
        const pending = sales.filter(s => s.status === 'Pending').length;
        const avgOrder = totalRevenue / sales.length;

        return {
            totalRevenue: totalRevenue,
            totalOrders: sales.length,
            completedOrders: completed,
            pendingOrders: pending,
            avgOrderValue: avgOrder,
            conversionRate: ((completed / sales.length) * 100).toFixed(1),
            topCategory: this.getTopCategory(),
            topRegion: this.getTopRegion()
        };
    }

    getTopCategory() {
        const categories = {};
        this.data.sales.forEach(s => {
            categories[s.category] = (categories[s.category] || 0) + s.amount;
        });
        const sorted = Object.entries(categories).sort((a, b) => b[1] - a[1]);
        return sorted.length > 0 ? sorted[0][0] : 'N/A';
    }

    getTopRegion() {
        const regions = {};
        this.data.sales.forEach(s => {
            regions[s.region] = (regions[s.region] || 0) + s.amount;
        });
        const sorted = Object.entries(regions).sort((a, b) => b[1] - a[1]);
        return sorted.length > 0 ? sorted[0][0] : 'N/A';
    }

    exportData(format = 'json') {
        if (format === 'json') {
            return JSON.stringify(this.data.sales, null, 2);
        } else if (format === 'csv') {
            const headers = ['id', 'date', 'customer', 'product', 'category', 'amount', 'status', 'region', 'salesperson', 'performance'];
            const rows = this.data.sales.map(s => headers.map(h => s[h]).join(','));
            return [headers.join(','), ...rows].join('\n');
        }
        return null;
    }

    importData(data, format = 'json') {
        try {
            let sales = [];
            if (format === 'json') {
                sales = JSON.parse(data);
            } else if (format === 'csv') {
                const lines = data.split('\n');
                const headers = lines[0].split(',');
                sales = lines.slice(1).map(line => {
                    const values = line.split(',');
                    const obj = {};
                    headers.forEach((h, i) => obj[h.trim()] = values[i]?.trim());
                    return obj;
                });
            }
            sales.forEach(s => {
                this.data.sales.push({
                    ...s,
                    id: this.nextId++,
                    created: new Date().toISOString()
                });
            });
            this.saveToCache();
            return true;
        } catch (e) {
            console.error('Import failed:', e);
            return false;
        }
    }

    resetData() {
        localStorage.removeItem('velox_data');
        this.generateMockData();
        this.saveToCache();
        return true;
    }
}

// Singleton instance
const dataService = new DataService();

function getDataService() {
    return dataService;
}

function refreshData() {
    dataService.loadData();
    return dataService;
}