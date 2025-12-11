// src/utils/imageUrl.js
/**
 * Convierte una ruta de imagen a URL completa accesible desde cualquier dispositivo
 * 
 * @param {string} imagePath - Puede ser una ruta relativa (/uploads/...) o URL completa
 * @returns {string} - URL completa para acceder a la imagen
 */
export function getImageUrl(imagePath) {
  if (!imagePath) return '';
  
  // Si ya es una URL completa, devolverla sin cambios
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // Si es una ruta relativa, construir URL completa
  if (imagePath.startsWith('/uploads/') || imagePath.startsWith('uploads/')) {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
    // Remover el '/api' del final para obtener la URL base del servidor
    const serverUrl = apiUrl.replace(/\/api\/?$/, '');
    const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
    return `${serverUrl}${cleanPath}`;
  }
  
  // Si no coincide con ningún patrón, devolver tal cual
  return imagePath;
}

/**
 * Hook personalizado para URLs de imágenes (opcional, para usar en componentes React)
 */
export function useImageUrl(imagePath) {
  return getImageUrl(imagePath);
}
