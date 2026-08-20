/**
 * VELOX ANALYTICS - Notification System
 * Toast notifications and notification center
 */

class NotificationManager {
    constructor() {
        this.notifications = [];
        this.unreadCount = 0;
        this.loadNotifications();
        this.setupContainer();
    }

    setupContainer() {
        // Create toast container if it doesn't exist
        if (!document.querySelector('.toast-container')) {
            const container = document.createElement('div');
            container.className = 'toast-container';
            document.body.appendChild(container);
        }
    }

    loadNotifications() {
        try {
            const saved = localStorage.getItem('velox_notifications');
            if (saved) {
                const data = JSON.parse(saved);
                this.notifications = data.notifications || [];
                this.unreadCount = data.unreadCount || 0;
                this.updateBadge();
            }
        } catch (e) {
            this.notifications = [];
            this.unreadCount = 0;
        }
    }

    saveNotifications() {
        try {
            localStorage.setItem('velox_notifications', JSON.stringify({
                notifications: this.notifications,
                unreadCount: this.unreadCount
            }));
        } catch (e) {}
    }

    addNotification(message, type = 'info', title = '') {
        const notification = {
            id: Date.now(),
            title: title || this.getDefaultTitle(type),
            message: message,
            type: type,
            timestamp: Date.now(),
            read: false
        };
        
        this.notifications.unshift(notification);
        this.unreadCount++;
        this.saveNotifications();
        this.updateBadge();
        this.renderNotificationPanel();
        
        // Show toast
        this.showToast(message, type, title);
        
        return notification;
    }

    getDefaultTitle(type) {
        const titles = {
            'success': 'Success',
            'error': 'Error',
            'warning': 'Warning',
            'info': 'Information'
        };
        return titles[type] || 'Notification';
    }

    showToast(message, type = 'info', title = '') {
        const container = document.querySelector('.toast-container');
        if (!container) return;

        const icons = {
            'success': 'fas fa-check-circle',
            'error': 'fas fa-exclamation-circle',
            'warning': 'fas fa-exclamation-triangle',
            'info': 'fas fa-info-circle'
        };

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <div class="toast-icon ${type}"><i class="${icons[type] || icons.info}"></i></div>
            <div class="toast-content">
                <div class="title">${title || this.getDefaultTitle(type)}</div>
                <div class="message">${message}</div>
            </div>
            <div class="toast-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </div>
        `;

        container.appendChild(toast);

        // Auto remove after 4 seconds
        setTimeout(() => {
            if (toast.parentElement) {
                toast.style.opacity = '0';
                toast.style.transform = 'translateX(100px)';
                setTimeout(() => toast.remove(), 300);
            }
        }, 4000);
    }

    updateBadge() {
        const badge = document.getElementById('notificationBadge');
        if (badge) {
            if (this.unreadCount > 0) {
                badge.textContent = this.unreadCount > 99 ? '99+' : this.unreadCount;
                badge.style.display = 'flex';
            } else {
                badge.style.display = 'none';
            }
        }
    }

    renderNotificationPanel() {
        const list = document.getElementById('notificationList');
        if (!list) return;

        if (this.notifications.length === 0) {
            list.innerHTML = `
                <div class="empty-state" style="padding:30px 20px;">
                    <i class="fas fa-bell-slash"></i>
                    <h3>No notifications</h3>
                    <p>You're all caught up!</p>
                </div>
            `;
            return;
        }

        const icons = {
            'success': 'fas fa-check-circle success',
            'error': 'fas fa-exclamation-circle warning',
            'warning': 'fas fa-exclamation-triangle warning',
            'info': 'fas fa-info-circle info'
        };

        list.innerHTML = this.notifications.slice(0, 20).map(n => `
            <div class="notification-item ${n.read ? '' : 'unread'}" 
                 onclick="markNotificationRead(${n.id})"
                 style="${n.read ? '' : 'background: var(--bg-tertiary);'}">
                <div class="icon ${n.type}"><i class="${icons[n.type] || icons.info}"></i></div>
                <div class="content">
                    <div class="title">${n.title}</div>
                    <div class="message" style="font-size:13px;color:var(--text-secondary);">${n.message}</div>
                    <div class="time">${this.formatTime(n.timestamp)}</div>
                </div>
                ${!n.read ? '<span style="font-size:8px;color:var(--primary);">●</span>' : ''}
            </div>
        `).join('');
    }

    formatTime(timestamp) {
        const diff = Date.now() - timestamp;
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) return days + 'd ago';
        if (hours > 0) return hours + 'h ago';
        if (minutes > 0) return minutes + 'm ago';
        return 'Just now';
    }

    markRead(id) {
        const notification = this.notifications.find(n => n.id === id);
        if (notification && !notification.read) {
            notification.read = true;
            this.unreadCount--;
            this.saveNotifications();
            this.updateBadge();
            this.renderNotificationPanel();
        }
    }

    markAllRead() {
        this.notifications.forEach(n => n.read = true);
        this.unreadCount = 0;
        this.saveNotifications();
        this.updateBadge();
        this.renderNotificationPanel();
    }

    clearAll() {
        this.notifications = [];
        this.unreadCount = 0;
        this.saveNotifications();
        this.updateBadge();
        this.renderNotificationPanel();
    }
}

// Initialize notification manager
const notificationManager = new NotificationManager();

// Global functions
function showToast(message, type = 'info', title = '') {
    notificationManager.showToast(message, type, title);
}

function addNotification(message, type = 'info', title = '') {
    notificationManager.addNotification(message, type, title);
}

function markNotificationRead(id) {
    notificationManager.markRead(id);
}

function clearAllNotifications() {
    notificationManager.clearAll();
    document.getElementById('notificationPanel')?.classList.remove('show');
}

function viewAllActivity() {
    window.location.hash = '#/data';
}