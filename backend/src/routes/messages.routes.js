// src/routes/messages.routes.js
import { Router } from "express";
import { authRequired } from "../middlewares/authRequired.js";
import {
  getBookingMessages,
  sendMessage,
  getBookingMessagesPublic,
  sendMessagePublic,
  getBookingsWithMessages,
} from "../controllers/messages.controller.js";

const router = Router();

// Rutas protegidas (owner)
router.get("/bookings/:bookingId/messages", authRequired, getBookingMessages);
router.post("/bookings/:bookingId/messages", authRequired, sendMessage);
router.get("/stores/:storeId/bookings-with-messages", authRequired, getBookingsWithMessages);

// Rutas públicas (clientes)
router.get("/public/bookings/:bookingId/messages", getBookingMessagesPublic);
router.post("/public/bookings/:bookingId/messages", sendMessagePublic);

export default router;
