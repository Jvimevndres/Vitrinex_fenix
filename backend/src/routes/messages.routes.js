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
  getOrderMessagesPublic,
  getUserMessages,
  sendUserMessage,
  getUserConversations,
  deleteBookingMessages,
  deleteOrderMessages,
} from "../controllers/messages.controller.js";

const router = Router();

// Rutas protegidas - Bookings (owner)
router.get("/bookings/:bookingId/messages", authRequired, getBookingMessages);
router.post("/bookings/:bookingId/messages", authRequired, sendMessage);
router.delete("/bookings/:bookingId/messages", authRequired, deleteBookingMessages);
router.get("/stores/:storeId/bookings-with-messages", authRequired, getBookingsWithMessages);

// Rutas públicas - Bookings (clientes)
router.get("/public/bookings/:bookingId/messages", getBookingMessagesPublic);
router.post("/public/bookings/:bookingId/messages", sendMessagePublic);

// Rutas protegidas - Orders (owner)
router.get("/orders/:orderId/messages", authRequired, getOrderMessages);
router.post("/orders/:orderId/messages", authRequired, sendOrderMessage);
router.delete("/orders/:orderId/messages", authRequired, deleteOrderMessages);

// Rutas públicas - Orders (clientes)
router.get("/public/orders/:orderId/messages", getOrderMessagesPublic);
router.post("/public/orders/:orderId/messages", sendOrderMessagePublic);

// 🆕 Rutas para chat usuario-usuario (requieren autenticación)
router.get("/user-conversations", authRequired, getUserConversations);
router.get("/public/users/:userId/messages", authRequired, getUserMessages);
router.post("/public/users/:userId/messages", authRequired, sendUserMessage);

export default router;
