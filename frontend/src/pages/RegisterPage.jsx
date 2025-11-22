// src/pages/RegisterPage.jsx
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import Footer from "../components/Footer";

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
              Bienvenido a Vitrinex
            </h2>
            <p className="mt-3 text-violet-100 max-w-md">
              Crea tu cuenta para empezar a administrar tus negocios, subir
              productos y ver estadísticas en tiempo real.
            </p>
          </div>

          <div className="w-full rounded-2xl p-6 shadow-lg border" style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            borderColor: 'rgba(255, 255, 255, 0.2)'
          }}>
            <h3 className="text-lg font-semibold text-white">Beneficios</h3>
            <ul className="mt-3 text-sm text-slate-200 space-y-2">
              <li>• Publica y administra tus tiendas</li>
              <li>• Accede a métricas y estadísticas</li>
              <li>• Integraciones y soporte dedicado</li>
            </ul>
          </div>
        </section>

        {/* Register card */}
        <section className="flex justify-center">
          <div className="w-full max-w-md">
            <div className="rounded-3xl shadow-xl overflow-hidden" style={{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              <div className="p-8">
                <h1 className="text-2xl font-bold text-white">
                  Crear cuenta
                </h1>
                <p className="text-sm text-slate-200 mt-1">
                  Regístrate para empezar a usar Vitrinex.
                </p>

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