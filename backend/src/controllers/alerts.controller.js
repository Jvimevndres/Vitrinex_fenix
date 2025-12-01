// backend/src/controllers/alerts.controller.js
/**
 * Sistema de Alertas Proactivas
 * Genera alertas automáticas basadas en el estado del negocio
 */

import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import Booking from "../models/booking.model.js";
import Message from "../models/message.model.js";

/**
 * Genera alertas proactivas para una tienda
 */
export const generateAlerts = async (req, res) => {
  try {
    const { id: storeId } = req.params;
    const alerts = [];
    
    // 1. ALERTAS DE STOCK
    const products = await Product.find({ store: storeId });
    
    // Productos agotados
    const outOfStock = products.filter(p => p.stock === 0);
    if (outOfStock.length > 0) {
      alerts.push({
        type: 'critical',
        category: 'stock',
        title: 'Productos agotados',
        message: `Tienes ${outOfStock.length} producto(s) sin stock: ${outOfStock.map(p => p.name).slice(0, 3).join(', ')}${outOfStock.length > 3 ? '...' : ''}`,
        action: 'Reabastecer productos',
        priority: 1,
        data: outOfStock.map(p => ({ name: p.name, lastSold: p.updatedAt }))
      });
    }
    
    // Productos con bajo stock
    const lowStock = products.filter(p => p.stock > 0 && p.stock < 5);
    if (lowStock.length > 0) {
      alerts.push({
        type: 'warning',
        category: 'stock',
        title: 'Stock bajo',
        message: `${lowStock.length} producto(s) con menos de 5 unidades: ${lowStock.map(p => `${p.name} (${p.stock})`).slice(0, 3).join(', ')}`,
        action: 'Revisar inventario',
        priority: 2,
        data: lowStock.map(p => ({ name: p.name, stock: p.stock, price: p.price }))
      });
    }
    
    // 2. ALERTAS DE VENTAS
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const orders = await Order.find({ 
      store: storeId,
      createdAt: { $gte: thirtyDaysAgo }
    });
    
    // Órdenes pendientes por mucho tiempo (más de 7 días)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const oldPendingOrders = await Order.find({
      store: storeId,
      status: 'pending',
      createdAt: { $lt: sevenDaysAgo }
    });
    
    if (oldPendingOrders.length > 0) {
      alerts.push({
        type: 'warning',
        category: 'orders',
        title: 'Órdenes pendientes antiguas',
        message: `Tienes ${oldPendingOrders.length} orden(es) pendiente(s) de hace más de 7 días`,
        action: 'Revisar y completar órdenes',
        priority: 2,
        data: oldPendingOrders.map(o => ({
          id: o._id,
          customer: o.customerName,
          amount: o.totalAmount,
          daysWaiting: Math.floor((Date.now() - o.createdAt) / (1000 * 60 * 60 * 24))
        }))
      });
    }
    
    // Sin ventas recientes (últimos 7 días)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const recentOrders = orders.filter(o => o.createdAt >= weekAgo && o.status === 'completed');
    
    if (recentOrders.length === 0) {
      alerts.push({
        type: 'info',
        category: 'sales',
        title: 'Sin ventas recientes',
        message: 'No has tenido ventas completadas en los últimos 7 días',
        action: 'Crear promoción o revisar precios',
        priority: 3,
        data: { lastSale: orders.length > 0 ? orders[0].createdAt : null }
      });
    }
    
    // 3. ALERTAS DE PRODUCTOS SIN VENTAS
    const productSales = {};
    orders.forEach(order => {
      if (order.items && Array.isArray(order.items)) {
        order.items.forEach(item => {
          const name = item.name || item.productName;
          productSales[name] = (productSales[name] || 0) + 1;
        });
      }
    });
    
    const productsWithoutSales = products.filter(p => !productSales[p.name] && p.stock > 0);
    
    if (productsWithoutSales.length >= 3) {
      alerts.push({
        type: 'info',
        category: 'products',
        title: 'Productos sin ventas',
        message: `${productsWithoutSales.length} productos no han tenido ventas en 30 días`,
        action: 'Revisar precios o crear promociones',
        priority: 3,
        data: productsWithoutSales.slice(0, 5).map(p => ({ 
          name: p.name, 
          price: p.price,
          stock: p.stock 
        }))
      });
    }
    
    // 4. ALERTAS DE RESERVAS (si aplica)
    const bookings = await Booking.find({ 
      store: storeId,
      createdAt: { $gte: thirtyDaysAgo }
    });
    
    if (bookings.length > 0) {
      const cancelledBookings = bookings.filter(b => b.status === 'cancelled');
      const cancellationRate = (cancelledBookings.length / bookings.length) * 100;
      
      if (cancellationRate > 20) {
        alerts.push({
          type: 'warning',
          category: 'bookings',
          title: 'Alta tasa de cancelaciones',
          message: `${cancellationRate.toFixed(1)}% de tus reservas se cancelan`,
          action: 'Revisar política de reservas o precios',
          priority: 2,
          data: { 
            total: bookings.length, 
            cancelled: cancelledBookings.length,
            rate: cancellationRate 
          }
        });
      }
    }
    
    // 5. ALERTAS DE MENSAJES NO LEÍDOS
    const unreadMessages = await Message.countDocuments({
      store: storeId,
      read: false,
      sender: { $ne: 'store' }
    });
    
    if (unreadMessages > 5) {
      alerts.push({
        type: 'info',
        category: 'messages',
        title: 'Mensajes sin leer',
        message: `Tienes ${unreadMessages} mensajes sin leer de clientes`,
        action: 'Revisar mensajes',
        priority: 3,
        data: { count: unreadMessages }
      });
    }
    
    // 6. ALERTA DE OPORTUNIDAD: Producto estrella con stock bajo
    const topSeller = Object.entries(productSales)
      .sort((a, b) => b[1] - a[1])[0];
    
    if (topSeller) {
      const topProduct = products.find(p => p.name === topSeller[0]);
      if (topProduct && topProduct.stock < 10) {
        alerts.push({
          type: 'opportunity',
          category: 'stock',
          title: 'Reabastecer producto estrella',
          message: `Tu producto más vendido "${topProduct.name}" tiene solo ${topProduct.stock} unidades`,
          action: 'Reabastecer urgente',
          priority: 1,
          data: {
            name: topProduct.name,
            stock: topProduct.stock,
            sales: topSeller[1],
            price: topProduct.price
          }
        });
      }
    }
    
    // Ordenar alertas por prioridad
    alerts.sort((a, b) => a.priority - b.priority);
    
    res.json({
      ok: true,
      alerts,
      summary: {
        total: alerts.length,
        critical: alerts.filter(a => a.type === 'critical').length,
        warning: alerts.filter(a => a.type === 'warning').length,
        info: alerts.filter(a => a.type === 'info').length,
        opportunity: alerts.filter(a => a.type === 'opportunity').length,
      }
    });
    
  } catch (error) {
    console.error('❌ Error generando alertas:', error);
    res.status(500).json({
      ok: false,
      message: 'Error generando alertas',
      error: error.message
    });
  }
};

/**
 * Obtiene alertas para todas las tiendas del usuario
 */
export const getAlertsForUser = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Aquí necesitarías obtener todas las tiendas del usuario
    // Por ahora asumimos que viene el storeId en los params
    
    res.json({
      ok: true,
      message: 'Funcionalidad en desarrollo'
    });
    
  } catch (error) {
    console.error('❌ Error obteniendo alertas:', error);
    res.status(500).json({
      ok: false,
      message: 'Error obteniendo alertas'
    });
  }
};
