import { useSyncExternalStore } from 'react';
import initialUsers from '../seed/users.json';
import { STORAGE_KEYS } from '../constants/storage';
import { localStorageService } from '../storage/localStorage/localStorage.service';
import type { User } from '../types/common.types';

// Load stored authenticated user from persistent storage
function getInitialUser(): User | null {
  return localStorageService.getItem<User | null>(STORAGE_KEYS.CURRENT_USER, null);
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

let currentState: AuthState = {
  user: getInitialUser(),
  isAuthenticated: Boolean(getInitialUser()),
};

// Global Pub/Sub listener registry
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
    localStorageService.setItem(STORAGE_KEYS.CURRENT_USER, nextUser);
  } else {
    localStorageService.removeItem(STORAGE_KEYS.CURRENT_USER);
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

  login(username: string, password: string): User | null {
    const users = initialUsers as User[];
    const trimmedUsername = username.trim().toLowerCase();
    const match = users.find(
      (u) =>
        u.username.toLowerCase() === trimmedUsername &&
        (!u.password || u.password === password)
    );

    if (match) {
      updateState(match);
      return match;
    }
    return null;
  },

  logout(): void {
    updateState(null);
  },
};

// React hook for components using useSyncExternalStore
export function useAuthStore(): AuthState & {
  login: (username: string, password: string) => User | null;
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
    logout: authStore.logout,
  };
}
