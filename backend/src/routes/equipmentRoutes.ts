import { Router, Request, Response, NextFunction } from 'express';
import { EquipmentController } from '../controllers/equipmentController';
import { authenticateToken } from '../middlewares/authMiddleware';
import { 
  uploadEquipmentImage, 
  handleUploadError, 
  handleEquipmentImageUpload,
  requirePhotoUpload 
} from '../middlewares/uploadMiddleware';

const router = Router();

router.use((req, res, next) => {
  console.log(`🔍 EquipmentRoutes: ${req.method} ${req.url}`);
  next();
});

// Routes publiques (sans authentification)
router.get('/', EquipmentController.getAllEquipments);
router.get('/:id', EquipmentController.getEquipmentById);

// Routes protégées (avec authentification)
// Route de création - utilise le wrapper complet qui gère automatiquement les erreurs
router.post('/', 
  authenticateToken, 
  handleEquipmentImageUpload,  // Gère automatiquement upload + erreurs
  requirePhotoUpload,          // Vérifie qu'une photo est présente
  EquipmentController.createEquipment
);

// Route de mise à jour - photo optionnelle
router.put('/:id', 
  authenticateToken, 
  (req: Request, res: Response, next: NextFunction) => {
    // Pour la mise à jour, la photo est optionnelle
    uploadEquipmentImage(req, res, (error: any) => {
      if (error) {
        return handleUploadError(error, req, res, next);
      }
      // Pas de requirePhotoUpload ici car la photo est optionnelle en modification
      next();
    });
  },
  EquipmentController.updateEquipment
);

// Autres routes sans upload
router.delete('/:id', authenticateToken, EquipmentController.deleteEquipment);
router.post('/:id/qrcode/regenerate', authenticateToken, EquipmentController.regenerateQRCode);
// À ajouter dans equipmentRoutes.ts après les autres routes

/**
 * POST /api/equipments/:id/report-breakdown
 * Signaler une panne d'équipement
 */
router.post('/:id/report-breakdown', authenticateToken, EquipmentController.reportBreakdown);
export default router;
