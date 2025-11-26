import axios from 'axios';

const BASE_URL = 'http://localhost:5000';

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

const log = (message, color = colors.reset) => {
  console.log(`${color}${message}${colors.reset}`);
};

async function testCommentSystem() {
  log('\n=== PRUEBA DEL SISTEMA DE COMENTARIOS ===\n', colors.blue);

  try {
    // 1. Obtener tiendas
    log('1. Obteniendo tiendas...', colors.yellow);
    const storesResponse = await axios.get(`${BASE_URL}/stores`);
    const stores = storesResponse.data;
    
    if (stores.length === 0) {
      log('❌ No hay tiendas en el sistema', colors.red);
      return;
    }
    
    const testStore = stores[0];
    log(`✓ Tienda de prueba: ${testStore.name} (ID: ${testStore._id})`, colors.green);

    // 2. Obtener productos de la tienda
    log('\n2. Obteniendo productos...', colors.yellow);
    const productsResponse = await axios.get(`${BASE_URL}/stores/${testStore._id}`);
    const products = productsResponse.data.products || [];
    
    if (products.length === 0) {
      log('❌ La tienda no tiene productos', colors.red);
      return;
    }
    
    const testProduct = products[0];
    log(`✓ Producto de prueba: ${testProduct.name} (ID: ${testProduct._id})`, colors.green);

    // 3. Probar endpoint público de comentarios de tienda
    log('\n3. Probando endpoint público GET /comments/store/:storeId', colors.yellow);
    const storeCommentsResponse = await axios.get(`${BASE_URL}/comments/store/${testStore._id}`);
    log(`✓ Respuesta recibida: ${storeCommentsResponse.data.length} comentarios encontrados`, colors.green);
    
    // Filtrar comentarios del producto
    const productComments = storeCommentsResponse.data.filter(comment =>
      comment.subject?.toLowerCase().includes('producto') &&
      (comment.message?.includes(testProduct._id) || comment.subject?.includes(testProduct._id))
    );
    log(`  - ${productComments.length} comentarios son del producto ${testProduct.name}`, colors.green);

    // 4. Obtener usuarios
    log('\n4. Obteniendo usuarios...', colors.yellow);
    const usersResponse = await axios.get(`${BASE_URL}/users`);
    const users = usersResponse.data;
    
    if (users.length === 0) {
      log('❌ No hay usuarios en el sistema', colors.red);
      return;
    }
    
    const testUser = users[0];
    log(`✓ Usuario de prueba: ${testUser.username} (ID: ${testUser._id})`, colors.green);

    // 5. Probar endpoint público de comentarios de usuario
    log('\n5. Probando endpoint público GET /comments/user/:userId', colors.yellow);
    const userCommentsResponse = await axios.get(`${BASE_URL}/comments/user/${testUser._id}`);
    log(`✓ Respuesta recibida: ${userCommentsResponse.data.length} comentarios encontrados`, colors.green);

    // 6. Mostrar estadísticas
    log('\n=== ESTADÍSTICAS ===', colors.blue);
    log(`Total de tiendas: ${stores.length}`, colors.reset);
    log(`Total de productos en tienda de prueba: ${products.length}`, colors.reset);
    log(`Total de usuarios: ${users.length}`, colors.reset);
    log(`Comentarios de la tienda: ${storeCommentsResponse.data.length}`, colors.reset);
    log(`Comentarios del producto: ${productComments.length}`, colors.reset);
    log(`Comentarios del usuario: ${userCommentsResponse.data.length}`, colors.reset);

    // 7. Mostrar algunos comentarios de ejemplo
    if (storeCommentsResponse.data.length > 0) {
      log('\n=== EJEMPLO DE COMENTARIOS DE TIENDA ===', colors.blue);
      storeCommentsResponse.data.slice(0, 3).forEach((comment, i) => {
        log(`\nComentario ${i + 1}:`, colors.yellow);
        log(`  Usuario: ${comment.user?.username || 'Anónimo'}`, colors.reset);
        log(`  Asunto: ${comment.subject}`, colors.reset);
        log(`  Rating: ${'⭐'.repeat(comment.rating || 0)}`, colors.reset);
        log(`  Mensaje: ${comment.message?.substring(0, 100)}...`, colors.reset);
      });
    }

    log('\n✅ TODAS LAS PRUEBAS COMPLETADAS EXITOSAMENTE\n', colors.green);

  } catch (error) {
    log(`\n❌ ERROR: ${error.message}`, colors.red);
    if (error.response) {
      log(`Status: ${error.response.status}`, colors.red);
      log(`Data: ${JSON.stringify(error.response.data, null, 2)}`, colors.red);
    }
  }
}

// Ejecutar pruebas
testCommentSystem();
