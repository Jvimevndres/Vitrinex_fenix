// frontend/src/components/WeeklyScheduleEditor.jsx
import { useState, useEffect, useMemo } from "react";
import { getStoreAvailability, updateStoreAvailability } from "../api/store";

const DAYS = [
  { value: "monday", label: "Lunes", short: "L" },
  { value: "tuesday", label: "Martes", short: "M" },
  { value: "wednesday", label: "Miércoles", short: "X" },
  { value: "thursday", label: "Jueves", short: "J" },
  { value: "friday", label: "Viernes", short: "V" },
  { value: "saturday", label: "Sábado", short: "S" },
  { value: "sunday", label: "Domingo", short: "D" },
];

const TIME_REGEX = /^([01]?\d|2[0-3]):[0-5]\d$/;

const normalizeTime = (time) => {
  if (!time || !TIME_REGEX.test(time.trim())) return "";
  const [h, m] = time.trim().split(":");
  return `${h.padStart(2, "0")}:${m}`;
};

const timeToMinutes = (time) => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};

export default function WeeklyScheduleEditor({ storeId }) {
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedDay, setSelectedDay] = useState("monday");
  const [viewMode, setViewMode] = useState("week"); // 'week' | 'day'

  // Estados para el modal de agregar bloque
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [blockForm, setBlockForm] = useState({
    startTime: "09:00",
    endTime: "17:00",
    slotDuration: 30,
  });

  useEffect(() => {
    loadAvailability();
  }, [storeId]);

  const loadAvailability = async () => {
    try {
      setLoading(true);
      setError("");
      const { data } = await getStoreAvailability(storeId);
      
      // Migrar formato antiguo si es necesario
      const migrated = migrateOldFormatClient(data.availability || []);
      setAvailability(migrated);
    } catch (err) {
      console.error("Error cargando horarios:", err);
      setError(err?.response?.data?.message || "Error al cargar horarios");
    } finally {
      setLoading(false);
    }
  };

  // Migración cliente del formato antiguo (slots) a nuevo (timeBlocks)
  const migrateOldFormatClient = (avail) => {
    return avail.map((entry) => {
      if (entry.timeBlocks && entry.timeBlocks.length > 0) {
        return entry;
      }
      
      if (entry.slots && entry.slots.length > 0) {
        const sorted = entry.slots.map(s => normalizeTime(s)).filter(Boolean).sort();
        if (sorted.length > 0) {
          return {
            ...entry,
            timeBlocks: [{
              startTime: sorted[0],
              endTime: sorted[sorted.length - 1],
              slotDuration: 30,
            }],
          };
        }
      }
      
      return { ...entry, timeBlocks: entry.timeBlocks || [] };
    });
  };

  const getDayConfig = (dayValue) => {
    return availability.find((a) => a.dayOfWeek === dayValue) || {
      dayOfWeek: dayValue,
      isClosed: false,
      timeBlocks: [],
    };
  };

  const toggleDayClosed = (dayValue) => {
    setAvailability((prev) => {
      const exists = prev.find((a) => a.dayOfWeek === dayValue);
      if (exists) {
        return prev.map((a) =>
          a.dayOfWeek === dayValue
            ? { ...a, isClosed: !a.isClosed, timeBlocks: a.isClosed ? a.timeBlocks : [] }
            : a
        );
      } else {
        return [...prev, { dayOfWeek: dayValue, isClosed: true, timeBlocks: [] }];
      }
    });
  };

  const addTimeBlock = (dayValue) => {
    const normalized = {
      startTime: normalizeTime(blockForm.startTime),
      endTime: normalizeTime(blockForm.endTime),
      slotDuration: parseInt(blockForm.slotDuration) || 30,
    };

    if (!normalized.startTime || !normalized.endTime) {
      setError("Horarios inválidos. Usa formato HH:MM");
      return;
    }

    if (timeToMinutes(normalized.startTime) >= timeToMinutes(normalized.endTime)) {
      setError("La hora de inicio debe ser menor que la de fin");
      return;
    }

    setAvailability((prev) => {
      const exists = prev.find((a) => a.dayOfWeek === dayValue);
      if (exists) {
        return prev.map((a) =>
          a.dayOfWeek === dayValue
            ? {
                ...a,
                timeBlocks: [...(a.timeBlocks || []), normalized].sort(
                  (x, y) => timeToMinutes(x.startTime) - timeToMinutes(y.startTime)
                ),
              }
            : a
        );
      } else {
        return [
          ...prev,
          {
            dayOfWeek: dayValue,
            isClosed: false,
            timeBlocks: [normalized],
          },
        ];
      }
    });

    setShowBlockModal(false);
    setBlockForm({ startTime: "09:00", endTime: "17:00", slotDuration: 30 });
    setError("");
  };

  const removeTimeBlock = (dayValue, blockIndex) => {
    setAvailability((prev) =>
      prev
        .map((a) =>
          a.dayOfWeek === dayValue
            ? {
                ...a,
                timeBlocks: a.timeBlocks.filter((_, i) => i !== blockIndex),
              }
            : a
        )
        .filter((a) => a.timeBlocks.length > 0 || a.isClosed)
    );
  };

  const copyToOtherDays = (sourceDay) => {
    const source = getDayConfig(sourceDay);
    if (!source.timeBlocks || source.timeBlocks.length === 0) {
      setError("El día de origen no tiene horarios configurados");
      return;
    }

    const targetDays = DAYS.filter((d) => d.value !== sourceDay).map((d) => d.value);
    const confirmed = window.confirm(
      `¿Copiar los horarios de ${DAYS.find((d) => d.value === sourceDay)?.label} a los otros 6 días?`
    );
    
    if (!confirmed) return;

    setAvailability((prev) => {
      const newAvail = [...prev];
      
      targetDays.forEach((targetDay) => {
        const targetIndex = newAvail.findIndex((a) => a.dayOfWeek === targetDay);
        const copied = {
          dayOfWeek: targetDay,
          isClosed: source.isClosed,
          timeBlocks: [...(source.timeBlocks || [])],
        };
        
        if (targetIndex >= 0) {
          newAvail[targetIndex] = copied;
        } else {
          newAvail.push(copied);
        }
      });
      
      return newAvail;
    });

    setSuccess(`Horarios copiados a ${targetDays.length} días`);
    setTimeout(() => setSuccess(""), 3000);
  };

  const saveSchedule = async () => {
    try {
      setSaving(true);
      setError("");
      setSuccess("");

      await updateStoreAvailability(storeId, availability);

      setSuccess("✅ Horarios guardados correctamente");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Error guardando horarios:", err);
      const msg = err?.response?.data?.message || "Error al guardar horarios";
      const errors = err?.response?.data?.errors;
      
      if (errors) {
        setError(`${msg}: ${JSON.stringify(errors)}`);
      } else {
        setError(msg);
      }
    } finally {
      setSaving(false);
    }
  };

  const selectedDayConfig = useMemo(() => getDayConfig(selectedDay), [availability, selectedDay]);

  if (loading) {
    return (
      <div className="bg-white border rounded-2xl p-6 shadow-sm">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-slate-200 rounded w-1/3"></div>
          <div className="h-32 bg-slate-100 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border rounded-2xl p-6 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h3 className="text-xl font-bold text-slate-800">📅 Horarios de Atención</h3>
          <p className="text-sm text-slate-500 mt-1">
            Configura los horarios en que los clientes pueden agendar citas
          </p>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode(viewMode === "week" ? "day" : "week")}
            className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition"
          >
            {viewMode === "week" ? "Vista Día" : "Vista Semana"}
          </button>
          
          <button
            onClick={saveSchedule}
            disabled={saving}
            className="px-6 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm"
          >
            {saving ? "Guardando..." : "💾 Guardar Horarios"}
          </button>
        </div>
      </div>

      {/* Mensajes */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
          {success}
        </div>
      )}

      {/* Vista Semana Completa */}
      {viewMode === "week" && (
        <div className="grid grid-cols-1 lg:grid-cols-7 gap-3">
          {DAYS.map((day) => {
            const config = getDayConfig(day.value);
            const blocks = config.timeBlocks || [];
            
            return (
              <div
                key={day.value}
                className={`border-2 rounded-xl p-4 transition cursor-pointer hover:shadow-md ${
                  selectedDay === day.value
                    ? "border-blue-500 bg-blue-50"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
                onClick={() => setSelectedDay(day.value)}
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">{day.short}</h4>
                    <p className="text-xs text-slate-500">{day.label}</p>
                  </div>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleDayClosed(day.value);
                    }}
                    className={`text-xs px-2 py-1 rounded font-medium transition ${
                      config.isClosed
                        ? "bg-red-100 text-red-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {config.isClosed ? "Cerrado" : "Abierto"}
                  </button>
                </div>

                {!config.isClosed && (
                  <div className="space-y-1">
                    {blocks.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">Sin horarios</p>
                    ) : (
                      blocks.map((block, idx) => (
                        <div
                          key={idx}
                          className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded font-medium"
                        >
                          {block.startTime} - {block.endTime}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Vista Detalle de Día Seleccionado */}
      <div className="border-t pt-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-bold text-slate-800">
            {DAYS.find((d) => d.value === selectedDay)?.label}
          </h4>
          
          <div className="flex gap-2">
            <button
              onClick={() => copyToOtherDays(selectedDay)}
              className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition"
              disabled={selectedDayConfig.isClosed || selectedDayConfig.timeBlocks?.length === 0}
            >
              📋 Copiar a otros días
            </button>
            
            <button
              onClick={() => toggleDayClosed(selectedDay)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                selectedDayConfig.isClosed
                  ? "bg-green-100 text-green-700 hover:bg-green-200"
                  : "bg-red-100 text-red-700 hover:bg-red-200"
              }`}
            >
              {selectedDayConfig.isClosed ? "✓ Marcar Abierto" : "✕ Marcar Cerrado"}
            </button>
          </div>
        </div>

        {!selectedDayConfig.isClosed && (
          <div className="space-y-3">
            {/* Bloques existentes */}
            {selectedDayConfig.timeBlocks && selectedDayConfig.timeBlocks.length > 0 ? (
              <div className="space-y-2">
                {selectedDayConfig.timeBlocks.map((block, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-lg p-4"
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-slate-800">
                        🕐 {block.startTime} - {block.endTime}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        Duración de cita: {block.slotDuration} minutos
                      </p>
                    </div>
                    
                    <button
                      onClick={() => removeTimeBlock(selectedDay, idx)}
                      className="text-red-600 hover:text-red-800 font-medium text-sm px-3 py-1 rounded hover:bg-red-50 transition"
                    >
                      🗑️ Eliminar
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500 italic text-center py-4">
                No hay bloques horarios configurados para este día
              </p>
            )}

            {/* Botón agregar bloque */}
            <button
              onClick={() => setShowBlockModal(true)}
              className="w-full py-3 border-2 border-dashed border-slate-300 rounded-lg text-slate-600 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition font-medium"
            >
              ➕ Agregar Bloque Horario
            </button>
          </div>
        )}

        {selectedDayConfig.isClosed && (
          <div className="text-center py-8 text-slate-500">
            <p className="text-4xl mb-2">🚫</p>
            <p className="font-medium">Este día está marcado como cerrado</p>
            <p className="text-sm mt-1">No se aceptarán citas</p>
          </div>
        )}
      </div>

      {/* Modal Agregar Bloque */}
      {showBlockModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-bold text-slate-800 mb-4">
              ➕ Nuevo Bloque Horario
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Hora de inicio
                </label>
                <input
                  type="time"
                  value={blockForm.startTime}
                  onChange={(e) => setBlockForm({ ...blockForm, startTime: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Hora de fin
                </label>
                <input
                  type="time"
                  value={blockForm.endTime}
                  onChange={(e) => setBlockForm({ ...blockForm, endTime: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Duración de cada cita (minutos)
                </label>
                <select
                  value={blockForm.slotDuration}
                  onChange={(e) => setBlockForm({ ...blockForm, slotDuration: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="15">15 minutos</option>
                  <option value="30">30 minutos</option>
                  <option value="45">45 minutos</option>
                  <option value="60">1 hora</option>
                  <option value="90">1.5 horas</option>
                  <option value="120">2 horas</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowBlockModal(false);
                  setError("");
                }}
                className="flex-1 px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition"
              >
                Cancelar
              </button>
              <button
                onClick={() => addTimeBlock(selectedDay)}
                className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition"
              >
                Agregar Bloque
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
