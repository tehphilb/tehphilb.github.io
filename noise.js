/* noise.js — langsames Rauschen hinter der Schrift.
   Default-Hintergrund. Andere: ?bg=flock | ocean | milkyway */

const bgName = new URLSearchParams(location.search).get("bg");
if (!bgName || bgName === "noise") {
  const container = document.querySelector(".phosphor");
  if (container) startNoise(container);
}

function loopControl(reduceMotion, start, stop) {
  if (reduceMotion.matches) return;
  start();
  reduceMotion.addEventListener("change", () => {
    stop();
    if (!reduceMotion.matches) start();
  });
  document.addEventListener("visibilitychange", () => {
    document.hidden ? stop() : start();
  });
}

function wrap(n, period) {
  return ((n % period) + period) % period;
}

function hash(ix, iy, px, py) {
  ix = wrap(ix, px);
  iy = wrap(iy, py);
  const s = Math.sin(ix * 127.1 + iy * 311.7) * 43758.5453;
  return s - Math.floor(s);
}

function noise2(x, y, px, py) {
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const fx = x - x0;
  const fy = y - y0;
  const u = fx * fx * (3 - 2 * fx);
  const v = fy * fy * (3 - 2 * fy);
  const a = hash(x0, y0, px, py);
  const b = hash(x0 + 1, y0, px, py);
  const c = hash(x0, y0 + 1, px, py);
  const d = hash(x0 + 1, y0 + 1, px, py);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}

function fbm(x, y, period) {
  let v = 0;
  let a = 0.5;
  let freq = 1;
  for (let i = 0; i < 4; i++) {
    const p = period * freq;
    v += a * noise2(x * freq, y * freq, p, p);
    a *= 0.5;
    freq *= 2;
  }
  return v;
}

function makeTile(size, cells) {
  const tile = document.createElement("canvas");
  tile.width = size;
  tile.height = size;
  const ctx = tile.getContext("2d", { willReadFrequently: true });
  const img = ctx.createImageData(size, size);
  const data = img.data;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const n = fbm((x / size) * cells, (y / size) * cells, cells);
      const t = Math.min(1, Math.max(0, n));
      const i = (y * size + x) * 4;
      data[i] = (13 + t * 38) | 0;
      data[i + 1] = (14 + t * 46) | 0;
      data[i + 2] = (12 + t * 30) | 0;
      data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return tile;
}

function startNoise(container) {
  const canvas = document.createElement("canvas");
  canvas.setAttribute("aria-hidden", "true");
  canvas.style.cssText =
    "position:absolute;inset:-12%;width:124%;height:124%;filter:blur(28px);opacity:.58";
  container.appendChild(canvas);
  const ctx = canvas.getContext("2d", { alpha: false });
  if (!ctx) {
    console.warn("noise: no 2d context");
    return;
  }

  const tile = makeTile(256, 3);
  const bg =
    getComputedStyle(document.documentElement).getPropertyValue("--bg").trim() ||
    "#0b0b0a";

  const t0 = performance.now();
  const draw = (now) => {
    const w = canvas.width;
    const h = canvas.height;
    if (!w || !h) return;
    const t = (now - t0) / 1000;
    const dw = Math.max(w, h) * 1.15;
    const dh = dw;
    const ox = ((t * 6.4) % dw) - dw;
    const oy = ((t * 4.2) % dh) - dh;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);
    for (let y = oy; y < h + dh; y += dh) {
      for (let x = ox; x < w + dw; x += dw) {
        ctx.drawImage(tile, x, y, dw, dh);
      }
    }
  };

  const setSize = () => {
    const w = container.clientWidth;
    const h = container.clientHeight;
    if (!w || !h) return;
    const dpr = Math.min(1.25, devicePixelRatio || 1);
    canvas.width = Math.max(1, ((w * 1.24) * dpr) | 0);
    canvas.height = Math.max(1, ((h * 1.24) * dpr) | 0);
    draw(performance.now());
  };
  setSize();
  new ResizeObserver(setSize).observe(container);

  let raf = 0;
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");
  const start = () => {
    const tick = (now) => {
      raf = requestAnimationFrame(tick);
      draw(now);
    };
    raf = requestAnimationFrame(tick);
  };
  const stop = () => {
    cancelAnimationFrame(raf);
    raf = 0;
  };

  loopControl(reduceMotion, start, stop);
  draw(t0);
}
