import { Router } from 'express';
import { addSweet } from '../controllers/sweets.controller';
import { authenticateToken, isAdmin } from '../middleware/auth.middleware';

const router = Router();

// Only Admins can add sweets
router.post('/', authenticateToken, isAdmin, addSweet);

export default router;