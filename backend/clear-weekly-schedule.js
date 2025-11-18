import mongoose from 'mongoose';
import Store from './src/models/store.model.js';

async function clearWeeklySchedule() {
  try {
    await mongoose.connect('mongodb://localhost:27017/vitrinex_fenix');
    console.log('✅ Conectado a MongoDB\n');
    
    const stores = await Store.find({ mode: 'bookings' });
    
    if (stores.length === 0) {
      console.log('❌ No hay tiendas con modo bookings');
      process.exit(0);
    }
    
    const store = stores[0];
    console.log(`🏪 Tienda: ${store.name}`);
    console.log(`📊 bookingAvailability actual: ${store.bookingAvailability.length} días configurados\n`);
    
    // Limpiar completamente el horario semanal
    store.bookingAvailability = [];
    await store.save();
    
    console.log('✅ Horario semanal eliminado completamente');
    console.log('\n📋 Ahora solo usa "Horarios y Excepciones" para configurar cada día individualmente\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

clearWeeklySchedule();
