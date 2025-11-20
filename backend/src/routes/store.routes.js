// backend/src/routes/store.routes.js
import { Router } from "express";
import { authRequired } from "../middlewares/authRequired.js";
import {
  // tiendas
  listPublicStores,
  getMyStore,
  saveMyStore,
  deleteMyStore,
  getStoreById,
  updateMyStore,

  // productos
  listStoreProductsPublic,
  listStoreProductsForOwner,
  createStoreProduct,
  updateStoreProduct,
  deleteStoreProduct,

  // pedidos
  listStoreOrders,
  createStoreOrder,
  updateOrderStatus,

  // agendamiento
  getStoreAvailability,
  updateStoreAvailability,
  updateDayAvailability,
  deleteDayAvailability,
  copyDayAvailability,
  getAvailabilityByDate, // 🆕 NUEVO
  getSpecialDays, // 🆕 NUEVO
  upsertSpecialDay, // 🆕 NUEVO
  deleteSpecialDay, // 🆕 NUEVO
  listStoreAppointments,
  createAppointment,
  updateAppointmentStatus,
  deleteAppointment, // 🆕 NUEVO
  getCustomerBookings, // 🆕 NUEVO
} from "../controllers/store.controller.js";

import {
  getProductInsightsForStore,
  getBookingInsightsForStore,
} from "../controllers/insights.controller.js";

const router = Router();

/**
 * 🔹 Tiendas públicas
 */
router.get("/public", listPublicStores);

/**
 * 🔹 Tiendas del usuario autenticado
 */
router.get("/my", authRequired, getMyStore);
router.post("/my", authRequired, saveMyStore);
router.put("/my", authRequired, saveMyStore);
router.delete("/my/:id", authRequired, deleteMyStore);

/**
 * 🔹 AGENDAMIENTO (tiendas modo "bookings")
 */
// 🆕 NUEVO: Availability por fecha específica (DEBE IR ANTES de la ruta genérica)
router.get("/:id/availability/date/:date", getAvailabilityByDate); // Público

// Availability (horarios disponibles)
router.get("/:id/availability", getStoreAvailability); // Público
router.put("/:id/availability", authRequired, updateStoreAvailability); // Actualizar todo
router.put("/:id/availability/:day", authRequired, updateDayAvailability); // Actualizar un día
router.delete("/:id/availability/:day", authRequired, deleteDayAvailability); // Eliminar un día
router.post("/:id/availability/:day/copy", authRequired, copyDayAvailability); // Copiar a otros días

// 🆕 NUEVO: Special Days (días especiales/excepciones)
router.get("/:id/special-days", getSpecialDays); // Público
router.post("/:id/special-days", authRequired, upsertSpecialDay); // Crear/actualizar
router.delete("/:id/special-days/:date", authRequired, deleteSpecialDay); // Eliminar

// Appointments (citas agendadas)
router.get("/:id/appointments", authRequired, listStoreAppointments);
router.post("/:id/appointments", createAppointment); // 🆕 Ahora soporta serviceId
router.get("/bookings/my-bookings", getCustomerBookings); // 🆕 Obtener reservas del cliente por email

router.patch(
  "/:id/appointments/:bookingId/status",
  authRequired,
  updateAppointmentStatus
);

router.delete(
  "/:id/appointments/:bookingId",
  authRequired,
  deleteAppointment
);

/**
 * 🔹 Productos
 */
router.get("/:id/public-products", listStoreProductsPublic);
router.get("/:id/products", authRequired, listStoreProductsForOwner);
router.post("/:id/products", authRequired, createStoreProduct);
router.put("/:id/products/:productId", authRequired, updateStoreProduct);
router.delete("/:id/products/:productId", authRequired, deleteStoreProduct);

/**
 * 🔹 Pedidos
 */
router.get("/:id/orders", authRequired, listStoreOrders);
router.post("/:id/orders", createStoreOrder);
router.patch("/orders/:orderId/status", authRequired, updateOrderStatus);

/**
 * 🔹 INSIGHTS / ANÁLISIS INTELIGENTE
 */
router.get("/:id/insights/products", authRequired, getProductInsightsForStore);
router.get("/:id/insights/bookings", authRequired, getBookingInsightsForStore);

/**
 * 🔹 Detalle y actualización de tienda por ID
 */
router.put("/:id", authRequired, updateMyStore);
router.get("/:id", getStoreById);

export default router;
