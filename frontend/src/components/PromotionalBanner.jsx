import { useState, useEffect } from 'react';
import { getActiveAdsByPosition, trackAdClick } from '../api/sponsors';

export default function PromotionalBanner({ position, store, className = '', layout = 'stack' }) {
  const [ads, setAds] = useState([]);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);

  const isPremium = store?.plan === 'pro' || store?.plan === 'premium';
  const customBanner = store?.promotionalSpaces?.[position];
  const hasCustomBanner = isPremium && customBanner?.enabled && customBanner?.imageUrl;
  
  // layout puede ser: 'carousel' (rotación automática) o 'stack' (apilados verticalmente)

  useEffect(() => {
    // Si no tiene plan premium o no tiene banner personalizado, cargar ads de auspiciadores
    if (!hasCustomBanner) {
      loadSponsorAds();
    }
  }, [position, hasCustomBanner]);

  const loadSponsorAds = async () => {
    try {
      const res = await getActiveAdsByPosition(position);
      setAds(res.data.ads || []);
    } catch (error) {
      console.error('❌ Error cargando anuncios:', error);
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

  // Si tiene banner personalizado, mostrarlo
  if (hasCustomBanner) {
    const banner = customBanner;
    
    // Dimensiones según posición
    const getDimensions = () => {
      switch(position) {
        case 'top':
          return 'w-full max-h-32 md:max-h-40'; // Banner horizontal superior
        case 'sidebarLeft':
        case 'sidebarRight':
          return 'w-full max-h-96 aspect-[3/4]'; // Banners verticales laterales
        case 'betweenSections':
          return 'w-full max-h-48'; // Banner horizontal entre secciones
        case 'footer':
          return 'w-full max-h-24'; // Banner footer más pequeño
        default:
          return 'w-full max-h-40';
      }
    };

    return (
      <div className={`promotional-banner ${className}`}>
        {banner.link ? (
          <a
            href={banner.link}
            target="_blank"
            rel="noopener noreferrer"
            className="block overflow-hidden rounded-lg"
          >
            <img
              src={banner.imageUrl}
              alt="Banner promocional"
              className={`${getDimensions()} object-cover shadow-sm hover:shadow-md transition-shadow`}
            />
          </a>
        ) : (
          <div className="overflow-hidden rounded-lg">
            <img
              src={banner.imageUrl}
              alt="Banner promocional"
              className={`${getDimensions()} object-cover shadow-sm`}
            />
          </div>
        )}
      </div>
    );
  }

  // Si no hay banners de auspiciadores, mostrar placeholder en desarrollo
  if (ads.length === 0) {
    // Mostrar placeholder solo en modo desarrollo
    const isDev = import.meta.env.DEV;
    if (isDev) {
      return (
        <div className={`promotional-banner ${className}`}>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50 text-center">
            <p className="text-xs text-gray-400">
              📢 Espacio publicitario: <strong>{position}</strong>
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {isPremium ? 'Configura tu anuncio en "Gestionar Anuncios"' : 'Plan Free - Esperando anuncios de Vitrinex'}
            </p>
          </div>
        </div>
      );
    }
    return null;
  }

  // Dimensiones según posición para anuncios de Vitrinex
  const getAdDimensions = () => {
    switch(position) {
      case 'top':
        return 'w-full max-h-32 md:max-h-40'; // Banner horizontal superior
      case 'sidebarLeft':
      case 'sidebarRight':
        return 'w-full aspect-[3/4] max-h-[400px]'; // Banners verticales laterales
      case 'betweenSections':
        return 'w-full max-h-48'; // Banner horizontal entre secciones
      case 'footer':
        return 'w-full max-h-24'; // Banner footer más pequeño
      default:
        return 'w-full max-h-40';
    }
  };

  // Si layout es 'stack', mostrar todos los anuncios apilados
  if (layout === 'stack' && ads.length > 0) {
    return (
      <div className={`promotional-banner-stack space-y-4 ${className}`}>
        {ads.map((ad, index) => (
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
                  className={`${getAdDimensions()} object-cover shadow-md group-hover:shadow-xl transition-shadow w-full`}
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
                  className={`${getAdDimensions()} object-cover shadow-md w-full`}
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

  // Layout 'carousel' (comportamiento por defecto con rotación)
  const currentAd = ads[currentAdIndex];

  return (
    <div className={`promotional-banner ${className}`}>
      {currentAd.link ? (
        <a
          href={currentAd.link}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => handleClick(currentAd._id)}
          className="block relative group overflow-hidden rounded-lg"
        >
          <img
            src={currentAd.imageUrl}
            alt={currentAd.name}
            className={`${getAdDimensions()} object-cover shadow-sm group-hover:shadow-md transition-shadow`}
          />
          <div className="absolute bottom-2 right-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
            Publicidad
          </div>
        </a>
      ) : (
        <div className="relative overflow-hidden rounded-lg">
          <img
            src={currentAd.imageUrl}
            alt={currentAd.name}
            className={`${getAdDimensions()} object-cover shadow-sm`}
          />
          <div className="absolute bottom-2 right-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
            Publicidad
          </div>
        </div>
      )}

      {ads.length > 1 && (
        <div className="flex justify-center gap-1 mt-2">
          {ads.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentAdIndex(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentAdIndex ? 'bg-purple-600' : 'bg-slate-300'
              }`}
              aria-label={`Ver anuncio ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
