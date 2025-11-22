// src/controllers/chatbot.controller.js
/**
 * Controlador para el chatbot con IA.
 * Maneja las peticiones de chat del usuario y devuelve respuestas generadas por IA.
 */

import { getChatbotResponse } from "../libs/aiClient.js";
import logger from "../utils/logger.js";

/**
 * POST /api/chatbot
 * Recibe un mensaje del usuario y devuelve la respuesta de la IA
 * 
 * Body:
 *  - message: string (requerido) - Mensaje del usuario
 * 
 * Response:
 *  - reply: string - Respuesta de la IA
 *  - timestamp: Date - Timestamp de la respuesta
 */
export const sendChatMessage = async (req, res) => {
  try {
    const { message } = req.body;

    // Validar que el mensaje existe
    if (!message || typeof message !== "string") {
      return res.status(400).json({
        message: "El campo 'message' es requerido y debe ser texto.",
      });
    }

    // Validar longitud del mensaje (evitar spam o mensajes muy largos)
    if (message.trim().length === 0) {
      return res.status(400).json({
        message: "El mensaje no puede estar vacío.",
      });
    }

    if (message.length > 2000) {
      return res.status(400).json({
        message: "El mensaje es demasiado largo. Máximo 2000 caracteres.",
      });
    }

    // Log de la petición (sin exponer datos sensibles)
    logger.log(`Chatbot - Mensaje recibido: ${message.substring(0, 50)}...`);

    // Llamar al cliente de IA
    const reply = await getChatbotResponse(message);

    // Log de la respuesta exitosa
    logger.success(`Chatbot - Respuesta generada exitosamente`);

    // Devolver la respuesta
    res.json({
      reply,
      timestamp: new Date(),
    });
  } catch (error) {
    logger.error("Error en chatbot controller:", error.message);

    // Manejar diferentes tipos de errores
    if (error.message.includes("no está configurado")) {
      return res.status(503).json({
        message: "El servicio de chatbot no está disponible en este momento.",
      });
    }

    if (error.message.includes("API error")) {
      return res.status(502).json({
        message: "Error al conectar con el servicio de IA. Intenta de nuevo más tarde.",
      });
    }

    // Error genérico
    res.status(500).json({
      message: "Error al procesar tu mensaje. Por favor, intenta de nuevo.",
    });
  }
};

/**
 * GET /api/chatbot/health
 * Endpoint para verificar el estado del chatbot
 */
export const checkChatbotHealth = async (req, res) => {
  try {
    const AI_API_KEY = process.env.AI_API_KEY;
    const isConfigured = AI_API_KEY && AI_API_KEY !== "sk-proj-placeholder-reemplaza-con-tu-api-key-real";
    const isDemoMode = !isConfigured;
    
    res.json({
      status: "operational",
      mode: isDemoMode ? "demo" : "ai",
      message: isDemoMode
        ? "El chatbot está en modo DEMO con respuestas predefinidas. Configura AI_API_KEY para usar IA real."
        : "El chatbot está usando IA real de OpenAI",
      timestamp: new Date(),
    });
  } catch (error) {
    logger.error("Error en health check del chatbot:", error);
    res.status(500).json({
      status: "error",
      message: "Error al verificar el estado del chatbot",
    });
  }
};
