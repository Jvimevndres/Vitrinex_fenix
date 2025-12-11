// Script para migrar URLs de localhost a rutas relativas
import mongoose from 'mongoose';
import Store from './src/models/store.model.js';
import User from './src/models/user.model.js';
import dotenv from 'dotenv';

dotenv.config();

async function migratePromotionalUrls() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB\n');
    console.log('🔄 Iniciando migración de URLs...\n');

    const stores = await Store.find({});
    let totalStores = 0;
    let totalUpdated = 0;
    let totalUrls = 0;

    for (const store of stores) {
      let storeUpdated = false;
      let urlsFixed = 0;

      if (!store.promotionalSpaces) continue;

      // Procesar posiciones simples (top, betweenSections, footer)
      for (const position of ['top', 'betweenSections', 'footer']) {
        const space = store.promotionalSpaces[position];
        
        if (space?.imageUrl) {
          const oldUrl = space.imageUrl;
          const newUrl = convertToRelative(oldUrl);
          
          if (oldUrl !== newUrl) {
            space.imageUrl = newUrl;
            storeUpdated = true;
            urlsFixed++;
            console.log(`  📝 ${position}: ${oldUrl} → ${newUrl}`);
          }
        }
      }

      // Procesar arrays de sidebars (sidebarLeft, sidebarRight)
      for (const position of ['sidebarLeft', 'sidebarRight']) {
        const space = store.promotionalSpaces[position];
        
        if (Array.isArray(space)) {
          space.forEach((ad, index) => {
            if (ad?.imageUrl) {
              const oldUrl = ad.imageUrl;
              const newUrl = convertToRelative(oldUrl);
              
              if (oldUrl !== newUrl) {
                ad.imageUrl = newUrl;
                storeUpdated = true;
                urlsFixed++;
                console.log(`  📝 ${position}[${index}]: ${oldUrl} → ${newUrl}`);
              }
            }
          });
        }
      }

      if (storeUpdated) {
        await store.save();
        totalStores++;
        totalUrls += urlsFixed;
        console.log(`\n✅ Tienda actualizada: ${store.name} (${urlsFixed} URLs corregidas)\n`);
      }
    }

    console.log('═'.repeat(80));
    console.log(`\n✅ Migración completada:`);
    console.log(`   🏪 Tiendas actualizadas: ${totalStores}`);
    console.log(`   🖼️  URLs corregidas: ${totalUrls}\n`);
    console.log('═'.repeat(80));

    if (totalUrls === 0) {
      console.log('\nℹ️  No se encontraron URLs para migrar.');
    } else {
      console.log('\n🎉 ¡Las imágenes ahora deberían verse desde todos los dispositivos!');
      console.log('   Recarga la página en el navegador para ver los cambios.\n');
    }

  } catch (error) {
    console.error('\n❌ Error durante la migración:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

/**
 * Convierte URL absoluta a ruta relativa
 * Ejemplo: http://localhost:3000/uploads/sponsors/123.jpg → /uploads/sponsors/123.jpg
 * Ejemplo: http://192.168.1.5:3000/uploads/sponsors/123.jpg → /uploads/sponsors/123.jpg
 */
function convertToRelative(url) {
  if (!url) return url;
  
  // Si ya es una ruta relativa, devolverla sin cambios
  if (url.startsWith('/uploads/')) {
    return url;
  }
  
  // Si es una URL completa, extraer solo la ruta
  if (url.startsWith('http://') || url.startsWith('https://')) {
    try {
      const urlObj = new URL(url);
      return urlObj.pathname; // Ejemplo: /uploads/sponsors/123.jpg
    } catch (e) {
      console.error(`⚠️  No se pudo parsear URL: ${url}`);
      return url;
    }
  }
  
  return url;
}

console.log('\n🚀 MIGRADOR DE URLs DE PUBLICIDAD\n');
console.log('Este script convertirá todas las URLs absolutas (localhost o IP específica)');
console.log('a rutas relativas para que funcionen desde cualquier dispositivo.\n');

migratePromotionalUrls();
