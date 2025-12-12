// Script para verificar y corregir estados de órdenes
// Ejecutar: node check-order-status.js

import mongoose from 'mongoose';
import 'dotenv/config';

const orderSchema = new mongoose.Schema({
  store: { type: mongoose.Schema.Types.ObjectId, ref: 'Store' },
  items: Array,
  total: Number,
  status: String,
  customerName: String,
  customerEmail: String,
  createdAt: Date
}, { timestamps: true });

const Order = mongoose.model('Order', orderSchema);

async function checkAndFixOrderStatuses() {
  try {
    console.log('🔍 Conectando a MongoDB...\n');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Conectado\n');

    // 1. Verificar todos los estados existentes
    console.log('📊 ANÁLISIS DE ESTADOS DE ÓRDENES\n');
    console.log('='.repeat(60));
    
    const allOrders = await Order.find({}).populate('store', 'name').lean();
    console.log(`Total de órdenes en BD: ${allOrders.length}\n`);

    if (allOrders.length === 0) {
      console.log('⚠️ No hay órdenes en la base de datos\n');
      await mongoose.disconnect();
      return;
    }

    // Contar por estado
    const statusCounts = {};
    const invalidStatuses = [];
    
    allOrders.forEach(order => {
      const status = order.status || 'undefined';
      statusCounts[status] = (statusCounts[status] || 0) + 1;
      
      // Detectar estados inválidos
      if (!['pending', 'confirmed', 'fulfilled', 'cancelled'].includes(status)) {
        invalidStatuses.push({
          _id: order._id,
          status: status,
          store: order.store?.name || 'Sin tienda',
          customer: order.customerName,
          total: order.total,
          createdAt: order.createdAt
        });
      }
    });

    console.log('Estados encontrados:');
    Object.entries(statusCounts).forEach(([status, count]) => {
      const isValid = ['pending', 'confirmed', 'fulfilled', 'cancelled'].includes(status);
      const icon = isValid ? '✅' : '❌';
      console.log(`  ${icon} ${status}: ${count} órdenes`);
    });
    
    console.log('\n' + '='.repeat(60));

    // 2. Si hay estados inválidos, mostrarlos y ofrecer corrección
    if (invalidStatuses.length > 0) {
      console.log(`\n⚠️ ENCONTRADOS ${invalidStatuses.length} ÓRDENES CON ESTADOS INVÁLIDOS:\n`);
      
      invalidStatuses.forEach((order, i) => {
        console.log(`${i + 1}. Orden ${order._id.toString().slice(-6)}`);
        console.log(`   Estado actual: "${order.status}"`);
        console.log(`   Tienda: ${order.store}`);
        console.log(`   Cliente: ${order.customer}`);
        console.log(`   Total: $${order.total?.toLocaleString() || 0}`);
        console.log(`   Fecha: ${new Date(order.createdAt).toLocaleDateString('es-ES')}`);
        console.log('');
      });

      console.log('='.repeat(60));
      console.log('\n🔧 CORRECCIONES SUGERIDAS:\n');
      console.log('  • "completed" → "fulfilled"');
      console.log('  • "delivered" → "fulfilled"');
      console.log('  • Otros estados → "pending" (por defecto)\n');

      // Mapeo de correcciones
      const statusMapping = {
        'completed': 'fulfilled',
        'delivered': 'fulfilled',
        'processing': 'confirmed',
        'shipped': 'fulfilled',
        'paid': 'confirmed'
      };

      console.log('¿Deseas corregir automáticamente estos estados? (Ctrl+C para cancelar)\n');
      console.log('💡 Tip: Ejecuta este comando para corregirlos:\n');
      console.log('```javascript');
      
      const uniqueInvalidStatuses = [...new Set(invalidStatuses.map(o => o.status))];
      uniqueInvalidStatuses.forEach(oldStatus => {
        const newStatus = statusMapping[oldStatus] || 'pending';
        const count = invalidStatuses.filter(o => o.status === oldStatus).length;
        console.log(`// Corregir ${count} órdenes con estado "${oldStatus}"`);
        console.log(`db.orders.updateMany({ status: "${oldStatus}" }, { $set: { status: "${newStatus}" } });`);
        console.log('');
      });
      
      console.log('```\n');

    } else {
      console.log('\n✅ TODOS LOS ESTADOS SON VÁLIDOS\n');
      
      // Mostrar resumen por tienda
      console.log('📊 RESUMEN POR TIENDA:\n');
      console.log('='.repeat(60));
      
      const storeStats = {};
      allOrders.forEach(order => {
        const storeName = order.store?.name || 'Sin tienda';
        if (!storeStats[storeName]) {
          storeStats[storeName] = {
            total: 0,
            pending: 0,
            confirmed: 0,
            fulfilled: 0,
            cancelled: 0,
            revenue: 0
          };
        }
        storeStats[storeName].total++;
        storeStats[storeName][order.status]++;
        if (['confirmed', 'fulfilled'].includes(order.status)) {
          storeStats[storeName].revenue += order.total || 0;
        }
      });

      Object.entries(storeStats).forEach(([storeName, stats]) => {
        console.log(`\n🏪 ${storeName}`);
        console.log(`   Total órdenes: ${stats.total}`);
        console.log(`   ⏳ Pendientes: ${stats.pending}`);
        console.log(`   ✅ Confirmadas: ${stats.confirmed}`);
        console.log(`   📦 Completadas: ${stats.fulfilled}`);
        console.log(`   ❌ Canceladas: ${stats.cancelled}`);
        console.log(`   💰 Ingresos: $${stats.revenue.toLocaleString('es-CL')}`);
      });
      
      console.log('\n' + '='.repeat(60));
    }

    // 3. Verificar estructura de items
    console.log('\n🔍 VERIFICANDO ESTRUCTURA DE ITEMS...\n');
    
    const ordersWithItems = allOrders.filter(o => o.items && o.items.length > 0);
    if (ordersWithItems.length > 0) {
      const sampleOrder = ordersWithItems[0];
      const sampleItem = sampleOrder.items[0];
      
      console.log('Estructura de ejemplo:');
      console.log('  Fields en items:', Object.keys(sampleItem).join(', '));
      
      const hasProductName = 'productName' in sampleItem;
      const hasUnitPrice = 'unitPrice' in sampleItem;
      const hasQuantity = 'quantity' in sampleItem;
      const hasSubtotal = 'subtotal' in sampleItem;
      
      console.log(`\n  ✓ Campos correctos:`);
      console.log(`    ${hasProductName ? '✅' : '❌'} productName`);
      console.log(`    ${hasUnitPrice ? '✅' : '❌'} unitPrice`);
      console.log(`    ${hasQuantity ? '✅' : '❌'} quantity`);
      console.log(`    ${hasSubtotal ? '✅' : '❌'} subtotal`);
      
      if (!hasProductName || !hasUnitPrice) {
        console.log('\n  ⚠️ Estructura de items puede tener problemas');
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('\n✅ Verificación completada\n');

    await mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
}

checkAndFixOrderStatuses();
