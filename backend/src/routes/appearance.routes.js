// backend/src/routes/appearance.routes.js
import { Router } from "express";
import { authRequired } from "../middlewares/authRequired.js";
import {
  getStoreAppearance,
  updateStoreAppearance,
  applyTheme,
  resetAppearance,
  getAvailableThemes,
} from "../controllers/appearance.controller.js";

const router = Router();

/**
 * Rutas de apariencia de tienda
 */

// Público - Obtener apariencia de una tienda
router.get("/stores/:id/appearance", getStoreAppearance);

// Protegido - Actualizar apariencia
router.put("/stores/:id/appearance", authRequired, updateStoreAppearance);

// Protegido - Aplicar tema predefinido
router.post("/stores/:id/appearance/apply-theme", authRequired, applyTheme);

// Protegido - Resetear a default
router.post("/stores/:id/appearance/reset", authRequired, resetAppearance);

// Público - Lista de temas disponibles
router.get("/appearance/themes", getAvailableThemes);

export default router;
