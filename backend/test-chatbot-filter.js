// Script de prueba para verificar el filtrado de tiendas en el chatbot
// Ejecutar con: node test-chatbot-filter.js

import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Credenciales del usuario de prueba (ajustar según tu base de datos)
const testUser = {
  email: 'admin@vitrinex.com',
  password: 'admin123'
};

async function testChatbotFilter() {
  try {
    console.log('🧪 INICIANDO TEST DE FILTRO DE CHATBOT\n');
    
    // 1. Login
    console.log('1️⃣ Iniciando sesión...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, testUser);
    const token = loginResponse.data.token;
    console.log('✅ Sesión iniciada\n');
    
    // 2. Obtener información del usuario
    console.log('2️⃣ Obteniendo información del usuario...');
    const profileResponse = await axios.get(`${API_URL}/auth/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const user = profileResponse.data;
    console.log(`Usuario: ${user.username} (${user.email})`);
    console.log(`Plan: ${user.plan}\n`);
    
    // 3. Obtener tiendas del usuario
    console.log('3️⃣ Obteniendo tiendas...');
    const storesResponse = await axios.get(`${API_URL}/stores/my-stores`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const stores = storesResponse.data;
    console.log(`Tiendas encontradas: ${stores.length}`);
    stores.forEach((store, i) => {
      console.log(`  ${i + 1}. ${store.name} (ID: ${store._id})`);
    });
    console.log('');
    
    if (stores.length < 2) {
      console.log('⚠️ El usuario debe tener al menos 2 tiendas para probar el filtrado');
      console.log('Por favor, crea una segunda tienda o usa otro usuario de prueba\n');
      return;
    }
    
    // 4. Tests del chatbot
    const testCases = [
      {
        name: 'Test 1: Pregunta sobre tienda específica (nombre completo)',
        message: `¿Cuántos productos tiene ${stores[0].name}?`,
        expectedStore: stores[0].name
      },
      {
        name: 'Test 2: Pregunta sobre tienda específica (primera palabra)',
        message: `¿Cómo van las ventas de ${stores[0].name.split(' ')[0]}?`,
        expectedStore: stores[0].name
      },
      {
        name: 'Test 3: Pregunta sobre segunda tienda',
        message: `Dame información de ${stores[1].name}`,
        expectedStore: stores[1].name
      },
      {
        name: 'Test 4: Pregunta específica sin mencionar tienda',
        message: '¿Cuáles son mis productos más vendidos?',
        expectedStore: 'Primera tienda (por defecto)'
      },
      {
        name: 'Test 5: Pregunta general (sin filtro)',
        message: 'Dame un resumen de mi negocio',
        expectedStore: 'Todas las tiendas o solicitud de aclaración'
      }
    ];
    
    for (let i = 0; i < testCases.length; i++) {
      const test = testCases[i];
      console.log(`\n${'='.repeat(70)}`);
      console.log(`📋 ${test.name}`);
      console.log(`${'='.repeat(70)}`);
      console.log(`Pregunta: "${test.message}"`);
      console.log(`Tienda esperada: ${test.expectedStore}\n`);
      
      try {
        const chatResponse = await axios.post(
          `${API_URL}/chatbot/premium`,
          { message: test.message },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        console.log('Respuesta del chatbot:');
        console.log('-'.repeat(70));
        console.log(chatResponse.data.reply);
        console.log('-'.repeat(70));
        
        if (chatResponse.data.usage) {
          console.log(`\n📊 Tokens usados: ${chatResponse.data.usage.tokens}`);
          console.log(`💰 Costo: $${chatResponse.data.usage.cost.toFixed(6)}`);
        }
        
      } catch (error) {
        console.error('❌ Error en el test:', error.response?.data?.message || error.message);
      }
      
      // Esperar un poco entre tests para no saturar la API
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    console.log(`\n\n${'='.repeat(70)}`);
    console.log('✅ TESTS COMPLETADOS');
    console.log(`${'='.repeat(70)}`);
    
  } catch (error) {
    console.error('❌ Error en el test:', error.response?.data || error.message);
  }
}

// Ejecutar tests
testChatbotFilter();
