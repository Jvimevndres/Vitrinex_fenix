// Intenta conectar cada 10 segundos hasta que MongoDB esté listo
import "dotenv/config";
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;
const MAX_RETRIES = 30; // 5 minutos
let attempt = 0;

console.log("⏳ Esperando que MongoDB M10 esté listo...");
console.log("🌍 Región: GCP Santiago (southamerica-west1)");

async function tryConnect() {
  attempt++;
  try {
    console.log(`\n🔄 Intento ${attempt}/${MAX_RETRIES}...`);
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
    });
    
    console.log("\n✅ ¡CONEXIÓN EXITOSA!");
    console.log("📊 Database:", mongoose.connection.db.databaseName);
    console.log("🌍 Host:", mongoose.connection.host);
    
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log("📂 Colecciones encontradas:", collections.map(c => c.name).join(", "));
    
    await mongoose.disconnect();
    console.log("\n🎉 MongoDB está listo. Puedes ejecutar npm run dev");
    process.exit(0);
    
  } catch (err) {
    if (attempt >= MAX_RETRIES) {
      console.error("\n❌ Máximo de intentos alcanzado");
      console.error("Último error:", err.message);
      process.exit(1);
    }
    
    console.log(`⏱️  Esperando 10 segundos... (${attempt}/${MAX_RETRIES})`);
    setTimeout(tryConnect, 10000);
  }
}

tryConnect();
