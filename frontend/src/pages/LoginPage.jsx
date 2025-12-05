import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import MainHeader from "../components/MainHeader";
import Footer from "../components/Footer";
import { FaStar } from 'react-icons/fa';

export default function LoginPage() {
  const navigate = useNavigate();
  const { signin, loading } = useAuth();

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  const [paletteMode, setPaletteMode] = useState(() => {
    try {
      if (typeof window === "undefined") return "warm";
      const v = localStorage.getItem("explore:paletteMode");
      return v === "warm" || v === "cool" ? v : "warm";
    } catch (e) {
      return "warm";
    }
  });

  const onChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const userData = await signin(form);
      // Redirigir a /admin si es admin, sino a home
      if (userData.role === 'admin') {
        navigate("/admin", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    } catch (err) {
      if (err?.response?.status === 429) {
        setError("Demasiados intentos. Espera un momento y vuelve a intentar.");
      } else {
        const msg =
          err?.response?.data?.message ||
          (Array.isArray(err?.response?.data?.error) &&
            err?.response?.data?.error[0]) ||
          "Credenciales inválidas";
        setError(msg);
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden" 
         style={{ 
           background: 'radial-gradient(ellipse at top, #1a0b2e 0%, #16213e 35%, #0f3460 70%, #533483 100%)',
           transition: 'background 420ms ease'
         }}>
      
      {/* Header */}
      <header className="relative z-20 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <span className="text-white font-bold text-xl">V</span>
            </div>
            <span className="text-2xl font-bold text-white">Vitrinex</span>
          </Link>
        </div>
      </header>
      
      <div className="flex-1 flex items-center justify-center px-4 py-12">
      
      {/* Animated stars background */}
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

      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
      `}</style>

      {/* Decorative background blobs */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: -120,
          left: -140,
          width: 480,
          height: 480,
          borderRadius: 9999,
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.4) 0%, rgba(99, 102, 241, 0.3) 40%, transparent 70%)',
          opacity: 0.7,
          filter: "blur(80px)",
          transform: "rotate(-12deg)",
          mixBlendMode: "screen",
          pointerEvents: "none",
          animation: "float 8s ease-in-out infinite",
        }}
      />

      <div
        aria-hidden
        style={{
          position: "absolute",
          bottom: -140,
          right: -100,
          width: 560,
          height: 560,
          borderRadius: 9999,
          background: 'radial-gradient(circle, rgba(236, 72, 153, 0.35) 0%, rgba(168, 85, 247, 0.25) 40%, transparent 70%)',
          opacity: 0.6,
          filter: "blur(90px)",
          transform: "rotate(12deg)",
          mixBlendMode: "screen",
          pointerEvents: "none",
          animation: "float 10s ease-in-out infinite reverse",
        }}
      />

      <main className="w-full max-w-6xl mx-auto grid lg:grid-cols-2 gap-10 items-center relative z-10">
        {/* Left visual panel (ilustrativo) */}
        <section className="hidden lg:flex flex-col items-start gap-6">
          <div
            className="w-full rounded-3xl p-10 shadow-2xl text-white transform -rotate-2"
            style={{
              background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.9) 0%, rgba(99, 102, 241, 0.9) 50%, rgba(168, 85, 247, 0.9) 100%)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}
            aria-hidden="true"
          >
            <h2 className="text-4xl font-extrabold leading-tight">
              Bienvenido de vuelta
            </h2>
            <p className="mt-3 text-violet-100 max-w-md">
              Accede a tu cuenta para gestionar tus tiendas, productos y servicios en Vitrinex. Todo en un solo lugar.
            </p>
            <div className="flex items-center gap-4 mt-6">
              <div className="flex items-center gap-2">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-sm">Seguro</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                  </svg>
                </div>
                <span className="text-sm">Confiable</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-sm">Rápido</span>
              </div>
            </div>
          </div>

          <div className="w-full rounded-2xl p-6 shadow-lg border" style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            borderColor: 'rgba(255, 255, 255, 0.2)'
          }}>
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2"><FaStar /> Beneficios de Vitrinex</h3>
            <ul className="text-sm text-slate-200 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-violet-400 mt-0.5">✓</span>
                <span>Control total de tus tiendas y productos</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-violet-400 mt-0.5">✓</span>
                <span>Estadísticas en tiempo real</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-violet-400 mt-0.5">✓</span>
                <span>Sistema de reservas integrado</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-violet-400 mt-0.5">✓</span>
                <span>Chatbot con IA para análisis de negocio</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-violet-400 mt-0.5">✓</span>
                <span>Soporte técnico dedicado</span>
              </li>
            </ul>
          </div>
        </section>

        {/* Login card */}
        <section className="flex justify-center">
          <div className="w-full max-w-md">
            <div className="rounded-3xl shadow-2xl overflow-hidden" style={{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              {/* Card Header */}
              <div className="bg-gradient-to-r from-violet-600/20 to-purple-600/20 px-8 py-6 border-b border-white/10">
                <h1 className="text-3xl font-bold text-white">Iniciar sesión</h1>
                <p className="text-sm text-slate-200 mt-2">
                  Ingresa tus credenciales para acceder a tu cuenta
                </p>
              </div>
              
              <div className="p-8">

                {error && (
                  <div className="mt-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                    {error}
                  </div>
                )}

                <form className="mt-6 space-y-4" onSubmit={onSubmit} noValidate>
                  <label className="block">
                    <span className="text-xs font-medium text-slate-200">Correo electrónico</span>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={onChange}
                      required
                      className="mt-2 w-full rounded-full px-4 py-2 placeholder:text-slate-400 transition"
                      style={{
                        background: 'rgba(255, 255, 255, 0.1)',
                        border: '2px solid rgba(139, 92, 246, 0.3)',
                        color: 'white',
                        backdropFilter: 'blur(10px)'
                      }}
                      onFocus={(e) => e.target.style.borderColor = 'rgba(139, 92, 246, 0.6)'}
                      onBlur={(e) => e.target.style.borderColor = 'rgba(139, 92, 246, 0.3)'}
                      placeholder="tucorreo@ejemplo.com"
                      aria-label="Correo electrónico"
                    />
                  </label>

                  <label className="block relative">
                    <span className="text-xs font-medium text-slate-200">Contraseña</span>
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={form.password}
                      onChange={onChange}
                      required
                      minLength={6}
                      className="mt-2 w-full rounded-full px-4 py-2 placeholder:text-slate-400 transition"
                      style={{
                        background: 'rgba(255, 255, 255, 0.1)',
                        border: '2px solid rgba(139, 92, 246, 0.3)',
                        color: 'white',
                        backdropFilter: 'blur(10px)'
                      }}
                      onFocus={(e) => e.target.style.borderColor = 'rgba(139, 92, 246, 0.6)'}
                      onBlur={(e) => e.target.style.borderColor = 'rgba(139, 92, 246, 0.3)'}
                      placeholder="Contraseña"
                      aria-label="Contraseña"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      className="absolute right-3 top-10 text-sm text-slate-300 hover:text-white"
                      aria-pressed={showPassword}
                      aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                    >
                      {showPassword ? "Ocultar" : "Mostrar"}
                    </button>
                  </label>

                  <div className="flex items-center justify-between text-sm">
                    <label className="inline-flex items-center gap-2 text-slate-200">
                      <input type="checkbox" className="form-checkbox rounded-sm text-violet-400" />
                      <span>Recordarme</span>
                    </label>
                    <Link to="/forgot" className="text-violet-400 hover:text-violet-300 hover:underline">
                      ¿Olvidaste la contraseña?
                    </Link>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-3 py-2.5 rounded-full text-white font-semibold bg-gradient-to-r from-violet-600 to-purple-500 hover:from-violet-700 hover:to-purple-600 shadow-md transition disabled:opacity-60"
                  >
                    {loading ? "Ingresando..." : "Iniciar sesión"}
                  </button>

                  {/* Botón de Google eliminado */}
                </form>

                <p className="text-sm text-slate-200 mt-4">
                  ¿Aún no tienes cuenta?{" "}
                  <Link to="/register" className="text-violet-400 font-medium hover:text-violet-300 hover:underline">
                    Crear una cuenta
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      </div>
      
      <Footer paletteMode={paletteMode} />
    </div>
  );
}