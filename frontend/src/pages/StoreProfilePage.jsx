// src/pages/StoreProfilePage.jsx
import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MainHeader from "../components/MainHeader";
import { getStoreById, updateMyStore } from "../api/store";

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
import StoreCalendarManager from "../components/StoreCalendarManager";
import SmartInsights from "../components/SmartInsights"; // 👈 IMPORTANTE
import StoreVisualBuilder from "../components/StoreVisualBuilder"; // 🎨 CONSTRUCTOR VISUAL

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
  const [productsPanel, setProductsPanel] = useState("catalog"); // catalog | orders | insights
  const [bookingsPanel, setBookingsPanel] = useState("services"); // services | weeklySchedule | monthlyView | appointments | insights
  
  // 🎨 Constructor visual
  const [showVisualBuilder, setShowVisualBuilder] = useState(false);

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
      ? "grid gap-8 md:grid-cols-[260px,200px,1fr] items-start justify-center"
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
    <div className="min-h-screen flex flex-col" style={pageBackgroundStyle}>
      {/* HEADER */}
      <MainHeader
        subtitle={`Negocio: ${form.name || "Tu tienda"}`}
        variant="store"
        headerStyle={headerStyle}
        logoSrc={form.logoUrl}
      />

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 max-w-7xl mx-auto px-6 py-6">
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
                onClick={() => setActiveTab("ventas")}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm ${
                  activeTab === "ventas"
                    ? "bg-slate-900 text-white"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                {effectiveMode === "bookings"
                  ? "Agendamiento"
                  : "Productos / pedidos"}
              </button>

              <button
                type="button"
                onClick={() => setShowVisualBuilder(true)}
                className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 hover:text-purple-700 transition-all duration-200 flex items-center gap-2"
              >
                <span>🎨</span>
                <span>Personalizar Apariencia</span>
              </button>
            </div>
          </aside>

          {/* ╔════════════════════════════╗
             ║   BARRA CENTRAL (NAV)     ║
             ╚════════════════════════════╝ */}
          {(isProductsToolsView || isBookingsToolsView) && (
            <nav className="hidden md:flex flex-col gap-2 bg-white/90 backdrop-blur border rounded-2xl shadow-sm p-4">
              {isProductsToolsView && (
                <>
                  <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1">
                    Gestión de productos
                  </p>

                  <button
                    onClick={() => setProductsPanel("catalog")}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm ${
                      productsPanel === "catalog"
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    Catálogo de productos
                  </button>

                  <button
                    onClick={() => setProductsPanel("orders")}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm ${
                      productsPanel === "orders"
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    Pedidos
                  </button>

                  {/* 👇 NUEVO: botón de análisis inteligente (productos) */}
                  <button
                    onClick={() => setProductsPanel("insights")}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm ${
                      productsPanel === "insights"
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    Análisis inteligente
                  </button>
                </>
              )}

              {isBookingsToolsView && (
                <>
                  <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1">
                    Gestión de agendamiento
                  </p>

                  <button
                    onClick={() => setBookingsPanel("services")}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm ${
                      bookingsPanel === "services"
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    📋 Servicios
                  </button>

                  <button
                    onClick={() => setBookingsPanel("weeklySchedule")}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm ${
                      bookingsPanel === "weeklySchedule"
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    📅 Configurar Horarios
                  </button>

                  <button
                    onClick={() => setBookingsPanel("appointments")}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm ${
                      bookingsPanel === "appointments"
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    📝 Gestión de Reservas
                  </button>

                  {/* 👇 NUEVO: botón de análisis inteligente (agendamiento) */}
                  <button
                    onClick={() => setBookingsPanel("insights")}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm ${
                      bookingsPanel === "insights"
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    Análisis inteligente
                  </button>
                </>
              )}
            </nav>
          )}

          {/* ╔════════════════════════════╗
             ║   CONTENIDO PRINCIPAL      ║
             ╚════════════════════════════╝ */}
          <section className="space-y-4">
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
                      <OrdersList storeId={id} />
                    )}

                    {productsPanel === "insights" && (
                      <SmartInsights storeId={id} mode="products" />
                    )}
                  </>
                )}
              </>
            )}
          </section>
        </div>
      </main>

      {/* 🎨 Constructor Visual - Pantalla completa cuando está abierto */}
      {showVisualBuilder && (
        <StoreVisualBuilder 
          storeId={id} 
          onClose={() => setShowVisualBuilder(false)} 
        />
      )}
    </div>
  );
}
