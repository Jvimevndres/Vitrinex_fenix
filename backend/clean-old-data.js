// Script para limpiar datos antiguos de la base de datos
// Mantiene: Stores, Users (admin), Services
// Elimina: Bookings, Orders, Messages, Products, Comments

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/vitrinex';

async function cleanOldData() {
  try {
    console.log('🔌 Conectando a MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a la base de datos\n');

    const db = mongoose.connection.db;

    // Contar documentos antes
    console.log('📊 ESTADO ACTUAL:');
    const collections = await db.listCollections().toArray();
    for (const col of collections) {
      const count = await db.collection(col.name).countDocuments();
      console.log(`  - ${col.name}: ${count} documentos`);
    }

    console.log('\n⚠️  ¿Deseas eliminar los siguientes datos?');
    console.log('  ❌ Bookings (reservas)');
    console.log('  ❌ Orders (pedidos)');
    console.log('  ❌ Messages (mensajes)');
    console.log('  ❌ Products (productos)');
    console.log('  ❌ Comments (comentarios)');
    console.log('  ✅ MANTENER: Stores, Users, Services, StoreAppearances\n');

    // Esperar 3 segundos para que el usuario cancele si quiere
    console.log('⏳ Iniciando limpieza en 3 segundos... (Ctrl+C para cancelar)');
    await new Promise(resolve => setTimeout(resolve, 3000));

    console.log('\n🧹 Limpiando datos...\n');

    // Eliminar colecciones
    const collectionsToDelete = [
      'bookings',
      'orders', 
      'messages',
      'products',
      'comments'
    ];

    for (const collectionName of collectionsToDelete) {
      try {
        const result = await db.collection(collectionName).deleteMany({});
        console.log(`✅ ${collectionName}: ${result.deletedCount} documentos eliminados`);
      } catch (err) {
        if (err.message.includes('ns not found')) {
          console.log(`ℹ️  ${collectionName}: colección no existe`);
        } else {
          console.error(`❌ Error en ${collectionName}:`, err.message);
        }
      }
    }

    console.log('\n📊 ESTADO FINAL:');
    const finalCollections = await db.listCollections().toArray();
    for (const col of finalCollections) {
      const count = await db.collection(col.name).countDocuments();
      console.log(`  - ${col.name}: ${count} documentos`);
    }

    console.log('\n✨ Base de datos limpia exitosamente!');
    console.log('📌 Se mantuvieron: Stores, Users, Services, StoreAppearances');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Desconectado de MongoDB');
    process.exit(0);
  }
}

cleanOldData();
