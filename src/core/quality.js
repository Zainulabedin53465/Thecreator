// Decides a HIGH / MEDIUM / LOW render budget. Read once at boot.
export function detectQuality() {
  const rawDpr = window.devicePixelRatio || 1;
  const isTouch = matchMedia('(pointer: coarse)').matches;
  const cores = navigator.hardwareConcurrency || 4;
  const mem = navigator.deviceMemory || 4;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const smallScreen = window.innerWidth < 768;

  let tier = 'HIGH';
  if (reducedMotion) tier = 'LOW';
  else if (isTouch && smallScreen) tier = cores >= 6 && mem >= 6 ? 'MEDIUM' : 'LOW';
  else if (cores <= 4 || mem <= 4) tier = 'MEDIUM';

  const cap = { HIGH: 2, MEDIUM: 1.5, LOW: 1 }[tier];
  return { tier, dpr: Math.min(rawDpr, cap), isTouch, reducedMotion, cores, mem };
}

export const quality = detectQuality();

document.documentElement.dataset.quality = quality.tier;
if (quality.reducedMotion) document.documentElement.dataset.reducedMotion = 'true';
