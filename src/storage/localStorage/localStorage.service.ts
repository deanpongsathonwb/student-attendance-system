/**
 * LocalStorage abstraction with safe JSON parsing and error handling
 */
export const localStorageService = {
  getItem<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(key);
      if (item === null) {
        return defaultValue;
      }
      return JSON.parse(item) as T;
    } catch {
      return defaultValue;
    }
  },

  setItem<T>(key: string, value: T): boolean {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  },

  removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch {
      // fallback
    }
  },

  clear(): void {
    try {
      localStorage.clear();
    } catch {
      // fallback
    }
  },
};
