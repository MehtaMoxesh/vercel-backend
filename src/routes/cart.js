import express from 'express';
import * as controller from '../controllers/cartController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authMiddleware, controller.getCart);
router.post('/items', authMiddleware, controller.addItem); // body { sweetId, quantity }
router.put('/items/:itemId', authMiddleware, controller.updateItem);
router.delete('/items/:itemId', authMiddleware, controller.removeItem);
router.post('/checkout', authMiddleware, controller.checkout);

export default router;
