// check-boxes.js - Ver qué customBoxes existen
import mongoose from 'mongoose';
import Store from './src/models/store.model.js';
import dotenv from 'dotenv';

dotenv.config();

async function checkBoxes() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/vitrinex');
    console.log('✅ Conectado\n');

    const stores = await Store.find({});
    console.log(`Total tiendas: ${stores.length}\n`);

    stores.forEach(store => {
      console.log(`\n🏪 Tienda: ${store.name}`);
      console.log(`   ID: ${store._id}`);
      console.log(`   customBoxes: ${store.customBoxes?.length || 0}`);
      
      if (store.customBoxes?.length > 0) {
        store.customBoxes.forEach((box, i) => {
          console.log(`\n   📦 Box ${i + 1}:`);
          console.log(`      Título: ${box.title}`);
          console.log(`      Icon: "${box.icon}" (length: ${box.icon?.length || 0})`);
          console.log(`      Content: ${box.content?.substring(0, 50)}...`);
        });
      }
    });

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkBoxes();
