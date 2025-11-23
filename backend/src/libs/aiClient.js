// src/libs/aiClient.js
/**
 * Cliente para interactuar con la API de OpenAI u otro proveedor de IA.
 * Usa la variable de entorno AI_API_KEY para autenticación.
 * Configurable para diferentes modelos y proveedores.
 */

import logger from "../utils/logger.js";

const AI_API_KEY = process.env.AI_API_KEY;
const AI_PROVIDER = process.env.AI_PROVIDER || "openai"; // openai, anthropic, etc.
const AI_MODEL = process.env.AI_MODEL || "gpt-3.5-turbo"; // Modelo por defecto
const DEMO_MODE = !AI_API_KEY || AI_API_KEY === "sk-proj-placeholder-reemplaza-con-tu-api-key-real";

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
      Authorization: `Bearer ${AI_API_KEY}`,
    },
    body: JSON.stringify({
      model: AI_MODEL,
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
  const contextInfo = `
Contexto del usuario:
- Negocios: ${context.storesCount}
- Productos: ${context.productsCount}
- Pedidos recientes: ${context.recentOrdersCount}
${context.topProducts && context.topProducts.length > 0 ? `
Productos principales:
${context.topProducts.map(p => `• ${p.name} - $${p.price} (Stock: ${p.stock})`).join('\n')}
` : ''}
`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${AI_API_KEY}`,
    },
    body: JSON.stringify({
      model: AI_MODEL,
      messages: [
        {
          role: "system",
          content:
            "Eres un asistente empresarial premium de Vitrinex. Tienes acceso a datos reales del negocio del usuario " +
            "y puedes dar consejos específicos basados en sus productos, ventas y estadísticas. " +
            "Proporciona análisis inteligentes, recomendaciones de ventas, alertas de stock bajo, " +
            "sugerencias de precios, estrategias de marketing y predicciones basadas en los datos. " +
            "Sé profesional, analítico y orientado a resultados.",
        },
        {
          role: "user",
          content: `${contextInfo}\n\nPregunta: ${userMessage}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 700,
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
  return data.choices[0]?.message?.content || "No pude generar una respuesta.";
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
    // Por ahora solo soportamos OpenAI, pero se puede extender fácilmente
    if (AI_PROVIDER === "openai") {
      return await callOpenAI(message);
    } else {
      throw new Error(`Proveedor de IA no soportado: ${AI_PROVIDER}`);
    }
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
    if (AI_PROVIDER === "openai") {
      return await callOpenAIPremium(message, context);
    } else {
      throw new Error(`Proveedor de IA no soportado: ${AI_PROVIDER}`);
    }
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
