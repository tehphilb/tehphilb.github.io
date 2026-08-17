"use strict";

const CONTACT_WEBAPP_URL =
  "https://script.google.com/macros/s/AKfycbwiL7HXIxCoYmLkrSglpOrFOj-lWoXP-UB1yPAq0Tzw8mebZJlar_QSaObjBw7roJrh/exec";

/* ── ASCII rain ──────────────────────────────────────────────────── */

function initRain() {
  const rain = document.getElementById("rain");
  if (!rain || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const CHARS = "▁▂▃░▒▓│┤╡╢╖╕║╗╝┐└┴┬├─┼╞╟╚╔╩╦╠═╬01<>/\\{}[]#*.·";
  let t = 0;
  let timer;

  function dims() {
    return {
      w: Math.ceil(window.innerWidth  / (13 * 0.6 + 2)) + 2,
      h: Math.ceil(window.innerHeight / (13 * 1.06))    + 2,
    };
  }

  function frame() {
    t += 1;
    const { w, h } = dims();
    let out = "";
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const v = Math.sin(x * 0.7 + y * 0.31 + t * 0.22) * Math.cos(x * 0.13 - t * 0.05);
        out += v > 0.55 ? CHARS[(x * 7 + y * 3 + t) % CHARS.length] : " ";
      }
      out += "\n";
    }
    rain.textContent = out;
  }

  frame();
  timer = setInterval(frame, 110);

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      clearInterval(timer);
      timer = null;
    } else if (!timer) {
      timer = setInterval(frame, 110);
    }
  });
}

/* ── project accordion ───────────────────────────────────────────── */

function initProjects() {
  const btns   = Array.from(document.querySelectorAll(".proj"));
  const dialog = document.getElementById("touch");
  if (!btns.length) return;

  function toggle(btn) {
    const next = btn.getAttribute("aria-expanded") !== "true";
    btns.forEach((b) => b.setAttribute("aria-expanded", "false"));
    btn.setAttribute("aria-expanded", String(next));
  }

  btns.forEach((btn) => btn.addEventListener("click", () => toggle(btn)));

  document.addEventListener("keydown", (e) => {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
    if (dialog?.open) return;
    const n = Number(e.key);
    if (n >= 1 && n <= btns.length) {
      toggle(btns[n - 1]);
      btns[n - 1].focus();
    }
  });
}

/* ── contact form ────────────────────────────────────────────────── */

function initContact() {
  const dialog   = document.getElementById("touch");
  const form     = document.getElementById("touch-form");
  const statusEl = document.getElementById("touch-status");
  const sendBtn  = document.getElementById("touch-send");
  const openBtn  = document.getElementById("open-touch");
  const closeBtn = document.getElementById("close-touch");

  if (!dialog || !form) return;

  function setStatus(text) { statusEl.textContent = text; }

  openBtn.addEventListener("click", () => {
    form.reset();
    setStatus("");
    dialog.showModal();
    document.getElementById("touch-email").focus();
  });

  closeBtn.addEventListener("click", () => dialog.close());

  dialog.addEventListener("click", (e) => {
    if (e.target === dialog) dialog.close();
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    e.stopPropagation();

    const email    = document.getElementById("touch-email").value.trim();
    const anliegen = document.getElementById("touch-message").value.trim();

    if (form.elements.namedItem("_honey").value) return;

    if (!email || !anliegen) {
      setStatus("bitte email und anliegen ausfuellen.");
      return;
    }
    if (!document.getElementById("touch-consent").checked) {
      setStatus("bitte die datenschutz-einwilligung ankreuzen.");
      return;
    }

    sendBtn.disabled = true;
    setStatus("sende…");

    if (!CONTACT_WEBAPP_URL) {
      sendBtn.disabled = false;
      setStatus("kontakt ist noch nicht aktiv. contact.gs als google-web-app deployen.");
      return;
    }

    form.action  = CONTACT_WEBAPP_URL;
    form.method  = "POST";
    form.target  = "touch-frame";
    form.submit();
    setStatus("gesendet. danke.");

    setTimeout(() => {
      form.reset();
      dialog.close();
      sendBtn.disabled = false;
    }, 1400);
  });
}

/* ── init ────────────────────────────────────────────────────────── */

initRain();
initProjects();
initContact();
