import * as THREE from 'three';
import { canvasTexture, roundRect, clamp, lerp, smooth, shellPoints } from '../utils/three-utils.js';

const WORDS = ['BUILT', 'DESIGNED', 'EXPERIMENTED', 'LEARNED'];

function rrShape(w, h, r) {
  const s = new THREE.Shape(); const x = -w / 2, y = -h / 2;
  s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
  return s;
}

function drawScreen(ctx, w, h, word) {
  ctx.fillStyle = '#0b0b0e'; ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#55555d'; ctx.font = "500 22px 'JetBrains Mono', monospace"; ctx.fillText('MY APPS', 40, 90);
  ctx.fillStyle = '#f1efe9'; ctx.font = "600 56px 'Space Grotesk', sans-serif";
  ctx.fillText('Built by', 40, 170); ctx.fillText('Jainul', 40, 235);
  const tile = (x, label, icon) => {
    ctx.fillStyle = '#131318'; roundRect(ctx, x, 300, 210, 210, 28); ctx.fill();
    icon(x + 105, 395);
    ctx.fillStyle = '#8c8c95'; ctx.font = "500 22px 'JetBrains Mono', monospace"; ctx.textAlign = 'center';
    ctx.fillText(label, x + 105, 478); ctx.textAlign = 'left';
  };
  tile(40, 'Flashlight', (cx, cy) => {
    ctx.strokeStyle = '#c9a876'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(cx, cy, 34, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = '#c9a876'; ctx.beginPath(); ctx.arc(cx, cy, 12, 0, Math.PI * 2); ctx.fill();
  });
  tile(262, 'Notepad', (cx, cy) => {
    ctx.strokeStyle = '#f1efe9'; ctx.lineWidth = 4;
    [-22, 0, 22].forEach((dy, i) => { ctx.beginPath(); ctx.moveTo(cx - 34, cy + dy); ctx.lineTo(cx + 34 - i * 14, cy + dy); ctx.stroke(); });
  });
  ctx.strokeStyle = '#c9a876'; ctx.lineWidth = 2;
  roundRect(ctx, 40, h - 170, w - 80, 90, 45); ctx.stroke();
  ctx.fillStyle = '#c9a876'; ctx.font = "500 30px 'JetBrains Mono', monospace"; ctx.textAlign = 'center';
  ctx.fillText(word, w / 2, h - 113); ctx.textAlign = 'left';
}

export function createAppsScene({ quality }) {
  const group = new THREE.Group();
  const phone = new THREE.Group();
  group.add(phone);

  const bodyGeo = new THREE.ExtrudeGeometry(rrShape(1.5, 3.1, 0.2), {
    depth: 0.16, bevelEnabled: true, bevelSize: 0.02, bevelThickness: 0.02, bevelSegments: 2, curveSegments: 10,
  });
  bodyGeo.translate(0, 0, -0.08);
  phone.add(new THREE.Mesh(bodyGeo, new THREE.MeshStandardMaterial({ color: 0x15151a, metalness: 1, roughness: 0.28 })));

  const { texture, redraw } = canvasTexture(512, 1100, drawScreen, WORDS[0]);
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(1.38, 2.97), new THREE.MeshBasicMaterial({ map: texture }));
  screen.position.z = 0.105;
  phone.add(screen);
  group.add(shellPoints({ HIGH: 160, MEDIUM: 90, LOW: 40 }[quality.tier], 2, 4.5));

  let wi = 0;
  return {
    group,
    // Stays big while the camera flies "into" the screen, then dissolves.
    presence: (l) => (l < 0 ? clamp(1 - (Math.abs(l) - 0.5) / 0.85) : 1 - clamp((l - 0.4) / 0.5)),
    update(dt, t, { local, hold, pointer, motion }) {
      const m = Math.max(motion, 0.25);
      const next = Math.min(3, Math.floor(hold * 3.999));
      if (next !== wi) { wi = next; redraw(WORDS[wi]); }
      const pass = Math.max(0, local);
      phone.rotation.y = lerp(-1.1, 0.25, smooth(hold)) * (1 - clamp(pass * 2)) + pointer.x * 0.2 * motion;
      phone.rotation.x = pointer.y * 0.1 * motion;
      phone.rotation.z = pass * 0.6;
      phone.position.y = Math.sin(t * 0.8 * m) * 0.1;
      phone.scale.setScalar(1 + pass * 5);
    },
  };
}
