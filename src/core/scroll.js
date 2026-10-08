import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { quality } from './quality.js';

gsap.registerPlugin(ScrollTrigger);

let lenis = null;

export function initScroll() {
  // Respect reduced motion and low-tier devices: use native scroll, skip smoothing.
  if (quality.reducedMotion) {
    ScrollTrigger.refresh();
    return null;
  }

  lenis = new Lenis({
    duration: 1.1,
    easing: (t) => 1 - Math.pow(1 - t, 3),
    smoothWheel: true,
    syncTouch: false, // keep native touch scroll on mobile — avoids scroll-jacking feel
  });

  lenis.on('scroll', ScrollTrigger.update);

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);

  return lenis;
}

export function getLenis() {
  return lenis;
}

// Smooth-scrolls to a section; falls back to native scrollIntoView if Lenis is off.
export function scrollToSection(id) {
  const el = document.getElementById(id);
  if (!el) return;
  if (lenis) lenis.scrollTo(el, { offset: -72 });
  else el.scrollIntoView({ behavior: quality.reducedMotion ? 'auto' : 'smooth' });
}
