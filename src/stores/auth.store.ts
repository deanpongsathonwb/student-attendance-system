import { useSyncExternalStore } from 'react';
import { STORAGE_KEYS } from '../constants/storage';
import { localStorageService } from '../storage/localStorage/localStorage.service';
import type { User } from '../types/common.types';

const SESSION_TOKEN_KEY = 'app_auth_session_token';

function getInitialToken(): string | null {
  try {
    return sessionStorage.getItem(SESSION_TOKEN_KEY);
  } catch {
    return null;
  }
}

function getInitialUser(): User | null {
  const token = getInitialToken();
  if (!token) {
    return null;
  }
  return localStorageService.getItem<User | null>(STORAGE_KEYS.CURRENT_USER, null);
}

export function generateSecureToken(): string {
  const bytes = new Uint8Array(32);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
    return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  }
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

let currentState: AuthState = {
  user: getInitialUser(),
  token: getInitialToken(),
  isAuthenticated: Boolean(getInitialUser() && getInitialToken()),
};

// Global Pub/Sub listener registry
const listeners = new Set<() => void>();

function notify(): void {
  for (const listener of listeners) {
    listener();
  }
}

function updateState(nextUser: User | null, nextToken: string | null): void {
  currentState = {
    user: nextUser,
    token: nextToken,
    isAuthenticated: Boolean(nextUser && nextToken),
  };

  if (nextUser && nextToken) {
    localStorageService.setItem(STORAGE_KEYS.CURRENT_USER, nextUser);
    try {
      sessionStorage.setItem(SESSION_TOKEN_KEY, nextToken);
    } catch {
      // fallback
    }
  } else {
    localStorageService.removeItem(STORAGE_KEYS.CURRENT_USER);
    try {
      sessionStorage.removeItem(SESSION_TOKEN_KEY);
    } catch {
      // fallback
    }
  }

  notify();
}

export const authStore = {
  getState(): AuthState {
    return currentState;
  },

  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },

  setUser(user: User, token?: string): void {
    const sessionToken = token || currentState.token || generateSecureToken();
    updateState(user, sessionToken);
  },

  logout(): void {
    updateState(null, null);
  },
};

// React hook for components using useSyncExternalStore
export function useAuthStore(): AuthState & {
  setUser: (user: User, token?: string) => void;
  logout: () => void;
} {
  const state = useSyncExternalStore(
    authStore.subscribe,
    authStore.getState,
    authStore.getState
  );

  return {
    ...state,
    setUser: authStore.setUser,
    logout: authStore.logout,
  };
}
