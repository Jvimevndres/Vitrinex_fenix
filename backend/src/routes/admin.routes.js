import { Router } from 'express';
import { authRequired } from '../middlewares/authRequired.js';
import {
  requireAdmin,
  getSystemStats,
  getAllStores,
  updateStoreStatus,
  updateStorePlan,
  getAllUsers,
  updateUserRole,
  updateUserPlan,
} from '../controllers/admin.controller.js';

const router = Router();

// Todas las rutas requieren autenticación y rol de admin
router.use(authRequired, requireAdmin);

// Estadísticas del sistema
router.get('/stats', getSystemStats);

// Gestión de tiendas
router.get('/stores', getAllStores);
router.patch('/stores/:storeId/status', updateStoreStatus);
router.patch('/stores/:storeId/plan', updateStorePlan);

// Gestión de usuarios
router.get('/users', getAllUsers);
router.patch('/users/:userId/role', updateUserRole);
router.patch('/users/:userId/plan', updateUserPlan);

export default router;
