// src/components/PromotionalSpacesManager.jsx
import { useState, useEffect } from "react";
import { getStoreById, updateMyStore } from "../api/store";
import { getAllSponsorAds } from "../api/sponsors";
import axios from "axios";

export default function PromotionalSpacesManager({ storeId, storePlan }) {
  const [spaces, setSpaces] = useState({
    top: { enabled: false, imageUrl: "", link: "" },
    sidebarLeft: { enabled: false, imageUrl: "", link: "" },
    sidebarRight: { enabled: false, imageUrl: "", link: "" },
    betweenSections: { enabled: false, imageUrl: "", link: "" },
    footer: { enabled: false, imageUrl: "", link: "" },
  });
  
  const [defaultAds, setDefaultAds] = useState([]);
  const [uploading, setUploading] = useState({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const isPro = storePlan === 'pro' || storePlan === 'premium';

  useEffect(() => {
    loadStoreSpaces();
    loadDefaultAds();
  }, [storeId]);

  const loadStoreSpaces = async () => {
    try {
      const { data } = await getStoreById(storeId);
      if (data.promotionalSpaces) {
        setSpaces(data.promotionalSpaces);
      }
    } catch (error) {
      console.error("Error cargando espacios:", error);
    }
  };

  const loadDefaultAds = async () => {
    try {
      const { data } = await getAllSponsorAds();
      setDefaultAds(data || []);
    } catch (error) {
      console.error("Error cargando anuncios por defecto:", error);
    }
  };

  const handleToggle = (position) => {
    if (!isPro) {
      alert("🔒 Necesitas un plan Pro o Premium para personalizar tus anuncios");
      return;
    }
    
    setSpaces(prev => ({
      ...prev,
      [position]: {
        ...prev[position],
        enabled: !prev[position].enabled
      }
    }));
  };

  const handleImageUpload = async (position, file) => {
    if (!isPro) {
      alert("🔒 Necesitas un plan Pro o Premium para subir tus propios anuncios");
      return;
    }

    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("storeId", storeId);

    try {
      setUploading(prev => ({ ...prev, [position]: true }));
      
      const { data } = await axios.post(
        "http://localhost:3000/api/upload/sponsor-ad",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        }
      );

      if (data.imageUrl) {
        setSpaces(prev => ({
          ...prev,
          [position]: {
            ...prev[position],
            imageUrl: data.imageUrl
          }
        }));
      }
    } catch (error) {
      console.error("Error subiendo imagen:", error);
      alert("Error al subir la imagen");
    } finally {
      setUploading(prev => ({ ...prev, [position]: false }));
    }
  };

  const handleLinkChange = (position, link) => {
    if (!isPro) return;
    
    setSpaces(prev => ({
      ...prev,
      [position]: {
        ...prev[position],
        link: link
      }
    }));
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

  const getDefaultAdForPosition = (position) => {
    return defaultAds.find(ad => ad.position === position && ad.active);
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
                : "Los espacios publicitarios muestran anuncios de Vitrinex"}
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
              🔒 <strong>Mejora a Pro o Premium</strong> para reemplazar estos anuncios con los tuyos propios y monetizar tu espacio
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
          const space = spaces[position];
          const defaultAd = getDefaultAdForPosition(position);
          const isCustom = space.enabled && isPro;
          
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
                          : defaultAd 
                            ? `Mostrando: ${defaultAd.name}` 
                            : "Sin anuncio configurado"}
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
                          checked={space.enabled}
                          onChange={() => handleToggle(position)}
                          className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                        />
                      </label>
                    )}
                  </div>

                  {/* Preview */}
                  <div className="mb-3">
                    {isCustom ? (
                      // Custom ad
                      space.imageUrl ? (
                        <div className="relative">
                          <img 
                            src={space.imageUrl} 
                            alt={positionLabels[position]}
                            className="w-full max-h-32 object-contain bg-gray-50 rounded border"
                          />
                          {space.link && (
                            <a 
                              href={space.link} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="absolute bottom-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded"
                            >
                              🔗 Ver enlace
                            </a>
                          )}
                        </div>
                      ) : (
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                          <p className="text-gray-400">Sin imagen</p>
                        </div>
                      )
                    ) : defaultAd && defaultAd.imageUrl ? (
                      // Default Vitrinex ad
                      <div className="relative opacity-75">
                        <img 
                          src={defaultAd.imageUrl} 
                          alt={defaultAd.name}
                          className="w-full max-h-32 object-contain bg-gray-50 rounded border"
                        />
                        <div className="absolute top-2 left-2 bg-gray-900 bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                          📢 Anuncio de Vitrinex
                        </div>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center">
                        <p className="text-xs text-gray-400">No hay anuncio configurado para esta posición</p>
                      </div>
                    )}
                  </div>

                  {/* Controls (only for Pro users with enabled custom ads) */}
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
                          className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-white focus:outline-none"
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
                          value={space.link}
                          onChange={(e) => handleLinkChange(position, e.target.value)}
                          className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
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
