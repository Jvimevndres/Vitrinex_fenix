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
  const response = await axios.post(`/public/bookings/${bookingId}/messages`, {
    email,
    content
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

