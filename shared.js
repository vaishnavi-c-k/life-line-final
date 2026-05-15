// ═══════════════════════════════════════════════════════════════
// PROJECT LIFELINE — Integrated Emergency Response Platform
// Government of India | Ministry of Home Affairs | NDMA
// Shared Utilities, RBAC, Navigation — Production v5.0
// ═══════════════════════════════════════════════════════════════

// ── ROLE DEFINITIONS ──────────────────────────────────────────
const ROLES = {
  admin: {
    label: 'System Administrator',
    icon: '🛡️',
    color: '#FFD700', /* Gold */
    pages: ['dashboard', 'disasters', 'victims', 'relief', 'resources', 'agencies', 'alerts', 'admin']
  },
  coordinator: {
    label: 'District Coordinator',
    icon: '📋',
    color: '#9E1B32', /* Deep Red */
    pages: ['dashboard', 'disasters', 'victims', 'relief', 'alerts']
  },
  agency: {
    label: 'Agency Officer',
    icon: '🏢',
    color: '#FB8C00', /* Orange */
    pages: ['dashboard', 'resources', 'relief']
  }
};

// ── SESSION MANAGEMENT ─────────────────────────────────────────
function getSession() {
  try {
    const s = sessionStorage.getItem('lifeline_session');
    return s ? JSON.parse(s) : null;
  } catch (e) { return null; }
}

function setSession(role, name, uid) {
  sessionStorage.setItem('lifeline_session', JSON.stringify({
    role, name, uid, ts: Date.now()
  }));
}

function clearSession() {
  sessionStorage.removeItem('lifeline_session');
}

function requireAuth(pageId) {
  const session = getSession();
  if (!session) { window.location.href = 'login.html'; return null; }
  const roleDef = ROLES[session.role];
  if (!roleDef || !roleDef.pages.includes(pageId)) {
    return { session, denied: true };
  }
  return { session, denied: false };
}

// ── NAVIGATION STRUCTURE ───────────────────────────────────────
const NAV_ITEMS = [
  {
    section: 'Overview', items: [
      { id: 'dashboard', icon: '📊', label: 'Operations Center', href: 'dashboard.html' },
    ]
  },
  {
    section: 'Crisis Management', items: [
      { id: 'disasters', icon: '🌋', label: 'Incident Registry', href: 'disasters.html' },
      { id: 'victims', icon: '👤', label: 'Victim Tracking', href: 'victims.html' },
      { id: 'relief', icon: '⛺', label: 'Relief Logistics', href: 'relief_camps.html' },
      { id: 'resources', icon: '📦', label: 'Resource Inventory', href: 'resources.html' },
      { id: 'agencies', icon: '🏢', label: 'Response Network', href: 'agencies.html' },
    ]
  },
  {
    section: 'Communications', items: [
      { id: 'alerts', icon: '🚨', label: 'Alert Management', href: 'alerts.html', badge: 3 },
    ]
  },
];

// ── GLOBAL COMPONENTS ──────────────────────────────────────────
function injectEmergencyTicker() {
  const ticker = document.createElement('div');
  ticker.className = 'emergency-ticker-strip';
  ticker.innerHTML = `
    <div class="ticker-label">LIVE ALERT</div>
    <div class="ticker-wrap">
      <div class="ticker-move">
        <span>🔴 RED ALERT: Cyclone Biparjoy approaching Gujarat coast — SDRF deployed</span>
        <span>🟠 ORANGE ALERT: Heavy rainfall warning in Northeast — Monitoring in progress</span>
        <span>🏕️ 87 Relief Camps active nationwide — 12,400+ persons sheltered</span>
        <span>👥 48,320 Victims registered across active disaster zones</span>
      </div>
    </div>
  `;
  document.body.prepend(ticker);
}

// ── SIDEBAR BUILDER ────────────────────────────────────────────
function buildSidebar(activePage) {
  const session = getSession();
  if (!session) return '';
  const roleDef = ROLES[session.role];
  const allowed = roleDef ? roleDef.pages : [];

  let html = `
  <div class="sidebar">
    <div class="sidebar-header">
      <div class="sidebar-logo">
        <div class="logo-emblem">L</div>
        <div class="logo-text">
          <strong>LIFELINE</strong>
          <small>Disaster Management System</small>
        </div>
      </div>
    </div>
    <div class="gov-strip">Ministry of Home Affairs • Government of India</div>
    <div class="role-pill">
      <span>${roleDef?.icon || '👤'}</span>
      <span>${roleDef?.label || session.role}</span>
    </div>
  `;

  NAV_ITEMS.forEach(section => {
    const visibleItems = section.items.filter(i => allowed.includes(i.id));
    if (!visibleItems.length) return;

    html += `<div class="nav-section"><div class="nav-label">${section.section}</div>`;
    visibleItems.forEach(item => {
      const isActive = item.id === activePage ? ' active' : '';
      const badge = item.badge ? `<span class="nav-badge">${item.badge}</span>` : '';
      html += `<a href="${item.href}" class="nav-item${isActive}">
        <span class="nav-icon">${item.icon}</span>
        <span>${item.label}</span>
        ${badge}
      </a>`;
    });
    html += `</div><div class="nav-divider"></div>`;
  });

  html += `
    <div class="sidebar-footer">
      <div class="user-card">
        <div class="user-avatar">${session.name?.charAt(0) || 'O'}</div>
        <div class="user-info">
          <div class="uname">${session.name || 'Officer'}</div>
          <div class="urole">${session.uid || 'ID Unknown'}</div>
        </div>
      </div>
      <a href="login.html" class="btn-logout" onclick="clearSession()">Sign Out</a>
    </div>
  </div>`;
  return html;
}

// ── TOPBAR BUILDER ─────────────────────────────────────────────
function buildTopbar(title, sub) {
  const session = getSession();
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-IN', {
    weekday: 'short', day: '2-digit', month: 'short'
  });
  const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  const allowed = session ? (ROLES[session.role]?.pages || []) : [];
  const alertLink = allowed.includes('alerts')
    ? `<a href="alerts.html" class="notif-btn" title="Alert Centre">🔔<span class="num">3</span></a>`
    : '';

  return `
  <div class="topbar">
    <div class="topbar-left">
      <div class="topbar-title">${title}</div>
      <div class="breadcrumb">• ${sub}</div>
    </div>
    <div class="topbar-right">
      <div class="live-indicator"><div class="live-dot"></div>OPERATIONAL</div>
      <div class="topbar-date">${dateStr} • ${timeStr}</div>
      ${alertLink}
    </div>
  </div>`;
}

// ── MODAL HELPERS ──────────────────────────────────────────────
function openModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add('show');
}

function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove('show');
}

document.addEventListener('click', e => {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.classList.remove('show');
  }
});

// ── TOAST NOTIFICATIONS ────────────────────────────────────────
function showToast(msg, type = 'success') {
  let t = document.getElementById('global-toast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'global-toast';
    t.className = 'toast';
    document.body.appendChild(t);
  }
  const icons = { success: '✓', error: '✕', warning: '⚠' };
  t.innerHTML = `<span>${icons[type] || icons.success}</span> ${msg}`;
  t.className = `toast ${type}`;
  setTimeout(() => t.classList.add('show'), 10);
  setTimeout(() => t.classList.remove('show'), 3400);
}

// ── ANIMATED COUNTER ───────────────────────────────────────────
function animateCount(el, target, duration = 1400) {
  if (!el) return;
  const start = 0;
  let current = start;
  const step = target / (duration / 16);
  const tick = () => {
    current = Math.min(current + step, target);
    el.textContent = Math.floor(current).toLocaleString('en-IN');
    if (current < target) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

// ── TABLE FILTER ───────────────────────────────────────────────
function filterTable(inputId, tableId) {
  const q = document.getElementById(inputId).value.toLowerCase();
  document.querySelectorAll(`#${tableId} tbody tr`).forEach(r => {
    r.style.display = r.textContent.toLowerCase().includes(q) ? '' : 'none';
  });
}

// ── AUDIT LOG ──────────────────────────────────────────────────
function logAudit(action, details) {
  const session = getSession();
  if (!session) return;
  const logs = JSON.parse(sessionStorage.getItem('audit_log') || '[]');
  logs.unshift({
    ts: new Date().toISOString(),
    user: session.name || session.uid,
    role: session.role,
    action, details
  });
  if (logs.length > 200) logs.pop();
  sessionStorage.setItem('audit_log', JSON.stringify(logs));
}

// ── ACCESS DENIED ──────────────────────────────────────────────
function renderAccessDenied(pageName) {
  return `
  <div class="access-denied-container">
    <div class="access-denied-card">
      <div class="denied-icon">🔒</div>
      <h2>Restricted Access</h2>
      <p>Your current clearance level (${getSession()?.role || 'Guest'}) does not permit entry to the <strong>${pageName}</strong> module.</p>
      <div class="denied-actions">
        <a href="dashboard.html" class="btn btn-primary">Return to Command Center</a>
      </div>
      <p class="denied-footer">If you believe this is an error, contact the National Operations Center (NOC) helpdesk.</p>
    </div>
  </div>`;
}

// ── KEYBOARD SHORTCUTS ─────────────────────────────────────────
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-overlay.show').forEach(m => m.classList.remove('show'));
  }
});