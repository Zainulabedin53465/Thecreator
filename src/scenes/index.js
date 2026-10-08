import { createIntroScene } from './intro.js';
import { createIndiaScene } from './india.js';
import { createAboutScene } from './about.js';
import { createWorldScene } from './world.js';
import { createDevelopmentScene } from './development.js';
import { createAppsScene } from './apps.js';
import { createLinuxScene } from './linux.js';
import { createSecurityScene } from './security.js';
import { createProjectsScene } from './projects.js';
import { createGalleryScene } from './gallery.js';
import { createStackScene } from './stack.js';
import { createBehindScene } from './behind.js';
import { createContactScene } from './contact.js';
import { createEndingScene } from './ending.js';

// Keys match the <section id="..."> values in index.html.
export const registry = {
  intro: createIntroScene,
  india: createIndiaScene,
  about: createAboutScene,
  world: createWorldScene,
  development: createDevelopmentScene,
  apps: createAppsScene,
  linux: createLinuxScene,
  security: createSecurityScene,
  projects: createProjectsScene,
  gallery: createGalleryScene,
  stack: createStackScene,
  behind: createBehindScene,
  contact: createContactScene,
  ending: createEndingScene,
};
