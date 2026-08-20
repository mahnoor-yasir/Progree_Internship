/**
 * VELOX ANALYTICS - Theme Engine
 * Dark/Light mode with persistence and system preference detection
 */

class ThemeEngine {
    constructor() {
        this.theme = 'light';
        this.contrast = false;
        this.fontSize = 100;
        this.init();
    }

    init() {
        // Load saved preferences
        this.loadPreferences();

        // Detect system preference
        if (!localStorage.getItem('velox_theme')) {
            this.detectSystemTheme();
        }

        // Apply theme
        this.applyTheme();

        // Setup contrast toggle
        this.setupContrast();

        // Setup font size controls
        this.setupFontSize();

        console.log('Theme Engine initialized:', {
            theme: this.theme,
            contrast: this.contrast,
            fontSize: this.fontSize
        });
    }

    loadPreferences() {
        // Load theme
        const savedTheme = localStorage.getItem('velox_theme');
        if (savedTheme) {
            this.theme = savedTheme;
        }

        // Load contrast
        const savedContrast = localStorage.getItem('velox_contrast');
        if (savedContrast !== null) {
            this.contrast = savedContrast === 'true';
        }

        // Load font size
        const savedFontSize = localStorage.getItem('velox_font_size');
        if (savedFontSize) {
            this.fontSize = parseInt(savedFontSize);
        }
    }

    detectSystemTheme() {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            this.theme = 'dark';
        }
    }

    toggleTheme() {
        this.theme = this.theme === 'light' ? 'dark' : 'light';
        this.applyTheme();
        this.savePreferences();
        
        // Show toast notification
        const message = this.theme === 'dark' ? 'Dark mode enabled' : 'Light mode enabled';
        showToast(message, 'info');
        
        // Update toggle button
        this.updateToggleUI();
    }

    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.theme);
        
        // Update meta theme-color
        const metaTheme = document.querySelector('meta[name="theme-color"]');
        if (metaTheme) {
            metaTheme.content = this.theme === 'dark' ? '#0F172A' : '#F8FAFC';
        }
        
        // Update chart themes if charts are loaded
        if (typeof updateChartThemes === 'function') {
            setTimeout(updateChartThemes, 100);
        }
        
        // Update body class
        document.body.classList.toggle('dark-theme', this.theme === 'dark');
    }

    toggleContrast() {
        this.contrast = !this.contrast;
        document.documentElement.setAttribute('data-contrast', this.contrast ? 'high' : 'normal');
        this.savePreferences();
        
        showToast(this.contrast ? 'High contrast mode enabled' : 'High contrast mode disabled', 'info');
    }

    setupContrast() {
        const saved = localStorage.getItem('velox_contrast');
        if (saved === 'true') {
            this.contrast = true;
            document.documentElement.setAttribute('data-contrast', 'high');
        }
    }

    adjustFontSize(delta) {
        this.fontSize = Math.max(80, Math.min(120, this.fontSize + delta));
        document.documentElement.style.fontSize = this.fontSize + '%';
        this.savePreferences();
        
        showToast(`Font size: ${this.fontSize}%`, 'info');
    }

    setupFontSize() {
        const saved = localStorage.getItem('velox_font_size');
        if (saved) {
            this.fontSize = parseInt(saved);
            document.documentElement.style.fontSize = this.fontSize + '%';
        }
    }

    updateToggleUI() {
        const toggle = document.getElementById('themeToggle');
        if (toggle) {
            toggle.checked = this.theme === 'dark';
        }
        
        const icon = document.getElementById('themeIcon');
        const label = document.getElementById('themeLabel');
        if (icon && label) {
            icon.className = this.theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
            label.textContent = this.theme === 'dark' ? 'Light Mode' : 'Dark Mode';
        }
    }

    savePreferences() {
        localStorage.setItem('velox_theme', this.theme);
        localStorage.setItem('velox_contrast', String(this.contrast));
        localStorage.setItem('velox_font_size', String(this.fontSize));
    }
}

// Initialize theme engine
const themeEngine = new ThemeEngine();

// Global functions
function toggleTheme() {
    themeEngine.toggleTheme();
}

function toggleContrast() {
    themeEngine.toggleContrast();
}

function adjustFontSize(delta) {
    themeEngine.adjustFontSize(delta);
}

// Listen for system theme changes
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem('velox_theme')) {
        themeEngine.theme = e.matches ? 'dark' : 'light';
        themeEngine.applyTheme();
        themeEngine.updateToggleUI();
    }
});