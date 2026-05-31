require('dotenv').config();
const express = require('express');
const axios = require('axios');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static('public'));

// Endpoint do pobierania konfiguracji przez klienta
app.get('/api/config', (req, res) => {
    res.json({
        clientId: process.env.DISCORD_CLIENT_ID,
        redirectUri: process.env.DISCORD_REDIRECT_URI
    });
});

// Główny endpoint do wysyłania podań i logów
app.post('/api/apply', async (req, res) => {
    const { key, payload } = req.body;
    
    const webhooks = {
        'adm': process.env.WEBHOOK_ADM,
        'test1': process.env.WEBHOOK_LSPD,
        'test': process.env.WEBHOOK_LSSD,
        'test3': process.env.WEBHOOK_EMS,
        'autoexotic': process.env.WEBHOOK_AUTOEXOTIC,
        'test2': process.env.WEBHOOK_CRIME,
        'podanienafirme': process.env.WEBHOOK_FIRMA,
        'login_log': process.env.WEBHOOK_LOGIN // Dodany dla logowania
    };

    const webhookUrl = webhooks[key];
    if (!webhookUrl) return res.status(400).send({ error: "Nieznana frakcja" });

    try {
        await axios.post(webhookUrl, payload);
        res.status(200).send({ success: true });
    } catch (e) {
        res.status(500).send({ error: "Błąd serwera" });
    }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Serwer działa na http://localhost:${port}`));

const mongoose = require('mongoose');

// Połącz się z MongoDB (Link dostaniesz po założeniu konta na MongoDB Atlas)
mongoose.connect(process.env.MONGODB_URI);

const cooldownSchema = new mongoose.Schema({
    userId: String,
    factionKey: String,
    expiresAt: Date
});
const Cooldown = mongoose.model('Cooldown', cooldownSchema);

// Endpoint sprawdzający cooldown
app.get('/api/check-cooldown/:userId/:key', async (req, res) => {
    const { userId, key } = req.params;
    const cd = await Cooldown.findOne({ userId, factionKey: key });
    
    if (cd && cd.expiresAt > new Date()) {
        res.json({ hasCooldown: true, expiresAt: cd.expiresAt });
    } else {
        res.json({ hasCooldown: false });
    }
});