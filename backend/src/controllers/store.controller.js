import Store from "../models/store.model.js";
import Product from "../models/product.model.js";
import Booking from "../models/booking.model.js";
import Order from "../models/order.model.js";
import Service from "../models/service.model.js";
import {
  normalizeAvailability,
  validateTimeBlock,
  detectOverlaps,
  generateSlotsFromBlocks,
  migrateOldFormat,
  normalizeDateOnly,
  getAvailabilityForDate,
  getAvailableSlotsForDate,
  normalizeSpecialDays,
} from "../helpers/availability.helper.js";

/* =================== Helpers =================== */

const DAY_ORDER = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

const DAY_FROM_INDEX = {
  0: "sunday",
  1: "monday",
  2: "tuesday",
  3: "wednesday",
  4: "thursday",
  5: "friday",
  6: "saturday",
};

const SLOT_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

// normalizeDateOnly se importa desde availability.helper.js

const findStoreForOwner = async (storeId, userId) => {
  const store = await Store.findById(storeId);
  if (!store) return { error: { status: 404, message: "Tienda no encontrada" } };

  if (userId) {
    const ownerId = store.owner?.toString();
    const legacyOwnerId = store.user?.toString();
    if (ownerId !== userId && legacyOwnerId !== userId) {
      return { error: { status: 403, message: "No tienes permisos sobre esta tienda" } };
    }
  }
  return { store };
};

const parseImages = (images) => {
  if (!images) return [];
  if (Array.isArray(images)) {
    return images
      .filter((img) => typeof img === "string" && img.trim().length > 0)
      .map((img) => img.trim());
  }
  if (typeof images === "string" && images.trim()) {
    return images
      .split(/[\n,]+/)
      .map((img) => img.trim())
      .filter((img) => img.length > 0);
  }
  return [];
};

const mapProductResponse = (product) => ({
  _id: product._id,
  name: product.name,
  description: product.description,
  price: product.price,
  images: product.images || [],
  stock: product.stock,
  isActive: product.isActive,
  createdAt: product.createdAt,
  updatedAt: product.updatedAt,
});

/* =============== PUBLIC STORES (MAP) =============== */

export const listPublicStores = async (req, res) => {
  try {
    const { comuna, tipoNegocio, mode, page = 1, limit = 50 } = req.query;
    const query = { isActive: true };
    if (comuna) query.comuna = comuna;
    if (tipoNegocio) query.tipoNegocio = tipoNegocio;
    if (mode) query.mode = mode;

    // Paginación
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit))); // Máximo 100
    const skip = (pageNum - 1) * limitNum;

    const [stores, total] = await Promise.all([
      Store.find(query)
        .populate("owner", "username avatarUrl")
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Store.countDocuments(query)
    ]);

    res.json({
      stores: stores.map((s) => ({
        _id: s._id,
        name: s.name,
        description: s.description,
        logoUrl: s.logoUrl,
        comuna: s.comuna,
        tipoNegocio: s.tipoNegocio,
        mode: s.mode,
        lat: s.lat,
        lng: s.lng,
        direccion: s.direccion,
        isActive: s.isActive,
        owner: s.owner ? {
          _id: s.owner._id,
          username: s.owner.username,
          avatarUrl: s.owner.avatarUrl
        } : null,
        ownerName: s.owner?.username || null,
        ownerAvatar: s.owner?.avatarUrl || null,
      })),
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (err) {
    console.error("Error listando tiendas públicas:", err);
    res.status(500).json({ message: "Error al listar las tiendas" });
  }
};

/* =============== MY STORES (OWNER) =============== */

export const getMyStore = async (req, res) => {
  try {
    const userId = req.user.id;

    const stores = await Store.find({
      $or: [{ owner: userId }, { user: userId }],
    }).lean();

    // Si no tiene tiendas, retornar array vacío con 200 (no es error)
    if (!stores || stores.length === 0) {
      return res.json([]);
    }

    res.json(stores);
  } catch (err) {
    console.error("Error al obtener tiendas:", err);
    res.status(500).json({ message: "Error al obtener tus tiendas" });
  }
};

// Crear/actualizar (por body con _id). SÍ exportada:
export const saveMyStore = async (req, res) => {
  const {
    _id,
    name,
    mode,
    description,
    logoUrl,
    comuna,
    tipoNegocio,
    lat,
    lng,
    direccion,
    primaryColor,
    accentColor,
    heroTitle,
    heroSubtitle,
    highlight1,
    highlight2,
    priceFrom,
    bgMode,
    bgColorTop,
    bgColorBottom,
    bgPattern,
    bgImageUrl,
  } = req.body;

  if (!name) {
    return res.status(400).json({ message: "El nombre es obligatorio" });
  }

  const userId = req.user.id;

  try {
    let store;

    const base = {
      name,
      mode: mode === "bookings" ? "bookings" : "products",
      description,
      logoUrl,
      comuna,
      tipoNegocio,
      lat,
      lng,
      direccion,
      isActive: true,
      owner: userId,
      user: userId,
      primaryColor: primaryColor || "#2563eb",
      accentColor: accentColor || "#0f172a",
      heroTitle: heroTitle || "",
      heroSubtitle: heroSubtitle || "",
      highlight1: highlight1 || "",
      highlight2: highlight2 || "",
      priceFrom: priceFrom || "",
      bgMode: ["solid", "gradient", "image"].includes(bgMode) ? bgMode : "gradient",
      bgColorTop: bgColorTop || "#e8d7ff",
      bgColorBottom: bgColorBottom || "#ffffff",
      bgPattern: ["none", "dots", "grid", "noise"].includes(bgPattern) ? bgPattern : "none",
      bgImageUrl: bgImageUrl || "",
    };

    if (_id) {
      store = await Store.findOneAndUpdate(
        { _id, $or: [{ owner: userId }, { user: userId }] },
        base,
        { new: true }
      );
      if (!store) return res.status(404).json({ message: "Tienda no encontrada" });
      return res.status(200).json(store);
    }

    store = await Store.create(base);
    return res.status(201).json(store);
  } catch (err) {
    console.error("Error al guardar tienda:", err);
    res.status(500).json({ message: "Error al guardar la tienda" });
  }
};

// Update REST por :id. SÍ exportada:
export const updateMyStore = async (req, res) => {
  const { id } = req.params;
  const {
    name,
    mode,
    description,
    logoUrl,
    coverImageUrl,
    comuna,
    tipoNegocio,
    lat,
    lng,
    direccion,
    email,
    phone,
    whatsapp,
    website,
    scheduleText,
    primaryColor,
    accentColor,
    heroTitle,
    heroSubtitle,
    highlight1,
    highlight2,
    priceFrom,
    bgMode,
    bgColorTop,
    bgColorBottom,
    bgPattern,
    bgImageUrl,
    address,
    aboutTitle,
    aboutDescription,
    customBoxes,
    promotionalSpaces, // 🆕 Espacios promocionales/anuncios
  } = req.body;

  // ✅ Solo validar nombre si se está actualizando (no para promotionalSpaces únicamente)
  if (name !== undefined && !name) {
    return res.status(400).json({ message: "El nombre es obligatorio" });
  }

  console.log('📥 Backend recibió campos personalizados:', {
    aboutTitle,
    aboutDescription,
    address,
    customBoxes: customBoxes ? customBoxes.length : 0,
    promotionalSpaces: promotionalSpaces ? 'recibido' : 'no recibido'
  });

  const userId = req.user.id;

  try {
    // 🆕 Si solo se envían espacios promocionales, hacer actualización parcial
    if (promotionalSpaces && Object.keys(req.body).length === 1) {
      console.log('📢 Actualización solo de espacios promocionales:', JSON.stringify(promotionalSpaces, null, 2));
      
      const store = await Store.findOneAndUpdate(
        { _id: id, $or: [{ owner: userId }, { user: userId }] },
        { promotionalSpaces: promotionalSpaces },
        { new: true }
      );

      if (!store) return res.status(404).json({ message: "Tienda no encontrada" });
      return res.status(200).json(store);
    }

    // 🔄 Actualización completa con todos los campos
    const baseUpdate = {
      name,
      description,
      logoUrl,
      coverImageUrl: coverImageUrl || "",
      comuna,
      tipoNegocio,
      lat,
      lng,
      direccion,
      email: email || "",
      phone: phone || "",
      whatsapp: whatsapp || "",
      website: website || "",
      scheduleText: scheduleText || "",
      address: address || "",
      aboutTitle: aboutTitle || "Quiénes Somos",
      aboutDescription: aboutDescription || "",
      customBoxes: customBoxes || [],
      isActive: true,
      owner: userId,
      user: userId,
      primaryColor: primaryColor || "#2563eb",
      accentColor: accentColor || "#0f172a",
      heroTitle: heroTitle || "",
      heroSubtitle: heroSubtitle || "",
      highlight1: highlight1 || "",
      highlight2: highlight2 || "",
      priceFrom: priceFrom || "",
      bgMode: ["solid", "gradient", "image"].includes(bgMode) ? bgMode : "gradient",
      bgColorTop: bgColorTop || "#e8d7ff",
      bgColorBottom: bgColorBottom || "#ffffff",
      bgPattern: ["none", "dots", "grid", "noise"].includes(bgPattern) ? bgPattern : "none",
      bgImageUrl: bgImageUrl || "",
    };

    // 🆕 Agregar espacios promocionales si se envían
    if (promotionalSpaces) {
      console.log('📢 Guardando espacios promocionales:', JSON.stringify(promotionalSpaces, null, 2));
      baseUpdate.promotionalSpaces = promotionalSpaces;
    }

    // Solo actualizar el modo si se proporciona explícitamente
    if (mode !== undefined) {
      baseUpdate.mode = mode === "bookings" ? "bookings" : "products";
    }

    const store = await Store.findOneAndUpdate(
      { _id: id, $or: [{ owner: userId }, { user: userId }] },
      baseUpdate,
      { new: true }
    );

    if (!store) return res.status(404).json({ message: "Tienda no encontrada" });
    return res.status(200).json(store);
  } catch (err) {
    console.error("Error al actualizar tienda:", err);
    return res.status(500).json({ message: "Error al actualizar la tienda" });
  }
};

export const deleteMyStore = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  try {
    const { store, error } = await findStoreForOwner(id, userId);
    if (error) return res.status(error.status).json({ message: error.message });

    await Product.deleteMany({ store: store._id });
    await Booking.deleteMany({ store: store._id });
    await Order.deleteMany({ store: store._id });
    await Store.deleteOne({ _id: store._id });

    return res.json({ success: true, message: "Tienda eliminada correctamente" });
  } catch (err) {
    console.error("Error al eliminar tienda:", err);
    return res.status(500).json({ message: "Error al eliminar la tienda" });
  }
};

/* =============== PUBLIC / EDIT: GET STORE BY ID =============== */

export const getStoreById = async (req, res) => {
  try {
    const { id } = req.params;
    const store = await Store.findById(id)
      .populate("owner", "username avatarUrl email")
      .lean();

    if (!store) return res.status(404).json({ message: "Tienda no encontrada" });

    res.json({
      _id: store._id,
      name: store.name,
      description: store.description,
      logoUrl: store.logoUrl,
      comuna: store.comuna,
      tipoNegocio: store.tipoNegocio,
      mode: store.mode,
      bookingAvailability: store.bookingAvailability || [],
      direccion: store.direccion,
      lat: store.lat,
      lng: store.lng,
      primaryColor: store.primaryColor || "#2563eb",
      accentColor: store.accentColor || "#0f172a",
      heroTitle: store.heroTitle || "",
      heroSubtitle: store.heroSubtitle || "",
      highlight1: store.highlight1 || "",
      highlight2: store.highlight2 || "",
      priceFrom: store.priceFrom || "",
      scheduleText: store.scheduleText || "",
      address: store.address || "",
      aboutTitle: store.aboutTitle || "Quiénes Somos",
      aboutDescription: store.aboutDescription || "",
      customBoxes: store.customBoxes || [],
      // nuevos campos de personalización
      bgMode: store.bgMode || "gradient",
      bgColorTop: store.bgColorTop || "#e8d7ff",
      bgColorBottom: store.bgColorBottom || "#ffffff",
      bgPattern: store.bgPattern || "none",
      bgImageUrl: store.bgImageUrl || "",
      plan: store.plan || "free", // 🆕 Plan de suscripción
      planExpiresAt: store.planExpiresAt || null, // 🆕 Fecha de expiración
      promotionalSpaces: store.promotionalSpaces || {}, // 🆕 Espacios publicitarios
      owner: store.owner ? {
        _id: store.owner._id,
        username: store.owner.username,
        avatarUrl: store.owner.avatarUrl,
        email: store.owner.email
      } : null,
      ownerName: store.owner?.username || null,
      ownerAvatar: store.owner?.avatarUrl || null,
      ownerEmail: store.owner?.email || null,
      createdAt: store.createdAt,
      updatedAt: store.updatedAt,
    });
  } catch (err) {
    console.error("Error al obtener tienda:", err);
    res.status(500).json({ message: "Error al obtener la tienda" });
  }
};

/* =============== BOOKINGS / AVAILABILITY =============== */

/**
 * GET /api/stores/:id/availability
 * Obtiene la disponibilidad horaria de una tienda (público y owner)
 */
export const getStoreAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const store = await Store.findById(id).lean();
    
    if (!store) {
      return res.status(404).json({ message: "Tienda no encontrada" });
    }
    
    if (store.mode !== "bookings") {
      return res.status(400).json({ message: "Esta tienda no permite agendar citas" });
    }

    // Migrar formato antiguo si es necesario
    let availability = store.bookingAvailability || [];
    if (availability.length > 0 && !availability[0].timeBlocks) {
      availability = migrateOldFormat(availability);
    }

    res.json({ availability });
  } catch (err) {
    console.error("Error obteniendo disponibilidad:", err);
    res.status(500).json({ message: "Error al obtener la disponibilidad" });
  }
};

/**
 * PUT /api/stores/:id/availability
 * Actualiza toda la disponibilidad de la tienda (solo owner)
 */
export const updateStoreAvailability = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const { store, error } = await findStoreForOwner(id, userId);
    if (error) return res.status(error.status).json({ message: error.message });

    if (store.mode !== "bookings") {
      return res.status(400).json({ message: "Esta tienda no es de agendamiento" });
    }

    const normalized = normalizeAvailability(req.body?.availability);
    
    // 🆕 La normalización ya limpia traslapes automáticamente
    // No necesitamos validar porque se fusionan los bloques traslapados

    store.bookingAvailability = normalized;
    await store.save();

    res.json({ 
      message: "Disponibilidad actualizada correctamente",
      availability: store.bookingAvailability 
    });
  } catch (err) {
    console.error("Error al actualizar disponibilidad:", err);
    res.status(500).json({ message: "Error al actualizar la disponibilidad" });
  }
};

/**
 * PUT /api/stores/:id/availability/:day
 * Actualiza la disponibilidad de un día específico (solo owner)
 */
export const updateDayAvailability = async (req, res) => {
  const { id, day } = req.params;
  const userId = req.user.id;

  try {
    const { store, error } = await findStoreForOwner(id, userId);
    if (error) return res.status(error.status).json({ message: error.message });

    if (store.mode !== "bookings") {
      return res.status(400).json({ message: "Esta tienda no es de agendamiento" });
    }

    const validDays = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
    if (!validDays.includes(day)) {
      return res.status(400).json({ message: "Día inválido" });
    }

    const { isClosed, timeBlocks, slots } = req.body;
    
    // Validar timeBlocks si no está cerrado
    if (!isClosed && timeBlocks && Array.isArray(timeBlocks)) {
      for (const block of timeBlocks) {
        const errors = validateTimeBlock(block);
        if (errors.length > 0) {
          return res.status(400).json({
            message: "Bloque horario inválido",
            errors,
          });
        }
      }
      
      const overlaps = detectOverlaps(timeBlocks);
      if (overlaps.length > 0) {
        return res.status(400).json({
          message: "Los bloques horarios se traslapan",
          overlaps,
        });
      }
    }

    // Actualizar o crear entrada para el día
    const availability = store.bookingAvailability || [];
    const dayIndex = availability.findIndex(e => e.dayOfWeek === day);
    
    const dayEntry = {
      dayOfWeek: day,
      isClosed: !!isClosed,
      timeBlocks: !isClosed && timeBlocks ? timeBlocks : [],
      slots: slots || [],
    };

    if (dayIndex >= 0) {
      availability[dayIndex] = dayEntry;
    } else {
      availability.push(dayEntry);
    }

    store.bookingAvailability = normalizeAvailability(availability);
    await store.save();

    res.json({
      message: `Disponibilidad de ${day} actualizada`,
      dayAvailability: store.bookingAvailability.find(e => e.dayOfWeek === day),
    });
  } catch (err) {
    console.error("Error al actualizar día:", err);
    res.status(500).json({ message: "Error al actualizar el día" });
  }
};

/**
 * DELETE /api/stores/:id/availability/:day
 * Elimina la disponibilidad de un día completo (solo owner)
 */
export const deleteDayAvailability = async (req, res) => {
  const { id, day } = req.params;
  const userId = req.user.id;

  try {
    const { store, error } = await findStoreForOwner(id, userId);
    if (error) return res.status(error.status).json({ message: error.message });

    const availability = store.bookingAvailability || [];
    store.bookingAvailability = availability.filter(e => e.dayOfWeek !== day);
    await store.save();

    res.json({
      message: `Disponibilidad de ${day} eliminada`,
      availability: store.bookingAvailability,
    });
  } catch (err) {
    console.error("Error al eliminar día:", err);
    res.status(500).json({ message: "Error al eliminar el día" });
  }
};

/**
 * POST /api/stores/:id/availability/:day/copy
 * Copia la disponibilidad de un día a otros días (solo owner)
 */
export const copyDayAvailability = async (req, res) => {
  const { id, day } = req.params;
  const { targetDays } = req.body; // array de días destino
  const userId = req.user.id;

  try {
    const { store, error } = await findStoreForOwner(id, userId);
    if (error) return res.status(error.status).json({ message: error.message });

    if (!Array.isArray(targetDays) || targetDays.length === 0) {
      return res.status(400).json({ message: "Debes especificar días destino" });
    }

    const availability = store.bookingAvailability || [];
    const sourceDay = availability.find(e => e.dayOfWeek === day);
    
    if (!sourceDay) {
      return res.status(404).json({ message: `No hay configuración para ${day}` });
    }

    // Copiar a cada día destino
    for (const targetDay of targetDays) {
      const targetIndex = availability.findIndex(e => e.dayOfWeek === targetDay);
      const copied = {
        ...sourceDay,
        dayOfWeek: targetDay,
      };
      
      if (targetIndex >= 0) {
        availability[targetIndex] = copied;
      } else {
        availability.push(copied);
      }
    }

    store.bookingAvailability = normalizeAvailability(availability);
    await store.save();

    res.json({
      message: `Horario de ${day} copiado a ${targetDays.length} día(s)`,
      availability: store.bookingAvailability,
    });
  } catch (err) {
    console.error("Error al copiar día:", err);
    res.status(500).json({ message: "Error al copiar el horario" });
  }
};

/* =============== APPOINTMENTS / BOOKINGS =============== */

export const listStoreAppointments = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const { store, error } = await findStoreForOwner(id, userId);
    if (error) return res.status(error.status).json({ message: error.message });

    if (store.mode !== "bookings")
      return res.status(400).json({ message: "Esta tienda no es de agendamiento" });

    const bookings = await Booking.find({ store: store._id })
      .sort({ date: 1, slot: 1 })
      .lean();

    res.json(
      bookings.map((booking) => ({
        _id: booking._id,
        customerName: booking.customerName,
        customerEmail: booking.customerEmail,
        customerPhone: booking.customerPhone,
        date: booking.date,
        slot: booking.slot,
        status: booking.status,
        notes: booking.notes,
        createdAt: booking.createdAt,
      }))
    );
  } catch (err) {
    console.error("Error al listar reservas:", err);
    res.status(500).json({ message: "Error al obtener las reservas" });
  }
};

// NOTA: createAppointment ahora está al final del archivo (versión mejorada con soporte de serviceId)

export const updateAppointmentStatus = async (req, res) => {
  const { id, bookingId } = req.params;
  const userId = req.user.id;
  const { status } = req.body;

  try {
    const { store, error } = await findStoreForOwner(id, userId);
    if (error) return res.status(error.status).json({ message: error.message });

    if (store.mode !== "bookings")
      return res.status(400).json({ message: "Esta tienda no es de agendamiento" });

    const allowed = ["pending", "confirmed", "cancelled"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: "Estado inválido. Usa: pending, confirmed o cancelled" });
    }

    const booking = await Booking.findOne({ _id: bookingId, store: store._id });
    if (!booking) return res.status(404).json({ message: "Reserva no encontrada" });

    booking.status = status;
    await booking.save();

    return res.json({
      _id: booking._id,
      customerName: booking.customerName,
      customerEmail: booking.customerEmail,
      customerPhone: booking.customerPhone,
      date: booking.date,
      slot: booking.slot,
      status: booking.status,
      notes: booking.notes,
      createdAt: booking.createdAt,
    });
  } catch (err) {
    console.error("Error al actualizar estado de reserva:", err);
    return res.status(500).json({ message: "Error al actualizar el estado de la reserva" });
  }
};

// 🆕 Eliminar una cita
export const deleteAppointment = async (req, res) => {
  const { id, bookingId } = req.params;
  const userId = req.user.id;

  try {
    const { store, error } = await findStoreForOwner(id, userId);
    if (error) return res.status(error.status).json({ message: error.message });

    if (store.mode !== "bookings")
      return res.status(400).json({ message: "Esta tienda no es de agendamiento" });

    const booking = await Booking.findOne({ _id: bookingId, store: store._id });
    if (!booking) return res.status(404).json({ message: "Reserva no encontrada" });

    await Booking.deleteOne({ _id: bookingId });

    console.log(`🗑️ Reserva eliminada: ${bookingId}`);

    return res.json({ message: "Reserva eliminada correctamente" });
  } catch (err) {
    console.error("Error al eliminar reserva:", err);
    return res.status(500).json({ message: "Error al eliminar la reserva" });
  }
};

// 🆕 Obtener reservas del cliente por email
export const getCustomerBookings = async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ message: "Email requerido" });
    }

    const bookings = await Booking.find({ 
      customerEmail: email
    })
      .populate('store', 'name logoUrl category phone address')
      .populate('service', 'name duration price')
      .select('+unreadMessagesCustomer +unreadMessagesOwner +lastMessageAt')
      .sort({ date: -1, slot: -1 })
      .limit(100);

    return res.json(bookings);
  } catch (err) {
    console.error("Error al obtener reservas del cliente:", err);
    return res.status(500).json({ message: "Error al obtener las reservas" });
  }
};

// 🆕 Obtener órdenes/compras del cliente por email
export const getCustomerOrders = async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ message: "Email requerido" });
    }

    const orders = await Order.find({ 
      customerEmail: email
    })
      .populate('store', 'name logoUrl category phone address')
      .populate('items.product', 'name imageUrl')
      .select('+unreadMessagesCustomer +unreadMessagesOwner +lastMessageAt')
      .sort({ createdAt: -1 })
      .limit(100);

    return res.json(orders);
  } catch (err) {
    console.error("Error al obtener órdenes del cliente:", err);
    return res.status(500).json({ message: "Error al obtener las órdenes" });
  }
};

/* =============== PRODUCTS =============== */

// Catálogo público (robusto contra distintos campos)
export const listStoreProductsPublic = async (req, res) => {
  try {
    const { id } = req.params;

    const products = await Product.find({
      $and: [
        { $or: [{ store: id }, { storeId: id }] },
        { $or: [{ isActive: { $ne: false } }, { active: true }] },
        { isDeleted: { $ne: true } },
      ],
    })
      .sort({ createdAt: 1 })
      .lean();

    return res.json(products);
  } catch (err) {
    console.error("Error al listar productos públicos:", err);
    return res
      .status(500)
      .json({ message: "No se pudo cargar el catálogo de productos." });
  }
};

// Catálogo público simple (lo usa tu StorePublic.jsx)
export const listStoreProducts = async (req, res) => {
  try {
    const { id } = req.params;
    const products = await Product.find({ store: id, isActive: { $ne: false } })
      .select("name description price imageUrl images")
      .lean();

    return res.json(
      (products || []).map((p) => ({
        _id: p._id,
        name: p.name,
        description: p.description,
        price: p.price,
        imageUrl: p.imageUrl || p.images?.[0] || "",
      }))
    );
  } catch (error) {
    console.error("Error al listar productos públicos", error);
    return res.status(500).json({ message: "No se pudo cargar el catálogo de productos" });
  }
};

export const listStoreProductsForOwner = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  console.log("📋 listStoreProductsForOwner - Iniciando");
  console.log("🏪 Store ID:", id);
  console.log("👤 User ID:", userId);

  try {
    const { store, error } = await findStoreForOwner(id, userId);
    if (error) {
      console.log("❌ Error al buscar tienda:", error);
      return res.status(error.status).json({ message: error.message });
    }

    console.log("✅ Tienda encontrada:", store._id);
    console.log("🏪 Modo de tienda:", store.mode);

    if (store.mode !== "products") {
      console.log("❌ Tienda no es de tipo 'products', es:", store.mode);
      return res.status(400).json({ message: "Esta tienda no vende productos" });
    }

    const products = await Product.find({ store: store._id })
      .sort({ createdAt: -1 })
      .lean();

    console.log("✅ Productos encontrados:", products.length);

    res.json(products.map(mapProductResponse));
  } catch (err) {
    console.error("❌ Error al listar productos (dueño):", err);
    res.status(500).json({ message: "Error al obtener los productos" });
  }
};

export const createStoreProduct = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  console.log("🛒 createStoreProduct - Iniciando");
  console.log("📋 Store ID:", id);
  console.log("👤 User ID:", userId);
  console.log("📦 Request body:", req.body);

  try {
    const { store, error } = await findStoreForOwner(id, userId);
    if (error) {
      console.log("❌ Error al buscar tienda:", error);
      return res.status(error.status).json({ message: error.message });
    }

    console.log("✅ Tienda encontrada:", store._id);
    console.log("🏪 Modo de tienda:", store.mode);

    if (store.mode !== "products") {
      console.log("❌ Tienda no es de tipo 'products'");
      return res.status(400).json({ message: "Esta tienda no vende productos" });
    }

    const { name, description, price, images, isActive, stock, category, tags, discount } = req.body || {};

    if (!name || typeof price === "undefined") {
      console.log("❌ Faltan campos obligatorios: name o price");
      return res.status(400).json({ message: "Nombre y precio del producto son obligatorios" });
    }

    const numericPrice = Number(price);
    if (Number.isNaN(numericPrice) || numericPrice < 0) {
      console.log("❌ Precio inválido:", price);
      return res.status(400).json({ message: "El precio debe ser un número válido" });
    }

    console.log("✅ Creando producto en base de datos...");

    const product = await Product.create({
      store: store._id,
      name,
      description: description || "",
      price: numericPrice,
      images: parseImages(images),
      isActive: typeof isActive === "boolean" ? isActive : true,
      stock: typeof stock === "number" ? stock : 0,
      category: category || "",
      tags: Array.isArray(tags) ? tags : [],
      discount: typeof discount === "number" ? Math.max(0, Math.min(100, discount)) : 0,
    });

    console.log("✅ Producto creado exitosamente:", product._id);

    res.status(201).json(mapProductResponse(product));
  } catch (err) {
    console.error("❌ Error al crear producto:", err);
    res.status(500).json({ message: "Error al crear el producto" });
  }
};

export const updateStoreProduct = async (req, res) => {
  const { id, productId } = req.params;
  const userId = req.user.id;

  try {
    const { store, error } = await findStoreForOwner(id, userId);
    if (error) return res.status(error.status).json({ message: error.message });

    if (store.mode !== "products")
      return res.status(400).json({ message: "Esta tienda no vende productos" });

    const { name, description, price, images, isActive, stock, category, tags, discount } = req.body || {};

    const update = {};
    
    if (typeof name !== "undefined") update.name = name;
    if (typeof description !== "undefined") update.description = description;
    if (typeof price !== "undefined") {
      const numericPrice = Number(price);
      if (Number.isNaN(numericPrice) || numericPrice < 0) {
        return res.status(400).json({ message: "El precio debe ser un número válido" });
      }
      update.price = numericPrice;
    }
    if (typeof images !== "undefined") update.images = parseImages(images);
    if (typeof isActive !== "undefined") update.isActive = Boolean(isActive);
    if (typeof stock !== "undefined") {
      const numericStock = Number(stock);
      if (Number.isNaN(numericStock) || numericStock < 0) {
        return res.status(400).json({ message: "El stock debe ser válido" });
      }
      update.stock = numericStock;
    }
    if (typeof category !== "undefined") update.category = category || "";
    if (typeof tags !== "undefined") update.tags = Array.isArray(tags) ? tags : [];
    if (typeof discount !== "undefined") {
      const numericDiscount = Number(discount);
      if (!Number.isNaN(numericDiscount)) {
        update.discount = Math.max(0, Math.min(100, numericDiscount));
      }
    }


    const product = await Product.findOneAndUpdate(
      { _id: productId, store: store._id },
      update,
      { new: true }
    ).lean();

    if (!product) return res.status(404).json({ message: "Producto no encontrado" });
    res.json(mapProductResponse(product));
  } catch (err) {
    console.error("Error al actualizar producto:", err);
    res.status(500).json({ message: "Error al actualizar el producto" });
  }
};

export const deleteStoreProduct = async (req, res) => {
  const { id, productId } = req.params;
  const userId = req.user.id;

  try {
    const { store, error } = await findStoreForOwner(id, userId);
    if (error) return res.status(error.status).json({ message: error.message });

    if (store.mode !== "products")
      return res.status(400).json({ message: "Esta tienda no vende productos" });

    const deleted = await Product.findOneAndDelete({ _id: productId, store: store._id });
    if (!deleted) return res.status(404).json({ message: "Producto no encontrado" });

    res.json({ success: true });
  } catch (err) {
    console.error("Error al eliminar producto:", err);
    res.status(500).json({ message: "Error al eliminar el producto" });
  }
};

/* =============== ORDERS =============== */

export const listStoreOrders = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const { store, error } = await findStoreForOwner(id, userId);
    if (error) return res.status(error.status).json({ message: error.message });

    if (store.mode !== "products")
      return res.status(400).json({ message: "Esta tienda no vende productos" });

    const orders = await Order.find({ store: store._id })
      .select('+unreadMessagesOwner +unreadMessagesCustomer +lastMessageAt')
      .sort({ createdAt: -1 })
      .lean();

    res.json(
      orders.map((order) => ({
        _id: order._id,
        items: order.items,
        total: order.total,
        status: order.status,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        customerPhone: order.customerPhone,
        customerAddress: order.customerAddress,
        notes: order.notes,
        createdAt: order.createdAt,
        unreadMessagesOwner: order.unreadMessagesOwner || 0,
        unreadMessagesCustomer: order.unreadMessagesCustomer || 0,
        lastMessageAt: order.lastMessageAt,
      }))
    );
  } catch (err) {
    console.error("Error al obtener pedidos:", err);
    res.status(500).json({ message: "Error al obtener los pedidos" });
  }
};

export const createStoreOrder = async (req, res) => {
  const { id } = req.params;

  try {
    const store = await Store.findById(id).lean();
    if (!store) return res.status(404).json({ message: "Tienda no encontrada" });

    if (store.mode !== "products")
      return res.status(400).json({ message: "Esta tienda no vende productos" });

    const {
      items,
      customerName,
      customerEmail,
      customerPhone,
      customerAddress,
      notes,
    } = req.body || {};

    if (!customerName) return res.status(400).json({ message: "El nombre del cliente es obligatorio" });
    if (!Array.isArray(items) || items.length === 0)
      return res.status(400).json({ message: "Debes seleccionar al menos un producto" });

    const cleanedItems = items
      .map((item) => ({
        productId: item?.productId || item?.product,
        quantity: Math.max(1, Math.floor(Number(item?.quantity) || 0)),
      }))
      .filter((item) => item.productId && item.quantity > 0);

    if (cleanedItems.length === 0) {
      return res.status(400).json({ message: "Los productos seleccionados no son válidos" });
    }

    const productIds = cleanedItems.map((i) => i.productId);
    const products = await Product.find({
      _id: { $in: productIds },
      store: store._id,
      isActive: true,
    }).lean();

    if (products.length !== cleanedItems.length) {
      return res.status(400).json({ message: "Uno o más productos ya no están disponibles" });
    }

    const orderItems = cleanedItems.map((item) => {
      const product = products.find((p) => p._id.toString() === item.productId.toString());
      const quantity = item.quantity;
      const unitPrice = product.price;
      const subtotal = Math.round(unitPrice * quantity * 100) / 100;
      return {
        product: product._id,
        productName: product.name,
        unitPrice,
        quantity,
        subtotal,
      };
    });

    const total = orderItems.reduce((sum, item) => sum + item.subtotal, 0);

    const order = await Order.create({
      store: store._id,
      items: orderItems,
      total,
      customerName,
      customerEmail: customerEmail || "",
      customerPhone: customerPhone || "",
      customerAddress: customerAddress || "",
      notes: notes || "",
    });

    res.status(201).json({
      _id: order._id,
      items: order.items,
      total: order.total,
      status: order.status,
      customerName: order.customerName,
    });
  } catch (err) {
    console.error("Error al crear pedido:", err);
    res.status(500).json({ message: "Error al crear el pedido" });
  }
};

// 🆕 Actualizar estado de pedido
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    const userId = req.user.id;

    // Validar estado
    const validStatuses = ["pending", "confirmed", "fulfilled", "cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Estado inválido" });
    }

    // Buscar el pedido
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Pedido no encontrado" });
    }

    // Verificar que el usuario es dueño de la tienda
    const store = await Store.findById(order.store);
    if (!store) {
      return res.status(404).json({ message: "Tienda no encontrada" });
    }

    if (store.owner.toString() !== userId && store.user.toString() !== userId) {
      return res.status(403).json({ message: "No tienes permiso para actualizar este pedido" });
    }

    // Actualizar estado
    order.status = status;
    await order.save();

    res.json({
      _id: order._id,
      status: order.status,
      message: "Estado actualizado correctamente"
    });
  } catch (err) {
    console.error("Error actualizando estado del pedido:", err);
    res.status(500).json({ message: "Error al actualizar el estado" });
  }
};

// =================== NUEVOS ENDPOINTS: SPECIAL DAYS ===================

/**
 * GET /api/stores/:id/special-days
 * Obtener días especiales de una tienda (público)
 */
export const getSpecialDays = async (req, res) => {
  try {
    const { id } = req.params;
    const store = await Store.findById(id);
    
    if (!store) {
      return res.status(404).json({ message: "Tienda no encontrada" });
    }

    const specialDays = normalizeSpecialDays(store.specialDays || []);
    return res.json(specialDays);
  } catch (error) {
    console.error("❌ Error al obtener special days:", error);
    return res.status(500).json({ message: "Error al obtener días especiales" });
  }
};

/**
 * POST /api/stores/:id/special-days
 * Crear o actualizar un día especial (auth)
 */
export const upsertSpecialDay = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { date, isClosed, reason, timeBlocks } = req.body;

    const { store, error } = await findStoreForOwner(id, userId);
    if (error) return res.status(error.status).json({ message: error.message });

    // Validar fecha
    const normalizedDate = normalizeDateOnly(date);
    if (!normalizedDate) {
      return res.status(400).json({ message: "Fecha inválida" });
    }

    // Validar timeBlocks si no está cerrado
    if (!isClosed && Array.isArray(timeBlocks)) {
      for (const block of timeBlocks) {
        const errors = validateTimeBlock(block);
        if (errors.length > 0) {
          return res.status(400).json({ 
            message: "Bloque horario inválido", 
            errors 
          });
        }
      }

      const overlaps = detectOverlaps(timeBlocks);
      if (overlaps.length > 0) {
        return res.status(400).json({
          message: "Se detectaron traslapes entre bloques",
          overlaps,
        });
      }
    }

    // Buscar si ya existe un specialDay para esa fecha
    const specialDays = store.specialDays || [];
    const existingIndex = specialDays.findIndex(sd => {
      const sdDate = normalizeDateOnly(sd.date);
      return sdDate && sdDate.getTime() === normalizedDate.getTime();
    });

    const newSpecialDay = {
      date: normalizedDate,
      isClosed: !!isClosed,
      reason: (reason || "").trim(),
      timeBlocks: !isClosed && Array.isArray(timeBlocks) ? timeBlocks : [],
    };

    if (existingIndex >= 0) {
      // Actualizar existente
      specialDays[existingIndex] = newSpecialDay;
    } else {
      // Crear nuevo
      specialDays.push(newSpecialDay);
    }

    store.specialDays = specialDays;
    await store.save();

    return res.json({
      message: "Día especial guardado",
      specialDay: newSpecialDay,
    });
  } catch (error) {
    console.error("❌ Error al guardar special day:", error);
    return res.status(500).json({ message: "Error al guardar día especial" });
  }
};

/**
 * DELETE /api/stores/:id/special-days/:date
 * Eliminar un día especial (auth)
 */
export const deleteSpecialDay = async (req, res) => {
  try {
    const { id, date } = req.params;
    const userId = req.user.id;

    const { store, error } = await findStoreForOwner(id, userId);
    if (error) return res.status(error.status).json({ message: error.message });

    const normalizedDate = normalizeDateOnly(date);
    if (!normalizedDate) {
      return res.status(400).json({ message: "Fecha inválida" });
    }

    const specialDays = store.specialDays || [];
    store.specialDays = specialDays.filter(sd => {
      const sdDate = normalizeDateOnly(sd.date);
      return !sdDate || sdDate.getTime() !== normalizedDate.getTime();
    });

    await store.save();

    return res.json({
      message: "Día especial eliminado",
    });
  } catch (error) {
    console.error("❌ Error al eliminar special day:", error);
    return res.status(500).json({ message: "Error al eliminar día especial" });
  }
};

// =================== NUEVO ENDPOINT: AVAILABILITY POR FECHA ===================

/**
 * GET /api/stores/:id/availability/date/:date
 * Obtener disponibilidad para una fecha específica (público)
 * Considera specialDays y bookings existentes
 * Query params: serviceId (opcional) - para considerar duración del servicio
 */
export const getAvailabilityByDate = async (req, res) => {
  try {
    const { id, date } = req.params;
    const { serviceId } = req.query;

    console.log("📅 getAvailabilityByDate llamado:", { storeId: id, date, serviceId });

    const store = await Store.findById(id);
    if (!store) {
      console.log("❌ Tienda no encontrada:", id);
      return res.status(404).json({ message: "Tienda no encontrada" });
    }

    const targetDate = normalizeDateOnly(date);
    if (!targetDate) {
      console.log("❌ Fecha inválida:", date);
      return res.status(400).json({ message: "Fecha inválida" });
    }

    console.log("✅ Fecha normalizada:", targetDate.toISOString());

    // Obtener duración del servicio si se especifica
    let serviceDuration = 30; // default
    let serviceData = null;

    if (serviceId) {
      const service = await Service.findOne({ _id: serviceId, store: id, isActive: true });
      if (service) {
        serviceDuration = service.duration;
        serviceData = {
          _id: service._id,
          name: service.name,
          duration: service.duration,
          price: service.price,
        };
        console.log("🛎️ Servicio encontrado:", serviceData);
      } else {
        console.log("⚠️ Servicio no encontrado o inactivo:", serviceId);
      }
    }

    console.log("📊 bookingAvailability:", store.bookingAvailability?.length || 0, "días");
    console.log("📊 specialDays:", store.specialDays?.length || 0, "días");

    // Obtener availability para la fecha
    const availability = getAvailabilityForDate(
      targetDate,
      store.bookingAvailability || [],
      store.specialDays || []
    );

    console.log("📋 Availability obtenida:", availability);

    if (availability.isClosed) {
      console.log("🚫 Día cerrado:", availability.reason);
      return res.json({
        date: targetDate,
        isClosed: true,
        reason: availability.reason,
        availableSlots: [],
        service: serviceData,
      });
    }

    // Obtener bookings existentes para esa fecha
    const startOfDay = new Date(targetDate);
    startOfDay.setUTCHours(0, 0, 0, 0);
    
    const endOfDay = new Date(targetDate);
    endOfDay.setUTCHours(23, 59, 59, 999);

    const existingBookings = await Booking.find({
      store: id,
      date: { $gte: startOfDay, $lte: endOfDay },
      status: { $ne: "cancelled" },
    }).select("slot duration");

    console.log("📅 Bookings existentes:", existingBookings.length);

    // Calcular slots disponibles
    const availableSlots = getAvailableSlotsForDate(
      targetDate,
      store.bookingAvailability || [],
      store.specialDays || [],
      existingBookings,
      serviceDuration
    );

    console.log("✅ Slots disponibles calculados:", availableSlots.length, availableSlots);

    return res.json({
      date: targetDate,
      isClosed: false,
      reason: availability.reason,
      isSpecialDay: availability.isSpecialDay,
      timeBlocks: availability.timeBlocks,
      availableSlots,
      bookedSlots: existingBookings.map(b => b.slot),
      service: serviceData,
    });
  } catch (error) {
    console.error("❌ Error al obtener availability por fecha:", error);
    return res.status(500).json({ message: "Error al obtener disponibilidad" });
  }
};

// =================== NUEVO ENDPOINT: CREAR BOOKING CON SERVICIO ===================

/**
 * POST /api/stores/:id/appointments
 * Crear una cita/booking (público)
 * Ahora soporta serviceId
 */
export const createAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { serviceId, date, slot, customerName, customerEmail, customerPhone, notes } = req.body;

    // Validaciones básicas
    if (!customerName || !date || !slot) {
      return res.status(400).json({ 
        message: "Faltan campos requeridos: customerName, date, slot" 
      });
    }

    // Validar email (obligatorio para chat)
    if (!customerEmail || !customerEmail.trim()) {
      return res.status(400).json({ 
        message: "El email es requerido para crear la reserva y poder usar el chat" 
      });
    }

    // Verificar tienda
    const store = await Store.findById(id);
    if (!store) {
      return res.status(404).json({ message: "Tienda no encontrada" });
    }

    // Validar servicio si se especifica
    let service = null;
    let duration = 30;
    let price = 0;

    if (serviceId) {
      service = await Service.findOne({ _id: serviceId, store: id, isActive: true });
      if (!service) {
        return res.status(404).json({ message: "Servicio no encontrado o inactivo" });
      }
      duration = service.duration;
      price = service.price;
    }

    // Normalizar fecha
    const normalizedDate = normalizeDateOnly(date);
    if (!normalizedDate) {
      return res.status(400).json({ message: "Fecha inválida" });
    }

    // Verificar si el slot está disponible
    const startOfDay = new Date(normalizedDate);
    startOfDay.setUTCHours(0, 0, 0, 0);
    
    const endOfDay = new Date(normalizedDate);
    endOfDay.setUTCHours(23, 59, 59, 999);

    const existingBooking = await Booking.findOne({
      store: id,
      date: { $gte: startOfDay, $lte: endOfDay },
      slot,
      status: { $ne: "cancelled" },
    });

    if (existingBooking) {
      return res.status(409).json({ 
        message: "Este horario ya está reservado" 
      });
    }

    // Crear booking
    const booking = new Booking({
      store: id,
      service: service?._id || null,
      date: normalizedDate,
      slot,
      duration,
      price,
      customerName: customerName.trim(),
      customerEmail: customerEmail?.trim() || "",
      customerPhone: customerPhone?.trim() || "",
      notes: notes?.trim() || "",
      status: "pending",
    });

    await booking.save();

    // Popular servicio si existe
    await booking.populate("service", "name duration price");

    return res.status(201).json(booking);
  } catch (error) {
    console.error("❌ Error al crear appointment:", error);
    
    if (error.code === 11000) {
      return res.status(409).json({ 
        message: "Este horario ya está reservado" 
      });
    }

    return res.status(500).json({ message: "Error al crear la cita" });
  }
};

/**
 * 🔔 Obtener notificaciones de una tienda
 * - Nuevas reservas (últimas 24h)
 * - Nuevos pedidos (últimas 24h)
 * - Mensajes sin leer
 * - Cancelaciones recientes (últimas 24h)
 */
export const getStoreNotifications = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    // Verificar que el usuario es dueño de la tienda
    const verification = await findStoreForOwner(id, userId);
    if (verification.error) {
      return res.status(verification.error.status).json({
        message: verification.error.message,
      });
    }

    const store = verification.store;
    const notifications = [];

    // Mostrar eventos sin importar la fecha (para que siempre haya notificaciones visibles)
    const showAll = true;
    const timeFilter = showAll ? {} : { createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } };

    // 1. Reservas recientes (todas si showAll=true, sino últimos 7 días)
    if (store.mode === 'services' || store.mode === 'both' || store.mode === 'bookings') {
      const newBookings = await Booking.find({
        store: id,
        ...timeFilter,
        status: { $ne: 'cancelled' }
      })
      .populate('service', 'name')
      .sort({ createdAt: -1 })
      .limit(10) // Máximo 10 reservas
      .lean();

      if (newBookings && newBookings.length > 0) {
        newBookings.forEach(booking => {
        notifications.push({
          id: `new-booking-${booking._id}`,
          type: 'new_booking',
          itemType: 'booking',
          bookingId: booking._id,
          storeId: store._id,
          storeName: store.name,
          title: '📅 Nueva reserva',
          message: `${booking.customerName} reservó ${booking.serviceName || booking.service?.name || 'un servicio'}`,
          details: `${new Date(booking.date).toLocaleDateString('es-CL')} - ${booking.slot}`,
          timestamp: booking.createdAt,
          priority: 'high',
          read: false
        });
        });
      }
    }

    // 2. Pedidos recientes (todos si showAll=true, sino últimos 7 días)
    if (store.mode === 'products' || store.mode === 'both') {
      const newOrders = await Order.find({
        store: id,
        ...timeFilter,
        status: { $ne: 'cancelled' }
      })
      .sort({ createdAt: -1 })
      .limit(10) // Máximo 10 pedidos
      .lean();

      if (newOrders && newOrders.length > 0) {
        newOrders.forEach(order => {
        notifications.push({
          id: `new-order-${order._id}`,
          type: 'new_order',
          itemType: 'order',
          orderId: order._id,
          storeId: store._id,
          storeName: store.name,
          title: '🛒 Nuevo pedido',
          message: `${order.customerName} realizó un pedido`,
          details: `Total: $${order.total.toLocaleString('es-CL')} - ${order.status}`,
          timestamp: order.createdAt,
          priority: 'high',
          read: false
        });
        });
      }
    }

    // 3. Mensajes sin leer en reservas
    if (store.mode === 'services' || store.mode === 'both' || store.mode === 'bookings') {
      const bookingsWithUnreadMessages = await Booking.find({
        store: id,
        unreadMessagesOwner: { $gt: 0 },
        status: { $ne: 'cancelled' }
      })
      .populate('service', 'name')
      .sort({ lastMessageAt: -1 })
      .lean();

      if (bookingsWithUnreadMessages && bookingsWithUnreadMessages.length > 0) {
        bookingsWithUnreadMessages.forEach(booking => {
        notifications.push({
          id: `message-booking-${booking._id}`,
          type: 'unread_message',
          itemType: 'booking',
          bookingId: booking._id,
          storeId: store._id,
          storeName: store.name,
          title: '💬 Nuevo mensaje',
          message: `${booking.customerName} te escribió sobre su reserva`,
          details: `${booking.unreadMessagesOwner} mensaje${booking.unreadMessagesOwner > 1 ? 's' : ''} sin leer`,
          timestamp: booking.lastMessageAt,
          priority: 'medium',
          read: false,
          unreadCount: booking.unreadMessagesOwner
        });
        });
      }
    }

    // 4. Mensajes sin leer en pedidos
    if (store.mode === 'products' || store.mode === 'both') {
      const ordersWithUnreadMessages = await Order.find({
        store: id,
        unreadMessagesOwner: { $gt: 0 },
        status: { $ne: 'cancelled' }
      })
      .select('+unreadMessagesOwner +lastMessageAt')
      .sort({ lastMessageAt: -1 })
      .lean();

      if (ordersWithUnreadMessages && ordersWithUnreadMessages.length > 0) {
        ordersWithUnreadMessages.forEach(order => {
        notifications.push({
          id: `message-order-${order._id}`,
          type: 'unread_message',
          itemType: 'order',
          orderId: order._id,
          storeId: store._id,
          storeName: store.name,
          title: '💬 Nuevo mensaje',
          message: `${order.customerName} te escribió sobre su pedido`,
          details: `${order.unreadMessagesOwner} mensaje${order.unreadMessagesOwner > 1 ? 's' : ''} sin leer`,
          timestamp: order.lastMessageAt,
          priority: 'medium',
          read: false,
          unreadCount: order.unreadMessagesOwner
        });
        });
      }
    }

    // 5. Cancelaciones recientes
    if (store.mode === 'services' || store.mode === 'both' || store.mode === 'bookings') {
      const recentCancellations = await Booking.find({
        store: id,
        status: 'cancelled'
      })
      .populate('service', 'name')
      .sort({ updatedAt: -1 })
      .limit(5) // Máximo 5 cancelaciones
      .lean();

      if (recentCancellations && recentCancellations.length > 0) {
        recentCancellations.forEach(booking => {
        notifications.push({
          id: `cancelled-booking-${booking._id}`,
          type: 'cancellation',
          itemType: 'booking',
          bookingId: booking._id,
          storeId: store._id,
          storeName: store.name,
          title: '❌ Reserva cancelada',
          message: `${booking.customerName} canceló su reserva`,
          details: `${new Date(booking.date).toLocaleDateString('es-CL')} - ${booking.slot}`,
          timestamp: booking.updatedAt,
          priority: 'low',
          read: false
        });
        });
      }
    }

    // Ordenar por timestamp (más reciente primero)
    notifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    return res.json(notifications);
  } catch (error) {
    console.error('❌ Error al obtener notificaciones:', error);
    return res.status(500).json({ 
      message: 'Error al obtener notificaciones',
      error: error.message 
    });
  }
};
