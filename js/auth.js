/* ================= AUTH.JS — WERSJA BACKENDOWA ================= */
/* Logowanie odbywa się przez serwer (Authorization Code Flow).    */
/* Żaden sekret ani webhook URL nie trafia do przeglądarki.        */

/* ================= STORAGE (session po stronie serwera) ================= */

// Użytkownik jest przechowywany w sesji serwera, nie w localStorage.
// Tutaj trzymamy tylko lokalną kopię pobraną z /api/me.
let _cachedUser = null;

async function fetchCurrentUser() {
  try {
    const res = await fetch('/api/me', { credentials: 'include' });
    const data = await res.json();
    _cachedUser = data.user || null;
    return _cachedUser;
  } catch {
    _cachedUser = null;
    return null;
  }
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

/* ================= EVENT ================= */

function triggerAuthUpdate() {
  window.dispatchEvent(new Event('auth:update'));
}

/* ================= LOGIN URL ================= */

function getDiscordLoginURL() {
  // Przekierowanie do naszego backendu, który obsługuje całe OAuth
  return '/auth/discord';
}

/* ================= INIT ================= */

window.addEventListener('load', async () => {
  const loginBtn = document.getElementById('loginBtn');

  if (loginBtn) {
    loginBtn.href = getDiscordLoginURL();
  }

  // Pobieramy użytkownika z serwera (sprawdzenie sesji)
  await fetchCurrentUser();
  triggerAuthUpdate();
});
