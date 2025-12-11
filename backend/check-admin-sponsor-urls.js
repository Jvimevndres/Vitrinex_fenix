// Script para verificar URLs de anuncios del ADMIN (SponsorAd)
import mongoose from 'mongoose';
import SponsorAd from './src/models/sponsorAd.model.js';
import dotenv from 'dotenv';

dotenv.config();

async function checkAdminSponsorUrls() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB\n');

    const sponsorAds = await SponsorAd.find({});
    
    console.log('═'.repeat(80));
    console.log('📊 DIAGNÓSTICO DE ANUNCIOS DEL ADMIN (SponsorAd)\n');

    let absoluteUrls = 0;
    let relativeUrls = 0;
    let base64 = 0;

    if (sponsorAds.length === 0) {
      console.log('ℹ️  No hay anuncios del admin configurados.\n');
    } else {
      sponsorAds.forEach((ad, index) => {
        const urlType = ad.imageUrl.startsWith('data:image') 
          ? '📦 BASE64' 
          : ad.imageUrl.startsWith('http') 
            ? '❌ ABSOLUTA' 
            : '✅ RELATIVA';
        
        console.log(`${index + 1}. ${ad.name}`);
        console.log(`   📍 Posición: ${ad.position}`);
        console.log(`   🎯 Estado: ${ad.active ? '✅ ACTIVO' : '⚠️ INACTIVO'}`);
        console.log(`   🖼️  URL: ${urlType}`);
        console.log(`   📎 ${ad.imageUrl.substring(0, 100)}${ad.imageUrl.length > 100 ? '...' : ''}`);
        console.log(`   🔗 Link: ${ad.link || 'Sin enlace'}\n`);
        
        if (ad.imageUrl.startsWith('data:image')) {
          base64++;
        } else if (ad.imageUrl.startsWith('http')) {
          absoluteUrls++;
        } else {
          relativeUrls++;
        }
      });
    }

    console.log('═'.repeat(80));
    console.log('\n📈 RESUMEN:');
    console.log(`   📢 Total de anuncios: ${sponsorAds.length}`);
    console.log(`   ✅ URLs relativas (correctas): ${relativeUrls}`);
    console.log(`   📦 Base64 (correctas): ${base64}`);
    console.log(`   ❌ URLs absolutas (a corregir): ${absoluteUrls}\n`);

    if (absoluteUrls > 0) {
      console.log('⚠️  Hay URLs absolutas que deberían migrarse.\n');
    } else if (sponsorAds.length > 0) {
      console.log('✅ Todas las URLs son correctas (relativas o base64).\n');
    }
    
    console.log('═'.repeat(80));

  } catch (error) {
    console.error('\n❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

checkAdminSponsorUrls();
