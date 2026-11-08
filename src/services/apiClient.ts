import axios, { type AxiosInstance } from 'axios';
import { setupInterceptors } from './interceptors';

export const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
});

setupInterceptors(apiClient);
