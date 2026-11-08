import { useSyncExternalStore } from 'react';
import initialUsers from '../seed/users.json';
import { STORAGE_KEYS } from '../constants/storage';
import type { User, Role } from '../types/common.types';

// Load stored user initially from localStorage
function getInitialUser(): User | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (raw) {
      return JSON.parse(raw) as User;
    }
  } catch {
    // fallback
  }
  return null;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

let currentState: AuthState = {
  user: getInitialUser(),
  isAuthenticated: Boolean(getInitialUser()),
};

// Listeners set for Pub/Sub pattern
const listeners = new Set<() => void>();

function notify(): void {
  for (const listener of listeners) {
    listener();
  }
}

function updateState(nextUser: User | null): void {
  currentState = {
    user: nextUser,
    isAuthenticated: Boolean(nextUser),
  };

  if (nextUser) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(nextUser));
  } else {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
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

  login(username: string): boolean {
    const users = initialUsers as User[];
    const match = users.find((u) => u.username.toLowerCase() === username.trim().toLowerCase());
    if (match) {
      updateState(match);
      return true;
    }
    return false;
  },

  loginAsRole(role: Role): boolean {
    const users = initialUsers as User[];
    const match = users.find((u) => u.role === role);
    if (match) {
      updateState(match);
      return true;
    }
    return false;
  },

  logout(): void {
    updateState(null);
  },
};

// React hook for components using useSyncExternalStore
export function useAuthStore(): AuthState & {
  login: (username: string) => boolean;
  loginAsRole: (role: Role) => boolean;
  logout: () => void;
} {
  const state = useSyncExternalStore(
    authStore.subscribe,
    authStore.getState,
    authStore.getState
  );

  return {
    ...state,
    login: authStore.login,
    loginAsRole: authStore.loginAsRole,
    logout: authStore.logout,
  };
}
