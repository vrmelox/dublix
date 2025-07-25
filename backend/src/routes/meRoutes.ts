// src/routes/meRoutes.ts
import { Router } from 'express';
import { getMe } from '../controllers/meController';
import { authenticateToken } from '../middlewares/authMiddleware';

const router = Router();

router.get('/me', authenticateToken, getMe);

export default router;
