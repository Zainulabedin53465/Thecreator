import * as THREE from 'three';
import { canvasTexture, roundRect, clamp, damp } from '../utils/three-utils.js';

const GOLD = 0xc9a876;
const metal = () => new THREE.MeshStandardMaterial({ color: 0x1b1b20, metalness: 1, roughness: 0.3 });

function flashlight() {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.22, 1.5, 32), metal());
  const head = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.28, 0.5, 32), metal());
  head.position.y = 1.0;
  const lens = new THREE.Mesh(new THREE.CircleGeometry(0.46, 32), new THREE.MeshBasicMaterial({ color: GOLD }));
  lens.rotation.x = -Math.PI / 2; lens.position.y = 1.26;
  const beam = new THREE.Mesh(
    new THREE.ConeGeometry(1.4, 3, 40, 1, true),
    new THREE.MeshBasicMaterial({ color: GOLD, transparent: true, opacity: 0.07, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide })
  );
  beam.rotation.x = Math.PI; beam.position.y = 2.76;
  g.add(body, head, lens, beam);
  g.rotation.z = 0.35; g.position.y = -0.6;
  const wrap = new THREE.Group(); wrap.add(g);
  return wrap;
}

function notepad() {
  const g = new THREE.Group();
  g.add(new THREE.Mesh(new THREE.BoxGeometry(1.5, 2, 0.12), metal()));
  const { texture } = canvasTexture(300, 400, (ctx, w, h) => {
    ctx.fillStyle = '#101014'; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#f1efe9'; ctx.font = "600 38px 'Space Grotesk', sans-serif"; ctx.fillText('Notes', 24, 60);
    ctx.fillStyle = '#c9a876'; ctx.fillRect(24, 76, 60, 3);
    ctx.fillStyle = '#26262e';
    for (let i = 0; i < 7; i++) roundRect(ctx, 24, 120 + i * 38, i % 3 === 2 ? 150 : 250, 8, 4), ctx.fill();
  });
  const s = new THREE.Mesh(new THREE.PlaneGeometry(1.38, 1.84), new THREE.MeshBasicMaterial({ map: texture }));
  s.position.z = 0.065;
  g.add(s);
  return g;
}

function webExperiments() {
  const g = new THREE.Group();
  [[1.0, 0xc9a876, 0.7], [1.5, 0xf1efe9, 0.35], [2.0, 0xf1efe9, 0.18]].forEach(([s, c, o]) => {
    g.add(new THREE.Mesh(new THREE.BoxGeometry(s, s, s), new THREE.MeshBasicMaterial({ color: c, wireframe: true, transparent: true, opacity: o })));
  });
  g.add(new THREE.Mesh(new THREE.OctahedronGeometry(0.25), new THREE.MeshStandardMaterial({ color: GOLD, metalness: 1, roughness: 0.3, emissive: GOLD, emissiveIntensity: 0.3 })));
  return g;
}

function world3d() {
  const g = new THREE.Group();
  g.add(new THREE.Mesh(new THREE.IcosahedronGeometry(1.2, 2), new THREE.MeshBasicMaterial({ color: GOLD, wireframe: true, transparent: true, opacity: 0.35 })));
  g.add(new THREE.Mesh(new THREE.SphereGeometry(0.8, 32, 32), metal()));
  const ring = new THREE.Mesh(new THREE.TorusGeometry(1.7, 0.01, 8, 120), new THREE.MeshBasicMaterial({ color: 0xf1efe9, transparent: true, opacity: 0.5 }));
  ring.rotation.x = 1.2;
  g.add(ring);
  return g;
}

export function createProjectsScene() {
  const group = new THREE.Group();
  const strip = new THREE.Group();
  group.add(strip);
  const items = [flashlight(), notepad(), webExperiments(), world3d()];
  items.forEach((it, i) => { it.position.x = i * 5; strip.add(it); });

  const list = document.querySelector('.project-list');
  const lis = list ? [...list.querySelectorAll('li')] : [];
  let current = -1;

  return {
    group,
    update(dt, t, { hold, motion }) {
      const m = Math.max(motion, 0.25);
      strip.position.x = -hold * 15;
      items.forEach((it) => {
        const wx = it.position.x + strip.position.x;
        const s = 0.55 + 0.55 * (1 - clamp(Math.abs(wx) / 5));
        it.scale.setScalar(damp(it.scale.x || s, s, 8, dt));
        it.rotation.y = t * 0.3 * m;
      });
      const idx = Math.round(clamp(hold) * 3);
      if (idx !== current && list) {
        current = idx;
        list.setAttribute('data-has-current', '');
        lis.forEach((li, i) => (i === idx ? li.setAttribute('data-current', '') : li.removeAttribute('data-current')));
      }
    },
  };
}
