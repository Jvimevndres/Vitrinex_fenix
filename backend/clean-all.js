// Limpiar toda la base de datos y empezar desde cero
import mongoose from 'mongoose';
import User from './src/models/user.model.js';
import Store from './src/models/store.model.js';
import Service from './src/models/service.model.js';
import Product from './src/models/product.model.js';
import Booking from './src/models/booking.model.js';
import Comment from './src/models/comment.model.js';
import SponsorAd from './src/models/sponsorAd.model.js';
import Message from './src/models/message.model.js';
import Order from './src/models/order.model.js';
import StoreAppearance from './src/models/storeAppearance.model.js';
import 'dotenv/config';

const MONGODB_URI = process.env.MONGODB_URI;

async function cleanAll() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB\n');

    console.log('🗑️  LIMPIANDO TODA LA BASE DE DATOS...\n');

    // Borrar TODO
    const results = await Promise.all([
      User.deleteMany({}),
      Store.deleteMany({}),
      Service.deleteMany({}),
      Product.deleteMany({}),
      Booking.deleteMany({}),
      Comment.deleteMany({}),
      SponsorAd.deleteMany({}),
      Message.deleteMany({}),
      Order.deleteMany({}),
      StoreAppearance.deleteMany({}),
    ]);

    console.log('✅ Usuarios eliminados:', results[0].deletedCount);
    console.log('✅ Tiendas eliminadas:', results[1].deletedCount);
    console.log('✅ Servicios eliminados:', results[2].deletedCount);
    console.log('✅ Productos eliminados:', results[3].deletedCount);
    console.log('✅ Reservas eliminadas:', results[4].deletedCount);
    console.log('✅ Comentarios eliminados:', results[5].deletedCount);
    console.log('✅ Anuncios eliminados:', results[6].deletedCount);
    console.log('✅ Mensajes eliminados:', results[7].deletedCount);
    console.log('✅ Órdenes eliminadas:', results[8].deletedCount);
    console.log('✅ Apariencias eliminadas:', results[9].deletedCount);

    console.log('\n🎯 Creando usuario administrador...');
    
    const admin = new User({
      username: 'Admin Vitrinex',
      email: 'admin@vitrinex.com',
      password: 'admin123',
      role: 'admin',
    });
    await admin.save();

    console.log('✅ Administrador creado');
    console.log('   📧 Email: admin@vitrinex.com');
    console.log('   🔑 Password: admin123');

    await mongoose.disconnect();
    console.log('\n✅ BASE DE DATOS LIMPIADA Y LISTA');
    console.log('   Ahora puedes crear tiendas desde cero desde la interfaz web');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

cleanAll();
