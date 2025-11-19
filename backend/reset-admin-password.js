// Resetear password del admin
import mongoose from 'mongoose';
import User from './src/models/user.model.js';
import 'dotenv/config';

const MONGODB_URI = process.env.MONGODB_URI;

async function resetPassword() {
  try {
    console.log('🔌 Conectando a MongoDB Atlas...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a Atlas');

    const admin = await User.findOne({ email: 'admin@vitrinex.com' });
    
    if (!admin) {
      console.log('❌ Usuario admin no encontrado');
      await mongoose.disconnect();
      process.exit(1);
    }

    console.log('✅ Admin encontrado:', admin.email);
    console.log('📝 Hash actual:', admin.password.substring(0, 20) + '...');
    
    // Cambiar la contraseña usando el modelo (esto activará el pre-save hook)
    admin.password = 'admin123';
    await admin.save();
    
    console.log('✅ Password reseteada correctamente');
    console.log('📝 Nuevo hash:', admin.password.substring(0, 20) + '...');
    
    // Verificar que funciona
    const isValid = await admin.comparePassword('admin123');
    console.log('🔐 Verificación:', isValid ? '✅ Password válida' : '❌ Password inválida');

    await mongoose.disconnect();
    console.log('\n✅ Password del admin reseteada a: admin123');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

resetPassword();
