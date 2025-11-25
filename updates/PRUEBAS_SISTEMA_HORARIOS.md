# 🧪 Pruebas del Sistema de Horarios Rediseñado

## ✅ Sistema completamente renovado

### 🎯 Cambios principales implementados:

1. **WeeklyScheduleManager** (Nuevo)
   - Editor semanal simple y claro
   - Navegación por cada día (Lunes a Domingo)
   - Función "copiar desde otro día"
   - Múltiples bloques de horario por día
   - Sin validaciones complejas que bloqueen guardados

2. **MonthlyCalendarViewer** (Nuevo)
   - Calendario de solo lectura
   - Vista mensual con indicadores visuales
   - Verde = día configurado
   - Gris = sin configurar o cerrado
   - Modal informativo al hacer clic

3. **Backend mejorado**
   - `getAvailabilityForDate`: Convierte horario semanal a fecha específica
   - `getAvailableSlotsForDate`: Genera slots disponibles considerando bookings
   - Migración automática de formato antiguo (slots[]) a nuevo (timeBlocks[])
   - Logging extensivo para debugging

4. **Integración**
   - StoreProfilePage actualizado con 4 pestañas:
     - 📋 Servicios
     - ⏰ Horario Semanal (nuevo)
     - 📆 Vista de Calendario (nuevo)
     - 📝 Gestión de Reservas

---

## 🧪 Plan de Pruebas

### Prueba 1: Configurar horario semanal (Owner)

**Objetivo**: Verificar que el owner puede configurar horarios sin errores

**Pasos**:
1. Ir a `http://localhost:5174` e iniciar sesión como owner
2. Navegar a tu tienda → Herramientas → **⏰ Horario Semanal**
3. Ver lista de 7 días con estados (Configurado, Sin horarios, Cerrado)
4. Hacer clic en **"✏️ Editar"** en "Lunes"
5. Agregar bloque:
   - Hora inicio: `09:00`
   - Hora fin: `18:00`
   - Duración slot: `30 minutos`
6. Hacer clic en **"✅ Guardar"**
7. Verificar mensaje: "✅ Lunes actualizado"

**Resultado esperado**:
- ✅ Modal se cierra automáticamente
- ✅ Lunes muestra badge "✅ Configurado"
- ✅ Se muestra "09:00 - 18:00 (slots 30min)"
- ✅ No hay errores en consola

---

### Prueba 2: Copiar horario a otros días (Owner)

**Objetivo**: Usar la función de copiado rápido

**Pasos**:
1. Estar editando "Martes"
2. En la sección "📋 Copiar horarios desde otro día"
3. Hacer clic en botón **"Lunes"**
4. Verificar que los bloques de Lunes aparecen en Martes
5. Guardar

**Resultado esperado**:
- ✅ Bloques se copian instantáneamente
- ✅ Martes queda igual que Lunes
- ✅ Guardado exitoso

---

### Prueba 3: Vista de calendario mensual (Owner)

**Objetivo**: Ver representación visual del mes

**Pasos**:
1. Ir a pestaña **📆 Vista de Calendario**
2. Observar calendario del mes actual
3. Días configurados deben ser **verde**
4. Días sin configurar deben ser **gris**
5. Hacer clic en un día configurado (ej: Lunes)
6. Modal muestra bloques de horario

**Resultado esperado**:
- ✅ Calendario muestra colores correctos
- ✅ Modal tiene información correcta
- ✅ No permite editar (solo vista)

---

### Prueba 4: Cliente ve slots disponibles (Crítico 🔥)

**Objetivo**: Verificar que el cliente puede ver y reservar

**Pasos**:
1. Abrir navegador en modo incógnito
2. Ir a la URL pública de la tienda (ej: `http://localhost:5174/store/[id-tienda]/public`)
3. Hacer clic en **"📅 Reservar Hora"**
4. Seleccionar un servicio
5. Seleccionar una fecha (ej: un Lunes del mes actual)
6. **VERIFICAR**: Aparecen slots de tiempo (09:00, 09:30, 10:00, ...)

**Resultado esperado**:
- ✅ Muestra slots disponibles
- ✅ Slots corresponden al horario configurado
- ✅ No muestra mensaje "No hay horarios disponibles"

---

### Prueba 5: Reservar hora y verificar bloqueo (Crítico 🔥)

**Objetivo**: Confirmar que las reservas bloquean slots

**Pasos**:
1. Como cliente, continuar desde Prueba 4
2. Seleccionar slot `09:00`
3. Llenar datos: nombre, email, teléfono
4. Hacer clic en **"Confirmar Reserva"**
5. Verificar mensaje de confirmación
6. **Recargar página** y volver a paso 3 (seleccionar misma fecha)
7. Verificar que slot `09:00` **NO aparece** en la lista

**Resultado esperado**:
- ✅ Reserva se crea exitosamente
- ✅ Slot 09:00 desaparece de disponibles
- ✅ Otros slots (09:30, 10:00...) siguen disponibles

---

### Prueba 6: Owner ve reserva en lista (Owner)

**Objetivo**: Confirmar que la reserva aparece en gestión

**Pasos**:
1. Como owner, ir a **📝 Gestión de Reservas**
2. Verificar que aparece la reserva recién creada
3. Ver detalles: nombre del cliente, servicio, fecha, hora

**Resultado esperado**:
- ✅ Reserva visible en la lista
- ✅ Datos correctos
- ✅ Estado "pending" o "confirmed"

---

### Prueba 7: Día cerrado (Owner)

**Objetivo**: Marcar un día como cerrado

**Pasos**:
1. Ir a **⏰ Horario Semanal**
2. Editar "Domingo"
3. Activar checkbox **"🚫 Marcar como día cerrado"**
4. Guardar
5. Verificar badge "🚫 Cerrado" en Domingo

**Resultado esperado**:
- ✅ Domingo marcado como cerrado
- ✅ No muestra bloques de horario
- ✅ Cliente no ve ese día como opción

---

### Prueba 8: Múltiples bloques (Owner)

**Objetivo**: Configurar múltiples bloques en un día

**Pasos**:
1. Editar "Miércoles"
2. Agregar primer bloque: `09:00 - 13:00`
3. Hacer clic en **"+ Agregar bloque"**
4. Agregar segundo bloque: `15:00 - 19:00`
5. Guardar

**Resultado esperado**:
- ✅ Ambos bloques se guardan
- ✅ Miércoles muestra 2 badges con horarios
- ✅ Cliente ve slots de ambos bloques

---

## 🐛 Debugging

### Si cliente NO ve slots disponibles:

1. **Verificar consola del navegador (F12)**
   - Buscar logs que empiecen con `📅`, `🔧`, `📊`, `✅`
   - Backend debería mostrar: "📋 Configuración encontrada para monday"
   - Backend debería mostrar: "🔧 Generando slots para bloque..."
   - Backend debería mostrar: "✅ Slots disponibles después de filtrar: X"

2. **Verificar configuración en backend**
   - Abrir terminal del backend
   - Buscar línea: `📋 Configuración encontrada para [día]`
   - Si dice `hasTimeBlocks: false` → horario no está guardado correctamente
   - Si dice `hasSlots: true` → necesita migración automática

3. **Verificar request en Network tab**
   - F12 → Network → buscar request a `/availability/date/:date`
   - Verificar response tiene: `availableSlots: [...]` con slots

4. **Solución rápida: Re-guardar horario**
   - Ir a Horario Semanal
   - Editar el día problemático
   - Volver a guardar (aunque no cambies nada)
   - Esto fuerza migración de formato antiguo a nuevo

---

## 📊 Logs útiles para debugging

**Backend (store.controller.js - getAvailabilityByDate)**:
```
📅 getAvailabilityByDate llamado: { storeId, date, serviceId }
📋 Configuración encontrada para [día]: { isClosed, hasTimeBlocks, hasSlots }
🔧 Generando slots para bloque [startTime]-[endTime] con duración [duration]min
📊 Total slots generados: X
✅ Slots disponibles después de filtrar: Y
```

**Frontend (StorePublic.jsx - handleDateSelect)**:
```
📅 Fecha seleccionada: [fecha]
🔍 Cargando disponibilidad...
📊 Disponibilidad recibida: { date, availableSlots, timeBlocks }
✅ [X] slots disponibles para [fecha]
```

---

## 🎉 Checklist Final

- [ ] Owner puede agregar horarios sin errores
- [ ] Owner puede copiar horarios entre días
- [ ] Owner puede marcar días como cerrados
- [ ] Owner puede ver calendario mensual
- [ ] Cliente ve lista de servicios
- [ ] Cliente puede seleccionar fecha en calendario
- [ ] Cliente ve slots disponibles (🔥 CRÍTICO)
- [ ] Cliente puede reservar hora
- [ ] Slot reservado desaparece de disponibles
- [ ] Owner ve reserva en gestión
- [ ] Sistema migra formato antiguo automáticamente

---

## 🚀 URLs de prueba

- Frontend: `http://localhost:5174`
- Backend: `http://localhost:3000`
- Vista pública tienda: `http://localhost:5174/store/[ID]/public`
- Perfil tienda (owner): `http://localhost:5174/store/[ID]`

---

**Última actualización**: Sistema completamente rediseñado con 3 componentes nuevos (WeeklyScheduleManager, MonthlyCalendarViewer) y backend mejorado con generación de slots por fecha exacta.
