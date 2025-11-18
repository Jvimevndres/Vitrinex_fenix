// src/components/MonthlyCalendarViewer.jsx
import { useState, useEffect } from "react";
import Calendar from "react-calendar";
import { getStoreAvailability } from "../api/services";
import "react-calendar/dist/Calendar.css";

const DAYS_MAP = {
  0: "sunday",
  1: "monday",
  2: "tuesday",
  3: "wednesday",
  4: "thursday",
  5: "friday",
  6: "saturday",
};

export default function MonthlyCalendarViewer({ storeId }) {
  const [availability, setAvailability] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAvailability();
  }, [storeId]);

  const loadAvailability = async () => {
    try {
      setLoading(true);
      const { data } = await getStoreAvailability(storeId);
      setAvailability(Array.isArray(data.availability) ? data.availability : []);
    } catch (err) {
      console.error("Error al cargar disponibilidad:", err);
    } finally {
      setLoading(false);
    }
  };

  const getDayConfig = (date) => {
    const dayOfWeek = DAYS_MAP[date.getDay()];
    return availability.find((a) => a.dayOfWeek === dayOfWeek);
  };

  const tileClassName = ({ date, view }) => {
    if (view !== "month") return null;

    const config = getDayConfig(date);
    if (!config || config.isClosed || !config.timeBlocks?.length) {
      return "calendar-day-closed";
    }
    return "calendar-day-available";
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
    setShowModal(true);
  };

  const getSelectedDayConfig = () => {
    if (!selectedDate) return null;
    return getDayConfig(selectedDate);
  };

  if (loading) {
    return (
      <div className="bg-white border rounded-2xl p-6 shadow-sm">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-slate-200 rounded w-48"></div>
          <div className="h-80 bg-slate-100 rounded"></div>
        </div>
      </div>
    );
  }

  const selectedConfig = getSelectedDayConfig();

  return (
    <div className="bg-white border rounded-2xl p-6 shadow-sm space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-xl font-bold text-slate-800">
          📆 Vista de Calendario Mensual
        </h3>
        <div className="mt-2 space-y-2">
          <p className="text-sm text-slate-600">
            Aquí ves cómo se aplicará tu <strong>Horario Semanal</strong> a cada día del mes.
          </p>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p className="text-xs text-amber-800 font-medium mb-1">
              💡 ¿Necesitas cerrar un día específico o cambiar su horario?
            </p>
            <p className="text-xs text-amber-700">
              Para cerrar el jueves 27 pero dejar abierto el jueves 20, debes crear una <strong>excepción</strong> en ese día específico.
              Ve a <strong>"Horarios y Excepciones"</strong> en el menú lateral para agregar días especiales.
            </p>
          </div>
        </div>
      </div>

      {/* Leyenda */}
      <div className="flex flex-wrap gap-4 p-4 bg-slate-50 rounded-lg">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-400 rounded"></div>
          <span className="text-xs text-slate-600">Con horarios</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-slate-200 rounded"></div>
          <span className="text-xs text-slate-600">Cerrado / Sin configurar</span>
        </div>
      </div>

      {/* Calendario */}
      <div className="calendar-container">
        <Calendar
          onClickDay={handleDateClick}
          tileClassName={tileClassName}
          locale="es-ES"
          className="custom-calendar"
        />
      </div>

      {/* Modal de información */}
      {showModal && selectedDate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full">
            <div className="border-b border-slate-200 p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-800">
                  {selectedDate.toLocaleDateString("es-ES", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-slate-400 hover:text-slate-600 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6">
              {!selectedConfig || selectedConfig.isClosed || !selectedConfig.timeBlocks?.length ? (
                <div className="text-center py-8">
                  <div className="text-5xl mb-4">🚫</div>
                  <p className="text-slate-600 font-medium">
                    Este día no tiene horarios configurados
                  </p>
                  <p className="text-sm text-slate-500 mt-2">
                    Ve a "Horario Semanal" para configurar la disponibilidad
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-green-600">
                    <span className="text-2xl">✅</span>
                    <span className="font-semibold">Día disponible</span>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-slate-700 mb-2">
                      Bloques de horario:
                    </h4>
                    <div className="space-y-2">
                      {selectedConfig.timeBlocks.map((block, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-lg">🕐</span>
                            <span className="font-medium text-slate-800">
                              {block.startTime} - {block.endTime}
                            </span>
                          </div>
                          <span className="text-xs text-green-700 bg-green-100 px-2 py-1 rounded">
                            Slots de {block.slotDuration}min
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-xs text-blue-800">
                      💡 <strong>Nota:</strong> Para modificar estos horarios, ve a la pestaña
                      "Horario Semanal" y edita el día correspondiente.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-slate-200 p-6">
              <button
                onClick={() => setShowModal(false)}
                className="w-full px-4 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .calendar-container {
          display: flex;
          justify-content: center;
        }

        .custom-calendar {
          border: none;
          width: 100%;
          max-width: 600px;
          font-family: inherit;
        }

        .custom-calendar .react-calendar__tile {
          padding: 1rem;
          position: relative;
          border-radius: 0.5rem;
          transition: all 0.2s;
        }

        .custom-calendar .react-calendar__tile:hover {
          background-color: #f1f5f9;
        }

        .custom-calendar .react-calendar__tile--active {
          background-color: #3b82f6 !important;
          color: white;
        }

        .calendar-day-available {
          background-color: #86efac !important;
          color: #166534;
          font-weight: 600;
        }

        .calendar-day-available:hover {
          background-color: #4ade80 !important;
        }

        .calendar-day-closed {
          background-color: #f1f5f9;
          color: #94a3b8;
        }

        .custom-calendar .react-calendar__month-view__days__day--weekend {
          color: inherit;
        }

        .custom-calendar .react-calendar__navigation button {
          font-size: 1rem;
          font-weight: 600;
          padding: 0.75rem;
          border-radius: 0.5rem;
          transition: background-color 0.2s;
        }

        .custom-calendar .react-calendar__navigation button:hover {
          background-color: #f1f5f9;
        }
      `}</style>
    </div>
  );
}
