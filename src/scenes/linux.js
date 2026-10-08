import * as THREE from 'three';
import { canvasTexture, clamp, shellPoints } from '../utils/three-utils.js';

// Visual simulation only: safe text, nothing real.
const SCRIPT = [
  ['cmd', '$ whoami'], ['out', 'jainul'],
  ['cmd', '$ uname -s'], ['out', 'Linux'],
  ['cmd', '$ pwd'], ['out', '~/workspace'],
  ['cmd', '$ echo "build. test. learn."'], ['out', 'build. test. learn.'],
  ['cmd', '$ '],
];
const TOTAL = SCRIPT.reduce((n, [, s]) => n + s.length + 1, 0);

function drawTerminal(ctx, w, h, count, blink) {
  ctx.fillStyle = '#07070a'; ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#14141a'; ctx.fillRect(0, 0, w, 56);
  [0, 1, 2].forEach((i) => { ctx.fillStyle = i === 0 ? '#c9a876' : '#2c2c34'; ctx.beginPath(); ctx.arc(32 + i * 26, 28, 7, 0, Math.PI * 2); ctx.fill(); });
  ctx.fillStyle = '#55555d'; ctx.font = "500 22px 'JetBrains Mono', monospace"; ctx.fillText('terminal — ~/workspace', 130, 35);
  ctx.font = "500 34px 'JetBrains Mono', monospace";
  let remaining = count, y = 130, lx = 40, ly = 130;
  for (const [kind, text] of SCRIPT) {
    if (remaining <= 0) break;
    const shown = text.slice(0, remaining);
    remaining -= text.length + 1;
    ctx.fillStyle = kind === 'cmd' ? '#f1efe9' : '#c9a876';
    ctx.fillText(shown, 40, y);
    lx = 40 + ctx.measureText(shown).width; ly = y; y += 54;
  }
  if (blink) { ctx.fillStyle = '#c9a876'; ctx.fillRect(lx + 4, ly - 28, 18, 34); }
}

export function createLinuxScene({ quality }) {
  const group = new THREE.Group();
  const rig = new THREE.Group();
  group.add(rig);

  const { texture, redraw } = canvasTexture(1024, 704, drawTerminal, 0, true);
  rig.add(new THREE.Mesh(new THREE.PlaneGeometry(5, 3.44), new THREE.MeshBasicMaterial({ map: texture })));
  rig.add(new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.PlaneGeometry(5.06, 3.5)),
    new THREE.LineBasicMaterial({ color: 0xc9a876, transparent: true, opacity: 0.5 })
  ));

  // Dim secondary windows for depth.
  [[-2.8, 1.3, -1.4, 0.55], [3, -1.2, -1.8, 0.5]].forEach(([x, y, z, s]) => {
    const w = new THREE.Group();
    w.add(new THREE.Mesh(new THREE.PlaneGeometry(4, 2.6), new THREE.MeshBasicMaterial({ color: 0x0c0c10, transparent: true, opacity: 0.85 })));
    w.add(new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.PlaneGeometry(4, 2.6)), new THREE.LineBasicMaterial({ color: 0x3a3a44, transparent: true, opacity: 0.6 })));
    w.position.set(x, y, z); w.scale.setScalar(s);
    rig.add(w);
  });
  group.add(shellPoints({ HIGH: 160, MEDIUM: 90, LOW: 40 }[quality.tier], 2.5, 5));

  let lastKey = -1;
  return {
    group,
    update(dt, t, { local, hold, pointer, motion }) {
      const count = local < -0.15 ? 0 : Math.floor(clamp(hold * 1.05) * TOTAL);
      const blink = Math.floor(t * 2) % 2 === 0;
      const key = count * 2 + (blink ? 1 : 0);
      if (key !== lastKey) { lastKey = key; redraw(count, blink); }
      rig.rotation.y = -0.25 + pointer.x * 0.1 * motion;
      rig.rotation.x = pointer.y * 0.05 * motion;
      rig.position.y = Math.sin(t * 0.6 * Math.max(motion, 0.25)) * 0.06;
    },
  };
}
