require('dotenv').config();
const express = require('express');
const axios = require('axios');
const mongoose = require('mongoose');
const app = express();

app.use(express.json());
app.use(express.static('public'));

// --- MongoDB ---
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log("✅ Połączono z MongoDB"))
    .catch(err => console.error("❌ Błąd MongoDB:", err));

const Cooldown = mongoose.model('Cooldown', new mongoose.Schema({
    userId: String,
    factionKey: String,
    expiresAt: Date
}));

// --- Endpointy ---
app.get('/api/config', (req, res) => {
    res.json({
        clientId: process.env.DISCORD_CLIENT_ID,
        redirectUri: process.env.DISCORD_REDIRECT_URI
    });
});

app.post('/api/apply', async (req, res) => {
    const { key, payload, userId } = req.body;
    
    const webhooks = {
        'adm': process.env.WEBHOOK_ADM,
        'test1': process.env.WEBHOOK_LSPD,
        'test': process.env.WEBHOOK_LSSD,
        'test3': process.env.WEBHOOK_EMS,
        'autoexotic': process.env.WEBHOOK_AUTOEXOTIC,
        'test2': process.env.WEBHOOK_CRIME,
        'podanienafirme': process.env.WEBHOOK_FIRMA,
        'login_log': process.env.WEBHOOK_LOGIN
    };

    const webhookUrl = webhooks[key];
    if (!webhookUrl) return res.status(400).send({ error: "Nieznana frakcja" });

    try {
        // 1. Wysyłka na Discord
        await axios.post(webhookUrl, payload);

        // 2. Zapis cooldownu (24h)
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
        await Cooldown.findOneAndUpdate(
            { userId, factionKey: key },
            { expiresAt },
            { upsert: true }
        );

        res.status(200).send({ success: true });
    } catch (e) {
        console.error("Błąd wysyłania:", e.message);
        res.status(500).send({ error: "Błąd serwera" });
    }
});

app.get('/api/check-cooldown/:userId/:key', async (req, res) => {
    const { userId, key } = req.params;
    const cd = await Cooldown.findOne({ userId, factionKey: key });
    
    if (cd && cd.expiresAt > new Date()) {
        const diff = cd.expiresAt - new Date();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        res.json({ 
            hasCooldown: true, 
            remaining: `${hours}h ${minutes}m ${seconds}s` 
        });
    } else {
        res.json({ hasCooldown: false });
    }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`🚀 Serwer działa na http://localhost:${port}`));