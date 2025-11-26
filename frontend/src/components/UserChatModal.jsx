// frontend/src/components/UserChatModal.jsx
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getUserMessages, sendUserMessage } from "../api/messages";
import { useAuth } from "../context/AuthContext";

/**
 * Modal de chat directo entre usuarios
 * Reutiliza el mismo diseño visual que CustomerChatModal
 */
export default function UserChatModal({ 
  targetUserId,
  targetUsername,
  onClose 
}) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!user || !targetUserId) return;
    
    loadMessages();
    // Polling cada 3 segundos
    const interval = setInterval(loadMessages, 3000);
    return () => clearInterval(interval);
  }, [targetUserId, user]);

  useEffect(() => {
    // Scroll automático al final cuando cambien los mensajes
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadMessages = async () => {
    try {
      const data = await getUserMessages(targetUserId);
      setMessages(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error cargando mensajes:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!newMessage.trim() || sending) return;
    
    try {
      setSending(true);
      await sendUserMessage(targetUserId, newMessage.trim());
      setNewMessage('');
      await loadMessages();
      
      // ✅ Refrescar contador de mensajes en header con pequeño delay
      setTimeout(() => {
        if (window.refreshMessagesAndNotifications) {
          window.refreshMessagesAndNotifications();
        }
      }, 500);
    } catch (err) {
      alert(`Error al enviar el mensaje: ${err.response?.data?.message || err.message}`);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-20 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 bg-gradient-to-r from-purple-50 to-pink-50 rounded-t-2xl flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900">💬 Chat con {targetUsername}</h3>
            <p className="text-xs text-slate-600 mt-1">
              Conversación privada
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Mensajes */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-slate-50 to-slate-100">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full mx-auto"></div>
              <p className="text-sm text-slate-500 mt-2">Cargando mensajes...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">💬</div>
              <p className="text-sm text-slate-500">Sin mensajes aún</p>
              <p className="text-xs text-slate-400 mt-1">Escribe un mensaje para iniciar la conversación</p>
            </div>
          ) : (
            <>
              {messages.map(msg => {
                const isMine = msg.fromUser._id === user._id;
                const otherUser = isMine ? { username: targetUsername } : msg.fromUser;
                
                return (
                  <div key={msg._id} className={`flex gap-3 ${isMine ? 'justify-end' : 'justify-start'}`}>
                    {/* Avatar izquierda (otro usuario) */}
                    {!isMine && (
                      <button 
                        onClick={() => navigate(`/usuario/${msg.fromUser._id}`)}
                        className="flex-shrink-0 hover:scale-110 transition-transform cursor-pointer"
                        title="Ver perfil del usuario"
                      >
                        {msg.fromUser.avatarUrl ? (
                          <img 
                            src={msg.fromUser.avatarUrl} 
                            alt={msg.fromUser.username} 
                            className="w-10 h-10 rounded-full object-cover shadow-md border-2 border-blue-200"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md">
                            {(msg.fromUser.username || msg.fromUser.email || 'U').charAt(0).toUpperCase()}
                          </div>
                        )}
                      </button>
                    )}

                    {/* Burbuja de mensaje */}
                    <div className={`max-w-[70%] rounded-2xl px-4 py-3 shadow-lg ${
                      isMine
                        ? 'bg-gradient-to-br from-purple-500 to-pink-600 text-white rounded-tr-sm' 
                        : 'bg-white text-slate-900 border border-slate-200 rounded-tl-sm'
                    }`}>
                      {!isMine && (
                        <p className="text-xs font-bold mb-1 text-blue-600">
                          {msg.fromUser.username || msg.fromUser.email}
                        </p>
                      )}
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <p className={`text-xs ${isMine ? 'text-purple-100' : 'text-slate-400'}`}>
                          {new Date(msg.createdAt).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>

                    {/* Avatar derecha (yo) */}
                    {isMine && (
                      <button 
                        onClick={() => navigate(`/usuario/${user._id}`)}
                        className="flex-shrink-0 hover:scale-110 transition-transform cursor-pointer"
                        title="Ver mi perfil"
                      >
                        {user?.avatarUrl ? (
                          <img 
                            src={user.avatarUrl} 
                            alt={user.username} 
                            className="w-10 h-10 rounded-full object-cover shadow-md border-2 border-purple-200"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white font-bold shadow-md">
                            {(user?.username || user?.email || 'U').charAt(0).toUpperCase()}
                          </div>
                        )}
                      </button>
                    )}
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-slate-200 bg-white rounded-b-2xl">
          <div className="flex gap-3 items-end">
            {/* Avatar del usuario */}
            <div className="flex-shrink-0 mb-1">
              {user?.avatarUrl ? (
                <img 
                  src={user.avatarUrl} 
                  alt={user.username} 
                  className="w-10 h-10 rounded-full object-cover shadow-md border-2 border-slate-200"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white font-bold shadow-md">
                  {(user?.username || user?.email || 'U').charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            
            <div className="flex-1 flex gap-2">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Escribe tu mensaje..."
                rows={2}
                disabled={sending}
                className="flex-1 px-4 py-3 border border-slate-300 rounded-xl resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-slate-100 transition-all"
              />
              <button
                onClick={handleSend}
                disabled={!newMessage.trim() || sending}
                className="px-5 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl font-medium hover:from-purple-600 hover:to-pink-700 transition-all disabled:from-slate-300 disabled:to-slate-300 disabled:cursor-not-allowed self-end shadow-lg hover:shadow-xl disabled:shadow-none flex items-center justify-center min-w-[60px]"
              >
                {sending ? (
                  <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                ) : (
                  <span className="text-xl">📤</span>
                )}
              </button>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-2 ml-14">
            💡 Presiona Enter para enviar, Shift + Enter para nueva línea
          </p>
        </div>
      </div>
    </div>
  );
}
