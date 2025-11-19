// Verificar estado de la base de datos
import mongoose from 'mongoose';
import User from './src/models/user.model.js';
import Store from './src/models/store.model.js';
import 'dotenv/config';

const MONGODB_URI = process.env.MONGODB_URI;

async function checkDatabase() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB\n');

    const users = await User.countDocuments();
    const admins = await User.countDocuments({ role: 'admin' });
    const stores = await Store.countDocuments();
    const activeStores = await Store.countDocuments({ isActive: true });

    console.log('📊 ESTADO DE LA BASE DE DATOS:');
    console.log(`   Usuarios totales: ${users}`);
    console.log(`   Administradores: ${admins}`);
    console.log(`   Tiendas totales: ${stores}`);
    console.log(`   Tiendas activas: ${activeStores}`);

    console.log('\n👥 USUARIOS:');
    const allUsers = await User.find({}).select('username email role');
    allUsers.forEach(u => {
      console.log(`   - ${u.username} (${u.email}) - ${u.role}`);
    });

    console.log('\n🏪 TIENDAS:');
    const allStores = await Store.find({}).select('name slug owner isActive').populate('owner', 'username');
    allStores.forEach(s => {
      console.log(`   - ${s.name} (${s.slug}) - Dueño: ${s.owner?.username} - ${s.isActive ? 'Activa' : 'Inactiva'}`);
    });

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

checkDatabase();
