// frontend/src/components/StoreVisualBuilder.jsx
import { useState, useEffect } from 'react';
import {
  getStoreAppearance,
  updateStoreAppearance,
  applyTheme,
  resetAppearance,
  getAvailableThemes,
} from '../api/appearance';
import { getStoreById, updateMyStore } from '../api/store';

/**
 * CONSTRUCTOR VISUAL DE TIENDAS
 * Sistema de personalización tipo Canva/Wix
 */
export default function StoreVisualBuilder({ storeId, onClose }) {
  const [appearance, setAppearance] = useState(null);
  const [themes, setThemes] = useState([]);
  const [storeData, setStoreData] = useState(null); // 🆕 Datos de la tienda
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('info'); // info, theme, colors, typography, background, layout, components, sections
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    loadData();
  }, [storeId]);

  const loadData = async () => {
    try {
      setLoading(true);
      // Importar dinámicamente getStoreById
      const { getStoreById } = await import('../api/store');
      
      const [appearanceData, themesData, store] = await Promise.all([
        getStoreAppearance(storeId),
        getAvailableThemes(),
        getStoreById(storeId),
      ]);
      setAppearance(appearanceData);
      setThemes(themesData);
      setStoreData(store.data);
      console.log('📊 Datos cargados - Modo tienda:', store.data.mode);
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = (field, value) => {
    setAppearance((prev) => ({
      ...prev,
      [field]: typeof value === 'object' ? { ...prev[field], ...value } : value,
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Guardar datos básicos de la tienda
      if (storeData) {
        console.log('💾 Guardando datos de la tienda:', storeData);
        const { name, description, logoUrl, coverImageUrl, comuna, tipoNegocio, direccion, email, phone, whatsapp, website, scheduleText } = storeData;
        await updateMyStore(storeId, {
          name,
          description,
          logoUrl,
          coverImageUrl,
          comuna,
          tipoNegocio,
          direccion,
          email,
          phone,
          whatsapp,
          website,
          scheduleText,
        });
        console.log('✅ Datos de tienda guardados');
      }
      
      // Guardar apariencia
      console.log('💾 Guardando apariencia:', appearance);
      const updated = await updateStoreAppearance(storeId, appearance);
      console.log('✅ Apariencia guardada:', updated);
      setAppearance(updated);
      setHasChanges(false);
      alert('✅ Cambios guardados correctamente');
      // No cerrar automáticamente para seguir editando
    } catch (error) {
      console.error('❌ Error guardando:', error);
      alert('❌ Error al guardar los cambios: ' + (error.response?.data?.message || error.message));
    } finally {
      setSaving(false);
    }
  };

  const handleApplyTheme = async (themeName) => {
    if (!confirm(`¿Aplicar tema "${themeName}"? Esto sobrescribirá tu configuración actual.`)) {
      return;
    }

    try {
      setSaving(true);
      const updated = await applyTheme(storeId, themeName);
      setAppearance(updated);
      setHasChanges(false);
      alert(`✅ Tema "${themeName}" aplicado`);
    } catch (error) {
      console.error('Error aplicando tema:', error);
      alert('❌ Error al aplicar el tema');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!confirm('¿Resetear toda la configuración? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      setSaving(true);
      const updated = await resetAppearance(storeId);
      setAppearance(updated);
      setHasChanges(false);
      alert('✅ Configuración reseteada');
    } catch (error) {
      console.error('Error reseteando:', error);
      alert('❌ Error al resetear');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-8">
          <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-4 text-slate-700">Cargando editor...</p>
        </div>
      </div>
    );
  }

  // 🆕 Definir el modo de la tienda
  const storeMode = storeData?.mode || 'products';

  return (
    <div className="fixed inset-0 z-50 bg-slate-900 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="text-slate-600 hover:text-slate-900 text-2xl"
          >
            ←
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900">🎨 Constructor Visual</h1>
            <p className="text-sm text-slate-600">
              Personalizando: <span className="font-semibold">{storeData?.name || 'Mi Tienda'}</span>
              {' • '}
              <span className={`px-2 py-0.5 rounded text-xs ${
                storeMode === 'bookings' 
                  ? 'bg-purple-100 text-purple-700' 
                  : 'bg-blue-100 text-blue-700'
              }`}>
                {storeMode === 'bookings' ? '📅 Agendamiento' : '🛍️ Productos'}
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {hasChanges && (
            <span className="text-sm text-amber-600 font-medium flex items-center gap-2">
              <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
              Cambios sin guardar
            </span>
          )}
          <button
            onClick={handleReset}
            disabled={saving}
            className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50"
          >
            🔄 Resetear
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !hasChanges}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-sm"
          >
            {saving ? '⏳ Guardando...' : '💾 Guardar Cambios'}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Panel de Control */}
        <aside className="w-80 bg-white border-r border-slate-200 overflow-y-auto">
          {/* Tabs */}
          <div className="border-b border-slate-200">
            <nav className="flex flex-wrap p-2 gap-1">
              {[
                { id: 'info', icon: '📝', label: 'Información' },
                { id: 'theme', icon: '🎨', label: 'Temas' },
                { id: 'colors', icon: '🌈', label: 'Colores' },
                { id: 'typography', icon: '✍️', label: 'Tipografía' },
                { id: 'background', icon: '🖼️', label: 'Fondo' },
                { id: 'layout', icon: '📐', label: 'Layout' },
                { id: 'components', icon: '🧩', label: 'Componentes' },
                { id: 'sections', icon: '📋', label: 'Secciones' },
                { id: 'promo', icon: '📢', label: 'Promocionales' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span className="mr-1">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-4 space-y-4">
            {activeTab === 'info' && (
              <InfoTab
                storeData={storeData}
                onChange={(updates) => {
                  setStoreData({ ...storeData, ...updates });
                  setHasChanges(true);
                }}
              />
            )}

            {activeTab === 'theme' && (
              <ThemeTab
                themes={themes}
                currentTheme={appearance.theme}
                onApplyTheme={handleApplyTheme}
              />
            )}

            {activeTab === 'colors' && (
              <ColorsTab
                colors={appearance.colors}
                onChange={(colors) => handleUpdate('colors', colors)}
              />
            )}

            {activeTab === 'typography' && (
              <TypographyTab
                typography={appearance.typography}
                onChange={(typography) => handleUpdate('typography', typography)}
              />
            )}

            {activeTab === 'background' && (
              <BackgroundTab
                background={appearance.background}
                onChange={(background) => handleUpdate('background', background)}
              />
            )}

            {activeTab === 'layout' && (
              <LayoutTab
                layout={appearance.layout}
                onChange={(layout) => handleUpdate('layout', layout)}
              />
            )}

            {activeTab === 'components' && (
              <ComponentsTab
                components={appearance.components}
                onChange={(components) => handleUpdate('components', components)}
              />
            )}

            {activeTab === 'sections' && (
              <SectionsTab
                sections={appearance.sections}
                onChange={(sections) => handleUpdate('sections', sections)}
              />
            )}

            {activeTab === 'promo' && (
              <PromotionalSpacesTab
                storeData={storeData}
                onChange={(updates) => {
                  setStoreData({ ...storeData, ...updates });
                  setHasChanges(true);
                }}
              />
            )}
          </div>
        </aside>

        {/* Preview Area */}
        <main className="flex-1 bg-slate-100 overflow-auto p-8">
          <div className="max-w-6xl mx-auto">
            <div className="bg-white rounded-lg shadow-xl overflow-hidden">
              <StorePreview appearance={appearance} storeData={storeData} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

// ==================== TAB COMPONENTS ====================

function InfoTab({ storeData, onChange }) {
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  
  if (!storeData) return <div className="text-slate-500">Cargando datos...</div>;

  return (
    <div className="space-y-6">
      <h3 className="font-semibold text-slate-900">Información de la Tienda</h3>
      <p className="text-xs text-slate-600">
        Datos básicos que verán tus clientes
      </p>

      {/* Nombre */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700">
          Nombre de la Tienda *
        </label>
        <input
          type="text"
          value={storeData.name || ''}
          onChange={(e) => onChange({ name: e.target.value })}
          placeholder="Mi Negocio"
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Descripción */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700">
          Descripción / Eslogan
        </label>
        <textarea
          value={storeData.description || ''}
          onChange={(e) => onChange({ description: e.target.value })}
          placeholder="Breve descripción de tu negocio..."
          rows={3}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Logo Upload */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700">
          Logo de la Tienda
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files[0];
            if (!file) return;
            setUploadingLogo(true);
            const reader = new FileReader();
            reader.onloadend = () => {
              onChange({ logoUrl: reader.result });
              setUploadingLogo(false);
            };
            reader.readAsDataURL(file);
          }}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          disabled={uploadingLogo}
        />
        {uploadingLogo && <p className="text-xs text-blue-600">Subiendo logo...</p>}
        {storeData.logoUrl && (
          <div className="relative inline-block">
            <img src={storeData.logoUrl} alt="Logo preview" className="w-20 h-20 object-cover rounded-lg border" />
            <button
              type="button"
              onClick={() => onChange({ logoUrl: '' })}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* Cover Image Upload */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700">
          Imagen de Portada / Hero
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files[0];
            if (!file) return;
            setUploadingCover(true);
            const reader = new FileReader();
            reader.onloadend = () => {
              onChange({ coverImageUrl: reader.result });
              setUploadingCover(false);
            };
            reader.readAsDataURL(file);
          }}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          disabled={uploadingCover}
        />
        {uploadingCover && <p className="text-xs text-blue-600">Subiendo imagen...</p>}
        {storeData.coverImageUrl && (
          <div className="relative inline-block w-full">
            <img src={storeData.coverImageUrl} alt="Cover preview" className="w-full h-32 object-cover rounded-lg border" />
            <button
              type="button"
              onClick={() => onChange({ coverImageUrl: '' })}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* Contacto */}
      <div className="border-t pt-4">
        <h4 className="font-semibold text-slate-900 mb-4">📞 Contacto</h4>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">Email</label>
            <input
              type="email"
              value={storeData.email || ''}
              onChange={(e) => onChange({ email: e.target.value })}
              placeholder="contacto@tienda.com"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">Teléfono</label>
            <input
              type="tel"
              value={storeData.phone || ''}
              onChange={(e) => onChange({ phone: e.target.value })}
              placeholder="+56 9 1234 5678"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">WhatsApp</label>
            <input
              type="tel"
              value={storeData.whatsapp || ''}
              onChange={(e) => onChange({ whatsapp: e.target.value })}
              placeholder="56912345678"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-xs text-slate-500">Formato internacional sin +, ej: 56912345678</p>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">Sitio Web</label>
            <input
              type="url"
              value={storeData.website || ''}
              onChange={(e) => onChange({ website: e.target.value })}
              placeholder="https://www.tienda.com"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Ubicación */}
      <div className="border-t pt-4">
        <h4 className="font-semibold text-slate-900 mb-4">📍 Ubicación</h4>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">Dirección</label>
            <input
              type="text"
              value={storeData.direccion || ''}
              onChange={(e) => onChange({ direccion: e.target.value })}
              placeholder="Calle Principal #123"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">Comuna / Ciudad</label>
            <input
              type="text"
              value={storeData.comuna || ''}
              onChange={(e) => onChange({ comuna: e.target.value })}
              placeholder="Santiago Centro"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">Tipo de Negocio</label>
            <input
              type="text"
              value={storeData.tipoNegocio || ''}
              onChange={(e) => onChange({ tipoNegocio: e.target.value })}
              placeholder="Restaurante, Peluquería, Tienda de Ropa..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Horario */}
      <div className="border-t pt-4">
        <h4 className="font-semibold text-slate-900 mb-4">🕐 Horario</h4>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">
            Horario de Atención (Texto Libre)
          </label>
          <textarea
            value={storeData.scheduleText || ''}
            onChange={(e) => onChange({ scheduleText: e.target.value })}
            placeholder="Lun-Vie: 9:00 - 18:00&#10;Sábados: 10:00 - 14:00"
            rows={3}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <p className="text-xs text-slate-500">
            Para agendamiento, usa el módulo de horarios dedicado
          </p>
        </div>
      </div>
    </div>
  );
}

function ThemeTab({ themes, currentTheme, onApplyTheme }) {
  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-slate-900">Temas Predefinidos</h3>
      <p className="text-xs text-slate-600">
        Aplica un tema completo con un clic. Puedes personalizarlo después.
      </p>

      <div className="space-y-2">
        {themes.map((theme) => (
          <button
            key={theme.id}
            onClick={() => onApplyTheme(theme.id)}
            className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
              currentTheme === theme.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-slate-900">{theme.name}</h4>
              {currentTheme === theme.id && (
                <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded">
                  Activo
                </span>
              )}
            </div>
            <p className="text-xs text-slate-600 mb-3">{theme.description}</p>
            
            {/* Color Preview */}
            <div className="flex gap-2">
              {Object.values(theme.preview).map((color, i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-md border border-slate-300"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function ColorsTab({ colors, onChange }) {
  const colorGroups = [
    {
      title: 'Colores Principales',
      colors: [
        { key: 'primary', label: 'Primario', description: 'Color principal de marca' },
        { key: 'secondary', label: 'Secundario', description: 'Color complementario' },
        { key: 'accent', label: 'Acento', description: 'Para destacar elementos' },
      ],
    },
    {
      title: 'Fondos y Superficies',
      colors: [
        { key: 'background', label: 'Fondo', description: 'Color de fondo general' },
        { key: 'surface', label: 'Superficie', description: 'Tarjetas y paneles' },
        { key: 'border', label: 'Bordes', description: 'Líneas divisorias' },
      ],
    },
    {
      title: 'Textos',
      colors: [
        { key: 'text', label: 'Texto Principal', description: 'Títulos y contenido' },
        { key: 'textSecondary', label: 'Texto Secundario', description: 'Subtítulos y ayuda' },
      ],
    },
    {
      title: 'Estados',
      colors: [
        { key: 'success', label: 'Éxito', description: 'Confirmaciones' },
        { key: 'error', label: 'Error', description: 'Errores y alertas' },
        { key: 'warning', label: 'Advertencia', description: 'Precauciones' },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {colorGroups.map((group) => (
        <div key={group.title} className="space-y-3">
          <h3 className="font-semibold text-slate-900">{group.title}</h3>
          {group.colors.map((color) => (
            <div key={color.key} className="space-y-1">
              <label className="block text-sm font-medium text-slate-700">
                {color.label}
              </label>
              <p className="text-xs text-slate-500">{color.description}</p>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={colors[color.key]}
                  onChange={(e) => onChange({ [color.key]: e.target.value })}
                  className="h-10 w-16 rounded cursor-pointer border border-slate-300"
                />
                <input
                  type="text"
                  value={colors[color.key]}
                  onChange={(e) => onChange({ [color.key]: e.target.value })}
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono"
                  placeholder="#000000"
                />
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function TypographyTab({ typography, onChange }) {
  const fonts = [
    'Inter',
    'Poppins',
    'Roboto',
    'Montserrat',
    'Playfair Display',
    'Lato',
    'Open Sans',
    'Space Grotesk',
  ];

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-slate-900">Tipografía</h3>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700">
          Familia de Fuente
        </label>
        <select
          value={typography.fontFamily}
          onChange={(e) => onChange({ fontFamily: e.target.value })}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg"
          style={{ fontFamily: typography.fontFamily }}
        >
          {fonts.map((font) => (
            <option key={font} value={font} style={{ fontFamily: font }}>
              {font}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700">
          Tamaño de Títulos
        </label>
        <input
          type="text"
          value={typography.headingSize}
          onChange={(e) => onChange({ headingSize: e.target.value })}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
          placeholder="2.5rem"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700">
          Tamaño de Texto
        </label>
        <input
          type="text"
          value={typography.bodySize}
          onChange={(e) => onChange({ bodySize: e.target.value })}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
          placeholder="1rem"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700">
          Altura de Línea
        </label>
        <input
          type="text"
          value={typography.lineHeight}
          onChange={(e) => onChange({ lineHeight: e.target.value })}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
          placeholder="1.6"
        />
      </div>
    </div>
  );
}

function BackgroundTab({ background, onChange }) {
  const [gradientColorIndex, setGradientColorIndex] = useState(0);
  const [uploadingBgImage, setUploadingBgImage] = useState(false);

  return (
    <div className="space-y-6">
      <h3 className="font-semibold text-slate-900">Fondo y Efectos</h3>

      {/* Modo de Fondo */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700">
          Tipo de Fondo
        </label>
        <div className="grid grid-cols-2 gap-2">
          {[
            { value: 'solid', label: 'Sólido', icon: '⬛' },
            { value: 'gradient', label: 'Degradado', icon: '🌈' },
            { value: 'image', label: 'Imagen', icon: '🖼️' },
            { value: 'pattern', label: 'Patrón', icon: '🔳' }
          ].map(mode => (
            <button
              key={mode.value}
              onClick={() => onChange({ mode: mode.value })}
              className={`px-4 py-3 rounded-lg border-2 transition-all ${
                background.mode === mode.value
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-slate-300 hover:border-slate-400'
              }`}
            >
              <span className="text-xl">{mode.icon}</span>
              <div className="text-sm font-medium mt-1">{mode.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Solid Color */}
      {background.mode === 'solid' && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">
            Color de Fondo
          </label>
          <input
            type="color"
            value={background.solid?.color || '#ffffff'}
            onChange={(e) => onChange({ solid: { color: e.target.value } })}
            className="w-full h-12 rounded-lg border border-slate-300"
          />
        </div>
      )}

      {/* Gradient */}
      {background.mode === 'gradient' && (
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">Tipo de Degradado</label>
            <select
              value={background.gradient?.type || 'linear'}
              onChange={(e) => onChange({ 
                gradient: { ...background.gradient, type: e.target.value }
              })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
            >
              <option value="linear">Lineal</option>
              <option value="radial">Radial</option>
              <option value="conic">Cónico</option>
            </select>
          </div>

          {background.gradient?.type === 'linear' && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">Dirección</label>
              <select
                value={background.gradient?.direction || 'to bottom'}
                onChange={(e) => onChange({ 
                  gradient: { ...background.gradient, direction: e.target.value }
                })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              >
                <option value="to bottom">↓ Arriba a Abajo</option>
                <option value="to top">↑ Abajo a Arriba</option>
                <option value="to right">→ Izquierda a Derecha</option>
                <option value="to left">← Derecha a Izquierda</option>
                <option value="to bottom right">↘ Diagonal</option>
              </select>
            </div>
          )}

          <div className="space-y-3">
            <label className="block text-sm font-medium text-slate-700">
              Colores del Degradado
            </label>
            {(background.gradient?.colors || ['#667eea', '#764ba2']).map((color, index) => (
              <div key={index} className="flex items-center gap-3">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => {
                    const newColors = [...(background.gradient?.colors || ['#667eea', '#764ba2'])];
                    newColors[index] = e.target.value;
                    onChange({ 
                      gradient: { ...background.gradient, colors: newColors }
                    });
                  }}
                  className="w-16 h-10 rounded-lg border border-slate-300"
                />
                <span className="text-sm text-slate-600">Color {index + 1}</span>
                {(background.gradient?.colors?.length || 2) > 2 && (
                  <button
                    onClick={() => {
                      const newColors = (background.gradient?.colors || []).filter((_, i) => i !== index);
                      onChange({ gradient: { ...background.gradient, colors: newColors } });
                    }}
                    className="ml-auto text-red-500 hover:text-red-700"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
            {(background.gradient?.colors?.length || 2) < 5 && (
              <button
                onClick={() => {
                  const newColors = [...(background.gradient?.colors || ['#667eea', '#764ba2']), '#ffffff'];
                  onChange({ gradient: { ...background.gradient, colors: newColors } });
                }}
                className="px-4 py-2 text-sm border-2 border-dashed border-slate-300 rounded-lg hover:border-slate-400 w-full"
              >
                + Agregar Color
              </button>
            )}
          </div>
        </div>
      )}

      {/* Image */}
      {background.mode === 'image' && (
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">Imagen de Fondo</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files[0];
                if (!file) return;
                setUploadingBgImage(true);
                const reader = new FileReader();
                reader.onloadend = () => {
                  onChange({ 
                    image: { ...background.image, url: reader.result }
                  });
                  setUploadingBgImage(false);
                };
                reader.readAsDataURL(file);
              }}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              disabled={uploadingBgImage}
            />
            {uploadingBgImage && <p className="text-xs text-blue-600">Subiendo imagen...</p>}
            {background.image?.url && (
              <div className="relative inline-block">
                <img src={background.image.url} alt="Background preview" className="w-full h-32 object-cover rounded-lg border" />
                <button
                  type="button"
                  onClick={() => onChange({ image: { ...background.image, url: '' } })}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">Posición</label>
            <select
              value={background.image?.position || 'center'}
              onChange={(e) => onChange({ 
                image: { ...background.image, position: e.target.value }
              })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
            >
              <option value="center">Centro</option>
              <option value="top">Arriba</option>
              <option value="bottom">Abajo</option>
              <option value="left">Izquierda</option>
              <option value="right">Derecha</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">Tamaño</label>
            <select
              value={background.image?.size || 'cover'}
              onChange={(e) => onChange({ 
                image: { ...background.image, size: e.target.value }
              })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
            >
              <option value="cover">Cubrir</option>
              <option value="contain">Contener</option>
              <option value="auto">Automático</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">
              Difuminación de Fondo: {background.image?.blur || 0}px
            </label>
            <input
              type="range"
              min="0"
              max="20"
              value={background.image?.blur || 0}
              onChange={(e) => onChange({ 
                image: { ...background.image, blur: parseInt(e.target.value) }
              })}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">
              Opacidad: {Math.round((background.image?.opacity || 1) * 100)}%
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={background.image?.opacity || 1}
              onChange={(e) => onChange({ 
                image: { ...background.image, opacity: parseFloat(e.target.value) }
              })}
              className="w-full"
            />
          </div>
        </div>
      )}

      {/* Pattern */}
      {background.mode === 'pattern' && (
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">Tipo de Patrón</label>
            <select
              value={background.pattern?.type || 'dots'}
              onChange={(e) => onChange({ 
                pattern: { ...background.pattern, type: e.target.value }
              })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
            >
              <option value="dots">Puntos</option>
              <option value="grid">Cuadrícula</option>
              <option value="stripes">Rayas</option>
              <option value="waves">Ondas</option>
              <option value="diagonal">Diagonal</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">Color del Patrón</label>
            <input
              type="color"
              value={background.pattern?.color || '#e2e8f0'}
              onChange={(e) => onChange({ 
                pattern: { ...background.pattern, color: e.target.value }
              })}
              className="w-full h-12 rounded-lg border border-slate-300"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">
              Escala: {background.pattern?.scale || 1}x
            </label>
            <input
              type="range"
              min="0.5"
              max="3"
              step="0.1"
              value={background.pattern?.scale || 1}
              onChange={(e) => onChange({ 
                pattern: { ...background.pattern, scale: parseFloat(e.target.value) }
              })}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">
              Opacidad: {Math.round((background.pattern?.opacity || 0.5) * 100)}%
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={background.pattern?.opacity || 0.5}
              onChange={(e) => onChange({ 
                pattern: { ...background.pattern, opacity: parseFloat(e.target.value) }
              })}
              className="w-full"
            />
          </div>
        </div>
      )}

      {/* Header Blur Effect */}
      <div className="border-t pt-4 mt-6">
        <h4 className="font-semibold text-slate-900 mb-4">Efectos del Header</h4>
        
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">
            Difuminación del Header: {background.headerBlur || 0}px
          </label>
          <input
            type="range"
            min="0"
            max="30"
            value={background.headerBlur || 0}
            onChange={(e) => onChange({ headerBlur: parseInt(e.target.value) })}
            className="w-full"
          />
          <p className="text-xs text-slate-500">
            Efecto de vidrio esmerilado en el header
          </p>
        </div>

        <div className="space-y-2 mt-4">
          <label className="block text-sm font-medium text-slate-700">
            Opacidad del Header: {Math.round((background.headerOpacity || 1) * 100)}%
          </label>
          <input
            type="range"
            min="0.5"
            max="1"
            step="0.05"
            value={background.headerOpacity || 1}
            onChange={(e) => onChange({ headerOpacity: parseFloat(e.target.value) })}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
}

function LayoutTab({ layout, onChange }) {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-slate-900">Diseño y Estructura</h3>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700">
          Estilo de Hero
        </label>
        <select
          value={layout.style}
          onChange={(e) => onChange({ style: e.target.value })}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg"
        >
          <option value="hero-top">Hero Arriba</option>
          <option value="hero-center">Hero Centrado</option>
          <option value="hero-split">Hero Dividido</option>
          <option value="minimal">Minimal</option>
          <option value="cards-grid">Rejilla de Tarjetas</option>
        </select>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700">
          Espaciado
        </label>
        <select
          value={layout.spacing}
          onChange={(e) => onChange({ spacing: e.target.value })}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg"
        >
          <option value="compact">Compacto</option>
          <option value="normal">Normal</option>
          <option value="relaxed">Relajado</option>
        </select>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700">
          Posición del Header
        </label>
        <select
          value={layout.headerPosition}
          onChange={(e) => onChange({ headerPosition: e.target.value })}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg"
        >
          <option value="fixed">Fijo</option>
          <option value="sticky">Sticky</option>
          <option value="static">Estático</option>
        </select>
      </div>
    </div>
  );
}

function ComponentsTab({ components, onChange }) {
  return (
    <div className="space-y-6">
      {/* Botones */}
      <div className="space-y-3">
        <h3 className="font-semibold text-slate-900">Botones</h3>
        
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">Estilo</label>
          <select
            value={components.buttons.style}
            onChange={(e) =>
              onChange({ buttons: { ...components.buttons, style: e.target.value } })
            }
            className="w-full px-3 py-2 border border-slate-300 rounded-lg"
          >
            <option value="filled">Relleno</option>
            <option value="outline">Contorno</option>
            <option value="ghost">Fantasma</option>
            <option value="soft">Suave</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">Redondez</label>
          <select
            value={components.buttons.roundness}
            onChange={(e) =>
              onChange({ buttons: { ...components.buttons, roundness: e.target.value } })
            }
            className="w-full px-3 py-2 border border-slate-300 rounded-lg"
          >
            <option value="none">Ninguna</option>
            <option value="sm">Pequeña</option>
            <option value="md">Media</option>
            <option value="lg">Grande</option>
            <option value="full">Completa</option>
          </select>
        </div>
      </div>

      {/* Tarjetas */}
      <div className="space-y-3">
        <h3 className="font-semibold text-slate-900">Tarjetas</h3>
        
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">Estilo</label>
          <select
            value={components.cards.style}
            onChange={(e) =>
              onChange({ cards: { ...components.cards, style: e.target.value } })
            }
            className="w-full px-3 py-2 border border-slate-300 rounded-lg"
          >
            <option value="elevated">Elevada</option>
            <option value="outlined">Contorno</option>
            <option value="flat">Plana</option>
            <option value="glass">Vidrio</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">Sombra</label>
          <select
            value={components.cards.shadow}
            onChange={(e) =>
              onChange({ cards: { ...components.cards, shadow: e.target.value } })
            }
            className="w-full px-3 py-2 border border-slate-300 rounded-lg"
          >
            <option value="none">Ninguna</option>
            <option value="sm">Pequeña</option>
            <option value="md">Media</option>
            <option value="lg">Grande</option>
            <option value="xl">Extra Grande</option>
          </select>
        </div>
      </div>
    </div>
  );
}

function SectionsTab({ sections, onChange }) {
  const sectionsList = [
    { key: 'hero', label: 'Hero / Banner Principal', description: 'Sección destacada al inicio' },
    { key: 'about', label: 'Sobre Nosotros', description: 'Información del negocio' },
    { key: 'services', label: 'Servicios', description: 'Lista de servicios ofrecidos' },
    { key: 'gallery', label: 'Galería', description: 'Fotos del negocio' },
    { key: 'testimonials', label: 'Testimonios', description: 'Opiniones de clientes' },
    { key: 'schedule', label: 'Horarios', description: 'Horario de atención' },
    { key: 'contact', label: 'Contacto', description: 'Información de contacto' },
    { key: 'booking', label: 'Reservas', description: 'Sistema de agendamiento' },
  ];

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-slate-900">Secciones Visibles</h3>
      <p className="text-xs text-slate-600">
        Activa o desactiva secciones de tu tienda
      </p>

      {sectionsList.map((section) => (
        <div
          key={section.key}
          className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50"
        >
          <input
            type="checkbox"
            checked={sections[section.key]}
            onChange={(e) => onChange({ [section.key]: e.target.checked })}
            className="mt-1 w-4 h-4 text-blue-600 rounded"
          />
          <div className="flex-1">
            <h4 className="text-sm font-medium text-slate-900">{section.label}</h4>
            <p className="text-xs text-slate-500">{section.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ==================== PREVIEW COMPONENT ====================

function StorePreview({ appearance, storeData }) {
  if (!appearance) return null;
  
  const { colors, typography, components, background } = appearance;
  const storeMode = storeData?.mode || 'products';

  // Build background styles
  const getBackgroundStyles = () => {
    if (!background || !background.mode) {
      return { backgroundColor: colors.background };
    }

    const styles = {};

    switch (background.mode) {
      case 'solid':
        styles.backgroundColor = background.solid?.color || colors.background;
        break;

      case 'gradient':
        const gradientType = background.gradient?.type || 'linear';
        const direction = background.gradient?.direction || 'to bottom';
        const gradientColors = background.gradient?.colors || [colors.primary, colors.secondary];
        
        if (gradientType === 'linear') {
          styles.backgroundImage = `linear-gradient(${direction}, ${gradientColors.join(', ')})`;
        } else if (gradientType === 'radial') {
          styles.backgroundImage = `radial-gradient(circle, ${gradientColors.join(', ')})`;
        } else if (gradientType === 'conic') {
          styles.backgroundImage = `conic-gradient(${gradientColors.join(', ')})`;
        }
        break;

      case 'image':
        if (background.image?.url) {
          styles.backgroundImage = `url(${background.image.url})`;
          styles.backgroundPosition = background.image?.position || 'center';
          styles.backgroundSize = background.image?.size || 'cover';
          styles.backgroundRepeat = 'no-repeat';
          
          if (background.image?.blur && background.image.blur > 0) {
            styles.filter = `blur(${background.image.blur}px)`;
          }
          
          if (background.image?.opacity && background.image.opacity < 1) {
            styles.opacity = background.image.opacity;
          }
        }
        break;

      case 'pattern':
        const patternType = background.pattern?.type || 'dots';
        const patternColor = background.pattern?.color || '#e2e8f0';
        const patternScale = background.pattern?.scale || 1;
        const patternSize = 20 * patternScale;
        
        let patternSvg = '';
        switch (patternType) {
          case 'dots':
            patternSvg = `data:image/svg+xml,%3Csvg width='${patternSize}' height='${patternSize}' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='${patternSize/2}' cy='${patternSize/2}' r='2' fill='${encodeURIComponent(patternColor)}'/%3E%3C/svg%3E`;
            break;
          case 'grid':
            patternSvg = `data:image/svg+xml,%3Csvg width='${patternSize}' height='${patternSize}' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M ${patternSize} 0 L 0 0 0 ${patternSize}' fill='none' stroke='${encodeURIComponent(patternColor)}' stroke-width='1'/%3E%3C/svg%3E`;
            break;
          case 'stripes':
            patternSvg = `data:image/svg+xml,%3Csvg width='${patternSize}' height='${patternSize}' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M 0 0 L ${patternSize} ${patternSize}' stroke='${encodeURIComponent(patternColor)}' stroke-width='2'/%3E%3C/svg%3E`;
            break;
          case 'diagonal':
            patternSvg = `data:image/svg+xml,%3Csvg width='${patternSize}' height='${patternSize}' xmlns='http://www.w3.org/2000/svg'%3E%3Cline x1='0' y1='0' x2='${patternSize}' y2='${patternSize}' stroke='${encodeURIComponent(patternColor)}' stroke-width='1'/%3E%3C/svg%3E`;
            break;
          case 'waves':
            patternSvg = `data:image/svg+xml,%3Csvg width='${patternSize*2}' height='${patternSize}' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M 0 ${patternSize/2} Q ${patternSize/2} 0, ${patternSize} ${patternSize/2} T ${patternSize*2} ${patternSize/2}' fill='none' stroke='${encodeURIComponent(patternColor)}' stroke-width='2'/%3E%3C/svg%3E`;
            break;
        }
        
        styles.backgroundColor = colors.background;
        styles.backgroundImage = `url("${patternSvg}")`;
        styles.backgroundSize = patternType === 'waves' ? `${patternSize*2}px ${patternSize}px` : `${patternSize}px ${patternSize}px`;
        
        if (background.pattern?.opacity && background.pattern.opacity < 1) {
          styles.opacity = background.pattern.opacity;
        }
        break;
    }

    return styles;
  };

  // Header blur effect
  const getHeaderStyles = () => {
    const headerStyles = {
      backgroundColor: colors.primary,
      color: '#fff',
    };

    if (background?.headerBlur && background.headerBlur > 0) {
      headerStyles.backdropFilter = `blur(${background.headerBlur}px)`;
      headerStyles.WebkitBackdropFilter = `blur(${background.headerBlur}px)`;
    }

    if (background?.headerOpacity && background.headerOpacity < 1) {
      // Convert hex to rgba
      const hex = colors.primary.replace('#', '');
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      headerStyles.backgroundColor = `rgba(${r}, ${g}, ${b}, ${background.headerOpacity})`;
    }

    return headerStyles;
  };

  const buttonClasses = {
    filled: `bg-[${colors.primary}] text-white hover:opacity-90`,
    outline: `border-2 border-[${colors.primary}] text-[${colors.primary}] hover:bg-[${colors.primary}] hover:text-white`,
    ghost: `text-[${colors.primary}] hover:bg-[${colors.primary}]/10`,
    soft: `bg-[${colors.primary}]/10 text-[${colors.primary}] hover:bg-[${colors.primary}]/20`,
  };

  const roundnessClasses = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    full: 'rounded-full',
  };

  const backgroundStyles = getBackgroundStyles();

  return (
    <div 
      className="min-h-screen relative"
      style={backgroundStyles}
    >
      {/* Content wrapper with proper contrast */}
      <div 
        className="min-h-screen p-8"
        style={{ 
          fontFamily: typography.fontFamily,
          fontSize: typography.bodySize,
          lineHeight: typography.lineHeight,
        }}
      >
        {/* Header de ejemplo con blur effect */}
        <div 
          className="mb-8 pb-6 border-b-2 rounded-xl p-4" 
          style={{ 
            ...getHeaderStyles(),
            borderColor: colors.border,
          }}
        >
          <div className="flex items-center gap-4 mb-3">
            <div className="w-14 h-14 rounded-lg flex items-center justify-center text-2xl font-bold" 
              style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: '#fff' }}>
              {storeData?.name?.[0] || 'T'}
            </div>
            <div>
              <h1 
                className="font-bold mb-1"
                style={{ 
                  color: '#fff',
                  fontSize: typography.headingSize,
                }}
              >
                {storeData?.name || 'Mi Tienda'}
              </h1>
              <div className="flex items-center gap-2">
                <span className="text-xs px-3 py-1 rounded-full font-semibold" 
                  style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: '#fff' }}>
                  {storeMode === 'bookings' ? '📅 AGENDAMIENTO' : '🛍️ PRODUCTOS'}
                </span>
                {storeMode === 'bookings' && (
                  <span className="text-xs text-white/80">
                  Sistema de citas y servicios
                </span>
              )}
              {storeMode === 'products' && (
                <span className="text-xs text-gray-500">
                  Tienda de venta online
                </span>
              )}
            </div>
          </div>
        </div>
        <p style={{ color: colors.textSecondary }}>
          {storeData?.description || 'Vista previa en tiempo real de tu tienda personalizada'}
        </p>
        <div className="mt-4 px-4 py-3 rounded-lg" style={{ backgroundColor: colors.primary + '10' }}>
          <p className="text-xs font-semibold" style={{ color: colors.primary }}>
            💡 Esta es la vista que verán tus clientes cuando visiten tu tienda
          </p>
        </div>
        </div>

        {/* Botones de ejemplo */}
        <div className="mb-8 space-y-4">
          <h2 className="text-lg font-semibold mb-3" style={{ color: colors.text }}>
            Botones
          </h2>
          <div className="flex gap-3">
            <button
              className={`px-6 py-3 font-medium transition-all ${
                buttonClasses[components.buttons.style]
              } ${roundnessClasses[components.buttons.roundness]}`}
            >
              Botón Principal
            </button>
            <button
              className={`px-6 py-3 font-medium transition-all ${
                roundnessClasses[components.buttons.roundness]
              }`}
              style={{
                backgroundColor: colors.secondary,
                color: 'white',
              }}
            >
              Botón Secundario
            </button>
          </div>
        </div>

        {/* Tarjetas de ejemplo */}
        <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: colors.text }}>
          <span>{storeMode === 'bookings' ? '💼' : '🛍️'}</span>
          <span>{storeMode === 'bookings' ? 'Servicios Disponibles' : 'Productos en Venta'}</span>
        </h2>
        <div className="grid grid-cols-3 gap-4">
          {storeMode === 'bookings' 
            ? ['Corte de Cabello', 'Manicure', 'Masaje'].map((service, i) => (
                <div
                  key={i}
                  className={`p-6 ${roundnessClasses[components.cards.roundness]} ${
                    components.cards.style === 'elevated'
                      ? 'shadow-lg'
                      : components.cards.style === 'outlined'
                      ? 'border-2'
                      : ''
                  }`}
                  style={{
                    backgroundColor: colors.surface,
                    borderColor: components.cards.style === 'outlined' ? colors.border : undefined,
                  }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold" style={{ color: colors.text }}>
                      {service}
                    </h3>
                    <span className="text-xs px-2 py-1 rounded-full" 
                      style={{ backgroundColor: colors.success + '20', color: colors.success }}>
                      Disponible
                    </span>
                  </div>
                  <p className="text-sm mb-3" style={{ color: colors.textSecondary }}>
                    Servicio profesional
                  </p>
                  <div className="flex items-center justify-between pt-3" 
                    style={{ borderTop: `1px solid ${colors.border}` }}>
                    <span className="text-xs" style={{ color: colors.textSecondary }}>
                      ⏱️ {30 + i * 15} min
                    </span>
                    <span className="font-bold" style={{ color: colors.primary }}>
                      ${15000 + i * 5000}
                    </span>
                  </div>
                </div>
              ))
            : ['Producto Premium', 'Más Vendido', 'Oferta'].map((product, i) => (
                <div
                  key={i}
                  className={`p-6 ${roundnessClasses[components.cards.roundness]} ${
                    components.cards.style === 'elevated'
                      ? 'shadow-lg'
                      : components.cards.style === 'outlined'
                      ? 'border-2'
                      : ''
                  }`}
                  style={{
                    backgroundColor: colors.surface,
                    borderColor: components.cards.style === 'outlined' ? colors.border : undefined,
                  }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold" style={{ color: colors.text }}>
                      {product}
                    </h3>
                    {i === 1 && (
                      <span className="text-xs px-2 py-1 rounded-full" 
                        style={{ backgroundColor: colors.warning + '20', color: colors.warning }}>
                        Popular
                      </span>
                    )}
                  </div>
                  <p className="text-sm mb-3" style={{ color: colors.textSecondary }}>
                    Descripción del producto
                  </p>
                  <div className="flex items-center justify-between pt-3" 
                    style={{ borderTop: `1px solid ${colors.border}` }}>
                    <span className="font-bold text-xl" style={{ color: colors.primary }}>
                      ${(i + 1) * 12990}
                    </span>
                    <button className={`px-3 py-1 text-xs font-semibold ${roundnessClasses.md}`}
                      style={{ backgroundColor: colors.primary, color: '#fff' }}>
                      🛒 Agregar
                    </button>
                  </div>
                </div>
              ))
          }
        </div>
        <p className="text-xs mt-4 text-center" style={{ color: colors.textSecondary }}>
          {storeMode === 'bookings' 
            ? '💡 Los clientes pueden agendar citas eligiendo servicio, fecha y hora'
            : '💡 Los clientes pueden agregar productos al carrito y realizar pedidos'
          }
        </p>
      </div>

      {/* Badges de estado */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold mb-3" style={{ color: colors.text }}>
          Estados
        </h2>
        <div className="flex gap-3">
          <span
            className="px-4 py-2 rounded-lg text-sm font-medium"
            style={{ backgroundColor: colors.success + '20', color: colors.success }}
          >
            ✓ Éxito
          </span>
          <span
            className="px-4 py-2 rounded-lg text-sm font-medium"
            style={{ backgroundColor: colors.warning + '20', color: colors.warning }}
          >
            ⚠ Advertencia
          </span>
          <span
            className="px-4 py-2 rounded-lg text-sm font-medium"
            style={{ backgroundColor: colors.error + '20', color: colors.error }}
          >
            ✕ Error
          </span>
        </div>
      </div>
      </div>
    </div>
  );
}

// ==================== PROMOTIONAL SPACES TAB ====================

function PromotionalSpacesTab({ storeData, onChange }) {
  const [uploadingBanner, setUploadingBanner] = useState(null);
  const plan = storeData.plan || 'free';
  const isPremium = plan === 'pro' || plan === 'premium';
  
  if (!storeData.promotionalSpaces) {
    storeData.promotionalSpaces = {
      top: { enabled: false, imageUrl: '', link: '' },
      sidebarLeft: { enabled: false, imageUrl: '', link: '' },
      sidebarRight: { enabled: false, imageUrl: '', link: '' },
      betweenSections: { enabled: false, imageUrl: '', link: '' },
      footer: { enabled: false, imageUrl: '', link: '' },
    };
  }

  const handleImageUpload = (position, e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingBanner(position);
    const reader = new FileReader();
    reader.onloadend = () => {
      onChange({
        promotionalSpaces: {
          ...storeData.promotionalSpaces,
          [position]: {
            ...storeData.promotionalSpaces[position],
            imageUrl: reader.result,
          },
        },
      });
      setUploadingBanner(null);
    };
    reader.readAsDataURL(file);
  };

  const handleToggle = (position) => {
    onChange({
      promotionalSpaces: {
        ...storeData.promotionalSpaces,
        [position]: {
          ...storeData.promotionalSpaces[position],
          enabled: !storeData.promotionalSpaces[position].enabled,
        },
      },
    });
  };

  const handleLinkChange = (position, link) => {
    onChange({
      promotionalSpaces: {
        ...storeData.promotionalSpaces,
        [position]: {
          ...storeData.promotionalSpaces[position],
          link,
        },
      },
    });
  };

  const positions = [
    { key: 'top', label: 'Banner Superior', icon: '⬆️', desc: 'Encima del hero' },
    { key: 'sidebarLeft', label: 'Lateral Izquierdo', icon: '⬅️', desc: 'Sidebar izquierdo' },
    { key: 'sidebarRight', label: 'Lateral Derecho', icon: '➡️', desc: 'Sidebar derecho' },
    { key: 'betweenSections', label: 'Entre Secciones', icon: '↕️', desc: 'Entre contenido' },
    { key: 'footer', label: 'Banner Footer', icon: '⬇️', desc: 'Pie de página' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-slate-900 mb-2">Espacios Promocionales</h3>
        <p className="text-xs text-slate-600 mb-4">
          Configura banners personalizados para promocionar ofertas y productos
        </p>

        {!isPremium && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-amber-800 font-medium mb-2">
              🔒 Plan Free: Espacios limitados
            </p>
            <p className="text-xs text-amber-700">
              En el plan gratuito, se mostrarán anuncios de nuestros auspiciadores.
              Actualiza a Pro o Premium para personalizar tus espacios promocionales.
            </p>
          </div>
        )}
      </div>

      {positions.map((pos) => {
        const space = storeData.promotionalSpaces[pos.key];
        return (
          <div key={pos.key} className="border border-slate-200 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">{pos.icon}</span>
                <div>
                  <h4 className="font-medium text-slate-900">{pos.label}</h4>
                  <p className="text-xs text-slate-500">{pos.desc}</p>
                </div>
              </div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={space.enabled}
                  onChange={() => handleToggle(pos.key)}
                  disabled={!isPremium}
                  className="rounded"
                />
                <span className="text-sm text-slate-600">Activar</span>
              </label>
            </div>

            {space.enabled && isPremium && (
              <>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Subir Imagen
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(pos.key, e)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    disabled={uploadingBanner === pos.key}
                  />
                  {uploadingBanner === pos.key && (
                    <p className="text-xs text-blue-600 mt-1">Subiendo...</p>
                  )}
                  {space.imageUrl && (
                    <div className="mt-2 relative inline-block">
                      <img
                        src={space.imageUrl}
                        alt="Banner preview"
                        className="w-full h-24 object-cover rounded border"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          onChange({
                            promotionalSpaces: {
                              ...storeData.promotionalSpaces,
                              [pos.key]: { ...space, imageUrl: '' },
                            },
                          })
                        }
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Link (opcional)
                  </label>
                  <input
                    type="url"
                    value={space.link}
                    onChange={(e) => handleLinkChange(pos.key, e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
              </>
            )}

            {space.enabled && !isPremium && (
              <p className="text-xs text-slate-500 italic">
                Actualiza tu plan para configurar este espacio
              </p>
            )}
          </div>
        );
      })}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900 font-medium mb-2">💡 Consejos:</p>
        <ul className="text-xs text-blue-800 space-y-1 list-disc list-inside">
          <li>Usa imágenes de alta calidad (mínimo 1200px ancho)</li>
          <li>Los banners laterales funcionan mejor con formato vertical</li>
          <li>Añade links para dirigir tráfico a productos o servicios</li>
          <li>Mantén diseño coherente con tu marca</li>
        </ul>
      </div>
    </div>
  );
}
