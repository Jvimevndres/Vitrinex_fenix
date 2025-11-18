// src/components/MonthlyCalendarEditor.jsx
import { useState, useEffect } from "react";
import { getSpecialDays, upsertSpecialDay, deleteSpecialDay } from "../api/services";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

/**
 * Componente para editar excepciones de calendario (días especiales)
 * Permite marcar días como cerrados o con horarios especiales
 */
export default function MonthlyCalendarEditor({ storeId }) {
  const [specialDays, setSpecialDays] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);

  // Estado del formulario
  const [formData, setFormData] = useState({
    isClosed: false,
    reason: "",
    timeBlocks: [],
  });

  // Estado para agregar nuevo bloque horario
  const [newBlock, setNewBlock] = useState({
    startTime: "09:00",
    endTime: "17:00",
    slotDuration: 30,
  });

  useEffect(() => {
    loadSpecialDays();
  }, [storeId]);

  const loadSpecialDays = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await getSpecialDays(storeId);
      setSpecialDays(response.data);
    } catch (err) {
      console.error("Error al cargar días especiales:", err);
      setError("Error al cargar días especiales");
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

  const handleDateClick = (date) => {
    setSelectedDate(date);
    const existingSpecialDay = getSpecialDayForDate(date);

    if (existingSpecialDay) {
      // Cargar datos existentes
      setFormData({
        isClosed: existingSpecialDay.isClosed,
        reason: existingSpecialDay.reason || "",
        timeBlocks: existingSpecialDay.timeBlocks || [],
      });
    } else {
      // Resetear formulario
      setFormData({
        isClosed: false,
        reason: "",
        timeBlocks: [],
      });
    }

    setShowModal(true);
  };

  const handleSave = async () => {
    if (!selectedDate) return;

    try {
      setError("");

      // Validar que si no está cerrado, tenga bloques horarios o razón
      if (!formData.isClosed && formData.timeBlocks.length === 0 && !formData.reason) {
        setError("Debes marcar como cerrado o agregar bloques horarios");
        return;
      }

      await upsertSpecialDay(storeId, {
        date: formatDateKey(selectedDate),
        isClosed: formData.isClosed,
        reason: formData.reason,
        timeBlocks: formData.isClosed ? [] : formData.timeBlocks,
      });

      await loadSpecialDays();
      setShowModal(false);
      setSelectedDate(null);
    } catch (err) {
      console.error("Error al guardar día especial:", err);
      setError(err.response?.data?.message || "Error al guardar");
    }
  };

  const handleDelete = async () => {
    if (!selectedDate) return;

    if (!window.confirm("¿Eliminar esta excepción de calendario?")) {
      return;
    }

    try {
      setError("");
      await deleteSpecialDay(storeId, formatDateKey(selectedDate));
      await loadSpecialDays();
      setShowModal(false);
      setSelectedDate(null);
    } catch (err) {
      console.error("Error al eliminar día especial:", err);
      setError(err.response?.data?.message || "Error al eliminar");
    }
  };

  const handleAddBlock = () => {
    // Validar horarios
    if (!newBlock.startTime || !newBlock.endTime) {
      setError("Debes especificar hora de inicio y fin");
      return;
    }

    const startMinutes = timeToMinutes(newBlock.startTime);
    const endMinutes = timeToMinutes(newBlock.endTime);

    if (startMinutes >= endMinutes) {
      setError("La hora de inicio debe ser menor que la hora de fin");
      return;
    }

    setFormData({
      ...formData,
      timeBlocks: [...formData.timeBlocks, { ...newBlock }],
    });

    // Reset
    setNewBlock({
      startTime: "09:00",
      endTime: "17:00",
      slotDuration: 30,
    });
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

  // Función para marcar días en el calendario
  const tileClassName = ({ date, view }) => {
    if (view !== "month") return "";

    const specialDay = getSpecialDayForDate(date);
    if (!specialDay) return "";

    return specialDay.isClosed
      ? "special-day-closed"
      : "special-day-special";
  };

  const tileContent = ({ date, view }) => {
    if (view !== "month") return null;

    const specialDay = getSpecialDayForDate(date);
    if (!specialDay) return null;

    return (
      <div className="special-day-marker">
        {specialDay.isClosed ? "🚫" : "⭐"}
      </div>
    );
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
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          Calendario de Excepciones
        </h2>
        <p className="text-gray-600 mt-1">
          Marca días especiales, feriados o cierres temporales
        </p>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Leyenda */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-6 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-xl">🚫</span>
            <span className="text-gray-700">Día cerrado</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xl">⭐</span>
            <span className="text-gray-700">Horario especial</span>
          </div>
        </div>
      </div>

      {/* Calendario */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <style>
          {`
            .react-calendar {
              border: none;
              font-family: inherit;
              width: 100%;
            }
            .react-calendar__tile {
              padding: 1rem;
              position: relative;
            }
            .special-day-closed {
              background-color: #fee;
            }
            .special-day-special {
              background-color: #efe;
            }
            .special-day-marker {
              position: absolute;
              top: 2px;
              right: 2px;
              font-size: 12px;
            }
            .react-calendar__tile:hover {
              background-color: #f3f4f6;
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

      {/* Modal */}
      {showModal && selectedDate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header del modal */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {selectedDate.toLocaleDateString("es-ES", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Configura este día como excepción
                  </p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Formulario */}
              <div className="space-y-4">
                {/* Toggle cerrado */}
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <input
                    type="checkbox"
                    id="isClosed"
                    checked={formData.isClosed}
                    onChange={(e) =>
                      setFormData({ ...formData, isClosed: e.target.checked })
                    }
                    className="w-5 h-5 text-red-600 rounded focus:ring-2 focus:ring-red-500"
                  />
                  <label htmlFor="isClosed" className="text-sm font-medium text-gray-900">
                    Marcar este día como CERRADO
                  </label>
                </div>

                {/* Razón */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Razón (opcional)
                  </label>
                  <input
                    type="text"
                    value={formData.reason}
                    onChange={(e) =>
                      setFormData({ ...formData, reason: e.target.value })
                    }
                    placeholder="Ej: Feriado, Vacaciones, Evento especial..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Bloques horarios (solo si no está cerrado) */}
                {!formData.isClosed && (
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Horarios especiales para este día
                    </label>

                    {/* Lista de bloques existentes */}
                    {formData.timeBlocks.length > 0 && (
                      <div className="space-y-2">
                        {formData.timeBlocks.map((block, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                          >
                            <div className="flex items-center gap-3 text-sm">
                              <span className="font-medium">
                                {block.startTime} - {block.endTime}
                              </span>
                              <span className="text-gray-600">
                                (slots de {block.slotDuration} min)
                              </span>
                            </div>
                            <button
                              onClick={() => handleRemoveBlock(index)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Agregar nuevo bloque */}
                    <div className="border-t border-gray-200 pt-3">
                      <p className="text-xs text-gray-600 mb-2">
                        Agregar nuevo bloque horario:
                      </p>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">
                            Inicio
                          </label>
                          <input
                            type="time"
                            value={newBlock.startTime}
                            onChange={(e) =>
                              setNewBlock({ ...newBlock, startTime: e.target.value })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">
                            Fin
                          </label>
                          <input
                            type="time"
                            value={newBlock.endTime}
                            onChange={(e) =>
                              setNewBlock({ ...newBlock, endTime: e.target.value })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">
                            Slot (min)
                          </label>
                          <input
                            type="number"
                            value={newBlock.slotDuration}
                            onChange={(e) =>
                              setNewBlock({
                                ...newBlock,
                                slotDuration: parseInt(e.target.value),
                              })
                            }
                            min={5}
                            max={480}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleAddBlock}
                        className="mt-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm w-full"
                      >
                        + Agregar Bloque
                      </button>
                    </div>
                  </div>
                )}

                {/* Botones de acción */}
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={handleSave}
                    className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Guardar
                  </button>

                  {getSpecialDayForDate(selectedDate) && (
                    <button
                      onClick={handleDelete}
                      className="px-6 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                    >
                      Eliminar
                    </button>
                  )}

                  <button
                    onClick={() => setShowModal(false)}
                    className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
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
