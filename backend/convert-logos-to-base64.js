import mongoose from 'mongoose';
import Store from './src/models/store.model.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MONGODB_URI = process.env.MONGODB_URI;

async function convertLogosToBase64() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB\n');

    const stores = await Store.find({ 
      logoUrl: { $exists: true, $ne: null, $regex: /^http.*localhost/ } 
    });

    console.log(`📊 Tiendas con logos localhost encontradas: ${stores.length}\n`);

    let converted = 0;
    let failed = 0;

    for (const store of stores) {
      try {
        // Extraer el nombre del archivo de la URL
        const filename = store.logoUrl.split('/').pop();
        const filePath = path.join(__dirname, 'uploads', 'stores', filename);

        // Verificar si el archivo existe
        if (!fs.existsSync(filePath)) {
          console.log(`⚠️  ${store.name}: Archivo no encontrado - ${filename}`);
          failed++;
          continue;
        }

        // Leer el archivo y convertir a base64
        const fileBuffer = fs.readFileSync(filePath);
        const ext = path.extname(filename).toLowerCase();
        let mimeType = 'image/jpeg';
        
        if (ext === '.png') mimeType = 'image/png';
        else if (ext === '.webp') mimeType = 'image/webp';
        else if (ext === '.gif') mimeType = 'image/gif';
        else if (ext === '.jfif') mimeType = 'image/jpeg';

        const base64 = fileBuffer.toString('base64');
        const dataUrl = `data:${mimeType};base64,${base64}`;

        // Actualizar la tienda
        store.logoUrl = dataUrl;
        await store.save();

        console.log(`✅ ${store.name}: Logo convertido a Base64`);
        converted++;

      } catch (error) {
        console.error(`❌ Error con ${store.name}:`, error.message);
        failed++;
      }
    }

    console.log(`\n📊 Resumen:`);
    console.log(`   ✅ Convertidos: ${converted}`);
    console.log(`   ❌ Fallidos: ${failed}`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

convertLogosToBase64();
