/* milkyway.js — Milchstrasse als 3D-Parallax, Bild: ESO / S. Guisard (eso0932a).
   https://cdn.eso.org/images/original/eso0932a.tif
   Aktiv mit /?bg=milkyway */

const MAP_URL = new URL("textures/milkyway.jpg", import.meta.url).href;

if (new URLSearchParams(location.search).get("bg") === "milkyway") {
  const container = document.querySelector(".phosphor");
  if (container) {
    startMilkyway(container).catch((err) => console.warn("milkyway failed", err));
  }
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

function fitCover(mesh, camera, aspect, pad) {
  const dist = Math.abs(camera.position.z - mesh.position.z);
  const fh = 2 * Math.tan((camera.fov * Math.PI) / 360) * dist;
  const fw = fh * aspect;
  const s = pad * Math.max(fw / 2, fh / 1);
  mesh.scale.set(s, s, 1);
}

async function startMilkyway(container) {
  const THREE = await import("three");

  const bg = getComputedStyle(document.documentElement)
    .getPropertyValue("--bg")
    .trim();

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(2, devicePixelRatio));
  renderer.setClearColor(bg, 1);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 40);
  camera.position.z = 2.2;

  const tex = await new THREE.TextureLoader().loadAsync(MAP_URL);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());

  const geo = new THREE.PlaneGeometry(2, 1);
  const far = new THREE.Mesh(
    geo,
    new THREE.MeshBasicMaterial({ map: tex, color: 0x3a3a38 }),
  );
  const near = new THREE.Mesh(
    geo,
    new THREE.MeshBasicMaterial({ map: tex, color: 0x6a6a66 }),
  );
  far.position.z = -0.55;
  near.position.z = 0;
  scene.add(far);
  scene.add(near);

  const pointer = { x: 0, y: 0 };
  const look = { x: 0, y: 0 };
  window.addEventListener(
    "pointermove",
    (e) => {
      const r = renderer.domElement.getBoundingClientRect();
      if (!r.width || !r.height) return;
      pointer.x = ((e.clientX - r.left) / r.width) * 2 - 1;
      pointer.y = -((e.clientY - r.top) / r.height) * 2 + 1;
    },
    { passive: true },
  );

  const setSize = () => {
    const w = container.clientWidth;
    const h = container.clientHeight;
    if (!w || !h) return;
    renderer.setPixelRatio(Math.min(2, devicePixelRatio));
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    fitCover(far, camera, camera.aspect, 1.42);
    fitCover(near, camera, camera.aspect, 1.2);
  };
  setSize();
  new ResizeObserver(setSize).observe(container);

  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");

  const render = () => {
    if (!reduceMotion.matches) {
      look.x += (pointer.x - look.x) * 0.045;
      look.y += (pointer.y - look.y) * 0.045;
    }
    near.position.x = -look.x * 0.16;
    near.position.y = look.y * 0.1;
    far.position.x = -look.x * 0.05;
    far.position.y = look.y * 0.03;
    near.rotation.y = look.x * 0.1;
    near.rotation.x = look.y * 0.07;
    far.rotation.y = look.x * 0.04;
    far.rotation.x = look.y * 0.03;
    renderer.render(scene, camera);
  };

  loopControl(
    reduceMotion,
    () => renderer.setAnimationLoop(render),
    () => renderer.setAnimationLoop(null),
  );
  renderer.render(scene, camera);
}
