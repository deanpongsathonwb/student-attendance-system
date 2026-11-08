export const ROUTES = {
  PUBLIC: {
    LOGIN: '/login',
  },
  TEACHER: {
    ATTENDANCE: '/teacher/attendance',
    REPORTS: '/teacher/reports',
    COURSES: '/teacher/courses',
  },
  ADVISOR: {
    HOMEROOM_CHECK: '/advisor/homeroom-check',
    CLASSROOM_SUMMARY: '/advisor/classroom-summary',
    ABSENCE_FOLLOWUP: '/advisor/absence-followup',
  },
  ADMIN: {
    OVERVIEW: '/admin/overview',
    STUDENTS: '/admin/students',
    SETTINGS: '/admin/settings',
  },
} as const;
