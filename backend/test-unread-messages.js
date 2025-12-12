// Script para verificar mensajes no leídos
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const MONGODB_URI = process.env.MONGODB_URI;

const bookingSchema = new mongoose.Schema({}, { collection: 'bookings', strict: false });
const orderSchema = new mongoose.Schema({}, { collection: 'orders', strict: false });

const Booking = mongoose.model('Booking', bookingSchema);
const Order = mongoose.model('Order', orderSchema);

async function testUnreadMessages() {
  try {
    console.log('🔌 Conectando a MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado\n');

    console.log('📅 BOOKINGS con mensajes:');
    const bookings = await Booking.find({
      $or: [
        { lastMessageAt: { $ne: null } },
        { unreadMessagesOwner: { $gt: 0 } }
      ]
    }).lean();

    bookings.forEach(b => {
      console.log(`  ID: ${b._id}`);
      console.log(`  unreadMessagesOwner: ${b.unreadMessagesOwner || 0}`);
      console.log(`  unreadMessagesCustomer: ${b.unreadMessagesCustomer || 0}`);
      console.log('');
    });

    console.log('\n🛒 ORDERS con mensajes:');
    const orders = await Order.find({
      $or: [
        { lastMessageAt: { $ne: null } },
        { unreadMessagesOwner: { $gt: 0 } }
      ]
    }).lean();

    orders.forEach(o => {
      console.log(`  ID: ${o._id}`);
      console.log(`  unreadMessagesOwner: ${o.unreadMessagesOwner || 0}`);
      console.log(`  unreadMessagesCustomer: ${o.unreadMessagesCustomer || 0}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
  }
}

testUnreadMessages();
