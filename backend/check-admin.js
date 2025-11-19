// Verificar admin y resetear contraseña si es necesario
import mongoose from 'mongoose';
import User from './src/models/user.model.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/vitrinex';

async function checkAdmin() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB');

    const admin = await User.findOne({ email: 'admin@vitrinex.com' });
    
    if (!admin) {
      console.log('❌ No existe usuario admin');
      await mongoose.disconnect();
      process.exit(1);
    }

    console.log('\n📋 INFORMACIÓN DEL ADMIN:');
    console.log('ID:', admin._id);
    console.log('Username:', admin.username);
    console.log('Email:', admin.email);
    console.log('Role:', admin.role);
    console.log('Creado:', admin.createdAt);

    // Verificar password
    console.log('\n🔐 Verificando password...');
    const isValid = await admin.comparePassword('admin123');
    console.log('Password válida:', isValid);

    if (!isValid) {
      console.log('\n⚠️  Password incorrecta, reseteando...');
      admin.password = 'admin123';
      await admin.save();
      console.log('✅ Password reseteada a: admin123');
    }

    await mongoose.disconnect();
    console.log('\n✅ Verificación completa');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

checkAdmin();
