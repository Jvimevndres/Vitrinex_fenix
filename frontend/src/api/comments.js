import axios from './axios';

// Crear comentario/feedback
export const createComment = (data) => axios.post('/comments', data);

// Obtener mis comentarios
export const getMyComments = () => axios.get('/comments/my');

// Eliminar comentario
export const deleteComment = (id) => axios.delete(`/comments/${id}`);

// Admin: listar todos los comentarios
export const getAllComments = (params) => axios.get('/comments', { params });

// Admin: actualizar estado de comentario
export const updateCommentStatus = (id, status, adminNotes) => 
  axios.patch(`/comments/${id}/status`, { status, adminNotes });
