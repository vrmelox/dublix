import { Router } from 'express';
import { 
  createUser, 
  loginUser, 
  resetPassword,
  // 🆕 Nouvelles fonctions
  getAllUsers,
  getUsersByRole,
  getUserById,
  getUserStats
} from '../controllers/userController';
import { authenticateToken } from '../middlewares/authMiddleware';

const router = Router();

// Middleware de logging pour les routes utilisateurs
router.use((req, res, next) => {
  console.log(`👥 UserRoutes: ${req.method} ${req.url}`);
  next();
});

// ========================
// ROUTES PUBLIQUES
// ========================

/**
 * POST /api/users/login
 * Connexion utilisateur
 */
router.post('/login', loginUser);

// ========================
// ROUTES PROTÉGÉES - ADMINISTRATION
// ========================

/**
 * POST /api/users/create
 * Créer un nouvel utilisateur (admin uniquement)
 */
router.post('/create', authenticateToken, createUser);

/**
 * POST /api/users/reset-password
 * Reset du mot de passe
 */
router.post('/reset-password', authenticateToken, resetPassword);

// ========================
// 🆕 ROUTES DE RÉCUPÉRATION D'INFORMATIONS
// ========================

/**
 * GET /api/users
 * Récupérer tous les utilisateurs avec filtres
 * Query params:
 * - page: numéro de page (défaut: 1)
 * - limit: nombre d'éléments par page (défaut: 10)
 * - search: recherche par nom, prénom, email
 * - role: filtrer par rôle (ADMINISTRATEUR, TECHNICIEN, UTILISATEUR)
 * - actif: filtrer par statut actif (true/false/all)
 * - sortBy: tri par champ (nom, role, dateCreation)
 * - sortOrder: ordre de tri (asc, desc)
 */
router.get('/', authenticateToken, getAllUsers);

/**
 * GET /api/users/stats
 * Statistiques des utilisateurs
 */
router.get('/stats', authenticateToken, getUserStats);

/**
 * GET /api/users/role/:role
 * Récupérer les utilisateurs par rôle spécifique
 * Params:
 * - role: ADMINISTRATEUR, TECHNICIEN, ou UTILISATEUR
 * Query params:
 * - actif: filtrer par statut actif (défaut: true)
 */
router.get('/role/:role', authenticateToken, getUsersByRole);

/**
 * GET /api/users/:id
 * Récupérer un utilisateur par ID avec détails complets
 */
router.get('/:id', authenticateToken, getUserById);

export default router;
