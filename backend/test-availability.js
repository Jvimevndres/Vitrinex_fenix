// Script de prueba para verificar configuración de disponibilidad
// Ejecutar con: node backend/test-availability.js

import mongoose from "mongoose";
import dotenv from "dotenv";
import Store from "./src/models/store.model.js";

dotenv.config({ path: "./backend/.env" });

const testAvailability = async () => {
  try {
    console.log("🔌 Conectando a MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Conectado\n");

    // Obtener todas las tiendas con modo bookings
    const stores = await Store.find({ mode: "bookings" }).select(
      "name bookingAvailability specialDays"
    );

    console.log(`📊 Tiendas encontradas con modo bookings: ${stores.length}\n`);

    for (const store of stores) {
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`🏪 Tienda: ${store.name}`);
      console.log(`   ID: ${store._id}`);
      console.log(`\n📅 Disponibilidad semanal:`);

      if (!store.bookingAvailability || store.bookingAvailability.length === 0) {
        console.log("   ⚠️ NO HAY CONFIGURACIÓN DE HORARIOS");
      } else {
        store.bookingAvailability.forEach((day) => {
          console.log(`\n   ${day.dayOfWeek.toUpperCase()}:`);
          console.log(`      Cerrado: ${day.isClosed ? "SÍ" : "NO"}`);
          
          if (day.timeBlocks && day.timeBlocks.length > 0) {
            console.log(`      TimeBlocks (${day.timeBlocks.length}):`);
            day.timeBlocks.forEach((block, idx) => {
              console.log(
                `         ${idx + 1}. ${block.startTime} - ${block.endTime} (slots: ${block.slotDuration}min)`
              );
            });
          } else if (day.slots && day.slots.length > 0) {
            console.log(`      Slots antiguos (${day.slots.length}): ${day.slots.slice(0, 5).join(", ")}...`);
          } else {
            console.log(`      ⚠️ Sin bloques de horario`);
          }
        });
      }

      if (store.specialDays && store.specialDays.length > 0) {
        console.log(`\n\n📆 Días especiales (${store.specialDays.length}):`);
        store.specialDays.forEach((sd) => {
          console.log(`   ${new Date(sd.date).toLocaleDateString("es-ES")}: ${sd.isClosed ? "CERRADO" : "ABIERTO"}`);
        });
      }

      console.log(`\n`);
    }

    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
    console.log("✅ Test completado");
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
};

testAvailability();
