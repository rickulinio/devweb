/* ─── MODAL.JS — cooldown wyłącznie po stronie serwera ─────── */

let cooldownInterval = null;

function getDraftKey(key) { return `draft_${key}`; }

/* ── Cooldown: pyta serwer, zwraca { cooldown, remainingMs } ── */
async function fetchCooldown(key) {
  try {
    const res  = await fetch(`/api/cooldown/${key}`, { credentials: 'include' });
    return await res.json(); // { cooldown: bool, remainingMs?: number }
  } catch {
    return { cooldown: false };
  }
}

function msToReadable(ms) {
  if (!ms || ms <= 0) return null;
  const hours   = Math.floor(ms / 1000 / 60 / 60);
  const minutes = Math.floor((ms / 1000 / 60) % 60);
  const seconds = Math.floor((ms / 1000) % 60);
  return `${hours}h ${minutes}m ${seconds}s`;
}

function startCooldownUpdater(key, initialMs) {
  if (cooldownInterval) clearInterval(cooldownInterval);

  let remaining = initialMs;

  cooldownInterval = setInterval(() => {
    const btn   = document.getElementById('m-sub');
    const alertEl = document.getElementById('m-alert');

    if (!btn || !alertEl) { clearInterval(cooldownInterval); cooldownInterval = null; return; }

    remaining -= 1000;
    if (remaining <= 0) {
      btn.disabled      = false;
      btn.textContent   = 'Wyślij Podanie';
      alertEl.className = 'f-alert';
      alertEl.textContent = '';
      clearInterval(cooldownInterval);
      cooldownInterval = null;
      return;
    }

    const readable       = msToReadable(remaining);
    btn.textContent      = `Cooldown: ${readable}`;
    btn.disabled         = true;
    alertEl.textContent  = `Możesz wysłać kolejne podanie za ${readable}.`;
  }, 1000);
}

/* ── Otwarcie modalu ── */
async function openModal(key) {
  const faction = FACTIONS.find(f => f.key === key);
  if (!faction) return;

  const user = getUser();
  const draft = JSON.parse(localStorage.getItem(getDraftKey(key)) || '{}');
  const modalBox = document.getElementById('modalBox');
  const sections = faction.questions || [];
  const isNotLoggedIn = !user;

  // Pobieramy cooldown z serwera
  const { cooldown, remainingMs } = await fetchCooldown(key);
  const remaining = msToReadable(remainingMs);

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
              const dis   = (cooldown || isNotLoggedIn) ? 'disabled' : '';
              return `
              <div class="fg">
                <label class="fl">${q.label}${q.required ? ' *' : ''}</label>
                ${q.type === 'textarea'
                  ? `<textarea class="fta" id="m-${q.id}" maxlength="${limit}" ${q.required ? 'required' : ''} ${dis}>${val}</textarea>`
                  : `<input type="text" class="fi" id="m-${q.id}" maxlength="${limit}" ${q.required ? 'required' : ''} ${dis} value="${val}">`
                }
                <div class="char-counter" style="font-size:11px;opacity:.5;text-align:right;margin-top:4px;">
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

  // Autosave draft
  modalBox.querySelectorAll('.fi, .fta').forEach(el => {
    el.addEventListener('input', e => {
      const field = e.target;
      const parent = field.closest('.fg');
      const counterSpan = parent.querySelector('.curr-len');
      const max = parseInt(field.getAttribute('maxlength'));
      counterSpan.textContent = field.value.length;
      parent.querySelector('.char-counter').classList.toggle('limit-reached', field.value.length > max * 0.9);

      const d = JSON.parse(localStorage.getItem(getDraftKey(key)) || '{}');
      d[field.id.replace('m-', '')] = field.value;
      localStorage.setItem(getDraftKey(key), JSON.stringify(d));
    });
  });

  const modalBg = document.getElementById('modalBg');
  modalBg.classList.remove('closing');
  modalBg.classList.add('show');
  document.body.style.overflow = 'hidden';
  initTabs();

  if (cooldown && remainingMs) startCooldownUpdater(key, remainingMs);
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

/* ── Wysyłanie podania ── */
async function sendApp(key) {
  const user = getUser();
  if (!user) return;

  const faction = FACTIONS.find(f => f.key === key);
  if (!faction) return;

  const alertEl = document.getElementById('m-alert');
  const btn     = document.getElementById('m-sub');

  alertEl.textContent = 'Wysyłanie...';
  alertEl.className   = 'f-alert';

  let missing = false;
  faction.questions.forEach(section => {
    section.items.forEach(q => {
      const el = document.getElementById(`m-${q.id}`);
      if (el) {
        el.classList.remove('err');
        if (q.required && !el.value.trim()) { missing = true; el.classList.add('err'); }
      }
    });
  });

  if (missing) {
    alertEl.className   = 'f-alert err';
    alertEl.textContent = 'Uzupełnij wszystkie wymagane pola.';
    return;
  }

  btn.disabled = true;

  const fields = [];
  faction.questions.forEach(section => {
    section.items.forEach(q => {
      const el = document.getElementById(`m-${q.id}`);
      fields.push({ name: `${section.section} • ${q.label}`, value: el ? (el.value.trim() || 'Brak') : 'Brak' });
    });
  });

  try {
    const res = await fetch(`/api/apply/${key}`, {
      method:      'POST',
      credentials: 'include',
      headers:     { 'Content-Type': 'application/json' },
      body:        JSON.stringify({ fields, factionName: faction.name, factionColor: faction.color })
    });

    const data = await res.json();

    if (res.ok) {
      localStorage.removeItem(getDraftKey(key)); // czyścimy draft po sukcesie
      alertEl.className   = 'f-alert success';
      alertEl.textContent = 'Podanie zostało wysłane!';
      btn.textContent     = 'Wysłano!';

      // Pobieramy cooldown z serwera i startujemy licznik
      const { remainingMs } = await fetchCooldown(key);
      if (remainingMs) startCooldownUpdater(key, remainingMs);

      setTimeout(() => closeModal(), 3000);

    } else if (res.status === 429) {
      alertEl.className   = 'f-alert err';
      alertEl.textContent = 'Cooldown nadal trwa.';
      const { remainingMs } = await fetchCooldown(key);
      if (remainingMs) startCooldownUpdater(key, remainingMs);

    } else {
      throw new Error(data.error || `Status ${res.status}`);
    }

  } catch (err) {
    alertEl.className   = 'f-alert err';
    alertEl.textContent = 'Błąd: ' + err.message;
    btn.disabled = false;
  }
}

function closeModal() {
  if (cooldownInterval) { clearInterval(cooldownInterval); cooldownInterval = null; }
  const modalBg = document.getElementById('modalBg');
  modalBg.classList.add('closing');
  setTimeout(() => {
    modalBg.classList.remove('show');
    modalBg.classList.remove('closing');
    document.body.style.overflow = '';
  }, 300);
}
