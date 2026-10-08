import * as THREE from 'three';
import { lerp } from '../utils/three-utils.js';

// Same height function on CPU (marker placement) and GPU (terrain displacement).
const terrainFn = (x, z) =>
  Math.sin(x * 0.35) * Math.cos(z * 0.3) * 0.6 + Math.sin(x * 0.8 + z * 0.5) * 0.25 + Math.sin(z * 0.9) * 0.12;

const vert = /* glsl */ `
  varying float vH; varying vec2 vXZ;
  float terrain(vec2 p){
    return sin(p.x*0.35)*cos(p.y*0.3)*0.6 + sin(p.x*0.8+p.y*0.5)*0.25 + sin(p.y*0.9)*0.12;
  }
  void main(){
    float h = terrain(position.xz);
    vH = h; vXZ = position.xz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position.x, position.y + h, position.z, 1.0);
  }`;
const frag = /* glsl */ `
  uniform float uTime; uniform vec3 uColor; uniform vec2 uMark;
  varying float vH; varying vec2 vXZ;
  void main(){
    float k = vH * 9.0 - uTime * 0.15;
    float f = abs(fract(k - 0.5) - 0.5) / max(fwidth(k), 0.0001);
    float line = 1.0 - min(f, 1.0);
    float fade = smoothstep(1.0, 0.35, length(vXZ / vec2(11.0, 8.0)));
    float glow = exp(-pow(length(vXZ - uMark), 2.0) * 0.05);
    gl_FragColor = vec4(uColor * (0.55 + glow * 1.2), line * fade);
  }`;

export function createIndiaScene({ quality }) {
  const group = new THREE.Group();
  const land = new THREE.Group();
  land.position.y = -1.6;
  group.add(land);

  const [sx, sz] = { HIGH: [170, 120], MEDIUM: [110, 76], LOW: [64, 44] }[quality.tier];
  const geo = new THREE.PlaneGeometry(22, 16, sx, sz);
  geo.rotateX(-Math.PI / 2);
  const mx = 1.8, mz = 1.2;
  const mat = new THREE.ShaderMaterial({
    vertexShader: vert, fragmentShader: frag, transparent: true, depthWrite: false,
    uniforms: {
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(0xc9a876) },
      uMark: { value: new THREE.Vector2(mx, mz) },
    },
  });
  land.add(new THREE.Mesh(geo, mat));

  // Odisha marker: a point, a beam and two pulsing rings.
  const my = terrainFn(mx, mz);
  const marker = new THREE.Group();
  marker.position.set(mx, my + 0.05, mz);
  marker.add(new THREE.Mesh(new THREE.SphereGeometry(0.09, 16, 16), new THREE.MeshBasicMaterial({ color: 0xf1efe9 })));
  const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 3, 6), new THREE.MeshBasicMaterial({ color: 0xc9a876, transparent: true, opacity: 0.6 }));
  beam.position.y = 1.5;
  marker.add(beam);
  const ringGeo = new THREE.RingGeometry(0.9, 0.93, 64);
  ringGeo.rotateX(-Math.PI / 2);
  const rings = [0, 0.5].map((phase) => {
    const m = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({ color: 0xc9a876, transparent: true, depthWrite: false }));
    marker.add(m);
    return { m, phase };
  });
  land.add(marker);

  return {
    group,
    update(dt, t, { hold, pointer, motion }) {
      mat.uniforms.uTime.value = t;
      land.position.x = lerp(1.6, -1.6, hold);
      land.rotation.y = pointer.x * 0.05 * motion;
      rings.forEach(({ m, phase }) => {
        const s = (t * 0.5 * Math.max(motion, 0.3) + phase) % 1;
        m.scale.setScalar(0.2 + s * 3);
        m.material.opacity = (1 - s) * 0.8;
      });
    },
  };
}
