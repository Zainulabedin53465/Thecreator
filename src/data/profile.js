// Single source of truth. Scenes read from here; nothing is invented elsewhere.
export const profile = {
  name: 'Jainul Abedin',
  age: 22,
  country: 'India',
  state: 'Odisha',
  city: 'Jagatsinghpur',
  pin: '754135',
  showPin: true,

  phoneDisplay: '7205863822',
  tel: 'tel:+917205863822',
  whatsapp: 'https://wa.me/917205863822',

  // Add ONLY real links here, e.g. { label: 'GitHub', url: 'https://...' }
  socials: [],

  // Verified: used to build this website, or stated by you.
  stack: {
    languages: ['JavaScript', 'HTML', 'CSS'],
    web: ['Three.js', 'WebGL', 'GSAP', 'Vite'],
    os: ['Linux', 'Parrot OS', 'Debian'],
  },

  // Waiting for your confirmation. NOT shown on the site until moved above.
  stackPending: ['Python', 'Dart', 'Flutter', 'Git', 'Code editor'],

  projects: [
    { id: 'flashlight', title: 'Flashlight', kind: 'Mobile app',
      blurb: 'A simple mobile application built as part of my app development journey.' },
    { id: 'notepad', title: 'Notepad', kind: 'Mobile app',
      blurb: 'A lightweight notes application.' },
    { id: 'web', title: 'Web Experiences', kind: 'Web',
      blurb: 'Interactive experiments exploring modern web development and animation.' },
    { id: 'world', title: '3D World', kind: 'WebGL',
      blurb: 'A realtime browser-based experiment.' },
  ],
};
