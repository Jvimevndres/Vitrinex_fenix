import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from '../api/axios';
import ChatBox from './ChatBox';

/**
 * CustomerPurchasesList - Lista de reservas Y órdenes del cliente con acceso a chat
 */
export default function CustomerPurchasesList() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('bookings'); // bookings | orders
  const [filter, setFilter] = useState('upcoming'); // upcoming | past | all

  // Chat state
  const [chatOpen, setChatOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [chatType, setChatType] = useState('booking'); // booking | order

  useEffect(() => {
    if (user?.email) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    await Promise.all([loadBookings(), loadOrders()]);
  };

  const loadBookings = async () => {
    if (!user?.email) {
      setError('Usuario no autenticado');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');
      console.log('📋 Cargando reservas para:', user.email);
      
      const response = await axios.get('/stores/bookings/my-bookings', {
        params: { email: user.email }
      });
      
      console.log(`✅ ${response.data.length} reservas cargadas`);
      setBookings(response.data || []);
    } catch (err) {
      console.error('❌ Error cargando reservas:', err);
      setError(err.response?.data?.message || 'No se pudieron cargar las reservas');
    } finally {
      setLoading(false);
    }
  };

  const loadOrders = async () => {
    if (!user?.email) return;

    try {
      console.log('🛒 Cargando órdenes para:', user.email);
      
      const response = await axios.get('/stores/orders/my-orders', {
        params: { email: user.email }
      });
      
      console.log(`✅ ${response.data.length} órdenes cargadas`);
      setOrders(response.data || []);
    } catch (err) {
      console.error('❌ Error cargando órdenes:', err);
    }
  };

  const openBookingChat = (booking) => {
    console.log('💬 Abriendo chat de reserva:', booking._id);
    setSelectedItem(booking);
    setChatType('booking');
    setChatOpen(true);
  };

  const openOrderChat = (order) => {
    console.log('💬 Abriendo chat de orden:', order._id);
    setSelectedItem(order);
    setChatType('order');
    setChatOpen(true);
  };

  const closeChat = () => {
    setChatOpen(false);
    setSelectedItem(null);
    // Recargar para actualizar contadores
    loadData();
  };

  const filteredBookings = bookings.filter((booking) => {
    const bookingDate = new Date(booking.date);
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    if (filter === 'upcoming') return bookingDate >= now;
    if (filter === 'past') return bookingDate < now;
    return true;
  });

  const filteredOrders = orders.filter((order) => {
    const orderDate = new Date(order.createdAt);
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    if (filter === 'upcoming') return order.status !== 'fulfilled' && order.status !== 'cancelled';
    if (filter === 'past') return order.status === 'fulfilled' || order.status === 'cancelled';
    return true;
  });

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateStr) => {
    return new Date(dateStr).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800' },
      confirmed: { label: 'Confirmada', color: 'bg-blue-100 text-blue-800' },
      fulfilled: { label: 'Completada', color: 'bg-green-100 text-green-800' },
      cancelled: { label: 'Cancelada', color: 'bg-red-100 text-red-800' },
    };

    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex space-x-8">
          <button
            onClick={() => setActiveTab('bookings')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'bookings'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            📅 Reservas ({bookings.length})
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'orders'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            🛒 Pedidos ({orders.length})
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter('upcoming')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'upcoming'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {activeTab === 'bookings' ? 'Próximas' : 'Activas'}
        </button>
        <button
          onClick={() => setFilter('past')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'past'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {activeTab === 'bookings' ? 'Pasadas' : 'Completadas'}
        </button>
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Todas
        </button>
      </div>

      {/* Lista de Reservas */}
      {activeTab === 'bookings' && (
        <div className="space-y-4">
          {filteredBookings.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-500">
                {filter === 'upcoming'
                  ? 'No tienes reservas próximas'
                  : filter === 'past'
                  ? 'No tienes reservas pasadas'
                  : 'No tienes reservas'}
              </p>
            </div>
          ) : (
            filteredBookings.map((booking) => (
              <div
                key={booking._id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {booking.store?.logoUrl ? (
                        <img
                          src={booking.store.logoUrl}
                          alt={booking.store.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                          <span className="text-gray-400 text-xl">🏪</span>
                        </div>
                      )}
                      <div>
                        <h3 className="font-semibold text-lg text-gray-900">
                          {booking.store?.name || 'Tienda'}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {booking.service?.name || 'Servicio'}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 space-y-2 text-sm text-gray-600">
                      <p>
                        <span className="font-medium">📅 Fecha:</span>{' '}
                        {formatDate(booking.date)}
                      </p>
                      <p>
                        <span className="font-medium">🕐 Hora:</span> {booking.slot}
                      </p>
                      {booking.service?.duration && (
                        <p>
                          <span className="font-medium">⏱️ Duración:</span>{' '}
                          {booking.service.duration} min
                        </p>
                      )}
                      {booking.service?.price && (
                        <p>
                          <span className="font-medium">💰 Precio:</span> $
                          {booking.service.price.toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    {getStatusBadge(booking.status)}
                    <button
                      onClick={() => openBookingChat(booking)}
                      className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                      💬 Chat
                      {booking.unreadMessagesCustomer > 0 && (
                        <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {booking.unreadMessagesCustomer}
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Lista de Órdenes */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-500">
                {filter === 'upcoming'
                  ? 'No tienes pedidos activos'
                  : filter === 'past'
                  ? 'No tienes pedidos completados'
                  : 'No tienes pedidos'}
              </p>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <div
                key={order._id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {order.store?.logoUrl ? (
                        <img
                          src={order.store.logoUrl}
                          alt={order.store.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                          <span className="text-gray-400 text-xl">🏪</span>
                        </div>
                      )}
                      <div>
                        <h3 className="font-semibold text-lg text-gray-900">
                          {order.store?.name || 'Tienda'}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Pedido #{order._id.slice(-6)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 space-y-2 text-sm text-gray-600">
                      <p>
                        <span className="font-medium">📅 Fecha:</span>{' '}
                        {formatDateTime(order.createdAt)}
                      </p>
                      <p>
                        <span className="font-medium">📦 Productos:</span>{' '}
                        {order.items?.length || 0} artículo(s)
                      </p>
                      <p>
                        <span className="font-medium">💰 Total:</span> $
                        {order.total?.toLocaleString() || 0}
                      </p>
                      {order.items && order.items.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-gray-100">
                          <p className="font-medium text-gray-700 mb-1">Artículos:</p>
                          {order.items.map((item, idx) => (
                            <p key={idx} className="text-xs text-gray-500">
                              • {item.productName} x{item.quantity} - $
                              {item.subtotal?.toLocaleString()}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    {getStatusBadge(order.status)}
                    <button
                      onClick={() => openOrderChat(order)}
                      className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                      💬 Chat
                      {order.unreadMessagesCustomer > 0 && (
                        <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {order.unreadMessagesCustomer}
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Chat Modal */}
      {chatOpen && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                💬 Chat - {selectedItem.store?.name || 'Tienda'}
              </h3>
              <button
                onClick={closeChat}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="overflow-y-auto" style={{ maxHeight: 'calc(80vh - 100px)' }}>
              <ChatBox
                bookingId={chatType === 'booking' ? selectedItem._id : null}
                orderId={chatType === 'order' ? selectedItem._id : null}
                userEmail={user?.email}
                userType="customer"
                onClose={closeChat}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
