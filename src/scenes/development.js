import * as THREE from 'three';
import { canvasTexture, roundRect, smooth, lerp } from '../utils/three-utils.js';

const TECH = [['HTML', 'structure'], ['CSS', 'style'], ['JAVASCRIPT', 'behavior'], ['WEBGL', 'render'], ['THREE.JS', 'scene']];

function drawScreen(ctx, w, h, idx) {
  ctx.fillStyle = '#0b0b0e'; ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#14141a'; ctx.fillRect(0, 0, w, 64);
  [0, 1, 2].forEach((i) => { ctx.fillStyle = i === 0 ? '#c9a876' : '#2c2c34'; ctx.beginPath(); ctx.arc(36 + i * 26, 32, 7, 0, Math.PI * 2); ctx.fill(); });
  ctx.fillStyle = '#0b0b0e'; roundRect(ctx, 200, 16, 420, 32, 16); ctx.fill();
  ctx.fillStyle = '#55555d'; ctx.font = "500 18px 'JetBrains Mono', monospace"; ctx.fillText('localhost:5173', 226, 38);
  ctx.fillStyle = '#f1efe9'; ctx.font = "600 120px 'Space Grotesk', sans-serif"; ctx.fillText(TECH[idx][0], 70, 330);
  ctx.fillStyle = '#c9a876'; ctx.font = "500 28px 'JetBrains Mono', monospace"; ctx.fillText('// ' + TECH[idx][1], 74, 392);
  for (let k = 0; k < 5; k++) { ctx.fillStyle = k <= idx ? '#c9a876' : '#26262e'; ctx.fillRect(70 + k * 120, 540, 100, 6); }
}

export function createDevelopmentScene() {
  const group = new THREE.Group();
  const rig = new THREE.Group();
  group.add(rig);

  const frame = new THREE.Mesh(
    new THREE.BoxGeometry(4.4, 2.8, 0.14),
    new THREE.MeshStandardMaterial({ color: 0x15151a, metalness: 1, roughness: 0.3 })
  );
  const { texture, redraw } = canvasTexture(1024, 640, drawScreen, 0);
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(4.15, 2.6), new THREE.MeshBasicMaterial({ map: texture }));
  screen.position.z = 0.076;
  rig.add(frame, screen);

  // Interface "layers" that peel away behind the browser as you scroll.
  const layerGeo = new THREE.EdgesGeometry(new THREE.PlaneGeometry(4.4, 2.8));
  const layers = [0, 1, 2].map((i) => {
    const l = new THREE.LineSegments(layerGeo, new THREE.LineBasicMaterial({ color: i === 1 ? 0xc9a876 : 0xf1efe9, transparent: true, opacity: 0.28 }));
    rig.add(l);
    return l;
  });

  let idx = 0;
  return {
    group,
    update(dt, t, { hold, pointer, motion }) {
      const m = Math.max(motion, 0.25);
      const next = Math.min(4, Math.floor(hold * 4.999));
      if (next !== idx) { idx = next; redraw(idx); }
      const spread = smooth(hold);
      layers.forEach((l, i) => {
        l.position.z = -(0.35 + spread * 1.4) * (i + 1);
        l.position.x = (i - 1) * spread * 0.35;
        l.scale.setScalar(1 + i * 0.05 * spread);
      });
      rig.rotation.y = lerp(-0.55, 0.45, hold) + pointer.x * 0.2 * motion;
      rig.rotation.x = 0.1 + pointer.y * 0.1 * motion;
      rig.position.y = Math.sin(t * 0.7 * m) * 0.08;
    },
  };
}
