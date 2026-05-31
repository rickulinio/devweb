/* ───────── MODAL.JS ───────── */

const APP_COOLDOWN_HOURS = 24;
let cooldownInterval = null;

function getDraftKey(key) { return `draft_${key}`; }

// Sprawdzenie cooldownu przez serwer
async function checkCooldownFromServer(key) {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (!user) return false;
    try {
        const response = await fetch(`/api/check-cooldown/${user.id}/${key}`);
        const data = await response.json();
        return data.hasCooldown;
    } catch (e) { return false; }
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
                ${user ? `<img src="${user.avatar}" alt="Avatar"><div class="info"><strong>${user.username}</strong><span>ID: ${user.id}</span></div>` : `<div class="login-msg">Aby uzupełnić podanie, musisz się zalogować.</div>`}
            </div>
            <div class="modal-body">
                <div class="modal-tabs">${sections.map((s, i) => `<button class="modal-tab ${i === 0 ? "active" : ""}" data-tab="${s.section}">${s.section}</button>`).join("")}</div>
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
                            </div>`}).join("")}
                    </div>`).join("")}
                <button class="fsub-btn" id="m-sub" onclick="sendApp('${key}')" ${(isCooldown || isNotLoggedIn) ? "disabled" : ""}>
                    ${isCooldown ? "Cooldown aktywny" : (isNotLoggedIn ? "Zaloguj się" : "Wyślij Podanie")}
                </button>
                <div class="f-alert" id="m-alert"></div>
            </div>
        </div>`;

    // Podpięcie zdarzeń do pól (liczniki i zapis draftu)
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

    modalBox.querySelectorAll(".modal-tab").forEach(tab => {
        tab.onclick = () => {
            modalBox.querySelectorAll(".modal-tab").forEach(t => t.classList.remove("active"));
            modalBox.querySelectorAll(".modal-section").forEach(s => s.classList.remove("active"));
            tab.classList.add("active");
            modalBox.querySelector(`.modal-section[data-section="${tab.dataset.tab}"]`)?.classList.add("active");
        };
    });

    document.getElementById("modalBg").classList.add("show");
    document.body.style.overflow = "hidden";
}

async function sendApp(key) {
    // Sprawdzenie cooldownu przed wysłaniem
    if (await checkCooldownFromServer(key)) {
        alert("Masz aktywny cooldown!");
        return;
    }

    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (!user) return;

    const faction = FACTIONS.find(f => f.key === key);
    const alertEl = document.getElementById("m-alert");
    
    // Walidacja
    let missing = false;
    faction.questions.forEach(section => {
        section.items.forEach(q => {
            const el = document.getElementById(`m-${q.id}`);
            if (q.required && !el.value.trim()) missing = true;
        });
    });

    if (missing) {
        alertEl.textContent = "Uzupełnij wymagane pola.";
        return;
    }

    const fields = faction.questions.flatMap(s => s.items.map(q => ({
        name: `${s.section} • ${q.label}`,
        value: document.getElementById(`m-${q.id}`).value.trim() || "Brak"
    })));

    try {
        const res = await fetch('/api/apply', {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                key, 
                payload: { embeds: [{ title: "📋 Podanie", fields, thumbnail: { url: user.avatar } }] } 
            })
        });

        if (res.ok) {
            localStorage.removeItem(getDraftKey(key));
            alertEl.textContent = "Wysłano!";
            setTimeout(closeModal, 2000);
        }
    } catch (e) { alertEl.textContent = "Błąd wysyłania"; }
}

function closeModal() {
    document.getElementById("modalBg").classList.remove("show");
    document.body.style.overflow = "";
}