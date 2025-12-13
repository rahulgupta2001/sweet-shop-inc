import { Router } from 'express';
import { 
  addSweet, 
  listSweets, 
  purchase, 
  search, 
  update, 
  remove 
} from '../controllers/sweets.controller';
import { authenticateToken, isAdmin } from '../middleware/auth.middleware';

const router = Router();

// 1. General Routes
router.get('/', authenticateToken, listSweets);
router.get('/search', authenticateToken, search); // <--- New

// 2. Specific ID Routes
router.post('/:id/purchase', authenticateToken, purchase);

// 3. Admin Routes
router.post('/', authenticateToken, isAdmin, addSweet);
router.put('/:id', authenticateToken, isAdmin, update); // <--- New
router.delete('/:id', authenticateToken, isAdmin, remove); // <--- New

export default router;