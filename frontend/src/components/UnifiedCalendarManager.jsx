// src/components/UnifiedCalendarManager.jsx
import { useState, useEffect } from "react";
import { 
  getStoreAvailability, 
  updateStoreAvailability,
  getSpecialDays, 
  upsertSpecialDay, 
  deleteSpecialDay 
} from "../api/services";
import { getStoreById } from "../api/store";
import { FaBan, FaStar } from 'react-icons/fa';
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

const DAY_LABELS = {
  monday: "Lunes",
  tuesday: "Martes",
  wednesday: "Miércoles",
  thursday: "Jueves",
  friday: "Viernes",
  saturday: "Sábado",
  sunday: "Domingo",
};

const DAY_FROM_INDEX = {
  0: "sunday",
  1: "monday",
  2: "tuesday",
  3: "wednesday",
  4: "thursday",
  5: "friday",
  6: "saturday",
};

/**
 * Gestor unificado de calendario
 * Maneja horarios semanales Y días especiales en un solo lugar
 */
export default function UnifiedCalendarManager({ storeId }) {
  const [view, setView] = useState("calendar"); // calendar | weekly
  const [weeklyAvailability, setWeeklyAvailability] = useState([]);
  const [specialDays, setSpecialDays] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);

  // Estado del formulario (para día específico o día de semana)
  const [formData, setFormData] = useState({
    isClosed: false,
    reason: "",
    timeBlocks: [],
  });

  const [newBlock, setNewBlock] = useState({
    startTime: "09:00",
    endTime: "17:00",
    slotDuration: 30,
  });

  useEffect(() => {
    loadData();
  }, [storeId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      
      const [availResponse, specialResponse] = await Promise.all([
        getStoreAvailability(storeId),
        getSpecialDays(storeId),
      ]);

      setWeeklyAvailability(availResponse.data.availability || []);
      setSpecialDays(specialResponse.data || []);
    } catch (err) {
      console.error("Error al cargar datos:", err);
      setError("Error al cargar calendario");
    } finally {
      setLoading(false);
    }
  };

  const formatDateKey = (date) => {
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };

  const getSpecialDayForDate = (date) => {
    const dateKey = formatDateKey(date);
    return specialDays.find((sd) => {
      const sdKey = formatDateKey(sd.date);
      return sdKey === dateKey;
    });
  };

  const getWeeklyConfigForDate = (date) => {
    const dayIndex = new Date(date).getDay();
    const dayName = DAY_FROM_INDEX[dayIndex];
    return weeklyAvailability.find((av) => av.dayOfWeek === dayName);
  };

  // Click en fecha específica del calendario
  const handleDateClick = (date) => {
    setSelectedDate(date);
    setSelectedDay(null);
    
    const specialDay = getSpecialDayForDate(date);
    const weeklyConfig = getWeeklyConfigForDate(date);

    if (specialDay) {
      // Tiene excepción, cargar esos datos
      setFormData({
        isClosed: specialDay.isClosed,
        reason: specialDay.reason || "",
        timeBlocks: specialDay.timeBlocks || [],
      });
    } else if (weeklyConfig) {
      // Usa config semanal, sugerir esos datos
      setFormData({
        isClosed: weeklyConfig.isClosed || false,
        reason: "Excepción basada en horario semanal",
        timeBlocks: weeklyConfig.timeBlocks || [],
      });
    } else {
      // Sin config
      setFormData({
        isClosed: false,
        reason: "",
        timeBlocks: [],
      });
    }

    setShowModal(true);
  };

  // Click en día de la semana (configuración semanal)
  const handleWeekDayClick = (dayName) => {
    setSelectedDay(dayName);
    setSelectedDate(null);

    const weeklyConfig = weeklyAvailability.find((av) => av.dayOfWeek === dayName);

    if (weeklyConfig) {
      setFormData({
        isClosed: weeklyConfig.isClosed || false,
        reason: "",
        timeBlocks: weeklyConfig.timeBlocks || [],
      });
    } else {
      setFormData({
        isClosed: false,
        reason: "",
        timeBlocks: [],
      });
    }

    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      setError("");
      setSaving(true);

      if (selectedDate) {
        // Guardando excepción de fecha específica
        await upsertSpecialDay(storeId, {
          date: formatDateKey(selectedDate),
          isClosed: formData.isClosed,
          reason: formData.reason,
          timeBlocks: formData.isClosed ? [] : formData.timeBlocks,
        });
      } else if (selectedDay) {
        // Guardando configuración semanal
        const updatedAvailability = [...weeklyAvailability];
        const existingIndex = updatedAvailability.findIndex(
          (av) => av.dayOfWeek === selectedDay
        );

        const dayConfig = {
          dayOfWeek: selectedDay,
          isClosed: formData.isClosed,
          timeBlocks: formData.isClosed ? [] : formData.timeBlocks,
        };

        if (existingIndex >= 0) {
          updatedAvailability[existingIndex] = dayConfig;
        } else {
          updatedAvailability.push(dayConfig);
        }

        await updateStoreAvailability(storeId, { availability: updatedAvailability });
      }

      await loadData();
      setShowModal(false);
      setSelectedDate(null);
      setSelectedDay(null);
    } catch (err) {
      console.error("Error al guardar:", err);
      setError(err.response?.data?.message || "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (selectedDate) {
      // Eliminar excepción
      if (!window.confirm("¿Eliminar esta excepción? Se usará el horario semanal.")) {
        return;
      }

      try {
        await deleteSpecialDay(storeId, formatDateKey(selectedDate));
        await loadData();
        setShowModal(false);
        setSelectedDate(null);
      } catch (err) {
        setError("Error al eliminar");
      }
    } else if (selectedDay) {
      // Eliminar config semanal
      if (!window.confirm(`¿Eliminar horarios de ${DAY_LABELS[selectedDay]}?`)) {
        return;
      }

      try {
        const updatedAvailability = weeklyAvailability.filter(
          (av) => av.dayOfWeek !== selectedDay
        );
        await updateStoreAvailability(storeId, { availability: updatedAvailability });
        await loadData();
        setShowModal(false);
        setSelectedDay(null);
      } catch (err) {
        setError("Error al eliminar");
      }
    }
  };

  const handleAddBlock = () => {
    if (!newBlock.startTime || !newBlock.endTime) {
      setError("Especifica hora de inicio y fin");
      return;
    }

    const startMinutes = timeToMinutes(newBlock.startTime);
    const endMinutes = timeToMinutes(newBlock.endTime);

    if (startMinutes >= endMinutes) {
      setError("Hora de inicio debe ser menor que hora de fin");
      return;
    }

    setFormData({
      ...formData,
      timeBlocks: [...formData.timeBlocks, { ...newBlock }],
    });

    setNewBlock({ startTime: "09:00", endTime: "17:00", slotDuration: 30 });
    setError("");
  };

  const handleRemoveBlock = (index) => {
    setFormData({
      ...formData,
      timeBlocks: formData.timeBlocks.filter((_, i) => i !== index),
    });
  };

  const timeToMinutes = (time) => {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  };

  const tileClassName = ({ date, view: calView }) => {
    if (calView !== "month") return "";

    const specialDay = getSpecialDayForDate(date);
    if (specialDay) {
      return specialDay.isClosed ? "special-closed" : "special-custom";
    }

    const weeklyConfig = getWeeklyConfigForDate(date);
    if (weeklyConfig && weeklyConfig.isClosed) {
      return "weekly-closed";
    }

    return "";
  };

  const tileContent = ({ date, view: calView }) => {
    if (calView !== "month") return null;

    const specialDay = getSpecialDayForDate(date);
    if (specialDay) {
      return (
        <div className="tile-marker">
          {specialDay.isClosed ? "🚫" : "⭐"}
        </div>
      );
    }

    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Gestión de Horarios
          </h2>
          <p className="text-gray-600 mt-1">
            Configura tus horarios semanales y excepciones en un solo lugar
          </p>
        </div>

        {/* Toggle vista */}
        <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setView("calendar")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              view === "calendar"
                ? "bg-white shadow text-blue-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            📅 Calendario
          </button>
          <button
            onClick={() => setView("weekly")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              view === "weekly"
                ? "bg-white shadow text-blue-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            📋 Horario Semanal
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Vista Calendario */}
      {view === "calendar" && (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex gap-6 text-sm flex-wrap">
              <div className="flex items-center gap-2">
                <FaBan className="text-red-600" />
                <span className="text-gray-700">Excepción: Cerrado</span>
              </div>
              <div className="flex items-center gap-2">
                <FaStar className="text-yellow-500" />
                <span className="text-gray-700">Excepción: Horario especial</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-200 rounded"></div>
                <span className="text-gray-700">Cerrado semanalmente</span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <style>
              {`
                .react-calendar {
                  border: none;
                  font-family: inherit;
                  width: 100%;
                }
                .react-calendar__tile {
                  padding: 1.2rem 0.5rem;
                  position: relative;
                  min-height: 80px;
                }
                .special-closed {
                  background-color: #fee !important;
                }
                .special-custom {
                  background-color: #efe !important;
                }
                .weekly-closed {
                  background-color: #f5f5f5 !important;
                }
                .tile-marker {
                  position: absolute;
                  top: 4px;
                  right: 4px;
                  font-size: 14px;
                }
                .react-calendar__tile:hover {
                  background-color: #e5e7eb !important;
                  cursor: pointer;
                }
                .react-calendar__tile--active {
                  background-color: #3b82f6 !important;
                  color: white;
                }
              `}
            </style>
            <Calendar
              onClickDay={handleDateClick}
              tileClassName={tileClassName}
              tileContent={tileContent}
              locale="es-ES"
              minDate={new Date()}
            />
          </div>
        </div>
      )}

      {/* Vista Semanal */}
      {view === "weekly" && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Object.entries(DAY_LABELS).map(([dayName, label]) => {
            const config = weeklyAvailability.find((av) => av.dayOfWeek === dayName);
            const isClosed = config?.isClosed || false;
            const blocks = config?.timeBlocks || [];

            return (
              <div
                key={dayName}
                onClick={() => handleWeekDayClick(dayName)}
                className={`bg-white border-2 rounded-xl p-5 cursor-pointer transition-all hover:shadow-lg ${
                  isClosed
                    ? "border-red-200 bg-red-50"
                    : blocks.length > 0
                    ? "border-green-200 bg-green-50"
                    : "border-gray-200 hover:border-blue-300"
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-bold text-gray-900">{label}</h3>
                  {isClosed ? (
                    <span className="text-xl">🚫</span>
                  ) : blocks.length > 0 ? (
                    <span className="text-xl">✅</span>
                  ) : (
                    <span className="text-xl">⚠️</span>
                  )}
                </div>

                {isClosed ? (
                  <p className="text-sm text-red-700 font-medium">Cerrado</p>
                ) : blocks.length > 0 ? (
                  <div className="space-y-1">
                    {blocks.map((block, idx) => (
                      <div key={idx} className="text-sm text-gray-700">
                        <span className="font-medium">
                          {block.startTime} - {block.endTime}
                        </span>
                        <span className="text-gray-500 text-xs ml-2">
                          (slots {block.slotDuration}min)
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Sin configurar</p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Editor */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {selectedDate
                      ? new Date(selectedDate).toLocaleDateString("es-ES", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : `Configurar ${DAY_LABELS[selectedDay]}`}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {selectedDate
                      ? "Excepción para esta fecha específica"
                      : "Configuración semanal recurrente"}
                  </p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Formulario */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <input
                    type="checkbox"
                    id="isClosed"
                    checked={formData.isClosed}
                    onChange={(e) => setFormData({ ...formData, isClosed: e.target.checked })}
                    className="w-5 h-5 text-red-600 rounded"
                  />
                  <label htmlFor="isClosed" className="text-sm font-medium text-gray-900">
                    Marcar como CERRADO
                  </label>
                </div>

                {selectedDate && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Razón (opcional)
                    </label>
                    <input
                      type="text"
                      value={formData.reason}
                      onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                      placeholder="Ej: Feriado, Vacaciones..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                )}

                {!formData.isClosed && (
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Bloques Horarios
                    </label>

                    {formData.timeBlocks.map((block, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium">
                          {block.startTime} - {block.endTime} (slots {block.slotDuration}min)
                        </span>
                        <button onClick={() => handleRemoveBlock(index)} className="text-red-600">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    ))}

                    <div className="border-t pt-3">
                      <p className="text-xs text-gray-600 mb-2">Agregar bloque:</p>
                      <div className="grid grid-cols-3 gap-2">
                        <input
                          type="time"
                          value={newBlock.startTime}
                          onChange={(e) => setNewBlock({ ...newBlock, startTime: e.target.value })}
                          className="px-3 py-2 border rounded-lg text-sm"
                        />
                        <input
                          type="time"
                          value={newBlock.endTime}
                          onChange={(e) => setNewBlock({ ...newBlock, endTime: e.target.value })}
                          className="px-3 py-2 border rounded-lg text-sm"
                        />
                        <input
                          type="number"
                          value={newBlock.slotDuration}
                          onChange={(e) => setNewBlock({ ...newBlock, slotDuration: parseInt(e.target.value) })}
                          min={5}
                          max={480}
                          className="px-3 py-2 border rounded-lg text-sm"
                        />
                      </div>
                      <button
                        onClick={handleAddBlock}
                        className="mt-2 w-full px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 text-sm"
                      >
                        + Agregar Bloque
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-4 border-t">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {saving ? "Guardando..." : "Guardar"}
                  </button>

                  {((selectedDate && getSpecialDayForDate(selectedDate)) ||
                    (selectedDay && weeklyAvailability.find((av) => av.dayOfWeek === selectedDay))) && (
                    <button
                      onClick={handleDelete}
                      className="px-6 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                    >
                      Eliminar
                    </button>
                  )}

                  <button
                    onClick={() => setShowModal(false)}
                    className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
