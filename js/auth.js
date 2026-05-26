const CLIENT_ID = "1480598374024483012";
const REDIRECT_URI = "https://rickulinio.github.io/devweb/";

/* ================= STORAGE ================= */

function saveUser(user) {
  localStorage.setItem("user", JSON.stringify(user));
}

function getUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
}

function clearUser() {
  localStorage.removeItem("user");
}

/* ================= EVENT ================= */

function triggerAuthUpdate() {
  window.dispatchEvent(new Event("auth:update"));
}

/* ================= LOGIN URL ================= */

function getDiscordLoginURL() {
  return `https://discord.com/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(
    REDIRECT_URI
  )}&response_type=token&scope=identify`;
}

/* ================= TOKEN SAFE PARSER ================= */

function getToken() {
  // Przechwytywanie z fragmentu URL (Discord standard)
  const hash = window.location.hash.substring(1);
  const params = new URLSearchParams(hash);
  const token = params.get("access_token");

  if (token) {
    sessionStorage.setItem("discord_token", token);
    return token;
  }

  // Sprawdzenie czy jest w sesji (jeśli już wcześniej pobraliśmy)
  return sessionStorage.getItem("discord_token");
}

/* ================= DISCORD FETCH ================= */

async function fetchDiscordUser(token) {
  const res = await fetch("https://discord.com/api/users/@me", {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const text = await res.text();

  if (!res.ok) {
    throw new Error(text);
  }

  return JSON.parse(text);
}

/* ================= LOGIN FLOW ================= */

/* ================= LOGIN FLOW ================= */

async function handleLogin() {
  const token = getToken();

  if (!token) {
    if (getUser()?.id) triggerAuthUpdate();
    return;
  }

  try {
    const discordUser = await fetchDiscordUser(token);

    const userData = {
      id: discordUser.id,
      username: discordUser.global_name || discordUser.username,
      avatar: discordUser.avatar
        ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png?size=512`
        : `https://cdn.discordapp.com/embed/avatars/0.png`
    };

    saveUser(userData);
    triggerAuthUpdate();

    setTimeout(() => {
      history.replaceState(null, "", window.location.pathname);
    }, 0);

  } catch (e) {
    console.error("AUTH ERROR:", e);
    
    // --- WSTAW TO W TYM MIEJSCU ---
    if (e.message.includes("401")) {
      console.warn("Token wygasł, wylogowuję...");
      clearUser();
      sessionStorage.removeItem("discord_token");
    }
    // ------------------------------
    
    clearUser();
  }
}

/* ================= INIT ================= */

window.addEventListener("load", () => { // Zmieniono z DOMContentLoaded na load
  const loginBtn = document.getElementById("loginBtn");

  if (loginBtn) {
    loginBtn.href = getDiscordLoginURL();
  }

  // Wymuszamy sprawdzenie tokena przy starcie strony
  handleLogin();
});