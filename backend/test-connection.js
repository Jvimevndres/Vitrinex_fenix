// Test rápido de conexión MongoDB
import "dotenv/config";
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

console.log("🔍 Intentando conectar a MongoDB...");
console.log("URI:", MONGODB_URI?.slice(0, 50) + "...");
console.log("⏱️  Timeout: 30 segundos (cluster M10 puede estar inicializando)");

try {
  await mongoose.connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 30000, // 30 segundos
    connectTimeoutMS: 30000,
  });
  console.log("✅ MongoDB conectado exitosamente");
  console.log("📊 Database:", mongoose.connection.db.databaseName);
  console.log("🌍 Host:", mongoose.connection.host);
  
  // Probar una query simple
  const collections = await mongoose.connection.db.listCollections().toArray();
  console.log("📂 Colecciones:", collections.length);
  
  await mongoose.disconnect();
  console.log("👋 Desconectado");
  process.exit(0);
} catch (err) {
  console.error("❌ Error de conexión:", err.message);
  console.log("\n💡 Posibles causas:");
  console.log("   1. Cluster M10 aún está inicializándose (espera 5-10 min)");
  console.log("   2. Cambio de región de São Paulo a Santiago requiere nueva URI");
  console.log("   3. Credenciales necesitan actualizarse después de la migración");
  process.exit(1);
}
