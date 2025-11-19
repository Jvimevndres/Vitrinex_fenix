// Diagnóstico completo del login
import mongoose from 'mongoose';
import User from './src/models/user.model.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/vitrinex';

async function diagnose() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB\n');

    // 1. Buscar por email exacto
    console.log('🔍 Buscando: admin@vitrinex.com');
    const admin = await User.findOne({ email: 'admin@vitrinex.com' });
    
    if (!admin) {
      console.log('❌ Usuario NO encontrado con email exacto\n');
      
      // Buscar todos los admins
      console.log('🔍 Buscando todos los usuarios admin...');
      const allAdmins = await User.find({ role: 'admin' });
      console.log(`Encontrados: ${allAdmins.length}`);
      allAdmins.forEach(u => {
        console.log(`  - Email: "${u.email}" (length: ${u.email.length})`);
      });
      
      // Buscar todos los usuarios
      console.log('\n🔍 Todos los usuarios en la DB:');
      const allUsers = await User.find({}).select('email username role');
      console.log(`Total: ${allUsers.length}`);
      allUsers.forEach(u => {
        console.log(`  - ${u.email} | ${u.username} | ${u.role}`);
      });
    } else {
      console.log('✅ Usuario encontrado!');
      console.log(`  ID: ${admin._id}`);
      console.log(`  Email: "${admin.email}"`);
      console.log(`  Username: ${admin.username}`);
      console.log(`  Role: ${admin.role}`);
      
      // Probar el password
      console.log('\n🔐 Probando password "admin123"...');
      const isValid = await admin.comparePassword('admin123');
      console.log(`  Resultado: ${isValid ? '✅ Válida' : '❌ Inválida'}`);
      
      if (isValid) {
        console.log('\n✅ TODO CORRECTO - El login debería funcionar');
      } else {
        console.log('\n⚠️  Password incorrecta, necesita ser reseteada');
      }
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

diagnose();
