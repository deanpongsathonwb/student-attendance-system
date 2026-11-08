import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { ROUTES } from '../constants/routes';
import { getStoredCurrentUser } from '../utils/dataStore';
import { MainLayout } from '../components/layout/MainLayout';
import { LoginPage } from '../pages/LoginPage';
import { TeacherAttendancePage } from '../pages/TeacherAttendancePage';
import { TeacherReportsPage } from '../pages/TeacherReportsPage';
import { TeacherCoursesPage } from '../pages/TeacherCoursesPage';
import { AdvisorHomeroomPage } from '../pages/AdvisorHomeroomPage';
import { AdvisorSummaryPage } from '../pages/AdvisorSummaryPage';
import { AdvisorAbsenceFollowupPage } from '../pages/AdvisorAbsenceFollowupPage';
import { AdminOverviewPage } from '../pages/AdminOverviewPage';
import { AdminStudentsPage } from '../pages/AdminStudentsPage';
import { AdminSettingsPage } from '../pages/AdminSettingsPage';
import type { Role } from '../types/common.types';

// Helper to get role default path
export const getRoleHomePath = (role: Role): string => {
  if (role === 'teacher') return ROUTES.TEACHER.ATTENDANCE;
  if (role === 'advisor') return ROUTES.ADVISOR.HOMEROOM_CHECK;
  return ROUTES.ADMIN.OVERVIEW;
};

// Guard for unauthenticated public routes (e.g. login)
export const PublicRouteGuard: React.FC = () => {
  const user = getStoredCurrentUser();
  if (user) {
    return React.createElement(Navigate, { to: getRoleHomePath(user.role), replace: true });
  }
  return React.createElement(Outlet, null);
};

// Guard for role-protected routes
interface ProtectedRouteGuardProps {
  allowedRole: Role;
}

export const ProtectedRouteGuard: React.FC<ProtectedRouteGuardProps> = ({ allowedRole }) => {
  const user = getStoredCurrentUser();

  if (!user) {
    return React.createElement(Navigate, { to: ROUTES.PUBLIC.LOGIN, replace: true });
  }

  if (user.role !== allowedRole) {
    return React.createElement(Navigate, { to: getRoleHomePath(user.role), replace: true });
  }

  return React.createElement(MainLayout, null, React.createElement(Outlet, null));
};

// Root index redirector
export const RootRedirect: React.FC = () => {
  const user = getStoredCurrentUser();
  if (!user) {
    return React.createElement(Navigate, { to: ROUTES.PUBLIC.LOGIN, replace: true });
  }
  return React.createElement(Navigate, { to: getRoleHomePath(user.role), replace: true });
};

export const routesConfig = [
  {
    path: '/',
    element: React.createElement(RootRedirect, null),
  },
  {
    element: React.createElement(PublicRouteGuard, null),
    children: [
      {
        path: ROUTES.PUBLIC.LOGIN,
        element: React.createElement(LoginPage, null),
      },
    ],
  },
  // Teacher routes
  {
    element: React.createElement(ProtectedRouteGuard, { allowedRole: 'teacher' }),
    children: [
      {
        path: ROUTES.TEACHER.ATTENDANCE,
        element: React.createElement(TeacherAttendancePage, null),
      },
      {
        path: ROUTES.TEACHER.REPORTS,
        element: React.createElement(TeacherReportsPage, null),
      },
      {
        path: ROUTES.TEACHER.COURSES,
        element: React.createElement(TeacherCoursesPage, null),
      },
    ],
  },
  // Advisor routes
  {
    element: React.createElement(ProtectedRouteGuard, { allowedRole: 'advisor' }),
    children: [
      {
        path: ROUTES.ADVISOR.HOMEROOM_CHECK,
        element: React.createElement(AdvisorHomeroomPage, null),
      },
      {
        path: ROUTES.ADVISOR.CLASSROOM_SUMMARY,
        element: React.createElement(AdvisorSummaryPage, null),
      },
      {
        path: ROUTES.ADVISOR.ABSENCE_FOLLOWUP,
        element: React.createElement(AdvisorAbsenceFollowupPage, null),
      },
    ],
  },
  // Admin routes
  {
    element: React.createElement(ProtectedRouteGuard, { allowedRole: 'admin' }),
    children: [
      {
        path: ROUTES.ADMIN.OVERVIEW,
        element: React.createElement(AdminOverviewPage, null),
      },
      {
        path: ROUTES.ADMIN.STUDENTS,
        element: React.createElement(AdminStudentsPage, null),
      },
      {
        path: ROUTES.ADMIN.SETTINGS,
        element: React.createElement(AdminSettingsPage, null),
      },
    ],
  },
  {
    path: '*',
    element: React.createElement(RootRedirect, null),
  },
];
