import * as THREE from 'three';
import { clamp, smooth } from '../utils/three-utils.js';

export function createEndingScene() {
  const group = new THREE.Group();
  const obj = new THREE.Group();
  group.add(obj);
  obj.add(new THREE.Mesh(new THREE.DodecahedronGeometry(1.3), new THREE.MeshBasicMaterial({ color: 0xc9a876, wireframe: true, transparent: true, opacity: 0.4 })));
  obj.add(new THREE.Mesh(new THREE.DodecahedronGeometry(0.8), new THREE.MeshPhysicalMaterial({ color: 0x16161a, metalness: 0.9, roughness: 0.2, clearcoat: 1, flatShading: true })));

  return {
    group,
    update(dt, t, { hold, motion }) {
      const m = Math.max(motion, 0.25);
      obj.rotation.y = t * 0.12 * m;
      obj.rotation.x = t * 0.06 * m;
      // Fade to darkness at the very end.
      group.scale.setScalar(1 - smooth(clamp((hold - 0.6) / 0.4)) * 0.9);
    },
  };
}
