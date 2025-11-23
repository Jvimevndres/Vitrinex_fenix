import User from '../models/user.model.js';
import Store from '../models/store.model.js';
import Booking from '../models/booking.model.js';
import Service from '../models/service.model.js';
import Product from '../models/product.model.js';
import Comment from '../models/comment.model.js';
import SponsorAd from '../models/sponsorAd.model.js';

// Middleware para verificar que el usuario es admin
export const requireAdmin = async (req, res, next) => {
  try {
    console.log('🔍 requireAdmin - req.user:', req.user);
    console.log('🔍 requireAdmin - req.userId:', req.userId);
    
    const userId = req.user?.id || req.userId;
    console.log('🔍 requireAdmin - userId final:', userId);
    
    if (!userId) {
      console.log('❌ requireAdmin - No userId found');
      return res.status(401).json({ message: 'No autorizado' });
    }
    
    const user = await User.findById(userId);
    console.log('🔍 requireAdmin - user found:', user ? `${user.email} (${user.role})` : 'null');
    
    if (!user || user.role !== 'admin') {
      console.log('❌ requireAdmin - Acceso denegado');
      return res.status(403).json({ message: 'Acceso denegado: se requiere rol de administrador' });
    }
    console.log('✅ requireAdmin - Admin verificado');
    next();
  } catch (error) {
    console.error('❌ requireAdmin - Error:', error);
    return res.status(500).json({ message: 'Error verificando permisos', error: error.message });
  }
};

// Obtener estadísticas generales del sistema
export const getSystemStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalStores,
      activeStores,
      totalBookings,
      totalServices,
      totalProducts,
      pendingComments,
      premiumStores,
      proStores,
      activeSponsorAds,
    ] = await Promise.all([
      User.countDocuments(),
      Store.countDocuments(),
      Store.countDocuments({ isActive: true }),
      Booking.countDocuments(),
      Service.countDocuments(),
      Product.countDocuments(),
      Comment.countDocuments({ status: 'pending' }),
      Store.countDocuments({ plan: 'premium' }),
      Store.countDocuments({ plan: 'pro' }),
      SponsorAd.countDocuments({ active: true }),
    ]);

    // Tiendas más activas por reservas
    const topStoresByBookings = await Booking.aggregate([
      { $group: { _id: '$store', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'stores',
          localField: '_id',
          foreignField: '_id',
          as: 'storeData',
        },
      },
      { $unwind: '$storeData' },
      {
        $project: {
          _id: 1,
          count: 1,
          name: '$storeData.name',
          plan: '$storeData.plan',
        },
      },
    ]);

    // Nuevos usuarios por mes (últimos 6 meses)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const userGrowth = await User.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Distribución de planes
    const planDistribution = {
      free: await Store.countDocuments({ plan: 'free' }),
      pro: proStores,
      premium: premiumStores,
    };

    res.json({
      summary: {
        totalUsers,
        totalStores,
        activeStores,
        inactiveStores: totalStores - activeStores,
        totalBookings,
        totalServices,
        totalProducts,
        pendingComments,
        activeSponsorAds,
      },
      planDistribution,
      topStoresByBookings,
      userGrowth,
    });
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({ message: 'Error obteniendo estadísticas', error: error.message });
  }
};

// Listar todas las tiendas con información de administrador
export const getAllStores = async (req, res) => {
  try {
    console.log('🔍 getAllStores llamado');
    const { page = 1, limit = 20, plan, isActive, search } = req.query;

    const filter = {};
    if (plan) filter.plan = plan;
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const stores = await Store.find(filter)
      .populate('owner', 'username email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    // Agregar conteo de actividad para cada tienda
    const storesWithActivity = await Promise.all(
      stores.map(async (store) => {
        const [bookingsCount, productsCount, servicesCount] = await Promise.all([
          Booking.countDocuments({ store: store._id }),
          Product.countDocuments({ store: store._id }),
          Service.countDocuments({ store: store._id }),
        ]);

        return {
          ...store,
          activity: {
            bookings: bookingsCount,
            products: productsCount,
            services: servicesCount,
          },
        };
      })
    );

    const total = await Store.countDocuments(filter);

    console.log(`✅ Tiendas encontradas: ${storesWithActivity.length} de ${total} total`);

    res.json({
      stores: storesWithActivity,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    console.error('Error listando tiendas:', error);
    res.status(500).json({ message: 'Error listando tiendas', error: error.message });
  }
};

// Actualizar estado de tienda (activar/desactivar)
export const updateStoreStatus = async (req, res) => {
  try {
    const { storeId } = req.params;
    const { isActive } = req.body;

    const store = await Store.findByIdAndUpdate(
      storeId,
      { isActive },
      { new: true }
    );

    if (!store) {
      return res.status(404).json({ message: 'Tienda no encontrada' });
    }

    res.json({ message: 'Estado actualizado', store });
  } catch (error) {
    console.error('Error actualizando estado:', error);
    res.status(500).json({ message: 'Error actualizando estado', error: error.message });
  }
};

// Actualizar plan de tienda
export const updateStorePlan = async (req, res) => {
  try {
    const { storeId } = req.params;
    const { plan, expiresAt } = req.body;

    const updateData = { plan };
    if (expiresAt) {
      updateData.planExpiresAt = new Date(expiresAt);
    }

    const store = await Store.findByIdAndUpdate(storeId, updateData, { new: true });

    if (!store) {
      return res.status(404).json({ message: 'Tienda no encontrada' });
    }

    res.json({ message: 'Plan actualizado', store });
  } catch (error) {
    console.error('Error actualizando plan:', error);
    res.status(500).json({ message: 'Error actualizando plan', error: error.message });
  }
};

// Obtener todos los usuarios
export const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, role, search } = req.query;

    const filter = {};
    if (role) filter.role = role;
    if (search) {
      filter.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const total = await User.countDocuments(filter);

    res.json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    console.error('Error listando usuarios:', error);
    res.status(500).json({ message: 'Error listando usuarios', error: error.message });
  }
};

// Actualizar rol de usuario
export const updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Rol inválido' });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json({ message: 'Rol actualizado', user });
  } catch (error) {
    console.error('Error actualizando rol:', error);
    res.status(500).json({ message: 'Error actualizando rol', error: error.message });
  }
};

// Actualizar plan de usuario
export const updateUserPlan = async (req, res) => {
  try {
    const { userId } = req.params;
    const { plan } = req.body;

    if (!['free', 'premium'].includes(plan)) {
      return res.status(400).json({ message: 'Plan inválido' });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { plan },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json({ message: 'Plan actualizado', user });
  } catch (error) {
    console.error('Error actualizando plan:', error);
    res.status(500).json({ message: 'Error actualizando plan', error: error.message });
  }
};
