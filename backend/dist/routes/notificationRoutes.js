"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/notificationRoutes.ts
const express_1 = require("express");
const notificationController_1 = require("../controllers/notificationController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
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
router.get('/', authMiddleware_1.authenticateToken, notificationController_1.getAllNotifications);
/**
 * GET /api/notifications/unread-count
 * Récupérer le nombre de notifications non lues
 */
router.get('/unread-count', authMiddleware_1.authenticateToken, notificationController_1.getUnreadCount);
/**
 * GET /api/notifications/stats
 * Statistiques des notifications de l'utilisateur
 */
router.get('/stats', authMiddleware_1.authenticateToken, notificationController_1.getNotificationStats);
/**
 * PUT /api/notifications/mark-all-read
 * Marquer toutes les notifications comme lues
 */
router.put('/mark-all-read', authMiddleware_1.authenticateToken, notificationController_1.markAllAsRead);
/**
 * GET /api/notifications/:id
 * Récupérer une notification spécifique par ID
 */
router.get('/:id', authMiddleware_1.authenticateToken, notificationController_1.getNotificationById);
/**
 * PUT /api/notifications/:id/read
 * Marquer une notification comme lue
 */
router.put('/:id/read', authMiddleware_1.authenticateToken, notificationController_1.markAsRead);
/**
 * DELETE /api/notifications/:id
 * Supprimer une notification
 */
router.delete('/:id', authMiddleware_1.authenticateToken, notificationController_1.deleteNotification);
exports.default = router;
