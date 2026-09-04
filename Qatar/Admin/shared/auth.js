/* Shared admin auth/session helper.
   Not real authentication — this is a static prototype. It just
   keeps a localStorage flag so the segregated pages (login vs.
   dashboard vs. future sections) can redirect sensibly, the same
   way the student portal remembers `qfLoggedIn` / `qfName`. */
window.AdminAuth = (function () {
  var FLAG = 'qfAdminLoggedIn';
  var NAME = 'qfAdminName';
  var ROLE = 'qfAdminRole';

  function login(name, role) {
    try {
      localStorage.setItem(FLAG, '1');
      localStorage.setItem(NAME, name || 'Admin');
      localStorage.setItem(ROLE, role || 'Administrator');
    } catch (e) {}
  }

  function logout() {
    try {
      localStorage.removeItem(FLAG);
      localStorage.removeItem(NAME);
      localStorage.removeItem(ROLE);
    } catch (e) {}
    window.location.href = '../admin.html';
  }

  function isLoggedIn() {
    try { return localStorage.getItem(FLAG) === '1'; } catch (e) { return false; }
  }

  function getName() {
    try { return localStorage.getItem(NAME) || 'Admin'; } catch (e) { return 'Admin'; }
  }

  function getRole() {
    try { return localStorage.getItem(ROLE) || 'Administrator'; } catch (e) { return 'Administrator'; }
  }

  /* Call at the top of every protected page. Redirects to login if
     no session is present. */
  function requireAuth() {
    if (!isLoggedIn()) {
      window.location.href = '../admin.html';
    }
  }

  return { login: login, logout: logout, isLoggedIn: isLoggedIn, getName: getName, getRole: getRole, requireAuth: requireAuth };
})();
