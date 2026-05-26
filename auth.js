/* ================= CONFIG ================= */

const CLIENT_ID = "1480598374024483012";
const BASE_URL = "https://rickulinio.github.io/devweb/";

/* ================= STORAGE ================= */

function saveUser(user) {
  localStorage.setItem("user", JSON.stringify(user));
}

function getSavedUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
}

function clearUser() {
  localStorage.removeItem("user");
}

/* ================= TOKEN ================= */

function getTokenFromHash() {
  const hash = window.location.hash.substring(1);

  if (!hash) return null;

  const params = new URLSearchParams(hash);

  return params.get("access_token");
}

/* ================= CLEAN URL ================= */

function cleanUrl() {
  window.history.replaceState(
    {},
    document.title,
    window.location.pathname + window.location.search
  );
}

/* ================= EVENT ================= */

function triggerAuthUpdate() {
  window.dispatchEvent(new Event("auth:update"));
}

/* ================= LOGIN URL ================= */

function getDiscordLoginURL() {
  return `https://discord.com/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(BASE_URL)}&response_type=token&scope=identify`;
}

/* ================= FETCH USER ================= */

async function fetchDiscordUser(token) {

  const res = await fetch("https://discord.com/api/users/@me", {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!res.ok) {

    let err = {};

    try {
      err = await res.json();
    } catch {}

    throw new Error(
      err.message || `Discord API Error (${res.status})`
    );
  }

  return res.json();
}

/* ================= USER FORMAT ================= */

function buildUserData(user) {

  const defaultAvatarIndex =
    Number(user.discriminator || 0) % 5;

  return {
    id: user.id,

    username: user.global_name ||
              user.username ||
              "Discord User",

    avatar: user.avatar
      ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=512`
      : `https://cdn.discordapp.com/embed/avatars/${defaultAvatarIndex}.png`
  };
}

/* ================= LOGIN FLOW ================= */

async function handleLogin() {

  const token = getTokenFromHash();

  /* jeśli nie ma tokena */
  if (!token) {

    const savedUser = getSavedUser();

    if (savedUser?.id) {
      triggerAuthUpdate();
    }

    return;
  }

  try {

    console.log("Discord login start...");

    const discordUser = await fetchDiscordUser(token);

    if (!discordUser?.id) {
      throw new Error("Invalid Discord user");
    }

    const userData = buildUserData(discordUser);

    saveUser(userData);

    console.log("Saved user:", userData);

  } catch (err) {

    console.error("AUTH ERROR:", err);

    clearUser();

  } finally {

    cleanUrl();

    triggerAuthUpdate();
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