import { Router } from 'express';
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  toggleUserStatus,
  changeUserPassword,
  getUserStats,
  getUsersByRole,
  searchUsers
} from '../controllers/user.controller';
import {
  authMiddleware,
  adminOnly,
  adminOrSupervisor,
  authorizeOwnerOrAdmin,
  rateLimit
} from '../middlewares/auth';

const router = Router();

// Appliquer l'authentification à toutes les routes
router.use(authMiddleware);

// Routes publiques (authentifiées mais accessibles à tous les rôles)
// ================================================================

// @route   GET /api/users/search
// @desc    Rechercher des utilisateurs (auto-complete)
// @access  Private (tous les rôles authentifiés)
router.get('/search', rateLimit(50, 15 * 60 * 1000), searchUsers);

// Routes pour administrateurs et superviseurs
// ==========================================

// @route   GET /api/users/stats
// @desc    Obtenir les statistiques des utilisateurs
// @access  Private (Admin/Supervisor)
router.get('/stats', adminOrSupervisor, getUserStats);

// @route   GET /api/users
// @desc    Récupérer tous les utilisateurs avec pagination et filtres
// @access  Private (Admin/Supervisor)
router.get('/', adminOrSupervisor, rateLimit(100, 15 * 60 * 1000), getUsers);

// @route   GET /api/users/by-role/:role
// @desc    Obtenir les utilisateurs d'un rôle spécifique
// @access  Private (Admin/Supervisor)
router.get('/by-role/:role', adminOrSupervisor, getUsersByRole);

// Routes pour administrateurs uniquement
// ======================================

// @route   POST /api/users
// @desc    Créer un nouvel utilisateur
// @access  Private (Admin only)
router.post('/', adminOnly, rateLimit(20, 60 * 60 * 1000), createUser);

// @route   PUT /api/users/:id
// @desc    Mettre à jour un utilisateur
// @access  Private (Admin only)
router.put('/:id', adminOnly, updateUser);

// @route   DELETE /api/users/:id
// @desc    Supprimer un utilisateur
// @access  Private (Admin only)
router.delete('/:id', adminOnly, deleteUser);

// @route   PATCH /api/users/:id/toggle-status
// @desc    Désactiver/Activer un utilisateur
// @access  Private (Admin only)
router.patch('/:id/toggle-status', adminOnly, toggleUserStatus);

// @route   PATCH /api/users/:id/change-password
// @desc    Changer le mot de passe d'un utilisateur
// @access  Private (Admin only)
router.patch('/:id/change-password', adminOnly, rateLimit(10, 60 * 60 * 1000), changeUserPassword);

// Routes avec permissions spéciales
// =================================

// @route   GET /api/users/:id
// @desc    Récupérer un utilisateur par ID
// @access  Private (Admin/Supervisor ou propriétaire des données)
router.get('/:id', authorizeOwnerOrAdmin, getUserById);

export default router;