// src/routes/upload.routes.js
import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import rateLimit from "express-rate-limit";

import { authRequired } from "../middlewares/authRequired.js";
import User from "../models/user.model.js";
import Store from "../models/store.model.js";

const router = Router();

// Rate limiter para uploads (prevenir abuso)
const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 20, // máximo 20 uploads por IP en la ventana
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Demasiados uploads. Intenta más tarde." },
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Asegura directorios
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

const baseUploadDir = path.join(__dirname, "..", "..", "uploads");
ensureDir(baseUploadDir);

// Validación de tipos de archivo permitidos
const imageFileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif'
  ];
  
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de archivo no permitido. Solo se aceptan imágenes (JPEG, PNG, WebP, GIF)'), false);
  }
};

function createStorage(subfolder) {
  const dir = path.join(baseUploadDir, subfolder);
  ensureDir(dir);

  return multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, dir),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname);
      const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      cb(null, `${unique}${ext}`);
    },
  });
}

// Configuración con límites y validación
const uploadConfig = {
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB máximo
  },
  fileFilter: imageFileFilter,
};

const avatarUpload = multer({ storage: createStorage("avatars"), ...uploadConfig });
const storeLogoUpload = multer({ storage: createStorage("stores"), ...uploadConfig });
const productImageUpload = multer({ storage: createStorage("products"), ...uploadConfig });

// 🌐 Generar URL base dinámicamente desde el request para acceso multi-dispositivo
const getBaseUrl = (req) => {
  // Si existe API_PUBLIC_URL y no es localhost, usarlo (para producción)
  const publicUrl = process.env.API_PUBLIC_URL;
  if (publicUrl && !publicUrl.includes('localhost')) {
    return publicUrl;
  }
  
  // En desarrollo, usar el host del request para soportar múltiples dispositivos
  const protocol = req.protocol;
  const host = req.get('host');
  return `${protocol}://${host}`;
};

/**
 * Avatar de usuario
 */
router.post(
  "/avatar",
  uploadLimiter,
  authRequired,
  avatarUpload.single("file"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res
          .status(400)
          .json({ message: "No se recibió ningún archivo" });
      }

      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }

      const baseUrl = getBaseUrl(req);
      const avatarUrl = `${baseUrl}/uploads/avatars/${req.file.filename}`;

      user.avatarUrl = avatarUrl;
      await user.save();

      return res.json({ message: "Avatar actualizado", avatarUrl });
    } catch (err) {
      console.error("Error subiendo avatar:", err);
      return res
        .status(500)
        .json({ message: "Error al subir la imagen de perfil" });
    }
  }
);

/**
 * Logo de tienda
 */
router.post(
  "/store-logo",
  uploadLimiter,
  authRequired,
  storeLogoUpload.single("file"),
  async (req, res) => {
    try {
      const { storeId } = req.body;

      if (!req.file) {
        return res
          .status(400)
          .json({ message: "No se recibió ningún archivo" });
      }

      if (!storeId) {
        return res.status(400).json({ message: "Falta el storeId" });
      }

      const store = await Store.findOne({
        _id: storeId,
        owner: req.user.id,
      });

      if (!store) {
        return res.status(404).json({
          message: "Tienda no encontrada o no eres el dueño",
        });
      }

      const baseUrl = getBaseUrl();
      const logoUrl = `${baseUrl}/uploads/stores/${req.file.filename}`;

      store.logoUrl = logoUrl;
      await store.save();

      return res.json({ message: "Logo actualizado", logoUrl });
    } catch (err) {
      console.error("Error subiendo logo de tienda:", err);
      return res
        .status(500)
        .json({ message: "Error al subir el logo de la tienda" });
    }
  }
);

/**
 * Imagen de producto
 */
router.post(
  "/product-image",
  uploadLimiter,
  authRequired,
  productImageUpload.single("file"),
  async (req, res) => {
    try {
      const { storeId } = req.body;

      if (!req.file) {
        return res
          .status(400)
          .json({ message: "No se recibió ningún archivo" });
      }

      if (!storeId) {
        return res.status(400).json({ message: "Falta el storeId" });
      }

      const store = await Store.findOne({
        _id: storeId,
        owner: req.user.id,
      });

      if (!store) {
        return res.status(404).json({
          message: "Tienda no encontrada o no eres el dueño",
        });
      }

      const baseUrl = getBaseUrl(req);
      const imageUrl = `${baseUrl}/uploads/products/${req.file.filename}`;

      return res.json({
        message: "Imagen de producto subida",
        imageUrl,
      });
    } catch (err) {
      console.error("Error subiendo imagen de producto:", err);
      return res
        .status(500)
        .json({ message: "Error al subir la imagen de producto" });
    }
  }
);

/**
 * Imagen de fondo para personalización
 */
const backgroundUpload = multer({ storage: createStorage("backgrounds"), ...uploadConfig });

router.post(
  "/background",
  uploadLimiter,
  authRequired,
  backgroundUpload.single("file"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res
          .status(400)
          .json({ message: "No se recibió ningún archivo" });
      }

      const baseUrl = getBaseUrl(req);
      const imageUrl = `${baseUrl}/uploads/backgrounds/${req.file.filename}`;

      return res.json({
        message: "Imagen de fondo subida correctamente",
        url: imageUrl,
      });
    } catch (err) {
      console.error("Error subiendo imagen de fondo:", err);
      return res
        .status(500)
        .json({ message: "Error al subir la imagen de fondo" });
    }
  }
);

/**
 * 🆕 Imagen de anuncio patrocinado
 * NOTA: Devuelve ruta relativa para compatibilidad multi-dispositivo
 */
const sponsorAdUpload = multer({ storage: createStorage("sponsors"), ...uploadConfig });

router.post(
  "/sponsor-ad",
  uploadLimiter,
  authRequired,
  sponsorAdUpload.single("file"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res
          .status(400)
          .json({ message: "No se recibió ningún archivo" });
      }

      // Devolver ruta relativa (sin dominio) para que cada dispositivo la construya con su VITE_API_URL
      const imageUrl = `/uploads/sponsors/${req.file.filename}`;

      return res.json({
        message: "Imagen de anuncio subida correctamente",
        imageUrl,
      });
    } catch (err) {
      console.error("Error subiendo imagen de anuncio:", err);
      return res
        .status(500)
        .json({ message: "Error al subir la imagen del anuncio" });
    }
  }
);

export default router;
