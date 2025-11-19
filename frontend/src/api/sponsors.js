import axios from './axios';

// CRUD de anuncios de auspiciadores (admin)
export const createSponsorAd = (data) => axios.post('/sponsors', data);
export const getAllSponsorAds = (params) => axios.get('/sponsors', { params });
export const updateSponsorAd = (id, data) => axios.put(`/sponsors/${id}`, data);
export const deleteSponsorAd = (id) => axios.delete(`/sponsors/${id}`);

// Obtener anuncios activos por posición (público)
export const getActiveAdsByPosition = (position) => 
  axios.get(`/sponsors/active/${position}`);

// Registrar click en anuncio
export const trackAdClick = (id) => axios.post(`/sponsors/${id}/click`);
