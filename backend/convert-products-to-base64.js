import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const productSchema = new mongoose.Schema({
  name: String,
  images: [String],
}, { collection: 'products' });

const Product = mongoose.model('Product', productSchema);

async function convertProductImages() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB');

    const products = await Product.find({
      images: { $exists: true, $ne: [] }
    });

    console.log(`\n📦 Encontrados ${products.length} productos con imágenes`);

    let converted = 0;
    let failed = 0;
    let alreadyBase64 = 0;

    for (const product of products) {
      console.log(`\n🔍 Producto: ${product.name} (${product._id})`);
      
      const newImages = [];
      let hasChanges = false;

      for (const imgUrl of product.images) {
        // Si ya es Base64, mantenerla
        if (imgUrl.startsWith('data:')) {
          console.log('  ✓ Ya es Base64');
          newImages.push(imgUrl);
          alreadyBase64++;
          continue;
        }

        // Si es URL localhost, convertir
        if (imgUrl.includes('localhost') || imgUrl.startsWith('/uploads')) {
          const filename = imgUrl.split('/').pop();
          const filePath = path.join(__dirname, 'uploads', 'products', filename);

          console.log(`  📁 Buscando: ${filePath}`);

          if (fs.existsSync(filePath)) {
            try {
              const imageBuffer = fs.readFileSync(filePath);
              const base64 = imageBuffer.toString('base64');
              const ext = path.extname(filename).slice(1);
              const mimeType = ext === 'png' ? 'image/png' : 'image/jpeg';
              const dataUrl = `data:${mimeType};base64,${base64}`;

              newImages.push(dataUrl);
              console.log(`  ✅ Convertida a Base64 (${(base64.length / 1024).toFixed(2)} KB)`);
              hasChanges = true;
              converted++;
            } catch (error) {
              console.error(`  ❌ Error leyendo archivo: ${error.message}`);
              newImages.push(imgUrl); // Mantener la original
              failed++;
            }
          } else {
            console.log(`  ⚠️ Archivo no encontrado, manteniendo URL original`);
            newImages.push(imgUrl);
            failed++;
          }
        } else {
          // URL externa o desconocida
          console.log(`  ℹ️ URL externa: ${imgUrl.substring(0, 50)}...`);
          newImages.push(imgUrl);
        }
      }

      if (hasChanges) {
        product.images = newImages;
        await product.save();
        console.log('  💾 Producto actualizado en BD');
      }
    }

    console.log('\n📊 RESUMEN:');
    console.log(`  ✅ Convertidas: ${converted}`);
    console.log(`  ✓ Ya eran Base64: ${alreadyBase64}`);
    console.log(`  ❌ Fallidas: ${failed}`);
    console.log(`  📦 Total productos procesados: ${products.length}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Desconectado de MongoDB');
  }
}

convertProductImages();
