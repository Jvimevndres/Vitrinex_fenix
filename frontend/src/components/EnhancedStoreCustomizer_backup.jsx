// frontend/src/components/EnhancedStoreCustomizer.jsx
import { useState, useEffect } from 'react';
import {
  getStoreAppearance,
  updateStoreAppearance,
  applyTheme,
  resetAppearance,
  getAvailableThemes,
} from '../api/appearance';
import { getStoreById, updateMyStore } from '../api/store';
import StorePreviewRealistic from './StorePreviewRealistic'; // ðŸ†• Preview realista

/**
 * ðŸŽ¨ CONSTRUCTOR VISUAL MEJORADO Y SIMPLIFICADO
 * Sistema de personalizaciÃ³n fÃ¡cil de usar con preview realista
 */
export default function EnhancedStoreCustomizer({ storeId, onClose }) {
  const [appearance, setAppearance] = useState(null);
  const [themes, setThemes] = useState([]);
  const [storeData, setStoreData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('themes');
  const [activeSubTab, setActiveSubTab] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [previewMode, setPreviewMode] = useState('desktop'); // desktop, tablet, mobile
  const [showWizard, setShowWizard] = useState(false);

  // CategorÃ­as de plantillas
  const themeCategories = {
    all: { label: 'Todos', icon: 'ðŸŽ¨' },
    business: { label: 'Negocios', icon: 'ðŸ’¼' },
    creative: { label: 'Creativos', icon: 'ðŸŽ­' },
    modern: { label: 'Modernos', icon: 'âš¡' },
    elegant: { label: 'Elegantes', icon: 'ðŸ’Ž' },
    vibrant: { label: 'Vibrantes', icon: 'ðŸŒˆ' },
    minimal: { label: 'Minimalistas', icon: 'âšª' },
  };

  // Plantillas disponibles con metadata (35 diseÃ±os)
  const availableThemes = [
    // Minimalistas (5)
    { id: 'minimal', name: 'Minimal Clean', category: 'minimal', description: 'DiseÃ±o limpio y profesional', preview: 'ðŸ¤' },
    { id: 'minimal-white', name: 'Minimal White', category: 'minimal', description: 'Blanco puro minimalista', preview: 'âšª' },
    { id: 'minimal-gray', name: 'Minimal Gray', category: 'minimal', description: 'Grises elegantes', preview: 'â¬œ' },
    { id: 'minimal-mono', name: 'Minimal Mono', category: 'minimal', description: 'MonocromÃ¡tico simple', preview: 'â—»ï¸' },
    { id: 'minimal-zen', name: 'Minimal Zen', category: 'minimal', description: 'Serenidad y balance', preview: 'ðŸ§˜' },
    
    // Negocios (8)
    { id: 'professional-services', name: 'Servicios Profesionales', category: 'business', description: 'Ideal para consultorÃ­as y servicios', preview: 'ðŸ’¼' },
    { id: 'warm-cafe', name: 'CafeterÃ­a Acogedora', category: 'business', description: 'Perfecto para cafÃ©s y restaurantes', preview: 'â˜•' },
    { id: 'eco-friendly', name: 'Eco Friendly', category: 'business', description: 'Productos naturales y sostenibles', preview: 'ðŸŒ±' },
    { id: 'restaurant', name: 'Restaurante Gourmet', category: 'business', description: 'Comida y gastronomÃ­a', preview: 'ðŸ½ï¸' },
    { id: 'corporate-blue', name: 'Corporativo Azul', category: 'business', description: 'Profesional y confiable', preview: 'ðŸ¢' },
    { id: 'medical-clinic', name: 'ClÃ­nica MÃ©dica', category: 'business', description: 'Salud y bienestar', preview: 'ðŸ¥' },
    { id: 'law-firm', name: 'Bufete Legal', category: 'business', description: 'Abogados y legal', preview: 'âš–ï¸' },
    { id: 'financial-advisor', name: 'Asesor Financiero', category: 'business', description: 'Finanzas e inversiones', preview: 'ðŸ’°' },
    
    // Creativos (7)
    { id: 'artistic-studio', name: 'Estudio ArtÃ­stico', category: 'creative', description: 'Para artistas y creativos', preview: 'ðŸŽ¨' },
    { id: 'pastel', name: 'Pastel Dreams', category: 'creative', description: 'Colores suaves y amigables', preview: 'ðŸŒ¸' },
    { id: 'gradient-wave', name: 'Gradient Wave', category: 'creative', description: 'Degradados vibrantes', preview: 'ðŸŒŠ' },
    { id: 'photography', name: 'FotografÃ­a Pro', category: 'creative', description: 'Portfolio fotogrÃ¡fico', preview: 'ðŸ“¸' },
    { id: 'music-studio', name: 'Estudio Musical', category: 'creative', description: 'MÃºsica y audio', preview: 'ðŸŽµ' },
    { id: 'design-agency', name: 'Agencia de DiseÃ±o', category: 'creative', description: 'DiseÃ±o grÃ¡fico y web', preview: 'âœï¸' },
    { id: 'video-production', name: 'ProducciÃ³n de Video', category: 'creative', description: 'Cine y video', preview: 'ðŸŽ¬' },
    
    // Modernos (6)
    { id: 'tech-startup', name: 'Tech Startup', category: 'modern', description: 'TecnologÃ­a y startups', preview: 'ðŸš€' },
    { id: 'modern-agency', name: 'Agencia Moderna', category: 'modern', description: 'DiseÃ±o contemporÃ¡neo', preview: 'âš¡' },
    { id: 'dark-pro', name: 'Dark Pro', category: 'modern', description: 'Profesional oscuro', preview: 'ðŸŒ™' },
    { id: 'cyber-tech', name: 'Cyber Tech', category: 'modern', description: 'Futurista tecnolÃ³gico', preview: 'ðŸ¤–' },
    { id: 'app-developer', name: 'Desarrollador de Apps', category: 'modern', description: 'Desarrollo de software', preview: 'ðŸ“±' },
    { id: 'gaming-esports', name: 'Gaming & Esports', category: 'modern', description: 'Videojuegos y competencias', preview: 'ðŸŽ®' },
    
    // Elegantes (5)
    { id: 'elegant-boutique', name: 'Boutique Elegante', category: 'elegant', description: 'Lujo y sofisticaciÃ³n', preview: 'ðŸ‘—' },
    { id: 'luxury-brand', name: 'Marca de Lujo', category: 'elegant', description: 'Premium y exclusivo', preview: 'ðŸ’Ž' },
    { id: 'beauty-salon', name: 'SalÃ³n de Belleza', category: 'elegant', description: 'Belleza y cuidado personal', preview: 'ðŸ’…' },
    { id: 'jewelry-store', name: 'JoyerÃ­a Exclusiva', category: 'elegant', description: 'Joyas y accesorios', preview: 'ðŸ’' },
    { id: 'spa-wellness', name: 'Spa & Wellness', category: 'elegant', description: 'RelajaciÃ³n y bienestar', preview: 'ðŸ§–' },
    
    // Vibrantes (4)
    { id: 'neon', name: 'Neon Lights', category: 'vibrant', description: 'Colores neÃ³n y energÃ­a', preview: 'ðŸ’œ' },
    { id: 'vibrant-shop', name: 'Tienda Vibrante', category: 'vibrant', description: 'Colorido y llamativo', preview: 'ðŸŽ‰' },
    { id: 'fitness-center', name: 'Centro de Fitness', category: 'vibrant', description: 'EnergÃ­a y movimiento', preview: 'ðŸ’ª' },
    { id: 'party-events', name: 'Eventos y Fiestas', category: 'vibrant', description: 'Celebraciones y entretenimiento', preview: 'ðŸŽŠ' },
  ];

  useEffect(() => {
    loadData();
  }, [storeId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [appearanceData, store] = await Promise.all([
        getStoreAppearance(storeId),
        getStoreById(storeId),
      ]);
      
      // Asegurar que todas las propiedades necesarias existan
      const safeAppearance = {
        ...appearanceData,
        sections: appearanceData.sections || {
          hero: true,
          about: true,
          services: true,
          gallery: false,
          testimonials: false,
          schedule: true,
          contact: true,
          booking: true,
        },
        typography: appearanceData.typography || {
          fontFamily: 'Inter',
          headingSize: '2.5rem',
          headingWeight: '700',
          bodySize: '1rem',
          bodyWeight: '400',
          lineHeight: '1.6',
        },
        effects: appearanceData.effects || {},
        colors: appearanceData.colors || {},
        background: appearanceData.background || {},
      };
      
      setAppearance(safeAppearance);
      setStoreData(store.data);
      
      // Mostrar wizard para nuevos usuarios
      if (!appearanceData.theme || appearanceData.theme === 'minimal') {
        // Puedes descomentar para mostrar wizard automÃ¡ticamente
        // setShowWizard(true);
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = (field, value) => {
    setAppearance((prev) => ({
      ...prev,
      [field]: typeof value === 'object' && !Array.isArray(value) 
        ? { ...prev[field], ...value } 
        : value,
    }));
    setHasChanges(true);
  };

  const handleNestedUpdate = (parent, child, value) => {
    setAppearance((prev) => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [child]: typeof value === 'object' && !Array.isArray(value)
          ? { ...prev[parent]?.[child], ...value }
          : value,
      },
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Guardar datos bÃ¡sicos de la tienda
      if (storeData) {
        await updateMyStore(storeId, storeData);
      }
      
      // Guardar apariencia
      const updated = await updateStoreAppearance(storeId, appearance);
      setAppearance(updated);
      setHasChanges(false);
      alert('âœ… Cambios guardados correctamente');
    } catch (error) {
      console.error('âŒ Error guardando:', error);
      alert('âŒ Error al guardar los cambios: ' + (error.response?.data?.message || error.message));
    } finally {
      setSaving(false);
    }
  };

  const handleApplyTheme = async (themeId) => {
    if (!confirm(`Â¿Aplicar plantilla "${themeId}"? Esto sobrescribirÃ¡ tu configuraciÃ³n actual.`)) {
      return;
    }

    try {
      setSaving(true);
      const updated = await applyTheme(storeId, themeId);
      setAppearance(updated);
      setHasChanges(false);
      alert(`âœ… Plantilla "${themeId}" aplicada`);
    } catch (error) {
      console.error('Error aplicando plantilla:', error);
      alert('âŒ Error al aplicar la plantilla');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!confirm('Â¿Resetear toda la configuraciÃ³n? Esta acciÃ³n no se puede deshacer.')) {
      return;
    }

    try {
      setSaving(true);
      const updated = await resetAppearance(storeId);
      setAppearance(updated);
      setHasChanges(false);
      alert('âœ… ConfiguraciÃ³n reseteada');
    } catch (error) {
      console.error('Error reseteando:', error);
      alert('âŒ Error al resetear');
    } finally {
      setSaving(false);
    }
  };

  const filteredThemes = availableThemes.filter(theme => {
    const matchesCategory = selectedCategory === 'all' || theme.category === selectedCategory;
    const matchesSearch = theme.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         theme.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-8">
          <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-4 text-slate-700">Cargando editor mejorado...</p>
        </div>
      </div>
    );
  }

  const storeMode = storeData?.mode || 'products';

  return (
    <div className="fixed inset-0 z-50 bg-slate-50 flex flex-col">
      {/* Header Mejorado */}
      <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="text-slate-600 hover:text-slate-900 p-2 hover:bg-slate-100 rounded-lg transition-colors"
            title="Volver"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              ðŸŽ¨ Constructor Visual Mejorado
            </h1>
            <p className="text-sm text-slate-600">
              <span className="font-semibold">{storeData?.name || 'Mi Tienda'}</span>
              {' â€¢ '}
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                storeMode === 'bookings' 
                  ? 'bg-purple-100 text-purple-700' 
                  : 'bg-blue-100 text-blue-700'
              }`}>
                {storeMode === 'bookings' ? 'ðŸ“… Agendamiento' : 'ðŸ›ï¸ Productos'}
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Preview Mode Selector */}
          <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
            {[
              { id: 'desktop', icon: 'ðŸ’»', label: 'Escritorio' },
              { id: 'tablet', icon: 'ðŸ“±', label: 'Tablet' },
              { id: 'mobile', icon: 'ðŸ“±', label: 'MÃ³vil' },
            ].map(mode => (
              <button
                key={mode.id}
                onClick={() => setPreviewMode(mode.id)}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-all ${
                  previewMode === mode.id
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title={mode.label}
              >
                {mode.icon}
              </button>
            ))}
          </div>

          {hasChanges && (
            <span className="text-sm text-amber-600 font-medium flex items-center gap-2">
              <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
              Sin guardar
            </span>
          )}

          <button
            onClick={() => setShowWizard(true)}
            className="px-4 py-2 text-sm text-purple-600 hover:text-purple-700 border border-purple-300 rounded-lg hover:bg-purple-50 disabled:opacity-50 font-medium"
          >
            ðŸ§™ Asistente
          </button>

          <button
            onClick={handleReset}
            disabled={saving}
            className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50"
          >
            ðŸ”„ Resetear
          </button>

          <button
            onClick={handleSave}
            disabled={saving || !hasChanges}
            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg hover:from-blue-700 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-sm"
          >
            {saving ? 'â³ Guardando...' : 'ðŸ’¾ Guardar Cambios'}
          </button>
        </div>
      </header>

      {/* Main Content - Layout mejorado con preview side-by-side */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar de controles */}
        <aside className="w-80 bg-white border-r border-slate-200 overflow-y-auto flex flex-col">
          {/* Search Bar (solo para plantillas) */}
          {activeTab === 'themes' && (
            <div className="p-3 border-b border-slate-200 bg-slate-50">
              <input
                type="text"
                placeholder="ðŸ” Buscar plantillas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          )}

          {/* Tabs Navigation */}
          <div className="border-b border-slate-200 bg-white sticky top-0 z-10 shadow-sm">
            <nav className="grid grid-cols-3 grid-rows-2 gap-1 p-2">
              {[
                { id: 'themes', icon: 'ðŸŽ¨', label: 'Plantillas' },
                { id: 'colors', icon: 'ðŸŒˆ', label: 'Colores' },
                { id: 'content-text', icon: 'ðŸ“', label: 'Contenido' },
                { id: 'effects', icon: 'âœ¨', label: 'Efectos' },
                { id: 'layout', icon: 'ðŸ“', label: 'DiseÃ±o' },
                { id: 'sections', icon: 'ðŸ“‹', label: 'Secciones' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setActiveSubTab(null);
                  }}
                  className={`flex flex-col items-center px-2 py-2 text-xs font-medium rounded-lg transition-all ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span className="text-lg mb-1">{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Preview en tiempo real - Info destacada */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-200 p-3">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-xl">ðŸ‘ï¸</span>
              <div className="flex-1">
                <p className="font-semibold text-green-900">Vista Previa en Tiempo Real</p>
                <p className="text-xs text-green-700">Los cambios se ven al instante â†’</p>
              </div>
            </div>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto">
            {activeTab === 'themes' && (
              <ThemesTab
                themes={filteredThemes}
                categories={themeCategories}
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
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

            {activeTab === 'content-text' && (
              <ContentTextTab
                storeData={storeData}
                appearance={appearance}
                typography={appearance.typography}
                onTypographyChange={(typography) => handleUpdate('typography', typography)}
                onStoreUpdate={(field, value) => {
                  // Actualizar localmente
                  setStoreData({ ...storeData, [field]: value });
                  setHasChanges(true);
                }}
                onContentUpdate={(section, field, value) => {
                  // Actualizar contenido de secciones
                  setAppearance((prev) => ({
                    ...prev,
                    content: {
                      ...prev.content,
                      [section]: {
                        ...prev.content?.[section],
                        [field]: value
                      }
                    }
                  }));
                  setHasChanges(true);
                }}
              />
            )}

            {activeTab === 'effects' && (
              <EffectsTab
                effects={appearance.effects}
                onChange={(effects) => handleUpdate('effects', effects)}
              />
            )}

            {activeTab === 'layout' && (
              <LayoutTab
                layout={appearance.layout}
                background={appearance.background}
                onLayoutChange={(layout) => handleUpdate('layout', layout)}
                onBackgroundChange={(background) => handleUpdate('background', background)}
              />
            )}

            {activeTab === 'sections' && (
              <SectionsTab
                sections={appearance.sections}
                onChange={(sections) => handleUpdate('sections', sections)}
              />
            )}
          </div>
        </aside>

        {/* Preview Area Mejorado */}
        <main className="flex-1 bg-gradient-to-br from-slate-100 to-slate-200 overflow-auto p-6">
          <div className={`mx-auto transition-all duration-300 ${
            previewMode === 'desktop' ? 'max-w-7xl' :
            previewMode === 'tablet' ? 'max-w-3xl' :
            'max-w-sm'
          }`}>
            <div className="bg-white rounded-xl shadow-2xl overflow-hidden border border-slate-200">
              <StorePreviewRealistic 
                appearance={appearance} 
                storeData={storeData} 
                mode={previewMode}
              />
            </div>
            
            {/* Preview Info */}
            <div className="mt-4 text-center text-sm text-slate-600">
              Vista previa en modo <span className="font-semibold">{
                previewMode === 'desktop' ? 'Escritorio' :
                previewMode === 'tablet' ? 'Tablet' :
                'MÃ³vil'
              }</span>
            </div>
          </div>
        </main>
      </div>

      {/* Wizard Modal */}
      {showWizard && (
        <CustomizationWizard
          storeData={storeData}
          onComplete={(selectedTheme) => {
            handleApplyTheme(selectedTheme);
            setShowWizard(false);
          }}
          onClose={() => setShowWizard(false)}
        />
      )}
    </div>
  );
}

// ==================== THEMES TAB ====================
function ThemesTab({ themes, categories, selectedCategory, onCategoryChange, currentTheme, onApplyTheme }) {
  return (
    <div className="p-4 space-y-4">
      <div>
        <h3 className="font-semibold text-slate-900 mb-2">Plantillas Profesionales</h3>
        <p className="text-xs text-slate-600">
          17 plantillas prediseÃ±adas para diferentes tipos de negocios
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(categories).map(([key, cat]) => (
          <button
            key={key}
            onClick={() => onCategoryChange(key)}
            className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all ${
              selectedCategory === key
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {cat.icon} {cat.label}
          </button>
        ))}
      </div>

      {/* Themes Grid */}
      <div className="grid gap-3">
        {themes.map((theme) => (
          <button
            key={theme.id}
            onClick={() => onApplyTheme(theme.id)}
            className={`relative p-4 rounded-lg border-2 transition-all text-left hover:shadow-md ${
              currentTheme === theme.id
                ? 'border-blue-600 bg-blue-50'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="text-3xl">{theme.preview}</div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-slate-900 flex items-center gap-2">
                  {theme.name}
                  {currentTheme === theme.id && (
                    <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">Activo</span>
                  )}
                </h4>
                <p className="text-xs text-slate-600 mt-1">{theme.description}</p>
                <span className="inline-block mt-2 text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                  {categories[theme.category]?.label}
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>

      {themes.length === 0 && (
        <div className="text-center py-8 text-slate-500">
          <p>No se encontraron plantillas</p>
          <p className="text-sm mt-2">Intenta con otra bÃºsqueda o categorÃ­a</p>
        </div>
      )}
    </div>
  );
}

// ==================== COLORS TAB ====================
function ColorsTab({ colors, onChange }) {
  // Paletas predefinidas sugeridas
  const suggestedPalettes = [
    {
      name: 'Profesional Azul',
      icon: 'ðŸ’¼',
      colors: {
        primary: '#2563eb',
        secondary: '#1e40af',
        accent: '#3b82f6',
        background: '#ffffff',
        surface: '#f8fafc',
        border: '#e2e8f0',
        text: '#1e293b',
        textSecondary: '#64748b',
        success: '#10b981',
        error: '#ef4444',
        warning: '#f59e0b',
      }
    },
    {
      name: 'Elegante PÃºrpura',
      icon: 'ðŸ‘‘',
      colors: {
        primary: '#9333ea',
        secondary: '#7c3aed',
        accent: '#a855f7',
        background: '#faf5ff',
        surface: '#f3e8ff',
        border: '#e9d5ff',
        text: '#581c87',
        textSecondary: '#7c3aed',
        success: '#10b981',
        error: '#ef4444',
        warning: '#f59e0b',
      }
    },
    {
      name: 'Moderno Verde',
      icon: 'ðŸŒ¿',
      colors: {
        primary: '#059669',
        secondary: '#047857',
        accent: '#10b981',
        background: '#ffffff',
        surface: '#f0fdf4',
        border: '#d1fae5',
        text: '#064e3b',
        textSecondary: '#047857',
        success: '#10b981',
        error: '#ef4444',
        warning: '#f59e0b',
      }
    },
    {
      name: 'CÃ¡lido Naranja',
      icon: 'ðŸ”¥',
      colors: {
        primary: '#ea580c',
        secondary: '#c2410c',
        accent: '#f97316',
        background: '#ffffff',
        surface: '#fff7ed',
        border: '#fed7aa',
        text: '#7c2d12',
        textSecondary: '#9a3412',
        success: '#10b981',
        error: '#ef4444',
        warning: '#f59e0b',
      }
    },
    {
      name: 'Oscuro Elegante',
      icon: 'ðŸŒ™',
      colors: {
        primary: '#6366f1',
        secondary: '#4f46e5',
        accent: '#818cf8',
        background: '#0f172a',
        surface: '#1e293b',
        border: '#334155',
        text: '#f1f5f9',
        textSecondary: '#cbd5e1',
        success: '#10b981',
        error: '#ef4444',
        warning: '#f59e0b',
      }
    },
    {
      name: 'Rosa Femenino',
      icon: 'ðŸ’•',
      colors: {
        primary: '#ec4899',
        secondary: '#db2777',
        accent: '#f472b6',
        background: '#fdf2f8',
        surface: '#fce7f3',
        border: '#fbcfe8',
        text: '#831843',
        textSecondary: '#9d174d',
        success: '#10b981',
        error: '#ef4444',
        warning: '#f59e0b',
      }
    }
  ];

  const colorGroups = [
    {
      title: 'ðŸŽ¨ Colores de Marca',
      description: 'Definen la identidad visual de tu negocio',
      colors: [
        { key: 'primary', label: 'Primario', description: 'Color principal de marca (botones, links)', preview: 'button' },
        { key: 'secondary', label: 'Secundario', description: 'Color complementario (hover, detalles)', preview: 'badge' },
        { key: 'accent', label: 'Acento', description: 'Para destacar elementos importantes', preview: 'highlight' },
      ],
    },
    {
      title: 'ðŸ  Fondos y Superficies',
      description: 'Colores de fondo y contenedores',
      colors: [
        { key: 'background', label: 'Fondo Principal', description: 'Fondo de la pÃ¡gina', preview: 'page' },
        { key: 'surface', label: 'Superficie', description: 'Tarjetas, paneles, modales', preview: 'card' },
        { key: 'border', label: 'Bordes', description: 'LÃ­neas divisorias y bordes', preview: 'border' },
      ],
    },
    {
      title: 'âœï¸ Texto',
      description: 'Colores de contenido textual',
      colors: [
        { key: 'text', label: 'Texto Principal', description: 'TÃ­tulos y contenido importante', preview: 'text-dark' },
        { key: 'textSecondary', label: 'Texto Secundario', description: 'Descripciones y textos de apoyo', preview: 'text-light' },
      ],
    },
    {
      title: 'âš¡ Estados y Mensajes',
      description: 'Colores para feedback del sistema',
      colors: [
        { key: 'success', label: 'Ã‰xito', description: 'Confirmaciones positivas', preview: 'success' },
        { key: 'error', label: 'Error', description: 'Alertas y errores', preview: 'error' },
        { key: 'warning', label: 'Advertencia', description: 'Avisos importantes', preview: 'warning' },
      ],
    },
  ];

  const getPreviewElement = (type, color) => {
    switch (type) {
      case 'button':
        return (
          <div style={{ backgroundColor: color }} className="px-3 py-1.5 rounded-lg text-white text-xs font-medium shadow-sm">
            BotÃ³n
          </div>
        );
      case 'badge':
        return (
          <div style={{ backgroundColor: color }} className="px-2 py-1 rounded-full text-white text-[10px] font-medium">
            Badge
          </div>
        );
      case 'highlight':
        return (
          <div className="text-xs px-2 py-1 rounded" style={{ backgroundColor: color + '20', color: color }}>
            Destacado
          </div>
        );
      case 'page':
        return (
          <div style={{ backgroundColor: color }} className="w-full h-8 rounded border border-slate-300"></div>
        );
      case 'card':
        return (
          <div style={{ backgroundColor: color }} className="w-full h-8 rounded border border-slate-300 shadow-sm"></div>
        );
      case 'border':
        return (
          <div className="w-full h-8 rounded bg-white" style={{ borderWidth: '2px', borderColor: color, borderStyle: 'solid' }}></div>
        );
      case 'text-dark':
        return (
          <p style={{ color: color }} className="text-sm font-semibold">Texto principal</p>
        );
      case 'text-light':
        return (
          <p style={{ color: color }} className="text-xs">Texto secundario</p>
        );
      case 'success':
      case 'error':
      case 'warning':
        return (
          <div style={{ backgroundColor: color + '20', color: color, borderColor: color }} className="px-2 py-1 rounded border text-xs font-medium">
            Mensaje
          </div>
        );
      default:
        return <div style={{ backgroundColor: color }} className="w-8 h-8 rounded-lg border border-slate-300"></div>;
    }
  };

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div>
        <h3 className="font-semibold text-slate-900 text-lg flex items-center gap-2">
          <span className="text-2xl">ðŸŒˆ</span>
          Paleta de Colores
        </h3>
        <p className="text-sm text-slate-600 mt-1">
          Define la identidad visual de tu tienda
        </p>
      </div>

      {/* Paletas Sugeridas */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-slate-900">âœ¨ Paletas Sugeridas</h4>
          <span className="text-xs text-slate-500">Haz clic para aplicar</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {suggestedPalettes.map((palette, idx) => (
            <button
              key={idx}
              onClick={() => onChange(palette.colors)}
              className="p-3 bg-white border-2 border-slate-200 rounded-xl hover:border-blue-400 hover:shadow-lg transition-all group"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{palette.icon}</span>
                <span className="text-xs font-semibold text-slate-900 group-hover:text-blue-600">
                  {palette.name}
                </span>
              </div>
              <div className="flex gap-1">
                <div style={{ backgroundColor: palette.colors.primary }} className="flex-1 h-6 rounded-l-lg border border-slate-200"></div>
                <div style={{ backgroundColor: palette.colors.secondary }} className="flex-1 h-6 border-y border-slate-200"></div>
                <div style={{ backgroundColor: palette.colors.accent }} className="flex-1 h-6 rounded-r-lg border border-slate-200"></div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="border-t border-slate-200 pt-4"></div>

      {/* Color Groups con Preview Mejorado */}
      {colorGroups.map((group, groupIdx) => (
        <div key={groupIdx} className="space-y-4">
          <div>
            <h4 className="text-sm font-semibold text-slate-900">{group.title}</h4>
            <p className="text-xs text-slate-500 mt-0.5">{group.description}</p>
          </div>
          
          <div className="space-y-4">
            {group.colors.map(({ key, label, description, preview }) => (
              <div key={key} className="p-4 bg-gradient-to-r from-slate-50 to-white rounded-xl border border-slate-200">
                <div className="flex items-start gap-3">
                  {/* Color Picker Grande */}
                  <div className="flex-shrink-0">
                    <input
                      type="color"
                      value={colors[key]}
                      onChange={(e) => onChange({ ...colors, [key]: e.target.value })}
                      className="w-16 h-16 rounded-xl border-2 border-slate-300 cursor-pointer shadow-sm hover:shadow-md transition-shadow"
                    />
                  </div>

                  {/* Info y Hex Input */}
                  <div className="flex-1 space-y-2">
                    <div>
                      <label className="block text-sm font-semibold text-slate-900">
                        {label}
                      </label>
                      <p className="text-xs text-slate-600">{description}</p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={colors[key]}
                        onChange={(e) => onChange({ ...colors, [key]: e.target.value })}
                        className="flex-1 px-3 py-1.5 text-sm border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="#000000"
                      />
                      <button
                        onClick={() => navigator.clipboard.writeText(colors[key])}
                        className="px-2 py-1.5 text-xs bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                        title="Copiar color"
                      >
                        ðŸ“‹
                      </button>
                    </div>

                    {/* Preview en Contexto */}
                    <div className="flex items-center gap-2 pt-2">
                      <span className="text-xs text-slate-500">Vista:</span>
                      {getPreviewElement(preview, colors[key])}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Tip de Accesibilidad */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-900">
          <span className="font-semibold">ðŸ’¡ Tip:</span> AsegÃºrate de que haya suficiente contraste entre el texto y el fondo para mejor legibilidad (mÃ­nimo 4.5:1)
        </p>
      </div>
    </div>
  );
}


// ==================== CONTENT + TEXT TAB (UNIFICADO) ====================
function ContentTextTab({ storeData, onStoreUpdate }) {
  return (
    <div className="p-4 space-y-6">
      <div>
        <h3 className="font-semibold text-slate-900 text-lg">ðŸ“ Contenido de la Tienda</h3>
        <p className="text-sm text-slate-600 mt-1">
          Edita la informaciÃ³n bÃ¡sica de tu tienda
        </p>
      </div>

      <div className="space-y-4 p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border-2 border-blue-200">
        <h4 className="font-semibold text-blue-900">ðŸ“‹ InformaciÃ³n BÃ¡sica</h4>
        
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Nombre de la Tienda
            </label>
            <input
              type="text"
              defaultValue={storeData?.name || ''}
              onBlur={(e) => onStoreUpdate('name', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Ej: Mi Negocio"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Descripción
            </label>
            <textarea
              defaultValue={storeData?.description || ''}
              onBlur={(e) => onStoreUpdate('description', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Describe tu negocio..."
            />
          </div>
        </div>
      </div>

      <div className="space-y-4 p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border-2 border-green-200">
        <h4 className="font-semibold text-green-900">ðŸ“ž Contacto</h4>
        
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Dirección
            </label>
            <input
              type="text"
              defaultValue={storeData?.direccion || ''}
              onBlur={(e) => onStoreUpdate('direccion', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              placeholder="Av. Principal 123"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Teléfono
              </label>
              <input
                type="tel"
                defaultValue={storeData?.phone || ''}
                onBlur={(e) => onStoreUpdate('phone', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                placeholder="+1 234 567 890"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Email
              </label>
              <input
                type="email"
                defaultValue={storeData?.email || ''}
                onBlur={(e) => onStoreUpdate('email', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                placeholder="contacto@tienda.com"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== TYPOGRAPHY TAB ====================
function TypographyTab({ typography, onChange }) {
  return (
    <div className="p-4 space-y-6">
      <div>
        <h3 className="font-semibold text-slate-900 text-lg">âœï¸ TipografÃ­a</h3>
        <p className="text-sm text-slate-600 mt-1">
          Personaliza las fuentes y estilos de texto
        </p>
      </div>

      <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
        <p className="text-sm text-slate-600">Configuración de tipografía disponible próximamente.</p>
      </div>
    </div>
  );
}
// ==================== EFFECTS TAB (NUEVO) ====================
function EffectsTab({ effects, onChange }) {
  const particlePresets = [
    { 
      type: 'dots', 
      label: 'âš« Puntos', 
      desc: 'PartÃ­culas circulares clÃ¡sicas',
      density: 50,
      preview: 'Â· Â· Â· Â· Â·'
    },
    { 
      type: 'stars', 
      label: 'â­ Estrellas', 
      desc: 'Perfectas para negocios creativos',
      density: 30,
      preview: 'â˜… â˜… â˜… â˜… â˜…'
    },
    { 
      type: 'bubbles', 
      label: 'ðŸ«§ Burbujas', 
      desc: 'Ideales para servicios de spa',
      density: 40,
      preview: 'â—‹ â—‹ â—‹ â—‹ â—‹'
    },
    { 
      type: 'snow', 
      label: 'â„ï¸ Nieve', 
      desc: 'Efecto invernal suave',
      density: 60,
      preview: '* * * * *'
    },
    { 
      type: 'hearts', 
      label: 'ðŸ’ Corazones', 
      desc: 'Ideal para negocios romÃ¡nticos',
      density: 35,
      preview: 'â™¥ â™¥ â™¥ â™¥ â™¥'
    },
    { 
      type: 'sparkles', 
      label: 'âœ¨ Destellos', 
      desc: 'Elegante y sofisticado',
      density: 45,
      preview: 'âœ¦ âœ¦ âœ¦ âœ¦ âœ¦'
    },
    { 
      type: 'confetti', 
      label: 'ðŸŽŠ Confeti', 
      desc: 'Para eventos y celebraciones',
      density: 70,
      preview: 'â–ª â–« â–ª â–« â–ª'
    },
    { 
      type: 'leaves', 
      label: 'ðŸƒ Hojas', 
      desc: 'Perfecto para negocios eco',
      density: 40,
      preview: 'ðŸ‚ ðŸ‚ ðŸ‚ ðŸ‚ ðŸ‚'
    },
  ];

  return (
    <div className="p-4 space-y-6">
      <div>
        <h3 className="font-semibold text-slate-900">Efectos Visuales</h3>
        <p className="text-xs text-slate-600 mt-1">
          Agrega animaciones y efectos modernos
        </p>
      </div>

      {/* Animaciones */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-slate-700 border-b border-slate-200 pb-2">
          âš¡ Animaciones
        </h4>
        
        <label className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer">
          <div>
            <span className="text-sm font-medium text-slate-700">Animaciones Habilitadas</span>
            <p className="text-xs text-slate-500">Transiciones suaves al navegar</p>
          </div>
          <input
            type="checkbox"
            checked={effects.animations}
            onChange={(e) => onChange({ ...effects, animations: e.target.checked })}
            className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
          />
        </label>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">
            Velocidad
          </label>
          <div className="grid grid-cols-3 gap-2">
            {['slow', 'normal', 'fast'].map(speed => (
              <button
                key={speed}
                onClick={() => onChange({ ...effects, animationSpeed: speed })}
                className={`p-2 text-sm rounded-lg border-2 transition-all ${
                  (effects.animationSpeed || 'normal') === speed
                    ? 'border-blue-600 bg-blue-50 text-blue-900'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {speed === 'slow' ? 'Lenta' : speed === 'normal' ? 'Normal' : 'RÃ¡pida'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Efectos de Scroll */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-slate-700 border-b border-slate-200 pb-2">
          ðŸ“œ Efectos de Scroll
        </h4>
        
        <label className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer">
          <div>
            <span className="text-sm font-medium text-slate-700">Scroll Suave</span>
            <p className="text-xs text-slate-500">Desplazamiento animado</p>
          </div>
          <input
            type="checkbox"
            checked={effects.smoothScroll}
            onChange={(e) => onChange({ ...effects, smoothScroll: e.target.checked })}
            className="w-5 h-5 text-blue-600 rounded"
          />
        </label>

        <label className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer">
          <div>
            <span className="text-sm font-medium text-slate-700">Revelar al Hacer Scroll</span>
            <p className="text-xs text-slate-500">Elementos aparecen progresivamente</p>
          </div>
          <input
            type="checkbox"
            checked={effects.scrollReveal}
            onChange={(e) => onChange({ ...effects, scrollReveal: e.target.checked })}
            className="w-5 h-5 text-blue-600 rounded"
          />
        </label>

        <label className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer">
          <div>
            <span className="text-sm font-medium text-slate-700">Efecto Parallax</span>
            <p className="text-xs text-slate-500">Fondo se mueve a diferente velocidad</p>
          </div>
          <input
            type="checkbox"
            checked={effects.parallax}
            onChange={(e) => onChange({ ...effects, parallax: e.target.checked })}
            className="w-5 h-5 text-blue-600 rounded"
          />
        </label>
      </div>

      {/* Efectos Visuales Modernos */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-slate-700 border-b border-slate-200 pb-2">
          âœ¨ Efectos Modernos
        </h4>
        
        <label className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg hover:from-blue-100 hover:to-purple-100 transition-colors cursor-pointer border border-blue-200">
          <div>
            <span className="text-sm font-medium text-slate-700">Glassmorphism</span>
            <p className="text-xs text-slate-500">Efecto de vidrio esmerilado</p>
          </div>
          <input
            type="checkbox"
            checked={effects.glassmorphism}
            onChange={(e) => onChange({ ...effects, glassmorphism: e.target.checked })}
            className="w-5 h-5 text-blue-600 rounded"
          />
        </label>

        <label className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer">
          <div>
            <span className="text-sm font-medium text-slate-700">Neomorphism</span>
            <p className="text-xs text-slate-500">Estilo soft UI</p>
          </div>
          <input
            type="checkbox"
            checked={effects.neomorphism}
            onChange={(e) => onChange({ ...effects, neomorphism: e.target.checked })}
            className="w-5 h-5 text-blue-600 rounded"
          />
        </label>

        <label className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer">
          <div>
            <span className="text-sm font-medium text-slate-700">Sombras 3D</span>
            <p className="text-xs text-slate-500">Profundidad con sombras</p>
          </div>
          <input
            type="checkbox"
            checked={effects.shadows3D}
            onChange={(e) => onChange({ ...effects, shadows3D: e.target.checked })}
            className="w-5 h-5 text-blue-600 rounded"
          />
        </label>

        <label className="flex items-center justify-between p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg hover:from-yellow-100 hover:to-orange-100 transition-colors cursor-pointer border border-yellow-200">
          <div>
            <span className="text-sm font-medium text-slate-700">Resplandor (Glow)</span>
            <p className="text-xs text-slate-500">Efectos de luz y brillo</p>
          </div>
          <input
            type="checkbox"
            checked={effects.glow}
            onChange={(e) => onChange({ ...effects, glow: e.target.checked })}
            className="w-5 h-5 text-blue-600 rounded"
          />
        </label>

        <label className="flex items-center justify-between p-3 bg-gradient-to-r from-pink-50 to-red-50 rounded-lg hover:from-pink-100 hover:to-red-100 transition-colors cursor-pointer border border-pink-200">
          <div>
            <span className="text-sm font-medium text-slate-700">Gradiente Animado</span>
            <p className="text-xs text-slate-500">Fondos con degradados en movimiento</p>
          </div>
          <input
            type="checkbox"
            checked={effects.animatedGradient}
            onChange={(e) => onChange({ ...effects, animatedGradient: e.target.checked })}
            className="w-5 h-5 text-blue-600 rounded"
          />
        </label>

        <label className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-teal-50 rounded-lg hover:from-green-100 hover:to-teal-100 transition-colors cursor-pointer border border-green-200">
          <div>
            <span className="text-sm font-medium text-slate-700">Hover Flotante</span>
            <p className="text-xs text-slate-500">Elementos flotan al pasar el mouse</p>
          </div>
          <input
            type="checkbox"
            checked={effects.floatingHover}
            onChange={(e) => onChange({ ...effects, floatingHover: e.target.checked })}
            className="w-5 h-5 text-blue-600 rounded"
          />
        </label>

        <label className="flex items-center justify-between p-3 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg hover:from-indigo-100 hover:to-blue-100 transition-colors cursor-pointer border border-indigo-200">
          <div>
            <span className="text-sm font-medium text-slate-700">Efecto Blur (Desenfoque)</span>
            <p className="text-xs text-slate-500">Desenfoque selectivo en fondo</p>
          </div>
          <input
            type="checkbox"
            checked={effects.blur}
            onChange={(e) => onChange({ ...effects, blur: e.target.checked })}
            className="w-5 h-5 text-blue-600 rounded"
          />
        </label>

        <label className="flex items-center justify-between p-3 bg-gradient-to-r from-rose-50 to-orange-50 rounded-lg hover:from-rose-100 hover:to-orange-100 transition-colors cursor-pointer border border-rose-200">
          <div>
            <span className="text-sm font-medium text-slate-700">Cambio de Color DinÃ¡mico</span>
            <p className="text-xs text-slate-500">TransiciÃ³n de colores suave</p>
          </div>
          <input
            type="checkbox"
            checked={effects.colorShift}
            onChange={(e) => onChange({ ...effects, colorShift: e.target.checked })}
            className="w-5 h-5 text-blue-600 rounded"
          />
        </label>

        <label className="flex items-center justify-between p-3 bg-gradient-to-r from-violet-50 to-purple-50 rounded-lg hover:from-violet-100 hover:to-purple-100 transition-colors cursor-pointer border border-violet-200">
          <div>
            <span className="text-sm font-medium text-slate-700">Efecto Morphing</span>
            <p className="text-xs text-slate-500">Transformaciones fluidas</p>
          </div>
          <input
            type="checkbox"
            checked={effects.morphing}
            onChange={(e) => onChange({ ...effects, morphing: e.target.checked })}
            className="w-5 h-5 text-blue-600 rounded"
          />
        </label>

        <label className="flex items-center justify-between p-3 bg-gradient-to-r from-cyan-50 to-sky-50 rounded-lg hover:from-cyan-100 hover:to-sky-100 transition-colors cursor-pointer border border-cyan-200">
          <div>
            <span className="text-sm font-medium text-slate-700">Ondas al Hacer Clic</span>
            <p className="text-xs text-slate-500">Efecto ripple en interacciones</p>
          </div>
          <input
            type="checkbox"
            checked={effects.ripple}
            onChange={(e) => onChange({ ...effects, ripple: e.target.checked })}
            className="w-5 h-5 text-blue-600 rounded"
          />
        </label>

        <label className="flex items-center justify-between p-3 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg hover:from-amber-100 hover:to-yellow-100 transition-colors cursor-pointer border border-amber-200">
          <div>
            <span className="text-sm font-medium text-slate-700">Efecto HologrÃ¡fico</span>
            <p className="text-xs text-slate-500">Reflejo iridiscente moderno</p>
          </div>
          <input
            type="checkbox"
            checked={effects.holographic}
            onChange={(e) => onChange({ ...effects, holographic: e.target.checked })}
            className="w-5 h-5 text-blue-600 rounded"
          />
        </label>
      </div>

      {/* PartÃ­culas (SIMPLIFICADO) */}
      <div className="space-y-4 p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-purple-900">ðŸŽ¨ PartÃ­culas Decorativas</h4>
            <p className="text-xs text-purple-600 mt-1">Elementos animados de fondo</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={effects.particles?.enabled}
              onChange={(e) => {
                const newParticles = e.target.checked 
                  ? { enabled: true, type: 'dots', density: 50 }
                  : { enabled: false };
                onChange({ ...effects, particles: newParticles });
              }}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
          </label>
        </div>

        {effects.particles?.enabled && (
          <div className="space-y-4 mt-4">
            {/* Presets Visuales */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-purple-900">
                Tipo de PartÃ­cula
              </label>
              <div className="grid grid-cols-4 gap-2">
                {particlePresets.map(preset => (
                  <button
                    key={preset.type}
                    onClick={() => onChange({ 
                      ...effects, 
                      particles: { 
                        enabled: true, 
                        type: preset.type,
                        density: preset.density
                      } 
                    })}
                    className={`p-3 text-left rounded-lg border-2 transition-all ${
                      effects.particles?.type === preset.type
                        ? 'border-purple-600 bg-purple-100 shadow-lg scale-105'
                        : 'border-purple-200 bg-white hover:border-purple-400 hover:shadow'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-slate-700">{preset.label}</span>
                      {effects.particles?.type === preset.type && (
                        <span className="text-xs text-purple-600">âœ“</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mb-1">{preset.desc}</p>
                    <div className="text-center text-slate-400 text-lg font-mono tracking-wider">
                      {preset.preview}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Densidad con indicador visual */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-purple-900">
                  Cantidad de PartÃ­culas
                </label>
                <span className="text-sm font-semibold text-purple-700">
                  {effects.particles?.density || 50}
                  {effects.particles?.density < 30 ? ' (Pocas)' : 
                   effects.particles?.density < 70 ? ' (Normal)' : ' (Muchas)'}
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="150"
                step="10"
                value={effects.particles?.density || 50}
                onChange={(e) => onChange({ 
                  ...effects, 
                  particles: { ...effects.particles, density: parseInt(e.target.value) } 
                })}
                className="w-full h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
              />
              <div className="flex justify-between text-xs text-purple-600">
                <span>Pocas (10)</span>
                <span>Normal (50)</span>
                <span>Muchas (150)</span>
              </div>
            </div>

            {/* Preview Mini */}
            <div className="relative h-24 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg overflow-hidden border border-purple-200">
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-xs text-purple-600 font-medium">Vista previa de partÃ­culas</p>
              </div>
              {/* SimulaciÃ³n visual simple */}
              <div className="absolute inset-0 pointer-events-none opacity-40">
                {Array.from({ length: Math.floor((effects.particles?.density || 50) / 10) }).map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-2 h-2 bg-purple-500 rounded-full animate-pulse"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                      animationDelay: `${Math.random() * 2}s`
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tip */}
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <p className="text-sm text-amber-900">
          <strong>ðŸ’¡ Tip:</strong> Las partÃ­culas son perfectas para dar vida a tu tienda, 
          pero Ãºsalas con moderaciÃ³n. Menos es mÃ¡s cuando se trata de efectos visuales.
        </p>
      </div>
    </div>
  );
}

// ==================== COMPONENTS TAB ====================
function ComponentsTab({ components, onChange }) {
  return (
    <div className="p-4 space-y-6">
      <div>
        <h3 className="font-semibold text-slate-900">Componentes</h3>
        <p className="text-xs text-slate-600 mt-1">
          Personaliza botones, tarjetas y mÃ¡s
        </p>
      </div>

      {/* Botones */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-slate-700 border-b border-slate-200 pb-2">
          Botones
        </h4>
        
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">Estilo</label>
          <select
            value={components.buttons.style}
            onChange={(e) => onChange({ 
              ...components, 
              buttons: { ...components.buttons, style: e.target.value } 
            })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg"
          >
            <option value="filled">SÃ³lido</option>
            <option value="outline">Contorno</option>
            <option value="ghost">Fantasma</option>
            <option value="soft">Suave</option>
            <option value="gradient">Degradado</option>
            <option value="glow">Resplandor</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">Redondez</label>
          <select
            value={components.buttons.roundness}
            onChange={(e) => onChange({ 
              ...components, 
              buttons: { ...components.buttons, roundness: e.target.value } 
            })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg"
          >
            <option value="none">Sin redondez</option>
            <option value="sm">PequeÃ±a</option>
            <option value="md">Media</option>
            <option value="lg">Grande</option>
            <option value="full">Completa</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">TamaÃ±o</label>
          <select
            value={components.buttons.size}
            onChange={(e) => onChange({ 
              ...components, 
              buttons: { ...components.buttons, size: e.target.value } 
            })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg"
          >
            <option value="sm">PequeÃ±o</option>
            <option value="md">Mediano</option>
            <option value="lg">Grande</option>
            <option value="xl">Extra Grande</option>
          </select>
        </div>
      </div>

      {/* Tarjetas */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-slate-700 border-b border-slate-200 pb-2">
          Tarjetas
        </h4>
        
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">Estilo</label>
          <select
            value={components.cards.style}
            onChange={(e) => onChange({ 
              ...components, 
              cards: { ...components.cards, style: e.target.value } 
            })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg"
          >
            <option value="elevated">Elevada</option>
            <option value="outlined">Contorno</option>
            <option value="flat">Plana</option>
            <option value="glass">Vidrio</option>
            <option value="neumorphic">NeumÃ³rfica</option>
            <option value="gradient">Degradado</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">Efecto Hover</label>
          <select
            value={components.cards.hoverEffect}
            onChange={(e) => onChange({ 
              ...components, 
              cards: { ...components.cards, hoverEffect: e.target.value } 
            })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg"
          >
            <option value="none">Ninguno</option>
            <option value="lift">Elevar</option>
            <option value="glow">Brillo</option>
            <option value="tilt">Inclinar</option>
            <option value="zoom">Zoom</option>
          </select>
        </div>
      </div>

      {/* Divisores */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-slate-700 border-b border-slate-200 pb-2">
          Divisores de SecciÃ³n
        </h4>
        
        <label className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
          <span className="text-sm font-medium text-slate-700">Activar Divisores</span>
          <input
            type="checkbox"
            checked={components.dividers?.enabled}
            onChange={(e) => onChange({ 
              ...components, 
              dividers: { ...components.dividers, enabled: e.target.checked } 
            })}
            className="w-5 h-5 text-blue-600 rounded"
          />
        </label>

        {components.dividers?.enabled && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">Estilo</label>
            <select
              value={components.dividers?.style || 'wave'}
              onChange={(e) => onChange({ 
                ...components, 
                dividers: { ...components.dividers, style: e.target.value } 
              })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
            >
              <option value="wave">Onda</option>
              <option value="curve">Curva</option>
              <option value="zigzag">Zigzag</option>
              <option value="slant">Diagonal</option>
              <option value="rounded">Redondeado</option>
            </select>
          </div>
        )}
      </div>
    </div>
  );
}

// ==================== LAYOUT TAB ====================
function LayoutTab({ layout, background, onLayoutChange, onBackgroundChange }) {
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      console.log('âŒ No se seleccionÃ³ ningÃºn archivo');
      return;
    }

    console.log('ðŸ“ Archivo seleccionado:', file.name, file.type, `${(file.size / 1024).toFixed(2)} KB`);

    // Validar que sea imagen
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona un archivo de imagen');
      return;
    }

    // Validar tamaÃ±o (mÃ¡x 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen es muy grande. MÃ¡ximo 5MB');
      return;
    }

    try {
      setUploadingImage(true);
      console.log('ðŸš€ Iniciando subida de imagen...');
      
      // Crear FormData
      const formData = new FormData();
      formData.append('file', file);

      const token = localStorage.getItem('token');
      console.log('ðŸ”‘ Token presente:', !!token);

      // Subir a tu endpoint de uploads
      const url = '/api/upload/background';
      console.log('ðŸ“¡ Enviando a:', url);
      
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('ðŸ“¥ Respuesta recibida:', response.status, response.statusText);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('âŒ Error del servidor:', errorData);
        throw new Error(errorData.message || 'Error al subir imagen');
      }

      const data = await response.json();
      console.log('âœ… Imagen subida exitosamente:', data);
      const imageUrl = data.url;

      // Actualizar el background con la URL
      onBackgroundChange({ 
        ...background, 
        mode: 'image',
        imageUrl: imageUrl 
      });

      alert('âœ… Imagen subida correctamente');
      console.log('ðŸŽ‰ Background actualizado con URL:', imageUrl);
    } catch (error) {
      console.error('ðŸ’¥ Error completo:', error);
      alert(`Error al subir imagen: ${error.message}`);
    } finally {
      setUploadingImage(false);
      // Limpiar el input para permitir re-seleccionar el mismo archivo
      e.target.value = '';
    }
  };

  return (
    <div className="p-4 space-y-6">
      <div>
        <h3 className="font-semibold text-slate-900 text-lg flex items-center gap-2">
          <span className="text-2xl">ðŸ“</span>
          DiseÃ±o y Fondo
        </h3>
        <p className="text-sm text-slate-600 mt-1">
          Configura la estructura y fondo de tu tienda
        </p>
      </div>

      {/* Layout Style */}
      <div className="space-y-3 p-4 bg-purple-50 rounded-lg border border-purple-200">
        <h4 className="text-sm font-semibold text-purple-900">ðŸ“‹ Estilo de PÃ¡gina</h4>
        <p className="text-xs text-purple-600 mb-2">
          Elige cÃ³mo se organiza el contenido en tu tienda
        </p>
        <select
          value={layout.style}
          onChange={(e) => onLayoutChange({ ...layout, style: e.target.value })}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
        >
          <option value="hero-top">ðŸ” Hero Arriba - Banner grande en la parte superior</option>
          <option value="hero-center">â­• Hero Centrado - Contenido centrado verticalmente</option>
          <option value="hero-split">â†”ï¸ Hero Dividido - Imagen a un lado, texto al otro</option>
          <option value="minimal">âšª Minimalista - DiseÃ±o limpio y simple</option>
          <option value="cards-grid">ðŸ”² Grid de Tarjetas - Layout tipo galerÃ­a</option>
        </select>
      </div>

      {/* Background Mode */}
      <div className="space-y-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h4 className="text-sm font-semibold text-blue-900">ðŸŽ¨ Tipo de Fondo</h4>
        <select
          value={background.mode}
          onChange={(e) => onBackgroundChange({ ...background, mode: e.target.value })}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="solid">ðŸŽ¨ Color SÃ³lido</option>
          <option value="gradient">ðŸŒˆ Degradado</option>
          <option value="image">ðŸ–¼ï¸ Imagen Personalizada</option>
          <option value="pattern">ðŸ”· PatrÃ³n Decorativo</option>
        </select>

        {/* Upload de Imagen */}
        {background.mode === 'image' && (
          <div className="mt-4 space-y-3">
            <label className="block text-sm font-medium text-slate-700">
              Subir Imagen de Fondo
            </label>
            
            {background.imageUrl && (
              <div className="relative rounded-lg overflow-hidden border-2 border-blue-300">
                <img 
                  src={background.imageUrl} 
                  alt="Fondo actual" 
                  className="w-full h-32 object-cover"
                />
                <div className="absolute top-2 right-2">
                  <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded">Actual</span>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <label className="flex-1 cursor-pointer">
                <div className={`border-2 border-dashed rounded-lg p-4 text-center transition-all ${
                  uploadingImage 
                    ? 'border-blue-400 bg-blue-50' 
                    : 'border-slate-300 hover:border-blue-400 hover:bg-blue-50'
                }`}>
                  {uploadingImage ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                      <span className="text-sm text-blue-600">Subiendo...</span>
                    </div>
                  ) : (
                    <>
                      <div className="text-3xl mb-2">ðŸ“¤</div>
                      <p className="text-sm font-medium text-slate-700">Haz clic para subir imagen</p>
                      <p className="text-xs text-slate-500 mt-1">JPG, PNG, WEBP (MÃ¡x. 5MB)</p>
                    </>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                  className="hidden"
                />
              </label>
            </div>

            {background.imageUrl && (
              <button
                onClick={() => onBackgroundChange({ ...background, imageUrl: null })}
                className="w-full px-3 py-2 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors border border-red-200"
              >
                ðŸ—‘ï¸ Eliminar Imagen
              </button>
            )}
          </div>
        )}

        {/* PatrÃ³n */}
        {background.mode === 'pattern' && (
          <div className="mt-4 space-y-2">
            <label className="block text-sm font-medium text-slate-700">PatrÃ³n</label>
            <select
              value={background.pattern?.type || 'dots'}
              onChange={(e) => onBackgroundChange({ 
                ...background, 
                pattern: { ...background.pattern, type: e.target.value } 
              })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
            >
              <option value="dots">âš« Puntos</option>
              <option value="waves">ðŸŒŠ Ondas</option>
              <option value="lines">ðŸ“ LÃ­neas</option>
              <option value="mesh">ðŸ•¸ï¸ Malla</option>
              <option value="grid">â¬œ CuadrÃ­cula</option>
              <option value="hexagons">â¬¡ HexÃ¡gonos</option>
            </select>
          </div>
        )}
      </div>

      {/* Spacing */}
      <div className="space-y-3 p-4 bg-green-50 rounded-lg border border-green-200">
        <h4 className="text-sm font-semibold text-green-900">ðŸ“ Espaciado</h4>
        <p className="text-xs text-green-600 mb-2">
          Controla el espacio entre elementos
        </p>
        <select
          value={layout.spacing}
          onChange={(e) => onLayoutChange({ ...layout, spacing: e.target.value })}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500"
        >
          <option value="compact">ðŸ“¦ Compacto - Menos espacio, mÃ¡s contenido visible</option>
          <option value="normal">ðŸ“„ Normal - Equilibrio perfecto</option>
          <option value="relaxed">ðŸŒ… Relajado - MÃ¡s espacio, diseÃ±o aireado</option>
        </select>
      </div>

      {/* Tip */}
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <p className="text-sm text-amber-900">
          <span className="font-semibold">ðŸ’¡ Tip:</span> Para imÃ¡genes de fondo, usa imÃ¡genes de alta calidad pero optimizadas. 
          Recomendado: 1920x1080px, formato WebP o JPG optimizado.
        </p>
      </div>
    </div>
  );
}

// ==================== CONTENT TAB ====================
function ContentTab({ storeData, appearance, onChange }) {
  return (
    <div className="p-4 space-y-6">
      <div>
        <h3 className="font-semibold text-slate-900 text-lg">ðŸ“ GestiÃ³n de Contenido</h3>
        <p className="text-sm text-slate-600 mt-1">
          Personaliza todos los textos de tu tienda
        </p>
      </div>

      {/* Hero Section */}
      <div className="space-y-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h4 className="font-semibold text-slate-900 flex items-center gap-2">
          <span className="text-xl">ðŸŽ¯</span>
          SecciÃ³n Hero (Principal)
        </h4>
        
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              TÃ­tulo Principal
            </label>
            <input
              type="text"
              defaultValue={storeData?.name || 'Mi Tienda'}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Ej: Bienvenido a Mi Negocio"
            />
            <p className="text-xs text-slate-500 mt-1">Este es el tÃ­tulo mÃ¡s grande que verÃ¡n tus clientes</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              DescripciÃ³n / Eslogan
            </label>
            <textarea
              defaultValue={storeData?.description || 'DescripciÃ³n de tu negocio'}
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Ej: La mejor experiencia en servicios profesionales"
            />
            <p className="text-xs text-slate-500 mt-1">Describe brevemente quÃ© ofreces</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Texto del BotÃ³n Principal
            </label>
            <input
              type="text"
              defaultValue="Reservar Ahora"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Ej: Reservar Ahora, Ver Servicios, Comprar"
            />
          </div>
        </div>
      </div>

      {/* Services/Products Section */}
      <div className="space-y-3 p-4 bg-purple-50 rounded-lg border border-purple-200">
        <h4 className="font-semibold text-slate-900 flex items-center gap-2">
          <span className="text-xl">
            {storeData?.businessType === 'bookings' ? 'â°' : 'ðŸ“¦'}
          </span>
          SecciÃ³n de {storeData?.businessType === 'bookings' ? 'Servicios' : 'Productos'}
        </h4>
        
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              TÃ­tulo de la SecciÃ³n
            </label>
            <input
              type="text"
              defaultValue={storeData?.businessType === 'bookings' ? 'Nuestros Servicios' : 'Nuestros Productos'}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              DescripciÃ³n de la SecciÃ³n
            </label>
            <textarea
              defaultValue={storeData?.businessType === 'bookings' 
                ? 'Descubre nuestra variedad de servicios profesionales' 
                : 'Explora nuestro catÃ¡logo de productos'}
              rows={2}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>
      </div>

      {/* About Section */}
      <div className="space-y-3 p-4 bg-green-50 rounded-lg border border-green-200">
        <h4 className="font-semibold text-slate-900 flex items-center gap-2">
          <span className="text-xl">â„¹ï¸</span>
          SecciÃ³n "Acerca de"
        </h4>
        
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              TÃ­tulo
            </label>
            <input
              type="text"
              defaultValue="Sobre Nosotros"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Contenido
            </label>
            <textarea
              defaultValue="Somos un equipo comprometido con la excelencia y la satisfacciÃ³n de nuestros clientes."
              rows={4}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500"
              placeholder="Cuenta tu historia, misiÃ³n, valores..."
            />
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="space-y-3 p-4 bg-orange-50 rounded-lg border border-orange-200">
        <h4 className="font-semibold text-slate-900 flex items-center gap-2">
          <span className="text-xl">ðŸ“ž</span>
          InformaciÃ³n de Contacto
        </h4>
        
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              TÃ­tulo de Contacto
            </label>
            <input
              type="text"
              defaultValue="ContÃ¡ctanos"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Mensaje de Contacto
            </label>
            <textarea
              defaultValue="Â¿Tienes preguntas? Estamos aquÃ­ para ayudarte."
              rows={2}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="space-y-3 p-4 bg-slate-100 rounded-lg border border-slate-300">
        <h4 className="font-semibold text-slate-900 flex items-center gap-2">
          <span className="text-xl">ðŸ”–</span>
          Pie de PÃ¡gina
        </h4>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Texto del Footer
          </label>
          <input
            type="text"
            defaultValue={`Â© ${new Date().getFullYear()} ${storeData?.name || 'Mi Tienda'}. Todos los derechos reservados.`}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
          />
        </div>
      </div>

      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-sm text-yellow-800">
          <span className="font-semibold">ðŸ’¡ Nota:</span> Estos cambios de contenido se guardarÃ¡n junto con tu diseÃ±o. 
          AsegÃºrate de hacer clic en "Guardar Cambios" al finalizar.
        </p>
      </div>
    </div>
  );
}

// ==================== SECTIONS TAB ====================
function SectionsTab({ sections, onChange }) {
  const sectionList = [
    { 
      key: 'hero', 
      label: 'Hero / Portada', 
      icon: 'ðŸŽ¯',
      description: 'SecciÃ³n principal con tu logo, nombre y descripciÃ³n del negocio. Primera impresiÃ³n.',
      example: 'Muestra: Logo + Nombre + DescripciÃ³n + BotÃ³n principal'
    },
    { 
      key: 'about', 
      label: 'Acerca de', 
      icon: 'ðŸ“',
      description: 'Cuenta tu historia, misiÃ³n y valores. ConÃ©ctate con tus clientes.',
      example: 'Muestra: Texto sobre tu negocio, historia, propuesta de valor'
    },
    { 
      key: 'services', 
      label: 'Servicios / Productos', 
      icon: 'ðŸ› ï¸',
      description: 'Muestra tus servicios (si eres de tipo agendamiento) o productos (si eres tienda).',
      example: 'Muestra: Grid con servicios/productos, precios, botÃ³n de acciÃ³n'
    },
    { 
      key: 'gallery', 
      label: 'GalerÃ­a', 
      icon: 'ðŸ–¼ï¸',
      description: 'Fotos de tu negocio, trabajos realizados, instalaciones o productos.',
      example: 'Muestra: Grid de imÃ¡genes con lightbox'
    },
    { 
      key: 'testimonials', 
      label: 'Testimonios', 
      icon: 'ðŸ’¬',
      description: 'ReseÃ±as y comentarios de clientes satisfechos. Genera confianza.',
      example: 'Muestra: Carrusel de testimonios con foto, nombre y comentario'
    },
    { 
      key: 'schedule', 
      label: 'Horarios', 
      icon: 'â°',
      description: 'Horario de atenciÃ³n de tu negocio. DÃ­as y horas en que estÃ¡s disponible.',
      example: 'Muestra: Tabla con dÃ­as de la semana y horarios'
    },
    { 
      key: 'contact', 
      label: 'Contacto', 
      icon: 'ðŸ“ž',
      description: 'InformaciÃ³n de contacto: direcciÃ³n, telÃ©fono, email, redes sociales.',
      example: 'Muestra: Ãconos + Datos de contacto + Mapa (opcional)'
    },
    { 
      key: 'booking', 
      label: 'Sistema de Reservas', 
      icon: 'ðŸ“…',
      description: 'Formulario para que clientes agenden citas (solo tiendas de agendamiento).',
      example: 'Muestra: Calendario + SelecciÃ³n de hora + Formulario'
    },
  ];

  return (
    <div className="p-4 space-y-6">
      <div>
        <h3 className="font-semibold text-slate-900 text-lg flex items-center gap-2">
          <span className="text-2xl">ðŸ“‹</span>
          Secciones Visibles
        </h3>
        <p className="text-sm text-slate-600 mt-1">
          Activa o desactiva secciones segÃºn lo que necesites mostrar en tu tienda
        </p>
      </div>

      <div className="space-y-3">
        {sectionList.map(({ key, label, icon, description, example }) => (
          <div
            key={key}
            className="p-4 bg-gradient-to-r from-slate-50 to-white rounded-xl border-2 border-slate-200 hover:border-blue-300 transition-all"
          >
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={sections[key]}
                onChange={(e) => onChange({ ...sections, [key]: e.target.checked })}
                className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 mt-1 flex-shrink-0"
              />
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{icon}</span>
                  <span className="text-sm font-semibold text-slate-900">{label}</span>
                  {sections[key] && (
                    <span className="ml-auto text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                      âœ“ Activada
                    </span>
                  )}
                </div>
                
                <p className="text-sm text-slate-700 mb-2">{description}</p>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-2">
                  <p className="text-xs text-blue-800">
                    <span className="font-semibold">ðŸ“Œ {example}</span>
                  </p>
                </div>
              </div>
            </label>
          </div>
        ))}
      </div>

      {/* Resumen de secciones activas */}
      <div className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border-2 border-blue-200">
        <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
          <span>ðŸ“Š</span>
          Resumen
        </h4>
        <p className="text-sm text-blue-800">
          <span className="font-bold text-lg">{Object.values(sections).filter(Boolean).length}</span> 
          {' '}de {sectionList.length} secciones activadas
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {sectionList.filter(s => sections[s.key]).map(s => (
            <span key={s.key} className="text-xs bg-white px-2 py-1 rounded-full border border-blue-200">
              {s.icon} {s.label}
            </span>
          ))}
        </div>
      </div>

      {/* Tip */}
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <p className="text-sm text-amber-900">
          <span className="font-semibold">ðŸ’¡ Tip:</span> No actives todas las secciones si no tienes contenido para ellas. 
          Es mejor tener pocas secciones con buen contenido que muchas vacÃ­as.
        </p>
      </div>
    </div>
  );
}

// ==================== ENHANCED PREVIEW ====================
function EnhancedStorePreview({ appearance, storeData, mode }) {
  const colors = appearance.colors || {};
  
  return (
    <div 
      className="min-h-screen"
      style={{
        backgroundColor: colors.background,
        color: colors.text,
        fontFamily: appearance.typography?.fontFamily || 'Inter',
      }}
    >
      {/* Hero Section */}
      <div 
        className="p-8 text-center"
        style={{
          backgroundColor: colors.primary,
          color: '#ffffff',
        }}
      >
        <h1 className="text-4xl font-bold mb-2">{storeData?.name || 'Mi Tienda'}</h1>
        <p className="text-lg opacity-90">{storeData?.description || 'DescripciÃ³n de la tienda'}</p>
      </div>

      {/* Content Preview */}
      <div className="p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="p-4 rounded-lg"
              style={{
                backgroundColor: colors.surface,
                border: `1px solid ${colors.border}`,
              }}
            >
              <div className="w-full h-32 bg-slate-300 rounded mb-3"></div>
              <h3 className="font-semibold mb-2">Producto {i}</h3>
              <p className="text-sm" style={{ color: colors.textSecondary }}>
                DescripciÃ³n del producto
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ==================== CUSTOMIZATION WIZARD ====================
function CustomizationWizard({ storeData, onComplete, onClose }) {
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState({
    businessType: '',
    style: '',
    colors: '',
  });

  const businessTypes = [
    { id: 'restaurant', label: 'Restaurante / CafeterÃ­a', theme: 'restaurant', icon: 'ðŸ½ï¸' },
    { id: 'beauty', label: 'Belleza / SalÃ³n', theme: 'beauty-salon', icon: 'ðŸ’…' },
    { id: 'fitness', label: 'Fitness / Gym', theme: 'fitness-center', icon: 'ðŸ’ª' },
    { id: 'boutique', label: 'Boutique / Ropa', theme: 'elegant-boutique', icon: 'ðŸ‘—' },
    { id: 'tech', label: 'TecnologÃ­a / Startup', theme: 'tech-startup', icon: 'ðŸš€' },
    { id: 'creative', label: 'Creativo / ArtÃ­stico', theme: 'artistic-studio', icon: 'ðŸŽ¨' },
    { id: 'professional', label: 'Servicios Profesionales', theme: 'professional-services', icon: 'ðŸ’¼' },
    { id: 'eco', label: 'Eco / Natural', theme: 'eco-friendly', icon: 'ðŸŒ±' },
  ];

  const handleFinish = () => {
    const selectedBusiness = businessTypes.find(b => b.id === answers.businessType);
    if (selectedBusiness) {
      onComplete(selectedBusiness.theme);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-bold text-slate-900">ðŸ§™ Asistente de PersonalizaciÃ³n</h2>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 text-2xl"
            >
              âœ•
            </button>
          </div>
          <p className="text-slate-600">Te ayudaremos a elegir la mejor plantilla para tu negocio</p>
          
          {/* Progress */}
          <div className="mt-4 flex gap-2">
            {[1, 2].map((s) => (
              <div
                key={s}
                className={`flex-1 h-2 rounded-full ${
                  s <= step ? 'bg-blue-600' : 'bg-slate-200'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900">
                Â¿QuÃ© tipo de negocio tienes?
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {businessTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => {
                      setAnswers({ ...answers, businessType: type.id });
                      setStep(2);
                    }}
                    className="p-4 border-2 border-slate-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
                  >
                    <div className="text-3xl mb-2">{type.icon}</div>
                    <div className="font-medium text-slate-900">{type.label}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-slate-900">
                Â¡Perfecto! Hemos seleccionado una plantilla ideal para ti
              </h3>
              
              <div className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border-2 border-blue-200">
                <div className="text-center">
                  <div className="text-5xl mb-3">
                    {businessTypes.find(b => b.id === answers.businessType)?.icon}
                  </div>
                  <h4 className="text-xl font-bold text-slate-900 mb-2">
                    {businessTypes.find(b => b.id === answers.businessType)?.label}
                  </h4>
                  <p className="text-slate-600">
                    Plantilla optimizada para tu tipo de negocio
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 px-4 py-3 border-2 border-slate-300 rounded-lg hover:bg-slate-50 font-medium"
                >
                  â† AtrÃ¡s
                </button>
                <button
                  onClick={handleFinish}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 font-medium shadow-lg"
                >
                  Aplicar Plantilla âœ¨
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
