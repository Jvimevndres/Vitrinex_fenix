// frontend/src/components/SmartInsights.jsx
import { useEffect, useState } from "react";
import {
  fetchProductInsights,
  fetchBookingInsights,
} from "../api/insights";

// --- Small presentational components ---
function SectionTitle({ title, subtitle, badge }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-lg md:text-xl font-semibold text-slate-800">{title}</h2>
        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      {badge && (
        <span className="inline-flex items-center px-3 py-1 text-xs rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
          {badge}
        </span>
      )}
    </div>
  );
}

function StatCard({ label, value, className, trend }) {
  return (
    <div className={`bg-white border border-slate-100 rounded-2xl p-4 shadow-sm min-w-0 flex flex-col ${className || ""}`}>
      <div className="flex items-center justify-between">
        <p className="text-[12px] text-slate-500">{label}</p>
        {trend && (
          <span className={`text-xs font-medium ${trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-slate-400'}`}>
            {trend > 0 ? '↗' : trend < 0 ? '↘' : '→'} {Math.abs(trend)}%
          </span>
        )}
      </div>
      <p className="text-lg font-bold text-slate-900 mt-1 leading-tight break-words">{value}</p>
    </div>
  );
}

function InsightList({ title, items, renderItem, emptyMessage }) {
  return (
    <div>
      <h3 className="font-semibold text-slate-800 mb-3 text-sm flex items-center gap-2">
        {title}
        {items && items.length > 0 && (
          <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
            {items.length}
          </span>
        )}
      </h3>
      {(!items || items.length === 0) ? (
        <div className="text-sm text-slate-500 bg-slate-50 rounded-lg p-4 text-center border border-slate-100">
          {emptyMessage || "Sin datos suficientes para mostrar esta sección."}
        </div>
      ) : (
        <ul className="space-y-2">
          {items.map((it, i) => (
            <li key={it.productId || it.name || it.hour || i} className="flex items-center justify-between bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 hover:bg-slate-100 transition-colors">
              {renderItem(it, i)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function EmptyVisual({ message }) {
  return (
    <div className="flex flex-col items-center justify-center py-8">
      <svg className="w-12 h-12 text-slate-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M3 7h18M5 7v10a2 2 0 002 2h10a2 2 0 002-2V7" />
      </svg>
      <p className="text-sm text-slate-600 font-medium">{message}</p>
    </div>
  );
}

export default function SmartInsights({ storeId, mode }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!storeId) return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeId, mode]);

  const load = async () => {
    try {
      setLoading(true);
      setError("");

      const res =
        mode === "bookings"
          ? await fetchBookingInsights(storeId)
          : await fetchProductInsights(storeId);

      setData(res.data);
    } catch (err) {
      console.error("Error cargando SmartInsights:", err);
      setError("No se pudo cargar el análisis inteligente.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white/95 border rounded-2xl p-6 shadow-sm text-sm text-slate-500">
        Cargando análisis inteligente…
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-4 shadow-sm text-sm text-red-700">
        {error}
      </div>
    );
  }

  if (!data) return null;

  const { summary, suggestions } = data;

  // Empty state for bookings: visual and centered
  if (mode === "bookings" && summary?.totalAppointments === 0) {
    return (
      <section className="bg-white/95 border rounded-2xl p-6 shadow-sm text-sm text-slate-600">
        <div className="flex items-center justify-between mb-4">
          <SectionTitle title="Análisis inteligente" subtitle="Agendamiento y servicios" />
        </div>
        <EmptyVisual message="Aún no se registran reservas en tu tienda." />
      </section>
    );
  }

  return (
    <section className="bg-white/95 border rounded-2xl p-6 shadow-sm space-y-5">
      <div className="flex items-center justify-between">
        <SectionTitle title="Análisis inteligente" subtitle="Recomendaciones basadas en el comportamiento de tu tienda." badge={mode === 'bookings' ? 'Agendamiento' : 'Productos'} />
      </div>

      {/* KPIs */}
      {mode === "products" ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <StatCard label="Pedidos totales" value={summary?.totalOrders ?? 0} />
            <StatCard label="Unidades vendidas" value={summary?.totalItemsSold ?? 0} />
            <StatCard label="Ingresos generados" value={summary?.totalRevenue ? `$${summary.totalRevenue.toLocaleString('es-CL')}` : '$0'} />
            <StatCard label="Productos vendidos" value={summary?.uniqueProducts ?? 0} />
            <StatCard label="Ticket promedio" value={summary?.avgOrderValue ? `$${summary.avgOrderValue.toLocaleString('es-CL')}` : '$0'} className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200" />
            <StatCard label="Tasa conversión" value={`${summary?.conversionRate ?? 0}%`} className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200" />
          </div>
          
          {summary?.totalOrders === 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
              <p className="text-sm text-amber-800">
                📊 <strong>Sin ventas registradas</strong> - Los clientes aún no han realizado pedidos en tu tienda.
              </p>
              <p className="text-xs text-amber-700 mt-1">
                Asegúrate de tener productos publicados y precios atractivos.
              </p>
            </div>
          )}
        </>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <StatCard label="Citas totales" value={summary?.totalAppointments ?? 0} />
            <StatCard label="✅ Confirmadas" value={summary?.confirmed ?? 0} className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200" />
            <StatCard label="⏳ Pendientes" value={summary?.pending ?? 0} className="bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200" />
            <StatCard label="❌ Canceladas" value={summary?.cancelled ?? 0} className="bg-gradient-to-br from-red-50 to-rose-50 border-red-200" />
            <StatCard label="Tasa éxito" value={`${summary?.completionRate ?? 0}%`} className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200" />
            <StatCard label="Promedio diario" value={summary?.avgDailyBookings ?? 0} className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200" />
          </div>
        </>
      )}

      {/* Details layout: two-column card layout that adapts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {mode === "products" ? (
            <div className="space-y-4">
              <InsightList
                title="🏆 Productos más vendidos"
                items={data.topProducts}
                emptyMessage="Aún no hay ventas registradas."
                renderItem={(p, i) => (
                  <>
                    <div className="flex items-center gap-2 truncate max-w-[60%]">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 text-white text-xs font-bold flex items-center justify-center">
                        {i + 1}
                      </span>
                      <span className="font-medium truncate">{p.name}</span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-sm font-semibold text-slate-800">{p.totalSold} uds.</span>
                      <span className="text-xs text-green-600">${p.revenue.toLocaleString('es-CL')}</span>
                    </div>
                  </>
                )}
              />

              <InsightList
                title="📉 Productos con baja rotación"
                items={data.lowProducts}
                emptyMessage="No hay productos de baja rotación en este período."
                renderItem={(p, i) => (
                  <>
                    <span className="truncate max-w-[60%]">{p.name}</span>
                    <span className="text-sm font-semibold text-amber-600">{p.totalSold} uds.</span>
                  </>
                )}
              />
            </div>
          ) : (
            <div className="space-y-4">
              <InsightList
                title="⏰ Horarios con más demanda"
                items={data.busySlots}
                emptyMessage="No hay suficientes citas para estimar horarios pico."
                renderItem={(s, i) => (
                  <>
                    <div className="flex items-center gap-2">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 text-white text-xs font-bold flex items-center justify-center">
                        {i + 1}
                      </span>
                      <span className="font-medium">{s.hour}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-blue-500 to-indigo-600"
                          style={{ width: `${Math.min(100, (s.count / (data.busySlots[0]?.count || 1)) * 100)}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold">{s.count}</span>
                    </div>
                  </>
                )}
              />

              <InsightList
                title="🎯 Servicios más solicitados"
                items={data.services}
                emptyMessage="Aún no hay servicios suficientes en el período seleccionado."
                renderItem={(s, i) => (
                  <>
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 text-white text-xs font-bold flex items-center justify-center">
                        {i + 1}
                      </span>
                      <div className="flex flex-col min-w-0">
                        <span className="font-medium truncate">{s.name}</span>
                        {s.avgRating && <span className="text-xs text-amber-600">⭐ {s.avgRating.toFixed(1)}</span>}
                      </div>
                    </div>
                    <span className="text-sm font-semibold flex-shrink-0">{s.total} citas</span>
                  </>
                )}
              />
            </div>
          )}
        </div>

        <aside className="space-y-4">
          <div className="bg-gradient-to-br from-red-50 to-orange-50 border border-red-200 rounded-2xl p-4 shadow-sm">
            <h4 className="text-sm font-semibold text-red-900 flex items-center gap-2">
              🚨 Alertas e inventario
            </h4>
            <div className="mt-3">
              {data.inventoryAlerts && data.inventoryAlerts.length > 0 ? (
                <ul className="space-y-2">
                  {data.inventoryAlerts.map((a, i) => (
                    <li key={i} className={`text-sm px-3 py-2 rounded-md ${a.level === 'warning' ? 'bg-white text-amber-800 border border-amber-300 shadow-sm' : 'bg-white text-slate-700 border border-slate-200'}`}>
                      <span className="font-medium">⚠️</span> {a.message}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-sm text-red-700 bg-white/50 rounded-lg p-3 text-center">
                  ✅ Sin alertas críticas
                </div>
              )}
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-4 shadow-sm">
            <h4 className="text-sm font-semibold text-blue-900 mb-3 flex items-center gap-2">
              💡 Recomendaciones inteligentes
            </h4>
            {suggestions && suggestions.length > 0 ? (
              <ul className="space-y-2">
                {suggestions.map((s, i) => (
                  <li key={i} className="text-sm text-blue-900 bg-white/70 rounded-lg px-3 py-2 border border-blue-100 flex items-start gap-2">
                    <span className="flex-shrink-0 mt-0.5">•</span>
                    <span className="flex-1">{s}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-sm text-blue-700 bg-white/50 rounded-lg p-3 text-center">
                👍 Todo funciona correctamente
              </div>
            )}
          </div>
        </aside>
      </div>
    </section>
  );
}
