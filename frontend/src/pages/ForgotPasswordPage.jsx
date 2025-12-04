// src/pages/ForgotPasswordPage.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import Footer from "../components/Footer";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      setError("Por favor ingresa un correo electrónico válido");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/auth/forgot-password`, { email });
      console.log('✅ Código enviado:', response.data);
      setSuccess(true);
    } catch (err) {
      console.error('❌ Error en forgot-password:', err);
      setError(
        err?.response?.data?.message ||
        "Error al enviar el correo. Verifica que el email sea correcto."
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

      <main className="w-full max-w-md mx-auto relative z-10">
        <div className="rounded-3xl shadow-2xl overflow-hidden" style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          {/* Card Header */}
          <div className="bg-gradient-to-r from-violet-600/20 to-purple-600/20 px-8 py-6 border-b border-white/10">
            <h1 className="text-3xl font-bold text-white">
              ¿Olvidaste tu contraseña?
            </h1>
            <p className="text-sm text-slate-200 mt-2">
              Te enviaremos un código para restablecer tu contraseña
            </p>
          </div>
          
          <div className="p-8">
            {success ? (
              <div className="text-center">
                <div className="mx-auto w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mb-4">
                  <svg className="w-10 h-10 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-white mb-2">¡Correo enviado!</h2>
                <p className="text-slate-200 mb-6">
                  Hemos enviado un código de 6 dígitos a <strong>{email}</strong>. 
                  Revisa tu bandeja de entrada y tu carpeta de spam.
                </p>
                <Link
                  to="/reset-password"
                  className="w-full inline-block text-center py-2.5 rounded-full text-white font-semibold bg-gradient-to-r from-violet-600 to-purple-500 hover:from-violet-700 hover:to-purple-600 transition shadow-lg"
                >
                  Ingresar código
                </Link>
                <p className="text-sm text-slate-200 mt-4">
                  <Link to="/login" className="text-violet-400 hover:text-violet-300 hover:underline">
                    Volver al inicio de sesión
                  </Link>
                </p>
              </div>
            ) : (
              <>
                <div className="mb-6 p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
                  <p className="text-sm text-slate-200">
                    <strong>ℹ️ Instrucciones:</strong>
                    <br />
                    Ingresa tu correo electrónico y te enviaremos un código de verificación de 6 dígitos para restablecer tu contraseña.
                  </p>
                </div>

                {error && (
                  <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <label className="block">
                    <span className="text-xs font-medium text-slate-200">Correo electrónico</span>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
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
                    />
                  </label>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 rounded-full text-white font-semibold bg-gradient-to-r from-violet-600 to-purple-500 hover:from-violet-700 hover:to-purple-600 shadow-md transition disabled:opacity-60"
                  >
                    {loading ? "Enviando código..." : "Enviar código"}
                  </button>
                </form>

                <p className="text-sm text-slate-200 mt-4 text-center">
                  ¿Recordaste tu contraseña?{" "}
                  <Link to="/login" className="text-violet-400 font-medium hover:text-violet-300 hover:underline">
                    Iniciar sesión
                  </Link>
                </p>
              </>
            )}
          </div>
        </div>
      </main>
      </div>
      
      <Footer paletteMode="warm" />
    </div>
  );
}
