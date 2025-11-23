// src/components/ChatbotWidget.jsx
/**
 * ChatbotWidget - Widget flotante de chatbot con IA
 * Botón de burbuja que abre una ventana de chat donde el usuario puede hacer preguntas
 * y recibir respuestas generadas por IA sobre el uso de la plataforma.
 * Incluye menú de acciones rápidas diferenciadas por plan (FREE/PREMIUM).
 */

import { useState, useEffect, useRef } from 'react';
import { sendChatbotMessage, sendPremiumChatbotMessage, checkChatbotHealth } from '../api/chatbot';
import { useAuth } from '../context/AuthContext';
import { FaRobot, FaTimes, FaPaperPlane, FaShoppingCart, FaBoxOpen, FaQuestionCircle, FaUser, FaChartBar, FaTrophy, FaLightbulb, FaBell, FaCrown } from 'react-icons/fa';

export default function ChatbotWidget() {
  const { user, isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: '¡Hola! Soy el asistente virtual de Vitrinex. ¿En qué puedo ayudarte hoy? 😊',
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDemoMode, setIsDemoMode] = useState(true); // Asumir DEMO por defecto
  const [showQuickActions, setShowQuickActions] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const userPlan = user?.plan || 'free';

  // Verificar estado del chatbot al montar el componente
  useEffect(() => {
    checkChatbotStatus();
  }, []);

  // Auto-scroll al final cuando hay nuevos mensajes
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Enfocar input cuando se abre el chat
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      // Re-verificar el estado del chatbot al abrir
      checkChatbotStatus();
    }
  }, [isOpen]);

  // Acciones rápidas según el plan
  const quickActions = {
    free: [
      { icon: FaShoppingCart, label: 'Ver productos', query: '¿Qué productos puedo vender?' },
      { icon: FaBoxOpen, label: 'Revisar stock', query: '¿Cómo reviso mi inventario?' },
      { icon: FaQuestionCircle, label: 'Ayuda general', query: '¿Cómo funciona Vitrinex?' },
      { icon: FaUser, label: 'Mi cuenta', query: '¿Cómo edito mi perfil?' },
    ],
    premium: [
      { icon: FaChartBar, label: 'Estadísticas', query: 'Muéstrame las estadísticas de mis ventas' },
      { icon: FaTrophy, label: 'Top productos', query: '¿Cuáles son mis productos más vendidos?' },
      { icon: FaLightbulb, label: 'Consejos', query: 'Dame consejos para mejorar mis ventas' },
      { icon: FaBell, label: 'Alertas', query: 'Revisa si hay productos con bajo stock' },
      { icon: FaShoppingCart, label: 'Ver productos', query: '¿Qué productos tengo?' },
      { icon: FaQuestionCircle, label: 'Ayuda', query: '¿Qué puedo hacer con mi plan premium?' },
    ],
  };

  const currentActions = quickActions[userPlan] || quickActions.free;

  // Manejar clic en acción rápida
  const handleQuickAction = (query) => {
    setInputMessage(query);
    setShowQuickActions(false);
    // Enviar automáticamente
    setTimeout(() => {
      const event = { preventDefault: () => {} };
      handleSendMessage(event, query);
    }, 100);
  };

  // Verificar si el chatbot está en modo demo
  const checkChatbotStatus = async () => {
    try {
      const response = await checkChatbotHealth();
      console.log('🔍 Chatbot Health Response:', response.data);
      const isDemo = response.data.mode === 'demo';
      console.log('🎯 isDemoMode:', isDemo);
      setIsDemoMode(isDemo);
    } catch (err) {
      console.error('❌ Error al verificar estado del chatbot:', err);
      // Si hay error, asumir modo demo por seguridad
      setIsDemoMode(true);
    }
  };

  // Manejar envío de mensaje
  const handleSendMessage = async (e, directQuery = null) => {
    e.preventDefault();
    
    const messageText = (directQuery || inputMessage).trim();
    if (!messageText) return;
    
    // Validar longitud
    if (messageText.length > 2000) {
      setError('El mensaje es demasiado largo. Máximo 2000 caracteres.');
      return;
    }

    // Agregar mensaje del usuario
    const userMessage = {
      role: 'user',
      content: messageText,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setError(null);

    try {
      // Llamar a la API correcta según el plan del usuario
      let response;
      
      if (isAuthenticated && userPlan === 'premium') {
        // Usuario premium autenticado: usar endpoint premium con contexto
        console.log('🎯 Llamando a chatbot PREMIUM con contexto de negocio');
        response = await sendPremiumChatbotMessage(messageText);
      } else {
        // Usuario free o no autenticado: usar endpoint básico
        console.log('💬 Llamando a chatbot FREE básico');
        response = await sendChatbotMessage(messageText);
      }
      
      // Agregar respuesta de la IA
      const assistantMessage = {
        role: 'assistant',
        content: response.data.reply,
        timestamp: new Date(response.data.timestamp),
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      console.error('Error al enviar mensaje:', err);
      
      // Mensaje de error amigable
      const errorMessage = err.response?.data?.message || 
                          'Lo siento, hubo un error al procesar tu mensaje. Por favor, intenta de nuevo.';
      
      const errorResponse = {
        role: 'assistant',
        content: errorMessage,
        timestamp: new Date(),
        isError: true,
      };
      
      setMessages(prev => [...prev, errorResponse]);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Manejar Enter para enviar
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  // Toggle chat
  const toggleChat = () => {
    setIsOpen(!isOpen);
    setError(null);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Botón de burbuja flotante */}
      {!isOpen && (
        <button
          onClick={toggleChat}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full w-16 h-16 flex items-center justify-center shadow-2xl hover:shadow-3xl hover:scale-110 transition-all duration-300 group"
          aria-label="Abrir chatbot"
        >
          <FaRobot className="text-2xl group-hover:animate-bounce" />
        </button>
      )}

      {/* Ventana de chat */}
      {isOpen && (
        <div className="bg-white rounded-2xl shadow-2xl w-96 h-[600px] flex flex-col overflow-hidden border border-slate-200 animate-slideUp">
          {/* Header del chat */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 rounded-full p-2">
                <FaRobot className="text-xl" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-lg">Asistente Virtual</h3>
                  {isDemoMode && (
                    <span className="text-xs bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded-full font-medium">
                      DEMO
                    </span>
                  )}
                  {userPlan === 'premium' && (
                    <span className="text-xs bg-amber-400 text-amber-900 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                      <FaCrown className="text-xs" /> PREMIUM
                    </span>
                  )}
                </div>
                <p className="text-xs text-white/80">Siempre disponible para ayudarte</p>
              </div>
            </div>
            <button
              onClick={toggleChat}
              className="hover:bg-white/20 rounded-full p-2 transition-colors"
              aria-label="Cerrar chatbot"
            >
              <FaTimes className="text-xl" />
            </button>
          </div>

          {/* Menú de acciones rápidas */}
          {showQuickActions && (
            <div className="bg-white border-b border-slate-200 p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-slate-700">Acciones Rápidas</h4>
                {userPlan === 'free' && (
                  <button
                    onClick={() => window.location.href = '/pricing'}
                    className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
                  >
                    <FaCrown className="text-xs" /> Mejorar a Premium
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {currentActions.map((action, idx) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleQuickAction(action.query)}
                      className="flex items-center gap-2 p-3 bg-slate-50 hover:bg-indigo-50 rounded-lg border border-slate-200 hover:border-indigo-300 transition-all text-left group"
                    >
                      <Icon className="text-indigo-600 group-hover:scale-110 transition-transform" />
                      <span className="text-xs font-medium text-slate-700 group-hover:text-indigo-700">
                        {action.label}
                      </span>
                    </button>
                  );
                })}
              </div>
              {userPlan === 'free' && (
                <p className="text-xs text-slate-500 mt-3 text-center">
                  💡 Mejora a Premium para acceder a estadísticas y consejos personalizados
                </p>
              )}
            </div>
          )}

          {/* Mensajes */}
          <div className="flex-1 overflow-y-auto p-4 bg-slate-50 space-y-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-sm ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                      : msg.isError
                      ? 'bg-red-50 text-red-700 border border-red-200'
                      : 'bg-white text-slate-800 border border-slate-200'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
                    {msg.content}
                  </p>
                  <p
                    className={`text-xs mt-2 ${
                      msg.role === 'user' ? 'text-white/70' : 'text-slate-400'
                    }`}
                  >
                    {new Date(msg.timestamp).toLocaleTimeString('es-ES', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            ))}

            {/* Indicador de carga */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white text-slate-800 rounded-2xl px-4 py-3 shadow-sm border border-slate-200">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </div>
                    <span className="text-xs text-slate-500">Pensando...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input de mensaje */}
          <form onSubmit={handleSendMessage} className="border-t border-slate-200 bg-white p-4">
            {/* Indicador de modo */}
            {(() => {
              console.log('🎨 Renderizando indicador - isDemoMode:', isDemoMode, 'userPlan:', userPlan);
              
              // MODO DEMO
              if (isDemoMode) {
                // Usuario PREMIUM sin saldo de admin
                if (userPlan === 'premium') {
                  return (
                    <div className="mb-3 p-2 bg-orange-50 border border-orange-300 rounded-lg flex items-start gap-2">
                      <span className="text-orange-600 text-lg">⚠️</span>
                      <div className="flex-1">
                        <p className="text-xs text-orange-900 font-bold">
                          Plan Premium - Usando Modo Demo
                        </p>
                        <p className="text-xs text-orange-800 mt-0.5">
                          El admin aún no ha recargado saldo en OpenAI. Mientras tanto usas el asistente básico.
                        </p>
                      </div>
                    </div>
                  );
                }
                
                // Usuario FREE sin saldo
                return (
                  <div className="mb-3 p-2 bg-slate-100 border border-slate-300 rounded-lg flex items-start gap-2">
                    <span className="text-slate-600 text-lg">💬</span>
                    <div className="flex-1">
                      <p className="text-xs text-slate-800 font-medium">
                        Plan Free - Modo Demo
                      </p>
                      <p className="text-xs text-slate-600 mt-0.5">
                        Respuestas predefinidas. <a href="/pricing" className="text-indigo-600 hover:underline font-semibold">Activa Premium</a> para IA personalizada.
                      </p>
                    </div>
                  </div>
                );
              }
              
              // MODO IA ACTIVA
              // Usuario PREMIUM con IA
              if (userPlan === 'premium') {
                return (
                  <div className="mb-3 p-2 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-300 rounded-lg flex items-start gap-2">
                    <span className="text-amber-600 text-lg">👑</span>
                    <div className="flex-1">
                      <p className="text-xs text-amber-900 font-bold">
                        IA Premium Activada
                      </p>
                      <p className="text-xs text-amber-800 mt-0.5">
                        Respuestas personalizadas con datos reales de tu negocio
                      </p>
                    </div>
                  </div>
                );
              }
              
              // Usuario FREE con IA
              return (
                <div className="mb-3 p-2 bg-green-50 border border-green-300 rounded-lg flex items-start gap-2">
                  <span className="text-green-600 text-lg">✨</span>
                  <div className="flex-1">
                    <p className="text-xs text-green-800 font-medium">
                      Plan Free - IA Activada
                    </p>
                    <p className="text-xs text-green-700 mt-0.5">
                      Respuestas inteligentes de OpenAI. <a href="/pricing" className="text-indigo-600 hover:underline font-semibold">Mejora a Premium</a> para análisis avanzados.
                    </p>
                  </div>
                </div>
              );
            })()}

            <div className="flex gap-2 mb-2">
              <button
                type="button"
                onClick={() => setShowQuickActions(!showQuickActions)}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  showQuickActions
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                ⚡ Acciones
              </button>
            </div>
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Escribe tu pregunta aquí..."
                disabled={isLoading}
                className="flex-1 px-4 py-3 rounded-full border border-slate-300 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all disabled:bg-slate-100 disabled:cursor-not-allowed text-sm"
                maxLength={2000}
              />
              <button
                type="submit"
                disabled={isLoading || !inputMessage.trim()}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full w-12 h-12 flex items-center justify-center hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105"
                aria-label="Enviar mensaje"
              >
                <FaPaperPlane className="text-sm" />
              </button>
            </div>
            
            {/* Contador de caracteres */}
            <p className="text-xs text-slate-400 mt-2 text-right">
              {inputMessage.length} / 2000 caracteres
            </p>
          </form>
        </div>
      )}
    </div>
  );
}
