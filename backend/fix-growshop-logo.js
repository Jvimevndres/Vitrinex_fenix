import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storeSchema = new mongoose.Schema({
  name: String,
  logoUrl: String,
}, { collection: 'stores' });

const Store = mongoose.model('Store', storeSchema);

async function fixGrowShopLogo() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB\n');

    const store = await Store.findOne({ name: 'GrowShopWeed' });
    
    if (!store) {
      console.log('❌ No se encontró la tienda GrowShopWeed');
      return;
    }

    console.log(`🏪 Tienda encontrada: ${store.name}`);
    console.log(`   Logo actual: ${store.logoUrl}\n`);

    if (store.logoUrl.startsWith('data:')) {
      console.log('✅ El logo ya es Base64, no hay nada que hacer');
      return;
    }

    // Extraer nombre del archivo
    const filename = store.logoUrl.split('/').pop();
    const filePath = path.join(__dirname, 'uploads', 'stores', filename);

    console.log(`📁 Buscando archivo: ${filePath}`);

    if (!fs.existsSync(filePath)) {
      console.log('⚠️ Archivo no encontrado');
      console.log('❌ No se puede convertir. Necesitas subir el logo nuevamente desde el panel.');
      return;
    }

    // Convertir a Base64
    const imageBuffer = fs.readFileSync(filePath);
    const base64 = imageBuffer.toString('base64');
    const ext = path.extname(filename).slice(1);
    const mimeType = ext === 'png' ? 'image/png' : 'image/jpeg';
    const dataUrl = `data:${mimeType};base64,${base64}`;

    console.log(`✅ Imagen convertida a Base64 (${(base64.length / 1024).toFixed(2)} KB)`);

    // Actualizar en BD
    store.logoUrl = dataUrl;
    await store.save();

    console.log('💾 Logo actualizado en la base de datos\n');
    console.log('✅ COMPLETADO - El logo ahora debería verse en todos los PCs');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Desconectado de MongoDB');
  }
}

fixGrowShopLogo();
