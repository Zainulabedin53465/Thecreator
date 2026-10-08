import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { quality } from './quality.js';

const BG = 0x08080a;

export function createRenderer(canvas) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: quality.tier !== 'LOW',
    powerPreference: 'high-performance',
  });
  let pixelRatio = quality.dpr;
  renderer.setPixelRatio(pixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(BG, 1);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(BG, 0.04);

  // Cheap one-time studio environment so metals have something to reflect.
  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  scene.environment = pmrem.fromScene(room, 0.04).texture;
  scene.environmentIntensity = 0.45;
  room.dispose?.();
  pmrem.dispose();

  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 120);
  scene.add(camera);

  // Lights: soft key, cool rim, and a warm light that travels with the camera.
  scene.add(new THREE.AmbientLight(0xffffff, 0.25));
  const key = new THREE.DirectionalLight(0xffffff, 1.0);
  key.position.set(3, 4, 5);
  const rim = new THREE.DirectionalLight(0x8fa8c8, 0.6);
  rim.position.set(-4, 2, -3);
  scene.add(key, rim);
  const camLight = new THREE.PointLight(0xc9a876, 12, 18, 2);
  camLight.position.set(0.8, 1, 1);
  camera.add(camLight);

  function resize() {
    const w = window.innerWidth, h = window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }
  window.addEventListener('resize', resize);

  const updaters = [];
  const clock = new THREE.Clock();
  let elapsed = 0;
  let rafId = null;
  let acc = 0, frames = 0;

  function loop() {
    rafId = requestAnimationFrame(loop);
    const raw = clock.getDelta();
    const dt = Math.min(raw, 0.05);
    elapsed += dt;
    updaters.forEach((fn) => fn(dt, elapsed));
    renderer.render(scene, camera);

    // Adaptive quality: if the GPU struggles, step the pixel ratio down.
    if (raw < 0.5) { acc += raw; frames++; }
    if (acc >= 2) {
      const fps = frames / acc;
      acc = 0; frames = 0;
      if (fps < 40 && pixelRatio > 1) {
        pixelRatio = Math.max(1, pixelRatio - 0.25);
        renderer.setPixelRatio(pixelRatio);
      }
    }
  }
  function start() { if (rafId === null) { clock.getDelta(); loop(); } }
  function stop() { if (rafId !== null) { cancelAnimationFrame(rafId); rafId = null; } }

  document.addEventListener('visibilitychange', () => { document.hidden ? stop() : start(); });

  return { renderer, scene, camera, resize, start, stop, addUpdater: (fn) => updaters.push(fn) };
}
