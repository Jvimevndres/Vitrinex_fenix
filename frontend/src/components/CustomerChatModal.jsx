// frontend/src/components/CustomerChatModal.jsx
import { useEffect, useState } from "react";
import { 
  getBookingMessagesPublic, 
  sendMessagePublic,
  getOrderMessages,
  sendOrderMessagePublic 
} from "../api/messages";

export default function CustomerChatModal({ 
  type, // "order" | "booking"
  id, // orderId | bookingId
  customerEmail,
  customerName,
  onClose 
}) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    loadMessages();
    // Polling cada 3 segundos
    const interval = setInterval(loadMessages, 3000);
    return () => clearInterval(interval);
  }, [id]);

  const loadMessages = async () => {
    try {
      let data;
      if (type === "booking") {
        data = await getBookingMessagesPublic(id, customerEmail);
      } else {
        // Para orders, usar el endpoint público (sin autenticación)
        // Por ahora usamos el protegido si el cliente está logueado
        try {
          const response = await getOrderMessages(id);
          data = response.data || response;
        } catch {
          data = [];
        }
      }
      setMessages(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error cargando mensajes:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!newMessage.trim() || sending) return;
    
    console.log('📤 Cliente enviando mensaje...', {
      type,
      id,
      customerName,
      customerEmail,
      content: newMessage.trim().substring(0, 50)
    });
    
    try {
      setSending(true);
      let result;
      if (type === "booking") {
        result = await sendMessagePublic(id, customerEmail, newMessage.trim());
      } else {
        result = await sendOrderMessagePublic(id, {
          content: newMessage.trim(),
          customerName,
          customerEmail
        });
      }
      console.log('✅ Mensaje enviado:', result);
      setNewMessage("");
      await loadMessages();
    } catch (err) {
      console.error("❌ Error enviando mensaje:", err);
      console.error("Error completo:", err.response || err);
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
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-2xl flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900">💬 Chat con la Tienda</h3>
            <p className="text-xs text-slate-600 mt-1">
              {type === "booking" ? "Reserva" : "Pedido"} #{id.slice(-6)}
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
              <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
              <p className="text-sm text-slate-500 mt-2">Cargando mensajes...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">💬</div>
              <p className="text-sm text-slate-500">Sin mensajes aún</p>
              <p className="text-xs text-slate-400 mt-1">Escribe un mensaje para iniciar la conversación</p>
            </div>
          ) : (
            messages.map(msg => (
              <div key={msg._id} className={`flex ${msg.senderType === 'owner' ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[75%] rounded-xl px-4 py-2 shadow-sm ${
                  msg.senderType === 'owner' 
                    ? 'bg-white text-slate-900 border border-slate-200' 
                    : 'bg-blue-600 text-white'
                }`}>
                  {msg.senderType === 'owner' && (
                    <p className="text-xs font-semibold mb-1 opacity-70">Tienda</p>
                  )}
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  <p className={`text-xs mt-1 ${msg.senderType === 'owner' ? 'text-slate-500' : 'text-blue-100'}`}>
                    {new Date(msg.createdAt).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))
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
              className="flex-1 px-4 py-2 border border-slate-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-100"
            />
            <button
              onClick={handleSend}
              disabled={!newMessage.trim() || sending}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed self-end"
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
