// src/routes/chatbot.routes.js
/**
 * Rutas para el chatbot con IA.
 * Incluye rutas públicas (plan FREE) y protegidas (plan PREMIUM)
 */

import { Router } from "express";
import { sendChatMessage, sendPremiumChatMessage, checkChatbotHealth } from "../controllers/chatbot.controller.js";
import { authRequired } from "../middlewares/authRequired.js";

const router = Router();

/**
 * POST /api/chatbot
 * Envía un mensaje al chatbot básico (plan FREE)
 * Body: { message: string }
 */
router.post("/", sendChatMessage);

/**
 * POST /api/chatbot/premium
 * Envía un mensaje al chatbot premium con acceso a datos reales
 * Requiere autenticación y plan PREMIUM
 * Body: { message: string, context?: object }
 */
router.post("/premium", authRequired, sendPremiumChatMessage);

/**
 * GET /api/chatbot/health
 * Verifica el estado del servicio de chatbot
 */
router.get("/health", checkChatbotHealth);

export default router;
