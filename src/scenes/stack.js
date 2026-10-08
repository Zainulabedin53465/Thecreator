import * as THREE from 'three';
import { labelSprite } from '../utils/three-utils.js';

const GROUPS = [
  { items: ['JavaScript', 'HTML', 'CSS', 'Dart'], color: '#c9a876', r: 2.0, tilt: 0.35, speed: 0.14 },
  { items: ['Three.js', 'WebGL', 'GSAP', 'Vite'], color: '#f1efe9', r: 2.6, tilt: -0.5, speed: -0.11 },
  { items: ['Flutter'], color: '#9fb4c7', r: 3.2, tilt: 0.9, speed: 0.09 },
  { items: ['Linux', 'Parrot OS', 'Debian'], color: '#c9a876', r: 3.7, tilt: -0.2, speed: -0.07 },
  { items: ['Git'], color: '#8c8c95', r: 4.2, tilt: 0.6, speed: 0.06 },
];

export function createStackScene() {
  const group = new THREE.Group();

  group.add(new THREE.Mesh(new THREE.IcosahedronGeometry(0.9, 1), new THREE.MeshBasicMaterial({ color: 0xc9a876, wireframe: true, transparent: true, opacity: 0.3 })));
  group.add(new THREE.Mesh(new THREE.SphereGeometry(0.45, 32, 32), new THREE.MeshStandardMaterial({ color: 0x16161a, metalness: 1, roughness: 0.2, emissive: 0xc9a876, emissiveIntensity: 0.12 })));

  const spins = GROUPS.map((g, gi) => {
    const tilt = new THREE.Group();
    tilt.rotation.x = g.tilt; tilt.rotation.z = gi * 0.3;
    const spin = new THREE.Group();
    tilt.add(spin);
    spin.add(new THREE.Mesh(new THREE.TorusGeometry(g.r, 0.004, 6, 140), new THREE.MeshBasicMaterial({ color: 0xf1efe9, transparent: true, opacity: 0.1 })));
    g.items.forEach((name, i) => {
      const a = (i / g.items.length) * Math.PI * 2 + gi;
      const s = labelSprite(name, { color: g.color });
      s.scale.multiplyScalar(0.85);
      s.position.set(Math.cos(a) * g.r, 0, Math.sin(a) * g.r);
      spin.add(s);
    });
    group.add(tilt);
    return { spin, g, dir: gi % 2 ? 1 : -1 };
  });

  return {
    group,
    update(dt, t, { hold, motion }) {
      const m = Math.max(motion, 0.25);
      spins.forEach(({ spin, g, dir }) => { spin.rotation.y = t * g.speed * m + hold * dir * 1.5; });
      group.rotation.y = hold * 0.4;
    },
  };
}
