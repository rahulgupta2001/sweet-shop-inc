import { Router } from 'express';
import { addSweet, listSweets, purchase } from '../controllers/sweets.controller'; // <--- Update import
import { authenticateToken, isAdmin } from '../middleware/auth.middleware';

const router = Router();

router.post('/', authenticateToken, isAdmin, addSweet);
router.get('/', authenticateToken, listSweets);
router.post('/:id/purchase', authenticateToken, purchase); // <--- Add this

export default router;