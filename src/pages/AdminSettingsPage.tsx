import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Save, CheckCircle2, ShieldCheck, Bell, School } from 'lucide-react';
import ui from '../constants/ui.json';
import { getStoredSettings } from '../utils/dataStore';
import { settingsService } from '../services/settingsService';
import { sanitizeString } from '../security/xss/sanitizer';
import type { SystemSettings } from '../types/common.types';

export const AdminSettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<SystemSettings>(() => getStoredSettings());
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Cross-tab concurrency synchronization
  useEffect(() => {
    const unsubscribe = settingsService.subscribe((newSettings) => {
      if (newSettings) {
        setSettings(newSettings);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const sanitized: SystemSettings = {
        ...settings,
        systemOwner: sanitizeString(settings.systemOwner),
        academicYear: sanitizeString(settings.academicYear),
        semester: sanitizeString(settings.semester),
        morningCheckCutoffTime: sanitizeString(settings.morningCheckCutoffTime),
        emergencyContact: sanitizeString(settings.emergencyContact),
      };
      await settingsService.saveSettings(sanitized);
      setSavedSuccess(true);
      setTimeout(() => {
        setSavedSuccess(false);
      }, 2000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            {ui.settings.pageTitle}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {settings.systemOwner}
          </p>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2 text-xs font-medium text-emerald-800">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{ui.settings.savedSuccessMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 text-xs">
        {/* Section 1: Organization & Academic Cycle */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <School className="w-4 h-4 text-blue-700" />
            <span>{ui.settings.systemOwnerLabel}</span>
          </h3>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                {ui.settings.systemOwnerLabel}
              </label>
              <input
                type="text"
                required
                value={settings.systemOwner}
                onChange={(e) =>
                  setSettings((prev) => ({ ...prev, systemOwner: e.target.value }))
                }
                className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-900 font-semibold focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                {ui.settings.academicYearLabel}
              </label>
              <input
                type="text"
                required
                value={settings.academicYear}
                onChange={(e) =>
                  setSettings((prev) => ({ ...prev, academicYear: e.target.value }))
                }
                className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">
                {ui.settings.semesterLabel}
              </label>
              <input
                type="text"
                required
                value={settings.semester}
                onChange={(e) =>
                  setSettings((prev) => ({ ...prev, semester: e.target.value }))
                }
                className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Attendance Rules & Cutoffs */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <ShieldCheck className="w-4 h-4 text-blue-700" />
            <span>{ui.attendance.stats.minimumRequirement}</span>
          </h3>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                {ui.settings.morningCutoffLabel}
              </label>
              <input
                type="text"
                required
                value={settings.morningCheckCutoffTime}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    morningCheckCutoffTime: e.target.value,
                  }))
                }
                className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-900 font-mono focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">
                {ui.settings.lateThresholdLabel}
                {ui.symbols.parenthesisOpen}
                {ui.units.minutes}
                {ui.symbols.parenthesisClose}
              </label>
              <input
                type="number"
                required
                value={settings.lateThresholdMinutes}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    lateThresholdMinutes: Number(e.target.value),
                  }))
                }
                className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-900 font-mono focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">
                {ui.settings.minimumAttendanceLabel}
                {ui.symbols.parenthesisOpen}
                {ui.units.percentage}
                {ui.symbols.parenthesisClose}
              </label>
              <input
                type="number"
                required
                value={settings.minimumAttendancePercentage}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    minimumAttendancePercentage: Number(e.target.value),
                  }))
                }
                className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-900 font-mono focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                {ui.settings.autoLockHoursLabel}
                {ui.symbols.parenthesisOpen}
                {ui.units.hours}
                {ui.symbols.parenthesisClose}
              </label>
              <input
                type="number"
                required
                value={settings.autoLockAttendanceHours}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    autoLockAttendanceHours: Number(e.target.value),
                  }))
                }
                className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-900 font-mono focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">
                {ui.settings.emergencyContactLabel}
              </label>
              <input
                type="text"
                required
                value={settings.emergencyContact}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    emergencyContact: e.target.value,
                  }))
                }
                className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-900 font-mono focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Notification Channels */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Bell className="w-4 h-4 text-blue-700" />
            <span>{ui.modals.sendNotificationAction}</span>
          </h3>

          <div className="space-y-3">
            <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enableSmsAlert}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    enableSmsAlert: e.target.checked,
                  }))
                }
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="font-medium text-slate-800">
                {ui.settings.smsAlertLabel}
              </span>
            </label>

            <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enableLineNotification}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    enableLineNotification: e.target.checked,
                  }))
                }
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="font-medium text-slate-800">
                {ui.settings.lineNotificationLabel}
              </span>
            </label>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`flex items-center gap-2 px-6 py-2.5 text-xs font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors shadow-xs ${
              isSubmitting ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'
            }`}
          >
            <Save className="w-4 h-4" />
            <span>{isSubmitting ? ui.feedback.saving : ui.settings.saveSettingsButton}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
