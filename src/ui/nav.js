import { scrollToSection, getLenis } from '../core/scroll.js';

export function initNav() {
  const toggle = document.querySelector('.site-nav__toggle');
  const overlay = document.querySelector('.menu-overlay');
  if (!toggle || !overlay) return;
  const links = [...overlay.querySelectorAll('a')];

  const setOpen = (open) => {
    overlay.dataset.open = String(open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.textContent = open ? 'CLOSE' : 'MENU';
    document.documentElement.style.overflow = open ? 'hidden' : '';
    const lenis = getLenis();
    if (open) lenis?.stop(); else lenis?.start();
    if (open) requestAnimationFrame(() => links[0]?.focus({ preventScroll: true }));
  };
  const isOpen = () => overlay.dataset.open === 'true';

  toggle.addEventListener('click', () => setOpen(!isOpen()));

  overlay.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    if (!link) return;
    e.preventDefault();
    setOpen(false);
    scrollToSection(link.getAttribute('href').slice(1));
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen()) { setOpen(false); toggle.focus(); }
  });
}
