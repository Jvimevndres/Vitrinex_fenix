// backend/src/controllers/appearance.controller.js
import StoreAppearance from "../models/storeAppearance.model.js";
import Store from "../models/store.model.js";

/**
 * Función helper para hacer merge profundo recursivo
 * Necesario para actualizar objetos anidados correctamente
 */
function deepMerge(target, source) {
  const output = { ...target };
  
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (isObject(source[key])) {
        if (!(key in target)) {
          output[key] = source[key];
        } else {
          output[key] = deepMerge(target[key], source[key]);
        }
      } else {
        output[key] = source[key];
      }
    });
  }
  
  return output;
}

function isObject(item) {
  return item && typeof item === 'object' && !Array.isArray(item);
}

/**
 * GET /api/stores/:id/appearance
 * Obtener configuración de apariencia (público)
 */
export const getStoreAppearance = async (req, res) => {
  try {
    const { id } = req.params;

    let appearance = await StoreAppearance.findOne({ store: id });

    // Si no existe, crear una por defecto
    if (!appearance) {
      appearance = new StoreAppearance({
        store: id,
        theme: "minimal",
      });
      await appearance.save();
      console.log(`✨ Apariencia por defecto creada para store: ${id}`);
    }

    return res.json(appearance);
  } catch (error) {
    console.error("Error al obtener apariencia:", error);
    return res.status(500).json({ message: "Error al obtener la apariencia" });
  }
};

/**
 * PUT /api/stores/:id/appearance
 * Actualizar configuración de apariencia (solo owner)
 */
export const updateStoreAppearance = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Verificar ownership
    const store = await Store.findById(id);
    if (!store) {
      return res.status(404).json({ message: "Tienda no encontrada" });
    }

    const ownerId = store.owner?.toString() || store.user?.toString();
    if (ownerId !== userId) {
      return res.status(403).json({ message: "No tienes permisos sobre esta tienda" });
    }

    // Buscar o crear apariencia
    let appearance = await StoreAppearance.findOne({ store: id });

    if (!appearance) {
      appearance = new StoreAppearance({ store: id });
    }

    // Actualizar solo los campos proporcionados
    const allowedFields = [
      "theme",
      "colors",
      "typography",
      "background",
      "layout",
      "components",
      "sections",
      "content",
      "effects",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        // Usar merge profundo para objetos anidados
        if (typeof req.body[field] === "object" && !Array.isArray(req.body[field])) {
          const existing = appearance[field] ? appearance[field].toObject() : {};
          appearance[field] = deepMerge(existing, req.body[field]);
        } else {
          appearance[field] = req.body[field];
        }
      }
    });

    appearance.version += 1;
    await appearance.save();

    console.log(`✨ Apariencia actualizada para store: ${id} (v${appearance.version})`);

    return res.json(appearance);
  } catch (error) {
    console.error("Error al actualizar apariencia:", error);
    return res.status(500).json({ message: "Error al actualizar la apariencia" });
  }
};

/**
 * POST /api/stores/:id/appearance/apply-theme
 * Aplicar tema predefinido
 */
export const applyTheme = async (req, res) => {
  try {
    const { id } = req.params;
    const { themeName } = req.body;
    const userId = req.user.id;

    if (!themeName) {
      return res.status(400).json({ message: "Nombre de tema requerido" });
    }

    // Verificar ownership
    const store = await Store.findById(id);
    if (!store) {
      return res.status(404).json({ message: "Tienda no encontrada" });
    }

    const ownerId = store.owner?.toString() || store.user?.toString();
    if (ownerId !== userId) {
      return res.status(403).json({ message: "No tienes permisos sobre esta tienda" });
    }

    // Buscar o crear apariencia
    let appearance = await StoreAppearance.findOne({ store: id });
    if (!appearance) {
      appearance = new StoreAppearance({ store: id });
    }

    // Aplicar tema
    appearance.applyTheme(themeName);
    appearance.version += 1;
    await appearance.save();

    console.log(`🎨 Tema "${themeName}" aplicado a store: ${id}`);

    return res.json(appearance);
  } catch (error) {
    console.error("Error al aplicar tema:", error);
    return res.status(500).json({ message: "Error al aplicar el tema" });
  }
};

/**
 * POST /api/stores/:id/appearance/reset
 * Resetear a configuración por defecto
 */
export const resetAppearance = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Verificar ownership
    const store = await Store.findById(id);
    if (!store) {
      return res.status(404).json({ message: "Tienda no encontrada" });
    }

    const ownerId = store.owner?.toString() || store.user?.toString();
    if (ownerId !== userId) {
      return res.status(403).json({ message: "No tienes permisos sobre esta tienda" });
    }

    // Eliminar y recrear
    await StoreAppearance.deleteOne({ store: id });

    const appearance = new StoreAppearance({
      store: id,
      theme: "minimal",
    });
    await appearance.save();

    console.log(`🔄 Apariencia reseteada para store: ${id}`);

    return res.json(appearance);
  } catch (error) {
    console.error("Error al resetear apariencia:", error);
    return res.status(500).json({ message: "Error al resetear la apariencia" });
  }
};

/**
 * GET /api/appearance/themes
 * Obtener lista de temas disponibles
 */
export const getAvailableThemes = async (req, res) => {
  try {
    const themes = [
      // Minimalistas (5)
      { id: "minimal", name: "Minimal Clean", category: "minimal", description: "Diseño limpio y profesional" },
      { id: "minimal-white", name: "Minimal White", category: "minimal", description: "Blanco puro minimalista" },
      { id: "minimal-gray", name: "Minimal Gray", category: "minimal", description: "Grises elegantes" },
      { id: "minimal-mono", name: "Minimal Mono", category: "minimal", description: "Monocromático simple" },
      { id: "minimal-zen", name: "Minimal Zen", category: "minimal", description: "Serenidad y balance" },
      
      // Negocios (8)
      { id: "professional-services", name: "Servicios Profesionales", category: "business", description: "Ideal para consultorías" },
      { id: "warm-cafe", name: "Cafetería Acogedora", category: "business", description: "Perfecto para cafés" },
      { id: "eco-friendly", name: "Eco Friendly", category: "business", description: "Productos sostenibles" },
      { id: "restaurant", name: "Restaurante Gourmet", category: "business", description: "Comida y gastronomía" },
      { id: "corporate-blue", name: "Corporativo Azul", category: "business", description: "Profesional y confiable" },
      { id: "medical-clinic", name: "Clínica Médica", category: "business", description: "Salud y bienestar" },
      { id: "law-firm", name: "Bufete Legal", category: "business", description: "Abogados y legal" },
      { id: "financial-advisor", name: "Asesor Financiero", category: "business", description: "Finanzas e inversiones" },
      
      // Creativos (7)
      { id: "artistic-studio", name: "Estudio Artístico", category: "creative", description: "Para artistas y creativos" },
      { id: "pastel", name: "Pastel Dreams", category: "creative", description: "Colores suaves" },
      { id: "gradient-wave", name: "Gradient Wave", category: "creative", description: "Degradados vibrantes" },
      { id: "photography", name: "Fotografía Pro", category: "creative", description: "Portfolio fotográfico" },
      { id: "music-studio", name: "Estudio Musical", category: "creative", description: "Música y audio" },
      { id: "design-agency", name: "Agencia de Diseño", category: "creative", description: "Diseño gráfico y web" },
      { id: "video-production", name: "Producción de Video", category: "creative", description: "Cine y video" },
      
      // Modernos (6)
      { id: "tech-startup", name: "Tech Startup", category: "modern", description: "Tecnología y startups" },
      { id: "modern-agency", name: "Agencia Moderna", category: "modern", description: "Diseño contemporáneo" },
      { id: "dark-pro", name: "Dark Pro", category: "modern", description: "Profesional oscuro" },
      { id: "cyber-tech", name: "Cyber Tech", category: "modern", description: "Futurista tecnológico" },
      { id: "app-developer", name: "Desarrollador de Apps", category: "modern", description: "Desarrollo de software" },
      { id: "gaming-esports", name: "Gaming & Esports", category: "modern", description: "Videojuegos y competencias" },
      
      // Elegantes (5)
      { id: "elegant-boutique", name: "Boutique Elegante", category: "elegant", description: "Lujo y sofisticación" },
      { id: "luxury-brand", name: "Marca de Lujo", category: "elegant", description: "Premium y exclusivo" },
      { id: "beauty-salon", name: "Salón de Belleza", category: "elegant", description: "Belleza y cuidado" },
      { id: "jewelry-store", name: "Joyería Exclusiva", category: "elegant", description: "Joyas y accesorios" },
      { id: "spa-wellness", name: "Spa & Wellness", category: "elegant", description: "Relajación y bienestar" },
      
      // Vibrantes (4)
      { id: "neon", name: "Neon Lights", category: "vibrant", description: "Colores neón y energía" },
      { id: "vibrant-shop", name: "Tienda Vibrante", category: "vibrant", description: "Colorido y llamativo" },
      { id: "fitness-center", name: "Centro de Fitness", category: "vibrant", description: "Energía y movimiento" },
      { id: "party-events", name: "Eventos y Fiestas", category: "vibrant", description: "Celebraciones" },
    ];

    return res.json(themes);
  } catch (error) {
    console.error("Error al obtener temas:", error);
    return res.status(500).json({ message: "Error al obtener los temas" });
  }
};
