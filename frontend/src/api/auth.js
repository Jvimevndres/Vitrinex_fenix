import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

export const registerRequest = (data) => api.post("/auth/register", data);
export const loginRequest = (data) => api.post("/auth/login", data);
export const logoutRequest = () => api.post("/auth/logout");

/**
 * ✅ MANEJO ESPECIAL: profileRequest para verificación de sesión
 * - Si status === 401 (no autenticado): retorna { authenticated: false, data: null } SIN error
 * - Si status === 200 (autenticado): retorna { authenticated: true, data: userData }
 * - Otros errores (red, 500, etc.): lanza excepción
 */
export const profileRequest = async () => {
  try {
    const response = await api.get("/auth/profile");
    return { authenticated: true, data: response.data };
  } catch (error) {
    // 401 = no autenticado (estado normal, NO es un error)
    if (error.response && error.response.status === 401) {
      return { authenticated: false, data: null };
    }
    // Otros errores (red caída, 500, timeout) sí se propagan
    throw error;
  }
};
