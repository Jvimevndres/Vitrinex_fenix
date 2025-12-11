import { useState, useEffect } from 'react';
import { getActiveAdsByPosition, trackAdClick } from '../api/sponsors';

export default function PromotionalBanner({ position, store, className = '', layout = 'stack' }) {
  const [ads, setAds] = useState([]);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);

  // 🎯 PRIORIDAD: Usar plan del propietario (owner.plan) en lugar del plan de la tienda (store.plan)
  const ownerPlan = store?.owner?.plan?.toLowerCase();
  const isPremium = ownerPlan === 'pro' || ownerPlan === 'premium';
  
  // Para barras laterales, manejar arrays de anuncios
  const isSidebarPosition = position === 'sidebarLeft' || position === 'sidebarRight';
  const customBanners = isSidebarPosition 
    ? (Array.isArray(store?.promotionalSpaces?.[position]) 
        ? store.promotionalSpaces[position].filter(ad => ad?.enabled && ad?.imageUrl) 
        : [])
    : null;
  
  const customBanner = isSidebarPosition ? null : store?.promotionalSpaces?.[position];
  const hasCustomBanner = isSidebarPosition 
    ? isPremium && customBanners.length > 0
    : isPremium && customBanner?.enabled && customBanner?.imageUrl;
  
  // Debug logging
  useEffect(() => {
    console.log(`📢 PromotionalBanner [${position}]:`, {
      storePlan: store?.plan,
      ownerPlan: store?.owner?.plan,
      isPremium,
      customBannerEnabled: customBanner?.enabled,
      hasImage: !!customBanner?.imageUrl,
      hasCustomBanner,
      priority: hasCustomBanner ? '⭐ PREMIUM (Usuario)' : '📢 Admin/Patrocinadores'
    });
  }, [position, store?.plan, store?.owner?.plan, customBanner]);
  
  // layout puede ser: 'carousel' (rotación automática) o 'stack' (apilados verticalmente)

  useEffect(() => {
    // 🎯 Solo cargar anuncios del admin si el propietario NO es premium
    // Si es premium, solo se muestran sus anuncios personalizados
    if (!isPremium) {
      loadSponsorAds();
    }
  }, [position, isPremium]);

  const loadSponsorAds = async () => {
    try {
      const res = await getActiveAdsByPosition(position);
      const adsData = res.data.ads || [];
      console.log(`📢 [${position}] Anuncios del admin cargados:`, adsData.length);
      setAds(adsData);
    } catch (error) {
      console.error('❌ Error cargando anuncios:', error);
      setAds([]);
    }
  };

  // Rotar anuncios cada 10 segundos
  useEffect(() => {
    if (ads.length > 1) {
      const interval = setInterval(() => {
        setCurrentAdIndex((prev) => (prev + 1) % ads.length);
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [ads.length]);

  const handleClick = async (adId) => {
    if (adId) {
      try {
        await trackAdClick(adId);
      } catch (error) {
        console.error('Error registrando click:', error);
      }
    }
  };

  // 🎯 Lógica de visualización de anuncios
  // - Usuario Premium: Solo muestra SUS anuncios personalizados (si los tiene)
  // - Usuario Free: Solo muestra anuncios del admin
  
  // Posiciones horizontales solo muestran 1 anuncio total
  const isHorizontalPosition = ['top', 'betweenSections', 'footer'].includes(position);
  
  // Para usuarios premium, NO mostrar anuncios del admin
  const shouldShowAdminAds = !isPremium && ads.length > 0;
  
  // Para posiciones horizontales, tomar solo el primer anuncio del admin
  const adminAdsToShow = isHorizontalPosition ? ads.slice(0, 1) : ads;

  // Dimensiones según posición
  const getDimensions = () => {
    switch(position) {
      case 'top':
        return 'w-full max-h-32 md:max-h-40';
      case 'sidebarLeft':
      case 'sidebarRight':
        return 'w-full aspect-[3/4] max-h-[400px]';
      case 'betweenSections':
        return 'w-full max-h-48';
      case 'footer':
        return 'w-full max-h-24';
      default:
        return 'w-full max-h-40';
    }
  };

  // Si no hay ni banner personalizado ni anuncios del admin
  if (!hasCustomBanner && ads.length === 0) {
    const isDev = import.meta.env.DEV;
    if (isDev) {
      return (
        <div className={`promotional-banner ${className}`}>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50 text-center">
            <p className="text-xs text-gray-400">
              📢 Espacio publicitario: <strong>{position}</strong>
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {isPremium ? '✨ Activa y configura tu anuncio premium' : 'Sin anuncios configurados'}
            </p>
          </div>
        </div>
      );
    }
    return null;
  }

  // Renderizar anuncios según el tipo de usuario
  return (
    <div className={`promotional-banner-stack space-y-4 ${className}`}>
      {/* ⭐ Anuncios personalizados del usuario premium */}
      
      {/* Para barras laterales (múltiples anuncios) */}
      {isSidebarPosition && hasCustomBanner && customBanners.map((banner, index) => (
        <div key={index} className="promotional-banner-item">
          {banner.link ? (
            <a
              href={banner.link}
              target="_blank"
              rel="noopener noreferrer"
              className="block relative group overflow-hidden rounded-lg transition-all hover:scale-[1.02]"
            >
              <img
                src={banner.imageUrl}
                alt={`Banner premium ${index + 1}`}
                className={`${getDimensions()} object-cover shadow-md group-hover:shadow-xl transition-shadow w-full`}
              />
              <div className="absolute top-2 right-2 bg-purple-600/90 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-md font-semibold">
                ⭐ Premium #{index + 1}
              </div>
            </a>
          ) : (
            <div className="relative overflow-hidden rounded-lg">
              <img
                src={banner.imageUrl}
                alt={`Banner premium ${index + 1}`}
                className={`${getDimensions()} object-cover shadow-md w-full`}
              />
              <div className="absolute top-2 right-2 bg-purple-600/90 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-md font-semibold">
                ⭐ Premium #{index + 1}
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Para posiciones simples (top, betweenSections, footer) */}
      {!isSidebarPosition && hasCustomBanner && (
        <div className="promotional-banner-item">
          {customBanner.link ? (
            <a
              href={customBanner.link}
              target="_blank"
              rel="noopener noreferrer"
              className="block relative group overflow-hidden rounded-lg transition-all hover:scale-[1.02]"
            >
              <img
                src={customBanner.imageUrl}
                alt="Banner promocional personalizado"
                className={`${getDimensions()} object-cover shadow-md group-hover:shadow-xl transition-shadow w-full`}
              />
              <div className="absolute top-2 right-2 bg-purple-600/90 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-md font-semibold">
                ⭐ Premium
              </div>
            </a>
          ) : (
            <div className="relative overflow-hidden rounded-lg">
              <img
                src={customBanner.imageUrl}
                alt="Banner promocional personalizado"
                className={`${getDimensions()} object-cover shadow-md w-full`}
              />
              <div className="absolute top-2 right-2 bg-purple-600/90 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-md font-semibold">
                ⭐ Premium
              </div>
            </div>
          )}
        </div>
      )}

      {/* 📢 Anuncios del admin (solo para usuarios FREE) */}
      {shouldShowAdminAds && adminAdsToShow.map((ad, index) => (
        <div key={ad._id || index} className="promotional-banner-item">
          {ad.link ? (
            <a
              href={ad.link}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => handleClick(ad._id)}
              className="block relative group overflow-hidden rounded-lg transition-all hover:scale-[1.02]"
            >
              <img
                src={ad.imageUrl}
                alt={ad.name}
                className={`${getDimensions()} object-cover shadow-md group-hover:shadow-xl transition-shadow w-full`}
              />
              <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-md">
                Publicidad
              </div>
            </a>
          ) : (
            <div className="relative overflow-hidden rounded-lg">
              <img
                src={ad.imageUrl}
                alt={ad.name}
                className={`${getDimensions()} object-cover shadow-md w-full`}
              />
              <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-md">
                Publicidad
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
