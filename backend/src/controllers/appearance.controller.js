// backend/src/controllers/appearance.controller.js
import StoreAppearance from "../models/storeAppearance.model.js";
import Store from "../models/store.model.js";

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
        // Merge profundo para objetos anidados
        if (typeof req.body[field] === "object" && !Array.isArray(req.body[field])) {
          const existing = appearance[field] ? appearance[field].toObject() : {};
          appearance[field] = { ...existing, ...req.body[field] };
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
      {
        id: "minimal",
        name: "Minimal",
        description: "Diseño limpio y profesional con enfoque en el contenido",
        preview: {
          primary: "#0f172a",
          secondary: "#64748b",
          accent: "#3b82f6",
        },
      },
      {
        id: "neon",
        name: "Neon",
        description: "Vibrante y moderno con efectos de neón",
        preview: {
          primary: "#a855f7",
          secondary: "#ec4899",
          accent: "#06b6d4",
        },
      },
      {
        id: "dark-pro",
        name: "Dark Pro",
        description: "Tema oscuro profesional y elegante",
        preview: {
          primary: "#3b82f6",
          secondary: "#8b5cf6",
          accent: "#10b981",
        },
      },
      {
        id: "pastel",
        name: "Pastel",
        description: "Suave y acogedor con colores pastel",
        preview: {
          primary: "#fb7185",
          secondary: "#a78bfa",
          accent: "#fbbf24",
        },
      },
      {
        id: "gradient-wave",
        name: "Gradient Wave",
        description: "Degradados fluidos y modernos",
        preview: {
          primary: "#6366f1",
          secondary: "#a855f7",
          accent: "#ec4899",
        },
      },
    ];

    return res.json(themes);
  } catch (error) {
    console.error("Error al obtener temas:", error);
    return res.status(500).json({ message: "Error al obtener los temas" });
  }
};
