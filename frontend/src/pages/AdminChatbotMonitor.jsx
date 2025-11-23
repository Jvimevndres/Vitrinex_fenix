import { useEffect, useState } from 'react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getChatbotStats } from '../api/chatbot';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function AdminChatbotMonitor() {
  const [stats, setStats] = useState(null);
  const [timeRange, setTimeRange] = useState('30d');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadStats();
  }, [timeRange]);

  const loadStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getChatbotStats(timeRange);
      setStats(data);
    } catch (err) {
      console.error('Error cargando stats:', err);
      setError('Error al cargar estadísticas del chatbot');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-slate-600">Cargando estadísticas...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-600">{error}</p>
            <button 
              onClick={loadStats}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { summary, balance, dailyStats, topUsers } = stats;

  // Datos para gráfico de pastel (Free vs Premium)
  const pieData = [
    { name: 'Premium', value: summary.premiumQueries },
    { name: 'Free', value: summary.freeQueries }
  ];

  // Calcular porcentaje de saldo usado
  const balanceUsedPercent = (balance.spent / balance.initial) * 100;
  const balanceRemainingPercent = 100 - balanceUsedPercent;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            📊 Monitor de Chatbot OpenAI
          </h1>
          <p className="text-slate-600">
            Seguimiento de uso, costos y saldo disponible
          </p>
        </div>

        {/* Selector de rango */}
        <div className="mb-6 flex gap-2">
          {['7d', '30d', '90d', 'all'].map(range => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                timeRange === range
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-slate-700 hover:bg-slate-100'
              }`}
            >
              {range === 'all' ? 'Todo' : range.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Cards principales - Saldo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Saldo Inicial */}
          <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-green-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-green-100 rounded-lg">
                <span className="text-2xl">💵</span>
              </div>
              <div>
                <p className="text-sm text-slate-600 font-medium">Saldo Inicial</p>
                <p className="text-3xl font-bold text-green-600">
                  ${balance.initial.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          {/* Gastado */}
          <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-orange-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-orange-100 rounded-lg">
                <span className="text-2xl">💸</span>
              </div>
              <div>
                <p className="text-sm text-slate-600 font-medium">Gastado</p>
                <p className="text-3xl font-bold text-orange-600">
                  ${balance.spent.toFixed(4)}
                </p>
              </div>
            </div>
            <div className="mt-3">
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div 
                  className="bg-orange-500 h-2 rounded-full transition-all"
                  style={{ width: `${Math.min(balanceUsedPercent, 100)}%` }}
                />
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {balanceUsedPercent.toFixed(1)}% usado
              </p>
            </div>
          </div>

          {/* Restante */}
          <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-blue-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-blue-100 rounded-lg">
                <span className="text-2xl">💰</span>
              </div>
              <div>
                <p className="text-sm text-slate-600 font-medium">Saldo Disponible</p>
                <p className="text-3xl font-bold text-blue-600">
                  ${balance.remaining.toFixed(4)}
                </p>
              </div>
            </div>
            <div className="mt-3">
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all"
                  style={{ width: `${balanceRemainingPercent}%` }}
                />
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {balanceRemainingPercent.toFixed(1)}% restante
              </p>
            </div>
          </div>
        </div>

        {/* Proyecciones */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Consultas estimadas */}
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">🔮</span>
              <div>
                <p className="text-sm font-medium opacity-90">Consultas Restantes</p>
                <p className="text-4xl font-bold">
                  {balance.estimatedQueriesRemaining.toLocaleString()}
                </p>
              </div>
            </div>
            <p className="text-sm opacity-80 mt-2">
              Basado en uso promedio actual
            </p>
          </div>

          {/* Duración estimada */}
          <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">📅</span>
              <div>
                <p className="text-sm font-medium opacity-90">Duración Estimada</p>
                <p className="text-4xl font-bold">
                  {balance.estimatedMonthsRemaining}
                </p>
                <p className="text-sm font-medium opacity-90">meses</p>
              </div>
            </div>
            <p className="text-sm opacity-80 mt-2">
              Proyección basada en tendencia
            </p>
          </div>

          {/* Costo promedio */}
          <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">📊</span>
              <div>
                <p className="text-sm font-medium opacity-90">Costo por Consulta</p>
                <p className="text-3xl font-bold">
                  ${summary.avgCostPerQuery.toFixed(6)}
                </p>
              </div>
            </div>
            <p className="text-sm opacity-80 mt-2">
              Promedio de {summary.avgTokensPerQuery} tokens
            </p>
          </div>
        </div>

        {/* Estadísticas generales */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <p className="text-sm text-slate-600 font-medium mb-1">Total Consultas</p>
            <p className="text-3xl font-bold text-slate-900">{summary.totalQueries}</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6">
            <p className="text-sm text-slate-600 font-medium mb-1">Consultas Premium</p>
            <p className="text-3xl font-bold text-blue-600">{summary.premiumQueries}</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6">
            <p className="text-sm text-slate-600 font-medium mb-1">Total Tokens</p>
            <p className="text-3xl font-bold text-purple-600">
              {summary.totalTokens.toLocaleString()}
            </p>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6">
            <p className="text-sm text-slate-600 font-medium mb-1">Costo Total</p>
            <p className="text-3xl font-bold text-orange-600">
              ${summary.totalCost.toFixed(4)}
            </p>
          </div>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Gráfico de línea - Costo diario */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">💸 Costo Diario</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={dailyStats}>
                <defs>
                  <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  dataKey="date" 
                  stroke="#64748b"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return `${date.getDate()}/${date.getMonth() + 1}`;
                  }}
                />
                <YAxis stroke="#64748b" tick={{ fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }}
                  labelStyle={{ color: '#fff' }}
                  formatter={(value) => `$${Number(value).toFixed(6)}`}
                />
                <Area 
                  type="monotone" 
                  dataKey="cost" 
                  stroke="#f59e0b" 
                  strokeWidth={2}
                  fill="url(#colorCost)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Gráfico de barras - Consultas diarias */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">📈 Consultas Diarias</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dailyStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  dataKey="date" 
                  stroke="#64748b"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return `${date.getDate()}/${date.getMonth() + 1}`;
                  }}
                />
                <YAxis stroke="#64748b" tick={{ fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Bar dataKey="queries" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Gráfico de pastel - Free vs Premium */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">🎯 Tipo de Consultas</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Gráfico de tokens diarios */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">🔤 Tokens Diarios</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  dataKey="date" 
                  stroke="#64748b"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return `${date.getDate()}/${date.getMonth() + 1}`;
                  }}
                />
                <YAxis stroke="#64748b" tick={{ fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }}
                  labelStyle={{ color: '#fff' }}
                  formatter={(value) => value.toLocaleString()}
                />
                <Line 
                  type="monotone" 
                  dataKey="tokens" 
                  stroke="#8b5cf6" 
                  strokeWidth={2}
                  dot={{ fill: '#8b5cf6', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top usuarios */}
        {topUsers.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">👥 Top Usuarios por Uso</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">#</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Usuario</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Email</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">Consultas</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">Tokens</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">Costo</th>
                  </tr>
                </thead>
                <tbody>
                  {topUsers.map((user, index) => (
                    <tr key={index} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-4 text-sm text-slate-600">{index + 1}</td>
                      <td className="py-3 px-4 text-sm font-medium text-slate-900">{user.username}</td>
                      <td className="py-3 px-4 text-sm text-slate-600">{user.email}</td>
                      <td className="py-3 px-4 text-sm text-right text-slate-900">{user.queries}</td>
                      <td className="py-3 px-4 text-sm text-right text-purple-600">
                        {user.tokens.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-sm text-right font-medium text-orange-600">
                        ${user.cost.toFixed(6)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Información adicional */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="text-lg font-bold text-blue-900 mb-3">ℹ️ Información del Sistema</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
            <div>
              <strong>Modelo:</strong> gpt-4o-mini
            </div>
            <div>
              <strong>Pricing:</strong> $0.15/1M tokens (input), $0.60/1M tokens (output)
            </div>
            <div>
              <strong>Rango de tiempo:</strong> {timeRange === 'all' ? 'Todo el historial' : `Últimos ${timeRange}`}
            </div>
            <div>
              <strong>Última actualización:</strong> {new Date().toLocaleString('es-ES')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
