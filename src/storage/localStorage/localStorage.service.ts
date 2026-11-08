/**
 * LocalStorage abstraction with safe JSON parsing, error handling,
 * and Cross-Tab Concurrency Event Synchronization.
 */

type StorageSubscriber<T> = (newValue: T | null) => void;

class LocalStorageService {
  private subscribers = new Map<string, Set<StorageSubscriber<unknown>>>();

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (event: StorageEvent) => {
        if (!event.key) return;
        const set = this.subscribers.get(event.key);
        if (set && set.size > 0) {
          let parsed: unknown = null;
          try {
            parsed = event.newValue ? JSON.parse(event.newValue) : null;
          } catch {
            parsed = event.newValue;
          }
          for (const callback of set) {
            callback(parsed);
          }
        }
      });
    }
  }

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
  }

  setItem<T>(key: string, value: T): boolean {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      this.notifySubscribers(key, value);
      return true;
    } catch {
      return false;
    }
  }

  removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
      this.notifySubscribers(key, null);
    } catch {
      // fallback
    }
  }

  clear(): void {
    try {
      localStorage.clear();
      for (const [key] of this.subscribers) {
        this.notifySubscribers(key, null);
      }
    } catch {
      // fallback
    }
  }

  /**
   * Subscribe to changes on a specific storage key (both within the current tab and across other tabs)
   */
  subscribe<T>(key: string, callback: StorageSubscriber<T>): () => void {
    if (!this.subscribers.has(key)) {
      this.subscribers.set(key, new Set());
    }
    const set = this.subscribers.get(key)!;
    set.add(callback as StorageSubscriber<unknown>);

    return () => {
      set.delete(callback as StorageSubscriber<unknown>);
      if (set.size === 0) {
        this.subscribers.delete(key);
      }
    };
  }

  private notifySubscribers(key: string, value: unknown): void {
    const set = this.subscribers.get(key);
    if (set) {
      for (const callback of set) {
        callback(value);
      }
    }
  }
}

export const localStorageService = new LocalStorageService();
