// src/api/chatbot.js
/**
 * API para interactuar con el chatbot con IA
 */

import axios from './axios';

/**
 * Envía un mensaje al chatbot y obtiene la respuesta
 * @param {string} message - Mensaje del usuario
 * @returns {Promise<{reply: string, timestamp: Date}>}
 */
export const sendChatbotMessage = (message) => 
  axios.post('/chatbot', { message });

/**
 * Verifica el estado del servicio de chatbot
 * @returns {Promise<{status: string, message: string}>}
 */
export const checkChatbotHealth = () => 
  axios.get('/chatbot/health');
