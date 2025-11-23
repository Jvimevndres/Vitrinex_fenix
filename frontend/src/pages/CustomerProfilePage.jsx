// frontend/src/pages/CustomerProfilePage.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MainHeader from "../components/MainHeader";
import Footer from "../components/Footer";
import { getProfile, updateProfile } from "../api/user";
import { listMyStores } from "../api/store";
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

export default function CustomerProfilePage() {
  const navigate = useNavigate();

  // Estados principales
  const [form, setForm] = useState({
    username: "",
    email: "",
    rut: "",
    phone: "",
    address: "",
    bio: "",
    avatarUrl: "",
  });

  const [userData, setUserData] = useState(null);
  const [stores, setStores] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [myOrders, setMyOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const [activeTab, setActiveTab] = useState("perfil");

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
    loadActivity();
  }, []);

  const loadUser = async () => {
    try {
      setLoading(true);
      setError("");
      const { data } = await getProfile();
      setUserData(data);
      setForm({
        username: data?.username || "",
        email: data?.email || "",
        rut: data?.rut || "",
        phone: data?.phone || "",
        address: data?.address || "",
        bio: data?.bio || "",
        avatarUrl: data?.avatarUrl || "",
      });

      // Calcular estadísticas
      const accountCreated = data?.createdAt 
        ? new Date(data.createdAt).toLocaleDateString('es-CL', { 
            day: '2-digit', 
            month: 'long', 
            year: 'numeric' 
          })
        : "No disponible";

      const now = new Date();
      const created = data?.createdAt ? new Date(data.createdAt) : now;
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
        rating: data?.rating || 0,
      }));

      // Cargar tiendas
      const storesRes = await listMyStores();
      setStores(storesRes.data || []);
      
      // Contar productos publicados
      let totalProducts = 0;
      for (const store of storesRes.data || []) {
        try {
          const productsRes = await axios.get(`/stores/${store._id}/products`);
          totalProducts += (productsRes.data || []).length;
        } catch (err) {
          console.error(`Error loading products for store ${store._id}:`, err);
        }
      }
      
      setStats(prev => ({ ...prev, productsPublished: totalProducts }));

    } catch (err) {
      console.error(err);
      setError("No se pudo cargar la información del perfil.");
    } finally {
      setLoading(false);
    }
  };

  const loadActivity = async () => {
    try {
      // Cargar mis reservas
      const bookingsRes = await axios.get('/stores/bookings/my-bookings');
      setMyBookings(Array.isArray(bookingsRes.data) ? bookingsRes.data : []);

      // Cargar mis pedidos
      const ordersRes = await axios.get('/stores/orders/my-orders');
      setMyOrders(Array.isArray(ordersRes.data) ? ordersRes.data : []);

      // Actualizar estadísticas
      setStats(prev => ({
        ...prev,
        queriesMade: (bookingsRes.data?.length || 0) + (ordersRes.data?.length || 0),
        reviews: 0, // TODO: implementar sistema de reviews
        savedItems: 0, // TODO: implementar favoritos
      }));
    } catch (err) {
      console.error('Error loading activity:', err);
    }
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    setError("");
    setMsg("");
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMsg("");
    setSaving(true);

    try {
      await updateProfile(form);
      await loadUser();
      setMsg("Perfil actualizado correctamente.");
      setTimeout(() => setMsg(""), 3000);
    } catch (err) {
      console.error(err);
      setError("Error al guardar los cambios del perfil.");
    } finally {
      setSaving(false);
    }
  };

  const userId = userData?._id || userData?.id;
  const avatarSrc = form.avatarUrl || userData?.avatarUrl || "https://cdn-icons-png.flaticon.com/512/847/847969.png";

  // Estilo galaxia/espacio para toda la página
  const pageBackgroundStyle = {
    background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)",
  };

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

          <MainHeader subtitle="Cargando perfil..." />
          <div className="header-spacer" />
          
          <div className="relative z-10 flex items-center justify-center py-20">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-400 mx-auto"></div>
              <div className="space-y-2">
                <p className="text-base text-white font-semibold">Cargando información del perfil</p>
                <p className="text-sm text-slate-400">Preparando tu espacio personalizado...</p>
              </div>
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

        <MainHeader subtitle="Mi perfil de usuario" />
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
                  alt={form.username || "Usuario"}
                  className="relative w-32 h-32 rounded-full object-cover border-4 border-purple-400 shadow-2xl"
                />
                <div className="absolute -bottom-2 -right-2 bg-gradient-to-br from-purple-600 to-pink-600 text-white rounded-full px-3 py-1 text-xs font-bold shadow-lg border-2 border-slate-900">
                  ⭐ {stats.rating.toFixed(1)}
                </div>
              </div>

              {/* Info Principal */}
              <div className="flex-1 text-center md:text-left space-y-3">
                <h1 className="text-3xl md:text-4xl font-bold text-white">
                  {form.username || "Usuario"}
                </h1>
                <p className="text-slate-300 text-sm md:text-base">
                  {form.email || "correo@ejemplo.com"}
                </p>
                {form.bio && (
                  <p className="text-slate-400 text-sm max-w-2xl">
                    {form.bio}
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
                  onClick={() => setActiveTab("editar")}
                  className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-semibold shadow-lg transition-all hover:scale-105"
                >
                  ✏️ Editar Perfil
                </button>
                <button
                  onClick={() => navigate("/")}
                  className="px-6 py-2.5 bg-slate-700/50 hover:bg-slate-700/70 text-slate-200 rounded-xl font-medium border border-slate-600/50 transition-all"
                >
                  🏠 Volver al Inicio
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="animate-slideIn flex items-center gap-3 text-sm text-red-300 bg-red-900/40 border-2 border-red-500/40 rounded-2xl px-6 py-4 mb-6 backdrop-blur-md shadow-xl">
              <span className="text-2xl">⚠️</span>
              <span>{error}</span>
            </div>
          )}
          {msg && (
            <div className="animate-slideIn flex items-center gap-3 text-sm text-green-300 bg-green-900/40 border-2 border-green-500/40 rounded-2xl px-6 py-4 mb-6 backdrop-blur-md shadow-xl">
              <span className="text-2xl">✅</span>
              <span>{msg}</span>
            </div>
          )}

          {/* Tabs */}
          <div className="flex flex-wrap gap-3 mb-8">
            {[
              { id: "perfil", label: "👤 Perfil Público", icon: "👤" },
              { id: "actividad", label: "🏷️ Actividad", icon: "🏷️" },
              { id: "confiabilidad", label: "⭐ Confiabilidad", icon: "⭐" },
              { id: "editar", label: "✏️ Editar Perfil", icon: "✏️" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-3 rounded-xl font-semibold text-sm transition-all ${
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg scale-105"
                    : "bg-slate-800/60 text-slate-300 hover:bg-slate-700/60 border border-slate-700/50"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Contenido según tab activo */}
          {activeTab === "perfil" && (
            <div className="space-y-6 animate-slideIn">
              {/* Información básica */}
              <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl border-2 border-purple-500/20 rounded-2xl p-6 shadow-xl">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <span>👤</span> Perfil Público
                </h2>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <p className="text-sm text-slate-400">Nombre completo</p>
                    <p className="text-lg text-white font-semibold">{form.username || "No especificado"}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-slate-400">Correo electrónico</p>
                    <p className="text-lg text-white font-semibold">{form.email || "No especificado"}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-slate-400">Teléfono</p>
                    <p className="text-lg text-white font-semibold">{form.phone || "No especificado"}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-slate-400">RUT</p>
                    <p className="text-lg text-white font-semibold">{form.rut || "No especificado"}</p>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <p className="text-sm text-slate-400">Dirección</p>
                    <p className="text-lg text-white font-semibold">{form.address || "No especificada"}</p>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <p className="text-sm text-slate-400">Fecha de creación del perfil</p>
                    <p className="text-lg text-white font-semibold">{stats.accountCreated}</p>
                  </div>
                </div>
              </div>

              {/* Mis Tiendas */}
              {stores.length > 0 && (
                <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl border-2 border-purple-500/20 rounded-2xl p-6 shadow-xl">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <span>🏪</span> Mis Tiendas
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
              )}
            </div>
          )}

          {activeTab === "actividad" && (
            <div className="space-y-6 animate-slideIn">
              <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl border-2 border-purple-500/20 rounded-2xl p-6 shadow-xl">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <span>🏷️</span> Actividad en la Plataforma
                </h2>
                <div className="grid gap-6 md:grid-cols-3">
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
          )}

          {activeTab === "confiabilidad" && (
            <div className="space-y-6 animate-slideIn">
              <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl border-2 border-purple-500/20 rounded-2xl p-6 shadow-xl">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <span>⭐</span> Confiabilidad
                </h2>
                <div className="grid gap-6 md:grid-cols-3">
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

                {/* Mensaje informativo */}
                <div className="mt-6 bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
                  <p className="text-sm text-slate-300 text-center">
                    💡 <strong>Tip:</strong> Mantén una buena calificación completando tus transacciones y brindando un excelente servicio
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "editar" && (
            <div className="animate-slideIn">
              <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl border-2 border-purple-500/20 rounded-2xl p-6 shadow-xl">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <span>✏️</span> Editar Información del Perfil
                </h2>

                <form onSubmit={onSubmit} className="space-y-6">
                  {/* Avatar Upload */}
                  <div>
                    <label className="block text-sm font-medium text-purple-300 mb-2">
                      Foto de perfil
                    </label>
                    <div className="flex items-center gap-4">
                      <img
                        src={avatarSrc}
                        alt="Avatar preview"
                        className="w-20 h-20 object-cover rounded-full border-2 border-purple-400 shadow-lg"
                      />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (!file) return;
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            onChange({ target: { name: 'avatarUrl', value: reader.result } });
                          };
                          reader.readAsDataURL(file);
                        }}
                        className="flex-1 bg-slate-900/60 border border-slate-600/50 text-slate-200 rounded-lg px-3 py-2 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700 cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-purple-300 mb-2">
                        Nombre de usuario *
                      </label>
                      <input
                        name="username"
                        value={form.username}
                        onChange={onChange}
                        required
                        className="w-full bg-slate-900/60 border border-slate-600/50 text-white rounded-lg px-4 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-purple-300 mb-2">
                        Correo electrónico *
                      </label>
                      <input
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={onChange}
                        required
                        className="w-full bg-slate-900/60 border border-slate-600/50 text-white rounded-lg px-4 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-purple-300 mb-2">
                        RUT
                      </label>
                      <input
                        name="rut"
                        value={form.rut}
                        onChange={onChange}
                        placeholder="12.345.678-9"
                        className="w-full bg-slate-900/60 border border-slate-600/50 text-white placeholder-slate-500 rounded-lg px-4 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-purple-300 mb-2">
                        Teléfono
                      </label>
                      <input
                        name="phone"
                        value={form.phone}
                        onChange={onChange}
                        placeholder="+56 9 1234 5678"
                        className="w-full bg-slate-900/60 border border-slate-600/50 text-white placeholder-slate-500 rounded-lg px-4 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 transition-all"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-purple-300 mb-2">
                        Dirección
                      </label>
                      <input
                        name="address"
                        value={form.address}
                        onChange={onChange}
                        placeholder="Calle, número, comuna"
                        className="w-full bg-slate-900/60 border border-slate-600/50 text-white placeholder-slate-500 rounded-lg px-4 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 transition-all"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-purple-300 mb-2">
                        Biografía
                      </label>
                      <textarea
                        name="bio"
                        rows={3}
                        value={form.bio}
                        onChange={onChange}
                        placeholder="Cuenta algo sobre ti..."
                        className="w-full bg-slate-900/60 border border-slate-600/50 text-white placeholder-slate-500 rounded-lg px-4 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 transition-all"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-slate-700/50">
                    <button
                      type="button"
                      onClick={() => setActiveTab("perfil")}
                      className="px-6 py-3 bg-slate-700/50 hover:bg-slate-700/70 text-slate-200 rounded-xl font-medium border border-slate-600/50 transition-all"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-semibold shadow-lg transition-all hover:scale-105 disabled:opacity-60 disabled:hover:scale-100"
                    >
                      {saving ? (
                        <span className="flex items-center gap-2">
                          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Guardando...
                        </span>
                      ) : (
                        "💾 Guardar Cambios"
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>

        <Footer paletteMode="warm" />
      </div>
    </>
  );
}
