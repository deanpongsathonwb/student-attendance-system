import { supabase } from './supabaseClient';
import { stripUndefined, handleDbError } from './dbHelper';
import { sanitizeString } from '../security/xss/sanitizer';
import { asyncMutex } from './concurrency/asyncMutex';
import { localStorageService } from '../storage/localStorage/localStorage.service';
import { STORAGE_KEYS } from '../constants/storage';
import ui from '../constants/ui.json';
import type { SystemSettings } from '../types/common.types';

const defaultSettings: SystemSettings = {
  systemOwner: ui.system.defaultOwner,
  academicYear: '2569',
  semester: '1',
  morningCheckCutoffTime: '08:00',
  lateThresholdMinutes: 15,
  minimumAttendancePercentage: 80,
  enableSmsAlert: true,
  enableLineNotification: true,
  emergencyContact: '02-999-8888',
  autoLockAttendanceHours: 24,
  isSystemInitialized: false,
};

export const settingsService = {
  getSettingsSync(): SystemSettings {
    return localStorageService.getItem<SystemSettings>(
      STORAGE_KEYS.SETTINGS,
      defaultSettings
    );
  },

  async getSettings(): Promise<SystemSettings> {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .eq('id', 'default')
        .single();

      if (error) {
        handleDbError(error, 'getSettings');
      }

      if (data) {
        const mapped: SystemSettings = {
          systemOwner: data.system_owner,
          academicYear: data.academic_year,
          semester: data.semester,
          morningCheckCutoffTime: data.morning_check_cutoff_time,
          lateThresholdMinutes: data.late_threshold_minutes,
          minimumAttendancePercentage: Number(data.minimum_attendance_percentage),
          enableSmsAlert: Boolean(data.enable_sms_alert),
          enableLineNotification: Boolean(data.enable_line_notification),
          emergencyContact: data.emergency_contact,
          autoLockAttendanceHours: data.auto_lock_attendance_hours,
          isSystemInitialized: Boolean(data.is_system_initialized),
        };
        localStorageService.setItem(STORAGE_KEYS.SETTINGS, mapped);
        return mapped;
      }
    } catch (err) {
      handleDbError(err, 'getSettings');
    }
    return defaultSettings;
  },

  async saveSettings(settings: SystemSettings): Promise<SystemSettings> {
    return asyncMutex.withLock('settings_mutation_lock', async () => {
      const cleanPayload = stripUndefined({
        system_owner: sanitizeString(settings.systemOwner),
        academic_year: sanitizeString(settings.academicYear),
        semester: sanitizeString(settings.semester),
        morning_check_cutoff_time: sanitizeString(settings.morningCheckCutoffTime),
        late_threshold_minutes: Number(settings.lateThresholdMinutes),
        minimum_attendance_percentage: Number(settings.minimumAttendancePercentage),
        enable_sms_alert: Boolean(settings.enableSmsAlert),
        enable_line_notification: Boolean(settings.enableLineNotification),
        emergency_contact: sanitizeString(settings.emergencyContact),
        auto_lock_attendance_hours: Number(settings.autoLockAttendanceHours),
      });

      const { error } = await supabase
        .from('system_settings')
        .update(cleanPayload)
        .eq('id', 'default');

      if (error) {
        handleDbError(error, 'saveSettings');
      }

      // Verify persisted record by reading back
      const verified = await this.getSettings();
      return verified;
    });
  },

  async isInitialized(): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('is_system_initialized')
        .eq('id', 'default')
        .single();

      if (error) {
        handleDbError(error, 'isInitialized');
      }

      const { data: primaryAccount, error: accError } = await supabase
        .from('accounts')
        .select('must_set_password')
        .eq('id', 'u-primary')
        .single();

      if (accError) {
        handleDbError(accError, 'isInitializedCheckPrimary');
      }

      const initialized = Boolean(data?.is_system_initialized && primaryAccount && !primaryAccount.must_set_password);
      return initialized;
    } catch (err) {
      handleDbError(err, 'isInitialized');
    }
  },

  async resetSystemInitialization(): Promise<void> {
    return asyncMutex.withLock('settings_mutation_lock', async () => {
      // 1. Reset system_settings
      const { error: setErr } = await supabase
        .from('system_settings')
        .update({ is_system_initialized: false })
        .eq('id', 'default');

      if (setErr) {
        handleDbError(setErr, 'resetSettings');
      }

      // 2. Reset u-primary account to require password setup
      const { error: accErr } = await supabase
        .from('accounts')
        .update({ must_set_password: true })
        .eq('id', 'u-primary');

      if (accErr) {
        handleDbError(accErr, 'resetPrimaryAccount');
      }

      // 3. Clear local session cache
      localStorageService.removeItem(STORAGE_KEYS.SETTINGS);
      localStorageService.removeItem(STORAGE_KEYS.CURRENT_USER);
    });
  },

  subscribe(callback: (settings: SystemSettings | null) => void): () => void {
    return localStorageService.subscribe<SystemSettings>(
      STORAGE_KEYS.SETTINGS,
      callback
    );
  },
};
