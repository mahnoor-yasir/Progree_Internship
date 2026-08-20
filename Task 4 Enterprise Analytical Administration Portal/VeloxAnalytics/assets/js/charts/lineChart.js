/**
 * VELOX ANALYTICS - Line Chart Component
 * Reusable line chart with configurable options
 */

class LineChart {
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
            fill: options.fill !== undefined ? options.fill : true,
            tension: options.tension || 0.4,
            showPoints: options.showPoints !== undefined ? options.showPoints : true,
            smooth: options.smooth !== undefined ? options.smooth : true,
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
            const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
            const fillColor = isDark ? color + '25' : color + '10';
            
            return {
                label: dataset.label || `Dataset ${index + 1}`,
                data: dataset.data || [],
                borderColor: dataset.borderColor || color,
                backgroundColor: dataset.backgroundColor || fillColor,
                fill: dataset.fill !== undefined ? dataset.fill : this.options.fill,
                tension: dataset.tension || this.options.tension,
                pointRadius: this.options.showPoints ? (dataset.pointRadius || 4) : 0,
                pointHoverRadius: dataset.pointHoverRadius || 6,
                pointBackgroundColor: dataset.pointBackgroundColor || color,
                pointBorderColor: dataset.pointBorderColor || '#fff',
                pointBorderWidth: dataset.pointBorderWidth || 2,
                borderWidth: dataset.borderWidth || 3,
                ...dataset
            };
        });
        
        const config = {
            type: 'line',
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
                                const value = context.parsed.y;
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
                        if (dataset.borderColor) {
                            this.chart.data.datasets[index].borderColor = dataset.borderColor;
                        }
                    }
                });
            }
        }
        
        this.chart.update();
    }
    
    addData(label, datasetIndex, value) {
        if (!this.chart) return;
        
        if (datasetIndex === undefined) {
            // Add to all datasets
            this.chart.data.labels.push(label);
            this.chart.data.datasets.forEach((dataset, index) => {
                const values = Array.isArray(this.options.datasets[index]?.data) 
                    ? this.options.datasets[index].data 
                    : [];
                dataset.data.push(value || values[index] || 0);
            });
        } else {
            // Add to specific dataset
            if (this.chart.data.datasets[datasetIndex]) {
                this.chart.data.datasets[datasetIndex].data.push(value || 0);
            }
        }
        
        this.chart.update();
    }
    
    removeData(index) {
        if (!this.chart) return;
        this.chart.data.labels.splice(index, 1);
        this.chart.data.datasets.forEach(dataset => {
            dataset.data.splice(index, 1);
        });
        this.chart.update();
    }
    
    destroy() {
        if (this.chart) {
            this.chart.destroy();
            this.chart = null;
        }
    }
    
    export(filename) {
        exportChartAsImage(this.canvasId, filename || 'line-chart');
    }
}

// Create line chart function
function createLineChart(canvasId, options) {
    return new LineChart(canvasId, options);
}

// Update line chart function
function updateLineChart(canvasId, data) {
    const chart = window[`${canvasId}_chart`];
    if (chart && chart.update) {
        chart.update(data);
    }
}

// Export functions
window.createLineChart = createLineChart;
window.updateLineChart = updateLineChart;
window.LineChart = LineChart;