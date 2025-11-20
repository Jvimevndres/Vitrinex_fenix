// frontend/src/utils/logger.js
/**
 * Sistema de logging condicional para producción en frontend
 * Evita imprimir logs innecesarios en producción
 */

const isProduction = import.meta.env.MODE === 'production';

export const logger = {
  /**
   * Log normal de información (solo en desarrollo)
   */
  log: (...args) => {
    if (!isProduction) {
      console.log(...args);
    }
  },

  /**
   * Log de información importante (siempre se muestra)
   */
  info: (...args) => {
    console.info('ℹ️', ...args);
  },

  /**
   * Warnings (siempre se muestran)
   */
  warn: (...args) => {
    console.warn('⚠️', ...args);
  },

  /**
   * Errores (siempre se muestran)
   */
  error: (...args) => {
    console.error('❌', ...args);
  },

  /**
   * Debug detallado (solo en desarrollo)
   */
  debug: (...args) => {
    if (!isProduction && import.meta.env.VITE_DEBUG === 'true') {
      console.debug('🐛', ...args);
    }
  },

  /**
   * Success messages (solo en desarrollo)
   */
  success: (...args) => {
    if (!isProduction) {
      console.log('✅', ...args);
    }
  },
};

export default logger;
