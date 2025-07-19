import { Router } from 'express';
import {
  login,
  register,
  refreshToken,
  getProfile,
  updateProfile,
  changePassword,
  logout
} from '../controllers/auth.controller';
import { authMiddleware } from '../middlewares/auth';
import { validateAuth, validateRegistration, validatePasswordChange } from '../middlewares/validation';

const router = Router();

// Routes publiques
router.post('/login', validateAuth, login);
router.post('/register', validateRegistration, register);
router.post('/refresh', refreshToken);

// Routes protégées (nécessitent une authentification)
router.get('/me', authMiddleware, getProfile);
router.put('/profile', authMiddleware, updateProfile);
router.put('/change-password', authMiddleware, validatePasswordChange, changePassword);
router.post('/logout', authMiddleware, logout);

export default router;