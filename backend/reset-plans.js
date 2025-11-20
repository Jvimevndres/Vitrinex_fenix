// Script para resetear todas las tiendas a plan free
import 'dotenv/config';
import mongoose from 'mongoose';
import Store from './src/models/store.model.js';

const MONGODB_URI = process.env.MONGODB_URI;

async function resetPlans() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB');

    const result = await Store.updateMany({}, { 
      plan: 'free',
      planExpiresAt: null 
    });

    console.log(`✅ ${result.modifiedCount} tiendas actualizadas a plan FREE`);
    
    const stores = await Store.find({}).select('_id name plan');
    console.log('\n📋 Estado actual:');
    stores.forEach(s => {
      console.log(`   ${s.name} - Plan: ${s.plan}`);
    });

    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

resetPlans();
