import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, User as UserIcon, AlertCircle, CheckCircle2 } from 'lucide-react';
import ui from '../constants/ui.json';
import { ROUTES } from '../constants/routes';
import { authService } from '../services/authService';
import { settingsService } from '../services/settingsService';
import { sanitizeString } from '../security/xss/sanitizer';

export const AccountSetupPage: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkingInit, setCheckingInit] = useState(true);

  // Guard: if already initialized, redirect to login
  useEffect(() => {
    let isMounted = true;
    settingsService.isInitialized().then((initialized) => {
      if (isMounted) {
        if (initialized) {
          navigate(ROUTES.PUBLIC.LOGIN, { replace: true });
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
    setErrorMessage('');

    if (password.length < 8) {
      setErrorMessage(ui.setup.passwordMinLength);
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage(ui.setup.passwordMismatch);
      return;
    }

    setIsSubmitting(true);
    try {
      const cleanName = sanitizeString(name);
      const cleanEmail = sanitizeString(email);

      await authService.setupPrimaryAccount({
        name: cleanName,
        email: cleanEmail,
        password: password,
      });

      setSuccessMessage(ui.setup.successMessage);
      setTimeout(() => {
        navigate(ROUTES.ADMIN.OVERVIEW, { replace: true });
      }, 1500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMessage(msg);
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
      <div className="w-full max-w-lg">
        {/* Logo at the very top and centered */}
        <div className="flex justify-center mb-6">
          <img
            src="/favicon.svg"
            alt=""
            className="w-20 h-20 rounded-2xl shadow-xs object-contain"
          />
        </div>

        {/* Card Container */}
        <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-8">
          {/* Header on its own separate line below the logo */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-slate-900 leading-normal break-words">
              {ui.setup.title}
            </h1>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed break-words">
              {ui.setup.subtitle}
            </p>
          </div>

          {errorMessage && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3 text-xs text-rose-800 leading-relaxed">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
              <span className="break-words">{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-xs text-emerald-800 leading-relaxed">
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
              <span className="break-words">{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5 text-xs">
            {/* Primary Username */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5 leading-normal">
                {ui.setup.usernameLabel}
              </label>
              <div className="relative">
                <input
                  type="text"
                  disabled
                  value="admin"
                  className="w-full bg-slate-100 border border-slate-300 rounded-xl px-4 py-2.5 text-slate-700 font-mono font-medium opacity-80 cursor-not-allowed leading-normal"
                />
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5 leading-normal">
                {ui.setup.nameLabel}
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={ui.setup.namePlaceholder}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all leading-normal break-words"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5 leading-normal">
                {ui.setup.emailLabel}
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={ui.setup.emailPlaceholder}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all leading-normal break-words"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5 leading-normal">
                {ui.setup.passwordLabel}
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={ui.setup.passwordPlaceholder}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all leading-normal font-mono"
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5 leading-normal">
                {ui.setup.confirmPasswordLabel}
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={ui.setup.confirmPasswordPlaceholder}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all leading-normal font-mono"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-3 px-4 bg-blue-700 hover:bg-blue-800 text-white rounded-xl font-semibold shadow-xs transition-colors flex items-center justify-center gap-2 leading-normal ${
                  isSubmitting ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'
                }`}
              >
                <span>{isSubmitting ? ui.setup.submitting : ui.setup.submitButton}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
