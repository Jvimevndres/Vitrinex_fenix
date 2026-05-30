// src/api/axios.js
import axios from "axios";

const configuredBaseURL = import.meta.env.VITE_API_URL ?? '';

const api = axios.create({
  baseURL: configuredBaseURL,
  withCredentials: true,
  adapter: (config) => {
    // If no API URL is provided, run in offline/mock mode and prevent network calls.
    if (!configuredBaseURL) {
      return Promise.resolve({
        data: getMockResponse(config),
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
      });
    }
    // Fallback to the default axios adapter (performs real HTTP requests)
    return axios.defaults.adapter(config);
  },
});

// Interceptor para agregar el token JWT automáticamente
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;

function getMockResponse(config) {
  const url = config.url || '';
  const method = (config.method || 'get').toLowerCase();

  if (method === 'get') {
    if (url.includes('/appearance/themes')) return [];
    if (url.match(/\/stores\/\d+/)) return { id: 1, name: 'Demo Store', appearance: {} };
    if (url.includes('/stores') && !url.match(/\/stores\//)) return [{ id: 1, name: 'Demo Store' }];
    return {};
  }

  // For non-GET requests, return a simple success object
  return { success: true };
}
