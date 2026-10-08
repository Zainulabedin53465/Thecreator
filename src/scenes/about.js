import * as THREE from 'three';

export function createAboutScene({ quality }) {
  const group = new THREE.Group();
  const seg = { HIGH: 220, MEDIUM: 140, LOW: 80 }[quality.tier];

  const knot = new THREE.Mesh(
    new THREE.TorusKnotGeometry(0.9, 0.28, seg, 20, 2, 3),
    new THREE.MeshPhysicalMaterial({ color: 0x1a1a1f, metalness: 1, roughness: 0.22, clearcoat: 1 })
  );
  const halo = new THREE.Mesh(
    new THREE.IcosahedronGeometry(1.9, 2),
    new THREE.MeshBasicMaterial({ color: 0xc9a876, wireframe: true, transparent: true, opacity: 0.12 })
  );
  const orbMat = new THREE.MeshStandardMaterial({ color: 0xc9a876, metalness: 1, roughness: 0.3, emissive: 0xc9a876, emissiveIntensity: 0.3 });
  const orbs = [0, 1, 2].map(() => {
    const o = new THREE.Mesh(new THREE.SphereGeometry(0.09, 16, 16), orbMat);
    group.add(o);
    return o;
  });
  group.add(knot, halo);

  return {
    group,
    update(dt, t, { pointer, motion, hold }) {
      const m = Math.max(motion, 0.25);
      knot.rotation.x = t * 0.2 * m + pointer.y * 0.6 * motion;
      knot.rotation.y = t * 0.15 * m + pointer.x * 0.8 * motion + hold * 1.5;
      knot.scale.setScalar(1 + Math.sin(t * 0.8) * 0.02);
      halo.rotation.y = -t * 0.06 * m;
      halo.rotation.x = t * 0.04 * m;
      orbs.forEach((o, i) => {
        const a = t * 0.5 * m + (i * Math.PI * 2) / 3;
        o.position.set(Math.cos(a) * 2.2, Math.sin(a * 1.3 + i) * 0.8, Math.sin(a) * 2.2);
      });
    },
  };
}
