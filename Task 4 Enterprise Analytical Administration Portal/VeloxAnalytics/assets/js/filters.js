/**
 * VELOX ANALYTICS - Filters Engine
 * Advanced search, sorting and filtering functionality
 */

class FilterEngine {
    constructor() {
        this.currentFilters = {
            search: '',
            category: 'all',
            status: 'all',
            region: 'all',
            startDate: '',
            endDate: '',
            sortBy: 'id',
            sortDir: 'asc',
            page: 1,
            perPage: 25
        };
        this.filteredData = [];
        this.dataService = getDataService();
        this.savedFilters = this.loadSavedFilters();
        this.filterHistory = [];
    }

    getFilteredData(filters = {}) {
        // Merge with current filters
        const merged = { ...this.currentFilters, ...filters };
        this.currentFilters = merged;

        // Get data from service
        let data = this.dataService.getSales(merged);

        // Store filtered data
        this.filteredData = data;
        this.addToHistory(merged);

        return {
            data: data,
            total: data.length,
            filters: merged
        };
    }

    sortData(data, sortBy, sortDir) {
        return [...data].sort((a, b) => {
            let valA = a[sortBy];
            let valB = b[sortBy];
            
            if (typeof valA === 'string') valA = valA.toLowerCase();
            if (typeof valB === 'string') valB = valB.toLowerCase();
            
            if (valA < valB) return sortDir === 'asc' ? -1 : 1;
            if (valA > valB) return sortDir === 'asc' ? 1 : -1;
            return 0;
        });
    }

    searchData(data, query) {
        if (!query) return data;
        const search = query.toLowerCase();
        return data.filter(item => 
            item.customer.toLowerCase().includes(search) ||
            item.product.toLowerCase().includes(search) ||
            item.category.toLowerCase().includes(search) ||
            item.region.toLowerCase().includes(search) ||
            item.salesperson.toLowerCase().includes(search)
        );
    }

    filterByCategory(data, category) {
        if (category === 'all') return data;
        return data.filter(item => item.category === category);
    }

    filterByStatus(data, status) {
        if (status === 'all') return data;
        return data.filter(item => item.status === status);
    }

    filterByRegion(data, region) {
        if (region === 'all') return data;
        return data.filter(item => item.region === region);
    }

    filterByDate(data, startDate, endDate) {
        let result = data;
        if (startDate) {
            result = result.filter(item => item.date >= startDate);
        }
        if (endDate) {
            result = result.filter(item => item.date <= endDate);
        }
        return result;
    }

    getPageData(data, page, perPage) {
        const start = (page - 1) * perPage;
        const end = start + perPage;
        return data.slice(start, end);
    }

    getPaginationInfo(data, page, perPage) {
        const total = data.length;
        const totalPages = Math.ceil(total / perPage);
        const start = (page - 1) * perPage + 1;
        const end = Math.min(page * perPage, total);
        
        return {
            total: total,
            totalPages: totalPages,
            currentPage: page,
            perPage: perPage,
            start: start,
            end: end,
            hasNext: page < totalPages,
            hasPrev: page > 1
        };
    }

    saveFilter(name, filters) {
        const savedFilter = {
            id: Date.now(),
            name: name,
            filters: { ...this.currentFilters, ...filters },
            created: new Date().toISOString()
        };
        this.savedFilters.push(savedFilter);
        this.persistSavedFilters();
        return savedFilter;
    }

    loadSavedFilters() {
        try {
            const saved = localStorage.getItem('velox_saved_filters');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            return [];
        }
    }

    persistSavedFilters() {
        try {
            localStorage.setItem('velox_saved_filters', JSON.stringify(this.savedFilters));
        } catch (e) {
            console.warn('Failed to save filters');
        }
    }

    deleteSavedFilter(id) {
        this.savedFilters = this.savedFilters.filter(f => f.id !== id);
        this.persistSavedFilters();
    }

    addToHistory(filters) {
        this.filterHistory.push({
            filters: { ...filters },
            timestamp: Date.now()
        });
        // Keep last 20 items
        if (this.filterHistory.length > 20) {
            this.filterHistory.shift();
        }
        try {
            localStorage.setItem('velox_filter_history', JSON.stringify(this.filterHistory));
        } catch (e) {}
    }

    loadHistory() {
        try {
            const history = localStorage.getItem('velox_filter_history');
            if (history) {
                this.filterHistory = JSON.parse(history);
            }
        } catch (e) {
            this.filterHistory = [];
        }
        return this.filterHistory;
    }

    resetFilters() {
        this.currentFilters = {
            search: '',
            category: 'all',
            status: 'all',
            region: 'all',
            startDate: '',
            endDate: '',
            sortBy: 'id',
            sortDir: 'asc',
            page: 1,
            perPage: 25
        };
        return this.currentFilters;
    }

    getQuickFilters() {
        return [
            {
                id: 'high_value',
                name: 'High Value Orders',
                filters: { sortBy: 'amount', sortDir: 'desc' }
            },
            {
                id: 'recent_orders',
                name: 'Recent Orders',
                filters: { sortBy: 'date', sortDir: 'desc' }
            },
            {
                id: 'completed',
                name: 'Completed Orders',
                filters: { status: 'Completed' }
            },
            {
                id: 'pending',
                name: 'Pending Orders',
                filters: { status: 'Pending' }
            }
        ];
    }
}

// Initialize filter engine
const filterEngine = new FilterEngine();

// Global functions for use in HTML
function applyFilters() {
    const search = document.getElementById('dataSearch')?.value || '';
    const category = document.getElementById('dataCategoryFilter')?.value || 'all';
    const status = document.getElementById('dataStatusFilter')?.value || 'all';
    
    const result = filterEngine.getFilteredData({
        search: search,
        category: category,
        status: status
    });
    
    if (typeof renderDataTable === 'function') {
        renderDataTable(result.data);
    }
    return result;
}

function sortDataTable(field) {
    const currentSort = filterEngine.currentFilters.sortBy;
    const currentDir = filterEngine.currentFilters.sortDir;
    
    if (currentSort === field) {
        filterEngine.currentFilters.sortDir = currentDir === 'asc' ? 'desc' : 'asc';
    } else {
        filterEngine.currentFilters.sortBy = field;
        filterEngine.currentFilters.sortDir = 'asc';
    }
    
    applyFilters();
    updateSortIndicators(field);
}

function updateSortIndicators(field) {
    document.querySelectorAll('#dataTable th').forEach(th => {
        th.classList.remove('sort-asc', 'sort-desc');
    });
    
    const th = document.querySelector(`#dataTable th[onclick*="${field}"]`);
    if (th) {
        const dir = filterEngine.currentFilters.sortDir;
        th.classList.add(dir === 'asc' ? 'sort-asc' : 'sort-desc');
    }
}

function filterDataTable() {
    applyFilters();
}

function updateDataPagination() {
    const perPage = document.getElementById('dataPerPage')?.value || 25;
    filterEngine.currentFilters.perPage = parseInt(perPage);
    applyFilters();
}

function resetFilters() {
    document.getElementById('dataSearch').value = '';
    document.getElementById('dataCategoryFilter').value = 'all';
    document.getElementById('dataStatusFilter').value = 'all';
    
    filterEngine.resetFilters();
    applyFilters();
    
    showToast('Filters reset successfully', 'info');
}

function applyQuickFilter(filterId) {
    const quickFilters = filterEngine.getQuickFilters();
    const filter = quickFilters.find(f => f.id === filterId);
    if (filter) {
        filterEngine.getFilteredData(filter.filters);
        applyFilters();
        showToast(`Applied: ${filter.name}`, 'success');
    }
}