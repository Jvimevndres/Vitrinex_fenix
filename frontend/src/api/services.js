// src/api/services.js
import axios from "./axios";

// =================== AVAILABILITY (para UnifiedCalendarManager) ===================

/**
 * Obtener disponibilidad semanal de una tienda
 */
export const getStoreAvailability = (storeId) => {
  return axios.get(`/stores/${storeId}/availability`);
};

/**
 * Actualizar disponibilidad semanal completa
 */
export const updateStoreAvailability = (storeId, data) => {
  return axios.put(`/stores/${storeId}/availability`, data);
};

// =================== SERVICES ===================

/**
 * Obtener todos los servicios de una tienda
 * @param {string} storeId 
 * @param {boolean} includeInactive - Si incluir servicios inactivos
 */
export const getStoreServices = (storeId, includeInactive = false) => {
  const params = includeInactive ? { includeInactive: "true" } : {};
  return axios.get(`/stores/${storeId}/services`, { params });
};

/**
 * Obtener un servicio específico
 */
export const getServiceById = (storeId, serviceId) => {
  return axios.get(`/stores/${storeId}/services/${serviceId}`);
};

/**
 * Crear un nuevo servicio (requiere auth)
 */
export const createService = (storeId, serviceData) => {
  return axios.post(`/stores/${storeId}/services`, serviceData);
};

/**
 * Actualizar un servicio (requiere auth)
 */
export const updateService = (storeId, serviceId, serviceData) => {
  return axios.put(`/stores/${storeId}/services/${serviceId}`, serviceData);
};

/**
 * Eliminar/desactivar un servicio (requiere auth)
 */
export const deleteService = (storeId, serviceId, permanent = false) => {
  const params = permanent ? { permanent: "true" } : {};
  return axios.delete(`/stores/${storeId}/services/${serviceId}`, { params });
};

/**
 * Toggle activo/inactivo de un servicio (requiere auth)
 */
export const toggleServiceStatus = (storeId, serviceId) => {
  return axios.patch(`/stores/${storeId}/services/${serviceId}/toggle`);
};

/**
 * Reordenar servicios (requiere auth)
 */
export const reorderServices = (storeId, serviceIds) => {
  return axios.patch(`/stores/${storeId}/services/reorder`, { serviceIds });
};

// =================== SPECIAL DAYS ===================

/**
 * Obtener días especiales de una tienda
 */
export const getSpecialDays = (storeId) => {
  return axios.get(`/stores/${storeId}/special-days`);
};

/**
 * Crear o actualizar un día especial (requiere auth)
 */
export const upsertSpecialDay = (storeId, specialDayData) => {
  return axios.post(`/stores/${storeId}/special-days`, specialDayData);
};

/**
 * Eliminar un día especial (requiere auth)
 */
export const deleteSpecialDay = (storeId, date) => {
  return axios.delete(`/stores/${storeId}/special-days/${date}`);
};

// =================== AVAILABILITY POR FECHA ===================

/**
 * Obtener disponibilidad para una fecha específica
 * @param {string} storeId 
 * @param {string} date - Fecha en formato YYYY-MM-DD
 * @param {string} serviceId - (opcional) ID del servicio para calcular slots según duración
 */
export const getAvailabilityByDate = (storeId, date, serviceId = null) => {
  const params = serviceId ? { serviceId } : {};
  return axios.get(`/stores/${storeId}/availability/date/${date}`, { params });
};

// =================== APPOINTMENTS CON SERVICIO ===================

/**
 * Crear una cita con servicio
 */
export const createAppointmentWithService = (storeId, appointmentData) => {
  return axios.post(`/stores/${storeId}/appointments`, appointmentData);
};
