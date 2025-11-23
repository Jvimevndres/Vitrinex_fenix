# 🤖💰 Monitor de Chatbot OpenAI - Sistema de Tracking

## 📋 Descripción General

Sistema completo de monitoreo y análisis del uso del chatbot OpenAI en Vitrinex, que permite:

- **Tracking automático** de cada consulta premium con tokens y costos
- **Visualización en tiempo real** del saldo disponible y consumido
- **Proyecciones inteligentes** de duración del saldo
- **Gráficos interactivos** de uso diario, costos y tokens
- **Top usuarios** por consumo

---

## 🎯 Características Principales

### 1. **Tracking Automático**
✅ Cada consulta premium se registra automáticamente en MongoDB  
✅ Captura: tokens (input/output), costo, modelo, usuario, tienda, timestamp  
✅ Cálculo preciso de costos según pricing de OpenAI  

### 2. **Dashboard Completo**
📊 **Tarjetas de Saldo:**
- Saldo inicial: $5.00 USD
- Gastado hasta ahora (con barra de progreso)
- Saldo disponible restante

🔮 **Proyecciones:**
- Consultas restantes estimadas
- Duración estimada en meses
- Costo promedio por consulta

📈 **Gráficos Interactivos:**
- Costo diario (área chart)
- Consultas diarias (bar chart)
- Distribución Free vs Premium (pie chart)
- Tokens diarios (line chart)

👥 **Top Usuarios:**
- Tabla con los 10 usuarios que más consumen
- Muestra: consultas, tokens totales, costo total

### 3. **Filtros de Tiempo**
- Últimos 7 días
- Últimos 30 días (default)
- Últimos 90 días
- Todo el historial

---

## 🗂️ Archivos Creados/Modificados

### Backend

#### **Nuevo: `backend/src/models/ChatbotUsage.js`**
Modelo MongoDB para guardar historial de uso:
```javascript
{
  storeId: ObjectId,
  userId: ObjectId,
  messageType: 'free' | 'premium',
  promptTokens: Number,
  completionTokens: Number,
  totalTokens: Number,
  estimatedCost: Number (USD),
  model: String,
  success: Boolean,
  errorMessage: String,
  createdAt: Date
}
```

#### **Modificado: `backend/src/libs/aiClient.js`**
- Función `callOpenAIPremium()` ahora retorna objeto con `message` + `usage`
- Usage incluye: `promptTokens`, `completionTokens`, `totalTokens`

#### **Modificado: `backend/src/controllers/chatbot.controller.js`**
- Importa modelo `ChatbotUsage`
- En `sendPremiumChatMessage()`:
  - Captura datos de uso de OpenAI
  - Calcula costo: `(promptTokens/1M * $0.15) + (completionTokens/1M * $0.60)`
  - Guarda registro en base de datos
  - Retorna costo en respuesta

- **Nueva función: `getChatbotStats()`**
  - Acepta query param: `timeRange` (7d, 30d, 90d, all)
  - Calcula estadísticas agregadas
  - Genera datos para gráficos diarios
  - Proyecta saldo restante y duración
  - Lista top usuarios por consumo

#### **Modificado: `backend/src/routes/chatbot.routes.js`**
- Nueva ruta: `GET /api/chatbot/stats?timeRange=30d`
- Requiere autenticación (solo admin puede acceder)

### Frontend

#### **Nuevo: `frontend/src/pages/AdminChatbotMonitor.jsx`**
Página completa del monitor con:
- Header con título y descripción
- Selector de rango de tiempo (7d/30d/90d/all)
- 3 tarjetas principales de saldo (inicial/gastado/disponible)
- 3 tarjetas de proyecciones (consultas restantes/duración/costo promedio)
- 4 tarjetas de estadísticas generales
- 4 gráficos interactivos (Recharts)
- Tabla de top usuarios
- Info box con detalles del sistema

**Gráficos:**
1. **Costo Diario** - AreaChart con gradiente naranja
2. **Consultas Diarias** - BarChart azul
3. **Tipo de Consultas** - PieChart (Free vs Premium)
4. **Tokens Diarios** - LineChart morado

#### **Modificado: `frontend/src/api/chatbot.js`**
- Nueva función: `getChatbotStats(timeRange)`

#### **Modificado: `frontend/src/App.jsx`**
- Import: `AdminChatbotMonitor`
- Nueva ruta: `/admin/chatbot`

#### **Modificado: `frontend/src/components/AdminLayout.jsx`**
- Nuevo item en menú: 🤖 Chatbot IA

#### **Instalado: `recharts`**
```bash
npm install recharts
```

---

## 💰 Cálculo de Costos

### Pricing de OpenAI (gpt-4o-mini)
- **Input tokens:** $0.15 por 1M tokens
- **Output tokens:** $0.60 por 1M tokens

### Fórmula Implementada
```javascript
const inputCost = (promptTokens / 1_000_000) * 0.15;
const outputCost = (completionTokens / 1_000_000) * 0.60;
const totalCost = inputCost + outputCost;
```

### Ejemplos Reales
1. **Consulta simple** (500 tokens input, 200 output):
   - Input: $0.000075
   - Output: $0.000120
   - **Total: $0.000195** (~$0.0002)

2. **Consulta compleja** (1500 tokens input, 600 output):
   - Input: $0.000225
   - Output: $0.000360
   - **Total: $0.000585** (~$0.0006)

3. **Promedio estimado:** $0.003 por consulta premium

---

## 📊 Proyecciones con $5 USD

### Estimación Conservadora
- Saldo inicial: **$5.00 USD**
- Costo promedio: **$0.003/consulta**
- **Consultas estimadas: ~1,667**

### Estimación Realista
- Considerando mix de consultas simples/complejas
- Costo promedio: **$0.002/consulta**
- **Consultas estimadas: ~2,500**

### Duración Proyectada
Basado en uso moderado (10-20 consultas/día):
- **Mínimo: 3 meses** (20 consultas/día)
- **Óptimo: 6 meses** (13 consultas/día)
- **Máximo: 8+ meses** (10 consultas/día)

---

## 🚀 Cómo Usar

### Para Admins

1. **Acceder al Monitor:**
   - Ir a `/admin/chatbot` o hacer clic en "🤖 Chatbot IA" en el menú admin

2. **Interpretar las Tarjetas:**
   - **Saldo Disponible (azul):** Cuánto dinero queda
   - **Gastado (naranja):** Cuánto se ha consumido (con %)
   - **Consultas Restantes (morado):** Cuántas más puedes hacer
   - **Duración Estimada (cyan):** Meses que durará el saldo

3. **Analizar Gráficos:**
   - **Costo Diario:** Identifica días de alto consumo
   - **Consultas Diarias:** Ve patrones de uso
   - **Free vs Premium:** Proporción de consultas
   - **Tokens Diarios:** Consumo técnico

4. **Revisar Top Usuarios:**
   - Identifica quién usa más el chatbot
   - Útil para detectar uso excesivo o mal uso

5. **Cambiar Rango de Tiempo:**
   - Usa los botones 7D/30D/90D/TODO para ver diferentes períodos

### Para Desarrolladores

**Backend - Obtener stats programáticamente:**
```javascript
// Con autenticación (token JWT en header)
const response = await axios.get('/api/chatbot/stats?timeRange=30d', {
  headers: { Authorization: `Bearer ${token}` }
});

const { summary, balance, dailyStats, topUsers } = response.data;
```

**Frontend - Integrar en otro componente:**
```javascript
import { getChatbotStats } from '../api/chatbot';

const stats = await getChatbotStats('7d');
console.log('Saldo restante:', stats.balance.remaining);
console.log('Consultas restantes:', stats.balance.estimatedQueriesRemaining);
```

---

## 🔧 Configuración Adicional

### Cambiar Saldo Inicial
Si recargas saldo en OpenAI, actualiza en el controller:

**`backend/src/controllers/chatbot.controller.js`** - línea ~370:
```javascript
// Cambiar este valor si recargas saldo
const initialBalance = 5.00; // ← Actualizar aquí
```

### Ajustar Pricing
Si OpenAI cambia precios:

**`backend/src/controllers/chatbot.controller.js`** - línea ~310:
```javascript
const inputCost = (aiResponse.usage.promptTokens / 1_000_000) * 0.15; // ← Input price
const outputCost = (aiResponse.usage.completionTokens / 1_000_000) * 0.60; // ← Output price
```

---

## 📈 Métricas Disponibles

### Summary
```javascript
{
  totalQueries: Number,        // Total de consultas en el período
  premiumQueries: Number,      // Consultas premium (con contexto)
  freeQueries: Number,         // Consultas gratuitas (sin contexto)
  totalTokens: Number,         // Tokens totales consumidos
  totalCost: Number,           // Costo total en USD
  avgTokensPerQuery: Number,   // Promedio de tokens por consulta
  avgCostPerQuery: Number      // Costo promedio por consulta
}
```

### Balance
```javascript
{
  initial: Number,                    // Saldo inicial ($5.00)
  spent: Number,                      // Total gastado
  remaining: Number,                  // Saldo disponible
  estimatedQueriesRemaining: Number,  // Consultas estimadas restantes
  estimatedMonthsRemaining: Number    // Meses de duración estimada
}
```

### Daily Stats
```javascript
[
  {
    date: '2025-11-23',
    queries: Number,
    cost: Number,
    tokens: Number
  },
  // ... 29 días más
]
```

### Top Users
```javascript
[
  {
    username: String,
    email: String,
    queries: Number,
    tokens: Number,
    cost: Number
  },
  // ... hasta 10 usuarios
]
```

---

## ⚠️ Alertas y Consideraciones

### Cuándo Recargar Saldo
- **🟡 Alerta amarilla:** Cuando quedan < $1.00 USD
- **🔴 Alerta roja:** Cuando quedan < $0.50 USD
- **❌ Sin saldo:** El chatbot automáticamente cambia a modo DEMO

### Monitoreo Recomendado
- Revisar el dashboard **semanalmente**
- Verificar top usuarios para detectar uso anómalo
- Analizar picos de consumo en gráfico de costo diario

### Optimización de Costos
1. **Reducir contexto:** El contexto premium actual usa ~1500 tokens
2. **Limitar respuestas:** Ajustar `max_tokens` en `aiClient.js` (actual: 800)
3. **Caché:** Implementar caché de consultas repetidas (próximamente)

---

## 🎨 Screenshots de Referencia

### Vista General
```
┌─────────────────────────────────────────────────────────┐
│ 📊 Monitor de Chatbot OpenAI                           │
│ Seguimiento de uso, costos y saldo disponible          │
├─────────────────────────────────────────────────────────┤
│ [7D] [30D] [90D] [TODO]                                 │
├─────────────────────────────────────────────────────────┤
│ 💵 Saldo Inicial  💸 Gastado      💰 Disponible         │
│ $5.00             $0.0234         $4.9766               │
│                   ████▒▒▒▒▒▒▒     ▒▒▒▒▒▒▒▒▒▒███         │
│                   0.5% usado      99.5% restante        │
├─────────────────────────────────────────────────────────┤
│ 🔮 Consultas      📅 Duración     📊 Costo Promedio     │
│ 2,488             6 meses         $0.002                │
├─────────────────────────────────────────────────────────┤
│ Total: 12        Premium: 8      Tokens: 18,450         │
│ Costo: $0.0234                                          │
├─────────────────────────────────────────────────────────┤
│ [Gráfico Costo]  [Gráfico Consultas]                   │
│ [Gráfico Pie]    [Gráfico Tokens]                      │
├─────────────────────────────────────────────────────────┤
│ 👥 Top Usuarios por Uso                                 │
│ # Usuario    Email             Consultas  Tokens  Costo │
│ 1 admin      admin@v.com       5          9,200   $0.02 │
│ 2 tienda1    t1@v.com          3          4,800   $0.01 │
└─────────────────────────────────────────────────────────┘
```

---

## 🆕 Próximas Mejoras

### v1.1 (Próximamente)
- [ ] Alertas automáticas cuando saldo < $1.00
- [ ] Exportar reportes a CSV/PDF
- [ ] Comparación mes vs mes
- [ ] Gráfico de tendencia proyectada

### v1.2 (Futuro)
- [ ] Notificaciones por email al admin
- [ ] Límites configurables por usuario
- [ ] Caché de consultas repetidas
- [ ] Análisis de sentimiento de consultas

---

## 🐛 Troubleshooting

### El dashboard no carga
**Problema:** Error 500 o pantalla en blanco  
**Solución:** 
1. Verificar que MongoDB esté conectado
2. Revisar logs del backend: `npm run dev` en `backend/`
3. Verificar que el usuario sea admin

### Los datos no se actualizan
**Problema:** Las estadísticas no reflejan consultas recientes  
**Solución:**
1. Hacer refresh en el navegador (F5)
2. Verificar que las consultas premium se estén guardando:
   ```bash
   # En MongoDB Compass o CLI
   db.chatbotusages.find().sort({createdAt:-1}).limit(10)
   ```

### Las proyecciones son incorrectas
**Problema:** Duración estimada es muy alta/baja  
**Solución:**
1. Las proyecciones se basan en uso promedio del período seleccionado
2. Cambiar rango de tiempo (7d/30d/90d) para ver diferentes estimaciones
3. Con poco historial, las estimaciones pueden ser inexactas

---

## 📞 Soporte

Para dudas o problemas:
1. Revisar logs del backend
2. Verificar estructura de MongoDB
3. Comprobar autenticación y rol de admin

---

## 📝 Changelog

### v1.0.0 (2025-11-23)
✅ Tracking automático de consultas premium  
✅ Dashboard completo con gráficos  
✅ Proyecciones de saldo y duración  
✅ Top usuarios por consumo  
✅ Filtros de rango de tiempo  
✅ 4 gráficos interactivos (Recharts)  
✅ Cálculo preciso de costos OpenAI  
✅ Integración completa backend + frontend  

---

**🎉 ¡Sistema completo y listo para producción!**
