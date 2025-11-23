// src/libs/aiClient.js
/**
 * Cliente para interactuar con la API de OpenAI.
 * Usa la variable de entorno OPENAI_API_KEY para autenticación.
 * Modelo configurable via OPENAI_MODEL (default: gpt-4-turbo-mini).
 */

import logger from "../utils/logger.js";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini"; // Modelo por defecto
const DEMO_MODE = !OPENAI_API_KEY || OPENAI_API_KEY === "sk-proj-placeholder-reemplaza-con-tu-api-key-real";

/**
 * Respuestas de demostración cuando no hay API key configurada
 */
function getDemoResponse(userMessage) {
  const message = userMessage.toLowerCase();
  
  // Respuestas predefinidas según palabras clave
  if (message.includes("hola") || message.includes("buenos") || message.includes("hi")) {
    return "¡Hola! 👋 Soy el asistente virtual de Vitrinex. Estoy aquí para ayudarte con cualquier duda sobre la plataforma. ¿En qué puedo ayudarte hoy?";
  }
  
  if (message.includes("crear") && (message.includes("tienda") || message.includes("negocio"))) {
    return "Para crear tu tienda en Vitrinex:\n\n1. Regístrate o inicia sesión\n2. Ve a tu perfil\n3. Haz clic en 'Crear Tienda'\n4. Completa la información de tu negocio\n5. Configura tus servicios y horarios\n\n¡Así de fácil! ¿Te gustaría saber más sobre algún paso específico?";
  }
  
  if (message.includes("reserva") || message.includes("agendar") || message.includes("cita")) {
    return "Para hacer una reserva:\n\n1. Busca la tienda que te interesa en el mapa\n2. Haz clic en la tienda para ver sus servicios\n3. Selecciona el servicio que deseas\n4. Elige fecha y hora disponible\n5. Confirma tu reserva\n\nRecibirás una notificación con los detalles. ¿Necesitas ayuda con algo más?";
  }
  
  if (message.includes("producto") || message.includes("vender")) {
    return "En Vitrinex puedes vender productos:\n\n• Accede al panel de tu tienda\n• Ve a la sección 'Productos'\n• Agrega fotos, descripción y precio\n• Los clientes podrán ver y comprar tus productos\n\n¿Quieres saber cómo gestionar tus pedidos?";
  }
  
  if (message.includes("mensaje") || message.includes("chat") || message.includes("contactar")) {
    return "El sistema de mensajería te permite:\n\n• Comunicarte con tus clientes sobre reservas\n• Recibir notificaciones en tiempo real\n• Gestionar pedidos y consultas\n\nLos mensajes se encuentran en el panel de notificaciones. ¿Hay algo más que quieras saber?";
  }
  
  if (message.includes("horario") || message.includes("disponibilidad")) {
    return "Para configurar tus horarios:\n\n• Ve al panel de tu tienda\n• Accede a 'Gestión de Horarios'\n• Configura horarios semanales\n• Define días especiales (festivos, vacaciones)\n• Los clientes solo verán horarios disponibles\n\n¿Necesitas ayuda con algo más?";
  }
  
  if (message.includes("vitrinex") || message.includes("qué es") || message.includes("que es")) {
    return "Vitrinex es una plataforma que conecta negocios locales con clientes. Permite:\n\n✨ Crear tiendas virtuales\n📅 Gestionar reservas y citas\n🛍️ Vender productos\n💬 Comunicarte con clientes\n📊 Ver estadísticas de tu negocio\n\n¡Todo en un solo lugar! ¿Quieres saber más sobre alguna función específica?";
  }
  
  if (message.includes("pago") || message.includes("cobrar") || message.includes("precio")) {
    return "En Vitrinex puedes:\n\n• Definir precios para tus servicios\n• Configurar catálogo de productos con precios\n• Los clientes ven los precios antes de reservar\n• Gestionar pedidos desde tu panel\n\n¿Tienes alguna otra pregunta?";
  }
  
  if (message.includes("ayuda") || message.includes("help") || message.includes("soporte")) {
    return "Estoy aquí para ayudarte! Puedo resolver dudas sobre:\n\n• Crear y gestionar tu tienda\n• Sistema de reservas\n• Venta de productos\n• Mensajería con clientes\n• Configuración de horarios\n• Uso general de la plataforma\n\n¿Qué te gustaría saber?";
  }
  
  // Respuesta por defecto
  return `Gracias por tu pregunta sobre "${userMessage.substring(0, 50)}...". \n\nEstoy en modo de demostración. Para respuestas más precisas y personalizadas, el administrador necesita configurar una API key de OpenAI.\n\nMientras tanto, puedo ayudarte con:\n• Crear tiendas\n• Hacer reservas\n• Gestionar productos\n• Usar el sistema de mensajería\n\n¿En qué puedo ayudarte específicamente?`;
}

/**
 * Llama a OpenAI para obtener una respuesta de chat
 * @param {string} userMessage - Mensaje del usuario
 * @returns {Promise<string>} - Respuesta de la IA
 */
async function callOpenAI(userMessage) {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      messages: [
        {
          role: "system",
          content:
            "Eres un asistente virtual de Vitrinex, una plataforma que conecta negocios locales con clientes. " +
            "Tu rol es ayudar a los usuarios a entender cómo usar la plataforma, resolver dudas sobre reservas, " +
            "productos, servicios y funcionalidades generales. Sé amable, profesional y conciso. " +
            "Si no sabes algo, admite que no tienes esa información y sugiere contactar al soporte.",
        },
        {
          role: "user",
          content: userMessage,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    
    // Si es error de cuota, lanzar error específico sin mostrar detalles
    if (errorData.error?.code === 'insufficient_quota' || response.status === 429) {
      throw new Error('insufficient_quota');
    }
    
    logger.error("Error en API de OpenAI:", errorData);
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || "No pude generar una respuesta.";
}

/**
 * Llama a OpenAI con contexto premium (datos reales del usuario)
 * @param {string} userMessage - Mensaje del usuario
 * @param {object} context - Contexto del usuario (tiendas, productos, ventas)
 * @returns {Promise<string>} - Respuesta de la IA
 */
async function callOpenAIPremium(userMessage, context) {
  // Construir contexto detallado del negocio
  const contextInfo = `
DATOS DEL NEGOCIO (${context.username}):

📊 RESUMEN GENERAL:
- Tiendas activas: ${context.storesCount}
${context.stores && context.stores.length > 0 ? context.stores.map(s => `  • ${s.name} (${s.category || 'Sin categoría'})`).join('\n') : ''}
- Productos en inventario: ${context.productsCount}
- Valor total del inventario: $${context.totalProductsValue || 0}

💰 VENTAS Y RENDIMIENTO:
- Órdenes recientes (último mes): ${context.ordersCount}
- Ingresos totales: $${context.totalRevenue || 0}
- Valor promedio por orden: $${context.averageOrderValue || 0}
${context.topSellingProducts && context.topSellingProducts.length > 0 ? `
📈 Top 5 productos más vendidos:
${context.topSellingProducts.map(p => `  • ${p.name}: ${p.unitsSold} unidades vendidas`).join('\n')}
` : ''}

📦 INVENTARIO:
${context.lowStockCount > 0 ? `⚠️ ${context.lowStockCount} productos con bajo stock (< 5 unidades):
${context.lowStockProducts.map(p => `  • ${p.name}: ${p.stock} unidades - $${p.price}`).join('\n')}
` : '✅ No hay alertas de stock bajo'}

${context.recentProducts && context.recentProducts.length > 0 ? `
📋 Productos recientes:
${context.recentProducts.slice(0, 5).map(p => `  • ${p.name} - $${p.price} (Stock: ${p.stock})`).join('\n')}
` : ''}

📅 RESERVAS (si aplica):
- Total de reservas: ${context.bookingsCount || 0}
${context.bookingStats ? `  • Confirmadas: ${context.bookingStats.confirmed}
  • Pendientes: ${context.bookingStats.pending}
  • Canceladas: ${context.bookingStats.cancelled}` : ''}
`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      messages: [
        {
          role: "system",
          content:
            "Eres un ASISTENTE EMPRESARIAL PREMIUM de Vitrinex, especializado en análisis de negocios y estrategia comercial. " +
            "Tienes acceso COMPLETO a los datos reales del negocio del usuario y DEBES usarlos para dar respuestas ESPECÍFICAS y ACCIONABLES.\n\n" +
            "TUS CAPACIDADES:\n" +
            "✅ Analizar ventas y tendencias con datos reales\n" +
            "✅ Identificar productos más y menos rentables\n" +
            "✅ Alertar sobre problemas de stock\n" +
            "✅ Recomendar estrategias de precios basadas en el inventario\n" +
            "✅ Sugerir acciones de marketing específicas para los productos del usuario\n" +
            "✅ Proyectar ventas y sugerir objetivos realistas\n" +
            "✅ Optimizar gestión de inventario\n\n" +
            "ESTILO DE RESPUESTA:\n" +
            "- Sé ESPECÍFICO: usa nombres de productos, cifras exactas y datos reales\n" +
            "- Sé ACCIONABLE: da pasos concretos que el usuario pueda ejecutar YA\n" +
            "- Sé PROFESIONAL pero cercano: eres un consultor experto pero amigable\n" +
            "- Usa EMOJIS relevantes (📊 📈 💰 ⚠️ ✅) para hacer el mensaje más visual\n" +
            "- Organiza la información con viñetas y estructura clara\n" +
            "- Si detectas problemas, menciónalos pero SIEMPRE da soluciones\n\n" +
            "IMPORTANTE:\n" +
            "- NO inventes datos, SOLO usa la información proporcionada\n" +
            "- Si faltan datos para responder algo, pregunta al usuario\n" +
            "- Prioriza insights que generen VALOR INMEDIATO al negocio\n" +
            "- Mantén respuestas concisas pero completas (máx 500 palabras)",
        },
        {
          role: "user",
          content: `${contextInfo}\n\n❓ PREGUNTA DEL USUARIO:\n${userMessage}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 800, // Aumentado para respuestas más completas
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    
    if (errorData.error?.code === 'insufficient_quota' || response.status === 429) {
      throw new Error('insufficient_quota');
    }
    
    logger.error("Error en API de OpenAI Premium:", errorData);
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  
  // Retornar respuesta con datos de uso
  return {
    message: data.choices[0]?.message?.content || "No pude generar una respuesta.",
    usage: {
      promptTokens: data.usage?.prompt_tokens || 0,
      completionTokens: data.usage?.completion_tokens || 0,
      totalTokens: data.usage?.total_tokens || 0
    }
  };
}

/**
 * Función principal que llama al proveedor de IA configurado
 * @param {string} message - Mensaje del usuario
 * @returns {Promise<string>} - Respuesta de la IA
 */
export async function getChatbotResponse(message) {
  // Validar que el mensaje no esté vacío
  if (!message || message.trim().length === 0) {
    throw new Error("El mensaje no puede estar vacío.");
  }

  // Si estamos en modo demo (sin API key), usar respuestas predefinidas
  if (DEMO_MODE) {
    logger.log("Chatbot en modo DEMO (sin API key configurada)");
    // Simular un pequeño delay para que parezca más real
    await new Promise(resolve => setTimeout(resolve, 500));
    return getDemoResponse(message);
  }

  try {
    // Llamar directamente a OpenAI (único proveedor soportado)
    return await callOpenAI(message);
  } catch (error) {
    // Si hay error de cuota insuficiente, cambiar automáticamente a modo demo
    if (error.message.includes('insufficient_quota') || error.message.includes('429')) {
      logger.log("⚠️ Versión de pago anulada, procede a usarse modo DEMO");
      return getDemoResponse(message);
    }
    
    logger.error("Error al obtener respuesta del chatbot:", error.message);
    throw error;
  }
}

/**
 * Función premium que llama al proveedor de IA con contexto del usuario
 * @param {string} message - Mensaje del usuario
 * @param {object} context - Contexto con datos del negocio
 * @returns {Promise<string>} - Respuesta de la IA
 */
export async function getChatbotResponsePremium(message, context = {}) {
  // Validar que el mensaje no esté vacío
  if (!message || message.trim().length === 0) {
    throw new Error("El mensaje no puede estar vacío.");
  }

  // Si estamos en modo demo, usar respuestas predefinidas (no premium)
  if (DEMO_MODE) {
    logger.log("Chatbot Premium en modo DEMO - usando respuestas básicas");
    await new Promise(resolve => setTimeout(resolve, 500));
    return getDemoResponse(message) + "\n\n💡 Con el plan Premium y IA real activada, recibirías análisis personalizados basados en tus datos reales de negocio.";
  }

  try {
    // Llamar directamente a OpenAI Premium
    return await callOpenAIPremium(message, context);
  } catch (error) {
    // Si hay error de cuota, usar respuesta básica
    if (error.message.includes('insufficient_quota') || error.message.includes('429')) {
      logger.log("⚠️ Cuota agotada en Premium, usando respuesta básica");
      return getDemoResponse(message) + "\n\n⚠️ El servicio de IA Premium no está disponible temporalmente.";
    }
    
    logger.error("Error al obtener respuesta premium del chatbot:", error.message);
    throw error;
  }
}
