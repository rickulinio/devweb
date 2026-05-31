/* ───────── OPEN MODAL ───────── */

const APP_COOLDOWN_HOURS = 24;
let cooldownInterval = null;

function getDraftKey(key) { return `draft_${key}`; }

// --- NOWA LOGIKA BAZY DANYCH ---
async function checkCooldownFromServer(key) {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  if (!user) return { hasCooldown: false, remaining: null };
  try {
    const res = await fetch(`/api/check-cooldown/${user.id}/${key}`);
    return await res.json(); // Zwraca { hasCooldown: bool, remaining: "1h 30m..." }
  } catch (e) { return { hasCooldown: false, remaining: null }; }
}

async function startCooldownUpdater(key) {
  if (cooldownInterval) clearInterval(cooldownInterval);
  cooldownInterval = setInterval(async () => {
    const btn = document.getElementById("m-sub");
    const alert = document.getElementById("m-alert");
    if (!btn || !alert) { clearInterval(cooldownInterval); cooldownInterval = null; return; }

    const cd = await checkCooldownFromServer(key);
    if (!cd.hasCooldown) {
      btn.disabled = false;
      btn.textContent = "Wyślij Podanie";
      alert.className = "f-alert";
      alert.textContent = "";
      clearInterval(cooldownInterval);
      cooldownInterval = null;
      return;
    }
    btn.textContent = `Cooldown: ${cd.remaining}`;
    alert.textContent = `Możesz wysłać kolejne podanie za ${cd.remaining}.`;
    btn.disabled = true;
  }, 1000);
}

async function openModal(key) {
  const faction = FACTIONS.find(f => f.key === key);
  if (!faction) return;

  const user = JSON.parse(localStorage.getItem("user") || "null");
  const draft = JSON.parse(localStorage.getItem(getDraftKey(key)) || "{}");
  const modalBox = document.getElementById("modalBox");
  const sections = faction.questions || [];
  
  const cd = await checkCooldownFromServer(key);
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
                  ? `<textarea class="fta" id="m-${q.id}" maxlength="${limit}" ${q.required ? "required" : ""} ${(cd.hasCooldown || isNotLoggedIn) ? "disabled" : ""}>${val}</textarea>`
                  : `<input type="text" class="fi" id="m-${q.id}" maxlength="${limit}" ${q.required ? "required" : ""} ${(cd.hasCooldown || isNotLoggedIn) ? "disabled" : ""} value="${val}">`
                }
                <div class="char-counter ${val.length > limit * 0.9 ? 'limit-reached' : ''}" style="font-size: 11px; opacity: 0.5; text-align: right; margin-top: 4px;">
                  <span class="curr-len">${val.length}</span> / ${limit} znaków
                </div>
              </div>
            `}).join("")}
          </div>
        `).join("")}
        <button class="fsub-btn" id="m-sub" onclick="sendApp('${key}')" ${(cd.hasCooldown || isNotLoggedIn) ? "disabled" : ""}>
          ${cd.hasCooldown ? `Cooldown: ${cd.remaining}` : (isNotLoggedIn ? "Zaloguj się" : "Wyślij Podanie")}
        </button>
        <div class="f-alert" id="m-alert">${cd.hasCooldown ? `Możesz wysłać kolejne podanie za ${cd.remaining}.` : ""}</div>
      </div>
    </div>
  `;

  modalBox.querySelectorAll('.fi, .fta').forEach(el => {
    el.addEventListener('input', (e) => {
      const field = e.target;
      const parent = field.closest('.fg');
      const counterSpan = parent.querySelector('.curr-len');
      const max = parseInt(field.getAttribute('maxlength'));
      const currentLen = field.value.length;
      counterSpan.textContent = currentLen;
      if (currentLen > max * 0.9) parent.querySelector('.char-counter').classList.add('limit-reached');
      else parent.querySelector('.char-counter').classList.remove('limit-reached');
      
      const draft = JSON.parse(localStorage.getItem(getDraftKey(key)) || "{}");
      draft[field.id.replace('m-', '')] = field.value;
      localStorage.setItem(getDraftKey(key), JSON.stringify(draft));
    });
  });

  const modalBg = document.getElementById("modalBg");
  modalBg.classList.add("show");
  document.body.style.overflow = "hidden";
  initTabs();
  if (cd.hasCooldown) startCooldownUpdater(key);
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
  const cd = await checkCooldownFromServer(key);
  if (cd.hasCooldown) { alert("Cooldown nadal trwa!"); return; }

  const user = JSON.parse(localStorage.getItem("user") || "null");
  const faction = FACTIONS.find(f => f.key === key);
  const alertEl = document.getElementById("m-alert");
  const btn = document.getElementById("m-sub");
  
  let missing = false;
  faction.questions.forEach(section => {
    section.items.forEach(q => {
      const el = document.getElementById(`m-${q.id}`);
      el.classList.remove("err");
      if (q.required && !el.value.trim()) { missing = true; el.classList.add("err"); }
    });
  });

  if (missing) { alertEl.className = "f-alert err"; alertEl.textContent = "Uzupełnij wymagane pola."; return; }

  btn.disabled = true;
  const fields = faction.questions.flatMap(s => s.items.map(q => ({
    name: `${s.section} • ${q.label}`,
    value: document.getElementById(`m-${q.id}`).value.trim() || "Brak"
  })));

  try {
    const res = await fetch('/api/apply', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, payload: { fields, thumbnail: { url: user.avatar } } })
    });

    if (res.ok) {
      localStorage.removeItem(getDraftKey(key));
      alertEl.className = "f-alert success";
      alertEl.textContent = "Podanie wysłane!";
      setTimeout(() => closeModal(), 3000);
    } else throw new Error("Błąd serwera");
  } catch (err) { alertEl.className = "f-alert err"; alertEl.textContent = err.message; btn.disabled = false; }
}

function closeModal() {
  if (cooldownInterval) { clearInterval(cooldownInterval); cooldownInterval = null; }
  const modalBg = document.getElementById("modalBg");
  modalBg.classList.add("closing");
  setTimeout(() => { modalBg.classList.remove("show", "closing"); document.body.style.overflow = ""; }, 300);
}