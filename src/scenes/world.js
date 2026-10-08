import * as THREE from 'three';
import { canvasTexture, roundRect, shellPoints } from '../utils/three-utils.js';

const CARDS = [
  ['const world = build();', 'while (curious) learn();', '// scroll to travel'],
  ['$ ls ~/workspace', 'apps/  web/  experiments/'],
  ['void main() {', '  runApp(MyApp());', '}'],
  ['<canvas id="webgl">', '</canvas>'],
  ['git commit -m "next"'],
];

function makeCard(lines) {
  return canvasTexture(512, 320, (ctx, w, h) => {
    ctx.fillStyle = '#0e0e12';
    roundRect(ctx, 4, 4, w - 8, h - 8, 22); ctx.fill();
    ctx.strokeStyle = '#26262e'; ctx.lineWidth = 2; ctx.stroke();
    [0, 1, 2].forEach((i) => {
      ctx.fillStyle = i === 0 ? '#c9a876' : '#2c2c34';
      ctx.beginPath(); ctx.arc(34 + i * 22, 36, 6, 0, Math.PI * 2); ctx.fill();
    });
    ctx.font = "500 26px 'JetBrains Mono', monospace";
    lines.forEach((ln, i) => {
      ctx.fillStyle = i === 0 ? '#f1efe9' : '#8c8c95';
      ctx.fillText(ln, 32, 100 + i * 44);
    });
  }).texture;
}

export function createWorldScene({ quality }) {
  const group = new THREE.Group();

  // Foreground / midground / background layers via z-depth.
  const slots = [[-2.6, 1.2, -1], [2.8, 0.6, -2.5], [0.8, -1.2, 1.5], [-1.2, -0.6, -3.5], [4, -1.2, 0]];
  const cards = CARDS.map((lines, i) => {
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(2.4, 1.5),
      new THREE.MeshBasicMaterial({ map: makeCard(lines), transparent: true, side: THREE.DoubleSide })
    );
    mesh.position.set(...slots[i]);
    mesh.userData = { base: slots[i][1], phase: i * 1.3, depth: 1 + slots[i][2] * 0.15 };
    group.add(mesh);
    return mesh;
  });

  const wire = new THREE.MeshBasicMaterial({ color: 0xc9a876, wireframe: true, transparent: true, opacity: 0.25 });
  const oct = new THREE.Mesh(new THREE.OctahedronGeometry(0.7), wire);
  oct.position.set(-4, 1.8, -2);
  const torus = new THREE.Mesh(new THREE.TorusGeometry(0.7, 0.012, 8, 100), new THREE.MeshBasicMaterial({ color: 0xf1efe9, transparent: true, opacity: 0.4 }));
  torus.position.set(3.4, 2, -4);
  const solid = new THREE.Mesh(new THREE.IcosahedronGeometry(0.45, 1), new THREE.MeshStandardMaterial({ color: 0x1a1a1f, metalness: 1, roughness: 0.25, flatShading: true }));
  solid.position.set(-0.5, 2.2, 0.5);
  group.add(oct, torus, solid);

  const grid = new THREE.GridHelper(30, 30, 0x2a2a32, 0x1a1a20);
  grid.position.y = -2.4;
  grid.material.transparent = true; grid.material.opacity = 0.5;
  group.add(grid);

  group.add(shellPoints({ HIGH: 220, MEDIUM: 120, LOW: 50 }[quality.tier], 2, 6));

  return {
    group,
    update(dt, t, { pointer, motion }) {
      const m = Math.max(motion, 0.25);
      cards.forEach((c) => {
        c.position.y = c.userData.base + Math.sin(t * 0.6 * m + c.userData.phase) * 0.12;
        c.rotation.y = -0.25 + pointer.x * 0.15 * c.userData.depth * motion;
        c.rotation.x = pointer.y * 0.05 * motion;
      });
      oct.rotation.x = t * 0.3 * m; oct.rotation.y = t * 0.2 * m;
      torus.rotation.x = t * 0.25 * m; torus.rotation.y = t * 0.15 * m;
      solid.rotation.y = t * 0.4 * m;
    },
  };
}
