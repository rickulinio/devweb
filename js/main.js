/* ================= HELPER ================= */
const $ = (id) => document.getElementById(id);

/* ================= INICJALIZACJA ================= */
window.addEventListener("DOMContentLoaded", () => {
    initLoader();
    initFactions();
    initTeam();
    initNav();
    initReveal();
    initRules();
    initKeybinds();
    initMobileMenu();
    initCursorAndMagnetic();
    initParticles();
    updateAuthUI();
    updateAdminUI();
});

/* ================= ZARZĄDZANIE UI ================= */
function updateAdminUI() {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    const adminBtn = $("adminPanelBtn");
    const loginBtn = $("loginBtn");

    if (user && typeof CONFIG !== 'undefined' && CONFIG.admins[user.id]) {
        if (adminBtn) adminBtn.style.display = "inline-flex";
        if (loginBtn) loginBtn.style.display = "none";
    }
}

/* ================= FUNKCJE SEKCJI ================= */
function initLoader() {
    const loader = $("loader");
    if (!loader) return;
    
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.floor(Math.random() * 8) + 2;
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            setTimeout(() => { loader.style.opacity = "0"; loader.style.pointerEvents = "none"; }, 400);
        }
    }, 70);
}

function initFactions() {
    const fg = $("factions-grid");
    if (fg && typeof FACTIONS !== 'undefined') {
        FACTIONS.forEach(f => {
            const el = document.createElement("div");
            el.className = "faction-card reveal";
            el.style.setProperty("--fc", f.color);
            el.innerHTML = `
                <div class="fc-top"><div class="fc-icon">${f.icon}</div><div class="fc-name">${f.name}</div></div>
                <p class="fc-desc">${f.desc}</p>
                <button class="fc-cta ${!f.status ? 'btn-disabled' : ''}" 
                    onclick="${f.status ? `openModal('${f.key}')` : 'alert(\'Rekrutacja zamknięta\')'}">
                    ${f.status ? 'Złóż Podanie →' : 'Zamknięte'}
                </button>
            `;
            fg.appendChild(el);
        });
    }
}

function initTeam() {
    const tg = $("team-grid");
    if (tg && typeof TEAM !== 'undefined') {
        TEAM.forEach(m => {
            const div = document.createElement("div");
            div.className = "team-card reveal";
            div.innerHTML = `<img src="${m.image}" class="team-av"><div class="team-name">${m.name}</div><div class="team-role">${m.role}</div>`;
            tg.appendChild(div);
        });
    }
}

function initNav() {
    window.addEventListener("scroll", () => {
        const nav = $("nav");
        if (nav) nav.classList.toggle("scrolled", scrollY > 20);
    });
}

function initReveal() {
    const obs = new IntersectionObserver((entries) => {
        entries.forEach((e, i) => {
            if (e.isIntersecting) setTimeout(() => e.target.classList.add("visible"), i * 60);
        });
    }, { threshold: 0.08 });
    document.querySelectorAll(".reveal").forEach(el => obs.observe(el));
}

function initRules() {
    const ruleItems = document.querySelectorAll(".rule-item");
    if (!ruleItems.length) return;
    const obs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                document.querySelectorAll(".rule-title").forEach(t => t.classList.remove("active"));
                entry.target.querySelector(".rule-title")?.classList.add("active");
            }
        });
    }, { threshold: 0.6 });
    ruleItems.forEach(item => obs.observe(item));
}

function initKeybinds() {
    document.querySelectorAll(".key").forEach(key => {
        key.addEventListener("click", () => {
            key.classList.toggle("show");
            setTimeout(() => key.classList.remove("show"), 1600);
        });
    });
}

function initMobileMenu() {
    const navToggle = $("navToggle");
    const mobileMenu = $("mobileMenu");
    const mobileOverlay = $("mobileOverlay");
    navToggle?.addEventListener("click", () => {
        mobileMenu?.classList.toggle("active");
        mobileOverlay?.classList.toggle("active");
    });
    mobileOverlay?.addEventListener("click", () => {
        mobileMenu?.classList.remove("active");
        mobileOverlay?.classList.remove("active");
    });
}

function initCursorAndMagnetic() {
    const glow = document.querySelector(".cursor-glow");
    if (glow) window.addEventListener("mousemove", e => glow.animate({ left: `${e.clientX}px`, top: `${e.clientY}px` }, { duration: 300, fill: "forwards" }));
    document.querySelectorAll(".btn-lg").forEach(btn => {
        btn.addEventListener("mousemove", e => {
            const r = btn.getBoundingClientRect();
            btn.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.12}px, ${(e.clientY - r.top - r.height / 2) * 0.18}px)`;
        });
        btn.addEventListener("mouseleave", () => btn.style.transform = "");
    });
}

function initParticles() {
    const canvas = $("particles");
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    // (Logika particles z Twojego starego kodu...)
}

function updateAuthUI() {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    const loginBtn = $("loginBtn");
    const userBox = $("user");
    if (user && userBox) {
        if (loginBtn) loginBtn.style.display = "none";
        userBox.innerHTML = `<img src="${user.avatar}" class="user-avatar" style="width:40px; border-radius:50%; cursor:pointer;">`;
    }
}