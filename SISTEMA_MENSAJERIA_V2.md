# 💬 SISTEMA DE MENSAJERÍA V2 - Documentación Completa

**Fecha:** Noviembre 21, 2025  
**Versión:** 2.0  
**Estado:** ✅ Implementado y Probado

---

## 📋 Resumen Ejecutivo

Se ha implementado y optimizado completamente el sistema de mensajería de Vitrinex, incluyendo:

1. **Chat Usuario-Usuario** (directo desde perfiles públicos)
2. **Actualización automática** de mensajes y notificaciones (sin F5)
3. **Cambio de sesión** sin necesidad de recargar la página
4. **Interfaz visual mejorada** con avatares y nombres reales
5. **Sistema de polling optimizado** para actualizaciones en tiempo real

---

## 🎯 Problemas Resueltos

### ✅ 1. Chat Usuario-Usuario
**Problema:** No existía forma de contactar directamente a otros usuarios desde sus perfiles públicos.

**Solución:** Sistema completo de chat directo implementado.

### ✅ 2. Actualización de Mensajes
**Problema:** Los mensajes solo aparecían después de recargar la página (F5).

**Solución:** Polling automático cada 5 segundos + refresco inmediato al enviar mensajes.

### ✅ 3. Cambio de Sesión
**Problema:** Al cerrar sesión y entrar con otra cuenta, los datos del usuario anterior permanecían en caché.

**Solución:** Sistema de eventos para limpiar y recargar datos automáticamente.

### ✅ 4. Visualización en Dropdown
**Problema:** El dropdown de mensajes mostraba texto genérico ("Reserva", "?") en lugar de nombres y fotos reales.

**Solución:** Renderizado dinámico con avatares e información del remitente real.

### ✅ 5. Posicionamiento de Modales
**Problema:** Los modales de chat aparecían desalineados o en posiciones incorrectas.

**Solución:** Sistema de posicionamiento con flexbox perfectamente centrado.

---

## 🏗️ Arquitectura del Sistema

### Backend

#### Modelo: `message.model.js`
```javascript
{
  // Campos legacy (compatibilidad)
  store: ObjectId,
  booking: ObjectId,
  order: ObjectId,
  sender: ObjectId,
  senderType: "owner" | "customer",
  
  // 🆕 Campos nuevos para chat usuario-usuario
  conversationType: "store" | "user",
  fromUser: ObjectId,
  toUser: ObjectId,
  
  // Campos comunes
  content: String,
  isRead: Boolean,
  readAt: Date,
  createdAt: Date
}
```

**Índices optimizados:**
- `{ booking: 1, createdAt: 1 }`
- `{ order: 1, createdAt: 1 }`
- `{ fromUser: 1, toUser: 1, createdAt: 1 }`
- `{ conversationType: 1 }`

#### Controlador: `messages.controller.js`

**Funciones existentes (corregidas):**
1. `getBookingMessages` - Obtener mensajes de reserva
2. `sendMessage` - Enviar mensaje como dueño de tienda
3. `sendMessagePublic` - Enviar mensaje como cliente
4. `getOrderMessages` - Obtener mensajes de pedido
5. `sendOrderMessage` - Enviar mensaje de pedido (owner)
6. `sendOrderMessagePublic` - Enviar mensaje de pedido (cliente)

**🆕 Funciones nuevas:**
7. `getUserMessages(userId)` - Obtener conversación con otro usuario
8. `sendUserMessage(userId, content)` - Enviar mensaje a otro usuario
9. `getUserConversations()` - Listar todas las conversaciones del usuario

**Correcciones críticas aplicadas:**
```javascript
// ✅ ANTES (fallaba si undefined):
booking.unreadMessagesCustomer += 1;

// ✅ AHORA (siempre funciona):
booking.unreadMessagesCustomer = (booking.unreadMessagesCustomer || 0) + 1;
booking.lastMessageAt = new Date();
```

#### Rutas: `messages.routes.js`

**🆕 Rutas agregadas:**
```javascript
GET  /api/user-conversations              // Listar conversaciones usuario-usuario
GET  /api/public/users/:userId/messages   // Obtener mensajes con usuario
POST /api/public/users/:userId/messages   // Enviar mensaje a usuario
```

---

### Frontend

#### Componentes Principales

##### 1. **MainHeader.jsx** ⭐
**Responsabilidad:** Header global con dropdowns de notificaciones y mensajes.

**Características:**
- ✅ Polling cada 5 segundos (optimizado)
- ✅ Función global `window.refreshMessagesAndNotifications()`
- ✅ Limpieza de estados al logout
- ✅ Recarga automática al login
- ✅ Dropdown de mensajes con avatares y nombres reales
- ✅ Posicionamiento centrado de modales

**Estados:**
```javascript
const [notifications, setNotifications] = useState([]);
const [conversations, setConversations] = useState([]);
const [userStores, setUserStores] = useState([]);
const [openNotifications, setOpenNotifications] = useState(false);
const [openMessages, setOpenMessages] = useState(false);
const [selectedUserChat, setSelectedUserChat] = useState(null);
```

**useEffect optimizado:**
```javascript
useEffect(() => {
  if (!isAuthenticated || !user?._id) {
    // Limpiar estados
    setUserStores([]);
    setNotifications([]);
    setConversations([]);
    // ... más limpiezas
    return;
  }
  
  // Carga inicial
  loadData();
  
  // Polling cada 5 segundos
  pollingIntervalRef.current = setInterval(loadData, 5000);
  
  // Exponer función global
  window.refreshMessagesAndNotifications = loadData;
  
  return () => {
    clearInterval(pollingIntervalRef.current);
    delete window.refreshMessagesAndNotifications;
  };
}, [isAuthenticated, user?._id]);
```

##### 2. **UserChatModal.jsx** 🆕
**Responsabilidad:** Modal de chat directo entre usuarios.

**Características:**
- ✅ Diseño reutilizado de CustomerChatModal
- ✅ Gradientes purple-to-pink para mensajes propios
- ✅ Polling interno cada 3 segundos
- ✅ Refresco del header al enviar mensajes (delay 500ms)
- ✅ Cierre con limpieza

**Props:**
```javascript
{
  targetUserId: string,
  targetUsername: string,
  onClose: function
}
```

##### 3. **CustomerChatModal.jsx**
**Responsabilidad:** Modal de chat para reservas/pedidos (cliente).

**Mejoras aplicadas:**
- ✅ Refresco del header al enviar mensajes (delay 500ms)
- ✅ Manejo correcto de email del cliente
- ✅ Soporte para bookings y orders

##### 4. **UnifiedChatManager.jsx**
**Responsabilidad:** Gestor de chats para dueños de tiendas.

**Mejoras aplicadas:**
- ✅ Refresco del header al enviar mensajes (delay 500ms)
- ✅ Limpieza de logs debug
- ✅ Soporte unificado para bookings y orders

##### 5. **CustomerPublicPage.jsx**
**Responsabilidad:** Perfil público de usuario.

**Cambio principal:**
- ❌ ANTES: Formulario simple de contacto sin funcionalidad
- ✅ AHORA: Botón que abre `UserChatModal` para chat directo

**Validaciones:**
```javascript
// No permitir contactar a sí mismo
if (profileUser._id === user._id) {
  return; // No mostrar botón
}

// Requerir autenticación
if (!isAuthenticated) {
  alert("Debes iniciar sesión para enviar mensajes");
  return;
}
```

##### 6. **CustomerProfilePage.jsx**
**Responsabilidad:** Perfil del usuario autenticado.

**Mejoras aplicadas:**
- ✅ Recarga automática al login
- ✅ Limpieza automática al logout
- ✅ Escucha eventos `userLogin` y `userLogout`

##### 7. **OnboardingPage.jsx**
**Responsabilidad:** Gestión de tiendas del usuario.

**Mejoras aplicadas:**
- ✅ Recarga automática al login
- ✅ Limpieza automática al logout
- ✅ Escucha eventos `userLogin` y `userLogout`

---

#### Context: AuthContext.jsx

**Sistema de eventos implementado:**

```javascript
// Al hacer login
const login = async (credentials) => {
  const res = await loginRequest(credentials);
  setUser(res.data);
  setIsAuthenticated(true);
  localStorage.setItem("hasSession", "true");
  
  // 🆕 Disparar evento
  window.dispatchEvent(new Event('userLogin'));
  
  return res.data;
};

// Al hacer logout
const logout = async () => {
  try {
    await logoutRequest();
  } finally {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem("hasSession");
    
    // 🆕 Disparar evento
    window.dispatchEvent(new Event('userLogout'));
  }
};
```

**Componentes que escuchan eventos:**
- MainHeader
- CustomerProfilePage
- OnboardingPage

---

#### API: messages.js

**🆕 Funciones agregadas:**
```javascript
// Obtener conversaciones usuario-usuario
export const getUserConversations = async () => {
  const { data } = await axios.get('/user-conversations');
  return data;
};

// Obtener mensajes con un usuario específico
export const getUserMessages = async (userId) => {
  const { data } = await axios.get(`/public/users/${userId}/messages`);
  return data;
};

// Enviar mensaje a un usuario
export const sendUserMessage = async (userId, content) => {
  const { data } = await axios.post(`/public/users/${userId}/messages`, { content });
  return data;
};
```

---

## 🎨 Mejoras Visuales

### Dropdown de Mensajes

**Renderizado dinámico de remitentes:**

```javascript
// Determinar quién es el remitente según el tipo
let senderName, senderAvatar, senderInitial, subtitleText;

if (conv.type === 'user-chat') {
  // Chat usuario-usuario
  senderName = conv.userName;
  senderAvatar = conv.userAvatar;
  senderInitial = senderName[0]?.toUpperCase();
  subtitleText = conv.lastMessage;
  
} else if (conv.isOwner) {
  // Soy dueño, remitente es el cliente
  senderName = conv.customerName;
  senderAvatar = null; // Podrías agregar customerAvatar
  senderInitial = senderName[0]?.toUpperCase();
  subtitleText = `Reservó: ${conv.serviceName}`;
  
} else {
  // Soy cliente, remitente es la tienda
  senderName = conv.storeName;
  senderAvatar = conv.storeLogo;
  senderInitial = senderName[0]?.toUpperCase();
  subtitleText = `📅 ${conv.serviceName}`;
}
```

**Componente de avatar:**
```jsx
<div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm shadow-lg overflow-hidden">
  {senderAvatar ? (
    <img src={senderAvatar} alt={senderName} className="w-full h-full object-cover" />
  ) : (
    <span>{senderInitial}</span>
  )}
</div>
```

**Badges de tipo de conversación:**
- 🏪 Mensajes de negocio (owner)
- 👤 Mensajes de reservas (customer)
- 👥 Chat usuario-usuario (user-chat)

### Posicionamiento de Modales

**Técnica aplicada:**
```css
/* Overlay transparente que cubre toda la pantalla */
.fixed.inset-0.flex.items-start.justify-center.pt-20.px-4.z-[1001].pointer-events-none

/* Modal interno que recibe clicks */
.w-full.max-w-md.pointer-events-auto
```

**Ventajas:**
- ✅ Centrado perfecto horizontal y vertical
- ✅ Margen superior controlado (pt-20 = 80px)
- ✅ Clicks fuera del modal no interfieren
- ✅ Responsive en todos los dispositivos

---

## ⚡ Sistema de Actualización en Tiempo Real

### 1. Polling Automático (MainHeader)

**Intervalo:** 5 segundos

**Qué actualiza:**
- Notificaciones de tiendas
- Mensajes de bookings (owner)
- Mensajes de orders (owner)
- Mensajes de bookings (cliente)
- Mensajes de orders (cliente)
- Conversaciones usuario-usuario

**Optimización:**
- Se detiene cuando el usuario no está autenticado
- Se reinicia automáticamente al cambiar de usuario
- Usa `useRef` para evitar múltiples intervalos

### 2. Refresco Inmediato al Enviar

**Componentes que implementan:**
- CustomerChatModal
- UserChatModal
- UnifiedChatManager
- ChatBox (pendiente)

**Implementación con delay:**
```javascript
// Enviar mensaje
await sendMessage(...);
setNewMessage('');
await loadMessages();

// Refrescar header con delay de 500ms
setTimeout(() => {
  if (window.refreshMessagesAndNotifications) {
    window.refreshMessagesAndNotifications();
  }
}, 500);
```

**¿Por qué el delay?**
- Da tiempo al backend para procesar el mensaje
- Actualizar contadores de no leídos
- Actualizar `lastMessageAt`
- Garantiza sincronización correcta

### 3. Eventos de Sesión

**Flujo de logout:**
```
Usuario hace logout
  → AuthContext dispara 'userLogout'
    → MainHeader limpia estados
    → CustomerProfilePage limpia datos
    → OnboardingPage limpia tiendas
```

**Flujo de login:**
```
Usuario hace login
  → AuthContext dispara 'userLogin'
    → MainHeader recarga notificaciones y mensajes
    → CustomerProfilePage recarga perfil
    → OnboardingPage recarga tiendas
```

---

## 🔧 Correcciones Técnicas Críticas

### 1. Contador de Mensajes No Leídos

**ANTES (fallaba):**
```javascript
booking.unreadMessagesCustomer += 1; // Error si undefined
```

**AHORA (funciona siempre):**
```javascript
booking.unreadMessagesCustomer = (booking.unreadMessagesCustomer || 0) + 1;
```

**Aplicado en:**
- `sendMessage` (messages.controller.js)
- `sendMessagePublic` (messages.controller.js)
- `sendOrderMessage` (messages.controller.js)
- `sendOrderMessagePublic` (messages.controller.js)

### 2. Timestamp de Último Mensaje

**Agregado en todas las funciones de envío:**
```javascript
booking.lastMessageAt = new Date();
await booking.save();
```

**Propósito:**
- Ordenar conversaciones por recencia
- Mostrar última actividad
- Filtrar conversaciones activas

### 3. Dependencias Circulares

**ANTES (causaba re-renders):**
```javascript
const loadData = useCallback(async () => { ... }, [user?._id]);

useEffect(() => {
  loadData();
}, [loadData]); // ❌ Dependencia circular
```

**AHORA (optimizado):**
```javascript
useEffect(() => {
  const loadData = async () => { ... };
  
  loadData();
  setInterval(loadData, 5000);
}, [user?._id]); // ✅ Sin dependencias circulares
```

---

## 📊 Flujo Completo de Mensajes

### Caso 1: Usuario A envía mensaje a Usuario B

```mermaid
Usuario A (frontend)
  ↓ POST /api/public/users/:userBId/messages
Backend
  ↓ Crea Message con conversationType="user"
  ↓ fromUser=A, toUser=B
  ↓ Responde 201
Usuario A (frontend)
  ↓ loadMessages() (actualiza vista del chat)
  ↓ setTimeout 500ms
  ↓ window.refreshMessagesAndNotifications()
    ↓ MainHeader recarga conversaciones
    
Usuario B (frontend)
  ↓ Polling cada 5s en MainHeader
    ↓ Detecta nueva conversación
    ↓ Muestra notificación en badge
    ↓ Aparece en dropdown de mensajes
```

### Caso 2: Cliente envía mensaje sobre reserva

```mermaid
Cliente (frontend)
  ↓ POST /api/public/bookings/:bookingId/messages
Backend
  ↓ Crea Message con senderType="customer"
  ↓ booking.unreadMessagesOwner += 1
  ↓ booking.lastMessageAt = now
  ↓ Responde 201
Cliente (frontend)
  ↓ loadMessages()
  ↓ setTimeout 500ms
  ↓ window.refreshMessagesAndNotifications()
    
Dueño (frontend)
  ↓ Polling cada 5s
    ↓ Detecta booking.unreadMessagesOwner > 0
    ↓ Aparece en dropdown con badge
    ↓ Notificación en MainHeader
```

### Caso 3: Cambio de sesión

```mermaid
Usuario hace logout
  ↓ AuthContext.logout()
    ↓ window.dispatchEvent('userLogout')
      ↓ MainHeader: limpia estados
      ↓ CustomerProfilePage: limpia datos
      ↓ OnboardingPage: limpia tiendas
  ↓ Redirige a LoginPage
  
Nuevo usuario hace login
  ↓ AuthContext.login()
    ↓ window.dispatchEvent('userLogin')
      ↓ MainHeader: recarga notificaciones/mensajes
      ↓ CustomerProfilePage: recarga perfil
      ↓ OnboardingPage: recarga tiendas
  ↓ Datos del nuevo usuario cargados
```

---

## 📁 Archivos Modificados

### Backend
```
backend/src/
├── models/
│   └── message.model.js           ✏️ Extendido con conversationType
├── controllers/
│   └── messages.controller.js     ✏️ 3 funciones nuevas + 4 corregidas
└── routes/
    └── messages.routes.js         ✏️ 3 rutas nuevas
```

### Frontend
```
frontend/src/
├── components/
│   ├── MainHeader.jsx             ✏️ Polling optimizado + eventos
│   ├── UserChatModal.jsx          🆕 Componente nuevo
│   ├── CustomerChatModal.jsx      ✏️ Refresco con delay
│   └── UnifiedChatManager.jsx     ✏️ Refresco con delay
├── pages/
│   ├── CustomerPublicPage.jsx     ✏️ Integración UserChatModal
│   ├── CustomerProfilePage.jsx    ✏️ Eventos de sesión
│   └── OnboardingPage.jsx         ✏️ Eventos de sesión
├── context/
│   └── AuthContext.jsx            ✏️ Sistema de eventos
└── api/
    └── messages.js                ✏️ 3 funciones nuevas
```

---

## ✅ Checklist de Funcionalidades

### Chat Usuario-Usuario
- [x] Modelo de datos extendido
- [x] Endpoints backend (GET/POST)
- [x] Componente UserChatModal
- [x] Integración en CustomerPublicPage
- [x] Validación de autenticación
- [x] Validación de no contactar a sí mismo
- [x] Polling interno cada 3s
- [x] Refresco del header al enviar

### Actualización Automática
- [x] Polling global cada 5s
- [x] Función window.refreshMessagesAndNotifications()
- [x] Refresco después de enviar (todos los modales)
- [x] Delay de 500ms para sincronización
- [x] Limpieza correcta de intervalos

### Cambio de Sesión
- [x] Evento userLogin
- [x] Evento userLogout
- [x] Limpieza de estados en MainHeader
- [x] Limpieza de estados en CustomerProfilePage
- [x] Limpieza de estados en OnboardingPage
- [x] Recarga automática de datos al login
- [x] Sin caché del usuario anterior

### Mejoras Visuales
- [x] Avatares en dropdown de mensajes
- [x] Nombres reales de remitentes
- [x] Badges de tipo de conversación
- [x] Posicionamiento centrado de modales
- [x] Gradientes para mensajes propios
- [x] Responsive en todos los dispositivos

### Correcciones Backend
- [x] Incremento seguro de unreadMessages
- [x] Actualización de lastMessageAt
- [x] Índices optimizados en Message
- [x] Limpieza de logs debug
- [x] Manejo de errores mejorado

---

## 🚀 Próximas Mejoras (Opcional)

### Corto Plazo
- [ ] Agregar avatares para clientes en reservas
- [ ] Indicador de "escribiendo..." en tiempo real
- [ ] Notificaciones de escritorio (Push API)
- [ ] Sonido al recibir mensaje
- [ ] Marcar conversación como leída/no leída manualmente

### Mediano Plazo
- [ ] WebSockets para actualizaciones instantáneas
- [ ] Búsqueda de mensajes
- [ ] Adjuntar imágenes en mensajes
- [ ] Emojis y reacciones
- [ ] Historial de mensajes con paginación

### Largo Plazo
- [ ] Llamadas de voz/video
- [ ] Grupos de chat
- [ ] Mensajes programados
- [ ] Inteligencia artificial para respuestas sugeridas
- [ ] Analytics de conversaciones

---

## 🧪 Testing Manual

### Test 1: Chat Usuario-Usuario
1. Usuario A entra a perfil de Usuario B
2. Click en "Contactar"
3. Escribir mensaje y enviar
4. Verificar que aparece en el chat
5. Usuario B refresca o espera 5s
6. Verificar que aparece notificación en badge
7. Abrir dropdown de mensajes
8. Verificar que aparece conversación con avatar y nombre de Usuario A

### Test 2: Actualización Sin F5
1. Usuario A envía mensaje a Usuario B
2. NO hacer F5
3. Esperar máximo 5 segundos
4. Verificar que Usuario B ve el mensaje
5. Usuario B responde
6. Verificar que Usuario A ve la respuesta sin F5

### Test 3: Cambio de Sesión
1. Login como Usuario A
2. Verificar sus tiendas, mensajes, notificaciones
3. Hacer logout
4. Verificar que todo se limpia
5. Login como Usuario B
6. Verificar que aparecen datos de Usuario B
7. Verificar que NO hay datos de Usuario A

### Test 4: Mensajes de Reservas
1. Cliente hace reserva
2. Cliente envía mensaje en chat de reserva
3. Dueño espera 5s (sin F5)
4. Verificar badge de nuevo mensaje
5. Abrir dropdown, ver conversación con nombre del cliente
6. Dueño responde
7. Cliente espera 5s (sin F5)
8. Verificar que recibe respuesta

---

## 📞 Soporte y Troubleshooting

### Problema: Mensajes no se actualizan
**Solución:**
- Verificar que el polling está activo (console.log en loadData)
- Verificar que `window.refreshMessagesAndNotifications` existe
- Revisar errores en Network tab del navegador
- Verificar que el backend está actualizando `lastMessageAt`

### Problema: Datos del usuario anterior persisten
**Solución:**
- Verificar que eventos `userLogin` y `userLogout` se disparan
- Revisar que componentes escuchan los eventos
- Limpiar localStorage manualmente si es necesario
- Cerrar sesión y eliminar cookies

### Problema: Modal desalineado
**Solución:**
- Verificar clases: `fixed inset-0 flex items-start justify-center pt-20`
- Verificar z-index: debe ser mayor que otros elementos
- Revisar CSS custom que pueda interferir

### Problema: Polling consume muchos recursos
**Solución:**
- Aumentar intervalo de 5s a 10s o 15s
- Implementar WebSockets para reemplazar polling
- Usar Service Workers para notificaciones

---

## 📝 Notas de Versión

### v2.0 (Noviembre 21, 2025)
- ✅ Sistema completo de chat usuario-usuario
- ✅ Polling optimizado a 5 segundos
- ✅ Eventos de sesión para cambio de usuario
- ✅ Mejoras visuales en dropdown de mensajes
- ✅ Correcciones críticas en backend
- ✅ Delay estratégico de 500ms al enviar

### v1.0 (Anterior)
- Chat de reservas básico
- Notificaciones para dueños
- Sistema de mensajes para orders

---

## 👥 Créditos

**Desarrollado por:** Equipo Vitrinex  
**Última actualización:** Noviembre 21, 2025  
**Documentación:** Sistema de Mensajería V2

---

## 📄 Licencia

Este código es propiedad de Vitrinex y está sujeto a las condiciones de uso interno del proyecto.

---

**🎉 Sistema de Mensajería V2 - Completamente Funcional y Optimizado** 🎉
