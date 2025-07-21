import { Router } from 'express';
import { createUser, loginUser, resetPassword } from '../controllers/userController';
import { authenticateToken } from '../middlewares/authMiddleware';

const router = Router();

// Création utilisateur : accessible uniquement admin (middleware auth)
router.post('/create', authenticateToken, createUser);

// Login public
router.post('/login', loginUser);



// Reset password accessible sans auth (ou avec ?)
// Ici on suppose qu’il faudra un token côté client pour reset, donc on protège la route
router.post('/reset-password', authenticateToken, resetPassword);

export default router;
