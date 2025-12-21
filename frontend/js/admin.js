// Admin Dashboard JavaScript


window.API_BASE = window.API_BASE || (window.location.hostname === "localhost"
  ? "http://localhost:4000"
  : "https://holyverse-s5s1.onrender.com");
const API_BASE = window.API_BASE;

function showModal(message) {
  const modal = document.getElementById("appModal");
  const msg = document.getElementById("modalMessage");
  const closeBtn = document.getElementById("modalClose");

  msg.textContent = message;
  modal.style.display = "flex";

  closeBtn.onclick = () => {
    modal.style.display = "none";
  };
}

// Tab switching
function switchAdminTab(tabName, btnElem) {
  // hide all tab contents and deactivate all tab buttons
  document.querySelectorAll('.admin-tab-content').forEach(tab => tab.classList.remove('active'));
  document.querySelectorAll('.admin-tabs .tab-btn').forEach(btn => btn.classList.remove('active'));

  const tabs = {
    'questions': 'questionsTab',
    'testimonies': 'testimoniesTab',
    'reports': 'reportsTab',
    'push': 'pushTab'
  };

  const targetId = tabs[tabName];
  const targetEl = targetId ? document.getElementById(targetId) : null;
  if (targetEl) targetEl.classList.add('active');
  else console.warn('Unknown admin tab:', tabName);

  // Determine the button element: explicit arg, event target, or lookup by data attribute
  let btn = btnElem || (typeof event !== 'undefined' && event && event.target) || document.querySelector(`.admin-tabs .tab-btn[data-tab="${tabName}"]`);
  if (btn && btn.classList) btn.classList.add('active');
  
  // Load data for specific tab
  if (tabName === 'questions') {
    loadPendingQuestions();
  } else if (tabName === 'testimonies') {
    loadPendingTestimonies();
  } else if (tabName === 'reports') {
    loadPendingReports();
  } else if (tabName === 'push') {
    loadPushTester();
  }
}

// ============================================
// PENDING QUESTIONS
// ============================================

async function loadPendingQuestions() {
  try {
    const response = await fetch(`${API_BASE}/api/admin/user-questions`, {
      credentials: 'include'
    });
    
    if (response.status === 401) {
      showModal("⛔ Session expired. Please log in again.");
      window.location.href = "/login.html";
      return;
    }
    
    const raw = await response.json();
    const questions = Array.isArray(raw) ? raw : (raw.data || raw.questions || []);
    
    const container = document.getElementById("pendingQuestions");
    container.innerHTML = "";
    
    if (questions.length === 0) {
      container.innerHTML = "<p style='text-align:center; opacity:0.6;'>No pending questions</p>";
      return;
    }
    
    questions.forEach(q => {
      const card = document.createElement("div");
      card.className = "admin-card";
      card.innerHTML = `
        <div class="admin-card-header">
          <span><strong>${q.username}</strong></span>
          <span class="category-badge">${q.category}</span>
        </div>
        <p class="question-text">${q.question}</p>
        ${q.context ? `<p class="context-text"><em>Context: ${q.context}</em></p>` : ''}
        <div class="admin-actions">
          <input type="text" id="explanation-${q.id}" placeholder="Answer title (e.g., God's love never fails)" />
          <select id="theme-${q.id}">
            <option value="general">General</option>
            <option value="love">Love</option>
            <option value="hope">Hope</option>
            <option value="peace">Peace</option>
            <option value="grace">Grace</option>
            <option value="truth">Truth</option>
            <option value="wisdom">Wisdom</option>
            <option value="strength">Strength</option>
            <option value="faith">Faith</option>
          </select>
          <textarea id="versePool-${q.id}" placeholder="Enter each verse with reference and text separated by | (one per line):\nJohn 3:16|For God so loved the world...\nRomans 8:28|And we know that in all things...\nPsalm 23:1|The Lord is my shepherd..."></textarea>
          <small style="color:var(--text-color); opacity:0.7; display:block; margin-top:-0.3rem;">💡 Tip: Format - Reference|Verse text (one per line)</small>
          <button class="innerbtn approve-btn" onclick="reviewQuestion('${q.id}', 'approve')">✓ Approve</button>
          <button class="innerbtn reject-btn" onclick="reviewQuestion('${q.id}', 'reject')">✗ Reject</button>
        </div>
        <small style="opacity:0.7;">Submitted: ${new Date(q.created_at).toLocaleString()}</small>
      `;
      container.appendChild(card);
    });
  } catch (error) {
    console.error("Error loading pending questions:", error);
  }
}

async function reviewQuestion(id, action) {
  try {
    const versePool = action === 'approve' 
      ? document.getElementById(`versePool-${id}`).value.trim()
      : null;
    const explanation = action === 'approve'
      ? document.getElementById(`explanation-${id}`).value.trim()
      : null;
    const theme = action === 'approve'
      ? document.getElementById(`theme-${id}`).value
      : null;
    
    if (action === 'approve' && !versePool) {
      showModal("Please enter verse references before approving");
      return;
    }
    if (action === 'approve' && !explanation) {
      showModal("Please enter an explanation/answer title");
      return;
    }
    
    const response = await fetch(`${API_BASE}/api/admin/user-questions/${id}/review`, {
      method: "POST",
      credentials: 'include',
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, versePool, explanation, theme })
    });
    
    if (response.ok) {
      showModal(`Question ${action}d successfully!`);
      loadPendingQuestions();
    }
  } catch (error) {
    console.error("Error reviewing question:", error);
  }
}

// ============================================
// PENDING TESTIMONIES
// ============================================

async function loadPendingTestimonies() {
  try {
    const response = await fetch(`${API_BASE}/api/admin/testimonies`, {
      credentials: 'include'
    });
    
    if (response.status === 401) {
      showModal("⛔ Session expired. Please log in again.");
      window.location.href = "/login.html";
      return;
    }
    
    const testimonies = await response.json();
    
    const container = document.getElementById("pendingTestimonies");
    container.innerHTML = "";
    
    if (testimonies.length === 0) {
      container.innerHTML = "<p style='text-align:center; opacity:0.6;'>No pending testimonies</p>";
      return;
    }
    
    testimonies.forEach(t => {
      const card = document.createElement("div");
      card.className = "admin-card";
      const tagHTML = t.tags.map(tag => `<span class="story-tag">${tag}</span>`).join('');
      
      card.innerHTML = `
        <div class="admin-card-header">
          <span><strong>${t.username}</strong></span>
          <div>${tagHTML}</div>
        </div>
        <p class="testimony-text">${t.text}</p>
        <div class="admin-actions">
          <button class="innerbtn approve-btn" onclick="reviewTestimony('${t.id}', 'approve')">✓ Approve</button>
          <button class="innerbtn reject-btn" onclick="reviewTestimony('${t.id}', 'reject')">✗ Reject</button>
        </div>
        <small style="opacity:0.7;">Submitted: ${new Date(t.created_at).toLocaleString()}</small>
      `;
      container.appendChild(card);
    });
  } catch (error) {
    console.error("Error loading pending testimonies:", error);
  }
}

async function reviewTestimony(id, action) {
  try {
    const response = await fetch(`${API_BASE}/api/admin/testimonies/${id}/review`, {
      method: "POST",
      credentials: 'include',
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action })
    });
    
    if (response.ok) {
      showModal(`Testimony ${action}d successfully!`);
      loadPendingTestimonies();
    }
  } catch (error) {
    console.error("Error reviewing testimony:", error);
  }
}

// ============================================
// REPORTS
// ============================================

async function loadPendingReports() {
  try {
    const response = await fetch(`${API_BASE}/api/admin/reports`, {
      credentials: 'include'
    });
    
    if (response.status === 401) {
      showModal("⛔ Session expired. Please log in again.");
      window.location.href = "/login.html";
      return;
    }
    
    const reports = await response.json();
    
    const container = document.getElementById("pendingReports");
    container.innerHTML = "";
    
    if (!reports || reports.error || reports.length === 0) {
      container.innerHTML = "<p style='text-align:center; opacity:0.6;'>No pending reports</p>";
      return;
    }
    
    reports.forEach(r => {
      const card = document.createElement("div");
      card.className = "admin-card";
      card.innerHTML = `
        <div class="admin-card-header">
          <span><strong>${r.content_type}</strong> reported</span>
          <span class="category-badge">${r.reason}</span>
        </div>
        <p>Content ID: ${r.content_id}</p>
        <div class="admin-actions">
          <button class="innerbtn" onclick="reviewReport('${r.id}', 'restore')">Restore</button>
          <button class="innerbtn reject-btn" onclick="reviewReport('${r.id}', 'delete')">Delete</button>
          <button class="innerbtn" onclick="reviewReport('${r.id}', 'warn')">Warn User</button>
        </div>
        <small style="opacity:0.7;">Reported: ${new Date(r.created_at).toLocaleString()}</small>
      `;
      container.appendChild(card);
    });
  } catch (error) {
    console.error("Error loading reports:", error);
  }
}

async function reviewReport(id, action) {
  try {
    const response = await fetch(`${API_BASE}/api/admin/reports/${id}/review`, {
      method: "POST",
      credentials: 'include',
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action })
    });
    
    if (response.ok) {
      showModal(`Report reviewed: ${action}`);
      loadPendingReports();
    }
  } catch (error) {
    console.error("Error reviewing report:", error);
  }
}

// Initial load
window.addEventListener("DOMContentLoaded", () => {
  loadPendingQuestions();
  // attach push tester handler if admin
  document.getElementById('sendPushTestBtn')?.addEventListener('click', async () => {
    const uid = parseInt(document.getElementById('pushTestUserId').value) || null;
    const token = document.getElementById('pushTestToken').value.trim() || null;
    const title = document.getElementById('pushTestTitle').value || 'Test';
    const body = document.getElementById('pushTestBody').value || 'Test message';
    const resEl = document.getElementById('pushTestResult');
    try {
      const resp = await fetch(`${API_BASE}/push/test`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: uid, token, title, body })
      });
      const data = await resp.json();
      if (resp.ok) resEl.textContent = 'Sent: ' + JSON.stringify(data);
      else resEl.textContent = 'Error: ' + JSON.stringify(data);
    } catch (e) {
      resEl.textContent = 'Network error: ' + e.message;
    }
  });
});

function loadPushTester() {
  // nothing heavy to load; handler already bound on DOMContentLoaded
}
