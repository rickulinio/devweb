/* ───────── OPEN MODAL ───────── */

const APP_COOLDOWN_HOURS = 24;
let cooldownInterval = null;

function getDraftKey(key) { return `draft_${key}`; }

// Funkcja sprawdzająca cooldown w bazie danych przez serwer
async function checkCooldownFromServer(key) {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (!user) return false;
    try {
        const response = await fetch(`/api/check-cooldown/${user.id}/${key}`);
        const data = await response.json();
        return data.hasCooldown;
    } catch (e) {
        console.error("Błąd sprawdzania cooldownu:", e);
        return false;
    }
}

function getRemainingTime(key) {
    const saved = localStorage.getItem(`appCooldown_${key}`);
    if (!saved) return null;
    const diff = Number(saved) - Date.now();
    if (diff <= 0) return null;
    const hours = Math.floor(diff / 1000 / 60 / 60);
    const minutes = Math.floor((diff / 1000 / 60) % 60);
    const seconds = Math.floor((diff / 1000) % 60);
    return `${hours}h ${minutes}m ${seconds}s`;
}

function setCooldown(key) {
    localStorage.removeItem(getDraftKey(key));
    const expires = Date.now() + APP_COOLDOWN_HOURS * 60 * 60 * 1000;
    localStorage.setItem(`appCooldown_${key}`, expires);
}

function startCooldownUpdater(key) {
    if (cooldownInterval) clearInterval(cooldownInterval);
    cooldownInterval = setInterval(() => {
        const btn = document.getElementById("m-sub");
        const alert = document.getElementById("m-alert");
        if (!btn || !alert) { clearInterval(cooldownInterval); cooldownInterval = null; return; }
        
        // Tutaj sprawdzamy czy nadal mamy cooldown
        checkCooldownFromServer(key).then(hasCD => {
            if (!hasCD) {
                btn.disabled = false;
                btn.textContent = "Wyślij Podanie";
                alert.className = "f-alert";
                alert.textContent = "";
                clearInterval(cooldownInterval);
                cooldownInterval = null;
                return;
            }
            const remaining = getRemainingTime(key);
            btn.textContent = `Cooldown: ${remaining || '...'}`;
            alert.textContent = `Możesz wysłać kolejne podanie za ${remaining || '...'}.`;
            btn.disabled = true;
        });
    }, 1000);
}

async function openModal(key) {
    const faction = FACTIONS.find(f => f.key === key);
    if (!faction) return;

    const user = JSON.parse(localStorage.getItem("user") || "null");
    const draft = JSON.parse(localStorage.getItem(getDraftKey(key)) || "{}");
    const modalBox = document.getElementById("modalBox");
    const sections = faction.questions || [];
    
    const isCooldown = await checkCooldownFromServer(key);
    const isNotLoggedIn = !user;
    const remaining = getRemainingTime(key);

    modalBox.innerHTML = `
    <div class="modal-content">
      <div class="modal-head">
        <div class="modal-icon">${faction.icon}</div>
        <div>
          <div class="modal-title">${faction.name} — Podanie</div>
          <div class="modal-subtitle">Formularz rekrutacyjny</div>
        </div>
        <button class="modal-close" onclick="closeModal()">✕</button>
      </div>
      <div class="modal-user-profile ${user ? 'active' : 'login-required'}">
        ${user ? `
          <img src="${user.avatar}" alt="Avatar">
          <div class="info">
            <strong>${user.username}</strong>
            <span>ID: ${user.id}</span>
          </div>
        ` : `<div class="login-msg">Aby uzupełnić podanie, musisz się zalogować.</div>`}
      </div>
      <div class="modal-body">
        <div class="modal-tabs">
          ${sections.map((s, i) => `<button class="modal-tab ${i === 0 ? "active" : ""}" data-tab="${s.section}">${s.section}</button>`).join("")}
        </div>
        ${sections.map((s, i) => `
          <div class="modal-section ${i === 0 ? "active" : ""}" data-section="${s.section}">
            ${s.items.map(q => {
              const val = draft[q.id] || "";
              const limit = q.maxLength || 500;
              return `
              <div class="fg">
                <label class="fl">${q.label}${q.required ? " *" : ""}</label>
                ${q.type === "textarea" 
                  ? `<textarea class="fta" id="m-${q.id}" maxlength="${limit}" ${q.required ? "required" : ""} ${(isCooldown || isNotLoggedIn) ? "disabled" : ""}>${val}</textarea>`
                  : `<input type="text" class="fi" id="m-${q.id}" maxlength="${limit}" ${q.required ? "required" : ""} ${(isCooldown || isNotLoggedIn) ? "disabled" : ""} value="${val}">`
                }
                <div class="char-counter" style="font-size: 11px; opacity: 0.5; text-align: right; margin-top: 4px;">
                  <span class="curr-len">${val.length}</span> / ${limit} znaków
                </div>
              </div>
            `}).join("")}
          </div>
        `).join("")}
        <button class="fsub-btn" id="m-sub" onclick="sendApp('${key}')" ${(isCooldown || isNotLoggedIn) ? "disabled" : ""}>
          ${isCooldown ? `Cooldown: ${remaining}` : (isNotLoggedIn ? "Zaloguj się" : "Wyślij Podanie")}
        </button>
        <div class="f-alert" id="m-alert">
          ${isCooldown ? `Możesz wysłać kolejne podanie za ${remaining}.` : ""}
        </div>
      </div>
    </div>`;

    modalBox.querySelectorAll('.fi, .fta').forEach(el => {
        el.addEventListener('input', (e) => {
            const field = e.target;
            const parent = field.closest('.fg');
            const counterSpan = parent.querySelector('.curr-len');
            const max = parseInt(field.getAttribute('maxlength'));
            counterSpan.textContent = field.value.length;
            
            const currentDraft = JSON.parse(localStorage.getItem(getDraftKey(key)) || "{}");
            currentDraft[field.id.replace('m-', '')] = field.value;
            localStorage.setItem(getDraftKey(key), JSON.stringify(currentDraft));
        });
    });

    const modalBg = document.getElementById("modalBg");
    modalBg.classList.remove("closing");
    modalBg.classList.add("show");
    document.body.style.overflow = "hidden";
    initTabs();
    if (isCooldown) startCooldownUpdater(key);
}

function initTabs() {
    const modal = document.getElementById("modalBox");
    if (!modal) return;
    modal.querySelectorAll(".modal-tab").forEach(tab => {
        tab.onclick = () => {
            const target = tab.dataset.tab;
            modal.querySelectorAll(".modal-tab").forEach(t => t.classList.remove("active"));
            modal.querySelectorAll(".modal-section").forEach(s => s.classList.remove("active"));
            tab.classList.add("active");
            modal.querySelector(`.modal-section[data-section="${target}"]`)?.classList.add("active");
        };
    });
}

async function sendApp(key) {
    if (await checkCooldownFromServer(key)) return;

    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (!user) return;

    const faction = FACTIONS.find(f => f.key === key);
    if (!faction) return;

    const alert = document.getElementById("m-alert");
    const btn = document.getElementById("m-sub");
    
    alert.textContent = "Wysyłanie...";
    
    let missing = false;
    faction.questions.forEach(section => {
        section.items.forEach(q => {
            const el = document.getElementById(`m-${q.id}`);
            if (el && q.required && !el.value.trim()) { missing = true; el.classList.add("err"); }
        });
    });

    if (missing) { alert.textContent = "Uzupełnij wszystkie wymagane pola."; return; }

    btn.disabled = true;

    const fields = faction.questions.flatMap(sec => sec.items.map(q => ({
        name: `${sec.section} • ${q.label}`,
        value: document.getElementById(`m-${q.id}`).value.trim() || "Brak"
    })));

    try {
        const payload = {
            content: `<@&${faction.roleId}> 📥 Nowe podanie — **${faction.name}**`,
            embeds: [{ title: "📋 Podanie", color: parseInt(faction.color.replace("#", ""), 16), thumbnail: { url: user.avatar }, fields, timestamp: new Date().toISOString() }]
        };

        const res = await fetch('/api/apply', {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ key, payload })
        });

        if (res.ok) {
            setCooldown(key);
            alert.textContent = "Podanie zostało wysłane!";
            setTimeout(() => closeModal(), 3000);
        } else throw new Error("Błąd");
    } catch (err) { alert.textContent = "Błąd: " + err.message; btn.disabled = false; }
}

function closeModal() {
    if (cooldownInterval) { clearInterval(cooldownInterval); cooldownInterval = null; }
    const modalBg = document.getElementById("modalBg");
    modalBg.classList.add("closing");
    setTimeout(() => {
        modalBg.classList.remove("show");
        modalBg.classList.remove("closing");
        document.body.style.overflow = "";
    }, 300);
}