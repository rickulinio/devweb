/* ================= CONFIG ================= */

const CLIENT_ID = "1480598374024483012";
const REDIRECT_URI = "https://rickulinio.github.io/devweb/";

console.log("[AUTH] script loaded");

/* ================= STORAGE ================= */

function saveUser(user) {
  try {
    console.log("[AUTH] saving user:", user);
    localStorage.setItem("user", JSON.stringify(user));
  } catch (e) {
    console.error("[AUTH] save error", e);
  }
}

function getUser() {
  try {
    const raw = localStorage.getItem("user");
    if (!raw || raw === "undefined" || raw === "null") return null;
    return JSON.parse(raw);
  } catch (e) {
    console.log("[AUTH] getUser error", e);
    return null;
  }
}

function clearUser() {
  console.log("[AUTH] clearing user");
  localStorage.removeItem("user");
}

/* ================= URL CLEAN ================= */

function cleanUrl() {
  window.history.replaceState({}, document.title, window.location.pathname);
}

/* ================= DISCORD LOGIN URL ================= */

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

/* ================= DISCORD FETCH (SAFE MODE) ================= */

async function fetchUser(token) {
  console.log("[AUTH] fetching user...");

  try {
    const res = await fetch("https://discord.com/api/users/@me", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const text = await res.text();

    console.log("[AUTH] status:", res.status);
    console.log("[AUTH] raw:", text);

    if (!res.ok) {
      throw new Error("Discord API blocked: " + res.status);
    }

    return JSON.parse(text);
  } catch (err) {
    console.error("[AUTH] fetchUser failed:", err);
    throw err;
  }
}

/* ================= BUILD USER ================= */

function buildUser(u) {
  console.log("[AUTH] building user:", u);

  const fallback = Math.floor(Math.random() * 5);

  return {
    id: u.id || "unknown",
    username: u.global_name || u.username || "Discord User",
    avatar: u.avatar
      ? `https://cdn.discordapp.com/avatars/${u.id}/${u.avatar}.png?size=256`
      : `https://cdn.discordapp.com/embed/avatars/${fallback}.png`
  };
}

/* ================= MAIN LOGIN ================= */

async function login() {
  console.log("[AUTH] login start");

  const saved = getUser();
  if (saved?.id) {
    console.log("[AUTH] user already in localStorage");
    window.dispatchEvent(new Event("auth:update"));
    return;
  }

  const token = getAccessToken();

  if (!token) {
    console.log("[AUTH] no token in URL");
    return;
  }

  try {
    let discordUser = null;

    try {
      discordUser = await fetchUser(token);
    } catch (e) {
      console.warn("[AUTH] Discord API failed, using fallback mode");

      // fallback (żeby NIE blokowało loginu)
      discordUser = {
        id: "local-" + Date.now(),
        username: "Discord User",
        avatar: null
      };
    }

    const user = buildUser(discordUser);

    saveUser(user);
    cleanUrl();

    window.dispatchEvent(new Event("auth:update"));

    console.log("[AUTH] login success");
  } catch (e) {
    console.error("[AUTH] LOGIN FAILED:", e);
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