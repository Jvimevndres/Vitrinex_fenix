// Script de prueba para mensajes
import mongoose from 'mongoose';
import Message from './src/models/message.model.js';
import Booking from './src/models/booking.model.js';
import Order from './src/models/order.model.js';
import Store from './src/models/store.model.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/vitrinex-fenix';

async function testMessages() {
  try {
    console.log('🔌 Conectando a MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB\n');

    // Buscar una tienda
    const store = await Store.findOne();
    if (!store) {
      console.log('❌ No se encontró ninguna tienda');
      return;
    }
    console.log(`📦 Tienda encontrada: ${store.name} (${store._id})`);
    console.log(`   Modo: ${store.mode}\n`);

    if (store.mode === 'bookings') {
      // Probar mensajes de reservas
      console.log('📅 Probando mensajes de RESERVAS...\n');
      
      const bookings = await Booking.find({ store: store._id }).limit(3);
      console.log(`   Encontradas ${bookings.length} reservas\n`);

      for (const booking of bookings) {
        console.log(`   📋 Reserva: ${booking._id}`);
        console.log(`      Cliente: ${booking.customerName}`);
        console.log(`      Email: ${booking.customerEmail}`);
        console.log(`      Estado: ${booking.status}`);
        
        // Buscar mensajes de esta reserva
        const messages = await Message.find({ booking: booking._id }).sort({ createdAt: -1 });
        console.log(`      Mensajes: ${messages.length}`);
        
        if (messages.length > 0) {
          console.log('      Últimos mensajes:');
          messages.slice(0, 3).forEach(msg => {
            console.log(`        - [${msg.senderType}] ${msg.content.substring(0, 50)}...`);
            console.log(`          Fecha: ${msg.createdAt.toLocaleString('es-CL')}`);
            console.log(`          Leído: ${msg.isRead ? '✓✓' : '✓'}`);
          });
        }
        console.log('');
      }
    }

    if (store.mode === 'products') {
      // Probar mensajes de pedidos
      console.log('🛒 Probando mensajes de PEDIDOS...\n');
      
      const orders = await Order.find({ store: store._id }).limit(3);
      console.log(`   Encontrados ${orders.length} pedidos\n`);

      for (const order of orders) {
        console.log(`   📦 Pedido: ${order._id}`);
        console.log(`      Cliente: ${order.customerName}`);
        console.log(`      Email: ${order.customerEmail}`);
        console.log(`      Estado: ${order.status}`);
        console.log(`      Total: $${order.total?.toLocaleString('es-CL')}`);
        
        // Buscar mensajes de este pedido
        const messages = await Message.find({ order: order._id }).sort({ createdAt: -1 });
        console.log(`      Mensajes: ${messages.length}`);
        
        if (messages.length > 0) {
          console.log('      Últimos mensajes:');
          messages.slice(0, 3).forEach(msg => {
            console.log(`        - [${msg.senderType}] ${msg.content.substring(0, 50)}...`);
            console.log(`          Fecha: ${msg.createdAt.toLocaleString('es-CL')}`);
            console.log(`          Leído: ${msg.isRead ? '✓✓' : '✓'}`);
          });
        }
        console.log('');
      }
    }

    console.log('✅ Prueba completada\n');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB');
  }
}

testMessages();
