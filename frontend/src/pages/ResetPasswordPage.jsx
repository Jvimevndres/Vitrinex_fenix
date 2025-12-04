// src/pages/ResetPasswordPage.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Footer from "../components/Footer";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    code: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validaciones
    if (!formData.code || formData.code.trim().length === 0) {
      setError("Por favor ingresa el código de verificación");
      return;
    }

    if (!/^\d{6}$/.test(formData.code)) {
      setError("El código debe tener exactamente 6 dígitos numéricos");
      return;
    }

    if (!formData.newPassword || formData.newPassword.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setLoading(true);

    try {
      console.log('🔐 Enviando reset-password...');
      const response = await axios.post(`${API_URL}/auth/reset-password`, {
        code: formData.code.trim(),
        newPassword: formData.newPassword
      });
      
      console.log('✅ Contraseña actualizada:', response.data);
      
      // Mostrar mensaje de éxito
      alert("¡Contraseña actualizada! Ahora puedes iniciar sesión con tu nueva contraseña.");
      navigate("/login");
    } catch (err) {
      console.error('❌ Error en reset-password:', err.response?.data || err.message);
      setError(
        err?.response?.data?.message ||
        "Error al restablecer contraseña. Verifica el código."
      );
    } finally {
      setLoading(false);
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
      `}</style>

      {/* Decorative blobs */}
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
        }}
      />

      <main className="w-full max-w-md mx-auto relative z-10">
        <div className="rounded-3xl shadow-2xl overflow-hidden" style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          {/* Card Header */}
          <div className="bg-gradient-to-r from-violet-600/20 to-purple-600/20 px-8 py-6 border-b border-white/10">
            <h1 className="text-3xl font-bold text-white">
              Restablecer contraseña
            </h1>
            <p className="text-sm text-slate-200 mt-2">
              Ingresa el código que recibiste por correo
            </p>
          </div>
          
          <div className="p-8">
            {error && (
              <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <label className="block">
                <span className="text-xs font-medium text-slate-200">Código de verificación</span>
                <input
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  required
                  maxLength={6}
                  pattern="[0-9]{6}"
                  className="mt-2 w-full rounded-full px-4 py-2 placeholder:text-slate-400 transition text-center text-2xl tracking-widest font-mono"
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '2px solid rgba(139, 92, 246, 0.3)',
                    color: 'white',
                    backdropFilter: 'blur(10px)'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'rgba(139, 92, 246, 0.6)'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(139, 92, 246, 0.3)'}
                  placeholder="000000"
                />
                <p className="text-xs text-slate-300 mt-1">Ingresa el código de 6 dígitos</p>
              </label>

              <label className="block relative">
                <span className="text-xs font-medium text-slate-200">Nueva contraseña</span>
                <input
                  type={showPassword ? "text" : "password"}
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
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
                  placeholder="Nueva contraseña"
                />
              </label>

              <label className="block relative">
                <span className="text-xs font-medium text-slate-200">Confirmar contraseña</span>
                <input
                  type={showPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
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
                  placeholder="Confirmar contraseña"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-10 text-sm text-slate-300 hover:text-white"
                >
                  {showPassword ? "Ocultar" : "Mostrar"}
                </button>
              </label>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-full text-white font-semibold bg-gradient-to-r from-violet-600 to-purple-500 hover:from-violet-700 hover:to-purple-600 shadow-md transition disabled:opacity-60"
              >
                {loading ? "Actualizando..." : "Restablecer contraseña"}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-white/10 text-center space-y-2">
              <p className="text-sm text-slate-200">
                <Link to="/forgot" className="text-violet-400 hover:text-violet-300 hover:underline">
                  ¿No recibiste el código? Reenviar
                </Link>
              </p>
              <p className="text-sm text-slate-200">
                <Link to="/login" className="text-violet-400 hover:text-violet-300 hover:underline">
                  Volver al inicio de sesión
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
      </div>
      
      <Footer paletteMode="warm" />
    </div>
  );
}
