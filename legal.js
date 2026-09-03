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
}

async function fillPhotoCount(apiBase) {
  const node = document.querySelector("[data-photos-count]");
  if (!node || !apiBase) return;
  try {
    const list = await fetch(`${apiBase}/api/photos`);
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

loadSite().catch(() => {});
