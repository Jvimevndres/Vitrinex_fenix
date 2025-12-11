// Script para verificar URLs de publicidades premium
import mongoose from 'mongoose';
import Store from './src/models/store.model.js';
import User from './src/models/user.model.js';
import dotenv from 'dotenv';

dotenv.config();

async function checkPromotionalUrls() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB\n');

    const stores = await Store.find({}).populate('owner', 'username email plan');
    
    console.log('═'.repeat(80));
    console.log('📊 DIAGNÓSTICO DE PUBLICIDADES PREMIUM\n');

    let totalStores = 0;
    let storesWithAds = 0;
    let totalAds = 0;
    let absoluteUrls = 0;
    let relativeUrls = 0;

    for (const store of stores) {
      if (!store.promotionalSpaces) continue;

      const ownerPlan = store.owner?.plan?.toLowerCase();
      const isPremium = ownerPlan === 'pro' || ownerPlan === 'premium';
      
      totalStores++;
      
      const storeAds = [];
      
      // Verificar posiciones simples
      for (const position of ['top', 'betweenSections', 'footer']) {
        const space = store.promotionalSpaces[position];
        if (space?.imageUrl) {
          storeAds.push({
            position,
            url: space.imageUrl,
            link: space.link || 'Sin enlace',
            type: space.imageUrl.startsWith('http') ? '❌ ABSOLUTA' : '✅ RELATIVA'
          });
        }
      }
      
      // Verificar arrays de sidebars
      for (const position of ['sidebarLeft', 'sidebarRight']) {
        const space = store.promotionalSpaces[position];
        if (Array.isArray(space)) {
          space.forEach((ad, index) => {
            if (ad?.imageUrl) {
              storeAds.push({
                position: `${position}[${index}]`,
                url: ad.imageUrl,
                link: ad.link || 'Sin enlace',
                type: ad.imageUrl.startsWith('http') ? '❌ ABSOLUTA' : '✅ RELATIVA'
              });
            }
          });
        }
      }

      if (storeAds.length > 0) {
        storesWithAds++;
        totalAds += storeAds.length;
        
        console.log(`🏪 ${store.name}`);
        console.log(`   👤 Propietario: ${store.owner?.username || 'N/A'} (${store.owner?.email || 'N/A'})`);
        console.log(`   💎 Plan: ${isPremium ? '⭐ PREMIUM' : '🆓 FREE'}\n`);
        
        storeAds.forEach(ad => {
          console.log(`   📍 ${ad.position}: ${ad.type}`);
          console.log(`      🖼️  ${ad.url}`);
          console.log(`      🔗 ${ad.link}\n`);
          
          if (ad.type.includes('ABSOLUTA')) {
            absoluteUrls++;
          } else {
            relativeUrls++;
          }
        });
        
        console.log('─'.repeat(80) + '\n');
      }
    }

    console.log('═'.repeat(80));
    console.log('\n📈 RESUMEN:');
    console.log(`   🏪 Tiendas totales: ${totalStores}`);
    console.log(`   🏪 Tiendas con publicidades: ${storesWithAds}`);
    console.log(`   🖼️  Total de anuncios: ${totalAds}`);
    console.log(`   ✅ URLs relativas (correctas): ${relativeUrls}`);
    console.log(`   ❌ URLs absolutas (a corregir): ${absoluteUrls}\n`);

    if (absoluteUrls > 0) {
      console.log('⚠️  ACCIÓN REQUERIDA:');
      console.log('   Ejecuta: node migrate-promotional-urls.js\n');
    } else if (totalAds > 0) {
      console.log('✅ ¡Todas las URLs son relativas! Las imágenes deberían verse desde todos los dispositivos.\n');
    } else {
      console.log('ℹ️  No hay publicidades premium configuradas.\n');
    }
    
    console.log('═'.repeat(80));

  } catch (error) {
    console.error('\n❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

checkPromotionalUrls();
