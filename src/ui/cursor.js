export function initCursor() {
  if (matchMedia('(pointer: coarse)').matches) return; // touch devices: skip entirely

  const dot = document.createElement('div');
  dot.className = 'cursor-dot';
  const ring = document.createElement('div');
  ring.className = 'cursor-ring';
  document.body.append(dot, ring);
  document.body.classList.add('has-custom-cursor');

  let mx = 0, my = 0, rx = 0, ry = 0;

  window.addEventListener('pointermove', (e) => {
    mx = e.clientX; my = e.clientY;
    dot.style.transform = `translate(${mx}px, ${my}px)`;
  });

  (function animateRing() {
    rx += (mx - rx) * 0.15;
    ry += (my - ry) * 0.15;
    ring.style.transform = `translate(${rx}px, ${ry}px)`;
    requestAnimationFrame(animateRing);
  })();

  document.addEventListener('pointerover', (e) => {
    const interactive = e.target.closest('a, button, .btn');
    document.body.classList.toggle('cursor-active', !!interactive);
  });
}
