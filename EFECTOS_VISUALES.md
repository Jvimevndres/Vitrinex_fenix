# 🎨 Sistema de Efectos Visuales

## Efectos Implementados y Funcionando

### 1. **Glassmorphism** ✅
- **Clase CSS**: `.glass-card`
- **Activación**: `appearance.effects.glassmorphism = true`
- **Efecto**: Fondo translúcido con blur de 12px, bordes semi-transparentes
- **Uso**: Se aplica automáticamente a todas las tarjetas cuando está activado
- **Visual**: Efecto cristal esmerilado con transparencia del 75%

### 2. **Neomorphism** ✅
- **Clase CSS**: `.neomorph-card`
- **Activación**: `appearance.effects.neomorphism = true`
- **Efecto**: Sombras dobles (interna clara + externa oscura) creando efecto de relieve
- **Uso**: Se aplica a tarjetas, crea sensación de elementos "presionados" en la superficie
- **Visual**: Sombras de 12px en dos direcciones opuestas

### 3. **Shadows 3D** ✅
- **Clase CSS**: `.shadow-3d`
- **Activación**: `appearance.effects.shadows3D = true`
- **Efecto**: Sombras múltiples en cascada con hover elevado
- **Uso**: 4 capas de sombras que crean profundidad tridimensional
- **Visual**: Levantamiento de 2px en hover con sombras intensificadas

### 4. **Animaciones** ✅
- **Activación**: `appearance.effects.animations = true`
- **Efectos incluidos**:
  - `.animate-fade-in`: Aparición suave con desplazamiento desde abajo (0.6s)
  - Transiciones suaves en todos los elementos interactivos
  - Velocidad configurable: `slow`, `normal`, `fast`

### 5. **Hover Effects** ✅
- **Activación**: `appearance.effects.hoverEffects = true`
- **Escala configurable**: `appearance.effects.hoverScale` (1.0 - 1.2)
- **Efecto**: Zoom suave en elementos al pasar el cursor
- **Transición**: 300ms ease

### 6. **Scroll Reveal** ✅
- **Activación**: `appearance.effects.scrollReveal = true`
- **Efecto**: Elementos aparecen con fade-in al hacer scroll
- **Implementación**: Intersection Observer API
- **Visual**: Desplazamiento de 30px hacia arriba con fade desde 0 a 1

### 7. **Floating Hover** ✅
- **Clase CSS**: `.floating-hover`
- **Activación**: Automática en custom boxes cuando está configurado
- **Efecto**: Animación flotante suave (±8px) en hover
- **Duración**: 2s infinite ease-in-out

### 8. **Smooth Scroll** ✅
- **Activación**: `appearance.effects.smoothScroll = true`
- **Efecto**: Desplazamiento suave al navegar entre secciones
- **Implementación**: CSS `scroll-behavior: smooth`

### 9. **Parallax** ✅
- **Clase CSS**: `.parallax-bg`
- **Activación**: `appearance.effects.parallax = true`
- **Velocidad**: `appearance.effects.parallaxSpeed` (0 - 1)
- **Efecto**: Fondo con profundidad tridimensional

### 10. **Glow Effect** ✅
- **Clase CSS**: `.glow-effect`
- **Efecto**: Resplandor azul suave que intensifica en hover
- **Visual**: Drop-shadow de 8px → 16px

### 11. **Animated Gradient** ✅
- **Clase CSS**: `.animated-gradient`
- **Efecto**: Gradiente en movimiento continuo
- **Duración**: 8s infinite
- **Uso**: Fondos dinámicos y modernos

### 12. **Color Shift** ✅
- **Clase CSS**: `.color-shift`
- **Efecto**: Rotación de matiz (hue-rotate) de 0° a 25°
- **Duración**: 10s infinite
- **Visual**: Cambio sutil de tonalidad

### 13. **Morphing Shape** ✅
- **Clase CSS**: `.morphing`
- **Efecto**: Cambio dinámico de border-radius creando formas orgánicas
- **Duración**: 15s infinite
- **Uso**: Elementos decorativos

### 14. **Blur Effect** ✅
- **Clase CSS**: `.blur-effect`
- **Efecto**: Backdrop blur de 8px que reduce a 4px en hover
- **Uso**: Overlays y modales

### 15. **Pulse Effect** ✅
- **Clase CSS**: `.pulse-effect`
- **Efecto**: Escala pulsante de 1.0 a 1.05
- **Duración**: 2s infinite

### 16. **Shimmer Effect** ✅
- **Clase CSS**: `.shimmer`
- **Efecto**: Brillo desplazándose horizontalmente
- **Uso**: Loading states, elementos destacados

### 17. **Partículas** ✅
- **Componente**: `ParticlesBackground.jsx`
- **Activación**: `appearance.effects.particles.enabled = true`
- **Tipos disponibles**:
  - `dots`: Puntos flotantes
  - `stars`: Estrellas brillantes
  - `bubbles`: Burbujas ascendentes
  - `confetti`: Confeti celebratorio
  - `snow`: Copos de nieve cayendo
  - `hearts`: Corazones flotantes
  - `sparkles`: Destellos brillantes
  - `leaves`: Hojas cayendo
- **Configuración**:
  - `density`: 10 - 200 (cantidad de partículas)
  - `color`: Color en hexadecimal

## Cómo Aplicar Efectos

### En el Backend (storeAppearance.model.js)
```javascript
appearance.effects = {
  animations: true,
  animationSpeed: 'normal', // 'slow' | 'normal' | 'fast'
  hoverEffects: true,
  hoverScale: 1.05, // 1.0 - 1.2
  glassmorphism: true,
  neomorphism: false, // No combinar con glassmorphism
  shadows3D: true,
  smoothScroll: true,
  scrollReveal: true,
  parallax: false,
  parallaxSpeed: 0.5,
  particles: {
    enabled: true,
    type: 'dots', // 'dots' | 'stars' | 'bubbles' | etc.
    density: 50,
    color: '#3b82f6'
  }
};
```

### En Componentes React
```jsx
// Aplicar efectos automáticamente usando getCardStyle()
<div 
  className={`p-6 rounded-xl ${getEffectClasses()}`}
  style={getCardStyle(colors.surface)}
>
  Contenido
</div>

// Aplicar efecto específico
<div className="glass-card p-6">
  Glassmorphism forzado
</div>

<div className="neomorph-card p-6">
  Neomorphism forzado
</div>

<div className="shadow-3d floating-hover">
  Múltiples efectos combinados
</div>
```

## Mejores Prácticas

1. **No combinar Glassmorphism + Neomorphism**: Usar uno u otro
2. **Shadows3D es universal**: Funciona bien con todos los estilos
3. **Parallax**: Úsalo con moderación, puede afectar performance
4. **Partículas**: Densidad < 100 para mejor rendimiento
5. **Scroll Reveal**: Ideal para páginas largas con mucho contenido
6. **Hover Scale**: Valores entre 1.03 - 1.08 son más sutiles y profesionales

## Compatibilidad

- ✅ Chrome/Edge: 100%
- ✅ Firefox: 100%
- ✅ Safari: 95% (backdrop-filter puede necesitar -webkit-)
- ✅ Mobile: 90% (algunos efectos 3D tienen menor rendimiento)

## Performance

- **Ligero** (< 5% CPU): animations, scrollReveal, hoverEffects, smoothScroll
- **Medio** (5-10% CPU): glassmorphism, shadows3D, particles (< 50 density)
- **Pesado** (> 10% CPU): parallax, particles (> 100 density), morphing múltiples elementos

## Debugging

Para verificar qué efectos están activos:
```javascript
console.log('Efectos activos:', appearance?.effects);
console.log('Glassmorphism:', appearance?.effects?.glassmorphism);
console.log('Neomorphism:', appearance?.effects?.neomorphism);
```

Las clases CSS dinámicas se aplican automáticamente en:
- `StorePreviewRealistic.jsx` (Vista previa en personalizador)
- `StorePublic.jsx` (Vista pública de la tienda)
- `index.css` (Estilos globales)

## Solución de Problemas

**Problema**: Los efectos no se aplican
- **Solución**: Verificar que `appearance.effects` no sea `undefined`
- Reiniciar el servidor backend para actualizar el modelo
- Limpiar caché del navegador (Ctrl+Shift+R)

**Problema**: Glassmorphism no se ve translúcido
- **Solución**: Verificar que el fondo no sea sólido blanco
- Aplicar un background con gradiente o imagen

**Problema**: Scroll Reveal no funciona
- **Solución**: Asegurarse que los elementos tengan la clase `.scroll-reveal`
- Verificar que el Intersection Observer esté inicializado

## Próximas Mejoras Sugeridas

- [ ] Custom cursor personalizado
- [ ] Page transitions entre rutas
- [ ] Magnetic buttons (atracción al cursor)
- [ ] Tilt effect en tarjetas (rotación 3D al hover)
- [ ] Text reveal animations
- [ ] SVG path animations
