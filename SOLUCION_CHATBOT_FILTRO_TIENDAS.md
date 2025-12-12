# Solución: Filtro Inteligente de Tiendas en Chatbot

## Problema Identificado
El chatbot estaba devolviendo información mezclada de todas las tiendas del usuario cuando se preguntaba por una tienda específica.

### Ejemplo del problema:
- Usuario pregunta: "¿Cuántos productos tiene GrowShopWeed?"
- Chatbot respondía con información de GrowShopWeed Y de otras tiendas del mismo usuario

## Causa Raíz
En `backend/src/controllers/chatbot.controller.js`, el código obtenía **todas** las tiendas del usuario sin filtrar:

```javascript
// ❌ ANTES - Sin filtrado
const stores = await Store.find({ owner: userId });
const storeIds = stores.map(s => s._id);

// Luego buscaba productos, órdenes, etc. de TODAS las tiendas
const products = await Product.find({ store: { $in: storeIds } });
```

Esto causaba que:
1. Se enviaran datos de todas las tiendas a la IA
2. La IA mezclara información de múltiples tiendas en la respuesta

## Solución Implementada

### 1. Detección Inteligente de Tienda Específica
Agregamos lógica para detectar si el usuario menciona una tienda específica:

```javascript
// ✅ NUEVO - Detección inteligente
const allStores = await Store.find({ owner: userId });
let stores = allStores;
let specificStoreDetected = null;

if (allStores.length > 1) {
  const messageLower = message.toLowerCase();
  
  // Buscar si el mensaje menciona el nombre de alguna tienda
  const mentionedStore = allStores.find(store => {
    const storeName = store.name.toLowerCase();
    return messageLower.includes(storeName) || 
           messageLower.includes(storeName.split(' ')[0]) ||
           (storeName.length > 5 && messageLower.includes(storeName.substring(0, 5)));
  });
  
  if (mentionedStore) {
    stores = [mentionedStore]; // ✅ Filtrar solo esa tienda
    specificStoreDetected = mentionedStore.name;
  }
}
```

### 2. Detección de Preguntas Específicas vs Generales
Si el usuario no menciona una tienda pero hace una pregunta específica:

```javascript
const specificQuestions = [
  'esta tienda', 'mi tienda', 'la tienda',
  'productos de', 'ventas de', 'clientes de',
  'órdenes de', 'reservas de', 'ingresos de'
];

const isSpecificQuestion = specificQuestions.some(q => messageLower.includes(q));

if (isSpecificQuestion && allStores.length > 0) {
  stores = [allStores[0]]; // Usar primera tienda por defecto
  specificStoreDetected = allStores[0].name;
}
```

### 3. Contexto Enriquecido para la IA
Agregamos información del filtro al contexto que se envía a la IA:

```javascript
const userContext = {
  // Nuevo: Información del filtro
  specificStoreFilter: specificStoreDetected ? {
    detected: true,
    storeName: specificStoreDetected,
    message: `El usuario pregunta específicamente sobre "${specificStoreDetected}". 
              RESPONDE SOLO CON DATOS DE ESTA TIENDA.`
  } : {
    detected: false,
    message: allStores.length > 1 
      ? `El usuario tiene ${allStores.length} tiendas. Solicita que aclare cuál.` 
      : null
  },
  
  storesCount: stores.length,
  totalStoresOwned: allStores.length,
  // ... resto del contexto
};
```

### 4. Prompt Actualizado para la IA
Actualizamos el prompt del sistema en `backend/src/libs/aiClient.js`:

```javascript
"🚨 IMPORTANTE - FILTRO DE TIENDAS:\n" +
"• Si el contexto indica FILTRO ACTIVO, SOLO responde con datos de ESA tienda\n" +
"• NUNCA mezcles información de diferentes tiendas cuando el filtro está activo\n" +
"• Si el usuario tiene múltiples tiendas pero no especifica, pregunta cuál le interesa\n" +
"• Cuando respondas sobre una tienda específica, menciona su nombre al inicio\n"
```

## Casos de Uso

### Caso 1: Mención Explícita de Tienda
```
Usuario: "¿Cuántos productos tiene GrowShopWeed?"
Sistema: Detecta "GrowShopWeed" → Filtra solo esa tienda
Chatbot: "GrowShopWeed tiene 8 productos con un valor total de $653.990..."
```

### Caso 2: Pregunta Específica sin Mención
```
Usuario: "¿Cuáles son mis productos más vendidos?"
Sistema: Detecta pregunta específica → Usa primera tienda
Chatbot: "Los productos más vendidos de [Nombre Tienda] son..."
```

### Caso 3: Pregunta General con Múltiples Tiendas
```
Usuario: "Dame un resumen de mi negocio"
Sistema: No detecta tienda específica → Mantiene todas las tiendas
Chatbot: "Tienes 2 tiendas: GrowShopWeed y Vitrina Premium. 
         ¿Sobre cuál te gustaría un análisis detallado?"
```

## Beneficios

1. **Respuestas Precisas**: El chatbot solo responde con datos de la tienda consultada
2. **Sin Confusión**: Evita mezclar información de diferentes negocios
3. **Detección Inteligente**: Reconoce menciones parciales del nombre de la tienda
4. **Manejo de Ambigüedad**: Si no detecta la tienda, pregunta al usuario
5. **Backward Compatible**: No rompe funcionalidad para usuarios con una sola tienda

## Archivos Modificados

1. **backend/src/controllers/chatbot.controller.js**
   - Líneas ~190-235: Lógica de detección de tienda
   - Líneas ~370-380: Contexto con filtro

2. **backend/src/libs/aiClient.js**
   - Líneas ~167-175: Mensaje de filtro en contexto
   - Líneas ~408-415: Prompt actualizado con instrucciones de filtro

## Cómo Probar

### Test 1: Tienda Específica
```
Pregunta: "¿Cuántas órdenes tiene GrowShopWeed?"
Esperado: Solo información de GrowShopWeed
```

### Test 2: Primera Palabra del Nombre
```
Pregunta: "¿Cuántos clientes tiene Grow?"
Esperado: Detecta "GrowShopWeed" y filtra esa tienda
```

### Test 3: Múltiples Tiendas sin Especificar
```
Pregunta: "Dame un resumen"
Esperado: Menciona que tiene múltiples tiendas y pregunta cuál analizar
```

### Test 4: Pregunta con "mi tienda" (una sola tienda)
```
Pregunta: "¿Cómo van las ventas de mi tienda?"
Esperado: Usa la primera/única tienda del usuario
```

## Logs de Debug
El sistema ahora loguea cuando detecta una tienda específica:

```
🎯 Tienda específica detectada: GrowShopWeed
🎯 Usando tienda por defecto (pregunta específica): Vitrina Premium
```

## Próximas Mejoras Opcionales

1. **Alias de Tiendas**: Permitir configurar apodos para las tiendas
2. **Comparación entre Tiendas**: "Compara las ventas de GrowShop vs Vitrina"
3. **Selección Manual**: Botón en el frontend para elegir tienda activa
4. **Memoria de Contexto**: Recordar la última tienda consultada en la sesión

## Fecha de Implementación
Diciembre 11, 2025
