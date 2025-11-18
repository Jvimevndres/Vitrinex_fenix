import mongoose from 'mongoose';
import Store from './src/models/store.model.js';
import Service from './src/models/service.model.js';

async function diagnose() {
  try {
    await mongoose.connect('mongodb://localhost:27017/vitrinex_fenix');
    console.log('✅ Conectado a MongoDB\n');
    
    // Buscar TODAS las tiendas primero
    const allStores = await Store.find({});
    console.log('📊 Total de tiendas:', allStores.length);
    allStores.forEach(s => {
      console.log(`  - ${s.name} (mode: "${s.mode}", id: ${s._id})`);
    });
    
    const stores = await Store.find({ mode: 'bookings' });
    console.log('\n📊 Tiendas con agendamiento encontradas:', stores.length);
    
    if (stores.length === 0) {
      console.log('\n⚠️ No hay tiendas con mode:"bookings"');
      console.log('Buscando tienda más reciente...\n');
      const latestStore = await Store.findOne({}).sort({ createdAt: -1 });
      if (!latestStore) {
        console.log('❌ No hay tiendas en la BD');
        process.exit(0);
      }
      
      console.log('=== TIENDA MÁS RECIENTE ===');
      console.log('ID:', latestStore._id.toString());
      console.log('Nombre:', latestStore.name);
      console.log('Modo:', latestStore.mode);
      console.log('\n=== bookingAvailability ===');
      if (!latestStore.bookingAvailability || latestStore.bookingAvailability.length === 0) {
        console.log('❌ No hay availability configurada');
      } else {
        console.log(`✅ ${latestStore.bookingAvailability.length} entradas:`);
        latestStore.bookingAvailability.forEach((entry, i) => {
          console.log(`\n${i + 1}. Día: ${entry.dayOfWeek}`);
          console.log(`   isOpen: ${entry.isOpen}`);
          if (entry.timeBlocks && entry.timeBlocks.length > 0) {
            console.log(`   timeBlocks (${entry.timeBlocks.length}):`);
            entry.timeBlocks.forEach(block => {
              console.log(`     - ${block.startTime} a ${block.endTime} (cada ${block.slotDuration}min)`);
            });
          } else {
            console.log(`   ❌ Sin timeBlocks`);
          }
        });
      }
      
      // Verificar servicios
      const services = await Service.find({ store: latestStore._id, isActive: true });
      console.log('\n=== SERVICIOS ACTIVOS ===');
      console.log(`${services.length} servicios:`);
      services.forEach(svc => {
        console.log(`- ${svc.name} (${svc.duration}min, $${svc.price})`);
      });
      
      process.exit(0);
    }
    
    const store = stores[0];
    console.log('\n=== DATOS DE LA TIENDA ===');
    console.log('ID:', store._id.toString());
    console.log('Nombre:', store.name);
    console.log('Modo:', store.mode);
    
    console.log('\n=== bookingAvailability ===');
    if (!store.bookingAvailability || store.bookingAvailability.length === 0) {
      console.log('❌ No hay availability configurada');
    } else {
      console.log(`✅ ${store.bookingAvailability.length} entradas:`);
      store.bookingAvailability.forEach((entry, i) => {
        console.log(`\n${i + 1}. Día: ${entry.dayOfWeek}`);
        console.log(`   isOpen: ${entry.isOpen}`);
        if (entry.timeBlocks && entry.timeBlocks.length > 0) {
          console.log(`   timeBlocks (${entry.timeBlocks.length}):`);
          entry.timeBlocks.forEach(block => {
            console.log(`     - ${block.startTime} a ${block.endTime} (cada ${block.slotDuration}min)`);
          });
        } else {
          console.log(`   ❌ Sin timeBlocks`);
        }
      });
    }
    
    console.log('\n=== specialDays ===');
    if (!store.specialDays || store.specialDays.length === 0) {
      console.log('No hay días especiales');
    } else {
      console.log(`${store.specialDays.length} días especiales:`);
      store.specialDays.forEach(day => {
        console.log(`- ${day.date}: ${day.isClosed ? 'CERRADO' : 'Abierto'}`);
        if (day.timeBlocks && day.timeBlocks.length > 0) {
          day.timeBlocks.forEach(block => {
            console.log(`  ${block.startTime} - ${block.endTime}`);
          });
        }
      });
    }
    
    // Verificar servicios
    const services = await Service.find({ store: store._id, isActive: true });
    console.log('\n=== SERVICIOS ACTIVOS ===');
    console.log(`${services.length} servicios:`);
    services.forEach(svc => {
      console.log(`- ${svc.name} (${svc.duration}min, $${svc.price})`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

diagnose();
