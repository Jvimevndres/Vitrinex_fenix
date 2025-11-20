// Script para verificar datos de insights
import 'dotenv/config';
import mongoose from 'mongoose';
import Order from './src/models/order.model.js';
import Booking from './src/models/booking.model.js';
import Store from './src/models/store.model.js';

const MONGODB_URI = process.env.MONGODB_URI;

async function testInsightsData() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB\n');

    // Listar tiendas
    const stores = await Store.find({}).select('_id name mode').limit(5);
    console.log('📊 Tiendas disponibles:');
    stores.forEach(s => {
      console.log(`   ${s._id} - ${s.name} (Modo: ${s.mode || 'products'})`);
    });

    if (stores.length > 0) {
      const testStore = stores[0];
      console.log(`\n🔍 Analizando tienda: ${testStore.name}\n`);

      // Verificar órdenes
      const orders = await Order.find({ store: testStore._id }).limit(5);
      console.log(`📦 Órdenes encontradas: ${orders.length}`);
      if (orders.length > 0) {
        console.log('   Última orden:', {
          id: orders[0]._id,
          items: orders[0].items?.length || 0,
          total: orders[0].total,
          fecha: orders[0].createdAt
        });
      }

      // Verificar bookings
      const bookings = await Booking.find({ store: testStore._id }).limit(5);
      console.log(`📅 Reservas encontradas: ${bookings.length}`);
      if (bookings.length > 0) {
        console.log('   Última reserva:', {
          id: bookings[0]._id,
          servicio: bookings[0].serviceName || bookings[0].service,
          fecha: bookings[0].date,
          slot: bookings[0].slot,
          status: bookings[0].status
        });
      }

      // Resumen
      console.log('\n📈 Resumen:');
      console.log(`   ✓ Insights de productos: ${orders.length > 0 ? 'Disponible' : 'Sin datos'}`);
      console.log(`   ✓ Insights de agendamiento: ${bookings.length > 0 ? 'Disponible' : 'Sin datos'}`);
    }

    await mongoose.disconnect();
    console.log('\n✅ Desconectado');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testInsightsData();
