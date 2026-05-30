/* ─── MODAL.JS — WERSJA BACKENDOWA ─────────────────────────── */
/* Podania idą przez /api/apply/:key — webhooki są tylko na serwerze. */

const APP_COOLDOWN_HOURS = 24;
let cooldownInterval = null;

function getCooldownKey(key) { return `appCooldown_${key}`; }
function getDraftKey(key)    { return `draft_${key}`; }

/* ── Cooldown helpers (serwer jest źródłem prawdy, localStorage to cache UI) ── */

function getCachedCooldownExpiry(key) {
  const saved = localStorage.getItem(getCooldownKey(key));
  if (!saved) return null;
  const expires = Number(saved);
  if (Date.now() > expires) { localStorage.removeItem(getCooldownKey(key)); return null; }
  return expires;
}

function hasCooldown(key) {
  return getCachedCooldownExpiry(key) !== null;
}

function getRemainingTime(key) {
  const expires = getCachedCooldownExpiry(key);
  if (!expires) return null;
  const diff = expires - Date.now();
  if (diff <= 0) return null;
  const hours   = Math.floor(diff / 1000 / 60 / 60);
  const minutes = Math.floor((diff / 1000 / 60) % 60);
  const seconds = Math.floor((diff / 1000) % 60);
  return `${hours}h ${minutes}m ${seconds}s`;
}

function setCooldownCache(key) {
  localStorage.removeItem(getDraftKey(key));
  const expires = Date.now() + APP_COOLDOWN_HOURS * 60 * 60 * 1000;
  localStorage.setItem(getCooldownKey(key), expires);
}

/* ── Synchronizacja cooldownu z serwerem ── */

async function syncCooldown(key) {
  try {
    const res = await fetch(`/api/cooldown/${key}`, { credentials: 'include' });
    const data = await res.json();
    if (data.cooldown && data.remainingMs) {
      const expires = Date.now() + data.remainingMs;
      localStorage.setItem(getCooldownKey(key), expires);
    } else {
      localStorage.removeItem(getCooldownKey(key));
    }
  } catch {}
}

function startCooldownUpdater(key) {
  if (cooldownInterval) clearInterval(cooldownInterval);

  cooldownInterval = setInterval(() => {
    const btn   = document.getElementById('m-sub');
    const alert = document.getElementById('m-alert');

    if (!btn || !alert) {
      clearInterval(cooldownInterval);
      cooldownInterval = null;
      return;
    }

    if (!hasCooldown(key)) {
      btn.disabled      = false;
      btn.textContent   = 'Wyślij Podanie';
      alert.className   = 'f-alert';
      alert.textContent = '';
      clearInterval(cooldownInterval);
      cooldownInterval  = null;
      return;
    }

    const remaining       = getRemainingTime(key);
    btn.textContent       = `Cooldown: ${remaining}`;
    alert.textContent     = `Możesz wysłać kolejne podanie za ${remaining}.`;
    btn.disabled          = true;
  }, 1000);
}

/* ── Otwarcie modalu ── */

async function openModal(key) {
  const faction = FACTIONS.find(f => f.key === key);
  if (!faction) return;

  // Synchronizujemy cooldown z serwerem przed otwarciem
  await syncCooldown(key);

  const user      = getUser(); // z auth.js
  const draft     = JSON.parse(localStorage.getItem(getDraftKey(key)) || '{}');
  const modalBox  = document.getElementById('modalBox');
  const sections  = faction.questions || [];
  const cooldown  = hasCooldown(key);
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
        ` : `<div class="login-msg">Aby uzupełnić podanie, musisz się zalogować.</div>`}
      </div>

      <div class="modal-body">
        <div class="modal-tabs">
          ${sections.map((s, i) => `<button class="modal-tab ${i === 0 ? 'active' : ''}" data-tab="${s.section}">${s.section}</button>`).join('')}
        </div>

        ${sections.map((s, i) => `
          <div class="modal-section ${i === 0 ? 'active' : ''}" data-section="${s.section}">
            ${s.items.map(q => {
              const val   = draft[q.id] || '';
              const limit = q.maxLength || 500;
              return `
              <div class="fg">
                <label class="fl">${q.label}${q.required ? ' *' : ''}</label>
                ${q.type === 'textarea'
                  ? `<textarea class="fta" id="m-${q.id}" maxlength="${limit}" ${q.required ? 'required' : ''} ${(cooldown || isNotLoggedIn) ? 'disabled' : ''}>${val}</textarea>`
                  : `<input type="text" class="fi" id="m-${q.id}" maxlength="${limit}" ${q.required ? 'required' : ''} ${(cooldown || isNotLoggedIn) ? 'disabled' : ''} value="${val}">`
                }
                <div class="char-counter" style="font-size: 11px; opacity: 0.5; text-align: right; margin-top: 4px;">
                  <span class="curr-len">${val.length}</span> / ${limit} znaków
                </div>
              </div>
            `}).join('')}
          </div>
        `).join('')}

        <button class="fsub-btn" id="m-sub" onclick="sendApp('${key}')" ${(cooldown || isNotLoggedIn) ? 'disabled' : ''}>
          ${cooldown ? `Cooldown: ${remaining}` : (isNotLoggedIn ? 'Zaloguj się' : 'Wyślij Podanie')}
        </button>

        <div class="f-alert" id="m-alert">
          ${cooldown ? `Możesz wysłać kolejne podanie za ${remaining}.` : ''}
        </div>
      </div>
    </div>
  `;

  modalBox.querySelectorAll('.fi, .fta').forEach(el => {
    el.addEventListener('input', (e) => {
      const field      = e.target;
      const parent     = field.closest('.fg');
      const counterSpan = parent.querySelector('.curr-len');
      const max        = parseInt(field.getAttribute('maxlength'));
      const currentLen = field.value.length;

      counterSpan.textContent = currentLen;
      if (currentLen > max * 0.9) parent.querySelector('.char-counter').classList.add('limit-reached');
      else parent.querySelector('.char-counter').classList.remove('limit-reached');

      const currentDraft = JSON.parse(localStorage.getItem(getDraftKey(key)) || '{}');
      currentDraft[field.id.replace('m-', '')] = field.value;
      localStorage.setItem(getDraftKey(key), JSON.stringify(currentDraft));
    });
  });

  const modalBg = document.getElementById('modalBg');
  modalBg.classList.remove('closing');
  modalBg.classList.add('show');
  document.body.style.overflow = 'hidden';
  initTabs();
  if (cooldown) startCooldownUpdater(key);
}

function initTabs() {
  const modal = document.getElementById('modalBox');
  if (!modal) return;
  modal.querySelectorAll('.modal-tab').forEach(tab => {
    tab.onclick = () => {
      const target = tab.dataset.tab;
      modal.querySelectorAll('.modal-tab').forEach(t => t.classList.remove('active'));
      modal.querySelectorAll('.modal-section').forEach(s => s.classList.remove('active'));
      tab.classList.add('active');
      modal.querySelector(`.modal-section[data-section="${target}"]`)?.classList.add('active');
    };
  });
}

/* ── Wysyłanie podania przez backend ── */

async function sendApp(key) {
  const user = getUser();
  if (!user) return;

  const faction = FACTIONS.find(f => f.key === key);
  if (!faction) return;

  const alertEl = document.getElementById('m-alert');
  const btn     = document.getElementById('m-sub');

  alertEl.textContent = 'Wysyłanie...';
  alertEl.className   = 'f-alert';

  // Walidacja pól
  let missing = false;
  faction.questions.forEach(section => {
    section.items.forEach(q => {
      const el = document.getElementById(`m-${q.id}`);
      if (el) {
        el.classList.remove('err');
        if (q.required && !el.value.trim()) {
          missing = true;
          el.classList.add('err');
        }
      }
    });
  });

  if (missing) {
    alertEl.className   = 'f-alert err';
    alertEl.textContent = 'Uzupełnij wszystkie wymagane pola.';
    return;
  }

  btn.disabled = true;

  // Zbieramy pola (bez danych użytkownika — serwer je dodaje sam)
  const fields = [];
  faction.questions.forEach(section => {
    section.items.forEach(q => {
      const el = document.getElementById(`m-${q.id}`);
      fields.push({
        name:  `${section.section} • ${q.label}`,
        value: el ? (el.value.trim() || 'Brak') : 'Brak'
      });
    });
  });

  try {
    // Wysyłamy do naszego backendu — nie bezpośrednio do webhooka Discord
    const res = await fetch(`/api/apply/${key}`, {
      method:      'POST',
      credentials: 'include',
      headers:     { 'Content-Type': 'application/json' },
      body:        JSON.stringify({
        fields,
        factionName:  faction.name,
        factionColor: faction.color
      })
    });

    const data = await res.json();

    if (res.ok) {
      setCooldownCache(key);
      startCooldownUpdater(key);
      alertEl.className   = 'f-alert success';
      alertEl.textContent = 'Podanie zostało wysłane!';
      btn.textContent     = 'Wysłano!';
      setTimeout(() => closeModal(), 3000);
    } else if (res.status === 429) {
      // Cooldown z serwera
      alertEl.className   = 'f-alert err';
      alertEl.textContent = 'Cooldown nadal trwa. Spróbuj ponownie za jakiś czas.';
      btn.disabled        = true;
      await syncCooldown(key);
      startCooldownUpdater(key);
    } else {
      throw new Error(data.error || `Status ${res.status}`);
    }

  } catch (err) {
    alertEl.className   = 'f-alert err';
    alertEl.textContent = 'Błąd: ' + err.message;
    btn.disabled        = false;
  }
}

function closeModal() {
  if (cooldownInterval) {
    clearInterval(cooldownInterval);
    cooldownInterval = null;
  }
  const modalBg = document.getElementById('modalBg');
  modalBg.classList.add('closing');
  setTimeout(() => {
    modalBg.classList.remove('show');
    modalBg.classList.remove('closing');
    document.body.style.overflow = '';
  }, 300);
}
