/* Reusable admin sidebar.
   Drop this on any Admin page:

     <div id="admin-sidebar" data-active="dashboard"></div>
     <script src="../shared/sidebar.js"></script>

   `data-active` must match one of the `key` values below so the
   matching nav item gets the .active class. Paths are written
   relative to a page one level under Qatar/Admin/ (e.g.
   Admin/dashboard/index.html); pages at a different depth can pass
   a `data-base="../../Admin/"`-style override via the `base`
   argument to AdminSidebar.mount if ever needed.

   The sidebar markup lives here as a single source of truth so
   every Admin section reuses the exact same HTML/behavior instead
   of each page keeping its own copy. */
(function () {
  var NAV = [
    { key: 'dashboard', label: 'Dashboard', href: '../dashboard/index.html',
      icon: '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>' }
  ];

  var GROUPS = [
    { label: 'Platform', items: [
      { key: 'students', label: 'Students', href: '../students/index.html',
        icon: '<circle cx="9" cy="8" r="4"/><path d="M2 21v-2a6 6 0 0 1 6-6h2a6 6 0 0 1 6 6v2"/><circle cx="17" cy="8" r="3"/><path d="M22 21v-2a5 5 0 0 0-3.5-4.8"/>' },
      { key: 'competencies', label: 'Competencies', href: '../competencies/index.html',
        icon: '<path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="9"/>' },
      { key: 'opportunities', label: 'Opportunities', href: '../opportunities/index.html',
        icon: '<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>' },
      { key: 'badges', label: 'Badges &amp; Credentials', href: '../badges/index.html',
        icon: '<circle cx="12" cy="8" r="6"/><polyline points="8.2 13.5 7 22 12 19 17 22 15.8 13.5"/>' },
      { key: 'evidence', label: 'Evidence', href: '../evidence/index.html',
        icon: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/>' },
      { key: 'review', label: 'Review &amp; Verification', href: '../review/index.html',
        icon: '<path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>' }
    ] },
    { label: 'Insights', items: [
      { key: 'analytics', label: 'Analytics', href: '../analytics/index.html',
        icon: '<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>' },
      { key: 'reports', label: 'Reports', href: '../reports/index.html',
        icon: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="13" y2="17"/>' },
      { key: 'enrollment-trends', label: 'Enrollment Trends', href: '../enrollment-trends/index.html',
        icon: '<polyline points="3 17 9.5 10.5 14 15 21 7.5"/><polyline points="15 7.5 21 7.5 21 13.5"/>' }
    ] },
    { label: 'Configuration', items: [
      { key: 'users-roles', label: 'Users &amp; Roles', href: '../users-roles/index.html',
        icon: '<circle cx="9" cy="8" r="4"/><path d="M2 21v-1a6 6 0 0 1 6-6h2a6 6 0 0 1 6 6v1"/><path d="M19 8v4M17 10h4"/>' },
      { key: 'organizations', label: 'Organizations', href: '../organizations/index.html',
        icon: '<path d="M4 21V7l8-4 8 4v14"/><path d="M9 21v-6h6v6"/><line x1="9" y1="10" x2="9" y2="10.01"/><line x1="12" y1="10" x2="12" y2="10.01"/><line x1="15" y1="10" x2="15" y2="10.01"/>' },
      { key: 'settings', label: 'Settings', href: '../settings/index.html',
        icon: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z"/>' }
    ] }
  ];

  function navBtn(item, active) {
    return '<button class="qnav' + (active ? ' active' : '') + '" data-key="' + item.key + '" onclick="window.location.href=\'' + item.href + '\'">' +
      '<svg viewBox="0 0 24 24">' + item.icon + '</svg>' + item.label + '</button>';
  }

  function render(activeKey) {
    var html = '<div class="qsb-brand"><span class="qsb-logo"><img src="https://iconape.com/wp-content/files/hz/20759/png/Qatar-Foundation-01.png" alt="Qatar Foundation"></span></div>';
    html += '<nav class="qsb-nav">';
    NAV.forEach(function (item) { html += navBtn(item, item.key === activeKey); });
    GROUPS.forEach(function (group) {
      html += '<div class="qnav-group"><div class="qnav-group-label">' + group.label + '</div>';
      group.items.forEach(function (item) { html += navBtn(item, item.key === activeKey); });
      html += '</div>';
    });
    html += '</nav>';
    html += '<div class="qsb-help"><button class="qnav" onclick="AdminAuth.logout()">' +
      '<svg viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>Sign Out</button></div>';
    return html;
  }

  function mount() {
    var root = document.getElementById('admin-sidebar');
    if (!root) return;
    var active = root.getAttribute('data-active') || '';
    root.outerHTML = '<aside class="qsb" id="qsb">' + render(active) + '</aside>';
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
})();
