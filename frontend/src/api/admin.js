import axios from './axios';

// Estadísticas del sistema
export const getSystemStats = () => axios.get('/admin/stats');

// Gestión de tiendas
export const getAllStoresAdmin = (params) => axios.get('/admin/stores', { params });
export const updateStoreStatus = (storeId, isActive) => 
  axios.patch(`/admin/stores/${storeId}/status`, { isActive });
export const updateStorePlan = (storeId, plan, expiresAt) => 
  axios.patch(`/admin/stores/${storeId}/plan`, { plan, expiresAt });

// Gestión de usuarios
export const getAllUsers = (params) => axios.get('/admin/users', { params });
export const updateUserRole = (userId, role) => 
  axios.patch(`/admin/users/${userId}/role`, { role });
