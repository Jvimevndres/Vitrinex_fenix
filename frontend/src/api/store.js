// frontend/src/api/store.js
import api from './axios';

/* =====================================
 * 🔹 TIENDAS PÚBLICAS (explorar / mapa)
 * ===================================== */
export const listPublicStores = async (params = {}) => {
  const res = await api.get("/stores/public", { params });
  return res;
};

export const getStoreById = async (id) => {
  const res = await api.get(`/stores/${id}`);
  return res;
};

/* =====================================
 * 🔹 MIS TIENDAS (dueño)
 * ===================================== */
export const listMyStores = async () => {
  try {
    const res = await api.get("/stores/my");
    return res;
  } catch (error) {
    // Si el usuario no tiene tiendas, el backend devuelve 404
    // Lo tratamos como caso normal: "0 tiendas"
    if (error.response?.status === 404) {
      return { data: [] };
    }
    // Para otros errores (500, red caída, etc.), sí lanzamos la excepción
    throw error;
  }
};

// Crear o actualizar (modo "guardar" centralizado del panel)
// - Si envías payload con _id, el back actualiza ese registro.
// - Úsalo para el formulario general del panel "Mi tienda".
export const saveMyStore = async (payload) => {
  const res = await api.post("/stores/my", payload);
  return res;
};

// ✅ NUEVO coherente con rutas: update parcial por ID (whitelist bg*)
// Úsalo cuando ya tienes el ID de la tienda y solo quieres actualizar campos permitidos.
export const updateMyStore = async (id, payload) => {
  const res = await api.put(`/stores/${id}`, payload);
  return res;
};

// Eliminar tienda del dueño
export const deleteMyStore = async (id) => {
  const res = await api.delete(`/stores/my/${id}`);
  return res;
};

/* =====================================
 * 🔹 SUBIR LOGO DE TIENDA
 * ===================================== */
export const uploadStoreLogo = async (storeId, file) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("storeId", storeId);

  const res = await api.post("/upload/store-logo", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res;
};

/* =====================================
 * 🔹 AGENDAMIENTO (bookings)
 * ===================================== */
export const getStoreAvailability = async (id) => {
  const res = await api.get(`/stores/${id}/availability`);
  return res;
};

export const updateStoreAvailability = async (id, availability) => {
  const res = await api.put(`/stores/${id}/availability`, { availability });
  return res;
};

export const listStoreAppointments = async (id) => {
  const res = await api.get(`/stores/${id}/appointments`);
  return res;
};

export const createAppointment = async (id, payload) => {
  const res = await api.post(`/stores/${id}/appointments`, payload);
  return res;
};

export const updateAppointmentStatus = async (id, bookingId, status) => {
  const res = await api.patch(`/stores/${id}/appointments/${bookingId}/status`, { status });
  return res;
};

export const deleteAppointment = async (id, bookingId) => {
  const res = await api.delete(`/stores/${id}/appointments/${bookingId}`);
  return res;
};

/* =====================================
 * 🔹 PRODUCTOS (products)
 * ===================================== */
// Catálogo público (compat)
export const listStoreProductsPublic = async (id) => {
  const res = await api.get(`/stores/${id}/public-products`);
  return res;
};

// Para tu vista pública actual puedes reutilizar el catálogo público:
export const listStoreProducts = listStoreProductsPublic;

// CRUD para el dueño
export const listStoreProductsForOwner = async (id) => {
  const res = await api.get(`/stores/${id}/products`);
  return res;
};

export const createStoreProduct = async (id, payload) => {
  const res = await api.post(`/stores/${id}/products`, payload);
  return res;
};

export const updateStoreProduct = async (id, productId, payload) => {
  const res = await api.put(`/stores/${id}/products/${productId}`, payload);
  return res;
};

export const deleteStoreProduct = async (id, productId) => {
  const res = await api.delete(`/stores/${id}/products/${productId}`);
  return res;
};

/* =====================================
 * 🔹 PEDIDOS (orders)
 * ===================================== */
export const listStoreOrders = async (id) => {
  const res = await api.get(`/stores/${id}/orders`);
  return res;
};

export const createStoreOrder = async (id, payload) => {
  const res = await api.post(`/stores/${id}/orders`, payload);
  return res;
};

export const updateOrderStatus = async (orderId, status) => {
  const res = await api.patch(`/stores/orders/${orderId}/status`, { status });
  return res;
};

/* =====================================
 * 🔔 NOTIFICACIONES
 * ===================================== */
export const getStoreNotifications = async (id) => {
  const res = await api.get(`/stores/${id}/notifications`);
  return res;
};

export default api;
