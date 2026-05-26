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
  // 1. hash (Discord standard)
  const hash = window.location.hash;

  if (hash.includes("access_token")) {
    const params = new URLSearchParams(hash.slice(1));
    const token = params.get("access_token");

    if (token) {
      sessionStorage.setItem("discord_token", token);
      return token;
    }
  }

  // 2. fallback (czasem Discord lub GitHub zmienia flow)
  const urlParams = new URLSearchParams(window.location.search);
  const tokenFromQuery = urlParams.get("access_token");

  if (tokenFromQuery) {
    sessionStorage.setItem("discord_token", tokenFromQuery);
    return tokenFromQuery;
  }

  // 3. persistent fallback
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

    // 🔥 WAŻNE: usuń hash po zapisaniu
    setTimeout(() => {
      history.replaceState(null, "", window.location.pathname);
    }, 0);

  } catch (e) {
    console.error("AUTH ERROR:", e);
    clearUser();
  }
}

/* ================= INIT ================= */

window.addEventListener("DOMContentLoaded", () => {
  const loginBtn = document.getElementById("loginBtn");

  if (loginBtn) {
    loginBtn.href = getDiscordLoginURL();
  }

  handleLogin();
});