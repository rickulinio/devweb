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

/* ================= URL ================= */

function cleanUrl() {
  history.replaceState(
    {},
    document.title,
    window.location.pathname
  );
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

  if (!hash) return null;

  const params = new URLSearchParams(
    hash.replace("#", "")
  );

  return params.get("access_token");
}

/* ================= FETCH USER ================= */

async function fetchDiscordUser(token) {

  const res = await fetch(
    "https://discord.com/api/users/@me",
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  if (!res.ok) {
    throw new Error(
      `Discord API Error ${res.status}`
    );
  }

  return await res.json();
}

/* ================= BUILD USER ================= */

function buildUser(discordUser) {

  const defaultAvatar =
    Number(discordUser.discriminator || 0) % 5;

  return {
    id: discordUser.id,

    username:
      discordUser.global_name ||
      discordUser.username,

    avatar: discordUser.avatar
      ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png?size=256`
      : `https://cdn.discordapp.com/embed/avatars/${defaultAvatar}.png`
  };
}

/* ================= LOGIN ================= */

async function login() {

  // już zalogowany
  const saved = getUser();

  if (saved?.id) {
    window.dispatchEvent(
      new Event("auth:update")
    );
    return;
  }

  // token z discorda
  const token = getAccessToken();

  if (!token) return;

  try {

    const discordUser =
      await fetchDiscordUser(token);

    const user =
      buildUser(discordUser);

    // save
    saveUser(user);

    // clean hash
    cleanUrl();

    // update ui
    window.dispatchEvent(
      new Event("auth:update")
    );

    // refresh
    location.reload();

  } catch (err) {

    console.error(err);

    clearUser();
  }
}

/* ================= INIT ================= */

window.addEventListener("DOMContentLoaded", () => {

  const loginBtn =
    document.getElementById("loginBtn");

  if (loginBtn) {
    loginBtn.href =
      getDiscordLoginURL();
  }

  login();
});

/* ================= INIT ================= */

window.addEventListener("load", async () => {

  const loginBtn =
    document.getElementById("loginBtn");

  if (loginBtn) {
    loginBtn.href =
      getDiscordLoginURL();
  }

  await login();

  setTimeout(() => {
    window.dispatchEvent(
      new Event("auth:update")
    );
  }, 200);
});