// Script para agregar campos de chat a reservas existentes
import mongoose from "mongoose";
import Booking from "./src/models/booking.model.js";
import dotenv from "dotenv";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/vitrinex";

async function fixBookingsChatFields() {
  try {
    console.log("🔌 Conectando a MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("✅ Conectado a MongoDB");

    // Contar reservas sin campos de chat
    const bookingsWithoutChat = await Booking.countDocuments({
      $or: [
        { unreadMessagesOwner: { $exists: false } },
        { unreadMessagesCustomer: { $exists: false } },
        { lastMessageAt: { $exists: false } }
      ]
    });

    console.log(`📊 Reservas sin campos de chat: ${bookingsWithoutChat}`);

    if (bookingsWithoutChat === 0) {
      console.log("✅ Todas las reservas ya tienen campos de chat");
      process.exit(0);
    }

    // Actualizar todas las reservas
    const result = await Booking.updateMany(
      {
        $or: [
          { unreadMessagesOwner: { $exists: false } },
          { unreadMessagesCustomer: { $exists: false } },
          { lastMessageAt: { $exists: false } }
        ]
      },
      {
        $set: {
          unreadMessagesOwner: 0,
          unreadMessagesCustomer: 0,
          lastMessageAt: null
        }
      }
    );

    console.log(`✅ Actualizadas ${result.modifiedCount} reservas`);

    // Verificar
    const allBookings = await Booking.find({}).select('customerEmail unreadMessagesCustomer unreadMessagesOwner').limit(5);
    console.log("\n📋 Muestra de reservas actualizadas:");
    allBookings.forEach(b => {
      console.log(`- ${b.customerEmail}: unreadOwner=${b.unreadMessagesOwner}, unreadCustomer=${b.unreadMessagesCustomer}`);
    });

    console.log("\n✅ Proceso completado");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

fixBookingsChatFields();
