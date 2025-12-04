// 🚀 Optimización del endpoint listPublicStores
import "dotenv/config";
import mongoose from "mongoose";
import Store from "./src/models/store.model.js";

(async () => {
  try {
    console.log("🔧 OPTIMIZANDO ENDPOINT PUBLIC STORES\n");
    
    await mongoose.connect(process.env.MONGODB_URI);
    
    // 1. Verificar índices actuales en colecciones relacionadas
    console.log("📊 Verificando índices...");
    const storeIndexes = await Store.collection.getIndexes();
    console.log(`   Stores: ${Object.keys(storeIndexes).length} índices`);
    
    const db = mongoose.connection.db;
    const usersIndexes = await db.collection('users').indexes();
    const commentsIndexes = await db.collection('comments').indexes();
    console.log(`   Users: ${usersIndexes.length} índices`);
    console.log(`   Comments: ${commentsIndexes.length} índices\n`);
    
    // 2. Crear índices necesarios para los lookups si no existen
    console.log("🔨 Creando índices para lookups...");
    
    // Índice para lookup de users por _id (debería existir por defecto)
    try {
      await db.collection('users').createIndex({ _id: 1 });
      console.log("   ✅ Índice users._id");
    } catch (e) {
      console.log("   ℹ️  Índice users._id ya existe");
    }
    
    // Índice compuesto para comments (store + type + rating)
    try {
      await db.collection('comments').createIndex({ 
        store: 1, 
        type: 1, 
        rating: 1 
      });
      console.log("   ✅ Índice comments (store, type, rating)");
    } catch (e) {
      if (!e.message.includes('already exists')) {
        console.log("   ⚠️  Error creando índice comments:", e.message);
      } else {
        console.log("   ℹ️  Índice comments ya existe");
      }
    }
    
    // 3. Test de rendimiento - Query ACTUAL (con lookups)
    console.log("\n⏱️  TEST 1: Query ACTUAL (con 2 lookups)");
    console.time("   Tiempo");
    const [resultWithLookups] = await Store.aggregate([
      { $match: { isActive: true } },
      {
        $facet: {
          stores: [
            { $limit: 50 },
            {
              $lookup: {
                from: 'users',
                localField: 'owner',
                foreignField: '_id',
                as: 'ownerInfo'
              }
            },
            {
              $lookup: {
                from: 'comments',
                let: { storeId: '$_id' },
                pipeline: [
                  {
                    $match: {
                      $expr: { $eq: ['$store', '$$storeId'] },
                      type: 'store',
                      rating: { $exists: true, $ne: null }
                    }
                  }
                ],
                as: 'reviews'
              }
            },
            {
              $addFields: {
                reviewCount: { $size: '$reviews' },
                avgRating: {
                  $cond: {
                    if: { $gt: [{ $size: '$reviews' }, 0] },
                    then: { $avg: '$reviews.rating' },
                    else: 0
                  }
                }
              }
            },
            {
              $project: {
                _id: 1,
                name: 1,
                logoUrl: 1,
                comuna: 1,
                tipoNegocio: 1,
                mode: 1,
                lat: 1,
                lng: 1,
                direccion: 1,
                owner: 1,
                ownerName: { $arrayElemAt: ['$ownerInfo.username', 0] },
                ownerEmail: { $arrayElemAt: ['$ownerInfo.email', 0] },
                ownerAvatar: { $arrayElemAt: ['$ownerInfo.avatarUrl', 0] },
                rating: { $round: ['$avgRating', 1] },
                reviewCount: 1
              }
            }
          ],
          total: [{ $count: "count" }]
        }
      }
    ]);
    console.timeEnd("   Tiempo");
    console.log(`   Resultados: ${resultWithLookups.stores.length} stores\n`);
    
    // 4. Test SIN lookups (solo datos básicos)
    console.log("⏱️  TEST 2: Query OPTIMIZADA (sin lookups)");
    console.time("   Tiempo");
    const storesBasic = await Store.find({ isActive: true })
      .select('_id name logoUrl comuna tipoNegocio mode lat lng direccion owner')
      .limit(50)
      .lean();
    console.timeEnd("   Tiempo");
    console.log(`   Resultados: ${storesBasic.length} stores\n`);
    
    // 5. Test con solo lookup de reviews (sin owner)
    console.log("⏱️  TEST 3: Query con SOLO lookup reviews");
    console.time("   Tiempo");
    const [resultOnlyReviews] = await Store.aggregate([
      { $match: { isActive: true } },
      {
        $facet: {
          stores: [
            { $limit: 50 },
            {
              $lookup: {
                from: 'comments',
                let: { storeId: '$_id' },
                pipeline: [
                  {
                    $match: {
                      $expr: { $eq: ['$store', '$$storeId'] },
                      type: 'store',
                      rating: { $exists: true, $ne: null }
                    }
                  }
                ],
                as: 'reviews'
              }
            },
            {
              $addFields: {
                reviewCount: { $size: '$reviews' },
                avgRating: {
                  $cond: {
                    if: { $gt: [{ $size: '$reviews' }, 0] },
                    then: { $avg: '$reviews.rating' },
                    else: 0
                  }
                }
              }
            },
            {
              $project: {
                _id: 1,
                name: 1,
                logoUrl: 1,
                comuna: 1,
                tipoNegocio: 1,
                mode: 1,
                lat: 1,
                lng: 1,
                direccion: 1,
                owner: 1,
                rating: { $round: ['$avgRating', 1] },
                reviewCount: 1
              }
            }
          ],
          total: [{ $count: "count" }]
        }
      }
    ]);
    console.timeEnd("   Tiempo");
    console.log(`   Resultados: ${resultOnlyReviews.stores.length} stores\n`);
    
    // 6. Analizar tamaños de payload
    console.log("📦 ANÁLISIS DE PAYLOAD:");
    const sizeWithLookups = JSON.stringify(resultWithLookups.stores).length;
    const sizeBasic = JSON.stringify(storesBasic).length;
    const sizeOnlyReviews = JSON.stringify(resultOnlyReviews.stores).length;
    
    console.log(`   Con 2 lookups: ${(sizeWithLookups / 1024).toFixed(2)} KB`);
    console.log(`   Sin lookups: ${(sizeBasic / 1024).toFixed(2)} KB`);
    console.log(`   Solo reviews: ${(sizeOnlyReviews / 1024).toFixed(2)} KB\n`);
    
    // 7. Recomendaciones
    console.log("💡 RECOMENDACIONES:");
    console.log("   1. ❌ ELIMINAR lookup de 'users' (owner info)");
    console.log("      → No es necesario para listar tiendas públicas");
    console.log("      → Se puede obtener al hacer click en la tienda\n");
    
    console.log("   2. ⚡ MANTENER solo lookup de 'comments' (reviews)");
    console.log("      → Necesario para mostrar rating en el listado");
    console.log("      → Ya está optimizado con índice\n");
    
    console.log("   3. 💾 USAR caché agresivo");
    console.log("      → TTL de 5 minutos para queries sin filtros");
    console.log("      → Invalida caché al crear/editar stores\n");
    
    console.log("   4. 📊 PROJECTION mínimo");
    console.log("      → Solo campos necesarios para el listado");
    console.log("      → Evita transferir 199KB por tienda\n");
    
    await mongoose.connection.close();
    console.log("✅ Optimización completa");
    
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
})();
