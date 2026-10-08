// True graceful degradation: if this returns false, no canvas is ever created.
// The already-real HTML content from Phase 2 is the fallback, not a "sorry" message.
export function hasWebGL() {
  try {
    const canvas = document.createElement('canvas');
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl2') || canvas.getContext('webgl'))
    );
  } catch {
    return false;
  }
}
