"use strict";

const EASE = "cubic-bezier(0.16, 1, 0.3, 1)";
const LEAVE_MS = 420;
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const xdoc = !reduce && "onpagereveal" in window;

function pageRank(href) {
  const path = new URL(href, location.href).pathname.replace(/\/index\.html$/, "/") || "/";
  if (path.endsWith("photos.html")) return 1;
  if (path.endsWith("impressum.html") || path.endsWith("datenschutz.html")) return 2;
  return 0;
}

function setType(transition, from, to) {
  if (!transition || !from || !to) return;
  transition.types.add(pageRank(to) >= pageRank(from) ? "forward" : "back");
}

window.addEventListener("pageswap", (event) => {
  if (!event.viewTransition || !event.activation) return;
  setType(
    event.viewTransition,
    event.activation.from && event.activation.from.url,
    event.activation.entry && event.activation.entry.url,
  );
});

window.addEventListener("pagereveal", (event) => {
  if (!event.viewTransition) {
    document.documentElement.dataset.motion = "ready";
    return;
  }
  setType(event.viewTransition, document.referrer, location.href);
});

if (!xdoc && !reduce && document.documentElement.dataset.motion === "boot") {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      document.documentElement.dataset.motion = "ready";
    });
  });
} else if (document.documentElement.dataset.motion !== "boot") {
  document.documentElement.dataset.motion = "ready";
}

window.addEventListener("pageshow", () => {
  document.documentElement.dataset.motion = "ready";
});

function isInternal(anchor) {
  if (!anchor.href || anchor.target === "_blank" || anchor.hasAttribute("download")) {
    return false;
  }
  const url = new URL(anchor.href, location.href);
  if (url.origin !== location.origin) return false;
  if (url.pathname === location.pathname && url.search === location.search) {
    return false;
  }
  const file = url.pathname.split("/").pop();
  return !file || file.endsWith(".html");
}

document.addEventListener("click", (event) => {
  if (reduce || xdoc || event.defaultPrevented) return;
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  const anchor = event.target.closest("a[href]");
  if (!anchor || !isInternal(anchor)) return;
  event.preventDefault();
  document.documentElement.dataset.motion = "leave";
  window.setTimeout(() => {
    location.href = anchor.href;
  }, LEAVE_MS);
});

function foldProjects(fold) {
  if (!fold) return;
  const sum = fold.querySelector(".work__sum");
  const list = fold.querySelector(".work__list");
  const inner = fold.querySelector(".work__list-inner");
  if (!sum || !list || !inner) return;

  let running = null;

  const finish = (open) => {
    list.style.height = open ? "auto" : "0px";
    if (running) {
      running.cancel();
      running = null;
    }
  };

  const setOpen = (open) => {
    sum.setAttribute("aria-expanded", open ? "true" : "false");
    const from = list.getBoundingClientRect().height;
    const to = open ? inner.scrollHeight : 0;
    if (reduce || from === to) {
      finish(open);
      return;
    }
    if (running) running.cancel();
    list.style.height = from + "px";
    list.style.overflow = "hidden";
    running = list.animate(
      [
        { height: from + "px", offset: 0 },
        { height: to + "px", offset: 1 },
      ],
      { duration: 560, easing: EASE, fill: "forwards" },
    );
    inner.animate(
      open
        ? [
            { opacity: 0.35, transform: "translate3d(0, -10px, 0)" },
            { opacity: 1, transform: "translate3d(0, 0, 0)" },
          ]
        : [
            { opacity: 1, transform: "translate3d(0, 0, 0)" },
            { opacity: 0.35, transform: "translate3d(0, -8px, 0)" },
          ],
      { duration: 420, easing: EASE, fill: "forwards" },
    );
    running.onfinish = () => finish(open);
  };

  sum.addEventListener("click", () => {
    setOpen(sum.getAttribute("aria-expanded") !== "true");
  });
}

foldProjects(document.querySelector(".work__fold"));
