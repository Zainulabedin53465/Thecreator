// Vite turns each match into a hashed, cacheable URL. Loaded lazily, never at boot.
// Pattern img-NN.webp = numbered images only (the screenshot is excluded for now).
const modules = import.meta.glob('../assets/gallery/img-[0-9][0-9].webp', {
  query: '?url',
  import: 'default',
});

export const galleryLoaders = Object.keys(modules).sort().map((k) => modules[k]);
