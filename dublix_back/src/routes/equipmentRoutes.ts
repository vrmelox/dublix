import { Router } from 'express';
import { EquipmentController } from '../controllers/equipmentController';
import { authenticateToken } from '../middlewares/authMiddleware';
import { uploadEquipmentImage, handleUploadError } from '../middlewares/uploadMiddleware';

const router = Router();
router.use((req, res, next) => {
  console.log(`🔍 EquipmentRoutes: ${req.method} ${req.url}`);
  next();
});
// Routes publiques (sans authentification)
router.get('/', EquipmentController.getAllEquipments);
router.get('/:id', EquipmentController.getEquipmentById);

// Routes protégées (avec authentification)
router.post('/', authenticateToken, uploadEquipmentImage, handleUploadError, EquipmentController.createEquipment);
router.put('/:id', authenticateToken, uploadEquipmentImage, handleUploadError, EquipmentController.updateEquipment);
router.delete('/:id', authenticateToken, EquipmentController.deleteEquipment);
router.post('/:id/qrcode/regenerate', authenticateToken, EquipmentController.regenerateQRCode);

export default router;