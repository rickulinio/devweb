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
  window.dispatchEvent(new Event("auth:update"));
}

/* ================= LOGIN URL ================= */

function getDiscordLoginURL() {

  return `https://discord.com/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=token&scope=identify`;

}

/* ================= TOKEN ================= */

function getToken() {

  if (!window.location.hash) return null;

  const hash = window.location.hash.substring(1);

  const params = new URLSearchParams(hash);

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
    throw new Error("Discord API Error");
  }

  return await res.json();
}

/* ================= LOGIN FLOW ================= */

async function handleLogin() {

  const token = getToken();

  /* brak tokena */
  if (!token) {

    const saved = getUser();

    if (saved?.id) {
      triggerAuthUpdate();
    }

    return;
  }

  try {

    console.log("TOKEN:", token);

    const discordUser = await fetchDiscordUser(token);

    console.log("DISCORD USER:", discordUser);

    const avatar =
      discordUser.avatar
        ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png?size=512`
        : `https://cdn.discordapp.com/embed/avatars/0.png`;

    const userData = {
      id: discordUser.id,
      username:
        discordUser.global_name ||
        discordUser.username,
      avatar
    };

    console.log("SAVE USER:", userData);

    saveUser(userData);

    triggerAuthUpdate();

    /* czyścimy hash DOPIERO po wszystkim */
    history.replaceState(
      null,
      "",
      window.location.pathname
    );

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