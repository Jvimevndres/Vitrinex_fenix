// frontend/src/components/EnhancedStoreCustomizer.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  getStoreAppearance,
  updateStoreAppearance,
  applyTheme,
  resetAppearance,
  getAvailableThemes,
} from '../api/appearance';
import { getStoreById, updateMyStore } from '../api/store';
import StorePreviewRealistic from './StorePreviewRealistic'; // 🆕 Preview realista

/**
 * 🎨 CONSTRUCTOR VISUAL MEJORADO Y SIMPLIFICADO
 * Sistema de personalización fácil de usar con preview realista
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

  // Categorías de plantillas
  const themeCategories = {
    all: { label: 'Todos', icon: '🎨' },
    business: { label: 'Negocios', icon: '💼' },
    creative: { label: 'Creativos', icon: '🎭' },
    modern: { label: 'Modernos', icon: '⚡' },
    elegant: { label: 'Elegantes', icon: '💎' },
    vibrant: { label: 'Vibrantes', icon: '🌈' },
    minimal: { label: 'Minimalistas', icon: '⚪' },
  };

  // Plantillas disponibles con metadata (35 diseños)
  const availableThemes = [
    // Minimalistas (5)
    { id: 'minimal', name: 'Minimal Clean', category: 'minimal', description: 'Diseño limpio y profesional', preview: '🤍' },
    { id: 'minimal-white', name: 'Minimal White', category: 'minimal', description: 'Blanco puro minimalista', preview: '⚪' },
    { id: 'minimal-gray', name: 'Minimal Gray', category: 'minimal', description: 'Grises elegantes', preview: '⬜' },
    { id: 'minimal-mono', name: 'Minimal Mono', category: 'minimal', description: 'Monocromático simple', preview: '◻️' },
    { id: 'minimal-zen', name: 'Minimal Zen', category: 'minimal', description: 'Serenidad y balance', preview: '🧘' },
    
    // Negocios (8)
    { id: 'professional-services', name: 'Servicios Profesionales', category: 'business', description: 'Ideal para consultorías y servicios', preview: '💼' },
    { id: 'warm-cafe', name: 'Cafetería Acogedora', category: 'business', description: 'Perfecto para cafés y restaurantes', preview: '☕' },
    { id: 'eco-friendly', name: 'Eco Friendly', category: 'business', description: 'Productos naturales y sostenibles', preview: '🌱' },
    { id: 'restaurant', name: 'Restaurante Gourmet', category: 'business', description: 'Comida y gastronomía', preview: '🍽️' },
    { id: 'corporate-blue', name: 'Corporativo Azul', category: 'business', description: 'Profesional y confiable', preview: '🏢' },
    { id: 'medical-clinic', name: 'Clínica Médica', category: 'business', description: 'Salud y bienestar', preview: '🏥' },
    { id: 'law-firm', name: 'Bufete Legal', category: 'business', description: 'Abogados y legal', preview: '⚖️' },
    { id: 'financial-advisor', name: 'Asesor Financiero', category: 'business', description: 'Finanzas e inversiones', preview: '💰' },
    
    // Creativos (7)
    { id: 'artistic-studio', name: 'Estudio Artístico', category: 'creative', description: 'Para artistas y creativos', preview: '🎨' },
    { id: 'pastel', name: 'Pastel Dreams', category: 'creative', description: 'Colores suaves y amigables', preview: '🌸' },
    { id: 'gradient-wave', name: 'Gradient Wave', category: 'creative', description: 'Degradados vibrantes', preview: '🌊' },
    { id: 'photography', name: 'Fotografía Pro', category: 'creative', description: 'Portfolio fotográfico', preview: '📸' },
    { id: 'music-studio', name: 'Estudio Musical', category: 'creative', description: 'Música y audio', preview: '🎵' },
    { id: 'design-agency', name: 'Agencia de Diseño', category: 'creative', description: 'Diseño gráfico y web', preview: '✏️' },
    { id: 'video-production', name: 'Producción de Video', category: 'creative', description: 'Cine y video', preview: '🎬' },
    
    // Modernos (6)
    { id: 'tech-startup', name: 'Tech Startup', category: 'modern', description: 'Tecnología y startups', preview: '🚀' },
    { id: 'modern-agency', name: 'Agencia Moderna', category: 'modern', description: 'Diseño contemporáneo', preview: '⚡' },
    { id: 'dark-pro', name: 'Dark Pro', category: 'modern', description: 'Profesional oscuro', preview: '🌙' },
    { id: 'cyber-tech', name: 'Cyber Tech', category: 'modern', description: 'Futurista tecnológico', preview: '🤖' },
    { id: 'app-developer', name: 'Desarrollador de Apps', category: 'modern', description: 'Desarrollo de software', preview: '📱' },
    { id: 'gaming-esports', name: 'Gaming & Esports', category: 'modern', description: 'Videojuegos y competencias', preview: '🎮' },
    
    // Elegantes (5)
    { id: 'elegant-boutique', name: 'Boutique Elegante', category: 'elegant', description: 'Lujo y sofisticación', preview: '👗' },
    { id: 'luxury-brand', name: 'Marca de Lujo', category: 'elegant', description: 'Premium y exclusivo', preview: '💎' },
    { id: 'beauty-salon', name: 'Salón de Belleza', category: 'elegant', description: 'Belleza y cuidado personal', preview: '💅' },
    { id: 'jewelry-store', name: 'Joyería Exclusiva', category: 'elegant', description: 'Joyas y accesorios', preview: '💍' },
    { id: 'spa-wellness', name: 'Spa & Wellness', category: 'elegant', description: 'Relajación y bienestar', preview: '🧖' },
    
    // Vibrantes (4)
    { id: 'neon', name: 'Neon Lights', category: 'vibrant', description: 'Colores neón y energía', preview: '💜' },
    { id: 'vibrant-shop', name: 'Tienda Vibrante', category: 'vibrant', description: 'Colorido y llamativo', preview: '🎉' },
    { id: 'fitness-center', name: 'Centro de Fitness', category: 'vibrant', description: 'Energía y movimiento', preview: '💪' },
    { id: 'party-events', name: 'Eventos y Fiestas', category: 'vibrant', description: 'Celebraciones y entretenimiento', preview: '🎊' },
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
        // Puedes descomentar para mostrar wizard automáticamente
        // setShowWizard(true);
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = (field, value) => {
    console.log(`🔧 Actualizando appearance.${field}:`, value);
    setAppearance((prev) => {
      // Para objetos anidados, hacer deep merge para preservar propiedades
      if (typeof value === 'object' && !Array.isArray(value) && value !== null) {
        return {
          ...prev,
          [field]: {
            ...(prev[field] || {}),  // Preservar propiedades existentes
            ...value,                 // Sobrescribir con nuevas
          },
        };
      }
      // Para arrays, strings, numbers, booleans, null -> reemplazar directamente
      return {
        ...prev,
        [field]: value,
      };
    });
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
      
      console.log('💾 === INICIANDO GUARDADO ===');
      console.log('📊 StoreData a guardar:', storeData);
      console.log('🎨 Appearance a guardar:', appearance);
      console.log('🔲 Secciones:', appearance?.sections);
      console.log('✨ Efectos:', appearance?.effects);
      console.log('🎨 Partículas:', appearance?.effects?.particles);
      
      // Validar que el objeto appearance esté completo
      if (!appearance || typeof appearance !== 'object') {
        throw new Error('Objeto appearance inválido');
      }
      
      // Guardar datos básicos de la tienda
      if (storeData) {
        console.log('📤 Guardando storeData...');
        const storeResult = await updateMyStore(storeId, storeData);
        console.log('✅ StoreData guardado:', storeResult);
      }
      
      // Guardar apariencia CON TODOS LOS EFECTOS
      console.log('📤 Guardando appearance completo...');
      const updated = await updateStoreAppearance(storeId, appearance);
      console.log('✅ Appearance guardado:', updated);
      console.log('✨ Efectos guardados:', updated.effects);
      console.log('🎨 Partículas guardadas:', updated.effects?.particles);
      console.log('📊 Versión:', updated.version);
      
      // Actualizar estado con la respuesta del servidor
      setAppearance(updated);
      setHasChanges(false);
      
      console.log('🎉 Guardado completado exitosamente');
      
      // Notificar éxito con detalles
      alert(`✅ Cambios guardados correctamente\\n\\n` +
            `📊 Versión: ${updated.version}\\n` +
            `✨ Efectos activos: ${Object.entries(updated.effects || {}).filter(([k, v]) => v === true).length}\\n` +
            `🎨 Tema: ${updated.theme || 'custom'}`);
            
      // Forzar recarga del preview (por si hay cache)
      setTimeout(() => {
        window.location.hash = '#refresh-' + Date.now();
      }, 100);
    } catch (error) {
      console.error('❌ Error guardando:', error);
      console.error('❌ Detalles del error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      alert('❌ Error al guardar los cambios:\\n' + 
            (error.response?.data?.message || error.message) +
            '\\n\\nRevisa la consola para más detalles');
    } finally {
      setSaving(false);
    }
  };

  const handleApplyTheme = async (themeId) => {
    if (!confirm(`¿Aplicar plantilla "${themeId}"? Esto sobrescribirá tu configuración actual.`)) {
      return;
    }

    try {
      setSaving(true);
      const updated = await applyTheme(storeId, themeId);
      setAppearance(updated);
      setHasChanges(false);
      alert(`✅ Plantilla "${themeId}" aplicada`);
    } catch (error) {
      console.error('Error aplicando plantilla:', error);
      alert('❌ Error al aplicar la plantilla');
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
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-purple-50 via-pink-50 to-purple-100 flex flex-col">
      {/* Header Mejorado - Estilo Vitrinex */}
      <header className="bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 border-b border-purple-700 px-6 py-3 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="text-white hover:text-purple-100 p-2 hover:bg-white/20 rounded-lg transition-colors"
            title="Volver"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              🎨 Constructor Visual 
            </h1>
            <p className="text-sm text-purple-100">
              <span className="font-semibold">{storeData?.name || 'Mi Tienda'}</span>
              {' • '}
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                storeMode === 'bookings' 
                  ? 'bg-purple-900/40 text-purple-100' 
                  : 'bg-pink-900/40 text-pink-100'
              }`}>
                {storeMode === 'bookings' ? '📅 Agendamiento' : '🛍️ Productos'}
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Preview Mode Selector */}
          <div className="flex items-center gap-1 bg-white/20 rounded-lg p-1">
            {[
              { id: 'desktop', icon: '💻', label: 'Escritorio' },
              { id: 'tablet', icon: '📱', label: 'Tablet' },
              { id: 'mobile', icon: '📱', label: 'Móvil' },
            ].map(mode => (
              <button
                key={mode.id}
                onClick={() => setPreviewMode(mode.id)}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-all ${
                  previewMode === mode.id
                    ? 'bg-white text-purple-600 shadow-sm'
                    : 'text-purple-100 hover:text-white hover:bg-white/10'
                }`}
                title={mode.label}
              >
                {mode.icon}
              </button>
            ))}
          </div>

          {hasChanges && (
            <span className="text-sm text-yellow-300 font-medium flex items-center gap-2">
              <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></span>
              Sin guardar
            </span>
          )}

          <button
            onClick={() => setShowWizard(true)}
            className="px-4 py-2 text-sm text-white hover:text-purple-100 border border-white/30 rounded-lg hover:bg-white/20 disabled:opacity-50 font-medium"
          >
            🧙 Asistente
          </button>

          <button
            onClick={handleReset}
            disabled={saving}
            className="px-4 py-2 text-sm text-white hover:text-purple-100 border border-white/30 rounded-lg hover:bg-white/20 disabled:opacity-50"
          >
            🔄 Resetear
          </button>

          <button
            onClick={handleSave}
            disabled={saving || !hasChanges}
            className="px-6 py-2 bg-white text-purple-600 rounded-lg hover:bg-purple-50 disabled:opacity-50 disabled:cursor-not-allowed font-bold shadow-lg hover:shadow-xl transition-all"
          >
            {saving ? '⏳ Guardando...' : '💾 Guardar Cambios'}
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
                placeholder="🔍 Buscar plantillas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          )}

          {/* Tabs Navigation */}
          <div className="border-b border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50 sticky top-0 z-10 shadow-sm">
            <nav className="grid grid-cols-3 grid-rows-2 gap-1 p-2">
              {[
                { id: 'themes', icon: '🎨', label: 'Plantillas' },
                { id: 'colors', icon: '🌈', label: 'Colores' },
                { id: 'content-text', icon: '📝', label: 'Contenido' },
                { id: 'effects', icon: '✨', label: 'Efectos' },
                { id: 'layout', icon: '📐', label: 'Diseño' },
                { id: 'sections', icon: '📋', label: 'Secciones' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setActiveSubTab(null);
                  }}
                  className={`flex flex-col items-center px-2 py-2 text-xs font-medium rounded-lg transition-all ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                      : 'text-purple-700 hover:bg-purple-100'
                  }`}
                >
                  <span className="text-lg mb-1">{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Preview en tiempo real - Info destacada */}
          <div className="bg-gradient-to-r from-purple-100 to-pink-100 border-b border-purple-300 p-3">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-xl">👁️</span>
              <div className="flex-1">
                <p className="font-semibold text-purple-900">Vista Previa en Tiempo Real</p>
                <p className="text-xs text-purple-700">Los cambios se ven al instante →</p>
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
                typography={appearance.typography}
                onTypographyChange={(typography) => handleUpdate('typography', typography)}
                onStoreUpdate={(field, value) => {
                  console.log(`📝 Actualizando campo: ${field} =`, value);
                  // Actualizar localmente
                  const newStoreData = { ...storeData, [field]: value };
                  setStoreData(newStoreData);
                  setHasChanges(true);
                  console.log('✅ StoreData actualizado:', newStoreData);
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
                onChange={(sections) => {
                  console.log('🔲 === ACTUALIZANDO SECCIONES ===');
                  console.log('Secciones anteriores:', appearance.sections);
                  console.log('Nuevas secciones:', sections);
                  handleUpdate('sections', sections);
                  console.log('✅ Secciones actualizadas en appearance');
                }}
                storeData={storeData}
                onStoreUpdate={(field, value) => {
                  console.log(`📦 Actualizando secciones - campo: ${field} =`, value);
                  const newStoreData = { ...storeData, [field]: value };
                  setStoreData(newStoreData);
                  setHasChanges(true);
                  console.log('✅ StoreData con cuadros:', newStoreData);
                }}
              />
            )}
          </div>
        </aside>

        {/* Preview Area Mejorado */}
        <main className="flex-1 bg-gradient-to-br from-purple-100 via-pink-100 to-purple-200 overflow-y-auto p-6 relative">
          <div className={`mx-auto transition-all duration-300 pb-6 ${
            previewMode === 'desktop' ? 'max-w-7xl' :
            previewMode === 'tablet' ? 'max-w-3xl' :
            'max-w-sm'
          }`}>
            <div className="bg-white rounded-xl shadow-2xl border border-purple-200 overflow-hidden">
              <StorePreviewRealistic 
                appearance={appearance} 
                storeData={storeData} 
                mode={previewMode}
              />
            </div>
            
            {/* Preview Info */}
            <div className="mt-4 text-center text-sm text-purple-700">
              Vista previa en modo <span className="font-semibold">{
                previewMode === 'desktop' ? 'Escritorio' :
                previewMode === 'tablet' ? 'Tablet' :
                'Móvil'
              }</span>
            </div>
          </div>

          {/* Botón Flotante de Guardado - SIEMPRE VISIBLE */}
          <div className="fixed bottom-8 right-8 z-50">
            <button
              onClick={handleSave}
              disabled={saving || !hasChanges}
              className={`group relative px-8 py-4 rounded-full font-bold text-lg shadow-2xl transition-all duration-300 ${
                hasChanges
                  ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 text-white hover:shadow-purple-500/50 hover:scale-110 animate-pulse'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {saving ? (
                <>
                  <span className="animate-spin inline-block mr-2">⏳</span>
                  Guardando...
                </>
              ) : hasChanges ? (
                <>
                  💾 Guardar Todo
                  <span className="absolute -top-2 -right-2 flex h-6 w-6">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-6 w-6 bg-pink-500 items-center justify-center text-xs text-white font-bold">
                      !
                    </span>
                  </span>
                </>
              ) : (
                <>✓ Todo Guardado</>
              )}
            </button>
            {hasChanges && (
              <p className="text-center text-xs text-purple-700 mt-2 font-medium animate-bounce">
                Tienes cambios sin guardar
              </p>
            )}
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
          17 plantillas prediseñadas para diferentes tipos de negocios
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
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                : 'bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200'
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
                ? 'border-purple-600 bg-purple-50'
                : 'border-purple-100 bg-white hover:border-purple-300'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="text-3xl">{theme.preview}</div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-slate-900 flex items-center gap-2">
                  {theme.name}
                  {currentTheme === theme.id && (
                    <span className="text-xs bg-gradient-to-r from-purple-600 to-pink-600 text-white px-2 py-0.5 rounded-full">Activo</span>
                  )}
                </h4>
                <p className="text-xs text-slate-600 mt-1">{theme.description}</p>
                <span className="inline-block mt-2 text-xs text-purple-700 bg-purple-100 px-2 py-0.5 rounded">
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
          <p className="text-sm mt-2">Intenta con otra búsqueda o categoría</p>
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
      icon: '💼',
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
      name: 'Elegante Púrpura',
      icon: '👑',
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
      icon: '🌿',
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
      name: 'Cálido Naranja',
      icon: '🔥',
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
      icon: '🌙',
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
      icon: '💕',
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
      title: '🎨 Colores de Marca',
      description: 'Definen la identidad visual de tu negocio',
      colors: [
        { key: 'primary', label: 'Primario', description: 'Color principal de marca (botones, links)', preview: 'button' },
        { key: 'secondary', label: 'Secundario', description: 'Color complementario (hover, detalles)', preview: 'badge' },
        { key: 'accent', label: 'Acento', description: 'Para destacar elementos importantes', preview: 'highlight' },
      ],
    },
    {
      title: '🏠 Fondos y Superficies',
      description: 'Colores de fondo y contenedores',
      colors: [
        { key: 'background', label: 'Fondo Principal', description: 'Fondo de la página', preview: 'page' },
        { key: 'surface', label: 'Superficie', description: 'Tarjetas, paneles, modales', preview: 'card' },
        { key: 'border', label: 'Bordes', description: 'Líneas divisorias y bordes', preview: 'border' },
      ],
    },
    {
      title: '✍️ Texto',
      description: 'Colores de contenido textual',
      colors: [
        { key: 'text', label: 'Texto Principal', description: 'Títulos y contenido importante', preview: 'text-dark' },
        { key: 'textSecondary', label: 'Texto Secundario', description: 'Descripciones y textos de apoyo', preview: 'text-light' },
      ],
    },
    {
      title: '⚡ Estados y Mensajes',
      description: 'Colores para feedback del sistema',
      colors: [
        { key: 'success', label: 'Éxito', description: 'Confirmaciones positivas', preview: 'success' },
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
            Botón
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
          <span className="text-2xl">🌈</span>
          Paleta de Colores
        </h3>
        <p className="text-sm text-slate-600 mt-1">
          Define la identidad visual de tu tienda
        </p>
      </div>

      {/* Paletas Sugeridas */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-slate-900">✨ Paletas Sugeridas</h4>
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
                        📋
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
          <span className="font-semibold">💡 Tip:</span> Asegúrate de que haya suficiente contraste entre el texto y el fondo para mejor legibilidad (mínimo 4.5:1)
        </p>
      </div>
    </div>
  );
}

// ==================== CONTENT + TEXT TAB (UNIFICADO) ====================
function ContentTextTab({ storeData, typography, onTypographyChange, onStoreUpdate }) {
  const [activeContentSection, setActiveContentSection] = useState('store-info');

  const fontCategories = {
    'Sans Serif Modernas': [
      'Inter', 'Poppins', 'Roboto', 'Montserrat', 'Lato', 'Open Sans',
      'Raleway', 'Nunito', 'Work Sans', 'DM Sans', 'Plus Jakarta Sans', 'Manrope'
    ],
    'Serif Elegantes': [
      'Playfair Display', 'Merriweather', 'Lora', 'Crimson Text', 'EB Garamond'
    ],
    'Display Especiales': [
      'Space Grotesk', 'Bebas Neue', 'Oswald', 'Quicksand', 'Pacifico', 'Dancing Script'
    ]
  };

  const fontWeights = [
    { value: '300', label: 'Light' },
    { value: '400', label: 'Normal' },
    { value: '500', label: 'Medium' },
    { value: '600', label: 'Semi Bold' },
    { value: '700', label: 'Bold' },
  ];

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div>
        <h3 className="font-semibold text-slate-900 text-lg flex items-center gap-2">
          <span className="text-2xl">📝</span>
          Contenido y Tipografía
        </h3>
        <p className="text-sm text-slate-600 mt-1">
          Edita todos los textos de tu tienda y personaliza su estilo visual
        </p>
      </div>

      {/* Sub-navegación */}
      <div className="flex gap-2 border-b border-slate-200 pb-2">
        {[
          { id: 'store-info', label: '🏪 Información', icon: '🏪' },
          { id: 'typography', label: '✍️ Estilos de Texto', icon: '✍️' },
        ].map((section) => (
          <button
            key={section.id}
            onClick={() => setActiveContentSection(section.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeContentSection === section.id
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {section.label}
          </button>
        ))}
      </div>

      {/* Sección: Información de la Tienda */}
      {activeContentSection === 'store-info' && (
        <div className="space-y-6">
          {/* Información Básica */}
          <div className="space-y-4 p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border-2 border-blue-200">
            <h4 className="font-semibold text-blue-900 flex items-center gap-2">
              <span className="text-xl">📋</span>
              Información Básica
            </h4>
            
            <div className="space-y-3">
              {/* Logo de la tienda */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Logo de la Tienda
                </label>
                <div className="flex items-start gap-4">
                  {/* Preview del logo actual */}
                  <div className="flex-shrink-0">
                    {storeData?.logoUrl ? (
                      <img
                        src={storeData.logoUrl}
                        alt="Logo actual"
                        className="w-24 h-24 object-cover rounded-xl border-2 border-slate-300 shadow-sm"
                      />
                    ) : (
                      <div className="w-24 h-24 bg-slate-200 rounded-xl border-2 border-dashed border-slate-400 flex items-center justify-center">
                        <span className="text-3xl text-slate-400">🏪</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Input para subir logo */}
                  <div className="flex-1 space-y-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        
                        // Validar tamaño (máx 5MB)
                        if (file.size > 5 * 1024 * 1024) {
                          alert('La imagen es muy grande. Máximo 5MB.');
                          e.target.value = '';
                          return;
                        }
                        
                        // Subir imagen
                        const formData = new FormData();
                        formData.append('file', file);
                        formData.append('storeId', storeData._id);
                        
                        try {
                          const response = await axios.post(
                            'http://localhost:3000/api/upload/store-logo',
                            formData,
                            {
                              headers: {
                                'Content-Type': 'multipart/form-data',
                              },
                              withCredentials: true
                            }
                          );
                          
                          console.log('📸 Respuesta del servidor:', response.data);
                          
                          if (response.data.logoUrl) {
                            console.log('✅ Nueva URL del logo:', response.data.logoUrl);
                            // Actualizar el estado inmediatamente
                            const newStoreData = { ...storeData, logoUrl: response.data.logoUrl };
                            onStoreUpdate('logoUrl', response.data.logoUrl);
                            alert('✅ Logo actualizado correctamente');
                            
                            // Forzar re-render
                            window.location.reload();
                          } else {
                            alert('Error: ' + (response.data.message || 'No se pudo subir'));
                          }
                        } catch (error) {
                          console.error('Error al subir logo:', error);
                          const errorMsg = error.response?.data?.message || 'Error al subir la imagen';
                          alert(errorMsg);
                        } finally {
                          e.target.value = '';
                        }
                      }}
                      className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 file:cursor-pointer"
                    />
                    <p className="text-xs text-slate-600">
                      📸 Sube tu logo (JPG, PNG, GIF - máx 5MB). Recomendado: cuadrado 400x400px
                    </p>
                    {storeData?.logoUrl && (
                      <button
                        onClick={() => onStoreUpdate('logoUrl', '')}
                        className="text-xs text-red-600 hover:text-red-700 font-medium"
                      >
                        🗑️ Eliminar logo
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Nombre de la Tienda *
                </label>
                <input
                  type="text"
                  defaultValue={storeData?.name || ''}
                  onBlur={(e) => onStoreUpdate('name', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ej: Mi Negocio Profesional"
                />
                <p className="text-xs text-slate-600 mt-1">Este es el título principal que verán tus clientes</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Descripción / Eslogan
                </label>
                <textarea
                  defaultValue={storeData?.description || ''}
                  onBlur={(e) => onStoreUpdate('description', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ej: La mejor experiencia en servicios profesionales. Calidad y atención personalizada."
                />
                <p className="text-xs text-slate-600 mt-1">Describe brevemente qué ofreces</p>
              </div>
            </div>
          </div>

          {/* Contacto */}
          <div className="space-y-4 p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border-2 border-green-200">
            <h4 className="font-semibold text-green-900 flex items-center gap-2">
              <span className="text-xl">📞</span>
              Información de Contacto
            </h4>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Dirección
                </label>
                <input
                  type="text"
                  defaultValue={storeData?.address || ''}
                  onBlur={(e) => onStoreUpdate('address', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="Ej: Av. Principal 123, Ciudad"
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
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500"
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
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="contacto@mitienda.com"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Quiénes Somos */}
          <div className="space-y-4 p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border-2 border-purple-200">
            <h4 className="font-semibold text-purple-900 flex items-center gap-2">
              <span className="text-xl">👥</span>
              Quiénes Somos
            </h4>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Título de la sección
                </label>
                <input
                  type="text"
                  defaultValue={storeData?.aboutTitle || 'Quiénes Somos'}
                  onBlur={(e) => onStoreUpdate('aboutTitle', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="Ej: Nuestra Historia"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Descripción completa
                </label>
                <textarea
                  defaultValue={storeData?.aboutDescription || ''}
                  onBlur={(e) => onStoreUpdate('aboutDescription', e.target.value)}
                  rows={5}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="Cuenta tu historia, misión, valores y qué te hace único..."
                />
                <p className="text-xs text-slate-600 mt-1">Este texto aparecerá en la sección 'Quiénes Somos'</p>
              </div>
            </div>
          </div>

          {/* Horarios */}
          <div className="space-y-4 p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl border-2 border-orange-200">
            <h4 className="font-semibold text-orange-900 flex items-center gap-2">
              <span className="text-xl">⏰</span>
              Horarios de Atención
            </h4>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Horario General
                </label>
                <textarea
                  defaultValue={storeData?.scheduleText || ''}
                  onBlur={(e) => onStoreUpdate('scheduleText', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  placeholder={`Lunes a Viernes: 9:00 - 18:00\nSábados: 10:00 - 14:00\nDomingos: Cerrado`}
                />
                <p className="text-xs text-slate-600 mt-1">Escribe tus horarios (uno por línea)</p>
              </div>
            </div>
          </div>

          {/* Características Destacadas */}
          <div className="space-y-4 p-4 bg-gradient-to-br from-teal-50 to-teal-100 rounded-xl border-2 border-teal-200">
            <h4 className="font-semibold text-teal-900 flex items-center gap-2">
              <span className="text-xl">⭐</span>
              Características Destacadas
            </h4>
            
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Destacado 1
                  </label>
                  <input
                    type="text"
                    defaultValue={storeData?.highlight1 || ''}
                    onBlur={(e) => onStoreUpdate('highlight1', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                    placeholder="Ej: 10 años de experiencia"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Destacado 2
                  </label>
                  <input
                    type="text"
                    defaultValue={storeData?.highlight2 || ''}
                    onBlur={(e) => onStoreUpdate('highlight2', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                    placeholder="Ej: Garantía total"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Texto promocional
                </label>
                <input
                  type="text"
                  defaultValue={storeData?.priceFrom || ''}
                  onBlur={(e) => onStoreUpdate('priceFrom', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  placeholder="Ej: Desde $19.990"
                />
              </div>
            </div>
          </div>

          {/* Tip */}
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-900">
              <span className="font-semibold">💡 Tip:</span> Esta información aparecerá en la parte superior de tu tienda. 
              Asegúrate de que sea precisa y profesional.
            </p>
          </div>
        </div>
      )}

      {/* Sección: Estilos de Texto */}
      {activeContentSection === 'typography' && (
        <div className="space-y-6">
          {/* Familia de Fuente */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-slate-700">
              Familia de Fuente
            </label>
            {Object.entries(fontCategories).map(([category, fonts]) => (
              <div key={category} className="space-y-2">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{category}</p>
                <div className="grid grid-cols-2 gap-2">
                  {fonts.map(font => (
                    <button
                      key={font}
                      onClick={() => onTypographyChange({ ...typography, fontFamily: font })}
                      className={`p-2 text-left text-sm rounded-lg border-2 transition-all ${
                        typography?.fontFamily === font
                          ? 'border-blue-600 bg-blue-50 text-blue-900 shadow-sm'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                      style={{ fontFamily: font }}
                    >
                      {font}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Preview de Tipografía */}
          <div 
            className="p-6 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg border-2 border-slate-200"
            style={{ fontFamily: typography?.fontFamily }}
          >
            <h1 
              className="mb-3" 
              style={{ 
                fontSize: typography?.headingSize || '2.5rem',
                fontWeight: typography?.headingWeight || '700',
              }}
            >
              Título Principal
            </h1>
            <h2 className="mb-3 text-slate-700" style={{ fontSize: `calc(${typography?.headingSize || '2.5rem'} * 0.7)` }}>
              Subtítulo de Sección
            </h2>
            <p 
              className="text-slate-600 mb-2"
              style={{ 
                fontSize: typography?.bodySize || '1rem',
                fontWeight: typography?.bodyWeight || '400',
                lineHeight: typography?.lineHeight || '1.6',
              }}
            >
              Este es un ejemplo de cómo se verá el texto en tu tienda con la fuente seleccionada.
            </p>
            <p className="text-sm text-slate-500">Texto secundario más pequeño</p>
          </div>

          {/* Controles de Títulos */}
          <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="text-sm font-semibold text-blue-900">📝 Títulos</h4>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Tamaño: {typography?.headingSize || '2.5rem'}
                </label>
                <input
                  type="range"
                  min="1.5"
                  max="4"
                  step="0.1"
                  value={parseFloat(typography?.headingSize) || 2.5}
                  onChange={(e) => onTypographyChange({ ...typography, headingSize: `${e.target.value}rem` })}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>Pequeño</span>
                  <span>Grande</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Peso
                </label>
                <select
                  value={typography?.headingWeight || '700'}
                  onChange={(e) => onTypographyChange({ ...typography, headingWeight: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                >
                  {fontWeights.map(({ value, label }) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Controles de Texto del Cuerpo */}
          <div className="space-y-4 p-4 bg-green-50 rounded-lg border border-green-200">
            <h4 className="text-sm font-semibold text-green-900">📄 Texto del Cuerpo</h4>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Tamaño: {typography?.bodySize || '1rem'}
                </label>
                <input
                  type="range"
                  min="0.75"
                  max="1.5"
                  step="0.05"
                  value={parseFloat(typography?.bodySize) || 1}
                  onChange={(e) => onTypographyChange({ ...typography, bodySize: `${e.target.value}rem` })}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>Pequeño</span>
                  <span>Grande</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Peso
                </label>
                <select
                  value={typography?.bodyWeight || '400'}
                  onChange={(e) => onTypographyChange({ ...typography, bodyWeight: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                >
                  {fontWeights.filter(w => parseInt(w.value) <= 600).map(({ value, label }) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Interlineado: {typography?.lineHeight || '1.6'}
                </label>
                <input
                  type="range"
                  min="1"
                  max="2"
                  step="0.1"
                  value={parseFloat(typography?.lineHeight) || 1.6}
                  onChange={(e) => onTypographyChange({ ...typography, lineHeight: e.target.value })}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>Compacto</span>
                  <span>Amplio</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ==================== TYPOGRAPHY TAB ====================
// ==================== TYPOGRAPHY TAB (MEJORADO) ====================
function TypographyTab({ typography, onChange }) {
  const fontCategories = {
    'Sans Serif Modernas': [
      'Inter', 'Poppins', 'Roboto', 'Montserrat', 'Lato', 'Open Sans',
      'Raleway', 'Nunito', 'Work Sans', 'DM Sans', 'Plus Jakarta Sans', 'Manrope'
    ],
    'Serif Elegantes': [
      'Playfair Display', 'Merriweather', 'Lora', 'Crimson Text', 'EB Garamond'
    ],
    'Display Especiales': [
      'Space Grotesk', 'Bebas Neue', 'Oswald', 'Quicksand', 'Pacifico', 'Dancing Script'
    ]
  };

  const fontWeights = [
    { value: '300', label: 'Light (300)' },
    { value: '400', label: 'Normal (400)' },
    { value: '500', label: 'Medium (500)' },
    { value: '600', label: 'Semi Bold (600)' },
    { value: '700', label: 'Bold (700)' },
    { value: '800', label: 'Extra Bold (800)' },
    { value: '900', label: 'Black (900)' },
  ];

  const letterSpacingOptions = [
    { value: 'tight', label: 'Compacto', example: '-0.05em' },
    { value: 'normal', label: 'Normal', example: '0' },
    { value: 'wide', label: 'Amplio', example: '0.05em' },
  ];

  const textTransformOptions = [
    { value: 'none', label: 'Normal' },
    { value: 'uppercase', label: 'MAYÚSCULAS' },
    { value: 'lowercase', label: 'minúsculas' },
    { value: 'capitalize', label: 'Primera Mayúscula' },
  ];

  return (
    <div className="p-4 space-y-6">
      <div>
        <h3 className="font-semibold text-slate-900">Tipografía</h3>
        <p className="text-xs text-slate-600 mt-1">
          23 fuentes profesionales de Google Fonts
        </p>
      </div>

      {/* Font Family por categoría */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-slate-700">
          Familia de Fuente
        </label>
        {Object.entries(fontCategories).map(([category, fonts]) => (
          <div key={category} className="space-y-2">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{category}</p>
            <div className="grid grid-cols-2 gap-2">
              {fonts.map(font => (
                <button
                  key={font}
                  onClick={() => onChange({ ...typography, fontFamily: font })}
                  className={`p-2 text-left text-sm rounded-lg border-2 transition-all ${
                    typography.fontFamily === font
                      ? 'border-blue-600 bg-blue-50 text-blue-900'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                  style={{ fontFamily: font }}
                >
                  {font}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Preview Mejorado */}
      <div 
        className="p-6 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg border-2 border-slate-200"
        style={{ 
          fontFamily: typography.fontFamily,
        }}
      >
        <h1 
          className="mb-4" 
          style={{ 
            fontSize: typography.headingSize || '2.5rem',
            fontWeight: typography.headingWeight || '700',
            letterSpacing: typography.letterSpacing === 'tight' ? '-0.05em' : typography.letterSpacing === 'wide' ? '0.05em' : '0',
            textTransform: typography.textTransform || 'none',
            lineHeight: typography.lineHeight || '1.2',
          }}
        >
          Título Principal
        </h1>
        <h2 
          className="mb-3 text-slate-700" 
          style={{ 
            fontSize: `calc(${typography.headingSize || '2.5rem'} * 0.7)`,
            fontWeight: typography.headingWeight || '700',
          }}
        >
          Subtítulo de Sección
        </h2>
        <p 
          className="text-slate-600 mb-2"
          style={{ 
            fontSize: typography.bodySize || '1rem',
            fontWeight: typography.bodyWeight || '400',
            lineHeight: typography.lineHeight || '1.6',
            letterSpacing: typography.letterSpacing === 'tight' ? '-0.025em' : typography.letterSpacing === 'wide' ? '0.025em' : '0',
          }}
        >
          Este es un párrafo de ejemplo que muestra cómo se verá el texto en tu tienda. 
          Incluye diferentes palabras para ver el estilo completo de la tipografía.
        </p>
        <p className="text-sm text-slate-500">Texto secundario más pequeño</p>
      </div>

      {/* Controles de Títulos */}
      <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h4 className="text-sm font-semibold text-blue-900">📝 Títulos (H1, H2, H3)</h4>
        
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">
            Tamaño: {typography.headingSize}
          </label>
          <input
            type="range"
            min="1.5"
            max="4"
            step="0.1"
            value={parseFloat(typography.headingSize) || 2.5}
            onChange={(e) => onChange({ ...typography, headingSize: `${e.target.value}rem` })}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-slate-500">
            <span>Pequeño</span>
            <span>Grande</span>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">
            Peso
          </label>
          <select
            value={typography.headingWeight || '700'}
            onChange={(e) => onChange({ ...typography, headingWeight: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg"
          >
            {fontWeights.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Controles de Texto del Cuerpo */}
      <div className="space-y-4 p-4 bg-green-50 rounded-lg border border-green-200">
        <h4 className="text-sm font-semibold text-green-900">📄 Texto del Cuerpo</h4>
        
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">
            Tamaño: {typography.bodySize}
          </label>
          <input
            type="range"
            min="0.75"
            max="1.5"
            step="0.05"
            value={parseFloat(typography.bodySize) || 1}
            onChange={(e) => onChange({ ...typography, bodySize: `${e.target.value}rem` })}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-slate-500">
            <span>Pequeño</span>
            <span>Grande</span>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">
            Peso
          </label>
          <select
            value={typography.bodyWeight || '400'}
            onChange={(e) => onChange({ ...typography, bodyWeight: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg"
          >
            {fontWeights.filter(w => parseInt(w.value) <= 700).map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Controles Adicionales */}
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">
            Interlineado
          </label>
          <input
            type="range"
            min="1"
            max="2"
            step="0.1"
            value={parseFloat(typography.lineHeight) || 1.6}
            onChange={(e) => onChange({ ...typography, lineHeight: e.target.value })}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-slate-500">
            <span>Compacto (1.0)</span>
            <span>Amplio (2.0)</span>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">
            Espaciado de Letras
          </label>
          <div className="grid grid-cols-3 gap-2">
            {letterSpacingOptions.map(({ value, label, example }) => (
              <button
                key={value}
                onClick={() => onChange({ ...typography, letterSpacing: value })}
                className={`p-2 text-sm rounded-lg border-2 transition-all ${
                  (typography.letterSpacing || 'normal') === value
                    ? 'border-blue-600 bg-blue-50 text-blue-900'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
                style={{ letterSpacing: example }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">
            Transformación de Texto
          </label>
          <div className="grid grid-cols-2 gap-2">
            {textTransformOptions.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => onChange({ ...typography, textTransform: value })}
                className={`p-2 text-sm rounded-lg border-2 transition-all ${
                  (typography.textTransform || 'none') === value
                    ? 'border-blue-600 bg-blue-50 text-blue-900'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
                style={{ textTransform: value }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <p className="text-sm text-amber-900">
          <strong>💡 Tip:</strong> Las fuentes serif (como Playfair) son ideales para negocios elegantes, 
          mientras que las sans-serif (como Inter) son perfectas para looks modernos y tecnológicos.
        </p>
      </div>
    </div>
  );
}

// ==================== EFFECTS TAB (NUEVO) ====================
function EffectsTab({ effects, onChange }) {
  const particlePresets = [
    { 
      type: 'dots', 
      label: '⚫ Puntos', 
      desc: 'Partículas circulares clásicas',
      density: 50,
      preview: '· · · · ·'
    },
    { 
      type: 'stars', 
      label: '⭐ Estrellas', 
      desc: 'Perfectas para negocios creativos',
      density: 30,
      preview: '★ ★ ★ ★ ★'
    },
    { 
      type: 'bubbles', 
      label: '🫧 Burbujas', 
      desc: 'Ideales para servicios de spa',
      density: 40,
      preview: '○ ○ ○ ○ ○'
    },
    { 
      type: 'snow', 
      label: '❄️ Nieve', 
      desc: 'Efecto invernal suave',
      density: 60,
      preview: '* * * * *'
    },
    { 
      type: 'hearts', 
      label: '💝 Corazones', 
      desc: 'Ideal para negocios románticos',
      density: 35,
      preview: '♥ ♥ ♥ ♥ ♥'
    },
    { 
      type: 'sparkles', 
      label: '✨ Destellos', 
      desc: 'Elegante y sofisticado',
      density: 45,
      preview: '✦ ✦ ✦ ✦ ✦'
    },
    { 
      type: 'confetti', 
      label: '🎊 Confeti', 
      desc: 'Para eventos y celebraciones',
      density: 70,
      preview: '▪ ▫ ▪ ▫ ▪'
    },
    { 
      type: 'leaves', 
      label: '🍃 Hojas', 
      desc: 'Perfecto para negocios eco',
      density: 40,
      preview: '🍂 🍂 🍂 🍂 🍂'
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
          ⚡ Animaciones
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
                {speed === 'slow' ? 'Lenta' : speed === 'normal' ? 'Normal' : 'Rápida'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Efectos de Scroll */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-slate-700 border-b border-slate-200 pb-2">
          📜 Efectos de Scroll
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
          ✨ Efectos Visuales
        </h4>
        
        <label className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg hover:from-blue-100 hover:to-purple-100 transition-colors cursor-pointer border border-blue-200">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-700">💎 Glassmorphism</span>
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Moderno</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">Efecto de vidrio esmerilado con desenfoque de fondo</p>
            <div className="mt-2 p-2 bg-white/50 backdrop-blur-sm rounded border border-white/30">
              <span className="text-xs text-slate-600">Vista previa del efecto</span>
            </div>
          </div>
          <input
            type="checkbox"
            checked={effects.glassmorphism}
            onChange={(e) => onChange({ ...effects, glassmorphism: e.target.checked })}
            className="w-5 h-5 text-blue-600 rounded ml-3"
          />
        </label>

        <label className="flex items-center justify-between p-3 bg-gradient-to-r from-slate-50 to-slate-100 rounded-lg hover:from-slate-100 hover:to-slate-200 transition-colors cursor-pointer border border-slate-200">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-700">🎨 Neomorphism</span>
              <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">Soft UI</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">Estilo suave con sombras internas y externas</p>
            <div className="mt-2 p-2 rounded" style={{ boxShadow: '4px 4px 8px rgba(0,0,0,0.1), -4px -4px 8px rgba(255,255,255,0.8)' }}>
              <span className="text-xs text-slate-600">Vista previa del efecto</span>
            </div>
          </div>
          <input
            type="checkbox"
            checked={effects.neomorphism}
            onChange={(e) => onChange({ ...effects, neomorphism: e.target.checked })}
            className="w-5 h-5 text-slate-600 rounded ml-3"
          />
        </label>

        <label className="flex items-center justify-between p-3 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg hover:from-indigo-100 hover:to-blue-100 transition-colors cursor-pointer border border-indigo-200">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-700">📦 Sombras 3D</span>
              <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">Profundidad</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">Múltiples capas de sombras para efecto de profundidad</p>
            <div className="mt-2 p-2 bg-white rounded" style={{ boxShadow: '0 2px 4px rgba(0,0,0,0.08), 0 4px 8px rgba(0,0,0,0.06), 0 8px 16px rgba(0,0,0,0.04)' }}>
              <span className="text-xs text-slate-600">Vista previa del efecto</span>
            </div>
          </div>
          <input
            type="checkbox"
            checked={effects.shadows3D}
            onChange={(e) => onChange({ ...effects, shadows3D: e.target.checked })}
            className="w-5 h-5 text-indigo-600 rounded ml-3"
          />
        </label>
      </div>

      {/* Partículas (SIMPLIFICADO) */}
      <div className="space-y-4 p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-purple-900">🎨 Partículas Decorativas</h4>
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
                Tipo de Partícula
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
                        <span className="text-xs text-purple-600">✓</span>
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
                  Cantidad de Partículas
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
                <p className="text-xs text-purple-600 font-medium">Vista previa de partículas</p>
              </div>
              {/* Simulación visual simple */}
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
          <strong>💡 Tip:</strong> Las partículas son perfectas para dar vida a tu tienda, 
          pero úsalas con moderación. Menos es más cuando se trata de efectos visuales.
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
          Personaliza botones, tarjetas y más
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
            <option value="filled">Sólido</option>
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
            <option value="sm">Pequeña</option>
            <option value="md">Media</option>
            <option value="lg">Grande</option>
            <option value="full">Completa</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">Tamaño</label>
          <select
            value={components.buttons.size}
            onChange={(e) => onChange({ 
              ...components, 
              buttons: { ...components.buttons, size: e.target.value } 
            })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg"
          >
            <option value="sm">Pequeño</option>
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
            <option value="neumorphic">Neumórfica</option>
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
          Divisores de Sección
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
    
    console.log('🖼️ === INICIO DE SUBIDA DE IMAGEN ===');
    console.log('📁 Archivo recibido:', {
      name: file?.name,
      type: file?.type,
      size: file?.size,
      sizeKB: file ? (file.size / 1024).toFixed(2) : 0,
      sizeMB: file ? (file.size / (1024 * 1024)).toFixed(2) : 0
    });

    if (!file) {
      console.error('❌ No se recibió ningún archivo');
      return;
    }

    // Validar que sea imagen
    if (!file.type.startsWith('image/')) {
      console.error('❌ Tipo de archivo inválido:', file.type);
      alert('⚠️ Por favor selecciona un archivo de imagen (JPG, PNG, etc.)');
      return;
    }
    console.log('✅ Tipo de archivo válido:', file.type);

    // Validar tamaño (máx 5MB)
    if (file.size > 5 * 1024 * 1024) {
      console.error('❌ Archivo muy grande:', (file.size / (1024 * 1024)).toFixed(2), 'MB');
      alert('⚠️ La imagen es muy grande. Máximo 5MB permitido');
      return;
    }
    console.log('✅ Tamaño válido:', (file.size / (1024 * 1024)).toFixed(2), 'MB');

    try {
      setUploadingImage(true);
      console.log('📤 Preparando subida de fondo...');
      
      // Crear FormData
      const formData = new FormData();
      formData.append('file', file);
      formData.append('storeId', storeData._id);
      console.log('📋 FormData creado con archivo y storeId');

      const uploadUrl = 'http://localhost:3000/api/upload/store-logo';
      console.log('🌐 URL de subida:', uploadUrl);
      console.log('📤 Iniciando subida con axios...');

      // Subir usando axios con withCredentials
      const response = await axios.post(
        uploadUrl,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          withCredentials: true
        }
      );

      console.log('📥 Respuesta recibida:', response.data);

      const imageUrl = response.data.logoUrl || response.data.url || response.data.imageUrl;
      console.log('🖼️ URL de imagen:', imageUrl);

      if (!imageUrl) {
        throw new Error('El servidor no devolvió una URL de imagen');
      }

      // Actualizar el background con la URL
      const newBackground = { 
        ...background, 
        mode: 'image',
        imageUrl: imageUrl 
      };
      console.log('🔄 Actualizando background:', newBackground);
      
      onBackgroundChange(newBackground);

      console.log('✅ Imagen de fondo subida correctamente');
      alert('✅ Imagen de fondo subida correctamente');
    } catch (error) {
      console.error('❌ ERROR COMPLETO:', {
        message: error.message,
        response: error.response?.data,
        error: error
      });
      alert(`❌ Error al subir la imagen: ${error.message}`);
    } finally {
      setUploadingImage(false);
      console.log('🏁 === FIN DE SUBIDA DE IMAGEN ===');
    }
  };

  return (
    <div className="p-4 space-y-6">
      <div>
        <h3 className="font-semibold text-slate-900 text-lg flex items-center gap-2">
          <span className="text-2xl">📐</span>
          Diseño y Fondo
        </h3>
        <p className="text-sm text-slate-600 mt-1">
          Configura la estructura y fondo de tu tienda
        </p>
      </div>

      {/* Layout Style */}
      <div className="space-y-3 p-4 bg-purple-50 rounded-lg border border-purple-200">
        <h4 className="text-sm font-semibold text-purple-900">📋 Estilo de Página</h4>
        <p className="text-xs text-purple-600 mb-2">
          Elige cómo se organiza el contenido en tu tienda
        </p>
        <select
          value={layout.style}
          onChange={(e) => onLayoutChange({ ...layout, style: e.target.value })}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
        >
          <option value="hero-top">🔝 Hero Arriba - Banner grande en la parte superior</option>
          <option value="hero-center">⭕ Hero Centrado - Contenido centrado verticalmente</option>
          <option value="hero-split">↔️ Hero Dividido - Imagen a un lado, texto al otro</option>
          <option value="minimal">⚪ Minimalista - Diseño limpio y simple</option>
          <option value="cards-grid">🔲 Grid de Tarjetas - Layout tipo galería</option>
        </select>
      </div>

      {/* Background Mode */}
      <div className="space-y-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h4 className="text-sm font-semibold text-blue-900">🎨 Tipo de Fondo</h4>
        <select
          value={background.mode}
          onChange={(e) => {
            const newMode = e.target.value;
            const updatedBackground = { ...background, mode: newMode };
            
            // Si selecciona degradado y no hay datos, inicializar con colores actuales
            if (newMode === 'gradient' && !background.gradient) {
              updatedBackground.gradient = {
                type: 'linear',
                direction: 'to bottom',
                colors: [appearance?.colors?.primary || '#3b82f6', appearance?.colors?.secondary || '#8b5cf6'],
                stops: [0, 100]
              };
            }
            
            // Si selecciona patrón y no hay datos, inicializar
            if (newMode === 'pattern' && !background.pattern) {
              updatedBackground.pattern = {
                type: 'dots',
                color: '#000000',
                opacity: 0.1,
                scale: 1
              };
            }
            
            onBackgroundChange(updatedBackground);
          }}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="solid">🎨 Color Sólido</option>
          <option value="gradient">🌈 Degradado</option>
          <option value="pattern">🔷 Patrón Decorativo</option>
        </select>

        {/* Degradado */}
        {background.mode === 'gradient' && (
          <div className="mt-4 space-y-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Tipo de Degradado</label>
              <select
                value={background.gradient?.type || 'linear'}
                onChange={(e) => onBackgroundChange({ 
                  ...background, 
                  gradient: { ...background.gradient, type: e.target.value } 
                })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              >
                <option value="linear">📐 Lineal</option>
                <option value="radial">⭕ Radial</option>
              </select>
            </div>
            
            {background.gradient?.type === 'linear' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Dirección</label>
                <select
                  value={background.gradient?.direction || 'to bottom'}
                  onChange={(e) => onBackgroundChange({ 
                    ...background, 
                    gradient: { ...background.gradient, direction: e.target.value } 
                  })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                >
                  <option value="to bottom">⬇️ Arriba → Abajo</option>
                  <option value="to top">⬆️ Abajo → Arriba</option>
                  <option value="to right">➡️ Izquierda → Derecha</option>
                  <option value="to left">⬅️ Derecha → Izquierda</option>
                  <option value="135deg">↘️ Diagonal (↘)</option>
                  <option value="45deg">↗️ Diagonal (↗)</option>
                </select>
              </div>
            )}
            
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-xs text-blue-700">
                💡 Los colores del degradado se toman de "Color Primario" y "Color Secundario" en la pestaña Colores
              </p>
            </div>
          </div>
        )}

        {/* Patrón */}
        {background.mode === 'pattern' && (
          <div className="mt-4 space-y-2">
            <label className="block text-sm font-medium text-slate-700">Patrón</label>
            <select
              value={background.pattern?.type || 'dots'}
              onChange={(e) => onBackgroundChange({ 
                ...background, 
                pattern: { ...background.pattern, type: e.target.value } 
              })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
            >
              <option value="dots">⚫ Puntos</option>
              <option value="waves">🌊 Ondas</option>
              <option value="lines">📏 Líneas</option>
              <option value="mesh">🕸️ Malla</option>
              <option value="grid">⬜ Cuadrícula</option>
              <option value="hexagons">⬡ Hexágonos</option>
            </select>
          </div>
        )}
      </div>

      {/* Spacing */}
      <div className="space-y-3 p-4 bg-green-50 rounded-lg border border-green-200">
        <h4 className="text-sm font-semibold text-green-900">📏 Espaciado</h4>
        <p className="text-xs text-green-600 mb-2">
          Controla el espacio entre elementos
        </p>
        <select
          value={layout.spacing}
          onChange={(e) => onLayoutChange({ ...layout, spacing: e.target.value })}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500"
        >
          <option value="compact">📦 Compacto - Menos espacio, más contenido visible</option>
          <option value="normal">📄 Normal - Equilibrio perfecto</option>
          <option value="relaxed">🌅 Relajado - Más espacio, diseño aireado</option>
        </select>
      </div>

      {/* Tip */}
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <p className="text-sm text-amber-900">
          <span className="font-semibold">💡 Tip:</span> Para imágenes de fondo, usa imágenes de alta calidad pero optimizadas. 
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
        <h3 className="font-semibold text-slate-900 text-lg">📝 Gestión de Contenido</h3>
        <p className="text-sm text-slate-600 mt-1">
          Personaliza todos los textos de tu tienda
        </p>
      </div>

      {/* Hero Section */}
      <div className="space-y-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h4 className="font-semibold text-slate-900 flex items-center gap-2">
          <span className="text-xl">🎯</span>
          Sección Hero (Principal)
        </h4>
        
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Título Principal
            </label>
            <input
              type="text"
              defaultValue={storeData?.name || 'Mi Tienda'}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Ej: Bienvenido a Mi Negocio"
            />
            <p className="text-xs text-slate-500 mt-1">Este es el título más grande que verán tus clientes</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Descripción / Eslogan
            </label>
            <textarea
              defaultValue={storeData?.description || 'Descripción de tu negocio'}
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Ej: La mejor experiencia en servicios profesionales"
            />
            <p className="text-xs text-slate-500 mt-1">Describe brevemente qué ofreces</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Texto del Botón Principal
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
            {storeData?.businessType === 'bookings' ? '⏰' : '📦'}
          </span>
          Sección de {storeData?.businessType === 'bookings' ? 'Servicios' : 'Productos'}
        </h4>
        
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Título de la Sección
            </label>
            <input
              type="text"
              defaultValue={storeData?.businessType === 'bookings' ? 'Nuestros Servicios' : 'Nuestros Productos'}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Descripción de la Sección
            </label>
            <textarea
              defaultValue={storeData?.businessType === 'bookings' 
                ? 'Descubre nuestra variedad de servicios profesionales' 
                : 'Explora nuestro catálogo de productos'}
              rows={2}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>
      </div>

      {/* About Section */}
      <div className="space-y-3 p-4 bg-green-50 rounded-lg border border-green-200">
        <h4 className="font-semibold text-slate-900 flex items-center gap-2">
          <span className="text-xl">ℹ️</span>
          Sección "Acerca de"
        </h4>
        
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Título
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
              defaultValue="Somos un equipo comprometido con la excelencia y la satisfacción de nuestros clientes."
              rows={4}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500"
              placeholder="Cuenta tu historia, misión, valores..."
            />
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="space-y-3 p-4 bg-orange-50 rounded-lg border border-orange-200">
        <h4 className="font-semibold text-slate-900 flex items-center gap-2">
          <span className="text-xl">📞</span>
          Información de Contacto
        </h4>
        
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Título de Contacto
            </label>
            <input
              type="text"
              defaultValue="Contáctanos"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Mensaje de Contacto
            </label>
            <textarea
              defaultValue="¿Tienes preguntas? Estamos aquí para ayudarte."
              rows={2}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="space-y-3 p-4 bg-slate-100 rounded-lg border border-slate-300">
        <h4 className="font-semibold text-slate-900 flex items-center gap-2">
          <span className="text-xl">🔖</span>
          Pie de Página
        </h4>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Texto del Footer
          </label>
          <input
            type="text"
            defaultValue={`© ${new Date().getFullYear()} ${storeData?.name || 'Mi Tienda'}. Todos los derechos reservados.`}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
          />
        </div>
      </div>

      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-sm text-yellow-800">
          <span className="font-semibold">💡 Nota:</span> Estos cambios de contenido se guardarán junto con tu diseño. 
          Asegúrate de hacer clic en "Guardar Cambios" al finalizar.
        </p>
      </div>
    </div>
  );
}

// ==================== SECTIONS TAB ====================
function SectionsTab({ sections, onChange, storeData, onStoreUpdate }) {
  const [customBoxes, setCustomBoxes] = useState(storeData?.customBoxes || []);
  const [showAddBox, setShowAddBox] = useState(false);
  const [newBox, setNewBox] = useState({ title: '', content: '', icon: '📌' });

  // Sincronizar customBoxes cuando storeData cambie
  useEffect(() => {
    if (storeData?.customBoxes) {
      setCustomBoxes(storeData.customBoxes);
    }
  }, [storeData?.customBoxes]);

  const iconOptions = ['📌', '💡', '🎯', '⚡', '🌟', '🔥', '💎', '🏆', '✨', '🎨', '🚀', '💪'];

  const handleAddBox = () => {
    if (!newBox.title || !newBox.content) {
      alert('⚠️ Por favor completa el título y contenido');
      return;
    }
    const updatedBoxes = [...customBoxes, { ...newBox, id: Date.now() }];
    setCustomBoxes(updatedBoxes);
    onStoreUpdate('customBoxes', updatedBoxes);
    setNewBox({ title: '', content: '', icon: '📌' });
    setShowAddBox(false);
  };

  const handleDeleteBox = (id) => {
    const updatedBoxes = customBoxes.filter(box => box.id !== id);
    setCustomBoxes(updatedBoxes);
    onStoreUpdate('customBoxes', updatedBoxes);
  };

  const sectionList = [
    { 
      key: 'hero', 
      label: 'Hero / Portada', 
      icon: '🎯',
      description: 'Sección principal con tu logo, nombre y descripción del negocio. Primera impresión.',
      example: 'Muestra: Logo + Nombre + Descripción + Botón principal',
      implemented: true
    },
    { 
      key: 'about', 
      label: 'Acerca de', 
      icon: '📝',
      description: 'Cuenta tu historia, misión y valores. Conéctate con tus clientes.',
      example: 'Muestra: Texto sobre tu negocio, historia, propuesta de valor',
      implemented: true
    },
    { 
      key: 'services', 
      label: 'Servicios / Productos', 
      icon: '🛠️',
      description: 'Muestra tus servicios (si eres de tipo agendamiento) o productos (si eres tienda).',
      example: 'Muestra: Grid con servicios/productos, precios, botón de acción',
      implemented: true
    },
    { 
      key: 'gallery', 
      label: 'Galería', 
      icon: '🖼️',
      description: 'Fotos de tu negocio, trabajos realizados, instalaciones o productos.',
      example: 'Muestra: Grid de imágenes con lightbox',
      implemented: false
    },
    { 
      key: 'testimonials', 
      label: 'Testimonios', 
      icon: '💬',
      description: 'Reseñas y comentarios de clientes satisfechos. Genera confianza.',
      example: 'Muestra: Carrusel de testimonios con foto, nombre y comentario',
      implemented: false
    },
    { 
      key: 'schedule', 
      label: 'Horarios', 
      icon: '⏰',
      description: 'Horario de atención de tu negocio. Días y horas en que estás disponible.',
      example: 'Muestra: Tabla con días de la semana y horarios',
      implemented: true
    },
    { 
      key: 'contact', 
      label: 'Contacto', 
      icon: '📞',
      description: 'Información de contacto: dirección, teléfono, email, redes sociales.',
      example: 'Muestra: Íconos + Datos de contacto + Mapa (opcional)',
      implemented: false
    },
    { 
      key: 'booking', 
      label: 'Sistema de Reservas', 
      icon: '📅',
      description: 'Formulario para que clientes agenden citas (solo tiendas de agendamiento).',
      example: 'Muestra: Calendario + Selección de hora + Formulario',
      implemented: true
    },
  ];

  // Asegurar que sections tenga valores por defecto
  const safeSections = sections || {
    hero: true,
    about: true,
    services: true,
    gallery: false,  // NO IMPLEMENTADA
    testimonials: false,  // NO IMPLEMENTADA
    schedule: true,
    contact: false,  // NO IMPLEMENTADA
    booking: true,
  };

  return (
    <div className="p-4 space-y-6">
      <div>
        <h3 className="font-semibold text-slate-900 text-lg flex items-center gap-2">
          <span className="text-2xl">📋</span>
          Secciones Visibles
        </h3>
        <p className="text-sm text-slate-600 mt-1">
          Activa o desactiva secciones según lo que necesites mostrar en tu tienda
        </p>
      </div>

      <div className="space-y-3">
        {sectionList.map(({ key, label, icon, description, example, implemented }) => (
          <div
            key={key}
            className={`p-4 rounded-xl border-2 transition-all ${
              !implemented 
                ? 'bg-slate-100 border-slate-300 opacity-60' 
                : 'bg-gradient-to-r from-slate-50 to-white border-slate-200 hover:border-blue-300'
            }`}
          >
            <label className={`flex items-start gap-3 ${implemented ? 'cursor-pointer' : 'cursor-not-allowed'}`}>
              <input
                type="checkbox"
                checked={safeSections[key] || false}
                onChange={(e) => onChange({ ...safeSections, [key]: e.target.checked })}
                disabled={!implemented}
                className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 mt-1 flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
              />
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className="text-2xl">{icon}</span>
                  <span className="text-sm font-semibold text-slate-900">{label}</span>
                  {!implemented && (
                    <span className="ml-auto text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-medium">
                      🚧 Próximamente
                    </span>
                  )}
                  {implemented && safeSections[key] && (
                    <span className="ml-auto text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                      ✓ Activada
                    </span>
                  )}
                </div>
                
                <p className="text-sm text-slate-700 mb-2">{description}</p>
                
                <div className={`border rounded-lg p-2 ${!implemented ? 'bg-slate-50 border-slate-300' : 'bg-blue-50 border-blue-200'}`}>
                  <p className={`text-xs ${!implemented ? 'text-slate-600' : 'text-blue-800'}`}>
                    <span className="font-semibold">📌 {example}</span>
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
          <span>📊</span>
          Resumen
        </h4>
        <p className="text-sm text-blue-800">
          <span className="font-bold text-lg">{Object.values(safeSections).filter(Boolean).length}</span> 
          {' '}de {sectionList.length} secciones activadas
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {sectionList.filter(s => safeSections[s.key]).map(s => (
            <span key={s.key} className="text-xs bg-white px-2 py-1 rounded-full border border-blue-200">
              {s.icon} {s.label}
            </span>
          ))}
        </div>
      </div>

      {/* Cuadros Informativos Personalizados */}
      <div className="space-y-4 p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border-2 border-indigo-200">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-semibold text-indigo-900 mb-1 flex items-center gap-2">
              <span>📦</span>
              Cuadros Personalizados
            </h4>
            <p className="text-xs text-indigo-700">
              Agrega cuadros con información adicional sobre tu negocio
            </p>
          </div>
          <button
            onClick={() => setShowAddBox(!showAddBox)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium flex items-center gap-2"
          >
            <span className="text-lg">+</span>
            Agregar Cuadro
          </button>
        </div>

        {/* Formulario para nuevo cuadro */}
        {showAddBox && (
          <div className="p-4 bg-white rounded-lg border-2 border-indigo-300 space-y-3">
            <h5 className="font-semibold text-indigo-900 text-sm">Nuevo Cuadro Informativo</h5>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Ícono o Emoji
              </label>
              <input
                type="text"
                value={newBox.icon}
                onChange={(e) => setNewBox({ ...newBox, icon: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-2xl text-center"
                placeholder="Escribe un emoji: 💡 🎯 ⭐ 🚀"
                maxLength={10}
              />
              <p className="text-xs text-slate-500 mt-1">
                Puedes usar cualquier emoji o texto. Ej: 💡 🎯 ⭐ 🚀 ✨ 🔥 💪
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Título del Cuadro *
              </label>
              <input
                type="text"
                value={newBox.title}
                onChange={(e) => setNewBox({ ...newBox, title: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="Ej: Nuestra Misión"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Contenido *
              </label>
              <textarea
                value={newBox.content}
                onChange={(e) => setNewBox({ ...newBox, content: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="Escribe el contenido del cuadro..."
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleAddBox}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
              >
                ✓ Agregar
              </button>
              <button
                onClick={() => {
                  setShowAddBox(false);
                  setNewBox({ title: '', content: '', icon: '📌' });
                }}
                className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Lista de cuadros existentes */}
        {customBoxes.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-indigo-900">Cuadros creados ({customBoxes.length}):</p>
            {customBoxes.map((box) => (
              <div key={box.id} className="p-3 bg-white rounded-lg border border-indigo-200 flex items-start gap-3">
                <span className="text-2xl">{box.icon}</span>
                <div className="flex-1">
                  <h6 className="font-semibold text-slate-800 text-sm">{box.title}</h6>
                  <p className="text-xs text-slate-600 mt-1 line-clamp-2">{box.content}</p>
                </div>
                <button
                  onClick={() => handleDeleteBox(box.id)}
                  className="text-red-600 hover:text-red-700 text-sm font-medium"
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>
        )}

        {customBoxes.length === 0 && !showAddBox && (
          <div className="text-center py-8 text-slate-500">
            <p className="text-sm">No hay cuadros personalizados todavía</p>
            <p className="text-xs mt-1">Haz clic en "Agregar Cuadro" para crear uno</p>
          </div>
        )}
      </div>

      {/* Tip */}
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <p className="text-sm text-amber-900">
          <span className="font-semibold">💡 Tip:</span> Los cuadros personalizados son perfectos para destacar 
          información importante como garantías, políticas, valores o cualquier mensaje especial para tus clientes.
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
        <p className="text-lg opacity-90">{storeData?.description || 'Descripción de la tienda'}</p>
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
                Descripción del producto
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
    { id: 'restaurant', label: 'Restaurante / Cafetería', theme: 'restaurant', icon: '🍽️' },
    { id: 'beauty', label: 'Belleza / Salón', theme: 'beauty-salon', icon: '💅' },
    { id: 'fitness', label: 'Fitness / Gym', theme: 'fitness-center', icon: '💪' },
    { id: 'boutique', label: 'Boutique / Ropa', theme: 'elegant-boutique', icon: '👗' },
    { id: 'tech', label: 'Tecnología / Startup', theme: 'tech-startup', icon: '🚀' },
    { id: 'creative', label: 'Creativo / Artístico', theme: 'artistic-studio', icon: '🎨' },
    { id: 'professional', label: 'Servicios Profesionales', theme: 'professional-services', icon: '💼' },
    { id: 'eco', label: 'Eco / Natural', theme: 'eco-friendly', icon: '🌱' },
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
            <h2 className="text-2xl font-bold text-slate-900">🧙 Asistente de Personalización</h2>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 text-2xl"
            >
              ✕
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
                ¿Qué tipo de negocio tienes?
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
                ¡Perfecto! Hemos seleccionado una plantilla ideal para ti
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
                  ← Atrás
                </button>
                <button
                  onClick={handleFinish}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 font-medium shadow-lg"
                >
                  Aplicar Plantilla ✨
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
