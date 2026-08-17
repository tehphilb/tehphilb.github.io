const PROJECTS = [
  {
    name: "entwicklungsraum fussball",
    stack: "website",
    blurb: "talent foerdern. spiel verstehen. entwicklung ermoeglichen.",
    url: "https://www.entwicklungsraum-fussball.de",
  },
];

const LEDE = "selected work. click the card or press 1.";

const BOX = {
  tl: "┌",
  tr: "┐",
  bl: "└",
  br: "┘",
  h: "─",
  v: "│",
};

function pad(text, width) {
  const clipped = text.length > width ? `${text.slice(0, width - 1)}…` : text;
  return clipped + " ".repeat(Math.max(0, width - clipped.length));
}

function drawBox(lines, width) {
  const inner = width - 2;
  const top = BOX.tl + BOX.h.repeat(inner) + BOX.tr;
  const bottom = BOX.bl + BOX.h.repeat(inner) + BOX.br;
  const body = lines.map((line) => `${BOX.v}${pad(line, inner)}${BOX.v}`);
  return [top, ...body, bottom].join("\n");
}

function charsFor(el, min, max) {
  const width = el ? el.clientWidth : 320;
  return Math.max(min, Math.min(max, Math.floor(width / 8.1)));
}

function drawChrome(width) {
  const inner = Math.max(18, width - 2);
  const title = " icke.dev ";
  const bar = BOX.h.repeat(Math.max(0, inner - title.length));
  const tag =
    inner < 38 ? " ascii card · html" : " ascii card  ·  v0.1  ·  no cms  ·  just html";
  return [
    BOX.tl + title + bar + BOX.tr,
    `${BOX.v}${pad(tag, inner)}${BOX.v}`,
    BOX.bl + BOX.h.repeat(inner) + BOX.br,
  ].join("\n");
}

function renderMesh() {
  const glyphs = ".,:;'`°·+*#/\\|=- ";
  const mesh = document.getElementById("mesh");
  if (!mesh) return;
  const cols = Math.min(140, Math.ceil(window.innerWidth / 10));
  const rows = Math.min(90, Math.ceil(window.innerHeight / 14));
  let out = "";
  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < cols; x += 1) {
      const n = Math.sin(x * 0.17 + y * 0.11) * Math.cos(y * 0.07);
      const i = Math.floor(((n + 1) / 2) * (glyphs.length - 1));
      out += glyphs[i];
    }
    out += "\n";
  }
  mesh.textContent = out;
}

function renderChrome() {
  const card = document.getElementById("card");
  const chrome = document.getElementById("chrome");
  if (!card || !chrome) return;
  chrome.textContent = drawChrome(charsFor(card, 22, 86));
}

function renderProjects() {
  const root = document.getElementById("projects");
  if (!root) return;
  root.innerHTML = "";
  const card = document.getElementById("card");
  const boxWidth = charsFor(card, 28, 56);

  PROJECTS.forEach((project, index) => {
    const key = String(index + 1);
    const art = drawBox(
      [
        ` ${key}  ${project.name}`,
        `     ${project.stack}`,
        "",
        ` ${project.blurb}`,
        ` entwicklungsraum-fussball.de`,
        ` -> open`,
      ],
      boxWidth,
    );

    const link = document.createElement("a");
    link.className = "project";
    link.href = project.url;
    link.target = "_blank";
    link.rel = "noreferrer";
    link.dataset.index = key;
    link.setAttribute("aria-label", `${project.name}, ${project.stack}`);

    const pre = document.createElement("pre");
    pre.textContent = art;
    link.appendChild(pre);
    root.appendChild(link);
  });
}

function typeLede(text) {
  const el = document.getElementById("typed");
  let i = 0;
  const tick = () => {
    el.textContent = text.slice(0, i);
    i += 1;
    if (i <= text.length) {
      window.setTimeout(tick, 18);
    }
  };
  tick();
}

function tickClock() {
  const el = document.getElementById("clock");
  if (!el) return;
  const now = new Date();
  const iso = now.toISOString();
  el.textContent = window.matchMedia("(max-width: 720px)").matches
    ? iso.slice(0, 16).replace("T", " ")
    : `${iso.replace("T", " ").slice(0, 19)}Z`;
}

function bindKeys() {
  document.addEventListener("keydown", (event) => {
    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
      return;
    }
    const n = Number(event.key);
    if (!n || n < 1 || n > PROJECTS.length) return;
    const node = document.querySelector(`.project[data-index="${n}"]`);
    if (!node) return;
    node.classList.add("is-active");
    window.setTimeout(() => node.classList.remove("is-active"), 180);
    window.open(PROJECTS[n - 1].url, "_blank", "noreferrer");
  });
}

const CONTACT_WEBAPP_URL =
  "https://script.google.com/macros/s/AKfycbwiL7HXIxCoYmLkrSglpOrFOj-lWoXP-UB1yPAq0Tzw8mebZJlar_QSaObjBw7roJrh/exec";

function bindTouchForm() {
  const dialog = document.getElementById("touch");
  const form = document.getElementById("touch-form");
  const status = document.getElementById("touch-status");
  const sendBtn = document.getElementById("touch-send");
  const openBtn = document.getElementById("open-touch");
  const closeBtn = document.getElementById("close-touch");

  const setStatus = (text) => {
    status.textContent = text;
  };

  openBtn.addEventListener("click", () => {
    form.reset();
    setStatus("");
    dialog.showModal();
    document.getElementById("touch-email").focus();
  });

  closeBtn.addEventListener("click", () => dialog.close());

  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    event.stopPropagation();

    const email = document.getElementById("touch-email").value.trim();
    const anliegen = document.getElementById("touch-message").value.trim();
    const honey = form.elements.namedItem("_honey").value;

    if (honey) return;
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
      setStatus("kontakt ist noch nicht aktiv. contact.gs einmal als google-web-app deployen, url in script.js eintragen.");
      return;
    }

    form.action = CONTACT_WEBAPP_URL;
    form.method = "POST";
    form.target = "touch-frame";
    form.submit();
    setStatus("gesendet. danke.");
    window.setTimeout(() => {
      form.reset();
      dialog.close();
      sendBtn.disabled = false;
    }, 1400);
  });
}

renderMesh();
renderChrome();
renderProjects();
typeLede(LEDE);
tickClock();
window.setInterval(tickClock, 1000);
bindKeys();
bindTouchForm();

window.addEventListener("resize", () => {
  renderMesh();
  renderChrome();
  renderProjects();
  tickClock();
});
