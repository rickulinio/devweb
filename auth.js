/* ================= CONFIG ================= */

const CLIENT_ID = "1480598374024483012";
const REDIRECT_URI = "https://rickulinio.github.io/devweb";

/* ================= STORAGE ================= */

function saveUser(user) {
  localStorage.setItem("user", JSON.stringify(user));
}

function getUser() {
  try {
    return JSON.parse(localStorage.getItem("user"));
  } catch {
    return null;
  }
}

function clearUser() {
  localStorage.removeItem("user");
}

/* ================= URL ================= */

function cleanUrl() {
  history.replaceState({}, document.title, window.location.pathname);
}

/* ================= LOGIN URL ================= */

function getDiscordLoginURL() {
  return (
    "https://discord.com/oauth2/authorize" +
    `?client_id=${CLIENT_ID}` +
    `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
    "&response_type=token" +
    "&scope=identify" +
    "&prompt=none"
  );
}

/* ================= TOKEN ================= */

function getAccessToken() {
  const hash = window.location.hash;
  console.log("HASH:", hash); // 🔥 DEBUG
  if (!hash) return null;

  return new URLSearchParams(hash.replace("#", "")).get("access_token");
}

/* ================= FETCH ================= */

async function fetchUser(token) {
  const res = await fetch("https://discord.com/api/users/@me", {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!res.ok) throw new Error("Discord API error");

  return res.json();
}

/* ================= BUILD ================= */

function buildUser(u) {
  const fallback = Number(u.discriminator || 0) % 5;

  return {
    id: u.id,
    username: u.global_name || u.username,
    avatar: u.avatar
      ? `https://cdn.discordapp.com/avatars/${u.id}/${u.avatar}.png?size=256`
      : `https://cdn.discordapp.com/embed/avatars/${fallback}.png`
  };
}

/* ================= MAIN LOGIN ================= */

async function login() {

  const saved = getUser();
  const token = getAccessToken();

  // 1. jeśli już jest user → NIE ROBIMY NIC
  if (saved?.id) {
    window.dispatchEvent(new Event("auth:update"));
    return;
  }

  // 2. jeśli brak tokena → stop
  if (!token) return;

  try {

    const discordUser = await fetchUser(token);
    const user = buildUser(discordUser);

    saveUser(user);
    cleanUrl();

    window.dispatchEvent(new Event("auth:update"));

  } catch (e) {
    console.error("AUTH ERROR:", e);
    clearUser();
  }
}

/* ================= INIT (TYLKO RAZ) ================= */

window.addEventListener("DOMContentLoaded", () => {

  const loginBtn = document.getElementById("loginBtn");
  if (loginBtn) loginBtn.href = getDiscordLoginURL();

  login();
});