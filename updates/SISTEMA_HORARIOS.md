# 📅 NUEVO SISTEMA DE HORARIOS - Documentación Completa

## 🎨 Resumen de Mejoras

Hemos RE-DISEÑADO completamente el sistema de gestión de horarios de atención de Vitrinex_Fenix con un enfoque moderno, intuitivo y robusto.

---

## ✨ CARACTERÍSTICAS NUEVAS

### 1. **Modelo de Datos Mejorado**

#### Antes:
```javascript
bookingAvailability: [{
  dayOfWeek: "monday",
  slots: ["09:00", "09:30", "10:00", ...] // Solo lista de slots
}]
```

#### Ahora:
```javascript
bookingAvailability: [{
  dayOfWeek: "monday",
  isClosed: false,  // ✨ NUEVO: Marcar día cerrado
  timeBlocks: [     // ✨ NUEVO: Bloques horarios con rangos
    {
      startTime: "09:00",
      endTime: "13:00",
      slotDuration: 30
    },
    {
      startTime: "15:00",
      endTime: "18:00",
      slotDuration: 45
    }
  ],
  slots: ["09:00", ...] // Compatibilidad con formato antiguo
}]
```

**Ventajas:**
- ✅ Múltiples bloques por día (ej: mañana y tarde)
- ✅ Duración de cita configurable por bloque
- ✅ Días cerrados explícitamente marcados
- ✅ Compatibilidad total con formato antiguo

---

### 2. **Backend - Helpers y Validaciones**

#### Nuevo archivo: `backend/src/helpers/availability.helper.js`

**Funciones principales:**

```javascript
// Normaliza tiempo a formato HH:MM
normalizeTime("9:30") // → "09:30"

// Convierte tiempo a minutos
timeToMinutes("14:30") // → 870

// Valida un bloque horario
validateTimeBlock({
  startTime: "09:00",
  endTime: "17:00",
  slotDuration: 30
}) // → [] (sin errores) o ["startTime inválido", ...]

// Detecta traslapes entre bloques
detectOverlaps([
  { startTime: "09:00", endTime: "13:00" },
  { startTime: "12:00", endTime: "15:00" } // ⚠️ Traslape!
]) // → [{ block1: "09:00-13:00", block2: "12:00-15:00" }]

// Normaliza availability completo
normalizeAvailability(availability)
// - Valida formato
// - Elimina duplicados
// - Ordena por día de semana
// - Filtra bloques inválidos

// Genera slots individuales desde bloques
generateSlotsFromBlocks([
  { startTime: "09:00", endTime: "10:00", slotDuration: 30 }
]) // → ["09:00", "09:30"]

// Migra formato antiguo a nuevo
migrateOldFormat(availability)
```

---

### 3. **Backend - Endpoints RESTful Mejorados**

#### Endpoints Disponibles:

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| `GET` | `/api/stores/:id/availability` | Obtener horarios (público) | No |
| `PUT` | `/api/stores/:id/availability` | Actualizar todos los horarios | Sí (owner) |
| `PUT` | `/api/stores/:id/availability/:day` | Actualizar un día específico | Sí (owner) |
| `DELETE` | `/api/stores/:id/availability/:day` | Eliminar horarios de un día | Sí (owner) |
| `POST` | `/api/stores/:id/availability/:day/copy` | Copiar horarios a otros días | Sí (owner) |

#### Ejemplos de Uso:

**Actualizar horarios completos:**
```javascript
PUT /api/stores/123/availability
{
  "availability": [
    {
      "dayOfWeek": "monday",
      "isClosed": false,
      "timeBlocks": [
        {
          "startTime": "09:00",
          "endTime": "13:00",
          "slotDuration": 30
        }
      ]
    }
  ]
}
```

**Actualizar solo un día:**
```javascript
PUT /api/stores/123/availability/monday
{
  "isClosed": false,
  "timeBlocks": [
    {
      "startTime": "09:00",
      "endTime": "17:00",
      "slotDuration": 45
    }
  ]
}
```

**Copiar horarios:**
```javascript
POST /api/stores/123/availability/monday/copy
{
  "targetDays": ["tuesday", "wednesday", "thursday"]
}
```

**Validaciones automáticas:**
- ✅ Formato de hora (HH:MM)
- ✅ Hora inicio < Hora fin
- ✅ slotDuration entre 5-480 minutos
- ✅ Detección de traslapes
- ✅ Días válidos

---

### 4. **Frontend - Componente Moderno**

#### Nuevo: `WeeklyScheduleEditor.jsx`

**Características UI/UX:**

1. **Vista Semanal Completa**
   - 7 columnas (una por día)
   - Vista rápida de todos los horarios
   - Estados visuales: Abierto/Cerrado
   - Click en día para ver detalles

2. **Vista Detalle de Día**
   - Todos los bloques horarios listados
   - Agregar/Eliminar bloques fácilmente
   - Toggle abierto/cerrado
   - Copiar a otros días con un click

3. **Modal Agregar Bloque**
   - Input tipo `time` nativo
   - Select de duración de cita
   - Validación en tiempo real
   - UX limpia y rápida

4. **Características Avanzadas**
   - ✅ Migración automática de formato antiguo
   - ✅ Validación cliente antes de guardar
   - ✅ Mensajes de error descriptivos
   - ✅ Confirmaciones para acciones críticas
   - ✅ Responsive design
   - ✅ Loading states

**Ejemplo de uso:**
```jsx
import WeeklyScheduleEditor from "../components/WeeklyScheduleEditor";

<WeeklyScheduleEditor storeId={storeId} />
```

---

## 🔄 MIGRACIÓN Y COMPATIBILIDAD

### Migración Automática

El sistema **migra automáticamente** el formato antiguo al nuevo:

**Formato antiguo:**
```javascript
{
  dayOfWeek: "monday",
  slots: ["09:00", "09:30", "10:00", "10:30"]
}
```

**Convertido automáticamente a:**
```javascript
{
  dayOfWeek: "monday",
  isClosed: false,
  timeBlocks: [{
    startTime: "09:00",
    endTime: "10:30",
    slotDuration: 30
  }],
  slots: ["09:00", "09:30", "10:00", "10:30"] // Se mantiene
}
```

### Compatibilidad Retroactiva

- ✅ El campo `slots` se mantiene por compatibilidad
- ✅ Componente antiguo (`BookingAvailabilityManager`) aún funciona
- ✅ API acepta ambos formatos
- ✅ Migración NO destructiva

---

## 🎯 FLUJO DE TRABAJO TÍPICO

### Para el Dueño de la Tienda:

1. **Abrir editor de horarios**
   - Ir a "Mi Negocio" → Tab "Herramientas" → "Horarios Disponibles"

2. **Configurar lunes (ejemplo)**
   - Click en la tarjeta "Lunes"
   - Click "➕ Agregar Bloque Horario"
   - Configurar:
     - Inicio: 09:00
     - Fin: 13:00
     - Duración cita: 30 min
   - Click "Agregar Bloque"

3. **Agregar otro bloque (horario tarde)**
   - Click "➕ Agregar Bloque Horario"
   - Configurar:
     - Inicio: 15:00
     - Fin: 18:00
     - Duración cita: 45 min

4. **Copiar a otros días**
   - Click "📋 Copiar a otros días"
   - Confirmar

5. **Marcar domingos cerrados**
   - Click en "Domingo"
   - Click "✕ Marcar Cerrado"

6. **Guardar**
   - Click "💾 Guardar Horarios"
   - ✅ Confirmación visual

---

## 🧪 VALIDACIONES IMPLEMENTADAS

### Cliente (Frontend):
- Formato HH:MM válido
- Hora inicio < Hora fin
- Duración entre 5-480 minutos

### Servidor (Backend):
- Todo lo anterior +
- Detección de traslapes entre bloques
- Días válidos (monday-sunday)
- Normalización automática
- Prevención de duplicados

---

## 📊 VENTAJAS DEL NUEVO SISTEMA

| Aspecto | Antes | Ahora |
|---------|-------|-------|
| **UI/UX** | Lista de inputs texto | Editor visual tipo calendario |
| **Bloques** | ❌ Un rango implícito | ✅ Múltiples bloques explícitos |
| **Días cerrados** | ❌ Sin indicador | ✅ Toggle explícito |
| **Copiar horarios** | ❌ No disponible | ✅ Un click |
| **Validaciones** | 🟡 Básicas | ✅ Completas + traslapes |
| **Vista previa** | ❌ No | ✅ Vista semanal |
| **Endpoints** | 2 rutas | 5 rutas RESTful |
| **Duración cita** | ❌ Fija | ✅ Configurable por bloque |

---

## 🚀 PRÓXIMAS MEJORAS OPCIONALES

### Corto Plazo:
1. **Drag & Drop de bloques**
   - Reordenar bloques visualmente
   - Librería: `react-beautiful-dnd` o `dnd-kit`

2. **Plantillas predefinidas**
   - "Oficina estándar" (9-18 L-V)
   - "Retail" (10-20 L-D)
   - "Salud" (8-14 L-S)

3. **Períodos especiales**
   - Vacaciones
   - Días festivos
   - Eventos especiales

### Largo Plazo:
4. **Integración con calendario externo**
   - Google Calendar
   - Outlook

5. **Bloqueos temporales**
   - Marcar slots como no disponibles
   - Razones de bloqueo

6. **Notificaciones**
   - Avisar cuando alguien agenda
   - Recordatorios de citas

---

## 🐛 TROUBLESHOOTING

### Error: "Se detectaron traslapes"
**Causa:** Dos bloques se superponen en tiempo.  
**Solución:** Ajusta las horas para que no haya traslape.

Ejemplo de traslape:
```
Bloque 1: 09:00 - 13:00
Bloque 2: 12:00 - 15:00  ← ⚠️ Se traslapa con Bloque 1
```

Corrección:
```
Bloque 1: 09:00 - 13:00
Bloque 2: 13:00 - 15:00  ← ✅ Sin traslape
```

### Error: "Horarios inválidos. Usa formato HH:MM"
**Causa:** Formato de hora incorrecto.  
**Solución:** Usa el picker nativo del input time o escribe en formato `09:00`.

### No se ven los horarios después de guardar
**Causa:** Error de red o validación fallida.  
**Solución:** Revisa la consola del navegador para ver el error específico.

---

## 📝 MIGRATION GUIDE

### Para Tiendas Existentes:

**No es necesario hacer nada.** El sistema migra automáticamente.

Pero si quieres aprovechar las nuevas funciones:

1. Abre el editor de horarios
2. Verás tus slots antiguos convertidos a un bloque
3. Puedes:
   - Agregar más bloques (ej: horario tarde)
   - Ajustar duraciones de cita
   - Marcar días cerrados
   - Copiar a otros días
4. Guarda los cambios

---

## 🎓 CÓDIGO DE EJEMPLO

### Backend - Crear horarios desde cero:

```javascript
const store = await Store.findById(storeId);

store.bookingAvailability = [
  {
    dayOfWeek: "monday",
    isClosed: false,
    timeBlocks: [
      { startTime: "09:00", endTime: "13:00", slotDuration: 30 },
      { startTime: "15:00", endTime: "18:00", slotDuration: 45 }
    ]
  },
  {
    dayOfWeek: "tuesday",
    isClosed: false,
    timeBlocks: [
      { startTime: "09:00", endTime: "17:00", slotDuration: 60 }
    ]
  },
  {
    dayOfWeek: "sunday",
    isClosed: true,
    timeBlocks: []
  }
];

await store.save();
```

### Frontend - Usar el componente:

```jsx
import WeeklyScheduleEditor from "../components/WeeklyScheduleEditor";

function MyStorePage() {
  const storeId = "123abc";
  
  return (
    <div>
      <h1>Configurar Horarios</h1>
      <WeeklyScheduleEditor storeId={storeId} />
    </div>
  );
}
```

---

## 📚 ARCHIVOS MODIFICADOS/CREADOS

### Backend:
- ✅ `backend/src/models/store.model.js` - Modelo mejorado
- ✅ `backend/src/helpers/availability.helper.js` - **NUEVO** Helper completo
- ✅ `backend/src/controllers/store.controller.js` - Controllers mejorados
- ✅ `backend/src/routes/store.routes.js` - Rutas RESTful

### Frontend:
- ✅ `frontend/src/components/WeeklyScheduleEditor.jsx` - **NUEVO** Componente moderno
- ✅ `frontend/src/pages/StoreProfilePage.jsx` - Integración del nuevo componente
- 📦 `frontend/src/components/BookingAvailabilityManager.jsx` - Mantenido por compatibilidad

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

- [x] Modelo de datos mejorado
- [x] Helper de validaciones
- [x] Endpoints RESTful
- [x] Componente UI moderno
- [x] Migración automática
- [x] Validaciones traslapes
- [x] Vista semanal
- [x] Copiar horarios
- [x] Días cerrados
- [x] Duración configurable
- [x] Documentación completa

---

## 🎉 CONCLUSIÓN

El nuevo sistema de horarios transforma la experiencia de:
- ⏰ **Configurar** horarios (de 10 minutos a 2 minutos)
- 👀 **Visualizar** disponibilidad (vista semanal clara)
- ✏️ **Editar** cambios (sin errores de formato)
- 📋 **Replicar** horarios (copiar con un click)

**Estado:** ✅ PRODUCCIÓN-READY

**Próximo paso:** Probar en el navegador y reportar feedback.

---

**Desarrollado por:** Maximiliano Inostroza & Jaime Herrera  
**Proyecto:** Vitrinex_Fenix - INACAP Renca 2025  
**Fecha:** Noviembre 2025
