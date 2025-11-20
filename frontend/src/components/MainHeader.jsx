// src/components/MainHeader.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

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

  const isStore = variant === "store";

  // NUEVO ESTILO GALAXY MODERNO
  const vitrInexStyle = {
    background: "linear-gradient(135deg, rgba(17, 24, 39, 0.95) 0%, rgba(88, 28, 135, 0.95) 50%, rgba(17, 24, 39, 0.95) 100%)",
    backdropFilter: "blur(20px)",
    borderBottom: "1px solid rgba(168, 85, 247, 0.2)",
    boxShadow: "0 8px 32px rgba(139, 92, 246, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.1)",
  };

  const defaultStoreStyle = {
    background: "linear-gradient(135deg, rgba(17, 24, 39, 0.95) 0%, rgba(30, 58, 138, 0.95) 50%, rgba(17, 24, 39, 0.95) 100%)",
    backdropFilter: "blur(20px)",
    borderBottom: "1px solid rgba(59, 130, 246, 0.2)",
    boxShadow: "0 8px 32px rgba(59, 130, 246, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.1)",
  };

  const finalStyle = isStore
    ? { ...(defaultStoreStyle || {}), ...(headerStyle || {}) }
    : vitrInexStyle;

  const finalLogoSrc = logoSrc || "/logo-vitrinex.png";

  const logoClassName = isStore
    ? "h-14 w-14 rounded-xl object-cover bg-white/10 backdrop-blur-sm shadow-lg border-2 border-white/20 hover:scale-110 transition-transform duration-300"
    : "h-20 w-auto object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-300";

  return (
    <header
      className="shadow-2xl transition-all duration-500 sticky top-0 z-50"
      style={finalStyle}
    >
      {/* Efecto de brillo superior */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-purple-400/50 to-transparent" />
      
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        {/* Logo + subtítulo */}
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center group">
            <div className="relative">
              <img
                src={finalLogoSrc}
                alt={isStore ? "Logo del negocio" : "Vitrinex"}
                className={logoClassName}
              />
              {/* Glow effect en hover */}
              <div className="absolute inset-0 rounded-xl bg-purple-500/0 group-hover:bg-purple-500/20 blur-xl transition-all duration-300" />
            </div>
          </Link>

          {subtitle && (
            <div className="hidden md:flex items-center gap-2">
              <div className="w-1 h-12 bg-gradient-to-b from-transparent via-purple-400/50 to-transparent rounded-full" />
              <span
                className="text-base lg:text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-200 via-pink-200 to-purple-200 tracking-wide animate-pulse"
                style={{ 
                  textShadow: '0 0 20px rgba(168, 85, 247, 0.5)',
                  animation: 'pulse 3s ease-in-out infinite'
                }}
              >
                {subtitle}
              </span>
            </div>
          )}
        </div>

        {/* Panel derecho */}
        <div className="flex items-center gap-3">
          {!isAuthenticated ? (
            <div className="flex items-center gap-2 text-sm">
              <Link
                to="/login"
                className="px-4 py-2 rounded-xl bg-white/10 backdrop-blur-sm text-white font-medium border border-white/20 hover:bg-white/20 hover:border-purple-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/50"
              >
                ✨ Iniciar sesión
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg shadow-purple-500/50 hover:shadow-xl hover:shadow-purple-500/70 hover:scale-105"
              >
                🚀 Crear cuenta
              </Link>
            </div>
          ) : (
            <>
              {/* PERFIL → Página pública */}
              <Link
                to={`/usuario/${user?._id || user?.id}`}
                className="flex items-center gap-2 text-sm px-3 py-2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 hover:border-purple-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/30 group"
              >
                {user?.avatarUrl ? (
                  <div className="relative">
                    <img
                      src={user.avatarUrl}
                      alt={user.username}
                      className="h-9 w-9 rounded-full object-cover border-2 border-purple-400/50 group-hover:border-purple-400 transition-all"
                    />
                    <div className="absolute inset-0 rounded-full bg-purple-500/0 group-hover:bg-purple-500/20 blur-sm transition-all duration-300" />
                  </div>
                ) : (
                  <span className="h-9 w-9 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-xs font-bold text-white shadow-lg">
                    {user?.username?.[0]?.toUpperCase() || "U"}
                  </span>
                )}
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shadow-lg shadow-emerald-400/50" />
                  <span className="text-white font-semibold hidden sm:inline">
                    {user?.username}
                  </span>
                </div>
              </Link>

              {/* Menú desplegable */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setOpenMenu((prev) => !prev)}
                  className="border border-white/20 text-white rounded-xl px-4 py-2 bg-white/10 backdrop-blur-sm hover:bg-white/20 hover:border-purple-400/50 flex items-center gap-2 text-sm font-medium transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/30"
                >
                  ⚙️ Menú
                  <span className={`text-[10px] transition-transform duration-300 ${openMenu ? 'rotate-180' : ''}`}>▼</span>
                </button>

                {openMenu && (
                  <div 
                    className="absolute right-0 mt-2 w-56 bg-gray-900/95 backdrop-blur-xl border border-purple-400/30 rounded-2xl shadow-2xl text-sm z-50 overflow-hidden"
                    style={{ boxShadow: '0 20px 60px rgba(139, 92, 246, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.1)' }}
                  >
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-purple-400/50 to-transparent" />
                    
                    <Link
                      to="/perfil"
                      onClick={() => setOpenMenu(false)}
                      className="flex w-full text-left px-4 py-3 text-white hover:bg-purple-500/20 border-b border-white/10 transition-all duration-200 items-center gap-2"
                    >
                      <span>👤</span>
                      <span className="font-medium">Editar perfil</span>
                    </Link>
                    <Link
                      to="/onboarding"
                      onClick={() => setOpenMenu(false)}
                      className="flex w-full text-left px-4 py-3 text-white hover:bg-purple-500/20 border-b border-white/10 transition-all duration-200 items-center gap-2"
                    >
                      <span>🏪</span>
                      <span className="font-medium">Mis tiendas</span>
                    </Link>
                    <button
                      onClick={() => {
                        setOpenMenu(false);
                        logout();
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-all duration-200 flex items-center gap-2 font-medium"
                    >
                      <span>🚪</span>
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
