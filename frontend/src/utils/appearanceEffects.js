// frontend/src/utils/appearanceEffects.js

/**
 * 🎨 Utilidades para aplicar efectos visuales de personalización
 * Este archivo contiene helpers para aplicar todos los efectos del sistema de personalización
 */

// ==================== EFECTOS DE ANIMACIÓN ====================

/**
 * Obtiene la clase CSS para la velocidad de animación
 */
export function getAnimationSpeedClass(speed) {
  const speeds = {
    slow: 'duration-700',
    normal: 'duration-500',
    fast: 'duration-300',
  };
  return speeds[speed] || speeds.normal;
}

/**
 * Aplica efectos de scroll reveal con Intersection Observer
 */
export function initScrollReveal() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px',
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('scroll-revealed');
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, observerOptions);

  // Observar elementos con clase scroll-reveal
  document.querySelectorAll('.scroll-reveal').forEach((el) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
  });

  return observer;
}

/**
 * Aplica efecto parallax a elementos
 */
export function initParallax(speed = 0.5) {
  const parallaxElements = document.querySelectorAll('.parallax');
  
  const handleScroll = () => {
    const scrolled = window.pageYOffset;
    parallaxElements.forEach((el) => {
      const yPos = -(scrolled * speed);
      el.style.transform = `translateY(${yPos}px)`;
    });
  };

  window.addEventListener('scroll', handleScroll);
  return () => window.removeEventListener('scroll', handleScroll);
}

/**
 * Activa smooth scroll
 */
export function enableSmoothScroll() {
  document.documentElement.style.scrollBehavior = 'smooth';
}

// ==================== ESTILOS DE COMPONENTES ====================

/**
 * Obtiene clases CSS para estilos de botones
 */
export function getButtonClasses(buttonConfig, colors) {
  const { style, roundness, size, animation } = buttonConfig;
  
  let classes = 'transition-all ';

  // Estilo
  switch (style) {
    case 'filled':
      classes += `bg-[${colors.primary}] text-white hover:opacity-90 `;
      break;
    case 'outline':
      classes += `border-2 border-[${colors.primary}] text-[${colors.primary}] hover:bg-[${colors.primary}] hover:text-white `;
      break;
    case 'ghost':
      classes += `text-[${colors.primary}] hover:bg-[${colors.primary}]/10 `;
      break;
    case 'soft':
      classes += `bg-[${colors.primary}]/10 text-[${colors.primary}] hover:bg-[${colors.primary}]/20 `;
      break;
    case 'gradient':
      classes += `bg-gradient-to-r from-[${colors.primary}] to-[${colors.secondary}] text-white hover:shadow-lg `;
      break;
    case 'glow':
      classes += `bg-[${colors.primary}] text-white shadow-lg shadow-[${colors.primary}]/50 hover:shadow-xl `;
      break;
  }

  // Redondez
  const roundnessMap = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    full: 'rounded-full',
  };
  classes += roundnessMap[roundness] + ' ';

  // Tamaño
  const sizeMap = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
    xl: 'px-8 py-4 text-xl',
  };
  classes += sizeMap[size] + ' ';

  // Animación
  if (animation && animation !== 'none') {
    classes += `animate-${animation} `;
  }

  return classes;
}

/**
 * Obtiene estilos inline para botones con colores dinámicos
 */
export function getButtonStyles(buttonConfig, colors) {
  const { style } = buttonConfig;
  
  const styles = {};

  if (style === 'filled') {
    styles.backgroundColor = colors.primary;
    styles.color = '#ffffff';
  } else if (style === 'outline') {
    styles.borderColor = colors.primary;
    styles.color = colors.primary;
  } else if (style === 'ghost') {
    styles.color = colors.primary;
  } else if (style === 'soft') {
    styles.backgroundColor = `${colors.primary}20`;
    styles.color = colors.primary;
  } else if (style === 'gradient') {
    styles.backgroundImage = `linear-gradient(to right, ${colors.primary}, ${colors.secondary})`;
    styles.color = '#ffffff';
  } else if (style === 'glow') {
    styles.backgroundColor = colors.primary;
    styles.color = '#ffffff';
    styles.boxShadow = `0 10px 30px ${colors.primary}40`;
  }

  return styles;
}

/**
 * Obtiene clases CSS para estilos de tarjetas
 */
export function getCardClasses(cardConfig) {
  const { style, roundness, shadow, hoverEffect } = cardConfig;
  
  let classes = 'transition-all ';

  // Estilo base
  switch (style) {
    case 'elevated':
      classes += 'bg-white ';
      break;
    case 'outlined':
      classes += 'bg-white border-2 ';
      break;
    case 'flat':
      classes += 'bg-white ';
      break;
    case 'glass':
      classes += 'bg-white/20 backdrop-blur-lg ';
      break;
    case 'neumorphic':
      classes += 'bg-gray-100 ';
      break;
    case 'gradient':
      classes += 'bg-gradient-to-br from-white to-gray-50 ';
      break;
  }

  // Redondez
  const roundnessMap = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    '2xl': 'rounded-2xl',
  };
  classes += roundnessMap[roundness] + ' ';

  // Sombra
  const shadowMap = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
    '2xl': 'shadow-2xl',
  };
  classes += shadowMap[shadow] + ' ';

  // Efecto hover
  switch (hoverEffect) {
    case 'lift':
      classes += 'hover:-translate-y-2 hover:shadow-2xl ';
      break;
    case 'glow':
      classes += 'hover:shadow-2xl hover:shadow-blue-500/20 ';
      break;
    case 'tilt':
      classes += 'hover:rotate-1 hover:scale-105 ';
      break;
    case 'zoom':
      classes += 'hover:scale-105 ';
      break;
  }

  return classes;
}

/**
 * Obtiene estilos inline para tarjetas neumórficas
 */
export function getNeumorphicStyles(colors) {
  return {
    backgroundColor: colors.surface,
    boxShadow: `8px 8px 16px ${colors.border}, -8px -8px 16px #ffffff`,
  };
}

// ==================== EFECTOS VISUALES ====================

/**
 * Aplica efecto glassmorphism a elementos
 */
export function applyGlassmorphism(element) {
  element.style.background = 'rgba(255, 255, 255, 0.1)';
  element.style.backdropFilter = 'blur(10px)';
  element.style.WebkitBackdropFilter = 'blur(10px)';
  element.style.border = '1px solid rgba(255, 255, 255, 0.2)';
}

/**
 * Genera SVG para divisores de sección
 */
export function getDividerSVG(style, color) {
  const svgs = {
    wave: `<svg viewBox="0 0 1200 120" preserveAspectRatio="none" style="width: 100%; height: 100px;">
      <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" fill="${color}"></path>
    </svg>`,
    
    curve: `<svg viewBox="0 0 1200 120" preserveAspectRatio="none" style="width: 100%; height: 100px;">
      <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" fill="${color}"></path>
    </svg>`,
    
    zigzag: `<svg viewBox="0 0 1200 120" preserveAspectRatio="none" style="width: 100%; height: 100px;">
      <polygon points="0,0 0,120 600,60 1200,120 1200,0" fill="${color}"></polygon>
    </svg>`,
    
    slant: `<svg viewBox="0 0 1200 120" preserveAspectRatio="none" style="width: 100%; height: 100px;">
      <polygon points="0,0 0,120 1200,60 1200,0" fill="${color}"></polygon>
    </svg>`,
    
    rounded: `<svg viewBox="0 0 1200 120" preserveAspectRatio="none" style="width: 100%; height: 100px;">
      <path d="M0,0V60c150,60,300,60,600,0s450-60,600,0V0Z" fill="${color}"></path>
    </svg>`,
  };

  return svgs[style] || svgs.wave;
}

// ==================== PARTÍCULAS ====================

/**
 * Inicializa sistema de partículas
 */
export function initParticles(config) {
  const { type, density, color } = config;
  
  // Implementación básica - se puede mejorar con bibliotecas como particles.js
  const canvas = document.createElement('canvas');
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '1';
  
  document.body.prepend(canvas);
  
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  
  const particles = [];
  
  class Particle {
    constructor() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.size = Math.random() * 3 + 1;
      this.speedX = Math.random() * 2 - 1;
      this.speedY = Math.random() * 2 - 1;
    }
    
    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      
      if (this.x > canvas.width || this.x < 0) {
        this.speedX *= -1;
      }
      if (this.y > canvas.height || this.y < 0) {
        this.speedY *= -1;
      }
    }
    
    draw() {
      ctx.fillStyle = color;
      ctx.beginPath();
      
      if (type === 'dots') {
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      } else if (type === 'stars') {
        this.drawStar(ctx, this.x, this.y, 5, this.size * 2, this.size);
      }
      
      ctx.fill();
    }
    
    drawStar(ctx, cx, cy, spikes, outerRadius, innerRadius) {
      let rot = Math.PI / 2 * 3;
      let x = cx;
      let y = cy;
      const step = Math.PI / spikes;

      ctx.beginPath();
      ctx.moveTo(cx, cy - outerRadius);
      
      for (let i = 0; i < spikes; i++) {
        x = cx + Math.cos(rot) * outerRadius;
        y = cy + Math.sin(rot) * outerRadius;
        ctx.lineTo(x, y);
        rot += step;

        x = cx + Math.cos(rot) * innerRadius;
        y = cy + Math.sin(rot) * innerRadius;
        ctx.lineTo(x, y);
        rot += step;
      }
      
      ctx.lineTo(cx, cy - outerRadius);
      ctx.closePath();
    }
  }
  
  function init() {
    for (let i = 0; i < density; i++) {
      particles.push(new Particle());
    }
  }
  
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((particle) => {
      particle.update();
      particle.draw();
    });
    requestAnimationFrame(animate);
  }
  
  init();
  animate();
  
  // Cleanup function
  return () => {
    canvas.remove();
  };
}

// ==================== FONDOS ====================

/**
 * Genera CSS para fondos
 */
export function getBackgroundStyles(background, colors) {
  const styles = {};

  switch (background.mode) {
    case 'solid':
      styles.backgroundColor = background.solid || colors.background;
      break;

    case 'gradient':
      const { type, direction, colors: gradColors } = background.gradient || {};
      if (type === 'linear') {
        styles.backgroundImage = `linear-gradient(${direction || 'to bottom'}, ${
          gradColors?.join(', ') || `${colors.primary}, ${colors.secondary}`
        })`;
      } else if (type === 'radial') {
        styles.backgroundImage = `radial-gradient(circle, ${
          gradColors?.join(', ') || `${colors.primary}, ${colors.secondary}`
        })`;
      }
      break;

    case 'image':
      const { url, position, size, opacity } = background.image || {};
      if (url) {
        styles.backgroundImage = `url(${url})`;
        styles.backgroundPosition = position || 'center';
        styles.backgroundSize = size || 'cover';
        styles.backgroundRepeat = 'no-repeat';
        if (opacity < 1) {
          styles.position = 'relative';
        }
      }
      break;

    case 'pattern':
      // Los patrones se manejan mejor con pseudo-elementos o SVG
      styles.backgroundColor = colors.background;
      break;
  }

  return styles;
}

/**
 * Genera patrón SVG de fondo
 */
export function generateBackgroundPattern(patternConfig, colors) {
  const { type, color, opacity, scale } = patternConfig;
  
  const patterns = {
    dots: `<svg width="20" height="20" xmlns="http://www.w3.org/2000/svg">
      <circle cx="10" cy="10" r="2" fill="${color}" opacity="${opacity}"/>
    </svg>`,
    
    lines: `<svg width="40" height="40" xmlns="http://www.w3.org/2000/svg">
      <line x1="0" y1="0" x2="40" y2="40" stroke="${color}" opacity="${opacity}" stroke-width="1"/>
    </svg>`,
    
    grid: `<svg width="40" height="40" xmlns="http://www.w3.org/2000/svg">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="${color}" opacity="${opacity}" stroke-width="1"/>
    </svg>`,
  };

  const svgString = patterns[type] || patterns.dots;
  const encoded = btoa(svgString);
  
  return `url('data:image/svg+xml;base64,${encoded}')`;
}

// ==================== UTILIDADES GENERALES ====================

/**
 * Aplica todos los efectos según configuración de appearance
 */
export function applyAllEffects(appearance) {
  const cleanupFunctions = [];

  // Smooth scroll
  if (appearance.effects?.smoothScroll) {
    enableSmoothScroll();
  }

  // Scroll reveal
  if (appearance.effects?.scrollReveal) {
    const observer = initScrollReveal();
    cleanupFunctions.push(() => observer.disconnect());
  }

  // Parallax
  if (appearance.effects?.parallax) {
    const cleanup = initParallax(appearance.effects.parallaxSpeed || 0.5);
    cleanupFunctions.push(cleanup);
  }

  // Partículas
  if (appearance.effects?.particles?.enabled) {
    const cleanup = initParticles(appearance.effects.particles);
    cleanupFunctions.push(cleanup);
  }

  // Glassmorphism
  if (appearance.effects?.glassmorphism) {
    document.querySelectorAll('.glass-effect').forEach(applyGlassmorphism);
  }

  // Retornar función de limpieza
  return () => {
    cleanupFunctions.forEach(fn => fn());
  };
}

/**
 * Obtiene estilos CSS variables para inyectar globalmente
 */
export function getCSSVariables(appearance) {
  const vars = {};
  
  // Colores
  if (appearance.colors) {
    Object.entries(appearance.colors).forEach(([key, value]) => {
      vars[`--color-${key}`] = value;
    });
  }
  
  // Tipografía
  if (appearance.typography) {
    vars['--font-family'] = appearance.typography.fontFamily;
    vars['--heading-size'] = appearance.typography.headingSize;
    vars['--body-size'] = appearance.typography.bodySize;
    vars['--line-height'] = appearance.typography.lineHeight;
    vars['--letter-spacing'] = appearance.typography.letterSpacing;
  }
  
  return vars;
}

export default {
  getButtonClasses,
  getButtonStyles,
  getCardClasses,
  getNeumorphicStyles,
  getDividerSVG,
  initParticles,
  getBackgroundStyles,
  generateBackgroundPattern,
  applyAllEffects,
  getCSSVariables,
};
