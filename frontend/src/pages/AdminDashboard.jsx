import { useState, useEffect } from 'react';
import { getSystemStats } from '../api/admin';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const res = await getSystemStats();
      setStats(res.data);
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Cargando estadísticas...</div>;
  }

  if (!stats) {
    return <div className="text-center py-12 text-red-600">Error cargando datos</div>;
  }

  const { summary, planDistribution, topStoresByBookings, userGrowth } = stats;

  // Datos para gráfico de crecimiento de usuarios
  const userGrowthData = {
    labels: userGrowth.map((d) => `${d._id.month}/${d._id.year}`),
    datasets: [
      {
        label: 'Nuevos Usuarios',
        data: userGrowth.map((d) => d.count),
        borderColor: 'rgb(147, 51, 234)',
        backgroundColor: 'rgba(147, 51, 234, 0.1)',
        tension: 0.4,
      },
    ],
  };

  // Datos para gráfico de distribución de planes
  const planDistributionData = {
    labels: ['Free', 'Pro', 'Premium'],
    datasets: [
      {
        label: 'Tiendas por Plan',
        data: [planDistribution.free, planDistribution.pro, planDistribution.premium],
        backgroundColor: ['rgba(148, 163, 184, 0.8)', 'rgba(59, 130, 246, 0.8)', 'rgba(147, 51, 234, 0.8)'],
      },
    ],
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon="👥"
          title="Total Usuarios"
          value={summary.totalUsers}
          color="blue"
        />
        <StatCard
          icon="🏪"
          title="Tiendas Activas"
          value={summary.activeStores}
          subtitle={`${summary.inactiveStores} inactivas`}
          color="green"
        />
        <StatCard
          icon="📅"
          title="Reservas Totales"
          value={summary.totalBookings}
          color="purple"
        />
        <StatCard
          icon="💬"
          title="Comentarios Pendientes"
          value={summary.pendingComments}
          color="amber"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon="🛍️"
          title="Productos"
          value={summary.totalProducts}
          color="pink"
        />
        <StatCard
          icon="✂️"
          title="Servicios"
          value={summary.totalServices}
          color="indigo"
        />
        <StatCard
          icon="📢"
          title="Anuncios Activos"
          value={summary.activeSponsorAds}
          color="orange"
        />
        <StatCard
          icon="⭐"
          title="Planes Premium"
          value={planDistribution.premium + planDistribution.pro}
          color="yellow"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth */}
        <div className="bg-white rounded-xl p-6 border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Crecimiento de Usuarios (últimos 6 meses)
          </h3>
          <Line data={userGrowthData} options={{ responsive: true, maintainAspectRatio: true }} />
        </div>

        {/* Plan Distribution */}
        <div className="bg-white rounded-xl p-6 border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Distribución de Planes
          </h3>
          <Bar data={planDistributionData} options={{ responsive: true, maintainAspectRatio: true }} />
        </div>
      </div>

      {/* Top Stores */}
      <div className="bg-white rounded-xl p-6 border border-slate-200">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">
          Top 5 Tiendas Más Activas (por reservas)
        </h3>
        <div className="space-y-2">
          {topStoresByBookings.map((store, index) => (
            <div
              key={store._id}
              className="flex items-center justify-between p-3 rounded-lg bg-slate-50"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                  #{index + 1}
                </div>
                <div>
                  <p className="font-medium text-slate-900">{store.name}</p>
                  <p className="text-xs text-slate-500">
                    Plan: <span className="capitalize">{store.plan}</span>
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold text-purple-600">{store.count}</p>
                <p className="text-xs text-slate-500">reservas</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, title, value, subtitle, color }) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    amber: 'from-amber-500 to-amber-600',
    pink: 'from-pink-500 to-pink-600',
    indigo: 'from-indigo-500 to-indigo-600',
    orange: 'from-orange-500 to-orange-600',
    yellow: 'from-yellow-500 to-yellow-600',
  };

  return (
    <div className="bg-white rounded-xl p-6 border border-slate-200">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-slate-900">{value}</p>
          {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`w-12 h-12 bg-gradient-to-br ${colorClasses[color]} rounded-lg flex items-center justify-center text-2xl`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
