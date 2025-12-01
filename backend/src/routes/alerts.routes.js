// backend/src/routes/alerts.routes.js
import { Router } from 'express';
import { generateAlerts, getAlertsForUser } from '../controllers/alerts.controller.js';
import { authRequired } from '../middlewares/authRequired.js';

const router = Router();

// Generar alertas para una tienda específica
router.get('/store/:id', authRequired, generateAlerts);

// Obtener alertas para todas las tiendas del usuario
router.get('/my-alerts', authRequired, getAlertsForUser);

export default router;
