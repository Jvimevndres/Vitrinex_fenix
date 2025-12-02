// migrate-icons.js - Migrar emojis a identificadores de iconos en customBoxes
import mongoose from 'mongoose';
import Store from './src/models/store.model.js';
import dotenv from 'dotenv';

dotenv.config();

const EMOJI_TO_ICON_MAP = {
  '📌': 'pin',
  '💡': 'lightbulb',
  '🎯': 'target',
  '⚡': 'bolt',
  '🌟': 'star',
  '🔥': 'fire',
  '💎': 'gem',
  '🏆': 'trophy',
  '✨': 'magic',
  '🎨': 'palette',
  '🚀': 'rocket',
  '💪': 'dumbbell',
  '✓': 'check',
  '⏰': 'clock',
  '🛡️': 'shield',
  '❤️': 'heart',
  '🎁': 'gift',
  '👍': 'thumbsup',
  '👥': 'users',
  '⚙️': 'cog',
  '🍃': 'leaf',
  '🏅': 'medal',
  '🤝': 'handshake',
  '🥇': 'award',
};

async function migrateIcons() {
  try {
    console.log('🔄 Conectando a MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/vitrinex');
    console.log('✅ Conectado a MongoDB');

    // Obtener todas las tiendas con customBoxes
    const stores = await Store.find({ 
      customBoxes: { $exists: true, $ne: [] } 
    });

    console.log(`\n📊 Encontradas ${stores.length} tiendas con cuadros personalizados`);

    let migratedCount = 0;
    let boxesMigrated = 0;

    for (const store of stores) {
      let storeChanged = false;
      
      for (const box of store.customBoxes) {
        const currentIcon = box.icon;
        
        // Si el icono es un emoji conocido, convertirlo
        if (EMOJI_TO_ICON_MAP[currentIcon]) {
          box.icon = EMOJI_TO_ICON_MAP[currentIcon];
          storeChanged = true;
          boxesMigrated++;
          console.log(`  ✓ Convertido: "${currentIcon}" → "${box.icon}" en "${box.title}"`);
        } 
        // Si el icono no está en el mapa y no es un identificador conocido, usar 'pin' por defecto
        else if (!Object.values(EMOJI_TO_ICON_MAP).includes(currentIcon)) {
          console.log(`  ⚠️  Icono desconocido "${currentIcon}" en "${box.title}" - usando 'pin' por defecto`);
          box.icon = 'pin';
          storeChanged = true;
          boxesMigrated++;
        }
      }

      if (storeChanged) {
        await store.save();
        migratedCount++;
        console.log(`✅ Tienda "${store.name}" actualizada`);
      }
    }

    console.log('\n📈 Resumen de migración:');
    console.log(`  • Tiendas procesadas: ${stores.length}`);
    console.log(`  • Tiendas migradas: ${migratedCount}`);
    console.log(`  • Cuadros actualizados: ${boxesMigrated}`);
    console.log('\n✨ Migración completada exitosamente');

  } catch (error) {
    console.error('❌ Error en migración:', error);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Desconectado de MongoDB');
    process.exit(0);
  }
}

// Ejecutar migración
migrateIcons();
