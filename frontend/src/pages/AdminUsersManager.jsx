import { useState, useEffect } from 'react';
import { getAllUsers, updateUserRole } from '../api/admin';

export default function AdminUsersManager() {
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState({ role: '', search: '' });

  useEffect(() => {
    loadUsers();
  }, [filter]);

  const loadUsers = async () => {
    try {
      const res = await getAllUsers(filter);
      setUsers(res.data.users);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const changeRole = async (userId, newRole) => {
    if (!confirm(`¿Cambiar rol a ${newRole}?`)) return;
    try {
      await updateUserRole(userId, newRole);
      loadUsers();
    } catch (error) {
      alert('Error actualizando rol');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 border border-slate-200">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Gestión de Usuarios</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <input
            type="text"
            placeholder="Buscar usuario..."
            value={filter.search}
            onChange={(e) => setFilter({ ...filter, search: e.target.value })}
            className="px-4 py-2 border rounded-lg"
          />
          <select
            value={filter.role}
            onChange={(e) => setFilter({ ...filter, role: e.target.value })}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="">Todos los roles</option>
            <option value="user">Usuario</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left p-3 text-sm font-semibold">Usuario</th>
                <th className="text-left p-3 text-sm font-semibold">Email</th>
                <th className="text-left p-3 text-sm font-semibold">Rol</th>
                <th className="text-left p-3 text-sm font-semibold">Registro</th>
                <th className="text-left p-3 text-sm font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      {user.avatarUrl && (
                        <img src={user.avatarUrl} alt="" className="w-8 h-8 rounded-full" />
                      )}
                      <span className="font-medium">{user.username}</span>
                    </div>
                  </td>
                  <td className="p-3 text-sm text-slate-600">{user.email}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="p-3 text-sm text-slate-600">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-3">
                    <select
                      value={user.role}
                      onChange={(e) => changeRole(user._id, e.target.value)}
                      className="text-sm border rounded px-2 py-1"
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
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
