// src/routes/services.routes.js
import { Router } from "express";
import {
  getStoreServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
  toggleServiceStatus,
  reorderServices,
} from "../controllers/services.controller.js";
import { authRequired } from "../middlewares/authRequired.js";

const router = Router();

/**
 * Rutas de servicios
 * Base: /api/stores/:storeId/services
 */

// GET /api/stores/:storeId/services - Listar servicios (público)
router.get("/:storeId/services", getStoreServices);

// GET /api/stores/:storeId/services/:serviceId - Obtener un servicio (público)
router.get("/:storeId/services/:serviceId", getServiceById);

// POST /api/stores/:storeId/services - Crear servicio (auth)
router.post("/:storeId/services", authRequired, createService);

// PUT /api/stores/:storeId/services/:serviceId - Actualizar servicio (auth)
router.put("/:storeId/services/:serviceId", authRequired, updateService);

// DELETE /api/stores/:storeId/services/:serviceId - Eliminar servicio (auth)
router.delete("/:storeId/services/:serviceId", authRequired, deleteService);

// PATCH /api/stores/:storeId/services/:serviceId/toggle - Toggle activo/inactivo (auth)
router.patch("/:storeId/services/:serviceId/toggle", authRequired, toggleServiceStatus);

// PATCH /api/stores/:storeId/services/reorder - Reordenar servicios (auth)
router.patch("/:storeId/services/reorder", authRequired, reorderServices);

export default router;
