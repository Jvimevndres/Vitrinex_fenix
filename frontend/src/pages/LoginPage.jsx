import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import MainHeader from "../components/MainHeader";

export default function LoginPage() {
  const navigate = useNavigate();
  const { signin, loading } = useAuth();

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const onChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await signin(form);
      navigate("/", { replace: true });
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
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
      <main className="w-full max-w-6xl mx-auto grid lg:grid-cols-2 gap-10 items-center">
        {/* Left visual panel (ilustrativo) */}
        <section className="hidden lg:flex flex-col items-start gap-6">
          <div
            className="w-full rounded-3xl p-10 bg-gradient-to-r from-violet-600 to-indigo-600 shadow-2xl text-white transform -rotate-2"
            aria-hidden="true"
          >
            <h2 className="text-4xl font-extrabold leading-tight">Login & Register</h2>
            <p className="mt-3 text-violet-100 max-w-md">
              Accede a tu cuenta para gestionar tus tiendas en Vitrinex. Diseño moderno, claro y enfocado en conversión.
            </p>
          </div>

          <div className="w-full rounded-2xl p-6 bg-white shadow-lg border">
            <h3 className="text-lg font-semibold text-slate-800">Beneficios</h3>
            <ul className="mt-3 text-sm text-slate-600 space-y-2">
              <li>• Control total de tus tiendas</li>
              <li>• Subidas y estadísticas en tiempo real</li>
              <li>• Integraciones y soporte</li>
            </ul>
          </div>
        </section>

        {/* Login card */}
        <section className="flex justify-center">
          <div className="w-full max-w-md">
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border overflow-hidden">
              <div className="p-8">
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Iniciar sesión</h1>
                <p className="text-sm text-slate-500 dark:text-slate-300 mt-1">
                  Accede a tu cuenta para administrar tus negocios en Vitrinex.
                </p>

                {error && (
                  <div className="mt-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                    {error}
                  </div>
                )}

                <form className="mt-6 space-y-4" onSubmit={onSubmit} noValidate>
                  <label className="block">
                    <span className="text-xs font-medium text-slate-600">Correo electrónico</span>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={onChange}
                      required
                      className="mt-2 w-full rounded-full border-2 border-violet-100 focus:border-violet-400 focus:ring-4 focus:ring-violet-100 px-4 py-2 placeholder:text-slate-400 transition"
                      placeholder="tucorreo@ejemplo.com"
                      aria-label="Correo electrónico"
                    />
                  </label>

                  <label className="block relative">
                    <span className="text-xs font-medium text-slate-600">Contraseña</span>
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={form.password}
                      onChange={onChange}
                      required
                      minLength={6}
                      className="mt-2 w-full rounded-full border-2 border-violet-100 focus:border-violet-400 focus:ring-4 focus:ring-violet-100 px-4 py-2 placeholder:text-slate-400 transition"
                      placeholder="Contraseña"
                      aria-label="Contraseña"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      className="absolute right-3 top-10 text-sm text-slate-500 hover:text-slate-700"
                      aria-pressed={showPassword}
                      aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                    >
                      {showPassword ? "Ocultar" : "Mostrar"}
                    </button>
                  </label>

                  <div className="flex items-center justify-between text-sm">
                    <label className="inline-flex items-center gap-2 text-slate-600">
                      <input type="checkbox" className="form-checkbox rounded-sm text-violet-600" />
                      <span>Recordarme</span>
                    </label>
                    <Link to="/forgot" className="text-violet-600 hover:underline">
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

                  <div className="mt-3">
                    <button
                      type="button"
                      className="w-full py-2 rounded-full border border-violet-200 text-violet-700 bg-white hover:bg-violet-50 flex items-center justify-center gap-2 text-sm"
                      onClick={() => alert("Implementar OAuth")}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                        <path d="M21 12.2c0-.7-.1-1.4-.3-2H12v3.8h5.5c-.2 1-1 2.6-2.5 3.4l-.1.7 3.6 2.8.3.1c2.2-2 3.5-5.2 3.5-8.8z" fill="#4285F4"/>
                        <path d="M12 22c2.7 0 5-0.9 6.6-2.4l-3.1-2.4C14.8 18.4 13.5 19 12 19c-3 0-5.6-2-6.5-4.7l-.7.1-3.3 2.5C4.6 20.8 8.1 22 12 22z" fill="#34A853"/>
                        <path d="M5.5 13.3a6.8 6.8 0 010-2.6l-.1-.2-3.4-2.6-.1.1A11.9 11.9 0 000 12c0 1.9.4 3.8 1.1 5.5l4.4-4.2z" fill="#FBBC05"/>
                        <path d="M12 5.2c1.5 0 2.9.5 4 1.5l3.1-3C17 1.6 14.7 1 12 1 8.1 1 4.6 2.2 1.9 4.8l3.6 2.8C6.4 6.4 9 5.2 12 5.2z" fill="#EA4335"/>
                      </svg>
                      Ingresar con Google
                    </button>
                  </div>
                </form>

                <p className="text-sm text-slate-600 mt-4">
                  ¿Aún no tienes cuenta?{" "}
                  <Link to="/register" className="text-violet-600 font-medium hover:underline">
                    Crear una cuenta
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
