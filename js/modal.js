/* ───────── OPEN MODAL ───────── */

function openModal(key) {
  const faction = FACTIONS.find(f => f.key === key);
  if (!faction) return;

  const modalBox = document.getElementById("modalBox");
  const sections = faction.questions || [];

  modalBox.innerHTML = `
    <div class="modal-head">
      <div class="modal-icon">${faction.icon}</div>
      <div>
        <div class="modal-title">${faction.name} — Podanie</div>
        <div class="modal-subtitle">Formularz rekrutacyjny</div>
      </div>
      <button class="modal-close" onclick="closeModal()">✕</button>
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

              ${q.type === "textarea"
                ? `
                  <textarea
                    class="fta"
                    id="m-${q.id}"
                    ${q.required ? "required" : ""}
                  ></textarea>
                `
                : `
                  <input
                    class="fi"
                    id="m-${q.id}"
                    ${q.required ? "required" : ""}
                  >
                `
              }
            </div>
          `).join("")}
        </div>
      `).join("")}

      <button class="fsub-btn" id="m-sub" onclick="sendApp('${key}')">Wyślij Podanie</button>
      <div class="f-alert" id="m-alert"></div>
    </div>
  `;

  document.getElementById("modalBg").classList.add("show");
  document.body.style.overflow = "hidden";

  initTabs();
}

/* ───────── TABS, SEND, CLOSE ───────── */

function initTabs() {
  const modal = document.getElementById("modalBox");
  if (!modal) return;

  modal.querySelectorAll(".modal-tab").forEach(tab => {
    tab.onclick = () => {
      const target = tab.dataset.tab;

      modal.querySelectorAll(".modal-tab").forEach(t => t.classList.remove("active"));
      modal.querySelectorAll(".modal-section").forEach(s => s.classList.remove("active"));

      tab.classList.add("active");

      modal
        .querySelector(`.modal-section[data-section="${target}"]`)
        ?.classList.add("active");
    };
  });
}

async function sendApp(key) {
  const faction = FACTIONS.find(f => f.key === key);
  if (!faction) return;

  const alert = document.getElementById("m-alert");
  const btn = document.getElementById("m-sub");

  alert.textContent = "";
  alert.className = "f-alert";

  /* ───────── REQUIRED CHECK ───────── */

  let missing = false;

  faction.questions.forEach(section => {
    section.items.forEach(q => {
      const el = document.getElementById(`m-${q.id}`);

      if (!el) return;

      el.classList.remove("err");

      if (q.required && !el.value.trim()) {
        missing = true;
        el.classList.add("err");
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

  const fields = [];

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
      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({
        content: `<@&${faction.roleId}> 📥 Nowe podanie — **${faction.name}**`,
        embeds: [
          {
            title: "📋 Podanie",
            color: parseInt(faction.color.replace("#", ""), 16),
            fields,
            timestamp: new Date().toISOString()
          }
        ]
      })
    });

    if (res.ok || res.status === 204) {
      btn.textContent = "Wysłano ✓";
    } else {
      throw new Error();
    }

  } catch {
    alert.className = "f-alert err";
    alert.textContent = "Błąd wysyłki";

    btn.disabled = false;
    btn.textContent = "Wyślij";
  }
}

function closeModal() {
  document.getElementById("modalBg").classList.remove("show");
  document.body.style.overflow = "";
}
