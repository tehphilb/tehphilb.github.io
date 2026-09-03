/* phosphor.js — Schwarm im Hintergrund, nach three.js compute birds.
   WebGPU-Compute wenn verfuegbar, sonst ein leichter WebGL-Schwarm.
   https://threejs.org/examples/webgpu_compute_birds.html */

const bgName = new URLSearchParams(location.search).get("bg");
const container = document.querySelector(".phosphor");
if (container && (bgName === "flock" || bgName === "birds")) init(container);
foldProjects(document.querySelector(".work__fold"));
keepBackground(document.querySelector('a[href^="photos.html"]'));
keepBackground(document.querySelector('a.top__mark[href^="index.html"]'));

function keepBackground(link) {
  if (!link || !location.search) return;
  link.search = location.search;
}

function foldProjects(fold) {
  if (!fold) return;
  const sum = fold.querySelector(".work__sum");
  if (!sum) return;
  sum.addEventListener("click", () => {
    const open = sum.getAttribute("aria-expanded") === "true";
    sum.setAttribute("aria-expanded", open ? "false" : "true");
  });
}

function tokens() {
  const s = getComputedStyle(document.documentElement);
  return {
    bg: s.getPropertyValue("--bg").trim(),
    mute: s.getPropertyValue("--mute").trim(),
  };
}

function birdGeometry(THREE) {
  const geo = new THREE.BufferGeometry();
  const points = 3 * 3;
  const vertices = new THREE.BufferAttribute(new Float32Array(points * 3), 3);
  geo.setAttribute("position", vertices);
  let v = 0;
  const push = (...args) => {
    for (const n of args) vertices.array[v++] = n;
  };
  const wing = 20;
  push(0, 0, -20, 0, -8, 10, 0, 0, 30);
  push(0, 0, -15, -wing, 0, 5, 0, 0, 15);
  push(0, 0, 15, wing, 0, 5, 0, 0, -15);
  geo.scale(0.2, 0.2, 0.2);
  return geo;
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

const BIRD_URL = new URL("models/Parrot.glb", import.meta.url).href;

const SHADER_POSITION = /* glsl */ `
uniform float time;
uniform float delta;
void main() {
  float id = floor(gl_FragCoord.x) + floor(gl_FragCoord.y) * resolution.x;
  if (id >= BIRD_COUNT) {
    gl_FragColor = vec4(100000.0, 100000.0, 100000.0, 1.0);
    return;
  }
  vec2 uv = gl_FragCoord.xy / resolution.xy;
  vec4 tmpPos = texture2D(texturePosition, uv);
  vec3 position = tmpPos.xyz;
  vec3 velocity = texture2D(textureVelocity, uv).xyz;
  float phase = tmpPos.w;
  phase = mod(
    (phase + delta + length(velocity.xz) * delta * 3.0 + max(velocity.y, 0.0) * delta * 6.0),
    62.83
  );
  gl_FragColor = vec4(position + velocity * delta * 15.0, phase);
}
`;

const SHADER_VELOCITY = /* glsl */ `
uniform float time;
uniform float delta;
uniform float separationDistance;
uniform float alignmentDistance;
uniform float cohesionDistance;
uniform float freedomFactor;
uniform vec3 predator;
uniform float cameraZ;
uniform float tanHalfFov;
uniform float aspect;

const float width = resolution.x;
const float height = resolution.y;
const float PI = 3.141592653589793;
const float PI_2 = PI * 2.0;
const float SPEED_LIMIT = 9.0;

void main() {
  float id = floor(gl_FragCoord.x) + floor(gl_FragCoord.y) * resolution.x;
  if (id >= BIRD_COUNT) {
    gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
    return;
  }
  float zoneRadius = separationDistance + alignmentDistance + cohesionDistance;
  float separationThresh = separationDistance / zoneRadius;
  float alignmentThresh = (separationDistance + alignmentDistance) / zoneRadius;
  float zoneRadiusSq = zoneRadius * zoneRadius;

  vec2 uv = gl_FragCoord.xy / resolution.xy;
  vec3 selfPosition = texture2D(texturePosition, uv).xyz;
  vec3 selfVelocity = texture2D(textureVelocity, uv).xyz;
  vec3 velocity = selfVelocity;
  float limit = SPEED_LIMIT;

  vec3 dir = selfPosition;
  float dist = length(dir);
  float distSquared = dist * dist;

  if (predator.z > 0.5) {
    float viewZ = cameraZ - selfPosition.z;
    if (viewZ > 1.0) {
      vec2 ndc = selfPosition.xy / vec2(aspect * tanHalfFov * viewZ, tanHalfFov * viewZ);
      vec2 d = ndc - predator.xy;
      dist = length(vec2(d.x * aspect, d.y));
      float preyRadius = 0.42;
      if (dist < preyRadius) {
        vec3 ro = vec3(0.0, 0.0, cameraZ);
        vec3 hit = vec3(
          predator.x * aspect * tanHalfFov * cameraZ,
          predator.y * tanHalfFov * cameraZ,
          0.0
        );
        vec3 rd = normalize(hit - ro);
        vec3 closest = ro + rd * dot(selfPosition - ro, rd);
        dir = closest - selfPosition;
        if (length(dir) < 0.0001) dir = vec3(d.x, d.y, 0.0);
        distSquared = dist * dist;
        float f = (distSquared / (preyRadius * preyRadius) - 1.0) * delta * 100.0;
        velocity += normalize(dir) * f;
        limit += 5.0;
      }
    }
  }

  dir = selfPosition;
  dist = length(dir);
  dir.y *= 2.5;
  velocity -= normalize(dir) * delta * 5.0;

  for (float y = 0.0; y < height; y++) {
    for (float x = 0.0; x < width; x++) {
      vec2 ref = vec2(x + 0.5, y + 0.5) / resolution.xy;
      vec3 birdPosition = texture2D(texturePosition, ref).xyz;
      dir = birdPosition - selfPosition;
      dist = length(dir);
      if (dist < 0.0001) continue;
      distSquared = dist * dist;
      if (distSquared > zoneRadiusSq) continue;
      float percent = distSquared / zoneRadiusSq;
      if (percent < separationThresh) {
        float f = (separationThresh / percent - 1.0) * delta;
        velocity -= normalize(dir) * f;
      } else if (percent < alignmentThresh) {
        float threshDelta = alignmentThresh - separationThresh;
        float adjustedPercent = (percent - separationThresh) / threshDelta;
        vec3 birdVelocity = texture2D(textureVelocity, ref).xyz;
        float f = (0.5 - cos(adjustedPercent * PI_2) * 0.5 + 0.5) * delta;
        velocity += normalize(birdVelocity) * f;
      } else {
        float threshDelta = 1.0 - alignmentThresh;
        float adjustedPercent = threshDelta == 0.0
          ? 1.0
          : (percent - alignmentThresh) / threshDelta;
        float f = (0.5 - (cos(adjustedPercent * PI_2) * -0.5 + 0.5)) * delta;
        velocity += normalize(dir) * f;
      }
    }
  }

  if (length(velocity) > limit) {
    velocity = normalize(velocity) * limit;
  }
  gl_FragColor = vec4(velocity, 1.0);
}
`;

function nextPowerOf2(n) {
  return 2 ** Math.ceil(Math.log2(Math.max(1, n)));
}

function bakeFlap(THREE, geometry, animations) {
  const morphs = geometry.morphAttributes?.position;
  if (!morphs?.length || !animations?.[0]) {
    throw new Error("no morph animation");
  }
  const duration = Math.round(animations[0].duration * 60);
  const vertCount = geometry.getAttribute("position").count;
  const tWidth = nextPowerOf2(vertCount);
  const tHeight = nextPowerOf2(duration);
  const data = new Float32Array(4 * tWidth * tHeight);

  for (let i = 0; i < vertCount; i++) {
    for (let j = 0; j < duration; j++) {
      const cur = Math.floor((j / duration) * morphs.length);
      const next = (cur + 1) % morphs.length;
      const lerpAmt = ((j / duration) * morphs.length) % 1;
      const o = (j * tWidth + i) * 4;
      for (let k = 0; k < 3; k++) {
        const a = morphs[cur].array[i * 3 + k];
        const b = morphs[next].array[i * 3 + k];
        if (a !== undefined && b !== undefined) {
          data[o + k] = a + (b - a) * lerpAmt;
        }
      }
      data[o + 3] = 1;
    }
  }

  const tex = new THREE.DataTexture(
    data,
    tWidth,
    tHeight,
    THREE.RGBAFormat,
    THREE.FloatType,
  );
  tex.needsUpdate = true;
  return { tex, tWidth, tHeight, duration, vertCount };
}

function flockGeometry(
  THREE,
  birdGeo,
  { WIDTH, COUNT, tWidth, duration, tHeight },
) {
  const vertCount = birdGeo.getAttribute("position").count;
  const srcPos = birdGeo.getAttribute("position").array;
  const srcCol = birdGeo.getAttribute("color")?.array;
  const srcIdx = birdGeo.index.array;
  const gray = new Float32Array(vertCount * 3);
  if (srcCol) {
    for (let i = 0; i < vertCount; i++) {
      const y =
        0.2126 * srcCol[i * 3] +
        0.7152 * srcCol[i * 3 + 1] +
        0.0722 * srcCol[i * 3 + 2];
      gray[i * 3] = y;
      gray[i * 3 + 1] = y;
      gray[i * 3 + 2] = y;
    }
  } else {
    gray.fill(0.55);
  }

  const paint = srcCol ? srcCol : gray;
  const vertices = new Float32Array(vertCount * 3 * COUNT);
  const colors = new Float32Array(vertCount * 3 * COUNT);
  const reference = new Float32Array(vertCount * 4 * COUNT);
  const seeds = new Float32Array(vertCount * 4 * COUNT);
  const indices = new Uint32Array(srcIdx.length * COUNT);

  for (let b = 0; b < COUNT; b++) {
    vertices.set(srcPos, b * vertCount * 3);
    colors.set(paint, b * vertCount * 3);
    const seed = Math.random();
    const rx = ((b % WIDTH) + 0.5) / WIDTH;
    const ry = (Math.floor(b / WIDTH) + 0.5) / WIDTH;
    for (let i = 0; i < vertCount; i++) {
      const o = (b * vertCount + i) * 4;
      reference[o] = rx;
      reference[o + 1] = ry;
      reference[o + 2] = i / tWidth;
      reference[o + 3] = duration / tHeight;
      seeds[o] = b;
      seeds[o + 1] = seed;
      seeds[o + 2] = Math.random();
      seeds[o + 3] = Math.random();
    }
    const iOff = b * srcIdx.length;
    const vOff = b * vertCount;
    for (let i = 0; i < srcIdx.length; i++) {
      indices[iOff + i] = srcIdx[i] + vOff;
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
  geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  geo.setAttribute("birdColor", new THREE.BufferAttribute(colors, 3));
  geo.setAttribute("reference", new THREE.BufferAttribute(reference, 4));
  geo.setAttribute("seeds", new THREE.BufferAttribute(seeds, 4));
  geo.setIndex(new THREE.BufferAttribute(indices, 1));
  return geo;
}

async function startGltfFlock(container, THREE, color) {
  const { GLTFLoader } = await import("three/addons/loaders/GLTFLoader.js");
  const { GPUComputationRenderer } =
    await import("three/addons/misc/GPUComputationRenderer.js");

  const gltf = await Promise.race([
    new GLTFLoader().loadAsync(BIRD_URL),
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error("gltf timeout")), 8000);
    }),
  ]);

  let mesh = null;
  gltf.scene.traverse((o) => {
    if (o.isMesh && !mesh) mesh = o;
  });
  if (!mesh?.geometry?.index) throw new Error("no bird mesh");

  const birdGeo = mesh.geometry;
  const anim = bakeFlap(THREE, birdGeo, gltf.animations);

  const WIDTH = 12;
  const COUNT = 137;
  const BOUNDS = 520;
  const BOUNDS_HALF = BOUNDS / 2;
  const SIZE = 0.26;

  const geometry = flockGeometry(THREE, birdGeo, {
    WIDTH,
    COUNT,
    tWidth: anim.tWidth,
    tHeight: anim.tHeight,
    duration: anim.duration,
  });

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(2, devicePixelRatio));
  renderer.setClearColor(color.bg, 1);
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(color.bg, 280, 1600);
  const camera = new THREE.PerspectiveCamera(50, 1, 1, 4000);
  camera.position.z = 650;

  scene.add(new THREE.HemisphereLight(0xd0d0d0, 0x3a3a3a, 2.2));
  const sun = new THREE.DirectionalLight(0xffffff, 2);
  sun.position.set(-20, 40, 30);
  scene.add(sun);

  const gpuCompute = new GPUComputationRenderer(WIDTH, WIDTH, renderer);
  const dtPosition = gpuCompute.createTexture();
  const dtVelocity = gpuCompute.createTexture();
  const pData = dtPosition.image.data;
  const vData = dtVelocity.image.data;
  for (let i = 0, k = 0; k < pData.length; k += 4, i++) {
    if (i >= COUNT) {
      pData[k] = 1e5;
      pData[k + 1] = 1e5;
      pData[k + 2] = 1e5;
      pData[k + 3] = 1;
      vData[k] = 0;
      vData[k + 1] = 0;
      vData[k + 2] = 0;
      vData[k + 3] = 1;
      continue;
    }
    pData[k] = Math.random() * BOUNDS - BOUNDS_HALF;
    pData[k + 1] = Math.random() * BOUNDS - BOUNDS_HALF;
    pData[k + 2] = Math.random() * BOUNDS - BOUNDS_HALF;
    pData[k + 3] = 1;
    vData[k] = (Math.random() - 0.5) * 10;
    vData[k + 1] = (Math.random() - 0.5) * 10;
    vData[k + 2] = (Math.random() - 0.5) * 10;
    vData[k + 3] = 1;
  }

  const velocityVariable = gpuCompute.addVariable(
    "textureVelocity",
    SHADER_VELOCITY,
    dtVelocity,
  );
  const positionVariable = gpuCompute.addVariable(
    "texturePosition",
    SHADER_POSITION,
    dtPosition,
  );
  gpuCompute.setVariableDependencies(velocityVariable, [
    positionVariable,
    velocityVariable,
  ]);
  gpuCompute.setVariableDependencies(positionVariable, [
    positionVariable,
    velocityVariable,
  ]);

  const positionUniforms = positionVariable.material.uniforms;
  const velocityUniforms = velocityVariable.material.uniforms;
  positionUniforms.time = { value: 0 };
  positionUniforms.delta = { value: 0 };
  velocityUniforms.time = { value: 1 };
  velocityUniforms.delta = { value: 0 };
  velocityUniforms.separationDistance = { value: 36 };
  velocityUniforms.alignmentDistance = { value: 48 };
  velocityUniforms.cohesionDistance = { value: 48 };
  velocityUniforms.freedomFactor = { value: 0.75 };
  velocityUniforms.predator = { value: new THREE.Vector3() };
  velocityUniforms.cameraZ = { value: camera.position.z };
  velocityUniforms.tanHalfFov = {
    value: Math.tan((camera.fov * Math.PI) / 360),
  };
  velocityUniforms.aspect = { value: 1 };
  velocityVariable.material.defines.BOUNDS = BOUNDS.toFixed(2);
  velocityVariable.material.defines.BIRD_COUNT = COUNT.toFixed(1);
  positionVariable.material.defines.BIRD_COUNT = COUNT.toFixed(1);
  velocityVariable.wrapS = THREE.RepeatWrapping;
  velocityVariable.wrapT = THREE.RepeatWrapping;
  positionVariable.wrapS = THREE.RepeatWrapping;
  positionVariable.wrapT = THREE.RepeatWrapping;

  const gpuError = gpuCompute.init();
  if (gpuError !== null) throw new Error(gpuError);

  const chromaData = new Uint8Array(WIDTH * WIDTH * 4);
  const chromaMap = new THREE.DataTexture(
    chromaData,
    WIDTH,
    WIDTH,
    THREE.RGBAFormat,
    THREE.UnsignedByteType,
  );
  chromaMap.magFilter = THREE.NearestFilter;
  chromaMap.minFilter = THREE.NearestFilter;
  chromaMap.needsUpdate = true;

  let materialShader = null;
  const mat = new THREE.MeshStandardMaterial({
    vertexColors: true,
    flatShading: true,
    roughness: 1,
    metalness: 0,
    fog: true,
    side: THREE.DoubleSide,
  });
  mat.customProgramCacheKey = () => "flock-chroma-vary";
  mat.onBeforeCompile = (shader) => {
    shader.uniforms.texturePosition = { value: null };
    shader.uniforms.textureVelocity = { value: null };
    shader.uniforms.textureAnimation = { value: anim.tex };
    shader.uniforms.chromaMap = { value: chromaMap };
    shader.uniforms.time = { value: 1 };
    shader.uniforms.size = { value: SIZE };
    shader.uniforms.delta = { value: 0 };
    shader.vertexShader = shader.vertexShader.replace(
      "#define STANDARD",
      `#define STANDARD
attribute vec4 reference;
attribute vec4 seeds;
attribute vec3 birdColor;
varying vec2 vRef;
varying float vSeed;
uniform sampler2D texturePosition;
uniform sampler2D textureVelocity;
uniform sampler2D textureAnimation;
uniform sampler2D chromaMap;
uniform float size;
uniform float time;`,
    );
    shader.vertexShader = shader.vertexShader.replace(
      "#include <begin_vertex>",
      /* glsl */ `
      vec4 tmpPos = texture2D( texturePosition, reference.xy );
      vec3 pos = tmpPos.xyz;
      vec3 velocity = normalize( texture2D( textureVelocity, reference.xy ).xyz );
      vec3 aniPos = texture2D( textureAnimation, vec2( reference.z, mod( time + ( seeds.x ) * ( ( 0.0004 + seeds.y / 10000.0 ) + length( velocity ) / 20000.0 ), reference.w ) ) ).xyz;
      vec3 newPosition = position;
      newPosition = mat3( modelMatrix ) * ( newPosition + aniPos );
      float heroScale = texture2D( chromaMap, reference.xy ).g;
      newPosition *= size * ( 1.0 + heroScale * 0.55 ) + seeds.y * size * 0.2;
      velocity.z *= -1.0;
      float xz = length( velocity.xz );
      float x = sqrt( max( 1.0 - velocity.y * velocity.y, 0.0 ) );
      float cosry = velocity.x / max( xz, 0.0001 );
      float sinry = velocity.z / max( xz, 0.0001 );
      float cosrz = x;
      float sinrz = velocity.y;
      mat3 maty = mat3( cosry, 0.0, -sinry, 0.0, 1.0, 0.0, sinry, 0.0, cosry );
      mat3 matz = mat3( cosrz, sinrz, 0.0, -sinrz, cosrz, 0.0, 0.0, 0.0, 1.0 );
      newPosition = maty * matz * newPosition;
      newPosition += pos;
      vec3 transformed = vec3( newPosition );
      vRef = reference.xy;
      vSeed = seeds.y;
      `,
    );
    shader.fragmentShader = shader.fragmentShader.replace(
      "#define STANDARD",
      `#define STANDARD
varying vec2 vRef;
varying float vSeed;
uniform sampler2D chromaMap;`,
    );
    shader.fragmentShader = shader.fragmentShader.replace(
      "#include <color_fragment>",
      `#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	vec3 birdTint = vColor.rgb;
	float hue = ( vSeed - 0.5 ) * 0.7;
	vec3 axis = vec3( 0.57735 );
	float ca = cos( hue );
	float sa = sin( hue );
	birdTint = birdTint * ca + cross( axis, birdTint ) * sa + axis * dot( axis, birdTint ) * ( 1.0 - ca );
	float sat = mix( 0.78, 1.16, fract( vSeed * 7.13 ) );
	float val = mix( 0.86, 1.14, fract( vSeed * 3.71 ) );
	float tintLuma = dot( birdTint, vec3( 0.2126, 0.7152, 0.0722 ) );
	birdTint = mix( vec3( tintLuma ), birdTint, sat ) * val;
	float birdLuma = dot( vColor.rgb, vec3( 0.2126, 0.7152, 0.0722 ) );
	float chroma = texture2D( chromaMap, vRef ).r;
	diffuseColor.rgb *= mix( vec3( birdLuma ), birdTint, chroma );
	diffuseColor.a *= vColor.a;
#endif`,
    );
    materialShader = shader;
  };

  const birds = new THREE.Mesh(geometry, mat);
  birds.rotation.y = Math.PI / 2;
  birds.frustumCulled = false;
  scene.add(birds);

  const pointer = new THREE.Vector2();
  let pointerLive = false;
  window.addEventListener(
    "pointermove",
    (e) => {
      const r = renderer.domElement.getBoundingClientRect();
      if (!r.width || !r.height) return;
      pointer.x = ((e.clientX - r.left) / r.width) * 2 - 1;
      pointer.y = -((e.clientY - r.top) / r.height) * 2 + 1;
      pointerLive = true;
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
    velocityUniforms.aspect.value = camera.aspect;
    velocityUniforms.tanHalfFov.value = Math.tan((camera.fov * Math.PI) / 360);
    velocityUniforms.cameraZ.value = camera.position.z;
  };
  setSize();
  new ResizeObserver(setSize).observe(container);

  let heroIndex = 0;
  let closest = -Infinity;
  for (let i = 0; i < COUNT; i++) {
    const z = pData[i * 4 + 2];
    if (z > closest) {
      closest = z;
      heroIndex = i;
    }
  }

  chromaData[heroIndex * 4] = 255;
  chromaData[heroIndex * 4 + 1] = 255;
  chromaMap.needsUpdate = true;

  let colorWave = 0;
  let colorWaveTarget = 0;

  const dot = document.querySelector(".top__dot");
  if (dot) {
    dot.addEventListener("click", () => {
      colorWaveTarget = colorWaveTarget > 0.5 ? 0 : 1;
      dot.setAttribute(
        "aria-pressed",
        colorWaveTarget > 0.5 ? "true" : "false",
      );
    });
  }

  let last = performance.now();
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");

  const render = (now) => {
    let delta = (now - last) / 1000;
    if (delta > 1) delta = 1;
    last = now;

    const waveStep = delta / 3.2;
    if (colorWave < colorWaveTarget) {
      colorWave = Math.min(colorWaveTarget, colorWave + waveStep);
    } else if (colorWave > colorWaveTarget) {
      colorWave = Math.max(colorWaveTarget, colorWave - waveStep);
    }

    for (let i = 0; i < COUNT; i++) {
      const stagger = (i * 0.61803398875) % 1;
      const t = (colorWave - stagger * 0.22) / 0.78;
      let c = t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t);
      if (i === heroIndex) c = 1;
      chromaData[i * 4] = (c * 255) | 0;
      chromaData[i * 4 + 1] = i === heroIndex ? 255 : 0;
    }
    chromaMap.needsUpdate = true;

    positionUniforms.time.value = now;
    positionUniforms.delta.value = delta;
    velocityUniforms.time.value = now;
    velocityUniforms.delta.value = delta;
    if (materialShader) {
      materialShader.uniforms.time.value = now / 1000;
      materialShader.uniforms.delta.value = delta;
      materialShader.uniforms.texturePosition.value =
        gpuCompute.getCurrentRenderTarget(positionVariable).texture;
      materialShader.uniforms.textureVelocity.value =
        gpuCompute.getCurrentRenderTarget(velocityVariable).texture;
      materialShader.uniforms.chromaMap.value = chromaMap;
    }
    velocityUniforms.cameraZ.value = camera.position.z;
    if (pointerLive) {
      velocityUniforms.predator.value.set(pointer.x, pointer.y, 1);
    } else {
      velocityUniforms.predator.value.set(0, 0, 0);
    }
    gpuCompute.compute();
    renderer.render(scene, camera);
  };

  loopControl(
    reduceMotion,
    () => renderer.setAnimationLoop(render),
    () => renderer.setAnimationLoop(null),
  );
  gpuCompute.compute();
  renderer.render(scene, camera);
}

async function init(container) {
  const color = tokens();
  try {
    const THREE = await import("three");
    await startGltfFlock(container, THREE, color);
    return;
  } catch (err) {
    console.warn("gltf flock failed", err);
    container.replaceChildren();
  }
  try {
    const THREE = await import("three");
    startCpu(container, THREE, color);
  } catch (err) {
    console.warn("cpu flock failed", err);
    container.replaceChildren();
  }
}

async function startCompute(container, color) {
  const THREE = await import("three/webgpu");
  const tsl = await import("three/tsl");
  const {
    uniform,
    max,
    dot,
    sin,
    mat3,
    uint,
    negate,
    instancedArray,
    cameraProjectionMatrix,
    cameraViewMatrix,
    positionLocal,
    modelWorldMatrix,
    sqrt,
    float,
    Fn,
    If,
    cos,
    Loop,
    Continue,
    normalize,
    instanceIndex,
    length,
    vertexIndex,
  } = tsl;

  const BIRDS = 4096;
  const SPEED_LIMIT = 9;
  const BOUNDS = 800;
  const BOUNDS_HALF = BOUNDS / 2;

  const renderer = new THREE.WebGPURenderer({
    antialias: true,
    requiredLimits: { maxStorageBuffersInVertexStage: 3 },
  });
  renderer.setPixelRatio(Math.min(2, devicePixelRatio));
  renderer.setClearColor(color.bg, 1);
  renderer.toneMapping = THREE.NeutralToneMapping;
  container.appendChild(renderer.domElement);
  await renderer.init();

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(color.bg, 500, 2400);

  const camera = new THREE.PerspectiveCamera(50, 1, 1, 5000);
  camera.position.z = 1000;

  const mute = new THREE.Color(color.mute);
  const birdColor = uniform(mute.clone());

  const positionArray = new Float32Array(BIRDS * 3);
  const velocityArray = new Float32Array(BIRDS * 3);
  const phaseArray = new Float32Array(BIRDS);

  for (let i = 0; i < BIRDS; i++) {
    positionArray[i * 3] = Math.random() * BOUNDS - BOUNDS_HALF;
    positionArray[i * 3 + 1] = Math.random() * BOUNDS - BOUNDS_HALF;
    positionArray[i * 3 + 2] = Math.random() * BOUNDS - BOUNDS_HALF;
    velocityArray[i * 3] = (Math.random() - 0.5) * 10;
    velocityArray[i * 3 + 1] = (Math.random() - 0.5) * 10;
    velocityArray[i * 3 + 2] = (Math.random() - 0.5) * 10;
    phaseArray[i] = 1;
  }

  const positionStorage = instancedArray(positionArray, "vec3").setName(
    "positionStorage",
  );
  const velocityStorage = instancedArray(velocityArray, "vec3").setName(
    "velocityStorage",
  );
  const phaseStorage = instancedArray(phaseArray, "float").setName(
    "phaseStorage",
  );
  positionStorage.setPBO(true);
  velocityStorage.setPBO(true);
  phaseStorage.setPBO(true);

  const effectController = {
    separation: uniform(15).setName("separation"),
    alignment: uniform(20).setName("alignment"),
    cohesion: uniform(20).setName("cohesion"),
    now: uniform(0),
    deltaTime: uniform(0).setName("deltaTime"),
    rayOrigin: uniform(new THREE.Vector3()).setName("rayOrigin"),
    rayDirection: uniform(new THREE.Vector3()).setName("rayDirection"),
  };

  const birdMaterial = new THREE.NodeMaterial();
  birdMaterial.colorNode = birdColor;
  birdMaterial.side = THREE.DoubleSide;
  birdMaterial.fog = true;

  birdMaterial.vertexNode = Fn(() => {
    const position = positionLocal.toVar();
    const newPhase = phaseStorage.element(instanceIndex).toVar();
    const newVelocity = normalize(
      velocityStorage.element(instanceIndex),
    ).toVar();

    If(vertexIndex.equal(4).or(vertexIndex.equal(7)), () => {
      position.y = sin(newPhase).mul(5);
    });

    const newPosition = modelWorldMatrix.mul(position);
    newVelocity.z.mulAssign(-1);
    const xz = length(newVelocity.xz);
    const xyz = float(1);
    const x = sqrt(newVelocity.y.mul(newVelocity.y).oneMinus());
    const cosry = newVelocity.x.div(xz).toVar();
    const sinry = newVelocity.z.div(xz).toVar();
    const cosrz = x.div(xyz);
    const sinrz = newVelocity.y.toVar();
    const maty = mat3(cosry, 0, negate(sinry), 0, 1, 0, sinry, 0, cosry);
    const matz = mat3(cosrz, sinrz, 0, negate(sinrz), cosrz, 0, 0, 0, 1);
    const finalVert = maty.mul(matz).mul(newPosition);
    finalVert.addAssign(positionStorage.element(instanceIndex));
    return cameraProjectionMatrix.mul(cameraViewMatrix).mul(finalVert);
  })();

  const birdMesh = new THREE.InstancedMesh(
    birdGeometry(THREE),
    birdMaterial,
    BIRDS,
  );
  birdMesh.rotation.y = Math.PI / 2;
  birdMesh.matrixAutoUpdate = false;
  birdMesh.frustumCulled = false;
  birdMesh.updateMatrix();
  scene.add(birdMesh);

  const computeVelocity = Fn(() => {
    const PI = float(3.141592653589793);
    const PI_2 = PI.mul(2);
    const limit = float(SPEED_LIMIT).toVar("limit");
    const {
      alignment,
      separation,
      cohesion,
      deltaTime,
      rayOrigin,
      rayDirection,
    } = effectController;
    const zoneRadius = separation.add(alignment).add(cohesion).toConst();
    const separationThresh = separation.div(zoneRadius).toConst();
    const alignmentThresh = separation.add(alignment).div(zoneRadius).toConst();
    const zoneRadiusSq = zoneRadius.mul(zoneRadius).toConst();
    const birdIndex = instanceIndex.toConst("birdIndex");
    const position = positionStorage.element(birdIndex).toVar();
    const velocity = velocityStorage.element(birdIndex).toVar();

    const directionToRay = rayOrigin.sub(position).toConst();
    const projectionLength = dot(directionToRay, rayDirection).toConst();
    const closestPoint = rayOrigin
      .sub(rayDirection.mul(projectionLength))
      .toConst();
    const directionToClosestPoint = closestPoint.sub(position).toConst();
    const distanceToClosestPoint = length(directionToClosestPoint).toConst();
    const distanceToClosestPointSq = distanceToClosestPoint
      .mul(distanceToClosestPoint)
      .toConst();
    const rayRadius = float(150).toConst();
    const rayRadiusSq = rayRadius.mul(rayRadius).toConst();

    If(distanceToClosestPointSq.lessThan(rayRadiusSq), () => {
      const velocityAdjust = distanceToClosestPointSq
        .div(rayRadiusSq)
        .sub(1)
        .mul(deltaTime)
        .mul(100);
      velocity.addAssign(
        normalize(directionToClosestPoint).mul(velocityAdjust),
      );
      limit.addAssign(5);
    });

    const dirToCenter = position.toVar();
    dirToCenter.y.mulAssign(2.5);
    velocity.subAssign(normalize(dirToCenter).mul(deltaTime).mul(5));

    Loop(
      { start: uint(0), end: uint(BIRDS), type: "uint", condition: "<" },
      ({ i }) => {
        If(i.equal(birdIndex), () => {
          Continue();
        });
        const birdPosition = positionStorage.element(i);
        const dirToBird = birdPosition.sub(position);
        const distToBird = length(dirToBird);
        If(distToBird.lessThan(0.0001), () => {
          Continue();
        });
        const distToBirdSq = distToBird.mul(distToBird);
        If(distToBirdSq.greaterThan(zoneRadiusSq), () => {
          Continue();
        });
        const percent = distToBirdSq.div(zoneRadiusSq);
        If(percent.lessThan(separationThresh), () => {
          const velocityAdjust = separationThresh
            .div(percent)
            .sub(1)
            .mul(deltaTime);
          velocity.subAssign(normalize(dirToBird).mul(velocityAdjust));
        })
          .ElseIf(percent.lessThan(alignmentThresh), () => {
            const threshDelta = alignmentThresh.sub(separationThresh);
            const adjustedPercent = percent
              .sub(separationThresh)
              .div(threshDelta);
            const birdVelocity = velocityStorage.element(i);
            const cosRange = cos(adjustedPercent.mul(PI_2));
            const cosRangeAdjust = float(0.5).sub(cosRange.mul(0.5)).add(0.5);
            velocity.addAssign(
              normalize(birdVelocity).mul(cosRangeAdjust.mul(deltaTime)),
            );
          })
          .Else(() => {
            const threshDelta = alignmentThresh.oneMinus();
            const adjustedPercent = threshDelta
              .equal(0)
              .select(1, percent.sub(alignmentThresh).div(threshDelta));
            const cosRange = cos(adjustedPercent.mul(PI_2));
            const adj1 = cosRange.mul(-0.5);
            const adj2 = adj1.add(0.5);
            const adj3 = float(0.5).sub(adj2);
            velocity.addAssign(normalize(dirToBird).mul(adj3.mul(deltaTime)));
          });
      },
    );

    If(length(velocity).greaterThan(limit), () => {
      velocity.assign(normalize(velocity).mul(limit));
    });
    velocityStorage.element(birdIndex).assign(velocity);
  })()
    .compute(BIRDS)
    .setName("Birds Velocity");

  const computePosition = Fn(() => {
    const { deltaTime } = effectController;
    positionStorage
      .element(instanceIndex)
      .addAssign(velocityStorage.element(instanceIndex).mul(deltaTime).mul(15));
    const velocity = velocityStorage.element(instanceIndex);
    const phase = phaseStorage.element(instanceIndex);
    const modValue = phase
      .add(deltaTime)
      .add(length(velocity.xz).mul(deltaTime).mul(3))
      .add(max(velocity.y, 0).mul(deltaTime).mul(6));
    phaseStorage.element(instanceIndex).assign(modValue.mod(62.83));
  })()
    .compute(BIRDS)
    .setName("Birds Position");

  const pointer = new THREE.Vector2();
  const raycaster = new THREE.Raycaster();
  window.addEventListener(
    "pointermove",
    (e) => {
      pointer.x = (e.clientX / innerWidth) * 2 - 1;
      pointer.y = 1 - (e.clientY / innerHeight) * 2;
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
  };
  setSize();
  new ResizeObserver(setSize).observe(container);

  let last = performance.now();
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");

  const render = (now) => {
    let deltaTime = (now - last) / 1000;
    if (deltaTime > 1) deltaTime = 1;
    last = now;
    raycaster.setFromCamera(pointer, camera);
    effectController.now.value = now;
    effectController.deltaTime.value = deltaTime;
    effectController.rayOrigin.value.copy(raycaster.ray.origin);
    effectController.rayDirection.value.copy(raycaster.ray.direction);
    renderer.compute(computeVelocity);
    renderer.compute(computePosition);
    renderer.render(scene, camera);
    pointer.y = 10;
  };

  loopControl(
    reduceMotion,
    () => renderer.setAnimationLoop(render),
    () => renderer.setAnimationLoop(null),
  );
  if (reduceMotion.matches) renderer.render(scene, camera);
}

function startCpu(container, THREE, color) {
  const BIRDS = 137;
  const BOUNDS = 520;
  const HALF = BOUNDS / 2;

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    powerPreference: "low-power",
  });
  renderer.setPixelRatio(Math.min(2, devicePixelRatio));
  renderer.setClearColor(color.bg, 1);
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(color.bg, 280, 1400);
  const camera = new THREE.PerspectiveCamera(50, 1, 1, 4000);
  camera.position.z = 720;

  const mute = new THREE.Color(color.mute);
  const mat = new THREE.MeshBasicMaterial({
    color: mute,
    side: THREE.DoubleSide,
    fog: true,
  });
  const mesh = new THREE.InstancedMesh(birdGeometry(THREE), mat, BIRDS);
  mesh.frustumCulled = false;
  scene.add(mesh);

  const pos = [];
  const vel = [];
  for (let i = 0; i < BIRDS; i++) {
    pos.push(
      new THREE.Vector3(
        Math.random() * BOUNDS - HALF,
        Math.random() * BOUNDS - HALF,
        Math.random() * BOUNDS - HALF,
      ),
    );
    vel.push(
      new THREE.Vector3(
        (Math.random() - 0.5) * 4,
        (Math.random() - 0.5) * 4,
        (Math.random() - 0.5) * 4,
      ),
    );
  }

  const dummy = new THREE.Object3D();
  const look = new THREE.Vector3();
  const away = new THREE.Vector3();
  const pointer = new THREE.Vector2(0, 10);
  const raycaster = new THREE.Raycaster();
  const hit = new THREE.Vector3();
  const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);

  window.addEventListener(
    "pointermove",
    (e) => {
      pointer.x = (e.clientX / innerWidth) * 2 - 1;
      pointer.y = -(e.clientY / innerHeight) * 2 + 1;
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
  };
  setSize();
  new ResizeObserver(setSize).observe(container);

  let rafId = 0;
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");

  function pose() {
    raycaster.setFromCamera(pointer, camera);
    if (!raycaster.ray.intersectPlane(plane, hit)) hit.set(0, 0, 0);

    for (let i = 0; i < BIRDS; i++) {
      const p = pos[i];
      const v = vel[i];
      v.addScaledVector(p, -0.00035);
      const d = p.distanceTo(hit);
      if (d < 160 && d > 0.001) {
        away.copy(p).sub(hit).normalize();
        v.addScaledVector(away, (1 - d / 160) * 0.55);
      }
      v.y -= p.y * 0.0002;
      v.clampLength(0.4, 5.5);
      p.addScaledVector(v, 0.85);
      dummy.position.copy(p);
      look.copy(p).add(v);
      dummy.lookAt(look);
      dummy.rotateY(Math.PI / 2);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
    pointer.y = 10;
  }

  function frame() {
    rafId = requestAnimationFrame(frame);
    pose();
    renderer.render(scene, camera);
  }

  function stop() {
    cancelAnimationFrame(rafId);
    rafId = 0;
  }

  pose();
  renderer.render(scene, camera);
  loopControl(reduceMotion, frame, stop);
}
