// frontend/src/pages/CustomerPublicPage.jsx
import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MainHeader from "../components/MainHeader";
import { getPublicUser } from "../api/user";

const buildBg = () => {
  return {
    background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)",
  };
};

function StatCard({ title, value, subtitle }) {
  return (
    <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-md border border-purple-500/30 rounded-xl p-4 shadow-lg hover:shadow-purple-500/20 transition-all">
      <div className="text-xs font-medium text-purple-300/80 uppercase tracking-wider">{title}</div>
      <div className="mt-2 text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">{value}</div>
      {subtitle && <div className="text-xs text-slate-400 mt-1">{subtitle}</div>}
    </div>
  );
}

function ProgressBar({ label, value, max = 100, color = "#a855f7" }) {
  const percent = Math.min((value / max) * 100, 100);
  return (
    <div className="mb-3">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs font-medium text-slate-300">{label}</span>
        <span className="text-xs text-purple-400 font-semibold">{Math.round(percent)}%</span>
      </div>
      <div className="w-full h-2 bg-slate-700/50 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

function SmallDonut({ percent = 70, color = "#7c3aed" }) {
  const r = 24;
  const c = 2 * Math.PI * r;
  const dash = (percent / 100) * c;
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" className="inline-block">
      <circle cx="32" cy="32" r={r} stroke="#eef2ff" strokeWidth="8" fill="none" />
      <circle
        cx="32"
        cy="32"
        r={r}
        stroke={color}
        strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray={`${dash} ${c - dash}`}
        transform="rotate(-90 32 32)"
        fill="none"
      />
    </svg>
  );
}

export default function CustomerPublicPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openContact, setOpenContact] = useState(false);

  useEffect(() => {
    let mounted = true;
    const loadUserSafe = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await getPublicUser(id);
        // Normalizar posible respuesta de axios
        const data = res?.data ?? res;
        const u = data?.user ?? data;
        if (!mounted) return;
        if (!u) {
          setError("Respuesta de usuario vacía desde la API.");
          setUser(null);
        } else {
          setUser(u);
        }
      } catch (err) {
        if (!mounted) return;
        setError(err?.message || "No se pudo cargar el perfil del usuario.");
        setUser(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadUserSafe();
    return () => {
      mounted = false;
    };
  }, [id]);

  const pageStyle = useMemo(() => buildBg(), []);

  const avatarSrc = user?.avatarUrl || user?.avatar || "https://cdn-icons-png.flaticon.com/512/847/847969.png";

  // Datos de personalidad
  const personality = user?.personality || {
    introvert: 50,
    analytical: 50,
    loyal: 50,
    passive: 50
  };

  // Motivaciones
  const motivations = user?.motivations || {
    price: 50,
    comfort: 50,
    convenience: 50,
    speed: 50,
    transparency: 50
  };

  // Frustraciones
  const frustrations = user?.frustrations || [];

  // Objetivos
  const goals = user?.goals || [];

  // Marcas favoritas
  const favoriteBrands = user?.favoriteBrands || [];

  // Tags de arquetipos
  const archetypes = user?.archetypes || [];

  const sanitizePhone = (p) => (p ? p.replace(/\D/g, "") : "");
  const whatsappLink = (p) => {
    const num = sanitizePhone(p);
    return num ? `https://wa.me/${num}` : null;
  };
  const instagramLink = (handle) => (handle ? `https://instagram.com/${handle.replace(/^@/, "")}` : null);
  const facebookLink = (id) => (id ? `https://facebook.com/${id}` : null);
  const mailto = (email) => (email ? `mailto:${email}` : null);

  if (loading) {
    return (
      <div className="min-h-screen" style={buildBg()}>
        <MainHeader subtitle="Cargando perfil público..." />
        <div className="header-spacer" />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-sm text-slate-400">Cargando información del perfil...</p>
          </div>
        </div>
      </div>
    );
  }

  const stats = {
    revenue: user?.stats?.revenue ?? "—",
    orders: user?.stats?.orders ?? 0,
    interactions: user?.stats?.interactions ?? 0,
    responseRate: user?.stats?.responseRate ?? 78,
  };

  // Normalización de posibles campos de la API
  const instaHandle = user?.social?.instagram ?? user?.instagram ?? user?.instagramHandle ?? null;
  const fbId = user?.social?.facebook ?? user?.facebook ?? null;
  const waPhone = user?.phone ?? user?.whatsapp ?? user?.contact?.phone ?? null;
  const emailAddr = user?.email ?? user?.contact?.email ?? null;

  const instaUrl = instaHandle ? instagramLink(instaHandle) : null;
  const fbUrl = fbId ? facebookLink(fbId) : null;
  const waUrl = waPhone ? whatsappLink(waPhone) : null;
  const mailUrl = emailAddr ? mailto(emailAddr) : null;

  return (
    <div className="min-h-screen relative overflow-hidden pt-20" style={pageStyle}>
      {/* Animated stars background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ opacity: 0.4 }}>
        {Array.from({ length: 50 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width: Math.random() * 2 + 1 + 'px',
              height: Math.random() * 2 + 1 + 'px',
              top: Math.random() * 100 + '%',
              left: Math.random() * 100 + '%',
              opacity: Math.random() * 0.5 + 0.3,
              animation: `twinkle ${Math.random() * 5 + 3}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.2); }
        }
      `}</style>

      <MainHeader subtitle="Perfil de usuario" />
      <div className="header-spacer" />

      {error && (
        <div className="max-w-7xl mx-auto px-4 py-3 relative z-10">
          <div className="bg-red-900/80 backdrop-blur-md text-red-200 border border-red-500/30 rounded-xl p-4 text-sm">
            {error}
          </div>
        </div>
      )}

      {(!user && !loading) && (
        <main className="flex-1 max-w-7xl mx-auto px-4 py-8 relative z-10">
          <div className="bg-slate-800/90 backdrop-blur-md border border-slate-700 rounded-2xl p-8 text-center">
            <p className="text-sm text-slate-300">No se encontró información del usuario.</p>
            <button onClick={() => navigate(-1)} className="mt-4 px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all">
              Volver atrás
            </button>
          </div>
        </main>
      )}

      {user && (
        <main className="flex-1 max-w-7xl mx-auto px-4 py-8 relative z-10">
          {/* Card principal tipo User Persona */}
          <div className="bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-xl border border-purple-500/30 rounded-3xl shadow-2xl overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-8">
              
              {/* COLUMNA IZQUIERDA - Perfil del usuario */}
              <div className="space-y-6">
                {/* Avatar y datos básicos */}
                <div className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 backdrop-blur-md border border-purple-500/30 rounded-2xl p-6 text-center">
                  <div className="relative inline-block">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-xl opacity-50"></div>
                    <img 
                      src={avatarSrc} 
                      alt={user.username || user.name || "Usuario"} 
                      className="relative w-32 h-32 rounded-full object-cover border-4 border-purple-500/50 mx-auto shadow-2xl"
                    />
                  </div>
                  
                  <h1 className="mt-4 text-2xl font-bold bg-gradient-to-r from-purple-300 via-pink-300 to-purple-300 bg-clip-text text-transparent">
                    {user.username || user.name || "Usuario"}
                  </h1>
                  
                  <p className="text-sm text-purple-300/80 font-medium mt-1">
                    {user.title || ""}
                  </p>

                  {/* Quote/Bio corta */}
                  {user.quote && (
                    <div className="mt-4 p-4 bg-slate-800/50 rounded-xl border-l-4 border-purple-500">
                      <div className="text-4xl text-purple-400/50 leading-none">"</div>
                      <p className="text-xs text-slate-300 italic leading-relaxed">
                        {user.quote}
                      </p>
                    </div>
                  )}

                  {/* Información básica */}
                  <div className="mt-6 space-y-2 text-left">
                    {user.age && (
                      <div className="flex items-center justify-between py-2 border-b border-slate-700/50">
                        <span className="text-xs text-slate-400 font-medium">Edad:</span>
                        <span className="text-sm text-white font-semibold">{user.age}</span>
                      </div>
                    )}
                    {user.status && (
                      <div className="flex items-center justify-between py-2 border-b border-slate-700/50">
                        <span className="text-xs text-slate-400 font-medium">Estado:</span>
                        <span className="text-sm text-white font-semibold">{user.status}</span>
                      </div>
                    )}
                    {(user.location || user.city) && (
                      <div className="flex items-center justify-between py-2 border-b border-slate-700/50">
                        <span className="text-xs text-slate-400 font-medium">Ubicación:</span>
                        <span className="text-sm text-white font-semibold">{user.location || user.city}</span>
                      </div>
                    )}
                    {user.archetype && (
                      <div className="flex items-center justify-between py-2">
                        <span className="text-xs text-slate-400 font-medium">Arquetipo:</span>
                        <span className="text-sm text-purple-400 font-semibold">{user.archetype}</span>
                      </div>
                    )}
                  </div>

                  {/* Tags de arquetipos */}
                  {archetypes.length > 0 && (
                    <div className="mt-6 flex flex-wrap gap-2 justify-center">
                      {archetypes.slice(0, 6).map((tag, i) => (
                        <span key={i} className="px-3 py-1 bg-gradient-to-r from-red-500/20 to-pink-500/20 border border-red-500/40 text-red-300 rounded-full text-xs font-semibold">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Botones de acción */}
                <div className="flex flex-col gap-3">
                  <button 
                    onClick={() => setOpenContact(true)}
                    className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-purple-500/50 hover:scale-105 transition-all"
                  >
                    💬 Contactar
                  </button>
                  <button 
                    onClick={() => navigate(-1)}
                    className="w-full px-6 py-3 bg-slate-700/50 border border-slate-600 text-slate-300 rounded-xl font-semibold hover:bg-slate-700 transition-all"
                  >
                    ← Volver atrás
                  </button>
                </div>
              </div>

              {/* COLUMNA CENTRAL - Bio, Personalidad, Objetivos */}
              <div className="space-y-6">
                {/* Bio */}
                {user.bio && (
                  <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-md border border-purple-500/20 rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-purple-300 mb-3 flex items-center gap-2">
                      <span className="text-xl">📖</span> Biografía
                    </h3>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      {user.bio}
                    </p>
                  </div>
                )}

                {/* Personalidad */}
                <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-md border border-purple-500/20 rounded-2xl p-6">
                  <h3 className="text-lg font-bold text-purple-300 mb-4 flex items-center gap-2">
                    <span className="text-xl">🧠</span> Personalidad
                  </h3>
                  <div className="space-y-3">
                    <ProgressBar label="Introvertido ← → Extrovertido" value={personality.introvert} color="#ef4444" />
                    <ProgressBar label="Analítico ← → Creativo" value={personality.analytical} color="#f59e0b" />
                    <ProgressBar label="Leal ← → Voluble" value={personality.loyal} color="#10b981" />
                    <ProgressBar label="Pasivo ← → Activo" value={personality.passive} color="#3b82f6" />
                  </div>
                </div>

                {/* Objetivos */}
                {goals.length > 0 && (
                  <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-md border border-purple-500/20 rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-purple-300 mb-3 flex items-center gap-2">
                      <span className="text-xl">🎯</span> Objetivos
                    </h3>
                    <ul className="space-y-2">
                      {goals.map((goal, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                          <span className="text-purple-400 mt-0.5">✓</span>
                          <span>{goal}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* COLUMNA DERECHA - Motivaciones, Frustraciones, Marcas */}
              <div className="space-y-6">
                {/* Motivaciones */}
                <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-md border border-purple-500/20 rounded-2xl p-6">
                  <h3 className="text-lg font-bold text-purple-300 mb-4 flex items-center gap-2">
                    <span className="text-xl">💪</span> Motivaciones
                  </h3>
                  <div className="space-y-3">
                    <ProgressBar label="Precio" value={motivations.price} />
                    <ProgressBar label="Comodidad" value={motivations.comfort} />
                    <ProgressBar label="Conveniencia" value={motivations.convenience} />
                    <ProgressBar label="Velocidad" value={motivations.speed} />
                    <ProgressBar label="Transparencia" value={motivations.transparency} />
                  </div>
                </div>

                {/* Frustraciones */}
                {frustrations.length > 0 && (
                  <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-md border border-purple-500/20 rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-purple-300 mb-3 flex items-center gap-2">
                      <span className="text-xl">😤</span> Frustraciones
                    </h3>
                    <ul className="space-y-2">
                      {frustrations.map((frust, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                          <span className="text-red-400 mt-0.5">●</span>
                          <span>{frust}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Marcas favoritas */}
                {favoriteBrands.length > 0 && (
                  <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-md border border-purple-500/20 rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-purple-300 mb-4 flex items-center gap-2">
                      <span className="text-xl">⭐</span> Marcas Favoritas
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      {favoriteBrands.map((brand, i) => (
                        <div key={i} className="bg-slate-700/40 border border-slate-600/50 rounded-lg p-3 text-center hover:bg-slate-700/60 hover:border-purple-500/50 transition-all">
                          <div className="text-2xl mb-1">{brand.logo}</div>
                          <div className="text-xs font-semibold text-slate-300">{brand.name}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sección adicional de estadísticas */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard 
              title="Calificación" 
              value={user.rating ? `${user.rating} ⭐` : "—"} 
              subtitle="Calificación general" 
            />
            <StatCard 
              title="Negocios" 
              value={user.stats?.businesses || 0} 
              subtitle="Negocios activos" 
            />
            <StatCard 
              title="Respuesta" 
              value={user.stats?.responseRate ? `${user.stats.responseRate}%` : "—"} 
              subtitle="Tasa de respuesta" 
            />
          </div>
        </main>
      )}

      {/* Modal de contacto */}
      {openContact && user && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-gradient-to-br from-slate-900/98 to-slate-800/98 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-8 w-full max-w-md shadow-2xl">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-white">Contactar</h3>
                <p className="text-sm text-slate-400 mt-1">{user.username || user.name}</p>
              </div>
              <button 
                onClick={() => setOpenContact(false)} 
                className="text-slate-400 hover:text-white text-2xl leading-none transition-colors"
              >
                ✕
              </button>
            </div>
            
            <form className="space-y-4" onSubmit={(e) => { 
              e.preventDefault(); 
              alert("Mensaje enviado exitosamente! 🎉"); 
              setOpenContact(false); 
            }}>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Tu nombre</label>
                <input 
                  required 
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all" 
                  placeholder="Ingresa tu nombre"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Mensaje</label>
                <textarea 
                  required 
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all resize-none" 
                  rows={4}
                  placeholder="Escribe tu mensaje aquí..."
                />
              </div>
              
              <div className="flex gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setOpenContact(false)} 
                  className="flex-1 px-6 py-3 bg-slate-700/50 border border-slate-600 text-slate-300 rounded-xl font-semibold hover:bg-slate-700 transition-all"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-purple-500/50 hover:scale-105 transition-all"
                >
                  Enviar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
