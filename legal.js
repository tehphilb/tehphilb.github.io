"use strict";

async function loadSite() {
  const res = await fetch("site.json", { cache: "no-store" });
  if (!res.ok) return;

  const site = await res.json();
  const values = {
    ...site,
    cityLine: [site.zip, site.city].filter(Boolean).join(" "),
  };

  document.querySelectorAll("[data-site]").forEach((node) => {
    const value = String(values[node.dataset.site] ?? "").trim();
    if (!value) return;
    node.textContent = value;
    node.classList.remove("fill-in");
  });

  document.querySelectorAll("[data-site-mailto]").forEach((node) => {
    const value = String(values[node.dataset.siteMailto] ?? "").trim();
    if (!value) return;
    node.setAttribute("href", `mailto:${value}`);
    node.textContent = value;
  });

  const apiBase = String(site.photosApi || "").replace(/\/+$/, "");
  await fillPhotoCount(apiBase);
  bindHiddenUnlock(apiBase);
}

async function fillPhotoCount(apiBase) {
  const node = document.querySelector("[data-photos-count]");
  if (!node || !apiBase) return;
  try {
    const list = await fetch(`${apiBase}/api/photos`, {
      credentials: "omit",
      cache: "no-store",
    });
    if (!list.ok) return;
    const photos = await list.json();
    node.textContent = String(Array.isArray(photos) ? photos.length : 0).padStart(
      2,
      "0",
    );
  } catch {
    /* keep markup fallback */
  }
}

const TOKEN_KEY = "icke-upload-token";

function readToken() {
  try {
    return localStorage.getItem(TOKEN_KEY) || "";
  } catch {
    return "";
  }
}

function writeToken(value) {
  try {
    if (value) localStorage.setItem(TOKEN_KEY, value);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* private safari */
  }
}

function bindHiddenUnlock(apiBase) {
  const reveal = document.querySelector("[data-photos-reveal]");
  const gate = document.querySelector("[data-photos-gate]");
  const statusNode = document.querySelector("[data-photos-gate-status]");
  const lockButton = gate?.querySelector("[data-photos-lock]");
  const keyInput = gate?.querySelector('input[name="key"]');
  if (!reveal || !gate || !apiBase) return;

  const setStatus = (text) => {
    if (!statusNode) return;
    statusNode.hidden = !text;
    statusNode.textContent = text || "";
  };

  const setUnlocked = (on) => {
    if (keyInput) keyInput.hidden = on;
    if (lockButton) lockButton.hidden = !on;
  };

  reveal.addEventListener("click", () => {
    gate.hidden = false;
    setUnlocked(Boolean(readToken()));
    if (keyInput && !keyInput.hidden) keyInput.focus();
  });

  gate.addEventListener("submit", async (event) => {
    event.preventDefault();
    const next = String(new FormData(gate).get("key") || "").trim();
    if (!next) return;
    setStatus("");
    try {
      const res = await fetch(`${apiBase}/api/auth`, {
        headers: { Authorization: `Bearer ${next}` },
      });
      if (!res.ok) {
        writeToken("");
        setUnlocked(false);
        setStatus("");
        return;
      }
      writeToken(next);
      gate.reset();
      setUnlocked(true);
      setStatus("");
    } catch {
      setStatus("");
    }
  });

  lockButton?.addEventListener("click", () => {
    writeToken("");
    setUnlocked(false);
    gate.hidden = true;
  });
}

loadSite().catch(() => {});
