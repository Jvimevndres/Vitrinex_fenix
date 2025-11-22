import { useState, useEffect, useRef } from 'react';
import { 
  getBookingMessages, 
  sendMessage, 
  getBookingMessagesPublic, 
  sendMessagePublic,
  getOrderMessages,
  sendOrderMessage,
  sendOrderMessagePublic,
  getOrderMessagesPublic
} from '../api/messages';

/**
 * ChatBox - Componente de chat para comunicación owner-cliente
 * @param {Object} props
 * @param {string} props.bookingId - ID de la reserva (opcional si orderId está presente)
 * @param {string} props.orderId - ID de la orden (opcional si bookingId está presente)
 * @param {string} props.userType - "owner" o "customer"
 * @param {string} props.userEmail - Email del usuario (requerido si userType="customer")
 * @param {Object} props.bookingInfo - Información adicional de la reserva (opcional)
 * @param {Function} props.onClose - Callback para cerrar el chat
 */
export default function ChatBox({ bookingId, orderId, userType = 'customer', userEmail, bookingInfo, onClose }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  const chatType = bookingId ? 'booking' : 'order';
  const chatId = bookingId || orderId;

  // Scroll automático al final cuando hay nuevos mensajes
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Cargar mensajes
  useEffect(() => {
    loadMessages();
    // Polling cada 5 segundos para nuevos mensajes
    const interval = setInterval(loadMessages, 5000);
    return () => clearInterval(interval);
  }, [chatId, chatType, userType, userEmail]);

  const loadMessages = async () => {
    try {
      let data;
      if (chatType === 'booking') {
        if (userType === 'owner') {
          data = await getBookingMessages(bookingId);
        } else {
          data = await getBookingMessagesPublic(bookingId, userEmail);
        }
      } else {
        // Order
        if (userType === 'owner') {
          data = await getOrderMessages(orderId);
        } else {
          data = await getOrderMessagesPublic(orderId, userEmail);
        }
      }
      setMessages(data);
      setError(null);
    } catch (err) {
      console.error('Error cargando mensajes:', err);
      setError(err.response?.data?.message || 'Error al cargar mensajes');
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    if (newMessage.length > 1000) {
      setError('El mensaje no puede exceder 1000 caracteres');
      return;
    }

    setSending(true);
    setError(null);

    try {
      console.log('📤 Enviando mensaje...', { userType, chatType, chatId, userEmail });
      let sentMessage;
      
      if (chatType === 'booking') {
        if (userType === 'owner') {
          sentMessage = await sendMessage(bookingId, newMessage.trim());
        } else {
          if (!userEmail) {
            throw new Error('Email del cliente requerido');
          }
          sentMessage = await sendMessagePublic(bookingId, userEmail, newMessage.trim());
        }
      } else {
        // Order
        if (userType === 'owner') {
          sentMessage = await sendOrderMessage(orderId, newMessage.trim());
        } else {
          if (!userEmail) {
            throw new Error('Email del cliente requerido');
          }
          sentMessage = await sendOrderMessagePublic(orderId, {
            content: newMessage.trim(),
            customerEmail: userEmail
          });
        }
      }
      
      console.log('✅ Mensaje enviado:', sentMessage);
      setMessages(prev => [...prev, sentMessage]);
      setNewMessage('');
      
      // ✅ Refrescar contador de mensajes en header inmediatamente
      if (window.refreshMessagesAndNotifications) {
        window.refreshMessagesAndNotifications();
      }
    } catch (err) {
      console.error('❌ Error enviando mensaje:', err);
      console.error('Error response:', err.response?.data);
      setError(err.response?.data?.message || 'Error al enviar mensaje');
    } finally {
      setSending(false);
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleString('es-ES', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl h-[600px] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold">
                {userType === 'owner' ? '💬 Chat con Cliente' : '💬 Chat con la Tienda'}
              </h3>
              {bookingInfo && (
                <div className="text-sm text-blue-100 mt-1">
                  {bookingInfo.service?.name || 'Servicio'} • {new Date(bookingInfo.date).toLocaleDateString('es-ES')} • {bookingInfo.slot}
                  {userType === 'owner' && (
                    <div className="mt-1">
                      <strong>{bookingInfo.customerName}</strong> • {bookingInfo.customerEmail}
                    </div>
                  )}
                </div>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-red-200 text-2xl leading-none"
            >
              ×
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <svg className="w-16 h-16 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p className="text-sm">No hay mensajes aún</p>
              <p className="text-xs mt-1">Escribe algo para iniciar la conversación</p>
            </div>
          ) : (
            <>
              {messages.map((msg) => {
                const isOwnMessage = userType === 'owner' 
                  ? msg.senderType === 'owner' 
                  : msg.senderType === 'customer';

                return (
                  <div
                    key={msg._id}
                    className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg px-4 py-2 ${
                        isOwnMessage
                          ? 'bg-blue-600 text-white rounded-br-none'
                          : 'bg-white text-gray-800 shadow-sm rounded-bl-none'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                      <div
                        className={`text-xs mt-1 ${
                          isOwnMessage ? 'text-blue-100' : 'text-gray-500'
                        }`}
                      >
                        {formatTime(msg.createdAt)}
                        {isOwnMessage && msg.isRead && ' • Leído'}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="px-4 py-2 bg-red-50 border-t border-red-200">
            <p className="text-sm text-red-600">⚠️ {error}</p>
          </div>
        )}

        {/* Input Area */}
        <form onSubmit={handleSend} className="p-4 border-t bg-white rounded-b-lg">
          <div className="flex gap-2">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Escribe tu mensaje..."
              className="flex-1 resize-none border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows="2"
              disabled={sending}
              maxLength={1000}
            />
            <button
              type="submit"
              disabled={sending || !newMessage.trim()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {sending ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                'Enviar'
              )}
            </button>
          </div>
          <div className="text-xs text-gray-500 mt-1 text-right">
            {newMessage.length}/1000
          </div>
        </form>
      </div>
    </div>
  );
}
