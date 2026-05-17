import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import useAuthStore from '../store/auth.store';

type RetryableConfig = AxiosRequestConfig & { _retry?: boolean };
type RuntimeEnv = typeof globalThis & { VITE_API_URL?: string };

// Use process.env for Jest/Node environment. In Vite builds, VITE_API_URL should
// be injected at build time; fall back to process.env when running tests.
const processApiBase = typeof process !== 'undefined' ? process.env?.VITE_API_URL : undefined;
const rawApiBase = processApiBase ?? ((globalThis as RuntimeEnv).VITE_API_URL) ?? 'http://localhost:5000/api';

// Normalize configured API base so service paths (which include `/v1/...`) do
// not end up with duplicated segments when an env var already contains
// `/v1` (e.g. `http://backend:5000/api/v1`). We want the base to end with
// `/api` so concatenating `/v1/...` in services produces `/api/v1/...`.
const API_BASE = rawApiBase.replace(/\/v1\/?$/i, '').replace(/\/+$/g, '') || rawApiBase;

const api: AxiosInstance = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true
});

const refreshClient: AxiosInstance = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

const isAuthRoute = (url?: string) => Boolean(url && /\/v1\/auth\/(login|register|refresh|logout)$/.test(url));

const processQueue = (error: unknown, token: string | null) => {
  failedQueue.forEach((promise) => {
    if (error || !token) promise.reject(error ?? new Error('Refresh failed'));
    else promise.resolve(token);
  });
  failedQueue = [];
};

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().accessToken;
  if (token && config.headers && !isAuthRoute(config.url)) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalConfig = error.config as RetryableConfig | undefined;

    if (!originalConfig || error.response?.status !== 401 || originalConfig._retry || isAuthRoute(originalConfig.url)) {
      return Promise.reject(error);
    }

    originalConfig._retry = true;

    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((token) => {
        if (originalConfig.headers) {
          originalConfig.headers.Authorization = `Bearer ${token}`;
        }
        return api(originalConfig);
      });
    }

    isRefreshing = true;

    try {
      const refreshResponse = await refreshClient.post('/v1/auth/refresh');
      const newAccessToken = refreshResponse.data.accessToken as string | undefined;
      const user = refreshResponse.data.user as { id: string; name: string; email: string; role: string } | undefined;

      if (!newAccessToken || !user) {
        throw new Error('Refresh response missing token or user');
      }

      useAuthStore.getState().setAuth(user, newAccessToken);
      processQueue(null, newAccessToken);

      if (originalConfig.headers) {
        originalConfig.headers.Authorization = `Bearer ${newAccessToken}`;
      }

      return api(originalConfig);
    } catch (refreshError) {
      processQueue(refreshError, null);
      useAuthStore.getState().clearAuth();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;
