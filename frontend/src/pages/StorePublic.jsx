// src/pages/StorePublicPage.jsx
import { useEffect, useMemo, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getStoreById,
  getStoreAvailability,
  createAppointment,
  listStoreProducts,
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
import ModernProductsStore from "../components/ModernProductsStore"; // 🛒 Tienda moderna
import PromotionalBanner from "../components/PromotionalBanner"; // 📢 Banners promocionales
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

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
  if (!appearance?.background) {
    // Fallback a sistema legacy
    return buildBackgroundStyle(store);
  }

  const { mode, solid, gradient, image, pattern } = appearance.background;

  if (mode === "solid") {
    return {
      backgroundColor: solid?.color || "#ffffff",
      backgroundAttachment: "fixed",
    };
  }

  if (mode === "gradient" && gradient) {
    const { type, direction, colors, stops } = gradient;
    const gradientColors = colors?.map((c, i) => 
      `${c} ${stops?.[i] || (i * 100 / (colors.length - 1))}%`
    ).join(", ");

    return {
      backgroundImage: type === "radial"
        ? `radial-gradient(circle, ${gradientColors})`
        : `linear-gradient(${direction || "to bottom"}, ${gradientColors})`,
      backgroundAttachment: "fixed",
    };
  }

  if (mode === "image" && image?.url) {
    return {
      backgroundImage: `linear-gradient(to bottom, ${hexToRgba("#000", image.opacity || 0.5)} 0%, ${hexToRgba("#000", (image.opacity || 0.5) * 1.2)} 60%), url(${image.url})`,
      backgroundRepeat: "no-repeat",
      backgroundSize: image.size || "cover",
      backgroundPosition: image.position || "center",
      backgroundAttachment: "fixed",
    };
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

    return {
      backgroundColor: appearance.colors?.background || "#ffffff",
      backgroundImage: patternImage,
      backgroundSize: pattern.type === "grid" ? `${30 * scale}px ${30 * scale}px` : `${20 * scale}px ${20 * scale}px`,
      backgroundAttachment: "fixed",
    };
  }

  // Fallback
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
      backgroundColor: colors.surface,
      borderRadius: "0.75rem",
      boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)",
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

  switch (style) {
    case "elevated":
      return { ...baseStyle, backgroundColor: colors.surface };
    case "outline":
      return { ...baseStyle, backgroundColor: colors.surface, border: `1px solid ${colors.border}` };
    case "filled":
      return { ...baseStyle, backgroundColor: hexToRgba(colors.primary, 0.05) };
    case "gradient":
      return { ...baseStyle, backgroundImage: `linear-gradient(135deg, ${hexToRgba(colors.primary, 0.1)}, ${hexToRgba(colors.secondary, 0.1)})` };
    default:
      return { ...baseStyle, backgroundColor: colors.surface };
  }
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
  const [services, setServices] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(false);
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
          setAppearance(appearanceData);
          console.log('✅ Apariencia cargada:', appearanceData);
        } catch (err) {
          console.log("No hay personalización visual configurada, usando valores por defecto");
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

  const loadAvailability = async () => {
    try {
      setAvailabilityLoading(true);
      setAvailabilityError("");
      const { data } = await getStoreAvailability(id);
      const av = Array.isArray(data?.availability) ? data.availability : [];
      setAvailability(av);
      
      console.log("📅 Availability cargado:", av.length, "días");
      console.log("📅 Días configurados:", av.map(a => `${a.dayOfWeek}${a.isClosed ? ' (cerrado)' : ''} - ${a.timeBlocks?.length || 0} bloques`));
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
      const { data } = await listStoreProducts(id);
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
      console.log("🛎️ Servicios activos cargados:", activeServices.length, activeServices);
      setServices(activeServices);
      
      // Cargar specialDays para marcar el calendario
      await loadSpecialDays();
    } catch (err) {
      console.error("❌ Error al cargar servicios:", err);
      setServices([]);
    } finally {
      setServicesLoading(false);
    }
  };
  
  // 📅 CARGAR SPECIAL DAYS
  const loadSpecialDays = async () => {
    try {
      const { data } = await getSpecialDays(id);
      const days = Array.isArray(data) ? data : [];
      console.log("📅 SpecialDays cargados:", days.length);
      days.forEach(sd => {
        const date = new Date(sd.date);
        console.log(`  ${sd.isClosed ? '🚫' : '⭐'} ${date.toLocaleDateString('es-ES')}: ${sd.isClosed ? 'CERRADO' : `${sd.timeBlocks?.length || 0} bloques`}`);
      });
      setSpecialDays(days);
    } catch (err) {
      console.error("❌ Error al cargar specialDays:", err);
      setSpecialDays([]);
    }
  };

  // 🆕 CARGAR SLOTS POR FECHA Y SERVICIO
  const loadSlotsForDate = async (date, serviceId) => {
    console.log("🚀 loadSlotsForDate iniciado - fecha:", date, "serviceId:", serviceId);
    if (!date || !serviceId) {
      console.warn("⚠️ loadSlotsForDate cancelado - faltan parámetros");
      return;
    }
    try {
      setDateSlotsLoading(true);
      console.log("📡 Llamando a API getAvailabilityByDate...");
      console.log("📡 URL:", `/stores/${id}/availability/date/${date}?serviceId=${serviceId}`);
      
      const { data } = await getAvailabilityByDate(id, date, serviceId);
      
      console.log("📅 Disponibilidad recibida:", data);
      console.log("📊 availableSlots:", data.availableSlots);
      console.log("📊 bookedSlots:", data.bookedSlots);
      console.log("📊 Cantidad de slots disponibles:", data.availableSlots?.length || 0);
      console.log("📊 isClosed:", data.isClosed);
      console.log("📊 timeBlocks:", data.timeBlocks);
      
      // El backend YA filtra los slots ocupados en availableSlots
      // Solo guardamos los slots que están disponibles
      const slots = Array.isArray(data.availableSlots) ? data.availableSlots : [];
      setDateSlots(slots);
      
      console.log("✅ dateSlots actualizado con", slots.length, "slots disponibles");
      if (slots.length === 0) {
        console.warn("⚠️ No se recibieron slots. Razones posibles:");
        console.warn("   - Día cerrado:", data.isClosed);
        console.warn("   - Sin timeBlocks:", !data.timeBlocks || data.timeBlocks.length === 0);
        console.warn("   - Bloques muy cortos para el servicio");
        console.warn("   - Todos los slots están ocupados:", data.bookedSlots?.length || 0);
      }
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
    
    console.log("📅 Fecha seleccionada:", iso, "Servicio:", selectedService?._id);
    console.log("📅 Objeto Date:", value);
    console.log("📅 ISO local:", iso);
    
    setBookingForm((p) => ({ ...p, date: iso, slot: "" }));
    setBookingError("");
    setBookingMsg("");
    
    // 🆕 Cargar slots para esta fecha y servicio
    if (selectedService?._id) {
      console.log("🔍 Cargando slots para fecha:", iso, "servicio:", selectedService._id);
      loadSlotsForDate(iso, selectedService._id);
      setBookingStep(3);
    } else {
      console.warn("⚠️ No hay servicio seleccionado, no se cargan slots");
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
      
      console.log(`📅 Precargando disponibilidad para ${firstDay.toLocaleDateString('es-ES')} - ${lastDay.toLocaleDateString('es-ES')}`);
      console.log(`📅 Servicio seleccionado: ${selectedService.name} (${selectedService.duration}min)`);
      
      // Cargar disponibilidad para cada día del mes
      const promises = [];
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      let daysToCheck = 0;
      let daysSkipped = 0;
      
      for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
        // Solo cargar días futuros
        if (d < today) {
          daysSkipped++;
          continue;
        }
        
        const dateYear = d.getFullYear();
        const dateMonth = String(d.getMonth() + 1).padStart(2, '0');
        const dateDay = String(d.getDate()).padStart(2, '0');
        const dateKey = `${dateYear}-${dateMonth}-${dateDay}`;
        
        daysToCheck++;
        
        // Cargar slots reales directamente desde la API
        // La API ya maneja la lógica de specialDays vs bookingAvailability
        promises.push(
          getAvailabilityByDate(id, dateKey, selectedService._id)
            .then(({ data }) => {
              const hasSlots = Array.isArray(data.availableSlots) && data.availableSlots.length > 0;
              const dayOfWeek = DAY_FROM_INDEX[d.getDay()];
              console.log(`${hasSlots ? '✅' : '⚠️'} ${dateKey} (${dayOfWeek}): ${data.availableSlots?.length || 0} slots disponibles`);
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
      
      console.log(`📊 Días a verificar: ${daysToCheck}, Días omitidos (pasados): ${daysSkipped}`);
      
      // Esperar a que todas las peticiones terminen
      await Promise.all(promises);
      console.log(`✅ Disponibilidad del mes cargada - Total en cache:`, Object.keys(availabilityCache).length);
      
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

  const submitBooking = async (e) => {
    e.preventDefault();
    setBookingError("");
    setBookingMsg("");
    
    if (!selectedService) return setBookingError("Selecciona un servicio");
    if (!bookingForm.customerName.trim())
      return setBookingError("Ingresa tu nombre para agendar");
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
      await createStoreOrder(id, {
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
      setOrderMsg(
        "Tu pedido fue enviado. El negocio se pondrá en contacto para coordinar el pago y la entrega."
      );
      setOrderItems([]);
      setOrderForm({
        customerName: "",
        customerEmail: "",
        customerPhone: "",
        customerAddress: "",
        notes: "",
      });
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

  return (
    <div 
      className="relative min-h-screen flex flex-col" 
      style={{ 
        ...bgStyle,
        fontFamily
      }}
    >
      {/* patrón */}
      {patternStyle && <div aria-hidden style={patternStyle} />}

      <div style={{ position: "relative", zIndex: 1 }}>
        <MainHeader
          subtitle={`Negocio: ${store.name}`}
          variant="store"
          headerStyle={headerStyle}
          logoSrc={store.logoUrl}
        />

        {/* Banner Superior */}
        <div className="max-w-5xl mx-auto px-4 pt-4">
          <PromotionalBanner position="top" store={store} />
        </div>

        <main className="flex-1 max-w-5xl mx-auto px-4 py-8 space-y-6">
          {/* HERO */}
          <section
            className="backdrop-blur p-6 flex flex-col md:flex-row gap-6 items-start"
            style={{ 
              ...getCardStyle(appearance, colors),
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
                  className="text-2xl md:text-3xl font-semibold"
                  style={{ color: colors.text }}
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

              <p className="text-xs text-slate-500">
                {store.tipoNegocio || "Negocio"} ·{" "}
                {store.comuna || "Ubicación desconocida"}
              </p>

              {store.direccion && (
                <p className="text-sm text-slate-700 flex items-center gap-1">
                  <span>📍</span>
                  <span>{store.direccion}</span>
                </p>
              )}

              {store.heroTitle || store.heroSubtitle ? (
                <div className="space-y-1">
                  {store.heroTitle && (
                    <p className="text-sm md:text-base text-slate-900 font-semibold">
                      {store.heroTitle}
                    </p>
                  )}
                  {store.heroSubtitle && (
                    <p className="text-sm text-slate-600">
                      {store.heroSubtitle}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-slate-600">
                  {store.description || "Sin descripción."}
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

              {store.ownerName && (
                <div className="flex items-center gap-2 mt-2">
                  {store.ownerAvatar ? (
                    <img
                      src={store.ownerAvatar}
                      alt={store.ownerName}
                      className="h-8 w-8 rounded-full border object-cover"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 text-xs">
                      {store.ownerName[0]?.toUpperCase() || "U"}
                    </div>
                  )}
                  <p className="text-xs text-slate-600">
                    Dueño:{" "}
                    <span className="font-medium text-slate-800">
                      {store.ownerName}
                    </span>
                  </p>
                </div>
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

          {/* Banner Entre Secciones */}
          <PromotionalBanner position="betweenSections" store={store} />

          {/* 🆕 AGENDAMIENTO MEJORADO - FLUJO PASO A PASO */}
          {store.mode === "bookings" && (
            <section
              ref={bookingSectionRef}
              className="rounded-2xl p-6 space-y-6"
              style={getCardStyle(appearance, colors)}
            >
              {/* Header */}
              <div className="text-center">
                <h3 className="text-2xl font-bold text-slate-800">
                  📅 Agenda tu Cita
                </h3>
                <p className="text-sm text-slate-500 mt-2">
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
                    <p className="text-xs text-green-600 mt-2">
                      💡 Puedes gestionar tus reservas y chatear con el negocio desde tu perfil
                    </p>
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
                          className="text-left border-2 border-slate-200 rounded-xl p-5 hover:border-blue-500 hover:shadow-lg transition-all group"
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
                      <div className="text-4xl mb-4">📅</div>
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
          {store.mode === "products" && (
            <ModernProductsStore store={store} appearance={appearance} />
          )}

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
    </div>
  );
}
