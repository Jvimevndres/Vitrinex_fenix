import { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AdminLayout() {
  const { user } = useAuth();
  const location = useLocation();

  // Verificar que el usuario es admin
  if (!user || user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  const navItems = [
    { path: '/admin', icon: '📊', label: 'Dashboard' },
    { path: '/admin/stores', icon: '🏪', label: 'Tiendas' },
    { path: '/admin/users', icon: '👥', label: 'Usuarios' },
    { path: '/admin/sponsors', icon: '📢', label: 'Anuncios' },
    { path: '/admin/comments', icon: '💬', label: 'Comentarios' },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                V
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Vitrinex Admin</h1>
                <p className="text-xs text-slate-500">Panel de Administración</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-slate-900">{user.username}</p>
                <p className="text-xs text-purple-600">Administrador</p>
              </div>
              <Link
                to="/"
                className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900 border border-slate-300 rounded-lg hover:bg-slate-50"
              >
                ← Volver al sitio
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Navigation Tabs */}
        <nav className="flex gap-2 mb-6 overflow-x-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-purple-100 text-purple-700'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Content */}
        <Outlet />
      </div>
    </div>
  );
}
