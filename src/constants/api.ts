export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    ME: '/api/auth/me',
  },
  ATTENDANCE: {
    SUBJECT: '/api/attendance/subject',
    HOMEROOM: '/api/attendance/homeroom',
    REPORTS: '/api/attendance/reports',
  },
  STUDENTS: {
    BASE: '/api/students',
    BY_CLASSROOM: '/api/students/classroom',
  },
  CLASSROOMS: {
    BASE: '/api/classrooms',
  },
  SETTINGS: {
    BASE: '/api/settings',
  },
  NOTIFICATIONS: {
    SEND: '/api/notifications/send',
  },
} as const;
