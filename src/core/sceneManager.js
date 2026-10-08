// Lightweight observer that marks which <section class="scene"> is active.
// Phase 3+ hooks into this to mount/unmount WebGL per-scene instead of running
// every scene's render loop at once.
export function initSceneManager() {
  const scenes = document.querySelectorAll('.scene[id]');
  const navLinks = document.querySelectorAll('.menu-overlay__list a');

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const id = entry.target.id;
        entry.target.toggleAttribute('data-active', entry.isIntersecting);
        if (entry.isIntersecting) {
          navLinks.forEach((link) => {
            const match = link.getAttribute('href') === `#${id}`;
            link.toggleAttribute('aria-current', match);
            if (match) link.setAttribute('aria-current', 'true');
          });
        }
      });
    },
    { threshold: 0.5 }
  );

  scenes.forEach((s) => observer.observe(s));
  return observer;
}
