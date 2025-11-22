# Footer de Vitrinex 🎓

Footer profesional inspirado en universidades de clase mundial (como Bentley University), adaptado al estilo moderno de Vitrinex con información de **INACAP Sede Renca** como **proyecto de tesis de estudiantes**.

## 📋 Características

### Diseño y Estilo
- **Gradiente oscuro profesional**: `from-slate-900 via-slate-800 to-slate-900`
- **Colores dinámicos**: Se adapta al modo warm (cálido) o cool (frío) seleccionado por el usuario
- **Responsive**: Diseño adaptable a móviles, tablets y desktop
- **Animaciones suaves**: Hover effects y transiciones fluidas
- **Iconos modernos**: Implementados con `react-icons`

### Colores Dinámicos

#### Modo Warm (Cálido) 🔥
- Primario: Naranja a Rosa (`from-orange-400 to-pink-500`)
- Acentos: Naranja (`orange-400`)
- Hover: Naranja oscuro (`hover:bg-orange-600`)
- Botones: Gradiente naranja-rosa

#### Modo Cool (Frío) ❄️
- Primario: Cielo a Azul (`from-sky-400 to-blue-500`)
- Acentos: Azul cielo (`sky-400`)
- Hover: Azul oscuro (`hover:bg-blue-600`)
- Botones: Gradiente azul

### Secciones Incluidas

#### 1. Sobre Vitrinex
- Logo dinámico con colores adaptativos
- Descripción breve del proyecto
- **Insignia de Proyecto de Tesis** 🎓
- Ubicación de INACAP Sede Renca

#### 2. Síguenos
- Enlaces a redes sociales de INACAP:
  - Facebook
  - Twitter/X
  - Instagram
  - LinkedIn
  - YouTube
- Botón de contacto con colores dinámicos

#### 3. Recursos & Links
- Enlace a sitio web de INACAP
- Biblioteca INACAP
- Portal Mi INACAP
- Portal Alumno
- Enlaces internos de Vitrinex (Registrar negocio, Ver mapa)

#### 4. Visítanos
- Información de ubicación (INACAP Renca, Santiago)
- Enlace a Google Maps
- Información sobre el proyecto de tesis
- Teléfono de contacto: 600 467 2266

### Barra Inferior
- Copyright con año dinámico
- Crédito como **"Proyecto de Tesis - Desarrollado por estudiantes de INACAP Sede Renca"**
- Links legales (Copyright, Privacidad, Políticas, Contacto, INACAP)

## 🎨 Personalización

### Sistema de Colores Dinámicos:
El Footer utiliza el mismo sistema de colores que el resto de la aplicación mediante la prop `paletteMode`:

```jsx
<Footer paletteMode="warm" />  // Colores cálidos (naranja/rosa)
<Footer paletteMode="cool" />  // Colores fríos (azul/cielo)
```

Los colores se sincronizan automáticamente con la preferencia del usuario guardada en `localStorage`.

### Iconos utilizados:
```javascript
import { 
  FaFacebookF, 
  FaTwitter, 
  FaInstagram, 
  FaLinkedinIn,
  FaYoutube,
  FaGraduationCap  // Icono de tesis
} from "react-icons/fa";
import { MdEmail, MdPhone, MdLocationOn } from "react-icons/md";
```

## 📦 Integración

El Footer está integrado en las siguientes páginas:
- ✅ **ExploreStoresPage** - Página principal del mapa
- ✅ **LoginPage** - Página de inicio de sesión
- ✅ **RegisterPage** - Página de registro

### Cómo agregar a otras páginas:

```jsx
import { useState, useEffect } from "react";
import Footer from "../components/Footer";

export default function TuPagina() {
  // Leer el modo de color del usuario
  const [paletteMode, setPaletteMode] = useState(() => {
    try {
      if (typeof window === "undefined") return "warm";
      const v = localStorage.getItem("explore:paletteMode");
      return v === "warm" || v === "cool" ? v : "warm";
    } catch (e) {
      return "warm";
    }
  });

  return (
    <div className="min-h-screen flex flex-col">
      {/* Tu contenido aquí */}
      
      <Footer paletteMode={paletteMode} />
    </div>
  );
}
```

## 🔧 Configuración

### Información de INACAP Renca:
- **Ubicación**: INACAP Sede Renca, Región Metropolitana, Santiago, Chile
- **Google Maps**: Enlace actualizado para Renca
- **Teléfono**: `600 467 2266`
- **Proyecto**: Identificado como "Proyecto de Tesis"

### Redes Sociales:
Actualiza los enlaces en el componente `Footer.jsx` según las redes oficiales de tu sede o proyecto.

## 🎯 Características Especiales

### ✨ Adaptación Dinámica de Colores
- Los colores del Footer se sincronizan con el modo warm/cool del usuario
- Logo y acentos cambian automáticamente según la preferencia
- Todos los botones y enlaces usan los colores del tema activo

### 🎓 Identidad de Proyecto de Tesis
- Icono de graduación para identificar el proyecto académico
- Texto que destaca que es un proyecto de estudiantes
- Copyright adaptado para proyectos educativos

### 🗺️ Información Geográfica
- Ubicación específica de INACAP Renca
- Enlace directo a Google Maps
- Información de contacto actualizada

## 🎨 Ejemplos Visuales

### Modo Warm (Cálido)
- Botones: Gradiente naranja → rosa
- Enlaces hover: Color naranja
- Iconos: Naranja brillante
- Perfecto para diseños acogedores y energéticos

### Modo Cool (Frío)
- Botones: Gradiente azul cielo → azul
- Enlaces hover: Color azul cielo
- Iconos: Azul brillante
- Perfecto para diseños profesionales y tecnológicos

## 🎯 Mejoras Futuras

- [ ] Agregar formulario de suscripción a newsletter
- [ ] Integrar mapa interactivo de ubicación
- [ ] Agregar selector de idioma
- [ ] Implementar modo claro/oscuro
- [ ] Agregar estadísticas en tiempo real
- [ ] Integrar widget de clima

## 📱 Responsive Design

- **Mobile**: Columnas apiladas verticalmente
- **Tablet**: 2 columnas
- **Desktop**: 4 columnas

## 🚀 Tecnologías

- React + Vite
- Tailwind CSS
- React Icons
- React Router
- Sistema de colores dinámicos (warm/cool)

---

**Proyecto de Tesis - Desarrollado con ❤️ por estudiantes de INACAP Sede Renca 🎓**
