// Script temporal para actualizar el plan de una tienda
import 'dotenv/config';
import mongoose from 'mongoose';
import Store from './src/models/store.model.js';

const MONGODB_URI = process.env.MONGODB_URI;

async function updateStorePlan() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB');

    // Obtener el ID de la tienda desde argumentos o usar el primero
    const storeId = process.argv[2];
    
    if (storeId) {
      // Actualizar tienda específica
      const store = await Store.findByIdAndUpdate(
        storeId,
        { 
          plan: 'pro',
          planExpiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 año
        },
        { new: true }
      );
      
      if (store) {
        console.log(`✅ Tienda "${store.name}" actualizada a plan PRO`);
        console.log(`   ID: ${store._id}`);
        console.log(`   Plan: ${store.plan}`);
        console.log(`   Expira: ${store.planExpiresAt}`);
      } else {
        console.log('❌ Tienda no encontrada');
      }
    } else {
      // Listar todas las tiendas
      const stores = await Store.find({}).select('_id name plan owner').limit(10);
      console.log('\n📋 Tiendas disponibles:');
      stores.forEach(s => {
        console.log(`   ${s._id} - ${s.name} (Plan: ${s.plan || 'free'})`);
      });
      console.log('\n💡 Uso: node update-store-plan.js <STORE_ID>');
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

updateStorePlan();
