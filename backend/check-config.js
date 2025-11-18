import mongoose from 'mongoose';
import Store from './src/models/store.model.js';

async function checkSpecialDays() {
  try {
    await mongoose.connect('mongodb://localhost:27017/vitrinex');
    
    const stores = await Store.find({});
    console.log(`\n📊 Total tiendas: ${stores.length}`);
    stores.forEach(s => console.log(`   - ${s.name} (mode: ${s.mode})`));
    
    const store = stores.find(s => s.mode === 'bookings' || s.name.toLowerCase().includes('masaje'));
    if (!store) {
      console.log('❌ No hay tienda de reservas/masajes');
      process.exit(0);
    }
    
    console.log(`\n🏪 ${store.name}\n`);
    console.log('📅 Días configurados (specialDays):');
    
    if (!store.specialDays || store.specialDays.length === 0) {
      console.log('   ❌ No hay días configurados');
    } else {
      store.specialDays.forEach(day => {
        const date = day.date.toISOString().split('T')[0];
        const dow = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'][day.date.getDay()];
        if (day.isClosed) {
          console.log(`   🚫 ${date} (${dow}): CERRADO - ${day.reason || 'Sin razón'}`);
        } else {
          console.log(`   ⭐ ${date} (${dow}): ${day.timeBlocks?.length || 0} bloques`);
          day.timeBlocks?.forEach(b => {
            console.log(`      ${b.startTime} - ${b.endTime} (slots ${b.slotDuration}min)`);
          });
        }
      });
    }
    
    console.log('\n📋 Horario semanal (bookingAvailability):');
    if (!store.bookingAvailability || store.bookingAvailability.length === 0) {
      console.log('   ✅ Vacío (correcto para modo día por día)');
    } else {
      console.log(`   ⚠️ Tiene ${store.bookingAvailability.length} días configurados (debería estar vacío)`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkSpecialDays();
