// src/routes/notificationRoutes.ts
import { Router } from 'express';
import {
  getAllNotifications,
  getNotificationById,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount,
  getNotificationStats
} from '../controllers/notificationController';
import { authenticateToken } from '../middlewares/authMiddleware';

const router = Router();

// Middleware de logging pour les routes notifications
router.use((req, res, next) => {
  console.log(`🔔 NotificationRoutes: ${req.method} ${req.url}`);
  next();
});

// ========================
// ROUTES PROTÉGÉES - NOTIFICATIONS
// ========================

/**
 * GET /api/notifications
 * Récupérer toutes les notifications de l'utilisateur connecté
 * Query params:
 * - page: numéro de page (défaut: 1)
 * - limit: nombre d'éléments par page (défaut: 20)
 * - type: filtrer par type de notification
 * - statut: filtrer par statut (NON_LUE, LUE, ARCHIVEE)
 * - sortBy: tri par champ (dateCreation, titre)
 * - sortOrder: ordre de tri (asc, desc - défaut: desc)
 */
router.get('/', authenticateToken, getAllNotifications);

/**
 * GET /api/notifications/unread-count
 * Récupérer le nombre de notifications non lues
 */
router.get('/unread-count', authenticateToken, getUnreadCount);

/**
 * GET /api/notifications/stats
 * Statistiques des notifications de l'utilisateur
 */
router.get('/stats', authenticateToken, getNotificationStats);

/**
 * PUT /api/notifications/mark-all-read
 * Marquer toutes les notifications comme lues
 */
router.put('/mark-all-read', authenticateToken, markAllAsRead);

/**
 * GET /api/notifications/:id
 * Récupérer une notification spécifique par ID
 */
router.get('/:id', authenticateToken, getNotificationById);

/**
 * PUT /api/notifications/:id/read
 * Marquer une notification comme lue
 */
router.put('/:id/read', authenticateToken, markAsRead);

/**
 * DELETE /api/notifications/:id
 * Supprimer une notification
 */
router.delete('/:id', authenticateToken, deleteNotification);

export default router;
