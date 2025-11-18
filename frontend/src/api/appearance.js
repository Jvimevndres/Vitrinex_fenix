// frontend/src/api/appearance.js
import axios from './axios';

/**
 * API de personalización visual de tiendas
 */

/**
 * Obtener configuración de apariencia de una tienda
 * @param {string} storeId - ID de la tienda
 * @returns {Promise} Configuración de apariencia
 */
export const getStoreAppearance = async (storeId) => {
  const response = await axios.get(`/stores/${storeId}/appearance`);
  return response.data;
};

/**
 * Actualizar configuración de apariencia
 * @param {string} storeId - ID de la tienda
 * @param {Object} data - Datos de apariencia
 * @returns {Promise} Configuración actualizada
 */
export const updateStoreAppearance = async (storeId, data) => {
  const response = await axios.put(`/stores/${storeId}/appearance`, data);
  return response.data;
};

/**
 * Aplicar tema predefinido
 * @param {string} storeId - ID de la tienda
 * @param {string} themeName - Nombre del tema
 * @returns {Promise} Configuración actualizada
 */
export const applyTheme = async (storeId, themeName) => {
  const response = await axios.post(`/stores/${storeId}/appearance/apply-theme`, { themeName });
  return response.data;
};

/**
 * Resetear apariencia a valores por defecto
 * @param {string} storeId - ID de la tienda
 * @returns {Promise} Configuración reseteada
 */
export const resetAppearance = async (storeId) => {
  const response = await axios.post(`/stores/${storeId}/appearance/reset`);
  return response.data;
};

/**
 * Obtener lista de temas disponibles
 * @returns {Promise<Array>} Lista de temas
 */
export const getAvailableThemes = async () => {
  const response = await axios.get('/appearance/themes');
  return response.data;
};
