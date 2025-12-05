// src/pages/StoreProfilePage.jsx
import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import MainHeader from "../components/MainHeader";
import Footer from "../components/Footer";
import { getStoreById, updateMyStore } from "../api/store";
import { FaCog, FaPalette, FaBullhorn, FaShoppingBag, FaClipboardList, FaBox, FaComments, FaChartBar, FaCalendarAlt, FaWrench, FaShoppingCart, FaClock } from 'react-icons/fa';

import BookingAvailabilityManager from "../components/BookingAvailabilityManager";
import WeeklyScheduleEditor from "../components/WeeklyScheduleEditor";
import ServicesManager from "../components/ServicesManager"; // 🆕 NUEVO
import MonthlyCalendarEditor from "../components/MonthlyCalendarEditor"; // 🆕 NUEVO
import WeeklyScheduleManager from "../components/WeeklyScheduleManager"; // 🆕 EDITOR SEMANAL
import MonthlyCalendarViewer from "../components/MonthlyCalendarViewer"; // 🆕 VISTA MENSUAL
import AppointmentsList from "../components/AppointmentsList";
import ProductManager from "../components/ProductManager";
import ModernProductManager from "../components/ModernProductManager"; // 🆕 GESTOR MODERNO
import OrdersList from "../components/OrdersList";
import ModernOrdersManager from "../components/ModernOrdersManager"; // 🆕 GESTOR MODERNO DE PEDIDOS
import UnifiedChatManager from "../components/UnifiedChatManager"; // 💬 GESTOR DE CHATS UNIFICADO
import StoreCalendarManager from "../components/StoreCalendarManager";
import SmartInsights from "../components/SmartInsights"; // 👈 IMPORTANTE
import StoreVisualBuilder from "../components/StoreVisualBuilder"; // 🎨 CONSTRUCTOR VISUAL (LEGACY)
import EnhancedStoreCustomizer from "../components/EnhancedStoreCustomizer"; // 🎨 CONSTRUCTOR MEJORADO
import PromotionalSpacesManager from "../components/PromotionalSpacesManager"; // 📢 ANUNCIOS

/* ========= Helpers =========== */
const buildBg = (f) => {
  if (f.bgMode === "solid") return { backgroundColor: f.bgColorTop };

  if (f.bgMode === "image" && f.bgImageUrl) {
    return {
      backgroundImage: `url(${f.bgImageUrl})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
      backgroundColor: f.bgColorTop,
    };
  }

  return {
    background: `linear-gradient(to bottom, ${f.bgColorTop}, ${f.bgColorBottom})`,
  };
};

const buildStoreHeaderStyle = (storeLike) => {
  const primary = storeLike?.primaryColor || "#2563eb";
  const accent = storeLike?.accentColor || "#0f172a";

  return {
    backgroundImage: `linear-gradient(90deg, ${primary}, ${accent}, ${primary})`,
  };
};

/* ─────────────────────────────────────────────
   COMPONENTE PRINCIPAL
   ───────────────────────────────────────────── */

export default function StoreProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // ========= Estados principales ===========
  const [form, setForm] = useState({
    name: "",
    mode: "products",
    description: "",
    logoUrl: "",
    comuna: "",
    tipoNegocio: "",
    direccion: "",
    primaryColor: "#2563eb",
    accentColor: "#0f172a",
    heroTitle: "",
    heroSubtitle: "",
    highlight1: "",
    highlight2: "",
    priceFrom: "",
    bgMode: "gradient",
    bgColorTop: "#e8d7ff",
    bgColorBottom: "#ffffff",
    bgPattern: "none",
    bgImageUrl: "",
  });

  const [storeData, setStoreData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const [activeTab, setActiveTab] = useState("ventas"); // Cambiar default a ventas

  // pestañas internas
  const [productsPanel, setProductsPanel] = useState("catalog"); // catalog | orders | messages | insights
  const [bookingsPanel, setBookingsPanel] = useState("services"); // services | weeklySchedule | monthlyView | appointments | messages | insights
  
  // 🎨 Constructor visual
  const [showVisualBuilder, setShowVisualBuilder] = useState(false);
  const [showAdsManager, setShowAdsManager] = useState(false); // 📢 Gestor de anuncios

  // ========= Leer parámetros de URL ===========
  useEffect(() => {
    const tab = searchParams.get('tab');
    const panel = searchParams.get('panel');
    
    if (tab) setActiveTab(tab);
    if (panel && tab === 'ventas') {
      setProductsPanel(panel);
    } else if (panel && tab === 'agendamiento') {
      setBookingsPanel(panel);
    }
  }, [searchParams]);

  // ========= Cargar tienda ===========
  useEffect(() => {
    loadStore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const mapStoreToForm = (s) => ({
    name: s?.name || "",
    mode: s?.mode || "products",
    description: s?.description || "",
    logoUrl: s?.logoUrl || "",
    comuna: s?.comuna || "",
    tipoNegocio: s?.tipoNegocio || "",
    direccion: s?.direccion || "",
    primaryColor: s?.primaryColor || "#2563eb",
    accentColor: s?.accentColor || "#0f172a",
    heroTitle: s?.heroTitle || "",
    heroSubtitle: s?.heroSubtitle || "",
    highlight1: s?.highlight1 || "",
    highlight2: s?.highlight2 || "",
    priceFrom: s?.priceFrom || "",
    bgMode: s?.bgMode || "gradient",
    bgColorTop: s?.bgColorTop || "#e8d7ff",
    bgColorBottom: s?.bgColorBottom || "#ffffff",
    bgPattern: s?.bgPattern || "none",
    bgImageUrl: s?.bgImageUrl || "",
  });

  const loadStore = async () => {
    try {
      setLoading(true);
      const { data } = await getStoreById(id);
      setStoreData(data);
      setForm(mapStoreToForm(data));
    } catch (err) {
      console.error(err);
      setError("No se pudo cargar la información de la tienda.");
    } finally {
      setLoading(false);
    }
  };

  // ========= Handlers ===========

  const onChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
    setMsg("");
  };

  // 🗺️ Comunas de Santiago (sincronizadas con ExploreStoresPage)
  const comunasOptions = [
    "Santiago Centro",
    "Las Condes",
    "Providencia",
    "Vitacura",
    "Lo Barnechea",
    "Ñuñoa",
    "La Reina",
    "Peñalolén",
    "Macul",
    "La Florida",
    "San Joaquín",
    "La Granja",
    "La Pintana",
    "San Ramón",
    "San Miguel",
    "La Cisterna",
    "El Bosque",
    "Pedro Aguirre Cerda",
    "Lo Espejo",
    "Estación Central",
    "Cerrillos",
    "Maipú",
    "Pudahuel",
    "Cerro Navia",
    "Lo Prado",
    "Quinta Normal",
    "Renca",
    "Quilicura",
    "Huechuraba",
    "Conchalí",
    "Recoleta",
    "Independencia",
  ];

  // 🏪 Tipos de negocio (sincronizados con ExploreStoresPage)
  const tiposNegocioOptions = [
    "🍔 Restaurante",
    "☕ Cafetería",
    "🛍️ Retail / Tienda",
    "💇 Peluquería / Barbería",
    "💅 Salón de Belleza",
    "🏋️ Gimnasio / Fitness",
    "🧘 Yoga / Bienestar",
    "🏥 Salud / Clínica",
    "🦷 Dental",
    "🐾 Veterinaria / Mascotas",
    "🔧 Taller / Mecánica",
    "🏠 Hogar / Decoración",
    "👗 Moda / Vestuario",
    "👟 Deportes",
    "📚 Librería / Papelería",
    "🎨 Arte / Artesanía",
    "💻 Tecnología / Electrónica",
    "📱 Celulares / Accesorios",
    "🎮 Videojuegos",
    "🎵 Música / Instrumentos",
    "🌿 Plantas / Jardín",
    "🍰 Pastelería / Repostería",
    "🍕 Comida Rápida",
    "🍜 Comida Asiática",
    "🌮 Comida Mexicana",
    "🥗 Comida Saludable",
    "🍷 Bar / Pub",
    "🎉 Eventos / Fiestas",
    "📸 Fotografía",
    "🚗 Automotriz",
    "🏪 Minimarket / Almacén",
    "🎓 Educación / Cursos",
    "💼 Servicios Profesionales",
    "🔨 Construcción / Ferretería",
    "🧹 Limpieza / Aseo",
    "🌸 Flores / Regalos",
    "💎 Joyería",
    "⌚ Relojería",
    "👓 Óptica",
    "🏨 Hotel / Alojamiento",
    "✈️ Turismo / Viajes",
    "🚚 Transporte / Logística",
    "📦 Envíos / Courier",
    "🖨️ Imprenta / Diseño",
    "🔒 Seguridad",
    "🌐 Marketing / Publicidad",
    "Otro",
  ];

  const getCoordinates = async (address) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          address
        )}`
      );
      const data = await res.json();
      if (!data.length) return null;
      return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
    } catch (err) {
      console.error("Error al obtener coordenadas:", err);
      return null;
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMsg("");
    setSaving(true);

    try {
      if (!form.direccion.trim()) {
        setError("Ingresa una dirección exacta.");
        setSaving(false);
        return;
      }

      const coords = await getCoordinates(form.direccion.trim());
      if (!coords) {
        setError("No pudimos encontrar esa dirección.");
        setSaving(false);
        return;
      }

      const payload = { ...form, lat: coords.lat, lng: coords.lng };
      const { data } = await updateMyStore(id, payload);

      setStoreData(data);
      setForm(mapStoreToForm(data));
      setMsg("Tienda actualizada correctamente.");
    } catch (err) {
      console.error(err);
      setError("Error al guardar la tienda.");
    } finally {
      setSaving(false);
    }
  };

  // ========= Valores derivados ===========

  const modePendingChange =
    storeData && form.mode && storeData.mode !== form.mode;

  const publicUrl = `${window.location.origin}/tienda/${id}`;

  const previewStyle = useMemo(
    () => buildBg(form),
    [form.bgMode, form.bgColorTop, form.bgColorBottom, form.bgImageUrl]
  );

  const pageBackgroundStyle = previewStyle;
  const headerStyle = useMemo(
    () => buildStoreHeaderStyle(form),
    [form.primaryColor, form.accentColor]
  );

  const effectiveMode = storeData?.mode || form.mode;

  const isProductsToolsView =
    activeTab === "ventas" && effectiveMode === "products";

  const isBookingsToolsView =
    activeTab === "ventas" && effectiveMode === "bookings";

  const gridColsClass =
    isProductsToolsView || isBookingsToolsView
      ? "grid gap-8 md:grid-cols-[260px,1fr,220px] items-start justify-center"
      : "grid gap-8 md:grid-cols-[260px,1fr] items-start justify-center";

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100">
        <MainHeader subtitle="Cargando tienda..." />
        <p className="p-6 text-sm text-slate-500">Cargando…</p>
      </div>
    );
  }

  /* ─────────────────────────────────────────────
     RENDER
     ───────────────────────────────────────────── */

  return (
    <div className="min-h-screen flex flex-col pt-20" style={pageBackgroundStyle}>
      {/* HEADER */}
      <MainHeader
        subtitle={`Negocio: ${form.name || "Tu tienda"}`}
        variant="store"
        headerStyle={headerStyle}
        logoSrc={form.logoUrl}
      />

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 max-w-7xl mx-auto px-8 py-8">
        <div className={gridColsClass}>
          {/* ╔════════════════════════════╗
             ║   SIDEBAR IZQUIERDO       ║
             ╚════════════════════════════╝ */}
          <aside className="bg-white/95 backdrop-blur border rounded-2xl shadow-sm p-4 space-y-4">
            {/* Avatar / Logo */}
            <div className="flex flex-col items-center text-center space-y-3">
              {form.logoUrl ? (
                <img
                  src={form.logoUrl}
                  alt={form.name}
                  className="w-20 h-20 rounded-xl object-cover border"
                />
              ) : (
                <div className="w-20 h-20 rounded-xl bg-slate-200 flex items-center justify-center text-slate-600 text-lg font-semibold">
                  {form.name?.[0]?.toUpperCase() || "N"}
                </div>
              )}

              <div className="space-y-1">
                <h2 className="text-base font-semibold text-slate-800">
                  {form.name || "Tu negocio"}
                </h2>
                <p className="text-xs text-slate-500">
                  {form.comuna || "Comuna no definida"}
                  {form.tipoNegocio ? ` · ${form.tipoNegocio}` : ""}
                </p>

                {storeData?.mode && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700">
                    {storeData.mode === "bookings"
                      ? "Agendamiento de horas"
                      : "Venta de productos"}
                  </span>
                )}
              </div>
            </div>

            {/* Botones principales */}
            <div className="space-y-2">
              <button
                onClick={() => navigate(`/tienda/${id}`)}
                className="w-full bg-slate-900 text-white text-xs md:text-sm px-3 py-2 rounded-lg hover:bg-slate-800"
              >
                Ver página pública
              </button>

              <button
                onClick={() => navigate("/onboarding")}
                className="w-full border border-slate-300 text-slate-700 text-xs md:text-sm px-3 py-2 rounded-lg hover:bg-slate-50"
              >
                Volver a mis tiendas
              </button>

              <button
                type="button"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(publicUrl);
                    setMsg("Enlace público copiado.");
                  } catch {
                    setMsg("No se pudo copiar automáticamente.");
                  }
                }}
                className="w-full text-[11px] text-blue-600 hover:underline"
              >
                Copiar enlace público
              </button>
            </div>

            {/* Secciones */}
            <div className="pt-3 border-t border-slate-200 space-y-1">
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                Secciones
              </p>

              <button
                type="button"
                onClick={() => setActiveTab("configuracion")}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 ${
                  activeTab === "configuracion"
                    ? "bg-slate-900 text-white"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <FaCog />
                <span>Configuración</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("ventas")}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 ${
                  activeTab === "ventas"
                    ? "bg-slate-900 text-white"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                {effectiveMode === "bookings" ? (
                  <>
                    <FaCalendarAlt />
                    <span>Agendamiento</span>
                  </>
                ) : (
                  <>
                    <FaShoppingCart />
                    <span>Productos / pedidos</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setShowVisualBuilder(true)}
                className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 hover:text-purple-700 transition-all duration-200 flex items-center gap-2"
              >
                <FaPalette />
                <span>Personalizar Apariencia</span>
              </button>

              <button
                type="button"
                onClick={() => setShowAdsManager(true)}
                className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 hover:text-blue-700 transition-all duration-200 flex items-center gap-2"
              >
                <FaBullhorn />
                <span>Gestionar Anuncios</span>
              </button>
            </div>
          </aside>

          {/* ╔════════════════════════════╗
             ║   CONTENIDO PRINCIPAL      ║
             ╚════════════════════════════╝ */}
          <section className="space-y-4">
            {/* TAB CONFIGURACIÓN */}
            {activeTab === "configuracion" && (
              <div className="bg-white/95 backdrop-blur border rounded-2xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-3">
                  <FaCog className="text-3xl text-slate-600" />
                  Configuración de la tienda
                </h2>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 mb-4">
                    {error}
                  </div>
                )}

                {msg && (
                  <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-700 mb-4">
                    {msg}
                  </div>
                )}

                <form onSubmit={onSubmit} className="space-y-6">
                  {/* Información básica */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-slate-700 border-b pb-2 flex items-center gap-2">
                      <FaClipboardList /> Información básica
                    </h3>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Nombre del negocio *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={onChange}
                        required
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Ej: Café del Centro"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Logo de la tienda
                      </label>
                      <div className="flex items-center gap-4">
                        {form.logoUrl && (
                          <img
                            src={form.logoUrl}
                            alt="Logo"
                            className="w-16 h-16 object-cover rounded-lg border-2 border-slate-300 shadow"
                          />
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (!file) return;
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setForm((prev) => ({ ...prev, logoUrl: reader.result }));
                            };
                            reader.readAsDataURL(file);
                          }}
                          className="flex-1 bg-white border border-slate-300 text-slate-700 rounded-lg px-3 py-2 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
                        />
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Sube una imagen que represente tu negocio (se guardará automáticamente)
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Descripción
                      </label>
                      <textarea
                        name="description"
                        value={form.description}
                        onChange={onChange}
                        rows={3}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Describe tu negocio..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Tipo de negocio *
                      </label>
                      <select
                        name="tipoNegocio"
                        value={form.tipoNegocio}
                        onChange={onChange}
                        required
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                      >
                        <option value="">Selecciona un tipo de negocio</option>
                        {tiposNegocioOptions.map((tipo) => (
                          <option key={tipo} value={tipo}>
                            {tipo}
                          </option>
                        ))}
                      </select>
                      <p className="text-xs text-slate-500 mt-1">
                        Esto ayudará a los clientes a encontrarte en los filtros de búsqueda
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Comuna *
                      </label>
                      <select
                        name="comuna"
                        value={form.comuna}
                        onChange={onChange}
                        required
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                      >
                        <option value="">Selecciona una comuna</option>
                        {comunasOptions.map((comuna) => (
                          <option key={comuna} value={comuna}>
                            {comuna}
                          </option>
                        ))}
                      </select>
                      <p className="text-xs text-slate-500 mt-1">
                        Los clientes podrán filtrar negocios por comuna
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Dirección exacta *
                      </label>
                      <input
                        type="text"
                        name="direccion"
                        value={form.direccion}
                        onChange={onChange}
                        required
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Ej: Av. Libertador Bernardo O'Higgins 1234, Santiago"
                      />
                      <p className="text-xs text-slate-500 mt-1">
                        Usaremos esto para mostrarte en el mapa
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Modo de operación *
                      </label>
                      <select
                        name="mode"
                        value={form.mode}
                        onChange={onChange}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                      >
                        <option value="products">Venta de productos</option>
                        <option value="bookings">Agendamiento de horas</option>
                      </select>
                    </div>
                  </div>

                  {/* Botones */}
                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      {saving ? "Guardando..." : <><FaCog className="animate-spin" style={{animationDuration: saving ? '1s' : '0s'}} /> Guardar cambios</>}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* TAB VENTAS/AGENDAMIENTO */}
            {activeTab === "ventas" && (
              <>
                {modePendingChange && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-700">
                    Guarda los cambios para activar herramientas de "
                    {form.mode === "bookings"
                      ? "agendamiento"
                      : "venta de productos"}
                    ".
                  </div>
                )}

                {/* Herramientas AGENDAMIENTO */}
                {!modePendingChange && effectiveMode === "bookings" && (
                  <>
                    {bookingsPanel === "services" && (
                      <ServicesManager storeId={id} />
                    )}

                    {bookingsPanel === "weeklySchedule" && (
                      <MonthlyCalendarEditor storeId={id} />
                    )}

                    {bookingsPanel === "appointments" && (
                      <AppointmentsList storeId={id} />
                    )}

                    {bookingsPanel === "insights" && (
                      <SmartInsights storeId={id} mode="bookings" />
                    )}
                  </>
                )}

                {/* Herramientas PRODUCTOS */}
                {!modePendingChange && effectiveMode === "products" && (
                  <>
                    {productsPanel === "catalog" && (
                      <ModernProductManager storeId={id} />
                    )}

                    {productsPanel === "orders" && (
                      <ModernOrdersManager storeId={id} />
                    )}

                    {productsPanel === "insights" && (
                      <SmartInsights storeId={id} mode="products" />
                    )}
                  </>
                )}
              </>
            )}
          </section>

          {/* ╔════════════════════════════╗
             ║   BARRA DERECHA (NAV)     ║
             ╚════════════════════════════╝ */}
          {(isProductsToolsView || isBookingsToolsView) && (
            <nav className="hidden md:flex flex-col gap-2 bg-white/90 backdrop-blur border rounded-2xl shadow-sm p-4">
              {isProductsToolsView && (
                <>
                  <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1 flex items-center gap-1">
                    <FaShoppingBag /> Gestión de productos
                  </p>

                  <button
                    onClick={() => setProductsPanel("catalog")}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 ${
                      productsPanel === "catalog"
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <FaClipboardList /> Catálogo
                  </button>

                  <button
                    onClick={() => setProductsPanel("orders")}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 ${
                      productsPanel === "orders"
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <FaBox /> Pedidos
                  </button>

                  <button
                    onClick={() => setProductsPanel("insights")}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 ${
                      productsPanel === "insights"
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <FaChartBar /> Análisis
                  </button>
                </>
              )}

              {isBookingsToolsView && (
                <>
                  <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1 flex items-center gap-1">
                    <FaCalendarAlt /> Gestión de agendamiento
                  </p>

                  <button
                    onClick={() => setBookingsPanel("services")}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 ${
                      bookingsPanel === "services"
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <FaWrench /> Servicios
                  </button>

                  <button
                    onClick={() => setBookingsPanel("weeklySchedule")}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 ${
                      bookingsPanel === "weeklySchedule"
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <FaClock /> Horarios
                  </button>

                  <button
                    onClick={() => setBookingsPanel("appointments")}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 ${
                      bookingsPanel === "appointments"
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <FaClipboardList /> Reservas
                  </button>

                  <button
                    onClick={() => setBookingsPanel("insights")}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 ${
                      bookingsPanel === "insights"
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <FaChartBar /> Análisis
                  </button>
                </>
              )}
            </nav>
          )}
        </div>
      </main>

      {/* 🎨 Constructor Visual Mejorado - Pantalla completa cuando está abierto */}
      {showVisualBuilder && (
        <EnhancedStoreCustomizer 
          storeId={id} 
          onClose={() => setShowVisualBuilder(false)} 
        />
      )}

      {/* 📢 Gestor de Anuncios - Modal fullscreen */}
      {showAdsManager && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center overflow-y-auto p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl my-8">
            <div className="sticky top-0 bg-white border-b border-gray-200 rounded-t-2xl px-6 py-4 flex items-center justify-between z-10">
              <h2 className="text-xl font-bold flex items-center gap-2"><FaBullhorn className="text-blue-600" /> Gestión de Espacios Publicitarios</h2>
              <button
                onClick={() => setShowAdsManager(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <PromotionalSpacesManager 
                storeId={id} 
                storePlan={storeData?.plan || 'free'}
              />
            </div>
          </div>
        </div>
      )}
      <Footer paletteMode="warm" />
    </div>
  );
}
