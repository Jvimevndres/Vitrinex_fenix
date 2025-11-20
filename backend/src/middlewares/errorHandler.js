// src/middlewares/errorHandler.js
import logger from '../utils/logger.js';

/**
 * Clase para errores personalizados de aplicación
 */
export class AppError extends Error {
  constructor(message, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Wrapper para funciones async que automáticamente captura errores
 */
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Middleware de manejo de errores principal (mejorado)
 */
export const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Errores de Mongoose - Cast Error
  if (err.name === 'CastError') {
    const message = `Valor inválido para ${err.path}: ${err.value}`;
    logger.warn(message);
    return res.status(400).json({ status: 'fail', message });
  }

  // Errores de Mongoose - Duplicate Key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `${field} ya está en uso. Por favor use otro valor.`;
    logger.warn(message);
    return res.status(400).json({ status: 'fail', message });
  }

  // Errores de Mongoose - Validation
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e) => e.message);
    const message = `Datos inválidos: ${errors.join('. ')}`;
    logger.warn(message);
    return res.status(400).json({ status: 'fail', message });
  }

  // Errores de JWT
  if (err.name === 'JsonWebTokenError') {
    const message = 'Token inválido. Por favor inicie sesión nuevamente.';
    logger.warn(message);
    return res.status(401).json({ status: 'fail', message });
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Su sesión ha expirado. Por favor inicie sesión nuevamente.';
    logger.warn(message);
    return res.status(401).json({ status: 'fail', message });
  }

  // Errores operacionales conocidos
  if (err.isOperational) {
    logger.warn('Error operacional:', err.message);
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }

  // Errores desconocidos (críticos)
  logger.error('ERROR CRÍTICO:', err);

  // No enviar detalles del error en producción
  if (process.env.NODE_ENV === 'production') {
    return res.status(500).json({
      status: 'error',
      message: 'Error interno del servidor',
    });
  }

  // En desarrollo, enviar detalles completos
  return res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: err,
    stack: err.stack,
  });
};

export default errorHandler;

