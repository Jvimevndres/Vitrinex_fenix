// src/routes/chatbot.routes.js
/**
 * Rutas para el chatbot con IA.
 * No requiere autenticación para permitir que cualquier usuario pueda usar el chatbot.
 */

import { Router } from "express";
import { sendChatMessage, checkChatbotHealth } from "../controllers/chatbot.controller.js";

const router = Router();

/**
 * POST /api/chatbot
 * Envía un mensaje al chatbot y recibe una respuesta de IA
 * Body: { message: string }
 */
router.post("/", sendChatMessage);

/**
 * GET /api/chatbot/health
 * Verifica el estado del servicio de chatbot
 */
router.get("/health", checkChatbotHealth);

export default router;
