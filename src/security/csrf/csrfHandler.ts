const CSRF_TOKEN_KEY = 'app_sec_csrf_token';

/**
 * Client-side anti-CSRF token generator and manager
 */
export function getCsrfToken(): string {
  try {
    let token = sessionStorage.getItem(CSRF_TOKEN_KEY);
    if (!token) {
      token = generateRandomToken();
      sessionStorage.setItem(CSRF_TOKEN_KEY, token);
    }
    return token;
  } catch {
    return generateRandomToken();
  }
}

export function refreshCsrfToken(): string {
  const token = generateRandomToken();
  try {
    sessionStorage.setItem(CSRF_TOKEN_KEY, token);
  } catch {
    // fallback
  }
  return token;
}

function generateRandomToken(): string {
  const bytes = new Uint8Array(24);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
    return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  }
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}
