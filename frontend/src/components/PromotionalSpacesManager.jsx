// src/components/PromotionalSpacesManager.jsx
import { useState, useEffect } from "react";
import { getStoreById, updateMyStore } from "../api/store";
import api from "../api/axios";

export default function PromotionalSpacesManager({ storeId, storePlan }) {
  const [spaces, setSpaces] = useState({
    top: { enabled: false, imageUrl: "", link: "" },
    sidebarLeft: [], // Array de hasta 7 anuncios
    sidebarRight: [], // Array de hasta 7 anuncios
    betweenSections: { enabled: false, imageUrl: "", link: "" },
    footer: { enabled: false, imageUrl: "", link: "" },
  });
  
  const [uploading, setUploading] = useState({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const isPro = storePlan?.toLowerCase() === 'pro' || storePlan?.toLowerCase() === 'premium';

  useEffect(() => {
    console.log('📢 PromotionalSpacesManager - Plan recibido:', storePlan);
    console.log('📢 PromotionalSpacesManager - isPro:', isPro);
    loadStoreSpaces();
  }, [storeId, storePlan]);

  const loadStoreSpaces = async () => {
    try {
      const { data } = await getStoreById(storeId);
      if (data.promotionalSpaces) {
        // Asegurar que las barras laterales sean arrays
        const loadedSpaces = {
          ...data.promotionalSpaces,
          sidebarLeft: Array.isArray(data.promotionalSpaces.sidebarLeft) 
            ? data.promotionalSpaces.sidebarLeft 
            : [],
          sidebarRight: Array.isArray(data.promotionalSpaces.sidebarRight) 
            ? data.promotionalSpaces.sidebarRight 
            : []
        };
        setSpaces(loadedSpaces);
      }
    } catch (error) {
      console.error("Error cargando espacios:", error);
    }
  };

  const handleToggle = (position) => {
    if (!isPro) {
      alert("🔒 Necesitas un plan Pro o Premium para personalizar tus anuncios");
      return;
    }
    
    // Para barras laterales, agregar/limpiar array
    if (position === 'sidebarLeft' || position === 'sidebarRight') {
      const currentArray = spaces[position];
      if (currentArray.length === 0) {
        // Agregar primer anuncio
        setSpaces(prev => ({
          ...prev,
          [position]: [{ enabled: true, imageUrl: '', link: '' }]
        }));
      } else {
        // Limpiar todos
        setSpaces(prev => ({
          ...prev,
          [position]: []
        }));
      }
    } else {
      // Para posiciones simples, toggle enabled
      setSpaces(prev => ({
        ...prev,
        [position]: {
          ...prev[position],
          enabled: !prev[position].enabled
        }
      }));
    }
  };

  const handleAddSidebarAd = (position) => {
    if (!isPro) return;
    
    const currentAds = spaces[position];
    if (currentAds.length >= 7) {
      alert('⚠️ Máximo 7 anuncios por barra lateral');
      return;
    }
    
    setSpaces(prev => ({
      ...prev,
      [position]: [...prev[position], { enabled: true, imageUrl: '', link: '' }]
    }));
  };

  const handleRemoveSidebarAd = (position, index) => {
    setSpaces(prev => ({
      ...prev,
      [position]: prev[position].filter((_, i) => i !== index)
    }));
  };

  const handleImageUpload = async (position, file, index = null) => {
    if (!isPro) {
      alert("🔒 Necesitas un plan Pro o Premium para subir tus propios anuncios");
      return;
    }

    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const uploadKey = index !== null ? `${position}-${index}` : position;
      setUploading(prev => ({ ...prev, [uploadKey]: true }));
      
      const { data } = await api.post(
        "/upload/sponsor-ad",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" }
        }
      );

      if (data.imageUrl) {
        // Para barras laterales con índice
        if (index !== null && (position === 'sidebarLeft' || position === 'sidebarRight')) {
          setSpaces(prev => ({
            ...prev,
            [position]: prev[position].map((ad, i) => 
              i === index ? { ...ad, imageUrl: data.imageUrl } : ad
            )
          }));
        } else {
          // Para posiciones simples
          setSpaces(prev => ({
            ...prev,
            [position]: {
              ...prev[position],
              imageUrl: data.imageUrl
            }
          }));
        }
        setMessage("✅ Imagen subida correctamente");
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (error) {
      console.error("Error subiendo imagen:", error);
      const errorMsg = error.response?.data?.message || "Error al subir la imagen";
      alert(`❌ ${errorMsg}`);
    } finally {
      const uploadKey = index !== null ? `${position}-${index}` : position;
      setUploading(prev => ({ ...prev, [uploadKey]: false }));
    }
  };

  const handleLinkChange = (position, link, index = null) => {
    if (!isPro) return;
    
    // Para barras laterales con índice
    if (index !== null && (position === 'sidebarLeft' || position === 'sidebarRight')) {
      setSpaces(prev => ({
        ...prev,
        [position]: prev[position].map((ad, i) => 
          i === index ? { ...ad, link } : ad
        )
      }));
    } else {
      // Para posiciones simples
      setSpaces(prev => ({
        ...prev,
        [position]: {
          ...prev[position],
          link: link
        }
      }));
    }
  };

  const handleSave = async () => {
    console.log('💾 Intentando guardar espacios promocionales:');
    console.log('  Store ID:', storeId);
    console.log('  Store Plan:', storePlan);
    console.log('  Es Pro?:', isPro);
    console.log('  Espacios a guardar:', JSON.stringify(spaces, null, 2));
    
    try {
      setSaving(true);
      const response = await updateMyStore(storeId, {
        promotionalSpaces: spaces
      });
      console.log('✅ Respuesta del servidor:', response.data);
      setMessage("✅ Espacios publicitarios guardados correctamente");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("❌ Error guardando espacios:", error);
      console.error('  Response:', error.response?.data);
      console.error('  Status:', error.response?.status);
      const errorMsg = error.response?.data?.message || error.message || 'Error desconocido';
      setMessage(`❌ Error: ${errorMsg}`);
      setTimeout(() => setMessage(""), 5000);
    } finally {
      setSaving(false);
    }
  };

  const positionLabels = {
    top: "Banner Superior",
    sidebarLeft: "Barra Lateral Izquierda",
    sidebarRight: "Barra Lateral Derecha",
    betweenSections: "Entre Secciones",
    footer: "Banner Inferior (Footer)"
  };

  const positionIcons = {
    top: "⬆️",
    sidebarLeft: "⬅️",
    sidebarRight: "➡️",
    betweenSections: "↕️",
    footer: "⬇️"
  };

  // Dimensiones recomendadas para cada posición
  const recommendedSizes = {
    top: "1200x200px (horizontal)",
    sidebarLeft: "300x400px (vertical)",
    sidebarRight: "300x400px (vertical)",
    betweenSections: "1000x300px (horizontal)",
    footer: "1200x150px (horizontal)"
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 border border-purple-200">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              📢 Gestión de Espacios Publicitarios
            </h2>
            <p className="text-sm text-gray-600 mt-2">
              {isPro 
                ? "Personaliza los anuncios que aparecen en tu tienda pública" 
                : "Espacios publicitarios disponibles para personalizar"}
            </p>
          </div>
          {!isPro && (
            <div className="bg-white px-4 py-2 rounded-lg border border-purple-300 text-center">
              <p className="text-xs text-gray-600">Plan actual</p>
              <p className="font-bold text-purple-600 uppercase">{storePlan || 'FREE'}</p>
              <button 
                className="mt-2 text-xs text-blue-600 hover:underline"
                onClick={() => alert("Contacta con Vitrinex para actualizar tu plan")}
              >
                Actualizar a Pro
              </button>
            </div>
          )}
        </div>

        {!isPro && (
          <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm text-yellow-800">
              🔒 <strong>Mejora a Pro o Premium</strong> para activar tus propios anuncios y monetizar tu espacio publicitario
            </p>
          </div>
        )}
      </div>

      {message && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-800">
          {message}
        </div>
      )}

      {/* Espacios Publicitarios */}
      <div className="space-y-4">
        {Object.keys(spaces).map((position) => {
          const isSidebarPosition = position === 'sidebarLeft' || position === 'sidebarRight';
          
          // Para barras laterales (arrays)
          if (isSidebarPosition) {
            const ads = spaces[position];
            const hasAds = Array.isArray(ads) && ads.length > 0;
            
            return (
              <div 
                key={position}
                className="bg-white rounded-lg border-2 border-gray-200 p-5"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                      {positionIcons[position]} {positionLabels[position]}
                    </h3>
                    <p className="text-xs text-blue-600 mt-1">
                      📐 {recommendedSizes[position]} | Máximo: 7 anuncios
                    </p>
                  </div>
                  {isPro && ads.length < 7 && (
                    <button
                      onClick={() => handleAddSidebarAd(position)}
                      className="px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      ➕ Agregar Anuncio ({ads.length}/7)
                    </button>
                  )}
                </div>

                {/* Lista de anuncios */}
                <div className="space-y-4">
                  {!hasAds && (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                      <p className="text-gray-400">Sin anuncios configurados</p>
                      {isPro && (
                        <button
                          onClick={() => handleAddSidebarAd(position)}
                          className="mt-3 px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700"
                        >
                          Agregar Primer Anuncio
                        </button>
                      )}
                    </div>
                  )}

                  {hasAds && ads.map((ad, index) => (
                    <div key={index} className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-semibold text-purple-900">
                          Anuncio #{index + 1}
                        </span>
                        <button
                          onClick={() => handleRemoveSidebarAd(position, index)}
                          className="text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                          🗑️ Eliminar
                        </button>
                      </div>

                      {/* Preview */}
                      {ad.imageUrl && (
                        <div className="mb-3 relative">
                          <img 
                            src={ad.imageUrl} 
                            alt={`Anuncio ${index + 1}`}
                            className="w-full max-h-32 object-contain bg-white rounded border"
                          />
                        </div>
                      )}

                      {/* Upload */}
                      <div className="mb-3">
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Imagen del anuncio
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(position, e.target.files[0], index)}
                          disabled={uploading[`${position}-${index}`]}
                          className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-white"
                        />
                        {uploading[`${position}-${index}`] && (
                          <p className="text-xs text-blue-600 mt-1">Subiendo...</p>
                        )}
                      </div>

                      {/* Link */}
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Enlace (opcional)
                        </label>
                        <input
                          type="url"
                          placeholder="https://tu-sitio.com"
                          value={ad.link || ''}
                          onChange={(e) => handleLinkChange(position, e.target.value, index)}
                          className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          }
          
          // Para posiciones simples (top, betweenSections, footer)
          const space = spaces[position];
          const isCustom = space?.enabled && isPro;
          
          return (
            <div 
              key={position}
              className={`bg-white rounded-lg border-2 ${isCustom ? 'border-purple-300' : 'border-gray-200'} p-5 transition-all`}
            >
              <div className="flex items-start gap-4">
                {/* Icon & Info */}
                <div className="flex-shrink-0 text-4xl">
                  {positionIcons[position]}
                </div>

                <div className="flex-1">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{positionLabels[position]}</h3>
                      <p className="text-xs text-gray-500">
                        {isCustom 
                          ? "✨ Mostrando tu anuncio personalizado" 
                          : "📢 Espacio disponible para tu anuncio"}
                      </p>
                      <p className="text-xs text-blue-600 mt-1">
                        📐 Recomendado: {recommendedSizes[position]}
                      </p>
                    </div>

                    {isPro && (
                      <label className="flex items-center gap-2 cursor-pointer">
                        <span className="text-sm text-gray-700">Personalizar</span>
                        <input
                          type="checkbox"
                          checked={space?.enabled || false}
                          onChange={() => handleToggle(position)}
                          className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                        />
                      </label>
                    )}
                  </div>

                  {/* Preview */}
                  <div className="mb-3">
                    {isCustom ? (
                      space.imageUrl ? (
                        <div className="relative">
                          <img 
                            src={space.imageUrl} 
                            alt={positionLabels[position]}
                            className="w-full max-h-32 object-contain bg-gray-50 rounded border"
                          />
                        </div>
                      ) : (
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                          <p className="text-gray-400">Sin imagen</p>
                        </div>
                      )
                    ) : (
                      <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center">
                        <p className="text-xs text-gray-400">Activa "Personalizar" para configurar tu anuncio</p>
                      </div>
                    )}
                  </div>

                  {/* Controls */}
                  {isCustom && (
                    <div className="space-y-3 bg-purple-50 rounded-lg p-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Imagen del anuncio
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(position, e.target.files[0])}
                          disabled={uploading[position]}
                          className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-white"
                        />
                        {uploading[position] && (
                          <p className="text-xs text-blue-600 mt-1">Subiendo...</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Enlace (opcional)
                        </label>
                        <input
                          type="url"
                          placeholder="https://tu-sitio.com"
                          value={space.link || ''}
                          onChange={(e) => handleLinkChange(position, e.target.value)}
                          className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Save Button */}
      {isPro && (
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
          >
            {saving ? "Guardando..." : "💾 Guardar Configuración"}
          </button>
        </div>
      )}
    </div>
  );
}
