const STEPS = ['INITIALIZING EXPERIENCE', 'LOADING WORLD', 'JAINUL ABEDIN'];
const MIN_VISIBLE_MS = 500;

function announceDone() {
  window.__preloaderDone = true;
  window.dispatchEvent(new Event('preloader:done'));
}

export function initPreloader() {
  const root = document.querySelector('.preloader');
  if (!root) { announceDone(); return; }
  const line = root.querySelector('.preloader__line');
  const bar = root.querySelector('.preloader__bar');

  const start = performance.now();
  let step = 0;
  let finished = false;
  line.textContent = STEPS[0];
  bar.style.setProperty('--progress', '10%');

  const stepTimer = setInterval(() => {
    step = Math.min(step + 1, STEPS.length - 1);
    line.textContent = STEPS[step];
    bar.style.setProperty('--progress', `${30 + step * 30}%`);
  }, 350);

  const finish = () => {
    if (finished) return;
    finished = true;
    clearInterval(stepTimer);
    bar.style.setProperty('--progress', '100%');
    const wait = Math.max(0, MIN_VISIBLE_MS - (performance.now() - start));
    setTimeout(() => {
      root.dataset.done = 'true';
      announceDone();
      root.addEventListener('transitionend', () => root.remove(), { once: true });
      setTimeout(() => root.remove(), 2000); // safety net
    }, wait);
  };

  if (document.readyState === 'complete') finish();
  else window.addEventListener('load', finish, { once: true });
  setTimeout(finish, 6000); // never get stuck on a slow asset
}
