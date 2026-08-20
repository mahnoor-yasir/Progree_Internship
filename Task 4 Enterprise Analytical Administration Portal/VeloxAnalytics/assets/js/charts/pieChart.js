/**
 * VELOX ANALYTICS - Pie/Doughnut Chart Component
 * Reusable pie and doughnut chart with configurable options
 */

class PieChart {
    constructor(canvasId, options = {}) {
        this.canvasId = canvasId;
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
            console.warn(`Canvas element #${canvasId} not found`);
            return;
        }
        
        this.options = {
            labels: options.labels || [],
            data: options.data || [],
            title: options.title || '',
            type: options.type || 'doughnut', // 'pie' or 'doughnut'
            cutout: options.cutout || '65%',
            colors: options.colors || CHART_COLORS.colors,
            showLegend: options.showLegend !== undefined ? options.showLegend : true,
            showPercentage: options.showPercentage !== undefined ? options.showPercentage : true,
            ...options
        };
        
        this.chart = null;
        this.init();
    }
    
    init() {
        const colors = getThemeColors();
        const total = this.options.data.reduce((a, b) => a + b, 0);
        
        const config = {
            type: this.options.type === 'pie' ? 'pie' : 'doughnut',
            data: {
                labels: this.options.labels,
                datasets: [{
                    data: this.options.data,
                    backgroundColor: this.options.colors.slice(0, this.options.data.length),
                    borderColor: colors.background,
                    borderWidth: 3
                }]
            },
            options: {
                ...commonChartOptions,
                cutout: this.options.type === 'pie' ? '0%' : this.options.cutout,
                plugins: {
                    ...commonChartOptions.plugins,
                    legend: {
                        display: this.options.showLegend,
                        position: 'bottom',
                        labels: {
                            color: colors.text,
                            font: { size: 12, weight: '500' },
                            usePointStyle: true,
                            pointStyle: 'circle',
                            padding: 16
                        }
                    },
                    tooltip: {
                        ...CHART_TOOLTIP,
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.parsed;
                                const percentage = ((value / total) * 100).toFixed(1);
                                const display = options.showPercentage 
                                    ? `${label}: ${formatChartValue(value)} (${percentage}%)`
                                    : `${label}: ${formatChartValue(value)}`;
                                return display;
                            }
                        }
                    }
                }
            }
        };
        
        // Add animation
        config.options.animation = {
            ...CHART_ANIMATION,
            animateRotate: true
        };
        
        this.chart = new Chart(this.canvas, config);
        
        // Store reference
        window[`${this.canvasId}_chart`] = this.chart;
    }
    
    update(data) {
        if (!this.chart) return;
        
        if (data) {
            if (data.labels) this.chart.data.labels = data.labels;
            if (data.data) {
                this.chart.data.datasets[0].data = data.data;
            }
            if (data.colors) {
                this.chart.data.datasets[0].backgroundColor = data.colors;
            }
        }
        
        this.chart.update();
    }
    
    destroy() {
        if (this.chart) {
            this.chart.destroy();
            this.chart = null;
        }
    }
    
    export(filename) {
        exportChartAsImage(this.canvasId, filename || 'pie-chart');
    }
}

// Create pie chart function
function createPieChart(canvasId, options) {
    return new PieChart(canvasId, options);
}

// Create doughnut chart function
function createDoughnutChart(canvasId, options) {
    return new PieChart(canvasId, { ...options, type: 'doughnut' });
}

// Update pie chart function
function updatePieChart(canvasId, data) {
    const chart = window[`${canvasId}_chart`];
    if (chart && chart.update) {
        chart.update(data);
    }
}

// Export functions
window.createPieChart = createPieChart;
window.createDoughnutChart = createDoughnutChart;
window.updatePieChart = updatePieChart;
window.PieChart = PieChart;