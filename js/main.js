let progress = 0;

const progressText = document.querySelector(".loader-progress-text");
const loader = document.getElementById("loader");

const interval = setInterval(() => {
  progress += Math.floor(Math.random() * 8) + 2;

  if (progress >= 100) {
    progress = 100;
    clearInterval(interval);

    setTimeout(() => {
      if (loader) {
        loader.style.opacity = "0";
        loader.style.pointerEvents = "none";
      }
    }, 400);
  }

  if (progressText) {
    progressText.textContent = progress + "%";
  }
}, 70);

window.addEventListener("load", () => {
  setTimeout(() => {
    document.getElementById("loader")?.classList.add("hide");
  }, 1500);
});

/* ================= HELPER ================= */
const $ = (id) => document.getElementById(id);

/* ================= FACTIONS ================= */
const fg = $("factions-grid");

if (fg && Array.isArray(FACTIONS)) {
  FACTIONS.forEach(f => {
    const el = document.createElement("div");
    el.className = "faction-card reveal";
    el.style.setProperty("--fc", f.color);

    el.innerHTML = `
      <div class="fc-top">
        <div class="fc-icon">${f.icon}</div>
        <div class="fc-name">${f.name}</div>
      </div>

      <p class="fc-desc">${f.desc}</p>

      <button
        class="fc-cta"
        style="background:${f.color}18;border-color:${f.color}30;"
        onclick="openModal('${f.key}')"
      >
        Złóż Podanie →
      </button>
    `;

    fg.appendChild(el);
  });
}

/* ================= TEAM ================= */
const tg = $("team-grid");

if (tg && Array.isArray(TEAM)) {
  TEAM.forEach(m => {
    const div = document.createElement("div");
    div.className = "team-card reveal";

    div.innerHTML = `
      <img src="${m.image}" class="team-av">
      <div class="team-name">${m.name}</div>
      <div class="team-role">${m.role}</div>
    `;

    tg.appendChild(div);
  });
}

/* ================= NAV ================= */
window.addEventListener("scroll", () => {
  const nav = $("nav");
  if (nav) nav.classList.toggle("scrolled", scrollY > 20);
});

/* ================= COUNTERS ================= */
function countUp(el, to, dur) {
  if (!el) return;

  let v = 0;
  const step = to / (dur / 16);

  const t = setInterval(() => {
    v = Math.min(v + step, to);
    el.textContent = Math.floor(v);
    if (v >= to) clearInterval(t);
  }, 16);
}

setTimeout(() => {
  countUp($("s-players"), 47, 1200);
  countUp($("s-discord"), 1284, 1800);
}, 300);

/* ================= REVEAL ================= */
const obs = new IntersectionObserver((entries) => {
  entries.forEach((e, i) => {
    if (e.isIntersecting) {
      setTimeout(() => e.target.classList.add("visible"), i * 60);
    }
  });
}, { threshold: 0.08 });

document.querySelectorAll(".reveal").forEach(el => obs.observe(el));

/* ================= RULES ================= */
const ruleItems = document.querySelectorAll(".rule-item");

if (ruleItems.length) {
  const ruleObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        document.querySelectorAll(".rule-title")
          .forEach(t => t.classList.remove("active"));

        entry.target.querySelector(".rule-title")?.classList.add("active");
      }
    });
  }, { threshold: 0.6 });

  ruleItems.forEach(item => ruleObserver.observe(item));
}

/* ================= KEY ================= */
document.querySelectorAll(".key").forEach(key => {
  key.addEventListener("click", () => {
    key.classList.toggle("show");
    setTimeout(() => key.classList.remove("show"), 1600);
  });
});

/* ================= MOBILE MENU ================= */
const navToggle = $("navToggle");
const mobileMenu = $("mobileMenu");
const mobileOverlay = $("mobileOverlay");

function openMenu() {
  mobileMenu?.classList.add("active");
  mobileOverlay?.classList.add("active");
  if (navToggle) navToggle.textContent = "✕";
}

function closeMenu() {
  mobileMenu?.classList.remove("active");
  mobileOverlay?.classList.remove("active");
  if (navToggle) navToggle.textContent = "☰";
}

navToggle?.addEventListener("click", () => {
  mobileMenu?.classList.contains("active") ? closeMenu() : openMenu();
});

mobileOverlay?.addEventListener("click", closeMenu);

document.querySelectorAll(".mobile-menu a").forEach(a => {
  a.addEventListener("click", closeMenu);
});

/* ================= CURSOR ================= */
const glow = document.querySelector(".cursor-glow");

if (glow) {
  window.addEventListener("mousemove", e => {
    glow.animate({
      left: `${e.clientX}px`,
      top: `${e.clientY}px`
    }, { duration: 300, fill: "forwards" });
  });
}

/* ================= MAGNETIC ================= */
document.querySelectorAll(".btn-lg").forEach(btn => {
  btn.addEventListener("mousemove", e => {
    const r = btn.getBoundingClientRect();
    const x = e.clientX - r.left - r.width / 2;
    const y = e.clientY - r.top - r.height / 2;

    btn.style.transform = `translate(${x * 0.12}px, ${y * 0.18}px)`;
  });

  btn.addEventListener("mouseleave", () => {
    btn.style.transform = "";
  });
});

/* ================= AUTH UI ================= */
/* ================= AUTH UI ================= */
function getUser() {
  const raw = localStorage.getItem("user");

  if (!raw || raw === "undefined" || raw === "null") {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function logout() {
  localStorage.removeItem("user");

  updateAuthUI();
  window.dispatchEvent(new Event("auth:update"));

  setTimeout(() => {
    window.location.reload();
  }, 100);
}

function updateAuthUI() {
  const user = getUser();

  const loginBtn = $("loginBtn");
  const userBox = $("user");

  if (!user || !user.id) {
    if (loginBtn) loginBtn.style.display = "inline-flex";
    if (userBox) userBox.innerHTML = "";
    return;
  }

  if (loginBtn) loginBtn.style.display = "none";

  if (userBox) {
    userBox.innerHTML = `
      <div class="user-dropdown" id="userDropdown">

        <div class="user-trigger" id="userTrigger">
          <img
            src="${user.avatar}"
            class="user-avatar"
            alt="${user.username}"
          >
        </div>

        <div class="user-menu">
          <button id="logoutBtn" class="logout-btn">
            Wyloguj
          </button>
        </div>

      </div>
    `;

    const dropdown = document.getElementById("userDropdown");
    const trigger = document.getElementById("userTrigger");
    const logoutBtn = document.getElementById("logoutBtn");

    // OPEN / CLOSE dropdown
    trigger?.addEventListener("click", (e) => {
      e.stopPropagation();
      dropdown.classList.toggle("active");
    });

    // klik poza = zamyka
    document.addEventListener("click", () => {
      dropdown?.classList.remove("active");
    });

    // STOP bubbling na menu
    document.querySelector(".user-menu")?.addEventListener("click", (e) => {
      e.stopPropagation();
    });

    // LOGOUT
    logoutBtn?.addEventListener("click", (e) => {
      e.stopPropagation();
      logout();
    });
  }
}

/* AUTO SAVE USER FROM URL PARAMS */

updateAuthUI();

window.addEventListener("auth:update", () => {
  setTimeout(updateAuthUI, 50);
});

window.addEventListener("storage", (e) => {
  if (e.key === "user") {
    updateAuthUI();
  }
});

/* ================= PARTICLES ================= */
const canvas = document.getElementById("particles");
const ctx = canvas?.getContext("2d");

if (canvas && ctx) {

  let mouse = { x: null, y: null };

  window.addEventListener("mousemove", e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  window.addEventListener("mouseleave", () => {
    mouse.x = null;
    mouse.y = null;
  });

  function resize() {
    canvas.width = innerWidth;
    const hero = document.querySelector(".hero");
    canvas.height = hero ? hero.offsetHeight : innerHeight;
  }

  resize();
  window.addEventListener("resize", resize);

  const particles = Array.from({ length: 100 }, () => ({
    x: Math.random() * innerWidth,
    y: Math.random() * innerHeight,
    r: Math.random() * 2 + 1,
    dx: (Math.random() - 0.5) * 0.5,
    dy: (Math.random() - 0.5) * 0.5,
    fx: 0,
    fy: 0
  }));

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const p of particles) {

      if (mouse.x !== null) {
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const d = Math.sqrt(dx * dx + dy * dy);

        if (d < 200) {
          const f = (200 - d) / 200;
          p.fx += (dx / d) * f * 1.5;
          p.fy += (dy / d) * f * 1.5;
        }
      }

      p.x += p.dx + p.fx;
      p.y += p.dy + p.fy;

      p.fx *= 0.92;
      p.fy *= 0.92;

      if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.dy *= -1;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,255,255,0.4)";
      ctx.fill();
    }

    requestAnimationFrame(animate);
  }

  animate();
}