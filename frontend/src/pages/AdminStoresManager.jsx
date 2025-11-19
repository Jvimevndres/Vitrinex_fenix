import { useState, useEffect } from 'react';
import { getAllStoresAdmin, updateStoreStatus, updateStorePlan } from '../api/admin';

export default function AdminStoresManager() {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ plan: '', isActive: '', search: '' });

  useEffect(() => {
    loadStores();
  }, [filter]);

  const loadStores = async () => {
    try {
      const res = await getAllStoresAdmin(filter);
      setStores(res.data.stores);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (storeId, currentStatus) => {
    try {
      await updateStoreStatus(storeId, !currentStatus);
      loadStores();
    } catch (error) {
      alert('Error actualizando estado');
    }
  };

  const changePlan = async (storeId, newPlan) => {
    try {
      await updateStorePlan(storeId, newPlan);
      loadStores();
    } catch (error) {
      alert('Error actualizando plan');
    }
  };

  if (loading) return <div className="text-center py-12">Cargando tiendas...</div>;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 border border-slate-200">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Gestión de Tiendas</h2>
        
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <input
            type="text"
            placeholder="Buscar tienda..."
            value={filter.search}
            onChange={(e) => setFilter({ ...filter, search: e.target.value })}
            className="px-4 py-2 border rounded-lg"
          />
          <select
            value={filter.plan}
            onChange={(e) => setFilter({ ...filter, plan: e.target.value })}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="">Todos los planes</option>
            <option value="free">Free</option>
            <option value="pro">Pro</option>
            <option value="premium">Premium</option>
          </select>
          <select
            value={filter.isActive}
            onChange={(e) => setFilter({ ...filter, isActive: e.target.value })}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="">Todas</option>
            <option value="true">Activas</option>
            <option value="false">Inactivas</option>
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left p-3 text-sm font-semibold text-slate-700">Tienda</th>
                <th className="text-left p-3 text-sm font-semibold text-slate-700">Dueño</th>
                <th className="text-left p-3 text-sm font-semibold text-slate-700">Plan</th>
                <th className="text-left p-3 text-sm font-semibold text-slate-700">Actividad</th>
                <th className="text-left p-3 text-sm font-semibold text-slate-700">Estado</th>
                <th className="text-left p-3 text-sm font-semibold text-slate-700">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {stores.map((store) => (
                <tr key={store._id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="p-3">
                    <div>
                      <p className="font-medium text-slate-900">{store.name}</p>
                      <p className="text-xs text-slate-500">{store.email}</p>
                    </div>
                  </td>
                  <td className="p-3 text-sm text-slate-600">
                    {store.owner?.username || 'N/A'}
                  </td>
                  <td className="p-3">
                    <select
                      value={store.plan}
                      onChange={(e) => changePlan(store._id, e.target.value)}
                      className="text-sm border rounded px-2 py-1"
                    >
                      <option value="free">Free</option>
                      <option value="pro">Pro</option>
                      <option value="premium">Premium</option>
                    </select>
                  </td>
                  <td className="p-3 text-sm text-slate-600">
                    {store.activity?.bookings || 0} reservas<br/>
                    {store.activity?.products || 0} productos
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      store.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {store.isActive ? 'Activa' : 'Inactiva'}
                    </span>
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => toggleStatus(store._id, store.isActive)}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      {store.isActive ? 'Desactivar' : 'Activar'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
