// Script para diagnosticar URLs de imágenes de publicidad
import mongoose from 'mongoose';
import Store from './src/models/store.model.js';
import User from './src/models/user.model.js';
import dotenv from 'dotenv';

dotenv.config();

async function checkPromotionalImages() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB\n');

    const stores = await Store.find({}).populate('owner', 'username email plan');
    
    console.log(`📊 Total de tiendas: ${stores.length}\n`);
    
    for (const store of stores) {
      const hasPromoSpaces = store.promotionalSpaces && 
        Object.keys(store.promotionalSpaces).length > 0;
      
      if (!hasPromoSpaces) continue;
      
      console.log(`\n${'='.repeat(80)}`);
      console.log(`🏪 Tienda: ${store.name}`);
      console.log(`👤 Propietario: ${store.owner?.username || 'N/A'}`);
      console.log(`💎 Plan: ${store.owner?.plan || 'free'}`);
      console.log(`📍 ID: ${store._id}`);
      console.log(`${'='.repeat(80)}\n`);
      
      // Analizar cada posición
      const positions = ['top', 'sidebarLeft', 'sidebarRight', 'betweenSections', 'footer'];
      
      for (const position of positions) {
        const space = store.promotionalSpaces[position];
        
        if (!space) continue;
        
        // Manejar arrays (sidebars)
        if (Array.isArray(space)) {
          if (space.length === 0) continue;
          
          console.log(`\n  📍 ${position.toUpperCase()} (${space.length} anuncios):`);
          space.forEach((ad, index) => {
            console.log(`\n    Anuncio #${index + 1}:`);
            console.log(`      ✓ Enabled: ${ad.enabled}`);
            console.log(`      🖼️  ImageURL: ${ad.imageUrl || 'N/A'}`);
            console.log(`      🔗 Link: ${ad.link || 'N/A'}`);
            
            // Análisis de la URL
            if (ad.imageUrl) {
              if (ad.imageUrl.includes('localhost')) {
                console.log(`      ⚠️  PROBLEMA: Contiene 'localhost' (no accesible desde red)`);
              } else if (ad.imageUrl.startsWith('http://') || ad.imageUrl.startsWith('https://')) {
                const urlObj = new URL(ad.imageUrl);
                console.log(`      ℹ️  Host: ${urlObj.host}`);
              } else if (ad.imageUrl.startsWith('/uploads/')) {
                console.log(`      ✅ Ruta relativa (ideal para desarrollo)`);
              }
            } else {
              console.log(`      ❌ Sin imagen`);
            }
          });
        } else {
          // Manejar objetos simples (top, betweenSections, footer)
          if (!space.enabled && !space.imageUrl) continue;
          
          console.log(`\n  📍 ${position.toUpperCase()}:`);
          console.log(`    ✓ Enabled: ${space.enabled}`);
          console.log(`    🖼️  ImageURL: ${space.imageUrl || 'N/A'}`);
          console.log(`    🔗 Link: ${space.link || 'N/A'}`);
          
          // Análisis de la URL
          if (space.imageUrl) {
            if (space.imageUrl.includes('localhost')) {
              console.log(`    ⚠️  PROBLEMA: Contiene 'localhost' (no accesible desde red)`);
            } else if (space.imageUrl.startsWith('http://') || space.imageUrl.startsWith('https://')) {
              const urlObj = new URL(space.imageUrl);
              console.log(`    ℹ️  Host: ${urlObj.host}`);
            } else if (space.imageUrl.startsWith('/uploads/')) {
              console.log(`    ✅ Ruta relativa (ideal para desarrollo)`);
            }
          } else {
            console.log(`    ❌ Sin imagen`);
          }
        }
      }
    }
    
    console.log(`\n${'='.repeat(80)}\n`);
    console.log('✅ Análisis completo\n');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

checkPromotionalImages();
