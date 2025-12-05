# 🎯 Guía de Personalización de Publicidad - Vitrinex

## 📋 Resumen del Sistema

El sistema de publicidad ahora soporta **dos modos de visualización**:

### 1. **Carousel Mode** (Rotación automática)
- Los anuncios rotan cada 10 segundos
- Ideal para: Header superior, footer, espacios entre secciones
- Muestra **un anuncio a la vez** con indicadores de navegación

### 2. **Stack Mode** (Apilado vertical) ⭐ NUEVO
- Todos los anuncios se muestran apilados verticalmente
- Ideal para: Sidebars laterales (izquierda/derecha)
- Aprovecha **todo el espacio vertical** de la página
- Cada anuncio tiene **hover effect** con animación suave

---

## 🎨 Posiciones Disponibles

| Posición | Dimensiones | Modo por Defecto | Ubicación |
|----------|-------------|------------------|-----------|
| `top` | Horizontal (máx 40px altura) | Carousel | Parte superior de la página |
| `sidebarLeft` | Vertical (3:4 ratio, máx 400px) | **Stack** | Columna izquierda |
| `sidebarRight` | Vertical (3:4 ratio, máx 400px) | **Stack** | Columna derecha |
| `betweenSections` | Horizontal (máx 48px altura) | Carousel | Entre secciones de contenido |
| `footer` | Horizontal (máx 24px altura) | Carousel | Pie de página |

---

## 🚀 Cómo Usar

### Modo Stack (Apilado) - Para Sidebares

```jsx
<PromotionalBanner 
  position="sidebarLeft" 
  store={store} 
  layout="stack" 
/>
```

**Características:**
- ✅ Muestra todos los anuncios a la vez
- ✅ Espaciado automático de 1rem (16px) entre anuncios
- ✅ Efecto hover con escala 1.02
- ✅ Sombras suaves y modernas
- ✅ Badge de "Publicidad" en cada anuncio
- ✅ Se adapta automáticamente al número de anuncios

### Modo Carousel (Rotación) - Para Headers/Footers

```jsx
<PromotionalBanner 
  position="top" 
  store={store} 
  layout="carousel" 
/>
```

O simplemente sin especificar layout (carousel es el default):

```jsx
<PromotionalBanner 
  position="top" 
  store={store} 
/>
```

**Características:**
- ✅ Rotación automática cada 10 segundos
- ✅ Puntos indicadores interactivos
- ✅ Click en puntos para navegar manualmente
- ✅ Transición suave entre anuncios

---

## 📐 Estructura de Archivos

### `PromotionalBanner.jsx` (Componente Principal)
```
frontend/src/components/PromotionalBanner.jsx
```

### `StorePublic.jsx` (Página de Tienda Pública)
```
frontend/src/pages/StorePublic.jsx
```

---

## 🎯 Configuración Actual en StorePublic.jsx

```jsx
{/* Sidebar Izquierda - STACK MODE */}
<aside className="hidden xl:block w-72 flex-shrink-0">
  <div className="space-y-6">
    <PromotionalBanner 
      position="sidebarLeft" 
      store={store} 
      layout="stack" 
    />
  </div>
</aside>

{/* Sidebar Derecha - STACK MODE */}
<aside className="hidden xl:block w-72 flex-shrink-0">
  <div className="space-y-6">
    <PromotionalBanner 
      position="sidebarRight" 
      store={store} 
      layout="stack" 
    />
  </div>
</aside>

{/* Banner Superior - CAROUSEL MODE */}
<PromotionalBanner position="top" store={store} />

{/* Banner Footer - CAROUSEL MODE */}
<PromotionalBanner position="footer" store={store} className="mt-8" />
```

---

## 🎨 Personalización Avanzada

### Cambiar Espaciado entre Anuncios Stack

En `PromotionalBanner.jsx`, línea ~133:

```jsx
<div className={`promotional-banner-stack space-y-4 ${className}`}>
  {/* space-y-4 = 1rem (16px) de separación */}
  {/* Opciones: space-y-2 (8px), space-y-6 (24px), space-y-8 (32px) */}
```

### Cambiar Velocidad de Rotación (Carousel)

En `PromotionalBanner.jsx`, línea ~30:

```jsx
const interval = setInterval(() => {
  setCurrentAdIndex((prev) => (prev + 1) % ads.length);
}, 10000); // 10000ms = 10 segundos
```

### Ajustar Altura Máxima de Anuncios Laterales

En `PromotionalBanner.jsx`, línea ~123:

```jsx
case 'sidebarLeft':
case 'sidebarRight':
  return 'w-full aspect-[3/4] max-h-[400px]'; 
  // Cambiar max-h-[400px] a max-h-[500px] para más altura
```

### Agregar Más Posiciones

1. Agrega la posición en el switch de `getAdDimensions()`
2. Define las dimensiones apropiadas
3. Úsala en cualquier página con `<PromotionalBanner position="tuNuevaPosicion" />`

---

## 🔧 Troubleshooting

### No se muestran anuncios

1. **Modo desarrollo**: Verás un placeholder gris con texto explicativo
2. **Modo producción**: El componente no renderiza nada si no hay anuncios
3. **Verifica**: Backend debe tener anuncios activos en la posición correcta

### Anuncios muy juntos o separados

Ajusta `space-y-X` en el contenedor:
```jsx
<div className="space-y-6"> {/* Aumenta o reduce el número */}
```

### Quiero sticky de nuevo en los sidebares

Envuelve el PromotionalBanner en un div sticky:
```jsx
<aside className="hidden xl:block w-72 flex-shrink-0">
  <div className="sticky top-4">
    <PromotionalBanner position="sidebarLeft" store={store} layout="stack" />
  </div>
</aside>
```

---

## 📊 Ventajas del Nuevo Sistema

✅ **Más espacio publicitario**: Los sidebares ahora muestran múltiples anuncios
✅ **Mejor experiencia**: Usuario ve más contenido sin scroll infinito en sidebars
✅ **Flexible**: Elige entre carousel o stack según la posición
✅ **Responsive**: Se adapta automáticamente a diferentes cantidades de anuncios
✅ **Moderno**: Efectos hover y transiciones suaves
✅ **Personalizable**: Fácil de ajustar colores, espaciado y dimensiones

---

## 🎯 Mejores Prácticas

1. **Sidebares**: Usa siempre `layout="stack"` para aprovechar el espacio vertical
2. **Headers/Footers**: Usa `layout="carousel"` o sin especificar para rotación
3. **Máximo 5-6 anuncios**: En stack mode, evita sobrecargar con demasiados anuncios
4. **Optimiza imágenes**: Usa formatos WebP y compresión para carga rápida
5. **Ratio 3:4**: Mantén este ratio para anuncios verticales (ej: 300x400px)

---

## 🚀 Próximas Mejoras Sugeridas

- [ ] Agregar animación de entrada para anuncios stack
- [ ] Implementar lazy loading para anuncios fuera del viewport
- [ ] Agregar analytics de impresiones por anuncio
- [ ] Modo "grid" para mostrar anuncios en cuadrícula
- [ ] Prioridad de anuncios (featured/premium)

---

**¡Listo!** Ahora tienes un sistema de publicidad flexible y moderno que aprovecha todo el espacio de la página 🎉
