// frontend/src/components/StoreVisualBuilder.jsx
import { useState, useEffect } from 'react';
import {
  getStoreAppearance,
  updateStoreAppearance,
  applyTheme,
  resetAppearance,
  getAvailableThemes,
} from '../api/appearance';

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
  const [activeTab, setActiveTab] = useState('theme'); // theme, colors, typography, layout, components, sections
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
      console.log('💾 Guardando apariencia:', appearance);
      const updated = await updateStoreAppearance(storeId, appearance);
      console.log('✅ Apariencia guardada:', updated);
      setAppearance(updated);
      setHasChanges(false);
      alert('✅ Cambios guardados correctamente');
      if (onClose) onClose(); // Cerrar el constructor después de guardar
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
            <h1 className="text-xl font-bold text-slate-900">Constructor Visual</h1>
            <p className="text-sm text-slate-500">Personaliza tu tienda</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {hasChanges && (
            <span className="text-sm text-amber-600 font-medium">
              • Cambios sin guardar
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
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {saving ? 'Guardando...' : '💾 Guardar Cambios'}
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
                { id: 'theme', icon: '🎨', label: 'Temas' },
                { id: 'colors', icon: '🌈', label: 'Colores' },
                { id: 'typography', icon: '📝', label: 'Tipografía' },
                { id: 'layout', icon: '📐', label: 'Layout' },
                { id: 'components', icon: '🧩', label: 'Componentes' },
                { id: 'sections', icon: '📋', label: 'Secciones' },
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
  
  const { colors, typography, components } = appearance;
  const storeMode = storeData?.mode || 'products';

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

  return (
    <div 
      className="min-h-screen p-8"
      style={{ 
        backgroundColor: colors.background,
        fontFamily: typography.fontFamily,
        fontSize: typography.bodySize,
        lineHeight: typography.lineHeight,
      }}
    >
      {/* Header de ejemplo */}
      <div className="mb-8 pb-4 border-b" style={{ borderColor: colors.border }}>
        <h1 
          className="font-bold mb-2"
          style={{ 
            color: colors.text,
            fontSize: typography.headingSize,
          }}
        >
          Mi Tienda
        </h1>
        <p style={{ color: colors.textSecondary }}>
          Vista previa de tu tienda personalizada
        </p>
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
        <h2 className="text-lg font-semibold mb-3" style={{ color: colors.text }}>
          Tarjetas
        </h2>
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
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
              <h3 className="font-semibold mb-2" style={{ color: colors.text }}>
                Servicio {i}
              </h3>
              <p className="text-sm" style={{ color: colors.textSecondary }}>
                Descripción del servicio que ofreces
              </p>
              <div className="mt-4 pt-4" style={{ borderTop: `1px solid ${colors.border}` }}>
                <span className="font-bold" style={{ color: colors.primary }}>
                  $15.000
                </span>
              </div>
            </div>
          ))}
        </div>
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
  );
}
