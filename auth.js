/* ================= CONFIG ================= */

const CLIENT_ID = "1480598374024483012";
const REDIRECT_URI = "https://rickulinio.github.io/devweb/";

console.log("[AUTH] script loaded");

/* ================= STORAGE ================= */

function saveUser(user) {
  console.log("[AUTH] saving user:", user);
  localStorage.setItem("user", JSON.stringify(user));
}

function getUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch (e) {
    console.log("[AUTH] getUser error", e);
    return null;
  }
}

function clearUser() {
  console.log("[AUTH] clearing user");
  localStorage.removeItem("user");
}

/* ================= URL ================= */

function cleanUrl() {
  window.history.replaceState({}, document.title, window.location.pathname);
}

/* ================= LOGIN URL ================= */

function getDiscordLoginURL() {
  return (
    "https://discord.com/oauth2/authorize" +
    `?client_id=${CLIENT_ID}` +
    `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
    "&response_type=token" +
    "&scope=identify"
  );
}

/* ================= TOKEN ================= */

function getAccessToken() {
  const hash = window.location.hash;
  console.log("[AUTH] hash:", hash);

  if (!hash) return null;

  const params = new URLSearchParams(hash.replace("#", ""));
  const token = params.get("access_token");

  console.log("[AUTH] token:", token);
  return token;
}

/* ================= FETCH ================= */

async function fetchUser(token) {
  console.log("[AUTH] fetching Discord user...");

  const res = await fetch("https://discord.com/api/users/@me", {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  console.log("[AUTH] response status:", res.status);

  if (!res.ok) {
    throw new Error("Discord API error " + res.status);
  }

  return res.json();
}

/* ================= BUILD ================= */

function buildUser(u) {
  console.log("[AUTH] building user:", u);

  const fallback = Number(u.discriminator || 0) % 5;

  return {
    id: u.id,
    username: u.global_name || u.username,
    avatar: u.avatar
      ? `https://cdn.discordapp.com/avatars/${u.id}/${u.avatar}.png?size=256`
      : `https://cdn.discordapp.com/embed/avatars/${fallback}.png`
  };
}

/* ================= LOGIN ================= */

async function login() {
  console.log("[AUTH] login start");

  const saved = getUser();
  if (saved?.id) {
    console.log("[AUTH] user already saved");
    window.dispatchEvent(new Event("auth:update"));
    return;
  }

  const token = getAccessToken();

  if (!token) {
    console.log("[AUTH] no token in URL");
    return;
  }

  try {
    const discordUser = await fetchUser(token);
    const user = buildUser(discordUser);

    saveUser(user);
    cleanUrl();

    window.dispatchEvent(new Event("auth:update"));

    console.log("[AUTH] login success");
  } catch (e) {
    console.error("[AUTH] LOGIN ERROR:", e);
    clearUser();
  }
}

/* ================= INIT ================= */

window.addEventListener("DOMContentLoaded", () => {
  console.log("[AUTH] DOM loaded");

  const loginBtn = document.getElementById("loginBtn");
  if (loginBtn) {
    loginBtn.href = getDiscordLoginURL();
  }

  login();
});