import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from '../api/axios';
import ChatBox from './ChatBox';

/**
 * CustomerBookingsList - Lista de reservas del cliente con acceso a chat
 */
export default function CustomerBookingsList() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('upcoming'); // upcoming | past | all

  // Chat state
  const [chatOpen, setChatOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  useEffect(() => {
    if (user?.email) {
      loadBookings();
    }
  }, [user]);

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
      // Obtener todas las reservas del cliente por email
      const response = await axios.get('/stores/bookings/my-bookings', {
        params: { email: user.email }
      });
      console.log('✅ Reservas cargadas:', response.data);
      setBookings(response.data || []);
    } catch (err) {
      console.error('Error cargando reservas:', err);
      setError(err.response?.data?.message || 'No se pudieron cargar las reservas');
    } finally {
      setLoading(false);
    }
  };

  const openChat = (booking) => {
    console.log('💬 Abriendo chat:', { booking: booking._id, email: user?.email });
    setSelectedBooking(booking);
    setChatOpen(true);
  };

  const closeChat = () => {
    setChatOpen(false);
    setSelectedBooking(null);
    // Recargar para actualizar contadores
    loadBookings();
  };

  const filteredBookings = bookings.filter((booking) => {
    const bookingDate = new Date(booking.date);
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    if (filter === 'upcoming') return bookingDate >= now;
    if (filter === 'past') return bookingDate < now;
    return true;
  });

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('es-ES', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { label: '⏳ Pendiente', class: 'bg-amber-100 text-amber-700 border-amber-200' },
      confirmed: { label: '✅ Confirmada', class: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
      cancelled: { label: '❌ Cancelada', class: 'bg-rose-100 text-rose-700 border-rose-200' }
    };
    const badge = badges[status] || badges.pending;
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${badge.class}`}>
        {badge.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="bg-white/95 border border-violet-100 rounded-2xl p-8 shadow-md">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-slate-200 rounded w-48"></div>
          <div className="h-24 bg-slate-100 rounded"></div>
          <div className="h-24 bg-slate-100 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/95 border border-violet-100 rounded-2xl p-5 shadow-md space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div>
          <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            📅 Mis Reservas
          </h2>
          <p className="text-xs text-slate-500">
            Gestiona tus citas y comunícate con los negocios
          </p>
        </div>
        <button
          onClick={loadBookings}
          className="px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-blue-200"
        >
          🔄 Actualizar
        </button>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setFilter('upcoming')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'upcoming'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          📅 Próximas
        </button>
        <button
          onClick={() => setFilter('past')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'past'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          📆 Pasadas
        </button>
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          📋 Todas
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-700">⚠️ {error}</p>
        </div>
      )}

      {/* Lista de reservas */}
      {filteredBookings.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📅</div>
          <p className="text-lg font-medium text-slate-700 mb-2">
            No hay reservas {filter === 'upcoming' ? 'próximas' : filter === 'past' ? 'pasadas' : ''}
          </p>
          <p className="text-sm text-slate-500">
            Explora negocios y agenda tu primera cita
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredBookings.map((booking) => (
            <div
              key={booking._id}
              className="border border-slate-200 rounded-xl p-4 hover:shadow-md transition-shadow"
            >
              {/* Store info */}
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-center gap-3">
                  {booking.store?.logoUrl && (
                    <img
                      src={booking.store.logoUrl}
                      alt={booking.store.name}
                      className="w-12 h-12 rounded-lg object-cover border"
                    />
                  )}
                  <div>
                    <h3 className="font-semibold text-slate-800">
                      {booking.store?.name || 'Negocio'}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {booking.store?.category || 'Sin categoría'}
                    </p>
                  </div>
                </div>
                {getStatusBadge(booking.status)}
              </div>

              {/* Booking details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-slate-600">📅</span>
                    <span className="font-medium text-slate-700">{formatDate(booking.date)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-slate-600">🕐</span>
                    <span className="font-medium text-slate-700">{booking.slot}</span>
                  </div>
                </div>
                
                {booking.service && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-slate-600">🛎️</span>
                      <span className="font-medium text-slate-700">{booking.service.name}</span>
                    </div>
                    {booking.duration && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-slate-600">⏱️</span>
                        <span className="text-slate-600">{booking.duration} minutos</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Notes */}
              {booking.notes && (
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 mb-3">
                  <p className="text-xs text-slate-700">
                    <strong>Nota:</strong> {booking.notes}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => openChat(booking)}
                  className="flex-1 sm:flex-none px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  💬 Chat
                  {booking.unreadMessagesCustomer > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {booking.unreadMessagesCustomer}
                    </span>
                  )}
                </button>

                {booking.store?.phone && (
                  <a
                    href={`tel:${booking.store.phone}`}
                    className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors"
                  >
                    📞 Llamar
                  </a>
                )}

                {booking.store?._id && (
                  <a
                    href={`/tienda/${booking.store._id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-slate-100 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-200 transition-colors"
                  >
                    🏪 Ver negocio
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Chat Modal */}
      {chatOpen && selectedBooking && user?.email && (
        <ChatBox
          bookingId={selectedBooking._id}
          mode="customer"
          customerEmail={user.email}
          onClose={closeChat}
          bookingInfo={selectedBooking}
        />
      )}
    </div>
  );
}
