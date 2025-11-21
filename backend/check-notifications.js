import mongoose from 'mongoose';
import Booking from './src/models/booking.model.js';
import Order from './src/models/order.model.js';
import Store from './src/models/store.model.js';

// Usar la misma conexión que el backend
const MONGODB_URI = 'mongodb://127.0.0.1:27017/vitrinex';

async function checkNotifications() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB LOCAL');

    // Fecha de hace 24 horas
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
    console.log('\n📅 Buscando desde:', last24Hours.toLocaleString('es-CL'));

    // Verificar tiendas
    const stores = await Store.find().lean();
    console.log(`\n🏪 Total tiendas: ${stores.length}`);
    stores.forEach(store => {
      console.log(`  - ${store.name} (${store._id}) - Modo: ${store.mode}`);
    });

    // Verificar reservas
    const allBookings = await Booking.find().sort({ createdAt: -1 }).lean();
    console.log(`\n📅 Total reservas en DB: ${allBookings.length}`);
    console.log('\nTODAS LAS RESERVAS:');
    allBookings.forEach((booking, index) => {
      console.log(`  ${index + 1}. ${booking.customerName} - ${booking.serviceName || 'Sin nombre'} - ${booking.status} - Creada: ${new Date(booking.createdAt).toLocaleString('es-CL')} - Store: ${booking.store}`);
    });
    
    const recentBookings = await Booking.find({
      createdAt: { $gte: last24Hours }
    }).lean();
    console.log(`📅 Reservas últimas 24h: ${recentBookings.length}`);
    
    const newBookings = await Booking.find({
      createdAt: { $gte: last24Hours },
      status: { $ne: 'cancelled' }
    }).populate('service', 'name').lean();
    console.log(`📅 Reservas NUEVAS (no canceladas) últimas 24h: ${newBookings.length}`);
    newBookings.forEach(booking => {
      console.log(`  - ${booking.customerName} - ${booking.serviceName || booking.service?.name || 'Sin servicio'} - ${new Date(booking.createdAt).toLocaleString('es-CL')}`);
    });

    const bookingsWithMessages = await Booking.find({
      unreadMessagesOwner: { $gt: 0 }
    }).lean();
    console.log(`💬 Reservas con mensajes sin leer: ${bookingsWithMessages.length}`);
    bookingsWithMessages.forEach(booking => {
      console.log(`  - ${booking.customerName} - ${booking.unreadMessagesOwner} mensajes`);
    });

    // Verificar pedidos
    const allOrders = await Order.find().lean();
    console.log(`\n🛒 Total pedidos en DB: ${allOrders.length}`);
    
    const recentOrders = await Order.find({
      createdAt: { $gte: last24Hours }
    }).lean();
    console.log(`🛒 Pedidos últimas 24h: ${recentOrders.length}`);
    
    const newOrders = await Order.find({
      createdAt: { $gte: last24Hours },
      status: { $ne: 'cancelled' }
    }).lean();
    console.log(`🛒 Pedidos NUEVOS (no cancelados) últimas 24h: ${newOrders.length}`);
    newOrders.forEach(order => {
      console.log(`  - ${order.customerName} - $${order.total} - ${order.status} - ${new Date(order.createdAt).toLocaleString('es-CL')}`);
    });

    const ordersWithMessages = await Order.find({
      unreadMessagesOwner: { $gt: 0 }
    }).select('+unreadMessagesOwner +lastMessageAt').lean();
    console.log(`💬 Pedidos con mensajes sin leer: ${ordersWithMessages.length}`);
    ordersWithMessages.forEach(order => {
      console.log(`  - ${order.customerName} - ${order.unreadMessagesOwner} mensajes`);
    });

    // Verificar cancelaciones
    const cancelledBookings = await Booking.find({
      status: 'cancelled',
      updatedAt: { $gte: last24Hours }
    }).lean();
    console.log(`\n❌ Reservas canceladas últimas 24h: ${cancelledBookings.length}`);
    cancelledBookings.forEach(booking => {
      console.log(`  - ${booking.customerName} - ${new Date(booking.updatedAt).toLocaleString('es-CL')}`);
    });

    console.log('\n✅ Diagnóstico completado');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkNotifications();
