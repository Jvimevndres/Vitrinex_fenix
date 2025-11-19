import { Router } from 'express';
import { authRequired } from '../middlewares/authRequired.js';
import { requireAdmin } from '../controllers/admin.controller.js';
import {
  createSponsorAd,
  getAllSponsorAds,
  getActiveAdsByPosition,
  updateSponsorAd,
  deleteSponsorAd,
  trackAdClick,
} from '../controllers/sponsors.controller.js';

const router = Router();

// Rutas públicas (para obtener ads en tiendas free)
router.get('/active/:position', getActiveAdsByPosition);
router.post('/:id/click', trackAdClick);

// Rutas protegidas (solo admin)
router.post('/', authRequired, requireAdmin, createSponsorAd);
router.get('/', authRequired, requireAdmin, getAllSponsorAds);
router.put('/:id', authRequired, requireAdmin, updateSponsorAd);
router.delete('/:id', authRequired, requireAdmin, deleteSponsorAd);

export default router;
