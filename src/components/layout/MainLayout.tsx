import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  CalendarCheck,
  BarChart3,
  BookOpen,
  Users,
  Building,
  Settings as SettingsIcon,
  LogOut,
  UserCheck,
  FileSpreadsheet,
  AlertCircle,
  GraduationCap,
} from 'lucide-react';
import ui from '../../constants/ui.json';
import { ROUTES } from '../../constants/routes';
import { getStoredSettings, getUserAvatar } from '../../utils/dataStore';
import { useAuthStore } from '../../stores/auth.store';
import { authService } from '../../services/authService';
import type { Role } from '../../types/common.types';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuthStore();
  const settings = getStoredSettings();

  const handleLogout = () => {
    authService.logout();
    navigate(ROUTES.PUBLIC.LOGIN);
  };

  if (!currentUser) {
    return null;
  }

  const role: Role = currentUser.role;

  return (
    <div className="flex flex-col min-h-screen bg-slate-100 min-w-[1280px]">
      {/* Top Header */}
      <header className="h-18 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0 shadow-xs">
        <div className="flex items-center gap-4">
          <img
            src="/favicon.svg"
            alt=""
            className="w-11 h-11 rounded-lg shadow-xs object-contain"
          />
          <div className="flex flex-col">
            <h1 className="text-xl font-bold text-slate-900 leading-tight tracking-tight">
              {ui.system.name}
            </h1>
            <span className="text-xs font-medium text-slate-500 leading-normal">
              {settings.systemOwner}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-100 rounded-md text-xs font-medium text-blue-800">
            <span>{ui.layout.activeSemester}</span>
            <span className="font-semibold">{settings.semester}</span>
            <span className="text-slate-400">{ui.symbols.slash}</span>
            <span>{ui.layout.academicYear}</span>
            <span className="font-semibold">{settings.academicYear}</span>
          </div>

          <div className="flex items-center gap-2 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-md">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>{ui.layout.statusLabel}</span>
          </div>
        </div>
      </header>

      {/* Main Container with Sidebar + Content */}
      <div className="flex flex-1">
        {/* Left Sidebar */}
        <aside className="w-72 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0">
          {/* Navigation Menu */}
          <nav className="p-4 space-y-1.5">
            {role === 'teacher' && (
              <>
                <NavLink
                  to={ROUTES.TEACHER.ATTENDANCE}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`
                  }
                >
                  <CalendarCheck className="w-5 h-5" />
                  <span>{ui.nav.teacher.attendance}</span>
                </NavLink>

                <NavLink
                  to={ROUTES.TEACHER.REPORTS}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`
                  }
                >
                  <BarChart3 className="w-5 h-5" />
                  <span>{ui.nav.teacher.reports}</span>
                </NavLink>

                <NavLink
                  to={ROUTES.TEACHER.COURSES}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`
                  }
                >
                  <BookOpen className="w-5 h-5" />
                  <span>{ui.nav.teacher.courses}</span>
                </NavLink>
              </>
            )}

            {role === 'advisor' && (
              <>
                <NavLink
                  to={ROUTES.ADVISOR.HOMEROOM_CHECK}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`
                  }
                >
                  <UserCheck className="w-5 h-5" />
                  <span>{ui.nav.advisor.homeroomCheck}</span>
                </NavLink>

                <NavLink
                  to={ROUTES.ADVISOR.CLASSROOM_SUMMARY}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`
                  }
                >
                  <FileSpreadsheet className="w-5 h-5" />
                  <span>{ui.nav.advisor.classroomSummary}</span>
                </NavLink>

                <NavLink
                  to={ROUTES.ADVISOR.ABSENCE_FOLLOWUP}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`
                  }
                >
                  <AlertCircle className="w-5 h-5" />
                  <span>{ui.nav.advisor.absenceFollowup}</span>
                </NavLink>
              </>
            )}

            {role === 'admin' && (
              <>
                <NavLink
                  to={ROUTES.ADMIN.OVERVIEW}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`
                  }
                >
                  <Building className="w-5 h-5" />
                  <span>{ui.nav.admin.overview}</span>
                </NavLink>

                <NavLink
                  to={ROUTES.ADMIN.STUDENTS}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`
                  }
                >
                  <Users className="w-5 h-5" />
                  <span>{ui.nav.admin.students}</span>
                </NavLink>

                <NavLink
                  to={ROUTES.ADMIN.SETTINGS}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`
                  }
                >
                  <SettingsIcon className="w-5 h-5" />
                  <span>{ui.nav.admin.settings}</span>
                </NavLink>
              </>
            )}
          </nav>

          {/* Bottom-left sidebar footer: Single source of interaction for user profile and logout */}
          <div className="p-4 border-t border-slate-200 bg-slate-50">
            <div className="flex items-center gap-3 mb-3">
              <img
                src={getUserAvatar(currentUser.id)}
                alt={currentUser.fullName}
                className="w-10 h-10 rounded-full object-cover border border-slate-200"
              />
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-sm font-semibold text-slate-800 truncate">
                  {currentUser.fullName}
                </span>
                <span className="text-xs text-blue-700 font-medium truncate">
                  {ui.roles[currentUser.role]}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-md transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>{ui.auth.logoutButton}</span>
            </button>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 p-8 overflow-y-auto min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
};
