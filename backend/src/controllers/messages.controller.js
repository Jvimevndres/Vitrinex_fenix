// src/controllers/messages.controller.js
import Message from "../models/message.model.js";
import Booking from "../models/booking.model.js";

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
      .populate("sender", "username email")
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
      booking: bookingId,
      sender: req.user.id,
      senderType: "owner",
      content: content.trim(),
    });

    await message.save();

    // Actualizar booking
    booking.unreadMessagesCustomer += 1;
    booking.lastMessageAt = new Date();
    await booking.save();

    // Poblar sender
    await message.populate("sender", "username email");

    return res.status(201).json(message);
  } catch (error) {
    console.error("Error al enviar mensaje:", error);
    return res.status(500).json({ message: "Error al enviar mensaje" });
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
      .populate("sender", "username")
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
      booking: bookingId,
      sender: null,
      senderType: "customer",
      content: content.trim(),
    });

    await message.save();

    // Actualizar booking
    booking.unreadMessagesOwner += 1;
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

    const bookings = await Booking.find({
      store: storeId,
      lastMessageAt: { $exists: true },
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
