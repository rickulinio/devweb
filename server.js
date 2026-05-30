require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const axios = require('axios');
const path = require('path');

const app = express();

// ─── Middleware ───────────────────────────────────────────────
app.use(express.json());
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(session({
  secret: process.env.SESSION_SECRET || 'vastRP_super_secret_change_me',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 dni
  }
}));

// Serwowanie plików statycznych
app.use(express.static(__dirname));

// ─── Konfiguracja frakcji (webhooks trzymamy po stronie serwera) ──
const FACTION_WEBHOOKS = {
  adm:           process.env.WEBHOOK_ADM,
  test1:         process.env.WEBHOOK_LSPD,
  test:          process.env.WEBHOOK_LSSD,
  test3:         process.env.WEBHOOK_EMS,
  autoexotic:    process.env.WEBHOOK_AUTOEXOTIC,
  test2:         process.env.WEBHOOK_CRIME,
  podanienafirme:process.env.WEBHOOK_FIRMA,
};

// Cooldowny aplikacji – In-memory (wystarczy na start, można zamienić na Redis/DB)
// Struktura: { "userId_factionKey": expiresAt }
const cooldowns = new Map();
const COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24 godziny

// ─── Discord OAuth2 ───────────────────────────────────────────

// Krok 1: Przekierowanie do Discord
app.get('/auth/discord', (req, res) => {
  const params = new URLSearchParams({
    client_id:     process.env.CLIENT_ID,
    redirect_uri:  process.env.REDIRECT_URI,
    response_type: 'code',
    scope:         'identify',
  });
  res.redirect(`https://discord.com/oauth2/authorize?${params}`);
});

// Krok 2: Callback z kodem od Discorda
app.get('/auth/discord/callback', async (req, res) => {
  const { code } = req.query;
  if (!code) return res.redirect('/?error=no_code');

  try {
    // Wymiana kodu na token (CLIENT_SECRET nigdy nie trafia do klienta)
    const tokenRes = await axios.post(
      'https://discord.com/api/oauth2/token',
      new URLSearchParams({
        client_id:     process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        grant_type:    'authorization_code',
        code,
        redirect_uri:  process.env.REDIRECT_URI,
      }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    const accessToken = tokenRes.data.access_token;

    // Pobranie danych użytkownika
    const userRes = await axios.get('https://discord.com/api/users/@me', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    const u = userRes.data;
    const userData = {
      id:       u.id,
      username: u.global_name || u.username,
      avatar:   u.avatar
        ? `https://cdn.discordapp.com/avatars/${u.id}/${u.avatar}.png?size=512`
        : `https://cdn.discordapp.com/embed/avatars/0.png`
    };

    // Zapisujemy użytkownika w sesji (po stronie serwera)
    req.session.user = userData;

    // Log logowania przez webhook
    await logUserLogin(userData);

    // Przekierowanie z powrotem na stronę
    res.redirect('/');

  } catch (err) {
    console.error('OAuth error:', err.response?.data || err.message);
    res.redirect('/?error=auth_failed');
  }
});

// Wylogowanie
app.post('/auth/logout', (req, res) => {
  req.session.destroy();
  res.json({ ok: true });
});

// Aktualny użytkownik (sprawdzenie sesji)
app.get('/api/me', (req, res) => {
  if (!req.session.user) return res.json({ user: null });
  res.json({ user: req.session.user });
});

// ─── Wysyłanie podania ────────────────────────────────────────

app.post('/api/apply/:factionKey', async (req, res) => {
  const { factionKey } = req.params;

  // Musi być zalogowany
  if (!req.session.user) {
    return res.status(401).json({ error: 'Nie jesteś zalogowany.' });
  }

  const user = req.session.user;

  // Sprawdzenie cooldownu po stronie serwera
  const cooldownKey = `${user.id}_${factionKey}`;
  const expires = cooldowns.get(cooldownKey);
  if (expires && Date.now() < expires) {
    const remaining = expires - Date.now();
    return res.status(429).json({
      error: 'Cooldown nadal trwa.',
      remainingMs: remaining
    });
  }

  // Pobranie webhooka z serwera (klient go nigdy nie widzi)
  const webhookUrl = FACTION_WEBHOOKS[factionKey];
  if (!webhookUrl) {
    return res.status(404).json({ error: 'Nieznana frakcja.' });
  }

  const { fields, factionName, factionColor } = req.body;
  if (!fields || !Array.isArray(fields)) {
    return res.status(400).json({ error: 'Nieprawidłowe dane.' });
  }

  // Dodaj dane użytkownika na początku
  const embedFields = [
    { name: '👤 Użytkownik', value: user.username, inline: true },
    { name: '🆔 Discord ID',  value: user.id,       inline: true },
    ...fields
  ];

  try {
    const payload = {
      embeds: [{
        title:     '📋 Podanie',
        color:     parseInt((factionColor || '#5865F2').replace('#', ''), 16),
        thumbnail: { url: user.avatar },
        fields:    embedFields,
        timestamp: new Date().toISOString()
      }]
    };

    await axios.post(webhookUrl, payload);

    // Ustawiamy cooldown po stronie serwera
    cooldowns.set(cooldownKey, Date.now() + COOLDOWN_MS);

    res.json({ ok: true });

  } catch (err) {
    console.error('Webhook error:', err.response?.data || err.message);
    res.status(500).json({ error: 'Błąd wysyłania podania.' });
  }
});

// Sprawdzenie cooldownu (frontend może zapytać)
app.get('/api/cooldown/:factionKey', (req, res) => {
  if (!req.session.user) return res.json({ cooldown: false });

  const { factionKey } = req.params;
  const key = `${req.session.user.id}_${factionKey}`;
  const expires = cooldowns.get(key);

  if (!expires || Date.now() > expires) {
    cooldowns.delete(key);
    return res.json({ cooldown: false });
  }

  res.json({ cooldown: true, remainingMs: expires - Date.now() });
});

// ─── Proxy dla statystyk serwera FiveM ───────────────────────
// (eliminuje problem CORS przy odpytywaniu zewnętrznego API)
app.get('/api/server-stats', async (req, res) => {
  try {
    const response = await axios.get('http://193.111.250.98:30299/players.json', {
      timeout: 5000
    });
    res.json(response.data);
  } catch {
    res.json([]);
  }
});

// ─── Główne trasy HTML ────────────────────────────────────────
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, 'login.html')));

// ─── Funkcja pomocnicza: log logowania ───────────────────────
async function logUserLogin(user) {
  const webhookUrl = process.env.WEBHOOK_LOGIN_LOG;
  if (!webhookUrl) return;

  try {
    await axios.post(webhookUrl, {
      embeds: [{
        title:  '👤 Nowe logowanie na stronie',
        color:  0x5865F2,
        fields: [
          { name: '👤 Użytkownik', value: user.username, inline: true },
          { name: '🆔 ID',         value: user.id,       inline: true },
          { name: '🕒 Data',       value: new Date().toLocaleString('pl-PL') }
        ],
        thumbnail: { url: user.avatar }
      }]
    });
  } catch (e) {
    console.error('Login log error:', e.message);
  }
}

// ─── Start ────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Serwer działa na http://localhost:${PORT}`));
