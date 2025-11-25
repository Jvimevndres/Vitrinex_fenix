import mongoose from 'mongoose';
import User from './src/models/user.model.js';
import 'dotenv/config';

const MONGODB_URI = process.env.MONGODB_URI;

async function checkAvatarTypes() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB\n');

    const users = await User.find({}).limit(10);
    
    console.log('📋 Análisis de avatares:\n');
    users.forEach(user => {
      if (user.avatarUrl) {
        const isBase64 = user.avatarUrl.startsWith('data:image');
        const isLocalhost = user.avatarUrl.includes('localhost');
        const isExternal = user.avatarUrl.startsWith('http') && !isLocalhost;
        
        console.log(`👤 ${user.username}`);
        console.log(`   avatarUrl: ${user.avatarUrl.substring(0, 80)}...`);
        console.log(`   Tipo: ${isBase64 ? 'Base64 ✅' : isLocalhost ? 'Localhost ❌' : isExternal ? 'URL Externa ✅' : 'Otro'}`);
        console.log('');
      } else {
        console.log(`👤 ${user.username} - Sin avatar`);
      }
    });

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkAvatarTypes();
