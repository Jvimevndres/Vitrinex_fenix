// src/pages/RegisterPage.jsx
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import { FaRocket } from 'react-icons/fa';

export default function RegisterPage() {
  const {
    register: registerField,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const { signup, isAuthenticated } = useAuth();
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  
  const [paletteMode, setPaletteMode] = useState(() => {
    try {
      if (typeof window === "undefined") return "warm";
      const v = localStorage.getItem("explore:paletteMode");
      return v === "warm" || v === "cool" ? v : "warm";
    } catch (e) {
      return "warm";
    }
  });

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = handleSubmit(async (values) => {
    setError("");
    setSubmitting(true);
    try {
      await signup(values); // values: { username, email, password }
      // navigation handled by isAuthenticated effect
    } catch (err) {
      if (err?.response?.status === 429) {
        setError("Demasiados intentos. Espera un momento y vuelve a intentar.");
      } else {
        const msg =
          err?.response?.data?.message ||
          (Array.isArray(err?.response?.data?.error) && err?.response?.data?.error[0]) ||
          err?.message ||
          "Error al crear la cuenta";
        setError(msg);
      }
    } finally {
      setSubmitting(false);
    }
  });

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
        {/* Left visual panel */}
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
              Únete a Vitrinex
            </h2>
            <p className="mt-3 text-violet-100 max-w-md">
              Crea tu cuenta y comienza a gestionar tus tiendas de forma profesional. Todo lo que necesitas en una sola plataforma.
            </p>
            <div className="flex items-center gap-4 mt-6">
              <div className="flex items-center gap-2">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                    <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-sm">Fácil de usar</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-sm">Gratis</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-sm">Potente</span>
              </div>
            </div>
          </div>

          <div className="w-full rounded-2xl p-6 shadow-lg border" style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            borderColor: 'rgba(255, 255, 255, 0.2)'
          }}>
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2"><FaRocket /> Lo que obtienes</h3>
            <ul className="text-sm text-slate-200 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-violet-400 mt-0.5">✓</span>
                <span>Panel de administración completo</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-violet-400 mt-0.5">✓</span>
                <span>Gestión de productos y servicios</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-violet-400 mt-0.5">✓</span>
                <span>Sistema de reservas automático</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-violet-400 mt-0.5">✓</span>
                <span>Análisis con IA personalizado</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-violet-400 mt-0.5">✓</span>
                <span>Chat en tiempo real con clientes</span>
              </li>
            </ul>
          </div>
        </section>

        {/* Register card */}
        <section className="flex justify-center">
          <div className="w-full max-w-md">
            <div className="rounded-3xl shadow-2xl overflow-hidden" style={{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              {/* Card Header */}
              <div className="bg-gradient-to-r from-violet-600/20 to-purple-600/20 px-8 py-6 border-b border-white/10">
                <h1 className="text-3xl font-bold text-white">
                  Crear cuenta
                </h1>
                <p className="text-sm text-slate-200 mt-2">
                  Completa el formulario para registrarte en Vitrinex
                </p>
              </div>
              
              <div className="p-8">

                {error && (
                  <div className="mt-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                    {error}
                  </div>
                )}

                <form
                  className="mt-6 space-y-4"
                  onSubmit={onSubmit}
                  noValidate
                >
                  <label className="block">
                    <span className="text-xs font-medium text-slate-200">
                      Nombre
                    </span>
                    <input
                      type="text"
                      {...registerField("username", {
                        required: "El nombre es obligatorio",
                      })}
                      className="mt-2 w-full rounded-full px-4 py-2 placeholder:text-slate-400 transition"
                      style={{
                        background: 'rgba(255, 255, 255, 0.1)',
                        border: '2px solid rgba(139, 92, 246, 0.3)',
                        color: 'white',
                        backdropFilter: 'blur(10px)'
                      }}
                      onFocus={(e) => e.target.style.borderColor = 'rgba(139, 92, 246, 0.6)'}
                      onBlur={(e) => e.target.style.borderColor = 'rgba(139, 92, 246, 0.3)'}
                      placeholder="Tu nombre o nombre de usuario"
                      aria-label="Nombre"
                    />
                    {errors.username && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.username.message}
                      </p>
                    )}
                  </label>

                  <label className="block">
                    <span className="text-xs font-medium text-slate-200">
                      Correo electrónico
                    </span>
                    <input
                      type="email"
                      {...registerField("email", {
                        required: "El correo es obligatorio",
                      })}
                      className="mt-2 w-full rounded-full px-4 py-2 placeholder:text-slate-400 transition"
                      style={{
                        background: 'rgba(255, 255, 255, 0.1)',
                        border: '2px solid rgba(139, 92, 246, 0.3)',
                        color: 'white',
                        backdropFilter: 'blur(10px)'
                      }}
                      onFocus={(e) => e.target.style.borderColor = 'rgba(139, 92, 246, 0.6)'}
                      onBlur={(e) => e.target.style.borderColor = 'rgba(139, 92, 246, 0.3)'}
                      placeholder="ejemplo@correo.com"
                      aria-label="Correo electrónico"
                    />
                    {errors.email && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.email.message}
                      </p>
                    )}
                  </label>

                  <label className="block relative">
                    <span className="text-xs font-medium text-slate-200">
                      Contraseña
                    </span>
                    <input
                      type="password"
                      {...registerField("password", {
                        required: "La contraseña es obligatoria",
                        minLength: { value: 6, message: "Mínimo 6 caracteres" },
                      })}
                      className="mt-2 w-full rounded-full px-4 py-2 placeholder:text-slate-400 transition"
                      style={{
                        background: 'rgba(255, 255, 255, 0.1)',
                        border: '2px solid rgba(139, 92, 246, 0.3)',
                        color: 'white',
                        backdropFilter: 'blur(10px)'
                      }}
                      onFocus={(e) => e.target.style.borderColor = 'rgba(139, 92, 246, 0.6)'}
                      onBlur={(e) => e.target.style.borderColor = 'rgba(139, 92, 246, 0.3)'}
                      placeholder="••••••••"
                      aria-label="Contraseña"
                    />
                    {errors.password && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.password.message}
                      </p>
                    )}
                  </label>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full mt-3 py-2.5 rounded-full text-white font-semibold bg-gradient-to-r from-violet-600 to-purple-500 hover:from-violet-700 hover:to-purple-600 shadow-md transition disabled:opacity-60"
                  >
                    {submitting ? "Creando cuenta..." : "Crear cuenta"}
                  </button>
                </form>

                <p className="text-sm text-slate-200 mt-4">
                  ¿Ya tienes cuenta?{" "}
                  <Link
                    to="/login"
                    className="text-violet-400 font-medium hover:text-violet-300 hover:underline"
                  >
                    Inicia sesión
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