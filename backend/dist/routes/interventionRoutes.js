"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const interventionController_1 = require("../controllers/interventionController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
// Toutes les routes nécessitent une authentification
router.use(authMiddleware_1.authenticateToken);
// Routes pour les interventions
router.post('/', interventionController_1.InterventionController.createIntervention);
router.get('/', interventionController_1.InterventionController.getAllInterventions);
router.get('/:id', interventionController_1.InterventionController.getInterventionById);
router.put('/:id/validate', interventionController_1.InterventionController.validateIntervention);
// Route pour récupérer les interventions d'un équipement spécifique
router.get('/equipment/:equipmentId', interventionController_1.InterventionController.getEquipmentInterventions);
exports.default = router;
