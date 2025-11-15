// src/components/MainHeader.jsx
import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Header:
 * - Left: botón menú (abre opciones: editar perfil, editar negocios, cerrar sesión).
 * - Center: título opcional.
 * - Right: lupa (buscador de negocios), notificaciones, avatar + nombre (sin flecha).
 *
 * Eventos emitidos (no redirigen):
 *  - open-edit-profile
 *  - open-manage-stores
 *
 * Busca negocios contra /api/stores?search=... (ajusta endpoint si tu API es otra).
 */
export default function MainHeader({
  subtitle,
  variant = "vitrinex",
  headerStyle,
  logoSrc,
}) {
  const { isAuthenticated, user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [stores, setStores] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const searchRef = useRef(null);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  const isStore = variant === "store";
  const finalStyle = isStore
    ? { ...(headerStyle || {}) }
    : { background: "linear-gradient(90deg,#5b21b6 0%,#6d28d9 40%,#7c3aed 100%)" };
  const finalLogoSrc = logoSrc || "/logo-vitrinex.png";

  const openEditProfile = () => {
    window.dispatchEvent(new CustomEvent("open-edit-profile"));
    setMenuOpen(false);
  };
  const openManageStores = () => {
    window.dispatchEvent(new CustomEvent("open-manage-stores"));
    setMenuOpen(false);
  };
  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  useEffect(() => {
    if (!searchQuery) {
      setStores([]);
      return;
    }
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/stores?search=${encodeURIComponent(searchQuery)}`);
        if (!res.ok) return setStores([]);
        const data = await res.json();
        setStores(data.items || data || []);
      } catch {
        setStores([]);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  useEffect(() => {
    const onNewOrder = (e) => setNotifications((s) => [e.detail || e, ...s]);
    window.addEventListener("new-order", onNewOrder);
    return () => window.removeEventListener("new-order", onNewOrder);
  }, []);

  useEffect(() => {
    function onDocClick(e) {
      if (searchRef.current && !searchRef.current.contains(e.target)) setSearchOpen(false);
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
      if (!e.target.closest("[data-notif]")) setNotifOpen(false);
    }
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  return (
    <header className="relative shadow-md">
      <div className="w-full border-b" style={finalStyle}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-16 flex items-center justify-between">
            {/* left: menu + logo */}
            <div className="flex items-center gap-4">
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => { setMenuOpen((s) => !s); setSearchOpen(false); setNotifOpen(false); }}
                  className="p-2 rounded-md bg-white/10 hover:bg-white/20 text-white"
                  aria-label="menu"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>

                {menuOpen && (
                  <div className="absolute left-0 mt-2 w-44 bg-white rounded-lg shadow-lg z-50 overflow-hidden">
                    <ul className="py-1">
                      <li>
                        <button className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50" onClick={openEditProfile}>
                          Editar perfil
                        </button>
                      </li>
                      <li>
                        <button className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50" onClick={openManageStores}>
                          Editar negocios
                        </button>
                      </li>
                      <li>
                        <button className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50" onClick={handleLogout}>
                          Cerrar sesión
                        </button>
                      </li>
                    </ul>
                  </div>
                )}
              </div>

              <Link to="/" className="flex items-center gap-3">
                <img src={finalLogoSrc} alt="Vitrinex" className="h-10 w-auto object-contain bg-white/10 rounded-md p-1" />
                {subtitle && <span className="hidden md:inline-block text-white font-semibold font-beauty">{subtitle}</span>}
              </Link>
            </div>

            {/* center title */}
            <div className="hidden md:flex items-center justify-center flex-1">
              <div className="text-white font-beauty text-lg">Vitrinex</div>
            </div>

            {/* right: search, notifications, avatar+name */}
            <div className="flex items-center gap-3 relative">
              <div className="relative" ref={searchRef}>
                <button
                  onClick={() => { setSearchOpen((s) => !s); setMenuOpen(false); setNotifOpen(false); }}
                  className="p-2 rounded-md bg-white/10 hover:bg-white/20 text-white"
                  aria-label="buscar"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 100-15 7.5 7.5 0 000 15z" />
                  </svg>
                </button>

                {searchOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg z-50 p-3">
                    <input
                      autoFocus
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Buscar negocios..."
                      className="w-full px-3 py-2 rounded-md border"
                    />
                    <div className="mt-2 max-h-60 overflow-auto">
                      {stores.length === 0 ? (
                        <div className="text-sm text-slate-500 py-2">No hay resultados</div>
                      ) : (
                        stores.map((s) => (
                          <div key={s.id || s._id} className="py-2 border-b last:border-b-0">
                            <div className="font-medium text-sm">{s.name || s.title}</div>
                            <div className="text-xs text-slate-500">{s.description || s.address}</div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="relative" data-notif>
                <button
                  onClick={() => { setNotifOpen((s) => !s); setMenuOpen(false); setSearchOpen(false); }}
                  className="p-2 rounded-md bg-white/10 hover:bg-white/20 text-white"
                  aria-label="notificaciones"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10 2a4 4 0 00-4 4v2.586l-.707.707A1 1 0 005 11h10a1 1 0 00.707-1.707L15 8.586V6a4 4 0 00-4-4z" />
                  </svg>
                </button>

                {notifOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg z-50 overflow-hidden">
                    <div className="p-3 text-sm text-slate-700 border-b font-medium">Notificaciones</div>
                    <div className="max-h-60 overflow-auto">
                      {notifications.length === 0 ? (
                        <div className="p-3 text-sm text-slate-500">No hay notificaciones</div>
                      ) : (
                        notifications.map((n, i) => (
                          <div key={i} className="px-3 py-2 border-b last:border-b-0 text-sm">
                            <div className="font-medium">{n.title || "Nuevo pedido"}</div>
                            <div className="text-xs text-slate-500">{n.message || JSON.stringify(n)}</div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {isAuthenticated ? (
                <div className="flex items-center gap-2">
                  {user?.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.username} className="h-9 w-9 rounded-full object-cover border-2 border-white" />
                  ) : (
                    <div className="h-9 w-9 rounded-full bg-white/20 flex items-center justify-center text-white font-semibold">
                      {user?.username?.[0]?.toUpperCase() || "U"}
                    </div>
                  )}
                  <div className="hidden sm:block text-white font-medium">{user?.username || "Usuario"}</div>
                </div>
              ) : (
                <div className="hidden sm:flex items-center gap-2">
                  <Link to="/login" className="px-3 py-1 rounded-md bg-white text-violet-700 font-medium">Iniciar</Link>
                  <Link to="/register" className="px-3 py-1 rounded-md bg-white/20 text-white font-medium">Crear</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
