// Script para inicializar campos de chat en órdenes existentes
import mongoose from 'mongoose';
import Order from './src/models/order.model.js';
import 'dotenv/config';

const MONGODB_URI = process.env.MONGODB_URI;

async function fixOrdersChatFields() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB\n');

    // Buscar órdenes que no tengan los campos de chat
    const ordersToUpdate = await Order.find({
      $or: [
        { unreadMessagesOwner: { $exists: false } },
        { unreadMessagesCustomer: { $exists: false } },
        { lastMessageAt: { $exists: false } }
      ]
    });

    console.log(`📦 Órdenes a actualizar: ${ordersToUpdate.length}`);

    if (ordersToUpdate.length === 0) {
      console.log('✅ Todas las órdenes ya tienen los campos de chat');
      await mongoose.disconnect();
      process.exit(0);
    }

    // Actualizar cada orden
    for (const order of ordersToUpdate) {
      await Order.updateOne(
        { _id: order._id },
        {
          $set: {
            unreadMessagesOwner: 0,
            unreadMessagesCustomer: 0,
            lastMessageAt: null
          }
        }
      );
      console.log(`  ✓ Actualizada orden ${order._id} (${order.customerEmail})`);
    }

    console.log(`\n✅ Actualizadas ${ordersToUpdate.length} órdenes`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixOrdersChatFields();
