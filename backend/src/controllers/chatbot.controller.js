// src/controllers/chatbot.controller.js
/**
 * Controlador para el chatbot con IA.
 * Maneja las peticiones de chat del usuario y devuelve respuestas generadas por IA.
 * Soporta dos planes: FREE (básico) y PREMIUM (con datos reales)
 */

import { getChatbotResponse, getChatbotResponsePremium } from "../libs/aiClient.js";
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
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    const isConfigured = OPENAI_API_KEY && OPENAI_API_KEY !== "sk-proj-placeholder-reemplaza-con-tu-api-key-real";
    
    // Si no hay API key configurada, definitivamente es DEMO
    if (!isConfigured) {
      return res.json({
        status: "operational",
        mode: "demo",
        message: "El chatbot está en modo DEMO con respuestas predefinidas. Configura OPENAI_API_KEY para usar IA real.",
        timestamp: new Date(),
      });
    }
    
    // Si hay API key, intentar hacer una llamada de prueba para verificar si tiene saldo
    try {
      const testResponse = await fetch("https://api.openai.com/v1/models", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${OPENAI_API_KEY}`,
        },
        signal: AbortSignal.timeout(3000), // 3 segundos timeout
      });
      
      // Si la respuesta es 429 (sin cuota) o 401 (key inválida), es DEMO
      if (testResponse.status === 429 || testResponse.status === 401 || testResponse.status === 403) {
        return res.json({
          status: "operational",
          mode: "demo",
          message: "El chatbot está en modo DEMO. La API key no tiene saldo o es inválida.",
          timestamp: new Date(),
        });
      }
      
      // Si llegamos aquí, la API key funciona
      return res.json({
        status: "operational",
        mode: "ai",
        message: "El chatbot está usando IA real de OpenAI (" + (process.env.OPENAI_MODEL || "gpt-4o-mini") + ")",
        timestamp: new Date(),
      });
    } catch (fetchError) {
      // Si hay error de red o timeout, asumir DEMO
      logger.log("Error verificando OpenAI, usando DEMO:", fetchError.message);
      return res.json({
        status: "operational",
        mode: "demo",
        message: "El chatbot está en modo DEMO (no se pudo verificar conexión con OpenAI).",
        timestamp: new Date(),
      });
    }
  } catch (error) {
    logger.error("Error en health check del chatbot:", error);
    res.status(500).json({
      status: "error",
      message: "Error al verificar el estado del chatbot",
    });
  }
};

/**
 * POST /api/chatbot/premium
 * Chatbot premium con acceso a datos reales del usuario/tienda
 * Requiere autenticación
 */
export const sendPremiumChatMessage = async (req, res) => {
  try {
    const { message, context } = req.body;
    const userId = req.userId; // Del middleware de autenticación

    // Validaciones básicas
    if (!message || typeof message !== "string") {
      return res.status(400).json({
        message: "El campo 'message' es requerido y debe ser texto.",
      });
    }

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

    // Verificar plan del usuario
    const User = (await import("../models/user.model.js")).default;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        message: "Usuario no encontrado.",
      });
    }

    if (user.plan !== 'premium') {
      return res.status(403).json({
        message: "Esta función requiere el plan Premium.",
        requiresPremium: true,
      });
    }

    logger.log(`Chatbot Premium - Usuario: ${user.username}, Mensaje: ${message.substring(0, 50)}...`);

    // Obtener datos completos del negocio para contexto rico
    const Store = (await import("../models/store.model.js")).default;
    const Product = (await import("../models/product.model.js")).default;
    const Order = (await import("../models/order.model.js")).default;
    const Booking = (await import("../models/booking.model.js")).default;

    const stores = await Store.find({ owner: userId }).select('name category phone address description');
    const storeIds = stores.map(s => s._id);
    
    // Productos con más detalle
    const products = await Product.find({ store: { $in: storeIds } })
      .select('name price stock category description')
      .sort({ createdAt: -1 })
      .limit(50);
    
    // Órdenes recientes con estadísticas
    const recentOrders = await Order.find({ store: { $in: storeIds } })
      .select('totalAmount status items createdAt')
      .sort({ createdAt: -1 })
      .limit(20);
    
    // Reservas recientes
    const recentBookings = await Booking.find({ store: { $in: storeIds } })
      .select('service date status totalPrice createdAt')
      .sort({ createdAt: -1 })
      .limit(15);
    
    // Calcular estadísticas de ventas
    const totalRevenue = recentOrders
      .filter(o => o.status === 'completed' || o.status === 'delivered')
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    
    const averageOrderValue = recentOrders.length > 0 
      ? totalRevenue / recentOrders.filter(o => o.status === 'completed' || o.status === 'delivered').length 
      : 0;
    
    // Productos con bajo stock (menos de 5 unidades)
    const lowStockProducts = products.filter(p => p.stock < 5);
    
    // Top 5 productos más vendidos (contar en órdenes)
    const productSales = {};
    recentOrders.forEach(order => {
      if (order.items && Array.isArray(order.items)) {
        order.items.forEach(item => {
          const productName = item.name || item.productName;
          if (productName) {
            productSales[productName] = (productSales[productName] || 0) + (item.quantity || 1);
          }
        });
      }
    });
    
    const topSellingProducts = Object.entries(productSales)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, sales]) => ({ name, unitsSold: sales }));
    
    // Estadísticas de reservas
    const bookingStats = {
      total: recentBookings.length,
      confirmed: recentBookings.filter(b => b.status === 'confirmed').length,
      pending: recentBookings.filter(b => b.status === 'pending').length,
      cancelled: recentBookings.filter(b => b.status === 'cancelled').length,
    };

    // Preparar contexto rico para la IA
    const userContext = {
      // Información del usuario
      username: user.username,
      email: user.email,
      
      // Información de tiendas
      storesCount: stores.length,
      stores: stores.map(s => ({
        name: s.name,
        category: s.category,
        phone: s.phone,
        address: s.address,
      })),
      
      // Inventario
      productsCount: products.length,
      totalProductsValue: products.reduce((sum, p) => sum + ((p.price || 0) * (p.stock || 0)), 0),
      lowStockCount: lowStockProducts.length,
      lowStockProducts: lowStockProducts.slice(0, 5).map(p => ({
        name: p.name,
        stock: p.stock,
        price: p.price,
      })),
      
      // Ventas
      ordersCount: recentOrders.length,
      totalRevenue: Math.round(totalRevenue),
      averageOrderValue: Math.round(averageOrderValue),
      topSellingProducts,
      
      // Reservas
      bookingsCount: recentBookings.length,
      bookingStats,
      
      // Productos recientes (para consultas específicas)
      recentProducts: products.slice(0, 10).map(p => ({
        name: p.name,
        price: p.price,
        stock: p.stock,
        category: p.category,
      })),
      
      // Contexto adicional del usuario
      ...context
    };

    // Llamar al cliente de IA Premium con contexto enriquecido
    const reply = await getChatbotResponsePremium(message, userContext);

    logger.success(`Chatbot Premium - Respuesta generada para ${user.username}`);

    res.json({
      reply,
      timestamp: new Date(),
      plan: 'premium'
    });
  } catch (error) {
    logger.error("Error en chatbot premium controller:", error.message);

    if (error.message.includes("insufficient_quota") || error.message.includes('429')) {
      return res.status(503).json({
        message: "El servicio de IA no está disponible temporalmente. Intenta de nuevo más tarde.",
      });
    }

    res.status(500).json({
      message: "Error al procesar tu mensaje. Por favor, intenta de nuevo.",
    });
  }
};
