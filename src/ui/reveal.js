import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

// Wrap each word of a heading in a mask + inner span, keeping <br> intact.
function splitWords(el) {
  const label = el.textContent.replace(/\s+/g, ' ').trim();
  el.setAttribute('aria-label', label);
  const frag = document.createDocumentFragment();
  const inners = [];

  el.childNodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      node.textContent.split(/(\s+)/).forEach((part) => {
        if (!part) return;
        if (/^\s+$/.test(part)) { frag.append(' '); return; }
        const outer = document.createElement('span');
        outer.className = 'word';
        outer.setAttribute('aria-hidden', 'true');
        const inner = document.createElement('span');
        inner.className = 'word__inner';
        inner.textContent = part;
        outer.append(inner);
        frag.append(outer);
        inners.push(inner);
      });
    } else {
      frag.append(node.cloneNode(true));
    }
  });

  el.textContent = '';
  el.append(frag);
  return inners;
}

export function initReveal() {
  if (reduced) return; // content stays fully visible and static

  document.querySelectorAll('.scene').forEach((scene) => {
    const inner = scene.querySelector('.scene__inner');
    if (!inner) return;

    const heading = inner.querySelector('h1, h2');
    const words = heading ? splitWords(heading) : [];
    const rest = [...inner.children].filter((c) => c !== heading);

    const tl = gsap.timeline({ paused: true });
    if (words.length) {
      tl.fromTo(words, { yPercent: 110 }, {
        yPercent: 0, duration: 1.0, ease: 'expo.out', stagger: 0.07,
      }, 0);
    }
    if (rest.length) {
      tl.fromTo(rest, { autoAlpha: 0, y: 24 }, {
        autoAlpha: 1, y: 0, duration: 0.9, ease: 'power3.out', stagger: 0.12,
      }, words.length ? 0.25 : 0);
    }

    // Start hidden only after the timeline exists, so a failure leaves content visible.
    if (words.length) gsap.set(words, { yPercent: 110 });
    if (rest.length) gsap.set(rest, { autoAlpha: 0, y: 24 });

    let glitched = false;
    ScrollTrigger.create({
      trigger: scene,
      start: 'top 65%',
      end: 'bottom 35%',
      onToggle: (self) => {
        if (self.isActive) {
          tl.timeScale(1).play();
          if (scene.id === 'security' && heading && !glitched) {
            glitched = true;
            heading.classList.add('glitch');
          }
        } else {
          tl.timeScale(1.6).reverse();
        }
      },
    });
  });

  ScrollTrigger.refresh();
}
