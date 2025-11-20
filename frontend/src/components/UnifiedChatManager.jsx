// frontend/src/components/UnifiedChatManager.jsx
import { useEffect, useState } from "react";
import { listStoreOrders } from "../api/store";
import { listStoreAppointments } from "../api/store";
import { getOrderMessages, sendOrderMessage } from "../api/messages";
import { getBookingMessages, sendMessage } from "../api/messages";

export default function UnifiedChatManager({ storeId, storeMode }) {
  const [activeTab, setActiveTab] = useState(storeMode === "products" ? "orders" : "bookings");
  const [orders, setOrders] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConversations();
  }, [storeId, activeTab]);

  const loadConversations = async () => {
    try {
      setLoading(true);
      if (activeTab === "orders") {
        const { data } = await listStoreOrders(storeId);
        setOrders(Array.isArray(data) ? data : []);
      } else {
        const { data } = await listStoreAppointments(storeId);
        setBookings(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Error cargando conversaciones:", err);
    } finally {
      setLoading(false);
    }
  };

  const conversations = activeTab === "orders" 
    ? orders.map(o => ({
        id: o._id,
        type: "order",
        customerName: o.customerName,
        customerEmail: o.customerEmail,
        customerPhone: o.customerPhone,
        date: o.createdAt,
        status: o.status,
        details: `$${o.total?.toLocaleString('es-CL')} - ${o.items?.length || 0} productos`,
        data: o
      }))
    : bookings.map(b => ({
        id: b._id,
        type: "booking",
        customerName: b.customerName,
        customerEmail: b.customerEmail,
        customerPhone: b.customerPhone,
        date: b.date,
        status: b.status,
        details: `${b.slot || ''} - ${b.serviceName || b.service}`,
        data: b
      }));

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden" style={{ height: 'calc(100vh - 200px)' }}>
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <h2 className="text-xl font-bold text-slate-900 mb-3">💬 Mensajes</h2>
        
        {/* Tabs */}
        <div className="flex gap-2">
          {storeMode === "products" && (
            <button
              onClick={() => {
                setActiveTab("orders");
                setSelectedConversation(null);
              }}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === "orders"
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-white text-slate-700 hover:bg-slate-100"
              }`}
            >
              📦 Pedidos ({orders.length})
            </button>
          )}
          {storeMode === "bookings" && (
            <button
              onClick={() => {
                setActiveTab("bookings");
                setSelectedConversation(null);
              }}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === "bookings"
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-white text-slate-700 hover:bg-slate-100"
              }`}
            >
              📅 Reservas ({bookings.length})
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Lista de conversaciones */}
        <div className="w-80 border-r border-slate-200 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center">
              <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
              <p className="text-sm text-slate-500 mt-2">Cargando...</p>
            </div>
          ) : conversations.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-4xl mb-2">📭</div>
              <p className="text-sm text-slate-600 font-medium">Sin conversaciones</p>
              <p className="text-xs text-slate-500 mt-1">
                {activeTab === "orders" ? "Los pedidos aparecerán aquí" : "Las reservas aparecerán aquí"}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setSelectedConversation(conv)}
                  className={`w-full p-4 text-left hover:bg-slate-50 transition-colors ${
                    selectedConversation?.id === conv.id ? "bg-blue-50 border-l-4 border-blue-600" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="font-semibold text-slate-900">{conv.customerName}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      conv.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                      conv.status === "confirmed" ? "bg-green-100 text-green-800" :
                      conv.status === "fulfilled" || conv.status === "completed" ? "bg-blue-100 text-blue-800" :
                      "bg-red-100 text-red-800"
                    }`}>
                      {conv.status === "pending" ? "Pendiente" :
                       conv.status === "confirmed" ? "Confirmado" :
                       conv.status === "fulfilled" || conv.status === "completed" ? "Completado" :
                       "Cancelado"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mb-1">{conv.details}</p>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span>📅 {new Date(conv.date).toLocaleDateString('es-CL')}</span>
                    {conv.customerPhone && (
                      <span>📱 {conv.customerPhone}</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Área de chat */}
        <div className="flex-1 flex flex-col">
          {selectedConversation ? (
            <ChatArea conversation={selectedConversation} />
          ) : (
            <div className="flex-1 flex items-center justify-center bg-slate-50">
              <div className="text-center">
                <div className="text-6xl mb-4">💬</div>
                <p className="text-lg font-semibold text-slate-900 mb-2">Selecciona una conversación</p>
                <p className="text-sm text-slate-600">Elige un pedido o reserva para ver los mensajes</p>
              </div>
            </div>
          )}
        </div>
        </div>
      </div>
    </div>
  );
}

// Componente de área de chat
function ChatArea({ conversation }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    loadMessages();
    // Polling cada 3 segundos
    const interval = setInterval(loadMessages, 3000);
    return () => clearInterval(interval);
  }, [conversation.id]);

  const loadMessages = async () => {
    try {
      let data;
      if (conversation.type === "order") {
        const response = await getOrderMessages(conversation.id);
        data = response.data || response;
      } else {
        const response = await getBookingMessages(conversation.id);
        data = response.data || response;
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
    
    console.log('📤 Enviando mensaje...', {
      type: conversation.type,
      id: conversation.id,
      content: newMessage.trim().substring(0, 50)
    });
    
    try {
      setSending(true);
      let result;
      if (conversation.type === "order") {
        result = await sendOrderMessage(conversation.id, newMessage.trim());
      } else {
        result = await sendMessage(conversation.id, newMessage.trim());
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
    <>
      {/* Header del chat */}
      <div className="p-4 border-b border-slate-200 bg-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900">{conversation.customerName}</h3>
            <p className="text-sm text-slate-600">{conversation.details}</p>
          </div>
          <div className="flex items-center gap-2">
            {conversation.customerEmail && (
              <a
                href={`mailto:${conversation.customerEmail}`}
                className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200"
              >
                📧 Email
              </a>
            )}
            {conversation.customerPhone && (
              <a
                href={`https://wa.me/${conversation.customerPhone.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm hover:bg-green-200"
              >
                📱 WhatsApp
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Mensajes */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
        {/* Info */}
        <div className="text-center">
          <div className="inline-block bg-white border border-slate-200 rounded-lg px-4 py-2 text-xs text-slate-600">
            {conversation.type === "order" ? "Pedido" : "Reserva"} realizado el{" "}
            {new Date(conversation.date).toLocaleString('es-CL', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
        </div>

        {loading && (
          <div className="text-center py-8">
            <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
          </div>
        )}

        {!loading && messages.length === 0 && (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">💬</div>
            <p className="text-sm text-slate-500">Sin mensajes aún</p>
            <p className="text-xs text-slate-400 mt-1">Inicia la conversación</p>
          </div>
        )}

        {!loading && messages.map(msg => (
          <div key={msg._id} className={`flex ${msg.senderType === 'owner' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[75%] rounded-xl px-4 py-2 shadow-sm ${
              msg.senderType === 'owner' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white text-slate-900 border border-slate-200'
            }`}>
              {msg.senderType === 'customer' && msg.senderName && (
                <p className="text-xs font-semibold mb-1 opacity-70">{msg.senderName}</p>
              )}
              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              <p className={`text-xs mt-1 ${msg.senderType === 'owner' ? 'text-blue-100' : 'text-slate-500'}`}>
                {new Date(msg.createdAt).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}
                {msg.isRead && msg.senderType === 'owner' && ' · ✓✓'}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-slate-200 bg-white">
        <div className="flex gap-2">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Escribe un mensaje..."
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
      </div>
    </>
  );
}
