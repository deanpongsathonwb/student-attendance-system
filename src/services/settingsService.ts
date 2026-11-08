import initialSettings from '../seed/settings.json';
import { STORAGE_KEYS } from '../constants/storage';
import { localStorageService } from '../storage/localStorage/localStorage.service';
import { sanitizeString } from '../security/xss/sanitizer';
import type { SystemSettings } from '../types/common.types';

export const settingsService = {
  getSettings(): SystemSettings {
    return localStorageService.getItem<SystemSettings>(
      STORAGE_KEYS.SETTINGS,
      initialSettings as SystemSettings
    );
  },

  saveSettings(settings: SystemSettings): void {
    const cleanSettings: SystemSettings = {
      ...settings,
      systemOwner: sanitizeString(settings.systemOwner),
      academicYear: sanitizeString(settings.academicYear),
      semester: sanitizeString(settings.semester),
      morningCheckCutoffTime: sanitizeString(settings.morningCheckCutoffTime),
      emergencyContact: sanitizeString(settings.emergencyContact),
    };
    localStorageService.setItem(STORAGE_KEYS.SETTINGS, cleanSettings);
  },
};
