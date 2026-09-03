"use strict";

const TOKEN_KEY = "icke-upload-token";
const MAX_EDGE = 2048;
const JPEG_QUALITY = 0.84;

const input = document.querySelector(".photos__input");
const countNode = document.querySelector("[data-photos-count]");
const statusNode = document.querySelector("[data-photos-status]");
const grid = document.querySelector("[data-photos-grid]");
const empty = document.querySelector("[data-photos-empty]");
const addRow = document.querySelector("[data-photos-add]");
const lockButton = document.querySelector("[data-photos-lock]");
const deleteButton = document.querySelector("[data-delete]");
const viewer = document.querySelector(".photos__view");
const viewerImg = viewer.querySelector("img");

let apiBase = "";
let token = readToken();
let owner = false;
let photos = [];
let openId = "";

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

function padCount(n) {
  return String(n).padStart(2, "0");
}

function setStatus(text) {
  if (!text) {
    statusNode.hidden = true;
    statusNode.textContent = "";
    return;
  }
  statusNode.hidden = false;
  statusNode.textContent = text;
}

function setOwner(next, nextToken = token) {
  owner = next;
  token = next ? nextToken : "";
  writeToken(next ? token : "");
  addRow.hidden = !next;
  lockButton.hidden = !next;
  deleteButton.hidden = !next;
}

function localApiFallback() {
  const host = location.hostname;
  if (host === "127.0.0.1" || host === "localhost") return "http://127.0.0.1:8787";
  return "";
}

async function loadConfig() {
  const res = await fetch("site.json", { cache: "no-store" });
  if (res.ok) {
    const site = await res.json();
    apiBase = String(site.photosApi || "").replace(/\/+$/, "");
  }
  if (!apiBase) apiBase = localApiFallback();
}

function apiUrl(path) {
  return `${apiBase}${path}`;
}

async function api(path, options = {}) {
  const headers = new Headers(options.headers);
  const method = String(options.method || "GET").toUpperCase();
  const needsAuth = Boolean(token) && (method !== "GET" || path === "/api/auth");
  if (needsAuth) headers.set("Authorization", `Bearer ${token}`);
  const res = await fetch(apiUrl(path), {
    ...options,
    headers,
    credentials: "omit",
    cache: "no-store",
  });
  return res;
}

function loadListJsonp() {
  return new Promise((resolve, reject) => {
    const name = `ickePhotos${Date.now().toString(36)}`;
    const script = document.createElement("script");
    const timer = window.setTimeout(() => finish(new Error("timeout")), 8000);
    const finish = (err, data) => {
      window.clearTimeout(timer);
      try {
        delete window[name];
      } catch {
        window[name] = undefined;
      }
      script.remove();
      if (err) reject(err);
      else resolve(data);
    };
    window[name] = (data) => finish(null, data);
    script.onerror = () => finish(new Error("jsonp"));
    script.src = `${apiUrl("/api/photos")}?callback=${name}`;
    document.head.append(script);
  });
}

function imageUrl(id) {
  return apiUrl(`/img/${encodeURIComponent(id)}`);
}

function imageBitmapFromFile(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      createImageBitmap(img).then(resolve, reject);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("unreadable image"));
    };
    img.src = url;
  });
}

async function fileToBlob(file) {
  let bitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    bitmap = await imageBitmapFromFile(file);
  }

  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  canvas.getContext("2d").drawImage(bitmap, 0, 0, width, height);
  if (bitmap.close) bitmap.close();

  const blob = await new Promise((resolve, reject) => {
    canvas.toBlob((next) => {
      if (next && next.size) resolve(next);
      else reject(new Error("konvertierung fehlgeschlagen"));
    }, "image/jpeg", JPEG_QUALITY);
  });
  return blob;
}

function isImage(file) {
  if (file.type.startsWith("image/")) return true;
  return /\.(jpe?g|png|gif|webp|heic|heif|avif)$/i.test(file.name || "");
}

function render() {
  countNode.textContent = padCount(photos.length);
  empty.hidden = photos.length > 0;
  grid.hidden = photos.length === 0;
  grid.replaceChildren();

  for (const photo of photos) {
    const li = document.createElement("li");
    const thumb = document.createElement("a");
    thumb.className = "photos__thumb";
    thumb.href = imageUrl(photo.id);
    thumb.dataset.id = photo.id;
    const img = document.createElement("img");
    img.src = imageUrl(photo.id);
    img.alt = photo.name || "foto";
    img.decoding = "async";
    img.loading = "lazy";
    img.referrerPolicy = "no-referrer";
    thumb.append(img);
    li.append(thumb);
    grid.append(li);
  }
}

async function refresh() {
  if (!apiBase) {
    setStatus("galerie nicht verbunden.");
    return;
  }
  try {
    const res = await fetch(apiUrl("/api/photos"), {
      credentials: "omit",
      cache: "no-store",
    });
    if (!res.ok) throw new Error("list failed");
    photos = await res.json();
  } catch {
    photos = await loadListJsonp();
  }
  if (!Array.isArray(photos)) photos = [];
  render();
}

async function checkOwner() {
  if (!token || !apiBase) {
    setOwner(false);
    return;
  }
  try {
    const res = await api("/api/auth");
    setOwner(res.ok, token);
  } catch {
    setOwner(false);
  }
}

async function addFiles(files) {
  const images = [...files].filter(isImage);
  if (!images.length) {
    setStatus("keine bilder erkannt.");
    return;
  }

  let saved = 0;
  for (const [index, file] of images.entries()) {
    setStatus(`lade ${padCount(index + 1)} / ${padCount(images.length)}`);
    try {
      const blob = await fileToBlob(file);
      const res = await api("/api/photos", {
        method: "POST",
        headers: {
          "Content-Type": "image/jpeg",
          "X-Photo-Name": encodeURIComponent(file.name || "foto").slice(0, 180),
        },
        body: blob,
      });
      const detail = (await res.text()).trim();
      if (res.status === 401) {
        setOwner(false);
        setStatus("key ungueltig.");
        return;
      }
      if (!res.ok) {
        setStatus(`upload fehlgeschlagen (${res.status}${detail ? ": " + detail : ""}).`);
        return;
      }
      saved += 1;
    } catch (err) {
      setStatus(`upload fehlgeschlagen: ${err.message || "netzwerk"}`);
      return;
    }
  }

  await refresh();
  setStatus(saved ? `${padCount(saved)} hinzugefuegt.` : "");
  window.setTimeout(() => {
    if (statusNode.textContent.endsWith("hinzugefuegt.")) setStatus("");
  }, 2400);
}

function openViewer(id) {
  openId = id;
  viewerImg.src = imageUrl(id);
  if (typeof viewer.showModal === "function") viewer.showModal();
}

function closeViewer() {
  if (viewer.open) viewer.close();
  openId = "";
  viewerImg.removeAttribute("src");
}

lockButton.addEventListener("click", () => {
  setOwner(false);
  closeViewer();
});

input.addEventListener("change", async () => {
  const files = input.files ? [...input.files] : [];
  input.value = "";
  if (!files.length) return;
  await addFiles(files);
});

grid.addEventListener("click", (event) => {
  const thumb = event.target.closest("[data-id]");
  if (!thumb) return;
  event.preventDefault();
  openViewer(thumb.dataset.id);
});

viewer.querySelector("[data-close]").addEventListener("click", closeViewer);

deleteButton.addEventListener("click", async () => {
  if (!openId || !owner) return;
  const id = openId;
  closeViewer();
  const res = await api(`/api/photos/${encodeURIComponent(id)}`, { method: "DELETE" });
  if (!res.ok) {
    setStatus("loeschen fehlgeschlagen.");
    return;
  }
  await refresh();
});

viewer.addEventListener("click", (event) => {
  if (event.target === viewer) closeViewer();
});

(async function start() {
  try {
    await loadConfig();
    if (!apiBase) {
      setOwner(false);
      setStatus("galerie nicht verbunden.");
      return;
    }
    await refresh();
  } catch {
    setStatus("galerie nicht verfuegbar.");
  }
  checkOwner().catch(() => setOwner(false));
})();
