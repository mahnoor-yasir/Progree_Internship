/**
 * VELOX ANALYTICS - Bar Chart Component
 * Reusable bar chart with configurable options
 */

class BarChart {
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
            horizontal: options.horizontal || false,
            stacked: options.stacked || false,
            colors: options.colors || CHART_COLORS.colors,
            showLegend: options.showLegend !== undefined ? options.showLegend : true,
            ...options
        };
        
        this.chart = null;
        this.init();
    }
    
    init() {
        const colors = getThemeColors();
        
        // Prepare datasets
        const datasets = this.options.datasets.map((dataset, index) => {
            const color = this.options.colors[index % this.options.colors.length];
            return {
                label: dataset.label || `Dataset ${index + 1}`,
                data: dataset.data || [],
                backgroundColor: dataset.backgroundColor || getChartColor('primary', 0.7),
                borderColor: dataset.borderColor || getChartColor('primary', 1),
                borderWidth: dataset.borderWidth || 2,
                borderRadius: dataset.borderRadius || 4,
                barPercentage: dataset.barPercentage || 0.7,
                categoryPercentage: dataset.categoryPercentage || 0.8,
                ...dataset
            };
        });
        
        const config = {
            type: this.options.horizontal ? 'bar' : 'bar',
            data: {
                labels: this.options.labels,
                datasets: datasets
            },
            options: {
                ...commonChartOptions,
                indexAxis: this.options.horizontal ? 'y' : 'x',
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
                                const value = context.parsed[context.dataset.horizontal ? 'x' : 'y'];
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
                        stacked: this.options.stacked,
                        title: {
                            display: !!this.options.xLabel,
                            text: this.options.xLabel,
                            color: colors.text,
                            font: { weight: '600' }
                        }
                    },
                    y: {
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
                        stacked: this.options.stacked,
                        title: {
                            display: !!this.options.yLabel,
                            text: this.options.yLabel,
                            color: colors.text,
                            font: { weight: '600' }
                        }
                    }
                }
            }
        };
        
        // Add animation
        config.options.animation = {
            ...CHART_ANIMATION,
            onComplete: function() {
                // Callback when animation completes
            }
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
                        if (dataset.backgroundColor) {
                            this.chart.data.datasets[index].backgroundColor = dataset.backgroundColor;
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
        exportChartAsImage(this.canvasId, filename || 'bar-chart');
    }
}

// Create bar chart function
function createBarChart(canvasId, options) {
    return new BarChart(canvasId, options);
}

// Update bar chart function
function updateBarChart(canvasId, data) {
    const chart = window[`${canvasId}_chart`];
    if (chart && chart.update) {
        if (data) {
            if (data.labels) chart.data.labels = data.labels;
            if (data.datasets) {
                data.datasets.forEach((dataset, index) => {
                    if (chart.data.datasets[index]) {
                        chart.data.datasets[index].data = dataset.data;
                    }
                });
            }
        }
        chart.update();
    }
}

// Export functions
window.createBarChart = createBarChart;
window.updateBarChart = updateBarChart;
window.BarChart = BarChart;