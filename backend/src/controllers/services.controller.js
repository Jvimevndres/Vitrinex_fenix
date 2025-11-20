// src/controllers/services.controller.js
import Service from "../models/service.model.js";
import Store from "../models/store.model.js";

/**
 * Helper: Verificar que el usuario es dueño de la tienda
 */
const verifyStoreOwnership = async (storeId, userId) => {
  const store = await Store.findById(storeId);
  if (!store) {
    return { error: { status: 404, message: "Tienda no encontrada" } };
  }

  const ownerId = store.owner?.toString();
  const legacyOwnerId = store.user?.toString();
  if (ownerId !== userId && legacyOwnerId !== userId) {
    return { error: { status: 403, message: "No tienes permisos sobre esta tienda" } };
  }

  return { store };
};

/**
 * GET /api/stores/:storeId/services
 * Obtener todos los servicios de una tienda
 * Público: Los clientes también necesitan ver los servicios
 * Query params: includeInactive, tags, category, search
 */
export const getStoreServices = async (req, res) => {
  try {
    const { storeId } = req.params;
    const { includeInactive, tags, category, search } = req.query;

    // Validar que la tienda exists
    const store = await Store.findById(storeId);
    if (!store) {
      return res.status(404).json({ message: "Tienda no encontrada" });
    }

    // Query base
    const query = { store: storeId };

    // Si no se solicita incluir inactivos, filtrar solo activos
    if (includeInactive !== "true") {
      query.isActive = true;
    }

    // Filtro por tags (puede ser un string separado por comas o un array)
    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim());
      if (tagArray.length > 0) {
        query.tags = { $in: tagArray };
      }
    }

    // Filtro por categoría
    if (category && category.trim()) {
      query.category = category.trim();
    }

    // Búsqueda por texto en nombre o descripción
    if (search && search.trim()) {
      query.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    const services = await Service.find(query).sort({ displayOrder: 1, name: 1 });

    return res.json(services);
  } catch (error) {
    console.error("❌ Error al obtener servicios:", error);
    return res.status(500).json({ message: "Error al obtener servicios" });
  }
};

/**
 * GET /api/stores/:storeId/services/:serviceId
 * Obtener un servicio específico
 */
export const getServiceById = async (req, res) => {
  try {
    const { storeId, serviceId } = req.params;

    const service = await Service.findOne({ _id: serviceId, store: storeId });
    if (!service) {
      return res.status(404).json({ message: "Servicio no encontrado" });
    }

    return res.json(service);
  } catch (error) {
    console.error("❌ Error al obtener servicio:", error);
    return res.status(500).json({ message: "Error al obtener servicio" });
  }
};

/**
 * POST /api/stores/:storeId/services
 * Crear un nuevo servicio (requiere auth)
 */
export const createService = async (req, res) => {
  try {
    const { storeId } = req.params;
    const userId = req.user.id;
    const { name, description, duration, price, isActive, displayOrder, imageUrl, category, tags } = req.body;

    // Verificar ownership
    const { error } = await verifyStoreOwnership(storeId, userId);
    if (error) {
      return res.status(error.status).json({ message: error.message });
    }

    // Validaciones básicas
    if (!name || name.trim().length === 0) {
      return res.status(400).json({ message: "El nombre del servicio es requerido" });
    }

    if (!duration || duration < 5 || duration > 480) {
      return res.status(400).json({ message: "La duración debe estar entre 5 y 480 minutos" });
    }

    if (price === undefined || price < 0) {
      return res.status(400).json({ message: "El precio no puede ser negativo" });
    }

    // Crear servicio
    const service = new Service({
      store: storeId,
      name: name.trim(),
      description: description?.trim() || "",
      duration: parseInt(duration),
      price: parseFloat(price),
      isActive: isActive !== undefined ? Boolean(isActive) : true,
      displayOrder: displayOrder !== undefined ? parseInt(displayOrder) : 0,
      imageUrl: imageUrl?.trim() || "",
      category: category?.trim() || "",
      tags: Array.isArray(tags) ? tags.map(tag => tag.trim()).filter(Boolean) : [],
    });

    await service.save();

    return res.status(201).json(service);
  } catch (error) {
    console.error("❌ Error al crear servicio:", error);
    
    // Errores de validación de Mongoose
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ message: messages.join(", ") });
    }

    return res.status(500).json({ message: "Error al crear servicio" });
  }
};

/**
 * PUT /api/stores/:storeId/services/:serviceId
 * Actualizar un servicio existente (requiere auth)
 */
export const updateService = async (req, res) => {
  try {
    const { storeId, serviceId } = req.params;
    const userId = req.user.id;
    const { name, description, duration, price, isActive, displayOrder, imageUrl, category, tags } = req.body;

    // Verificar ownership
    const { error } = await verifyStoreOwnership(storeId, userId);
    if (error) {
      return res.status(error.status).json({ message: error.message });
    }

    // Buscar servicio
    const service = await Service.findOne({ _id: serviceId, store: storeId });
    if (!service) {
      return res.status(404).json({ message: "Servicio no encontrado" });
    }

    // Actualizar campos
    if (name !== undefined) {
      if (name.trim().length === 0) {
        return res.status(400).json({ message: "El nombre no puede estar vacío" });
      }
      service.name = name.trim();
    }

    if (description !== undefined) {
      service.description = description.trim();
    }

    if (duration !== undefined) {
      const dur = parseInt(duration);
      if (dur < 5 || dur > 480) {
        return res.status(400).json({ message: "La duración debe estar entre 5 y 480 minutos" });
      }
      service.duration = dur;
    }

    if (price !== undefined) {
      const p = parseFloat(price);
      if (p < 0) {
        return res.status(400).json({ message: "El precio no puede ser negativo" });
      }
      service.price = p;
    }

    if (isActive !== undefined) {
      service.isActive = Boolean(isActive);
    }

    if (displayOrder !== undefined) {
      service.displayOrder = parseInt(displayOrder);
    }

    if (imageUrl !== undefined) {
      service.imageUrl = imageUrl.trim();
    }

    if (category !== undefined) {
      service.category = category.trim();
    }

    if (tags !== undefined) {
      service.tags = Array.isArray(tags) ? tags.map(tag => tag.trim()).filter(Boolean) : [];
    }

    await service.save();

    return res.json(service);
  } catch (error) {
    console.error("❌ Error al actualizar servicio:", error);

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ message: messages.join(", ") });
    }

    return res.status(500).json({ message: "Error al actualizar servicio" });
  }
};

/**
 * DELETE /api/stores/:storeId/services/:serviceId
 * Eliminar un servicio (requiere auth)
 * Soft delete: solo marca como inactivo
 */
export const deleteService = async (req, res) => {
  try {
    const { storeId, serviceId } = req.params;
    const userId = req.user.id;
    const { permanent } = req.query; // ?permanent=true para borrado físico

    // Verificar ownership
    const { error } = await verifyStoreOwnership(storeId, userId);
    if (error) {
      return res.status(error.status).json({ message: error.message });
    }

    const service = await Service.findOne({ _id: serviceId, store: storeId });
    if (!service) {
      return res.status(404).json({ message: "Servicio no encontrado" });
    }

    if (permanent === "true") {
      // Borrado físico (peligroso, solo para tests)
      await Service.findByIdAndDelete(serviceId);
      return res.json({ message: "Servicio eliminado permanentemente" });
    } else {
      // Soft delete: marcar como inactivo
      service.isActive = false;
      await service.save();
      return res.json({ message: "Servicio desactivado", service });
    }
  } catch (error) {
    console.error("❌ Error al eliminar servicio:", error);
    return res.status(500).json({ message: "Error al eliminar servicio" });
  }
};

/**
 * PATCH /api/stores/:storeId/services/:serviceId/toggle
 * Activar/Desactivar rápidamente un servicio
 */
export const toggleServiceStatus = async (req, res) => {
  try {
    const { storeId, serviceId } = req.params;
    const userId = req.user.id;

    // Verificar ownership
    const { error } = await verifyStoreOwnership(storeId, userId);
    if (error) {
      return res.status(error.status).json({ message: error.message });
    }

    const service = await Service.findOne({ _id: serviceId, store: storeId });
    if (!service) {
      return res.status(404).json({ message: "Servicio no encontrado" });
    }

    service.isActive = !service.isActive;
    await service.save();

    return res.json({
      message: `Servicio ${service.isActive ? "activado" : "desactivado"}`,
      service,
    });
  } catch (error) {
    console.error("❌ Error al cambiar estado del servicio:", error);
    return res.status(500).json({ message: "Error al cambiar estado" });
  }
};

/**
 * PATCH /api/stores/:storeId/services/reorder
 * Reordenar servicios (actualizar displayOrder en batch)
 */
export const reorderServices = async (req, res) => {
  try {
    const { storeId } = req.params;
    const userId = req.user.id;
    const { serviceIds } = req.body; // Array de IDs en el orden deseado

    // Verificar ownership
    const { error } = await verifyStoreOwnership(storeId, userId);
    if (error) {
      return res.status(error.status).json({ message: error.message });
    }

    if (!Array.isArray(serviceIds) || serviceIds.length === 0) {
      return res.status(400).json({ message: "Se requiere un array de IDs" });
    }

    // Actualizar displayOrder de cada servicio
    const updates = serviceIds.map((serviceId, index) =>
      Service.updateOne(
        { _id: serviceId, store: storeId },
        { $set: { displayOrder: index } }
      )
    );

    await Promise.all(updates);

    const services = await Service.find({ store: storeId }).sort({ displayOrder: 1, name: 1 });

    return res.json({ message: "Servicios reordenados", services });
  } catch (error) {
    console.error("❌ Error al reordenar servicios:", error);
    return res.status(500).json({ message: "Error al reordenar servicios" });
  }
};
