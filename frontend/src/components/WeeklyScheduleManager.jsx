// src/components/WeeklyScheduleManager.jsx
import { useState, useEffect } from "react";
import { getStoreAvailability, updateStoreAvailability } from "../api/services";

const DAYS = [
  { key: "monday", label: "Lunes", short: "L" },
  { key: "tuesday", label: "Martes", short: "M" },
  { key: "wednesday", label: "Miércoles", short: "X" },
  { key: "thursday", label: "Jueves", short: "J" },
  { key: "friday", label: "Viernes", short: "V" },
  { key: "saturday", label: "Sábado", short: "S" },
  { key: "sunday", label: "Domingo", short: "D" },
];

// Función auxiliar para obtener el lunes de una semana específica
const getMondayOfWeek = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
};

export default function WeeklyScheduleManager({ storeId }) {
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  // 🆕 Navegación de semanas
  const [currentWeekStart, setCurrentWeekStart] = useState(getMondayOfWeek(new Date()));
  
  // Estado para el modal de edición
  const [showModal, setShowModal] = useState(false);
  const [editingDay, setEditingDay] = useState(null);
  const [dayConfig, setDayConfig] = useState({
    isClosed: false,
    timeBlocks: [],
  });

  useEffect(() => {
    loadAvailability();
  }, [storeId]);

  const loadAvailability = async () => {
    try {
      setLoading(true);
      setError("");
      const { data } = await getStoreAvailability(storeId);
      setAvailability(Array.isArray(data.availability) ? data.availability : []);
    } catch (err) {
      console.error("Error al cargar disponibilidad:", err);
      setError("No se pudo cargar la configuración");
    } finally {
      setLoading(false);
    }
  };

  const getDayConfig = (dayKey) => {
    return availability.find((a) => a.dayOfWeek === dayKey) || {
      dayOfWeek: dayKey,
      isClosed: true,
      timeBlocks: [],
    };
  };

  const handleEditDay = (dayKey) => {
    const config = getDayConfig(dayKey);
    setEditingDay(dayKey);
    setDayConfig({
      isClosed: config.isClosed || false,
      timeBlocks: config.timeBlocks || [],
    });
    setShowModal(true);
  };

  const handleAddBlock = () => {
    setDayConfig((prev) => ({
      ...prev,
      timeBlocks: [
        ...prev.timeBlocks,
        {
          startTime: "09:00",
          endTime: "18:00",
          slotDuration: 30,
        },
      ],
    }));
  };

  const handleUpdateBlock = (index, field, value) => {
    setDayConfig((prev) => ({
      ...prev,
      timeBlocks: prev.timeBlocks.map((block, i) =>
        i === index ? { ...block, [field]: value } : block
      ),
    }));
  };

  const handleDeleteBlock = (index) => {
    setDayConfig((prev) => ({
      ...prev,
      timeBlocks: prev.timeBlocks.filter((_, i) => i !== index),
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError("");
      setSuccess("");

      // Actualizar availability
      const updatedAvailability = availability.filter(
        (a) => a.dayOfWeek !== editingDay
      );

      updatedAvailability.push({
        dayOfWeek: editingDay,
        isClosed: dayConfig.isClosed,
        timeBlocks: dayConfig.isClosed ? [] : dayConfig.timeBlocks,
      });

      await updateStoreAvailability(storeId, { availability: updatedAvailability });

      setAvailability(updatedAvailability);
      setShowModal(false);
      setSuccess(`✅ ${DAYS.find(d => d.key === editingDay)?.label} actualizado`);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Error al guardar:", err);
      setError(err.response?.data?.message || "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  const handleCopyDay = (fromDay) => {
    const config = getDayConfig(fromDay);
    setDayConfig({
      isClosed: config.isClosed || false,
      timeBlocks: JSON.parse(JSON.stringify(config.timeBlocks || [])),
    });
  };

  // 🆕 Navegación de semanas
  const goToPreviousWeek = () => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentWeekStart(newDate);
  };

  const goToNextWeek = () => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentWeekStart(newDate);
  };

  const goToCurrentWeek = () => {
    setCurrentWeekStart(getMondayOfWeek(new Date()));
  };

  // Obtener fechas de la semana actual
  const getWeekDates = () => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(currentWeekStart);
      date.setDate(date.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const weekDates = getWeekDates();
  const weekTitle = `${weekDates[0].getDate()} ${weekDates[0].toLocaleDateString('es-ES', { month: 'short' })} - ${weekDates[6].getDate()} ${weekDates[6].toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })}`;

  if (loading) {
    return (
      <div className="bg-white border rounded-2xl p-6 shadow-sm">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-slate-200 rounded w-48"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <div key={i} className="h-20 bg-slate-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border rounded-2xl p-6 shadow-sm space-y-6">
      {/* Header con navegación */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xl font-bold text-slate-800">
            📅 Horario Semanal
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={goToPreviousWeek}
              className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              title="Semana anterior"
            >
              ◀
            </button>
            <button
              onClick={goToCurrentWeek}
              className="px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors"
            >
              Hoy
            </button>
            <button
              onClick={goToNextWeek}
              className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              title="Semana siguiente"
            >
              ▶
            </button>
          </div>
        </div>
        <p className="text-sm font-semibold text-slate-600">
          {weekTitle}
        </p>
        <div className="mt-2 bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-xs text-blue-800 font-medium mb-1">
            ℹ️ Horario Semanal = Plantilla para todos los días
          </p>
          <p className="text-xs text-blue-700">
            Al configurar un día aquí (ej: Jueves 09:00-18:00), ese horario se aplicará a <strong>todos los jueves</strong>.
            Para tener días específicos diferentes (ej: cerrar un jueves en particular), usa <strong>"Vista de Calendario Mensual"</strong>.
          </p>
        </div>
      </div>

      {/* Mensajes */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm text-green-600">
          {success}
        </div>
      )}

      {/* Lista de días con fechas */}
      <div className="space-y-3">
        {DAYS.map((day, index) => {
          const config = getDayConfig(day.key);
          const isConfigured = !config.isClosed && config.timeBlocks?.length > 0;
          const dateForDay = weekDates[index];
          const isToday = dateForDay.toDateString() === new Date().toDateString();

          return (
            <div
              key={day.key}
              className={`border-2 rounded-xl p-4 transition-all ${
                isConfigured
                  ? "border-green-200 bg-green-50"
                  : "border-slate-200 bg-slate-50"
              } ${isToday ? "ring-2 ring-blue-400" : ""}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col">
                      <h4 className="font-bold text-slate-800">{day.label}</h4>
                      <span className="text-xs text-slate-500">
                        {dateForDay.getDate()} de {dateForDay.toLocaleDateString('es-ES', { month: 'long' })}
                        {isToday && " • HOY"}
                      </span>
                    </div>
                    {config.isClosed ? (
                      <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                        🚫 Cerrado
                      </span>
                    ) : isConfigured ? (
                      <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                        ✅ Configurado
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                        ⚠️ Sin horarios
                      </span>
                    )}
                  </div>

                  {isConfigured && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {config.timeBlocks.map((block, idx) => (
                        <span
                          key={idx}
                          className="text-xs bg-white border border-green-200 text-green-700 px-2 py-1 rounded"
                        >
                          {block.startTime} - {block.endTime} (slots {block.slotDuration}min)
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => handleEditDay(day.key)}
                  className="px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-blue-200"
                >
                  ✏️ Editar
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal de edición */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 p-6">
              <h3 className="text-xl font-bold text-slate-800">
                Configurar {DAYS.find((d) => d.key === editingDay)?.label}
              </h3>
            </div>

            <div className="p-6 space-y-6">
              {/* Toggle cerrado */}
              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                <input
                  type="checkbox"
                  id="isClosed"
                  checked={dayConfig.isClosed}
                  onChange={(e) =>
                    setDayConfig((prev) => ({
                      ...prev,
                      isClosed: e.target.checked,
                      timeBlocks: e.target.checked ? [] : prev.timeBlocks,
                    }))
                  }
                  className="w-5 h-5 rounded border-slate-300"
                />
                <label htmlFor="isClosed" className="text-sm font-medium text-slate-700">
                  🚫 Marcar como día cerrado (no hay atención)
                </label>
              </div>

              {/* Copiar desde otro día */}
              {!dayConfig.isClosed && (
                <div className="border border-blue-200 bg-blue-50 rounded-lg p-4">
                  <p className="text-sm font-semibold text-blue-800 mb-3">
                    📋 Copiar horarios desde otro día:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {DAYS.filter((d) => d.key !== editingDay).map((day) => (
                      <button
                        key={day.key}
                        type="button"
                        onClick={() => handleCopyDay(day.key)}
                        className="px-3 py-1.5 text-xs font-medium text-blue-700 bg-white hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors"
                      >
                        {day.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Bloques de tiempo */}
              {!dayConfig.isClosed && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-slate-800">
                      Bloques de Horario
                    </h4>
                    <button
                      onClick={handleAddBlock}
                      className="px-3 py-1.5 text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg transition-colors"
                    >
                      + Agregar bloque
                    </button>
                  </div>

                  {dayConfig.timeBlocks.length === 0 ? (
                    <div className="text-center py-8 text-slate-500 text-sm">
                      No hay bloques de horario. Haz clic en "Agregar bloque" para comenzar.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {dayConfig.timeBlocks.map((block, index) => (
                        <div
                          key={index}
                          className="border border-slate-200 rounded-lg p-4 space-y-3"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-slate-600">
                              Bloque {index + 1}
                            </span>
                            <button
                              onClick={() => handleDeleteBlock(index)}
                              className="text-red-600 hover:text-red-700 text-sm font-medium"
                            >
                              🗑️ Eliminar
                            </button>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-medium text-slate-600 mb-1">
                                Hora inicio
                              </label>
                              <input
                                type="time"
                                value={block.startTime}
                                onChange={(e) =>
                                  handleUpdateBlock(index, "startTime", e.target.value)
                                }
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-medium text-slate-600 mb-1">
                                Hora fin
                              </label>
                              <input
                                type="time"
                                value={block.endTime}
                                onChange={(e) =>
                                  handleUpdateBlock(index, "endTime", e.target.value)
                                }
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">
                              Duración de cada slot (minutos)
                            </label>
                            <select
                              value={block.slotDuration}
                              onChange={(e) =>
                                handleUpdateBlock(
                                  index,
                                  "slotDuration",
                                  Number(e.target.value)
                                )
                              }
                              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                            >
                              <option value={15}>15 minutos</option>
                              <option value={30}>30 minutos</option>
                              <option value={45}>45 minutos</option>
                              <option value={60}>60 minutos</option>
                            </select>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer del modal */}
            <div className="sticky bottom-0 bg-slate-50 border-t border-slate-200 p-6 flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 px-4 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {saving ? "Guardando..." : "✅ Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
