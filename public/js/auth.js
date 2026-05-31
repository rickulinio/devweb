/* ================= KONFIGURACJA ================= */
let CONFIG = { clientId: "", redirectUri: "" };

async function loadConfig() {
    try {
        const res = await fetch('/api/config');
        CONFIG = await res.json();
        const loginBtn = document.getElementById("loginBtn");
        if (loginBtn) {
            loginBtn.href = `https://discord.com/oauth2/authorize?client_id=${CONFIG.clientId}&redirect_uri=${encodeURIComponent(CONFIG.redirectUri)}&response_type=token&scope=identify`;
        }
    } catch (e) { console.error("Nie udało się pobrać konfiguracji"); }
}

/* ================= STORAGE ================= */
function saveUser(user) { localStorage.setItem("user", JSON.stringify(user)); }
function getUser() { try { return JSON.parse(localStorage.getItem("user") || "null"); } catch { return null; } }
function clearUser() { localStorage.removeItem("user"); }

function triggerAuthUpdate() { window.dispatchEvent(new Event("auth:update")); }

/* ================= TOKEN PARSER ================= */
function getAndClearToken() {
    const hash = window.location.hash;
    if (!hash.includes("access_token")) return null;
    const params = new URLSearchParams(hash.substring(1));
    return params.get("access_token");
}

/* ================= DISCORD FETCH ================= */
async function fetchDiscordUser(token) {
    const res = await fetch("https://discord.com/api/users/@me", {
        headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error("401");
    return await res.json();
}

/* ================= LOGIN FLOW ================= */
async function handleLogin() {
    const token = getAndClearToken();
    if (!token) {
        triggerAuthUpdate();
        return;
    }
    try {
        const discordUser = await fetchDiscordUser(token);
        const userData = {
            id: discordUser.id,
            username: discordUser.global_name || discordUser.username,
            avatar: discordUser.avatar ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png?size=512` : `https://cdn.discordapp.com/embed/avatars/0.png`
        };
        saveUser(userData);
        logUserLogin(userData);
        triggerAuthUpdate();
        history.replaceState(null, "", window.location.pathname);
    } catch (e) { clearUser(); }
}

async function logUserLogin(user) {
    await fetch('/api/apply', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            key: 'login_log',
            payload: {
                embeds: [{
                    title: "👤 Nowe logowanie na stronie",
                    color: 0x5865F2,
                    fields: [
                        { name: "👤 Użytkownik", value: user.username, inline: true },
                        { name: "🆔 ID", value: user.id, inline: true }
                    ],
                    thumbnail: { url: user.avatar }
                }]
            }
        })
    });
}

window.addEventListener("load", () => {
    loadConfig();
    handleLogin();
});