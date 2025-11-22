// frontend/src/components/UserChatModal.jsx
import { useEffect, useState } from "react";
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
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!user || !targetUserId) return;
    
    loadMessages();
    // Polling cada 3 segundos
    const interval = setInterval(loadMessages, 3000);
    return () => clearInterval(interval);
  }, [targetUserId, user]);

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
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
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
            messages.map(msg => {
              const isMine = msg.fromUser._id === user._id;
              return (
                <div key={msg._id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] rounded-xl px-4 py-2 shadow-sm ${
                    isMine
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' 
                      : 'bg-white text-slate-900 border border-slate-200'
                  }`}>
                    {!isMine && (
                      <p className="text-xs font-semibold mb-1 opacity-70">
                        {msg.fromUser.username || msg.fromUser.email}
                      </p>
                    )}
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    <p className={`text-xs mt-1 ${isMine ? 'text-purple-100' : 'text-slate-500'}`}>
                      {new Date(msg.createdAt).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-slate-200 bg-white rounded-b-2xl">
          <div className="flex gap-2">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Escribe tu mensaje..."
              rows={2}
              disabled={sending}
              className="flex-1 px-4 py-2 border border-slate-300 rounded-lg resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-slate-100"
            />
            <button
              onClick={handleSend}
              disabled={!newMessage.trim() || sending}
              className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:shadow-lg hover:scale-105 transition-all disabled:bg-slate-300 disabled:cursor-not-allowed disabled:scale-100 self-end"
            >
              {sending ? "..." : "📤"}
            </button>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Presiona Enter para enviar, Shift + Enter para nueva línea
          </p>
        </div>
      </div>
    </div>
  );
}
