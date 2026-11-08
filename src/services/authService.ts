import { authStore } from '../stores/auth.store';
import { refreshCsrfToken } from '../security/csrf/csrfHandler';
import { sanitizeString } from '../security/xss/sanitizer';
import { sanitizeRedirectPath } from '../security/openRedirect/redirectValidator';
import { ROUTES } from '../constants/routes';
import type { User, Role } from '../types/common.types';

export const authService = {
  login(username: string, password: string): User | null {
    const cleanUsername = sanitizeString(username);
    const user = authStore.login(cleanUsername, password);
    if (user) {
      refreshCsrfToken();
    }
    return user;
  },

  logout(): void {
    authStore.logout();
    refreshCsrfToken();
  },

  getCurrentUser(): User | null {
    return authStore.getState().user;
  },

  isAuthenticated(): boolean {
    return authStore.getState().isAuthenticated;
  },

  getRedirectPathForRole(role: Role): string {
    let target: string = ROUTES.PUBLIC.LOGIN;
    if (role === 'teacher') {
      target = ROUTES.TEACHER.ATTENDANCE;
    } else if (role === 'advisor') {
      target = ROUTES.ADVISOR.HOMEROOM_CHECK;
    } else if (role === 'admin') {
      target = ROUTES.ADMIN.OVERVIEW;
    }
    return sanitizeRedirectPath(target, ROUTES.PUBLIC.LOGIN);
  },
};
