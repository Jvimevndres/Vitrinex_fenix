// src/controllers/chatbot.controller.js
/**
 * Controlador para el chatbot con IA.
 * Maneja las peticiones de chat del usuario y devuelve respuestas generadas por IA.
 * Soporta dos planes: FREE (básico) y PREMIUM (con datos reales)
 */

import { getChatbotResponse, getChatbotResponsePremium } from "../libs/aiClient.js";
import logger from "../utils/logger.js";
import ChatbotUsage from "../models/ChatbotUsage.js";

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
    const Message = (await import("../models/message.model.js")).default;

    // Obtener TODAS las tiendas del usuario con información completa
    const stores = await Store.find({ owner: userId })
      .select('name category phone address description plan services schedule weeklySchedule specialDays createdAt')
      .lean();
    
    const storeIds = stores.map(s => s._id);
    
    // Si no tiene tiendas, notificar
    if (storeIds.length === 0) {
      logger.log(`Usuario ${user.username} no tiene tiendas`);
    }
    
    // Productos con TODO el detalle
    const products = await Product.find({ store: { $in: storeIds } })
      .select('name price stock category description images createdAt updatedAt')
      .sort({ createdAt: -1 })
      .limit(100) // Aumentado para tener más contexto
      .lean();
    
    // Órdenes TODAS (últimos 3 meses para análisis completo)
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    
    const allOrders = await Order.find({ 
      store: { $in: storeIds },
      createdAt: { $gte: threeMonthsAgo }
    })
      .select('totalAmount status items customerName customerEmail createdAt updatedAt')
      .sort({ createdAt: -1 })
      .lean();
    
    // Reservas TODAS (últimos 3 meses)
    const allBookings = await Booking.find({ 
      store: { $in: storeIds },
      createdAt: { $gte: threeMonthsAgo }
    })
      .select('service date time status totalPrice customerName customerEmail notes createdAt')
      .sort({ createdAt: -1 })
      .lean();
    
    // Mensajes recientes (para análisis de interacción con clientes)
    const recentMessages = await Message.find({ 
      store: { $in: storeIds }
    })
      .select('content sender receiver read createdAt')
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();
    
    // ============ ANÁLISIS PROFUNDO DE DATOS ============
    
    // 1. ANÁLISIS DE VENTAS
    const completedOrders = allOrders.filter(o => o.status === 'completed' || o.status === 'delivered');
    const pendingOrders = allOrders.filter(o => o.status === 'pending');
    const cancelledOrders = allOrders.filter(o => o.status === 'cancelled');
    
    const totalRevenue = completedOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const averageOrderValue = completedOrders.length > 0 ? totalRevenue / completedOrders.length : 0;
    
    // Ingresos por mes (últimos 3 meses)
    const monthlyRevenue = {};
    completedOrders.forEach(order => {
      const month = new Date(order.createdAt).toLocaleString('es-ES', { month: 'long', year: 'numeric' });
      monthlyRevenue[month] = (monthlyRevenue[month] || 0) + order.totalAmount;
    });
    
    // 2. ANÁLISIS DE PRODUCTOS
    const productSales = {};
    const productRevenue = {};
    
    allOrders.forEach(order => {
      if (order.items && Array.isArray(order.items)) {
        order.items.forEach(item => {
          const productName = item.name || item.productName || 'Producto sin nombre';
          const quantity = item.quantity || 1;
          const price = item.price || 0;
          
          productSales[productName] = (productSales[productName] || 0) + quantity;
          productRevenue[productName] = (productRevenue[productName] || 0) + (price * quantity);
        });
      }
    });
    
    const topSellingProducts = Object.entries(productSales)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, units]) => ({ 
        name, 
        unitsSold: units,
        revenue: productRevenue[name] || 0,
        avgPrice: (productRevenue[name] || 0) / units
      }));
    
    const bottomSellingProducts = Object.entries(productSales)
      .sort((a, b) => a[1] - b[1])
      .slice(0, 5)
      .map(([name, units]) => ({ 
        name, 
        unitsSold: units,
        revenue: productRevenue[name] || 0
      }));
    
    // Productos sin ventas
    const productsWithoutSales = products.filter(p => !productSales[p.name]);
    
    // Productos con bajo stock (menos de 5 unidades)
    const lowStockProducts = products.filter(p => p.stock < 5 && p.stock > 0);
    const outOfStockProducts = products.filter(p => p.stock === 0);
    
    // 3. ANÁLISIS DE RESERVAS
    const confirmedBookings = allBookings.filter(b => b.status === 'confirmed');
    const pendingBookings = allBookings.filter(b => b.status === 'pending');
    const cancelledBookings = allBookings.filter(b => b.status === 'cancelled');
    
    const totalBookingRevenue = confirmedBookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
    const avgBookingValue = confirmedBookings.length > 0 ? totalBookingRevenue / confirmedBookings.length : 0;
    
    // Servicios más solicitados
    const serviceCounts = {};
    allBookings.forEach(booking => {
      const service = booking.service || 'Servicio desconocido';
      serviceCounts[service] = (serviceCounts[service] || 0) + 1;
    });
    
    const topServices = Object.entries(serviceCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ service: name, bookings: count }));
    
    // 4. ANÁLISIS DE CLIENTES
    const uniqueCustomers = new Set();
    const customerOrders = {};
    
    allOrders.forEach(order => {
      if (order.customerEmail) {
        const customerId = order.customerEmail; // Usar email como identificador único
        uniqueCustomers.add(customerId);
        customerOrders[customerId] = (customerOrders[customerId] || 0) + 1;
      }
    });
    
    allBookings.forEach(booking => {
      if (booking.customerEmail) {
        const customerId = booking.customerEmail;
        uniqueCustomers.add(customerId);
        // No contar bookings en customerOrders para evitar duplicación
      }
    });
    
    const totalCustomers = uniqueCustomers.size;
    const repeatCustomers = Object.values(customerOrders).filter(count => count > 1).length;
    const customerRetentionRate = totalCustomers > 0 ? (repeatCustomers / totalCustomers * 100) : 0;
    
    // 5. ANÁLISIS DE INVENTARIO
    const totalProductsValue = products.reduce((sum, p) => sum + ((p.price || 0) * (p.stock || 0)), 0);
    const avgProductPrice = products.length > 0 
      ? products.reduce((sum, p) => sum + (p.price || 0), 0) / products.length 
      : 0;
    
    // Productos por categoría
    const productsByCategory = {};
    products.forEach(p => {
      const category = p.category || 'Sin categoría';
      productsByCategory[category] = (productsByCategory[category] || 0) + 1;
    });

    // Preparar contexto SÚPER RICO para la IA
    const userContext = {
      // ========== INFORMACIÓN BÁSICA ==========
      username: user.username,
      email: user.email,
      plan: user.plan,
      
      // ========== TIENDAS ==========
      storesCount: stores.length,
      stores: stores.map(s => ({
        name: s.name,
        category: s.category,
        phone: s.phone,
        address: s.address,
        description: s.description,
        plan: s.plan,
        services: s.services || [],
        hasSchedule: !!s.schedule || !!s.weeklySchedule,
        specialDaysCount: s.specialDays?.length || 0,
        createdAt: s.createdAt
      })),
      
      // ========== VENTAS Y ÓRDENES ==========
      orders: {
        total: allOrders.length,
        completed: completedOrders.length,
        pending: pendingOrders.length,
        cancelled: cancelledOrders.length,
        totalRevenue: Math.round(totalRevenue),
        averageOrderValue: Math.round(averageOrderValue),
        monthlyRevenue: Object.entries(monthlyRevenue).map(([month, revenue]) => ({
          month,
          revenue: Math.round(revenue)
        })),
        conversionRate: allOrders.length > 0 
          ? Math.round((completedOrders.length / allOrders.length) * 100) 
          : 0
      },
      
      // ========== PRODUCTOS ==========
      products: {
        total: products.length,
        totalValue: Math.round(totalProductsValue),
        avgPrice: Math.round(avgProductPrice),
        byCategory: productsByCategory,
        lowStock: lowStockProducts.length,
        outOfStock: outOfStockProducts.length,
        withoutSales: productsWithoutSales.length,
        
        // Top productos
        topSelling: topSellingProducts,
        bottomSelling: bottomSellingProducts,
        
        // Alertas
        lowStockList: lowStockProducts.slice(0, 10).map(p => ({
          name: p.name,
          stock: p.stock,
          price: p.price,
          category: p.category
        })),
        outOfStockList: outOfStockProducts.slice(0, 5).map(p => ({
          name: p.name,
          price: p.price
        })),
        withoutSalesList: productsWithoutSales.slice(0, 10).map(p => ({
          name: p.name,
          price: p.price,
          stock: p.stock
        }))
      },
      
      // ========== RESERVAS ==========
      bookings: {
        total: allBookings.length,
        confirmed: confirmedBookings.length,
        pending: pendingBookings.length,
        cancelled: cancelledBookings.length,
        totalRevenue: Math.round(totalBookingRevenue),
        avgValue: Math.round(avgBookingValue),
        topServices: topServices,
        cancellationRate: allBookings.length > 0 
          ? Math.round((cancelledBookings.length / allBookings.length) * 100)
          : 0
      },
      
      // ========== CLIENTES ==========
      customers: {
        total: totalCustomers,
        repeat: repeatCustomers,
        retentionRate: Math.round(customerRetentionRate),
        avgOrdersPerCustomer: totalCustomers > 0 
          ? Math.round(allOrders.length / totalCustomers * 10) / 10 
          : 0
      },
      
      // ========== MENSAJERÍA ==========
      messages: {
        total: recentMessages.length,
        unread: recentMessages.filter(m => !m.read).length
      },
      
      // ========== CONTEXTO ADICIONAL ==========
      analysisDate: new Date().toLocaleDateString('es-ES', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      
      // Contexto adicional del usuario (si lo envía desde el frontend)
      ...context
    };

    // Llamar al cliente de IA Premium con contexto enriquecido
    const aiResponse = await getChatbotResponsePremium(message, userContext);

    // Calcular costo estimado (gpt-4o-mini pricing)
    // Input: $0.15 per 1M tokens, Output: $0.60 per 1M tokens
    const inputCost = (aiResponse.usage.promptTokens / 1_000_000) * 0.15;
    const outputCost = (aiResponse.usage.completionTokens / 1_000_000) * 0.60;
    const totalCost = inputCost + outputCost;

    // Guardar registro de uso
    const usageRecord = new ChatbotUsage({
      storeId: stores[0]?._id, // Primera tienda del usuario
      userId: user._id,
      messageType: 'premium',
      promptTokens: aiResponse.usage.promptTokens,
      completionTokens: aiResponse.usage.completionTokens,
      totalTokens: aiResponse.usage.totalTokens,
      estimatedCost: totalCost,
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      success: true
    });
    
    await usageRecord.save();

    logger.success(`Chatbot Premium - Respuesta generada para ${user.username} (${aiResponse.usage.totalTokens} tokens, $${totalCost.toFixed(6)})`);

    res.json({
      reply: aiResponse.message,
      timestamp: new Date(),
      plan: 'premium',
      usage: {
        tokens: aiResponse.usage.totalTokens,
        cost: totalCost
      }
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

/**
 * GET /api/chatbot/stats
 * Obtiene estadísticas de uso del chatbot (solo admin)
 */
export const getChatbotStats = async (req, res) => {
  try {
    const { timeRange = '30d' } = req.query;
    
    // Calcular fecha de inicio según el rango
    const now = new Date();
    let startDate = new Date();
    
    switch(timeRange) {
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      case 'all':
        startDate = new Date(0); // Desde el principio
        break;
      default:
        startDate.setDate(now.getDate() - 30);
    }

    // Obtener todos los registros en el rango
    const usageRecords = await ChatbotUsage.find({
      createdAt: { $gte: startDate }
    }).sort({ createdAt: -1 });

    // Calcular estadísticas generales
    const totalQueries = usageRecords.length;
    const premiumQueries = usageRecords.filter(r => r.messageType === 'premium').length;
    const freeQueries = usageRecords.filter(r => r.messageType === 'free').length;
    
    const totalTokens = usageRecords.reduce((sum, r) => sum + r.totalTokens, 0);
    const totalCost = usageRecords.reduce((sum, r) => sum + r.estimatedCost, 0);
    
    const avgTokensPerQuery = totalQueries > 0 ? Math.round(totalTokens / totalQueries) : 0;
    const avgCostPerQuery = totalQueries > 0 ? totalCost / totalQueries : 0;

    // Proyección de saldo (asumiendo $5 USD iniciales)
    const initialBalance = 5.00;
    const remainingBalance = Math.max(0, initialBalance - totalCost);
    const estimatedQueriesRemaining = remainingBalance > 0 && avgCostPerQuery > 0 
      ? Math.floor(remainingBalance / avgCostPerQuery) 
      : 0;

    // Estimación de meses restantes (basado en uso diario promedio)
    const daysInRange = Math.ceil((now - startDate) / (1000 * 60 * 60 * 24));
    const avgQueriesPerDay = daysInRange > 0 ? totalQueries / daysInRange : 0;
    const estimatedDaysRemaining = avgQueriesPerDay > 0 
      ? Math.floor(estimatedQueriesRemaining / avgQueriesPerDay) 
      : 0;
    const estimatedMonthsRemaining = Math.floor(estimatedDaysRemaining / 30);

    // Datos para gráfico diario (últimos 30 días)
    const last30Days = [];
    const dailyData = {};
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];
      last30Days.push(dateKey);
      dailyData[dateKey] = { queries: 0, cost: 0, tokens: 0 };
    }

    usageRecords.forEach(record => {
      const dateKey = record.createdAt.toISOString().split('T')[0];
      if (dailyData[dateKey]) {
        dailyData[dateKey].queries += 1;
        dailyData[dateKey].cost += record.estimatedCost;
        dailyData[dateKey].tokens += record.totalTokens;
      }
    });

    const dailyStats = last30Days.map(date => ({
      date,
      queries: dailyData[date].queries,
      cost: parseFloat(dailyData[date].cost.toFixed(6)),
      tokens: dailyData[date].tokens
    }));

    // Top usuarios (por uso)
    const userUsage = {};
    await Promise.all(usageRecords.map(async (record) => {
      const userId = record.userId.toString();
      if (!userUsage[userId]) {
        const User = (await import("../models/user.model.js")).default;
        const user = await User.findById(record.userId).select('username email');
        userUsage[userId] = {
          username: user?.username || 'Usuario desconocido',
          email: user?.email || '',
          queries: 0,
          cost: 0,
          tokens: 0
        };
      }
      userUsage[userId].queries += 1;
      userUsage[userId].cost += record.estimatedCost;
      userUsage[userId].tokens += record.totalTokens;
    }));

    const topUsers = Object.values(userUsage)
      .sort((a, b) => b.cost - a.cost)
      .slice(0, 10)
      .map(u => ({
        ...u,
        cost: parseFloat(u.cost.toFixed(6))
      }));

    res.json({
      summary: {
        totalQueries,
        premiumQueries,
        freeQueries,
        totalTokens,
        totalCost: parseFloat(totalCost.toFixed(4)),
        avgTokensPerQuery,
        avgCostPerQuery: parseFloat(avgCostPerQuery.toFixed(6))
      },
      balance: {
        initial: initialBalance,
        spent: parseFloat(totalCost.toFixed(4)),
        remaining: parseFloat(remainingBalance.toFixed(4)),
        estimatedQueriesRemaining,
        estimatedMonthsRemaining
      },
      dailyStats,
      topUsers,
      timeRange
    });

  } catch (error) {
    logger.error("Error obteniendo stats de chatbot:", error);
    res.status(500).json({
      message: "Error al obtener estadísticas del chatbot"
    });
  }
};
