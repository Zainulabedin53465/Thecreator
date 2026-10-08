import * as THREE from 'three';
import { canvasTexture, shellPoints } from '../utils/three-utils.js';

// Calm, human scene: a slow eclipse with warm light and drifting dust.
export function createBehindScene({ quality }) {
  const group = new THREE.Group();

  const { texture } = canvasTexture(256, 256, (ctx, w, h) => {
    const g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
    g.addColorStop(0, 'rgba(201,168,118,0.9)');
    g.addColorStop(0.35, 'rgba(201,168,118,0.25)');
    g.addColorStop(1, 'rgba(201,168,118,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  });
  const sun = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
  sun.scale.setScalar(10);
  sun.position.set(0, 0.3, -3.5);

  const disc = new THREE.Mesh(new THREE.SphereGeometry(1, 48, 48), new THREE.MeshBasicMaterial({ color: 0x08080a, fog: false }));
  disc.position.set(0, 0.3, -2.5);
  const rim = new THREE.Mesh(new THREE.RingGeometry(1.0, 1.025, 96), new THREE.MeshBasicMaterial({ color: 0xc9a876, transparent: true, opacity: 0.9, side: THREE.DoubleSide }));
  rim.position.set(0, 0.3, -2.4);

  const dust = shellPoints({ HIGH: 260, MEDIUM: 150, LOW: 60 }[quality.tier], 1.5, 6, { size: 0.02, color: 0xcfcabf, opacity: 0.5 });
  group.add(sun, disc, rim, dust);

  return {
    group,
    update(dt, t, { pointer, motion, hold }) {
      const m = Math.max(motion, 0.25);
      sun.scale.setScalar(10 + Math.sin(t * 0.4 * m) * 0.4 + hold * 1.5);
      dust.rotation.y = t * 0.01 * m;
      dust.rotation.x = Math.sin(t * 0.05) * 0.05;
      group.position.x = pointer.x * 0.1 * motion;
    },
  };
}
