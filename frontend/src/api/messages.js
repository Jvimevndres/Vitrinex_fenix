import axios from './axios';

// ============================================
// OWNER ENDPOINTS (requieren autenticación)
// ============================================

/**
 * Obtener mensajes de una reserva (owner)
 * @param {string} bookingId - ID de la reserva
 * @returns {Promise<Array>} Lista de mensajes
 */
export const getBookingMessages = async (bookingId) => {
  const response = await axios.get(`/bookings/${bookingId}/messages`);
  return response.data;
};

/**
 * Enviar mensaje a una reserva (owner)
 * @param {string} bookingId - ID de la reserva
 * @param {string} content - Contenido del mensaje
 * @returns {Promise<Object>} Mensaje creado
 */
export const sendMessage = async (bookingId, content) => {
  const response = await axios.post(`/bookings/${bookingId}/messages`, { content });
  return response.data;
};

/**
 * Obtener lista de reservas con mensajes (owner)
 * @param {string} storeId - ID de la tienda
 * @returns {Promise<Array>} Lista de reservas con actividad de chat
 */
export const getBookingsWithMessages = async (storeId) => {
  const response = await axios.get(`/stores/${storeId}/bookings-with-messages`);
  return response.data;
};

// ============================================
// PUBLIC ENDPOINTS (clientes sin autenticación)
// ============================================

/**
 * Obtener mensajes de una reserva (cliente)
 * @param {string} bookingId - ID de la reserva
 * @param {string} email - Email del cliente
 * @returns {Promise<Array>} Lista de mensajes
 */
export const getBookingMessagesPublic = async (bookingId, email) => {
  const response = await axios.get(`/public/bookings/${bookingId}/messages`, {
    params: { email }
  });
  return response.data;
};

/**
 * Enviar mensaje a una reserva (cliente)
 * @param {string} bookingId - ID de la reserva
 * @param {string} email - Email del cliente
 * @param {string} content - Contenido del mensaje
 * @returns {Promise<Object>} Mensaje creado
 */
export const sendMessagePublic = async (bookingId, email, content) => {
  if (!email || !email.trim()) {
    throw new Error("Email es requerido para enviar mensajes");
  }
  if (!content || !content.trim()) {
    throw new Error("El mensaje no puede estar vacío");
  }
  const response = await axios.post(`/public/bookings/${bookingId}/messages`, {
    email: email.trim(),
    content: content.trim()
  });
  return response.data;
};

// ============================================
// ORDERS ENDPOINTS (Pedidos)
// ============================================

/**
 * Obtener mensajes de un pedido (owner)
 * @param {string} orderId - ID del pedido
 * @returns {Promise<Array>} Lista de mensajes
 */
export const getOrderMessages = async (orderId) => {
  const response = await axios.get(`/orders/${orderId}/messages`);
  return response.data;
};

/**
 * Enviar mensaje a un pedido (owner)
 * @param {string} orderId - ID del pedido
 * @param {string} content - Contenido del mensaje
 * @returns {Promise<Object>} Mensaje creado
 */
export const sendOrderMessage = async (orderId, content) => {
  const response = await axios.post(`/orders/${orderId}/messages`, { content });
  return response.data;
};

/**
 * Enviar mensaje a un pedido (cliente público)
 * @param {string} orderId - ID del pedido
 * @param {Object} data - { content, customerName, customerEmail }
 * @returns {Promise<Object>} Mensaje creado
 */
export const sendOrderMessagePublic = async (orderId, data) => {
  const response = await axios.post(`/public/orders/${orderId}/messages`, data);
  return response.data;
};

// ============================================
// USER-TO-USER CHAT (chat directo entre usuarios)
// ============================================

/**
 * Obtener lista de conversaciones usuario-usuario
 * @returns {Promise<Array>} Lista de conversaciones
 */
export const getUserConversations = async () => {
  const response = await axios.get('/user-conversations');
  return response.data;
};

/**
 * Obtener mensajes entre usuario autenticado y otro usuario
 * @param {string} userId - ID del otro usuario
 * @returns {Promise<Array>} Lista de mensajes
 */
export const getUserMessages = async (userId) => {
  const response = await axios.get(`/public/users/${userId}/messages`);
  return response.data;
};

/**
 * Enviar mensaje a otro usuario
 * @param {string} userId - ID del usuario destinatario
 * @param {string} content - Contenido del mensaje
 * @returns {Promise<Object>} Mensaje creado
 */
export const sendUserMessage = async (userId, content) => {
  const response = await axios.post(`/public/users/${userId}/messages`, { content });
  return response.data;
};

/**
 * 🆕 Obtener mensajes de una orden (cliente público)
 * @param {string} orderId - ID de la orden
 * @param {string} email - Email del cliente
 * @returns {Promise<Array>} Lista de mensajes
 */
export const getOrderMessagesPublic = async (orderId, email) => {
  const response = await axios.get(`/public/orders/${orderId}/messages`, {
    params: { email }
  });
  return response.data;
};
