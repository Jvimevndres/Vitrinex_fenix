// src/routes/messages.routes.js
import { Router } from "express";
import { authRequired } from "../middlewares/authRequired.js";
import {
  getBookingMessages,
  sendMessage,
  getBookingMessagesPublic,
  sendMessagePublic,
  getBookingsWithMessages,
  getOrderMessages,
  sendOrderMessage,
  sendOrderMessagePublic,
} from "../controllers/messages.controller.js";

const router = Router();

// Rutas protegidas - Bookings (owner)
router.get("/bookings/:bookingId/messages", authRequired, getBookingMessages);
router.post("/bookings/:bookingId/messages", authRequired, sendMessage);
router.get("/stores/:storeId/bookings-with-messages", authRequired, getBookingsWithMessages);

// Rutas públicas - Bookings (clientes)
router.get("/public/bookings/:bookingId/messages", getBookingMessagesPublic);
router.post("/public/bookings/:bookingId/messages", sendMessagePublic);

// Rutas protegidas - Orders (owner)
router.get("/orders/:orderId/messages", authRequired, getOrderMessages);
router.post("/orders/:orderId/messages", authRequired, sendOrderMessage);

// Rutas públicas - Orders (clientes)
router.post("/public/orders/:orderId/messages", sendOrderMessagePublic);

export default router;
