// frontend/src/pages/CustomerProfilePage.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import MainHeader from "../components/MainHeader";
import Footer from "../components/Footer";
import CustomerPurchasesList from "../components/CustomerPurchasesList";
import { getProfile, updateProfile } from "../api/user";
import { listMyStores } from "../api/store";
import { getBookingsWithMessages } from "../api/messages";
import axios from "../api/axios";

// Helper para el preview del perfil público
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
    background: `linear-gradient(to bottom, ${f.bgColorTop} 0%, ${f.bgColorBottom} 100%)`,
  };
};

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
  input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: linear-gradient(135deg, #a855f7, #ec4899);
    cursor: pointer;
    box-shadow: 0 0 10px rgba(168, 85, 247, 0.5);
    transition: all 0.2s ease;
  }
  input[type="range"]::-webkit-slider-thumb:hover {
    transform: scale(1.2);
    box-shadow: 0 0 15px rgba(168, 85, 247, 0.8);
  }
  input[type="range"]::-moz-range-thumb {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: linear-gradient(135deg, #a855f7, #ec4899);
    cursor: pointer;
    border: none;
    box-shadow: 0 0 10px rgba(168, 85, 247, 0.5);
    transition: all 0.2s ease;
  }
  input[type="range"]::-moz-range-thumb:hover {
    transform: scale(1.2);
    box-shadow: 0 0 15px rgba(168, 85, 247, 0.8);
  }
`;

export default function CustomerProfilePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [form, setForm] = useState({
    username: "",
    email: "",
    rut: "",
    phone: "",
    address: "",
    bio: "",
    avatarUrl: "",

    // Campos User Persona
    title: "",
    quote: "",
    age: "",
    status: "",
    location: "",
    archetype: "",
    rating: "",
    
    // Personalidad (0-100)
    introvert: 50,
    analytical: 50,
    loyal: 50,
    passive: 50,

    // Motivaciones (0-100)
    price: 50,
    comfort: 50,
    convenience: 50,
    speed: 50,
    transparency: 50,

    // Arrays
    goals: [],
    frustrations: [],
    favoriteBrands: [],
    archetypes: [],

    // Personalización visual
    primaryColor: "#2563eb",
    accentColor: "#0f172a",

    bgMode: "gradient",
    bgColorTop: "#e8d7ff",
    bgColorBottom: "#ffffff",
    bgPattern: "none",
    bgImageUrl: "",
  });

  const [userData, setUserData] = useState(null);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const [activeTab, setActiveTab] = useState("perfil");
  
  // 💬 Estados para mensajes/conversaciones
  const [conversations, setConversations] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);

  useEffect(() => {
    loadUser();
    loadMessages(); // 💬 Cargar mensajes al iniciar
    
    // ✅ Recargar datos cuando cambia el usuario (login/logout)
    const handleUserLogin = () => {
      loadUser();
      loadMessages();
    };
    
    const handleUserLogout = () => {
      // Limpiar estados al hacer logout
      setUserData(null);
      setStores([]);
      setConversations([]);
    };
    
    window.addEventListener('userLogin', handleUserLogin);
    window.addEventListener('userLogout', handleUserLogout);
    
    return () => {
      window.removeEventListener('userLogin', handleUserLogin);
      window.removeEventListener('userLogout', handleUserLogout);
    };
  }, []);

  useEffect(() => {
    // Verificar si hay un tab en la URL
    const tabFromURL = searchParams.get('tab');
    if (tabFromURL === 'reservas') {
      setActiveTab('reservas');
    } else if (tabFromURL === 'mensajes') {
      setActiveTab('mensajes');
    }
  }, [searchParams]);

  const mapUserToForm = (u) => ({
    username: u?.username || "",
    email: u?.email || "",
    rut: u?.rut || "",
    phone: u?.phone || "",
    address: u?.address || "",
    bio: u?.bio || "",
    avatarUrl: u?.avatarUrl || "",

    // Campos User Persona
    title: u?.title || "",
    quote: u?.quote || "",
    age: u?.age || "",
    status: u?.status || "",
    location: u?.location || u?.city || "",
    archetype: u?.archetype || "",
    rating: u?.rating || "",

    // Personalidad
    introvert: u?.personality?.introvert ?? 50,
    analytical: u?.personality?.analytical ?? 50,
    loyal: u?.personality?.loyal ?? 50,
    passive: u?.personality?.passive ?? 50,

    // Motivaciones
    price: u?.motivations?.price ?? 50,
    comfort: u?.motivations?.comfort ?? 50,
    convenience: u?.motivations?.convenience ?? 50,
    speed: u?.motivations?.speed ?? 50,
    transparency: u?.motivations?.transparency ?? 50,

    // Arrays
    goals: u?.goals || [],
    frustrations: u?.frustrations || [],
    favoriteBrands: u?.favoriteBrands || [],
    archetypes: u?.archetypes || [],

    // Personalización visual
    primaryColor: u?.primaryColor || "#2563eb",
    accentColor: u?.accentColor || "#0f172a",

    bgMode: u?.bgMode || "gradient",
    bgColorTop: u?.bgColorTop || "#e8d7ff",
    bgColorBottom: u?.bgColorBottom || "#ffffff",
    bgPattern: u?.bgPattern || "none",
    bgImageUrl: u?.bgImageUrl || "",
  });

  const loadUser = async () => {
    try {
      setLoading(true);
      setError("");
      const { data } = await getProfile();
      setUserData(data);
      setForm(mapUserToForm(data));

      const storesRes = await listMyStores();
      setStores(storesRes.data || []);
    } catch (err) {
      console.error(err);
      setError("No se pudo cargar la información del perfil.");
    } finally {
      setLoading(false);
    }
  };

  // 💬 Cargar mensajes y conversaciones
  const loadMessages = async () => {
    try {
      setLoadingMessages(true);
      const allConversations = [];

      // Cargar tiendas del usuario
      const { data: userStores } = await listMyStores();
      const stores = userStores || [];

      // Cargar mensajes como dueño (si tiene tiendas)
      if (stores && stores.length > 0) {
        for (const store of stores) {
          try {
            // Cargar reservas con mensajes
            const { data: bookings } = await getBookingsWithMessages(store._id);
            const safeBookings = bookings || [];
            safeBookings.forEach(booking => {
              allConversations.push({
                id: `owner-booking-${booking._id}`,
                bookingId: booking._id,
                storeId: store._id,
                storeName: store.name,
                customerName: booking.customerName || booking.customerEmail,
                lastMessage: booking.unreadMessagesOwner > 0 
                  ? `${booking.unreadMessagesOwner} mensaje${booking.unreadMessagesOwner > 1 ? 's' : ''} nuevo${booking.unreadMessagesOwner > 1 ? 's' : ''}`
                  : 'Ver conversación',
                unreadCount: booking.unreadMessagesOwner || 0,
                timestamp: booking.lastMessageAt || booking.createdAt,
                isOwner: true,
                type: 'owner',
                itemType: 'booking',
                serviceName: booking.service?.name || booking.serviceName
              });
            });

            // Cargar pedidos con mensajes (si es tienda de productos)
            if (store.mode === 'products') {
              try {
                const { data: orders } = await axios.get(`/stores/${store._id}/orders`);
                const safeOrders = orders || [];
                safeOrders
                  .filter(order => order.unreadMessagesOwner > 0 || order.lastMessageAt)
                  .forEach(order => {
                    allConversations.push({
                      id: `owner-order-${order._id}`,
                      orderId: order._id,
                      storeId: store._id,
                      storeName: store.name,
                      customerName: order.customerName || order.customerEmail,
                      lastMessage: 'Ver conversación',
                      unreadCount: order.unreadMessagesOwner || 0,
                      timestamp: order.lastMessageAt || order.createdAt,
                      isOwner: true,
                      type: 'owner',
                      itemType: 'order'
                    });
                  });
              } catch (err) {
                console.error(`Error loading orders for store ${store._id}:`, err);
              }
            }
          } catch (err) {
            console.error(`Error loading messages for store ${store._id}:`, err);
          }
        }
      }

      // Cargar mensajes como cliente
      if (userData?.email) {
        try {
          // Cargar conversaciones de reservas
          const bookingsResponse = await axios.get('/stores/bookings/my-bookings', {
            params: { email: userData.email }
          });
          const bookings = Array.isArray(bookingsResponse.data) ? bookingsResponse.data : [];
          bookings
            .filter(b => b.unreadMessagesCustomer > 0 || b.lastMessageAt)
            .forEach(booking => {
              allConversations.push({
                id: `customer-booking-${booking._id}`,
                bookingId: booking._id,
                storeId: booking.store?._id,
                storeName: booking.store?.name || 'Negocio',
                storeLogo: booking.store?.logoUrl,
                serviceName: booking.service?.name || booking.serviceName,
                lastMessage: 'Ver conversación',
                unreadCount: booking.unreadMessagesCustomer || 0,
                timestamp: booking.lastMessageAt || booking.createdAt,
                isOwner: false,
                type: 'customer',
                itemType: 'booking'
              });
            });

          // Cargar conversaciones de órdenes
          const ordersResponse = await axios.get('/stores/orders/my-orders', {
            params: { email: userData.email }
          });
          const orders = Array.isArray(ordersResponse.data) ? ordersResponse.data : [];
          orders
            .filter(o => o.unreadMessagesCustomer > 0 || o.lastMessageAt)
            .forEach(order => {
              allConversations.push({
                id: `customer-order-${order._id}`,
                orderId: order._id,
                storeId: order.store?._id,
                storeName: order.store?.name || 'Negocio',
                serviceName: `Pedido #${order._id.slice(-6)}`,
                lastMessage: 'Ver conversación',
                unreadCount: order.unreadMessagesCustomer || 0,
                timestamp: order.lastMessageAt || order.createdAt,
                isOwner: false,
                type: 'customer',
                itemType: 'order'
              });
            });
        } catch (err) {
          console.error('Error loading customer messages:', err);
        }
      }

      // Ordenar por timestamp
      allConversations.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      setConversations(allConversations);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoadingMessages(false);
    }
  };

  const onChange = (e) => {
    const { name, value, type } = e.target;
    
    // Validaciones específicas
    if (name === 'age' && value) {
      const age = parseInt(value);
      if (age < 0 || age > 120) return;
    }
    if (name === 'rating' && value) {
      const rating = parseFloat(value);
      if (rating < 0 || rating > 5) return;
    }
    
    // Convertir números apropiadamente
    const finalValue = type === 'number' ? (value === '' ? '' : Number(value)) : value;
    
    setForm((p) => ({ ...p, [name]: finalValue }));
    setError("");
    setMsg("");
  };

  // Funciones para manejar arrays
  const addGoal = () => {
    setForm(p => ({ ...p, goals: [...p.goals, ""] }));
  };

  const updateGoal = (index, value) => {
    setForm(p => {
      const newGoals = [...p.goals];
      newGoals[index] = value;
      return { ...p, goals: newGoals };
    });
  };

  const removeGoal = (index) => {
    setForm(p => ({ ...p, goals: p.goals.filter((_, i) => i !== index) }));
  };

  const addFrustration = () => {
    setForm(p => ({ ...p, frustrations: [...p.frustrations, ""] }));
  };

  const updateFrustration = (index, value) => {
    setForm(p => {
      const newFrustrations = [...p.frustrations];
      newFrustrations[index] = value;
      return { ...p, frustrations: newFrustrations };
    });
  };

  const removeFrustration = (index) => {
    setForm(p => ({ ...p, frustrations: p.frustrations.filter((_, i) => i !== index) }));
  };

  const addBrand = () => {
    setForm(p => ({ ...p, favoriteBrands: [...p.favoriteBrands, { name: "", logo: "" }] }));
  };

  const updateBrand = (index, field, value) => {
    setForm(p => {
      const newBrands = [...p.favoriteBrands];
      newBrands[index] = { ...newBrands[index], [field]: value };
      return { ...p, favoriteBrands: newBrands };
    });
  };

  const removeBrand = (index) => {
    setForm(p => ({ ...p, favoriteBrands: p.favoriteBrands.filter((_, i) => i !== index) }));
  };

  const addArchetype = () => {
    setForm(p => ({ ...p, archetypes: [...p.archetypes, ""] }));
  };

  const updateArchetype = (index, value) => {
    setForm(p => {
      const newArchetypes = [...p.archetypes];
      newArchetypes[index] = value;
      return { ...p, archetypes: newArchetypes };
    });
  };

  const removeArchetype = (index) => {
    setForm(p => ({ ...p, archetypes: p.archetypes.filter((_, i) => i !== index) }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMsg("");
    setSaving(true);

    try {
      const payload = {
        ...form,
        personality: {
          introvert: form.introvert,
          analytical: form.analytical,
          loyal: form.loyal,
          passive: form.passive,
        },
        motivations: {
          price: form.price,
          comfort: form.comfort,
          convenience: form.convenience,
          speed: form.speed,
          transparency: form.transparency,
        },
      };
      await updateProfile(payload);
      await loadUser();
      setMsg("Perfil actualizado correctamente.");
    } catch (err) {
      console.error(err);
      setError("Error al guardar los cambios del perfil.");
    } finally {
      setSaving(false);
    }
  };

  // 🎨 Estilo para el PREVIEW con personalización del usuario
  const previewStyle = useMemo(
    () => buildBg(form),
    [form.bgMode, form.bgColorTop, form.bgColorBottom, form.bgImageUrl]
  );

  // 🎨 Estilo galaxia/espacio para toda la página
  const pageBackgroundStyle = {
    background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)",
  };

  const userId = userData?._id || userData?.id;
  const publicUrl = userId
    ? `${window.location.origin}/usuario/${userId}`
    : "";

  const avatarSrc =
    form.avatarUrl ||
    userData?.avatarUrl ||
    "https://cdn-icons-png.flaticon.com/512/847/847969.png";

  if (loading) {
    return (
      <>
        <style>{styles}</style>
        <div className="min-h-screen relative" style={pageBackgroundStyle}>
          {/* Estrellas animadas */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(30)].map((_, i) => (
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
      <div
        className="min-h-screen flex flex-col relative pt-20"
        style={pageBackgroundStyle}
      >
        {/* Estrellas animadas de fondo */}
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

      <MainHeader subtitle="Editar perfil de usuario" />
      <div className="header-spacer" />

      <main className="flex-1 max-w-5xl mx-auto px-4 py-8 relative z-10">
        <div className="grid gap-6 md:grid-cols-[260px,minmax(0,1.8fr)] items-start">
          {/* Sidebar con estilo glassmorphism oscuro */}
          <aside className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl border border-purple-500/20 rounded-2xl shadow-2xl p-4 space-y-4">
            <div className="flex flex-col items-center text-center space-y-3">
              {avatarSrc ? (
                <div className="relative">
                  <img
                    src={avatarSrc}
                    alt={form.username || "Usuario"}
                    className="w-20 h-20 rounded-full object-cover border-2 border-purple-400 shadow-lg"
                  />
                  <div className="absolute inset-0 rounded-full bg-purple-500/20 blur-xl"></div>
                </div>
              ) : (
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-lg font-semibold shadow-lg">
                  {form.username?.[0]?.toUpperCase() || "U"}
                </div>
              )}

              <div className="space-y-1">
                <h2 className="text-base font-semibold text-white">
                  {form.username || "Tu nombre"}
                </h2>
                <p className="text-xs text-slate-300">
                  {form.email || "Correo no definido"}
                </p>
                {form.rut && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-[11px] font-medium bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    {form.rut}
                  </span>
                )}
              </div>
            </div>

            {userId && (
              <div className="space-y-2">
                <button
                  onClick={() => navigate(`/usuario/${userId}`)}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs md:text-sm px-3 py-2 rounded-lg hover:from-purple-700 hover:to-pink-700 shadow-lg transition-all"
                >
                  Ver perfil público
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    if (!publicUrl) return;
                    try {
                      await navigator.clipboard.writeText(publicUrl);
                      setMsg("Enlace público copiado.");
                    } catch {
                      setMsg(
                        "Si no se copió, copia el enlace desde la barra del navegador."
                      );
                    }
                  }}
                  className="w-full text-[11px] text-purple-300 hover:text-purple-200 hover:underline transition-colors"
                >
                  📋 Copiar enlace público
                </button>
                <button
                  onClick={() => navigate("/")}
                  className="w-full border border-slate-500/30 bg-slate-800/40 text-slate-200 text-xs md:text-sm px-3 py-2 rounded-lg hover:bg-slate-700/40 transition-all"
                >
                  Volver al inicio
                </button>
              </div>
            )}

            <div className="pt-3 border-t border-slate-600/30 space-y-1">
              <p className="text-[11px] font-semibold text-purple-300 uppercase tracking-wide">
                Secciones
              </p>
              <button
                type="button"
                onClick={() => setActiveTab("perfil")}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                  activeTab === "perfil"
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
                    : "text-slate-300 hover:bg-slate-700/40"
                }`}
              >
                👤 Mi Perfil
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("reservas")}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                  activeTab === "reservas"
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
                    : "text-slate-300 hover:bg-slate-700/40"
                }`}
              >
                📅 Mis Reservas
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("mensajes")}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                  activeTab === "mensajes"
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
                    : "text-slate-300 hover:bg-slate-700/40"
                }`}
              >
                💬 Mis Mensajes
              </button>
            </div>
          </aside>

          {/* Contenido principal */}
          <section className="space-y-4">
            {activeTab === "perfil" && (
              <section className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-5 shadow-2xl space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <h2 className="text-lg font-semibold text-white">
                      👤 Mi Perfil Completo
                    </h2>
                    <p className="text-xs text-slate-300">
                      Información personal, contacto y perfil de usuario
                    </p>
                  </div>

                  {/* Preview mini con los colores del usuario */}
                  <div className="hidden md:block">
                    <div
                      className="w-[300px] rounded-xl border border-purple-400/30 shadow-xl p-3"
                      style={previewStyle}
                    >
                      <div className="bg-black/40 backdrop-blur-md rounded-lg p-3 space-y-2 border border-white/10">
                        <div className="flex items-center gap-3">
                          {avatarSrc ? (
                            <img
                              src={avatarSrc}
                              alt={form.username || "Usuario"}
                              className="h-10 w-10 rounded-full object-cover border-2 border-purple-400 shadow-lg"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xs text-white font-semibold">
                              {form.username?.[0]?.toUpperCase() || "U"}
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="font-semibold text-white truncate">
                              {form.username || "Nombre del usuario"}
                            </div>
                            <div className="text-[11px] text-slate-300 truncate">
                              {form.email || "correo@ejemplo.com"}
                            </div>
                          </div>
                        </div>

                        <div className="text-xs text-slate-200 line-clamp-3">
                          {form.bio ||
                            "Aquí se mostrará tu biografía o descripción personal."}
                        </div>

                        <div className="flex gap-2">
                          <span
                            className="px-2 py-1 rounded-full text-[10px] text-white shadow-lg"
                            style={{ background: form.primaryColor }}
                          >
                            Contactar
                          </span>
                          <span className="px-2 py-1 rounded-full text-[10px] text-slate-200 bg-slate-700/60 border border-slate-500/30">
                            Ver más
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="animate-slideIn flex items-center gap-2 text-sm text-red-300 bg-red-900/40 border border-red-500/40 rounded-xl px-4 py-3 backdrop-blur-md shadow-lg">
                    <span className="text-lg">⚠️</span>
                    <span>{error}</span>
                  </div>
                )}
                {msg && (
                  <div className="animate-slideIn flex items-center gap-2 text-sm text-green-300 bg-green-900/40 border border-green-500/40 rounded-xl px-4 py-3 backdrop-blur-md shadow-lg">
                    <span className="text-lg">✅</span>
                    <span>{msg}</span>
                  </div>
                )}

                <form
                  onSubmit={onSubmit}
                  className="grid gap-4 md:grid-cols-2 text-sm"
                >
                  <div>
                    <label className="block text-xs font-medium text-purple-300 mb-1">
                      Nombre de usuario
                    </label>
                    <input
                      name="username"
                      value={form.username}
                      onChange={onChange}
                      className="w-full bg-slate-900/60 border border-slate-600/50 text-white rounded-lg px-3 py-2 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-purple-300 mb-1">
                      Correo electrónico
                    </label>
                    <input
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={onChange}
                      className="w-full bg-slate-900/60 border border-slate-600/50 text-white rounded-lg px-3 py-2 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-purple-300 mb-1">
                      RUT
                    </label>
                    <input
                      name="rut"
                      value={form.rut}
                      onChange={onChange}
                      placeholder="12.345.678-9"
                      className="w-full bg-slate-900/60 border border-slate-600/50 text-white placeholder-slate-400 rounded-lg px-3 py-2 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-purple-300 mb-1">
                      Teléfono
                    </label>
                    <input
                      name="phone"
                      value={form.phone}
                      onChange={onChange}
                      placeholder="+56 9 1234 5678"
                      className="w-full bg-slate-900/60 border border-slate-600/50 text-white placeholder-slate-400 rounded-lg px-3 py-2 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-purple-300 mb-1">
                      Dirección
                    </label>
                    <input
                      name="address"
                      value={form.address}
                      onChange={onChange}
                      placeholder="Calle, número, comuna"
                      className="w-full bg-slate-900/60 border border-slate-600/50 text-white placeholder-slate-400 rounded-lg px-3 py-2 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                    />
                  </div>

                  {/* Avatar Upload */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-purple-300 mb-1">
                      Foto de perfil
                    </label>
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
                      className="w-full bg-slate-900/60 border border-slate-600/50 text-slate-200 rounded-lg px-3 py-2 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700 cursor-pointer"
                    />
                    {form.avatarUrl && (
                      <div className="mt-2 relative inline-block">
                        <img src={form.avatarUrl} alt="Avatar preview" className="w-20 h-20 object-cover rounded-full border-2 border-purple-400 shadow-lg" />
                        <button
                          type="button"
                          onClick={() => onChange({ target: { name: 'avatarUrl', value: '' } })}
                          className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 shadow-lg"
                        >
                          ✕
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-purple-300 mb-1">
                      Biografía
                    </label>
                    <textarea
                      name="bio"
                      rows={3}
                      value={form.bio}
                      onChange={onChange}
                      className="w-full bg-slate-900/60 border border-slate-600/50 text-white placeholder-slate-400 rounded-lg px-3 py-2 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                      placeholder="Cuenta algo sobre ti, tus servicios o tu emprendimiento."
                    />
                  </div>

                  {/* Personalización visual */}
                  <div className="md:col-span-2 pt-4 border-t border-slate-600/30">
                    <h3 className="text-sm font-semibold text-purple-300 mb-2">
                      🎨 Personalización visual del perfil
                    </h3>

                    <div className="grid gap-3 md:grid-cols-2">
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">
                          Color principal (botones, acentos)
                        </label>
                        <div className="flex gap-2 items-center">
                          <input
                            type="color"
                            name="primaryColor"
                            value={form.primaryColor}
                            onChange={onChange}
                            className="h-9 w-9 rounded-md border border-slate-600 cursor-pointer bg-slate-900"
                          />
                          <input
                            name="primaryColor"
                            value={form.primaryColor}
                            onChange={onChange}
                            className="flex-1 bg-slate-900/60 border border-slate-600/50 text-white rounded-lg px-3 py-2 text-xs font-mono"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">
                          Color de encabezados
                        </label>
                        <div className="flex gap-2 items-center">
                          <input
                            type="color"
                            name="accentColor"
                            value={form.accentColor}
                            onChange={onChange}
                            className="h-9 w-9 rounded-md border border-slate-600 cursor-pointer bg-slate-900"
                          />
                          <input
                            name="accentColor"
                            value={form.accentColor}
                            onChange={onChange}
                            className="flex-1 bg-slate-900/60 border border-slate-600/50 text-white rounded-lg px-3 py-2 text-xs font-mono"
                          />
                        </div>
                      </div>

                      {/* Fondo */}
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">
                          Tipo de fondo
                        </label>
                        <select
                          name="bgMode"
                          value={form.bgMode}
                          onChange={onChange}
                          className="w-full bg-slate-900/60 border border-slate-600/50 text-white rounded-lg px-3 py-2"
                        >
                          <option value="gradient">Degradado</option>
                          <option value="solid">Sólido</option>
                          <option value="image">Imagen</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">
                          Patrón
                        </label>
                        <select
                          name="bgPattern"
                          value={form.bgPattern}
                          onChange={onChange}
                          className="w-full bg-slate-900/60 border border-slate-600/50 text-white rounded-lg px-3 py-2"
                        >
                          <option value="none">Ninguno</option>
                          <option value="dots">Puntos</option>
                          <option value="grid">Grilla</option>
                          <option value="noise">Ruido sutil</option>
                        </select>
                      </div>

                      {(form.bgMode === "gradient" ||
                        form.bgMode === "solid") && (
                        <>
                          <div>
                            <label className="block text-xs font-medium text-slate-300 mb-1">
                              Color superior (degradado) / sólido
                            </label>
                            <div className="flex gap-2 items-center">
                              <input
                                type="color"
                                name="bgColorTop"
                                value={form.bgColorTop}
                                onChange={onChange}
                                className="h-9 w-9 rounded-md border border-slate-600 cursor-pointer bg-slate-900"
                              />
                              <input
                                name="bgColorTop"
                                value={form.bgColorTop}
                                onChange={onChange}
                                className="flex-1 bg-slate-900/60 border border-slate-600/50 text-white rounded-lg px-3 py-2 text-xs font-mono"
                              />
                            </div>
                          </div>

                          {form.bgMode === "gradient" && (
                            <div>
                              <label className="block text-xs font-medium text-slate-300 mb-1">
                                Color inferior (degradado)
                              </label>
                              <div className="flex gap-2 items-center">
                                <input
                                  type="color"
                                  name="bgColorBottom"
                                  value={form.bgColorBottom}
                                  onChange={onChange}
                                  className="h-9 w-9 rounded-md border border-slate-600 cursor-pointer bg-slate-900"
                                />
                                <input
                                  name="bgColorBottom"
                                  value={form.bgColorBottom}
                                  onChange={onChange}
                                  className="flex-1 bg-slate-900/60 border border-slate-600/50 text-white rounded-lg px-3 py-2 text-xs font-mono"
                                />
                              </div>
                            </div>
                          )}
                        </>
                      )}

                      {form.bgMode === "image" && (
                        <div className="md:col-span-2">
                          <label className="block text-xs font-medium text-slate-300 mb-1">
                            Imagen de fondo
                          </label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files[0];
                              if (!file) return;
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                onChange({ target: { name: 'bgImageUrl', value: reader.result } });
                              };
                              reader.readAsDataURL(file);
                            }}
                            className="w-full bg-slate-900/60 border border-slate-600/50 text-slate-200 rounded-lg px-3 py-2 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700 cursor-pointer"
                          />
                          {form.bgImageUrl && (
                            <div className="mt-2 relative inline-block w-full">
                              <img src={form.bgImageUrl} alt="Background preview" className="w-full h-32 object-cover rounded-lg border border-purple-400/30 shadow-lg" />
                              <button
                                type="button"
                                onClick={() => onChange({ target: { name: 'bgImageUrl', value: '' } })}
                                className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 shadow-lg"
                              >
                                ✕
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* SECCIÓN: INFORMACIÓN DE PERFIL PÚBLICO */}
                  <div className="md:col-span-2 pt-6 border-t border-purple-500/20">
                    <h3 className="text-base font-semibold text-purple-300 mb-4 flex items-center gap-2">
                      <span>🎭</span> Perfil Público (User Persona)
                    </h3>

                    {/* Información de Persona */}
                    <div className="bg-slate-900/40 rounded-xl p-4 mb-4 border border-slate-700/30 hover:border-purple-500/40 transition-all">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-semibold text-purple-300 flex items-center gap-2">
                          <span>📋</span> Información de Persona
                        </h4>
                        <span className="text-xs text-slate-400 italic">Define tu perfil público</span>
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <label className="block text-xs font-medium text-slate-300 mb-1">
                            Título / Rol
                          </label>
                          <input
                            name="title"
                            value={form.title}
                            onChange={onChange}
                            placeholder="ej: Diseñador UI, Desarrollador, etc."
                            className="w-full bg-slate-900/60 border border-slate-600/50 text-white placeholder-slate-500 rounded-lg px-3 py-2 text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-slate-300 mb-1">
                            Arquetipo Principal
                          </label>
                          <input
                            name="archetype"
                            value={form.archetype}
                            onChange={onChange}
                            placeholder="ej: Viajero Frecuente, Explorador, etc."
                            className="w-full bg-slate-900/60 border border-slate-600/50 text-white placeholder-slate-500 rounded-lg px-3 py-2 text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-slate-300 mb-1">
                            Edad
                          </label>
                          <input
                            name="age"
                            type="number"
                            value={form.age}
                            onChange={onChange}
                            placeholder="28"
                            className="w-full bg-slate-900/60 border border-slate-600/50 text-white placeholder-slate-500 rounded-lg px-3 py-2 text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-slate-300 mb-1">
                            Estado Civil
                          </label>
                          <input
                            name="status"
                            value={form.status}
                            onChange={onChange}
                            placeholder="ej: Soltero, Casado, etc."
                            className="w-full bg-slate-900/60 border border-slate-600/50 text-white placeholder-slate-500 rounded-lg px-3 py-2 text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-slate-300 mb-1">
                            Ubicación / Ciudad
                          </label>
                          <input
                            name="location"
                            value={form.location}
                            onChange={onChange}
                            placeholder="ej: Brooklyn, Santiago, etc."
                            className="w-full bg-slate-900/60 border border-slate-600/50 text-white placeholder-slate-500 rounded-lg px-3 py-2 text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-slate-300 mb-1">
                            Calificación ⭐ (0-5)
                          </label>
                          <input
                            name="rating"
                            type="number"
                            step="0.1"
                            min="0"
                            max="5"
                            value={form.rating}
                            onChange={onChange}
                            placeholder="4.8"
                            className="w-full bg-slate-900/60 border border-slate-600/50 text-white placeholder-slate-500 rounded-lg px-3 py-2 text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-xs font-medium text-slate-300 mb-1">
                            Frase / Cita Personal
                          </label>
                          <textarea
                            name="quote"
                            value={form.quote}
                            onChange={onChange}
                            rows={2}
                            placeholder="Una frase que te represente..."
                            className="w-full bg-slate-900/60 border border-slate-600/50 text-white placeholder-slate-500 rounded-lg px-3 py-2 text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Personalidad */}
                    <div className="bg-slate-900/40 rounded-xl p-4 mb-4 border border-slate-700/30 hover:border-purple-500/40 transition-all">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-semibold text-purple-300 flex items-center gap-2">
                          <span>🧠</span> Personalidad
                        </h4>
                        <span className="text-xs text-slate-400 italic">Ajusta los valores de 0 a 100</span>
                      </div>
                      <div className="space-y-4">
                        {[
                          { name: 'introvert', label: 'Introvertido ← → Extrovertido' },
                          { name: 'analytical', label: 'Analítico ← → Creativo' },
                          { name: 'loyal', label: 'Leal ← → Voluble' },
                          { name: 'passive', label: 'Pasivo ← → Activo' },
                        ].map(({ name, label }) => (
                          <div key={name}>
                            <div className="flex justify-between items-center mb-2">
                              <label className="text-xs text-slate-300">{label}</label>
                              <span className="text-xs text-purple-400 font-semibold">{form[name]}%</span>
                            </div>
                            <input
                              type="range"
                              name={name}
                              min="0"
                              max="100"
                              value={form[name]}
                              onChange={onChange}
                              className="w-full h-2 bg-slate-700/50 rounded-full appearance-none cursor-pointer"
                              style={{
                                background: `linear-gradient(to right, #a855f7 0%, #a855f7 ${form[name]}%, #334155 ${form[name]}%, #334155 100%)`
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Motivaciones */}
                    <div className="bg-slate-900/40 rounded-xl p-4 mb-4 border border-slate-700/30 hover:border-purple-500/40 transition-all">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-semibold text-purple-300 flex items-center gap-2">
                          <span>💪</span> Motivaciones
                        </h4>
                        <span className="text-xs text-slate-400 italic">¿Qué te impulsa?</span>
                      </div>
                      <div className="space-y-4">
                        {[
                          { name: 'price', label: 'Precio' },
                          { name: 'comfort', label: 'Comodidad' },
                          { name: 'convenience', label: 'Conveniencia' },
                          { name: 'speed', label: 'Velocidad' },
                          { name: 'transparency', label: 'Transparencia' },
                        ].map(({ name, label }) => (
                          <div key={name}>
                            <div className="flex justify-between items-center mb-2">
                              <label className="text-xs text-slate-300">{label}</label>
                              <span className="text-xs text-purple-400 font-semibold">{form[name]}%</span>
                            </div>
                            <input
                              type="range"
                              name={name}
                              min="0"
                              max="100"
                              value={form[name]}
                              onChange={onChange}
                              className="w-full h-2 bg-slate-700/50 rounded-full appearance-none cursor-pointer"
                              style={{
                                background: `linear-gradient(to right, #a855f7 0%, #a855f7 ${form[name]}%, #334155 ${form[name]}%, #334155 100%)`
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Objetivos */}
                    <div className="bg-slate-900/40 rounded-xl p-4 mb-4 border border-slate-700/30 hover:border-purple-500/40 transition-all">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-semibold text-purple-300 flex items-center gap-2">
                            <span>🎯</span> Objetivos
                          </h4>
                          <span className="px-2 py-0.5 bg-purple-600/30 text-purple-300 rounded-full text-xs font-semibold">{form.goals.length}</span>
                        </div>
                        <button
                          type="button"
                          onClick={addGoal}
                          className="px-3 py-1.5 bg-gradient-to-r from-purple-600/20 to-pink-600/20 hover:from-purple-600/30 hover:to-pink-600/30 border border-purple-500/40 text-purple-300 rounded-lg text-xs font-medium transition-all hover:scale-105 shadow-lg"
                        >
                          + Agregar
                        </button>
                      </div>
                      <div className="space-y-2">
                        {form.goals.length === 0 ? (
                          <p className="text-xs text-slate-400 italic">No hay objetivos definidos. Haz clic en "+ Agregar"</p>
                        ) : (
                          form.goals.map((goal, index) => (
                            <div key={index} className="flex gap-2">
                              <input
                                value={goal}
                                onChange={(e) => updateGoal(index, e.target.value)}
                                placeholder="Escribe un objetivo..."
                                className="flex-1 bg-slate-900/60 border border-slate-600/50 text-white placeholder-slate-500 rounded-lg px-3 py-2 text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                              />
                              <button
                                type="button"
                                onClick={() => removeGoal(index)}
                                className="px-3 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-300 rounded-lg text-xs font-medium transition-all"
                              >
                                ✕
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Frustraciones */}
                    <div className="bg-slate-900/40 rounded-xl p-4 mb-4 border border-slate-700/30 hover:border-purple-500/40 transition-all">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-semibold text-purple-300 flex items-center gap-2">
                            <span>😤</span> Frustraciones
                          </h4>
                          <span className="px-2 py-0.5 bg-red-600/30 text-red-300 rounded-full text-xs font-semibold">{form.frustrations.length}</span>
                        </div>
                        <button
                          type="button"
                          onClick={addFrustration}
                          className="px-3 py-1.5 bg-gradient-to-r from-purple-600/20 to-pink-600/20 hover:from-purple-600/30 hover:to-pink-600/30 border border-purple-500/40 text-purple-300 rounded-lg text-xs font-medium transition-all hover:scale-105 shadow-lg"
                        >
                          + Agregar
                        </button>
                      </div>
                      <div className="space-y-2">
                        {form.frustrations.length === 0 ? (
                          <p className="text-xs text-slate-400 italic">No hay frustraciones definidas.</p>
                        ) : (
                          form.frustrations.map((frustration, index) => (
                            <div key={index} className="flex gap-2">
                              <input
                                value={frustration}
                                onChange={(e) => updateFrustration(index, e.target.value)}
                                placeholder="Escribe una frustración..."
                                className="flex-1 bg-slate-900/60 border border-slate-600/50 text-white placeholder-slate-500 rounded-lg px-3 py-2 text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                              />
                              <button
                                type="button"
                                onClick={() => removeFrustration(index)}
                                className="px-3 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-300 rounded-lg text-xs font-medium transition-all"
                              >
                                ✕
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Marcas Favoritas */}
                    <div className="bg-slate-900/40 rounded-xl p-4 mb-4 border border-slate-700/30 hover:border-purple-500/40 transition-all">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-semibold text-purple-300 flex items-center gap-2">
                            <span>⭐</span> Marcas Favoritas
                          </h4>
                          <span className="px-2 py-0.5 bg-purple-600/30 text-purple-300 rounded-full text-xs font-semibold">{form.favoriteBrands.length}</span>
                        </div>
                        <button
                          type="button"
                          onClick={addBrand}
                          className="px-3 py-1.5 bg-gradient-to-r from-purple-600/20 to-pink-600/20 hover:from-purple-600/30 hover:to-pink-600/30 border border-purple-500/40 text-purple-300 rounded-lg text-xs font-medium transition-all hover:scale-105 shadow-lg"
                        >
                          + Agregar
                        </button>
                      </div>
                      <div className="space-y-3">
                        {form.favoriteBrands.length === 0 ? (
                          <p className="text-xs text-slate-400 italic">No hay marcas favoritas definidas.</p>
                        ) : (
                          form.favoriteBrands.map((brand, index) => (
                            <div key={index} className="flex gap-2">
                              <input
                                value={brand.name}
                                onChange={(e) => updateBrand(index, 'name', e.target.value)}
                                placeholder="Nombre de la marca"
                                className="flex-1 bg-slate-900/60 border border-slate-600/50 text-white placeholder-slate-500 rounded-lg px-3 py-2 text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                              />
                              <input
                                value={brand.logo}
                                onChange={(e) => updateBrand(index, 'logo', e.target.value)}
                                placeholder="Logo/Emoji"
                                className="w-20 bg-slate-900/60 border border-slate-600/50 text-white placeholder-slate-500 rounded-lg px-3 py-2 text-sm text-center focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                              />
                              <button
                                type="button"
                                onClick={() => removeBrand(index)}
                                className="px-3 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-300 rounded-lg text-xs font-medium transition-all"
                              >
                                ✕
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Arquetipos Tags */}
                    <div className="bg-slate-900/40 rounded-xl p-4 mb-4 border border-slate-700/30 hover:border-purple-500/40 transition-all">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-semibold text-purple-300 flex items-center gap-2">
                            <span>🏷️</span> Etiquetas de Arquetipos
                          </h4>
                          <span className="px-2 py-0.5 bg-purple-600/30 text-purple-300 rounded-full text-xs font-semibold">{form.archetypes.length}</span>
                        </div>
                        <button
                          type="button"
                          onClick={addArchetype}
                          className="px-3 py-1.5 bg-gradient-to-r from-purple-600/20 to-pink-600/20 hover:from-purple-600/30 hover:to-pink-600/30 border border-purple-500/40 text-purple-300 rounded-lg text-xs font-medium transition-all hover:scale-105 shadow-lg"
                        >
                          + Agregar
                        </button>
                      </div>
                      <div className="space-y-2">
                        {form.archetypes.length === 0 ? (
                          <p className="text-xs text-slate-400 italic">No hay etiquetas de arquetipos definidas.</p>
                        ) : (
                          form.archetypes.map((archetype, index) => (
                            <div key={index} className="flex gap-2">
                              <input
                                value={archetype}
                                onChange={(e) => updateArchetype(index, e.target.value)}
                                placeholder="ej: Optimista, Realista, etc."
                                className="flex-1 bg-slate-900/60 border border-slate-600/50 text-white placeholder-slate-500 rounded-lg px-3 py-2 text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                              />
                              <button
                                type="button"
                                onClick={() => removeArchetype(index)}
                                className="px-3 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-300 rounded-lg text-xs font-medium transition-all"
                              >
                                ✕
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-2 flex justify-between items-center gap-3 pt-4 border-t border-slate-700/30">
                    <p className="text-xs text-slate-400 italic">Los cambios se reflejarán en tu perfil público</p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        className="border border-slate-500/40 bg-slate-800/50 text-slate-200 px-5 py-2.5 rounded-lg hover:bg-slate-700/50 hover:border-slate-400/40 transition-all"
                        onClick={() => navigate("/")}
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={saving}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-2.5 rounded-lg disabled:opacity-60 shadow-xl hover:shadow-purple-500/50 transition-all hover:scale-105 font-semibold disabled:hover:scale-100"
                      >
                        {saving ? (
                          <span className="flex items-center gap-2">
                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Guardando…
                          </span>
                        ) : (
                          "💾 Guardar cambios"
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              </section>
            )}

            {/* 🆕 TAB: MIS RESERVAS */}
            {activeTab === "reservas" && <CustomerPurchasesList />}

            {/* 🆕 TAB: MIS MENSAJES */}
            {activeTab === "mensajes" && (
              <section className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-5 shadow-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-white">
                      💬 Mis Conversaciones
                    </h2>
                    <p className="text-xs text-slate-300">
                      Mensajes de tus reservas y pedidos
                    </p>
                  </div>
                  <button
                    onClick={loadMessages}
                    disabled={loadingMessages}
                    className="text-xs px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50"
                  >
                    {loadingMessages ? "Actualizando..." : "🔄 Actualizar"}
                  </button>
                </div>

                {loadingMessages ? (
                  <div className="text-center py-12">
                    <div className="animate-spin w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full mx-auto mb-3"></div>
                    <p className="text-sm text-slate-400">Cargando conversaciones...</p>
                  </div>
                ) : conversations.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">💬</div>
                    <p className="text-slate-400 text-sm">No tienes conversaciones activas</p>
                    <p className="text-slate-500 text-xs mt-2">
                      Los mensajes de tus reservas y pedidos aparecerán aquí
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {conversations.map(conv => (
                      <div
                        key={conv.id}
                        onClick={() => {
                          if (conv.isOwner) {
                            navigate(`/negocio/${conv.storeId}`);
                          } else {
                            navigate(`/tiendas/${conv.storeId}`);
                          }
                        }}
                        className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4 hover:bg-slate-700/40 hover:border-purple-500/40 transition-all cursor-pointer group"
                      >
                        <div className="flex items-start gap-3">
                          {/* Avatar/Icon */}
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                            conv.isOwner 
                              ? 'bg-gradient-to-br from-purple-600 to-pink-600' 
                              : 'bg-gradient-to-br from-blue-600 to-cyan-600'
                          }`}>
                            {conv.itemType === 'booking' ? '📅' : '🛒'}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <h3 className="font-semibold text-white text-sm truncate group-hover:text-purple-300 transition-colors">
                                  {conv.isOwner ? conv.customerName : conv.storeName}
                                </h3>
                                <p className="text-xs text-slate-400 truncate">
                                  {conv.isOwner ? `Tu tienda: ${conv.storeName}` : (conv.serviceName || 'Servicio')}
                                </p>
                              </div>
                              {conv.unreadCount > 0 && (
                                <span className="px-2 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full shrink-0">
                                  {conv.unreadCount}
                                </span>
                              )}
                            </div>

                            <p className="text-xs text-slate-500 mt-1 truncate">
                              {conv.lastMessage}
                            </p>

                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-[10px] text-slate-600">
                                {new Date(conv.timestamp).toLocaleDateString('es-CL', { 
                                  day: '2-digit', 
                                  month: 'short',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                              <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                                conv.isOwner 
                                  ? 'bg-purple-900/40 text-purple-300' 
                                  : 'bg-blue-900/40 text-blue-300'
                              }`}>
                                {conv.isOwner ? '👔 Como dueño' : '👤 Como cliente'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}
          </section>
        </div>

        {/* Mis tiendas relacionadas */}
        <section className="mt-10 bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-purple-500/20">
          <h3 className="text-lg font-semibold mb-4 text-white">
            🏪 Mis Tiendas Relacionadas
          </h3>
          {stores.length === 0 ? (
            <p className="text-slate-300 text-sm">
              No tienes tiendas registradas aún.
            </p>
          ) : (
            <ul className="divide-y divide-slate-700/30">
              {stores.map((store) => {
                const logo =
                  store.logoUrl ||
                  "https://cdn-icons-png.flaticon.com/512/869/869636.png";
                const direccion = store.direccion || store.address || "";
                return (
                  <li
                    key={store._id}
                    className="py-3 flex items-center gap-3 hover:bg-slate-700/20 rounded-lg px-2 transition-all cursor-pointer"
                  >
                    <img
                      src={logo}
                      alt={store.name}
                      className="h-10 w-10 rounded-lg object-cover border border-purple-400/30 bg-slate-700 shadow-md"
                    />
                    <div className="min-w-0">
                      <p className="font-medium text-white">
                        {store.name}
                      </p>
                      <p className="text-xs text-purple-300">
                        {store.category ||
                          store.tipoNegocio ||
                          "Sin categoría"}
                      </p>
                      {direccion && (
                        <p className="text-[11px] text-slate-400 truncate">
                          📍 {direccion}
                        </p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </main>
    </div>
    <Footer paletteMode="warm" />
    </>
  );
}
