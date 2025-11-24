/**
 * Script de prueba para el Chatbot Premium
 * Verifica que el chatbot tenga acceso a los datos reales del usuario
 */

import fetch from 'node-fetch';
import 'dotenv/config';

const API_URL = process.env.API_URL || 'http://localhost:4000/api';

// Colores para consola
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testChatbotPremium() {
  try {
    log('cyan', '\n═══════════════════════════════════════════════════════════════');
    log('bright', '🤖 TEST DEL CHATBOT PREMIUM - ANÁLISIS EMPRESARIAL');
    log('cyan', '═══════════════════════════════════════════════════════════════\n');

    // Paso 1: Login
    log('blue', '📝 Paso 1: Iniciando sesión...');
    const loginResponse = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@admin.com',
        password: 'admin123'
      })
    });

    if (!loginResponse.ok) {
      throw new Error('Error en login: ' + loginResponse.statusText);
    }

    const loginData = await loginResponse.json();
    const token = loginData.token;
    const user = loginData;
    
    log('green', `✅ Login exitoso - Usuario: ${user.username} (Plan: ${user.plan || 'FREE'})`);
    
    if (user.plan !== 'premium') {
      log('yellow', '\n⚠️  ADVERTENCIA: Este usuario no tiene plan Premium');
      log('yellow', '   El chatbot usará el endpoint básico (sin contexto de negocio)');
      log('yellow', '   Para probar el chatbot premium, usa un usuario con plan "premium"\n');
    }

    // Paso 2: Verificar salud del chatbot
    log('blue', '\n📡 Paso 2: Verificando estado del chatbot...');
    const healthResponse = await fetch(`${API_URL}/chatbot/health`);
    const health = await healthResponse.json();
    
    log('green', `✅ Chatbot Status: ${health.status}`);
    log('green', `   Modo: ${health.mode.toUpperCase()} ${health.mode === 'demo' ? '(respuestas predefinidas)' : '(IA real de OpenAI)'}`);
    log('green', `   Mensaje: ${health.message}`);

    // Paso 3: Probar diferentes tipos de consultas
    const testQueries = [
      {
        name: 'Análisis General',
        query: 'Analiza el rendimiento completo de mi negocio',
      },
      {
        name: 'Productos Más Vendidos',
        query: '¿Cuáles son mis productos más vendidos y cuánto generan?',
      },
      {
        name: 'Alertas de Stock',
        query: '¿Tengo productos con bajo stock o agotados?',
      },
      {
        name: 'Estrategia de Ventas',
        query: 'Dame 3 estrategias concretas para aumentar mis ventas',
      },
    ];

    for (let i = 0; i < testQueries.length; i++) {
      const test = testQueries[i];
      
      log('blue', `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      log('bright', `📊 Test ${i + 1}/${testQueries.length}: ${test.name}`);
      log('blue', `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      log('yellow', `\n💬 Usuario pregunta: "${test.query}"`);
      
      try {
        const endpoint = user.plan === 'premium' ? '/chatbot/premium' : '/chatbot';
        const startTime = Date.now();
        
        const response = await fetch(`${API_URL}${endpoint}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-access-token': token
          },
          body: JSON.stringify({ message: test.query })
        });
        
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || response.statusText);
        }
        
        const data = await response.json();
        
        log('green', `\n✅ Respuesta recibida en ${responseTime}ms`);
        
        if (data.plan) {
          log('cyan', `   Plan usado: ${data.plan.toUpperCase()}`);
        }
        
        if (data.usage) {
          log('cyan', `   Tokens usados: ${data.usage.tokens}`);
          log('cyan', `   Costo: $${data.usage.cost.toFixed(6)}`);
        }
        
        log('bright', '\n🤖 Respuesta del chatbot:');
        log('reset', '─'.repeat(70));
        console.log(data.reply);
        log('reset', '─'.repeat(70));
        
        // Análisis de la respuesta
        const reply = data.reply.toLowerCase();
        const hasNumbers = /\d+/.test(reply);
        const hasProductNames = reply.includes('árbol') || reply.includes('producto') || reply.includes('cancha');
        const hasRecommendations = reply.includes('recomend') || reply.includes('sugiero') || reply.includes('debes');
        
        log('cyan', '\n📋 Análisis de la respuesta:');
        log(hasNumbers ? 'green' : 'yellow', `   ${hasNumbers ? '✅' : '⚠️'} Contiene datos numéricos: ${hasNumbers ? 'SÍ' : 'NO'}`);
        log(hasProductNames ? 'green' : 'yellow', `   ${hasProductNames ? '✅' : '⚠️'} Menciona productos específicos: ${hasProductNames ? 'SÍ' : 'NO'}`);
        log(hasRecommendations ? 'green' : 'yellow', `   ${hasRecommendations ? '✅' : '⚠️'} Incluye recomendaciones: ${hasRecommendations ? 'SÍ' : 'NO'}`);
        
        if (user.plan === 'premium' && !hasNumbers) {
          log('yellow', '\n⚠️  La respuesta debería incluir números específicos del negocio');
        }
        
      } catch (error) {
        log('red', `\n❌ Error en test "${test.name}":`);
        log('red', `   ${error.message}`);
      }
      
      // Pausa entre tests
      if (i < testQueries.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    // Resumen final
    log('cyan', '\n═══════════════════════════════════════════════════════════════');
    log('bright', '📊 RESUMEN DE PRUEBAS');
    log('cyan', '═══════════════════════════════════════════════════════════════');
    log('green', `✅ Usuario: ${user.username}`);
    log('green', `✅ Plan: ${user.plan || 'FREE'}`);
    log('green', `✅ Modo chatbot: ${health.mode.toUpperCase()}`);
    log('green', `✅ Tests completados: ${testQueries.length}/${testQueries.length}`);
    
    if (user.plan === 'premium' && health.mode === 'ai') {
      log('green', '\n🎉 El chatbot premium está funcionando correctamente con IA real');
    } else if (user.plan === 'premium' && health.mode === 'demo') {
      log('yellow', '\n⚠️  El chatbot está en modo DEMO (sin saldo de OpenAI)');
      log('yellow', '   Las respuestas no usan datos reales del negocio');
    } else {
      log('yellow', '\n💡 Para probar el chatbot premium:');
      log('yellow', '   1. Crea un usuario con plan "premium"');
      log('yellow', '   2. Asegúrate de tener saldo en OpenAI');
    }
    
    log('cyan', '\n═══════════════════════════════════════════════════════════════\n');

  } catch (error) {
    log('red', '\n❌ Error en las pruebas:');
    console.error(error.message);
    process.exit(1);
  }
}

// Ejecutar pruebas
testChatbotPremium();
