// frontend/src/pages/CustomerPublicPage.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MainHeader from "../components/MainHeader";
import Footer from "../components/Footer";
import UserChatModal from "../components/UserChatModal";
import { getPublicUser } from "../api/user";
import { useAuth } from "../context/AuthContext";
import axios from "../api/axios";

// Estilos CSS en línea para animaciones
const styles = `
  @keyframes twinkle {
    0%, 100% { opacity: 0.3; transform: scale(1); }
    50% { opacity: 0.8; transform: scale(1.2); }
  }
  .animate-twinkle {
    animation: twinkle 3s ease-in-out infinite;
  }
  @keyframes slideIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-slideIn {
    animation: slideIn 0.3s ease-out;
  }
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
  }
  .animate-float {
    animation: float 3s ease-in-out infinite;
  }
`;

export default function CustomerPublicPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, isAuthenticated } = useAuth();

  const [user, setUser] = useState(null);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openContact, setOpenContact] = useState(false);

  // Estadísticas calculadas
  const [stats, setStats] = useState({
    productsPublished: 0,
    savedItems: 0,
    queriesMade: 0,
    rating: 0,
    reviews: 0,
    activeTime: "",
    accountCreated: "",
  });

  useEffect(() => {
    loadUser();
  }, [id]);

  const loadUser = async () => {
    try {
      setLoading(true);
      setError("");
      
      const res = await getPublicUser(id);
      const data = res?.data ?? res;
      const userData = data?.user ?? data;
      
      if (!userData) {
        setError("No se encontró información del usuario.");
        return;
      }

      setUser(userData);

      // Calcular estadísticas
      const accountCreated = userData?.createdAt 
        ? new Date(userData.createdAt).toLocaleDateString('es-CL', { 
            day: '2-digit', 
            month: 'long', 
            year: 'numeric' 
          })
        : "No disponible";

      const now = new Date();
      const created = userData?.createdAt ? new Date(userData.createdAt) : now;
      const diffTime = Math.abs(now - created);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      let activeTime = "";
      if (diffDays < 30) {
        activeTime = `${diffDays} día${diffDays !== 1 ? 's' : ''}`;
      } else if (diffDays < 365) {
        const months = Math.floor(diffDays / 30);
        activeTime = `${months} mes${months !== 1 ? 'es' : ''}`;
      } else {
        const years = Math.floor(diffDays / 365);
        activeTime = `${years} año${years !== 1 ? 's' : ''}`;
      }

      setStats(prev => ({
        ...prev,
        accountCreated,
        activeTime,
        rating: userData?.rating || 0,
      }));

      // Cargar tiendas del usuario
      try {
        const storesRes = await axios.get(`/users/${id}/stores`);
        const userStores = storesRes.data || [];
        setStores(userStores);

        // Contar productos publicados
        let totalProducts = 0;
        for (const store of userStores) {
          try {
            const productsRes = await axios.get(`/stores/${store._id}/products`);
            totalProducts += (productsRes.data || []).length;
          } catch (err) {
            console.error(`Error loading products for store ${store._id}:`, err);
          }
        }
        
        setStats(prev => ({ ...prev, productsPublished: totalProducts }));
      } catch (err) {
        console.error('Error loading user stores:', err);
      }

    } catch (err) {
      console.error(err);
      setError(err?.message || "No se pudo cargar el perfil del usuario.");
    } finally {
      setLoading(false);
    }
  };

  const pageBackgroundStyle = {
    background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)",
  };

  const avatarSrc = user?.avatarUrl || user?.avatar || "https://cdn-icons-png.flaticon.com/512/847/847969.png";

  if (loading) {
    return (
      <>
        <style>{styles}</style>
        <div className="min-h-screen relative" style={pageBackgroundStyle}>
          {/* Estrellas animadas */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(50)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-white rounded-full animate-twinkle"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                }}
              />
            ))}
          </div>

          <MainHeader subtitle="Cargando perfil público..." />
          <div className="header-spacer" />
          
          <div className="relative z-10 flex items-center justify-center py-20">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-400 mx-auto"></div>
              <div className="space-y-2">
                <p className="text-base text-white font-semibold">Cargando perfil público</p>
                <p className="text-sm text-slate-400">Obteniendo información del usuario...</p>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (error || !user) {
    return (
      <>
        <style>{styles}</style>
        <div className="min-h-screen relative" style={pageBackgroundStyle}>
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(50)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-white rounded-full animate-twinkle"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                }}
              />
            ))}
          </div>

          <MainHeader subtitle="Perfil no encontrado" />
          <div className="header-spacer" />
          
          <div className="relative z-10 max-w-2xl mx-auto px-6 py-20">
            <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl border-2 border-red-500/30 rounded-2xl p-8 text-center space-y-4 animate-slideIn">
              <div className="text-6xl">🔍</div>
              <h2 className="text-2xl font-bold text-white">Usuario no encontrado</h2>
              <p className="text-slate-300">{error || "No se pudo cargar la información del perfil."}</p>
              <button
                onClick={() => navigate(-1)}
                className="mt-4 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-semibold shadow-lg transition-all hover:scale-105"
              >
                ← Volver atrás
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{styles}</style>
      <div className="min-h-screen flex flex-col relative" style={pageBackgroundStyle}>
        {/* Estrellas animadas de fondo */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(80)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full animate-twinkle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
              }}
            />
          ))}
        </div>

        <MainHeader subtitle="Perfil público de usuario" />
        <div className="header-spacer" />

        <main className="flex-1 max-w-6xl mx-auto px-6 py-10 relative z-10 w-full">
          {/* Header del Perfil */}
          <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-2xl border-2 border-purple-500/30 rounded-3xl shadow-2xl p-8 mb-8 animate-slideIn">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              {/* Avatar */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full blur-xl opacity-60 group-hover:opacity-80 transition-opacity animate-float"></div>
                <img
                  src={avatarSrc}
                  alt={user.username || "Usuario"}
                  className="relative w-32 h-32 rounded-full object-cover border-4 border-purple-400 shadow-2xl"
                />
                <div className="absolute -bottom-2 -right-2 bg-gradient-to-br from-purple-600 to-pink-600 text-white rounded-full px-3 py-1 text-xs font-bold shadow-lg border-2 border-slate-900">
                  ⭐ {stats.rating.toFixed(1)}
                </div>
              </div>

              {/* Info Principal */}
              <div className="flex-1 text-center md:text-left space-y-3">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-3">
                  <h1 className="text-3xl md:text-4xl font-bold text-white">
                    {user.username || user.name || "Usuario"}
                  </h1>
                  {/* Badge de plan */}
                  {user.plan === 'premium' ? (
                    <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-bold bg-gradient-to-r from-amber-400 to-yellow-500 text-amber-900 shadow-lg border-2 border-amber-300">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      PREMIUM
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium bg-slate-700/50 text-slate-300 border border-slate-600">
                      FREE
                    </span>
                  )}
                </div>
                <p className="text-slate-300 text-sm md:text-base">
                  {user.email || "correo@ejemplo.com"}
                </p>
                {user.bio && (
                  <p className="text-slate-400 text-sm max-w-2xl">
                    {user.bio}
                  </p>
                )}
                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    📅 Desde {stats.accountCreated}
                  </span>
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    ⏱️ {stats.activeTime} activo
                  </span>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => {
                    if (!isAuthenticated) {
                      alert("Debes iniciar sesión para contactar a este usuario");
                      navigate("/login");
                      return;
                    }
                    if (currentUser?._id === id || currentUser?.id === id) {
                      alert("No puedes contactarte a ti mismo");
                      return;
                    }
                    setOpenContact(true);
                  }}
                  className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-semibold shadow-lg transition-all hover:scale-105"
                >
                  💬 Contactar
                </button>
                <button
                  onClick={() => navigate(-1)}
                  className="px-6 py-2.5 bg-slate-700/50 hover:bg-slate-700/70 text-slate-200 rounded-xl font-medium border border-slate-600/50 transition-all"
                >
                  ← Volver atrás
                </button>
              </div>
            </div>
          </div>

          {/* Contenido en 3 columnas */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-slideIn">
            
            {/* COLUMNA 1: Perfil Público */}
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl border-2 border-purple-500/20 rounded-2xl p-6 shadow-xl">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <span>👤</span> Perfil Público
                </h2>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-sm text-slate-400">Nombre completo</p>
                    <p className="text-lg text-white font-semibold">{user.username || user.name || "No especificado"}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-slate-400">Correo electrónico</p>
                    <p className="text-lg text-white font-semibold break-all">{user.email || "No especificado"}</p>
                  </div>
                  {user.phone && (
                    <div className="space-y-2">
                      <p className="text-sm text-slate-400">Teléfono</p>
                      <p className="text-lg text-white font-semibold">{user.phone}</p>
                    </div>
                  )}
                  {user.address && (
                    <div className="space-y-2">
                      <p className="text-sm text-slate-400">Dirección</p>
                      <p className="text-lg text-white font-semibold">{user.address}</p>
                    </div>
                  )}
                  <div className="space-y-2 pt-2 border-t border-slate-700/50">
                    <p className="text-sm text-slate-400">Miembro desde</p>
                    <p className="text-lg text-white font-semibold">{stats.accountCreated}</p>
                  </div>
                </div>
              </div>

              {/* Datos de contacto adicionales */}
              {(user.rut || user.location || user.city) && (
                <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl border-2 border-purple-500/20 rounded-2xl p-6 shadow-xl">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <span>📋</span> Información Adicional
                  </h3>
                  <div className="space-y-3">
                    {user.rut && (
                      <div className="flex items-center justify-between py-2 border-b border-slate-700/50">
                        <span className="text-sm text-slate-400">RUT:</span>
                        <span className="text-sm text-white font-semibold">{user.rut}</span>
                      </div>
                    )}
                    {(user.location || user.city) && (
                      <div className="flex items-center justify-between py-2">
                        <span className="text-sm text-slate-400">Ubicación:</span>
                        <span className="text-sm text-white font-semibold">{user.location || user.city}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* COLUMNA 2: Actividad */}
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl border-2 border-purple-500/20 rounded-2xl p-6 shadow-xl">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <span>🏷️</span> Actividad en la Plataforma
                </h2>
                <div className="space-y-4">
                  {/* Productos publicados */}
                  <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-2 border-blue-500/30 rounded-xl p-5">
                    <div className="text-center space-y-2">
                      <div className="text-4xl">📦</div>
                      <p className="text-3xl font-bold text-white">{stats.productsPublished}</p>
                      <p className="text-sm text-slate-300">Productos Publicados</p>
                    </div>
                  </div>

                  {/* Guardados */}
                  <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-2 border-purple-500/30 rounded-xl p-5">
                    <div className="text-center space-y-2">
                      <div className="text-4xl">❤️</div>
                      <p className="text-3xl font-bold text-white">{stats.savedItems}</p>
                      <p className="text-sm text-slate-300">Guardados</p>
                      <p className="text-xs text-slate-500">(Próximamente)</p>
                    </div>
                  </div>

                  {/* Consultas */}
                  <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-2 border-green-500/30 rounded-xl p-5">
                    <div className="text-center space-y-2">
                      <div className="text-4xl">💬</div>
                      <p className="text-3xl font-bold text-white">{stats.queriesMade}</p>
                      <p className="text-sm text-slate-300">Consultas Hechas</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* COLUMNA 3: Confiabilidad */}
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl border-2 border-purple-500/20 rounded-2xl p-6 shadow-xl">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <span>⭐</span> Confiabilidad
                </h2>
                <div className="space-y-4">
                  {/* Calificación */}
                  <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-2 border-yellow-500/30 rounded-xl p-6">
                    <div className="text-center space-y-3">
                      <div className="text-5xl">⭐</div>
                      <p className="text-4xl font-bold text-white">{stats.rating.toFixed(1)}</p>
                      <p className="text-sm text-slate-300">Calificación Promedio</p>
                      <div className="flex justify-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span
                            key={star}
                            className={`text-2xl ${
                              star <= Math.round(stats.rating)
                                ? "text-yellow-400"
                                : "text-slate-600"
                            }`}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Opiniones */}
                  <div className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border-2 border-blue-500/30 rounded-xl p-6">
                    <div className="text-center space-y-3">
                      <div className="text-5xl">💭</div>
                      <p className="text-4xl font-bold text-white">{stats.reviews}</p>
                      <p className="text-sm text-slate-300">Opiniones Recibidas</p>
                      <p className="text-xs text-slate-500">(Próximamente)</p>
                    </div>
                  </div>

                  {/* Tiempo activo */}
                  <div className="bg-gradient-to-br from-green-500/10 to-teal-500/10 border-2 border-green-500/30 rounded-xl p-6">
                    <div className="text-center space-y-3">
                      <div className="text-5xl">⏰</div>
                      <p className="text-4xl font-bold text-white">{stats.activeTime}</p>
                      <p className="text-sm text-slate-300">Tiempo Activo</p>
                      <p className="text-xs text-slate-400">En la plataforma</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tiendas del usuario */}
          {stores.length > 0 && (
            <div className="mt-8 animate-slideIn">
              <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl border-2 border-purple-500/20 rounded-2xl p-6 shadow-xl">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <span>🏪</span> Negocios de {user.username || "este usuario"}
                </h3>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {stores.map((store) => (
                    <div
                      key={store._id}
                      onClick={() => navigate(`/negocio/${store._id}`)}
                      className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4 hover:bg-slate-700/60 hover:border-purple-500/50 transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={store.logoUrl || "https://cdn-icons-png.flaticon.com/512/869/869636.png"}
                          alt={store.name}
                          className="w-12 h-12 rounded-lg object-cover border border-purple-400/30 bg-slate-700"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-white truncate group-hover:text-purple-300 transition-colors">
                            {store.name}
                          </p>
                          <p className="text-xs text-slate-400 truncate">
                            {store.category || store.tipoNegocio || "Sin categoría"}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Modal de chat usuario-usuario */}
        {openContact && user && isAuthenticated && (
          <UserChatModal
            targetUserId={id}
            targetUsername={user.username || user.name || user.email}
            onClose={() => setOpenContact(false)}
          />
        )}

        <Footer paletteMode="warm" />
      </div>
    </>
  );
}
