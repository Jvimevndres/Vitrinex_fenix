// src/index.js
import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import logger from "./utils/logger.js";

import authRoutes from "./routes/auth.routes.js";
import storeRoutes from "./routes/store.routes.js";
import servicesRoutes from "./routes/services.routes.js"; // 🆕 NUEVO
import messagesRoutes from "./routes/messages.routes.js"; // 🆕 CHAT
import appearanceRoutes from "./routes/appearance.routes.js"; // 🆕 APARIENCIA
import uploadRoutes from "./routes/upload.routes.js";
import healthRoutes from "./routes/health.routes.js";
import adminRoutes from "./routes/admin.routes.js"; // 🆕 ADMIN PANEL
import sponsorsRoutes from "./routes/sponsors.routes.js"; // 🆕 ANUNCIOS
import commentsRoutes from "./routes/comments.routes.js"; // 🆕 FEEDBACK
import { ensureStoreIndexes } from "./models/store.model.js";
import helmet from "helmet";
import multer from "multer";

const app = express();

const FRONTEND_ORIGIN =
  process.env.FRONTEND_ORIGIN || "http://localhost:5173";
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(
  cors({
    origin: FRONTEND_ORIGIN,
    credentials: true,
  })
);
// Aumentar límite de payload para productos con imágenes
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());

// Seguridad HTTP headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }, // Permitir carga de imágenes desde otros orígenes
  crossOriginEmbedderPolicy: false, // Deshabilitar para permitir embeds
}));

// Nota: el rate-limit se aplica únicamente a rutas sensibles (ej. auth)

// 📂 Servir archivos estáticos subidos (avatars, logos, etc.)
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

app.use("/api", healthRoutes); // Health checks
app.use("/api/auth", authRoutes);
app.use("/api/stores", storeRoutes);
app.use("/api/stores", servicesRoutes); // 🆕 NUEVO: Rutas de servicios (usa mismo prefijo)
app.use("/api", messagesRoutes); // 🆕 CHAT: Rutas de mensajes para reservas
app.use("/api", appearanceRoutes); // 🆕 APARIENCIA: Sistema de personalización visual
app.use("/api/admin", adminRoutes); // 🆕 ADMIN: Panel de administración
app.use("/api/sponsors", sponsorsRoutes); // 🆕 SPONSORS: Gestión de anuncios
app.use("/api/comments", commentsRoutes); // 🆕 COMMENTS: Sistema de feedback
app.use("/api/upload", uploadRoutes);

// Middleware global de manejo de errores (debe ir después de todas las rutas)
app.use((err, req, res, next) => {
  // Error de validación de archivo (esperado, no crítico)
  if (err.message && err.message.includes('Tipo de archivo no permitido')) {
    logger.log('Archivo rechazado:', err.message);
    return res.status(400).json({ 
      message: 'Tipo de archivo no permitido. Solo se aceptan imágenes (JPEG, PNG, WebP, GIF)' 
    });
  }
  
  // Error de Multer (archivos)
  if (err instanceof multer.MulterError) {
    logger.log('Error Multer:', err.code);
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'Archivo demasiado grande. Máximo 5MB' });
    }
    return res.status(400).json({ message: `Error al subir archivo: ${err.message}` });
  }
  
  // Errores reales (estos sí son preocupantes)
  logger.error('Error crítico:', err);
  
  if (res.headersSent) return next(err);
  res.status(500).json({ message: err.message || 'Error interno del servidor' });
});

(async () => {
  try {
    if (!MONGODB_URI) {
      throw new Error("MONGODB_URI no está definido en el .env");
    }

    await mongoose.connect(MONGODB_URI);
    logger.success("MongoDB conectado a Atlas");

    await ensureStoreIndexes();

    app.listen(PORT, () => {
      logger.success(`API escuchando en http://localhost:${PORT}`);
    });
  } catch (err) {
    logger.error("Error al iniciar el servidor:", err.message || err);
    process.exit(1);
  }
})();

process.on("unhandledRejection", (e) => {
  logger.error("UNHANDLED REJECTION:", e);
});
process.on("uncaughtException", (e) => {
  logger.error("UNCAUGHT EXCEPTION:", e);
});
