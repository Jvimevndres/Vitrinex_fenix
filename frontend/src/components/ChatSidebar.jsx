import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { listMyStores, listStoreOrders } from '../api/store';
import { getBookingsWithMessages } from '../api/messages';
import axios from '../api/axios';
import { FaComments, FaStore, FaUser, FaUsers, FaTimes, FaChevronRight } from 'react-icons/fa';

export default function ChatSidebar() {
  // ✅ Todos los hooks al inicio en el orden correcto
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const pollingIntervalRef = useRef(null);
  const messagesEndRef = useRef(null);
  const chatPollingRef = useRef(null);
  
  const [isOpen, setIsOpen] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [userStores, setUserStores] = useState([]);
  const [readMessages, setReadMessages] = useState(new Set());
  const [activeChatModal, setActiveChatModal] = useState(null); // Para el modal de chat tipo burbuja
  const [chatMessages, setChatMessages] = useState([]); // Mensajes del chat activo
  const [newMessage, setNewMessage] = useState(''); // Input del mensaje
  const [loadingChat, setLoadingChat] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);

  // ✅ Funciones auxiliares con useCallback para memo  ización correcta
  const loadCustomerMessages = useCallback(async () => {
    if (!user?.email) return [];

    try {
      const customerConversations = [];

      try {
        const bookingsResponse = await axios.get('/stores/bookings/my-bookings', {
          params: { email: user.email }
        });

        const bookings = Array.isArray(bookingsResponse.data) ? bookingsResponse.data : [];
        bookings
          .filter(b => b.unreadMessagesCustomer > 0 || b.lastMessageAt)
          .forEach(booking => {
            customerConversations.push({
              id: `customer-booking-${booking._id}`,
              bookingId: booking._id,
              storeId: booking.store?._id,
              storeName: booking.store?.name || 'Negocio',
              storeLogo: booking.store?.logoUrl,
              serviceName: booking.service?.name || booking.serviceName,
              lastMessage: 'Ver conversación',
              unreadCount: booking.unreadMessagesCustomer || 0,
              timestamp: booking.lastMessageAt || booking.createdAt,
              isOwner: false,
              type: 'customer',
              itemType: 'booking',
              bookingDate: booking.date,
              bookingSlot: booking.slot
            });
          });
      } catch (err) {
        console.error('Error loading customer bookings:', err);
      }

      try {
        const ordersResponse = await axios.get('/stores/orders/my-orders', {
          params: { email: user.email }
        });

        const orders = Array.isArray(ordersResponse.data) ? ordersResponse.data : [];
        orders
          .filter(o => o.unreadMessagesCustomer > 0 || o.lastMessageAt)
          .forEach(order => {
            customerConversations.push({
              id: `customer-order-${order._id}`,
              orderId: order._id,
              storeId: order.store?._id,
              storeName: order.store?.name || 'Negocio',
              storeLogo: order.store?.logoUrl,
              serviceName: `Pedido #${order._id.slice(-6)}`,
              lastMessage: 'Ver conversación',
              unreadCount: order.unreadMessagesCustomer || 0,
              timestamp: order.lastMessageAt || order.createdAt,
              isOwner: false,
              type: 'customer',
              itemType: 'order',
              orderTotal: order.total,
              orderItems: order.items?.length || 0
            });
          });
      } catch (err) {
        console.error('Error loading customer orders:', err);
      }

      customerConversations.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      return customerConversations;
    } catch (error) {
      console.error('Error loading customer messages:', error);
      return [];
    }
  }, [user?.email]);

  const loadUserConversations = useCallback(async () => {
    if (!user?._id) return [];

    try {
      const { data } = await axios.get('/user-conversations');
      const conversations = Array.isArray(data) ? data : [];

      return conversations.map(conv => ({
        id: `user-chat-${conv.userId}`,
        userId: conv.userId,
        userName: conv.username || conv.email,
        avatar: conv.avatar,
        lastMessage: conv.lastMessage || 'Ver conversación',
        unreadCount: conv.unreadCount || 0,
        timestamp: conv.lastMessageAt,
        isOwner: false,
        type: 'user-chat',
        itemType: 'user'
      }));
    } catch (err) {
      console.error('Error loading user conversations:', err);
      return [];
    }
  }, [user?._id]);

  const loadMessages = useCallback(async (stores) => {
    try {
      setLoadingMessages(true);
      const allConversations = [];

      // Cargar mensajes como dueño
      if (stores && stores.length > 0) {
        for (const store of stores) {
          try {
            const { data: bookings } = await getBookingsWithMessages(store._id);
            const safeBookings = bookings || [];

            safeBookings.forEach(booking => {
              allConversations.push({
                id: `owner-booking-${booking._id}`,
                bookingId: booking._id,
                storeId: store._id,
                storeName: store.name,
                customerName: booking.customerName || booking.customerEmail,
                lastMessage: booking.unreadMessagesOwner > 0
                  ? `${booking.unreadMessagesOwner} mensaje${booking.unreadMessagesOwner > 1 ? 's' : ''} nuevo${booking.unreadMessagesOwner > 1 ? 's' : ''}`
                  : 'Ver conversación',
                unreadCount: booking.unreadMessagesOwner || 0,
                timestamp: booking.lastMessageAt || booking.createdAt,
                isOwner: true,
                type: 'owner',
                itemType: 'booking',
                serviceName: booking.service?.name || booking.serviceName
              });
            });

            if (store.mode === 'products') {
              try {
                const { data: orders } = await listStoreOrders(store._id);
                const safeOrders = orders || [];
                safeOrders
                  .filter(order => order.unreadMessagesOwner > 0 || order.lastMessageAt)
                  .forEach(order => {
                    allConversations.push({
                      id: `owner-order-${order._id}`,
                      orderId: order._id,
                      storeId: store._id,
                      storeName: store.name,
                      customerName: order.customerName || order.customerEmail,
                      lastMessage: 'Ver conversación',
                      unreadCount: order.unreadMessagesOwner || 0,
                      timestamp: order.lastMessageAt || order.createdAt,
                      isOwner: true,
                      type: 'owner',
                      itemType: 'order',
                      orderTotal: order.total,
                      orderStatus: order.status
                    });
                  });
              } catch (err) {
                console.error(`Error loading orders for store ${store._id}:`, err);
              }
            }
          } catch (err) {
            console.error(`Error loading messages for store ${store._id}:`, err);
          }
        }
      }

      // Cargar mensajes como cliente
      const customerConvs = await loadCustomerMessages();
      allConversations.push(...customerConvs);

      // Cargar conversaciones usuario-usuario
      const userConvs = await loadUserConversations();
      allConversations.push(...userConvs);

      const sortedConversations = allConversations.sort((a, b) => {
        if (a.unreadCount !== b.unreadCount) {
          return b.unreadCount - a.unreadCount;
        }
        return new Date(b.timestamp) - new Date(a.timestamp);
      });
      setConversations(sortedConversations);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoadingMessages(false);
    }
  }, [loadCustomerMessages, loadUserConversations]);

  // ✅ Función para cargar mensajes de un chat específico
  const loadChatMessages = useCallback(async (userId, skipScroll = false) => {
    try {
      setLoadingChat(true);
      const { data } = await axios.get(`/public/users/${userId}/messages`);
      
      // Solo actualizar si hay cambios
      setChatMessages(prev => {
        if (JSON.stringify(prev) === JSON.stringify(data)) {
          return prev; // No hay cambios, mantener el estado anterior
        }
        return data || [];
      });
      
      // Scroll al final solo si no es polling o es la primera carga
      if (!skipScroll) {
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    } catch (error) {
      console.error('Error loading chat messages:', error);
      setChatMessages([]);
    } finally {
      setLoadingChat(false);
    }
  }, []);

  // ✅ Función para enviar mensaje
  const sendMessage = async () => {
    if (!newMessage.trim() || !activeChatModal || sendingMessage) return;

    try {
      setSendingMessage(true);
      const { data } = await axios.post(`/public/users/${activeChatModal.userId}/messages`, {
        content: newMessage.trim()
      });

      setChatMessages(prev => [...prev, data]);
      setNewMessage('');
      
      // Scroll al final
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Error al enviar el mensaje');
    } finally {
      setSendingMessage(false);
    }
  };

  // ✅ useEffects después de las funciones
  useEffect(() => {
    if (user?._id) {
      const stored = localStorage.getItem(`readMessages_${user._id}`);
      if (stored) {
        setReadMessages(new Set(JSON.parse(stored)));
      }
    }
  }, [user?._id]);

  useEffect(() => {
    if (user?._id && readMessages.size > 0) {
      localStorage.setItem(`readMessages_${user._id}`, JSON.stringify([...readMessages]));
    }
  }, [readMessages, user?._id]);

  useEffect(() => {
    if (!isAuthenticated || !user?._id) {
      setConversations([]);
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
      return;
    }

    const loadData = async () => {
      try {
        const { data: stores } = await listMyStores();
        setUserStores(stores || []);
        await loadMessages(stores || []);
      } catch (error) {
        console.error('Error loading messages:', error);
      }
    };

    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    loadData();
    pollingIntervalRef.current = setInterval(loadData, 10000);

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [isAuthenticated, user?._id, loadMessages]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
      if (e.key === 'Escape' && activeChatModal) {
        setActiveChatModal(null);
        setChatMessages([]);
      }
    };
    
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, activeChatModal]);

  // ✅ Polling de mensajes del chat activo
  useEffect(() => {
    if (!activeChatModal?.userId) {
      if (chatPollingRef.current) {
        clearInterval(chatPollingRef.current);
        chatPollingRef.current = null;
      }
      return;
    }

    loadChatMessages(activeChatModal.userId, false);

    chatPollingRef.current = setInterval(() => {
      loadChatMessages(activeChatModal.userId, true); // skipScroll en polling
    }, 5000); // Actualizar cada 5 segundos

    return () => {
      if (chatPollingRef.current) {
        clearInterval(chatPollingRef.current);
        chatPollingRef.current = null;
      }
    };
  }, [activeChatModal?.userId, loadChatMessages]);

  // ✅ Detectar apertura de chat desde otra página (ej: perfil)
  useEffect(() => {
    const checkOpenChat = () => {
      const openChatData = localStorage.getItem('openChatWithUser');
      if (openChatData) {
        try {
          const userData = JSON.parse(openChatData);
          // Abrir el sidebar y el chat con este usuario
          setIsOpen(true);
          setActiveChatModal({
            userId: userData.userId,
            userName: userData.username,
            avatar: userData.avatar,
            type: 'user-chat'
          });
          // Limpiar el localStorage
          localStorage.removeItem('openChatWithUser');
        } catch (error) {
          console.error('Error parsing openChatWithUser:', error);
          localStorage.removeItem('openChatWithUser');
        }
      }
    };

    // Verificar al montar el componente
    checkOpenChat();

    // Escuchar cambios en el storage (en caso de que se actualice desde otra pestaña)
    window.addEventListener('storage', checkOpenChat);
    
    return () => {
      window.removeEventListener('storage', checkOpenChat);
    };
  }, []);


  // ✅ Funciones de manejo
  const markMessageAsRead = (messageId) => {
    setReadMessages(prev => new Set([...prev, messageId]));
  };

  const markAllMessagesAsRead = () => {
    const allIds = conversations.map(c => c.id);
    setReadMessages(new Set(allIds));
  };

  const handleConversationClick = (conv) => {
    if (conv.type === 'user-chat') {
      // Abrir modal de chat tipo burbuja
      setActiveChatModal(conv);
      setIsOpen(false);
      setChatMessages([]);
      setNewMessage('');
      return;
    }

    if (conv.isOwner) {
      if (conv.itemType === 'order') {
        navigate(`/negocio/${conv.storeId}?tab=ventas&panel=orders`);
      } else {
        navigate(`/negocio/${conv.storeId}`);
      }
    } else {
      if (conv.itemType === 'order' && conv.storeId) {
        navigate(`/tiendas/${conv.storeId}`);
      } else {
        navigate('/perfil?tab=reservas');
      }
    }
    setIsOpen(false);
  };

  const handleConversationClickInternal = (conv) => {
    markMessageAsRead(conv.id);
    setIsOpen(false);
    handleConversationClick(conv);
  };

  const unreadMessages = conversations.filter(c => !readMessages.has(c.id)).length;

  if (!isAuthenticated) return null;

  return (
    <>
      {/* Botón flotante - posición igual que chatbot */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 left-6 z-[998] w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 group"
        title="Mensajes"
        style={{ boxShadow: '0 10px 40px rgba(99, 102, 241, 0.4)' }}
      >
        <FaComments className="text-white text-xl" />
        {unreadMessages > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[22px] h-[22px] rounded-full bg-red-500 flex items-center justify-center text-[11px] font-bold text-white shadow-lg animate-pulse border-2 border-white">
            {unreadMessages}
          </span>
        )}
      </button>

      {/* Panel lateral */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[997]"
            onClick={() => setIsOpen(false)}
          />

          <div className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-[400px] bg-white shadow-2xl z-[998] flex flex-col animate-slideInLeft">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FaComments className="text-2xl" />
                <div>
                  <h3 className="font-bold text-xl">Mensajes</h3>
                  <p className="text-sm text-indigo-100">
                    {unreadMessages > 0 ? `${unreadMessages} sin leer` : 'Todo al día'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-10 h-10 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                <FaTimes className="text-xl" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {loadingMessages ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
              ) : conversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400 px-6">
                  <FaComments className="text-6xl mb-4 opacity-30" />
                  <p className="text-center text-sm">No tienes conversaciones activas</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {conversations.map((conv) => {
                    const isUnread = !readMessages.has(conv.id);
                    
                    return (
                      <button
                        key={conv.id}
                        onClick={() => handleConversationClickInternal(conv)}
                        className={`w-full text-left p-4 hover:bg-indigo-50 transition-colors flex items-start gap-3 ${
                          isUnread ? 'bg-indigo-50/50' : ''
                        }`}
                      >
                        <div className="flex-shrink-0">
                          {conv.type === 'user-chat' ? (
                            conv.avatar ? (
                              <img src={conv.avatar} alt="" className="w-12 h-12 rounded-full object-cover" />
                            ) : (
                              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center">
                                <FaUser className="text-white text-lg" />
                              </div>
                            )
                          ) : conv.storeLogo ? (
                            <img src={conv.storeLogo} alt="" className="w-12 h-12 rounded-full object-cover" />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center">
                              <FaStore className="text-white text-lg" />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-1">
                            <h4 className={`font-semibold text-sm truncate ${isUnread ? 'text-indigo-900' : 'text-gray-900'}`}>
                              {conv.type === 'user-chat' ? conv.userName : 
                               conv.isOwner ? conv.customerName : conv.storeName}
                            </h4>
                            {isUnread && (
                              <span className="flex-shrink-0 w-2 h-2 rounded-full bg-indigo-600 ml-2 mt-1"></span>
                            )}
                          </div>
                          
                          <p className="text-xs text-gray-500 mb-1">
                            {conv.serviceName || conv.storeName}
                          </p>
                          
                          <p className={`text-xs truncate ${isUnread ? 'text-indigo-700 font-medium' : 'text-gray-500'}`}>
                            {conv.lastMessage}
                          </p>

                          {conv.unreadCount > 0 && (
                            <div className="flex items-center gap-2 mt-2">
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                                {conv.unreadCount} nuevo{conv.unreadCount > 1 ? 's' : ''}
                              </span>
                            </div>
                          )}
                        </div>

                        <FaChevronRight className="text-gray-400 text-sm flex-shrink-0 mt-1" />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {conversations.length > 0 && unreadMessages > 0 && (
              <div className="border-t border-gray-200 p-4">
                <button
                  onClick={markAllMessagesAsRead}
                  className="w-full py-2.5 px-4 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium text-sm transition-all shadow-md hover:shadow-lg"
                >
                  Marcar todo como leído
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* Modal de chat tipo burbuja - similar al chatbot */}
      {activeChatModal && (
        <div className="fixed bottom-6 right-6 z-[1000] w-[400px] h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col animate-slideInUp">
          {/* Header del chat - clickeable para ir al perfil */}
          <div 
            onClick={() => navigate(`/usuario/${activeChatModal.userId}`)}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-4 rounded-t-2xl flex items-center justify-between cursor-pointer hover:from-indigo-600 hover:to-purple-700 transition-all"
            title="Ver perfil"
          >
            <div className="flex items-center gap-3">
              {activeChatModal.avatar ? (
                <img 
                  src={activeChatModal.avatar} 
                  alt={activeChatModal.userName} 
                  className="w-10 h-10 rounded-full object-cover border-2 border-white/30" 
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center border-2 border-white/30">
                  <FaUser className="text-white text-lg" />
                </div>
              )}
              <div>
                <h3 className="font-bold text-sm">{activeChatModal.userName || 'Usuario'}</h3>
                <p className="text-xs text-indigo-100 flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  Click para ver perfil
                </p>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActiveChatModal(null);
                setChatMessages([]);
                setNewMessage('');
              }}
              className="w-8 h-8 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors"
            >
              <FaTimes className="text-lg" />
            </button>
          </div>

          {/* Área de mensajes */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
            {loadingChat ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
              </div>
            ) : chatMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <FaComments className="text-5xl mb-3 opacity-30" />
                <p className="text-sm text-center">No hay mensajes aún<br/>¡Envía el primero!</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {chatMessages.map((msg, index) => {
                  const isMyMessage = msg.fromUser._id === user._id;
                  
                  return (
                    <div key={msg._id || index} className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-sm ${
                        isMyMessage 
                          ? 'bg-gradient-to-r from-indigo-500 to-purple-600 rounded-tr-none' 
                          : 'bg-white rounded-tl-none'
                      }`}>
                        <p className={`text-sm ${isMyMessage ? 'text-white' : 'text-gray-800'}`}>
                          {msg.content}
                        </p>
                        <span className={`text-xs mt-1 block ${
                          isMyMessage ? 'text-indigo-100' : 'text-gray-400'
                        }`}>
                          {new Date(msg.createdAt).toLocaleTimeString('es-ES', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input de mensaje */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder="Escribe un mensaje..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                disabled={sendingMessage}
              />
              <button 
                onClick={sendMessage}
                disabled={!newMessage.trim() || sendingMessage}
                className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 rounded-full flex items-center justify-center transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sendingMessage ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
