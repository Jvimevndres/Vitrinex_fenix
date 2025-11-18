import mongoose from 'mongoose';
import Store from './src/models/store.model.js';

async function addSpecialDay() {
  try {
    await mongoose.connect('mongodb://localhost:27017/vitrinex');
    console.log('✅ Conectado a MongoDB');
    
    const store = await Store.findOne({ mode: 'bookings' });
    if (!store) {
      console.log('❌ No hay tienda de reservas');
      process.exit(0);
    }
    
    console.log(`🏪 ${store.name}\n`);
    
    // Agregar día 18 de noviembre
    const specialDay = {
      date: new Date(2025, 10, 18, 12, 0, 0), // Nov 18, 2025 (mes 10 = noviembre)
      isClosed: false,
      reason: '',
      timeBlocks: [
        {
          startTime: '09:00',
          endTime: '17:00',
          slotDuration: 30
        }
      ]
    };
    
    // Verificar si ya existe
    const existingIndex = store.specialDays.findIndex(sd => {
      const sdDate = new Date(sd.date);
      return sdDate.getFullYear() === 2025 && 
             sdDate.getMonth() === 10 && 
             sdDate.getDate() === 18;
    });
    
    if (existingIndex >= 0) {
      console.log('📝 Actualizando día 18...');
      store.specialDays[existingIndex] = specialDay;
    } else {
      console.log('➕ Agregando día 18...');
      store.specialDays.push(specialDay);
    }
    
    await store.save();
    
    console.log('✅ Día especial guardado');
    console.log('\n📅 SpecialDays actuales:');
    store.specialDays.forEach(sd => {
      const date = new Date(sd.date);
      console.log(`  ${sd.isClosed ? '🚫' : '⭐'} ${date.toLocaleDateString('es-ES')}: ${sd.isClosed ? 'CERRADO' : `${sd.timeBlocks?.length || 0} bloques (${sd.timeBlocks?.[0]?.startTime || ''}-${sd.timeBlocks?.[0]?.endTime || ''})`}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

addSpecialDay();
