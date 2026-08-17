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
}

loadSite().catch(() => {});
