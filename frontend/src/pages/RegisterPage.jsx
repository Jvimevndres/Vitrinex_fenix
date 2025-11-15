// src/pages/RegisterPage.jsx
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";

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
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
      <main className="w-full max-w-6xl mx-auto grid lg:grid-cols-2 gap-10 items-center">
        {/* Left visual panel */}
        <section className="hidden lg:flex flex-col items-start gap-6">
          <div
            className="w-full rounded-3xl p-10 bg-gradient-to-r from-violet-600 to-indigo-600 shadow-2xl text-white transform -rotate-2"
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

          <div className="w-full rounded-2xl p-6 bg-white shadow-lg border">
            <h3 className="text-lg font-semibold text-slate-800">Beneficios</h3>
            <ul className="mt-3 text-sm text-slate-600 space-y-2">
              <li>• Publica y administra tus tiendas</li>
              <li>• Accede a métricas y estadísticas</li>
              <li>• Integraciones y soporte dedicado</li>
            </ul>
          </div>
        </section>

        {/* Register card */}
        <section className="flex justify-center">
          <div className="w-full max-w-md">
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border overflow-hidden">
              <div className="p-8">
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
                  Crear cuenta
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-300 mt-1">
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
                    <span className="text-xs font-medium text-slate-600">
                      Nombre
                    </span>
                    <input
                      type="text"
                      {...registerField("username", {
                        required: "El nombre es obligatorio",
                      })}
                      className="mt-2 w-full rounded-full border-2 border-violet-100 focus:border-violet-400 focus:ring-4 focus:ring-violet-100 px-4 py-2 placeholder:text-slate-400 transition"
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
                    <span className="text-xs font-medium text-slate-600">
                      Correo electrónico
                    </span>
                    <input
                      type="email"
                      {...registerField("email", {
                        required: "El correo es obligatorio",
                      })}
                      className="mt-2 w-full rounded-full border-2 border-violet-100 focus:border-violet-400 focus:ring-4 focus:ring-violet-100 px-4 py-2 placeholder:text-slate-400 transition"
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
                    <span className="text-xs font-medium text-slate-600">
                      Contraseña
                    </span>
                    <input
                      type="password"
                      {...registerField("password", {
                        required: "La contraseña es obligatoria",
                        minLength: { value: 6, message: "Mínimo 6 caracteres" },
                      })}
                      className="mt-2 w-full rounded-full border-2 border-violet-100 focus:border-violet-400 focus:ring-4 focus:ring-violet-100 px-4 py-2 placeholder:text-slate-400 transition"
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

                <p className="text-sm text-slate-600 mt-4">
                  ¿Ya tienes cuenta?{" "}
                  <Link
                    to="/login"
                    className="text-violet-600 font-medium hover:underline"
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
  );
}
