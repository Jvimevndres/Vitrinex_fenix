import { useState, useEffect } from 'react';
import { getActiveAdsByPosition, trackAdClick } from '../api/sponsors';

export default function PromotionalBanner({ position, store, className = '' }) {
  const [ads, setAds] = useState([]);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);

  const isPremium = store?.plan === 'pro' || store?.plan === 'premium';
  const customBanner = store?.promotionalSpaces?.[position];
  const hasCustomBanner = isPremium && customBanner?.enabled && customBanner?.imageUrl;

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
      console.error('Error cargando anuncios:', error);
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
    return (
      <div className={`promotional-banner ${className}`}>
        {banner.link ? (
          <a
            href={banner.link}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <img
              src={banner.imageUrl}
              alt="Banner promocional"
              className="w-full h-auto object-cover rounded-lg shadow-sm hover:shadow-md transition-shadow"
            />
          </a>
        ) : (
          <img
            src={banner.imageUrl}
            alt="Banner promocional"
            className="w-full h-auto object-cover rounded-lg shadow-sm"
          />
        )}
      </div>
    );
  }

  // Si no hay banners de auspiciadores, no mostrar nada
  if (ads.length === 0) return null;

  const currentAd = ads[currentAdIndex];

  return (
    <div className={`promotional-banner ${className}`}>
      {currentAd.link ? (
        <a
          href={currentAd.link}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => handleClick(currentAd._id)}
          className="block relative group"
        >
          <img
            src={currentAd.imageUrl}
            alt={currentAd.name}
            className="w-full h-auto object-cover rounded-lg shadow-sm group-hover:shadow-md transition-shadow"
          />
          <div className="absolute bottom-2 right-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
            Publicidad
          </div>
        </a>
      ) : (
        <div className="relative">
          <img
            src={currentAd.imageUrl}
            alt={currentAd.name}
            className="w-full h-auto object-cover rounded-lg shadow-sm"
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
