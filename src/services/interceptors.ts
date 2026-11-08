import type { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { getCsrfToken } from '../security/csrf/csrfHandler';
import { authStore } from '../stores/auth.store';
import { ROUTES } from '../constants/routes';

export function setupInterceptors(instance: AxiosInstance): void {
  // Request Interceptor: Attach authentication token and CSRF token
  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const token = authStore.getState().token;
      if (token) {
        config.headers.set('Authorization', `Bearer ${token}`);
      }

      // Attach anti-CSRF token for state-modifying methods
      const method = config.method?.toUpperCase();
      if (method && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
        config.headers.set('X-CSRF-Token', getCsrfToken());
      }

      return config;
    },
    (error: AxiosError) => Promise.reject(error)
  );

  // Response Interceptor: Handle 401 (Session Expired / Unauthorized) and 403 (Forbidden)
  instance.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error: AxiosError) => {
      if (error.response?.status === 401) {
        authStore.logout();
        if (typeof window !== 'undefined' && window.location.pathname !== ROUTES.PUBLIC.LOGIN) {
          window.location.href = ROUTES.PUBLIC.LOGIN;
        }
      }
      return Promise.reject(error);
    }
  );
}
