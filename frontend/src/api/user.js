// frontend/src/api/user.js
import api from './axios';

// Obtener perfil (privado)
export const getProfile = () => api.get("/auth/profile");

// Actualizar perfil (privado)
export const updateProfile = (payload) =>
  api.put("/auth/profile", payload);

// 🔹 Subir avatar (file) – si lo usas más adelante
export const uploadAvatar = (file) => {
  const formData = new FormData();
  formData.append("file", file);

  return api.post("/upload/avatar", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

// 🔹 NUEVO: obtener perfil público de un usuario por ID
export const getPublicUser = (id) => api.get(`/auth/users/${id}`);
