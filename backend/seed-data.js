// Script para crear datos de prueba
import mongoose from 'mongoose';
import User from './src/models/user.model.js';
import Store from './src/models/store.model.js';
import SponsorAd from './src/models/sponsorAd.model.js';
import Comment from './src/models/comment.model.js';
import 'dotenv/config';

const MONGODB_URI = process.env.MONGODB_URI;

async function seedData() {
  try {
    console.log('🔌 Conectando a MongoDB Atlas...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado\n');

    // Limpiar SOLO datos de prueba (mantener datos reales)
    console.log('🧹 Limpiando datos de prueba anteriores...');
    await User.deleteMany({ email: /^usuario\d+@test\.com$/ }); // Solo usuarios de prueba
    await Store.deleteMany({ name: /^Tienda de Prueba \d+$/ }); // Solo tiendas de prueba
    await SponsorAd.deleteMany({}); // Anuncios se pueden recrear
    await Comment.deleteMany({}); // Comentarios se pueden recrear
    console.log('✅ Limpieza completada\n');

    // 1. Crear usuarios de prueba
    console.log('👥 Creando usuarios...');
    const users = [];
    for (let i = 1; i <= 5; i++) {
      const user = new User({
        username: `Usuario ${i}`,
        email: `usuario${i}@test.com`,
        password: 'test123',
        role: 'user',
      });
      await user.save();
      users.push(user);
    }
    console.log(`✅ ${users.length} usuarios creados`);

    // 2. Crear tiendas de prueba
    console.log('\n🏪 Creando tiendas...');
    const plans = ['free', 'pro', 'premium'];
    const categories = ['Comida', 'Ropa', 'Tecnología', 'Servicios', 'Otros'];
    const stores = [];
    
    for (let i = 0; i < users.length; i++) {
      const store = new Store({
        name: `Tienda de Prueba ${i + 1}`,
        owner: users[i]._id,
        description: `Esta es una tienda de prueba número ${i + 1} para demostración`,
        tipoNegocio: categories[i % categories.length],
        plan: plans[i % 3],
        planExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 días
        direccion: `Dirección de prueba ${i + 1}`,
        phone: `+56912345${i}${i}${i}`,
        email: `tienda${i + 1}@test.com`,
        isActive: true,
        mode: 'products',
      });
      await store.save();
      stores.push(store);
    }
    console.log(`✅ ${stores.length} tiendas creadas`);

    // 3. Crear anuncios patrocinados
    console.log('\n📢 Creando anuncios...');
    const positions = ['top', 'sidebar-left', 'sidebar-right', 'between-sections', 'footer'];
    const sponsors = [];
    
    for (let i = 0; i < 3; i++) {
      const sponsor = new SponsorAd({
        name: `Anuncio Patrocinado ${i + 1}`,
        imageUrl: `https://via.placeholder.com/800x200?text=Anuncio+${i + 1}`,
        link: `https://ejemplo${i + 1}.com`,
        position: positions[i % 5],
        priority: i + 1,
        active: true,
        impressions: Math.floor(Math.random() * 1000),
        clicks: Math.floor(Math.random() * 100),
      });
      await sponsor.save();
      sponsors.push(sponsor);
    }
    console.log(`✅ ${sponsors.length} anuncios creados`);

    // 4. Crear comentarios
    console.log('\n💬 Creando comentarios...');
    const commentTypes = ['platform', 'store', 'feature-request', 'bug-report'];
    const statuses = ['pending', 'reviewed', 'resolved'];
    
    for (let i = 0; i < 5; i++) {
      const comment = new Comment({
        user: users[i % users.length]._id,
        store: stores[i % stores.length]._id,
        type: commentTypes[i % commentTypes.length],
        subject: `Comentario ${i + 1}`,
        message: `Este es un mensaje de prueba para el comentario ${i + 1}`,
        rating: Math.floor(Math.random() * 5) + 1,
        status: statuses[i % statuses.length],
      });
      await comment.save();
    }
    console.log('✅ 5 comentarios creados');

    console.log('\n✅ DATOS DE PRUEBA CREADOS EXITOSAMENTE');
    console.log('\n📊 Resumen:');
    console.log(`   - ${users.length} usuarios`);
    console.log(`   - ${stores.length} tiendas`);
    console.log(`   - ${sponsors.length} anuncios`);
    console.log('   - 5 comentarios');
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

seedData();
