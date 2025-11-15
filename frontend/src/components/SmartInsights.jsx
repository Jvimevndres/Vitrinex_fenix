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

function StatCard({ label, value, className }) {
  return (
    <div className={`bg-white border border-slate-100 rounded-2xl p-4 shadow-sm min-w-0 flex flex-col ${className || ""}`}>
      <p className="text-[12px] text-slate-500">{label}</p>
      <p className="text-lg font-bold text-slate-900 mt-1 leading-tight break-words">{value}</p>
    </div>
  );
}

function InsightList({ title, items, renderItem, emptyMessage }) {
  return (
    <div>
      <h3 className="font-semibold text-slate-800 mb-2 text-sm">{title}</h3>
      {(!items || items.length === 0) ? (
        <div className="text-sm text-slate-500">{emptyMessage || "Sin datos suficientes para mostrar esta sección."}</div>
      ) : (
        <ul className="space-y-2">
          {items.map((it, i) => (
            <li key={it.productId || it.name || it.hour || i} className="flex items-center justify-between bg-slate-50 border border-slate-100 rounded-lg px-3 py-2">
              {renderItem(it)}
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Pedidos en el período" value={summary?.totalOrders ?? 0} />
          <StatCard label="Unidades vendidas" value={summary?.totalItemsSold ?? 0} />
          <StatCard label="Ingresos estimados" value={summary?.totalRevenue ? `$${summary.totalRevenue.toLocaleString('es-CL')}` : '$0'} />
          <StatCard label="Productos distintos vendidos" value={summary?.uniqueProducts ?? 0} />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Citas totales" value={summary?.totalAppointments ?? 0} />
          <StatCard label="Confirmadas" value={summary?.confirmed ?? 0} />
          <StatCard label="Canceladas" value={summary?.cancelled ?? 0} />
          <StatCard label="Tasa de cumplimiento" value={`${summary?.completionRate ?? 0}%`} />
        </div>
      )}

      {/* Details layout: two-column card layout that adapts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {mode === "products" ? (
            <div className="space-y-4">
              <InsightList
                title="Productos más vendidos"
                items={data.topProducts}
                emptyMessage="Aún no hay ventas registradas."
                renderItem={(p) => (
                  <>
                    <span className="truncate max-w-[60%] font-medium">{p.name}</span>
                    <span className="text-sm font-semibold text-slate-800">{p.totalSold} uds.</span>
                  </>
                )}
              />

              <InsightList
                title="Productos con baja rotación"
                items={data.lowProducts}
                emptyMessage="No hay productos de baja rotación en este período."
                renderItem={(p) => (
                  <>
                    <span className="truncate max-w-[60%]">{p.name}</span>
                    <span className="text-sm font-semibold">{p.totalSold} uds.</span>
                  </>
                )}
              />
            </div>
          ) : (
            <div className="space-y-4">
              <InsightList
                title="Horarios con más demanda"
                items={data.busySlots}
                emptyMessage="No hay suficientes citas para estimar horarios pico."
                renderItem={(s) => (
                  <>
                    <span className="font-medium">{s.hour}</span>
                    <span className="text-sm font-semibold">{s.count} citas</span>
                  </>
                )}
              />

              <InsightList
                title="Servicios más solicitados"
                items={data.services}
                emptyMessage="Aún no hay servicios suficientes en el período seleccionado."
                renderItem={(s) => (
                  <>
                    <div className="flex flex-col">
                      <span className="font-medium">{s.name}</span>
                      {s.avgRating && <span className="text-xs text-slate-500">Satisfacción: {s.avgRating.toFixed(1)} / 5</span>}
                    </div>
                    <span className="text-sm font-semibold">{s.total} citas</span>
                  </>
                )}
              />
            </div>
          )}
        </div>

        <aside className="space-y-4">
          <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
            <h4 className="text-sm font-semibold text-slate-800">Alertas e inventario</h4>
            <div className="mt-3">
              {data.inventoryAlerts && data.inventoryAlerts.length > 0 ? (
                <ul className="space-y-2">
                  {data.inventoryAlerts.map((a, i) => (
                    <li key={i} className={`text-sm px-3 py-2 rounded-md ${a.level === 'warning' ? 'bg-amber-50 text-amber-800 border border-amber-200' : 'bg-slate-50 text-slate-700 border border-slate-100'}`}>
                      {a.message}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-sm text-slate-500">No se detectan alertas fuertes de inventario en este período.</div>
              )}
            </div>
          </div>

          <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
            <h4 className="text-sm font-semibold text-slate-800 mb-2">Sugerencias</h4>
            {suggestions && suggestions.length > 0 ? (
              <ul className="list-disc pl-5 text-sm text-slate-600 space-y-2">
                {suggestions.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            ) : (
              <div className="text-sm text-slate-500">Sin sugerencias por el momento.</div>
            )}
          </div>
        </aside>
      </div>
    </section>
  );
}
