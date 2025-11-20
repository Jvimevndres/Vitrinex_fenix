// src/models/message.model.js
import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
      index: true,
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      default: null,
      index: true,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      default: null,
      index: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false, // No requerido porque los clientes pueden ser anónimos
      default: null,
    },
    senderType: {
      type: String,
      enum: ["owner", "customer"],
      required: true,
    },
    senderName: {
      type: String,
      trim: true,
    },
    senderEmail: {
      type: String,
      trim: true,
    },
    content: {
      type: String,
      required: true,
      maxlength: 1000,
      trim: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Índice compuesto para consultas eficientes
messageSchema.index({ booking: 1, createdAt: 1 });
messageSchema.index({ order: 1, createdAt: 1 });
messageSchema.index({ store: 1, isRead: 1 });

// Virtual para formatear tiempo
messageSchema.virtual("timeAgo").get(function () {
  const now = new Date();
  const diff = now - this.createdAt;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `hace ${days} día${days > 1 ? "s" : ""}`;
  if (hours > 0) return `hace ${hours} hora${hours > 1 ? "s" : ""}`;
  if (minutes > 0) return `hace ${minutes} minuto${minutes > 1 ? "s" : ""}`;
  return "ahora";
});

messageSchema.set("toJSON", { virtuals: true });
messageSchema.set("toObject", { virtuals: true });

export default mongoose.model("Message", messageSchema);
