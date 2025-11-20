// src/components/MainHeader.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { listMyStores } from "../api/store";
import { getBookingsWithMessages } from "../api/messages";

/**
 * Props:
 *  - subtitle: texto a la derecha del logo
 *  - variant: "vitrinex" (por defecto) | "store"
 *  - headerStyle: estilos extra para el fondo (se usan en variant="store")
 *  - logoSrc: logo opcional (para tiendas). Si no se pasa, usa el logo de Vitrinex.
 */
export default function MainHeader({
  subtitle,
  variant = "vitrinex",
  headerStyle,
  logoSrc,
}) {
  const { isAuthenticated, user, logout } = useAuth();
  const [openMenu, setOpenMenu] = useState(false);
  const [openNotifications, setOpenNotifications] = useState(false);
  const [openMessages, setOpenMessages] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const isStore = variant === "store";

  // Cargar notificaciones y mensajes
  useEffect(() => {
    if (isAuthenticated && user) {
      loadNotifications();
      loadMessages();
    }
  }, [isAuthenticated, user]);

  // Cerrar dropdowns al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.dropdown-container')) {
        setOpenNotifications(false);
        setOpenMessages(false);
        setOpenMenu(false);
      }
    };
    
    if (openNotifications || openMessages || openMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [openNotifications, openMessages, openMenu]);

  const loadNotifications = async () => {
    try {
      setLoadingNotifications(true);
      const { data } = await listMyStores();
      
      // Simular notificaciones basadas en actividad de tiendas
      const mockNotifications = [];
      data.forEach(store => {
        // Aquí puedes agregar lógica real cuando tengas endpoints de notificaciones
        mockNotifications.push({
          id: `notif-${store._id}-1`,
          type: 'order',
          storeId: store._id,
          storeName: store.name,
          message: `Nuevo pedido en ${store.name}`,
          timestamp: new Date().toISOString(),
          read: false
        });
      });
      setNotifications(mockNotifications);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoadingNotifications(false);
    }
  };

  const loadMessages = async () => {
    try {
      setLoadingMessages(true);
      const { data: stores } = await listMyStores();
      
      const allConversations = [];
      for (const store of stores) {
        try {
          const { data: bookings } = await getBookingsWithMessages(store._id);
          bookings.forEach(booking => {
            allConversations.push({
              id: booking._id,
              storeId: store._id,
              storeName: store.name,
              customerName: booking.customerName || booking.email,
              lastMessage: booking.lastMessage || 'Sin mensajes',
              unreadCount: booking.unreadCount || 0,
              timestamp: booking.lastMessageAt || booking.createdAt
            });
          });
        } catch (err) {
          console.error(`Error loading messages for store ${store._id}:`, err);
        }
      }
      setConversations(allConversations.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoadingMessages(false);
    }
  };

  const unreadNotifications = notifications.filter(n => !n.read).length;
  const unreadMessages = conversations.reduce((acc, conv) => acc + (conv.unreadCount || 0), 0);

  // NUEVO ESTILO GALAXY MODERNO
  const vitrInexStyle = {
    background: "linear-gradient(135deg, rgba(17, 24, 39, 0.98) 0%, rgba(88, 28, 135, 0.98) 50%, rgba(17, 24, 39, 0.98) 100%)",
    backdropFilter: "blur(12px)",
    borderBottom: "1px solid rgba(168, 85, 247, 0.3)",
    boxShadow: "0 8px 32px rgba(139, 92, 246, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.15)",
  };

  const defaultStoreStyle = {
    background: "linear-gradient(135deg, rgba(17, 24, 39, 0.98) 0%, rgba(30, 58, 138, 0.98) 50%, rgba(17, 24, 39, 0.98) 100%)",
    backdropFilter: "blur(12px)",
    borderBottom: "1px solid rgba(59, 130, 246, 0.3)",
    boxShadow: "0 8px 32px rgba(59, 130, 246, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.15)",
  };

  const finalStyle = isStore
    ? { ...(defaultStoreStyle || {}), ...(headerStyle || {}) }
    : vitrInexStyle;

  // Logo moderno con texto en lugar de imagen
  const VitrinexLogo = () => (
    <div className="flex items-center gap-2 group cursor-pointer">
      {/* Icono hexagonal moderno */}
      <div className="relative">
        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/50 group-hover:shadow-xl group-hover:shadow-purple-500/70 transition-all duration-300 group-hover:scale-105 rotate-3 group-hover:rotate-6">
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-xl" />
          <span className="text-xl font-black text-white relative z-10" style={{ fontFamily: "'Inter', 'SF Pro Display', -apple-system, system-ui, sans-serif" }}>
            V
          </span>
        </div>
        {/* Glow effect */}
        <div className="absolute inset-0 rounded-xl bg-purple-500/0 group-hover:bg-purple-500/30 blur-xl transition-all duration-300" />
      </div>
      
      {/* Texto del logo */}
      <div className="hidden sm:flex flex-col leading-none">
        <span 
          className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-200 to-pink-200 tracking-tight"
          style={{ 
            fontFamily: "'Inter', 'SF Pro Display', -apple-system, system-ui, sans-serif",
            letterSpacing: '-0.02em'
          }}
        >
          Vitrinex
        </span>
        <span className="text-[8px] font-semibold text-purple-300/80 tracking-wider uppercase">
          Marketplace
        </span>
      </div>
    </div>
  );

  const StoreLogo = () => (
    logoSrc ? (
      <div className="relative group">
        <img
          src={logoSrc}
          alt="Logo del negocio"
          className="h-10 w-10 rounded-lg object-cover bg-white/10 backdrop-blur-sm shadow-lg border-2 border-white/20 group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 rounded-lg bg-purple-500/0 group-hover:bg-purple-500/20 blur-xl transition-all duration-300" />
      </div>
    ) : (
      <VitrinexLogo />
    )
  );

  return (
    <header
      className="shadow-2xl transition-all duration-500 fixed top-0 left-0 right-0 z-[9999]"
      style={finalStyle}
    >
      {/* Efecto de brillo superior */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-purple-400/50 to-transparent" />
      
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-2.5 flex items-center justify-between">
        {/* Logo + subtítulo */}
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center">
            {isStore ? <StoreLogo /> : <VitrinexLogo />}
          </Link>

          {subtitle && (
            <div className="hidden lg:flex items-center gap-2">
              <div className="w-px h-8 bg-gradient-to-b from-transparent via-purple-400/50 to-transparent rounded-full" />
              <span
                className="text-xs font-semibold text-white/80 tracking-wide max-w-xs truncate"
                style={{ 
                  fontFamily: "'Inter', 'SF Pro Display', -apple-system, system-ui, sans-serif"
                }}
              >
                {subtitle}
              </span>
            </div>
          )}
        </div>

        {/* Panel derecho */}
        <div className="flex items-center gap-2">
          {!isAuthenticated ? (
            <div className="flex items-center gap-2 text-xs" style={{ fontFamily: "'Inter', 'SF Pro Display', -apple-system, system-ui, sans-serif" }}>
              <Link
                to="/login"
                className="px-3 py-1.5 rounded-lg bg-white/80 backdrop-blur-sm text-slate-900 font-semibold border border-white/40 hover:bg-white hover:border-purple-400 transition-all duration-300"
              >
                <span className="hidden sm:inline">Iniciar sesión</span>
                <span className="sm:hidden">Entrar</span>
              </Link>
              <Link
                to="/register"
                className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg shadow-purple-500/50"
              >
                <span className="hidden sm:inline">Crear cuenta</span>
                <span className="sm:hidden">Registrar</span>
              </Link>
            </div>
          ) : (
            <>
              {/* NOTIFICACIONES DROPDOWN */}
              <div className="relative dropdown-container">
                <button
                  type="button"
                  onClick={() => {
                    setOpenNotifications(!openNotifications);
                    setOpenMessages(false);
                    setOpenMenu(false);
                  }}
                  className="relative p-2 rounded-lg bg-white/15 backdrop-blur-sm border border-white/30 hover:bg-white/25 transition-all duration-200"
                  title="Notificaciones"
                >
                  <svg
                    className="w-5 h-5 text-white" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  {unreadNotifications > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full bg-gradient-to-r from-pink-500 to-red-500 flex items-center justify-center text-[10px] font-bold text-white shadow-lg animate-pulse px-1">
                      {unreadNotifications}
                    </span>
                  )}
                </button>

                {/* Dropdown de notificaciones */}
                {openNotifications && (
                  <div 
                    className="absolute right-0 mt-2 w-[340px] bg-gray-900/[0.99] backdrop-blur-md border border-purple-400/40 rounded-xl shadow-2xl z-[1001] overflow-hidden"
                    style={{ 
                      boxShadow: '0 20px 60px rgba(139, 92, 246, 0.5)',
                      fontFamily: "'Inter', 'SF Pro Display', -apple-system, system-ui, sans-serif",
                      maxHeight: '450px'
                    }}
                  >
                    {/* Header */}
                    <div className="px-4 py-3 border-b border-white/10 bg-gradient-to-r from-purple-500/10 to-pink-500/10">
                      <div className="flex items-center justify-between">
                        <h3 className="text-white font-bold text-sm">🔔 Notificaciones</h3>
                        {unreadNotifications > 0 && (
                          <span className="text-xs bg-pink-500/80 px-2 py-0.5 rounded-full font-semibold text-white">
                            {unreadNotifications}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="overflow-y-auto" style={{ maxHeight: '320px' }}>
                      {loadingNotifications ? (
                        <div className="px-4 py-8 text-center text-white/50 text-sm">
                          Cargando...
                        </div>
                      ) : notifications.length === 0 ? (
                        <div className="px-4 py-8 text-center">
                          <div className="text-white/30 text-3xl mb-2">🔔</div>
                          <p className="text-white/50 text-sm">No tienes notificaciones</p>
                        </div>
                      ) : (
                        notifications.map((notif) => (
                          <div
                            key={notif.id}
                            className="px-4 py-3 border-b border-white/5 hover:bg-purple-500/5 transition-colors cursor-pointer"
                          >
                            <div className="flex gap-3">
                              <div className="w-2 h-2 rounded-full bg-pink-500 mt-2 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-white text-sm font-medium">{notif.message}</p>
                                <p className="text-white/50 text-xs mt-0.5">{notif.storeName}</p>
                                <p className="text-white/30 text-xs mt-1">
                                  {new Date(notif.timestamp).toLocaleDateString('es-ES', { 
                                    day: 'numeric', 
                                    month: 'short', 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                  })}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    
                    {/* Footer */}
                    {notifications.length > 0 && (
                      <div className="px-4 py-2 border-t border-white/10 bg-gray-900/50">
                        <button className="w-full text-center text-xs text-purple-400 hover:text-purple-300 font-medium py-1.5 hover:bg-purple-500/10 rounded transition-colors">
                          Marcar todas como leídas
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* MENSAJES/CHATS DROPDOWN */}
              <div className="relative dropdown-container">
                <button
                  type="button"
                  onClick={() => {
                    setOpenMessages(!openMessages);
                    setOpenNotifications(false);
                    setOpenMenu(false);
                  }}
                  className="relative p-2 rounded-lg bg-white/15 backdrop-blur-sm border border-white/30 hover:bg-white/25 transition-all duration-200"
                  title="Mensajes"
                >
                  <svg 
                    className="w-5 h-5 text-white" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                  {unreadMessages > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center text-[10px] font-bold text-white shadow-lg animate-pulse px-1">
                      {unreadMessages}
                    </span>
                  )}
                </button>

                {/* Dropdown de mensajes */}
                {openMessages && (
                  <div 
                    className="absolute right-0 mt-2 w-[340px] bg-gray-900/[0.99] backdrop-blur-md border border-purple-400/40 rounded-xl shadow-2xl z-[1001] overflow-hidden"
                    style={{ 
                      boxShadow: '0 20px 60px rgba(139, 92, 246, 0.5)',
                      fontFamily: "'Inter', 'SF Pro Display', -apple-system, system-ui, sans-serif",
                      maxHeight: '450px'
                    }}
                  >
                    {/* Header */}
                    <div className="px-4 py-3 border-b border-white/10 bg-gradient-to-r from-blue-500/10 to-cyan-500/10">
                      <div className="flex items-center justify-between">
                        <h3 className="text-white font-bold text-sm">💬 Mensajes</h3>
                        {unreadMessages > 0 && (
                          <span className="text-xs bg-blue-500/80 px-2 py-0.5 rounded-full font-semibold text-white">
                            {unreadMessages}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="overflow-y-auto" style={{ maxHeight: '320px' }}>
                      {loadingMessages ? (
                        <div className="px-4 py-8 text-center text-white/50 text-sm">
                          Cargando...
                        </div>
                      ) : conversations.length === 0 ? (
                        <div className="px-4 py-8 text-center">
                          <div className="text-white/30 text-3xl mb-2">💬</div>
                          <p className="text-white/50 text-sm">No tienes conversaciones</p>
                        </div>
                      ) : (
                        conversations.map((conv) => (
                          <div
                            key={conv.id}
                            onClick={() => {
                              setOpenMessages(false);
                              window.location.href = `/tienda/${conv.storeId}`;
                            }}
                            className="px-4 py-3 border-b border-white/5 hover:bg-blue-500/5 transition-colors cursor-pointer"
                          >
                            <div className="flex gap-3">
                              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                {conv.customerName?.[0]?.toUpperCase() || '?'}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-0.5">
                                  <p className="text-white text-sm font-medium truncate">{conv.customerName}</p>
                                  {conv.unreadCount > 0 && (
                                    <span className="ml-2 bg-blue-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold flex-shrink-0">
                                      {conv.unreadCount}
                                    </span>
                                  )}
                                </div>
                                <p className="text-white/50 text-xs truncate">{conv.storeName}</p>
                                <p className="text-white/70 text-xs mt-0.5 truncate">{conv.lastMessage}</p>
                                <p className="text-white/30 text-xs mt-1">
                                  {new Date(conv.timestamp).toLocaleDateString('es-ES', { 
                                    day: 'numeric', 
                                    month: 'short', 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                  })}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    
                    {/* Footer */}
                    {conversations.length > 0 && (
                      <div className="px-4 py-2 border-t border-white/10 bg-gray-900/50">
                        <button 
                          onClick={() => setOpenMessages(false)}
                          className="w-full text-center text-xs text-blue-400 hover:text-blue-300 font-medium py-1.5 hover:bg-blue-500/10 rounded transition-colors"
                        >
                          Ver todos los mensajes
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* PERFIL → Página pública */}
              <Link
                to={`/usuario/${user?._id || user?.id}`}
                className="hidden sm:flex items-center gap-2 text-xs px-2 py-1.5 rounded-lg bg-white/15 backdrop-blur-sm border border-white/30 hover:bg-white/25 hover:border-purple-400/70 transition-all duration-200 group"
                style={{ fontFamily: "'Inter', 'SF Pro Display', -apple-system, system-ui, sans-serif" }}
              >
                {user?.avatarUrl ? (
                  <div className="relative">
                    <img
                      src={user.avatarUrl}
                      alt={user.username}
                      className="h-7 w-7 rounded-full object-cover border border-purple-400/50 group-hover:border-purple-400 transition-all"
                    />
                  </div>
                ) : (
                  <span className="h-7 w-7 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-[10px] font-bold text-white">
                    {user?.username?.[0]?.toUpperCase() || "U"}
                  </span>
                )}
                <span className="text-white font-semibold max-w-[100px] truncate">
                  {user?.username}
                </span>
              </Link>

              {/* Menú desplegable */}
              <div className="relative dropdown-container">
                <button
                  type="button"
                  onClick={() => {
                    setOpenMenu(!openMenu);
                    setOpenNotifications(false);
                    setOpenMessages(false);
                  }}
                  className="border border-white/30 text-white rounded-lg px-3 py-1.5 bg-white/15 backdrop-blur-sm hover:bg-white/25 flex items-center gap-1.5 text-xs font-semibold transition-all duration-200"
                  style={{ fontFamily: "'Inter', 'SF Pro Display', -apple-system, system-ui, sans-serif" }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                  <span className={`text-[10px] transition-transform duration-200 ${openMenu ? 'rotate-180' : ''}`}>▼</span>
                </button>

                {openMenu && (
                  <div 
                    className="absolute right-0 mt-2 w-52 bg-gray-900/[0.99] backdrop-blur-md border border-purple-400/40 rounded-xl shadow-2xl text-sm z-[1001] overflow-hidden"
                    style={{ 
                      boxShadow: '0 20px 60px rgba(139, 92, 246, 0.5)',
                      fontFamily: "'Inter', 'SF Pro Display', -apple-system, system-ui, sans-serif"
                    }}
                  >
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-purple-400/50 to-transparent" />
                    
                    <Link
                      to="/perfil"
                      onClick={() => setOpenMenu(false)}
                      className="flex w-full text-left px-4 py-3 text-white hover:bg-purple-500/20 border-b border-white/10 transition-all duration-200 items-center gap-3 font-medium"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span>Editar perfil</span>
                    </Link>
                    <Link
                      to="/onboarding"
                      onClick={() => setOpenMenu(false)}
                      className="flex w-full text-left px-4 py-3 text-white hover:bg-purple-500/20 border-b border-white/10 transition-all duration-200 items-center gap-3 font-medium"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <span>Mis tiendas</span>
                    </Link>
                    <button
                      onClick={() => {
                        setOpenMenu(false);
                        logout();
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-all duration-200 flex items-center gap-3 font-semibold"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      <span>Cerrar sesión</span>
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Efecto de brillo inferior */}
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-purple-400/30 to-transparent" />
    </header>
  );
}
