import { Router } from 'express';
import { InterventionController } from '../controllers/interventionController';
import { authenticateToken } from '../middlewares/authMiddleware';

const router = Router();

// Toutes les routes nécessitent une authentification
router.use(authenticateToken);

// Routes pour les interventions
router.post('/', InterventionController.createIntervention);
router.get('/', InterventionController.getAllInterventions);
router.get('/:id', InterventionController.getInterventionById);
router.put('/:id/validate', InterventionController.validateIntervention);

// Route pour récupérer les interventions d'un équipement spécifique
router.get('/equipment/:equipmentId', InterventionController.getEquipmentInterventions);

export default router;