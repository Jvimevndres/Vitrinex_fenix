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
      enum: [
        "minimal", "neon", "dark-pro", "pastel", "gradient-wave", 
        "elegant-boutique", "tech-startup", "modern-agency", "warm-cafe",
        "luxury-brand", "eco-friendly", "vibrant-shop", "professional-services",
        "artistic-studio", "fitness-center", "beauty-salon", "restaurant",
        "custom"
      ],
      default: "minimal",
    },
    themeCategory: {
      type: String,
      enum: ["business", "creative", "modern", "elegant", "vibrant", "minimal"],
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
          // Sans Serif - Modernas
          "Inter",
          "Poppins",
          "Roboto",
          "Montserrat",
          "Lato",
          "Open Sans",
          "Raleway",
          "Nunito",
          "Work Sans",
          "DM Sans",
          "Plus Jakarta Sans",
          "Manrope",
          
          // Serif - Elegantes
          "Playfair Display",
          "Merriweather",
          "Lora",
          "Crimson Text",
          "EB Garamond",
          
          // Display - Especiales
          "Space Grotesk",
          "Bebas Neue",
          "Oswald",
          "Quicksand",
          "Pacifico",
          "Dancing Script",
        ],
        default: "Inter",
      },
      headingSize: { type: String, default: "2.5rem" },
      headingWeight: { type: String, enum: ["300", "400", "500", "600", "700", "800", "900"], default: "700" },
      bodySize: { type: String, default: "1rem" },
      bodyWeight: { type: String, enum: ["300", "400", "500", "600", "700"], default: "400" },
      lineHeight: { type: String, default: "1.6" },
      letterSpacing: { type: String, enum: ["tight", "normal", "wide"], default: "normal" },
      textTransform: { type: String, enum: ["none", "uppercase", "lowercase", "capitalize"], default: "none" },
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
        style: { type: String, enum: ["filled", "outline", "ghost", "soft", "gradient", "glow"], default: "filled" },
        roundness: { type: String, enum: ["none", "sm", "md", "lg", "full"], default: "lg" },
        size: { type: String, enum: ["sm", "md", "lg", "xl"], default: "md" },
        animation: { type: String, enum: ["none", "pulse", "bounce", "shake"], default: "none" },
      },

      // Tarjetas
      cards: {
        style: {
          type: String,
          enum: ["elevated", "outlined", "flat", "glass", "neumorphic", "gradient"],
          default: "elevated",
        },
        roundness: { type: String, enum: ["none", "sm", "md", "lg", "xl", "2xl"], default: "xl" },
        shadow: { type: String, enum: ["none", "sm", "md", "lg", "xl", "2xl"], default: "md" },
        hoverEffect: { type: String, enum: ["none", "lift", "glow", "tilt", "zoom"], default: "lift" },
      },

      // Navegación
      navigation: {
        style: { type: String, enum: ["inline", "centered", "sidebar", "floating"], default: "inline" },
        transparent: { type: Boolean, default: false },
        blur: { type: Boolean, default: true },
        sticky: { type: Boolean, default: true },
      },
      
      // Divisores de sección
      dividers: {
        enabled: { type: Boolean, default: false },
        style: { 
          type: String, 
          enum: ["wave", "curve", "zigzag", "slant", "rounded", "none"], 
          default: "none" 
        },
        color: { type: String, default: "#ffffff" },
      },
      
      // Badges y etiquetas
      badges: {
        style: { 
          type: String, 
          enum: ["solid", "outline", "soft", "pill", "dot"], 
          default: "soft" 
        },
        position: { 
          type: String, 
          enum: ["top-left", "top-right", "bottom-left", "bottom-right"], 
          default: "top-right" 
        },
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
      // Animaciones generales
      animations: { type: Boolean, default: true },
      animationSpeed: { type: String, enum: ["slow", "normal", "fast"], default: "normal" },
      
      // Efectos de fondo
      parallax: { type: Boolean, default: false },
      parallaxSpeed: { type: Number, default: 0.5, min: 0, max: 1 },
      
      // Efectos de scroll
      smoothScroll: { type: Boolean, default: true },
      scrollReveal: { type: Boolean, default: true },
      
      // Efectos hover
      hoverEffects: { type: Boolean, default: true },
      hoverScale: { type: Number, default: 1.05, min: 1, max: 1.2 },
      
      // Efectos visuales modernos
      glassmorphism: { type: Boolean, default: false },
      neomorphism: { type: Boolean, default: false },
      shadows3D: { type: Boolean, default: false },
      
      // Transiciones
      pageTransitions: { type: Boolean, default: true },
      transitionStyle: { 
        type: String, 
        enum: ["fade", "slide", "zoom", "none"], 
        default: "fade" 
      },
      
      // Partículas y decoraciones
      particles: {
        enabled: { type: Boolean, default: false },
        type: { 
          type: String, 
          enum: ["dots", "stars", "bubbles", "confetti", "snow", "hearts", "sparkles", "leaves"], 
          default: "dots" 
        },
        density: { type: Number, default: 50, min: 10, max: 200 },
        color: { type: String, default: "#3b82f6" },
      },
      
      // Cursor personalizado
      customCursor: {
        enabled: { type: Boolean, default: false },
        style: { 
          type: String, 
          enum: ["default", "dot", "ring", "pointer"], 
          default: "default" 
        },
      },
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
    // ============ TEMAS ORIGINALES ============
    minimal: {
      category: "minimal",
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
      typography: {
        fontFamily: "Inter",
        headingSize: "2.5rem",
        headingWeight: "700",
        bodySize: "1rem",
        bodyWeight: "400",
        lineHeight: "1.6",
        letterSpacing: "normal",
        textTransform: "none",
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
      category: "vibrant",
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
      typography: {
        fontFamily: "Poppins",
        headingSize: "3rem",
        headingWeight: "800",
        bodySize: "1.1rem",
        bodyWeight: "400",
        lineHeight: "1.7",
        letterSpacing: "wide",
        textTransform: "uppercase",
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
      category: "modern",
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
      category: "creative",
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
      category: "creative",
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
    
    // ============ NUEVOS TEMAS ============
    "elegant-boutique": {
      category: "elegant",
      colors: {
        primary: "#1c1917",
        secondary: "#d4af37",
        accent: "#8b4513",
        background: "#faf8f6",
        surface: "#ffffff",
        text: "#1c1917",
        textSecondary: "#78716c",
        border: "#e7e5e4",
      },
      background: {
        mode: "gradient",
        gradient: {
          type: "linear",
          direction: "to bottom",
          colors: ["#faf8f6", "#ffffff"],
        },
      },
      typography: {
        fontFamily: "Playfair Display",
      },
      components: {
        buttons: { style: "outline", roundness: "none", size: "md" },
        cards: { style: "elevated", roundness: "sm", shadow: "sm", hoverEffect: "lift" },
        dividers: { enabled: true, style: "curve", color: "#e7e5e4" },
      },
      effects: {
        animations: true,
        scrollReveal: true,
        hoverScale: 1.02,
      },
    },
    
    "tech-startup": {
      category: "modern",
      colors: {
        primary: "#4f46e5",
        secondary: "#06b6d4",
        accent: "#8b5cf6",
        background: "#0f172a",
        surface: "#1e293b",
        text: "#f8fafc",
        textSecondary: "#cbd5e1",
        border: "#334155",
      },
      background: {
        mode: "gradient",
        gradient: {
          type: "linear",
          direction: "135deg",
          colors: ["#0f172a", "#1e293b", "#334155"],
        },
      },
      typography: {
        fontFamily: "Space Grotesk",
        headingSize: "2.8rem",
        headingWeight: "700",
        bodySize: "1rem",
        bodyWeight: "400",
        lineHeight: "1.6",
        letterSpacing: "tight",
        textTransform: "none",
      },
      components: {
        buttons: { style: "gradient", roundness: "lg", size: "lg", animation: "pulse" },
        cards: { style: "glass", roundness: "xl", shadow: "2xl", hoverEffect: "glow" },
        navigation: { transparent: true, blur: true, sticky: true },
      },
      effects: {
        glassmorphism: true,
        particles: { enabled: true, type: "dots", density: 50, color: "#4f46e5" },
        pageTransitions: true,
      },
    },
    
    "modern-agency": {
      category: "modern",
      colors: {
        primary: "#000000",
        secondary: "#ffffff",
        accent: "#ff6b6b",
        background: "#ffffff",
        surface: "#f5f5f5",
        text: "#000000",
        textSecondary: "#666666",
        border: "#dddddd",
      },
      background: {
        mode: "solid",
        solid: "#ffffff",
      },
      typography: {
        fontFamily: "Inter",
      },
      components: {
        buttons: { style: "filled", roundness: "full", size: "lg" },
        cards: { style: "flat", roundness: "2xl", shadow: "none", hoverEffect: "tilt" },
        dividers: { enabled: true, style: "slant" },
      },
      effects: {
        shadows3D: true,
        scrollReveal: true,
        hoverScale: 1.08,
      },
    },
    
    "warm-cafe": {
      category: "business",
      colors: {
        primary: "#8b4513",
        secondary: "#d2691e",
        accent: "#cd853f",
        background: "#fdf6e3",
        surface: "#fff9e6",
        text: "#3e2723",
        textSecondary: "#6d4c41",
        border: "#d7ccc8",
      },
      background: {
        mode: "pattern",
        pattern: {
          type: "dots",
          color: "#d7ccc8",
          opacity: 0.2,
          scale: 1,
        },
      },
      typography: {
        fontFamily: "Lato",
      },
      components: {
        buttons: { style: "soft", roundness: "lg", size: "md" },
        cards: { style: "elevated", roundness: "lg", shadow: "md", hoverEffect: "lift" },
      },
      effects: {
        animations: true,
        smoothScroll: true,
      },
    },
    
    "luxury-brand": {
      category: "elegant",
      colors: {
        primary: "#1a1a1a",
        secondary: "#c9b037",
        accent: "#ffffff",
        background: "#000000",
        surface: "#1a1a1a",
        text: "#ffffff",
        textSecondary: "#a0a0a0",
        border: "#333333",
      },
      background: {
        mode: "gradient",
        gradient: {
          type: "radial",
          colors: ["#1a1a1a", "#000000"],
        },
      },
      typography: {
        fontFamily: "Playfair Display",
      },
      components: {
        buttons: { style: "outline", roundness: "none", size: "md" },
        cards: { style: "neumorphic", roundness: "lg", shadow: "lg", hoverEffect: "glow" },
        badges: { style: "solid", position: "top-right" },
      },
      effects: {
        neomorphism: true,
        parallax: true,
        parallaxSpeed: 0.3,
      },
    },
    
    "eco-friendly": {
      category: "business",
      colors: {
        primary: "#059669",
        secondary: "#84cc16",
        accent: "#fbbf24",
        background: "#f0fdf4",
        surface: "#dcfce7",
        text: "#14532d",
        textSecondary: "#166534",
        border: "#bbf7d0",
      },
      background: {
        mode: "gradient",
        gradient: {
          type: "linear",
          direction: "to bottom right",
          colors: ["#f0fdf4", "#dcfce7", "#bbf7d0"],
        },
      },
      typography: {
        fontFamily: "Poppins",
      },
      components: {
        buttons: { style: "soft", roundness: "full", size: "md" },
        cards: { style: "flat", roundness: "xl", shadow: "sm", hoverEffect: "zoom" },
        dividers: { enabled: true, style: "wave", color: "#dcfce7" },
      },
      effects: {
        animations: true,
        scrollReveal: true,
      },
    },
    
    "vibrant-shop": {
      category: "vibrant",
      colors: {
        primary: "#e11d48",
        secondary: "#f59e0b",
        accent: "#8b5cf6",
        background: "#ffffff",
        surface: "#fef2f2",
        text: "#1f2937",
        textSecondary: "#6b7280",
        border: "#fecaca",
      },
      background: {
        mode: "gradient",
        gradient: {
          type: "linear",
          direction: "135deg",
          colors: ["#ffffff", "#fef2f2", "#fee2e2"],
        },
      },
      typography: {
        fontFamily: "Poppins",
      },
      components: {
        buttons: { style: "gradient", roundness: "full", size: "lg", animation: "bounce" },
        cards: { style: "elevated", roundness: "xl", shadow: "xl", hoverEffect: "lift" },
        badges: { style: "pill", position: "top-right" },
      },
      effects: {
        particles: { enabled: true, type: "confetti", density: 30 },
        hoverScale: 1.1,
      },
    },
    
    "professional-services": {
      category: "business",
      colors: {
        primary: "#1e40af",
        secondary: "#3b82f6",
        accent: "#60a5fa",
        background: "#ffffff",
        surface: "#eff6ff",
        text: "#1e3a8a",
        textSecondary: "#3b82f6",
        border: "#bfdbfe",
      },
      background: {
        mode: "solid",
        solid: "#ffffff",
      },
      typography: {
        fontFamily: "Roboto",
      },
      components: {
        buttons: { style: "filled", roundness: "md", size: "md" },
        cards: { style: "outlined", roundness: "lg", shadow: "sm", hoverEffect: "lift" },
      },
      effects: {
        smoothScroll: true,
        scrollReveal: true,
      },
    },
    
    "artistic-studio": {
      category: "creative",
      colors: {
        primary: "#7c3aed",
        secondary: "#ec4899",
        accent: "#f59e0b",
        background: "#faf5ff",
        surface: "#f3e8ff",
        text: "#581c87",
        textSecondary: "#7e22ce",
        border: "#e9d5ff",
      },
      background: {
        mode: "gradient",
        gradient: {
          type: "linear",
          direction: "to bottom right",
          colors: ["#faf5ff", "#fce7f3", "#fed7aa"],
        },
      },
      typography: {
        fontFamily: "Montserrat",
      },
      components: {
        buttons: { style: "gradient", roundness: "lg", size: "lg" },
        cards: { style: "glass", roundness: "2xl", shadow: "xl", hoverEffect: "tilt" },
        dividers: { enabled: true, style: "zigzag", color: "#e9d5ff" },
      },
      effects: {
        glassmorphism: true,
        parallax: true,
        particles: { enabled: true, type: "bubbles", density: 40, color: "#7c3aed" },
      },
    },
    
    "fitness-center": {
      category: "vibrant",
      colors: {
        primary: "#dc2626",
        secondary: "#ea580c",
        accent: "#f59e0b",
        background: "#1c1917",
        surface: "#292524",
        text: "#fafaf9",
        textSecondary: "#d6d3d1",
        border: "#44403c",
      },
      background: {
        mode: "gradient",
        gradient: {
          type: "linear",
          direction: "to bottom",
          colors: ["#1c1917", "#292524", "#1c1917"],
        },
      },
      typography: {
        fontFamily: "Roboto",
      },
      components: {
        buttons: { style: "glow", roundness: "full", size: "xl", animation: "pulse" },
        cards: { style: "elevated", roundness: "xl", shadow: "2xl", hoverEffect: "zoom" },
      },
      effects: {
        shadows3D: true,
        hoverScale: 1.05,
      },
    },
    
    "beauty-salon": {
      category: "elegant",
      colors: {
        primary: "#db2777",
        secondary: "#ec4899",
        accent: "#f472b6",
        background: "#fdf2f8",
        surface: "#fce7f3",
        text: "#831843",
        textSecondary: "#9f1239",
        border: "#fbcfe8",
      },
      background: {
        mode: "gradient",
        gradient: {
          type: "radial",
          colors: ["#fdf2f8", "#fce7f3"],
        },
      },
      typography: {
        fontFamily: "Playfair Display",
      },
      components: {
        buttons: { style: "soft", roundness: "full", size: "md" },
        cards: { style: "elevated", roundness: "2xl", shadow: "md", hoverEffect: "lift" },
        badges: { style: "dot", position: "top-right" },
      },
      effects: {
        animations: true,
        scrollReveal: true,
        particles: { enabled: true, type: "stars", density: 25, color: "#db2777" },
      },
    },
    
    "restaurant": {
      category: "business",
      colors: {
        primary: "#b91c1c",
        secondary: "#dc2626",
        accent: "#fbbf24",
        background: "#fffbeb",
        surface: "#fef3c7",
        text: "#78350f",
        textSecondary: "#92400e",
        border: "#fde68a",
      },
      background: {
        mode: "image",
        image: {
          opacity: 0.1,
        },
        solid: "#fffbeb",
      },
      typography: {
        fontFamily: "Lato",
      },
      components: {
        buttons: { style: "filled", roundness: "lg", size: "lg" },
        cards: { style: "elevated", roundness: "xl", shadow: "lg", hoverEffect: "lift" },
        dividers: { enabled: true, style: "rounded", color: "#fde68a" },
      },
      effects: {
        smoothScroll: true,
        hoverEffects: true,
      },
    },
  };

  const theme = themes[themeName];
  if (theme) {
    // Aplicar colores
    if (theme.colors) {
      Object.assign(this.colors, theme.colors);
    }
    
    // Aplicar fondo
    if (theme.background) {
      Object.assign(this.background, theme.background);
    }
    
    // Aplicar componentes
    if (theme.components) {
      if (theme.components.buttons) {
        Object.assign(this.components.buttons, theme.components.buttons);
      }
      if (theme.components.cards) {
        Object.assign(this.components.cards, theme.components.cards);
      }
      if (theme.components.navigation) {
        Object.assign(this.components.navigation, theme.components.navigation);
      }
      if (theme.components.dividers) {
        Object.assign(this.components.dividers, theme.components.dividers);
      }
      if (theme.components.badges) {
        Object.assign(this.components.badges, theme.components.badges);
      }
    }
    
    // Aplicar tipografía
    if (theme.typography) {
      Object.assign(this.typography, theme.typography);
    }
    
    // Aplicar efectos
    if (theme.effects) {
      Object.assign(this.effects, theme.effects);
    }
    
    this.theme = themeName;
    this.themeCategory = theme.category;
  }
};

const StoreAppearance = mongoose.model("StoreAppearance", storeAppearanceSchema);

export default StoreAppearance;
