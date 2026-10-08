import * as THREE from 'three';
import { labelSprite, rng, clamp, lerp } from '../utils/three-utils.js';

const CATS = ['RECON', 'NETWORKING', 'WEB SECURITY', 'ANALYSIS', 'FORENSICS', 'PRIVACY', 'LINUX', 'TESTING'];

export function createSecurityScene({ quality }) {
  const group = new THREE.Group();
  const net = new THREE.Group();
  group.add(net);
  const rand = rng(7);

  // 8 category nodes on a loose ring + scattered small nodes.
  const catPos = CATS.map((_, i) => {
    const a = (i / CATS.length) * Math.PI * 2;
    return new THREE.Vector3(Math.cos(a) * 2.9, Math.sin(a * 2) * 1.1, Math.sin(a) * 2.2);
  });
  const smallCount = { HIGH: 44, MEDIUM: 30, LOW: 20 }[quality.tier];
  const smallPos = [];
  while (smallPos.length < smallCount) {
    const x = rand() * 2 - 1, y = rand() * 2 - 1, z = rand() * 2 - 1;
    if (x * x + y * y + z * z <= 1) smallPos.push(new THREE.Vector3(x * 4.4, y * 2.6, z * 3.2));
  }
  const all = [...catPos, ...smallPos];

  // Connect every node to its nearest neighbours.
  const edgeSet = new Set(); const edges = [];
  all.forEach((p, i) => {
    const near = all.map((q, j) => [j, p.distanceToSquared(q)]).filter(([j]) => j !== i)
      .sort((a, b) => a[1] - b[1]).slice(0, i < CATS.length ? 3 : 2);
    near.forEach(([j]) => {
      const key = i < j ? `${i}-${j}` : `${j}-${i}`;
      if (!edgeSet.has(key)) { edgeSet.add(key); edges.push([i, j]); }
    });
  });
  const linePos = new Float32Array(edges.length * 6);
  edges.forEach(([a, b], k) => { all[a].toArray(linePos, k * 6); all[b].toArray(linePos, k * 6 + 3); });
  const lineGeo = new THREE.BufferGeometry();
  lineGeo.setAttribute('position', new THREE.BufferAttribute(linePos, 3));
  net.add(new THREE.LineSegments(lineGeo, new THREE.LineBasicMaterial({ color: 0x4a5668, transparent: true, opacity: 0.45 })));

  const sGeo = new THREE.BufferGeometry().setFromPoints(smallPos);
  net.add(new THREE.Points(sGeo, new THREE.PointsMaterial({ color: 0x9aa4b2, size: 0.07, transparent: true, opacity: 0.8 })));

  const dim = new THREE.Color(0x5a6270), gold = new THREE.Color(0xc9a876);
  const cats = CATS.map((name, i) => {
    const mesh = new THREE.Mesh(new THREE.IcosahedronGeometry(0.13, 1), new THREE.MeshBasicMaterial({ color: dim.clone() }));
    mesh.position.copy(catPos[i]);
    const label = labelSprite(name, { font: "500 44px 'JetBrains Mono', monospace" });
    label.scale.multiplyScalar(0.8); label.position.y = 0.36;
    label.material.opacity = 0.35;
    mesh.add(label);
    net.add(mesh);
    return { mesh, label };
  });

  // Data packets travelling along edges.
  const P = Math.min(16, edges.length);
  const packets = Array.from({ length: P }, (_, i) => ({ e: edges[Math.floor(rand() * edges.length)], o: rand(), s: 0.15 + rand() * 0.2 }));
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(P * 3), 3));
  net.add(new THREE.Points(pGeo, new THREE.PointsMaterial({ color: 0xc9a876, size: 0.09, transparent: true, opacity: 0.95 })));

  // Scanning ring.
  const scan = new THREE.Mesh(new THREE.TorusGeometry(1, 0.004, 8, 128), new THREE.MeshBasicMaterial({ color: 0xc9a876, transparent: true }));
  scan.rotation.x = Math.PI / 2;
  group.add(scan);

  const tmp = new THREE.Vector3();
  return {
    group,
    update(dt, t, { hold, pointer, motion }) {
      const m = Math.max(motion, 0.25);
      net.rotation.y = t * 0.05 * m + hold * 0.8 + pointer.x * 0.2 * motion;
      net.rotation.x = pointer.y * 0.1 * motion;

      const active = Math.min(CATS.length - 1, Math.floor(clamp(hold) * CATS.length));
      cats.forEach((c, i) => {
        const on = i === active;
        c.mesh.material.color.lerp(on ? gold : dim, 0.15);
        c.mesh.scale.setScalar(lerp(c.mesh.scale.x, on ? 1.9 : 1, 0.15));
        c.label.material.opacity = lerp(c.label.material.opacity, on ? 1 : 0.35, 0.15);
      });

      const arr = pGeo.attributes.position.array;
      packets.forEach((p, i) => {
        const f = (t * p.s * m + p.o) % 1;
        tmp.lerpVectors(all[p.e[0]], all[p.e[1]], f).toArray(arr, i * 3);
      });
      pGeo.attributes.position.needsUpdate = true;

      const s = (t * 0.25 * m) % 1;
      scan.scale.setScalar(1 + s * 4.5);
      scan.material.opacity = (1 - s) * 0.5;
    },
  };
}
