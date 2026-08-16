// ========== UTILITY FUNCTIONS ==========

// Show toast notification
function showToast(msg) {
    const toast = document.createElement('div');
    toast.className = 'toast-notify';
    toast.innerHTML = `✨ ${msg}`;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 500);
    }, 3000);
}

// Create molecular background particles
function createMolecularParticles() {
    const container = document.getElementById('particles-container');
    if (!container) return;
    
    for (let i = 0; i < 100; i++) {
        let particle = document.createElement('div');
        particle.classList.add('molecular-particle');
        let size = Math.random() * 8 + 3;
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.animationDuration = `${Math.random() * 20 + 12}s`;
        particle.style.animationDelay = `${Math.random() * 8}s`;
        container.appendChild(particle);
    }
}

function initMolecularBackground() {
    createMolecularParticles();
}

// Set theme (light/dark)
function setTheme(theme) {
    if (theme === 'light') {
        document.body.classList.remove('dark');
        document.body.classList.add('light');
        localStorage.setItem('theme', 'light');
    } else {
        document.body.classList.remove('light');
        document.body.classList.add('dark');
        localStorage.setItem('theme', 'dark');
    }
    if (window.lucide) lucide.createIcons();
}

// Initialize Lucide icons
function initIcons() {
    if (window.lucide) {
        lucide.createIcons();
    }
}

// Add smooth scroll to all anchor links
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

// Animate progress bar
function updateProgressBar(progressElement, targetWidth, duration = 1000) {
    if (!progressElement) return;
    const startWidth = parseFloat(progressElement.style.width) || 0;
    const difference = targetWidth - startWidth;
    const startTime = performance.now();
    
    function animate(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const newWidth = startWidth + (difference * progress);
        progressElement.style.width = `${newWidth}%`;
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        }
    }
    
    requestAnimationFrame(animate);
}

// Wave animation for voice recording
function startWaveAnimation() {
    const waveContainer = document.getElementById('waveformAnim');
    if (waveContainer) {
        waveContainer.style.display = 'flex';
    }
}

function stopWaveAnimation() {
    const waveContainer = document.getElementById('waveformAnim');
    if (waveContainer) {
        waveContainer.style.display = 'none';
    }
}

// History modal render function
function renderHistoryModalList() {
    const container = document.getElementById('historyModalListContainer');
    if (!container) return;
    
    if (analysisHistory.length === 0) {
        container.innerHTML = `<div class="glass-panel p-4 text-center text-gray-400 text-sm">🔬 No records yet.</div>`;
        return;
    }
    
    container.innerHTML = analysisHistory.slice(0, 50).map(item => `
        <div class="glass-panel p-3 history-item flex justify-between items-start" data-id="${item.id}">
            <div class="flex-1" onclick="viewDetail(${item.id})">
                <div class="flex items-center gap-2 flex-wrap">
                    <span class="text-[9px] sm:text-xs px-1.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold">${item.type}</span>
                    <span class="font-bold text-xs sm:text-sm">${item.result}</span>
                    <span class="text-[8px] sm:text-xs text-gray-500">${item.timestamp}</span>
                </div>
                <div class="text-[8px] sm:text-xs mt-1">Confidence: ${item.confidence}%</div>
            </div>
            <button class="delete-history-btn text-red-500 text-[10px] sm:text-xs hover:text-red-700 ml-2" onclick="deleteEntry(${item.id}); event.stopPropagation();">🗑️</button>
        </div>
    `).join('');
}

function viewDetail(id) {
    const item = analysisHistory.find(h => h.id === id);
    if (item) {
        alert(`🧠 NeuroScope Report\n${item.type}\nResult: ${item.result}\nConfidence: ${item.confidence}%`);
    }
}

function deleteEntry(id) {
    analysisHistory = analysisHistory.filter(h => h.id !== id);
    localStorage.setItem('neuroscope_history', JSON.stringify(analysisHistory));
    renderHistoryModalList();
    updateAuthUI();
    showToast("Deleted");
}