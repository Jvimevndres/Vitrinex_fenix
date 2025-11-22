import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import MainHeader from "../components/MainHeader";
import Footer from "../components/Footer";

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
            <h2 className="text-4xl font-extrabold leading-tight">Login & Register</h2>
            <p className="mt-3 text-violet-100 max-w-md">
              Accede a tu cuenta para gestionar tus tiendas en Vitrinex. Diseño moderno, claro y enfocado en conversión.
            </p>
          </div>

          <div className="w-full rounded-2xl p-6 shadow-lg border" style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            borderColor: 'rgba(255, 255, 255, 0.2)'
          }}>
            <h3 className="text-lg font-semibold text-white">Beneficios</h3>
            <ul className="mt-3 text-sm text-slate-200 space-y-2">
              <li>• Control total de tus tiendas</li>
              <li>• Subidas y estadísticas en tiempo real</li>
              <li>• Integraciones y soporte</li>
            </ul>
          </div>
        </section>

        {/* Login card */}
        <section className="flex justify-center">
          <div className="w-full max-w-md">
            <div className="rounded-3xl shadow-xl overflow-hidden" style={{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              <div className="p-8">
                <h1 className="text-2xl font-bold text-white">Iniciar sesión</h1>
                <p className="text-sm text-slate-200 mt-1">
                  Accede a tu cuenta para administrar tus negocios en Vitrinex.
                </p>

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