// backend/src/models/storeAppearance.model.js
import mongoose from "mongoose";

/**
 * MODELO DE APARIENCIA DE TIENDA
 * Sistema de personalización visual completo tipo Canva/Wix
 */

const storeAppearanceSchema = new mongoose.Schema(
  {
    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
      unique: true,
      index: true,
    },

    // ==================== TEMA PREDEFINIDO ====================
    theme: {
      type: String,
      enum: ["minimal", "neon", "dark-pro", "pastel", "gradient-wave", "custom"],
      default: "minimal",
    },

    // ==================== COLORES ====================
    colors: {
      primary: { type: String, default: "#2563eb" }, // Azul principal
      secondary: { type: String, default: "#7c3aed" }, // Púrpura
      accent: { type: String, default: "#f59e0b" }, // Naranja/amarillo
      background: { type: String, default: "#ffffff" },
      surface: { type: String, default: "#f8fafc" },
      text: { type: String, default: "#0f172a" },
      textSecondary: { type: String, default: "#64748b" },
      border: { type: String, default: "#e2e8f0" },
      success: { type: String, default: "#10b981" },
      error: { type: String, default: "#ef4444" },
      warning: { type: String, default: "#f59e0b" },
    },

    // ==================== TIPOGRAFÍA ====================
    typography: {
      fontFamily: {
        type: String,
        enum: [
          "Inter",
          "Poppins",
          "Roboto",
          "Montserrat",
          "Playfair Display",
          "Lato",
          "Open Sans",
          "Space Grotesk",
        ],
        default: "Inter",
      },
      headingSize: { type: String, default: "2.5rem" }, // text-4xl
      bodySize: { type: String, default: "1rem" }, // text-base
      lineHeight: { type: String, default: "1.6" },
      letterSpacing: { type: String, default: "normal" },
    },

    // ==================== FONDO ====================
    background: {
      mode: {
        type: String,
        enum: ["solid", "gradient", "image", "pattern"],
        default: "gradient",
      },
      solid: { type: String, default: "#ffffff" },
      gradient: {
        type: { type: String, enum: ["linear", "radial"], default: "linear" },
        direction: { type: String, default: "to bottom" }, // to right, to top, etc
        colors: [{ type: String }],
        stops: [{ type: Number }], // porcentajes 0-100
      },
      image: {
        url: { type: String, default: "" },
        position: { type: String, default: "center" },
        size: { type: String, default: "cover" },
        opacity: { type: Number, default: 1, min: 0, max: 1 },
      },
      pattern: {
        type: {
          type: String,
          enum: ["dots", "waves", "lines", "mesh", "grid", "hexagons"],
          default: "dots",
        },
        color: { type: String, default: "#e2e8f0" },
        opacity: { type: Number, default: 0.3, min: 0, max: 1 },
        scale: { type: Number, default: 1, min: 0.5, max: 2 },
      },
    },

    // ==================== LAYOUT ====================
    layout: {
      style: {
        type: String,
        enum: ["hero-top", "hero-center", "hero-split", "minimal", "cards-grid"],
        default: "hero-top",
      },
      maxWidth: { type: String, default: "1280px" },
      spacing: { type: String, enum: ["compact", "normal", "relaxed"], default: "normal" },
      headerPosition: { type: String, enum: ["fixed", "static", "sticky"], default: "sticky" },
    },

    // ==================== COMPONENTES ====================
    components: {
      // Botones
      buttons: {
        style: { type: String, enum: ["filled", "outline", "ghost", "soft"], default: "filled" },
        roundness: { type: String, enum: ["none", "sm", "md", "lg", "full"], default: "lg" },
        size: { type: String, enum: ["sm", "md", "lg"], default: "md" },
      },

      // Tarjetas
      cards: {
        style: {
          type: String,
          enum: ["elevated", "outlined", "flat", "glass"],
          default: "elevated",
        },
        roundness: { type: String, enum: ["none", "sm", "md", "lg", "xl"], default: "xl" },
        shadow: { type: String, enum: ["none", "sm", "md", "lg", "xl"], default: "md" },
      },

      // Navegación
      navigation: {
        style: { type: String, enum: ["inline", "centered", "sidebar"], default: "inline" },
        transparent: { type: Boolean, default: false },
        blur: { type: Boolean, default: true },
      },
    },

    // ==================== SECCIONES VISIBLES ====================
    sections: {
      hero: { type: Boolean, default: true },
      about: { type: Boolean, default: true },
      services: { type: Boolean, default: true },
      gallery: { type: Boolean, default: false },
      testimonials: { type: Boolean, default: false },
      schedule: { type: Boolean, default: true },
      contact: { type: Boolean, default: true },
      booking: { type: Boolean, default: true },
    },

    // ==================== CONTENIDO PERSONALIZABLE ====================
    content: {
      hero: {
        title: { type: String, default: "" },
        subtitle: { type: String, default: "" },
        ctaText: { type: String, default: "Reservar Ahora" },
        showImage: { type: Boolean, default: true },
      },
      about: {
        title: { type: String, default: "Sobre Nosotros" },
        description: { type: String, default: "" },
      },
      services: {
        title: { type: String, default: "Nuestros Servicios" },
        subtitle: { type: String, default: "" },
        displayStyle: { type: String, enum: ["grid", "list", "carousel"], default: "grid" },
      },
      contact: {
        title: { type: String, default: "Contáctanos" },
        showMap: { type: Boolean, default: false },
      },
    },

    // ==================== EFECTOS Y ANIMACIONES ====================
    effects: {
      animations: { type: Boolean, default: true },
      parallax: { type: Boolean, default: false },
      smoothScroll: { type: Boolean, default: true },
      hoverEffects: { type: Boolean, default: true },
    },

    // ==================== METADATOS ====================
    version: { type: Number, default: 1 },
    lastModified: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

// Índice para búsqueda rápida
storeAppearanceSchema.index({ store: 1 });

// Middleware pre-save para actualizar lastModified
storeAppearanceSchema.pre("save", function (next) {
  this.lastModified = new Date();
  next();
});

// Método para aplicar tema predefinido
storeAppearanceSchema.methods.applyTheme = function (themeName) {
  const themes = {
    minimal: {
      colors: {
        primary: "#0f172a",
        secondary: "#64748b",
        accent: "#3b82f6",
        background: "#ffffff",
        surface: "#f8fafc",
        text: "#0f172a",
        textSecondary: "#64748b",
        border: "#e2e8f0",
      },
      background: {
        mode: "solid",
        solid: "#ffffff",
      },
      components: {
        buttons: { style: "outline", roundness: "md", size: "md" },
        cards: { style: "outlined", roundness: "lg", shadow: "sm" },
      },
    },
    neon: {
      colors: {
        primary: "#a855f7",
        secondary: "#ec4899",
        accent: "#06b6d4",
        background: "#0f172a",
        surface: "#1e293b",
        text: "#f1f5f9",
        textSecondary: "#94a3b8",
        border: "#334155",
      },
      background: {
        mode: "gradient",
        gradient: {
          type: "linear",
          direction: "to bottom right",
          colors: ["#0f172a", "#1e1b4b", "#312e81"],
        },
      },
      components: {
        buttons: { style: "filled", roundness: "full", size: "lg" },
        cards: { style: "glass", roundness: "xl", shadow: "xl" },
      },
    },
    "dark-pro": {
      colors: {
        primary: "#3b82f6",
        secondary: "#8b5cf6",
        accent: "#10b981",
        background: "#09090b",
        surface: "#18181b",
        text: "#fafafa",
        textSecondary: "#a1a1aa",
        border: "#27272a",
      },
      background: {
        mode: "solid",
        solid: "#09090b",
      },
      components: {
        buttons: { style: "soft", roundness: "lg", size: "md" },
        cards: { style: "elevated", roundness: "xl", shadow: "lg" },
      },
    },
    pastel: {
      colors: {
        primary: "#fb7185",
        secondary: "#a78bfa",
        accent: "#fbbf24",
        background: "#fef3c7",
        surface: "#fffbeb",
        text: "#78350f",
        textSecondary: "#92400e",
        border: "#fde68a",
      },
      background: {
        mode: "gradient",
        gradient: {
          type: "linear",
          direction: "to bottom",
          colors: ["#fef3c7", "#fffbeb", "#fef3c7"],
        },
      },
      components: {
        buttons: { style: "soft", roundness: "full", size: "md" },
        cards: { style: "flat", roundness: "xl", shadow: "none" },
      },
    },
    "gradient-wave": {
      colors: {
        primary: "#6366f1",
        secondary: "#a855f7",
        accent: "#ec4899",
        background: "#ffffff",
        surface: "#faf5ff",
        text: "#1e1b4b",
        textSecondary: "#6b7280",
        border: "#e9d5ff",
      },
      background: {
        mode: "gradient",
        gradient: {
          type: "linear",
          direction: "to bottom right",
          colors: ["#faf5ff", "#f3e8ff", "#e9d5ff"],
        },
      },
      components: {
        buttons: { style: "filled", roundness: "full", size: "lg" },
        cards: { style: "glass", roundness: "xl", shadow: "lg" },
      },
    },
  };

  const theme = themes[themeName];
  if (theme) {
    Object.assign(this.colors, theme.colors);
    Object.assign(this.background, theme.background);
    Object.assign(this.components, theme.components);
    this.theme = themeName;
  }
};

const StoreAppearance = mongoose.model("StoreAppearance", storeAppearanceSchema);

export default StoreAppearance;
