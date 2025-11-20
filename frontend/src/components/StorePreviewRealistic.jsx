// frontend/src/components/StorePreviewRealistic.jsx
import ParticlesBackground from './ParticlesBackground';

/**
 * 🎨 PREVIEW REALISTA DE TIENDA
 * Muestra exactamente cómo se verá la tienda con la configuración aplicada
 */
export default function StorePreviewRealistic({ appearance, storeData, mode = 'desktop' }) {
  
  const colors = appearance?.colors || {
    primary: '#2563eb',
    secondary: '#7c3aed',
    accent: '#f59e0b',
    background: '#ffffff',
    surface: '#f8fafc',
    text: '#0f172a',
    textSecondary: '#64748b',
    border: '#e2e8f0',
  };
  
  const typography = appearance?.typography || {
    fontFamily: 'Inter',
    headingSize: '2.5rem',
    bodySize: '1rem',
    lineHeight: '1.6',
  };
  
  const effects = appearance?.effects || {};
  const background = appearance?.background || { mode: 'solid', solid: '#ffffff' };
  const components = appearance?.components || {};

  // Generar estilo de fondo
  const getBackgroundStyle = () => {
    if (background.mode === 'solid') {
      return { backgroundColor: background.solid || colors.background };
    }
    
    if (background.mode === 'gradient' && background.gradient?.colors?.length >= 2) {
      const { type, direction, colors: gradColors } = background.gradient;
      const colorStops = gradColors.join(', ');
      return {
        backgroundImage: type === 'radial' 
          ? `radial-gradient(circle, ${colorStops})`
          : `linear-gradient(${direction || 'to bottom'}, ${colorStops})`
      };
    }

    if (background.mode === 'image' && background.image?.url) {
      return {
        backgroundImage: `url(${background.image.url})`,
        backgroundSize: background.image.size || 'cover',
        backgroundPosition: background.image.position || 'center',
        backgroundColor: colors.background,
      };
    }

    return {
      backgroundImage: `linear-gradient(to bottom, ${colors.surface}, ${colors.background})`
    };
  };

  // Estilo de botones según configuración
  const getButtonClass = () => {
    const style = components?.buttons?.style || 'filled';
    const roundness = components?.buttons?.roundness || 'lg';
    
    const roundnessClass = {
      none: 'rounded-none',
      sm: 'rounded-sm',
      md: 'rounded-md',
      lg: 'rounded-lg',
      full: 'rounded-full',
    }[roundness];

    const baseClass = `px-6 py-3 font-medium transition-all duration-200 ${roundnessClass}`;

    if (style === 'filled') {
      return `${baseClass} text-white shadow-md hover:shadow-lg`;
    }
    if (style === 'outline') {
      return `${baseClass} border-2 bg-transparent hover:bg-opacity-10`;
    }
    if (style === 'ghost') {
      return `${baseClass} bg-transparent hover:bg-opacity-10`;
    }
    if (style === 'soft') {
      return `${baseClass} bg-opacity-10 hover:bg-opacity-20`;
    }
    if (style === 'gradient') {
      return `${baseClass} text-white bg-gradient-to-r shadow-lg hover:shadow-xl`;
    }
    
    return baseClass;
  };

  const scaleClass = mode === 'mobile' ? 'scale-[0.5]' : mode === 'tablet' ? 'scale-[0.7]' : 'scale-100';

  // Determinar tipo de negocio
  const isBookings = storeData?.mode === 'bookings' || storeData?.storeType === 'bookings';
  const businessType = isBookings ? 'bookings' : 'products';

  return (
    <div 
      className={`relative w-full min-h-[600px] overflow-hidden ${scaleClass}`}
      style={{
        ...getBackgroundStyle(),
        fontFamily: typography.fontFamily,
        color: colors.text,
      }}
    >
      {/* Partículas usando el componente real */}
      <ParticlesBackground 
        config={effects?.particles} 
        colors={colors}
      />

      {/* Contenido del preview */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-12">
        
        {/* Sección Hero */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            {storeData?.logoUrl ? (
              <img
                src={storeData.logoUrl}
                alt={storeData?.name || 'Logo'}
                className="w-24 h-24 rounded-full object-cover shadow-lg border-4"
                style={{ borderColor: colors.primary }}
              />
            ) : (
              <div 
                className="w-24 h-24 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg"
                style={{ backgroundColor: colors.primary }}
              >
                {storeData?.name?.charAt(0) || 'T'}
              </div>
            )}
          </div>

          <h1 
            className="font-bold mb-4"
            style={{ 
              fontSize: typography.headingSize || '2.5rem',
              fontWeight: typography.headingWeight || '700',
              color: colors.text,
              letterSpacing: typography.letterSpacing === 'tight' ? '-0.05em' : 
                            typography.letterSpacing === 'wide' ? '0.05em' : 'normal',
              textTransform: typography.textTransform || 'none',
            }}
          >
            {storeData?.name || 'Nombre de la Tienda'}
          </h1>

          <p 
            className="max-w-2xl mx-auto mb-8"
            style={{ 
              fontSize: typography.bodySize || '1rem',
              fontWeight: typography.bodyWeight || '400',
              color: colors.textSecondary,
              lineHeight: typography.lineHeight || '1.6',
            }}
          >
            {storeData?.description || (isBookings 
              ? 'Agenda tu cita con nosotros. Profesionales expertos a tu servicio.'
              : 'Descubre nuestra selección de productos de alta calidad.')}
          </p>

          <button
            className={getButtonClass()}
            style={{
              backgroundColor: components?.buttons?.style === 'filled' ? colors.primary : 'transparent',
              borderColor: colors.primary,
              color: components?.buttons?.style === 'outline' ? colors.primary : 'white',
              backgroundImage: components?.buttons?.style === 'gradient' 
                ? `linear-gradient(to right, ${colors.primary}, ${colors.secondary})` 
                : 'none',
            }}
          >
            {isBookings ? '📅 Agendar Cita' : '🛒 Ver Catálogo'}
          </button>
        </div>

        {/* Sección Sobre Nosotros / Quiénes Somos */}
        {storeData?.aboutDescription && (
          <div 
            className="mb-16 p-8 rounded-2xl"
            style={{ 
              backgroundColor: colors.surface,
            }}
          >
            <h2 
              className="font-bold mb-4 text-center"
              style={{ 
                fontSize: `calc(${typography.headingSize} * 0.7)`,
                color: colors.text,
              }}
            >
              {storeData?.aboutTitle || 'Quiénes Somos'}
            </h2>
            <p className="text-center whitespace-pre-line" style={{ color: colors.textSecondary, lineHeight: typography.lineHeight }}>
              {storeData?.aboutDescription}
            </p>
          </div>
        )}

        {/* Cuadros Personalizados */}
        {storeData?.customBoxes && storeData.customBoxes.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {storeData.customBoxes.map((box) => (
              <div
                key={box.id}
                className="p-6 rounded-xl"
                style={{
                  backgroundColor: colors.surface,
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                }}
              >
                <div className="text-4xl mb-4">{box.icon}</div>
                <h3 
                  className="font-bold mb-3" 
                  style={{ 
                    fontSize: `calc(${typography.headingSize} * 0.6)`,
                    color: colors.text 
                  }}
                >
                  {box.title}
                </h3>
                <p className="text-sm whitespace-pre-line" style={{ color: colors.textSecondary }}>
                  {box.content}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Horarios de Atención */}
        {storeData?.scheduleText && (
          <div 
            className="mb-16 p-8 rounded-2xl text-center"
            style={{ 
              backgroundColor: colors.surface,
            }}
          >
            <h2 
              className="font-bold mb-4 flex items-center justify-center gap-2"
              style={{ 
                fontSize: `calc(${typography.headingSize} * 0.7)`,
                color: colors.text,
              }}
            >
              <span>⏰</span>
              Horarios de Atención
            </h2>
            <p className="whitespace-pre-line" style={{ color: colors.textSecondary, lineHeight: typography.lineHeight }}>
              {storeData?.scheduleText}
            </p>
          </div>
        )}

        {/* Grid de servicios/productos de ejemplo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="p-6 rounded-xl transition-transform hover:scale-105"
              style={{
                backgroundColor: colors.surface,
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              }}
            >
              <div 
                className="w-full h-32 rounded-lg mb-4 flex items-center justify-center text-4xl"
                style={{ backgroundColor: colors.primary + '20' }}
              >
                {isBookings ? '⏰' : '📦'}
              </div>
              <h3 className="font-semibold mb-2" style={{ color: colors.text }}>
                {isBookings ? `Servicio Profesional ${item}` : `Producto Premium ${item}`}
              </h3>
              <p className="text-sm mb-4" style={{ color: colors.textSecondary }}>
                {isBookings 
                  ? `Duración: ${30 + item * 15} minutos • Atención personalizada`
                  : `Disponible • Envío gratis en compras sobre $50.000`}
              </p>
              <div className="flex justify-between items-center">
                <span className="font-bold" style={{ color: colors.primary }}>
                  {isBookings ? `${30 + item * 15} min` : `$${15000 * item}.000`}
                </span>
                <button
                  className="px-4 py-2 rounded-lg text-sm font-medium"
                  style={{
                    backgroundColor: colors.primary,
                    color: 'white',
                  }}
                >
                  {isBookings ? 'Agendar' : 'Comprar'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center py-8 border-t" style={{ borderColor: colors.border }}>
          <p className="text-sm" style={{ color: colors.textSecondary }}>
            © 2025 {storeData?.name || 'Tu Tienda'}. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </div>
  );
}
