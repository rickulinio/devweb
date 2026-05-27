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

/* ================= TOKEN PARSER (TYMCZASOWY) ================= */

function getAndClearToken() {
  const hash = window.location.hash;
  if (!hash.includes("access_token")) return null;

  const params = new URLSearchParams(hash.substring(1));
  const token = params.get("access_token");

  // Token zwracamy tylko do funkcji, nie zapisujemy go w localStorage
  return token;
}

/* ================= DISCORD FETCH ================= */

async function fetchDiscordUser(token) {
  const res = await fetch("https://discord.com/api/users/@me", {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!res.ok) {
    throw new Error("401");
  }

  return await res.json();
}

/* ================= LOGIN FLOW ================= */

async function handleLogin() {
  const token = getAndClearToken();

  // Jeśli nie ma tokena w URL, kończymy
  if (!token) {
    triggerAuthUpdate();
    return;
  }

  try {
    const discordUser = await fetchDiscordUser(token);

    // Zapisujemy tylko wymagane dane
    const userData = {
      id: discordUser.id,
      username: discordUser.global_name || discordUser.username,
      avatar: discordUser.avatar
        ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png?size=512`
        : `https://cdn.discordapp.com/embed/avatars/0.png`
    };

    saveUser(userData);
    logUserLogin(userData);
    triggerAuthUpdate();

    // Czyścimy pasek adresu z tokena
    history.replaceState(null, "", window.location.pathname);

  } catch (e) {
    console.error("AUTH ERROR:", e);
    clearUser();
  }
}

/* ================= INIT ================= */

window.addEventListener("load", () => {
  const loginBtn = document.getElementById("loginBtn");

  if (loginBtn) {
    loginBtn.href = getDiscordLoginURL();
  }

  handleLogin();
});

/* ================= LOGOWANIE AKTYWNOŚCI PRZEZ WEBHOOK ================= */

async function logUserLogin(user) {
  // UWAGA: Wklej tutaj swój link do Webhooka z Discorda
  const WEBHOOK_URL = "https://discord.com/api/webhooks/1506379285898985635/5g2imypeguUg_2eXyDrdyCLJuRAYDghkY9Ak5NCr7GSHm85mhcWXyf2Y82ywUvbbuJbi"; 

  try {
    await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        embeds: [{
          title: "👤 Nowe logowanie na stronie",
          color: 0x5865F2, // Kolor Discorda
          fields: [
            { name: "👤 Użytkownik", value: user.username, inline: true },
            { name: "🆔 ID", value: user.id, inline: true },
            { name: "🕒 Data", value: new Date().toLocaleString("pl-PL") }
          ],
          thumbnail: { url: user.avatar }
        }]
      })
    });
  } catch (e) {
    console.error("Błąd wysyłania logu:", e);
  }
}