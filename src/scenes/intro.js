import * as THREE from 'three';
import { clamp, shellPoints } from '../utils/three-utils.js';

export function createIntroScene({ quality }) {
  const group = new THREE.Group();
  const gold = 0xc9a876;

  const outer = new THREE.Mesh(
    new THREE.IcosahedronGeometry(1.45, 1),
    new THREE.MeshBasicMaterial({ color: gold, wireframe: true, transparent: true, opacity: 0.32 })
  );
  const core = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.9, quality.tier === 'LOW' ? 1 : 3),
    new THREE.MeshPhysicalMaterial({ color: 0x16161a, metalness: 0.9, roughness: 0.18, clearcoat: 1, clearcoatRoughness: 0.15, flatShading: true })
  );
  const gem = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.32),
    new THREE.MeshStandardMaterial({ color: gold, metalness: 1, roughness: 0.25, emissive: gold, emissiveIntensity: 0.35 })
  );
  const ringMat = new THREE.MeshBasicMaterial({ color: 0xf1efe9, transparent: true, opacity: 0.45 });
  const ringA = new THREE.Mesh(new THREE.TorusGeometry(2.0, 0.006, 8, 180), ringMat);
  const ringB = new THREE.Mesh(new THREE.TorusGeometry(2.5, 0.006, 8, 180), ringMat);
  ringA.rotation.x = 1.2;
  ringB.rotation.set(0.4, 1.1, 0);
  group.add(outer, core, gem, ringA, ringB);

  const count = { HIGH: 500, MEDIUM: 250, LOW: 80 }[quality.tier];
  group.add(shellPoints(count, 2.2, 3.8));

  return {
    group,
    // Camera "passes through": the object swells and dissolves as you leave.
    presence: (l) => (l < 0 ? 1 : 1 - clamp((l - 0.45) / 0.6)),
    update(dt, t, { local, pointer, motion }) {
      const m = Math.max(motion, 0.2);
      const pass = Math.max(0, local);
      group.rotation.y = t * 0.08 * m + pointer.x * 0.3 * motion;
      group.rotation.x = t * 0.04 * m + pointer.y * 0.2 * motion;
      group.rotation.z = pass * 1.4;
      group.scale.setScalar(1 + pass * 3.4);
      core.rotation.y = -t * 0.1 * m;
      outer.rotation.y = t * 0.05 * m;
      ringA.rotation.z = t * 0.2 * m;
      ringB.rotation.z = -t * 0.14 * m;
      const fade = 1 - clamp(pass * 1.3);
      outer.material.opacity = 0.32 * fade;
      ringMat.opacity = 0.45 * fade;
      gem.scale.setScalar(1 + Math.sin(t * 1.6) * 0.08);
    },
  };
}
