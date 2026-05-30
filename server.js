require('dotenv').config();
const express = require('express');
const app = express();
app.use(express.json());
app.use(express.static('public'));

app.post('/api/send-application', async (req, res) => {
    const { factionKey, data } = req.body;
    const webhookUrl = process.env[`WEBHOOK_${factionKey.toUpperCase()}`];

    if (!webhookUrl) return res.status(400).send("Błędna frakcja");

    await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    res.sendStatus(200);
});

app.listen(3000);