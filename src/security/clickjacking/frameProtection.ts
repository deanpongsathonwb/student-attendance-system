/**
 * Client-side clickjacking prevention and frame-busting check
 */
export function ensureTopLevelNavigation(): boolean {
  if (typeof window === 'undefined') {
    return true;
  }

  try {
    if (window.self !== window.top) {
      if (window.top) {
        window.top.location.href = window.self.location.href;
      }
      return false;
    }
  } catch {
    // Cross-origin iframe detected, block rendering
    return false;
  }

  return true;
}
