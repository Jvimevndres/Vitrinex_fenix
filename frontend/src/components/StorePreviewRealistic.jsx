// src/components/StorePreviewRealistic.jsx
import React from 'react';
import ParticlesBackground from './ParticlesBackground';

/**
 * 🎨 StorePreviewRealistic
 * Réplica COMPLETA de StorePublic.jsx - muestra TODAS las secciones como las verá el cliente
 */
const StorePreviewRealistic = ({ appearance, storeData }) => {
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

  // Estilos de fondo según configuración
  const getBackgroundStyle = () => {
    const bg = appearance?.background || {};
    const mode = bg.mode || 'gradient';

    if (mode === 'solid') {
      return {
        backgroundColor: bg.solid?.color || bg.solid || colors.background,
      };
    }

    if (mode === 'gradient') {
      const top = bg.gradient?.from || colors.primary;
      const bottom = bg.gradient?.to || colors.background;
      return {
        backgroundImage: `linear-gradient(to bottom, ${top}, ${bottom})`,
      };
    }

    if (mode === 'image' && bg.image?.url) {
      return {
        backgroundImage: `url(${bg.image.url})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      };
    }

    return {
      backgroundColor: colors.background,
    };
  };

  // Estilos de tarjetas según configuración
  const getCardStyle = () => {
    const card = appearance?.cards || {};
    return {
      backgroundColor: card.backgroundColor || colors.surface,
      borderRadius: `${card.borderRadius || 1}rem`,
      boxShadow: card.shadow ? '0 10px 30px rgba(0,0,0,0.1)' : '0 1px 3px rgba(0,0,0,0.1)',
      border: card.border ? `1px solid ${colors.border}` : `1px solid ${colors.border}`,
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
      className="relative w-full overflow-y-auto"
      style={{
        ...getBackgroundStyle(),
        minHeight: '100vh',
        padding: '1.5rem',
      }}
    >
      {/* Partículas si están activadas */}
      {appearance?.effects?.particles && (
        <ParticlesBackground
          color={colors.primary}
          quantity={appearance.effects.particlesQuantity || 50}
          speed={appearance.effects.particlesSpeed || 0.5}
        />
      )}

      {/* Contenedor principal */}
      <div className="relative z-10 max-w-6xl mx-auto space-y-6">
        
        {/* HERO - Réplica exacta de StorePublic.jsx */}
        {appearance?.sections?.hero !== false && (
          <section
            className="p-6 flex flex-col md:flex-row gap-6 items-start"
            style={{
              ...getCardStyle(),
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
            className="rounded-2xl p-6 space-y-4"
            style={getCardStyle()}
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
            {storeData.customBoxes.map((box, idx) => (
              <div
                key={box.id || idx}
                className={`p-6 rounded-xl space-y-3 ${appearance?.effects?.floatingHover ? 'floating-hover' : ''}`}
                style={getCardStyle()}
              >
                <div className="text-4xl">{box.icon}</div>
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
            ))}
          </div>
        )}

        {/* Horarios de Atención */}
        {storeData?.scheduleText && appearance?.sections?.schedule !== false && (
          <section
            className="rounded-2xl p-6 space-y-4"
            style={getCardStyle()}
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

        {/* Sección de Agendamiento (Simulada) */}
        {storeData?.mode === 'bookings' && appearance?.sections?.booking !== false && (
          <section
            className="rounded-2xl p-6 space-y-6"
            style={getCardStyle()}
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
            {/* Aquí iría el calendario y servicios - simulado */}
            <div className="p-8 rounded-lg text-center" style={{ backgroundColor: hexToRgba(colors.primary, 0.05) }}>
              <p style={{ color: colors.textSecondary }}>Vista previa del sistema de agendamiento</p>
            </div>
          </section>
        )}

        {/* Sección de Productos (Simulada) */}
        {storeData?.mode === 'products' && appearance?.sections?.products !== false && (
          <section
            className="rounded-2xl p-6 space-y-6"
            style={getCardStyle()}
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
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="rounded-xl overflow-hidden"
                  style={{
                    ...getCardStyle(),
                    padding: 0,
                  }}
                >
                  <div style={{ height: '150px', backgroundColor: hexToRgba(colors.primary, 0.1) }}></div>
                  <div className="p-4">
                    <h4 style={{ fontSize: '1rem', fontWeight: '600', color: colors.text }}>Producto {i}</h4>
                    <p style={{ fontSize: '0.875rem', color: colors.textSecondary, marginTop: '0.5rem' }}>
                      Descripción del producto
                    </p>
                    <p style={{ fontSize: '1.25rem', fontWeight: '700', color: colors.primary, marginTop: '0.5rem' }}>
                      $19.990
                    </p>
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
