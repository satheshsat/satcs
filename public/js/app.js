const API_BASE = window.location.origin + '/api';

function getToken() {
  return localStorage.getItem('token');
}

function getCurrentUser() {
  const u = localStorage.getItem('user');
  return u ? JSON.parse(u) : null;
}

function setAuth(token, user) {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
}

function clearAuth() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

function authHeader() {
  const t = getToken();
  return t ? { Authorization: 'Bearer ' + t } : {};
}

async function api(endpoint, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...authHeader(), ...options.headers };
  const res = await fetch(API_BASE + endpoint, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || res.statusText);
  return data;
}

function redirectIfNotLoggedIn(targetUrl = 'login.html') {
  if (!getToken()) {
    window.location.href = targetUrl + '?redirect=' + encodeURIComponent(window.location.href);
    return false;
  }
  return true;
}

function redirectIfNotEmployer() {
  const user = getCurrentUser();
  if (!user || user.role !== 'employer') {
    window.location.href = 'index.html';
    return false;
  }
  return true;
}

function showAlert(elId, message, isError = false) {
  const el = document.getElementById(elId);
  if (!el) return;
  el.className = 'alert alert-' + (isError ? 'danger' : 'success');
  el.textContent = message;
  el.classList.remove('d-none');
  setTimeout(() => el.classList.add('d-none'), 5000);
}

function formatDate(str) {
  if (!str) return '';
  const d = new Date(str);
  return d.toLocaleDateString();
}
