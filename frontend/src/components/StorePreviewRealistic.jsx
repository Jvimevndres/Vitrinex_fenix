// src/components/StorePreviewRealistic.jsx
import React, { useEffect, useState } from 'react';
import ParticlesBackground from './ParticlesBackground';
import { 
  FaMapMarkerAlt, FaLightbulb, FaBullseye, FaBolt, FaStar, FaFire, 
  FaGem, FaTrophy, FaMagic, FaPalette, FaRocket, FaDumbbell, 
  FaCheckCircle, FaClock, FaShieldAlt, FaHeart, FaGift, FaThumbsUp,
  FaUsers, FaCog, FaLeaf, FaMedal, FaHandshake, FaAward
} from 'react-icons/fa';

// Mapa de iconos
const ICON_MAP = {
  'pin': FaMapMarkerAlt,
  'lightbulb': FaLightbulb,
  'target': FaBullseye,
  'bolt': FaBolt,
  'star': FaStar,
  'fire': FaFire,
  'gem': FaGem,
  'trophy': FaTrophy,
  'magic': FaMagic,
  'palette': FaPalette,
  'rocket': FaRocket,
  'dumbbell': FaDumbbell,
  'check': FaCheckCircle,
  'clock': FaClock,
  'shield': FaShieldAlt,
  'heart': FaHeart,
  'gift': FaGift,
  'thumbsup': FaThumbsUp,
  'users': FaUsers,
  'cog': FaCog,
  'leaf': FaLeaf,
  'medal': FaMedal,
  'handshake': FaHandshake,
  'award': FaAward,
  // Compatibilidad con emojis
  '📌': FaMapMarkerAlt,
  '💡': FaLightbulb,
  '🎯': FaBullseye,
  '⚡': FaBolt,
  '🌟': FaStar,
  '🔥': FaFire,
  '💎': FaGem,
  '🏆': FaTrophy,
  '✨': FaMagic,
  '🎨': FaPalette,
  '🚀': FaRocket,
  '💪': FaDumbbell,
};

const getIconComponent = (iconKey) => {
  return ICON_MAP[iconKey] || FaMapMarkerAlt;
};

/**
 * 🎨 StorePreviewRealistic
 * Réplica COMPLETA de StorePublic.jsx - muestra TODAS las secciones como las verá el cliente
 * Se actualiza en TIEMPO REAL con todos los cambios
 */
const StorePreviewRealistic = ({ appearance, storeData }) => {
  // Forzar re-render cuando cambian appearance o storeData
  const [renderKey, setRenderKey] = useState(0);

  useEffect(() => {
    console.log('🔄 StorePreviewRealistic - Detectando cambios:', {
      appearance: appearance?.theme,
      colors: appearance?.colors?.primary,
      storeMode: storeData?.mode,
      storeName: storeData?.name,
      customBoxes: storeData?.customBoxes?.length,
      aboutDescription: !!storeData?.aboutDescription,
      scheduleText: !!storeData?.scheduleText,
      effects: {
        glassmorphism: appearance?.effects?.glassmorphism,
        neomorphism: appearance?.effects?.neomorphism,
        shadows3D: appearance?.effects?.shadows3D,
        colorShift: appearance?.effects?.colorShift,
        '🔥 GLOW': appearance?.effects?.glow,
        '🌈 ANIMATED_GRADIENT': appearance?.effects?.animatedGradient,
        '🎈 FLOATING_HOVER': appearance?.effects?.floatingHover,
        '🌫️ BLUR': appearance?.effects?.blur,
        '🎨 COLOR_SHIFT': appearance?.effects?.colorShift,
        '🔄 MORPHING': appearance?.effects?.morphing,
        particles: appearance?.effects?.particles?.enabled
      }
    });
    
    // Log específico de efectos problemáticos
    if (appearance?.effects?.glow) console.log('✨ Glow activado con color:', appearance?.colors?.primary);
    if (appearance?.effects?.animatedGradient) console.log('🌈 Gradiente animado activado');
    if (appearance?.effects?.blur) console.log('🌫️ Blur activado');
    if (appearance?.effects?.morphing) console.log('🔄 Morphing activado');
    if (appearance?.effects?.colorShift) console.log('🎨 Color shift activado');
    
    setRenderKey(prev => prev + 1);
  }, [appearance, storeData]);

  // Colores del tema aplicado
  const colors = appearance?.colors || {
    primary: storeData?.primaryColor || '#2563eb',
    secondary: storeData?.accentColor || '#0f172a',
    accent: storeData?.primaryColor || '#2563eb',
    background: storeData?.bgColorTop || '#ffffff',
    surface: '#ffffff',
    text: '#1e293b',
    textSecondary: '#64748b',
    border: '#e2e8f0',
  };

  // Tipografía aplicada
  const headingStyle = {
    fontSize: appearance?.typography?.headingSize || '2rem',
    fontWeight: appearance?.typography?.headingWeight || '700',
    fontFamily: appearance?.typography?.headingFont || 'inherit',
  };

  const bodyStyle = {
    fontSize: appearance?.typography?.bodySize || '1rem',
    fontWeight: appearance?.typography?.bodyWeight || '400',
    fontFamily: appearance?.typography?.bodyFont || 'inherit',
  };

  // Estilos de fondo según configuración CON EFECTOS
  const getBackgroundStyle = () => {
    const bg = appearance?.background || {};
    const effects = appearance?.effects || {};
    const mode = bg.mode || 'gradient';

    let style = {};
    
    if (mode === 'solid') {
      style = {
        backgroundColor: bg.solid?.color || bg.solid || colors.background,
      };
    } else if (mode === 'gradient') {
      const top = bg.gradient?.from || colors.primary;
      const bottom = bg.gradient?.to || colors.background;
      style = {
        backgroundImage: `linear-gradient(to bottom, ${top}, ${bottom})`,
      };
    } else if (mode === 'image' && bg.image?.url) {
      style = {
        backgroundImage: `url(${bg.image.url})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      };
    } else {
      style = {
        backgroundColor: colors.background,
      };
    }

    // Aplicar efectos de fondo
    if (effects.animatedGradient && mode === 'gradient') {
      style.backgroundSize = '200% 200%';
      style.animation = 'gradient-shift 8s ease infinite';
    }
    
    if (effects.parallaxBg) {
      style.backgroundAttachment = 'fixed';
    }

    return style;
  };

  // Estilos de tarjetas según configuración CON EFECTOS
  const getCardStyle = () => {
    const card = appearance?.cards || {};
    const effects = appearance?.effects || {};
    
    // Construir clases CSS para efectos
    let cssClasses = [];
    if (effects.glassmorphism) cssClasses.push('glass-card');
    if (effects.neomorphism) cssClasses.push('neomorph-card');
    if (effects.shadows3D) cssClasses.push('shadow-3d');
    if (effects.colorShift) cssClasses.push('color-shift');
    if (effects.glow) cssClasses.push('glow-effect');
    if (effects.morphing) cssClasses.push('morphing');
    if (effects.blur) cssClasses.push('blur-effect');
    if (effects.fadeIn) cssClasses.push('animate-fade-in');
    
    const baseStyle = {
      backgroundColor: card.backgroundColor || colors.surface,
      borderRadius: `${card.borderRadius || 1}rem`,
      boxShadow: card.shadow ? '0 10px 30px rgba(0,0,0,0.1)' : '0 1px 3px rgba(0,0,0,0.1)',
      border: card.border ? `1px solid ${colors.border}` : `1px solid ${colors.border}`,
    };
    
    // Aplicar estilos inline adicionales para efectos específicos
    if (effects.glow) {
      // Usar color primario dinámico para el glow
      const glowColor = colors.primary || '#8b5cf6';
      baseStyle.filter = `drop-shadow(0 0 12px ${hexToRgba(glowColor, 0.6)}) drop-shadow(0 0 20px ${hexToRgba(glowColor, 0.4)})`;
      baseStyle.transition = 'filter 0.3s ease, transform 0.3s ease';
      console.log('✨ Aplicando glow a tarjeta con color:', glowColor);
    }
    
    if (effects.blur && !effects.glassmorphism) {
      baseStyle.backdropFilter = 'blur(10px)';
      baseStyle.WebkitBackdropFilter = 'blur(10px)';
      baseStyle.backgroundColor = hexToRgba(colors.surface, 0.7);
      console.log('🌫️ Aplicando blur a tarjeta');
    }
    
    if (effects.morphing) {
      // Iniciar con forma morphing
      baseStyle.borderRadius = '30% 70% 70% 30% / 30% 30% 70% 70%';
      baseStyle.willChange = 'border-radius';
      console.log('🔄 Aplicando morphing a tarjeta');
    }
    
    if (effects.animatedGradient && !effects.glassmorphism) {
      // Aplicar gradiente animado a las tarjetas
      baseStyle.backgroundImage = `linear-gradient(135deg, ${colors.primary}, ${colors.secondary}, ${colors.primary})`;
      baseStyle.backgroundSize = '200% 200%';
      baseStyle.color = '#ffffff';
      console.log('🌈 Aplicando gradiente animado a tarjeta');
    }
    
    console.log('🎨 Card style final:', {
      cssClasses,
      hasGlow: effects.glow,
      hasBlur: effects.blur,
      hasMorphing: effects.morphing,
      hasAnimatedGradient: effects.animatedGradient,
      styleKeys: Object.keys(baseStyle)
    });
    
    return {
      style: baseStyle,
      className: cssClasses.join(' ')
    };
  };

  // Estilos de botones
  const getButtonStyle = () => {
    const buttons = appearance?.buttons || {};
    return {
      backgroundColor: buttons.primaryColor || colors.primary,
      color: buttons.primaryTextColor || '#ffffff',
      borderRadius: `${buttons.borderRadius || 0.5}rem`,
      padding: '0.75rem 1.5rem',
      fontWeight: '600',
      border: 'none',
      cursor: 'pointer',
    };
  };

  // Función helper para rgba
  const hexToRgba = (hex, alpha = 0.15) => {
    if (!hex) return `rgba(0,0,0,${alpha})`;
    let h = hex.replace("#", "");
    if (h.length === 3) h = h.split("").map((c) => c + c).join("");
    const bigint = parseInt(h, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  return (
    <div
      key={renderKey}
      className={`relative w-full overflow-y-auto ${
        appearance?.effects?.animations ? 'animate-fade-in' : ''
      } ${
        appearance?.effects?.blur ? 'blur-effect' : ''
      }`}
      style={{
        ...getBackgroundStyle(),
        minHeight: '100vh',
        padding: '1.5rem',
        scrollBehavior: appearance?.effects?.smoothScroll ? 'smooth' : 'auto',
      }}
    >
      {/* Partículas si están activadas */}
      {appearance?.effects?.particles?.enabled && (
        <ParticlesBackground
          config={appearance.effects.particles}
          colors={colors}
        />
      )}

      {/* Contenedor principal */}
      <div className="relative z-10 max-w-6xl mx-auto space-y-6">
        
        {/* HERO - Réplica exacta de StorePublic.jsx */}
        {appearance?.sections?.hero !== false && (
          <section
            className={`p-6 flex flex-col md:flex-row gap-6 items-start ${getCardStyle().className}`}
            style={{
              ...getCardStyle().style,
              borderColor: colors.border,
            }}
          >
            {/* Logo */}
            <div className="flex-shrink-0">
              {storeData?.logoUrl ? (
                <img
                  src={storeData.logoUrl}
                  alt={storeData.name}
                  className="w-32 h-32 md:w-40 md:h-40 object-cover rounded-2xl border shadow-sm"
                />
              ) : (
                <div
                  className="w-32 h-32 md:w-40 md:h-40 rounded-2xl flex items-center justify-center text-2xl font-semibold border"
                  style={{
                    backgroundColor: '#f1f5f9',
                    color: colors.text,
                  }}
                >
                  {storeData?.name?.[0] || 'T'}
                </div>
              )}
            </div>

            {/* Info de la tienda */}
            <div className="flex-1 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <h2
                  className="font-semibold"
                  style={{
                    ...headingStyle,
                    color: colors.text,
                  }}
                >
                  {storeData?.name || 'Mi Tienda'}
                </h2>
                {storeData?.mode && (
                  <span
                    className="text-[11px] uppercase tracking-wide px-3 py-1 rounded-full"
                    style={{
                      backgroundColor: hexToRgba(colors.primary, 0.15),
                      color: colors.primary,
                    }}
                  >
                    {storeData.mode === 'bookings' ? 'Agendamiento de citas' : 'Venta de productos'}
                  </span>
                )}
              </div>

              <p className="text-xs" style={{ color: colors.textSecondary }}>
                {storeData?.tipoNegocio || 'Negocio'} · {storeData?.comuna || 'Santiago'}
              </p>

              {storeData?.direccion && (
                <p className="text-sm flex items-center gap-1" style={{ color: colors.text }}>
                  <span>📍</span>
                  <span>{storeData.direccion}</span>
                </p>
              )}

              {storeData?.heroTitle || storeData?.heroSubtitle ? (
                <div className="space-y-1">
                  {storeData.heroTitle && (
                    <p
                      className="font-semibold"
                      style={{
                        fontSize: `calc(${appearance?.typography?.bodySize || '1rem'} * 1.1)`,
                        color: colors.text,
                      }}
                    >
                      {storeData.heroTitle}
                    </p>
                  )}
                  {storeData.heroSubtitle && (
                    <p style={{ ...bodyStyle, color: colors.textSecondary }}>
                      {storeData.heroSubtitle}
                    </p>
                  )}
                </div>
              ) : (
                <p style={{ ...bodyStyle, color: colors.textSecondary }}>
                  {storeData?.description || (storeData?.mode === 'bookings'
                    ? 'Reserva tu hora con nosotros. Atención profesional garantizada.'
                    : 'Descubre nuestros productos de calidad.')}
                </p>
              )}

              {/* Highlights */}
              {(storeData?.highlight1 || storeData?.highlight2 || storeData?.priceFrom) && (
                <div className="flex flex-wrap gap-2 text-xs">
                  {storeData.highlight1 && (
                    <span
                      className="px-2 py-1 rounded-full border"
                      style={{ borderColor: colors.primary, color: colors.text }}
                    >
                      {storeData.highlight1}
                    </span>
                  )}
                  {storeData.highlight2 && (
                    <span
                      className="px-2 py-1 rounded-full border"
                      style={{ borderColor: colors.primary, color: colors.text }}
                    >
                      {storeData.highlight2}
                    </span>
                  )}
                  {storeData.priceFrom && (
                    <span className="px-2 py-1 rounded-full" style={{ backgroundColor: '#f1f5f9', color: colors.text }}>
                      {storeData.priceFrom}
                    </span>
                  )}
                </div>
              )}

              {/* Botones */}
              <div className="flex flex-wrap gap-2 pt-2">
                <button
                  type="button"
                  className="text-xs md:text-sm font-medium shadow-sm"
                  style={getButtonStyle()}
                >
                  {storeData?.mode === 'bookings' ? 'Agendar cita' : 'Ver catálogo'}
                </button>
                <button
                  type="button"
                  className="px-3 py-2 rounded-lg text-xs md:text-sm border text-slate-700"
                  style={{ borderColor: '#cbd5e1' }}
                >
                  ← Volver al inicio
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Sección Quiénes Somos */}
        {storeData?.aboutDescription && appearance?.sections?.about !== false && (
          <section
            className={`rounded-2xl p-6 space-y-4 ${getCardStyle().className}`}
            style={getCardStyle().style}
          >
            <h3
              className="font-bold text-center"
              style={{
                fontSize: `calc(${appearance?.typography?.headingSize || '2rem'} * 0.8)`,
                fontWeight: appearance?.typography?.headingWeight || '700',
                color: colors.text,
              }}
            >
              {storeData.aboutTitle || 'Quiénes Somos'}
            </h3>
            <p
              className="text-center whitespace-pre-line"
              style={{
                ...bodyStyle,
                color: colors.textSecondary,
              }}
            >
              {storeData.aboutDescription}
            </p>
          </section>
        )}

        {/* Cuadros Personalizados */}
        {storeData?.customBoxes && storeData.customBoxes.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {storeData.customBoxes.map((box, idx) => {
              const IconComponent = getIconComponent(box.icon);
              return (
              <div
                key={box.id || idx}
                className={`p-6 rounded-xl space-y-3 ${getCardStyle().className} ${appearance?.effects?.floatingHover ? 'floating-hover' : ''}`}
                style={getCardStyle().style}
              >
                <IconComponent className="text-4xl" style={{ color: colors.primary }} />
                <h4
                  className="font-bold"
                  style={{
                    fontSize: `calc(${appearance?.typography?.headingSize || '2rem'} * 0.6)`,
                    fontWeight: appearance?.typography?.headingWeight || '700',
                    color: colors.text,
                  }}
                >
                  {box.title}
                </h4>
                <p
                  className="whitespace-pre-line"
                  style={{
                    ...bodyStyle,
                    color: colors.textSecondary,
                  }}
                >
                  {box.content}
                </p>
              </div>
            )})}
          </div>
        )}

        {/* Horarios de Atención */}
        {storeData?.scheduleText && appearance?.sections?.schedule !== false && (
          <section
            className={`rounded-2xl p-6 space-y-4 ${getCardStyle().className}`}
            style={getCardStyle().style}
          >
            <h3
              className="font-bold text-center flex items-center justify-center gap-2"
              style={{
                fontSize: `calc(${appearance?.typography?.headingSize || '2rem'} * 0.8)`,
                fontWeight: appearance?.typography?.headingWeight || '700',
                color: colors.text,
              }}
            >
              <span>⏰</span>
              Horarios de Atención
            </h3>
            <p
              className="text-center whitespace-pre-line"
              style={{
                ...bodyStyle,
                color: colors.textSecondary,
              }}
            >
              {storeData.scheduleText}
            </p>
          </section>
        )}

        {/* Sección de Agendamiento - Con Tarjetas de Servicios */}
        {storeData?.mode === 'bookings' && appearance?.sections?.booking !== false && (
          <section
            className={`rounded-2xl p-6 space-y-6 ${getCardStyle().className}`}
            style={getCardStyle().style}
          >
            <div className="text-center">
              <h3
                className="font-bold"
                style={{
                  fontSize: `calc(${appearance?.typography?.headingSize || '2rem'} * 0.8)`,
                  fontWeight: appearance?.typography?.headingWeight || '700',
                  color: colors.text,
                }}
              >
                📅 Agenda tu Cita
              </h3>
              <p
                className="mt-2"
                style={{
                  ...bodyStyle,
                  color: colors.textSecondary,
                }}
              >
                Selecciona el servicio y horario que prefieras
              </p>
            </div>
            
            {/* Grid de servicios de agendamiento - IGUAL QUE PRODUCTOS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { name: 'CANCHA 1', category: 'canchas', tags: ['FUTBOL'], price: 25000 },
                { name: 'CANCHA 2', category: 'canchas', tags: ['FUTBOL'], price: 25000 },
                { name: 'CANCHA 3', category: 'canchas', tags: ['PADEL'], price: 30000 }
              ].map((service, i) => (
                <div
                  key={i}
                  className={`rounded-xl overflow-hidden ${getCardStyle().className} ${appearance?.effects?.floatingHover ? 'floating-hover' : ''}`}
                  style={{
                    ...getCardStyle().style,
                    padding: 0,
                  }}
                >
                  {/* Imagen del servicio */}
                  <div 
                    className="relative"
                    style={{ 
                      height: '150px', 
                      backgroundColor: hexToRgba(colors.primary, 0.1),
                      backgroundImage: 'linear-gradient(135deg, ' + hexToRgba(colors.primary, 0.2) + ' 0%, ' + hexToRgba(colors.secondary, 0.1) + ' 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <span style={{ fontSize: '3rem' }}>⚽</span>
                  </div>
                  
                  {/* Info del servicio */}
                  <div className="p-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <span 
                        className="text-xs px-2 py-1 rounded-full"
                        style={{ 
                          backgroundColor: hexToRgba(colors.primary, 0.1),
                          color: colors.primary
                        }}
                      >
                        {service.category}
                      </span>
                      {service.tags.map((tag, idx) => (
                        <span 
                          key={idx}
                          className="text-xs px-2 py-1 rounded-full"
                          style={{ 
                            backgroundColor: hexToRgba(colors.secondary, 0.1),
                            color: colors.secondary
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    
                    <h4 style={{ fontSize: '1rem', fontWeight: '600', color: colors.text }}>
                      {service.name}
                    </h4>
                    
                    <p style={{ fontSize: '0.875rem', color: colors.textSecondary }}>
                      Reserva tu hora y disfruta
                    </p>
                    
                    <div className="flex items-center justify-between pt-2">
                      <p style={{ fontSize: '1.25rem', fontWeight: '700', color: colors.primary }}>
                        ${service.price.toLocaleString('es-CL')}
                      </p>
                      <button
                        className="text-xs px-3 py-1.5 rounded-lg font-medium"
                        style={getButtonStyle()}
                      >
                        Reservar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Sección de Productos */}
        {storeData?.mode === 'products' && appearance?.sections?.products !== false && (
          <section
            className={`rounded-2xl p-6 space-y-6 ${getCardStyle().className}`}
            style={getCardStyle().style}
          >
            <div className="text-center">
              <h3
                className="font-bold"
                style={{
                  fontSize: `calc(${appearance?.typography?.headingSize || '2rem'} * 0.8)`,
                  fontWeight: appearance?.typography?.headingWeight || '700',
                  color: colors.text,
                }}
              >
                🛍️ Nuestros Productos
              </h3>
            </div>
            {/* Grid de productos simulados */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { name: 'Producto 1', desc: 'Descripción del producto', price: 19990 },
                { name: 'Producto 2', desc: 'Descripción del producto', price: 19990 },
                { name: 'Producto 3', desc: 'Descripción del producto', price: 19990 }
              ].map((product, i) => (
                <div
                  key={i}
                  className={`rounded-xl overflow-hidden ${getCardStyle().className} ${appearance?.effects?.floatingHover ? 'floating-hover' : ''}`}
                  style={{
                    ...getCardStyle().style,
                    padding: 0,
                  }}
                >
                  <div 
                    style={{ 
                      height: '150px', 
                      backgroundColor: hexToRgba(colors.primary, 0.1),
                      backgroundImage: 'linear-gradient(135deg, ' + hexToRgba(colors.primary, 0.2) + ' 0%, ' + hexToRgba(colors.secondary, 0.1) + ' 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <span style={{ fontSize: '3rem' }}>📦</span>
                  </div>
                  <div className="p-4">
                    <h4 style={{ fontSize: '1rem', fontWeight: '600', color: colors.text }}>
                      {product.name}
                    </h4>
                    <p style={{ fontSize: '0.875rem', color: colors.textSecondary, marginTop: '0.5rem' }}>
                      {product.desc}
                    </p>
                    <div className="flex items-center justify-between pt-3">
                      <p style={{ fontSize: '1.25rem', fontWeight: '700', color: colors.primary }}>
                        ${product.price.toLocaleString('es-CL')}
                      </p>
                      <button
                        className="text-xs px-3 py-1.5 rounded-lg font-medium"
                        style={getButtonStyle()}
                      >
                        Comprar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Footer */}
        <div className="text-center pt-4" style={{ color: colors.textSecondary, fontSize: '0.875rem' }}>
          © 2025 {storeData?.name || 'Tienda'}. Todos los derechos reservados.
        </div>
      </div>
    </div>
  );
};

export default StorePreviewRealistic;
