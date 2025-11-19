// Test del endpoint de login exacto
import mongoose from 'mongoose';
import User from './src/models/user.model.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/vitrinex';

async function testLogin() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB\n');

    // Simular exactamente lo que hace el endpoint
    const email = 'admin@vitrinex.com';
    const password = 'admin123';

    console.log('🔍 Paso 1: Buscar usuario con email:', email);
    const userFound = await User.findOne({ email });
    
    if (!userFound) {
      console.log('❌ Usuario NO encontrado');
      console.log('\n🔍 Verificando todos los usuarios:');
      const all = await User.find({}).select('email');
      all.forEach(u => console.log(`  - "${u.email}"`));
      await mongoose.disconnect();
      process.exit(1);
    }

    console.log('✅ Usuario encontrado:', userFound.email);
    console.log('   ID:', userFound._id);
    console.log('   Role:', userFound.role);
    
    console.log('\n🔐 Paso 2: Comparar password');
    console.log('   Password hasheado en DB:', userFound.password.substring(0, 20) + '...');
    
    const isMatch = await userFound.comparePassword(password);
    console.log('   Resultado:', isMatch ? '✅ Match' : '❌ No match');

    if (isMatch) {
      console.log('\n✅ LOGIN EXITOSO - El endpoint debería funcionar');
      console.log('\nRespuesta que debería devolver:');
      console.log(JSON.stringify({
        id: userFound._id,
        username: userFound.username,
        email: userFound.email,
        role: userFound.role || 'user',
      }, null, 2));
    } else {
      console.log('\n❌ PASSWORD INCORRECTA');
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

testLogin();
