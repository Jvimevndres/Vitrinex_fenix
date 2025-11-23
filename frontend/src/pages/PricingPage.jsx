// frontend/src/pages/PricingPage.jsx
/**
 * PricingPage - Página de planes y precios (FREE y PREMIUM)
 * Muestra las características de cada plan con tarjetas visuales
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { updateUserPlanRequest } from '../api/auth';
import MainHeader from '../components/MainHeader';
import Footer from '../components/Footer';
import { FaCheck, FaCrown, FaRobot, FaChartBar, FaTrophy, FaLightbulb, FaBell, FaShoppingCart, FaBoxOpen, FaQuestionCircle, FaUser } from 'react-icons/fa';

export default function PricingPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, checkLogin } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const currentPlan = user?.plan || 'free';

  const handleSelectPlan = async (plan) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (plan === currentPlan) {
      setError('Ya tienes este plan activo');
      setTimeout(() => setError(''), 3000);
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await updateUserPlanRequest(plan);
      await checkLogin(); // Actualizar contexto de usuario
      setSuccess(`¡Plan actualizado a ${plan.toUpperCase()} exitosamente!`);
      setTimeout(() => {
        navigate('/profile');
      }, 2000);
    } catch (err) {
      console.error('Error al cambiar plan:', err);
      setError(err.response?.data?.message || 'Error al cambiar el plan');
      setTimeout(() => setError(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  const plans = [
    {
      id: 'free',
      name: 'FREE',
      price: '$0',
      period: 'Gratis para siempre',
      description: 'Perfecto para empezar con tu negocio en línea',
      icon: FaShoppingCart,
      gradient: 'from-slate-600 to-slate-800',
      features: [
        { icon: FaRobot, text: 'Chatbot básico con IA', available: true },
        { icon: FaShoppingCart, text: 'Consultas sobre productos', available: true },
        { icon: FaBoxOpen, text: 'Información de stock', available: true },
        { icon: FaQuestionCircle, text: 'Ayuda general', available: true },
        { icon: FaUser, text: 'Gestión de perfil', available: true },
        { icon: FaChartBar, text: 'Estadísticas avanzadas', available: false },
        { icon: FaTrophy, text: 'Análisis de top productos', available: false },
        { icon: FaLightbulb, text: 'Consejos personalizados', available: false },
        { icon: FaBell, text: 'Alertas inteligentes', available: false },
      ],
      buttonText: currentPlan === 'free' ? 'Plan Actual' : 'Cambiar a FREE',
      buttonStyle: 'bg-slate-600 hover:bg-slate-700',
    },
    {
      id: 'premium',
      name: 'PREMIUM',
      price: '$9.99',
      period: 'por mes',
      description: 'Lleva tu negocio al siguiente nivel con IA avanzada',
      icon: FaCrown,
      gradient: 'from-amber-500 to-yellow-600',
      popular: true,
      features: [
        { icon: FaRobot, text: 'Chatbot avanzado con IA', available: true },
        { icon: FaChartBar, text: 'Estadísticas completas de ventas', available: true },
        { icon: FaTrophy, text: 'Análisis de productos top', available: true },
        { icon: FaLightbulb, text: 'Consejos personalizados de venta', available: true },
        { icon: FaBell, text: 'Alertas de stock y tendencias', available: true },
        { icon: FaShoppingCart, text: 'Todas las funciones FREE', available: true },
        { icon: FaBoxOpen, text: 'Gestión avanzada de inventario', available: true },
        { icon: FaQuestionCircle, text: 'Soporte prioritario', available: true },
        { icon: FaChartBar, text: 'Reportes exportables', available: true },
      ],
      buttonText: currentPlan === 'premium' ? 'Plan Actual' : 'Activar PREMIUM',
      buttonStyle: 'bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 shadow-xl',
    },
  ];

  // Estilo galaxia/espacio
  const pageBackgroundStyle = {
    background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)',
  };

  return (
    <>
      <div className="min-h-screen flex flex-col relative" style={pageBackgroundStyle}>
        {/* Estrellas animadas */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(100)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                opacity: Math.random() * 0.5 + 0.3,
                animation: `twinkle ${Math.random() * 3 + 2}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 3}s`,
              }}
            />
          ))}
        </div>

        <MainHeader subtitle="Planes y Precios" />
        <div className="header-spacer" />

        <main className="flex-1 max-w-7xl mx-auto px-6 py-16 relative z-10 w-full">
          {/* Encabezado */}
          <div className="text-center mb-16 space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold text-white">
              Elige el Plan Perfecto para Ti
            </h1>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Comienza gratis o desbloquea todo el potencial con nuestro plan Premium
            </p>
          </div>

          {/* Mensajes de estado */}
          {error && (
            <div className="max-w-2xl mx-auto mb-6 p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-300 text-center">
              {error}
            </div>
          )}
          {success && (
            <div className="max-w-2xl mx-auto mb-6 p-4 bg-green-500/20 border border-green-500 rounded-lg text-green-300 text-center">
              {success}
            </div>
          )}

          {/* Tarjetas de planes */}
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {plans.map((plan) => {
              const Icon = plan.icon;
              const isCurrentPlan = currentPlan === plan.id;

              return (
                <div
                  key={plan.id}
                  className={`relative bg-slate-800/80 backdrop-blur-xl border-2 rounded-3xl p-8 shadow-2xl transition-all hover:scale-105 ${
                    plan.popular
                      ? 'border-amber-400 ring-4 ring-amber-400/20'
                      : 'border-slate-600'
                  }`}
                >
                  {/* Badge "Popular" */}
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <span className="bg-gradient-to-r from-amber-500 to-yellow-600 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg border-2 border-amber-300">
                        🔥 MÁS POPULAR
                      </span>
                    </div>
                  )}

                  {/* Badge "Plan Actual" */}
                  {isCurrentPlan && (
                    <div className="absolute -top-4 right-8">
                      <span className="bg-green-500 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-lg">
                        ✓ Tu Plan
                      </span>
                    </div>
                  )}

                  {/* Icono del plan */}
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${plan.gradient} flex items-center justify-center mb-6 shadow-xl`}>
                    <Icon className="text-3xl text-white" />
                  </div>

                  {/* Nombre y precio */}
                  <div className="mb-6">
                    <h2 className="text-3xl font-bold text-white mb-2">{plan.name}</h2>
                    <div className="flex items-baseline gap-2 mb-2">
                      <span className="text-5xl font-bold text-white">{plan.price}</span>
                      <span className="text-slate-400 text-lg">{plan.period}</span>
                    </div>
                    <p className="text-slate-400 text-sm">{plan.description}</p>
                  </div>

                  {/* Características */}
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, idx) => {
                      const FeatureIcon = feature.icon;
                      return (
                        <li
                          key={idx}
                          className={`flex items-center gap-3 text-sm ${
                            feature.available ? 'text-slate-200' : 'text-slate-500'
                          }`}
                        >
                          {feature.available ? (
                            <FaCheck className="text-green-400 flex-shrink-0" />
                          ) : (
                            <span className="w-4 h-4 rounded-full border-2 border-slate-600 flex-shrink-0" />
                          )}
                          <FeatureIcon className="flex-shrink-0" />
                          <span className={feature.available ? '' : 'line-through'}>
                            {feature.text}
                          </span>
                        </li>
                      );
                    })}
                  </ul>

                  {/* Botón de acción */}
                  <button
                    onClick={() => handleSelectPlan(plan.id)}
                    disabled={isCurrentPlan || loading}
                    className={`w-full py-4 rounded-xl font-bold text-white transition-all ${plan.buttonStyle} ${
                      isCurrentPlan || loading
                        ? 'opacity-50 cursor-not-allowed'
                        : 'hover:scale-105'
                    }`}
                  >
                    {loading ? 'Procesando...' : plan.buttonText}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Información adicional */}
          <div className="mt-16 text-center space-y-4">
            <p className="text-slate-400">
              💡 <strong className="text-white">¿No estás seguro?</strong> Comienza con el plan FREE y actualiza cuando estés listo
            </p>
            <p className="text-slate-400 text-sm">
              Todos los planes incluyen acceso completo a la plataforma Vitrinex
            </p>
          </div>
        </main>

        <Footer />
      </div>

      {/* Animaciones CSS */}
      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.2); }
        }
      `}</style>
    </>
  );
}
