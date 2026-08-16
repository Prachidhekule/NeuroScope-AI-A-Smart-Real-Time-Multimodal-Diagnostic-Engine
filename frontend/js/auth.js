// ========== AUTHENTICATION SYSTEM ==========

let currentUser = null;
let analysisHistory = JSON.parse(localStorage.getItem('neuroscope_history') || '[]');

// Save auth state to localStorage
function saveAuth() {
  if (currentUser) {
    localStorage.setItem('neuroscope_user', JSON.stringify(currentUser));
  } else {
    localStorage.removeItem('neuroscope_user');
  }
}

// Load auth state from localStorage
function loadAuth() {
  const saved = localStorage.getItem('neuroscope_user');
  if (saved) {
    currentUser = JSON.parse(saved);
    updateAuthUI();
    renderHistoryModalList();
  } else {
    currentUser = null;
    updateAuthUI();
  }
}

// Update UI based on auth state
function updateAuthUI() {
  const authBtn = document.getElementById('authBtn');
  const userDropdown = document.getElementById('userDropdown');
  
  if (currentUser) {
    // Update auth button
    authBtn.innerHTML = `👤 ${currentUser.name.split(' ')[0]}`;
    authBtn.classList.remove('border-cyan-500');
    authBtn.classList.add('border-purple-500', 'bg-purple-500/20');
    
    // Show dropdown
    if (userDropdown) userDropdown.classList.add('show');
    
    // Update profile modal
    const profileName = document.getElementById('profileName');
    const profileEmail = document.getElementById('profileEmail');
    const profileAvatar = document.getElementById('profileAvatar');
    const profileSince = document.getElementById('profileSince');
    const profileCount = document.getElementById('profileCount');
    
    if (profileName) profileName.innerText = currentUser.name;
    if (profileEmail) profileEmail.innerText = currentUser.email;
    if (profileAvatar) {
      const avatarText = currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
      profileAvatar.innerText = avatarText;
    }
    if (profileSince) profileSince.innerText = new Date(currentUser.createdAt).toLocaleDateString();
    if (profileCount) profileCount.innerText = analysisHistory.length;
    
  } else {
    // Update auth button for logged out state
    authBtn.innerHTML = '🔐 Login';
    authBtn.classList.add('border-cyan-500');
    authBtn.classList.remove('border-purple-500', 'bg-purple-500/20');
    
    // Hide dropdown
    if (userDropdown) userDropdown.classList.remove('show');
  }
}

// Handle login
function handleLogin(email, password) {
  if (!email || !password) {
    showToast("Please enter email and password");
    return false;
  }
  
  const saved = localStorage.getItem(`user_${email}`);
  if (saved) {
    const user = JSON.parse(saved);
    if (user.password === password) {
      currentUser = user;
      saveAuth();
      updateAuthUI();
      renderHistoryModalList();
      showToast(`Welcome back, ${user.name}!`);
      return true;
    } else {
      showToast("Invalid password");
      return false;
    }
  } else {
    showToast("User not found. Please sign up first.");
    return false;
  }
}

// Handle signup
function handleSignup(name, email, password) {
  if (!name || !email || !password) {
    showToast("All fields required");
    return false;
  }
  
  if (password.length < 6) {
    showToast("Password must be at least 6 characters");
    return false;
  }
  
  if (localStorage.getItem(`user_${email}`)) {
    showToast("Email already exists. Please login.");
    return false;
  }
  
  const newUser = {
    name: name,
    email: email,
    password: password,
    createdAt: new Date().toISOString(),
    totalAnalyses: 0
  };
  
  localStorage.setItem(`user_${email}`, JSON.stringify(newUser));
  currentUser = newUser;
  saveAuth();
  updateAuthUI();
  showToast(`Account created! Welcome ${name}`);
  return true;
}

// Handle logout
function handleLogout() {
  currentUser = null;
  saveAuth();
  updateAuthUI();
  showToast("Logged out successfully");
  
  // Clear any sensitive UI elements
  const userDropdown = document.getElementById('userDropdown');
  if (userDropdown) userDropdown.classList.remove('show');
}

// Check if user is authenticated
function isAuthenticated() {
  return currentUser !== null;
}

// Get current user
function getCurrentUser() {
  return currentUser;
}

// Add analysis to history
function addHistory(type, resultData) {
  if (!currentUser) {
    showToast("Please login to save results");
    return false;
  }
  
  const entry = {
    id: Date.now(),
    timestamp: new Date().toLocaleString(),
    type: type,
    result: resultData.primary,
    confidence: resultData.confidence || 78
  };
  
  analysisHistory.unshift(entry);
  
  // Keep only last 50 entries
  if (analysisHistory.length > 50) analysisHistory.pop();
  
  localStorage.setItem('neuroscope_history', JSON.stringify(analysisHistory));
  
  // Update user's total analyses count
  if (currentUser) {
    currentUser.totalAnalyses = analysisHistory.length;
    saveAuth();
  }
  
  renderHistoryModalList();
  updateAuthUI();
  showToast(`${type} saved to history`);
  return true;
}

// Render history modal list
function renderHistoryModalList() {
  const container = document.getElementById('historyModalListContainer');
  if (!container) return;
  
  if (analysisHistory.length === 0) {
    container.innerHTML = `
      <div class="glass-panel p-4 text-center text-gray-400 text-sm">
        🔬 No analysis records yet.
        <br><br>
        Complete your first analysis to see results here.
      </div>
    `;
    return;
  }
  
  container.innerHTML = analysisHistory.slice(0, 50).map(item => `
    <div class="glass-panel p-3 history-item flex justify-between items-start hover:border-cyan-500 transition-all" data-id="${item.id}">
      <div class="flex-1 cursor-pointer" onclick="viewDetail(${item.id})">
        <div class="flex items-center gap-2 flex-wrap">
          <span class="text-[9px] sm:text-xs px-1.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold">${item.type}</span>
          <span class="font-bold text-xs sm:text-sm">${item.result}</span>
          <span class="text-[8px] sm:text-xs text-gray-500">${item.timestamp}</span>
        </div>
        <div class="text-[8px] sm:text-xs mt-1">
          Confidence: ${item.confidence}%
          <div class="inline-block ml-2 w-12 h-1.5 bg-gray-700 rounded-full overflow-hidden align-middle">
            <div class="h-full bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full" style="width: ${item.confidence}%"></div>
          </div>
        </div>
      </div>
      <button class="delete-history-btn text-red-500 text-[10px] sm:text-xs hover:text-red-700 ml-2 transition-colors" onclick="deleteEntry(${item.id}); event.stopPropagation();">
        🗑️
      </button>
    </div>
  `).join('');
}

// View detailed analysis
function viewDetail(id) {
  const item = analysisHistory.find(h => h.id === id);
  if (item) {
    let riskLevel = '';
    let recommendation = '';
    
    if (item.confidence >= 70) {
      riskLevel = '🔴 High Risk';
      recommendation = 'Please consult a neurologist for further evaluation.';
    } else if (item.confidence >= 45) {
      riskLevel = '⚠️ Moderate Risk';
      recommendation = 'Monitor symptoms and consider follow-up testing.';
    } else {
      riskLevel = '✅ Low Risk';
      recommendation = 'Continue regular health monitoring.';
    }
    
    alert(`🧠 NEUROSCOPE AI - DETAILED REPORT\n\n` +
          `📋 Analysis Type: ${item.type}\n` +
          `📊 Result: ${item.result}\n` +
          `🎯 Confidence Score: ${item.confidence}%\n` +
          `⚠️ Risk Level: ${riskLevel}\n\n` +
          `📅 Date: ${item.timestamp}\n\n` +
          `💡 Recommendation: ${recommendation}`);
  }
}

// Delete history entry
function deleteEntry(id) {
  if (confirm('Delete this analysis record?')) {
    analysisHistory = analysisHistory.filter(h => h.id !== id);
    localStorage.setItem('neuroscope_history', JSON.stringify(analysisHistory));
    renderHistoryModalList();
    updateAuthUI();
    showToast("Record deleted");
  }
}

// Clear all history
function clearAllHistory() {
  if (confirm('⚠️ WARNING: This will delete ALL analysis records. This action cannot be undone.\n\nAre you sure?')) {
    analysisHistory = [];
    localStorage.setItem('neuroscope_history', '[]');
    renderHistoryModalList();
    updateAuthUI();
    showToast("All records cleared");
  }
}

// Get user's history statistics
function getUserStats() {
  if (!currentUser) return null;
  
  const totalAnalyses = analysisHistory.length;
  const highRiskCount = analysisHistory.filter(h => h.confidence >= 70).length;
  const moderateRiskCount = analysisHistory.filter(h => h.confidence >= 45 && h.confidence < 70).length;
  const lowRiskCount = analysisHistory.filter(h => h.confidence < 45).length;
  
  const facialCount = analysisHistory.filter(h => h.type === "Facial Analysis").length;
  const voiceCount = analysisHistory.filter(h => h.type === "Voice Analysis").length;
  const motionCount = analysisHistory.filter(h => h.type === "Motion Analysis").length;
  const combinedCount = analysisHistory.filter(h => h.type === "Combined Analysis").length;
  
  return {
    total: totalAnalyses,
    highRisk: highRiskCount,
    moderateRisk: moderateRiskCount,
    lowRisk: lowRiskCount,
    byType: { facial: facialCount, voice: voiceCount, motion: motionCount, combined: combinedCount }
  };
}

// Export functions for global use
window.isAuthenticated = isAuthenticated;
window.getCurrentUser = getCurrentUser;
window.handleLogin = handleLogin;
window.handleSignup = handleSignup;
window.handleLogout = handleLogout;
window.addHistory = addHistory;
window.viewDetail = viewDetail;
window.deleteEntry = deleteEntry;
window.clearAllHistory = clearAllHistory;
window.getUserStats = getUserStats;

// Initialize auth event listeners
function initAuth() {
  const loginModal = document.getElementById('loginModal');
  const signupModal = document.getElementById('signupModal');
  const profileModal = document.getElementById('profileModal');
  const authBtn = document.getElementById('authBtn');
  
  // Login button handler
  const doLoginBtn = document.getElementById('doLoginBtn');
  if (doLoginBtn) {
    doLoginBtn.addEventListener('click', () => {
      const email = document.getElementById('loginEmail').value;
      const password = document.getElementById('loginPassword').value;
      if (handleLogin(email, password)) {
        loginModal.classList.remove('active');
        // Clear form
        document.getElementById('loginEmail').value = '';
        document.getElementById('loginPassword').value = '';
      }
    });
  }
  
  // Signup button handler
  const doSignupBtn = document.getElementById('doSignupBtn');
  if (doSignupBtn) {
    doSignupBtn.addEventListener('click', () => {
      const name = document.getElementById('signupName').value;
      const email = document.getElementById('signupEmail').value;
      const password = document.getElementById('signupPassword').value;
      if (handleSignup(name, email, password)) {
        signupModal.classList.remove('active');
        // Clear form
        document.getElementById('signupName').value = '';
        document.getElementById('signupEmail').value = '';
        document.getElementById('signupPassword').value = '';
      }
    });
  }
  
  // Switch between login and signup modals
  const showSignupLink = document.getElementById('showSignupLink');
  const showLoginLink = document.getElementById('showLoginLink');
  
  if (showSignupLink) {
    showSignupLink.addEventListener('click', () => {
      loginModal.classList.remove('active');
      signupModal.classList.add('active');
    });
  }
  
  if (showLoginLink) {
    showLoginLink.addEventListener('click', () => {
      signupModal.classList.remove('active');
      loginModal.classList.add('active');
    });
  }
  
  // Auth button click - show login modal if not logged in
  if (authBtn) {
    authBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!currentUser) {
        loginModal.classList.add('active');
      } else {
        const userDropdown = document.getElementById('userDropdown');
        if (userDropdown) userDropdown.classList.toggle('show');
      }
    });
  }
  
  // Profile menu item
  const profileMenuItem = document.getElementById('profileMenuItem');
  if (profileMenuItem) {
    profileMenuItem.addEventListener('click', () => {
      if (currentUser) {
        profileModal.classList.add('active');
        const userDropdown = document.getElementById('userDropdown');
        if (userDropdown) userDropdown.classList.remove('show');
      }
    });
  }
  
  // Close profile modal
  const closeProfileBtn = document.getElementById('closeProfileBtn');
  if (closeProfileBtn) {
    closeProfileBtn.addEventListener('click', () => {
      profileModal.classList.remove('active');
    });
  }
  
  // Logout menu item
  const logoutMenuItem = document.getElementById('logoutMenuItem');
  if (logoutMenuItem) {
    logoutMenuItem.addEventListener('click', () => {
      handleLogout();
      const userDropdown = document.getElementById('userDropdown');
      if (userDropdown) userDropdown.classList.remove('show');
    });
  }
  
  // Clear all history button in modal
  const clearHistoryModalBtn = document.getElementById('clearHistoryModalBtn');
  if (clearHistoryModalBtn) {
    clearHistoryModalBtn.addEventListener('click', () => {
      clearAllHistory();
    });
  }
  
  // Close modals when clicking outside
  document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('active');
      }
    });
  });
  
  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    const userMenu = document.getElementById('userMenu');
    const userDropdown = document.getElementById('userDropdown');
    
    if (userMenu && userDropdown && !userMenu.contains(e.target)) {
      userDropdown.classList.remove('show');
    }
  });
  
  // Enter key support for login
  const loginPassword = document.getElementById('loginPassword');
  if (loginPassword) {
    loginPassword.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        const email = document.getElementById('loginEmail').value;
        const password = loginPassword.value;
        if (handleLogin(email, password)) {
          loginModal.classList.remove('active');
          document.getElementById('loginEmail').value = '';
          loginPassword.value = '';
        }
      }
    });
  }
  
  // Enter key support for signup
  const signupPassword = document.getElementById('signupPassword');
  if (signupPassword) {
    signupPassword.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        const name = document.getElementById('signupName').value;
        const email = document.getElementById('signupEmail').value;
        const password = signupPassword.value;
        if (handleSignup(name, email, password)) {
          signupModal.classList.remove('active');
          document.getElementById('signupName').value = '';
          document.getElementById('signupEmail').value = '';
          signupPassword.value = '';
        }
      }
    });
  }
}

// Initialize on page load if not already initialized
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initAuth();
    loadAuth();
  });
} else {
  initAuth();
  loadAuth();
}