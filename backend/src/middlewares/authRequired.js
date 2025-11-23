// src/middlewares/authRequired.js
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config.js";

// Versión real del middleware
export function authRequired(req, res, next) {
  // Intentar obtener el token de cookies O del header Authorization
  let token = req.cookies?.token;
  
  // Si no hay token en cookies, buscar en el header Authorization
  if (!token) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7); // Remover "Bearer " del inicio
    }
  }

  if (!token) {
    return res.status(401).json({ message: "No autorizado - Token no proporcionado" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    // Guardamos el usuario dentro del request
    req.userId = decoded.id; // Importante: guardar el ID del usuario
    req.user = decoded;
    next();
  } catch (err) {
    console.error("Error en authRequired:", err.message);
    return res.status(401).json({ message: "Token inválido o expirado" });
  }
}

// Export default para los archivos que lo importan sin llaves
export default authRequired;
