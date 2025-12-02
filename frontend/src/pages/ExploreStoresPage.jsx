import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import MainHeader from "../components/MainHeader";
import Footer from "../components/Footer";
import { listPublicStores } from "../api/store";

const INITIAL_CENTER = [-33.4489, -70.6693]; // Santiago
const INITIAL_ZOOM = 12;

export default function ExploreStoresPage() {
  const navigate = useNavigate();

  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [filters, setFilters] = useState({
    comuna: "",
    tipoNegocio: "",
    mode: "",
    search: "",
  });

  // COMUNAS DE SANTIAGO EXPANDIDAS
  const comunasDisponibles = [
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

  // TIPOS DE NEGOCIOS EXPANDIDOS
  const tiposNegociosDisponibles = [
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

  // MODOS DE OPERACIÓN EXPANDIDOS
  const modosOperacion = [
    { value: "products", label: "🛍️ Venta de Productos", icon: "🛒" },
    { value: "bookings", label: "Agendamiento de Citas", icon: "📆" },
  ];

  const [mapCenter, setMapCenter] = useState(INITIAL_CENTER);
  const [mapZoom, setMapZoom] = useState(INITIAL_ZOOM);
  const [selectedStoreId, setSelectedStoreId] = useState(null);

  const [isDark, setIsDark] = useState(false);
  const [vw, setVw] = useState(typeof window !== "undefined" ? window.innerWidth : 1024);

  const [paletteMode, setPaletteMode] = useState(() => {
    try {
      if (typeof window === "undefined") return "warm";
      const v = localStorage.getItem("explore:paletteMode");
      return v === "warm" || v === "cool" ? v : "warm";
    } catch (e) {
      return "warm";
    }
  }); // 'warm' | 'cool'

  useEffect(() => {
    try {
      if (typeof window === "undefined") return;
      localStorage.setItem("explore:paletteMode", paletteMode);
    } catch (e) {
      // ignore storage errors
    }
  }, [paletteMode]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handlePref = (e) => setIsDark(e.matches);
    setIsDark(mq.matches);
    if (mq.addEventListener) mq.addEventListener("change", handlePref);
    else mq.addListener(handlePref);

    const onResize = () => setVw(window.innerWidth);
    window.addEventListener("resize", onResize);

    return () => {
      if (mq.removeEventListener) mq.removeEventListener("change", handlePref);
      else mq.removeListener(handlePref);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  // paletteMode: controls the whole theme for this page

  const loadStores = async () => {
    try {
      setLoading(true);
      setError("");

      const params = {};
      if (filters.comuna) params.comuna = filters.comuna;
      if (filters.tipoNegocio) params.tipoNegocio = filters.tipoNegocio;
      if (filters.mode) params.mode = filters.mode;

      const startTime = performance.now();
      const { data } = await listPublicStores(params);
      const endTime = performance.now();
      
      console.log(`⚡ Tiendas cargadas desde API en ${(endTime - startTime).toFixed(0)}ms`);
      
      // Manejar respuesta con o sin paginación (retrocompatibilidad)
      let allStores = [];
      if (data.stores && Array.isArray(data.stores)) {
        allStores = data.stores;
      } else if (Array.isArray(data)) {
        allStores = data;
      }

      // Filtrar por búsqueda si existe (nombre, categoría o comuna)
      if (filters.search && filters.search.trim()) {
        const searchLower = filters.search.toLowerCase().trim();
        allStores = allStores.filter(store => 
          store.name?.toLowerCase().includes(searchLower) ||
          store.description?.toLowerCase().includes(searchLower) ||
          store.direccion?.toLowerCase().includes(searchLower) ||
          store.tipoNegocio?.toLowerCase().includes(searchLower) ||
          store.comuna?.toLowerCase().includes(searchLower)
        );
      }

      setStores(allStores);
      console.log(`✅ ${allStores.length} tiendas mostradas`);
    } catch (err) {
      console.error("❌ Error cargando tiendas:", err);
      setError("No se pudieron cargar los negocios.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Debounce para búsqueda: esperar 400ms después de que el usuario deja de escribir
    const searchTimer = setTimeout(() => {
      loadStores();
    }, filters.search ? 400 : 0); // Solo debounce si hay búsqueda

    return () => clearTimeout(searchTimer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.comuna, filters.tipoNegocio, filters.mode, filters.search]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleFocusOnStore = (store) => {
    if (!store.lat || !store.lng) return;
    setSelectedStoreId(store._id);
    setMapCenter([store.lat, store.lng]);
    setMapZoom(16);
  };

  const handleOpenProfile = (storeId) => {
    navigate(`/tienda/${storeId}`);
  };

  const API_ORIGIN = (import.meta.env.VITE_API_URL || "http://localhost:3000/api").replace(/\/api\/?$/, "");

  const resolveMediaUrl = (raw) => {
    if (!raw) return null;
    const s = String(raw).trim();
    if (s.startsWith("data:")) return s; // Support Base64 data URLs
    if (s.startsWith("http://") || s.startsWith("https://")) return s;
    if (s.startsWith("/")) return `${API_ORIGIN}${s}`;
    return `${API_ORIGIN}/${s}`;
  };

  // define mode-specific backgrounds + blob gradients + header bar (GALAXY STYLE)
  const modePresets = {
    warm: {
      base: "radial-gradient(ellipse at top, #2d1b3d 0%, #4a1942 35%, #7c2d5e 70%, #a0416d 100%)",
      headerBar: "linear-gradient(135deg, rgba(219, 39, 119, 0.95) 0%, rgba(236, 72, 153, 0.95) 50%, rgba(249, 115, 22, 0.95) 100%)",
      blob1: "radial-gradient(circle, rgba(236, 72, 153, 0.45) 0%, rgba(219, 39, 119, 0.35) 40%, transparent 70%)",
      blob2: "radial-gradient(circle, rgba(251, 146, 60, 0.35) 0%, rgba(236, 72, 153, 0.25) 40%, transparent 70%)",
      stars: true,
    },
    cool: {
      base: "radial-gradient(ellipse at top, #020617 0%, #0c1844 35%, #1e3a8a 70%, #1e40af 100%)",
      headerBar: "linear-gradient(135deg, rgba(30, 58, 138, 0.95) 0%, rgba(59, 130, 246, 0.95) 50%, rgba(14, 165, 233, 0.95) 100%)",
      blob1: "radial-gradient(circle, rgba(59, 130, 246, 0.4) 0%, rgba(37, 99, 235, 0.3) 40%, transparent 70%)",
      blob2: "radial-gradient(circle, rgba(14, 165, 233, 0.35) 0%, rgba(6, 182, 212, 0.25) 40%, transparent 70%)",
      stars: true,
    },
  };

  // small mapping for accent colors/gradients used across UI elements (GALAXY STYLE)
  const accents = {
    warm: { color: "#f472b6", gradient: "linear-gradient(135deg, #ec4899 0%, #f97316 100%)", glow: "0 0 20px rgba(236, 72, 153, 0.4)" },
    cool: { color: "#3b82f6", gradient: "linear-gradient(135deg, #3b82f6 0%, #0ea5e9 100%)", glow: "0 0 20px rgba(59, 130, 246, 0.4)" },
  };

  const hexToRgba = (hex, alpha) => {
    if (!hex) return `rgba(0,0,0,${alpha})`;
    const h = hex.replace('#', '');
    const bigint = parseInt(h.length === 3 ? h.split('').map(c=>c+c).join('') : h, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const accent = accents[paletteMode] || accents.warm;

  const uiTransition = 'background 1520ms ease, border-color 420ms ease, color 420ms ease, box-shadow 420ms ease, opacity 420ms ease, transform 420ms ease';

  const baseBackground = modePresets[paletteMode].base;
  const headerBarBg = modePresets[paletteMode].headerBar;

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden" style={{ background: baseBackground, transition: 'background 420ms ease' }}>

      {/* Animated stars background */}
      {modePresets[paletteMode].stars && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ opacity: 0.6 }}>
          {Array.from({ length: 80 }).map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white"
              style={{
                width: Math.random() * 3 + 1 + 'px',
                height: Math.random() * 3 + 1 + 'px',
                top: Math.random() * 100 + '%',
                left: Math.random() * 100 + '%',
                opacity: Math.random() * 0.7 + 0.3,
                animation: `twinkle ${Math.random() * 5 + 3}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 5}s`,
              }}
            />
          ))}
        </div>
      )}

      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(139, 92, 246, 0.3); }
          50% { box-shadow: 0 0 40px rgba(139, 92, 246, 0.6); }
        }
        
        /* Custom scrollbar for galaxy theme */
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(139, 92, 246, 0.5);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(139, 92, 246, 0.7);
        }
      `}</style>

      {/* Decorative background blobs (responsive + dark-aware + GALAXY EFFECT) */}
      {(() => {
        const small = vw < 640;
        const blob1Size = small ? 280 : 480;
        const blob2Size = small ? 320 : 560;
        const blob1Opacity = small ? 0.5 : 0.7;
        const blob2Opacity = small ? 0.4 : 0.6;

        const blob1Bg = modePresets[paletteMode].blob1;
        const blob2Bg = modePresets[paletteMode].blob2;

            return (
              <>
                <div
                  aria-hidden
                  style={{
                    position: "absolute",
                    top: small ? -60 : -120,
                    left: small ? -50 : -140,
                    width: blob1Size,
                    height: blob1Size,
                    borderRadius: 9999,
                    background: blob1Bg,
                    opacity: blob1Opacity,
                    filter: "blur(80px)",
                    transform: "rotate(-12deg)",
                    mixBlendMode: "screen",
                    pointerEvents: "none",
                    transition: "opacity 420ms ease, filter 420ms ease, transform 420ms ease, background 520ms ease",
                    animation: "float 8s ease-in-out infinite",
                  }}
                />

                <div
              aria-hidden
              style={{
                position: "absolute",
                bottom: small ? -70 : -140,
                right: small ? -40 : -100,
                width: blob2Size,
                height: blob2Size,
                borderRadius: 9999,
                background: blob2Bg,
                opacity: blob2Opacity,
                filter: "blur(90px)",
                transform: "rotate(12deg)",
                mixBlendMode: "screen",
                pointerEvents: "none",
                transition: "opacity 420ms ease, filter 420ms ease, transform 420ms ease, background 520ms ease",
                animation: "float 10s ease-in-out infinite reverse",
              }}
            />

            {/* Additional nebula effect */}
            <div
              aria-hidden
              style={{
                position: "absolute",
                top: "40%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: small ? 300 : 600,
                height: small ? 300 : 600,
                borderRadius: 9999,
                background: "radial-gradient(circle, rgba(168, 85, 247, 0.15) 0%, transparent 70%)",
                filter: "blur(60px)",
                pointerEvents: "none",
                opacity: 0.4,
                animation: "pulse-glow 6s ease-in-out infinite",
              }}
            />
          </>
        );
      })()}

      <MainHeader 
        subtitle="Explora negocios dentro de la plataforma"
        showTemperatureControls={true}
        paletteMode={paletteMode}
        onPaletteModeChange={setPaletteMode}
      />

      <main className="flex-1 w-full px-4 md:px-8 pt-[68px] pb-8">
        <div className="mx-auto w-full max-w-[1600px]">
          <div className="grid gap-4 lg:grid-cols-[280px,1fr,380px] items-start">
            {/* Filtros - GALAXY STYLE MEJORADO */}
            <aside className="bg-black/70 backdrop-blur-lg border border-white/20 rounded-2xl p-5 shadow-2xl self-start sticky top-[72px]" style={{ boxShadow: `${accent.glow}, 0 8px 32px rgba(0, 0, 0, 0.5)`, transition: uiTransition }}>
              <h2 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                <span className="text-lg">🔍</span>
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-200 to-pink-200">
                  Filtros de Búsqueda
                </span>
              </h2>
              
              <div className="space-y-4 text-sm">
                {/* Búsqueda rápida */}
                <div>
                  <label className="flex text-xs font-semibold text-white/80 mb-1.5 items-center gap-1">
                    <span>🔎</span>
                    Búsqueda Rápida
                  </label>
                  <input
                    type="text"
                    name="search"
                    value={filters.search}
                    onChange={handleFilterChange}
                    placeholder="Buscar por nombre..."
                    className="w-full border rounded-lg px-3 py-2 text-xs bg-white/20 backdrop-blur-sm text-white placeholder-white/60 focus:bg-white/30 focus:outline-none focus:ring-2 transition-all"
                    style={{ borderColor: hexToRgba(accent.color, 0.3), transition: uiTransition }}
                  />
                </div>

                {/* Comuna */}
                <div>
                  <label className="flex text-xs font-semibold text-white/80 mb-1.5 items-center gap-1">
                    <span>📍</span>
                    Comuna
                  </label>
                  <select
                    name="comuna"
                    value={filters.comuna}
                    onChange={handleFilterChange}
                    className="w-full border rounded-lg px-3 py-2 text-xs bg-white/10 backdrop-blur-sm text-white focus:bg-white/20 focus:outline-none focus:ring-2 transition-all"
                    style={{ borderColor: hexToRgba(accent.color, 0.3), transition: uiTransition }}
                  >
                    <option value="" className="bg-slate-900">🌎 Todas las comunas</option>
                    {comunasDisponibles.map((c) => (
                      <option key={c} value={c} className="bg-slate-900">{c}</option>
                    ))}
                  </select>
                </div>

                {/* Tipo de negocio */}
                <div>
                  <label className="flex text-xs font-semibold text-white/80 mb-1.5 items-center gap-1">
                    <span>🏪</span>
                    Tipo de Negocio
                  </label>
                  <select
                    name="tipoNegocio"
                    value={filters.tipoNegocio}
                    onChange={handleFilterChange}
                    className="w-full border rounded-lg px-3 py-2 text-xs bg-white/10 backdrop-blur-sm text-white focus:bg-white/20 focus:outline-none focus:ring-2 transition-all max-h-48"
                    style={{ borderColor: hexToRgba(accent.color, 0.3), transition: uiTransition }}
                  >
                    <option value="" className="bg-slate-900">🎯 Todos los tipos</option>
                    {tiposNegociosDisponibles.map((t) => (
                      <option key={t} value={t} className="bg-slate-900">{t}</option>
                    ))}
                  </select>
                </div>

                {/* Modo de operación */}
                <div>
                  <label className="flex text-xs font-semibold text-white/80 mb-2 items-center gap-1">
                    <span>⚙️</span>
                    Tipo de Operación
                  </label>
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => setFilters(prev => ({ ...prev, mode: "" }))}
                      className={`w-full text-left px-3 py-2.5 rounded-xl font-medium transition-all ${
                        filters.mode === "" 
                          ? "bg-gradient-to-r from-purple-500/30 to-pink-500/30 border-2 text-white shadow-lg" 
                          : "bg-white/5 border text-white/70 hover:bg-white/10"
                      }`}
                      style={{ borderColor: filters.mode === "" ? accent.color : hexToRgba(accent.color, 0.2) }}
                    >
                      <span className="flex items-center gap-2">
                        <span>🌟</span>
                        <span>Todos los servicios</span>
                      </span>
                    </button>
                    {modosOperacion.map((modo) => (
                      <button
                        key={modo.value}
                        type="button"
                        onClick={() => setFilters(prev => ({ ...prev, mode: modo.value }))}
                        className={`w-full text-left px-3 py-2.5 rounded-xl font-medium transition-all ${
                          filters.mode === modo.value 
                            ? "bg-gradient-to-r from-purple-500/30 to-pink-500/30 border-2 text-white shadow-lg" 
                            : "bg-white/5 border text-white/70 hover:bg-white/10"
                        }`}
                        style={{ borderColor: filters.mode === modo.value ? accent.color : hexToRgba(accent.color, 0.2) }}
                      >
                        <span className="flex items-center gap-2">
                          <span>{modo.icon}</span>
                          <span>{modo.label.replace(/^[🛍️📅]\s/, '')}</span>
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Botón de aplicar */}
                <button
                  type="button"
                  onClick={loadStores}
                  className="w-full mt-2 text-white text-sm font-bold px-4 py-3 rounded-xl shadow-xl hover:shadow-2xl transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                  style={{ background: accent.gradient, boxShadow: accent.glow, transition: 'all 200ms ease' }}
                >
                  <span className="text-lg">✨</span>
                  <span>Aplicar Filtros</span>
                </button>

                {/* Botón de limpiar filtros */}
                {(filters.comuna || filters.tipoNegocio || filters.mode || filters.search) && (
                  <button
                    type="button"
                    onClick={() => setFilters({ comuna: "", tipoNegocio: "", mode: "", search: "" })}
                    className="w-full text-white/70 text-xs font-medium px-3 py-2 rounded-xl border border-white/20 hover:bg-white/10 hover:text-white transition-all flex items-center justify-center gap-2"
                  >
                    <span>🗑️</span>
                    <span>Limpiar filtros</span>
                  </button>
                )}
              </div>
            </aside>

            {/* Mapa - GALAXY STYLE */}
            <section className="bg-black/70 backdrop-blur-lg border border-white/20 rounded-2xl shadow-2xl overflow-hidden relative" style={{ boxShadow: `${accent.glow}, 0 8px 32px rgba(0, 0, 0, 0.5)` }}>
              <div className="border-b border-white/10 px-4 py-2.5 bg-gradient-to-r from-black/30 to-transparent backdrop-blur-sm">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                      <span className="text-lg">🗺️</span>
                      Mapa de negocios
                    </h2>
                    <p className="text-[11px] text-white/60">Visualiza los negocios registrados en Vitrinex.</p>
                  </div>
                  <div className="text-sm text-white/80 flex items-center gap-3">
                    <div
                      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
                      style={{
                          background: hexToRgba(accent.color, 0.2),
                          color: 'white',
                          border: `1px solid ${hexToRgba(accent.color, 0.4)}`,
                          boxShadow: `inset 0 1px 1px rgba(255, 255, 255, 0.1), ${accent.glow}`,
                          transition: uiTransition,
                        }}
                    >
                      {stores.length} tiendas
                    </div>
                  </div>
                </div>
              </div>

              <div className="h-[520px] md:h-[580px] lg:h-[660px] relative">
                <MapContainer
                  key={`${mapCenter[0]}-${mapCenter[1]}-${mapZoom}`}
                  center={mapCenter}
                  zoom={mapZoom}
                  scrollWheelZoom={true}
                  className="h-full w-full"
                >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  {stores
                    .filter((s) => s.lat && s.lng)
                    .map((store) => (
                      <Marker
                        key={store._id}
                        position={[store.lat, store.lng]}
                        eventHandlers={{
                          click: () => handleFocusOnStore(store),
                        }}
                      >
                        <Popup>
                          <div className="text-xs max-w-xs">
                            <div className="font-semibold mb-1">{store.name}</div>
                            {store.comuna && <div className="text-slate-600 mb-1">{store.comuna}</div>}
                            <button className="text-blue-600 underline text-[11px]" onClick={() => handleOpenProfile(store._id)}>Ver perfil</button>
                          </div>
                        </Popup>
                      </Marker>
                    ))}
                </MapContainer>

                <div className="absolute bottom-4 left-4 z-[1000] flex gap-2">
                  <button
                    type="button"
                    onClick={() => { setMapCenter(INITIAL_CENTER); setMapZoom(INITIAL_ZOOM); setSelectedStoreId(null); }}
                    className="px-4 py-2 rounded-lg shadow-lg text-sm border border-white/20 font-medium backdrop-blur-xl hover:shadow-2xl transform hover:scale-105 active:scale-95 transition-all"
                    style={{
                      background: accent.gradient,
                      color: '#fff',
                      boxShadow: accent.glow,
                    }}
                  >
                    🎯 Recentrar
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => {
                      if (navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition(
                          (position) => {
                            const { latitude, longitude } = position.coords;
                            setMapCenter([latitude, longitude]);
                            setMapZoom(15);
                          },
                          (error) => {
                            console.error('Error obteniendo ubicación:', error);
                            alert('❌ No se pudo obtener tu ubicación. Verifica los permisos del navegador.');
                          }
                        );
                      } else {
                        alert('❌ Tu navegador no soporta geolocalización.');
                      }
                    }}
                    className="px-4 py-2 rounded-lg shadow-lg text-sm border border-white/20 font-medium backdrop-blur-xl hover:shadow-2xl transform hover:scale-105 active:scale-95 transition-all"
                    style={{
                      background: accent.gradient,
                      color: '#fff',
                      boxShadow: accent.glow,
                    }}
                  >
                    📍 Mi Ubicación
                  </button>
                </div>

                <div className="absolute top-4 right-4 z-20 w-64">
                  <div className="bg-black/40 backdrop-blur-xl border border-white/20 rounded-xl p-2 shadow-2xl" style={{ boxShadow: `${accent.glow}, 0 4px 16px rgba(0, 0, 0, 0.3)` }}>
                    <input
                      placeholder="🔎 Buscar tienda, categoría o comuna"
                      value={filters.search || ""}
                      onChange={(e) => setFilters((p) => ({ ...p, search: e.target.value }))}
                      className="w-full text-sm px-3 py-2 rounded-md border bg-white/10 text-white placeholder-white/50 focus:outline-none focus:bg-white/20 focus:ring-2"
                      style={{ borderColor: hexToRgba(accent.color, 0.3), transition: uiTransition }}
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Lista de negocios a la derecha - GALAXY STYLE */}
            <aside className="bg-black/70 backdrop-blur-lg border border-white/20 rounded-2xl p-3 shadow-2xl flex flex-col" style={{ boxShadow: `${accent.glow}, 0 8px 32px rgba(0, 0, 0, 0.5)`, transition: uiTransition, height: 'calc(520px + 3rem)', maxHeight: 'calc(660px + 3rem)' }}>
              <div className="mb-2.5">
                <h2 className="text-sm font-semibold text-white flex items-center gap-2" style={{ transition: uiTransition }}>
                  <span className="text-lg">🏪</span>
                  Negocios encontrados
                </h2>
                <p className="text-[11px] text-white/60">{loading ? "Cargando negocios…" : `${stores.length} negocio(s) encontrados`}</p>
              </div>

              {error && (
                <p className="text-xs text-red-300 bg-red-900/30 border border-red-500/30 rounded-lg px-2 py-1 mb-2 backdrop-blur-sm">{error}</p>
              )}

              <div className="flex-1 overflow-y-auto space-y-4 pr-1 custom-scrollbar">
                {!loading && stores.length === 0 && !error && (
                  <p className="text-xs text-white/50">No se encontraron negocios con esos filtros.</p>
                )}

                {stores.map((store) => (
                  <article
                    key={store._id}
                    className={`rounded-lg px-4 py-4 text-sm cursor-pointer transition-all duration-200 ease-in-out hover:scale-[1.02]`}
                    onClick={() => handleFocusOnStore(store)}
                    style={
                      selectedStoreId === store._id
                        ? { 
                            border: `1px solid ${accent.color}`, 
                            background: `${hexToRgba(accent.color, 0.15)}`, 
                            boxShadow: `${accent.glow}, 0 6px 18px rgba(0,0,0,0.2)`, 
                            backdropFilter: 'blur(12px)',
                            transition: uiTransition 
                          }
                        : { 
                            border: `1px solid rgba(255, 255, 255, 0.1)`, 
                            background: 'rgba(255, 255, 255, 0.05)',
                            backdropFilter: 'blur(12px)',
                            transition: uiTransition 
                          }
                    }
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 bg-white/10 rounded-lg flex-shrink-0 flex items-center justify-center text-xs text-white/70 overflow-hidden border border-white/20">
                        {(() => {
                          const candidate = store.logoUrl || null;
                          const src = resolveMediaUrl(candidate);
                          if (src) {
                            return (
                              <img 
                                src={src} 
                                alt="logo" 
                                className="w-full h-full object-cover rounded-lg" 
                                loading="lazy"
                                onError={(e) => { e.currentTarget.style.display = 'none'; }} 
                              />
                            );
                          }
                          return <span className="px-1 font-bold">{(store.name || "-").slice(0,2).toUpperCase()}</span>;
                        })()}
                      </div>

                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-white text-sm">{store.name}</h3>
                            <p className="text-[12px] text-white/60">{store.tipoNegocio || "Sin categoría"} {store.comuna ? `· ${store.comuna}` : ""}</p>
                          </div>
                          <div className="text-xs text-white/50">{store.distance ? `${store.distance} km` : null}</div>
                        </div>

                        {store.direccion && <p className="text-[12px] text-white/50 mt-2 line-clamp-2">{store.direccion}</p>}

                        <div className="flex items-center justify-between mt-3">
                          <span 
                            className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium border" 
                            style={{ 
                              background: hexToRgba(accent.color, 0.2), 
                              color: 'white', 
                              borderColor: hexToRgba(accent.color, 0.4),
                              transition: uiTransition 
                            }}
                          >
                            {store.mode === "bookings" ? "📅 Agendamiento" : "🛍️ Productos"}
                          </span>
                          <button 
                            type="button" 
                            onClick={(e) => { e.stopPropagation(); handleOpenProfile(store._id); }} 
                            className="text-[13px] hover:underline font-medium" 
                            style={{ color: accent.color, transition: uiTransition }}
                          >
                            Ver perfil →
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </aside>
          </div>
        </div>
      </main>
      <Footer paletteMode={paletteMode} />
    </div>
  );
}
