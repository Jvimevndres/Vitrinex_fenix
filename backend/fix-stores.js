// Limpiar tiendas sin slug y recrearlas
import mongoose from 'mongoose';
import Store from './src/models/store.model.js';
import User from './src/models/user.model.js';
import 'dotenv/config';

const MONGODB_URI = process.env.MONGODB_URI;

async function fixStores() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado\n');

    // Eliminar tiendas sin slug
    const result = await Store.deleteMany({ slug: { $exists: false } });
    console.log(`🗑️  Eliminadas ${result.deletedCount} tiendas sin slug`);

    const brokenStores = await Store.find({ slug: null });
    if (brokenStores.length > 0) {
      console.log(`🗑️  Eliminando ${brokenStores.length} tiendas con slug null`);
      await Store.deleteMany({ slug: null });
    }

    // Verificar tiendas actuales
    const allStores = await Store.find({}).select('name slug owner isActive').populate('owner', 'username email');
    console.log(`\n🏪 Tiendas actuales: ${allStores.length}`);
    allStores.forEach(s => {
      console.log(`   - ${s.name} (${s.slug}) - Dueño: ${s.owner?.username || s.owner?.email}`);
    });

    // Contar tiendas por plan
    const freeCount = await Store.countDocuments({ plan: 'free' });
    const proCount = await Store.countDocuments({ plan: 'pro' });
    const premiumCount = await Store.countDocuments({ plan: 'premium' });
    
    console.log(`\n📊 Distribución de planes:`);
    console.log(`   FREE: ${freeCount}`);
    console.log(`   PRO: ${proCount}`);
    console.log(`   PREMIUM: ${premiumCount}`);

    await mongoose.disconnect();
    console.log('\n✅ Proceso completado');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

fixStores();
