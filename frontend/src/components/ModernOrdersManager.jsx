// frontend/src/components/ModernOrdersManager.jsx
import { useEffect, useState } from "react";
import { listStoreOrders, updateOrderStatus } from "../api/store";
import { getOrderMessages, sendOrderMessage } from "../api/messages";
import { FaComments } from 'react-icons/fa';

const currencyFormatter = new Intl.NumberFormat("es-CL", {
  style: "currency",
  currency: "CLP",
  minimumFractionDigits: 0,
});

export default function ModernOrdersManager({ storeId }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      const { data } = await listStoreOrders(storeId);
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error al cargar pedidos", err?.response || err);
      setError(err?.response?.data?.message || "No se pudieron cargar los pedidos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (storeId) {
      load();
    }
  }, [storeId]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      await load();
    } catch (err) {
      console.error("Error actualizando estado:", err);
      alert("Error al actualizar el estado del pedido");
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { bg: "bg-yellow-100", text: "text-yellow-800", icon: "⏳", label: "Pendiente" },
      confirmed: { bg: "bg-green-100", text: "text-green-800", icon: "✅", label: "Confirmado" },
      fulfilled: { bg: "bg-blue-100", text: "text-blue-800", icon: "📦", label: "Completado" },
      cancelled: { bg: "bg-red-100", text: "text-red-800", icon: "❌", label: "Cancelado" },
    };
    const badge = badges[status] || badges.pending;
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
        <span>{badge.icon}</span>
        <span>{badge.label}</span>
      </span>
    );
  };

  const filteredOrders = orders.filter(order => {
    const matchesStatus = filterStatus === "all" || order.status === filterStatus;
    const matchesSearch = !searchTerm || 
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerPhone?.includes(searchTerm);
    return matchesStatus && matchesSearch;
  });

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === "pending").length,
    confirmed: orders.filter(o => o.status === "confirmed").length,
    fulfilled: orders.filter(o => o.status === "fulfilled").length,
    cancelled: orders.filter(o => o.status === "cancelled").length,
  };

  if (loading) {
    return (
      <div className="bg-white border rounded-2xl p-8 shadow-sm text-center">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-slate-200 rounded w-1/4 mx-auto"></div>
          <div className="h-32 bg-slate-100 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header con estadísticas */}
      <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border border-blue-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-xl font-bold text-slate-900">📦 Pedidos Recibidos</h3>
            <p className="text-sm text-slate-600 mt-1.5">Administra las compras de tus clientes</p>
          </div>
          <button
            onClick={load}
            className="px-5 py-2.5 bg-white border border-blue-300 rounded-xl text-sm font-medium text-blue-700 hover:bg-blue-50 transition-colors shadow-sm"
          >
            🔄 Actualizar
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
            <p className="text-xs font-medium text-slate-600 mb-1">Total Pedidos</p>
            <p className="text-3xl font-bold text-slate-900">{stats.total}</p>
          </div>
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-4 border border-yellow-300 shadow-sm">
            <p className="text-xs font-medium text-yellow-700 mb-1 flex items-center gap-1"><span>⏳</span> Pendientes</p>
            <p className="text-3xl font-bold text-yellow-800">{stats.pending}</p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-300 shadow-sm">
            <p className="text-xs font-medium text-green-700 mb-1 flex items-center gap-1"><span>✅</span> Confirmados</p>
            <p className="text-3xl font-bold text-green-800">{stats.confirmed}</p>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-300 shadow-sm">
            <p className="text-xs font-medium text-blue-700 mb-1 flex items-center gap-1"><span>📦</span> Completados</p>
            <p className="text-3xl font-bold text-blue-800">{stats.fulfilled}</p>
          </div>
          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4 border border-red-300 shadow-sm">
            <p className="text-xs font-medium text-red-700 mb-1 flex items-center gap-1"><span>❌</span> Cancelados</p>
            <p className="text-3xl font-bold text-red-800">{stats.cancelled}</p>
          </div>
        </div>
      </div>

      {/* Filtros y búsqueda */}
      <div className="bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-xs font-semibold text-slate-700 mb-2">🔍 Buscar cliente</label>
            <input
              type="text"
              placeholder="Nombre, email o teléfono..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm"
            />
          </div>
          <div className="md:w-56">
            <label className="block text-xs font-semibold text-slate-700 mb-2">Estado</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm font-medium"
            >
              <option value="all">Todos los estados</option>
              <option value="pending">⏳ Pendientes</option>
              <option value="confirmed">✅ Confirmados</option>
              <option value="fulfilled">📦 Completados</option>
              <option value="cancelled">❌ Cancelados</option>
            </select>
          </div>
        </div>
        <p className="text-xs font-medium text-slate-600 mt-3">
          Mostrando {filteredOrders.length} de {orders.length} pedidos
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {!loading && orders.length === 0 && (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center">
          <div className="text-6xl mb-4">🛒</div>
          <h3 className="text-lg font-semibold text-slate-800 mb-2">Sin pedidos aún</h3>
          <p className="text-sm text-slate-600">
            Los pedidos de tus clientes aparecerán aquí. Comparte tu catálogo para recibir compras.
          </p>
        </div>
      )}

      {/* Lista de pedidos */}
      <div className="space-y-3">
        {filteredOrders.map((order) => (
          <div
            key={order._id}
            className="bg-white border-2 border-slate-200 rounded-xl hover:border-blue-300 transition-all overflow-hidden"
          >
            <div className="p-4">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-bold text-slate-900">{order.customerName}</h4>
                    {getStatusBadge(order.status)}
                  </div>
                  <div className="flex flex-wrap gap-3 text-xs text-slate-600">
                    {order.customerEmail && (
                      <span className="flex items-center gap-1">
                        📧 <a href={`mailto:${order.customerEmail}`} className="hover:text-blue-600">{order.customerEmail}</a>
                      </span>
                    )}
                    {order.customerPhone && (
                      <span className="flex items-center gap-1">
                        📞 <a href={`https://wa.me/${order.customerPhone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="hover:text-green-600">{order.customerPhone}</a>
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600">
                    {currencyFormatter.format(Number(order.total) || 0)}
                  </p>
                  <p className="text-xs text-slate-500">
                    {new Date(order.createdAt).toLocaleDateString('es-CL', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>

              {order.customerAddress && (
                <div className="mb-3 p-2 bg-slate-50 rounded-lg border border-slate-200">
                  <p className="text-xs text-slate-600">
                    <span className="font-semibold">📍 Dirección de entrega:</span> {order.customerAddress}
                  </p>
                </div>
              )}

              {/* Productos */}
              <div className="mb-3">
                <p className="text-xs font-semibold text-slate-700 mb-2">Productos:</p>
                <div className="space-y-1">
                  {(order.items || []).map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2 text-sm">
                      <span className="text-slate-700">
                        <span className="font-semibold">{item.quantity}×</span> {item.productName}
                      </span>
                      <span className="font-semibold text-slate-900">
                        {currencyFormatter.format(Number(item.subtotal) || 0)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {order.notes && (
                <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-xs font-semibold text-blue-900 mb-1 flex items-center gap-1"><FaComments /> Nota del cliente:</p>
                  <p className="text-sm text-blue-800">{order.notes}</p>
                </div>
              )}

              {/* Acciones */}
              <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-200">
                {order.status === "pending" && (
                  <button
                    onClick={() => handleStatusChange(order._id, "confirmed")}
                    className="flex-1 min-w-[120px] px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                  >
                    ✅ Confirmar
                  </button>
                )}
                
                {order.status === "confirmed" && (
                  <button
                    onClick={() => handleStatusChange(order._id, "fulfilled")}
                    className="flex-1 min-w-[120px] px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    📦 Completar
                  </button>
                )}
                
                {(order.status === "pending" || order.status === "confirmed") && (
                  <button
                    onClick={() => {
                      if (confirm("¿Estás seguro de cancelar este pedido?")) {
                        handleStatusChange(order._id, "cancelled");
                      }
                    }}
                    className="px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors"
                  >
                    ❌ Cancelar
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
