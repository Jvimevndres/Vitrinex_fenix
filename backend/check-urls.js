import mongoose from 'mongoose';
import User from './src/models/user.model.js';
import Store from './src/models/store.model.js';
import 'dotenv/config';

const MONGODB_URI = process.env.MONGODB_URI;

async function checkUrls() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB\n');

    // Buscar usuario con avatar
    const userWithAvatar = await User.findOne({ avatarUrl: { $exists: true, $ne: null } });
    if (userWithAvatar) {
      console.log('👤 Usuario con avatar:');
      console.log('   Username:', userWithAvatar.username);
      console.log('   avatarUrl:', userWithAvatar.avatarUrl);
      console.log('');
    }

    // Buscar tienda con logo
    const storeWithLogo = await Store.findOne({ logoUrl: { $exists: true, $ne: null } });
    if (storeWithLogo) {
      console.log('🏪 Tienda con logo:');
      console.log('   Nombre:', storeWithLogo.name);
      console.log('   logoUrl:', storeWithLogo.logoUrl);
      console.log('');
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkUrls();
