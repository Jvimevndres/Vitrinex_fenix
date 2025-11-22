// src/components/ChatbotWidget.jsx
/**
 * ChatbotWidget - Widget flotante de chatbot con IA
 * Botón de burbuja que abre una ventana de chat donde el usuario puede hacer preguntas
 * y recibir respuestas generadas por IA sobre el uso de la plataforma.
 */

import { useState, useEffect, useRef } from 'react';
import { sendChatbotMessage, checkChatbotHealth } from '../api/chatbot';
import { FaRobot, FaTimes, FaPaperPlane } from 'react-icons/fa';

export default function ChatbotWidget() {
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
  const [isDemoMode, setIsDemoMode] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

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
      // Verificar el estado del chatbot al abrir
      checkChatbotStatus();
    }
  }, [isOpen]);

  // Verificar si el chatbot está en modo demo
  const checkChatbotStatus = async () => {
    try {
      const response = await checkChatbotHealth();
      setIsDemoMode(response.data.mode === 'demo');
    } catch (err) {
      console.error('Error al verificar estado del chatbot:', err);
    }
  };

  // Manejar envío de mensaje
  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    const messageText = inputMessage.trim();
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
      // Llamar a la API del chatbot
      const response = await sendChatbotMessage(messageText);
      
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
