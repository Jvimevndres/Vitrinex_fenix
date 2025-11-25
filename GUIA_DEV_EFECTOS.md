# 🛠️ Guía para Desarrolladores - Sistema de Efectos Visuales

## 📐 Arquitectura del Sistema

### Flujo de Datos

```
Usuario activa efecto
    ↓
EnhancedStoreCustomizer.jsx
    ↓ (updateStoreAppearance API)
Backend (appearance.controller.js)
    ↓ (MongoDB)
StoreAppearance Model
    ↓ (getStoreAppearance API)
StorePreviewRealistic.jsx
    ↓ (getCardStyle() con effects)
Tarjetas renderizadas con efectos
```

### Estructura de Datos

```javascript
// Objeto appearance en MongoDB
{
  store: ObjectId,
  theme: "moderno-minimalista",
  colors: {
    primary: "#8b5cf6",
    secondary: "#ec4899",
    accent: "#f59e0b",
    background: "#ffffff",
    surface: "#f9fafb",
    text: "#1f2937",
    textSecondary: "#6b7280",
    border: "#e5e7eb"
  },
  effects: {
    // Efectos básicos
    glassmorphism: false,
    neomorphism: false,
    shadows3D: false,
    
    // Efectos modernos (los que mejoramos)
    glow: true,
    animatedGradient: true,
    blur: false,
    morphing: true,
    colorShift: true,
    
    // Otros
    floatingHover: true,
    fadeIn: true,
    particles: {
      enabled: true,
      type: "dots",
      density: "medium"
    }
  },
  cards: {
    backgroundColor: "#ffffff",
    borderRadius: 1,
    shadow: true,
    border: true
  },
  buttons: {
    primaryColor: "#8b5cf6",
    primaryTextColor: "#ffffff",
    borderRadius: 0.5
  }
}
```

---

## 🔧 Cómo Agregar un Nuevo Efecto

### Paso 1: Definir el Efecto en el Schema

**Archivo:** `backend/src/models/StoreAppearance.js`

```javascript
const storeAppearanceSchema = new Schema({
  // ... campos existentes ...
  
  effects: {
    // ... efectos existentes ...
    
    // TU NUEVO EFECTO
    miNuevoEfecto: {
      type: Boolean,
      default: false
    }
  }
});
```

### Paso 2: Agregar CSS para el Efecto

**Archivo:** `frontend/src/index.css`

```css
/* Tu Nuevo Efecto */
@keyframes miAnimacion {
  0%, 100% { 
    /* Estado inicial y final */ 
    transform: scale(1);
  }
  50% { 
    /* Estado intermedio */ 
    transform: scale(1.1);
  }
}

.mi-nuevo-efecto {
  animation: miAnimacion 3s ease-in-out infinite;
  will-change: transform; /* Para mejor rendimiento */
}

.mi-nuevo-efecto:hover {
  animation-play-state: paused; /* Pausa en hover */
}
```

### Paso 3: Aplicar el Efecto en StorePreviewRealistic

**Archivo:** `frontend/src/components/StorePreviewRealistic.jsx`

```javascript
// En la función getCardStyle():
const getCardStyle = () => {
  const card = appearance?.cards || {};
  const effects = appearance?.effects || {};
  
  let cssClasses = [];
  // ... clases existentes ...
  
  // TU NUEVO EFECTO
  if (effects.miNuevoEfecto) cssClasses.push('mi-nuevo-efecto');
  
  const baseStyle = { /* ... */ };
  
  // Si necesitas estilos inline dinámicos:
  if (effects.miNuevoEfecto) {
    baseStyle.transform = 'perspective(1000px) rotateY(10deg)';
    baseStyle.transition = 'transform 0.3s ease';
    console.log('✨ Aplicando miNuevoEfecto');
  }
  
  return {
    style: baseStyle,
    className: cssClasses.join(' ')
  };
};

// En useEffect para logging:
useEffect(() => {
  console.log('🔄 StorePreviewRealistic - Detectando cambios:', {
    effects: {
      // ... efectos existentes ...
      '🎨 MI_NUEVO_EFECTO': appearance?.effects?.miNuevoEfecto
    }
  });
  
  if (appearance?.effects?.miNuevoEfecto) {
    console.log('🎨 Mi nuevo efecto activado');
  }
}, [appearance]);
```

### Paso 4: Agregar UI en EnhancedStoreCustomizer

**Archivo:** `frontend/src/components/EnhancedStoreCustomizer.jsx`

```javascript
// En la pestaña "Efectos Modernos":
<div className="space-y-4">
  {/* ... efectos existentes ... */}
  
  {/* TU NUEVO EFECTO */}
  <div className="bg-white/50 rounded-xl p-4">
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🎨</span>
          <h4 className="font-medium text-gray-800">Mi Nuevo Efecto</h4>
          <span className="px-2 py-0.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs rounded-full">
            NUEVO
          </span>
        </div>
        <p className="text-sm text-gray-600 mt-1">
          Descripción de lo que hace tu efecto
        </p>
        
        {/* Preview del efecto */}
        <div className="mt-3 h-16 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg overflow-hidden">
          <div className="mi-nuevo-efecto h-full flex items-center justify-center">
            <span className="text-purple-600 font-medium">Preview</span>
          </div>
        </div>
      </div>
      
      {/* Toggle */}
      <label className="relative inline-flex items-center cursor-pointer ml-4">
        <input
          type="checkbox"
          checked={appearance?.effects?.miNuevoEfecto || false}
          onChange={(e) => {
            handleAppearanceChange('effects', 'miNuevoEfecto', e.target.checked);
          }}
          className="sr-only peer"
        />
        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-purple-500 peer-checked:to-pink-500"></div>
      </label>
    </div>
  </div>
</div>
```

### Paso 5: Actualizar Documentación

Agrega tu efecto a `GUIA_EFECTOS_VISUALES.md`:

```markdown
### 🎨 Mi Nuevo Efecto

**Qué hace:** Descripción detallada

**Cuándo usar:**
- Caso de uso 1
- Caso de uso 2

**Combina bien con:**
- Efecto A
- Efecto B

**No usar con:**
- Efecto C (conflicto)

**Intensidad visual:** ⭐⭐⭐☆☆ (3/5)
```

---

## 🎨 Patrones de Diseño Recomendados

### 1. Efectos con Colores Dinámicos

```javascript
// ✅ BUENO: Usa colores del tema
if (effects.miEfecto) {
  const color = colors.primary || '#8b5cf6';
  baseStyle.boxShadow = `0 0 20px ${hexToRgba(color, 0.5)}`;
}

// ❌ MALO: Color hardcodeado
if (effects.miEfecto) {
  baseStyle.boxShadow = '0 0 20px rgba(139, 92, 246, 0.5)';
}
```

### 2. Prevención de Conflictos

```javascript
// ✅ BUENO: Verifica conflictos
if (effects.miEfecto && !effects.efectoConflictivo) {
  // Aplicar efecto
}

// ❌ MALO: No verifica
if (effects.miEfecto) {
  // Puede sobrescribir otro efecto
}
```

### 3. Logging Consistente

```javascript
// ✅ BUENO: Emoji + descripción clara
if (appearance?.effects?.miEfecto) {
  console.log('🎨 Mi efecto activado con valor:', valor);
}
console.log('🎨 Aplicando mi efecto a tarjeta');

// ❌ MALO: Sin contexto
if (appearance?.effects?.miEfecto) {
  console.log('activado');
}
```

### 4. Animaciones Performantes

```css
/* ✅ BUENO: Propiedades GPU-accelerated */
.mi-efecto {
  animation: miAnimacion 3s ease infinite;
  will-change: transform, opacity;
  transform: translateZ(0); /* Fuerza GPU */
}

@keyframes miAnimacion {
  0%, 100% { transform: translateX(0); }
  50% { transform: translateX(10px); }
}

/* ❌ MALO: Propiedades pesadas */
.mi-efecto {
  animation: miAnimacion 3s ease infinite;
}

@keyframes miAnimacion {
  0%, 100% { width: 100px; height: 100px; } /* Reflow! */
  50% { width: 110px; height: 110px; }
}
```

### 5. Transiciones Suaves

```javascript
// ✅ BUENO: Con transición
if (effects.miEfecto) {
  baseStyle.transform = 'scale(1.05)';
  baseStyle.transition = 'transform 0.3s ease, filter 0.3s ease';
}

// ❌ MALO: Cambio abrupto
if (effects.miEfecto) {
  baseStyle.transform = 'scale(1.05)';
}
```

---

## 🧪 Testing

### Test Manual

```javascript
// En la consola del navegador:

// 1. Verificar que el efecto existe
console.log('Mi efecto:', appearance?.effects?.miNuevoEfecto);

// 2. Activar manualmente (para testing rápido)
handleAppearanceChange('effects', 'miNuevoEfecto', true);

// 3. Ver estilos aplicados
const cardStyle = getCardStyle();
console.log('Estilos aplicados:', cardStyle);

// 4. Verificar clases CSS
document.querySelectorAll('.mi-nuevo-efecto').forEach(el => {
  console.log('Elemento con efecto:', el);
  console.log('Estilos computados:', window.getComputedStyle(el));
});
```

### Test de Guardado

```javascript
// Verificar que el efecto se guarda
const testSave = async () => {
  try {
    const before = appearance.effects.miNuevoEfecto;
    console.log('Antes:', before);
    
    await handleSave();
    
    const after = appearance.effects.miNuevoEfecto;
    console.log('Después:', after);
    
    console.log(before === after ? '✅ Guardado OK' : '❌ Error en guardado');
  } catch (error) {
    console.error('❌ Error:', error);
  }
};

testSave();
```

---

## 📊 Métricas de Performance

### Medir Impacto en Rendimiento

```javascript
// En StorePreviewRealistic.jsx
useEffect(() => {
  const start = performance.now();
  
  // Tu efecto se aplica aquí
  setRenderKey(prev => prev + 1);
  
  requestAnimationFrame(() => {
    const end = performance.now();
    console.log(`🎨 Render con efectos: ${(end - start).toFixed(2)}ms`);
  });
}, [appearance?.effects]);
```

### Objetivos de Performance

- ✅ Render inicial: < 100ms
- ✅ Re-render con cambios: < 50ms
- ✅ Animación a 60 FPS (16.67ms por frame)
- ✅ Sin layout thrashing

---

## 🔍 Debugging Avanzado

### Ver Todos los Estilos Aplicados

```javascript
// En la consola del navegador
const debugCardStyles = () => {
  const cards = document.querySelectorAll('[class*="rounded"]');
  cards.forEach((card, i) => {
    console.log(`Card ${i}:`, {
      classes: card.className,
      computedStyles: {
        animation: getComputedStyle(card).animation,
        transform: getComputedStyle(card).transform,
        filter: getComputedStyle(card).filter,
        backdropFilter: getComputedStyle(card).backdropFilter
      }
    });
  });
};

debugCardStyles();
```

### Verificar Conflictos de CSS

```javascript
// Detectar estilos sobrescritos
const checkCSSConflicts = (element) => {
  const computed = window.getComputedStyle(element);
  const inline = element.style;
  
  console.log('Conflictos potenciales:', {
    backgroundColor: {
      inline: inline.backgroundColor,
      computed: computed.backgroundColor,
      match: inline.backgroundColor === computed.backgroundColor
    },
    filter: {
      inline: inline.filter,
      computed: computed.filter,
      match: inline.filter === computed.filter
    }
  });
};

// Uso:
const card = document.querySelector('.glass-card');
checkCSSConflicts(card);
```

---

## 🚀 Optimizaciones

### Lazy Loading de Efectos Pesados

```javascript
// Solo cargar partículas si están habilitadas
{appearance?.effects?.particles?.enabled && (
  <Suspense fallback={<div>Cargando partículas...</div>}>
    <ParticlesBackground 
      config={appearance.effects.particles} 
      colors={colors} 
    />
  </Suspense>
)}
```

### Throttle de Re-renders

```javascript
import { useMemo } from 'react';

const StorePreviewRealistic = ({ appearance, storeData }) => {
  // Memoizar estilos pesados
  const cardStyle = useMemo(() => {
    return getCardStyle();
  }, [appearance?.effects, appearance?.colors, appearance?.cards]);
  
  // Ahora usar cardStyle en lugar de llamar getCardStyle() cada vez
};
```

---

## 📚 Recursos

### Propiedades CSS Animables (GPU)
- `transform` ✅
- `opacity` ✅
- `filter` ✅ (con precaución)
- `backdrop-filter` ✅ (con precaución)

### Propiedades CSS NO Animables (CPU)
- `width`, `height` ❌
- `margin`, `padding` ❌
- `position` (top, left) ❌
- `background-color` ⚠️ (usa gradientes con `transform` en su lugar)

### Easing Functions Recomendadas
- `ease-in-out` - Suave entrada y salida
- `cubic-bezier(0.4, 0, 0.2, 1)` - Material Design
- `cubic-bezier(0.68, -0.55, 0.265, 1.55)` - Bounce

---

## 🎓 Ejemplos Completos

### Ejemplo 1: Efecto de Parallax 3D

```javascript
// En getCardStyle()
if (effects.parallax3D) {
  cssClasses.push('parallax-3d');
  baseStyle.transform = 'perspective(1000px) rotateY(0deg)';
  baseStyle.transition = 'transform 0.6s cubic-bezier(0.23, 1, 0.32, 1)';
  console.log('🎨 Aplicando parallax 3D');
}
```

```css
/* En index.css */
.parallax-3d {
  transform-style: preserve-3d;
  will-change: transform;
}

.parallax-3d:hover {
  transform: perspective(1000px) rotateY(10deg) scale(1.02);
}

.parallax-3d > * {
  transform: translateZ(20px);
}
```

### Ejemplo 2: Efecto de Neon Glow

```javascript
// En getCardStyle()
if (effects.neonGlow) {
  cssClasses.push('neon-glow');
  const neonColor = colors.accent || '#f59e0b';
  baseStyle.boxShadow = `
    0 0 5px ${hexToRgba(neonColor, 0.8)},
    0 0 10px ${hexToRgba(neonColor, 0.6)},
    0 0 20px ${hexToRgba(neonColor, 0.4)},
    0 0 40px ${hexToRgba(neonColor, 0.2)}
  `;
  baseStyle.border = `2px solid ${hexToRgba(neonColor, 0.8)}`;
  console.log('✨ Aplicando neon glow con color:', neonColor);
}
```

```css
.neon-glow {
  animation: neon-pulse 2s ease-in-out infinite;
}

@keyframes neon-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.8; }
}
```

---

**Autor:** Vitrinex Dev Team  
**Última actualización:** 2024  
**Versión:** 2.0  
