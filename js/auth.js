/* ================= AUTH.JS — WERSJA BACKENDOWA ================= */

let _cachedUser = null;
let _authReady  = false;

// Promise który resolwuje się gdy auth jest gotowy — inne skrypty mogą na to czekać
let _authReadyResolve;
const authReady = new Promise(resolve => { _authReadyResolve = resolve; });

async function fetchCurrentUser() {
  try {
    const res = await fetch('/api/me', { credentials: 'include' });
    const data = await res.json();
    _cachedUser = data.user || null;
  } catch {
    _cachedUser = null;
  }
  _authReady = true;
  _authReadyResolve(_cachedUser);
  return _cachedUser;
}

function getUser() {
  return _cachedUser;
}

async function logout() {
  try {
    await fetch('/auth/logout', { method: 'POST', credentials: 'include' });
  } catch {}
  _cachedUser = null;
  triggerAuthUpdate();
}

function triggerAuthUpdate() {
  window.dispatchEvent(new Event('auth:update'));
}

function getDiscordLoginURL() {
  return '/auth/discord';
}

/* ── Init: pobierz użytkownika i dopiero wtedy odpal auth:update ── */
window.addEventListener('load', async () => {
  const loginBtn = document.getElementById('loginBtn');
  if (loginBtn) loginBtn.href = getDiscordLoginURL();

  await fetchCurrentUser();
  triggerAuthUpdate(); // teraz _cachedUser jest już ustawiony
});
