import mongoose from 'mongoose';
import Store from './src/models/store.model.js';

async function clearWeeklySchedule() {
  try {
    await mongoose.connect('mongodb://localhost:27017/vitrinex');
    console.log('✅ Conectado a MongoDB');
    
    const store = await Store.findOne({ mode: 'bookings' });
    if (!store) {
      console.log('❌ No hay tienda de reservas');
      process.exit(0);
    }
    
    console.log(`\n🏪 ${store.name}`);
    console.log(`📊 bookingAvailability actual: ${store.bookingAvailability?.length || 0} días`);
    console.log(`📅 specialDays actual: ${store.specialDays?.length || 0} días`);
    
    // Solo vaciar bookingAvailability, mantener specialDays
    store.bookingAvailability = [];
    await store.save();
    
    console.log('\n✅ Horario semanal eliminado');
    console.log('📅 SpecialDays conservados para configuración individual');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

clearWeeklySchedule();
