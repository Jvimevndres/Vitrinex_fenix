// src/pages/StorePublicPage.jsx
import { useEffect, useMemo, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getStoreById,
  getStoreAvailability,
  createAppointment,
  listStoreProductsPublic,
  createStoreOrder,
} from "../api/store";
import {
  getStoreServices,
  getAvailabilityByDate,
  createAppointmentWithService,
  getSpecialDays,
} from "../api/services";
import { getStoreAppearance } from "../api/appearance"; // 🎨 Personalización visual
import MainHeader from "../components/MainHeader";
import Footer from "../components/Footer";
import ModernProductsStore from "../components/ModernProductsStore"; // 🛒 Tienda moderna
import PromotionalBanner from "../components/PromotionalBanner"; // 📢 Banners promocionales
import ParticlesBackground from "../components/ParticlesBackground"; // 🎨 Partículas animadas
import CustomerChatModal from "../components/CustomerChatModal"; // 💬 Chat con la tienda
import ProductReviews from "../components/ProductReviews"; // ⭐ Reseñas y comentarios
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { 
  FaMapMarkerAlt, FaLightbulb, FaBullseye, FaBolt, FaStar, FaFire, 
  FaGem, FaTrophy, FaMagic, FaPalette, FaRocket, FaDumbbell, 
  FaCheckCircle, FaClock, FaShieldAlt, FaHeart, FaGift, FaThumbsUp,
  FaUsers, FaCog, FaLeaf, FaMedal, FaHandshake, FaAward, FaCalendarAlt,
  FaSearch, FaComments
} from 'react-icons/fa';

// ---------- Diccionarios ----------
const DAY_LABELS = {
  monday: "Lunes",
  tuesday: "Martes",
  wednesday: "Miércoles",
  thursday: "Jueves",
  friday: "Viernes",
  saturday: "Sábado",
  sunday: "Domingo",
};
const DAY_FROM_INDEX = {
  0: "sunday",
  1: "monday",
  2: "tuesday",
  3: "wednesday",
  4: "thursday",
  5: "friday",
  6: "saturday",
};
const DAY_ORDER = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

const currencyFormatter = new Intl.NumberFormat("es-CL", {
  style: "currency",
  currency: "CLP",
  minimumFractionDigits: 0,
});

// ---------- helpers de estilo ----------
function hexToRgba(hex, alpha = 0.15) {
  if (!hex) return `rgba(0,0,0,${alpha})`;
  let h = hex.replace("#", "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  const bigint = parseInt(h, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function buildBackgroundStyle(store) {
  const mode = store?.bgMode || "gradient";
  const top = store?.bgColorTop || "#e8d7ff";
  const bottom = store?.bgColorBottom || "#ffffff";
  const img = store?.bgImageUrl || "";

  if (mode === "solid") {
    return {
      backgroundColor: top,
      backgroundAttachment: "fixed",
    };
  }

  if (mode === "image" && img) {
    return {
      backgroundImage: `linear-gradient(to bottom, ${hexToRgba(
        "#000",
        0.5
      )} 0%, ${hexToRgba("#000", 0.7)} 60%), url(${img})`,
      backgroundRepeat: "no-repeat",
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundAttachment: "fixed",
      backgroundColor: top,
    };
  }

  // Degradado + pequeño radial para que se vea más "pro"
  return {
    backgroundImage: `
      radial-gradient(circle at top, ${hexToRgba(
        top,
        0.7
      )} 0, ${hexToRgba(bottom, 0)} 55%),
      linear-gradient(to bottom, ${top} 0%, ${bottom} 100%)
    `,
    backgroundAttachment: "fixed",
  };
}

function buildPatternStyle(store) {
  const pattern = store?.bgPattern || "none";
  const color = hexToRgba(store?.accentColor || "#0f172a", 0.12);
  const base = {
    position: "absolute",
    inset: 0,
    pointerEvents: "none",
    zIndex: 0,
  };

  if (pattern === "dots") {
    return {
      ...base,
      backgroundImage: `radial-gradient(${color} 1px, transparent 1px)`,
      backgroundSize: "14px 14px",
    };
  }
  if (pattern === "grid") {
    return {
      ...base,
      backgroundImage: `linear-gradient(${color} 1px, transparent 1px), linear-gradient(90deg, ${color} 1px, transparent 1px)`,
      backgroundSize: "28px 28px",
    };
  }
  if (pattern === "noise") {
    return {
      ...base,
      opacity: 0.15,
      backgroundImage: `radial-gradient(${color} 0.7px, transparent 0.7px)`,
      backgroundSize: "6px 6px",
    };
  }
  return null;
}

function buildStoreHeaderStyle(store, appearance) {
  const primary = appearance?.colors?.primary || store?.primaryColor || "#2563eb";
  const accent = appearance?.colors?.secondary || store?.accentColor || "#0f172a";

  const headerStyles = {
    backgroundImage: `linear-gradient(90deg, ${primary} 0%, ${accent} 50%, ${primary} 100%)`,
  };

  // Aplicar efectos de blur si están configurados
  if (appearance?.background?.headerBlur && appearance.background.headerBlur > 0) {
    headerStyles.backdropFilter = `blur(${appearance.background.headerBlur}px)`;
    headerStyles.WebkitBackdropFilter = `blur(${appearance.background.headerBlur}px)`;
  }

  // Aplicar opacidad si está configurada
  if (appearance?.background?.headerOpacity && appearance.background.headerOpacity < 1) {
    // Convertir hex a rgba
    const hexToRgb = (hex) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : null;
    };

    const rgb1 = hexToRgb(primary);
    const rgb2 = hexToRgb(accent);
    
    if (rgb1 && rgb2) {
      headerStyles.backgroundImage = `linear-gradient(90deg, rgba(${rgb1.r}, ${rgb1.g}, ${rgb1.b}, ${appearance.background.headerOpacity}) 0%, rgba(${rgb2.r}, ${rgb2.g}, ${rgb2.b}, ${appearance.background.headerOpacity}) 50%, rgba(${rgb1.r}, ${rgb1.g}, ${rgb1.b}, ${appearance.background.headerOpacity}) 100%)`;
    }
  }

  return headerStyles;
}

// 🎨 Nuevas funciones para aplicar personalización visual
function getAppearanceColors(appearance, store) {
  if (!appearance?.colors) {
    // Fallback a colores legacy del store
    return {
      primary: store?.primaryColor || "#2563eb",
      secondary: store?.accentColor || "#0f172a",
      accent: store?.primaryColor || "#2563eb",
      background: store?.bgColorTop || "#ffffff",
      surface: "#ffffff",
      text: "#1e293b",
      textSecondary: "#64748b",
      border: "#e2e8f0",
      success: "#10b981",
      error: "#ef4444",
      warning: "#f59e0b",
    };
  }
  return appearance.colors;
}

function buildAppearanceBackground(appearance, store) {
  console.log('🎨 buildAppearanceBackground called:', {
    hasAppearance: !!appearance,
    hasBackground: !!appearance?.background,
    mode: appearance?.background?.mode,
    backgroundData: appearance?.background,
    appearanceColors: appearance?.colors
  });

  if (!appearance?.background) {
    // Fallback a sistema legacy
    console.log('⚠️ No appearance.background, usando legacy');
    return buildBackgroundStyle(store);
  }

  const { mode, solid, gradient, image, pattern } = appearance.background;

  if (mode === "solid") {
    const style = {
      backgroundColor: solid?.color || appearance?.colors?.background || "#ffffff",
      backgroundAttachment: "fixed",
    };
    console.log('✅ Background SOLID aplicado:', style);
    return style;
  }

  if (mode === "gradient") {
    const gradient = appearance.background.gradient;
    
    // Si no hay datos de gradient, usar colores primario y secundario por defecto
    if (!gradient || !gradient.colors || gradient.colors.length < 2) {
      const primary = appearance?.colors?.primary || "#3b82f6";
      const secondary = appearance?.colors?.secondary || "#8b5cf6";
      
      const style = {
        backgroundImage: `linear-gradient(to bottom, ${primary} 0%, ${secondary} 100%)`,
        backgroundAttachment: "fixed",
      };
      console.log('✅ Background GRADIENT aplicado (usando colores por defecto):', style);
      return style;
    }
    
    // Si hay datos completos de gradient
    const { type, direction, colors, stops } = gradient;
    const gradientColors = colors.map((c, i) => 
      `${c} ${stops?.[i] || (i * 100 / (colors.length - 1))}%`
    ).join(", ");

    const style = {
      backgroundImage: type === "radial"
        ? `radial-gradient(circle, ${gradientColors})`
        : `linear-gradient(${direction || "to bottom"}, ${gradientColors})`,
      backgroundAttachment: "fixed",
    };
    console.log('✅ Background GRADIENT aplicado:', style);
    return style;
  }

  if (mode === "image" && image?.url) {
    const style = {
      backgroundImage: `linear-gradient(to bottom, ${hexToRgba("#000", image.opacity || 0.5)} 0%, ${hexToRgba("#000", (image.opacity || 0.5) * 1.2)} 60%), url(${image.url})`,
      backgroundRepeat: "no-repeat",
      backgroundSize: image.size || "cover",
      backgroundPosition: image.position || "center",
      backgroundAttachment: "fixed",
    };
    console.log('✅ Background IMAGE aplicado:', style);
    return style;
  }

  if (mode === "pattern" && pattern) {
    const patternColor = hexToRgba(pattern.color || "#000000", pattern.opacity || 0.1);
    const scale = pattern.scale || 1;
    
    let patternImage = "";
    switch (pattern.type) {
      case "dots":
        patternImage = `radial-gradient(${patternColor} ${scale}px, transparent ${scale}px)`;
        break;
      case "waves":
        patternImage = `repeating-linear-gradient(45deg, ${patternColor}, ${patternColor} ${10 * scale}px, transparent ${10 * scale}px, transparent ${20 * scale}px)`;
        break;
      case "grid":
        patternImage = `linear-gradient(${patternColor} ${scale}px, transparent ${scale}px), linear-gradient(90deg, ${patternColor} ${scale}px, transparent ${scale}px)`;
        break;
      default:
        patternImage = `radial-gradient(${patternColor} ${scale}px, transparent ${scale}px)`;
    }

    const style = {
      backgroundColor: appearance.colors?.background || "#ffffff",
      backgroundImage: patternImage,
      backgroundSize: pattern.type === "grid" ? `${30 * scale}px ${30 * scale}px` : `${20 * scale}px ${20 * scale}px`,
      backgroundAttachment: "fixed",
    };
    console.log('✅ Background PATTERN aplicado:', style);
    return style;
  }

  // Fallback
  console.log('⚠️ No mode matched, usando legacy');
  return buildBackgroundStyle(store);
}

function getButtonStyle(appearance, colors, variant = "primary") {
  if (!appearance?.components?.buttons) {
    // Fallback clásico
    return variant === "primary" 
      ? { backgroundColor: colors.primary, color: "#ffffff" }
      : { backgroundColor: colors.surface, color: colors.text, border: `1px solid ${colors.border}` };
  }

  const { style, roundness, size } = appearance.components.buttons;
  
  const radiusMap = {
    none: "0px",
    sm: "0.375rem",
    md: "0.5rem",
    lg: "0.75rem",
    full: "9999px",
  };

  const sizeMap = {
    sm: { padding: "0.5rem 1rem", fontSize: "0.875rem" },
    md: { padding: "0.625rem 1.25rem", fontSize: "1rem" },
    lg: { padding: "0.75rem 1.5rem", fontSize: "1.125rem" },
  };

  let baseStyle = {
    borderRadius: radiusMap[roundness] || radiusMap.md,
    ...sizeMap[size || "md"],
  };

  if (variant === "primary") {
    switch (style) {
      case "solid":
        return { ...baseStyle, backgroundColor: colors.primary, color: "#ffffff" };
      case "outline":
        return { ...baseStyle, backgroundColor: "transparent", color: colors.primary, border: `2px solid ${colors.primary}` };
      case "ghost":
        return { ...baseStyle, backgroundColor: hexToRgba(colors.primary, 0.1), color: colors.primary };
      case "gradient":
        return { ...baseStyle, backgroundImage: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`, color: "#ffffff" };
      default:
        return { ...baseStyle, backgroundColor: colors.primary, color: "#ffffff" };
    }
  } else {
    return { ...baseStyle, backgroundColor: colors.surface, color: colors.text, border: `1px solid ${colors.border}` };
  }
}

function getCardStyle(appearance, colors) {
  if (!appearance?.components?.cards) {
    return {
      style: {
        backgroundColor: colors.surface,
        borderRadius: "0.75rem",
        boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)",
      },
      className: ''
    };
  }

  const { style, roundness, shadow } = appearance.components.cards;

  const radiusMap = {
    none: "0px",
    sm: "0.375rem",
    md: "0.75rem",
    lg: "1rem",
    xl: "1.5rem",
  };

  const shadowMap = {
    none: "none",
    sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    md: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
    lg: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
    xl: "0 20px 25px -5px rgb(0 0 0 / 0.1)",
  };

  let baseStyle = {
    borderRadius: radiusMap[roundness] || radiusMap.md,
    boxShadow: shadowMap[shadow] || shadowMap.md,
  };

  // Determinar clases CSS dinámicas basadas en efectos
  let dynamicClasses = [];
  if (appearance?.effects?.glassmorphism) {
    dynamicClasses.push('glass-card');
  }
  if (appearance?.effects?.neomorphism) {
    dynamicClasses.push('neomorph-card');
  }
  if (appearance?.effects?.shadows3D) {
    dynamicClasses.push('shadow-3d');
  }

  let cardStyle = {};
  switch (style) {
    case "elevated":
      cardStyle = { ...baseStyle, backgroundColor: colors.surface };
      break;
    case "outlined":
      cardStyle = { ...baseStyle, backgroundColor: colors.surface, border: `1px solid ${colors.border}` };
      break;
    case "flat":
      cardStyle = { ...baseStyle, backgroundColor: colors.surface, boxShadow: 'none' };
      break;
    case "glass":
      cardStyle = { ...baseStyle, background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)', border: `1px solid rgba(255, 255, 255, 0.2)` };
      dynamicClasses.push('glass-card'); // Forzar glassmorphism
      break;
    case "neumorphic":
      cardStyle = { ...baseStyle, backgroundColor: colors.surface };
      dynamicClasses.push('neomorph-card'); // Forzar neomorphism
      break;
    case "gradient":
      cardStyle = { ...baseStyle, backgroundImage: `linear-gradient(135deg, ${hexToRgba(colors.primary, 0.1)}, ${hexToRgba(colors.secondary, 0.1)})` };
      break;
    case "filled":
      cardStyle = { ...baseStyle, backgroundColor: hexToRgba(colors.primary, 0.05) };
      break;
    default:
      cardStyle = { ...baseStyle, backgroundColor: colors.surface };
  }

  return {
    style: cardStyle,
    className: dynamicClasses.join(' ')
  };
}

// Función para obtener el componente de icono basado en la clave
function getIconComponent(iconKey) {
  const iconMap = {
    star: FaStar,
    fire: FaFire,
    gem: FaGem,
    trophy: FaTrophy,
    magic: FaMagic,
    palette: FaPalette,
    rocket: FaRocket,
    dumbbell: FaDumbbell,
    checkCircle: FaCheckCircle,
    clock: FaClock,
    shield: FaShieldAlt,
    heart: FaHeart,
    gift: FaGift,
    thumbsUp: FaThumbsUp,
    users: FaUsers,
    cog: FaCog,
    leaf: FaLeaf,
    medal: FaMedal,
    handshake: FaHandshake,
    award: FaAward,
    lightbulb: FaLightbulb,
    bullseye: FaBullseye,
    bolt: FaBolt,
  };
  return iconMap[iconKey] || FaStar; // Default a FaStar si no se encuentra
}

export default function StorePublicPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const bookingSectionRef = useRef(null);
  const productsSectionRef = useRef(null);
  const scrollToSection = (ref) =>
    ref?.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 🎨 Personalización visual
  const [appearance, setAppearance] = useState(null);

  const [availability, setAvailability] = useState([]);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [availabilityError, setAvailabilityError] = useState("");
  
  // 📅 Días especiales configurados individualmente
  const [specialDays, setSpecialDays] = useState([]);

  // 🆕 SERVICIOS Y FLUJO PASO A PASO
  const [allServices, setAllServices] = useState([]); // Todos los servicios sin filtrar
  const [servicesLoading, setServicesLoading] = useState(false);
  const [selectedTags, setSelectedTags] = useState([]); // Tags seleccionados para filtrar
  const [selectedCategory, setSelectedCategory] = useState(""); // Categoría seleccionada
  const [searchText, setSearchText] = useState(""); // Texto de búsqueda
  const [bookingStep, setBookingStep] = useState(1); // 1=servicio, 2=fecha, 3=hora, 4=datos
  const [selectedService, setSelectedService] = useState(null);
  const [dateSlots, setDateSlots] = useState([]);
  const [dateSlotsLoading, setDateSlotsLoading] = useState(false);
  
  // Inicializar calendario en el mes actual
  const [calendarValue, setCalendarValue] = useState(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  });
  
  // 🆕 Cache de disponibilidad por fecha (para marcar días en verde correctamente)
  const [availabilityCache, setAvailabilityCache] = useState({}); // { "2025-11-19": { hasSlots: true, loading: false } }
  const [cacheVersion, setCacheVersion] = useState(0); // Para forzar re-render del calendario

  const [bookingForm, setBookingForm] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    date: "",
    slot: "",
    notes: "",
  });
  const [bookingSubmitting, setBookingSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [bookingMsg, setBookingMsg] = useState("");
  const [createdBookingId, setCreatedBookingId] = useState(null); // 🆕 Para mostrar link al chat

  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productsError, setProductsError] = useState("");

  const [orderItems, setOrderItems] = useState([]);
  const [orderForm, setOrderForm] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    customerAddress: "",
    notes: "",
  });
  const [orderSubmitting, setOrderSubmitting] = useState(false);
  const [orderError, setOrderError] = useState("");
  const [orderMsg, setOrderMsg] = useState("");
  const [createdOrderId, setCreatedOrderId] = useState(null); // 🆕 Para mostrar link al chat
  
  // 💬 Estados para modal de chat
  const [showChatModal, setShowChatModal] = useState(false);
  const [chatType, setChatType] = useState(""); // "order" | "booking"
  const [chatId, setChatId] = useState(null);

  // reset al cambiar tienda
  useEffect(() => {
    setAvailability([]);
    setAvailabilityError("");
    setBookingForm({
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      date: "",
      slot: "",
      notes: "",
    });
    setBookingError("");
    setBookingMsg("");

    setProducts([]);
    setProductsError("");
    setOrderItems([]);
    setOrderForm({
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      customerAddress: "",
      notes: "",
    });
    setOrderError("");
    setOrderMsg("");
  }, [id]);

  // cargar tienda
  useEffect(() => {
    const loadStore = async () => {
      try {
        if (!id) {
          setError("No se encontró el identificador de la tienda.");
          setLoading(false);
          return;
        }

        setLoading(true);
        setError("");
        const { data } = await getStoreById(id);
        setStore(data);

        // 🎨 Cargar personalización visual (silently, no bloquea la tienda)
        try {
          const appearanceData = await getStoreAppearance(id);
          console.log('🎨 Appearance cargado:', {
            version: appearanceData.version,
            theme: appearanceData.theme,
            effectsCount: Object.keys(appearanceData.effects || {}).length,
            effects: appearanceData.effects
          });
          setAppearance(appearanceData);
        } catch (err) {
          console.warn('⚠️ No hay personalización visual configurada');
          // No hay personalización visual configurada, usando valores por defecto
        }
      } catch (err) {
        console.error(err);
        setError("No se pudo cargar la información del negocio.");
      } finally {
        setLoading(false);
      }
    };

    loadStore();
  }, [id]);

  // cargar según modo
  useEffect(() => {
    if (!store?.mode) return;
    if (store.mode === "bookings") {
      loadAvailability();
      loadServices(); // 🆕 Cargar servicios
    }
    if (store.mode === "products") loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store?.mode, id]);

  // 🎨 Aplicar efectos globales cuando cambie appearance
  useEffect(() => {
    if (!appearance?.effects) return;

    const effects = appearance.effects;

    // 1. Smooth Scroll
    if (effects.smoothScroll) {
      document.documentElement.style.scrollBehavior = 'smooth';
    } else {
      document.documentElement.style.scrollBehavior = 'auto';
    }

    // 2. Scroll Reveal - Aplicar animación de entrada a elementos
    if (effects.scrollReveal) {
      const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      };

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal-visible');
            observer.unobserve(entry.target);
          }
        });
      }, observerOptions);

      // Observar secciones principales
      setTimeout(() => {
        const sections = document.querySelectorAll('section, .card-item, .service-card, .product-card');
        sections.forEach(section => {
          section.classList.add('reveal-element');
          observer.observe(section);
        });
      }, 100);

      // Cleanup
      return () => observer.disconnect();
    }
  }, [appearance?.effects]);

  // 🎨 Aplicar estilos CSS dinámicos para efectos
  useEffect(() => {
    if (!appearance?.effects) return;

    const styleId = 'dynamic-effects-styles';
    let styleElement = document.getElementById(styleId);
    
    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = styleId;
      document.head.appendChild(styleElement);
    }

    const effects = appearance.effects;
    let css = '';

    // Scroll Reveal Animation
    if (effects.scrollReveal) {
      css += `
        .reveal-element {
          opacity: 0;
          transform: translateY(30px);
          transition: opacity 0.6s ease, transform 0.6s ease;
        }
        .reveal-visible {
          opacity: 1;
          transform: translateY(0);
        }
      `;
    }

    // Glassmorphism para cards
    if (effects.glassmorphism) {
      css += `
        .glass-card {
          background: rgba(255, 255, 255, 0.1) !important;
          backdrop-filter: blur(10px) !important;
          -webkit-backdrop-filter: blur(10px) !important;
          border: 1px solid rgba(255, 255, 255, 0.2) !important;
          box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.15) !important;
        }
      `;
    }

    // Neomorphism para cards
    if (effects.neomorphism) {
      css += `
        .neomorph-card {
          background: ${appearance?.colors?.surface || '#f0f0f0'} !important;
          box-shadow: 
            8px 8px 16px rgba(163, 177, 198, 0.6),
            -8px -8px 16px rgba(255, 255, 255, 0.5) !important;
          border: none !important;
        }
        .neomorph-card:hover {
          box-shadow: 
            4px 4px 8px rgba(163, 177, 198, 0.6),
            -4px -4px 8px rgba(255, 255, 255, 0.5) !important;
        }
      `;
    }

    // 3D Shadows
    if (effects.shadows3D) {
      css += `
        .shadow-3d {
          box-shadow: 
            0 1px 3px rgba(0, 0, 0, 0.12),
            0 2px 6px rgba(0, 0, 0, 0.08),
            0 4px 12px rgba(0, 0, 0, 0.05),
            0 8px 24px rgba(0, 0, 0, 0.03) !important;
        }
        .shadow-3d:hover {
          box-shadow: 
            0 2px 6px rgba(0, 0, 0, 0.12),
            0 4px 12px rgba(0, 0, 0, 0.08),
            0 8px 24px rgba(0, 0, 0, 0.05),
            0 16px 48px rgba(0, 0, 0, 0.03) !important;
        }
      `;
    }

    // Parallax effect (aplicado con CSS transform)
    if (effects.parallax) {
      css += `
        .parallax-bg {
          transform: translateZ(-1px) scale(2);
          will-change: transform;
        }
      `;
    }

    // Glow effect
    if (effects.glow) {
      css += `
        .glow-effect {
          filter: drop-shadow(0 0 10px rgba(59, 130, 246, 0.5));
          transition: filter 0.3s ease;
        }
        .glow-effect:hover {
          filter: drop-shadow(0 0 20px rgba(59, 130, 246, 0.8));
        }
      `;
    }

    // Animated Gradient
    if (effects.animatedGradient) {
      css += `
        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animated-gradient {
          background-size: 200% 200%;
          animation: gradient-shift 8s ease infinite;
        }
      `;
    }

    // Floating Hover
    if (effects.floatingHover) {
      css += `
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .floating-hover {
          transition: transform 0.3s ease;
        }
        .floating-hover:hover {
          animation: float 2s ease-in-out infinite;
        }
      `;
    }

    // Blur Effect
    if (effects.blur) {
      css += `
        .blur-effect {
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
        }
        .blur-effect:hover {
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
        }
      `;
    }

    // Color Shift
    if (effects.colorShift) {
      css += `
        @keyframes colorShift {
          0%, 100% { filter: hue-rotate(0deg); }
          50% { filter: hue-rotate(30deg); }
        }
        .color-shift {
          animation: colorShift 10s ease-in-out infinite;
        }
      `;
    }

    // Morphing
    if (effects.morphing) {
      css += `
        @keyframes morph {
          0%, 100% { border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%; }
          25% { border-radius: 70% 30% 30% 70% / 70% 70% 30% 30%; }
          50% { border-radius: 50% 50% 50% 50% / 50% 50% 50% 50%; }
          75% { border-radius: 30% 70% 70% 30% / 70% 30% 30% 70%; }
        }
        .morphing {
          animation: morph 8s ease-in-out infinite;
        }
      `;
    }

    // Ripple Effect
    if (effects.ripple) {
      css += `
        @keyframes ripple {
          0% { transform: scale(0); opacity: 1; }
          100% { transform: scale(4); opacity: 0; }
        }
        .ripple-effect {
          position: relative;
          overflow: hidden;
        }
        .ripple-effect::after {
          content: '';
          position: absolute;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.6);
          width: 100px;
          height: 100px;
          margin-left: -50px;
          margin-top: -50px;
          animation: ripple 0.8s;
          opacity: 0;
        }
        .ripple-effect:active::after {
          opacity: 1;
        }
      `;
    }

    // Holographic Effect
    if (effects.holographic) {
      css += `
        @keyframes holographic {
          0% { 
            background-position: 0% 50%;
            filter: hue-rotate(0deg);
          }
          50% { 
            background-position: 100% 50%;
            filter: hue-rotate(180deg);
          }
          100% { 
            background-position: 0% 50%;
            filter: hue-rotate(360deg);
          }
        }
        .holographic {
          background: linear-gradient(
            135deg,
            rgba(255, 0, 255, 0.1) 0%,
            rgba(0, 255, 255, 0.1) 25%,
            rgba(255, 255, 0, 0.1) 50%,
            rgba(0, 255, 255, 0.1) 75%,
            rgba(255, 0, 255, 0.1) 100%
          );
          background-size: 400% 400%;
          animation: holographic 6s ease-in-out infinite;
        }
      `;
    }

    styleElement.textContent = css;

    return () => {
      if (styleElement && styleElement.parentNode) {
        styleElement.parentNode.removeChild(styleElement);
      }
    };
  }, [appearance?.effects, appearance?.colors]);

  const loadAvailability = async () => {
    try {
      setAvailabilityLoading(true);
      setAvailabilityError("");
      const { data } = await getStoreAvailability(id);
      const av = Array.isArray(data?.availability) ? data.availability : [];
      setAvailability(av);
    } catch (err) {
      console.error(err);
      setAvailability([]);
      setAvailabilityError(
        err?.response?.data?.message ||
          "No se pudo cargar la disponibilidad"
      );
    } finally {
      setAvailabilityLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      setProductsLoading(true);
      setProductsError("");
      const { data } = await listStoreProductsPublic(id);
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setProducts([]);
      setProductsError(
        err?.response?.data?.message || "No se pudo cargar el catálogo"
      );
    } finally {
      setProductsLoading(false);
    }
  };

  // 🆕 CARGAR SERVICIOS
  const loadServices = async () => {
    try {
      setServicesLoading(true);
      const { data } = await getStoreServices(id);
      const activeServices = Array.isArray(data) ? data.filter(s => s.isActive) : [];
      setAllServices(activeServices);
      
      // Cargar specialDays para marcar el calendario
      await loadSpecialDays();
    } catch (err) {
      console.error("❌ Error al cargar servicios:", err);
      setAllServices([]);
    } finally {
      setServicesLoading(false);
    }
  };
  
  // 📅 CARGAR SPECIAL DAYS
  const loadSpecialDays = async () => {
    try {
      const { data } = await getSpecialDays(id);
      const days = Array.isArray(data) ? data : [];
      setSpecialDays(days);
    } catch (err) {
      console.error("❌ Error al cargar specialDays:", err);
      setSpecialDays([]);
    }
  };

  // 🆕 CARGAR SLOTS POR FECHA Y SERVICIO
  const loadSlotsForDate = async (date, serviceId) => {
    if (!date || !serviceId) {
      return;
    }
    try {
      setDateSlotsLoading(true);
      
      const { data } = await getAvailabilityByDate(id, date, serviceId);
      
      // El backend YA filtra los slots ocupados en availableSlots
      // Solo guardamos los slots que están disponibles
      const slots = Array.isArray(data.availableSlots) ? data.availableSlots : [];
      setDateSlots(slots);
    } catch (err) {
      console.error("❌ Error al cargar slots:", err);
      console.error("❌ Error details:", err.response?.data);
      setDateSlots([]);
    } finally {
      setDateSlotsLoading(false);
    }
  };

  // --------- AGENDAMIENTO ----------
  const onBookingChange = (e) => {
    const { name, value } = e.target;
    setBookingForm((p) => ({ ...p, [name]: value }));
    setBookingError("");
    setBookingMsg("");
  };

  // 🆕 MANEJO DE PASOS
  const handleServiceSelect = (service) => {
    setSelectedService(service);
    setBookingStep(2);
    setBookingForm(prev => ({ ...prev, slot: "", date: "" }));
    setDateSlots([]);
    setAvailabilityCache({}); // Limpiar cache al cambiar de servicio
    
    // Resetear calendario al mes actual
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    setCalendarValue(today);
  };

  const handleCalendarChange = (value) => {
    if (!value) return;
    
    // Actualizar el valor del calendario para el cache
    setCalendarValue(value);
    
    // FIX: Usar fecha local en lugar de UTC para evitar problemas de zona horaria
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const day = String(value.getDate()).padStart(2, '0');
    const iso = `${year}-${month}-${day}`;
    
    setBookingForm((p) => ({ ...p, date: iso, slot: "" }));
    setBookingError("");
    setBookingMsg("");
    
    // 🆕 Cargar slots para esta fecha y servicio
    if (selectedService?._id) {
      loadSlotsForDate(iso, selectedService._id);
      setBookingStep(3);
    }
  };

  // 🆕 Función para deshabilitar días sin configurar
  const isDayDisabled = ({ date, view }) => {
    if (view !== "month") return false;
    
    // No deshabilitar días pasados aquí, lo maneja el Calendar con minDate
    
    // Si hay servicio seleccionado, verificar disponibilidad real con el cache
    if (selectedService) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const dateKey = `${year}-${month}-${day}`;
      
      const cached = availabilityCache[dateKey];
      
      // Si ya se cargó y no tiene slots, deshabilitar
      if (cached && !cached.loading && !cached.hasSlots) {
        return true;
      }
      
      // Si está cargando o no se ha cargado, no deshabilitar (esperar)
      return false;
    }
    
    // Si no hay servicio seleccionado, no deshabilitar días
    // (la disponibilidad solo se verifica cuando se selecciona un servicio)
    return false;
  };

  // 🆕 Función para marcar días disponibles visualmente
  const getTileClassName = ({ date, view }) => {
    if (view !== "month") return null;
    
    // No marcar días pasados
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) return null;
    
    // Si hay servicio seleccionado, SOLO usar el cache (disponibilidad real)
    if (selectedService) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const dateKey = `${year}-${month}-${day}`;
      
      const cached = availabilityCache[dateKey];
      
      // Solo marcar verde si está cargado Y tiene slots
      if (cached && !cached.loading && cached.hasSlots) {
        return "available-day";
      }
      
      return null;
    }
    
    // Si NO hay servicio seleccionado, usar specialDays para marcar visualmente
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateKey = `${year}-${month}-${day}`;
    
    // Verificar si este día está en specialDays y NO está cerrado
    const hasSpecialDay = specialDays.some(sd => {
      const sdDate = new Date(sd.date);
      const sdYear = sdDate.getFullYear();
      const sdMonth = String(sdDate.getMonth() + 1).padStart(2, '0');
      const sdDay = String(sdDate.getDate()).padStart(2, '0');
      const sdKey = `${sdYear}-${sdMonth}-${sdDay}`;
      return sdKey === dateKey && !sd.isClosed && sd.timeBlocks?.length > 0;
    });
    
    return hasSpecialDay ? "available-day" : null;
  };

  // 🆕 Precargar disponibilidad para el mes visible cuando se selecciona un servicio
  useEffect(() => {
    if (!selectedService || !calendarValue) return;
    
    const loadMonthAvailability = async () => {
      // Limpiar cache anterior
      setAvailabilityCache({});
      
      const year = calendarValue.getFullYear();
      const month = calendarValue.getMonth();
      
      // Obtener primer y último día del mes visible
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      
      // Cargar disponibilidad para cada día del mes
      const promises = [];
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
        // Solo cargar días futuros
        if (d < today) {
          continue;
        }
        
        const dateYear = d.getFullYear();
        const dateMonth = String(d.getMonth() + 1).padStart(2, '0');
        const dateDay = String(d.getDate()).padStart(2, '0');
        const dateKey = `${dateYear}-${dateMonth}-${dateDay}`;
        
        // Cargar slots reales directamente desde la API
        // La API ya maneja la lógica de specialDays vs bookingAvailability
        promises.push(
          getAvailabilityByDate(id, dateKey, selectedService._id)
            .then(({ data }) => {
              const hasSlots = Array.isArray(data.availableSlots) && data.availableSlots.length > 0;
              setAvailabilityCache(prev => ({ 
                ...prev, 
                [dateKey]: { hasSlots, loading: false, slots: data.availableSlots || [] } 
              }));
            })
            .catch(err => {
              console.error(`❌ Error cargando ${dateKey}:`, err.message);
              setAvailabilityCache(prev => ({ ...prev, [dateKey]: { hasSlots: false, loading: false } }));
            })
        );
      }
      
      // Esperar a que todas las peticiones terminen
      await Promise.all(promises);
      
      // Forzar re-render del calendario
      setCacheVersion(prev => prev + 1);
    };
    
    loadMonthAvailability();
  }, [selectedService, calendarValue, specialDays, id]);

  const handleSlotSelect = (slot) => {
    setBookingForm(prev => ({ ...prev, slot }));
    setBookingStep(4);
  };

  const resetBookingFlow = () => {
    setBookingStep(1);
    setSelectedService(null);
    setDateSlots([]);
    setBookingForm({
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      date: "",
      slot: "",
      notes: "",
    });
    setBookingError("");
    setBookingMsg("");
    setCreatedBookingId(null); // 🆕 Reset bookingId
  };

  // 🆕 Slots para el día seleccionado (ahora vienen de dateSlots)
  const slotsForSelectedDay = useMemo(() => {
    return dateSlots;
  }, [dateSlots]);

  // 🆕 Calcular todas las tags y categorías disponibles desde TODOS los servicios
  const allAvailableTags = useMemo(() => {
    const tagsSet = new Set();
    allServices.forEach(service => {
      if (service.tags && Array.isArray(service.tags)) {
        service.tags.forEach(tag => tagsSet.add(tag));
      }
    });
    return Array.from(tagsSet).sort();
  }, [allServices]);

  const allAvailableCategories = useMemo(() => {
    const categoriesSet = new Set();
    allServices.forEach(service => {
      if (service.category && service.category.trim()) {
        categoriesSet.add(service.category);
      }
    });
    return Array.from(categoriesSet).sort();
  }, [allServices]);

  // 🆕 Filtrar servicios según criterios seleccionados
  const services = useMemo(() => {
    let filtered = [...allServices];

    // Filtrar por tags
    if (selectedTags.length > 0) {
      filtered = filtered.filter(service => 
        service.tags && service.tags.some(tag => selectedTags.includes(tag))
      );
    }

    // Filtrar por categoría
    if (selectedCategory) {
      filtered = filtered.filter(service => 
        service.category === selectedCategory
      );
    }

    // Filtrar por búsqueda de texto
    if (searchText.trim()) {
      const searchLower = searchText.toLowerCase();
      filtered = filtered.filter(service => 
        service.name.toLowerCase().includes(searchLower) ||
        (service.description && service.description.toLowerCase().includes(searchLower))
      );
    }

    return filtered;
  }, [allServices, selectedTags, selectedCategory, searchText]);

  // Manejar cambios en filtros
  const handleTagToggle = (tag) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag) 
        : [...prev, tag]
    );
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  const handleClearFilters = () => {
    setSelectedTags([]);
    setSelectedCategory("");
    setSearchText("");
  };

  const submitBooking = async (e) => {
    e.preventDefault();
    setBookingError("");
    setBookingMsg("");
    
    if (!selectedService) return setBookingError("Selecciona un servicio");
    if (!bookingForm.customerName.trim())
      return setBookingError("Ingresa tu nombre para agendar");
    if (!bookingForm.customerEmail || !bookingForm.customerEmail.trim())
      return setBookingError("Ingresa tu email para poder recibir confirmación y usar el chat");
    if (!bookingForm.date)
      return setBookingError("Selecciona una fecha en el calendario");
    if (!bookingForm.slot)
      return setBookingError("Selecciona un horario disponible");

    try {
      setBookingSubmitting(true);
      
      // 🆕 Usar endpoint con servicio
      const response = await createAppointmentWithService(id, {
        serviceId: selectedService._id,
        customerName: bookingForm.customerName.trim(),
        customerEmail: bookingForm.customerEmail,
        customerPhone: bookingForm.customerPhone,
        date: bookingForm.date,
        slot: bookingForm.slot,
        notes: bookingForm.notes,
      });
      
      // 🆕 Guardar ID para mostrar enlace al chat
      setCreatedBookingId(response.data._id);
      
      setBookingMsg(
        `¡Listo! Tu cita para ${selectedService.name} ha sido solicitada. El negocio confirmará pronto.`
      );
      
      // Reset completo después de 10 segundos (más tiempo para ver el enlace)
      setTimeout(() => resetBookingFlow(), 10000);
    } catch (err) {
      console.error(err);
      setBookingError(
        err?.response?.data?.message ||
          "No pudimos reservar tu cita. Intenta nuevamente"
      );
    } finally {
      setBookingSubmitting(false);
    }
  };

  // --------- PEDIDOS ----------
  const onOrderFormChange = (e) => {
    const { name, value } = e.target;
    setOrderForm((p) => ({ ...p, [name]: value }));
    setOrderError("");
    setOrderMsg("");
  };

  const addOrderItem = (productId, quantityValue) => {
    const product = products.find((item) => item._id === productId);
    if (!product) return setOrderError("Selecciona un producto válido");

    const quantity = Math.max(1, Math.floor(Number(quantityValue) || 0));
    if (!quantity || quantity <= 0)
      return setOrderError("Ingresa una cantidad válida");

    setOrderItems((prev) => {
      const existing = prev.find((i) => i.productId === productId);
      if (existing) {
        return prev.map((i) =>
          i.productId === productId
            ? { ...i, quantity: i.quantity + quantity }
            : i
        );
      }
      return [
        ...prev,
        {
          productId,
          name: product.name,
          price: Number(product.price) || 0,
          quantity,
        },
      ];
    });
    setOrderError("");
    setOrderMsg("");
  };

  const handleQuickAdd = (productId) => addOrderItem(productId, 1);
  const removeOrderItem = (productId) =>
    setOrderItems((prev) =>
      prev.filter((i) => i.productId !== productId)
    );

  const orderTotal = useMemo(
    () =>
      orderItems.reduce(
        (sum, i) =>
          sum + (Number(i.price) || 0) * i.quantity,
        0
      ),
    [orderItems]
  );

  const submitOrder = async (e) => {
    e.preventDefault();
    setOrderError("");
    setOrderMsg("");
    if (orderItems.length === 0)
      return setOrderError("Agrega al menos un producto a tu pedido");
    if (!orderForm.customerName.trim())
      return setOrderError("Ingresa tu nombre para enviar el pedido");

    try {
      setOrderSubmitting(true);
      const response = await createStoreOrder(id, {
        customerName: orderForm.customerName.trim(),
        customerEmail: orderForm.customerEmail,
        customerPhone: orderForm.customerPhone,
        customerAddress: orderForm.customerAddress,
        notes: orderForm.notes,
        items: orderItems.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
        })),
      });
      
      // 🆕 Guardar ID del pedido para mostrar enlace al chat
      setCreatedOrderId(response.data._id);
      
      setOrderMsg(
        "Tu pedido fue enviado. El negocio se pondrá en contacto para coordinar el pago y la entrega."
      );
      setOrderItems([]);
      // No resetear orderForm inmediatamente para poder usar los datos en el chat
      // Se reseteará después de 10 segundos
      setTimeout(() => {
        setOrderForm({
          customerName: "",
          customerEmail: "",
          customerPhone: "",
          customerAddress: "",
          notes: "",
        });
        setCreatedOrderId(null);
      }, 10000);
    } catch (err) {
      console.error(err);
      setOrderError(
        err?.response?.data?.message ||
          "No pudimos enviar tu pedido. Intenta nuevamente"
      );
    } finally {
      setOrderSubmitting(false);
    }
  };

  // --------- Colores ----------
  // NOTA: primaryColor y accentColor ya no se usan directamente
  // Ahora se usa el objeto 'colors' de getAppearanceColors()

  // --------- Estados iniciales ----------
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100">
        <MainHeader subtitle="Cargando tienda..." />
        <p className="p-6 text-sm text-slate-500">Cargando...</p>
      </div>
    );
  }
  if (error) {
    return (
      <div className="min-h-screen bg-slate-100">
        <MainHeader subtitle="Error al cargar" />
        <p className="p-6 text-sm text-red-600">{error}</p>
      </div>
    );
  }
  if (!store) {
    return (
      <div className="min-h-screen bg-slate-100">
        <MainHeader subtitle="Tienda no encontrada" />
        <p className="p-6 text-sm text-slate-500">
          No se encontró la tienda solicitada.
        </p>
      </div>
    );
  }

  // 🎨 Aplicar estilos de personalización visual
  const colors = getAppearanceColors(appearance, store);
  const bgStyle = buildAppearanceBackground(appearance, store);
  const patternStyle = appearance?.background?.mode === "pattern" ? null : buildPatternStyle(store);
  const headerStyle = buildStoreHeaderStyle(store, appearance);
  
  // Aplicar tipografía si está configurada
  const fontFamily = appearance?.typography?.fontFamily || "Inter, system-ui, sans-serif";
  const headingStyle = {
    fontSize: appearance?.typography?.headingSize || '2rem',
    fontWeight: appearance?.typography?.headingWeight || '700',
    letterSpacing: appearance?.typography?.letterSpacing === 'tight' ? '-0.05em' : 
                    appearance?.typography?.letterSpacing === 'wide' ? '0.05em' : 'normal',
    textTransform: appearance?.typography?.textTransform || 'none',
  };
  const bodyStyle = {
    fontSize: appearance?.typography?.bodySize || '1rem',
    fontWeight: appearance?.typography?.bodyWeight || '400',
    lineHeight: appearance?.typography?.lineHeight || '1.6',
  };

  return (
    <div 
      className="relative min-h-screen flex flex-col pt-20" 
      style={{ 
        ...bgStyle,
        fontFamily
      }}
    >
      {/* Partículas animadas */}
      <ParticlesBackground 
        config={appearance?.effects?.particles} 
        colors={colors}
      />

      {/* patrón */}
      {patternStyle && <div aria-hidden style={patternStyle} />}

      <div className="flex-1" style={{ position: "relative", zIndex: 1 }}>
        <MainHeader
          subtitle={`Negocio: ${store.name}`}
          variant="store"
          headerStyle={headerStyle}
          logoSrc={store.logoUrl}
        />

        {/* Banner Superior */}
        <div className="max-w-7xl mx-auto px-6 pt-6">
          <PromotionalBanner position="top" store={store} />
        </div>

        {/* Layout con Sidebars */}
        <div className="w-full px-4 py-10">
          <div className="flex gap-6 max-w-[2000px] mx-auto">
            {/* Sidebar Izquierda */}
            <aside className="hidden xl:block w-72 flex-shrink-0">
              <div className="sticky top-4">
                <PromotionalBanner position="sidebarLeft" store={store} />
              </div>
            </aside>

            {/* Contenido Principal */}
            <main className="flex-1 min-w-0 space-y-6 max-w-[1400px] mx-auto">
          {/* HERO */}
          {appearance?.sections?.hero !== false && (
          <section
            className={`backdrop-blur p-6 flex flex-col md:flex-row gap-6 items-start ${getCardStyle(appearance, colors).className}`}
            style={{ 
              ...getCardStyle(appearance, colors).style,
              borderColor: colors.border 
            }}
          >
            <div className="flex-shrink-0">
              {store.logoUrl ? (
                <img
                  src={store.logoUrl}
                  alt={store.name}
                  className="w-32 h-32 md:w-40 md:h-40 object-cover rounded-2xl border shadow-sm"
                />
              ) : (
                <div className="w-32 h-32 md:w-40 md:h-40 bg-slate-200 rounded-2xl flex items-center justify-center text-slate-600 text-2xl font-semibold border">
                  {store.name[0]}
                </div>
              )}
            </div>

            <div className="flex-1 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <h2
                  className="font-semibold"
                  style={{ 
                    ...headingStyle,
                    color: colors.text 
                  }}
                >
                  {store.name}
                </h2>
                {store.mode && (
                  <span
                    className="inline-flex text-[11px] uppercase tracking-wide px-3 py-1 rounded-full"
                    style={{
                      backgroundColor: hexToRgba(colors.primary, 0.15),
                      color: colors.primary,
                    }}
                  >
                    {store.mode === "bookings"
                      ? "Agendamiento de citas"
                      : "Venta de productos"}
                  </span>
                )}
              </div>

              {/* ⭐ Rating con estrellas */}
              {store.rating > 0 && (
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                        key={star}
                        className={`w-4 h-4 ${
                          star <= Math.round(store.rating)
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-gray-300 fill-gray-300'
                        }`}
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-sm font-semibold" style={{ color: colors.text }}>
                    {store.rating.toFixed(1)}
                  </span>
                  <span className="text-xs" style={{ color: colors.textSecondary }}>
                    ({store.reviewCount || 0} {store.reviewCount === 1 ? 'reseña' : 'reseñas'})
                  </span>
                </div>
              )}

              <p className="text-xs text-slate-500">
                {store.tipoNegocio || "Negocio"} ·{" "}
                {store.comuna || "Ubicación desconocida"}
              </p>

              {store.direccion && (
                <p className="text-sm text-slate-700 flex items-center gap-1">
                  <FaMapMarkerAlt className="mr-1" />
                  <span>{store.direccion}</span>
                </p>
              )}

              {store.heroTitle || store.heroSubtitle ? (
                <div className="space-y-1">
                  {store.heroTitle && (
                    <p 
                      className="font-semibold"
                      style={{
                        fontSize: `calc(${appearance?.typography?.bodySize || '1rem'} * 1.1)`,
                        color: colors.text
                      }}
                    >
                      {store.heroTitle}
                    </p>
                  )}
                  {store.heroSubtitle && (
                    <p style={{ ...bodyStyle, color: colors.textSecondary }}>
                      {store.heroSubtitle}
                    </p>
                  )}
                </div>
              ) : (
                <p style={{ ...bodyStyle, color: colors.textSecondary }}>
                  {store.description || (store.mode === 'bookings' 
                    ? "Reserva tu hora con nosotros. Atención profesional garantizada." 
                    : "Descubre nuestros productos de calidad.")}
                </p>
              )}

              {(store.highlight1 ||
                store.highlight2 ||
                store.priceFrom) && (
                <div className="flex flex-wrap gap-2 mt-1 text-xs">
                  {store.highlight1 && (
                    <span
                      className="px-2 py-1 rounded-full border text-slate-700"
                      style={{ borderColor: colors.primary }}
                    >
                      {store.highlight1}
                    </span>
                  )}
                  {store.highlight2 && (
                    <span
                      className="px-2 py-1 rounded-full border text-slate-700"
                      style={{ borderColor: colors.primary }}
                    >
                      {store.highlight2}
                    </span>
                  )}
                  {store.priceFrom && (
                    <span className="px-2 py-1 rounded-full bg-slate-100 text-slate-800">
                      {store.priceFrom}
                    </span>
                  )}
                </div>
              )}

              {(store.ownerName || store.owner) && (
                <button
                  onClick={() => {
                    const ownerId = store.owner?._id || store.owner;
                    if (ownerId) navigate(`/usuario/${ownerId}`);
                  }}
                  className="flex items-center gap-2 mt-2 hover:opacity-80 transition-opacity cursor-pointer"
                >
                  {(store.ownerAvatar || store.owner?.avatarUrl) ? (
                    <img
                      src={store.ownerAvatar || store.owner?.avatarUrl}
                      alt={store.ownerName || store.owner?.username}
                      className="h-8 w-8 rounded-full border object-cover"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 text-xs">
                      {((store.ownerName || store.owner?.username || "U")[0]?.toUpperCase())}
                    </div>
                  )}
                  <p className="text-xs text-slate-600">
                    Dueño:{" "}
                    <span className="font-medium text-slate-800 hover:underline">
                      {store.ownerName || store.owner?.username || "Usuario"}
                    </span>
                  </p>
                </button>
              )}

              <div className="flex flex-wrap gap-2 pt-2">
                {store.mode === "bookings" && (
                  <button
                    type="button"
                    onClick={() => scrollToSection(bookingSectionRef)}
                    className="px-4 py-2 rounded-lg text-xs md:text-sm font-medium shadow-sm"
                    style={getButtonStyle(appearance, colors, 'primary')}
                  >
                    Agendar cita
                  </button>
                )}
                {store.mode === "products" && (
                  <button
                    type="button"
                    onClick={() => scrollToSection(productsSectionRef)}
                    className="px-4 py-2 rounded-lg text-xs md:text-sm font-medium shadow-sm"
                    style={getButtonStyle(appearance, colors, 'primary')}
                  >
                    Ver catálogo
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => navigate("/")}
                  className="px-3 py-2 rounded-lg text-xs md:text-sm border border-slate-300 text-slate-700 hover:bg-slate-50"
                >
                  ← Volver al inicio
                </button>
              </div>
            </div>
          </section>
          )}

          {/* Banner Entre Secciones */}
          <PromotionalBanner position="betweenSections" store={store} />

          {/* Sección Quiénes Somos */}
          {(() => {
            const shouldShow = store.aboutDescription && appearance?.sections?.about !== false;
            return shouldShow;
          })() && (
            <section
              className={`rounded-2xl p-6 space-y-4 ${getCardStyle(appearance, colors).className}`}
              style={getCardStyle(appearance, colors).style}
            >
              <h3 
                className="font-bold text-center"
                style={{
                  fontSize: `calc(${appearance?.typography?.headingSize || '2rem'} * 0.8)`,
                  fontWeight: appearance?.typography?.headingWeight || '700',
                  color: colors.text
                }}
              >
                {store.aboutTitle || 'Quiénes Somos'}
              </h3>
              <p 
                className="text-center whitespace-pre-line"
                style={{
                  ...bodyStyle,
                  color: colors.textSecondary
                }}
              >
                {store.aboutDescription}
              </p>
            </section>
          )}

          {/* Cuadros Personalizados */}
          {store.customBoxes && store.customBoxes.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {store.customBoxes.map((box) => {
                const IconComponent = getIconComponent(box.icon);
                return (
                <div
                  key={box.id}
                  className={`p-6 rounded-xl space-y-3 ${getCardStyle(appearance, colors).className} ${appearance?.effects?.floatingHover ? 'floating-hover' : ''}`}
                  style={getCardStyle(appearance, colors).style}
                >
                  <IconComponent className="text-4xl" style={{ color: colors.primary }} />
                  <h4 
                    className="font-bold"
                    style={{
                      fontSize: `calc(${appearance?.typography?.headingSize || '2rem'} * 0.6)`,
                      fontWeight: appearance?.typography?.headingWeight || '700',
                      color: colors.text
                    }}
                  >
                    {box.title}
                  </h4>
                  <p 
                    className="whitespace-pre-line"
                    style={{
                      ...bodyStyle,
                      color: colors.textSecondary
                    }}
                  >
                    {box.content}
                  </p>
                </div>
              );})}
            </div>
          )}

          {/* Horarios de Atención */}
          {(() => {
            const shouldShow = store.scheduleText && appearance?.sections?.schedule !== false;
            return shouldShow;
          })() && (
            <section
              className={`rounded-2xl p-6 space-y-4 ${getCardStyle(appearance, colors).className}`}
              style={getCardStyle(appearance, colors).style}
            >
              <h3 
                className="font-bold text-center flex items-center justify-center gap-2"
                style={{
                  fontSize: `calc(${appearance?.typography?.headingSize || '2rem'} * 0.8)`,
                  fontWeight: appearance?.typography?.headingWeight || '700',
                  color: colors.text
                }}
              >
                <FaClock className="mr-1" />
                Horarios de Atención
              </h3>
              <p 
                className="text-center whitespace-pre-line"
                style={{
                  ...bodyStyle,
                  color: colors.textSecondary
                }}
              >
                {store.scheduleText}
              </p>
            </section>
          )}

          {/* 🆕 AGENDAMIENTO MEJORADO - FLUJO PASO A PASO */}
          {(() => {
            const shouldShow = store.mode === "bookings" && appearance?.sections?.booking !== false;
            return shouldShow;
          })() && (
            <section
              ref={bookingSectionRef}
              className={`rounded-2xl p-6 space-y-6 ${getCardStyle(appearance, colors).className}`}
              style={getCardStyle(appearance, colors).style}
            >
              {/* Header */}
              <div className="text-center">
                <h3 
                  className="font-bold"
                  style={{
                    fontSize: `calc(${appearance?.typography?.headingSize || '2rem'} * 0.8)`,
                    fontWeight: appearance?.typography?.headingWeight || '700',
                    color: colors.text
                  }}
                >
                  <FaCalendarAlt className="mr-2" /> Agenda tu Cita
                </h3>
                <p 
                  className="mt-2"
                  style={{
                    ...bodyStyle,
                    color: colors.textSecondary
                  }}
                >
                  Sigue los pasos para reservar tu servicio
                </p>
              </div>

              {/* Indicador de pasos */}
              <div className="flex items-center justify-center gap-2">
                {[1, 2, 3, 4].map((step) => (
                  <div key={step} className="flex items-center gap-2">
                    <div
                      className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all`}
                      style={
                        bookingStep === step
                          ? { backgroundColor: colors.primary, color: '#fff', borderColor: colors.primary, transform: 'scale(1.1)' }
                          : bookingStep > step
                          ? { backgroundColor: colors.success, color: '#fff', borderColor: colors.success }
                          : { backgroundColor: '#f1f5f9', color: '#94a3b8', borderColor: '#e2e8f0' }
                      }
                    >
                      {bookingStep > step ? "✓" : step}
                    </div>
                    {step < 4 && (
                      <div
                        className={`h-1 w-8 md:w-16 rounded-full transition-all`}
                        style={{
                          backgroundColor: bookingStep > step ? colors.success : '#e2e8f0'
                        }}
                      />
                    )}
                  </div>
                ))}
              </div>

              {/* Etiquetas de pasos */}
              <div className="grid grid-cols-4 gap-2 text-xs text-center text-slate-600">
                <div className={bookingStep === 1 ? "font-bold text-blue-600" : ""}>
                  Servicio
                </div>
                <div className={bookingStep === 2 ? "font-bold text-blue-600" : ""}>
                  Fecha
                </div>
                <div className={bookingStep === 3 ? "font-bold text-blue-600" : ""}>
                  Hora
                </div>
                <div className={bookingStep === 4 ? "font-bold text-blue-600" : ""}>
                  Tus Datos
                </div>
              </div>

              {/* Mensajes */}
              {bookingError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                  <span className="text-xl">⚠️</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-red-800">Error</p>
                    <p className="text-sm text-red-600 mt-1">{bookingError}</p>
                  </div>
                </div>
              )}

              {bookingMsg && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
                  <span className="text-xl">✅</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-green-800">¡Éxito!</p>
                    <p className="text-sm text-green-600 mt-1">{bookingMsg}</p>
                    {createdBookingId && (
                      <div className="mt-3">
                        <button
                          onClick={() => {
                            setChatType("booking");
                            setChatId(createdBookingId);
                            setShowChatModal(true);
                          }}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
                        >
                          <FaComments className="mr-2" /> Chatear con la tienda
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* PASO 1: SELECCIÓN DE SERVICIO */}
              {bookingStep === 1 && (
                <div className="space-y-4">
                  <div className="rounded-lg p-4" style={{ backgroundColor: hexToRgba(colors.primary, 0.1), borderColor: colors.primary, borderWidth: '1px', borderStyle: 'solid' }}>
                    <h4 className="font-semibold text-base" style={{ color: colors.primary }}>
                      Paso 1: Elige un servicio
                    </h4>
                    <p className="text-sm mt-1" style={{ color: colors.text }}>
                      Selecciona el servicio que necesitas
                    </p>
                  </div>

                  {/* Filtros de búsqueda */}
                  {(allAvailableTags.length > 0 || allAvailableCategories.length > 0) && (
                    <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <h5 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                          <FaSearch />
                          <span>Filtrar servicios</span>
                        </h5>
                        {(selectedTags.length > 0 || selectedCategory || searchText) && (
                          <button
                            type="button"
                            onClick={handleClearFilters}
                            className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                          >
                            Limpiar filtros
                          </button>
                        )}
                      </div>

                      {/* Búsqueda por texto */}
                      <div>
                        <input
                          type="text"
                          placeholder="Buscar por nombre o descripción..."
                          value={searchText}
                          onChange={(e) => setSearchText(e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      {/* Categorías */}
                      {allAvailableCategories.length > 0 && (
                        <div>
                          <label className="text-xs font-medium text-slate-600 mb-1.5 block">
                            Categoría
                          </label>
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => handleCategoryChange("")}
                              className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all ${
                                selectedCategory === ""
                                  ? "bg-purple-600 text-white"
                                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                              }`}
                            >
                              Todas
                            </button>
                            {allAvailableCategories.map((category) => (
                              <button
                                key={category}
                                type="button"
                                onClick={() => handleCategoryChange(category)}
                                className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all ${
                                  selectedCategory === category
                                    ? "bg-purple-600 text-white"
                                    : "bg-purple-100 text-purple-700 hover:bg-purple-200"
                                }`}
                              >
                                📁 {category}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Tags */}
                      {allAvailableTags.length > 0 && (
                        <div>
                          <label className="text-xs font-medium text-slate-600 mb-1.5 block">
                            Etiquetas {selectedTags.length > 0 && `(${selectedTags.length} seleccionada${selectedTags.length !== 1 ? 's' : ''})`}
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {allAvailableTags.map((tag) => (
                              <button
                                key={tag}
                                type="button"
                                onClick={() => handleTagToggle(tag)}
                                className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all ${
                                  selectedTags.includes(tag)
                                    ? "bg-blue-600 text-white"
                                    : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                                }`}
                              >
                                🏷️ {tag}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Contador de resultados */}
                      {!servicesLoading && (
                        <p className="text-xs text-slate-500 pt-2 border-t border-slate-200">
                          {services.length === 0 
                            ? "No se encontraron servicios con los filtros aplicados" 
                            : `Mostrando ${services.length} servicio${services.length !== 1 ? 's' : ''}`
                          }
                        </p>
                      )}
                    </div>
                  )}

                  {servicesLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
                      <p className="text-sm text-slate-500 mt-2">Cargando servicios...</p>
                    </div>
                  ) : services.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="text-4xl mb-4">🛎️</div>
                      <p className="text-slate-600 font-medium">No hay servicios disponibles</p>
                      <p className="text-sm text-slate-500 mt-1">
                        El negocio aún no ha publicado sus servicios
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {services.map((service) => (
                        <button
                          key={service._id}
                          type="button"
                          onClick={() => handleServiceSelect(service)}
                          className={`text-left border-2 border-slate-200 rounded-xl p-5 hover:border-blue-500 hover:shadow-lg transition-all group ${appearance?.effects?.glow ? 'glow-effect' : ''} ${appearance?.effects?.floatingHover ? 'floating-hover' : ''} ${appearance?.effects?.animatedGradient ? 'animated-gradient' : ''}`}
                        >
                          {service.imageUrl && (
                            <img
                              src={service.imageUrl}
                              alt={service.name}
                              className="w-full h-32 object-cover rounded-lg mb-3"
                            />
                          )}
                          <h5 className="font-bold text-slate-800 text-base group-hover:text-blue-600 transition-colors">
                            {service.name}
                          </h5>
                          {service.description && (
                            <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                              {service.description}
                            </p>
                          )}
                          
                          {/* Categoría y Tags */}
                          {(service.category || (service.tags && service.tags.length > 0)) && (
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {service.category && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs">
                                  <span>📁</span>
                                  <span>{service.category}</span>
                                </span>
                              )}
                              {service.tags && service.tags.map((tag, index) => (
                                <span
                                  key={index}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs"
                                >
                                  <span>🏷️</span>
                                  <span>{tag}</span>
                                </span>
                              ))}
                            </div>
                          )}

                          <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                            <div className="flex items-center gap-2 text-xs text-slate-600">
                              <span>⏱️ {service.duration} min</span>
                            </div>
                            <div className="text-lg font-bold text-blue-600">
                              ${service.price.toLocaleString("es-CL")}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* PASO 2: SELECCIÓN DE FECHA */}
              {bookingStep === 2 && (
                <div className="space-y-4">
                  <div className="rounded-lg p-4" style={{ backgroundColor: hexToRgba(colors.primary, 0.1), borderColor: colors.primary, borderWidth: '1px', borderStyle: 'solid' }}>
                    <h4 className="font-semibold text-base" style={{ color: colors.primary }}>
                      Paso 2: Elige una fecha
                    </h4>
                    <p className="text-sm mt-1" style={{ color: colors.text }}>
                      Servicio: <strong>{selectedService?.name}</strong> ({selectedService?.duration} min)
                    </p>
                  </div>

                  <div className="flex flex-col items-center">
                    <Calendar
                      key={`calendar-${cacheVersion}`}
                      onChange={handleCalendarChange}
                      value={calendarValue}
                      minDate={new Date()}
                      tileDisabled={isDayDisabled}
                      tileClassName={getTileClassName}
                      onActiveStartDateChange={({ activeStartDate }) => {
                        // Cuando cambian de mes, actualizar el calendario para recargar disponibilidad
                        if (activeStartDate && selectedService) {
                          setCalendarValue(activeStartDate);
                        }
                      }}
                      className="rounded-2xl border-2 border-slate-200 shadow-lg p-3 max-w-md mx-auto"
                      locale="es-ES"
                    />
                    <p className="text-xs text-slate-500 mt-3 text-center">
                      💡 Los días en verde están disponibles para reservar
                    </p>
                  </div>

                  <div className="flex justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => setBookingStep(1)}
                      className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                    >
                      ← Cambiar servicio
                    </button>
                  </div>
                </div>
              )}

              {/* PASO 3: SELECCIÓN DE HORA */}
              {bookingStep === 3 && (
                <div className="space-y-4">
                  <div className="rounded-lg p-4" style={{ backgroundColor: hexToRgba(colors.primary, 0.1), borderColor: colors.primary, borderWidth: '1px', borderStyle: 'solid' }}>
                    <h4 className="font-semibold text-base" style={{ color: colors.primary }}>
                      Paso 3: Elige tu horario
                    </h4>
                    <p className="text-sm mt-1" style={{ color: colors.text }}>
                      Fecha: <strong>{new Date(bookingForm.date + "T00:00:00").toLocaleDateString("es-CL", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</strong>
                    </p>
                  </div>

                  {dateSlotsLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
                      <p className="text-sm text-slate-500 mt-2">Cargando horarios disponibles...</p>
                    </div>
                  ) : slotsForSelectedDay.length === 0 ? (
                    <div className="text-center py-12">
                      <FaCalendarAlt className="text-4xl mb-4" />
                      <p className="text-slate-600 font-medium mb-2">No hay horarios disponibles</p>
                      <div className="max-w-md mx-auto space-y-2 text-sm text-slate-500">
                        <p>Esto puede ocurrir porque:</p>
                        <ul className="text-left list-disc list-inside space-y-1">
                          <li>El negocio no tiene horarios configurados para este día</li>
                          <li>Los bloques de tiempo son muy cortos para este servicio</li>
                          <li>Todos los horarios están ocupados</li>
                          <li>El día está marcado como cerrado</li>
                        </ul>
                        <div className="rounded-lg p-3 mt-4" style={{ backgroundColor: hexToRgba(colors.primary, 0.1), borderColor: colors.primary, borderWidth: '1px', borderStyle: 'solid' }}>
                          <p className="font-semibold mb-1" style={{ color: colors.primary }}>💡 Consejo</p>
                          <p className="text-xs" style={{ color: colors.text }}>
                            Si eres el dueño: ve a "Horarios y Excepciones" y crea bloques de tiempo más largos 
                            (por ejemplo, 09:00-18:00) para que se generen más horarios automáticamente.
                          </p>
                        </div>
                        <p className="font-medium mt-3" style={{ color: colors.primary }}>
                          Intenta con otra fecha
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                      {slotsForSelectedDay.map((slot) => (
                        <button
                          type="button"
                          key={slot}
                          onClick={() => handleSlotSelect(slot)}
                          className={`px-4 py-3 rounded-lg text-sm font-semibold border-2 transition-all ${
                            bookingForm.slot === slot
                              ? "shadow-lg"
                              : "hover:shadow-md"
                          }`}
                          style={
                            bookingForm.slot === slot
                              ? { backgroundColor: colors.primary, color: '#fff', borderColor: colors.primary, transform: 'scale(1.05)' }
                              : { backgroundColor: '#fff', color: colors.text, borderColor: colors.border }
                          }
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="flex justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setBookingStep(2);
                        setDateSlots([]);
                      }}
                      className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                    >
                      ← Cambiar fecha
                    </button>
                  </div>
                </div>
              )}

              {/* PASO 4: DATOS DEL CLIENTE Y CONFIRMACIÓN */}
              {bookingStep === 4 && (
                <div className="space-y-4">
                  <div className="rounded-lg p-4" style={{ backgroundColor: hexToRgba(colors.primary, 0.1), borderColor: colors.primary, borderWidth: '1px', borderStyle: 'solid' }}>
                    <h4 className="font-semibold text-base" style={{ color: colors.primary }}>
                      Paso 4: Confirma tu reserva
                    </h4>
                    <p className="text-sm mt-1" style={{ color: colors.text }}>
                      Completa tus datos para finalizar
                    </p>
                  </div>

                  {/* Resumen de la reserva */}
                  <div className="rounded-xl p-5" style={{ 
                    backgroundImage: `linear-gradient(to right, ${hexToRgba(colors.primary, 0.1)}, ${hexToRgba(colors.secondary, 0.1)})`,
                    borderColor: colors.border,
                    borderWidth: '1px',
                    borderStyle: 'solid'
                  }}>
                    <h5 className="font-bold mb-3" style={{ color: colors.text }}>📋 Resumen de tu cita</h5>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span style={{ color: colors.textSecondary }}>Servicio:</span>
                        <span className="font-semibold" style={{ color: colors.text }}>{selectedService?.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Duración:</span>
                        <span className="font-semibold text-slate-800">{selectedService?.duration} minutos</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Precio:</span>
                        <span className="font-semibold text-blue-600 text-lg">
                          ${selectedService?.price.toLocaleString("es-CL")}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Fecha:</span>
                        <span className="font-semibold text-slate-800">
                          {new Date(bookingForm.date + "T00:00:00").toLocaleDateString("es-CL", { 
                            day: "numeric", 
                            month: "long", 
                            year: "numeric" 
                          })}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Hora:</span>
                        <span className="font-semibold text-slate-800 text-lg">{bookingForm.slot}</span>
                      </div>
                    </div>
                  </div>

                  {/* Formulario de datos */}
                  <form onSubmit={submitBooking} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Nombre completo *
                        </label>
                        <input
                          name="customerName"
                          value={bookingForm.customerName}
                          onChange={onBookingChange}
                          required
                          className="w-full border-2 border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg px-4 py-3 text-sm transition-all"
                          placeholder="Juan Pérez"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Teléfono *
                        </label>
                        <input
                          name="customerPhone"
                          value={bookingForm.customerPhone}
                          onChange={onBookingChange}
                          required
                          className="w-full border-2 border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg px-4 py-3 text-sm transition-all"
                          placeholder="+56 9 1234 5678"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Correo electrónico
                      </label>
                      <input
                        name="customerEmail"
                        value={bookingForm.customerEmail}
                        onChange={onBookingChange}
                        type="email"
                        className="w-full border-2 border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg px-4 py-3 text-sm transition-all"
                        placeholder="juan@example.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Comentarios adicionales
                      </label>
                      <textarea
                        name="notes"
                        value={bookingForm.notes}
                        onChange={onBookingChange}
                        rows={3}
                        className="w-full border-2 border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg px-4 py-3 text-sm transition-all"
                        placeholder="Cuéntanos si tienes alguna solicitud especial..."
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setBookingStep(3);
                          setBookingForm(prev => ({ ...prev, slot: "" }));
                        }}
                        className="flex-1 px-6 py-3 text-sm font-medium transition-all"
                        style={getButtonStyle(appearance, colors, "secondary")}
                      >
                        ← Cambiar horario
                      </button>
                      <button
                        type="submit"
                        disabled={bookingSubmitting}
                        className="flex-1 text-sm font-bold shadow-lg hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                        style={getButtonStyle(appearance, colors, "primary")}
                      >
                        {bookingSubmitting ? "Confirmando..." : "✅ Confirmar Reserva"}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </section>
          )}

          {/* PRODUCTOS */}
          {(() => {
            const shouldShow = store.mode === "products" && appearance?.sections?.services !== false;
            return shouldShow;
          })() && (
            <ModernProductsStore store={store} appearance={appearance} />
          )}

          {/* RESEÑAS Y COMENTARIOS */}
          <section className="bg-white rounded-3xl border border-gray-200 shadow-xl p-8 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-4xl">⭐</span>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Reseñas y Comentarios
                </h2>
                <p className="text-gray-600 text-sm">
                  Comparte tu experiencia con {store.name}
                </p>
              </div>
            </div>
            <ProductReviews storeId={store._id} productId={null} />
          </section>

          <div className="flex justify-end">
            <button
              onClick={() => navigate("/")}
              className="text-sm text-blue-600 hover:underline"
            >
              ← Volver al inicio
            </button>
          </div>

          {/* Banner Footer */}
          <PromotionalBanner position="footer" store={store} className="mt-8" />
        </main>

            {/* Sidebar Derecha */}
            <aside className="hidden xl:block w-72 flex-shrink-0">
              <div className="sticky top-4">
                <PromotionalBanner position="sidebarRight" store={store} />
              </div>
            </aside>
          </div>
        </div>
      </div>

      {/* Estilos para el calendario */}
      <style>{`
        .available-day {
          background-color: #86efac !important;
          color: #166534 !important;
          font-weight: 600;
        }
        
        .available-day:hover {
          background-color: #4ade80 !important;
        }

        .react-calendar__tile:disabled {
          background-color: #f1f5f9 !important;
          color: #cbd5e1 !important;
          cursor: not-allowed !important;
        }

        .react-calendar__tile--active {
          background-color: #3b82f6 !important;
          color: white !important;
        }
      `}</style>

      {/* Modal de Chat */}
      {showChatModal && chatId && (
        <CustomerChatModal
          type={chatType}
          id={chatId}
          customerEmail={chatType === "booking" ? bookingForm.customerEmail : orderForm.customerEmail}
          customerName={chatType === "booking" ? bookingForm.customerName : orderForm.customerName}
          onClose={() => {
            setShowChatModal(false);
            setChatId(null);
            setChatType("");
          }}
        />
      )}
      <Footer paletteMode="warm" />
    </div>
  );
}
