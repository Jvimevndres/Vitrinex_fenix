// Script para agregar mensajes automáticos a pedidos y reservas existentes
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar .env desde la carpeta backend
dotenv.config({ path: path.join(__dirname, '.env') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI no está definida en .env');
  process.exit(1);
}

console.log('✅ MongoDB URI cargada correctamente');

// Definir modelos simplificados
const orderSchema = new mongoose.Schema({
  store: { type: mongoose.Schema.Types.ObjectId, ref: 'Store' },
  items: [{ 
    name: String, 
    quantity: Number, 
    price: Number,
    productName: String 
  }],
  total: Number,
  customerName: String,
  customerEmail: String,
  status: String,
  createdAt: Date,
  lastMessageAt: Date,
  unreadMessagesOwner: Number,
}, { collection: 'orders' });

const serviceSchema = new mongoose.Schema({
  name: String,
  price: Number,
}, { collection: 'services' });

const bookingSchema = new mongoose.Schema({
  store: { type: mongoose.Schema.Types.ObjectId, ref: 'Store' },
  service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service' },
  serviceName: String,
  date: String,
  slot: String,
  price: Number,
  customerName: String,
  customerEmail: String,
  createdAt: Date,
  lastMessageAt: Date,
  unreadMessagesOwner: Number,
}, { collection: 'bookings' });

const storeSchema = new mongoose.Schema({
  name: String,
}, { collection: 'stores' });

const messageSchema = new mongoose.Schema({
  store: { type: mongoose.Schema.Types.ObjectId, ref: 'Store' },
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
  conversationType: String,
  senderType: String,
  senderName: String,
  senderEmail: String,
  content: String,
  isRead: Boolean,
  createdAt: Date,
}, { collection: 'messages' });

const Order = mongoose.model('Order', orderSchema);
const Service = mongoose.model('Service', serviceSchema);
const Booking = mongoose.model('Booking', bookingSchema);
const Store = mongoose.model('Store', storeSchema);
const Message = mongoose.model('Message', messageSchema);

async function migrateMessages() {
  try {
    console.log('🔌 Conectando a MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB\n');

    // =================== MIGRAR ORDERS ===================
    console.log('📦 Migrando mensajes para ORDERS...');
    const ordersWithoutMessages = await Order.find({
      $or: [
        { lastMessageAt: null },
        { lastMessageAt: { $exists: false } }
      ]
    }).populate('store', 'name');

    console.log(`📊 Encontrados ${ordersWithoutMessages.length} orders sin mensajes\n`);

    let ordersUpdated = 0;
    for (const order of ordersWithoutMessages) {
      try {
        // Verificar si ya existe un mensaje para este order
        const existingMessage = await Message.findOne({ order: order._id });
        if (existingMessage) {
          console.log(`⏭️  Order ${order._id} ya tiene mensaje, saltando...`);
          continue;
        }

        const storeName = order.store?.name || 'Negocio';
        const itemsList = order.items.map(item => {
          const itemName = item.name || item.productName || 'Producto';
          const itemPrice = item.price || 0;
          return `• ${itemName} x${item.quantity || 1} - $${itemPrice.toLocaleString('es-CL')}`;
        }).join('\n');

        const content = `🛒 Nuevo pedido confirmado\n\n${itemsList}\n\n💰 Total: $${order.total.toLocaleString('es-CL')}\n\n✅ Tu pedido ha sido registrado exitosamente.`;

        // Crear mensaje automático
        const message = await Message.create({
          store: order.store._id,
          order: order._id,
          conversationType: "store",
          senderType: "owner",
          senderName: "Sistema",
          senderEmail: "system@vitrinex.com",
          content: content,
          isRead: false,
          createdAt: order.createdAt, // Usar la fecha del order
        });

        // Actualizar order
        order.lastMessageAt = order.createdAt;
        order.unreadMessagesOwner = 1;
        await order.save();

        ordersUpdated++;
        console.log(`✅ Order ${order._id} - ${storeName} - Mensaje creado`);
      } catch (error) {
        console.error(`❌ Error en order ${order._id}:`, error.message);
      }
    }

    console.log(`\n✅ ${ordersUpdated} orders actualizados con mensajes\n`);

    // =================== MIGRAR BOOKINGS ===================
    console.log('📅 Migrando mensajes para BOOKINGS...');
    const bookingsWithoutMessages = await Booking.find({
      $or: [
        { lastMessageAt: null },
        { lastMessageAt: { $exists: false } }
      ]
    }).populate('store', 'name').populate('service', 'name price');

    console.log(`📊 Encontrados ${bookingsWithoutMessages.length} bookings sin mensajes\n`);

    let bookingsUpdated = 0;
    for (const booking of bookingsWithoutMessages) {
      try {
        // Verificar si ya existe un mensaje para este booking
        const existingMessage = await Message.findOne({ booking: booking._id });
        if (existingMessage) {
          console.log(`⏭️  Booking ${booking._id} ya tiene mensaje, saltando...`);
          continue;
        }

        const storeName = booking.store?.name || 'Negocio';
        const bookingDate = new Date(booking.date);
        const formattedDate = bookingDate.toLocaleDateString('es-CL', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });

        const serviceName = booking.service?.name || booking.serviceName || 'Servicio';
        const servicePrice = booking.service?.price || booking.price || 0;
        
        const serviceInfo = `\n🔧 Servicio: ${serviceName}`;
        const priceInfo = servicePrice > 0 ? `\n💰 Precio: $${servicePrice.toLocaleString('es-CL')}` : '';
        
        const content = `📅 Nueva reserva confirmada\n\n📆 Fecha: ${formattedDate}\n🕐 Hora: ${booking.slot}${serviceInfo}${priceInfo}\n\n✅ Tu cita ha sido agendada exitosamente.`;

        // Crear mensaje automático
        const message = await Message.create({
          store: booking.store._id,
          booking: booking._id,
          conversationType: "store",
          senderType: "owner",
          senderName: "Sistema",
          senderEmail: "system@vitrinex.com",
          content: content,
          isRead: false,
          createdAt: booking.createdAt, // Usar la fecha del booking
        });

        // Actualizar booking
        booking.lastMessageAt = booking.createdAt;
        booking.unreadMessagesOwner = 1;
        await booking.save();

        bookingsUpdated++;
        console.log(`✅ Booking ${booking._id} - ${storeName} - Mensaje creado`);
      } catch (error) {
        console.error(`❌ Error en booking ${booking._id}:`, error.message);
      }
    }

    console.log(`\n✅ ${bookingsUpdated} bookings actualizados con mensajes\n`);

    // =================== RESUMEN ===================
    console.log('📊 RESUMEN DE MIGRACIÓN:');
    console.log(`   Orders actualizados: ${ordersUpdated}`);
    console.log(`   Bookings actualizados: ${bookingsUpdated}`);
    console.log(`   Total: ${ordersUpdated + bookingsUpdated}`);

    console.log('\n✅ Migración completada exitosamente');
  } catch (error) {
    console.error('❌ Error en la migración:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Conexión cerrada');
  }
}

migrateMessages();
