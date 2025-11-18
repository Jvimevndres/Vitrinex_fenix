// src/config.js

// Puerto del backend
export const PORT = process.env.PORT || 3000;

// MongoDB Atlas o local
export const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb://127.0.0.1:27017/vitrinex";

// Origen del frontend permitido
export const FRONTEND_ORIGIN =
  process.env.FRONTEND_ORIGIN || "http://localhost:5173";

// Token secreto (JWT)
if (!process.env.JWT_SECRET && !process.env.TOKEN_SECRET) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET o TOKEN_SECRET debe estar definido en producción');
  }
  console.warn('⚠️  ADVERTENCIA: Usando JWT_SECRET por defecto. Configura JWT_SECRET en .env');
}

export const JWT_SECRET =
  process.env.JWT_SECRET || process.env.TOKEN_SECRET || "dev-secret";

// Compatibilidad con validateToken.js
export const TOKEN_SECRET =
  process.env.TOKEN_SECRET || JWT_SECRET;
