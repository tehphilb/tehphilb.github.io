/* ocean.js — WebGL-Ozean nach three.js shaders ocean.
   https://threejs.org/examples/webgl_shaders_ocean.html
   Aktiv mit /?bg=ocean — der Schwarm bleibt in phosphor.js. */

const WATER_URL = new URL("textures/waternormals.jpg", import.meta.url).href;

if (new URLSearchParams(location.search).get("bg") === "ocean") {
  const container = document.querySelector(".phosphor");
  if (container) startOcean(container).catch((err) => console.warn("ocean failed", err));
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

async function startOcean(container) {
  const THREE = await import("three");
  const { Water } = await import("three/addons/objects/Water.js");
  const { Sky } = await import("three/addons/objects/Sky.js");

  const bg = getComputedStyle(document.documentElement)
    .getPropertyValue("--bg")
    .trim();

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(2, devicePixelRatio));
  renderer.setClearColor(bg, 1);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.28;
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, 1, 1, 20000);
  camera.position.set(30, 30, 100);
  camera.lookAt(0, 10, 0);

  const waterNormals = await new THREE.TextureLoader().loadAsync(WATER_URL);
  waterNormals.wrapS = THREE.RepeatWrapping;
  waterNormals.wrapT = THREE.RepeatWrapping;

  const sun = new THREE.Vector3();
  const water = new Water(new THREE.PlaneGeometry(10000, 10000), {
    textureWidth: 512,
    textureHeight: 512,
    waterNormals,
    sunDirection: new THREE.Vector3(),
    sunColor: 0xffffff,
    waterColor: 0x001e0f,
    distortionScale: 3.7,
  });
  water.rotation.x = -Math.PI / 2;
  scene.add(water);

  const sky = new Sky();
  sky.scale.setScalar(10000);
  scene.add(sky);

  const skyUniforms = sky.material.uniforms;
  skyUniforms.turbidity.value = 10;
  skyUniforms.rayleigh.value = 2;
  skyUniforms.mieCoefficient.value = 0.005;
  skyUniforms.mieDirectionalG.value = 0.8;
  skyUniforms.cloudCoverage.value = 0.4;
  skyUniforms.cloudDensity.value = 0.5;
  skyUniforms.cloudElevation.value = 0.5;

  const elevation = 2;
  const azimuth = 150;
  const phi = THREE.MathUtils.degToRad(90 - elevation);
  const theta = THREE.MathUtils.degToRad(azimuth);
  sun.setFromSphericalCoords(1, phi, theta);
  skyUniforms.sunPosition.value.copy(sun);
  water.material.uniforms.sunDirection.value.copy(sun).normalize();

  const setSize = () => {
    const w = container.clientWidth;
    const h = container.clientHeight;
    if (!w || !h) return;
    renderer.setPixelRatio(Math.min(2, devicePixelRatio));
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  setSize();
  new ResizeObserver(setSize).observe(container);

  let last = performance.now();
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");

  const render = (now) => {
    let delta = (now - last) / 1000;
    if (delta > 1) delta = 1;
    last = now;
    water.material.uniforms.time.value += delta;
    skyUniforms.time.value = now / 1000;
    renderer.render(scene, camera);
  };

  loopControl(
    reduceMotion,
    () => renderer.setAnimationLoop(render),
    () => renderer.setAnimationLoop(null),
  );
  renderer.render(scene, camera);
}
