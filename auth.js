/* ================= CONFIG ================= */

const CLIENT_ID = "1480598374024483012";
const BASE_URL = "https://rickulinio.github.io/devweb/";

/* ================= STORAGE ================= */

function saveUser(user) {
  localStorage.setItem("user", JSON.stringify(user));

  window.dispatchEvent(new Event("auth:update"));
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

  window.dispatchEvent(new Event("auth:update"));
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
    window.location.pathname
  );
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
    throw new Error(`Discord API Error (${res.status})`);
  }

  return await res.json();
}

/* ================= USER FORMAT ================= */

function buildUserData(user) {

  const defaultAvatarIndex =
    Number(user.discriminator || 0) % 5;

  return {
    id: user.id,

    username:
      user.global_name ||
      user.username ||
      "Discord User",

    avatar: user.avatar
      ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=512`
      : `https://cdn.discordapp.com/embed/avatars/${defaultAvatarIndex}.png`
  };
}

/* ================= LOGIN FLOW ================= */

async function handleLogin() {

  // USER JUŻ ZAPISANY
  const savedUser = getSavedUser();

  if (savedUser?.id) {

    window.dispatchEvent(
      new Event("auth:update")
    );

    return;
  }

  // TOKEN Z DISCORDA
  const token = getTokenFromHash();

  if (!token) return;

  try {

    const discordUser =
      await fetchDiscordUser(token);

    if (!discordUser?.id) {
      throw new Error("Invalid Discord User");
    }

    const userData =
      buildUserData(discordUser);

    // SAVE
    saveUser(userData);

    // REMOVE HASH
    cleanUrl();

    // FORCE UI UPDATE
    setTimeout(() => {

      window.dispatchEvent(
        new Event("auth:update")
      );

      window.location.reload();

    }, 200);

  } catch (err) {

    console.error("DISCORD AUTH ERROR:", err);

    clearUser();
  }
}

/* ================= INIT ================= */

window.addEventListener("load", async () => {

  const loginBtn =
    document.getElementById("loginBtn");

  if (loginBtn) {
    loginBtn.href = getDiscordLoginURL();
  }

  await handleLogin();
});
