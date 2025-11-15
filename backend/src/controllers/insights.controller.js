// backend/src/controllers/insights.controller.js
import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import Booking from "../models/booking.model.js"; // 👈 AQUÍ EL CAMBIO
import mongoose from "mongoose";

// ---------------------------------------------------------------------
// 📦 INSIGHTS PARA VENTA DE PRODUCTOS
// ---------------------------------------------------------------------
export const getProductInsightsForStore = async (req, res) => {
  try {
    const { id: storeId } = req.params;
    const days = Number(req.query.days) || 30;
    const since = new Date();
    since.setDate(since.getDate() - days);
    since.setHours(0, 0, 0, 0);

    // Simulación en desarrollo para pruebas rápidas
    if (process.env.NODE_ENV !== "production" && req.query.simulate === "1") {
      const sample = {
        ok: true,
        summary: {
          totalOrders: 3,
          totalItemsSold: 7,
          totalRevenue: 45000,
          uniqueProducts: 3,
        },
        topProducts: [
          { productId: "p1", name: "Producto A", totalSold: 4, revenue: 24000 },
          { productId: "p2", name: "Producto B", totalSold: 2, revenue: 12000 },
        ],
        lowProducts: [{ productId: "p3", name: "Producto C", totalSold: 1, revenue: 9000 }],
        inventoryAlerts: [{ level: "warning", message: "Bajo stock: Producto C (stock 1)." }],
        suggestions: ["Reabastecer Producto C", "Promocionar Producto B"],
      };
      return res.json(sample);
    }

    // 1) Traer productos de la tienda
    let products = await Product.find({ store: storeId }).lean();

    // 2) Traer pedidos de la tienda dentro del período
    const orders = await Order.find({ store: storeId, createdAt: { $gte: since } }).lean();

    // Si hay órdenes que referencian productos que fueron eliminados, recuperamos al menos el id/name desde los pedidos
    const referencedIds = new Set();
    for (const o of orders) {
      for (const it of o.items || []) {
        if (it && it.product) referencedIds.add(String(it.product));
      }
    }
    const productIdsInProducts = new Set(products.map((p) => String(p._id)));
    const missingIds = [...referencedIds].filter((id) => !productIdsInProducts.has(id) && mongoose.Types.ObjectId.isValid(id));
    if (missingIds.length) {
      const missing = await Product.find({ _id: { $in: missingIds } }).lean();
      // It's possible the product docs truly don't exist; in that case we still want placeholders
      const foundIds = new Set(missing.map((p) => String(p._id)));
      products = products.concat(
        missing.map((p) => ({ ...p }))
      );
      const placeholders = missingIds.filter((id) => !foundIds.has(id)).map((id) => ({ _id: id, name: "(producto eliminado)", price: 0, stock: 0 }));
      products = products.concat(placeholders);
    }

    // Mapas auxiliares
    const salesByProduct = {};
    const revenueByProduct = {};

    for (const order of orders) {
      for (const item of order.items || []) {
        if (!item) continue;
        const pid = String(item.product || item.productId || item.productId);

        if (!salesByProduct[pid]) {
          salesByProduct[pid] = 0;
          revenueByProduct[pid] = 0;
        }

        const qty = Math.max(0, Math.floor(Number(item.quantity) || 0));
        const price = Math.max(0, Number(item.unitPrice || item.price || 0) || 0);

        salesByProduct[pid] += qty;
        revenueByProduct[pid] += qty * price;
      }
    }

    // Construimos lista combinando productos + ventas
    const productStats = products.map((p) => {
      const pid = String(p._id);
      const sold = salesByProduct[pid] || 0;
      const revenue = revenueByProduct[pid] || 0;

      return {
        id: pid,
        name: p.name,
        price: p.price,
        stock: p.stock,
        sold,
        revenue,
      };
    });

    // Ordenar por más vendidos / menos vendidos
    const bestSellers = [...productStats]
      .sort((a, b) => b.sold - a.sold)
      .slice(0, 10)
      .filter((p) => p && (p.sold > 0 || p.revenue > 0));

    const slowMovers = [...productStats]
      .sort((a, b) => a.sold - b.sold)
      .slice(0, 10);

    // Productos con poco stock (umbral configurable)
    const LOW_STOCK_THRESHOLD = 5;
    const lowStock = productStats.filter(
      (p) => typeof p.stock === "number" && p.stock <= LOW_STOCK_THRESHOLD
    );

    // Construir métricas resumen
    const totalOrders = orders.length || 0;
    const totalItemsSold = Object.values(salesByProduct).reduce((s, v) => s + v, 0) || 0;
    const totalRevenue = Object.values(revenueByProduct).reduce((s, v) => s + v, 0) || 0;
    const uniqueProducts = Object.keys(salesByProduct).length || 0;

    // Formato esperado por frontend
    const topProducts = bestSellers.map((p) => ({
      productId: p.id || String(p._id || ""),
      name: p.name || "(sin nombre)",
      totalSold: Number(p.sold) || 0,
      revenue: Number(p.revenue) || 0,
    }));

    const lowProducts = slowMovers.map((p) => ({
      productId: p.id || String(p._id || ""),
      name: p.name || "(sin nombre)",
      totalSold: Number(p.sold) || 0,
      revenue: Number(p.revenue) || 0,
    }));

    const inventoryAlerts = lowStock.map((p) => ({
      level: "warning",
      message: `Bajo stock: ${p.name || "(sin nombre)"} (stock ${p.stock || 0}).`,
    }));

    const suggestionsArr = [];
    for (const p of lowStock) {
      suggestionsArr.push(`Reabastecer "${p.name}" (stock actual ${p.stock}, ventas: ${p.sold}).`);
    }
    for (const p of slowMovers.slice(0, 5)) {
      if (p.sold === 0) {
        suggestionsArr.push(
          `Producto "${p.name}" sin ventas en el período. Considera destacarlo o crear una promoción.`
        );
      } else {
        suggestionsArr.push(
          `Reducir precio temporalmente a "${p.name}" para incentivar ventas (ventas: ${p.sold}).`
        );
      }
    }

    res.json({
      ok: true,
      summary: {
        totalOrders,
        totalItemsSold,
        totalRevenue,
        uniqueProducts,
      },
      topProducts,
      lowProducts,
      inventoryAlerts,
      suggestions: suggestionsArr,
    });
  } catch (err) {
    console.error("Error en getProductInsightsForStore:", err);
    res.status(500).json({
      ok: false,
      message: "Error al calcular insights de productos.",
    });
  }
};

// ---------------------------------------------------------------------
// 📅 INSIGHTS PARA AGENDAMIENTO (BOOKINGS)
// ---------------------------------------------------------------------
export const getBookingInsightsForStore = async (req, res) => {
  try {
    const { id: storeId } = req.params;
    const days = Number(req.query.days) || 30;
    const since = new Date();
    since.setDate(since.getDate() - days);
    since.setHours(0, 0, 0, 0);

    // Simulación en desarrollo para pruebas rápidas
    if (process.env.NODE_ENV !== "production" && req.query.simulate === "1") {
      return res.json({
        ok: true,
        summary: { totalAppointments: 5, confirmed: 3, cancelled: 1, completionRate: 60 },
        busySlots: [
          { hour: "14:00", count: 2 },
          { hour: "16:00", count: 1 },
        ],
        services: [{ name: "Corte de pelo", total: 3 }, { name: "Manicura", total: 2 }],
        suggestions: ["Horarios pico: 14:00, 16:00", "Promocionar servicio Manicura"],
      });
    }

    // Traer bookings en período
    const bookings = await Booking.find({ store: storeId, date: { $gte: since } }).lean();

    if (!bookings.length) {
      // Normalizar la respuesta vacía para que coincida exactamente con la estructura simulada
      return res.json({
        ok: true,
        summary: {
          totalAppointments: 0,
          confirmed: 0,
          cancelled: 0,
          completionRate: 0,
        },
        busySlots: [],
        services: [],
        suggestions: ["Aún no se registran reservas en tu tienda."],
      });
    }

    let confirmed = 0;
    let cancelled = 0;

    const byHour = {};
    const byService = {};

    for (const b of bookings) {
      const status = b.status || "pending";

      if (status === "confirmed") confirmed++;
      if (status === "cancelled") cancelled++;

      // hora: preferimos slot (HH:mm), si no, usar la hora de la fecha
      let hourKey = null;
      if (typeof b.slot === "string" && b.slot) {
        hourKey = b.slot;
      } else if (b.date) {
        const dateObj = b.date instanceof Date ? b.date : new Date(b.date);
        if (!Number.isNaN(dateObj.getTime?.())) {
          const hh = String(dateObj.getUTCHours()).padStart(2, "0");
          hourKey = `${hh}:00`;
        }
      }

      if (hourKey != null) {
        byHour[hourKey] = (byHour[hourKey] || 0) + 1;
      }

      // servicio: si no hay campo, usamos "Servicio"
      const serviceKey = b.serviceName || b.service || "Servicio";
      byService[serviceKey] = (byService[serviceKey] || 0) + 1;
    }

    const peakHours = Object.entries(byHour)
      .map(([hour, count]) => ({ hour, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const lowDemandSlots = Object.entries(byHour)
      .map(([hour, count]) => ({ hour, count }))
      .sort((a, b) => a.count - b.count)
      .slice(0, 5);

    const popularServices = Object.entries(byService)
      .map(([service, count]) => ({ service, count }))
      .sort((a, b) => b.count - a.count);

    const suggestionsArr = [];
    if (peakHours.length) {
      suggestionsArr.push(
        `Horarios pico: ${peakHours.map((h) => h.hour).join(", ")}. Asegura suficiente personal.`
      );
    }
    if (lowDemandSlots.length) {
      suggestionsArr.push(
        `Horarios con baja demanda: ${lowDemandSlots.map((h) => h.hour).join(", ")}. Considera promociones.`
      );
    }
    if (popularServices.length) {
      suggestionsArr.push(
        `Servicios populares: ${popularServices
          .slice(0, 3)
          .map((s) => s.service)
          .join(", ")}. Destácalos en tu oferta.`
      );
    }

    // Formato esperado por frontend
    const busySlots = peakHours.map((h) => ({ hour: String(h.hour || ""), count: Number(h.count || 0) }));
    const services = popularServices.map((s) => ({ name: String(s.service || "Servicio"), total: Number(s.count || 0) }));

    const totalAppointments = bookings.length || 0;
    const completionRate = totalAppointments === 0 ? 0 : Math.round((confirmed / totalAppointments) * 100);

    // If we have bookings but no busySlots (e.g. missing slot info), provide a helpful suggestion
    if (bookings.length > 0 && busySlots.length === 0) {
      suggestionsArr.push("Hay reservas registradas pero no hay datos de horario suficientes para estimar picos.");
    }

    res.json({
      ok: true,
      summary: {
        totalAppointments,
        confirmed,
        cancelled,
        completionRate,
      },
      busySlots,
      services,
      suggestions: suggestionsArr,
    });
  } catch (err) {
    console.error("Error en getBookingInsightsForStore:", err);
    res.status(500).json({
      ok: false,
      message: "Error al calcular insights de agendamiento.",
    });
  }
};
