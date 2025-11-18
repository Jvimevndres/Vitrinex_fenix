// Script para limpiar specialDays corruptos
import mongoose from "mongoose";
import dotenv from "dotenv";
import Store from "./src/models/store.model.js";

dotenv.config();

const cleanSpecialDays = async () => {
  try {
    console.log("🔌 Conectando a MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Conectado\n");

    const stores = await Store.find({ mode: "bookings" });
    console.log(`📊 Tiendas encontradas: ${stores.length}\n`);

    for (const store of stores) {
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`🏪 Tienda: ${store.name}`);
      
      if (store.specialDays && store.specialDays.length > 0) {
        console.log(`   ⚠️ ${store.specialDays.length} specialDays encontrados`);
        
        // Eliminar todos los specialDays
        store.specialDays = [];
        await store.save();
        
        console.log(`   ✅ specialDays limpiados`);
      } else {
        console.log(`   ✅ No hay specialDays que limpiar`);
      }
      
      // Verificar bookingAvailability
      if (store.bookingAvailability) {
        let needsSave = false;
        
        for (const day of store.bookingAvailability) {
          // Si tiene timeBlocks vacíos pero tiene slots, no hacer nada (se migrará automáticamente)
          if ((!day.timeBlocks || day.timeBlocks.length === 0) && 
              day.slots && day.slots.length > 0) {
            console.log(`   📝 ${day.dayOfWeek}: Tiene slots antiguos (se migrará automáticamente)`);
          }
          // Si no tiene ni timeBlocks ni slots, marcar como cerrado
          else if ((!day.timeBlocks || day.timeBlocks.length === 0) && 
                   (!day.slots || day.slots.length === 0)) {
            console.log(`   ⚠️ ${day.dayOfWeek}: Sin bloques ni slots - marcando como cerrado`);
            day.isClosed = true;
            needsSave = true;
          }
          else {
            console.log(`   ✅ ${day.dayOfWeek}: OK - ${day.timeBlocks?.length || 0} bloques`);
          }
        }
        
        if (needsSave) {
          await store.save();
          console.log(`   💾 Cambios guardados`);
        }
      }
    }

    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
    console.log("✅ Limpieza completada");
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
};

cleanSpecialDays();
