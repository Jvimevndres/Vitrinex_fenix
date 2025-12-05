// frontend/src/components/CustomerChatModal.jsx
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { 
  getBookingMessagesPublic, 
  sendMessagePublic,
  getOrderMessagesPublic,
  sendOrderMessagePublic 
} from "../api/messages";
import { useAuth } from "../context/AuthContext";
import { FaComments } from 'react-icons/fa';

export default function CustomerChatModal({ 
  type, // "order" | "booking"
  id, // orderId | bookingId
  customerEmail,
  customerName,
  store, // Datos de la tienda
  onClose 
}) {
  const { user } = useAuth(); // ✅ Obtener usuario autenticado
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  // ✅ Email efectivo: prioridad booking.customerEmail, luego user.email
  const effectiveEmail = customerEmail?.trim() || user?.email?.trim() || "";

  useEffect(() => {
    loadMessages();
    // Polling cada 3 segundos
    const interval = setInterval(loadMessages, 3000);
    return () => clearInterval(interval);
  }, [id, effectiveEmail]); // ✅ Recargar si cambia el email efectivo

  useEffect(() => {
    // Scroll automático al final cuando cambien los mensajes
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadMessages = async () => {
    try {
      let data;
      if (type === "booking") {
        if (!effectiveEmail) {
          console.error("⚠️ No hay email disponible (ni en booking ni en usuario)");
          setMessages([]);
          return;
        }
        data = await getBookingMessagesPublic(id, effectiveEmail);
      } else {
        // Para orders, usar el endpoint público
        if (!effectiveEmail) {
          console.error("⚠️ No hay email disponible para cargar mensajes del pedido");
          setMessages([]);
          return;
        }
        data = await getOrderMessagesPublic(id, effectiveEmail);
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
    
    // ✅ Validar email efectivo para bookings
    if (type === "booking" && !effectiveEmail) {
      alert("No se puede enviar mensajes sin un email válido. Por favor contacta directamente a la tienda.");
      return;
    }
    
    try {
      setSending(true);
      let result;
      if (type === "booking") {
        result = await sendMessagePublic(id, effectiveEmail, newMessage.trim());
      } else {
        result = await sendOrderMessagePublic(id, {
          content: newMessage.trim(),
          customerName,
          customerEmail
        });
      }
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
        <div className="p-4 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-2xl flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 flex items-center gap-2"><FaComments /> Chat con la Tienda</h3>
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
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-slate-50 to-slate-100">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
              <p className="text-sm text-slate-500 mt-2">Cargando mensajes...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-8">
              <FaComments className="text-4xl mb-2 text-slate-400 mx-auto" />
              <p className="text-sm text-slate-500">Sin mensajes aún</p>
              <p className="text-xs text-slate-400 mt-1">Escribe un mensaje para iniciar la conversación</p>
            </div>
          ) : (
            <>
              {messages.map(msg => (
                <div key={msg._id} className={`flex gap-3 ${msg.senderType === 'owner' ? 'justify-start' : 'justify-end'}`}>
                  {/* Avatar izquierda (Tienda) */}
                  {msg.senderType === 'owner' && (
                    <button 
                      onClick={() => store?._id && navigate(`/tienda/${store._id}`)}
                      className="flex-shrink-0 hover:scale-110 transition-transform cursor-pointer"
                      title="Ver perfil de la tienda"
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md">
                        🏪
                      </div>
                    </button>
                  )}

                  {/* Burbuja de mensaje */}
                  <div className={`max-w-[70%] rounded-2xl px-4 py-3 shadow-lg ${
                    msg.senderType === 'owner' 
                      ? 'bg-white text-slate-900 border border-slate-200 rounded-tl-sm' 
                      : 'bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-tr-sm'
                  }`}>
                    {msg.senderType === 'owner' && (
                      <p className="text-xs font-bold mb-1 text-blue-600">Tienda</p>
                    )}
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <p className={`text-xs ${msg.senderType === 'owner' ? 'text-slate-400' : 'text-blue-100'}`}>
                        {new Date(msg.createdAt).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      {msg.senderType !== 'owner' && (
                        <span className="text-xs text-blue-100">✓</span>
                      )}
                    </div>
                  </div>

                  {/* Avatar derecha (Cliente) */}
                  {msg.senderType !== 'owner' && (
                    <button 
                      onClick={() => user?._id && navigate(`/usuario/${user._id}`)}
                      className="flex-shrink-0 hover:scale-110 transition-transform cursor-pointer"
                      title="Ver mi perfil"
                    >
                      {user?.avatarUrl ? (
                        <img 
                          src={user.avatarUrl} 
                          alt={user.name} 
                          className="w-10 h-10 rounded-full object-cover shadow-md border-2 border-blue-200"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white font-bold shadow-md">
                          {(customerName || user?.name || 'C').charAt(0).toUpperCase()}
                        </div>
                      )}
                    </button>
                  )}
                </div>
              ))}
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
                  alt={user.name} 
                  className="w-10 h-10 rounded-full object-cover shadow-md border-2 border-slate-200"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white font-bold shadow-md">
                  {(customerName || user?.name || 'C').charAt(0).toUpperCase()}
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
                className="flex-1 px-4 py-3 border border-slate-300 rounded-xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-100 transition-all"
              />
              <button
                onClick={handleSend}
                disabled={!newMessage.trim() || sending}
                className="px-5 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-medium hover:from-blue-700 hover:to-blue-800 transition-all disabled:from-slate-300 disabled:to-slate-300 disabled:cursor-not-allowed self-end shadow-lg hover:shadow-xl disabled:shadow-none flex items-center justify-center min-w-[60px]"
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
