// src/api/alerts.js
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

/**
 * Obtiene alertas para una tienda específica
 */
export const getStoreAlerts = async (storeId) => {
  const response = await axios.get(`${API_URL}/alerts/store/${storeId}`);
  return response.data;
};

/**
 * Obtiene alertas para todas las tiendas del usuario
 */
export const getMyAlerts = async () => {
  const response = await axios.get(`${API_URL}/alerts/my-alerts`);
  return response.data;
};
