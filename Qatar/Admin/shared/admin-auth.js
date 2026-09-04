/* Admin login/signup/forgot-password behavior.
   Scoped to Qatar/Admin/admin.html. On successful login this
   navigates to dashboard/index.html (a real page, not a same-page
   toggle) via AdminAuth.login(). */
(function () {
  const captchas = { login: '', signup: '', forgot: '' };

  function generateCaptcha(type) {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let code = '';
    for (let i = 0; i < 5; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
    captchas[type] = code;
    document.getElementById(type + 'CaptchaText').textContent = code;
  }
  window.generateCaptcha = generateCaptcha;

  function showPage(pageId) {
    document.querySelectorAll('.form-page').forEach(p => p.classList.remove('active'));
    setTimeout(() => document.getElementById(pageId).classList.add('active'), 50);
    document.querySelectorAll('.error-msg').forEach(e => e.classList.remove('show'));
    document.querySelectorAll('input').forEach(i => i.classList.remove('error'));
  }
  window.showPage = showPage;

  function togglePass(inputId, btn) {
    const input = document.getElementById(inputId);
    const isPass = input.type === 'password';
    input.type = isPass ? 'text' : 'password';
    btn.innerHTML = isPass
      ? '<svg viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>'
      : '<svg viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>';
  }
  window.togglePass = togglePass;

  function showError(id, msg) {
    const el = document.getElementById(id);
    if (msg) el.querySelector('span').textContent = msg;
    el.classList.add('show');
  }
  function clearAllErrors(formId) {
    document.querySelectorAll('#' + formId + ' .error-msg').forEach(e => e.classList.remove('show'));
    document.querySelectorAll('#' + formId + ' input').forEach(i => i.classList.remove('error'));
  }
  function shakeForm(formId) {
    const form = document.getElementById(formId);
    form.classList.add('shake');
    setTimeout(() => form.classList.remove('shake'), 400);
  }
  function isValidEmail(email) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); }
  function showToast(msg) {
    document.getElementById('toastMsg').textContent = msg;
    document.getElementById('toast').classList.add('show');
    setTimeout(() => document.getElementById('toast').classList.remove('show'), 3000);
  }

  function checkStrength(val) {
    let score = 0;
    if (val.length >= 8) score++;
    if (/[A-Z]/.test(val)) score++;
    if (/[0-9]/.test(val)) score++;
    if (/[^A-Za-z0-9]/.test(val)) score++;
    const labels = ['', 'Weak', 'Medium', 'Strong', 'Very Strong'];
    const classes = ['', 'weak', 'medium', 'strong', 'very-strong'];
    for (let i = 1; i <= 4; i++) {
      const bar = document.getElementById('str' + i);
      bar.className = 'strength-bar';
      if (i <= score) bar.classList.add(classes[score]);
    }
    document.getElementById('strengthLabel').textContent = val.length > 0 ? labels[score] : '';
  }
  window.checkStrength = checkStrength;

  generateCaptcha('login');
  generateCaptcha('signup');
  generateCaptcha('forgot');

  document.getElementById('loginForm').addEventListener('submit', function (e) {
    e.preventDefault();
    clearAllErrors('loginForm');
    let valid = true;
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value.trim();
    const captchaInput = document.getElementById('loginCaptchaInput').value.trim();

    if (!email || !isValidEmail(email)) { showError('loginEmailErr'); document.getElementById('loginEmail').classList.add('error'); valid = false; }
    if (!password) { showError('loginPasswordErr', 'Please enter your password'); document.getElementById('loginPassword').classList.add('error'); valid = false; }
    if (!captchaInput) { showError('loginCaptchaErr', 'Please enter the captcha code'); valid = false; }
    else if (captchaInput !== captchas.login) { showError('loginCaptchaErr', 'Captcha does not match. Please try again.'); valid = false; generateCaptcha('login'); }

    if (!valid) { shakeForm('loginForm'); return; }

    showToast('Login successful! Redirecting...');
    const name = email.split('@')[0];
    const displayName = name.charAt(0).toUpperCase() + name.slice(1);
    AdminAuth.login(displayName, 'System Administrator');
    setTimeout(() => { window.location.href = 'dashboard/index.html'; }, 900);
    generateCaptcha('login');
  });

  document.getElementById('signupForm').addEventListener('submit', function (e) {
    e.preventDefault();
    clearAllErrors('signupForm');
    let valid = true;
    const name = document.getElementById('signupName').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value.trim();
    const confirmPassword = document.getElementById('signupConfirmPassword').value.trim();
    const captchaInput = document.getElementById('signupCaptchaInput').value.trim();

    if (!name) { showError('signupNameErr'); document.getElementById('signupName').classList.add('error'); valid = false; }
    if (!email || !isValidEmail(email)) { showError('signupEmailErr'); document.getElementById('signupEmail').classList.add('error'); valid = false; }
    if (!password || password.length < 8) { showError('signupPasswordErr'); document.getElementById('signupPassword').classList.add('error'); valid = false; }
    if (!confirmPassword || password !== confirmPassword) { showError('signupConfirmPasswordErr'); document.getElementById('signupConfirmPassword').classList.add('error'); valid = false; }
    if (!captchaInput) { showError('signupCaptchaErr', 'Please enter the captcha code'); valid = false; }
    else if (captchaInput !== captchas.signup) { showError('signupCaptchaErr', 'Captcha does not match.'); valid = false; generateCaptcha('signup'); }

    if (!valid) { shakeForm('signupForm'); return; }
    showToast('Account created successfully!');
    generateCaptcha('signup');
    this.reset(); checkStrength('');
    setTimeout(() => showPage('loginPage'), 1500);
  });

  document.getElementById('forgotForm').addEventListener('submit', function (e) {
    e.preventDefault();
    clearAllErrors('forgotForm');
    let valid = true;
    const email = document.getElementById('forgotEmail').value.trim();
    const captchaInput = document.getElementById('forgotCaptchaInput').value.trim();

    if (!email || !isValidEmail(email)) { showError('forgotEmailErr'); document.getElementById('forgotEmail').classList.add('error'); valid = false; }
    if (!captchaInput) { showError('forgotCaptchaErr', 'Please enter the captcha code'); valid = false; }
    else if (captchaInput !== captchas.forgot) { showError('forgotCaptchaErr', 'Captcha does not match.'); valid = false; generateCaptcha('forgot'); }

    if (!valid) { shakeForm('forgotForm'); return; }
    showToast('Reset link sent to your email!');
    generateCaptcha('forgot');
    this.reset();
  });

  document.querySelectorAll('input').forEach(input => {
    input.addEventListener('input', function () {
      this.classList.remove('error');
      const err = this.closest('.form-group')?.querySelector('.error-msg');
      if (err) err.classList.remove('show');
    });
  });

  /* Already signed in? Skip straight to the dashboard. */
  if (AdminAuth.isLoggedIn()) {
    window.location.href = 'dashboard/index.html';
  }
})();
