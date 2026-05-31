const express = require('express');
const path = require('path');
const app = express();

// Serwowanie plików z folderu głównego
app.use(express.static(__dirname));

// Główny adres strony
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Nasłuchiwanie na porcie, który przypisze Render
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Serwer działa na http://localhost:${port}`);
});
