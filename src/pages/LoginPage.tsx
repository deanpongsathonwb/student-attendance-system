import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Lock, User as UserIcon, AlertCircle } from 'lucide-react';
import ui from '../constants/ui.json';
import { ROUTES } from '../constants/routes';
import { getUsers, setStoredCurrentUser, getStoredSettings } from '../utils/dataStore';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const settings = getStoredSettings();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const users = getUsers();
    const foundUser = users.find((u) => u.username.toLowerCase() === username.trim().toLowerCase());

    if (foundUser) {
      setStoredCurrentUser(foundUser);
      if (foundUser.role === 'teacher') {
        navigate(ROUTES.TEACHER.ATTENDANCE);
      } else if (foundUser.role === 'advisor') {
        navigate(ROUTES.ADVISOR.HOMEROOM_CHECK);
      } else if (foundUser.role === 'admin') {
        navigate(ROUTES.ADMIN.OVERVIEW);
      }
    } else {
      setErrorMessage(ui.messages.loginFailed);
    }
  };

  const handleSelectDemoUser = (demoUsername: string) => {
    setUsername(demoUsername);
    setPassword('123456');
    setErrorMessage('');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        {/* System Branding Card */}
        <div className="bg-white rounded-xl shadow-md border border-slate-200 p-8">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-14 h-14 rounded-xl bg-blue-700 flex items-center justify-center text-white shadow-sm mb-3">
              <GraduationCap className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 leading-tight">
              {ui.system.name}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {settings.systemOwner}
            </p>
          </div>

          <div className="border-t border-slate-100 pt-6">
            <h2 className="text-base font-semibold text-slate-800 text-center mb-1">
              {ui.auth.loginTitle}
            </h2>
            <p className="text-xs text-slate-500 text-center mb-6">
              {ui.auth.loginSubtitle}
            </p>

            {errorMessage && (
              <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 flex items-center gap-2 text-xs text-rose-700">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  {ui.auth.usernameLabel}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    placeholder={ui.auth.usernamePlaceholder}
                    className="block w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  {ui.auth.passwordLabel}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder={ui.auth.passwordPlaceholder}
                    className="block w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-2 py-2.5 px-4 bg-blue-700 hover:bg-blue-800 text-white font-medium rounded-lg text-sm transition-colors shadow-xs cursor-pointer"
              >
                {ui.auth.loginButton}
              </button>
            </form>

            {/* Quick Demo Credentials Selection */}
            <div className="mt-6 pt-5 border-t border-slate-200">
              <span className="block text-xs font-semibold text-slate-600 mb-2">
                {ui.auth.demoHint}
              </span>
              <div className="grid grid-cols-1 gap-1.5">
                <button
                  type="button"
                  onClick={() => handleSelectDemoUser('teacher')}
                  className="w-full text-left px-3 py-1.5 rounded-md bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 text-xs text-slate-700 hover:text-blue-700 transition-colors cursor-pointer"
                >
                  {ui.auth.roleTeacherHint}
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectDemoUser('advisor')}
                  className="w-full text-left px-3 py-1.5 rounded-md bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 text-xs text-slate-700 hover:text-blue-700 transition-colors cursor-pointer"
                >
                  {ui.auth.roleAdvisorHint}
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectDemoUser('admin')}
                  className="w-full text-left px-3 py-1.5 rounded-md bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 text-xs text-slate-700 hover:text-blue-700 transition-colors cursor-pointer"
                >
                  {ui.auth.roleAdminHint}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
