const express = require('express');
const path = require('path');
const app = express();

// Teraz serwer wie, że tylko to, co w folderze 'public', jest widoczne
app.use(express.static(path.join(__dirname, 'public')));

// API - tutaj schowamy dane, które teraz masz w data.js
app.get('/api/factions', (req, res) => {
    // Zamiast czytać data.js, tutaj wyciągniemy dane z bazy MongoDB
    res.json({ success: true, message: "Dane z bazy!" });
});

app.listen(process.env.PORT || 3000);