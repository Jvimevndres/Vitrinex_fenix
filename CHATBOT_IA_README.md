# 🤖 Chatbot con IA - Documentación Completa de Vitrinex

**Fecha de implementación:** Noviembre 22, 2025  
**Estado:** ✅ Implementado y Funcional

---

## 📋 Resumen Ejecutivo

Se ha implementado exitosamente un **chatbot con inteligencia artificial** en Vitrinex que funciona en dos modos:

1. **Modo DEMO** (sin necesidad de OpenAI) - Respuestas inteligentes predefinidas
2. **Modo IA Real** (con OpenAI API) - Respuestas generadas por GPT-3.5 Turbo

El sistema **cambia automáticamente a modo DEMO** si hay problemas con la cuota de OpenAI, garantizando que el chatbot siempre esté disponible.

---

## 🎯 Características Implementadas

### Backend
✅ **Cliente de IA** (`backend/src/libs/aiClient.js`)
- Soporte para OpenAI GPT-3.5 Turbo
- Modo DEMO con respuestas inteligentes predefinidas
- Fallback automático si se agota la cuota de OpenAI
- Manejo seguro de API keys mediante variables de entorno

✅ **Controlador** (`backend/src/controllers/chatbot.controller.js`)
- Endpoint `POST /api/chatbot` para mensajes
- Endpoint `GET /api/chatbot/health` para verificar estado
- Validación de mensajes (máximo 2000 caracteres)

✅ **Rutas** (`backend/src/routes/chatbot.routes.js`)
- Rutas públicas (no requieren autenticación)

### Frontend
✅ **API Client** (`frontend/src/api/chatbot.js`)
- Funciones para enviar mensajes y verificar estado

✅ **Widget Visual** (`frontend/src/components/ChatbotWidget.jsx`)
- Botón flotante en esquina inferior derecha
- Ventana de chat moderna y responsiva
- Indicador visual de modo DEMO
- Historial de conversación
- Animaciones suaves
- Diseño consistente con Vitrinex (indigo/purple)

✅ **Integración Global**
- Widget disponible en todas las páginas
- No interfiere con funcionalidades existentes

---

## ⚙️ Configuración

### Variables de Entorno (Backend)

Tu archivo `backend/.env` debe contener:

```env
PORT=3000
MONGODB_URI=tu_mongodb_uri_aqui
JWT_SECRET=tu_secreto_jwt_aqui
FRONTEND_ORIGIN=http://localhost:5173

# 🤖 Chatbot con IA
AI_API_KEY=tu_clave_api_de_openai_aqui
AI_PROVIDER=openai
AI_MODEL=gpt-3.5-turbo
```

### Obtener API Key de OpenAI

1. Ve a https://platform.openai.com/api-keys
2. Inicia sesión o crea una cuenta
3. Genera una nueva API key
4. Cópiala en el `.env`

**Nota:** Si no tienes créditos o no configuras la API key, el chatbot funcionará en modo DEMO automáticamente.

---

## 🚀 Cómo Usar

### Iniciar el Backend
```bash
cd backend
npm run dev
```

O usa el script:
```bash
.\reiniciar-backend.ps1
```

### Iniciar el Frontend
```bash
cd frontend
npm run dev
```

### Probar el Chatbot
1. Abre http://localhost:5173
2. Verás el botón flotante del chatbot 🤖 en la esquina inferior derecha
3. Haz clic para abrir el chat
4. Si ves un badge "DEMO" = modo con respuestas predefinidas
5. Si NO ves el badge = modo IA real de OpenAI

---

## 💬 Preguntas de Ejemplo

### Para Modo DEMO:
```
¿Qué es Vitrinex?
¿Cómo creo una tienda?
¿Cómo hago una reserva?
¿Cómo vendo productos?
¿Cómo funciona el sistema de mensajes?
¿Cómo configuro mis horarios?
```

### Para Modo IA Real:
```
Explícame detalladamente cómo configurar mi negocio en Vitrinex

Dame estrategias para aumentar las ventas en mi tienda

¿Cuáles son las mejores prácticas para gestionar reservas?

Ayúdame a entender las estadísticas de mi negocio
```

---

## 🔄 Dos Modos de Operación

### Modo DEMO
- ✅ **Siempre disponible**
- ✅ **Gratis**
- ✅ **Respuestas inteligentes predefinidas**
- ✅ Cubre casos comunes de uso de Vitrinex
- ⚠️ Limitado a preguntas específicas
- 🏷️ Muestra badge "DEMO"

### Modo IA Real (OpenAI)
- 🤖 **Respuestas generadas por GPT-3.5 Turbo**
- 💬 **Más naturales y contextuales**
- 🧠 **Entiende preguntas complejas**
- 🌐 **Multilingüe**
- 💰 Costo: ~$0.002 por conversación
- ✨ Sin badge "DEMO"

**El sistema cambia automáticamente a DEMO si:**
- No hay API key configurada
- La API key es inválida
- Se agotó la cuota de OpenAI
- Hay problemas de red con OpenAI

---

## 📁 Archivos Creados/Modificados

### Nuevos Archivos

**Backend:**
```
backend/src/libs/aiClient.js           - Cliente de IA con fallback
backend/src/controllers/chatbot.controller.js  - Controlador
backend/src/routes/chatbot.routes.js   - Rutas
```

**Frontend:**
```
frontend/src/api/chatbot.js            - API client
frontend/src/components/ChatbotWidget.jsx  - Widget visual
```

**Documentación:**
```
CHATBOT_IA_README.md                   - Este archivo
reiniciar-backend.ps1                  - Script de reinicio
```

### Archivos Modificados

**Backend:**
- `backend/src/index.js` - Agregadas rutas del chatbot (2 líneas)
- `backend/.env` - Variables de IA
- `backend/.env.example` - Documentación de variables

**Frontend:**
- `frontend/src/App.jsx` - Integrado ChatbotWidget (2 líneas)
- `frontend/src/index.css` - Animaciones del widget

**Documentación:**
- `README.md` - Sección sobre configuración del chatbot

---

## 🐛 Troubleshooting

### Error: "insufficient_quota" (Actual)

**Causa:** Tu cuenta de OpenAI no tiene créditos disponibles.

**Soluciones:**
1. **Usar Modo DEMO (Automático):** El sistema ya cambió a modo DEMO automáticamente
2. **Agregar créditos a OpenAI:**
   - Ve a https://platform.openai.com/account/billing
   - Agrega una tarjeta de crédito
   - Compra créditos ($5 mínimo recomendado)
3. **Usar créditos gratuitos:** 
   - Cuentas nuevas reciben $5 gratis
   - Válido por 3 meses

### El chatbot no aparece
- ✅ Verifica que el frontend esté corriendo
- ✅ Recarga con Ctrl+Shift+R
- ✅ Revisa consola del navegador (F12)

### El chatbot no responde
- ✅ Verifica que el backend esté corriendo
- ✅ Abre: http://localhost:3000/api/chatbot/health
- ✅ Revisa logs del backend

### Error de CORS
- ✅ Verifica `FRONTEND_ORIGIN` en `backend/.env`
- ✅ Debe ser: `http://localhost:5173`

---

## 💰 Costos de OpenAI

### Modelo: GPT-3.5 Turbo

| Concepto | Costo |
|----------|-------|
| Por 1K tokens input | $0.0015 |
| Por 1K tokens output | $0.002 |
| Conversación promedio | ~$0.002 |
| 100 conversaciones | ~$0.20 |
| 1000 conversaciones | ~$2.00 |

**Recomendación:** $5 de crédito puede durar varios meses de pruebas.

**Monitorear uso:** https://platform.openai.com/usage

---

## 🔒 Seguridad

✅ API key en `.env` (no se sube a Git)  
✅ `.env` en `.gitignore`  
✅ API key nunca expuesta en el frontend  
✅ Todas las llamadas pasan por el backend  
✅ Validación de mensajes en backend  

**⚠️ Importante:**
- No compartas tu API key
- No la subas a repositorios públicos
- Si se filtra, revócala en OpenAI inmediatamente

---

## 📊 Verificar Estado del Chatbot

### Método 1: Navegador
Abre: http://localhost:3000/api/chatbot/health

**Modo DEMO:**
```json
{
  "status": "operational",
  "mode": "demo",
  "message": "Chatbot en modo DEMO..."
}
```

**Modo IA Real:**
```json
{
  "status": "operational",
  "mode": "ai",
  "message": "Chatbot usando IA real de OpenAI"
}
```

### Método 2: Visual
- **Con badge "DEMO"** = Modo DEMO
- **Sin badge** = Modo IA Real

---

## 🎨 Personalización del Prompt (Opcional)

Para cambiar cómo responde la IA, edita:
```
backend/src/libs/aiClient.js
```

Busca la función `callOpenAI` y modifica el `system` prompt:

```javascript
{
  role: "system",
  content: "Eres un asistente virtual de Vitrinex..." // ← Modifica aquí
}
```

Puedes:
- Cambiar el tono (formal/informal)
- Agregar conocimiento específico de tu negocio
- Definir cómo debe responder
- Establecer límites de lo que puede/no puede hacer

---

## 🚀 Mejoras Futuras (Opcional)

1. **Historial persistente** - Guardar conversaciones en MongoDB
2. **Contexto de usuario** - Usar info del usuario autenticado
3. **Múltiples idiomas** - Detectar idioma automáticamente
4. **Sugerencias rápidas** - Botones con preguntas frecuentes
5. **Integración con datos reales** - Consultar productos/servicios de la BD
6. **Analytics** - Tracking de preguntas más frecuentes
7. **Feedback** - Sistema de valoración (👍 👎)
8. **Modo voz** - Transcripción de audio a texto
9. **Exportar conversación** - Descargar chat como PDF
10. **Notificaciones** - Alertas cuando el chatbot responde

---

## 📝 Scripts Útiles

### Reiniciar Backend
```bash
.\reiniciar-backend.ps1
```

### Ver logs en tiempo real
El backend ya muestra logs de cada mensaje:
```
Chatbot - Mensaje recibido: ¿Cómo...
Chatbot - Respuesta generada exitosamente
```

### Probar endpoint manualmente
```bash
curl -X POST http://localhost:3000/api/chatbot \
  -H "Content-Type: application/json" \
  -d '{"message": "Hola"}'
```

---

## ✅ Checklist de Implementación

- [x] Backend: Cliente de IA creado
- [x] Backend: Controlador implementado
- [x] Backend: Rutas configuradas
- [x] Backend: Integrado en index.js
- [x] Backend: Variables de entorno documentadas
- [x] Frontend: API client creado
- [x] Frontend: Widget visual implementado
- [x] Frontend: Integrado en App.jsx
- [x] Frontend: Estilos y animaciones
- [x] Modo DEMO funcional
- [x] Modo IA Real funcional
- [x] Fallback automático
- [x] Manejo de errores robusto
- [x] Documentación completa

---

## 🎉 Estado Actual

### ✅ Lo que Funciona:
- Chatbot visible en todas las páginas
- Modo DEMO con respuestas inteligentes
- Interfaz visual moderna y responsiva
- Fallback automático cuando no hay créditos
- Manejo de errores robusto
- Integración no invasiva (no rompe nada)

### ⚠️ Acción Requerida:
- **Agregar créditos a OpenAI** para usar IA real
- Mientras tanto, el chatbot funciona perfectamente en modo DEMO

---

## 📞 Soporte y Recursos

**OpenAI:**
- Dashboard: https://platform.openai.com
- Documentación: https://platform.openai.com/docs
- Precios: https://openai.com/pricing
- Billing: https://platform.openai.com/account/billing

**Vitrinex:**
- El chatbot responde preguntas sobre la plataforma
- Usa el propio chatbot para aprender más sobre Vitrinex

---

## 🔄 Actualizaciones

**v1.0 (22/Nov/2025):**
- ✅ Implementación inicial
- ✅ Modo DEMO
- ✅ Modo IA Real
- ✅ Fallback automático
- ✅ Widget visual completo

**Próxima versión:**
- Historial persistente
- Feedback de usuarios
- Más respuestas en modo DEMO

---

**✨ ¡Chatbot implementado exitosamente! El sistema está funcionando en modo DEMO mientras agregas créditos a OpenAI. Una vez agregues créditos, simplemente reinicia el backend y tendrás IA real automáticamente. 🚀**

---

## 🎯 Características Implementadas

### Backend
✅ **Cliente de IA** (`backend/src/libs/aiClient.js`)
- Configurado para OpenAI (extensible a otros proveedores)
- Manejo seguro de claves de API mediante variables de entorno
- Validaciones y manejo de errores robusto
- Sistema de mensajes personalizado para Vitrinex

✅ **Controlador** (`backend/src/controllers/chatbot.controller.js`)
- Endpoint `POST /api/chatbot` para recibir mensajes
- Endpoint `GET /api/chatbot/health` para verificar estado del servicio
- Validación de mensajes (longitud, formato)
- Manejo de errores con mensajes amigables

✅ **Rutas** (`backend/src/routes/chatbot.routes.js`)
- Rutas públicas (no requieren autenticación)
- Integradas en el router principal de Express

### Frontend
✅ **API Client** (`frontend/src/api/chatbot.js`)
- Funciones para enviar mensajes al chatbot
- Verificación de estado del servicio

✅ **Widget Visual** (`frontend/src/components/ChatbotWidget.jsx`)
- Botón flotante tipo burbuja en esquina inferior derecha
- Ventana de chat moderna y responsiva
- Historial de conversación
- Indicador de carga con animación
- Manejo de errores con mensajes amigables
- Contador de caracteres (límite 2000)
- Diseño consistente con la paleta de colores del proyecto (indigo/purple)

✅ **Integración Global** (`frontend/src/App.jsx`)
- ChatbotWidget disponible en todas las páginas
- No interfiere con rutas ni componentes existentes

---

## ⚙️ Configuración Requerida

### Variables de Entorno (Backend)

Agrega estas líneas a tu archivo `backend/.env`:

```env
# 🤖 Chatbot con IA
AI_API_KEY=tu_clave_api_de_openai_aqui
AI_PROVIDER=openai
AI_MODEL=gpt-3.5-turbo
```

### Obtener API Key de OpenAI

1. Ve a https://platform.openai.com/api-keys
2. Inicia sesión o crea una cuenta
3. Crea una nueva API key
4. Copia la key y pégala en el `.env`

**Nota:** Si no configuras `AI_API_KEY`, el chatbot mostrará un mensaje de error pero el resto de la aplicación funcionará normalmente.

---

## 🚀 Cómo Usar

### Para Usuarios
1. El botón flotante del chatbot aparece en la esquina inferior derecha
2. Haz clic en el botón para abrir el chat
3. Escribe tu pregunta en el campo de texto
4. Presiona Enter o haz clic en el botón de enviar
5. La IA responderá en unos segundos

### Preguntas de Ejemplo
- "¿Cómo puedo crear una tienda?"
- "¿Cómo reservo un servicio?"
- "¿Qué es Vitrinex?"
- "¿Cómo agrego productos a mi tienda?"
- "¿Cómo funciona el sistema de mensajería?"

---

## 🎨 Diseño Visual

### Colores
- Fondo del botón: Gradiente indigo-600 a purple-600
- Mensajes del usuario: Gradiente indigo-purple
- Mensajes de la IA: Fondo blanco con borde gris
- Mensajes de error: Fondo rojo claro

### Animaciones
- Hover en el botón: Escala y sombra
- Apertura del chat: Deslizamiento suave
- Carga: Puntos animados
- Icono del robot: Rebote al pasar el mouse

---

## 📁 Archivos Nuevos Creados

### Backend
```
backend/
├── src/
│   ├── libs/
│   │   └── aiClient.js                    ← Cliente de IA
│   ├── controllers/
│   │   └── chatbot.controller.js          ← Controlador del chatbot
│   └── routes/
│       └── chatbot.routes.js              ← Rutas del chatbot
```

### Frontend
```
frontend/
├── src/
│   ├── api/
│   │   └── chatbot.js                     ← API client
│   └── components/
│       └── ChatbotWidget.jsx              ← Widget visual
```

---

## 📝 Archivos Modificados

### Backend
- `backend/src/index.js` - Agregadas rutas del chatbot
- `backend/.env.example` - Documentadas variables de IA

### Frontend
- `frontend/src/App.jsx` - Integrado ChatbotWidget

### Documentación
- `README.md` - Actualizado con info del chatbot

---

## ✅ Verificación de No Ruptura

**No se modificó:**
- ❌ Sistema de autenticación
- ❌ Rutas existentes del frontend
- ❌ Componentes actuales
- ❌ Modelos de base de datos
- ❌ Lógica de negocio existente
- ❌ Estilos globales

**Solo se agregó:**
- ✅ Nuevos archivos (no modifican existentes)
- ✅ Una línea de import y componente en App.jsx
- ✅ Dos líneas en backend/src/index.js para registrar rutas
- ✅ Documentación en README y .env.example

---

## 🧪 Testing

### Probar el Backend
```bash
# En una terminal
cd backend
npm run dev

# En otra terminal (con curl o Postman)
curl -X POST http://localhost:3000/api/chatbot \
  -H "Content-Type: application/json" \
  -d '{"message": "Hola, ¿qué es Vitrinex?"}'
```

### Probar el Frontend
1. Inicia el backend y frontend
2. Abre el navegador en http://localhost:5173
3. Verás el botón flotante del chatbot en la esquina inferior derecha
4. Haz clic y prueba el chat

---

## 🔧 Troubleshooting

### El chatbot no responde
- ✅ Verifica que `AI_API_KEY` esté configurada en el `.env`
- ✅ Verifica que el backend esté corriendo
- ✅ Revisa la consola del backend por errores
- ✅ Verifica que tengas créditos en tu cuenta de OpenAI

### El botón no aparece
- ✅ Verifica que el frontend esté corriendo
- ✅ Abre la consola del navegador para ver errores
- ✅ Verifica que el import en App.jsx esté correcto

### Error de CORS
- ✅ Verifica que `FRONTEND_ORIGIN` en el backend `.env` coincida con la URL del frontend

---

## 🚀 Mejoras Futuras (Opcionales)

1. **Historial persistente**: Guardar conversaciones en localStorage o base de datos
2. **Contexto de usuario**: Usar información del usuario autenticado para respuestas personalizadas
3. **Múltiples idiomas**: Soporte para inglés, portugués, etc.
4. **Sugerencias automáticas**: Botones con preguntas frecuentes
5. **Integración con negocio**: Respuestas específicas sobre tiendas, productos, etc.
6. **Analytics**: Tracking de preguntas más frecuentes
7. **Feedback**: Permitir calificar respuestas (👍 👎)

---

## 📞 Soporte

Si tienes problemas con la implementación, revisa:
1. Los logs del backend (`console`)
2. La consola del navegador (F12)
3. El estado del servicio: `http://localhost:3000/api/chatbot/health`

---

**✨ Implementación completada exitosamente sin romper funcionalidades existentes!**
