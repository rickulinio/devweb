const CLIENT_ID = "1480598374024483012";
const BASE_URL = "https://rickulinio.github.io/vast/";

/* STORAGE */
function saveUser(user) {
  localStorage.setItem("user", JSON.stringify(user));
}

function clearUser() {
  localStorage.removeItem("user");
}

/* TOKEN */
function getTokenFromHash() {
  const hash = window.location.hash.substring(1);
  if (!hash) return null;
  const params = new URLSearchParams(hash);
  return params.get("access_token");
}

/* CLEAN URL - czyści hash bez przeładowania strony */
function cleanUrl() {
  window.history.replaceState(null, "", window.location.pathname);
}

/* EVENT */
function triggerAuthUpdate() {
  window.dispatchEvent(new Event("auth:update"));
}

/* DISCORD LOGIN */
function getDiscordLoginURL() {
  return `https://discord.com/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(BASE_URL)}&response_type=token&scope=identify`;
}

/* FETCH USER */
async function fetchDiscordUser(token) {
  const res = await fetch("https://discord.com/api/users/@me", {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.message || `Discord API error: ${res.status}`);
  }
  return res.json();
}

/* LOGIN FLOW */
async function handleLogin() {
  const token = getTokenFromHash();

  // Jeśli nie ma tokena, sprawdzamy czy mamy już zapisanego użytkownika
  if (!token) {
    const savedUser = localStorage.getItem("user");
    if (savedUser) triggerAuthUpdate();
    return;
  }

  try {
    console.log("Przetwarzanie tokena...");
    const user = await fetchDiscordUser(token);

    if (!user?.id) throw new Error("Invalid user response");

    const userData = {
      id: user.id,
      username: user.username,
      avatar: user.avatar
        ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=512`
        : `https://cdn.discordapp.com/embed/avatars/0.png`
    };

    saveUser(userData);
    console.log("Zalogowano:", userData.username);

  } catch (e) {
    console.error("LOGIN ERROR:", e);
    clearUser();
  } finally {
    // Czyścimy URL z tokena niezależnie od wyniku (sukces/błąd)
    cleanUrl();
    triggerAuthUpdate();
  }
}

/* INIT */
window.addEventListener("DOMContentLoaded", () => {
  const loginBtn = document.getElementById("loginBtn");
  if (loginBtn) {
    loginBtn.href = getDiscordLoginURL();
  }

  handleLogin();
});