/* ================= CONFIG ================= */

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

/* ================= EVENTS ================= */

function triggerAuthUpdate() {
  setTimeout(() => {
    window.dispatchEvent(new Event("auth:update"));
  }, 0);
}

/* ================= LOGIN URL ================= */

function getDiscordLoginURL() {
  return `https://discord.com/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(
    REDIRECT_URI
  )}&response_type=token&scope=identify`;
}

/* ================= TOKEN ================= */

function getToken() {
  const hash = window.location.hash;

  if (!hash || hash.length < 2) return null;

  const params = new URLSearchParams(hash.slice(1));
  const token = params.get("access_token");

  console.log("HASH:", hash);
  console.log("TOKEN:", token);

  return token;
}

/* ================= FETCH USER ================= */

async function fetchDiscordUser(token) {
  const res = await fetch("https://discord.com/api/users/@me", {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const text = await res.text();

  console.log("DISCORD STATUS:", res.status);
  console.log("DISCORD RAW:", text);

  if (!res.ok) {
    throw new Error(text);
  }

  return JSON.parse(text);
}

/* ================= LOGIN FLOW ================= */

async function handleLogin() {
  const token = getToken();

  if (!token) {
    const saved = getUser();

    if (saved?.id) {
      triggerAuthUpdate();
    }

    return;
  }

  try {
    console.log("LOGIN TOKEN OK:", token);

    const discordUser = await fetchDiscordUser(token);

    const avatar = discordUser.avatar
      ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png?size=512`
      : `https://cdn.discordapp.com/embed/avatars/0.png`;

    const userData = {
      id: discordUser.id,
      username: discordUser.global_name || discordUser.username,
      avatar
    };

    console.log("USER DATA:", userData);

    saveUser(userData);

    console.log("SAVED:", localStorage.getItem("user"));

    triggerAuthUpdate();

    // usuń hash po wszystkim
    history.replaceState(null, "", window.location.pathname);
  } catch (err) {
    console.error("LOGIN ERROR:", err);
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