# 🔍 Guía de Debugging - Efectos Visuales

## ✅ Checklist de Verificación

### 1. Abrir Consola del Navegador (F12)

Antes de probar cualquier efecto, abre la consola del navegador para ver los logs detallados.

### 2. Verificar Logs al Cargar el Customizer

Al abrir `EnhancedStoreCustomizer`, deberías ver:
```
🔄 StorePreviewRealistic - Detectando cambios: {
  appearance: "nombre-del-tema",
  colors: "#color-primario",
  effects: {
    glassmorphism: true/false,
    🔥 GLOW: true/false,
    🌈 ANIMATED_GRADIENT: true/false,
    🌫️ BLUR: true/false,
    🔄 MORPHING: true/false,
    🎨 COLOR_SHIFT: true/false,
    ...
  }
}
```

### 3. Activar un Efecto

Cuando activas cualquier efecto en la pestaña "Efectos Modernos", busca en la consola:

#### ✨ Glow (Resplandor)
```
✨ Glow activado con color: #8b5cf6
✨ Aplicando glow a tarjeta con color: #8b5cf6
```

**Qué deberías ver:** Las tarjetas tienen un resplandor/brillo alrededor, del color primario que elegiste.

#### 🌈 Animated Gradient (Gradiente Animado)
```
🌈 Gradiente animado activado
🌈 Aplicando gradiente animado a tarjeta
```

**Qué deberías ver:** 
- El fondo de la página tiene un gradiente que se mueve lentamente
- Las tarjetas también tienen gradiente animado con los colores primario y secundario
- El texto en las tarjetas se vuelve blanco automáticamente

#### 🌫️ Blur (Desenfoque)
```
🌫️ Blur activado
🌫️ Aplicando blur a tarjeta
```

**Qué deberías ver:** Las tarjetas tienen un efecto de vidrio esmerilado/desenfocado en el fondo.

**⚠️ IMPORTANTE:** Si Glassmorphism está activado, Blur NO se aplicará a las tarjetas (para evitar conflictos).

#### 🔄 Morphing (Forma Cambiante)
```
🔄 Morphing activado
🔄 Aplicando morphing a tarjeta
```

**Qué deberías ver:** Las esquinas de las tarjetas cambian de forma constantemente (bordes orgánicos que se mueven).

#### 🎨 Color Shift (Cambio de Color)
```
🎨 Color shift activado
```

**Qué deberías ver:** Los colores de los elementos rotan levemente (cambio de matiz).

### 4. Log de Estilos Finales

Al cambiar cualquier efecto, deberías ver:
```
🎨 Card style final: {
  cssClasses: ["glow-effect", "morphing", ...],
  hasGlow: true,
  hasBlur: false,
  hasMorphing: true,
  hasAnimatedGradient: false,
  styleKeys: ["backgroundColor", "borderRadius", "filter", ...]
}
```

Esto muestra:
- **cssClasses**: Clases CSS que se aplicaron
- **has[Efecto]**: Qué efectos están activos
- **styleKeys**: Propiedades de estilo inline aplicadas

### 5. Verificar Guardado

Al hacer clic en "Guardar Cambios", busca:
```
💾 === INICIANDO GUARDADO ===
✨ Efectos: {
  glow: true,
  animatedGradient: true,
  morphing: true,
  blur: false,
  ...
}
📤 Guardando appearance completo...
✅ Appearance guardado: {...}
✨ Efectos guardados: {glow: true, ...}
🎉 Guardado completado exitosamente
```

### 6. Recargar y Verificar Persistencia

Después de guardar:
1. Recarga la página (F5)
2. Verifica que los logs iniciales muestren los efectos activados
3. Verifica visualmente que los efectos siguen aplicados

## 🐛 Problemas Comunes

### ❌ No veo ningún log en la consola
**Solución:** Asegúrate de tener abierta la pestaña "Console" en DevTools (F12).

### ❌ Los logs dicen que el efecto está activado pero no lo veo
**Posibles causas:**
1. **Conflicto entre efectos**: Blur + Glassmorphism no se mezclan
2. **Color demasiado sutil**: El glow usa el color primario - prueba con un color más brillante
3. **Tarjetas no visibles**: Asegúrate de estar en una vista con tarjetas (productos, servicios, etc.)

**Solución:**
- Intenta desactivar otros efectos primero
- Cambia el color primario a uno más brillante (#ff00ff, #00ffff, etc.)
- Aumenta el brillo de tu pantalla

### ❌ El efecto se ve en preview pero no después de guardar
**Causa:** El guardado no se completó correctamente.

**Solución:**
1. Verifica los logs de guardado en la consola
2. Busca errores HTTP (código 400, 500, etc.)
3. Verifica la red (Network tab) para ver si el request se completó

### ❌ "Cannot read property 'glow' of undefined"
**Causa:** El objeto `appearance.effects` no existe.

**Solución:**
1. Aplica una plantilla primero
2. O asegúrate de que se creó la configuración inicial correctamente

## 📊 Tabla de Efectos y sus Señales

| Efecto | Log en Consola | Señal Visual | Conflictos |
|--------|---------------|--------------|------------|
| Glow | ✨ Glow activado | Resplandor de color alrededor | Ninguno |
| Animated Gradient | 🌈 Gradiente animado | Gradiente que se mueve | Glassmorphism en tarjetas |
| Blur | 🌫️ Blur activado | Efecto vidrio esmerilado | Glassmorphism |
| Morphing | 🔄 Morphing activado | Bordes que cambian de forma | Ninguno |
| Color Shift | 🎨 Color shift | Rotación de matiz de colores | Ninguno |
| Glassmorphism | (CSS class) | Tarjetas de vidrio | Blur, Animated Gradient |

## 🎯 Test Rápido

### Secuencia de Prueba:
1. **Solo Glow**: Activa solo Glow → Deberías ver resplandor
2. **Glow + Morphing**: Agrega Morphing → Resplandor + bordes cambiantes
3. **Animated Gradient solo**: Desactiva todo → Solo gradiente → Fondo y tarjetas con gradiente
4. **Blur solo**: Solo Blur → Tarjetas desenfocadas
5. **Todos (excepto conflictos)**: Glow + Morphing + Color Shift → Combinación visual

### ⚠️ Combinaciones a EVITAR:
- ❌ Blur + Glassmorphism
- ❌ Animated Gradient + Glassmorphism (en tarjetas)

## 💡 Tips para Verificación Visual

### Para Glow:
- Usa colores brillantes: `#ff00ff`, `#00ffff`, `#ffff00`
- El resplandor es más visible sobre fondos oscuros

### Para Animated Gradient:
- Se ve mejor con colores contrastantes (primario y secundario diferentes)
- Espera 3-5 segundos para ver el movimiento

### Para Morphing:
- El cambio es lento (12 segundos por ciclo completo)
- Observa las esquinas de las tarjetas

### Para Blur:
- Solo se ve si hay un fondo detrás de la tarjeta
- Prueba con una imagen de fondo

### Para Color Shift:
- Es un efecto sutil (±15 grados de rotación)
- Se ve mejor con colores saturados

## 🔧 Si Nada Funciona

1. **Verifica que el frontend se haya actualizado:**
   ```powershell
   cd frontend
   npm run dev
   ```

2. **Limpia caché del navegador:**
   - Chrome: Ctrl+Shift+Delete → Clear cache
   - O usa modo incógnito

3. **Verifica que los archivos estén actualizados:**
   - `StorePreviewRealistic.jsx` - líneas 30-65 (logs detallados)
   - `index.css` - líneas 306-360 (efectos CSS)
   - `EnhancedStoreCustomizer.jsx` - líneas 170-210 (guardado con logs)

4. **Revisa el objeto appearance completo en la consola:**
   ```javascript
   // En la consola del navegador:
   console.log('Appearance actual:', appearance);
   ```

## 📝 Reportar un Bug

Si después de seguir esta guía el efecto sigue sin funcionar, proporciona:

1. ✅ Logs completos de la consola
2. ✅ Screenshot del efecto que no funciona
3. ✅ Tema/plantilla activa
4. ✅ Combinación de efectos que intentaste
5. ✅ Navegador y versión (Chrome 120, Firefox 121, etc.)
6. ✅ Screenshot de la pestaña "Network" mostrando el request de guardado

---

**Última actualización:** 2024
**Archivo relacionado:** `GUIA_EFECTOS_VISUALES.md` (guía de usuario)
