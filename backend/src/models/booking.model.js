import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
      index: true,
    },
    // 🆕 NUEVO: Servicio asociado (opcional para backward compatibility)
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      default: null,
      index: true,
    },
    customerName: {
      type: String,
      required: true,
      trim: true,
    },
    customerEmail: {
      type: String,
      trim: true,
    },
    customerPhone: {
      type: String,
      trim: true,
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
    slot: {
      type: String,
      required: true,
    },
    // 🆕 NUEVO: Duración de la cita (en minutos)
    // Se calcula del servicio o default 30
    duration: {
      type: Number,
      default: 30,
    },
    // 🆕 NUEVO: Precio pagado (snapshot del precio del servicio al momento de reservar)
    price: {
      type: Number,
      default: 0,
    },
    // 🆕 NUEVO: Nombre del servicio (para reportes cuando el servicio se elimine)
    serviceName: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      default: "",
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "pending",
    },
    // 🆕 CHAT: Contadores de mensajes no leídos
    unreadMessagesOwner: {
      type: Number,
      default: 0,
    },
    unreadMessagesCustomer: {
      type: Number,
      default: 0,
    },
    lastMessageAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

bookingSchema.index({ store: 1, date: 1, slot: 1 }, { unique: true });

const Booking = mongoose.model("Booking", bookingSchema);

export default Booking;
