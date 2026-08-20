/**
 * VELOX ANALYTICS - Mixed Chart Component
 * Combination chart with multiple chart types
 */

class MixedChart {
    constructor(canvasId, options = {}) {
        this.canvasId = canvasId;
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
            console.warn(`Canvas element #${canvasId} not found`);
            return;
        }
        
        this.options = {
            labels: options.labels || [],
            datasets: options.datasets || [],
            title: options.title || '',
            xLabel: options.xLabel || '',
            yLabel: options.yLabel || '',
            showLegend: options.showLegend !== undefined ? options.showLegend : true,
            ...options
        };
        
        this.chart = null;
        this.init();
    }
    
    init() {
        const colors = getThemeColors();
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        
        // Prepare datasets with mixed types
        const datasets = this.options.datasets.map((dataset, index) => {
            const color = CHART_COLORS.colors[index % CHART_COLORS.colors.length];
            const type = dataset.type || 'line';
            
            const baseConfig = {
                label: dataset.label || `Dataset ${index + 1}`,
                data: dataset.data || [],
                borderColor: dataset.borderColor || color,
                backgroundColor: dataset.backgroundColor || (type === 'line' ? color + '20' : color + '80'),
                borderWidth: dataset.borderWidth || (type === 'line' ? 3 : 2),
                fill: dataset.fill !== undefined ? dataset.fill : (type === 'line'),
                tension: dataset.tension || 0.4,
                pointRadius: dataset.pointRadius || (type === 'line' ? 4 : 0),
                pointHoverRadius: dataset.pointHoverRadius || 6,
                pointBackgroundColor: dataset.pointBackgroundColor || color,
                pointBorderColor: dataset.pointBorderColor || '#fff',
                pointBorderWidth: dataset.pointBorderWidth || 2,
                borderRadius: dataset.borderRadius || 4,
                barPercentage: dataset.barPercentage || 0.7,
                categoryPercentage: dataset.categoryPercentage || 0.8,
                type: type,
                yAxisID: dataset.yAxisID || 'y'
            };
            
            if (type === 'bar') {
                baseConfig.backgroundColor = dataset.backgroundColor || getChartColor('primary', 0.7);
                baseConfig.borderColor = dataset.borderColor || getChartColor('primary', 1);
            }
            
            return baseConfig;
        });
        
        const config = {
            type: 'bar',
            data: {
                labels: this.options.labels,
                datasets: datasets
            },
            options: {
                ...commonChartOptions,
                plugins: {
                    ...commonChartOptions.plugins,
                    legend: {
                        display: this.options.showLegend,
                        position: 'top',
                        labels: {
                            color: colors.text,
                            font: { size: 12, weight: '500' },
                            usePointStyle: true,
                            pointStyle: 'circle'
                        }
                    },
                    tooltip: {
                        ...CHART_TOOLTIP,
                        callbacks: {
                            label: function(context) {
                                const label = context.dataset.label || '';
                                const value = context.parsed.y || context.parsed.x;
                                return `${label}: ${formatChartValue(value)}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: colors.grid,
                            drawBorder: false
                        },
                        ticks: {
                            color: colors.text
                        },
                        title: {
                            display: !!this.options.xLabel,
                            text: this.options.xLabel,
                            color: colors.text,
                            font: { weight: '600' }
                        }
                    },
                    y: {
                        position: 'left',
                        grid: {
                            color: colors.grid,
                            drawBorder: false
                        },
                        ticks: {
                            color: colors.text,
                            callback: function(value) {
                                return formatChartValue(value);
                            }
                        },
                        title: {
                            display: !!this.options.yLabel,
                            text: this.options.yLabel,
                            color: colors.text,
                            font: { weight: '600' }
                        }
                    },
                    y1: {
                        position: 'right',
                        grid: {
                            drawOnChartArea: false,
                            color: colors.grid
                        },
                        ticks: {
                            color: colors.text,
                            callback: function(value) {
                                return formatChartValue(value);
                            }
                        }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                }
            }
        };
        
        // Add animation
        config.options.animation = {
            ...CHART_ANIMATION,
            onComplete: function() {}
        };
        
        this.chart = new Chart(this.canvas, config);
        
        // Store reference
        window[`${this.canvasId}_chart`] = this.chart;
    }
    
    update(data) {
        if (!this.chart) return;
        
        if (data) {
            if (data.labels) this.chart.data.labels = data.labels;
            if (data.datasets) {
                data.datasets.forEach((dataset, index) => {
                    if (this.chart.data.datasets[index]) {
                        this.chart.data.datasets[index].data = dataset.data;
                        if (dataset.label) {
                            this.chart.data.datasets[index].label = dataset.label;
                        }
                    }
                });
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
        exportChartAsImage(this.canvasId, filename || 'mixed-chart');
    }
}

// Create mixed chart function
function createMixedChart(canvasId, options) {
    return new MixedChart(canvasId, options);
}

// Update mixed chart function
function updateMixedChart(canvasId, data) {
    const chart = window[`${canvasId}_chart`];
    if (chart && chart.update) {
        chart.update(data);
    }
}

// Export functions
window.createMixedChart = createMixedChart;
window.updateMixedChart = updateMixedChart;
window.MixedChart = MixedChart;

// Chart value formatter
function formatChartValue(value) {
    if (value === undefined || value === null) return '0';
    if (typeof value === 'string') return value;
    if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M';
    if (value >= 1000) return (value / 1000).toFixed(1) + 'K';
    return value.toLocaleString();
}

// Export formatter
window.formatChartValue = formatChartValue;