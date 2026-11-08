import initialSettings from '../seed/settings.json';
import { STORAGE_KEYS } from '../constants/storage';
import { localStorageService } from '../storage/localStorage/localStorage.service';
import { sanitizeString } from '../security/xss/sanitizer';
import { asyncMutex } from './concurrency/asyncMutex';
import type { SystemSettings } from '../types/common.types';

export const settingsService = {
  getSettings(): SystemSettings {
    return localStorageService.getItem<SystemSettings>(
      STORAGE_KEYS.SETTINGS,
      initialSettings as SystemSettings
    );
  },

  async saveSettings(settings: SystemSettings): Promise<void> {
    return asyncMutex.withLock('settings_mutation_lock', async () => {
      const cleanSettings: SystemSettings = {
        ...settings,
        systemOwner: sanitizeString(settings.systemOwner),
        academicYear: sanitizeString(settings.academicYear),
        semester: sanitizeString(settings.semester),
        morningCheckCutoffTime: sanitizeString(settings.morningCheckCutoffTime),
        emergencyContact: sanitizeString(settings.emergencyContact),
      };
      localStorageService.setItem(STORAGE_KEYS.SETTINGS, cleanSettings);
    });
  },

  subscribe(callback: (settings: SystemSettings | null) => void): () => void {
    return localStorageService.subscribe<SystemSettings>(
      STORAGE_KEYS.SETTINGS,
      callback
    );
  },
};
