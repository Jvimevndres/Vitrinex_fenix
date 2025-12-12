// Script para diagnosticar el estado de los chats
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI no está definida en .env');
  process.exit(1);
}

// Definir modelos
const bookingSchema = new mongoose.Schema({}, { collection: 'bookings', strict: false });
const orderSchema = new mongoose.Schema({}, { collection: 'orders', strict: false });
const messageSchema = new mongoose.Schema({}, { collection: 'messages', strict: false });
const storeSchema = new mongoose.Schema({}, { collection: 'stores', strict: false });

const Booking = mongoose.model('Booking', bookingSchema);
const Order = mongoose.model('Order', orderSchema);
const Message = mongoose.model('Message', messageSchema);
const Store = mongoose.model('Store', storeSchema);

async function diagnoseChats() {
  try {
    console.log('🔌 Conectando a MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB\n');

    // Contar mensajes
    const messageCount = await Message.countDocuments();
    console.log(`📨 Total de mensajes: ${messageCount}`);

    if (messageCount > 0) {
      const messages = await Message.find().limit(5).lean();
      console.log('\n📋 Últimos mensajes:');
      messages.forEach(msg => {
        console.log(`  - ${msg.senderType} | Booking: ${msg.booking || 'N/A'} | Order: ${msg.order || 'N/A'}`);
      });
    }

    // Bookings con mensajes
    console.log('\n\n📅 BOOKINGS CON ACTIVIDAD DE CHAT:');
    const bookingsWithMessages = await Booking.find({
      $or: [
        { lastMessageAt: { $ne: null } },
        { unreadMessagesOwner: { $gt: 0 } }
      ]
    }).lean();

    console.log(`✅ Encontrados ${bookingsWithMessages.length} bookings con mensajes\n`);
    
    for (const b of bookingsWithMessages) {
      const store = await Store.findById(b.store).lean();
      console.log(`  📅 Booking: ${b._id}`);
      console.log(`     Tienda: ${store?.name || b.store}`);
      console.log(`     Cliente: ${b.customerName || b.customerEmail}`);
      console.log(`     unreadMessagesOwner: ${b.unreadMessagesOwner || 0}`);
      console.log(`     lastMessageAt: ${b.lastMessageAt || 'null'}`);
      console.log('');
    }

    // Orders con mensajes
    console.log('\n🛒 ORDERS CON ACTIVIDAD DE CHAT:');
    const ordersWithMessages = await Order.find({
      $or: [
        { lastMessageAt: { $ne: null } },
        { unreadMessagesOwner: { $gt: 0 } }
      ]
    }).lean();

    console.log(`✅ Encontrados ${ordersWithMessages.length} orders con mensajes\n`);
    
    for (const o of ordersWithMessages) {
      const store = await Store.findById(o.store).lean();
      console.log(`  🛒 Order: ${o._id}`);
      console.log(`     Tienda: ${store?.name || o.store}`);
      console.log(`     Cliente: ${o.customerName || o.customerEmail}`);
      console.log(`     unreadMessagesOwner: ${o.unreadMessagesOwner || 0}`);
      console.log(`     lastMessageAt: ${o.lastMessageAt || 'null'}`);
      console.log('');
    }

    // Listar todas las tiendas
    console.log('\n🏪 TIENDAS REGISTRADAS:');
    const stores = await Store.find().select('name owner user').lean();
    console.log(`✅ Total: ${stores.length} tiendas\n`);
    stores.forEach(s => {
      console.log(`  - ${s.name} (${s._id})`);
      console.log(`    Owner: ${s.owner || s.user || 'N/A'}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Error en el diagnóstico:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Conexión cerrada');
  }
}

diagnoseChats();
