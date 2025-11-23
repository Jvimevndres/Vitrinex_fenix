// src/api/chatbot.js
/**
 * API para interactuar con el chatbot con IA
 */

import axios from './axios';

/**
 * Envía un mensaje al chatbot básico (FREE)
 * @param {string} message - Mensaje del usuario
 * @returns {Promise<{reply: string, timestamp: Date}>}
 */
export const sendChatbotMessage = (message) => 
  axios.post('/chatbot', { message });

/**
 * Envía un mensaje al chatbot premium con contexto (PREMIUM)
 * @param {string} message - Mensaje del usuario
 * @param {object} context - Contexto adicional (opcional)
 * @returns {Promise<{reply: string, timestamp: Date, plan: string}>}
 */
export const sendPremiumChatbotMessage = (message, context = {}) => 
  axios.post('/chatbot/premium', { message, context });

/**
 * Verifica el estado del servicio de chatbot
 * @returns {Promise<{status: string, message: string, mode: string}>}
 */
export const checkChatbotHealth = () => 
  axios.get('/chatbot/health');

/**
 * Obtiene estadísticas de uso del chatbot (solo admin)
 * @param {string} timeRange - Rango de tiempo (7d, 30d, 90d, all)
 * @returns {Promise<object>} Estadísticas completas
 */
export const getChatbotStats = async (timeRange = '30d') => {
  const response = await axios.get(`/chatbot/stats?timeRange=${timeRange}`);
  return response.data;
};
