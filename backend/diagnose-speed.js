// Diagnóstico profundo de velocidad
import "dotenv/config";
import mongoose from "mongoose";
import Store from "./src/models/store.model.js";

(async () => {
  try {
    console.log("🔍 DIAGNÓSTICO DE VELOCIDAD\n");
    
    // Test 1: Conexión
    console.time("1️⃣ Conexión a MongoDB");
    await mongoose.connect(process.env.MONGODB_URI);
    console.timeEnd("1️⃣ Conexión a MongoDB");
    
    // Test 2: Ping
    console.time("2️⃣ Ping");
    await mongoose.connection.db.admin().ping();
    console.timeEnd("2️⃣ Ping");
    
    // Test 3: Count simple
    console.time("3️⃣ Count total stores");
    const totalStores = await Store.countDocuments({});
    console.timeEnd("3️⃣ Count total stores");
    console.log(`   Total: ${totalStores} stores\n`);
    
    // Test 4: Find sin filtros
    console.time("4️⃣ Find ALL (sin select, sin lean)");
    const allStoresRaw = await Store.find({}).limit(10);
    console.timeEnd("4️⃣ Find ALL (sin select, sin lean)");
    
    // Test 5: Find con lean
    console.time("5️⃣ Find ALL con .lean()");
    const allStoresLean = await Store.find({}).limit(10).lean();
    console.timeEnd("5️⃣ Find ALL con .lean()");
    
    // Test 6: Find con select
    console.time("6️⃣ Find con .select() campos mínimos");
    const selectedStores = await Store.find({})
      .select('_id name')
      .limit(10)
      .lean();
    console.timeEnd("6️⃣ Find con .select() campos mínimos");
    
    // Test 7: Con filtro isActive
    console.time("7️⃣ Find con filtro {isActive: true}");
    const activeStores = await Store.find({ isActive: true })
      .select('_id name logoUrl comuna tipoNegocio mode lat lng direccion')
      .limit(10)
      .lean();
    console.timeEnd("7️⃣ Find con filtro {isActive: true}");
    console.log(`   Encontradas: ${activeStores.length} stores\n`);
    
    // Test 8: Tamaño de documentos
    if (activeStores.length > 0) {
      const docSize = JSON.stringify(activeStores[0]).length;
      console.log(`📦 Tamaño por documento: ${(docSize / 1024).toFixed(2)} KB`);
      console.log(`📦 Payload total: ${(docSize * activeStores.length / 1024).toFixed(2)} KB\n`);
    }
    
    // Test 9: Query real del endpoint
    console.time("8️⃣ QUERY COMPLETA (como en endpoint)");
    const stores = await Store.find({ isActive: true })
      .select('_id name logoUrl comuna tipoNegocio mode lat lng direccion owner')
      .skip(0)
      .limit(50)
      .lean();
    console.timeEnd("8️⃣ QUERY COMPLETA (como en endpoint)");
    
    const total = await Store.countDocuments({ isActive: true });
    console.log(`   Resultado: ${stores.length} stores de ${total} activas\n`);
    
    // Análisis de índices
    console.log("📊 ANÁLISIS DE ÍNDICES:");
    const indexes = await Store.collection.getIndexes();
    console.log(`   Total índices: ${Object.keys(indexes).length}`);
    Object.entries(indexes).forEach(([name, def]) => {
      console.log(`   - ${name}`);
    });
    
    // Estadísticas de colección
    console.log("\n📈 ESTADÍSTICAS:");
    const stats = await Store.collection.stats();
    console.log(`   Documentos: ${stats.count}`);
    console.log(`   Tamaño promedio: ${(stats.avgObjSize / 1024).toFixed(2)} KB`);
    console.log(`   Tamaño total: ${(stats.size / 1024).toFixed(2)} KB`);
    console.log(`   Tamaño índices: ${(stats.totalIndexSize / 1024).toFixed(2)} KB`);
    
    // Diagnóstico final
    console.log("\n💡 DIAGNÓSTICO:");
    const avgDocSize = stats.avgObjSize / 1024;
    if (avgDocSize > 50) {
      console.log(`   ⚠️  Documentos MUY GRANDES (${avgDocSize.toFixed(2)} KB)`);
      console.log("   → Usar .select() con campos mínimos SIEMPRE");
    }
    
    if (Object.keys(indexes).length > 10) {
      console.log(`   ⚠️  MUCHOS ÍNDICES (${Object.keys(indexes).length})`);
      console.log("   → Considerar eliminar índices no usados");
    }
    
    await mongoose.disconnect();
    console.log("\n✅ Diagnóstico completo");
    
  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  }
})();
