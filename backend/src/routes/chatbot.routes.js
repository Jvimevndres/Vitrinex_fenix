// src/routes/chatbot.routes.js
/**
 * Rutas para el chatbot con IA.
 * Incluye rutas públicas (plan FREE) y protegidas (plan PREMIUM)
 */

import { Router } from "express";
import { sendChatMessage, sendPremiumChatMessage, checkChatbotHealth, getChatbotStats } from "../controllers/chatbot.controller.js";
import { authRequired } from "../middlewares/authRequired.js";

const router = Router();

/**
 * GET /api/chatbot/health
 * Verifica el estado del servicio de chatbot
 */
router.get("/health", checkChatbotHealth);

/**
 * GET /api/chatbot/stats
 * Obtiene estadísticas de uso del chatbot (solo admin)
 * Query params: timeRange (7d, 30d, 90d, all)
 */
router.get("/stats", authRequired, getChatbotStats);

/**
 * POST /api/chatbot/premium
 * Envía un mensaje al chatbot premium con acceso a datos reales
 * Requiere autenticación y plan PREMIUM
 * Body: { message: string, context?: object }
 */
router.post("/premium", authRequired, sendPremiumChatMessage);

/**
 * POST /api/chatbot
 * Envía un mensaje al chatbot básico (plan FREE)
 * Body: { message: string }
 */
router.post("/", sendChatMessage);

export default router;
