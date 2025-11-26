// src/controllers/messages.controller.js
import Message from "../models/message.model.js";
import Booking from "../models/booking.model.js";
import Order from "../models/order.model.js";
import Store from "../models/store.model.js";

/**
 * GET /api/bookings/:bookingId/messages
 * Obtener todos los mensajes de una reserva
 */
export const getBookingMessages = async (req, res) => {
  try {
    const { bookingId } = req.params;

    // Verificar que la reserva existe
    const booking = await Booking.findById(bookingId).populate("store", "owner");
    if (!booking) {
      return res.status(404).json({ message: "Reserva no encontrada" });
    }

    // Verificar permisos: solo el dueño de la tienda puede ver mensajes
    if (booking.store.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: "No autorizado" });
    }

    // Obtener mensajes
    const messages = await Message.find({ booking: bookingId })
      .populate("sender", "username email avatarUrl")
      .sort({ createdAt: 1 });

    // Marcar mensajes del cliente como leídos por el owner
    await Message.updateMany(
      {
        booking: bookingId,
        senderType: "customer",
        isRead: false,
      },
      {
        $set: {
          isRead: true,
          readAt: new Date(),
        },
      }
    );

    // Actualizar contador de no leídos
    booking.unreadMessagesOwner = 0;
    await booking.save();

    return res.json(messages);
  } catch (error) {
    console.error("Error al obtener mensajes:", error);
    return res.status(500).json({ message: "Error al obtener mensajes" });
  }
};

/**
 * POST /api/bookings/:bookingId/messages
 * Enviar un mensaje (owner)
 */
export const sendMessage = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ message: "El mensaje no puede estar vacío" });
    }

    if (content.length > 1000) {
      return res.status(400).json({ message: "El mensaje es demasiado largo (máx 1000 caracteres)" });
    }

    // Verificar que la reserva existe
    const booking = await Booking.findById(bookingId).populate("store", "owner");
    if (!booking) {
      return res.status(404).json({ message: "Reserva no encontrada" });
    }

    // Verificar permisos
    if (booking.store.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: "No autorizado" });
    }

    // Crear mensaje
    const message = new Message({
      store: booking.store._id,
      booking: bookingId,
      sender: req.user.id,
      senderType: "owner",
      content: content.trim(),
    });

    await message.save();

    // ✅ Actualizar booking con timestamp y contador para el CLIENTE
    booking.unreadMessagesCustomer = (booking.unreadMessagesCustomer || 0) + 1;
    booking.lastMessageAt = new Date();
    await booking.save();

    // Poblar sender
    await message.populate("sender", "username email avatarUrl");

    return res.status(201).json(message);
  } catch (error) {
    console.error("Error al enviar mensaje:", error);
    return res.status(500).json({ message: "Error al enviar mensaje" });
  }
};

// ============================================
// CHAT USUARIO-USUARIO (directo entre perfiles)
// ============================================

/**
 * GET /api/public/users/:userId/messages
 * Obtener conversación entre usuario autenticado y otro usuario
 */
export const getUserMessages = async (req, res) => {
  try {
    const { userId } = req.params; // ID del usuario con quien se chatea
    const currentUserId = req.user.id; // Usuario autenticado

    // Validar que no intente chatear consigo mismo
    if (userId === currentUserId) {
      return res.status(400).json({ message: "No puedes chatear contigo mismo" });
    }

    // Obtener mensajes en ambas direcciones
    const messages = await Message.find({
      conversationType: "user",
      $or: [
        { fromUser: currentUserId, toUser: userId },
        { fromUser: userId, toUser: currentUserId }
      ]
    })
      .populate("fromUser", "username email avatarUrl")
      .populate("toUser", "username email avatarUrl")
      .sort({ createdAt: 1 });

    // Marcar como leídos los mensajes que recibió el usuario actual
    await Message.updateMany(
      {
        conversationType: "user",
        fromUser: userId,
        toUser: currentUserId,
        isRead: false
      },
      {
        $set: {
          isRead: true,
          readAt: new Date()
        }
      }
    );

    return res.json(messages);
  } catch (error) {
    console.error("Error al obtener mensajes usuario-usuario:", error);
    return res.status(500).json({ message: "Error al obtener mensajes" });
  }
};

/**
 * POST /api/public/users/:userId/messages
 * Enviar mensaje a otro usuario
 */
export const sendUserMessage = async (req, res) => {
  try {
    const { userId } = req.params; // ID del usuario destinatario
    const currentUserId = req.user.id; // Usuario autenticado que envía
    const { content } = req.body;

    // Validaciones
    if (!content || content.trim().length === 0) {
      return res.status(400).json({ message: "El mensaje no puede estar vacío" });
    }

    if (content.length > 1000) {
      return res.status(400).json({ message: "El mensaje es demasiado largo (máx 1000 caracteres)" });
    }

    if (userId === currentUserId) {
      return res.status(400).json({ message: "No puedes enviarte mensajes a ti mismo" });
    }

    // Verificar que el usuario destinatario existe
    const User = (await import("../models/user.model.js")).default;
    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Crear mensaje
    const message = new Message({
      conversationType: "user",
      fromUser: currentUserId,
      toUser: userId,
      sender: currentUserId, // Compatibilidad
      senderType: "user",
      content: content.trim(),
      isRead: false
    });

    await message.save();

    // Poblar datos para la respuesta
    await message.populate("fromUser", "username email avatarUrl");
    await message.populate("toUser", "username email avatarUrl");

    return res.status(201).json(message);
  } catch (error) {
    console.error("Error al enviar mensaje usuario-usuario:", error);
    return res.status(500).json({ message: "Error al enviar mensaje" });
  }
};

/**
 * GET /api/messages/user-conversations
 * Obtener lista de conversaciones usuario-usuario del usuario autenticado
 */
export const getUserConversations = async (req, res) => {
  try {
    const currentUserId = req.user.id;

    // Buscar todos los mensajes donde el usuario es participante
    const messages = await Message.find({
      conversationType: "user",
      $or: [
        { fromUser: currentUserId },
        { toUser: currentUserId }
      ]
    })
      .populate("fromUser", "username email avatarUrl")
      .populate("toUser", "username email avatarUrl")
      .sort({ createdAt: -1 });

    // Agrupar por conversación (usuario con quien se chatea)
    const conversationsMap = new Map();

    messages.forEach(msg => {
      // Determinar el otro usuario
      const otherUserId = msg.fromUser._id.toString() === currentUserId 
        ? msg.toUser._id.toString() 
        : msg.fromUser._id.toString();
      
      const otherUser = msg.fromUser._id.toString() === currentUserId 
        ? msg.toUser 
        : msg.fromUser;

      // Si ya existe esta conversación, actualizar solo si este mensaje es más reciente
      if (!conversationsMap.has(otherUserId)) {
        // Contar mensajes sin leer que recibió el usuario actual
        const unreadCount = messages.filter(m => 
          m.fromUser._id.toString() === otherUserId &&
          m.toUser._id.toString() === currentUserId &&
          !m.isRead
        ).length;

        conversationsMap.set(otherUserId, {
          userId: otherUser._id,
          username: otherUser.username,
          email: otherUser.email,
          avatar: otherUser.avatar,
          lastMessage: msg.content.substring(0, 50) + (msg.content.length > 50 ? '...' : ''),
          lastMessageAt: msg.createdAt,
          unreadCount: unreadCount
        });
      }
    });

    // Convertir a array y ordenar por último mensaje
    const conversations = Array.from(conversationsMap.values())
      .sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt));

    return res.json(conversations);
  } catch (error) {
    console.error("Error al obtener conversaciones usuario-usuario:", error);
    return res.status(500).json({ message: "Error al obtener conversaciones" });
  }
};

/**
 * GET /api/public/bookings/:bookingId/messages
 * Obtener mensajes (público - para clientes)
 */
export const getBookingMessagesPublic = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ message: "Email requerido" });
    }

    // Verificar que la reserva existe y pertenece al cliente
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Reserva no encontrada" });
    }

    if (booking.customerEmail !== email) {
      return res.status(403).json({ message: "No autorizado" });
    }

    // Obtener mensajes
    const messages = await Message.find({ booking: bookingId })
      .populate("sender", "username avatarUrl")
      .sort({ createdAt: 1 });

    // Marcar mensajes del owner como leídos por el cliente
    await Message.updateMany(
      {
        booking: bookingId,
        senderType: "owner",
        isRead: false,
      },
      {
        $set: {
          isRead: true,
          readAt: new Date(),
        },
      }
    );

    // Actualizar contador
    booking.unreadMessagesCustomer = 0;
    await booking.save();

    return res.json(messages);
  } catch (error) {
    console.error("Error al obtener mensajes (público):", error);
    return res.status(500).json({ message: "Error al obtener mensajes" });
  }
};

/**
 * POST /api/public/bookings/:bookingId/messages
 * Enviar mensaje (público - para clientes)
 */
export const sendMessagePublic = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { content, email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email requerido" });
    }

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ message: "El mensaje no puede estar vacío" });
    }

    if (content.length > 1000) {
      return res.status(400).json({ message: "El mensaje es demasiado largo (máx 1000 caracteres)" });
    }

    // Verificar que la reserva existe y pertenece al cliente
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Reserva no encontrada" });
    }

    if (booking.customerEmail !== email) {
      return res.status(403).json({ message: "No autorizado" });
    }

    // Crear mensaje (sin sender porque es cliente anónimo)
    const message = new Message({
      store: booking.store,
      booking: bookingId,
      sender: null,
      senderType: "customer",
      content: content.trim(),
    });

    await message.save();

    // ✅ Actualizar booking con timestamp y contador para el DUEÑO
    booking.unreadMessagesOwner = (booking.unreadMessagesOwner || 0) + 1;
    booking.lastMessageAt = new Date();
    await booking.save();

    return res.status(201).json(message);
  } catch (error) {
    console.error("Error al enviar mensaje (público):", error);
    return res.status(500).json({ message: "Error al enviar mensaje" });
  }
};

/**
 * GET /api/stores/:storeId/bookings-with-messages
 * Obtener reservas con actividad de chat (para el dueño)
 */
export const getBookingsWithMessages = async (req, res) => {
  try {
    const { storeId } = req.params;

    // Verificar que la tienda existe y pertenece al usuario autenticado
    const store = await Store.findById(storeId);
    if (!store) {
      return res.status(404).json({ message: "Tienda no encontrada" });
    }

    // Verificar propiedad
    const userId = req.user.id;
    const ownerId = store.owner?.toString();
    const legacyOwnerId = store.user?.toString();
    
    if (ownerId !== userId && legacyOwnerId !== userId) {
      return res.status(403).json({ message: "No autorizado" });
    }

    // Filtrar por lastMessageAt !== null O unreadMessagesOwner > 0
    const bookings = await Booking.find({
      store: storeId,
      $or: [
        { lastMessageAt: { $ne: null } },
        { unreadMessagesOwner: { $gt: 0 } }
      ]
    })
      .populate("service", "name")
      .sort({ lastMessageAt: -1 })
      .limit(50);

    return res.json(bookings);
  } catch (error) {
    console.error("Error al obtener reservas con mensajes:", error);
    return res.status(500).json({ message: "Error al obtener reservas" });
  }
};

// =================== MENSAJES PARA PEDIDOS (ORDERS) ===================

/**
 * GET /api/orders/:orderId/messages
 * Obtener todos los mensajes de un pedido
 */
export const getOrderMessages = async (req, res) => {
  try {
    const { orderId } = req.params;

    // Verificar que el pedido existe
    const order = await Order.findById(orderId).populate("store", "owner user");
    if (!order) {
      return res.status(404).json({ message: "Pedido no encontrado" });
    }

    // Verificar permisos: solo el dueño de la tienda puede ver mensajes
    const userId = req.user.id;
    if (order.store.owner.toString() !== userId && order.store.user?.toString() !== userId) {
      return res.status(403).json({ message: "No autorizado" });
    }

    // Obtener mensajes
    const messages = await Message.find({ order: orderId })
      .sort({ createdAt: 1 });

    // Marcar mensajes del cliente como leídos por el owner
    await Message.updateMany(
      {
        order: orderId,
        senderType: "customer",
        isRead: false,
      },
      {
        $set: {
          isRead: true,
          readAt: new Date(),
        },
      }
    );

    return res.json(messages);
  } catch (error) {
    console.error("Error al obtener mensajes del pedido:", error);
    return res.status(500).json({ message: "Error al obtener mensajes" });
  }
};

/**
 * POST /api/orders/:orderId/messages
 * Enviar un mensaje desde el owner al cliente
 */
export const sendOrderMessage = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ message: "El mensaje no puede estar vacío" });
    }

    if (content.length > 1000) {
      return res.status(400).json({ message: "El mensaje es demasiado largo (máx 1000 caracteres)" });
    }

    // Verificar que el pedido existe
    const order = await Order.findById(orderId).populate("store", "owner user name");
    if (!order) {
      return res.status(404).json({ message: "Pedido no encontrado" });
    }

    // Verificar permisos
    const userId = req.user.id;
    if (order.store.owner.toString() !== userId && order.store.user?.toString() !== userId) {
      return res.status(403).json({ message: "No autorizado" });
    }

    // Crear mensaje
    const message = new Message({
      store: order.store._id,
      order: orderId,
      sender: req.user.id,
      senderType: "owner",
      senderName: order.store.name,
      content: content.trim(),
    });

    await message.save();

    // ✅ Actualizar order con timestamp y contador para el CLIENTE
    order.unreadMessagesCustomer = (order.unreadMessagesCustomer || 0) + 1;
    order.lastMessageAt = new Date();
    await order.save();

    return res.status(201).json(message);
  } catch (error) {
    console.error("Error al enviar mensaje del pedido:", error);
    return res.status(500).json({ message: "Error al enviar mensaje" });
  }
};

/**
 * POST /api/orders/:orderId/messages/public
 * Enviar un mensaje desde el cliente (público, sin auth)
 */
export const sendOrderMessagePublic = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { content, customerName, customerEmail } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ message: "El mensaje no puede estar vacío" });
    }

    if (content.length > 1000) {
      return res.status(400).json({ message: "El mensaje es demasiado largo (máx 1000 caracteres)" });
    }

    if (!customerName || customerName.trim().length === 0) {
      return res.status(400).json({ message: "El nombre es requerido" });
    }

    // Verificar que el pedido existe
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Pedido no encontrado" });
    }

    // Crear mensaje
    const message = new Message({
      store: order.store,
      order: orderId,
      sender: null, // Cliente anónimo
      senderType: "customer",
      senderName: customerName.trim(),
      senderEmail: customerEmail?.trim() || order.customerEmail,
      content: content.trim(),
    });

    await message.save();

    // ✅ Actualizar order con timestamp y contador para el DUEÑO
    order.unreadMessagesOwner = (order.unreadMessagesOwner || 0) + 1;
    order.lastMessageAt = new Date();
    await order.save();

    return res.status(201).json(message);
  } catch (error) {
    console.error("Error al enviar mensaje (público):", error);
    return res.status(500).json({ message: "Error al enviar mensaje" });
  }
};

/**
 * 🆕 Obtener mensajes de una orden (público - para clientes)
 */
export const getOrderMessagesPublic = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ message: "Email requerido" });
    }

    // Verificar que la orden existe y pertenece al cliente
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Orden no encontrada" });
    }

    if (order.customerEmail !== email) {
      return res.status(403).json({ message: "No autorizado" });
    }

    // Obtener mensajes
    const messages = await Message.find({ order: orderId })
      .populate("sender", "username avatarUrl")
      .sort({ createdAt: 1 });

    // Marcar mensajes del owner como leídos por el cliente
    await Message.updateMany(
      {
        order: orderId,
        senderType: "owner",
        isRead: false,
      },
      {
        $set: {
          isRead: true,
          readAt: new Date(),
        },
      }
    );

    // Actualizar contador
    order.unreadMessagesCustomer = 0;
    await order.save();

    return res.json(messages);
  } catch (error) {
    console.error("Error al obtener mensajes de orden (público):", error);
    return res.status(500).json({ message: "Error al obtener mensajes" });
  }
};
