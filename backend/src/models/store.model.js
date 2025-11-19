import mongoose from "mongoose";

const storeSchema = new mongoose.Schema(
  {
    // Compatibilidad con documentos antiguos
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    // Propietario actual
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    name: { type: String, required: true, trim: true },

    mode: {
      type: String,
      enum: ["products", "bookings"],
      default: "products",
    },

    description: { type: String, default: "" },

    logoUrl: { type: String, default: "" },

    comuna: { type: String, trim: true },
    tipoNegocio: { type: String, trim: true },

    // Dirección
    direccion: { type: String, trim: true },
    lat: { type: Number },
    lng: { type: Number },

    // Contacto
    email: { type: String, trim: true },
    phone: { type: String, trim: true },
    whatsapp: { type: String, trim: true },
    website: { type: String, trim: true },

    // Imágenes adicionales
    coverImageUrl: { type: String, default: "" }, // Imagen hero/portada

    // Horario simple (texto libre)
    scheduleText: { type: String, default: "" },

    // Activación suave
    isActive: { type: Boolean, default: true },

    // Plan de suscripción
    plan: {
      type: String,
      enum: ['free', 'pro', 'premium'],
      default: 'free',
    },
    planExpiresAt: { type: Date },

    // Espacios promocionales (banners configurables)
    promotionalSpaces: {
      top: {
        enabled: { type: Boolean, default: false },
        imageUrl: { type: String, default: '' },
        link: { type: String, default: '' },
      },
      sidebarLeft: {
        enabled: { type: Boolean, default: false },
        imageUrl: { type: String, default: '' },
        link: { type: String, default: '' },
      },
      sidebarRight: {
        enabled: { type: Boolean, default: false },
        imageUrl: { type: String, default: '' },
        link: { type: String, default: '' },
      },
      betweenSections: {
        enabled: { type: Boolean, default: false },
        imageUrl: { type: String, default: '' },
        link: { type: String, default: '' },
      },
      footer: {
        enabled: { type: Boolean, default: false },
        imageUrl: { type: String, default: '' },
        link: { type: String, default: '' },
      },
    },

    // Disponibilidad de agendamiento (mejorada v2)
    bookingAvailability: {
      type: [
        {
          dayOfWeek: {
            type: String,
            enum: [
              "monday",
              "tuesday",
              "wednesday",
              "thursday",
              "friday",
              "saturday",
              "sunday",
            ],
            required: true,
          },
          // Indica si el día está cerrado completamente
          isClosed: { type: Boolean, default: false },
          // Bloques horarios (múltiples rangos permitidos)
          timeBlocks: {
            type: [
              {
                startTime: { type: String, required: true }, // "09:00"
                endTime: { type: String, required: true },   // "13:00"
                slotDuration: { type: Number, default: 30 }, // minutos
              },
            ],
            default: [],
          },
          // Compatibilidad con formato antiguo (slots)
          slots: { type: [String], default: [] },
        },
      ],
      default: [],
    },

    // 📅 NUEVO: Días especiales / Excepciones de calendario
    // Para manejar días festivos, cierres temporales, horarios especiales
    specialDays: {
      type: [
        {
          date: { type: Date, required: true, index: true }, // Fecha específica (sin hora)
          isClosed: { type: Boolean, default: false }, // Si está cerrado ese día
          reason: { type: String, default: "" }, // "Feriado", "Vacaciones", etc.
          // Horarios especiales para ese día (override del horario semanal)
          timeBlocks: {
            type: [
              {
                startTime: { type: String, required: true },
                endTime: { type: String, required: true },
                slotDuration: { type: Number, default: 30 },
              },
            ],
            default: [],
          },
        },
      ],
      default: [],
    },

    // 🎨 Personalización visual
    primaryColor: { type: String, default: "#2563eb" },
    accentColor: { type: String, default: "#0f172a" },

    // Fondo
    bgMode: { type: String, enum: ["solid", "gradient", "image"], default: "gradient" },
    bgColorTop: { type: String, default: "#e8d7ff" },
    bgColorBottom: { type: String, default: "#ffffff" },
    bgPattern: { type: String, enum: ["none", "dots", "grid", "noise"], default: "none" },
    bgImageUrl: { type: String, default: "" },

    // Textos destacados
    heroTitle: { type: String, default: "" },
    heroSubtitle: { type: String, default: "" },
    highlight1: { type: String, default: "" },
    highlight2: { type: String, default: "" },
    priceFrom: { type: String, default: "" },
  },
  { timestamps: true }
);

// Índices útiles
storeSchema.index({ owner: 1 });
storeSchema.index({ user: 1 });

// Índices compuestos para queries optimizadas
storeSchema.index({ lat: 1, lng: 1, isActive: 1 }); // Búsqueda geográfica
storeSchema.index({ comuna: 1, tipoNegocio: 1, isActive: 1 }); // Filtros
storeSchema.index({ mode: 1, isActive: 1 }); // Por tipo de negocio

const Store = mongoose.model("Store", storeSchema);

export async function ensureStoreIndexes() {
  try {
    const indexes = await Store.collection.indexes();
    const legacyUniqueOwner = indexes.find(
      (idx) => idx.name === "owner_1" && idx.unique
    );
    if (legacyUniqueOwner) {
      await Store.collection.dropIndex("owner_1");
      console.log("🛠️ Índice único legacy owner_1 eliminado de stores");
    }
  } catch (error) {
    if (error?.codeName !== "NamespaceNotFound") {
      console.error("Error asegurando índices de Store:", error);
    }
  }
}

export default Store;
