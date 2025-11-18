import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import MainHeader from "../components/MainHeader";
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
  });

  const [mapCenter, setMapCenter] = useState(INITIAL_CENTER);
  const [mapZoom, setMapZoom] = useState(INITIAL_ZOOM);
  const [selectedStoreId, setSelectedStoreId] = useState(null);

  const [isDark, setIsDark] = useState(false);
  const [vw, setVw] = useState(typeof window !== "undefined" ? window.innerWidth : 1024);

  const [paletteMode, setPaletteMode] = useState(() => {
    try {
      if (typeof window === "undefined") return "auto";
      const v = localStorage.getItem("explore:paletteMode");
      return v === "auto" || v === "warm" || v === "cool" ? v : "auto";
    } catch (e) {
      return "auto";
    }
  }); // 'auto' | 'warm' | 'cool'

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

      const { data } = await listPublicStores(params);
      
      // Manejar respuesta con o sin paginación (retrocompatibilidad)
      if (data.stores && Array.isArray(data.stores)) {
        setStores(data.stores);
      } else if (Array.isArray(data)) {
        setStores(data);
      } else {
        setStores([]);
      }
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar los negocios.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStores();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.comuna, filters.tipoNegocio, filters.mode]);

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
    if (s.startsWith("http://") || s.startsWith("https://")) return s;
    if (s.startsWith("/")) return `${API_ORIGIN}${s}`;
    return `${API_ORIGIN}/${s}`;
  };

  const comunasOptions = useMemo(() => {
    const s = new Set();
    stores.forEach((st) => st.comuna && s.add(st.comuna));
    return Array.from(s);
  }, [stores]);

  const tiposOptions = useMemo(() => {
    const s = new Set();
    stores.forEach((st) => st.tipoNegocio && s.add(st.tipoNegocio));
    return Array.from(s);
  }, [stores]);

  // define mode-specific backgrounds + blob gradients + header bar
  const modePresets = {
    auto: {
      base: "linear-gradient(180deg,#efe6ff 0%,#f9f2ff 55%)", // stronger lavender base
      headerBar: "linear-gradient(90deg,#d8b4fe,#c084fc)",
      blob1: "linear-gradient(135deg, rgba(186,104,200,0.72), rgba(168,85,247,0.60), rgba(124,58,237,0.36))",
      blob2: "linear-gradient(135deg, rgba(233,213,255,0.48), rgba(209,178,255,0.36), rgba(199,210,254,0.28))",
    },
    warm: {
      base: "linear-gradient(180deg,#fff0fb 0%,#fff7ff 55%)", // warm but more vivid magenta-purple
      headerBar: "linear-gradient(90deg,#f472b6,#a78bfa)",
      blob1: "linear-gradient(135deg, rgba(236,72,153,0.48), rgba(168,85,247,0.48), rgba(124,58,237,0.36))",
      blob2: "linear-gradient(135deg, rgba(249,168,212,0.34), rgba(209,178,255,0.28), rgba(199,210,254,0.18))",
    },
    cool: {
      base: "linear-gradient(180deg,#13021a 0%,#1f052b 55%)", // dark purple (kept)
      headerBar: "linear-gradient(90deg,#2b0b3a,#3b0f4f)",
      blob1: "linear-gradient(135deg, rgba(79,70,229,0.24), rgba(124,58,237,0.18), rgba(56,189,248,0.06))",
      blob2: "linear-gradient(135deg, rgba(59,25,96,0.22), rgba(40,10,80,0.18), rgba(14,165,233,0.06))",
    },
  };

  // small mapping for accent colors/gradients used across UI elements
  const accents = {
    auto: { color: "#7c3aed", gradient: "linear-gradient(90deg,#a78bfa,#7c3aed)" },
    warm: { color: "#be185d", gradient: "linear-gradient(90deg,#f472b6,#a78bfa)" },
    cool: { color: "#5b21b6", gradient: "linear-gradient(90deg,#4c1d95,#2b0b3a)" },
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

  const accent = accents[paletteMode] || accents.auto;

  const uiTransition = 'background 1520ms ease, border-color 420ms ease, color 420ms ease, box-shadow 420ms ease, opacity 420ms ease, transform 420ms ease';

  const baseBackground = modePresets[paletteMode].base;
  const headerBarBg = modePresets[paletteMode].headerBar;

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden" style={{ background: baseBackground, transition: 'background 420ms ease' }}>

      {/* Decorative background blobs (responsive + dark-aware) */}
      {(() => {
        const small = vw < 640;
        const blob1Size = small ? 200 : 320;
        const blob2Size = small ? 220 : 380;
        // boost visibility for Auto and Warm palettes so they stand out more
        const blobBoost = (paletteMode === "auto" || paletteMode === "warm") ? 1.3 : 1.0;
        const blob1Opacity = (small ? (isDark ? 0.10 : 0.16) : (isDark ? 0.16 : 0.40)) * blobBoost;
        const blob2Opacity = (small ? (isDark ? 0.08 : 0.12) : (isDark ? 0.12 : 0.30)) * blobBoost;

        // choose blobs for the selected palette mode
        const blob1Bg = modePresets[paletteMode].blob1;
        const blob2Bg = modePresets[paletteMode].blob2;

            return (
              <>
                <div
                  aria-hidden
                  style={{
                    position: "absolute",
                    top: small ? -48 : -80,
                    left: small ? -40 : -112,
                    width: blob1Size,
                    height: blob1Size,
                    borderRadius: 9999,
                    background: blob1Bg,
                    opacity: blob1Opacity,
                    filter: "blur(42px)",
                    transform: "rotate(-12deg)",
                    mixBlendMode: "multiply",
                    pointerEvents: "none",
                    transition: "opacity 420ms ease, filter 420ms ease, transform 420ms ease, background 520ms ease",
                  }}
                />

                <div
              aria-hidden
              style={{
                position: "absolute",
                bottom: small ? -56 : -112,
                right: small ? -32 : -80,
                width: blob2Size,
                height: blob2Size,
                borderRadius: 9999,
                background: blob2Bg,
                opacity: blob2Opacity,
                filter: "blur(56px)",
                transform: "rotate(12deg)",
                mixBlendMode: "overlay",
                pointerEvents: "none",
                transition: "opacity 420ms ease, filter 420ms ease, transform 420ms ease, background 520ms ease",
              }}
            />
          </>
        );
      })()}

      <div style={{ background: headerBarBg }} className="w-full">
        <MainHeader subtitle="Explora negocios dentro de la plataforma" />
      </div>

      {/* Palette selector: Auto / Cálido / Frío */}
      <div className="w-full flex justify-center mt-4 mb-2">
        <div className="inline-flex items-center bg-white/60 backdrop-blur-sm border border-slate-100 rounded-full p-1 shadow-sm text-sm">
          <button
            type="button"
            onClick={() => setPaletteMode("auto")}
            className={`px-3 py-1 rounded-full ${paletteMode === "auto" ? "bg-gradient-to-r from-purple-300 to-purple-500 text-white font-medium shadow" : "text-slate-600"}`}
          >
            Auto
          </button>
          <button
            type="button"
            onClick={() => setPaletteMode("warm")}
            className={`px-3 py-1 rounded-full ${paletteMode === "warm" ? "bg-gradient-to-r from-pink-400 to-purple-600 text-white font-medium shadow" : "text-slate-600"}`}
          >
            Cálido
          </button>
          <button
            type="button"
            onClick={() => setPaletteMode("cool")}
            className={`px-3 py-1 rounded-full ${paletteMode === "cool" ? "bg-gradient-to-r from-indigo-700 to-purple-900 text-white font-medium shadow" : "text-slate-600"}`}
          >
            Frío
          </button>
        </div>
      </div>

      <main className="flex-1 w-full px-3 md:px-6 py-6">
        <div className="mx-auto w-full max-w-7xl space-y-5">
          <div className="grid gap-5 lg:grid-cols-[260px,minmax(0,2.6fr),360px] items-start">
            {/* Filtros */}
            <aside className="bg-white border rounded-2xl p-4 shadow-sm self-start sticky top-20" style={{ borderColor: hexToRgba(accent.color, 0.10), transition: uiTransition }}>
              <h2 className="text-sm font-semibold text-slate-800 mb-3">Filtros</h2>
              <div className="space-y-3 text-sm">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Comuna</label>
                  <select
                    name="comuna"
                    value={filters.comuna}
                    onChange={handleFilterChange}
                    className="w-full border rounded-lg px-2 py-1.5 text-sm bg-white"
                    style={{ borderColor: hexToRgba(accent.color, 0.06), transition: uiTransition }}
                  >
                    <option value="">Todas</option>
                    {comunasOptions.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Tipo de negocio</label>
                  <select
                    name="tipoNegocio"
                    value={filters.tipoNegocio}
                    onChange={handleFilterChange}
                    className="w-full border rounded-lg px-2 py-1.5 text-sm bg-white"
                    style={{ borderColor: hexToRgba(accent.color, 0.06), transition: uiTransition }}
                  >
                    <option value="">Todos</option>
                    {tiposOptions.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Tipo de operación</label>
                  <select
                    name="mode"
                    value={filters.mode}
                    onChange={handleFilterChange}
                    className="w-full border rounded-lg px-2 py-1.5 text-sm bg-white"
                    style={{ borderColor: hexToRgba(accent.color, 0.06), transition: uiTransition }}
                  >
                    <option value="">Todos</option>
                    <option value="products">Venta de productos</option>
                    <option value="bookings">Agendamiento de citas</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={loadStores}
                  className="w-full mt-1 text-white text-sm font-medium px-3 py-2 rounded-lg shadow"
                  style={{ background: accent.gradient, transition: uiTransition }}
                >
                  Aplicar filtros
                </button>
              </div>
            </aside>

            {/* Mapa */}
            <section className="bg-white border rounded-2xl shadow-sm overflow-hidden relative">
              <div className="border-b px-5 py-3 bg-gradient-to-r from-white/60 to-slate-50">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-base font-semibold text-slate-800">Mapa de negocios</h2>
                    <p className="text-xs text-slate-500">Visualiza los negocios registrados en Vitrinex.</p>
                  </div>
                  <div className="text-sm text-slate-600 flex items-center gap-3">
                    <div
                      className="inline-flex items-center px-3 py-1 rounded-full text-xs"
                      style={{
                          background: hexToRgba(accent.color, 0.10),
                          color: accent.color,
                          border: `1px solid ${hexToRgba(accent.color, 0.12)}`,
                          transition: uiTransition,
                        }}
                    >
                      {stores.length} tiendas
                    </div>
                  </div>
                </div>
              </div>

              <div className="h-[460px] md:h-[520px] lg:h-[600px] relative">
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

                <div className="absolute top-4 left-4 z-20">
                  <button
                    type="button"
                    onClick={() => { setMapCenter(INITIAL_CENTER); setMapZoom(INITIAL_ZOOM); setSelectedStoreId(null); }}
                    className="px-3 py-2 rounded-lg shadow text-sm border"
                    style={{
                      background: accent.gradient,
                      color: '#fff',
                      borderColor: hexToRgba(accent.color, 0.12),
                      transition: uiTransition,
                    }}
                  >
                    Recentrar
                  </button>
                </div>

                <div className="absolute top-4 right-4 z-20 w-64">
                  <div className="bg-white/95 backdrop-blur-sm border rounded-xl p-2 shadow-sm" style={{ borderColor: hexToRgba(accent.color, 0.10), transition: uiTransition }}>
                    <input
                      placeholder="Buscar nombre de tienda"
                      value={filters.search || ""}
                      onChange={(e) => setFilters((p) => ({ ...p, search: e.target.value }))}
                      className="w-full text-sm px-3 py-2 rounded-md border focus:outline-none"
                      style={{ borderColor: hexToRgba(accent.color, 0.08), transition: uiTransition }}
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Lista de negocios a la derecha */}
            <aside className="bg-white border rounded-2xl p-4 shadow-sm h-[460px] md:h-[520px] lg:h-[600px] flex flex-col" style={{ borderColor: hexToRgba(accent.color, 0.08), transition: uiTransition }}>
              <div className="mb-3">
                <h2 className="text-base font-semibold" style={{ color: accent.color, transition: uiTransition }}>Negocios encontrados</h2>
                <p className="text-xs text-slate-500">{loading ? "Cargando negocios…" : `${stores.length} negocio(s) encontrados`}</p>
              </div>

              {error && (
                <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-2 py-1 mb-2">{error}</p>
              )}

              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {!loading && stores.length === 0 && !error && (
                  <p className="text-xs text-slate-500">No se encontraron negocios con esos filtros.</p>
                )}

                {stores.map((store) => (
                  <article
                    key={store._id}
                    className={`rounded-lg px-3 py-3 text-sm cursor-pointer transition-all duration-150 ease-in-out`}
                    onClick={() => handleFocusOnStore(store)}
                    style={
                      selectedStoreId === store._id
                        ? { border: `1px solid ${accent.color}`, background: hexToRgba(accent.color, 0.06), boxShadow: '0 6px 18px rgba(0,0,0,0.06)', transition: uiTransition }
                        : { border: `1px solid ${hexToRgba('#e6e9ef', 1)}`, transition: uiTransition }
                    }
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 bg-slate-100 rounded-lg flex-shrink-0 flex items-center justify-center text-xs text-slate-500 overflow-hidden">
                        {(() => {
                          const candidate = store.logoUrl || store.logo || store.ownerAvatar || null;
                          const src = resolveMediaUrl(candidate);
                          if (src) {
                            return (
                              // eslint-disable-next-line jsx-a11y/img-redundant-alt
                              <img src={src} alt="logo" className="w-full h-full object-cover rounded-lg" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                            );
                          }
                          return <span className="px-1">{(store.name || "-").slice(0,2).toUpperCase()}</span>;
                        })()}
                      </div>

                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-slate-800 text-sm">{store.name}</h3>
                            <p className="text-[12px] text-slate-500">{store.tipoNegocio || "Sin categoría"} {store.comuna ? `· ${store.comuna}` : ""}</p>
                          </div>
                          <div className="text-xs text-slate-500">{store.distance ? `${store.distance} km` : null}</div>
                        </div>

                        {store.direccion && <p className="text-[12px] text-slate-500 mt-2 line-clamp-2">{store.direccion}</p>}

                        <div className="flex items-center justify-between mt-3">
                          <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px]" style={{ background: hexToRgba(accent.color, 0.08), color: accent.color, transition: uiTransition }}>{store.mode === "bookings" ? "Agendamiento" : "Productos"}</span>
                          <button type="button" onClick={(e) => { e.stopPropagation(); handleOpenProfile(store._id); }} className="text-[13px] hover:underline" style={{ color: accent.color, transition: uiTransition }}>Ver perfil</button>
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
    </div>
  );
}
