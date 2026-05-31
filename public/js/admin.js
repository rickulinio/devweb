async function loadFactions() {
    const res = await fetch('/api/admin/config');
    const factions = await res.json();
    const container = document.getElementById('content');
    
    container.innerHTML = factions.map(f => `
        <div class="faction-card">
            <h3>${f.name}</h3>
            <input type="text" value="${f.name}" id="name-${f.key}">
            <button onclick="saveFaction('${f.key}')">Zapisz</button>
        </div>
    `).join('');
}

async function saveFaction(key) {
    // Logika zbierania danych z inputów i wysyłka przez fetch
}