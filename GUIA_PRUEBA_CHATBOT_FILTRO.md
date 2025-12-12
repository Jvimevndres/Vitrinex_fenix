# Guía Rápida: Cómo Probar el Filtro de Chatbot

## ✅ Solución Implementada

El chatbot ahora **detecta automáticamente** cuando preguntas por una tienda específica y **solo responde con datos de esa tienda**, evitando mezclar información.

## 🧪 Cómo Probar Manualmente

### Opción 1: Desde la Aplicación Web

1. **Inicia sesión** con un usuario que tenga 2 o más tiendas
2. **Abre el chatbot** (ícono en la esquina inferior derecha)
3. **Haz estas preguntas de prueba**:

#### Prueba 1: Mención directa de la tienda
```
¿Cuántos productos tiene GrowShopWeed?
```
✅ Debería responder **solo** con datos de GrowShopWeed

#### Prueba 2: Nombre parcial
```
¿Cómo van las ventas de Grow?
```
✅ Debería detectar "GrowShopWeed" y responder solo de esa tienda

#### Prueba 3: Otra tienda
```
Dame información de [Nombre de tu segunda tienda]
```
✅ Debería responder solo de la segunda tienda

#### Prueba 4: Sin especificar tienda
```
Dame un resumen de mi negocio
```
✅ Debería mencionar que tienes múltiples tiendas y preguntar cuál analizar

### Opción 2: Script de Prueba Automatizado

Creamos un script de prueba en `backend/test-chatbot-filter.js`

1. **Asegúrate de que el backend esté corriendo**:
   ```powershell
   cd backend
   npm start
   ```

2. **Ejecuta el script de prueba**:
   ```powershell
   node test-chatbot-filter.js
   ```

3. **Revisa los resultados** - El script probará automáticamente:
   - Pregunta con nombre completo de tienda
   - Pregunta con nombre parcial
   - Pregunta sobre segunda tienda
   - Pregunta específica sin mencionar tienda
   - Pregunta general

## 🔍 Qué Buscar en las Respuestas

### ✅ Correcto (Con Filtro)
```
Análisis de GrowShopWeed

Tu tienda tiene 8 productos con un valor total de $653.990.
```

### ❌ Incorrecto (Sin Filtro - ANTES)
```
Tienes 8 productos en GrowShopWeed y 15 productos en Vitrina Premium...
```
☝️ Este comportamiento **NO debería ocurrir** con la nueva solución

## 📝 Palabras Clave que Activan el Filtro

El sistema detecta:

1. **Nombre de la tienda** (completo o parcial):
   - "GrowShopWeed"
   - "Grow" (si es suficientemente distintivo)
   
2. **Preguntas específicas** (usa primera tienda por defecto):
   - "esta tienda"
   - "mi tienda"
   - "la tienda"
   - "productos de"
   - "ventas de"
   - "clientes de"
   - "órdenes de"
   - "reservas de"
   - "ingresos de"

## 🐛 Qué Hacer si No Funciona

1. **Verifica que el backend esté actualizado**:
   ```powershell
   cd backend
   git status
   ```

2. **Reinicia el servidor backend**:
   ```powershell
   # Detener el servidor actual (Ctrl+C)
   npm start
   ```

3. **Revisa los logs del backend** - Deberías ver:
   ```
   🎯 Tienda específica detectada: [Nombre de la tienda]
   ```

4. **Verifica en la consola del navegador** (F12):
   - ¿La petición llega al endpoint `/api/chatbot/premium`?
   - ¿Hay errores de red o autenticación?

## 📊 Logs de Debug

El backend ahora muestra logs cuando detecta una tienda:

```
Chatbot Premium - Usuario: admin, Mensaje: ¿Cuántos productos tiene Grow...
🎯 Tienda específica detectada: GrowShopWeed
Chatbot Premium - Respuesta generada para admin (1250 tokens, $0.000234)
```

## 🎯 Casos de Uso Reales

### Caso 1: Dueño con Múltiples Locales
```
Usuario: "¿Cuántos clientes tiene mi local del centro?"
Sistema: Detecta "local del centro" → Filtra esa tienda
Chatbot: Responde solo con datos de ese local
```

### Caso 2: Análisis Comparativo (Futuro)
```
Usuario: "Compara las ventas de Local Centro vs Local Norte"
Sistema: Detecta ambas tiendas → Análisis comparativo
Chatbot: Compara datos de ambas tiendas explícitamente
```

### Caso 3: Usuario Nuevo (1 Tienda)
```
Usuario: "¿Cómo van mis ventas?"
Sistema: Solo tiene 1 tienda → No aplica filtro
Chatbot: Responde con datos de su única tienda
```

## 📞 Soporte

Si encuentras problemas:

1. Revisa [SOLUCION_CHATBOT_FILTRO_TIENDAS.md](./SOLUCION_CHATBOT_FILTRO_TIENDAS.md) para detalles técnicos
2. Verifica los logs del backend
3. Comprueba que tienes al menos 2 tiendas para probar el filtrado
4. Verifica que tu plan sea Premium (el chatbot con datos reales requiere plan Premium)

## 🚀 Próximos Pasos

Una vez verificado que funciona:

1. ✅ El chatbot filtra por tienda específica
2. ✅ No mezcla información de diferentes tiendas
3. ✅ Maneja correctamente usuarios con 1 o múltiples tiendas
4. 📝 Considera agregar alias de tiendas en el futuro
5. 📝 Considera agregar selector manual de tienda en el frontend

---

**Fecha**: Diciembre 11, 2025  
**Versión**: 1.0  
**Estado**: ✅ Implementado y Listo para Probar
