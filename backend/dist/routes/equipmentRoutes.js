"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const equipmentController_1 = require("../controllers/equipmentController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const uploadMiddleware_1 = require("../middlewares/uploadMiddleware");
const router = (0, express_1.Router)();
router.use((req, res, next) => {
    console.log(`🔍 EquipmentRoutes: ${req.method} ${req.url}`);
    next();
});
// Routes publiques (sans authentification)
router.get('/', equipmentController_1.EquipmentController.getAllEquipments);
router.get('/:id', equipmentController_1.EquipmentController.getEquipmentById);
// Routes protégées (avec authentification)
// Route de création - utilise le wrapper complet qui gère automatiquement les erreurs
router.post('/', authMiddleware_1.authenticateToken, uploadMiddleware_1.handleEquipmentImageUpload, // Gère automatiquement upload + erreurs
uploadMiddleware_1.requirePhotoUpload, // Vérifie qu'une photo est présente
equipmentController_1.EquipmentController.createEquipment);
// Route de mise à jour - photo optionnelle
router.put('/:id', authMiddleware_1.authenticateToken, (req, res, next) => {
    // Pour la mise à jour, la photo est optionnelle
    (0, uploadMiddleware_1.uploadEquipmentImage)(req, res, (error) => {
        if (error) {
            return (0, uploadMiddleware_1.handleUploadError)(error, req, res, next);
        }
        // Pas de requirePhotoUpload ici car la photo est optionnelle en modification
        next();
    });
}, equipmentController_1.EquipmentController.updateEquipment);
// Autres routes sans upload
router.delete('/:id', authMiddleware_1.authenticateToken, equipmentController_1.EquipmentController.deleteEquipment);
router.post('/:id/qrcode/regenerate', authMiddleware_1.authenticateToken, equipmentController_1.EquipmentController.regenerateQRCode);
// À ajouter dans equipmentRoutes.ts après les autres routes
/**
 * POST /api/equipments/:id/report-breakdown
 * Signaler une panne d'équipement
 */
router.post('/:id/report-breakdown', authMiddleware_1.authenticateToken, equipmentController_1.EquipmentController.reportBreakdown);
exports.default = router;
