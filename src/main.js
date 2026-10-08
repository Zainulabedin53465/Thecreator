import '@fontsource/space-grotesk/500.css';
import '@fontsource/space-grotesk/600.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/jetbrains-mono/400.css';

import './styles/variables.css';
import './styles/base.css';
import './styles/components.css';
import './styles/cinema.css';

import { quality } from './core/quality.js';
import { hasWebGL } from './core/webgl.js';
import { createRenderer } from './core/renderer.js';
import { createJourney } from './core/journey.js';
import { initScroll } from './core/scroll.js';
import { initSceneManager } from './core/sceneManager.js';
import { createDust } from './effects/dust.js';
import { registry } from './scenes/index.js';
import { initPreloader } from './ui/preloader.js';
import { initNav } from './ui/nav.js';
import { initCursor } from './ui/cursor.js';
import { initReveal } from './ui/reveal.js';

// Calm / closing scenes keep the text centered instead of left-aligned.
document.querySelectorAll('#behind, #contact, #ending').forEach((s) => s.classList.add('scene--center'));

initPreloader();
initNav();
initSceneManager();
initScroll();
initCursor();
initReveal();

function staticMode(reason) {
  document.documentElement.dataset.webgl = 'unavailable';
  console.info('[boot] static content mode:', reason);
}

if (hasWebGL()) {
  try {
    const canvas = document.getElementById('webgl');
    const { scene, camera, addUpdater, start } = createRenderer(canvas);

    const dust = createDust({ quality });
    scene.add(dust.points);

    const journey = createJourney({ scene, camera, registry });
    addUpdater(journey.update);
    start();
  } catch (err) {
    console.error('[boot] 3D init failed', err);
    staticMode('init error');
  }
} else {
  staticMode('WebGL unavailable');
}

console.log(`[boot] quality tier: ${quality.tier}`, quality);
