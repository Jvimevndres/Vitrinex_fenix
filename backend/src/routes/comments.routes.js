import { Router } from 'express';
import { authRequired } from '../middlewares/authRequired.js';
import { requireAdmin } from '../controllers/admin.controller.js';
import {
  createComment,
  getAllComments,
  getMyComments,
  updateCommentStatus,
  deleteComment,
} from '../controllers/comments.controller.js';

const router = Router();

// Rutas para usuarios autenticados
router.post('/', authRequired, createComment);
router.get('/my', authRequired, getMyComments);
router.delete('/:id', authRequired, deleteComment);

// Rutas solo para admin
router.get('/', authRequired, requireAdmin, getAllComments);
router.patch('/:id/status', authRequired, requireAdmin, updateCommentStatus);

export default router;
