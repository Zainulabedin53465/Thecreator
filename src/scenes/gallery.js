import * as THREE from 'three';
import { clamp, lerp, damp, smooth, shellPoints } from '../utils/three-utils.js';
import { galleryLoaders } from '../data/gallery.js';

const H = 2.9;      // frame height in world units
const GAP = 2.6;    // spacing between frames
const LIMIT = { HIGH: 10, MEDIUM: 8, LOW: 6 }; // caps GPU texture memory per quality tier

export function createGalleryScene({ quality }) {
  const group = new THREE.Group();
  const strip = new THREE.Group();
  group.add(strip);

  const frameGeo = new THREE.PlaneGeometry(1, 1);
  const edgeGeo = new THREE.EdgesGeometry(frameGeo);
  const loader = new THREE.TextureLoader();
  const sources = galleryLoaders.slice(0, LIMIT[quality.tier] ?? 6);

  const items = sources.map((getUrl, i) => {
    const slot = new THREE.Group();   // position / focus scale / tilt
    const inner = new THREE.Group();  // aspect-ratio scale
    const mat = new THREE.MeshBasicMaterial({
      color: 0x15151a, transparent: true, opacity: 0, fog: false, toneMapped: false,
    });
    const edgeMat = new THREE.LineBasicMaterial({ color: 0xc9a876, transparent: true, opacity: 0 });
    inner.add(new THREE.Mesh(frameGeo, mat), new THREE.LineSegments(edgeGeo, edgeMat));
    inner.scale.set(H * 0.5625, H, 1);
    slot.add(inner);
    slot.position.x = i * GAP;
    strip.add(slot);
    return { slot, inner, mat, edgeMat, getUrl, ready: false, fade: 0 };
  });

  let started = false;
  function loadAll() {
    items.forEach(async (it) => {
      try {
        const url = await it.getUrl();
        loader.load(url, (tex) => {
          tex.colorSpace = THREE.SRGBColorSpace;
          tex.anisotropy = 4;
          it.mat.map = tex;
          it.mat.color.set(0xffffff);
          it.mat.needsUpdate = true;
          it.inner.scale.set(H * (tex.image.width / tex.image.height), H, 1);
          it.ready = true;
        }, undefined, () => console.warn('[gallery] image failed to load'));
      } catch (err) {
        console.warn('[gallery] image skipped', err);
      }
    });
  }

  group.add(shellPoints({ HIGH: 160, MEDIUM: 90, LOW: 40 }[quality.tier], 2.5, 6));

  return {
    group,
    update(dt, t, { hold, pointer, motion }) {
      if (!started) { started = true; loadAll(); }
      const m = Math.max(motion, 0.25);
      const span = Math.max(0, items.length - 1) * GAP;
      strip.position.x = damp(strip.position.x, -clamp(hold) * span, 5, dt);

      items.forEach((it, i) => {
        const wx = it.slot.position.x + strip.position.x;
        const d = clamp(Math.abs(wx) / (GAP * 1.6));
        const focus = 1 - smooth(d);
        it.slot.scale.setScalar(0.78 + 0.3 * focus);
        it.slot.rotation.y = clamp(-wx * 0.12, -0.5, 0.5);
        it.slot.position.z = -d * 1.4 + focus * 0.4;
        it.slot.position.y = Math.sin(t * 0.6 * m + i * 1.3) * 0.05;
        it.fade = damp(it.fade, it.ready ? 1 : 0, 3, dt);
        it.mat.opacity = it.fade * lerp(0.3, 1, focus);
        it.edgeMat.opacity = it.fade * lerp(0.1, 0.45, focus);
      });

      group.rotation.y = pointer.x * 0.1 * motion;
      group.rotation.x = pointer.y * 0.05 * motion;
    },
  };
}
