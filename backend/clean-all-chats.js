// Script para eliminar todos los mensajes y resetear contadores
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
const messageSchema = new mongoose.Schema({}, { collection: 'messages', strict: false });
const bookingSchema = new mongoose.Schema({
  lastMessageAt: Date,
  unreadMessagesOwner: Number,
  unreadMessagesCustomer: Number,
}, { collection: 'bookings', strict: false });

const orderSchema = new mongoose.Schema({
  lastMessageAt: Date,
  unreadMessagesOwner: Number,
  unreadMessagesCustomer: Number,
}, { collection: 'orders', strict: false });

const Message = mongoose.model('Message', messageSchema);
const Booking = mongoose.model('Booking', bookingSchema);
const Order = mongoose.model('Order', orderSchema);

async function cleanAllChats() {
  try {
    console.log('🔌 Conectando a MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB\n');

    // Eliminar todos los mensajes
    console.log('🗑️  Eliminando todos los mensajes...');
    const messagesResult = await Message.deleteMany({});
    console.log(`✅ ${messagesResult.deletedCount} mensajes eliminados\n`);

    // Resetear contadores de bookings
    console.log('🔄 Reseteando contadores de bookings...');
    const bookingsResult = await Booking.updateMany(
      {},
      {
        $set: {
          lastMessageAt: null,
          unreadMessagesOwner: 0,
          unreadMessagesCustomer: 0
        }
      }
    );
    console.log(`✅ ${bookingsResult.modifiedCount} bookings actualizados\n`);

    // Resetear contadores de orders
    console.log('🔄 Reseteando contadores de orders...');
    const ordersResult = await Order.updateMany(
      {},
      {
        $set: {
          lastMessageAt: null,
          unreadMessagesOwner: 0,
          unreadMessagesCustomer: 0
        }
      }
    );
    console.log(`✅ ${ordersResult.modifiedCount} orders actualizados\n`);

    console.log('📊 RESUMEN:');
    console.log(`   Mensajes eliminados: ${messagesResult.deletedCount}`);
    console.log(`   Bookings reseteados: ${bookingsResult.modifiedCount}`);
    console.log(`   Orders reseteados: ${ordersResult.modifiedCount}`);
    console.log('\n✅ Limpieza completada exitosamente');

  } catch (error) {
    console.error('❌ Error en la limpieza:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Conexión cerrada');
  }
}

cleanAllChats();
