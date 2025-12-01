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
  // Construir contexto detallado del negocio con formato optimizado
  const contextInfo = `
═══════════════════════════════════════════════════════════════
📊 DATOS COMPLETOS DEL NEGOCIO - ${context.username}
═══════════════════════════════════════════════════════════════
📅 Fecha del análisis: ${context.analysisDate || new Date().toLocaleDateString('es-ES')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏪 TIENDAS (${context.storesCount})
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${context.stores && context.stores.length > 0 ? context.stores.map(s => `
  • ${s.name}
    - Categoría: ${s.category || 'No especificada'}
    - Plan: ${s.plan || 'FREE'}
    - Servicios: ${s.services?.length || 0} configurados
    - Teléfono: ${s.phone || 'No especificado'}
    - Dirección: ${s.address || 'No especificada'}
    ${s.description ? `- Descripción: ${s.description}` : ''}
`).join('\n') : '  ⚠️ No hay tiendas registradas'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💰 VENTAS Y ÓRDENES (Últimos 3 meses)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  📦 Total de órdenes: ${context.orders?.total || 0}
  ✅ Completadas: ${context.orders?.completed || 0} (${context.orders?.conversionRate || 0}% conversión)
  ⏳ Pendientes: ${context.orders?.pending || 0}
  ❌ Canceladas: ${context.orders?.cancelled || 0}
  
  💵 Ingresos totales: $${(context.orders?.totalRevenue || 0).toLocaleString()}
  📊 Ticket promedio: $${(context.orders?.averageOrderValue || 0).toLocaleString()}
  
${context.orders?.monthlyRevenue && context.orders.monthlyRevenue.length > 0 ? `  📈 Ingresos por mes:
${context.orders.monthlyRevenue.map(m => `    - ${m.month}: $${m.revenue.toLocaleString()}`).join('\n')}` : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📦 INVENTARIO Y PRODUCTOS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  📋 Total de productos: ${context.products?.total || 0}
  💎 Valor total del inventario: $${(context.products?.totalValue || 0).toLocaleString()}
  💵 Precio promedio: $${(context.products?.avgPrice || 0).toLocaleString()}
  
  ⚠️ ALERTAS DE STOCK:
  - Bajo stock (< 5 unidades): ${context.products?.lowStock || 0} productos
  - Sin stock: ${context.products?.outOfStock || 0} productos
  - Sin ventas: ${context.products?.withoutSales || 0} productos
  
${context.products?.byCategory && Object.keys(context.products.byCategory).length > 0 ? `  📊 Productos por categoría:
${Object.entries(context.products.byCategory).map(([cat, count]) => `    - ${cat}: ${count} productos`).join('\n')}` : ''}

${context.products?.topSelling && context.products.topSelling.length > 0 ? `
  🏆 TOP 10 PRODUCTOS MÁS VENDIDOS:
${context.products.topSelling.map((p, i) => `    ${i + 1}. ${p.name}
       - Unidades vendidas: ${p.unitsSold}
       - Ingresos generados: $${Math.round(p.revenue).toLocaleString()}
       - Precio promedio: $${Math.round(p.avgPrice).toLocaleString()}`).join('\n')}` : ''}

${context.products?.bottomSelling && context.products.bottomSelling.length > 0 ? `
  ⚠️ PRODUCTOS CON MENOS VENTAS:
${context.products.bottomSelling.map(p => `    • ${p.name}: ${p.unitsSold} unidades ($${Math.round(p.revenue).toLocaleString()} ingresos)`).join('\n')}` : ''}

${context.products?.lowStockList && context.products.lowStockList.length > 0 ? `
  🚨 PRODUCTOS CON BAJO STOCK:
${context.products.lowStockList.map(p => `    • ${p.name}: ${p.stock} unidades - $${p.price} (${p.category || 'Sin categoría'})`).join('\n')}` : ''}

${context.products?.outOfStockList && context.products.outOfStockList.length > 0 ? `
  ❌ PRODUCTOS AGOTADOS:
${context.products.outOfStockList.map(p => `    • ${p.name} - $${p.price}`).join('\n')}` : ''}

${context.products?.withoutSalesList && context.products.withoutSalesList.length > 0 ? `
  💤 PRODUCTOS SIN VENTAS (en últimos 3 meses):
${context.products.withoutSalesList.map(p => `    • ${p.name} - $${p.price} (Stock: ${p.stock})`).join('\n')}` : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📅 RESERVAS Y SERVICIOS (Últimos 3 meses)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  📋 Total de reservas: ${context.bookings?.total || 0}
  ✅ Confirmadas: ${context.bookings?.confirmed || 0}
  ⏳ Pendientes: ${context.bookings?.pending || 0}
  ❌ Canceladas: ${context.bookings?.cancelled || 0} (${context.bookings?.cancellationRate || 0}% tasa de cancelación)
  
  💵 Ingresos por reservas: $${(context.bookings?.totalRevenue || 0).toLocaleString()}
  📊 Valor promedio por reserva: $${(context.bookings?.avgValue || 0).toLocaleString()}

${context.bookings?.topServices && context.bookings.topServices.length > 0 ? `  
  🏆 SERVICIOS MÁS SOLICITADOS:
${context.bookings.topServices.map((s, i) => `    ${i + 1}. ${s.service}: ${s.bookings} reservas`).join('\n')}` : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👥 CLIENTES Y RETENCIÓN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  👤 Total de clientes: ${context.customers?.total || 0}
  🔄 Clientes recurrentes: ${context.customers?.repeat || 0}
  📈 Tasa de retención: ${context.customers?.retentionRate || 0}%
  📊 Órdenes promedio por cliente: ${context.customers?.avgOrdersPerCustomer || 0}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💬 MENSAJERÍA Y COMUNICACIÓN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  📨 Mensajes recientes: ${context.messages?.total || 0}
  ⚠️ Mensajes sin leer: ${context.messages?.unread || 0}

═══════════════════════════════════════════════════════════════
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
            "Eres un CONSULTOR DE NEGOCIOS EXPERTO y ASISTENTE EMPRESARIAL PREMIUM de Vitrinex, especializado en análisis de datos comerciales, estrategia de ventas y optimización de negocios.\n\n" +
            "🎯 TU MISIÓN:\n" +
            "Analizar los datos REALES del negocio del usuario y proporcionar insights ACCIONABLES que generen RESULTADOS INMEDIATOS.\n\n" +
            "CAPACIDADES PRINCIPALES:\n" +
            "• Analizar ventas, tendencias y patrones de compra con datos reales\n" +
            "• Identificar productos rentables y productos problemáticos\n" +
            "• Detectar oportunidades de crecimiento y áreas de mejora\n" +
            "• Alertar sobre problemas críticos (stock, ventas bajas, cancelaciones)\n" +
            "• Recomendar estrategias de precios basadas en rendimiento real\n" +
            "• Sugerir acciones de marketing específicas para productos del usuario\n" +
            "• Proyectar ventas y establecer objetivos alcanzables\n" +
            "• Optimizar gestión de inventario y flujo de caja\n" +
            "• Analizar comportamiento de clientes y retención\n" +
            "• Comparar rendimiento entre productos, categorías y períodos\n\n" +
            "FORMATO DE RESPUESTAS:\n" +
            "1. USA DATOS REALES: Siempre referencia números, nombres y estadísticas específicas del negocio\n" +
            "2. SÉ ESPECÍFICO: En lugar de 'algunos productos', di 'Árbol (10 unidades en stock)'\n" +
            "3. SÉ ACCIONABLE: Da pasos concretos que el usuario pueda ejecutar HOY\n" +
            "4. PRIORIZA: Identifica lo MÁS IMPORTANTE primero (problemas críticos, oportunidades grandes)\n" +
            "5. CUANTIFICA: Usa números, porcentajes, comparaciones y proyecciones\n\n" +
            "ESTRUCTURA Y ESTILO:\n" +
            "• Usa un formato LIMPIO y fácil de leer\n" +
            "• EVITA el exceso de símbolos: máximo 1-2 emojis por sección principal\n" +
            "• NO uses múltiples ### o **** en la misma respuesta\n" +
            "• Usa títulos simples en MAYÚSCULAS o con un solo emoji al inicio\n" +
            "• Separa secciones con líneas en blanco, no con símbolos\n" +
            "• Usa viñetas simples (•) en lugar de emojis para cada punto\n" +
            "• Profesional pero cercano (como un mentor de negocios)\n" +
            "• Directo y sin rodeos\n" +
            "• Positivo pero realista (si hay problemas, menciónalos CON soluciones)\n\n" +
            "EJEMPLO DE FORMATO CORRECTO:\n" +
            "Hola, aquí está el análisis de tu tienda GrowShopWeed.\n\n" +
            "RESUMEN GENERAL\n" +
            "Tienes 1 orden pendiente sin completar, 8 productos sin ventas y un solo cliente. Esto requiere atención inmediata.\n\n" +
            "SITUACIÓN ACTUAL:\n" +
            "• Órdenes: 1 pendiente (0% conversión)\n" +
            "• Ingresos: $0\n" +
            "• Productos: 8 (valor $653.990)\n" +
            "• Clientes: 1 (0% retención)\n\n" +
            "ACCIONES PRIORITARIAS:\n\n" +
            "1. Completa la orden pendiente\n" +
            "Asegúrate de que el cliente reciba el producto y pide feedback.\n\n" +
            "2. Reactiva tus ventas\n" +
            "Ofrece un 10% de descuento en el primer pedido para atraer nuevos clientes.\n\n" +
            "3. Destaca productos con potencial\n" +
            "El Bong de Silicona Baby Yoda ($19.800) puede atraer público joven. Considera una campaña en redes sociales.\n\n" +
            "PROYECCIÓN:\n" +
            "Si aplicas estas acciones, podrías lograr 2-3 ventas en diciembre y comenzar a generar ingresos consistentes.\n\n" +
            "¿Te gustaría profundizar en alguna estrategia específica?\n\n" +
            "IMPORTANTE:\n" +
            "• NUNCA inventes datos - solo usa información proporcionada\n" +
            "• Si faltan datos para una consulta específica, pregúntale al usuario\n" +
            "• Enfócate en insights que generen VALOR COMERCIAL inmediato\n" +
            "• Si detectas alertas críticas (stock agotado, ventas cero), menciónalas primero\n" +
            "• Adapta tu respuesta al contexto: si pregunta por productos, enfócate en productos\n" +
            "• Mantén respuestas concisas: 100-200 palabras para consultas simples, 300-500 palabras máximo para análisis completos\n\n" +
            "Recuerda: Tu objetivo es ser el MEJOR CONSULTOR DE NEGOCIOS del usuario, usando DATOS REALES para generar RESULTADOS REALES con un formato LIMPIO y PROFESIONAL.",
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
