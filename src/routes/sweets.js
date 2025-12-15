import express from 'express';
import * as controller from '../controllers/sweetsController.js';
import { authMiddleware, adminOnly } from '../middleware/auth.js';

const router = express.Router();
// Authenticated users: view and purchase
router.get('/', authMiddleware, controller.getAll);
router.get('/search', authMiddleware, controller.search);
router.post('/:id/purchase', authMiddleware, controller.purchase);

// Admin-only actions: create, update, delete, restock
router.post('/', authMiddleware, adminOnly, controller.create);
router.put('/:id', authMiddleware, adminOnly, controller.update);
router.delete('/:id', authMiddleware, adminOnly, controller.remove);
router.post('/:id/restock', authMiddleware, adminOnly, controller.restock);

export default router;
