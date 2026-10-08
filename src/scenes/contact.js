import * as THREE from 'three';
import { shellPoints } from '../utils/three-utils.js';

export function createContactScene({ quality }) {
  const group = new THREE.Group();
  const core = new THREE.Mesh(new THREE.SphereGeometry(0.25, 32, 32), new THREE.MeshStandardMaterial({ color: 0xc9a876, metalness: 1, roughness: 0.25, emissive: 0xc9a876, emissiveIntensity: 0.5 }));
  group.add(core);

  const rings = [1.6, 2.2, 2.8].map((r, i) => {
    const m = new THREE.Mesh(new THREE.TorusGeometry(r, 0.006, 8, 200), new THREE.MeshBasicMaterial({ color: i === 0 ? 0xc9a876 : 0xf1efe9, transparent: true, opacity: 0.45 - i * 0.1 }));
    m.rotation.set(i * 0.8, i * 0.5, 0);
    group.add(m);
    return m;
  });
  group.add(shellPoints({ HIGH: 300, MEDIUM: 160, LOW: 60 }[quality.tier], 1.2, 5, { size: 0.016, color: 0xc9a876, opacity: 0.55 }));

  return {
    group,
    update(dt, t, { hold, pointer, motion }) {
      const m = Math.max(motion, 0.25);
      rings.forEach((r, i) => {
        r.rotation.z = t * (0.1 + i * 0.05) * m * (i % 2 ? -1 : 1);
        r.rotation.x += 0.0008 * m;
      });
      group.scale.setScalar(0.75 + hold * 0.4 + Math.sin(t * 0.8 * m) * 0.02);
      group.rotation.y = pointer.x * 0.2 * motion;
      core.scale.setScalar(1 + Math.sin(t * 1.4) * 0.1);
    },
  };
}
