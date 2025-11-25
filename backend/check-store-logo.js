import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const storeSchema = new mongoose.Schema({
  name: String,
  logoUrl: String,
  logo: String,
}, { collection: 'stores' });

const Store = mongoose.model('Store', storeSchema);

async function checkStoreLogo() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB\n');

    const stores = await Store.find({});
    
    console.log(`📊 Total tiendas: ${stores.length}\n`);

    for (const store of stores) {
      console.log(`🏪 Tienda: ${store.name}`);
      console.log(`   ID: ${store._id}`);
      
      if (store.logoUrl) {
        const isBase64 = store.logoUrl.startsWith('data:');
        const isLocalhost = store.logoUrl.includes('localhost');
        const preview = store.logoUrl.substring(0, 100);
        
        console.log(`   logoUrl existe: ✅`);
        console.log(`   Es Base64: ${isBase64 ? '✅' : '❌'}`);
        console.log(`   Es localhost: ${isLocalhost ? '⚠️' : '❌'}`);
        console.log(`   Preview: ${preview}...`);
        console.log(`   Longitud: ${store.logoUrl.length} caracteres`);
      } else {
        console.log(`   logoUrl: ❌ NO EXISTE`);
      }

      if (store.logo) {
        console.log(`   logo (campo alternativo): ${store.logo}`);
      }
      
      console.log('');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Desconectado de MongoDB');
  }
}

checkStoreLogo();
