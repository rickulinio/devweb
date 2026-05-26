/* ───────── OPEN MODAL ───────── */

const APP_COOLDOWN_HOURS = 24;
let cooldownInterval = null;

function getCooldownKey(key) { return `appCooldown_${key}`; }

function hasCooldown(key) {
  const saved = localStorage.getItem(getCooldownKey(key));
  if (!saved) return false;
  const expires = Number(saved);
  if (Date.now() > expires) { localStorage.removeItem(getCooldownKey(key)); return false; }
  return true;
}

function getRemainingTime(key) {
  const saved = localStorage.getItem(getCooldownKey(key));
  if (!saved) return null;
  const diff = Number(saved) - Date.now();
  if (diff <= 0) return null;
  const hours = Math.floor(diff / 1000 / 60 / 60);
  const minutes = Math.floor((diff / 1000 / 60) % 60);
  const seconds = Math.floor((diff / 1000) % 60);
  return `${hours}h ${minutes}m ${seconds}s`;
}

function setCooldown(key) {
  const expires = Date.now() + APP_COOLDOWN_HOURS * 60 * 60 * 1000;
  localStorage.setItem(getCooldownKey(key), expires);
}

function startCooldownUpdater(key) {
  clearInterval(cooldownInterval);
  cooldownInterval = setInterval(() => {
    const btn = document.getElementById("m-sub");
    const alert = document.getElementById("m-alert");
    if (!btn || !alert) { clearInterval(cooldownInterval); return; }
    if (!hasCooldown(key)) {
      btn.disabled = false;
      btn.textContent = "Wyślij Podanie";
      alert.className = "f-alert";
      alert.textContent = "";
      clearInterval(cooldownInterval);
      return;
    }
    const remaining = getRemainingTime(key);
    btn.textContent = `Cooldown: ${remaining}`;
    alert.textContent = `Możesz wysłać kolejne podanie za ${remaining}.`;
  }, 1000);
}

function openModal(key) {
  const faction = FACTIONS.find(f => f.key === key);
  if (!faction) return;

  const user = JSON.parse(localStorage.getItem("user") || "null");
  const modalBox = document.getElementById("modalBox");
  const sections = faction.questions || [];
  const cooldown = hasCooldown(key);
  const remaining = getRemainingTime(key);
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
        ` : `
          <div class="login-msg">Aby uzupełnić podanie, musisz się zalogować.</div>
        `}
      </div>

      <div class="modal-body">
        <div class="modal-tabs">
          ${sections.map((s, i) => `<button class="modal-tab ${i === 0 ? "active" : ""}" data-tab="${s.section}">${s.section}</button>`).join("")}
        </div>

        ${sections.map((s, i) => `
          <div class="modal-section ${i === 0 ? "active" : ""}" data-section="${s.section}">
            ${s.items.map(q => `
              <div class="fg">
                <label class="fl">${q.label}${q.required ? " *" : ""}</label>
                <${q.type === "textarea" ? "textarea" : "input"}
                  class="${q.type === "textarea" ? "fta" : "fi"}"
                  id="m-${q.id}"
                  ${q.required ? "required" : ""}
                  ${(cooldown || isNotLoggedIn) ? "disabled" : ""}
                ></${q.type === "textarea" ? "textarea" : "input"}>
              </div>
            `).join("")}
          </div>
        `).join("")}

        <button class="fsub-btn" id="m-sub" onclick="sendApp('${key}')" ${(cooldown || isNotLoggedIn) ? "disabled" : ""}>
          ${cooldown ? `Cooldown: ${remaining}` : (isNotLoggedIn ? "Zaloguj się" : "Wyślij Podanie")}
        </button>

        <div class="f-alert" id="m-alert">
          ${cooldown ? `Możesz wysłać kolejne podanie za ${remaining}.` : ""}
        </div>
      </div>
    </div>
  `;

  const modalBg = document.getElementById("modalBg");
  modalBg.classList.remove("closing");
  modalBg.classList.add("show");
  document.body.style.overflow = "hidden";
  initTabs();
  if (cooldown) startCooldownUpdater(key);
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
  const user = JSON.parse(localStorage.getItem("user") || "null");
  if (!user || hasCooldown(key)) return;

  const faction = FACTIONS.find(f => f.key === key);
  if (!faction) return;

  const alert = document.getElementById("m-alert");
  const btn = document.getElementById("m-sub");

  alert.textContent = "";
  alert.className = "f-alert";

  let missing = false;
  faction.questions.forEach(section => {
    section.items.forEach(q => {
      const el = document.getElementById(`m-${q.id}`);
      if (el) {
        el.classList.remove("err");
        if (q.required && !el.value.trim()) { missing = true; el.classList.add("err"); }
      }
    });
  });

  if (missing) {
    alert.className = "f-alert err";
    alert.textContent = "Uzupełnij wszystkie wymagane pola.";
    return;
  }

  btn.disabled = true;
  btn.textContent = "Wysyłanie...";

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
    const res = await fetch(faction.webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: `<@&${faction.roleId}> 📥 Nowe podanie — **${faction.name}**`,
        embeds: [{
          title: "📋 Podanie",
          color: parseInt(faction.color.replace("#", ""), 16),
          thumbnail: { url: user.avatar },
          fields,
          timestamp: new Date().toISOString()
        }]
      })
    });

    if (res.ok || res.status === 204) {
      setCooldown(key);
      alert.className = "f-alert success";
      alert.textContent = "Podanie zostało wysłane.";
      setTimeout(() => closeModal(), 5000);
    } else { throw new Error(); }
  } catch {
    alert.className = "f-alert err";
    alert.textContent = "Błąd wysyłki";
    btn.disabled = false;
    btn.textContent = "Wyślij Podanie";
  }
}

function closeModal() {
  const modalBg = document.getElementById("modalBg");
  modalBg.classList.add("closing");
  setTimeout(() => {
    modalBg.classList.remove("show");
    modalBg.classList.remove("closing");
    document.body.style.overflow = "";
  }, 300);
}