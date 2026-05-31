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

// Funkcja pobierająca pozostały czas (jeśli istnieje w localstorage, dla licznika)
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

async function openModal(key) {
    const faction = FACTIONS.find(f => f.key === key);
    if (!faction) return;

    // Pobieranie danych
    const user = JSON.parse(localStorage.getItem("user") || "null");
    const draft = JSON.parse(localStorage.getItem(getDraftKey(key)) || "{}");
    const modalBox = document.getElementById("modalBox");
    const sections = faction.questions || [];
    
    // Asynchroniczne sprawdzenie cooldownu
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
                    ${isCooldown ? "Cooldown aktywny" : (isNotLoggedIn ? "Zaloguj się" : "Wyślij Podanie")}
                </button>
                <div class="f-alert" id="m-alert"></div>
            </div>
        </div>
    `;

    // Inicjalizacja reszty
    const modalBg = document.getElementById("modalBg");
    modalBg.classList.remove("closing");
    modalBg.classList.add("show");
    document.body.style.overflow = "hidden";
    
    // Inicjalizacja zakładek
    modalBox.querySelectorAll(".modal-tab").forEach(tab => {
        tab.onclick = () => {
            const target = tab.dataset.tab;
            modalBox.querySelectorAll(".modal-tab").forEach(t => t.classList.remove("active"));
            modalBox.querySelectorAll(".modal-section").forEach(s => s.classList.remove("active"));
            tab.classList.add("active");
            modalBox.querySelector(`.modal-section[data-section="${target}"]`)?.classList.add("active");
        };
    });
}

async function sendApp(key) {
  if (hasCooldown(key)) return;

  const user = JSON.parse(localStorage.getItem("user") || "null");
  if (!user) return;

  const faction = FACTIONS.find(f => f.key === key);
  if (!faction) return;

  const alert = document.getElementById("m-alert");
  const btn = document.getElementById("m-sub");
  
  alert.textContent = "Wysyłanie...";
  alert.className = "f-alert";

  let missing = false;
  faction.questions.forEach(section => {
    section.items.forEach(q => {
      const el = document.getElementById(`m-${q.id}`);
      if (el) {
        el.classList.remove("err");
        if (q.required && !el.value.trim()) { 
          missing = true; 
          el.classList.add("err"); 
        }
      }
    });
  });

  if (missing) {
    alert.className = "f-alert err";
    alert.textContent = "Uzupełnij wszystkie wymagane pola.";
    return;
  }

  btn.disabled = true;

  const fields = [
      { name: "Użytkownik", value: `${user.username}`, inline: true },
      { name: "Discord ID", value: `${user.id}`, inline: true }
  ];

  faction.questions.forEach(section => {
    section.items.forEach(q => {
      const el = document.getElementById(`m-${q.id}`);
      fields.push({
        name: `${section.section} • ${q.label}`,
        value: el ? (el.value.trim() || "Brak") : "Brak"
      });
    });
  });

  try {
    const payload = {
      content: `<@&${faction.roleId}> 📥 Nowe podanie — **${faction.name}**`,
      embeds: [{
        title: "📋 Podanie",
        color: parseInt(faction.color.replace("#", ""), 16),
        thumbnail: { url: user.avatar },
        fields: fields,
        timestamp: new Date().toISOString()
      }]
    };

    // ZMIANA: Wysyłamy do naszego serwera, nie bezpośrednio do Discorda
    const res = await fetch('/api/apply', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, payload })
    });

    if (res.ok) {
      setCooldown(key);
      alert.className = "f-alert success";
      alert.textContent = "Podanie zostało wysłane!";
      btn.textContent = "Wysłano!";
      setTimeout(() => closeModal(), 3000);
    } else {
      throw new Error("Błąd podczas wysyłania");
    }
  } catch (err) {
    alert.className = "f-alert err";
    alert.textContent = "Błąd: " + err.message;
    btn.disabled = false;
  }
}

function closeModal() {
  if (cooldownInterval) {
    clearInterval(cooldownInterval);
    cooldownInterval = null;
  }
  const modalBg = document.getElementById("modalBg");
  modalBg.classList.add("closing");
  setTimeout(() => {
    modalBg.classList.remove("show");
    modalBg.classList.remove("closing");
    document.body.style.overflow = "";
  }, 300);
}