import * as THREE from 'three';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { quality } from './quality.js';
import { clamp, lerp, damp, smooth, disposeObject } from '../utils/three-utils.js';

// World position of each scene ("station") and where the camera sits relative to it.
const STATIONS = {
  intro: [0, 0, 0], india: [0, -1, -16], about: [3, 1, -32], world: [-3, 0, -48],
  development: [2, 1, -64], apps: [-2, 0, -80], linux: [3, -1, -96], security: [-2, 1, -112],
  projects: [0, 0, -128], gallery: [0, 0, -144], stack: [0, 0, -160], behind: [0, 2, -176], contact: [0, 0, -192],
  ending: [0, 0, -208],
};
const CAM_OFF = {
  intro: [0, 0, 6], india: [0, 5, 6.5], about: [-3, 0.5, 5.5], world: [0, 1, 7.5],
  development: [3, 0.5, 5.5], apps: [0, 0, 5.5], linux: [-1.5, 0.5, 4.5], security: [0, 1, 6.5],
  projects: [0, 0, 6.5], gallery: [0, 0, 7], stack: [0, 2, 7.5], behind: [0, 0, 6], contact: [0, 0, 6], ending: [0, 0, 6.5],
};
// 1 = push the 3D object off to the side (text-friendly), 0 = keep it centered.
const SHIFT = { behind: 0, contact: 0, ending: 0 };
const NAMES = {
  intro: 'Opening', india: 'India', about: 'About', world: 'Digital world', development: 'Development',
  apps: 'Apps', linux: 'Workspace', security: 'Security', projects: 'Projects', gallery: 'Gallery', stack: 'Stack',
  behind: 'Behind the screen', contact: 'Contact', ending: 'The end?',
};

const defaultPresence = (l) => clamp(1 - (Math.abs(l) - 0.5) / 0.85);

export function createJourney({ scene, camera, registry }) {
  const sections = [...document.querySelectorAll('.scene[id]')];
  const ids = sections.map((s) => s.id);
  const N = ids.length;
  if (!N) return { update() {}, dispose() {} };

  const motion = quality.reducedMotion ? 0.25 : 1;
  const lookPts = ids.map((id, i) => new THREE.Vector3(...(STATIONS[id] ?? [0, 0, -i * 16])));
  const camPts = ids.map((id, i) => lookPts[i].clone().add(new THREE.Vector3(...(CAM_OFF[id] ?? [0, 0, 6]))));
  const camCurve = new THREE.CatmullRomCurve3(camPts, false, 'catmullrom', 0.5);
  const lookCurve = new THREE.CatmullRomCurve3(lookPts, false, 'catmullrom', 0.5);

  // Build each station inside a holder group so the journey can scale/hide it.
  const stations = ids.map((id, i) => {
    const holder = new THREE.Group();
    holder.position.copy(lookPts[i]);
    holder.visible = false;
    scene.add(holder);
    let mod = null;
    try {
      const factory = registry[id];
      if (factory) { mod = factory({ quality }); holder.add(mod.group); }
    } catch (err) {
      console.warn(`[journey] scene "${id}" failed, skipping`, err);
    }
    return { id, holder, mod };
  });

  // --- scroll -> section mapping -------------------------------------------------
  let keys = [];
  function measure() {
    const vh = window.innerHeight;
    keys = sections.map((s) => {
      const r = s.getBoundingClientRect();
      const top = r.top + window.scrollY;
      return { top, start: top, end: Math.max(top, top + r.height - vh) };
    });
  }
  // u = continuous scene index. Camera is held at scene i while its section is pinned, then travels.
  function sample(y) {
    if (y <= keys[0].end) return 0;
    for (let i = 0; i < N - 1; i++) {
      const a = keys[i], b = keys[i + 1];
      if (y < b.start) return i + smooth((y - a.end) / Math.max(1, b.start - a.end));
      if (y <= b.end) return i + 1;
    }
    return N - 1;
  }
  const holdOf = (i, y) => {
    const k = keys[i];
    return k.end > k.start ? clamp((y - k.start) / (k.end - k.start)) : 0;
  };

  measure();
  window.addEventListener('resize', measure);
  window.addEventListener('load', measure);
  ScrollTrigger.addEventListener('refresh', measure);
  document.fonts?.ready.then(measure);

  // --- pointer ------------------------------------------------------------------
  const pointer = { x: 0, y: 0 };
  const target = { x: 0, y: 0 };
  const onMove = (e) => {
    target.x = (e.clientX / window.innerWidth - 0.5) * 2;
    target.y = (e.clientY / window.innerHeight - 0.5) * 2;
  };
  if (!quality.isTouch) window.addEventListener('pointermove', onMove, { passive: true });

  // --- HUD ----------------------------------------------------------------------
  const hudIdx = document.querySelector('.hud__idx');
  const hudName = document.querySelector('.hud__name');
  const hudBar = document.querySelector('.hud__bar i');
  const introTitle = document.querySelector('#intro h1');
  let hudLast = -1;

  const tmpP = new THREE.Vector3();
  const tmpL = new THREE.Vector3();
  const ctx = { local: 0, hold: 0, pres: 0, pointer, motion, u: 0 };
  let sY = window.scrollY, lastY = sY, vel = 0, roll = 0, fov = 45;

  function update(dt, t) {
    if (!keys.length) return;
    const y = window.scrollY;

    vel = damp(vel, (y - lastY) / Math.max(dt, 0.001), 6, dt);
    lastY = y;
    sY = quality.reducedMotion ? y : damp(sY, y, 6, dt);

    if (quality.isTouch) {
      target.x = Math.sin(t * 0.3) * 0.3; target.y = Math.cos(t * 0.25) * 0.2;
    }
    pointer.x = damp(pointer.x, target.x, 4, dt);
    pointer.y = damp(pointer.y, target.y, 4, dt);

    const u = sample(sY);
    ctx.u = u;
    const tt = u / (N - 1);
    camCurve.getPoint(tt, tmpP);
    lookCurve.getPoint(tt, tmpL);
    camera.position.copy(tmpP);
    camera.lookAt(tmpL);

    // Push the scene off-centre so text and 3D never fight for the same pixels.
    const aspect = window.innerWidth / window.innerHeight;
    const i0 = Math.min(N - 1, Math.floor(u));
    const i1 = Math.min(N - 1, i0 + 1);
    const sh = lerp(SHIFT[ids[i0]] ?? 1, SHIFT[ids[i1]] ?? 1, u - i0);
    if (aspect >= 1) camera.translateX(-sh * Math.min(2.2, aspect * 1.1));
    else camera.translateY(-sh * 1.35);

    camera.translateX(pointer.x * 0.35 * motion);
    camera.translateY(-pointer.y * 0.2 * motion);

    // Cinematic roll + speed-driven FOV kick.
    const rollTarget = (Math.sin(u * 1.3) * 0.035 + clamp(vel * 0.00002, -0.06, 0.06)) * motion;
    roll = damp(roll, rollTarget, 3, dt);
    camera.rotateZ(roll);
    const baseFov = aspect < 1 ? 55 : 45;
    fov = damp(fov, baseFov + clamp(Math.abs(vel) * 0.004, 0, 10) * motion, 4, dt);
    camera.fov = fov;
    camera.updateProjectionMatrix();

    const fit = aspect < 1 ? 0.35 + 0.65 * aspect : 1;
    for (let i = 0; i < N; i++) {
      const s = stations[i];
      const local = u - i;
      const pres = s.mod?.presence ? s.mod.presence(local) : defaultPresence(local);
      const visible = pres > 0.002 && !!s.mod;
      s.holder.visible = visible;
      if (!visible) continue;
      s.holder.scale.setScalar(fit * (0.0001 + smooth(pres)));
      ctx.local = local; ctx.hold = holdOf(i, sY); ctx.pres = pres;
      s.mod.update(dt, t, ctx);
    }

    if (introTitle && u < 1.3) {
      introTitle.style.transform = `translate3d(${(-pointer.x * 14 * motion).toFixed(2)}px, ${(-pointer.y * 9 * motion).toFixed(2)}px, 0)`;
    }

    const idx = Math.round(u);
    if (idx !== hudLast) {
      hudLast = idx;
      if (hudIdx) hudIdx.textContent = String(idx + 1).padStart(2, '0');
      if (hudName) hudName.textContent = NAMES[ids[idx]] ?? '';
    }
    if (hudBar) hudBar.style.transform = `scaleX(${(u / (N - 1)).toFixed(4)})`;
  }

  function dispose() {
    window.removeEventListener('resize', measure);
    window.removeEventListener('load', measure);
    window.removeEventListener('pointermove', onMove);
    ScrollTrigger.removeEventListener('refresh', measure);
    stations.forEach((s) => { s.mod?.dispose?.(); disposeObject(s.holder); scene.remove(s.holder); });
  }

  return { update, dispose };
}
