// ========== MAIN APPLICATION INITIALIZATION ==========

// Mobile menu toggle
function initMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileNav = document.getElementById('mobileNav');
    
    mobileMenuBtn?.addEventListener('click', () => {
        mobileNav.classList.toggle('open');
    });
    
    // Close mobile nav when clicking a link
    document.querySelectorAll('.mobile-nav a').forEach(link => {
        link.addEventListener('click', () => {
            mobileNav.classList.remove('open');
        });
    });
}

// Theme toggle initialization
function initThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    const themeToggleMobile = document.getElementById('themeToggleMobile');
    
    const toggleHandler = () => {
        if (document.body.classList.contains('dark')) {
            setTheme('light');
        } else {
            setTheme('dark');
        }
    };
    
    themeToggle?.addEventListener('click', toggleHandler);
    themeToggleMobile?.addEventListener('click', toggleHandler);
    
    // Load saved theme
    if (localStorage.getItem('theme') === 'light') {
        setTheme('light');
    } else {
        setTheme('dark');
    }
}

// History modal initialization
function initHistoryModal() {
    const historyModal = document.getElementById('historyModal');
    const historyNavBtn = document.getElementById('historyNavBtn');
    const mobileHistoryNavBtn = document.getElementById('mobileHistoryNavBtn');
    const closeHistoryBtn = document.getElementById('closeHistoryBtn');
    const clearHistoryModalBtn = document.getElementById('clearHistoryModalBtn');
    
    function openHistoryModal() {
        renderHistoryModalList();
        historyModal.classList.add('active');
    }
    
    historyNavBtn?.addEventListener('click', (e) => {
        e.preventDefault();
        openHistoryModal();
    });
    
    mobileHistoryNavBtn?.addEventListener('click', (e) => {
        e.preventDefault();
        const mobileNav = document.getElementById('mobileNav');
        if (mobileNav) mobileNav.classList.remove('open');
        openHistoryModal();
    });
    
    closeHistoryBtn?.addEventListener('click', () => {
        historyModal.classList.remove('active');
    });
    
    clearHistoryModalBtn?.addEventListener('click', () => {
        if (confirm('Delete all records?')) {
            analysisHistory = [];
            localStorage.setItem('neuroscope_history', '[]');
            renderHistoryModalList();
            updateAuthUI();
            showToast("All records cleared");
        }
    });
    
    // Close modal on outside click
    historyModal?.addEventListener('click', (e) => {
        if (e.target === historyModal) {
            historyModal.classList.remove('active');
        }
    });
}

// Smooth scroll initialization
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
}

// Make global functions available
window.viewDetail = viewDetail;
window.deleteEntry = deleteEntry;
window.updateProgressBar = updateProgressBar;

// Initialize everything on page load
document.addEventListener('DOMContentLoaded', () => {
    // Initialize background effects
    initMolecularBackground();
    
    // Initialize UI components
    initMobileMenu();
    initThemeToggle();
    initAuth();
    initHistoryModal();
    initAnalysis();
    initSmoothScroll();
    
    // Load saved auth state
    loadAuth();
    
    // Initialize icons after everything loads
    setTimeout(() => {
        if (window.lucide) lucide.createIcons();
    }, 100);
    
    console.log('NeuroScope AI initialized successfully');
    showToast("Welcome to NeuroScope AI");
});