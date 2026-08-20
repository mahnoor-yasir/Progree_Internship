/**
 * VELOX ANALYTICS - Chart Configuration
 * Global chart settings and utilities
 */

// Chart.js global configuration
Chart.defaults.font.family = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif";
Chart.defaults.font.size = 12;
Chart.defaults.plugins.legend.labels.usePointStyle = true;
Chart.defaults.plugins.legend.labels.pointStyle = 'circle';

// Color palette for charts
const CHART_COLORS = {
    primary: '#2563EB',
    primaryLight: 'rgba(37, 99, 235, 0.1)',
    secondary: '#7C3AED',
    secondaryLight: 'rgba(124, 58, 237, 0.1)',
    success: '#10B981',
    successLight: 'rgba(16, 185, 129, 0.1)',
    warning: '#F59E0B',
    warningLight: 'rgba(245, 158, 11, 0.1)',
    danger: '#EF4444',
    dangerLight: 'rgba(239, 68, 68, 0.1)',
    info: '#06B6D4',
    infoLight: 'rgba(6, 182, 212, 0.1)',
    
    // Extended palette
    colors: [
        '#2563EB', '#7C3AED', '#10B981', '#F59E0B', '#EF4444',
        '#06B6D4', '#8B5CF6', '#EC4899', '#F97316', '#14B8A6'
    ]
};

// Get theme-aware colors
function getThemeColors() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    return {
        text: isDark ? '#CBD5E1' : '#475569',
        grid: isDark ? '#334155' : '#E2E8F0',
        background: isDark ? '#1E293B' : '#FFFFFF',
        border: isDark ? '#475569' : '#CBD5E1'
    };
}

// Chart animation defaults
const CHART_ANIMATION = {
    duration: 800,
    easing: 'easeInOutQuart'
};

// Chart tooltip configuration
const CHART_TOOLTIP = {
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    titleFont: { weight: '600', size: 13 },
    bodyFont: { size: 12 },
    padding: 12,
    cornerRadius: 8,
    displayColors: true,
    boxPadding: 4,
    usePointStyle: true
};

// Common chart options
const commonChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: CHART_ANIMATION,
    plugins: {
        legend: {
            labels: {
                color: getThemeColors().text,
                font: { size: 12, weight: '500' }
            }
        },
        tooltip: CHART_TOOLTIP
    }
};

// Get chart color with opacity
function getChartColor(colorName, opacity = 1) {
    const colors = {
        primary: `rgba(37, 99, 235, ${opacity})`,
        secondary: `rgba(124, 58, 237, ${opacity})`,
        success: `rgba(16, 185, 129, ${opacity})`,
        warning: `rgba(245, 158, 11, ${opacity})`,
        danger: `rgba(239, 68, 68, ${opacity})`,
        info: `rgba(6, 182, 212, ${opacity})`
    };
    return colors[colorName] || colors.primary;
}

// Create gradient for chart
function createGradient(ctx, color1, color2) {
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, color1);
    gradient.addColorStop(1, color2);
    return gradient;
}

// Export chart as image
function exportChartAsImage(chartId, filename = 'chart') {
    const canvas = document.getElementById(chartId);
    if (!canvas) {
        console.warn('Chart not found:', chartId);
        return;
    }
    
    const link = document.createElement('a');
    link.download = `${filename}_${new Date().toISOString().split('T')[0]}.png`;
    link.href = canvas.toDataURL('image/png', 1.0);
    link.click();
}

// Update chart theme
function updateChartTheme(chart) {
    if (!chart) return;
    
    const colors = getThemeColors();
    
    // Update scales
    if (chart.options.scales) {
        Object.keys(chart.options.scales).forEach(scaleKey => {
            const scale = chart.options.scales[scaleKey];
            if (scale.ticks) {
                scale.ticks.color = colors.text;
            }
            if (scale.grid) {
                scale.grid.color = colors.grid;
            }
            if (scale.title) {
                scale.title.color = colors.text;
            }
        });
    }
    
    // Update legend
    if (chart.options.plugins?.legend?.labels) {
        chart.options.plugins.legend.labels.color = colors.text;
    }
    
    chart.update();
}

// Export functions
window.CHART_COLORS = CHART_COLORS;
window.getThemeColors = getThemeColors;
window.getChartColor = getChartColor;
window.createGradient = createGradient;
window.exportChartAsImage = exportChartAsImage;
window.updateChartTheme = updateChartTheme;
window.commonChartOptions = commonChartOptions;
