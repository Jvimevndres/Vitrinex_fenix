// Test de velocidad comparativo
import "dotenv/config";
import mongoose from "mongoose";

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Conectado\n");
    
    const Store = mongoose.connection.db.collection('stores');
    
    // Test 1: Query nativa de MongoDB (sin Mongoose)
    console.time("🔥 MongoDB NATIVO");
    const nativeResult = await Store.find({ isActive: true })
      .project({ _id: 1, name: 1, logoUrl: 1, comuna: 1, tipoNegocio: 1, mode: 1, lat: 1, lng: 1, direccion: 1 })
      .limit(50)
      .toArray();
    console.timeEnd("🔥 MongoDB NATIVO");
    console.log(`   Encontrados: ${nativeResult.length}\n`);
    
    // Test 2: Explicar query (ver si usa índices)
    const explain = await Store.find({ isActive: true })
      .project({ _id: 1, name: 1 })
      .limit(10)
      .explain("executionStats");
    
    console.log("📊 EXPLAIN QUERY:");
    console.log(`   Documentos examinados: ${explain.executionStats.totalDocsExamined}`);
    console.log(`   Documentos devueltos: ${explain.executionStats.nReturned}`);
    console.log(`   Tiempo: ${explain.executionStats.executionTimeMillis}ms`);
    console.log(`   Índice usado: ${explain.executionStats.executionStages.indexName || 'NINGUNO (SCAN COMPLETO)'}\n`);
    
    // Test 3: Sin filtro isActive
    console.time("⚡ Sin filtro isActive");
    const noFilter = await Store.find({})
      .project({ _id: 1, name: 1 })
      .limit(10)
      .toArray();
    console.timeEnd("⚡ Sin filtro isActive");
    console.log(`   Encontrados: ${noFilter.length}\n`);
    
    // Diagnóstico
    if (explain.executionStats.totalDocsExamined > explain.executionStats.nReturned * 2) {
      console.log("⚠️  PROBLEMA: La query examina muchos más documentos de los necesarios");
      console.log("   → El índice no está funcionando correctamente");
    }
    
    if (explain.executionStats.executionTimeMillis > 100) {
      console.log("⚠️  PROBLEMA: Query muy lenta incluso con pocos documentos");
      console.log("   → Posible problema de red o cluster saturado");
    }
    
    await mongoose.disconnect();
    
  } catch (err) {
    console.error("❌", err.message);
    process.exit(1);
  }
})();
