// Script para migrar posiciones de anuncios de kebab-case a camelCase
import 'dotenv/config';
import mongoose from 'mongoose';
import SponsorAd from './src/models/sponsorAd.model.js';

const MONGODB_URI = process.env.MONGODB_URI;

const positionMap = {
  'sidebar-left': 'sidebarLeft',
  'sidebar-right': 'sidebarRight',
  'between-sections': 'betweenSections',
  'top': 'top',
  'footer': 'footer'
};

async function migratePositions() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB');

    // Obtener todos los anuncios
    const ads = await SponsorAd.find({});
    console.log(`\n📋 Encontrados ${ads.length} anuncios`);

    let updated = 0;
    for (const ad of ads) {
      const oldPosition = ad.position;
      const newPosition = positionMap[oldPosition] || oldPosition;
      
      if (oldPosition !== newPosition) {
        ad.position = newPosition;
        await ad.save();
        console.log(`✅ Actualizado: "${ad.name}" - ${oldPosition} → ${newPosition}`);
        updated++;
      } else {
        console.log(`⏭️  Sin cambios: "${ad.name}" - ${oldPosition}`);
      }
    }

    console.log(`\n✅ Migración completada: ${updated} anuncios actualizados`);
    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

migratePositions();
