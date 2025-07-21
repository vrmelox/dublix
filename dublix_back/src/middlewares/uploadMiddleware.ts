import multer from 'multer';
import path from 'path';
import { Request } from 'express';
import { FileUtils } from '../utils/fileUtils';

// Configuration du stockage sur disque
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Chemin absolu vers dossier public/uploads/equipments
    cb(null, path.join(process.cwd(), 'public/uploads/equipments'));
  },
  filename: (req, file, cb) => {
    // Générer un nom unique avec timestamp + extension originale
    const ext = path.extname(file.originalname);
    const filename = `${Date.now()}${ext}`;
    cb(null, filename);
  }
});

// Filtre pour accepter uniquement les images valides
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (!file.mimetype.startsWith('image/')) {
    cb(new Error('Seuls les fichiers images sont autorisés'));
    return;
  }

  if (!FileUtils.isValidImageExtension(file.originalname)) {
    cb(new Error('Extension de fichier non autorisée'));
    return;
  }

  cb(null, true);
};

// Limite de taille : 5MB max
export const uploadEquipmentImage = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
}).single('photo');

// Middleware pour gérer les erreurs Multer
export const handleUploadError = (error: any, req: Request, res: any, next: any) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      res.status(400).json({ error: 'Fichier trop volumineux (max 5MB)' });
      return;
    }
    res.status(400).json({ error: 'Erreur d\'upload: ' + error.message });
    return;
  }

  if (error && typeof error.message === 'string' && error.message.includes('image')) {
    res.status(400).json({ error: error.message });
    return;
  }

  next(error);
};
