import mongoose from 'mongoose';
import Store from './src/models/store.model.js';
import Service from './src/models/service.model.js';
import { getAvailabilityForDate, getAvailableSlotsForDate } from './src/helpers/availability.helper.js';

async function testDay19() {
  try {
    await mongoose.connect('mongodb://localhost:27017/vitrinex_fenix');
    console.log('✅ Conectado a MongoDB\n');
    
    const stores = await Store.find({ mode: 'bookings' });
    if (stores.length === 0) {
      const allStores = await Store.find({});
      if (allStores.length === 0) {
        console.log('❌ No hay tiendas');
        process.exit(0);
      }
      console.log('Usando tienda más reciente (no tiene mode="bookings")');
      const store = allStores[0];
      await testStore(store);
    } else {
      await testStore(stores[0]);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    console.error(error.stack);
    process.exit(1);
  }
}

async function testStore(store) {
  console.log('=== TIENDA ===');
  console.log('ID:', store._id.toString());
  console.log('Nombre:', store.name);
  console.log('Modo:', store.mode);
  
  console.log('\n=== bookingAvailability ===');
  if (!store.bookingAvailability || store.bookingAvailability.length === 0) {
    console.log('❌ No hay availability configurada');
    return;
  }
  
  store.bookingAvailability.forEach((entry, i) => {
    console.log(`\n${i + 1}. ${entry.dayOfWeek}: isOpen=${entry.isOpen}`);
    if (entry.timeBlocks && entry.timeBlocks.length > 0) {
      entry.timeBlocks.forEach(block => {
        console.log(`   ${block.startTime} - ${block.endTime} (cada ${block.slotDuration}min)`);
      });
    }
  });
  
  console.log('\n=== specialDays ===');
  if (store.specialDays && store.specialDays.length > 0) {
    store.specialDays.forEach(day => {
      console.log(`${day.date.toISOString().split('T')[0]}: ${day.isClosed ? 'CERRADO' : 'Abierto'}`);
      if (day.timeBlocks && day.timeBlocks.length > 0) {
        day.timeBlocks.forEach(block => {
          console.log(`  ${block.startTime} - ${block.endTime}`);
        });
      }
    });
  } else {
    console.log('Sin días especiales configurados');
  }
  
  // Verificar servicios
  const services = await Service.find({ store: store._id, isActive: true });
  console.log('\n=== SERVICIOS ===');
  if (services.length === 0) {
    console.log('❌ No hay servicios activos');
    return;
  }
  services.forEach(svc => {
    console.log(`- ${svc.name} (${svc.duration}min, $${svc.price})`);
  });
  
  // PROBAR DÍA 19
  console.log('\n\n========================================');
  console.log('=== PRUEBA: 19 DE NOVIEMBRE 2025 ===');
  console.log('========================================\n');
  
  const testDate = new Date('2025-11-19T12:00:00Z');
  const dayNames = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  
  console.log('Fecha UTC:', testDate.toISOString());
  console.log('Fecha ISO (solo día):', testDate.toISOString().split('T')[0]);
  console.log('getDay():', testDate.getDay(), '=', dayNames[testDate.getDay()]);
  
  const availability = getAvailabilityForDate(testDate, store.bookingAvailability, store.specialDays);
  
  console.log('\n--- Resultado de getAvailabilityForDate ---');
  console.log('isClosed:', availability.isClosed);
  console.log('timeBlocks:', availability.timeBlocks.length);
  availability.timeBlocks.forEach(block => {
    console.log(`  ${block.startTime} - ${block.endTime} (slotDuration: ${block.slotDuration}min)`);
  });
  
  if (availability.isClosed || availability.timeBlocks.length === 0) {
    console.log('\n❌ El día está cerrado o sin bloques, no se generarán slots');
    return;
  }
  
  const firstService = services[0];
  console.log(`\n--- Generando slots para "${firstService.name}" (${firstService.duration}min) ---`);
  
  const slots = getAvailableSlotsForDate(
    testDate,
    store.bookingAvailability,
    store.specialDays,
    [],
    firstService.duration
  );
  
  console.log(`\n✅ Slots generados: ${slots.length}`);
  if (slots.length > 0) {
    console.log('Primeros 10:', slots.slice(0, 10).join(', '));
    console.log('Últimos 10:', slots.slice(-10).join(', '));
  } else {
    console.log('❌ No se generaron slots');
  }
}

testDay19();
