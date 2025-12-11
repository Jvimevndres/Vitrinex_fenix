// src/components/AppointmentsList.jsx
import { useEffect, useMemo, useState } from "react";
import {
  listStoreAppointments,
  updateAppointmentStatus,
  deleteAppointment,
} from "../api/store";
import { FaComments } from 'react-icons/fa';

const STATUS_LABELS = {
  pending: "Pendiente",
  confirmed: "Confirmada",
  cancelled: "Cancelada",
};

const STATUS_COLORS = {
  pending: "bg-amber-50 text-amber-700 border border-amber-200",
  confirmed: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  cancelled: "bg-rose-50 text-rose-700 border border-rose-200",
};

const STATUS_ICONS = {
  pending: "⏳",
  confirmed: "✅",
  cancelled: "❌",
};

export default function AppointmentsList({ storeId }) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  // 🆕 FILTROS
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // all | pending | confirmed | cancelled
  const [dateFilter, setDateFilter] = useState("upcoming"); // all | upcoming | past

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      const { data } = await listStoreAppointments(storeId);
      setAppointments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error al cargar citas", err?.response || err);
      setError(
        err?.response?.data?.message ||
          "No se pudieron cargar las reservas"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (storeId) load();
  }, [storeId]);

  // 🆕 FILTRADO MEJORADO
  const filteredAppointments = useMemo(() => {
    let filtered = [...appointments];

    // Filtro por texto (nombre, email, teléfono)
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (appt) =>
          appt.customerName?.toLowerCase().includes(term) ||
          appt.customerEmail?.toLowerCase().includes(term) ||
          appt.customerPhone?.includes(term)
      );
    }

    // Filtro por estado
    if (statusFilter !== "all") {
      filtered = filtered.filter((appt) => appt.status === statusFilter);
    }

    // Filtro por fecha
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    if (dateFilter === "upcoming") {
      filtered = filtered.filter((appt) => new Date(appt.date) >= now);
    } else if (dateFilter === "past") {
      filtered = filtered.filter((appt) => new Date(appt.date) < now);
    }

    return filtered;
  }, [appointments, searchTerm, statusFilter, dateFilter]);

  const groupedByDate = useMemo(() => {
    const map = new Map();
    for (const appt of filteredAppointments) {
      const key = appt.date; // YYYY-MM-DD
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(appt);
    }

    // ordenar días y horarios
    return Array.from(map.entries())
      .sort(([a], [b]) => (a < b ? -1 : 1))
      .map(([date, list]) => ({
        date,
        items: list.sort((a, b) =>
          a.slot < b.slot ? -1 : 1
        ),
      }));
  }, [filteredAppointments]);

  // 🆕 ESTADÍSTICAS
  const stats = useMemo(() => {
    const total = appointments.length;
    const pending = appointments.filter((a) => a.status === "pending").length;
    const confirmed = appointments.filter((a) => a.status === "confirmed").length;
    const cancelled = appointments.filter((a) => a.status === "cancelled").length;

    return { total, pending, confirmed, cancelled };
  }, [appointments]);

  const formatDate = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString("es-CL", {
      weekday: "long",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const handleChangeStatus = async (bookingId, status) => {
    try {
      setUpdatingId(bookingId);
      setError("");
      setMsg("");

      const { data } = await updateAppointmentStatus(
        storeId,
        bookingId,
        status
      );

      setAppointments((prev) =>
        prev.map((appt) =>
          appt._id === bookingId ? data : appt
        )
      );
      setMsg("Estado actualizado correctamente");
      setTimeout(() => setMsg(""), 3000);
    } catch (err) {
      console.error("Error al cambiar estado", err?.response || err);
      setError(
        err?.response?.data?.message ||
          "No se pudo actualizar el estado de la cita"
      );
      setTimeout(() => setError(""), 3000);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (bookingId) => {
    if (!window.confirm('¿Estás seguro de eliminar esta reserva? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      setUpdatingId(bookingId);
      setError("");
      setMsg("");

      await deleteAppointment(storeId, bookingId);

      setAppointments((prev) => prev.filter((appt) => appt._id !== bookingId));
      setMsg("Reserva eliminada correctamente");
      setTimeout(() => setMsg(""), 3000);
    } catch (err) {
      console.error("Error al eliminar reserva", err?.response || err);
      setError(
        err?.response?.data?.message ||
          "No se pudo eliminar la reserva"
      );
      setTimeout(() => setError(""), 3000);
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <section className="bg-white border rounded-2xl p-6 shadow-sm">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-slate-200 rounded w-48"></div>
          <div className="h-4 bg-slate-100 rounded w-64"></div>
          <div className="h-24 bg-slate-100 rounded"></div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
      {/* 🆕 HEADER CON ESTADÍSTICAS */}
      <div className="space-y-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-xl font-bold text-slate-900">
              📝 Gestión de Reservas
            </h3>
            <p className="text-sm text-slate-600 mt-1.5">
              Administra las citas de tus clientes
            </p>
          </div>
          <button
            type="button"
            onClick={load}
            className="px-5 py-2.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-xl transition-colors border border-blue-200 shadow-sm"
          >
            🔄 Actualizar
          </button>
        </div>

        {/* 🆕 TARJETAS DE ESTADÍSTICAS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 rounded-xl p-5 shadow-sm">
            <div className="text-3xl font-bold text-slate-900">{stats.total}</div>
            <div className="text-xs font-medium text-slate-600 mt-2">Total Reservas</div>
          </div>
          <div className="bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-300 rounded-xl p-5 shadow-sm">
            <div className="text-3xl font-bold text-amber-800">{stats.pending}</div>
            <div className="text-xs font-medium text-amber-700 mt-2 flex items-center gap-1">
              <span>⏳</span> Pendientes
            </div>
          </div>
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-300 rounded-xl p-5 shadow-sm">
            <div className="text-3xl font-bold text-emerald-800">{stats.confirmed}</div>
            <div className="text-xs font-medium text-emerald-700 mt-2 flex items-center gap-1">
              <span>✅</span> Confirmadas
            </div>
          </div>
          <div className="bg-gradient-to-br from-rose-50 to-rose-100 border border-rose-300 rounded-xl p-5 shadow-sm">
            <div className="text-3xl font-bold text-rose-800">{stats.cancelled}</div>
            <div className="text-xs font-medium text-rose-700 mt-2 flex items-center gap-1">
              <span>❌</span> Canceladas
            </div>
          </div>
        </div>
      </div>

      {/* 🆕 BARRA DE FILTROS */}
      <div className="bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 rounded-xl p-5 space-y-4 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-slate-800">🔍 Filtros de Búsqueda</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Búsqueda */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Buscar cliente
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Nombre, email o teléfono..."
              className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm"
            />
          </div>

          {/* Filtro por estado */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Estado
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm font-medium"
            >
              <option value="all">Todos los estados</option>
              <option value="pending">⏳ Pendientes</option>
              <option value="confirmed">✅ Confirmadas</option>
              <option value="cancelled">❌ Canceladas</option>
            </select>
          </div>

          {/* Filtro por fecha */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Período
            </label>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm font-medium"
            >
              <option value="all">Todas las fechas</option>
              <option value="upcoming">📅 Próximas</option>
              <option value="past">📆 Pasadas</option>
            </select>
          </div>
        </div>

        {/* Contador de resultados */}
        <div className="text-xs text-slate-600">
          Mostrando <strong>{filteredAppointments.length}</strong> de {appointments.length} reservas
        </div>
      </div>

      {/* Mensajes */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <span className="text-xl">⚠️</span>
          <div className="flex-1">
            <p className="text-sm font-medium text-red-800">Error</p>
            <p className="text-sm text-red-600 mt-1">{error}</p>
          </div>
        </div>
      )}

      {msg && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
          <span className="text-xl">✅</span>
          <div className="flex-1">
            <p className="text-sm font-medium text-green-800">Éxito</p>
            <p className="text-sm text-green-600 mt-1">{msg}</p>
          </div>
        </div>
      )}

      {/* Lista de citas */}
      {groupedByDate.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📅</div>
          <p className="text-lg font-medium text-slate-700 mb-2">
            No hay reservas que mostrar
          </p>
          <p className="text-sm text-slate-500">
            {searchTerm || statusFilter !== "all" || dateFilter !== "all"
              ? "Intenta ajustar los filtros de búsqueda"
              : "Comparte tu enlace público para recibir tus primeras citas"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {groupedByDate.map((group) => (
            <article
              key={group.date}
              className="border border-slate-200 rounded-xl overflow-hidden shadow-sm"
            >
              {/* Encabezado de fecha */}
              <div className="bg-slate-50 border-b border-slate-200 px-5 py-3">
                <h4 className="font-semibold text-slate-900 text-sm flex items-center gap-2">
                  📅 {formatDate(group.date)}
                  <span className="text-xs font-medium text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                    {group.items.length} {group.items.length === 1 ? "cita" : "citas"}
                  </span>
                </h4>
              </div>

              {/* Lista de citas */}
              <div className="divide-y divide-slate-200">
                {group.items.map((appt) => (
                  <div
                    key={appt._id}
                    className="px-5 py-4 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      {/* Información del cliente */}
                      <div className="flex items-center gap-4 flex-1">
                        {/* Hora */}
                        <span className="inline-flex items-center justify-center shrink-0 rounded-lg bg-blue-100 text-blue-800 px-3 py-2 text-sm font-semibold border border-blue-200">
                          🕐 {appt.slot}
                        </span>

                        {/* Info Cliente */}
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-slate-900 text-sm">
                            {appt.customerName}
                          </div>
                          <div className="text-xs text-slate-600 flex items-center gap-2 mt-0.5 flex-wrap">
                            <span className="flex items-center gap-1">
                              📧 {appt.customerEmail}
                            </span>
                            <span className="flex items-center gap-1">
                              📱 {appt.customerPhone}
                            </span>
                          </div>
                          
                          {/* Notas inline */}
                          {appt.notes && (
                            <div className="text-xs text-slate-600 mt-1 flex items-start gap-1">
                              <FaComments className="shrink-0" />
                              <span><strong>Nota:</strong> {appt.notes}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Botones de acción */}
                      <div className="flex items-center gap-2 shrink-0">
                          {/* Botón Pendiente */}
                          <button
                            type="button"
                            onClick={() =>
                              handleChangeStatus(
                                appt._id,
                                "pending"
                              )
                            }
                            disabled={updatingId === appt._id || appt.status === "pending"}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                              appt.status === "pending"
                                ? "bg-amber-200 text-amber-900 border border-amber-400 cursor-not-allowed opacity-60"
                                : "text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            }`}
                            title={appt.status === "pending" ? "Ya está en estado Pendiente" : "Cambiar a Pendiente"}
                          >
                            {updatingId === appt._id ? "..." : "⏳ Pendiente"}
                          </button>

                          {/* Botón Confirmar */}
                          <button
                            type="button"
                            onClick={() =>
                              handleChangeStatus(
                                appt._id,
                                "confirmed"
                              )
                            }
                            disabled={updatingId === appt._id || appt.status === "confirmed"}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                              appt.status === "confirmed"
                                ? "bg-emerald-200 text-emerald-900 border border-emerald-400 cursor-not-allowed opacity-60"
                                : "text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            }`}
                            title={appt.status === "confirmed" ? "Ya está Confirmada" : "Confirmar reserva"}
                          >
                            {updatingId === appt._id ? "..." : "✅ Confirmar"}
                          </button>

                          {/* Botón Cancelar */}
                          <button
                            type="button"
                            onClick={() =>
                              handleChangeStatus(
                                appt._id,
                                "cancelled"
                              )
                            }
                            disabled={updatingId === appt._id || appt.status === "cancelled"}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                              appt.status === "cancelled"
                                ? "bg-rose-200 text-rose-900 border border-rose-400 cursor-not-allowed opacity-60"
                                : "text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            }`}
                            title={appt.status === "cancelled" ? "Ya está Cancelada" : "Cancelar reserva"}
                          >
                            {updatingId === appt._id ? "..." : "❌ Cancelar"}
                          </button>

                          {/* Botón Eliminar */}
                          <button
                            type="button"
                            onClick={() => handleDelete(appt._id)}
                            disabled={updatingId === appt._id}
                            className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                            title="Eliminar reserva permanentemente"
                          >
                            {updatingId === appt._id ? "..." : "🗑️ Eliminar"}
                          </button>
                        </div>
                    </div>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
