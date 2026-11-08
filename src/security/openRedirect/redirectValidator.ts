import { ROUTES } from '../../constants/routes';

/**
 * Validates that a redirect path is internal and safe against Open Redirect attacks
 */
export function isInternalRedirect(path: string): boolean {
  if (!path || typeof path !== 'string') {
    return false;
  }

  // Must start with single slash, not protocol-relative "//" or schemes "javascript:", "data:", "http:"
  if (!path.startsWith('/') || path.startsWith('//') || path.startsWith('/\\')) {
    return false;
  }

  const validPaths = [
    '/',
    ROUTES.PUBLIC.LOGIN,
    ROUTES.TEACHER.ATTENDANCE,
    ROUTES.TEACHER.REPORTS,
    ROUTES.TEACHER.COURSES,
    ROUTES.ADVISOR.HOMEROOM_CHECK,
    ROUTES.ADVISOR.CLASSROOM_SUMMARY,
    ROUTES.ADVISOR.ABSENCE_FOLLOWUP,
    ROUTES.ADMIN.OVERVIEW,
    ROUTES.ADMIN.STUDENTS,
    ROUTES.ADMIN.SETTINGS,
  ];

  return validPaths.includes(path as (typeof validPaths)[number]);
}

export function sanitizeRedirectPath(path: string, fallback: string = ROUTES.PUBLIC.LOGIN): string {
  if (isInternalRedirect(path)) {
    return path;
  }
  return fallback;
}
