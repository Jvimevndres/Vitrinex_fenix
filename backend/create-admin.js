// Script para crear un usuario administrador
// Ejecutar con: node create-admin.js

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './src/models/user.model.js';
import 'dotenv/config';

const MONGODB_URI = process.env.MONGODB_URI;

async function createAdmin() {
  try {
    console.log('🔌 Conectando a MongoDB Atlas...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a Atlas');

    // Verificar si ya existe un admin
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('⚠️  Ya existe un usuario administrador:', existingAdmin.email);
      console.log('Usuario:', existingAdmin.username);
      await mongoose.disconnect();
      return;
    }

    // Crear usuario admin
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const admin = new User({
      username: 'Admin Vitrinex',
      email: 'admin@vitrinex.com',
      password: hashedPassword,
      role: 'admin',
    });

    await admin.save();

    console.log('✅ Usuario administrador creado exitosamente!');
    console.log('📧 Email:', admin.email);
    console.log('🔑 Password: admin123');
    console.log('⚠️  IMPORTANTE: Cambia la contraseña después del primer login');

    await mongoose.disconnect();
    console.log('✅ Desconectado de MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creando admin:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

createAdmin();
