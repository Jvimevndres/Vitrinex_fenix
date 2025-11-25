# 🔍 DEBUG: Cliente no ve slots de horario

## 📊 Logs agregados para debugging

He agregado logs extensivos en `StorePublic.jsx` para rastrear el problema:

### En la consola del navegador verás:

**Cuando seleccionas un servicio:**
```
🛎️ Servicios activos cargados: X [array de servicios]
```

**Cuando haces clic en una fecha:**
```
📅 Fecha seleccionada: 2025-11-18 Servicio: [service-id]
🔍 Cargando slots para fecha: 2025-11-18 servicio: [service-id]
🚀 loadSlotsForDate iniciado - fecha: 2025-11-18 serviceId: [service-id]
📡 Llamando a API getAvailabilityByDate...
📅 Disponibilidad recibida: { date, availableSlots, ... }
📊 availableSlots: [array de slots]
📊 Cantidad de slots: X
✅ dateSlots actualizado con X slots
```

**Si NO hay servicio seleccionado:**
```
⚠️ No hay servicio seleccionado, no se cargan slots
```

---

## 🧪 Pasos para probar

### 1. Abre la consola del navegador (F12 → Console)

### 2. Ve a la vista pública de tu tienda
```
http://localhost:5173/store/[ID-TIENDA]/public
```

### 3. Sigue el flujo paso a paso:

**PASO 1: Selecciona un servicio**
- Haz clic en cualquier servicio
- **Verifica en consola**: Debe aparecer `🛎️ Servicios activos cargados`

**PASO 2: Selecciona una fecha**
- Haz clic en un día VERDE del calendario
- **Verifica en consola**: Debes ver la secuencia completa de logs:
  ```
  📅 Fecha seleccionada...
  🔍 Cargando slots...
  🚀 loadSlotsForDate iniciado...
  📡 Llamando a API...
  📅 Disponibilidad recibida...
  📊 availableSlots: [...]
  ✅ dateSlots actualizado con X slots
  ```

**PASO 3: Ver slots**
- La pantalla debe cambiar a "Paso 3: Elige tu horario"
- Debe mostrar botones con horarios (09:00, 09:30, etc.)

---

## 🐛 Escenarios de error

### Escenario A: No aparece "🚀 loadSlotsForDate iniciado"
**Causa**: El servicio no está seleccionado o `handleCalendarChange` no se ejecuta
**Solución**: 
1. Verifica que seleccionaste un servicio en Paso 1
2. Verifica que `selectedService` tiene valor

### Escenario B: Aparece "📡 Llamando a API" pero luego error
**Causa**: El backend responde con error
**Solución**:
1. Verifica logs del backend (terminal)
2. Busca: `📅 getAvailabilityByDate llamado`
3. Verifica respuesta del endpoint

### Escenario C: "📊 Cantidad de slots: 0"
**Causa**: El backend devuelve array vacío
**Solución**:
1. Verifica en backend logs: `✅ Slots disponibles calculados: 0`
2. Verifica configuración de horarios para ese día
3. Ejecuta: `node backend/test-availability.js`

### Escenario D: "⚠️ No hay servicio seleccionado"
**Causa**: El flujo está roto, el servicio se perdió
**Solución**:
1. Verifica que el bookingStep esté en 2
2. Verifica que `selectedService` no sea null
3. Recarga la página e intenta de nuevo

---

## 📸 Qué necesito que me compartas

### 1. Captura de pantalla de la consola del navegador
Mostrando todos los logs desde que seleccionas el servicio hasta que llegas al paso 3

### 2. Captura de la pantalla del paso 3
Mostrando si aparecen slots o el mensaje "No hay horarios disponibles"

### 3. Si hay error, copia el mensaje completo
Incluyendo el stack trace

### 4. Logs del backend
Copia lo que aparece en el terminal del backend cuando haces clic en la fecha

---

## 🔧 Verificación rápida de configuración

### Ejecuta este comando para verificar horarios:
```bash
cd backend
node test-availability.js
```

Debe mostrar algo como:
```
🏪 Tienda: [Nombre]
   ID: [id]

📅 Disponibilidad semanal:

   MONDAY:
      Cerrado: NO
      TimeBlocks (1):
         1. 09:00 - 18:00 (slots: 30min)
```

Si no muestra timeBlocks, el problema es que **no hay horarios configurados**.

---

## 🎯 Solución rápida si no hay horarios

1. Ve a tu tienda como owner
2. Ir a **Herramientas → ⏰ Horario Semanal**
3. Hacer clic en **✏️ Editar** en Lunes
4. Agregar bloque: `09:00 - 18:00` (slots 30min)
5. Guardar
6. Usar botón "📋 Copiar desde otro día" para copiar a otros días

Luego vuelve a la vista pública y prueba de nuevo.

---

## 🚀 URLs importantes

- **Frontend**: http://localhost:5173 (o 5174)
- **Backend**: http://localhost:3000
- **Vista pública**: http://localhost:5173/store/[ID]/public
- **API test**: http://localhost:3000/api/stores/[ID]/availability/date/2025-11-18?serviceId=[SERVICE_ID]

---

**Próximo paso**: Comparte los logs de la consola para identificar el problema exacto.
