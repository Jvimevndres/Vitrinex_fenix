# 🔧 Corrección: Sistema de Chat Cliente-Dueño

## Problema Identificado

El cliente podía enviar mensajes al agendar citas o comprar productos, pero al ir a su perfil en la sección "Mis Reservas", no veía los chats ni los contadores de mensajes sin leer.

## Causa Raíz

1. El endpoint `/stores/bookings/my-bookings` no incluía explícitamente los campos de chat (`unreadMessagesCustomer`, `unreadMessagesOwner`, `lastMessageAt`)
2. Posibles reservas antiguas sin estos campos inicializados

## Cambios Realizados

### 1. Backend - Controller (`store.controller.js`)

```javascript
// Agregado .select() para asegurar que incluye campos de chat
.select('+unreadMessagesCustomer +unreadMessagesOwner +lastMessageAt')
```

### 2. Frontend - Component (`CustomerBookingsList.jsx`)

- Agregado logging mejorado para debugging
- Ya tenía la lógica correcta para mostrar badges y contadores

### 3. Script de Migración (`fix-bookings-chat-fields.js`)

Script para inicializar campos de chat en reservas existentes que no los tengan.

## Cómo Probar

### Paso 1: Ejecutar Script de Migración (Si hay reservas antiguas)

```bash
cd backend
node fix-bookings-chat-fields.js
```

### Paso 2: Reiniciar Backend

```bash
cd backend
npm run dev
```

### Paso 3: Probar Flujo Completo

#### A. Como Cliente (sin cuenta):

1. Ir a una tienda pública: `/tienda/:id`
2. Agendar una cita con tu email
3. Enviar un mensaje en el formulario de reserva
4. El dueño debería ver el mensaje sin leer

#### B. Como Dueño:

1. Login como dueño
2. Ir a tu negocio → Pestaña "Mensajes"
3. Ver la conversación y responder
4. El cliente debería recibir la respuesta

#### C. Como Cliente (con cuenta):

1. Registrarse/Login con el mismo email usado para reservar
2. Ir a "Mi Perfil" → Pestaña "📅 Mis Reservas"
3. **Verificar:**
   - ✅ Aparecen todas tus reservas
   - ✅ Badge azul indica "mensajes nuevos"
   - ✅ Número de mensajes sin leer visible
   - ✅ Al hacer click en "💬 Chat" se abre el chat
   - ✅ Los mensajes del dueño aparecen
   - ✅ Puedes responder
   - ✅ Al cerrar y reabrir, el contador se resetea

## Verificaciones de Consola

### Backend:
```
📋 Buscando reservas para email: cliente@example.com
✅ Encontradas 3 reservas
📬 Reservas con mensajes sin leer: 1
```

### Frontend:
```
📋 Cargando reservas para: cliente@example.com
✅ Reservas cargadas: [...]
📊 Desglose de mensajes:
  [0] Juan Pérez - Mensajes sin leer: 2
  [1] María López - Mensajes sin leer: 0
  [2] Pedro Gómez - Mensajes sin leer: 0
```

## Flujo de Estados

### Cuando el Dueño envía mensaje:

1. Backend incrementa `booking.unreadMessagesCustomer`
2. Frontend del cliente muestra badge con número
3. Al abrir chat, se marca como leído
4. Se resetea `unreadMessagesCustomer = 0`

### Cuando el Cliente envía mensaje:

1. Backend incrementa `booking.unreadMessagesOwner`
2. Frontend del dueño muestra notificación
3. Al abrir chat, se marca como leído
4. Se resetea `unreadMessagesOwner = 0`

## Troubleshooting

### Problema: No aparecen mensajes sin leer

**Solución:**
1. Verificar que el backend está retornando los campos:
```bash
# En consola del navegador
console.log(bookings[0].unreadMessagesCustomer)
```

2. Si es `undefined`, ejecutar script de migración

### Problema: Chat no se abre

**Solución:**
1. Verificar que `user.email` coincide con `booking.customerEmail`
2. Revisar consola del navegador para errores de CORS o 403

### Problema: Mensajes no se sincronizan

**Solución:**
1. Verificar polling (cada 5 segundos en ChatBox)
2. Revisar que el email es correcto en las peticiones
3. Verificar tokens de autenticación si es necesario

## Testing Manual

```javascript
// En consola del navegador (página de Mis Reservas)
// Verificar estructura de datos
console.table(bookings.map(b => ({
  id: b._id,
  customer: b.customerName,
  unread: b.unreadMessagesCustomer,
  lastMsg: b.lastMessageAt
})))
```

## Notas Importantes

- ✅ Los clientes NO necesitan cuenta para chatear (solo email válido)
- ✅ Los clientes CON cuenta ven sus chats en "Mis Reservas"
- ✅ Polling automático cada 5 segundos mantiene sincronizado
- ✅ Contadores se resetean automáticamente al abrir chat
- ✅ Sistema soporta tanto bookings como orders

## Endpoints Clave

### Backend:
- `GET /api/stores/bookings/my-bookings?email=...` - Lista reservas del cliente
- `GET /api/public/bookings/:id/messages?email=...` - Mensajes de reserva (público)
- `POST /api/public/bookings/:id/messages` - Enviar mensaje (público)

### Frontend:
- Componente: `CustomerBookingsList.jsx`
- Componente: `ChatBox.jsx`
- API: `frontend/src/api/messages.js`
