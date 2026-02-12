// ===== AUTHENTICATION CHECK =====
const currentPage = window.location.pathname.split('/').pop();
const protectedPages = ['dashboard.html', 'profile.html'];
if (protectedPages.includes(currentPage) && localStorage.getItem('cartel_logged_in') !== 'true') {
    window.location.href = 'login.html';
}

// ===== DOM ELEMENTS =====
const sidebar = document.getElementById('sidebar');
const sidebarToggle = document.getElementById('sidebarToggle');
const sidebarClose = document.getElementById('sidebarClose');
const financeToggle = document.getElementById('financeToggle');
const financeSubmenu = document.getElementById('financeSubmenu');
const addWidgetBtn = document.getElementById('addWidgetBtn');
const widgetModal = document.getElementById('widgetModal');
const modalClose = document.getElementById('modalClose');
const exportReportBtn = document.getElementById('exportReportBtn');
const aiToggle = document.getElementById('aiToggle');
const aiPanel = document.getElementById('aiPanel');
const aiClose = document.getElementById('aiClose');
const aiInput = document.getElementById('aiInput');
const aiSend = document.getElementById('aiSend');
const aiMessages = document.getElementById('aiMessages');
const tableSearch = document.getElementById('tableSearch');
const tableFilter = document.getElementById('tableFilter');
const prevPageBtn = document.getElementById('prevPage');
const nextPageBtn = document.getElementById('nextPage');
const productsTable = document.getElementById('productsTable');
const profileDropdown = document.getElementById('profileDropdown');
const profileAvatar = document.getElementById('profileAvatar');
const profileAvatarImage = document.getElementById('profileAvatarImage');
const profileAvatarInitials = document.getElementById('profileAvatarInitials');
const avatarUploadInput = document.getElementById('avatarUploadInput');
const uploadAvatarBtn = document.getElementById('uploadAvatarBtn');
const removeAvatarBtn = document.getElementById('removeAvatarBtn');
const avatarPreviewPanel = document.getElementById('avatarPreviewPanel');
const avatarPreviewImage = document.getElementById('avatarPreviewImage');
const saveAvatarBtn = document.getElementById('saveAvatarBtn');
const cancelAvatarBtn = document.getElementById('cancelAvatarBtn');
const profileModal = document.getElementById('profileModal');
const closeProfileModal = document.getElementById('closeProfileModal');
const modalAvatarPreview = document.getElementById('modalAvatarPreview');
const modalAvatarInitials = document.getElementById('modalAvatarInitials');
const modalUploadBtn = document.getElementById('modalUploadBtn');
const modalRemoveBtn = document.getElementById('modalRemoveBtn');
const modalFileInput = document.getElementById('modalFileInput');
const modalSaveBtn = document.getElementById('modalSaveBtn');
const modalNameInput = document.getElementById('modalNameInput');
const resetLayoutBtn = document.getElementById('resetLayoutBtn');
const logoutBtn = document.getElementById('logoutBtn');
const notificationBtn = document.getElementById('notificationBtn');
const notificationDropdown = document.getElementById('notificationDropdown');
const notificationList = document.getElementById('notificationList');
const notificationBadge = document.getElementById('notificationBadge');
const markAllReadBtn = document.getElementById('markAllReadBtn');
const notificationWrapper = document.getElementById('notificationWrapper');

// ===== GLOBAL DATA STORE (For AI Access) =====
window.cartelData = {
    revenue: [12000, 15000, 18000, 22000, 25000, 28000, 32000, 35000, 38000, 42000, 45000, 48000],
    activity: [1200, 1500, 1800, 2100, 2400, 800, 600],
    activityLabels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    retention: [85, 15]
};

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('sidebar')) initializeSidebar();
    if (document.getElementById('revenueChart')) initializeCharts();
    if (document.getElementById('aiAssistant')) initializeAIAssistant();
    if (document.getElementById('productsTable')) initializeSmartTable();
    if (document.getElementById('profileDropdown')) initializeProfileAvatar();
    if (document.querySelector('.kpi-card')) initializeAnimations();
    if (document.querySelector('.kpi-value')) initializeNumberCounters();
    initializeTheme();
    initializeDragAndDrop();
    if (resetLayoutBtn) initializeSettings();
    if (exportReportBtn) initializeExport();
    if (document.querySelector('.kpi-card')) initializeSmartWidgets();
    if (document.querySelector('.sidebar-nav')) initializeSmartNavigation();
    if (logoutBtn) initializeLogout();
    if (notificationBtn) initializeNotifications();
    if (widgetModal) initializeWidgetManager();
    if (document.getElementById('cookieBanner')) initializeCookieConsent();
    if (document.getElementById('backToTop')) initializeBackToTop();
    initializeGlobalEmailLinks();
});

// ===== THEME FUNCTIONALITY =====
function initializeTheme() {
    const themeToggle = document.getElementById('themeToggle');
    const html = document.documentElement;
    const systemMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    function getSystemTheme() {
        return systemMediaQuery.matches ? 'dark' : 'light';
    }
    
    function updateThemeIcon(theme) {
        if (!themeToggle) return;
        if (theme === 'dark') {
            themeToggle.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`;
        } else {
            themeToggle.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;
        }
    }

    function setTheme(theme, save = true) {
        html.setAttribute('data-theme', theme);
        updateThemeIcon(theme);
        if (save) {
            localStorage.setItem('theme', theme);
        }
    }

    // Initial Load
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        setTheme(savedTheme, false);
    } else {
        setTheme(getSystemTheme(), false);
    }

    // System Change Listener
    systemMediaQuery.addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
            setTheme(e.matches ? 'dark' : 'light', false);
        }
    });

    // Toggle Button
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const currentTheme = html.getAttribute('data-theme') || 'light';
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            setTheme(newTheme, true);
        });
    }
}

// ===== SIDEBAR FUNCTIONALITY =====
function initializeSidebar() {
    // Toggle sidebar
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.add('show');
        });
    }

    if (sidebarClose) {
        sidebarClose.addEventListener('click', () => {
            sidebar.classList.remove('show');
        });
    }

    // Finance submenu toggle
    if (financeToggle) {
        financeToggle.addEventListener('click', () => {
            financeSubmenu.classList.toggle('show');
            financeToggle.classList.toggle('active');
        });
    }

    // Close sidebar when clicking outside
    document.addEventListener('click', (e) => {
        if (!sidebar.contains(e.target) && !sidebarToggle.contains(e.target)) {
            sidebar.classList.remove('show');
        }
    });

    // Navigation active state
    // Highlight current page based on URL or body class
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-item');
    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentPage) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

// ===== CHART INITIALIZATION =====
function initializeCharts() {
    // Revenue Trend Chart (formerly Profit)
    const revenueCtx = document.getElementById('revenueChart').getContext('2d');
    new Chart(revenueCtx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            datasets: [{
                label: 'Revenue',
                data: window.cartelData.revenue,
                borderColor: '#3B82F6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#3B82F6',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                pointRadius: 6,
                pointHoverRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: '#94A3B8',
                        callback: function(value) {
                            return '$' + value.toLocaleString();
                        }
                    }
                },
                x: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: '#94A3B8'
                    }
                }
            },
            interaction: {
                intersect: false,
                mode: 'index'
            }
        }
    });

    // User Activity Chart (formerly Active Days)
    const activityCtx = document.getElementById('activityChart').getContext('2d');
    new Chart(activityCtx, {
        type: 'bar',
        data: {
            labels: window.cartelData.activityLabels,
            datasets: [{
                label: 'Active Users',
                data: window.cartelData.activity,
                backgroundColor: '#3B82F6',
                borderRadius: 8,
                borderSkipped: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: '#94A3B8'
                    }
                },
                x: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: '#94A3B8'
                    }
                }
            }
        }
    });

    // Customer Retention Chart (formerly Satisfaction)
    const retentionCtx = document.getElementById('retentionChart').getContext('2d');
    new Chart(retentionCtx, {
        type: 'doughnut',
        data: {
            labels: ['Retained', 'Churned'],
            datasets: [{
                data: window.cartelData.retention,
                backgroundColor: ['#10B981', '#EF4444'],
                borderWidth: 0,
                hoverOffset: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#E2E8F0',
                        padding: 20,
                        usePointStyle: true
                    }
                }
            },
            cutout: '70%'
        }
    });

    // Generate AI Insights
    generateAIInsights(window.cartelData.revenue, window.cartelData.activity, window.cartelData.activityLabels, window.cartelData.retention);
}

function generateAIInsights(revenue, activity, activityLabels, retention) {
    // Revenue Insight
    const revenueInsightEl = document.getElementById('revenueInsight');
    const lastMonthRev = revenue[revenue.length - 1];
    const prevMonthRev = revenue[revenue.length - 2];
    const growth = ((lastMonthRev - prevMonthRev) / prevMonthRev) * 100;
    
    let revHtml = '';
    if (growth > 0) {
        revHtml = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            <div><strong>Growth Detected:</strong> Revenue is up ${growth.toFixed(1)}% compared to last month. Keep up the momentum!</div>
        `;
    } else {
        revenueInsightEl.classList.add('warning');
        revHtml = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            <div><strong>Attention Needed:</strong> Revenue dropped by ${Math.abs(growth).toFixed(1)}%. Check for campaign endings or seasonal dips.</div>
        `;
    }
    revenueInsightEl.innerHTML = revHtml;

    // Activity Insight
    const activityInsightEl = document.getElementById('activityInsight');
    const maxActivity = Math.max(...activity);
    const maxIndex = activity.indexOf(maxActivity);
    const peakDay = activityLabels[maxIndex];
    
    activityInsightEl.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
        <div><strong>Peak Activity:</strong> User engagement peaks on ${peakDay}s. Consider scheduling major announcements for this day.</div>
    `;

    // Retention Insight
    const retentionInsightEl = document.getElementById('retentionInsight');
    const retentionRate = (retention[0] / (retention[0] + retention[1])) * 100;
    
    if (retentionRate < 90) {
        retentionInsightEl.classList.add('danger');
        retentionInsightEl.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
            <div><strong>Churn Alert:</strong> Retention rate is ${retentionRate.toFixed(1)}%, which is below the 90% target. Investigate user drop-off points.</div>
        `;
    } else {
        retentionInsightEl.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            <div><strong>Healthy Retention:</strong> Customer retention is strong at ${retentionRate.toFixed(1)}%. Loyalty programs are effective.</div>
        `;
    }
}

// ===== AI ASSISTANT FUNCTIONALITY =====
function initializeAIAssistant() {
    // Toggle AI panel
    aiToggle.addEventListener('click', () => {
        aiPanel.classList.toggle('show');
    });

    // Close AI panel
    aiClose.addEventListener('click', () => {
        aiPanel.classList.remove('show');
    });

    // Send message
    aiSend.addEventListener('click', sendAIMessage);
    aiInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendAIMessage();
        }
    });

    // Close AI panel when clicking outside
    document.addEventListener('click', (e) => {
        if (!aiPanel.contains(e.target) && !aiToggle.contains(e.target)) {
            aiPanel.classList.remove('show');
        }
    });
}

function sendAIMessage() {
    const message = aiInput.value.trim();
    if (!message) return;

    // Add user message
    addAIMessage(message, 'user');
    aiInput.value = '';

    // Show typing indicator
    showTypingIndicator();

    // Simulate AI response
    setTimeout(() => {
        hideTypingIndicator();
        const response = MrX.process(message);
        addAIMessage(response, 'bot');
    }, 1000 + Math.random() * 1000);
}

function addAIMessage(text, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `ai-message ${type}`;

    const avatarDiv = document.createElement('div');
    avatarDiv.className = 'message-avatar';

    if (type === 'bot') {
        avatarDiv.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9.75 9.75C9.75 8.50736 10.7574 7.5 12 7.5C13.2426 7.5 14.25 8.50736 14.25 9.75C14.25 10.9926 13.2426 12 12 12C10.7574 12 9.75 10.9926 9.75 9.75Z" fill="#3B82F6"/>
                <path d="M6 20.25C6 16.5221 9.02208 13.5 12.75 13.5H13.5C16.3995 13.5 18.75 15.8505 18.75 18.75V19.5C18.75 20.3284 18.0784 21 17.25 21H7.5C6.67157 21 6 20.3284 6 19.5V20.25Z" fill="#3B82F6"/>
                <path fill-rule="evenodd" clip-rule="evenodd" d="M12 2.25C6.61522 2.25 2.25 6.61522 2.25 12C2.25 17.3848 6.61522 21.75 12 21.75C17.3848 21.75 21.75 17.3848 21.75 12C21.75 6.61522 17.3848 2.25 12 2.25ZM3.75 12C3.75 7.44365 7.44365 3.75 12 3.75C16.5563 3.75 20.25 7.44365 20.25 12C20.25 16.5563 16.5563 20.25 12 20.25C7.44365 20.25 3.75 16.5563 3.75 12Z" fill="#3B82F6"/>
            </svg>
        `;
    } else {
        avatarDiv.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="#10B981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <circle cx="12" cy="7" r="4" stroke="#10B981" stroke-width="2"/>
            </svg>
        `;
    }

    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.innerHTML = typeof text === 'string' ? `<p>${text}</p>` : text;

    messageDiv.appendChild(avatarDiv);
    messageDiv.appendChild(contentDiv);

    aiMessages.appendChild(messageDiv);
    aiMessages.scrollTop = aiMessages.scrollHeight;
}

function showTypingIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'typing-indicator';
    indicator.id = 'typingIndicator';

    for (let i = 0; i < 3; i++) {
        const dot = document.createElement('div');
        dot.className = 'typing-dot';
        indicator.appendChild(dot);
    }

    aiMessages.appendChild(indicator);
    aiMessages.scrollTop = aiMessages.scrollHeight;
}

function hideTypingIndicator() {
    const indicator = document.getElementById('typingIndicator');
    if (indicator) {
        indicator.remove();
    }
}

// ===== MR. X AI LOGIC =====
const MrX = {
    name: "Mr. X",
    role: "Senior AI Data Strategist",
    memory: [],

    process(input) {
        this.memory.push({ role: 'user', content: input });
        const lowerInput = input.toLowerCase();

        // SECURITY RULE: Never access passwords or tokens
        if (lowerInput.includes('password') || lowerInput.includes('token') || lowerInput.includes('key') || lowerInput.includes('credential')) {
            return `<p><strong>Security Alert:</strong> I am programmed to strictly adhere to security protocols. I cannot access, store, or discuss sensitive credentials like passwords or tokens.</p>`;
        }

        // Intent: Sales Drop / Analysis
        if ((lowerInput.includes('sales') || lowerInput.includes('revenue')) && (lowerInput.includes('drop') || lowerInput.includes('down') || lowerInput.includes('low') || lowerInput.includes('why'))) {
            return this.analyzeSalesDrop();
        }

        // Intent: Traffic / Activity
        if (lowerInput.includes('traffic') || lowerInput.includes('activity') || lowerInput.includes('users')) {
            return this.analyzeTraffic();
        }

        // Intent: Optimization / Fix
        if (lowerInput.includes('optimize') || lowerInput.includes('fix') || lowerInput.includes('improve')) {
            return this.suggestOptimization();
        }

        // Default Response
        return `<p>I am analyzing your data streams. I can help you with:</p>
                <ul style="margin: 8px 0 8px 20px; font-size: 13px; color: var(--text-secondary);">
                    <li>Analyzing revenue trends</li>
                    <li>Investigating traffic drops</li>
                    <li>Optimizing dashboard layout</li>
                </ul>
                <p>What is your strategic priority?</p>`;
    },

    analyzeSalesDrop() {
        // Simulated multi-step logic
        return `
            <p>I've initiated a deep-dive analysis on the revenue decline.</p>
            <ul class="ai-step-list">
                <li class="ai-step-item"><span class="ai-step-check">✓</span> Comparing last 7 days revenue stream</li>
                <li class="ai-step-item"><span class="ai-step-check">✓</span> Cross-referencing with traffic sources</li>
                <li class="ai-step-item"><span class="ai-step-check">✓</span> Analyzing cart abandonment rates</li>
            </ul>
            <div class="ai-insight-card">
                <div class="ai-insight-title">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#EF4444" stroke-width="2"><path d="M23 18l-9.5-9.5-5 5L1 6"/></svg>
                    Revenue Alert
                </div>
                <div class="ai-insight-value negative">-12.4% vs Last Week</div>
                <div class="ai-insight-cause"><strong>Root Cause:</strong> The "Summer Sale" email campaign ended 48 hours ago, correlating with the drop.</div>
            </div>
            <div class="ai-actions">
                <button class="ai-action-btn" onclick="alert('Simulating: Relaunching Campaign...')">Relaunch Campaign</button>
                <button class="ai-action-btn" onclick="alert('Opening detailed report...')">View Full Report</button>
            </div>
        `;
    },

    analyzeTraffic() {
        const peakDay = window.cartelData.activityLabels[window.cartelData.activity.indexOf(Math.max(...window.cartelData.activity))];
        return `
            <p>Analyzing user activity patterns...</p>
            <div class="ai-insight-card">
                <div class="ai-insight-title">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                    Traffic Insight
                </div>
                <div class="ai-insight-value positive">Peak: ${peakDay}</div>
                <div class="ai-insight-cause">User engagement is highest on <strong>${peakDay}s</strong>. This is your optimal window for major announcements.</div>
            </div>
            <div class="ai-actions">
                <button class="ai-action-btn" onclick="alert('Schedule set for next ' + '${peakDay}')">Schedule Post</button>
            </div>
        `;
    },

    suggestOptimization() {
        return `
            <p>Based on your usage patterns, I've detected an optimization opportunity.</p>
            <div class="ai-insight-card">
                <div class="ai-insight-title">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" stroke-width="2"><path d="M12 2v20M2 12h20"/></svg>
                    Layout Optimization
                </div>
                <div class="ai-insight-cause">You frequently check <strong>Revenue</strong> and <strong>Orders</strong> together. I can group these metrics for faster access.</div>
            </div>
            <div class="ai-actions">
                <button class="ai-action-btn" onclick="applyAILayout('sales')">Apply Sales Layout</button>
            </div>
        `;
    }
}

// ===== TABLE SEARCH FUNCTIONALITY =====
function initializeTableSearch() {
    tableSearch.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const rows = productsTable.querySelectorAll('tbody tr');

        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(searchTerm) ? '' : 'none';
        });
    });
}

// ===== GLOBAL EMAIL LINKS =====
function initializeGlobalEmailLinks() {
    const links = document.querySelectorAll('a[href^="mailto:deepthan07@gmail.com"]');
    links.forEach(link => {
        if (!link.href.includes('subject=')) {
            link.href = 'mailto:deepthan07@gmail.com?subject=CART-EL%20Support&body=Hello%20CART-EL%20Support%20Team%2C';
        }
    });
}

// ===== PROFILE AVATAR FUNCTIONALITY =====
function initializeProfileAvatar() {
    // Elements
    const profileAvatar = document.getElementById('profileAvatar');
    const profileAvatarImage = document.getElementById('profileAvatarImage');
    const profileAvatarInitials = document.getElementById('profileAvatarInitials');
    const profileDropdown = document.getElementById('profileDropdown');
    
    // Modal Elements
    const profileModal = document.getElementById('profileModal');
    const closeProfileModal = document.getElementById('closeProfileModal');
    const modalAvatarPreview = document.getElementById('modalAvatarPreview');
    const modalAvatarInitials = document.getElementById('modalAvatarInitials');
    const modalUploadBtn = document.getElementById('modalUploadBtn');
    const modalRemoveBtn = document.getElementById('modalRemoveBtn');
    const modalFileInput = document.getElementById('modalFileInput');
    const modalSaveBtn = document.getElementById('modalSaveBtn');
    const modalNameInput = document.getElementById('modalNameInput');

    const AVATAR_STORAGE_KEY = 'cartel_user_avatar';
    const NAME_STORAGE_KEY = 'cartel_user_name';
    let pendingAvatarDataUrl = null;

    // 1. Load Initial State
    const savedAvatar = localStorage.getItem(AVATAR_STORAGE_KEY);
    const savedName = localStorage.getItem(NAME_STORAGE_KEY);
    const userName = savedName || profileDropdown?.dataset.userName || 'Deepthan H';
    const initials = getUserInitials(userName);

    if (profileAvatarInitials) profileAvatarInitials.textContent = initials;
    if (modalAvatarInitials) modalAvatarInitials.textContent = initials;

    if (savedAvatar) {
        updateAvatarDisplay(savedAvatar);
    } else {
        updateAvatarDisplay(null);
    }

    // 2. Event Listeners
    if (profileAvatar) {
        profileAvatar.addEventListener('click', (e) => {
            e.stopPropagation();
            openProfileModal();
        });
    }

    if (closeProfileModal) {
        closeProfileModal.addEventListener('click', closeProfileModalWindow);
    }

    if (profileModal) {
        profileModal.addEventListener('click', (e) => {
            if (e.target === profileModal) closeProfileModalWindow();
        });
    }

    if (modalUploadBtn) {
        modalUploadBtn.addEventListener('click', () => {
            modalFileInput.click();
        });
    }

    if (modalFileInput) {
        modalFileInput.addEventListener('change', handleFileSelect);
    }

    if (modalRemoveBtn) {
        modalRemoveBtn.addEventListener('click', handleRemoveAvatar);
    }

    if (modalSaveBtn) {
        modalSaveBtn.addEventListener('click', handleSaveProfile);
    }

    // Functions
    function openProfileModal() {
        if (!profileModal) return;
        
        // Reset pending state to current saved state
        const currentAvatar = localStorage.getItem(AVATAR_STORAGE_KEY);
        pendingAvatarDataUrl = currentAvatar;
        
        updateModalPreview(currentAvatar);
        
        const currentName = localStorage.getItem(NAME_STORAGE_KEY) || userName;
        if (modalNameInput) modalNameInput.value = currentName;
        
        profileModal.classList.add('show');
    }

    function closeProfileModalWindow() {
        if (profileModal) profileModal.classList.remove('show');
    }

    function handleFileSelect(e) {
        const file = e.target.files[0];
        if (!file) return;

        if (!['image/jpeg', 'image/png'].includes(file.type)) {
            alert('Please upload a valid JPG or PNG image.');
            return;
        }

        if (file.size > 2 * 1024 * 1024) { // 2MB limit
            alert('Image size must be less than 2MB.');
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            pendingAvatarDataUrl = event.target.result;
            updateModalPreview(pendingAvatarDataUrl);
        };
        reader.readAsDataURL(file);
        
        e.target.value = '';
    }

    function handleRemoveAvatar() {
        pendingAvatarDataUrl = null;
        updateModalPreview(null);
    }

    function handleSaveProfile() {
        // Save Name
        if (modalNameInput) {
            const newName = modalNameInput.value.trim();
            if (newName) {
                localStorage.setItem(NAME_STORAGE_KEY, newName);
                const newInitials = getUserInitials(newName);
                if (profileAvatarInitials) profileAvatarInitials.textContent = newInitials;
                if (modalAvatarInitials) modalAvatarInitials.textContent = newInitials;
            }
        }

        if (pendingAvatarDataUrl) {
            localStorage.setItem(AVATAR_STORAGE_KEY, pendingAvatarDataUrl);
            updateAvatarDisplay(pendingAvatarDataUrl);
        } else {
            localStorage.removeItem(AVATAR_STORAGE_KEY);
            updateAvatarDisplay(null);
        }
        closeProfileModalWindow();
    }

    function updateAvatarDisplay(dataUrl) {
        if (profileAvatarImage && profileAvatar) {
            if (dataUrl) {
                profileAvatarImage.src = dataUrl;
                profileAvatar.classList.add('has-image');
            } else {
                profileAvatarImage.removeAttribute('src');
                profileAvatar.classList.remove('has-image');
            }
        }
    }

    function updateModalPreview(dataUrl) {
        if (modalAvatarPreview && modalAvatarInitials) {
            if (dataUrl) {
                modalAvatarPreview.src = dataUrl;
                modalAvatarPreview.style.display = 'block';
                modalAvatarInitials.style.display = 'none';
            } else {
                modalAvatarPreview.style.display = 'none';
                modalAvatarInitials.style.display = 'block';
            }
        }
    }

    function getUserInitials(name) {
        const parts = name.trim().split(/\s+/);
        if (parts.length === 0) return 'U';
        if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
}

// ===== LOGOUT FUNCTIONALITY =====
function initializeLogout() {
    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        // Clear all local storage data
        localStorage.clear();
        // Redirect to login page
        window.location.href = 'login.html';
    });
}

// ===== NOTIFICATION SYSTEM =====
function initializeNotifications() {
    // Sample Data
    const defaultNotifications = [
        { id: 1, title: 'New order received', message: 'Order #1234 from Acme Corp', time: '2 min ago', read: false, type: 'order' },
        { id: 2, title: 'Revenue increased', message: 'Daily revenue up by 5%', time: '1 hour ago', read: false, type: 'trend' },
        { id: 3, title: 'New user signed up', message: 'Welcome Sarah J. to the platform', time: '3 hours ago', read: false, type: 'user' },
        { id: 4, title: 'System report', message: 'Monthly analytics report generated', time: '5 hours ago', read: true, type: 'system' }
    ];

    // Load from storage or use default
    let notifications = JSON.parse(localStorage.getItem('cartel_notifications')) || defaultNotifications;
    renderNotifications();

    // Toggle Dropdown
    notificationBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        notificationDropdown.classList.toggle('show');
    });

    // Close on click outside
    document.addEventListener('click', (e) => {
        if (notificationWrapper && !notificationWrapper.contains(e.target)) {
            notificationDropdown.classList.remove('show');
        }
    });

    // Mark all read
    if (markAllReadBtn) {
        markAllReadBtn.addEventListener('click', () => {
            notifications.forEach(n => n.read = true);
            saveNotifications();
            renderNotifications();
        });
    }

    function renderNotifications() {
        if (!notificationList) return;
        
        notificationList.innerHTML = '';
        
        const unreadCount = notifications.filter(n => !n.read).length;
        
        // Update Badge
        if (notificationBadge) {
            notificationBadge.textContent = unreadCount;
            notificationBadge.style.display = unreadCount > 0 ? 'flex' : 'none';
        }

        if (notifications.length === 0) {
            notificationList.innerHTML = '<div class="notification-empty">No notifications</div>';
            return;
        }

        notifications.forEach(n => {
            const item = document.createElement('div');
            item.className = `notification-item ${n.read ? '' : 'unread'}`;
            item.onclick = () => markAsRead(n.id);
            
            let icon = '';
            if (n.type === 'order') icon = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>';
            else if (n.type === 'trend') icon = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>';
            else if (n.type === 'user') icon = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>';
            else icon = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>';

            item.innerHTML = `
                <div class="notification-icon">${icon}</div>
                <div class="notification-content">
                    <div class="notification-title">${n.title}</div>
                    <div class="notification-desc">${n.message}</div>
                    <div class="notification-time">${n.time}</div>
                </div>
            `;
            notificationList.appendChild(item);
        });
    }

    function markAsRead(id) {
        const notification = notifications.find(n => n.id === id);
        if (notification && !notification.read) {
            notification.read = true;
            saveNotifications();
            renderNotifications();
        }
    }

    function saveNotifications() {
        localStorage.setItem('cartel_notifications', JSON.stringify(notifications));
    }
}

// ===== SETTINGS FUNCTIONALITY =====
function initializeSettings() {
    resetLayoutBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to reset the dashboard layout to default?')) {
            localStorage.removeItem('cartel_widget_order');
            
            const originalContent = resetLayoutBtn.innerHTML;
            resetLayoutBtn.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                Reset Complete
            `;
            setTimeout(() => {
                resetLayoutBtn.innerHTML = originalContent;
            }, 2000);
        }
    });
}

// ===== EXPORT FUNCTIONALITY =====
function initializeExport() {
    exportReportBtn.addEventListener('click', () => {
        const originalText = exportReportBtn.innerHTML;
        
        // Visual feedback
        exportReportBtn.innerHTML = `
            <div class="spinner" style="display:block; width:16px; height:16px; border-width:2px;"></div>
            Exporting CSV...
        `;
        exportReportBtn.disabled = true;

        setTimeout(() => {
            // Generate CSV Data
            const headers = ['ID', 'Product Name', 'Category', 'Sold', 'Revenue', 'Growth', 'Rating'];
            const rows = [
                ['101', 'Analytics Pro', 'Software', '1200', '120000', '15%', '4.8'],
                ['102', 'Marketing Tool', 'Tools', '850', '42500', '8%', '4.5'],
                ['103', 'Widget Pack', 'Widgets', '2300', '23000', '22%', '4.9']
            ];
            
            const csvContent = "data:text/csv;charset=utf-8," 
                + headers.join(",") + "\n" 
                + rows.map(e => e.join(",")).join("\n");
                
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", "cartel_report.csv");
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            exportReportBtn.innerHTML = originalText;
            exportReportBtn.disabled = false;
        }, 1500);
    });
}

// ===== SMART WIDGETS & AI LAYOUT =====
function initializeSmartWidgets() {
    // Track interactions
    const widgets = document.querySelectorAll('.kpi-card, .chart-container');
    widgets.forEach(widget => {
        widget.addEventListener('click', () => {
            trackWidgetInteraction(widget.id);
        });
    });

    // Check for AI suggestions after a short delay
    setTimeout(checkAILayoutSuggestions, 2000);
}

function trackWidgetInteraction(widgetId) {
    let usageData = JSON.parse(localStorage.getItem('cartel_widget_usage') || '{}');
    usageData[widgetId] = (usageData[widgetId] || 0) + 1;
    localStorage.setItem('cartel_widget_usage', JSON.stringify(usageData));
}

function checkAILayoutSuggestions() {
    const suggestionEl = document.getElementById('aiLayoutSuggestion');
    if (!suggestionEl) return;

    const usageData = JSON.parse(localStorage.getItem('cartel_widget_usage') || '{}');
    const hour = new Date().getHours();
    
    // Logic: Determine dominant category based on usage or time
    let suggestion = null;

    // 1. Time-based suggestion
    if (hour < 10) {
        // Morning: Suggest Overview (KPIs)
        suggestion = {
            type: 'morning',
            title: 'Morning Overview',
            message: 'Good morning! Would you like to prioritize your key performance indicators for a quick daily check?',
            action: 'Optimize Layout'
        };
    } 
    // 2. Usage-based suggestion (Simulated logic)
    else {
        const salesScore = (usageData['kpi-revenue-growth'] || 0) + (usageData['kpi-orders'] || 0) + (usageData['chart-revenue'] || 0);
        const marketingScore = (usageData['kpi-visitors'] || 0) + (usageData['kpi-clicks'] || 0) + (usageData['chart-activity'] || 0);

        if (salesScore > marketingScore + 2) { // Threshold
            suggestion = {
                type: 'sales',
                title: 'Sales Focus Detected',
                message: 'You seem to be focusing on sales metrics. Should I pin Revenue and Orders to the top?',
                action: 'Apply Sales Layout'
            };
        } else if (marketingScore > salesScore + 2) {
            suggestion = {
                type: 'marketing',
                title: 'Marketing Focus Detected',
                message: 'You check traffic stats often. Would you like to move Visitors and Activity charts to the top?',
                action: 'Apply Marketing Layout'
            };
        }
    }

    if (suggestion) {
        renderAISuggestion(suggestionEl, suggestion);
    }
}

function renderAISuggestion(element, data) {
    element.innerHTML = `
        <div class="suggestion-content">
            <div class="suggestion-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a10 10 0 1 0 10 10H12V2z"/><path d="M12 2a10 10 0 0 1 10 10h-10V2z"/><path d="M12 12L2.5 12"/></svg>
            </div>
            <div class="suggestion-text">
                <h4>${data.title}</h4>
                <p>${data.message}</p>
            </div>
        </div>
        <div class="suggestion-actions">
            <button class="btn-primary" onclick="applyAILayout('${data.type}')">${data.action}</button>
            <button class="btn-secondary" onclick="document.getElementById('aiLayoutSuggestion').style.display='none'">Dismiss</button>
        </div>
    `;
    element.style.display = 'flex';
}

// Expose function to global scope for the onclick handler
window.applyAILayout = function(type) {
    const kpiSection = document.querySelector('.kpi-section');
    const chartsSection = document.querySelector('.charts-section');
    
    // Define layouts (IDs of elements in desired order)
    const layouts = {
        'sales': {
            kpi: ['kpi-revenue-growth', 'kpi-orders', 'kpi-page-views', 'kpi-visitors', 'kpi-clicks'],
            charts: ['chart-revenue', 'chart-retention', 'chart-activity']
        },
        'marketing': {
            kpi: ['kpi-visitors', 'kpi-clicks', 'kpi-page-views', 'kpi-revenue-growth', 'kpi-orders'],
            charts: ['chart-activity', 'chart-retention', 'chart-revenue']
        },
        'morning': {
            kpi: ['kpi-revenue-growth', 'kpi-visitors', 'kpi-orders', 'kpi-page-views', 'kpi-clicks'],
            charts: ['chart-revenue', 'chart-activity', 'chart-retention']
        }
    };

    const layout = layouts[type];
    if (!layout) return;

    // Reorder KPIs
    layout.kpi.forEach(id => {
        const el = document.getElementById(id);
        if (el) kpiSection.appendChild(el);
    });

    // Reorder Charts
    layout.charts.forEach(id => {
        const el = document.getElementById(id);
        if (el) chartsSection.appendChild(el);
    });

    // Save and hide
    saveWidgetOrder();
    document.getElementById('aiLayoutSuggestion').style.display = 'none';
    
    // Show success feedback
    alert('Layout updated based on your usage patterns!');
};

// ===== SMART NAVIGATION =====
function initializeSmartNavigation() {
    const navContainer = document.querySelector('.sidebar-nav');
    if (!navContainer) return;

    // 1. Track Clicks
    navContainer.addEventListener('click', (e) => {
        const navItem = e.target.closest('.nav-item');
        if (navItem) {
            // Use href or text content as unique ID
            const id = navItem.getAttribute('href') || navItem.textContent.trim();
            trackNavUsage(id);
        }
    });

    // 2. Apply AI Logic (Reorder & Highlight)
    applySmartNavLogic(navContainer);
}

function trackNavUsage(id) {
    let usage = JSON.parse(localStorage.getItem('cartel_nav_usage') || '{}');
    usage[id] = (usage[id] || 0) + 1;
    localStorage.setItem('cartel_nav_usage', JSON.stringify(usage));
}

async function applySmartNavLogic(container) {
    const usage = JSON.parse(localStorage.getItem('cartel_nav_usage') || '{}');
    
    // Placeholder for Future AI API
    // const prediction = await fetchBehaviorPredictionAPI(); 
    
    // Helper to get score for an element (item or group)
    const getScore = (element) => {
        if (element.classList.contains('nav-item')) {
            const id = element.getAttribute('href') || element.textContent.trim();
            return usage[id] || 0;
        }
        if (element.classList.contains('nav-group')) {
            // Sum scores of sub-items for groups
            const subItems = element.querySelectorAll('.nav-item');
            let score = 0;
            subItems.forEach(item => {
                const id = item.getAttribute('href') || item.textContent.trim();
                score += (usage[id] || 0);
            });
            return score;
        }
        return 0;
    };

    // Sort children based on usage score
    const children = Array.from(container.children);
    children.sort((a, b) => getScore(b) - getScore(a));
    
    // Reorder DOM
    children.forEach(child => container.appendChild(child));

    // Highlight most used item (that isn't current active page)
    let maxScore = -1;
    let bestItem = null;

    const allItems = container.querySelectorAll('.nav-item');
    allItems.forEach(item => {
        if (item.classList.contains('active')) return; // Don't suggest current page
        
        const id = item.getAttribute('href') || item.textContent.trim();
        const score = usage[id] || 0;
        
        // Threshold of 2 clicks to start suggesting
        if (score > maxScore && score > 2) {
            maxScore = score;
            bestItem = item;
        }
    });

    if (bestItem) {
        bestItem.classList.add('ai-suggested');
    }
}

// ===== DRAG AND DROP FUNCTIONALITY =====
function initializeDragAndDrop() {
    loadWidgetOrder();

    const draggables = document.querySelectorAll('.kpi-card, .chart-container');
    const containers = document.querySelectorAll('.kpi-section, .charts-section');

    draggables.forEach(draggable => {
        draggable.setAttribute('draggable', 'true');

        draggable.addEventListener('dragstart', () => {
            draggable.classList.add('dragging');
        });

        draggable.addEventListener('dragend', () => {
            draggable.classList.remove('dragging');
            saveWidgetOrder();
        });
    });

    containers.forEach(container => {
        container.addEventListener('dragover', e => {
            e.preventDefault();
            const afterElement = getDragAfterElement(container, e.clientY);
            const draggable = document.querySelector('.dragging');
            
            if (!draggable) return;

            // Only allow dropping in the same container type
            if (container.contains(draggable) || 
               (draggable.classList.contains('kpi-card') && container.classList.contains('kpi-section')) ||
               (draggable.classList.contains('chart-container') && container.classList.contains('charts-section'))) {
                
                if (afterElement == null) {
                    container.appendChild(draggable);
                } else {
                    container.insertBefore(draggable, afterElement);
                }
            }
        });
    });
}

function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.kpi-card:not(.dragging), .chart-container:not(.dragging)')];

    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

function saveWidgetOrder() {
    const kpiSection = document.querySelector('.kpi-section');
    const chartsSection = document.querySelector('.charts-section');
    
    const order = {};
    
    if (kpiSection) {
        order.kpi = Array.from(kpiSection.children).map(child => child.id).filter(id => id);
    }
    
    if (chartsSection) {
        order.charts = Array.from(chartsSection.children).map(child => child.id).filter(id => id);
    }
    
    if (Object.keys(order).length > 0) {
        localStorage.setItem('cartel_widget_order', JSON.stringify(order));
    }
}

function loadWidgetOrder() {
    const savedOrder = localStorage.getItem('cartel_widget_order');
    if (!savedOrder) return;
    
    try {
        const order = JSON.parse(savedOrder);
        
        if (order.kpi) {
            const kpiSection = document.querySelector('.kpi-section');
            if (kpiSection) {
                order.kpi.forEach(id => {
                    const element = document.getElementById(id);
                    if (element && kpiSection.contains(element)) {
                        kpiSection.appendChild(element);
                    }
                });
            }
        }
        
        if (order.charts) {
            const chartsSection = document.querySelector('.charts-section');
            if (chartsSection) {
                order.charts.forEach(id => {
                    const element = document.getElementById(id);
                    if (element && chartsSection.contains(element)) {
                        chartsSection.appendChild(element);
                    }
                });
            }
        }
    } catch (e) {
        console.error('Error loading widget order:', e);
    }
}

// ===== WIDGET MANAGER =====
function initializeWidgetManager() {
    const widgetOptions = widgetModal.querySelectorAll('.widget-card');
    const kpiSection = document.querySelector('.kpi-section');

    // Load custom widgets
    const customWidgets = JSON.parse(localStorage.getItem('cartel_custom_widgets')) || [];
    customWidgets.forEach(widget => createWidgetElement(widget));

    widgetOptions.forEach(option => {
        option.addEventListener('click', () => {
            const type = option.dataset.widgetType;
            const title = option.querySelector('h4').textContent;
            const iconHtml = option.querySelector('.widget-icon').innerHTML;
            
            const widgetData = {
                id: 'custom-widget-' + Date.now(),
                type: type,
                title: title,
                icon: iconHtml,
                value: Math.floor(Math.random() * 10000).toLocaleString(),
                change: '+' + (Math.random() * 20).toFixed(1) + '%'
            };

            createWidgetElement(widgetData);
            
            // Save
            const currentWidgets = JSON.parse(localStorage.getItem('cartel_custom_widgets')) || [];
            currentWidgets.push(widgetData);
            localStorage.setItem('cartel_custom_widgets', JSON.stringify(currentWidgets));

            // Close modal
            widgetModal.classList.remove('show');
            
            // Scroll to new widget
            const newWidget = document.getElementById(widgetData.id);
            if(newWidget) newWidget.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
    });

    function createWidgetElement(data) {
        if (!kpiSection) return;
        const div = document.createElement('div');
        div.className = 'kpi-card';
        div.id = data.id;
        div.innerHTML = `
            <div class="kpi-icon">${data.icon}</div>
            <div class="kpi-content">
                <h3>${data.title}</h3>
                <p class="kpi-value">${data.value}</p>
                <span class="kpi-change positive">${data.change}</span>
            </div>
        `;
        kpiSection.appendChild(div);
        
        // Re-initialize drag and drop for new element
        initializeDragAndDrop();
    }
}

// ===== ANIMATIONS =====
function initializeAnimations() {
    // Page load animations
    const cards = document.querySelectorAll('.kpi-card');
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';

        setTimeout(() => {
            card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 100);
    });

    // Chart containers animation
    const chartContainers = document.querySelectorAll('.chart-container');
    chartContainers.forEach((container, index) => {
        container.style.opacity = '0';
        container.style.transform = 'translateY(30px)';

        setTimeout(() => {
            container.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            container.style.opacity = '1';
            container.style.transform = 'translateY(0)';
        }, 500 + index * 100);
    });

    // Button ripple effects
    document.addEventListener('click', function(e) {
        const btn = e.target.closest('.btn-primary, .btn-secondary');
        if (btn) {
            createRippleEffect(e, btn);
        }
    });
}

function createRippleEffect(event, element) {
    const ripple = document.createElement('div');
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    ripple.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        left: ${x}px;
        top: ${y}px;
        background: rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        transform: scale(0);
        animation: ripple 0.6s ease-out;
        pointer-events: none;
    `;

    element.style.position = 'relative';
    element.style.overflow = 'hidden';
    element.appendChild(ripple);

    setTimeout(() => {
        ripple.remove();
    }, 600);
}

// ===== NUMBER COUNTERS =====
function initializeNumberCounters() {
    const counters = document.querySelectorAll('.kpi-value');

    counters.forEach(counter => {
        const originalText = counter.textContent;
        const isPercent = originalText.includes('%');
        const target = parseFloat(originalText.replace(/,/g, '').replace('%', ''));
        
        if (isNaN(target)) return;

        counter.textContent = '0' + (isPercent ? '%' : '');

        const increment = target / 50;
        let current = 0;

        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                counter.textContent = originalText;
                clearInterval(timer);
            } else {
                let formatted = Math.floor(current).toLocaleString();
                if (target % 1 !== 0) {
                    formatted = current.toFixed(1);
                }
                counter.textContent = formatted + (isPercent ? '%' : '');
            }
        }, 20);
    });
}

// ===== MODAL FUNCTIONALITY =====
if (addWidgetBtn) {
    addWidgetBtn.addEventListener('click', () => {
        widgetModal.classList.add('show');
    });
}

if (modalClose) {
    modalClose.addEventListener('click', () => {
        widgetModal.classList.remove('show');
    });
}

if (widgetModal) {
    widgetModal.addEventListener('click', (e) => {
        if (e.target === widgetModal) {
            widgetModal.classList.remove('show');
        }
    });
}

// ===== UTILITY FUNCTIONS =====
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ===== KEYFRAMES FOR ANIMATIONS =====
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// ===== COOKIE CONSENT =====
function initializeCookieConsent() {
    const cookieBanner = document.getElementById('cookieBanner');
    const acceptBtn = document.getElementById('cookieAccept');
    const declineBtn = document.getElementById('cookieDecline');

    if (!cookieBanner) return;

    // Check if user has already made a choice
    if (!localStorage.getItem('cartel_cookie_consent')) {
        setTimeout(() => {
            cookieBanner.classList.add('show');
        }, 1500);
    }

    if (acceptBtn) {
        acceptBtn.addEventListener('click', () => {
            localStorage.setItem('cartel_cookie_consent', 'accepted');
            cookieBanner.classList.remove('show');
        });
    }

    if (declineBtn) {
        declineBtn.addEventListener('click', () => {
            localStorage.setItem('cartel_cookie_consent', 'declined');
            cookieBanner.classList.remove('show');
        });
    }
}

// ===== BACK TO TOP =====
function initializeBackToTop() {
    const backToTopBtn = document.getElementById('backToTop');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            backToTopBtn.classList.add('show');
        } else {
            backToTopBtn.classList.remove('show');
        }
    });

    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}
