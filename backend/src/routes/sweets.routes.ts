import { Router } from 'express';
import { addSweet, listSweets } from '../controllers/sweets.controller';
import { authenticateToken, isAdmin } from '../middleware/auth.middleware';

const router = Router();

// Only Admins can add sweets
router.post('/', authenticateToken, isAdmin, addSweet);

// Authenticated users can view sweets
router.get('/', authenticateToken, listSweets);

export default router;