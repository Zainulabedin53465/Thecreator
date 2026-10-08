import * as THREE from 'three';

// Ambient particles spread along the entire flight path: constant sense of travel + parallax.
export function createDust({ quality, zStart = 12, zEnd = -221 }) {
  const count = { HIGH: 1600, MEDIUM: 800, LOW: 350 }[quality.tier] ?? 400;
  const pos = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    pos[i * 3] = (Math.random() - 0.5) * 34;
    pos[i * 3 + 1] = (Math.random() - 0.5) * 18;
    pos[i * 3 + 2] = zEnd + Math.random() * (zStart - zEnd);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({
    color: 0xcfcabf, size: 0.035, transparent: true, opacity: 0.5, depthWrite: false,
  });
  const points = new THREE.Points(geo, mat);
  return { points, dispose() { geo.dispose(); mat.dispose(); } };
}
