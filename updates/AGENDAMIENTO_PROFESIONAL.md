# 🚀 SISTEMA DE AGENDAMIENTO PROFESIONAL - DOCUMENTACIÓN

## ✅ CAMBIOS IMPLEMENTADOS

### 🎯 BACKEND COMPLETO

#### 1. **Nuevo Modelo: Service** (`backend/src/models/service.model.js`)
```javascript
{
  store: ObjectId (ref Store),
  name: String (required, max 100 chars),
  description: String (max 500 chars),
  duration: Number (5-480 minutos),
  price: Number (>=0),
  isActive: Boolean (default true),
  displayOrder: Number,
  imageUrl: String
}
```

**Virtuals agregados:**
- `formattedPrice`: Formato CLP
- `formattedDuration`: "1h 30min" / "30min"

#### 2. **Modelo Store Mejorado** (`backend/src/models/store.model.js`)
```diff
+ specialDays: [{
+   date: Date (index),
+   isClosed: Boolean,
+   reason: String,
+   timeBlocks: [{
+     startTime: String,
+     endTime: String,
+     slotDuration: Number
+   }]
+ }]
```

**Funcionalidad:**
- ✅ Días festivos
- ✅ Cierres temporales
- ✅ Horarios especiales que overridean horario semanal

#### 3. **Modelo Booking Mejorado** (`backend/src/models/booking.model.js`)
```diff
+ service: ObjectId (ref Service, nullable),
+ duration: Number (default 30),
+ price: Number (snapshot del precio al reservar)
```

**Backward compatibility:** ✅ Bookings sin service siguen funcionando

#### 4. **Availability Helper Extendido** (`backend/src/helpers/availability.helper.js`)

**Nuevas funciones:**
```javascript
// Normalizar fecha a medianoche
normalizeDateOnly(dateInput)

// Obtener availability para fecha específica (considera specialDays)
getAvailabilityForDate(date, bookingAvailability, specialDays)

// Obtener slots disponibles para fecha (filtra bookings existentes)
getAvailableSlotsForDate(date, bookingAvailability, specialDays, existingBookings, serviceDuration)

// Normalizar specialDays
normalizeSpecialDays(specialDays)
```

#### 5. **Controlador Services** (`backend/src/controllers/services.controller.js`)

**Endpoints completos:**
- `getStoreServices` - Listar servicios (público)
- `getServiceById` - Obtener uno (público)
- `createService` - Crear (auth)
- `updateService` - Actualizar (auth)
- `deleteService` - Soft delete (auth)
- `toggleServiceStatus` - Toggle activo/inactivo (auth)
- `reorderServices` - Cambiar orden de visualización (auth)

#### 6. **Store Controller Extendido** (`backend/src/controllers/store.controller.js`)

**Nuevos endpoints:**
```javascript
// Special Days
getSpecialDays(req, res)          // GET /api/stores/:id/special-days
upsertSpecialDay(req, res)        // POST /api/stores/:id/special-days
deleteSpecialDay(req, res)        // DELETE /api/stores/:id/special-days/:date

// Availability por fecha
getAvailabilityByDate(req, res)   // GET /api/stores/:id/availability/date/:date?serviceId=xxx

// Appointments mejorado
createAppointment(req, res)       // POST /api/stores/:id/appointments (ahora acepta serviceId)
```

#### 7. **Rutas Organizadas**

**Archivo: `backend/src/routes/services.routes.js`** (NUEVO)
```
GET    /api/stores/:storeId/services
GET    /api/stores/:storeId/services/:serviceId
POST   /api/stores/:storeId/services
PUT    /api/stores/:storeId/services/:serviceId
DELETE /api/stores/:storeId/services/:serviceId
PATCH  /api/stores/:storeId/services/:serviceId/toggle
PATCH  /api/stores/:storeId/services/reorder
```

**Archivo: `backend/src/routes/store.routes.js`** (ACTUALIZADO)
```
# Special Days
GET    /api/stores/:id/special-days
POST   /api/stores/:id/special-days
DELETE /api/stores/:id/special-days/:date

# Availability por fecha
GET    /api/stores/:id/availability/date/:date
```

**Archivo: `backend/src/index.js`** (ACTUALIZADO)
```diff
+ import servicesRoutes from "./routes/services.routes.js";
+ app.use("/api/stores", servicesRoutes);
```

---

### 🎨 FRONTEND

#### 1. **API Client: services.js** (`frontend/src/api/services.js`)

**Funciones exportadas:**
```javascript
// Services CRUD
getStoreServices(storeId, includeInactive)
getServiceById(storeId, serviceId)
createService(storeId, serviceData)
updateService(storeId, serviceId, serviceData)
deleteService(storeId, serviceId, permanent)
toggleServiceStatus(storeId, serviceId)
reorderServices(storeId, serviceIds)

// Special Days
getSpecialDays(storeId)
upsertSpecialDay(storeId, specialDayData)
deleteSpecialDay(storeId, date)

// Availability
getAvailabilityByDate(storeId, date, serviceId)

// Appointments
createAppointmentWithService(storeId, appointmentData)
```

#### 2. **Componente: ServicesManager** (`frontend/src/components/ServicesManager.jsx`)

**Funcionalidades:**
- ✅ Lista de servicios (activos e inactivos)
- ✅ Formulario crear/editar con validaciones
- ✅ Toggle activo/inactivo con un click
- ✅ Soft delete con confirmación
- ✅ UI moderna con TailwindCSS
- ✅ Iconos SVG inline
- ✅ Estados de loading y error
- ✅ Formato automático de precio (CLP) y duración

**Props:**
- `storeId`: ID de la tienda

**Estado:**
```javascript
{
  services: [],
  loading: boolean,
  error: string,
  showForm: boolean,
  editingService: Service | null,
  formData: {
    name, description, duration, price, isActive
  }
}
```

---

## 📊 ARQUITECTURA DE DATOS

### Flujo de Reserva CON Servicio:

```
1. Cliente ve lista de servicios
   GET /api/stores/:id/services

2. Cliente selecciona servicio
   - Guarda serviceId, duration, price

3. Cliente elige fecha
   GET /api/stores/:id/availability/date/:date?serviceId=xxx
   - Backend calcula slots según duración del servicio
   - Filtra slots ya ocupados

4. Cliente elige slot disponible

5. Cliente confirma reserva
   POST /api/stores/:id/appointments
   {
     serviceId, date, slot,
     customerName, customerEmail, customerPhone, notes
   }
   - Backend guarda snapshot de duration y price
```

### Flujo de Reserva SIN Servicio (backward compatible):

```
1. Cliente elige fecha (no hay paso de selección de servicio)
   GET /api/stores/:id/availability/date/:date
   - Duration default: 30 min

2. Cliente elige slot

3. Cliente confirma
   POST /api/stores/:id/appointments
   {
     date, slot, customerName, ...
     // serviceId = null
   }
```

---

## 🔄 COMPATIBILIDAD GARANTIZADA

### Bookings Existentes:
- ✅ `service` field es `null` → no rompe nada
- ✅ `duration` default 30 min
- ✅ `price` default 0
- ✅ Frontend maneja ambos casos (con/sin servicio)

### Availability:
- ✅ `bookingAvailability` (semanal) sigue igual
- ✅ `specialDays` es array vacío por default
- ✅ Helper `getAvailabilityForDate` prioriza specialDays sobre semanal

### Stores:
- ✅ Si no hay `specialDays`, usa solo horario semanal
- ✅ Si no hay servicios, modo bookings funciona como antes

---

## 🚀 PRÓXIMOS PASOS PENDIENTES

### 1. MonthlyCalendarEditor Component
**Archivo:** `frontend/src/components/MonthlyCalendarEditor.jsx`

**Funcionalidades requeridas:**
- [ ] Vista calendario mensual (grid 7x5)
- [ ] Click en día para editar horario
- [ ] Modal para configurar:
  - [ ] Marcar como cerrado
  - [ ] Definir bloques horarios especiales
  - [ ] Razón (feriado, vacaciones, etc.)
- [ ] Copiar horarios a múltiples días
- [ ] Vista previa de días con horarios especiales
- [ ] Integración con `upsertSpecialDay` y `deleteSpecialDay`

**Stack sugerido:**
- `react-calendar` (ya instalado en proyecto)
- TailwindCSS
- Modal pattern similar a ServicesManager

### 2. Mejorar StorePublicPage (Flujo Cliente)
**Archivo:** `frontend/src/pages/StorePublic.jsx`

**Cambios necesarios:**
```diff
1. Agregar paso de selección de servicio
+ import { getStoreServices } from "../api/services";
+ const [services, setServices] = useState([]);
+ const [selectedService, setSelectedService] = useState(null);

2. Cambiar flujo de calendario
+ // Usar getAvailabilityByDate en lugar de lógica actual
+ const response = await getAvailabilityByDate(storeId, selectedDate, selectedService?._id);
+ const slots = response.data.availableSlots;

3. Al crear appointment
+ await createAppointmentWithService(storeId, {
+   serviceId: selectedService?._id,
+   date, slot, customerName, ...
+ });
```

**UI sugerida:**
```
┌─────────────────────────────────────┐
│ 1️⃣ Elige un servicio               │
│ [Card] Corte de Pelo - 30min $5000 │
│ [Card] Peinado - 45min $8000        │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ 2️⃣ Selecciona fecha                │
│ [Calendario mensual]                │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ 3️⃣ Elige horario disponible        │
│ [09:00] [09:30] [10:00] ...         │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ 4️⃣ Confirma tus datos              │
│ Nombre, Email, Teléfono             │
│ [Confirmar Reserva]                 │
└─────────────────────────────────────┘
```

### 3. Integrar en StoreProfilePage
**Archivo:** `frontend/src/pages/StoreProfilePage.jsx`

```diff
+ import ServicesManager from "../components/ServicesManager";
+ import MonthlyCalendarEditor from "../components/MonthlyCalendarEditor";

// En el tab "Herramientas" o crear nuevo tab "Servicios"
+ {bookingsPanel === "services" && (
+   <ServicesManager storeId={store._id} />
+ )}

+ {bookingsPanel === "calendar" && (
+   <MonthlyCalendarEditor storeId={store._id} />
+ )}
```

---

## 🧪 TESTING CHECKLIST

### Backend:
- [ ] Crear servicio → debe aparecer en lista
- [ ] Actualizar servicio → cambios se guardan
- [ ] Toggle activo/inactivo → estado cambia
- [ ] Crear specialDay → fecha se guarda correctamente
- [ ] getAvailabilityByDate con specialDay → retorna horarios especiales
- [ ] getAvailabilityByDate sin specialDay → retorna horario semanal
- [ ] createAppointment con serviceId → guarda duration y price correctos
- [ ] createAppointment sin serviceId → usa defaults (backward compat)

### Frontend:
- [ ] ServicesManager carga servicios correctamente
- [ ] Formulario de servicio valida campos
- [ ] Toggle activo/inactivo funciona sin recargar página
- [ ] Editar servicio pre-llena formulario
- [ ] Error messages se muestran claramente

---

## 📚 EJEMPLOS DE USO

### Crear un servicio (cURL):
```bash
curl -X POST http://localhost:3000/api/stores/STORE_ID/services \
  -H "Content-Type: application/json" \
  -H "Cookie: token=YOUR_TOKEN" \
  -d '{
    "name": "Corte de Pelo",
    "description": "Corte profesional con lavado incluido",
    "duration": 45,
    "price": 8000,
    "isActive": true
  }'
```

### Crear día especial (cURL):
```bash
curl -X POST http://localhost:3000/api/stores/STORE_ID/special-days \
  -H "Content-Type: application/json" \
  -H "Cookie: token=YOUR_TOKEN" \
  -d '{
    "date": "2025-12-25",
    "isClosed": true,
    "reason": "Navidad"
  }'
```

### Obtener slots para fecha (cURL):
```bash
curl "http://localhost:3000/api/stores/STORE_ID/availability/date/2025-11-20?serviceId=SERVICE_ID"
```

**Respuesta esperada:**
```json
{
  "date": "2025-11-20T00:00:00.000Z",
  "isClosed": false,
  "reason": "",
  "isSpecialDay": false,
  "timeBlocks": [
    { "startTime": "09:00", "endTime": "13:00", "slotDuration": 30 }
  ],
  "availableSlots": ["09:00", "09:30", "10:00", "10:30", ...],
  "bookedSlots": ["11:00", "12:00"],
  "service": {
    "_id": "xxx",
    "name": "Corte de Pelo",
    "duration": 45,
    "price": 8000
  }
}
```

---

## ✅ GARANTÍAS DE NO-RUPTURA

1. ✅ **Bookings existentes siguen funcionando** (service=null)
2. ✅ **Stores sin servicios funcionan igual** (modo bookings original)
3. ✅ **Availability semanal se mantiene** (specialDays es opcional)
4. ✅ **Componentes antiguos pueden convivir** (no eliminamos nada)
5. ✅ **APIs públicas siguen iguales** (solo agregamos, no cambiamos)

---

## 🎯 ESTADO ACTUAL

**✅ Completado:**
- Modelo Service completo
- Modelo Store con specialDays
- Modelo Booking con service ref
- Helper availability extendido
- Controladores completos (services + store extensions)
- Rutas configuradas
- API client frontend
- Componente ServicesManager UI completo

**⏳ Pendiente:**
- MonthlyCalendarEditor component
- Mejorar StorePublicPage (flujo cliente)
- Integrar en StoreProfilePage
- Testing end-to-end

**⚡ Próxima acción sugerida:**
Crear `MonthlyCalendarEditor.jsx` para completar backoffice del dueño.

---

**Desarrollado por:** GitHub Copilot + Maximiliano & Jaime  
**Proyecto:** Vitrinex_Fenix - INACAP Renca 2025  
**Fecha actualización:** Noviembre 2025
