import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User as UserIcon, AlertCircle } from 'lucide-react';
import ui from '../constants/ui.json';
import { ROUTES } from '../constants/routes';
import { getStoredSettings } from '../utils/dataStore';
import { sanitizeString } from '../security/xss/sanitizer';
import { authService } from '../services/authService';
import { settingsService } from '../services/settingsService';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const settings = getStoredSettings();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkingInit, setCheckingInit] = useState(true);

  // Check if system is initialized; if not, redirect to Setup
  useEffect(() => {
    let isMounted = true;
    settingsService.isInitialized().then((initialized) => {
      if (isMounted) {
        if (!initialized) {
          navigate(ROUTES.PUBLIC.SETUP, { replace: true });
        } else {
          setCheckingInit(false);
        }
      }
    });
    return () => {
      isMounted = false;
    };
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setErrorMessage('');
    try {
      const cleanUsername = sanitizeString(username);
      const authenticatedUser = await authService.login(cleanUsername, password);
      if (authenticatedUser) {
        const redirectPath = authService.getRedirectPathForRole(authenticatedUser.role);
        navigate(redirectPath);
      } else {
        setErrorMessage(ui.messages.loginFailed);
      }
    } catch {
      setErrorMessage(ui.messages.loginFailed);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (checkingInit) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-slate-500 text-sm font-medium leading-relaxed">
          {ui.feedback.loading}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        {/* System Branding Card */}
        <div className="bg-white rounded-xl shadow-md border border-slate-200 p-8">
          <div className="flex flex-col items-center text-center mb-6">
            <img
              src="/favicon.svg"
              alt=""
              className="w-16 h-16 rounded-xl shadow-xs mb-3 object-contain"
            />
            <h1 className="text-2xl font-bold text-slate-900 leading-normal break-words">
              {ui.system.name}
            </h1>
            <p className="text-sm text-slate-500 mt-1 leading-relaxed break-words">
              {settings.systemOwner}
            </p>
          </div>

          <div className="border-t border-slate-100 pt-6">
            <h2 className="text-base font-semibold text-slate-800 text-center mb-1 leading-normal break-words">
              {ui.auth.loginTitle}
            </h2>
            <p className="text-xs text-slate-500 text-center mb-6 leading-relaxed break-words">
              {ui.auth.loginSubtitle}
            </p>

            {errorMessage && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2 text-xs text-rose-800 leading-relaxed">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span className="break-words">{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1 leading-normal">
                  {ui.auth.usernameLabel}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder={ui.auth.usernamePlaceholder}
                    className="block w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 transition-colors leading-normal"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1 leading-normal">
                  {ui.auth.passwordLabel}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={ui.auth.passwordPlaceholder}
                    className="block w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 transition-colors leading-normal"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-xs text-xs font-medium text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors leading-normal ${
                    isSubmitting ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'
                  }`}
                >
                  {isSubmitting ? ui.feedback.loading : ui.auth.loginButton}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
