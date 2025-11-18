import mongoose from "mongoose";

/**
 * Modelo de Servicio
 * Representa un servicio que ofrece una tienda (ej: Corte de pelo, Consulta médica, etc.)
 */
const serviceSchema = new mongoose.Schema(
  {
    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, "El nombre del servicio es requerido"],
      trim: true,
      maxlength: [100, "El nombre no puede exceder 100 caracteres"],
    },
    description: {
      type: String,
      default: "",
      trim: true,
      maxlength: [500, "La descripción no puede exceder 500 caracteres"],
    },
    duration: {
      type: Number, // en minutos
      required: [true, "La duración es requerida"],
      min: [5, "La duración mínima es 5 minutos"],
      max: [480, "La duración máxima es 480 minutos (8 horas)"],
      default: 30,
    },
    price: {
      type: Number,
      required: [true, "El precio es requerido"],
      min: [0, "El precio no puede ser negativo"],
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    // Orden de visualización (para ordenar servicios en el catálogo)
    displayOrder: {
      type: Number,
      default: 0,
    },
    // Imagen del servicio (opcional)
    imageUrl: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// Índice compuesto para queries optimizadas
serviceSchema.index({ store: 1, isActive: 1, displayOrder: 1 });

// Virtual para formato de precio
serviceSchema.virtual("formattedPrice").get(function () {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    minimumFractionDigits: 0,
  }).format(this.price);
});

// Virtual para formato de duración
serviceSchema.virtual("formattedDuration").get(function () {
  const hours = Math.floor(this.duration / 60);
  const minutes = this.duration % 60;
  
  if (hours > 0 && minutes > 0) {
    return `${hours}h ${minutes}min`;
  } else if (hours > 0) {
    return `${hours}h`;
  } else {
    return `${minutes}min`;
  }
});

// Asegurar que los virtuals se incluyan en JSON
serviceSchema.set("toJSON", { virtuals: true });
serviceSchema.set("toObject", { virtuals: true });

export default mongoose.model("Service", serviceSchema);
